# app/db.py
from sqlmodel import create_engine, SQLModel, Session 
from typing import Generator

DATABASE_URL = "sqlite:///./app.db"

# For SQLite in dev we need check_same_thread=False
engine = create_engine(DATABASE_URL, echo=False, connect_args={"check_same_thread":False})

def init_db() -> None:
    SQLModel.metadata.create_all(engine)
    
def get_session()-> Generator[Session, None, None]:
    with Session(engine) as session:
        yield session
        