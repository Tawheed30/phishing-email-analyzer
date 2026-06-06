import logging
import os
from contextlib import asynccontextmanager

from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routers import analyze

load_dotenv()

logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    if not os.getenv("ANTHROPIC_API_KEY"):
        logger.warning(
            "ANTHROPIC_API_KEY is not set. "
            "The /analyze endpoint will fail on live requests. "
            "Running in test/mock mode only."
        )
    else:
        logger.info("ANTHROPIC_API_KEY detected — Claude integration active.")
    yield


app = FastAPI(title="Phishing Email Analyzer API", version="3.0.0", lifespan=lifespan)

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
    return {"status": "ok"}
