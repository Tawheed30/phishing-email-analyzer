"""
Route-level tests. AIAnalyzer.analyze_with_claude is mocked so no
real Anthropic API key is needed.
"""

import json
from types import SimpleNamespace
from unittest.mock import AsyncMock, MagicMock, patch

import pytest
from httpx import ASGITransport, AsyncClient

from app.main import app
from app.models.schemas import AnalysisResponse, IOC, MitreTTP
from app.services.email_parser import EmailParser
from tests.fixtures import CLEAN_EMAIL, PHISHING_EMAIL, SUSPICIOUS_EMAIL

TRANSPORT = ASGITransport(app=app)
_parser = EmailParser()


def _mock_analysis_response(parsed_email, **kwargs) -> AnalysisResponse:
    defaults = dict(
        verdict="suspicious",
        confidence=60,
        summary="Mocked analysis for route tests.",
        red_flags=["mock flag"],
        iocs=[IOC(type="url", value="http://evil.com", context="test")],
        mitre_ttps=[MitreTTP(technique_id="T1566", technique_name="Phishing", tactic="Initial Access")],
        recommendations=["Block sender."],
        analyst_notes=None,
        processing_time_ms=42,
        parsed_email=parsed_email,
    )
    defaults.update(kwargs)
    return AnalysisResponse(**defaults)


def _patch_analyzer(parsed_email, **kwargs):
    response = _mock_analysis_response(parsed_email, **kwargs)
    return patch(
        "app.routers.analyze._analyzer.analyze_with_claude",
        new=AsyncMock(return_value=response),
    )


# ── Basic health / validation ──────────────────────────────────────────────────

@pytest.mark.asyncio
async def test_health():
    async with AsyncClient(transport=TRANSPORT, base_url="http://test") as ac:
        r = await ac.get("/health")
    assert r.status_code == 200
    assert r.json() == {"status": "ok"}


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
async def test_analyze_missing_raw_email_field_returns_422():
    async with AsyncClient(transport=TRANSPORT, base_url="http://test") as ac:
        r = await ac.post("/api/v1/analyze", json={})
    assert r.status_code == 422


# ── Route tests with mocked AI ─────────────────────────────────────────────────

@pytest.mark.asyncio
async def test_analyze_valid_email_returns_200():
    pe = _parser.parse(CLEAN_EMAIL)
    with _patch_analyzer(pe):
        async with AsyncClient(transport=TRANSPORT, base_url="http://test") as ac:
            r = await ac.post("/api/v1/analyze", json={"raw_email": CLEAN_EMAIL})
    assert r.status_code == 200


@pytest.mark.asyncio
async def test_analyze_response_has_required_fields():
    pe = _parser.parse(SUSPICIOUS_EMAIL)
    with _patch_analyzer(pe):
        async with AsyncClient(transport=TRANSPORT, base_url="http://test") as ac:
            r = await ac.post("/api/v1/analyze", json={"raw_email": SUSPICIOUS_EMAIL})
    assert r.status_code == 200
    body = r.json()
    for field in ("verdict", "confidence", "summary", "red_flags", "iocs",
                  "mitre_ttps", "recommendations", "analyst_notes",
                  "processing_time_ms", "parsed_email"):
        assert field in body, f"Missing field: {field}"


@pytest.mark.asyncio
async def test_analyze_non_email_string_returns_200():
    """Parser handles garbage gracefully; AI stub still responds."""
    pe = _parser.parse("hello world this is not an email")
    with _patch_analyzer(pe):
        async with AsyncClient(transport=TRANSPORT, base_url="http://test") as ac:
            r = await ac.post("/api/v1/analyze", json={"raw_email": "hello world this is not an email"})
    assert r.status_code == 200


@pytest.mark.asyncio
async def test_analyze_parsed_email_fields():
    pe = _parser.parse(SUSPICIOUS_EMAIL)
    with _patch_analyzer(pe):
        async with AsyncClient(transport=TRANSPORT, base_url="http://test") as ac:
            r = await ac.post("/api/v1/analyze", json={"raw_email": SUSPICIOUS_EMAIL})
    parsed = r.json()["parsed_email"]
    assert parsed["from_address"] == "support@legitbank.com"
    assert parsed["suspicious_flags"]["reply_to_mismatch"] is True
    assert len(parsed["urls"]) >= 2


@pytest.mark.asyncio
async def test_analyze_processing_time_ms_in_response():
    pe = _parser.parse(CLEAN_EMAIL)
    with _patch_analyzer(pe, processing_time_ms=123):
        async with AsyncClient(transport=TRANSPORT, base_url="http://test") as ac:
            r = await ac.post("/api/v1/analyze", json={"raw_email": CLEAN_EMAIL})
    assert r.json()["processing_time_ms"] == 123


# ── Full pipeline test (real parser + mocked Claude) ──────────────────────────

@pytest.mark.asyncio
async def test_analyze_phishing_email_full_pipeline():
    """
    End-to-end: real EmailParser parses PHISHING_EMAIL, mocked Claude
    returns a phishing verdict — verify complete AnalysisResponse structure.
    """
    pe = _parser.parse(PHISHING_EMAIL)
    with _patch_analyzer(
        pe,
        verdict="phishing",
        confidence=95,
        red_flags=["SPF fail", "CEO impersonation", "wire transfer request"],
        iocs=[
            IOC(type="url", value="https://wire.attacker.com/transfer", context="wire fraud URL"),
            IOC(type="domain", value="attacker.com", context="attacker-controlled domain"),
        ],
        mitre_ttps=[
            MitreTTP(technique_id="T1566.001", technique_name="Spearphishing Attachment", tactic="Initial Access"),
            MitreTTP(technique_id="T1656", technique_name="Impersonation", tactic="Defense Evasion"),
        ],
        recommendations=["Quarantine email", "Block attacker.com at perimeter", "Notify finance team"],
        analyst_notes="BEC-style wire fraud attempt targeting finance department.",
        processing_time_ms=987,
    ):
        async with AsyncClient(transport=TRANSPORT, base_url="http://test") as ac:
            r = await ac.post("/api/v1/analyze", json={"raw_email": PHISHING_EMAIL})

    assert r.status_code == 200
    body = r.json()

    # Verdict & confidence
    assert body["verdict"] == "phishing"
    assert body["confidence"] == 95

    # Red flags
    assert len(body["red_flags"]) == 3
    assert "SPF fail" in body["red_flags"]

    # IOCs
    assert len(body["iocs"]) == 2
    ioc_values = [i["value"] for i in body["iocs"]]
    assert "https://wire.attacker.com/transfer" in ioc_values

    # MITRE TTPs
    assert len(body["mitre_ttps"]) == 2
    ids = [t["technique_id"] for t in body["mitre_ttps"]]
    assert "T1566.001" in ids
    assert "T1656" in ids

    # Recommendations
    assert "Quarantine email" in body["recommendations"]

    # Analyst notes
    assert "BEC-style" in body["analyst_notes"]

    # Timing
    assert body["processing_time_ms"] == 987

    # Parser fields intact
    pe_body = body["parsed_email"]
    assert pe_body["authentication"]["spf"]["status"] == "fail"
    assert pe_body["authentication"]["dkim"]["status"] == "fail"
    assert pe_body["authentication"]["dmarc"]["status"] == "fail"
    assert len(pe_body["attachments"]) == 1
    assert pe_body["attachments"][0]["filename"] == "invoice.pdf"
