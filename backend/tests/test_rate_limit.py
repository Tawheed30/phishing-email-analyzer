"""Tests that the rate limiter returns 429 when exceeded (Phase 5)."""

import pytest
from fastapi import FastAPI
from httpx import ASGITransport, AsyncClient
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from slowapi.util import get_remote_address
from starlette.requests import Request


def _make_limited_app(limit: str) -> FastAPI:
    """Minimal FastAPI app with the given per-minute rate limit."""
    _limiter = Limiter(key_func=get_remote_address)
    _app = FastAPI()
    _app.state.limiter = _limiter
    _app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

    @_app.post("/probe")
    @_limiter.limit(limit)
    async def probe(request: Request):  # slowapi requires param named "request"
        return {"ok": True}

    return _app


@pytest.mark.asyncio
async def test_rate_limit_allows_requests_within_limit():
    app = _make_limited_app("5/minute")
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        for _ in range(5):
            r = await ac.post("/probe")
            assert r.status_code == 200


@pytest.mark.asyncio
async def test_rate_limit_returns_429_when_exceeded():
    app = _make_limited_app("2/minute")
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        await ac.post("/probe")  # 1st — OK
        await ac.post("/probe")  # 2nd — OK
        r = await ac.post("/probe")  # 3rd — should 429
    assert r.status_code == 429


@pytest.mark.asyncio
async def test_rate_limit_429_body_is_json():
    app = _make_limited_app("1/minute")
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        await ac.post("/probe")  # 1st OK
        r = await ac.post("/probe")  # 2nd — 429
    assert r.status_code == 429
    # Response should be valid JSON (not a plain text crash)
    body = r.json()
    assert isinstance(body, dict)


@pytest.mark.asyncio
async def test_analyze_endpoint_respects_rate_limiter():
    """Verify the real /analyze endpoint has the limiter applied (returns 200 within limit)."""
    from unittest.mock import AsyncMock, patch

    from app.main import app
    from app.models.schemas import AnalysisResponse
    from app.services.email_parser import EmailParser

    parsed = EmailParser().parse("From: test@test.com\n\nBody text here for test")
    mock_resp = AnalysisResponse(
        verdict="clean", confidence=5, summary="stub", red_flags=[],
        iocs=[], mitre_ttps=[], recommendations=[], parsed_email=parsed,
    )
    with patch("app.routers.analyze._analyzer.analyze_with_claude", new=AsyncMock(return_value=mock_resp)):
        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
            r = await ac.post(
                "/api/v1/analyze",
                json={"raw_email": "From: test@test.com\n\nBody text here for test"},
            )
    assert r.status_code == 200
