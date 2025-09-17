# app/routers/comments_router.py
from fastapi import APIRouter, Depends, HTTPException, Query, Request
from sqlmodel import Session, select
from typing import List,Dict

from ..db import get_session
from ..models import Comment, Post, CommentLike
from ..schemas import CommentCreate, CommentOut
from ..auth import get_current_user
from ..libs.limiter import limiter  # to be replaced with reverse proxy
from sqlalchemy import func

router = APIRouter(tags=["comments"])

@router.post('/posts/{post_id}/comments',response_model=CommentOut)
# @limiter.limit("200/minute") # DoS protection for comment creation
def create_comment(request:Request,post_id: int, payload: CommentCreate, session: Session = Depends(get_session), current_user = Depends(get_current_user)):
    post = session.get(Post, post_id)
    if not post:
        raise HTTPException(status_code=404, detail="post not found")
    if payload.parent_id:
        parent = session.get(Comment, payload.parent_id)
        if not parent or parent.post_id != post_id:
            raise HTTPException(status_code=400, detail="invalid parent_id")
    comment = Comment(post_id=post_id, user_id=current_user.id, parent_id=payload.parent_id, content=payload.content)
    session.add(comment)
    session.commit()
    session.refresh(comment)

    # compute likes_count (zero)
    return CommentOut(
        id=comment.id,
        user_id=comment.user_id,
        parent_id=comment.parent_id,
        content=comment.content,
        likes_count=0,
        deleted=comment.deleted,
        created_at=comment.created_at,
        children=[]
    )
    
@router.get('/posts/{post_id}/comments',response_model=List[CommentOut])
def get_comments(post_id:int , session:Session = Depends(get_session)):
    # fetch all comments for this post
    rows = session.exec(select(Comment).where(Comment.post_id == post_id).order_by(Comment.created_at)).all()
    if not rows:
        return []
    # build id -> node map
    id_map : Dict[int, dict] = {}
    all_ids = [r.id for r in rows]
    # fetch likes count per comment in one query
    likes_rows = session.exec(
        select(CommentLike.comment_id, func.count(CommentLike.id))
        .where(CommentLike.comment_id.in_(all_ids))
        .group_by(CommentLike.comment_id)
    ).all()
    likes_map = {r[0]: int(r[1]) for r in likes_rows}
    for r in rows:
        id_map[r.id] = {
            "id": r.id,
            "user_id": r.user_id,
            "parent_id": r.parent_id,
            "content": "[deleted]" if r.deleted else r.content,
            "likes_count": likes_map.get(r.id, 0),
            "deleted": r.deleted,
            "created_at": r.created_at,
            "children": []
        }
    roots = []
    for r in rows:
        node = id_map[r.id]
        if r.parent_id is None:
            roots.append(node)
        else:
            parent = id_map.get(r.parent_id)
            if parent:
                parent["children"].append(node)
            else:
                # parent missing (shouldn't happen) -> treat as root
                roots.append(node)

    # convert dicts to CommentOut implicitly by response model
    return roots

@router.put("/comments/{comment_id}", response_model=CommentOut)
def edit_comment(comment_id: int, payload: CommentCreate, session: Session = Depends(get_session), current_user=Depends(get_current_user)):
    comment = session.get(Comment, comment_id)
    if not comment:
        raise HTTPException(status_code=404, detail="comment not found")
    if comment.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="not allowed")
    comment.content = payload.content
    session.add(comment)
    session.commit()
    session.refresh(comment)
    # compute likes count
    likes_count = session.exec(select(func.count()).select_from(CommentLike).where(CommentLike.comment_id == comment.id)).one()
    return CommentOut(
        id=comment.id,
        user_id=comment.user_id,
        parent_id=comment.parent_id,
        content=comment.content,
        likes_count=likes_count or 0,
        deleted=comment.deleted,
        created_at=comment.created_at,
        children=[]
    )

@router.delete("/comments/{comment_id}")
def delete_comment(comment_id: int, session: Session = Depends(get_session), current_user = Depends(get_current_user)):
    comment = session.get(Comment, comment_id)
    if not comment:
        raise HTTPException(status_code=404, detail="comment not found")
    # allow author or admin later
    if comment.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="not allowed")
    # soft delete
    comment.deleted = True
    comment.content = "[deleted]"
    session.add(comment)
    session.commit()
    return {"ok": True}
    
