# app/db.py
from sqlmodel import create_engine, SQLModel, Session  # type:ignore
from typing import Generator
from dotenv import load_dotenv
import os
load_dotenv()
# DATABASE_URL = "sqlite:///./app.db"
DATABASE_URL = os.getenv("DB_URL")

engine = create_engine(DATABASE_URL, echo=False)

def init_db() -> None:
    SQLModel.metadata.create_all(engine)
    
def get_session()-> Generator[Session, None, None]:
    with Session(engine) as session:
        yield session
        