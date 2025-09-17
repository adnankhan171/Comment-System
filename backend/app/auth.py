# app/auth.py
import os
from datetime import datetime, timedelta
from passlib.context import CryptContext # type:ignore
from jose import jwt,  JWTError # type:ignore

from fastapi import Depends, HTTPException, status # type:ignore
from fastapi.security import OAuth2PasswordBearer # type:ignore
from sqlmodel import Session, select # type:ignore

from .models import User
from .db import get_session

SECRET_KEY = os.environ.get("SECRET_KEY","abcde")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60*24 # 24 hours for dev

pwd_context = CryptContext(schemes=['bcrypt'], deprecated="auto") # password context, hashmigration for new algo new hash generation
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")

def get_password_hash(password: str)->str:
    return pwd_context.hash(password)

def verify_password(plain:str, hashed:str)->bool:
    return pwd_context.verify(plain,hashed)

def create_access_token(subject:str,expires_delta:timedelta = None)-> str:
    to_encode = {'sub':str(subject)}
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp":expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def get_current_user(token:str= Depends(oauth2_scheme), session: Session = Depends(get_session))-> User:
    credentials_exception = HTTPException(
        status_code = status.HTTP_401_UNAUTHORIZED,
        detail='Could not validate credentials',
        headers={'WWW-Authenticate':"Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = payload.get("sub")
        if user_id is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    user = session.get(User, int(user_id))
    if not user:
        raise credentials_exception
    return user