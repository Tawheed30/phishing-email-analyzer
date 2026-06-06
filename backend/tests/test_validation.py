"""Tests for EmailAnalysisRequest Pydantic validators (Phase 5)."""

import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app
from app.models.schemas import EMAIL_MAX_CHARS, EMAIL_MIN_CHARS

TRANSPORT = ASGITransport(app=app)


@pytest.mark.asyncio
async def test_empty_string_returns_422():
    async with AsyncClient(transport=TRANSPORT, base_url="http://test") as ac:
        r = await ac.post("/api/v1/analyze", json={"raw_email": ""})
    assert r.status_code == 422


@pytest.mark.asyncio
async def test_whitespace_only_returns_422():
    async with AsyncClient(transport=TRANSPORT, base_url="http://test") as ac:
        r = await ac.post("/api/v1/analyze", json={"raw_email": "   \n\t  "})
    assert r.status_code == 422


@pytest.mark.asyncio
async def test_too_short_returns_422():
    async with AsyncClient(transport=TRANSPORT, base_url="http://test") as ac:
        r = await ac.post("/api/v1/analyze", json={"raw_email": "short"})
    assert r.status_code == 422


@pytest.mark.asyncio
async def test_exactly_min_length_passes():
    # EMAIL_MIN_CHARS stripped chars should pass
    payload = "x" * EMAIL_MIN_CHARS
    from unittest.mock import AsyncMock, patch
    from app.services.email_parser import EmailParser
    from app.models.schemas import AnalysisResponse

    parsed = EmailParser().parse(payload)
    mock_resp = AnalysisResponse(
        verdict="clean", confidence=10, summary="stub", red_flags=[],
        iocs=[], mitre_ttps=[], recommendations=[], parsed_email=parsed,
    )
    with patch("app.routers.analyze._analyzer.analyze_with_claude", new=AsyncMock(return_value=mock_resp)):
        async with AsyncClient(transport=TRANSPORT, base_url="http://test") as ac:
            r = await ac.post("/api/v1/analyze", json={"raw_email": payload})
    assert r.status_code == 200


@pytest.mark.asyncio
async def test_oversized_email_returns_422():
    huge = "x" * (EMAIL_MAX_CHARS + 1)
    async with AsyncClient(transport=TRANSPORT, base_url="http://test") as ac:
        r = await ac.post("/api/v1/analyze", json={"raw_email": huge})
    assert r.status_code == 422


@pytest.mark.asyncio
async def test_oversized_error_message_mentions_limit():
    huge = "x" * (EMAIL_MAX_CHARS + 1)
    async with AsyncClient(transport=TRANSPORT, base_url="http://test") as ac:
        r = await ac.post("/api/v1/analyze", json={"raw_email": huge})
    body = r.json()
    detail_str = str(body)
    assert "500" in detail_str or "limit" in detail_str.lower()


@pytest.mark.asyncio
async def test_missing_raw_email_field_returns_422():
    async with AsyncClient(transport=TRANSPORT, base_url="http://test") as ac:
        r = await ac.post("/api/v1/analyze", json={})
    assert r.status_code == 422


@pytest.mark.asyncio
async def test_validation_error_body_is_json():
    async with AsyncClient(transport=TRANSPORT, base_url="http://test") as ac:
        r = await ac.post("/api/v1/analyze", json={"raw_email": ""})
    assert r.status_code == 422
    # Response should be valid JSON
    body = r.json()
    assert isinstance(body, dict)
