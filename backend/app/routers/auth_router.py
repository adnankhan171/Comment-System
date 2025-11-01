# app/routers/auth_router.py
from fastapi import APIRouter, Depends, HTTPException, status # type:ignore
from sqlmodel import Session, select # type:ignore
from datetime import datetime, timedelta
from ..schemas import UserCreate, UserRead, Token, UserLogin
from ..models import User
from ..db import get_session
from ..auth import get_password_hash, verify_password, create_access_token
from ..utils.email_utils import generate_otp, send_otp_email
from pydantic import BaseModel
import json
from core.redis_client import redis_client

router = APIRouter(prefix="/auth", tags=["auth"])

class VerifyEmailRequest(BaseModel):
    email: str
    otp:str
    
@router.post("/verify-email")
async def verify_email(data:VerifyEmailRequest,session:Session=Depends(get_session)):
    #retrieve data from redis
    temp_data = await redis_client.get(f"user_otp:{data.email}")
    
    if not temp_data:
        raise HTTPException(status_code=400, detail="OTP expired or not Found")
    
    user_data = json.loads(temp_data)
    
    if user_data["otp"] != data.otp:
        raise HTTPException(status_code=400, detail="Invalid OTP")
    
    # OTP verified create permanent user 
    user = User(
        username=user_data["username"],
        email=user_data["email"],
        password_hash=user_data["password_hash"],
        is_verified=True,
    )
    
    session.add(user)
    session.commit()
    session.refresh(user)
    
    # Delete temporary Redis data
    await redis_client.delete(f"user_otp:{data.email}")
    
    return {"message": "Email verified successfully. You can now log in."}
    

@router.post("/register",response_model=UserRead)
async def register(data: UserCreate, session: Session = Depends(get_session)):
    # basic uniqueness check
    exists = session.exec(select(User).where((User.username == data.username) | (User.email == data.email))).first()
    
    if exists:
        raise HTTPException(status_code=400, detail="username or email already exists")
    
    otp = generate_otp()
    expires_in = 600 # 10 minutes
    
    user_data = {
        "email":data.email,
        "otp":otp
    }
    #store user data temporarily in Redis
    await redis_client.setex(f"user_otp:{data.email}",expires_in,json.dumps(user_data))
    
    # send otp via email
    await send_otp_email(data.email, otp)
    
    # Send email
    send_otp_email(data.email, otp)

    return {"message":"OTP sent to your email please verify within 10 minutes"}

@router.post("/login",response_model=Token)
def login(form: UserLogin, session: Session = Depends(get_session)):
    # Accept username or email in 'username' field for simplicity
    user = session.exec(select(User).where((User.username == form.username) | (User.email == form.username))).first()
    
    if not user or not verify_password(form.password, user.password_hash):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")
    token = create_access_token(subject=str(user.id))
    return {"access_token": token,'token_type':"bearer"}
