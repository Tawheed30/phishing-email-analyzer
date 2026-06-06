import json
import logging
import os
from contextlib import asynccontextmanager
from datetime import datetime, timezone

from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded

from app.limiter import limiter
from app.routers import analyze

load_dotenv()

APP_VERSION = "5.0.0"


# ── Structured JSON logging ───────────────────────────────────────────────────

class _JSONFormatter(logging.Formatter):
    def format(self, record: logging.LogRecord) -> str:
        entry = {
            "ts": datetime.now(timezone.utc).isoformat(),
            "level": record.levelname,
            "logger": record.name,
            "msg": record.getMessage(),
        }
        return json.dumps(entry)


_handler = logging.StreamHandler()
_handler.setFormatter(_JSONFormatter())
logging.basicConfig(handlers=[_handler], level=logging.INFO, force=True)
logger = logging.getLogger(__name__)


# ── Lifespan ──────────────────────────────────────────────────────────────────

@asynccontextmanager
async def lifespan(app: FastAPI):
    key_set = bool(os.getenv("ANTHROPIC_API_KEY"))
    if not key_set:
        logger.warning(
            json.dumps({
                "event": "startup",
                "api_key_configured": False,
                "msg": "ANTHROPIC_API_KEY not set — running in mock mode",
            })
        )
    else:
        logger.info(
            json.dumps({"event": "startup", "api_key_configured": True})
        )
    yield


# ── App ───────────────────────────────────────────────────────────────────────

app = FastAPI(
    title="Phishing Email Analyzer API",
    version=APP_VERSION,
    lifespan=lifespan,
)

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(analyze.router, prefix="/api/v1")


@app.get("/health")
async def health():
    return {
        "status": "ok",
        "version": APP_VERSION,
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "api_key_configured": bool(os.getenv("ANTHROPIC_API_KEY")),
    }
