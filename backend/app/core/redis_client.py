import redis.asyncio as redis
import os 
from dotenv import load_dotenv

load_dotenv()
REDIS_URL=os.getenv("REDIS_URL","redis://localhost:6379/0")

redis_client = redis.from_url(REDIS_URL,port=6379, decode_responses=True)