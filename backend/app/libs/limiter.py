# app/libs/limiter.py
from slowapi import Limiter
from slowapi.util import get_remote_address

# Use in-memory (default) limiter for dev.
# In production configure Redis backend by passing storage uri to Limiter(...)
limiter = Limiter(key_func=get_remote_address)
