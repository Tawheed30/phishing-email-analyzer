import os

from slowapi import Limiter
from slowapi.util import get_remote_address

# Allow tests to raise the limit via ANALYZE_RATE_LIMIT env var
ANALYZE_RATE_LIMIT = os.getenv("ANALYZE_RATE_LIMIT", "10/minute")

limiter = Limiter(key_func=get_remote_address)
