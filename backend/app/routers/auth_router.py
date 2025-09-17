# app/routers/auth_router.py
from fastapi import APIRouter, Depends, HTTPException, status # type:ignore
from sqlmodel import Session, select # type:ignore

from ..schemas import UserCreate, UserRead, Token, UserLogin
from ..models import User
from ..db import get_session
from ..auth import get_password_hash, verify_password, create_access_token

router = APIRouter(prefix="/auth", tags=["auth"])

@router.post("/register",response_model=UserRead)
def register(data: UserCreate, session: Session = Depends(get_session)):
    # basic uniqueness check
    exists = session.exec(select(User).where((User.username == data.username) | (User.email == data.email))).first()
    
    if exists:
        raise HTTPException(status_code=400, detail="username or email already exists")
    user = User(username=data.username, email=data.email, password_hash=get_password_hash(data.password))
    session.add(user)
    session.commit()
    session.refresh(user)
    return user

@router.post("/login",response_model=Token)
def login(form: UserLogin, session: Session = Depends(get_session)):
    # Accept username or email in 'username' field for simplicity
    user = session.exec(select(User).where((User.username == form.username) | (User.email == form.username))).first()
    
    if not user or not verify_password(form.password, user.password_hash):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")
    token = create_access_token(subject=str(user.id))
    return {"access_token": token,'token_type':"bearer"}
