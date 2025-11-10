# app/main.py
from fastapi import FastAPI # type:ignore
from fastapi.middleware.cors import CORSMiddleware # type:ignore
from app.core.redis_client import redis_client
from .db import init_db
from .routers import auth_router, posts_router, comments_router, likes_router
import uvicorn
from contextlib import asynccontextmanager

# defining lifespan event handler
@asynccontextmanager
async def lifespan(app: FastAPI):
    # on startup
    init_db()
    try:
        pong = await redis_client.ping()
        if pong:
            print("Connected to Redis")
    except Exception as e:
        print(f" Redis connection failed: {e}")
        
    yield
    
    # on shutdown
    try:
        await redis_client.close()
        print(" Redis connection closed")
    except Exception as e:
        print(f"Failed to close Redis: {e}")
        
app = FastAPI(title="Comment System API",lifespan=lifespan)

origins = [
    "http://localhost",
    "http://localhost:3000",
    "http://localhost:5173",
]
# Add the CORS middleware to the application
app.add_middleware(
    CORSMiddleware,
    allow_origins= origins,#origins, # This allows your frontend's domain to access the API
    allow_credentials=True, # Allows cookies and authorization headers
    allow_methods=["*"], # Allows all HTTP methods (GET, POST, PUT, DELETE, OPTIONS, etc.)
    allow_headers=["*"], # Allows all headers
)


# include routers
app.include_router(auth_router.router)
app.include_router(posts_router.router)
app.include_router(comments_router.router)
app.include_router(likes_router.router)

    
if __name__ == "__main__":
    uvicorn.run("app.main:app",host="0.0.0.0",port=8000,reload=True)
