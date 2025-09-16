# app/routers/likes_router.py
from fastapi import APIRouter, Depends, HTTPException, Request
from sqlmodel import Session, select
from ..db import get_session
from ..models import CommentLike, Comment
from ..auth import get_current_user
from ..libs.limiter import limiter
from sqlalchemy import func

router = APIRouter(tags=["likes"])

@router.post("/comments/{comment_id}/like")
@limiter.limit("500/minute")   # DoS protection
def toggle_like(request:Request,comment_id: int, session: Session = Depends(get_session), current_user = Depends(get_current_user)):
    comment = session.get(Comment, comment_id)
    if not comment:
        raise HTTPException(status_code=404, detail="comment not found")
    existing = session.exec(select(CommentLike).where((CommentLike.comment_id == comment_id) & (CommentLike.user_id == current_user.id))).first()
    if existing:
        session.delete(existing)
        session.commit()
        liked = False
    else:
        like = CommentLike(comment_id=comment_id, user_id=current_user.id)
        session.add(like)
        try:
            session.commit()
        except Exception:
            session.rollback()
            # possible unique constraint race, treat as already liked
        liked = True
    # compute current count
    count = session.exec(select(func.count()).select_from(CommentLike).where(CommentLike.comment_id == comment_id)).one() or 0
    return {"liked": liked, "likes_count": int(count)}
