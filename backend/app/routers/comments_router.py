from fastapi import APIRouter, Depends, HTTPException, Query, Request, status
from sqlmodel import Session, select
from typing import List, Dict
from datetime import datetime

from ..db import get_session
from ..models import Comment, Post, CommentLike, User
from ..schemas import CommentCreate, CommentOut, CommentUpdate
from ..auth import get_current_user
from ..libs.limiter import limiter
from sqlalchemy import func

router = APIRouter(tags=["comments"])

# New utility function to format a comment for the response
def format_comment_response(comment: Comment, username: str, session: Session) -> CommentOut:
    likes_count = session.exec(
        select(func.count(CommentLike.id)).where(CommentLike.comment_id == comment.id)
    ).one()
    
    return CommentOut(
        id=comment.id,
        user_id=comment.user_id,
        username=username,
        parent_id=comment.parent_id,
        content=comment.content,
        likes_count=likes_count or 0,
        deleted=comment.deleted,
        created_at=comment.created_at,
        children=[]
    )

@router.post('/posts/{post_id}/comments', response_model=CommentOut)
def create_comment(request: Request, post_id: int, payload: CommentCreate, session: Session = Depends(get_session), current_user = Depends(get_current_user)):
    post = session.get(Post, post_id)
    if not post:
        raise HTTPException(status_code=404, detail="post not found")
    if payload.parent_id:
        parent = session.get(Comment, payload.parent_id)
        if not parent or parent.post_id != post_id:
            raise HTTPException(status_code=400, detail="invalid parent_id")

    comment = Comment(
        post_id=post_id,
        user_id=current_user.id,
        parent_id=payload.parent_id,
        content=payload.content
    )
    session.add(comment)
    session.commit()
    session.refresh(comment)

    return format_comment_response(comment, current_user.username, session)

@router.get('/posts/{post_id}/comments', response_model=List[CommentOut])
def get_comments(post_id: int, session: Session = Depends(get_session)):
    # fetch all comments for this post
    rows = session.exec(
        select(Comment, User.username)
        .join(User, User.id == Comment.user_id)
        .where(Comment.post_id == post_id)
        .order_by(Comment.created_at)
    ).all()
    if not rows:
        return []

    id_map: Dict[int, dict] = {}
    all_ids = [r.Comment.id for r in rows]
    
    likes_rows = session.exec(
        select(CommentLike.comment_id, func.count(CommentLike.id))
        .where(CommentLike.comment_id.in_(all_ids))
        .group_by(CommentLike.comment_id)
    ).all()
    likes_map = {r[0]: int(r[1]) for r in likes_rows}

    for r in rows:
        comment_obj, username = r
        id_map[comment_obj.id] = {
            "id": comment_obj.id,
            "user_id": comment_obj.user_id,
            "username": username,
            "parent_id": comment_obj.parent_id,
            "content": "[deleted]" if comment_obj.deleted else comment_obj.content,
            "likes_count": likes_map.get(comment_obj.id, 0),
            "deleted": comment_obj.deleted,
            "created_at": comment_obj.created_at,
            "children": []
        }
    
    roots = []
    for r in rows:
        comment_obj, _ = r
        node = id_map[comment_obj.id]
        if comment_obj.parent_id is None:
            roots.append(node)
        else:
            parent = id_map.get(comment_obj.parent_id)
            if parent:
                parent["children"].append(node)
            else:
                # parent missing (shouldn't happen) -> treat as root
                roots.append(node)

    return roots

@router.patch("/comments/{comment_id}", response_model=CommentOut)
def update_comment(
    comment_id: int, 
    payload: CommentUpdate, 
    session: Session = Depends(get_session), 
    current_user=Depends(get_current_user)
):
    comment = session.get(Comment, comment_id)
    if not comment:
        raise HTTPException(status_code=404, detail="comment not found")
    if comment.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="not allowed")

    comment.content = payload.content
    session.add(comment)
    session.commit()
    session.refresh(comment)

    # Re-fetch username since it's not on the comment object
    user = session.get(User, comment.user_id)
    
    return format_comment_response(comment, user.username, session)

@router.delete("/comments/{comment_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_comment(comment_id: int, session: Session = Depends(get_session), current_user = Depends(get_current_user)):
    comment = session.get(Comment, comment_id)
    if not comment:
        raise HTTPException(status_code=404, detail="comment not found")
    
    if comment.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="not allowed")

    comment.deleted = True
    comment.content = "[This comment has been deleted]"
    session.add(comment)
    session.commit()
    return