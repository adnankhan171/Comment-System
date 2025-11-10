#app/utils/email_utils
import random
from fastapi_mail import FastMail, MessageSchema, MessageType
from core.config import conf
import asyncio

def generate_otp()->str:
    return str(random.randint(100000,999999))

async def send_otp_mail(to_email:str,otp:str):
    subject = "Your OTP Verification Code"
    body = (
        f"Your OTP code is {otp}.\n\n"
        "It will expire in 10 minutes.\n\n"
        "If you did not request this, please ignore this email."
    )
    message = MessageSchema(
        subject=subject,
        recipients=[to_email],
        body=body,
        subtype=MessageType.plain  # plain text only
    )
    fm = FastMail(conf)
    await fm.send_message(message)
    
    
if __name__ == "__main__":
    asyncio.run(send_otp_mail("adnankhan17371@gmail.com", "123456"))