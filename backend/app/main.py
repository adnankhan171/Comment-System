# app/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from slowapi.middleware import SlowAPIMiddleware
from slowapi.errors import RateLimitExceeded
from slowapi import _rate_limit_exceeded_handler

from .db import init_db
from .libs.limiter import limiter

from .routers import auth_router, posts_router, comments_router, likes_router

app = FastAPI(title="Comment System API")

origins = [
    "http://localhost",
    "http://localhost:3000",
    "http://localhost:5173",# This is the default port for React development server
    # "https://your-production-frontend.com" # Add your production domain here
]
# Add the CORS middleware to the application
app.add_middleware(
    CORSMiddleware,
    allow_origins= origins,#origins, # This allows your frontend's domain to access the API
    allow_credentials=True, # Allows cookies and authorization headers
    allow_methods=["*"], # Allows all HTTP methods (GET, POST, PUT, DELETE, OPTIONS, etc.)
    allow_headers=["*"], # Allows all headers
)
# attach limiter/middleware
app.state.limiter = limiter
app.add_middleware(SlowAPIMiddleware)
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# include routers
app.include_router(auth_router.router)
app.include_router(posts_router.router)
app.include_router(comments_router.router)
app.include_router(likes_router.router)

@app.on_event("startup")
def on_startup():
    init_db()
