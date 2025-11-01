# app/models.py
from sqlmodel import SQLModel, Field # type:ignore
from typing import Optional
from datetime import datetime, timezone
from sqlalchemy import Column, String, Boolean, UniqueConstraint # type:ignore

def get_current_utc_time():
    return datetime.now(timezone.utc)

class User(SQLModel, table=True):
    id: Optional[int]= Field(default=None, primary_key=True)
    username: str = Field(sa_column=Column("username", String, nullable=False, unique=True)) 
    email: str = Field(sa_column=Column("email", String, nullable=False, unique=True))
    password_hash: str
    is_verified:bool
    created_at: datetime=Field(default_factory=get_current_utc_time)
    
class Post(SQLModel, table=True):
    id: Optional[int]= Field(default=None, primary_key=True)
    author_id: int = Field(foreign_key="user.id", nullable=False, index=True)
    title: str
    content: str
    created_at: datetime = Field(default_factory=get_current_utc_time)
    
class Comment(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    post_id: int = Field(foreign_key="post.id", nullable=False, index=True)
    user_id: int = Field(foreign_key="user.id", nullable=False, index=True)
    parent_id: Optional[int] = Field(default=None, foreign_key="comment.id", index=True)
    content: str
    deleted: bool= Field(default=False)
    created_at: datetime = Field(default_factory=get_current_utc_time)
    
class CommentLike(SQLModel, table=True):
    __table_args__ = (UniqueConstraint("comment_id","user_id",name='uq_comment_user'),)
    id: Optional[int] = Field(default=None, primary_key=True)
    comment_id: int = Field(foreign_key="comment.id", nullable=False, index=True)
    user_id: int = Field(foreign_key="user.id", nullable=False, index=True)
    created_at: datetime = Field(default_factory=get_current_utc_time)
    
    
    