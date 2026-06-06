import os

# Raise the rate limit to a safe ceiling so route tests never hit 429
os.environ.setdefault("ANALYZE_RATE_LIMIT", "1000/minute")
