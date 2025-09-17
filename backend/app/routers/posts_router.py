# app/routers/posts_router.py
from fastapi import APIRouter, Depends, HTTPException, status, Query, Request
from sqlmodel import Session, select
from typing import List

from ..db import get_session
from ..models import Post
from ..schemas import PostCreate, PostRead
from ..auth import get_current_user
from ..libs.limiter import limiter   # to be replaced with reverse proxy

router = APIRouter(prefix='/posts',tags=["posts"])

# serialization is handled by response model
# deserialization is handled by Pydantic schema classes
@router.post('/',response_model=PostRead) 
# @limiter.limit('200/minute') # DoS protection for create posts
def create_post(request:Request,payload: PostCreate, session: Session=Depends(get_session), current_user = Depends(get_current_user)):
    post= Post(author_id=current_user.id, title=payload.title, content=payload.content)
    session.add(post)
    session.commit()
    session.refresh(post)
    return post

@router.get("/",response_model=List[PostRead])
def list_post(skip:int = 0, limit:int = Query(20, le=100), session:Session = Depends(get_session)):
    posts = session.exec(select(Post).offset(skip).limit(limit)).all()
    return posts
    
@router.get("/{post_id}",response_model=PostRead)
def get_post(post_id:int , session: Session = Depends(get_session)):
    post = session.get(Post,post_id)
    if not post:
        raise HTTPException(status_code=404, detail="post not found")
    return post

@router.put("/{post_id}", response_model=PostRead)
def update_post(post_id: int , payload: PostCreate, session: Session = Depends(get_session),current_user = Depends(get_current_user)):
    post = session.get(Post, post_id)
    if not post:
        raise HTTPException(status_code=404, detail="post not found")
    
    if post.author_id != current_user.id:
        raise HTTPException(status_code=403, detail='not allowed')
    post.title= payload.title
    post.content = payload.content 
    session.add(post)
    session.commit()
    session.refresh(post)
    return post

@router.delete("/{post_id}")
def delete_post(post_id:int, session: Session= Depends(get_session),current_user = Depends(get_current_user)):
        post = session.get(Post, post_id)
        if not post:
            raise HTTPException(status_code=404, detail="post not found")
        if post.author_id != current_user.id:
            raise HTTPException(status_code=403, detail="not allowed")
        session.delete(post)
        session.commit()
        return {"ok":True}
