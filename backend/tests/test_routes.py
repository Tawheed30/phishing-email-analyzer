import pytest
import pytest_asyncio
from httpx import AsyncClient, ASGITransport
from app.main import app
from tests.fixtures import SUSPICIOUS_EMAIL, CLEAN_EMAIL

TRANSPORT = ASGITransport(app=app)


@pytest.mark.asyncio
async def test_health():
    async with AsyncClient(transport=TRANSPORT, base_url="http://test") as ac:
        r = await ac.get("/health")
    assert r.status_code == 200
    assert r.json() == {"status": "ok"}


@pytest.mark.asyncio
async def test_analyze_valid_email_returns_200():
    async with AsyncClient(transport=TRANSPORT, base_url="http://test") as ac:
        r = await ac.post("/api/v1/analyze", json={"raw_email": CLEAN_EMAIL})
    assert r.status_code == 200


@pytest.mark.asyncio
async def test_analyze_response_has_required_fields():
    async with AsyncClient(transport=TRANSPORT, base_url="http://test") as ac:
        r = await ac.post("/api/v1/analyze", json={"raw_email": SUSPICIOUS_EMAIL})
    assert r.status_code == 200
    body = r.json()
    for field in ("verdict", "confidence", "summary", "red_flags", "iocs",
                  "mitre_ttps", "recommendations", "parsed_email"):
        assert field in body, f"Missing field: {field}"


@pytest.mark.asyncio
async def test_analyze_empty_string_returns_422():
    async with AsyncClient(transport=TRANSPORT, base_url="http://test") as ac:
        r = await ac.post("/api/v1/analyze", json={"raw_email": ""})
    assert r.status_code == 422


@pytest.mark.asyncio
async def test_analyze_whitespace_only_returns_422():
    async with AsyncClient(transport=TRANSPORT, base_url="http://test") as ac:
        r = await ac.post("/api/v1/analyze", json={"raw_email": "   \n  "})
    assert r.status_code == 422


@pytest.mark.asyncio
async def test_analyze_non_email_string_returns_200():
    """Parser should handle garbage input gracefully — no 500 error."""
    async with AsyncClient(transport=TRANSPORT, base_url="http://test") as ac:
        r = await ac.post("/api/v1/analyze", json={"raw_email": "hello world this is not an email"})
    assert r.status_code == 200


@pytest.mark.asyncio
async def test_analyze_parsed_email_fields():
    async with AsyncClient(transport=TRANSPORT, base_url="http://test") as ac:
        r = await ac.post("/api/v1/analyze", json={"raw_email": SUSPICIOUS_EMAIL})
    pe = r.json()["parsed_email"]
    assert pe["from_address"] == "support@legitbank.com"
    assert pe["suspicious_flags"]["reply_to_mismatch"] is True
    assert len(pe["urls"]) >= 2


@pytest.mark.asyncio
async def test_analyze_missing_raw_email_field_returns_422():
    async with AsyncClient(transport=TRANSPORT, base_url="http://test") as ac:
        r = await ac.post("/api/v1/analyze", json={})
    assert r.status_code == 422
