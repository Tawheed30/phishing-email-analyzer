"""Tests for the enhanced /health endpoint (Phase 5)."""

import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app, APP_VERSION

TRANSPORT = ASGITransport(app=app)


@pytest.mark.asyncio
async def test_health_returns_200():
    async with AsyncClient(transport=TRANSPORT, base_url="http://test") as ac:
        r = await ac.get("/health")
    assert r.status_code == 200


@pytest.mark.asyncio
async def test_health_contains_status_ok():
    async with AsyncClient(transport=TRANSPORT, base_url="http://test") as ac:
        r = await ac.get("/health")
    assert r.json()["status"] == "ok"


@pytest.mark.asyncio
async def test_health_contains_version():
    async with AsyncClient(transport=TRANSPORT, base_url="http://test") as ac:
        r = await ac.get("/health")
    assert r.json()["version"] == APP_VERSION


@pytest.mark.asyncio
async def test_health_contains_timestamp():
    async with AsyncClient(transport=TRANSPORT, base_url="http://test") as ac:
        r = await ac.get("/health")
    body = r.json()
    assert "timestamp" in body
    # ISO-8601 format check
    assert "T" in body["timestamp"]
    assert "Z" in body["timestamp"] or "+" in body["timestamp"]


@pytest.mark.asyncio
async def test_health_contains_api_key_configured():
    async with AsyncClient(transport=TRANSPORT, base_url="http://test") as ac:
        r = await ac.get("/health")
    body = r.json()
    assert "api_key_configured" in body
    assert isinstance(body["api_key_configured"], bool)


@pytest.mark.asyncio
async def test_health_all_required_fields_present():
    async with AsyncClient(transport=TRANSPORT, base_url="http://test") as ac:
        r = await ac.get("/health")
    body = r.json()
    for field in ("status", "version", "timestamp", "api_key_configured"):
        assert field in body, f"Missing field: {field}"
