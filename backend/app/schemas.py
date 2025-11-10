from pydantic import BaseModel, EmailStr # type:ignore
from typing import Optional, List
from datetime import datetime

class MessageResponse(BaseModel):
    message: str

class UserCreate(BaseModel):
    username: str 
    email: EmailStr
    password: str 
    
class UserLogin(BaseModel):  
    username: str
    password: str
    
class UserRead(BaseModel):
    id:int 
    username:str
    email: EmailStr
    created_at: datetime
    
class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    
class PostCreate(BaseModel):
    title: str 
    content: str 
    
class PostRead(BaseModel):
    id: int 
    author_id: int 
    title: str
    content: str
    created_at: datetime
    
class CommentCreate(BaseModel):
    content: str 
    parent_id: Optional[int] = None
    
# New schema for updating a comment
class CommentUpdate(BaseModel):
    content: str
    
class CommentOut(BaseModel):
    id:int 
    user_id: int 
    username: str
    parent_id: Optional[int]
    content : str 
    likes_count: int = 0
    deleted:bool
    created_at: datetime
    children: List['CommentOut'] = []
    
#for recursive type
CommentOut.update_forward_refs()