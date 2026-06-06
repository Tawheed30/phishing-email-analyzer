"""
Phase 3 tests for AIAnalyzer — all Anthropic SDK calls are mocked.
No real API key required.
"""

import json
from types import SimpleNamespace
from unittest.mock import AsyncMock, MagicMock, patch

import anthropic
import pytest
from fastapi import HTTPException

from app.services.ai_analyzer import AIAnalyzer, _build_user_prompt
from app.services.email_parser import EmailParser
from tests.fixtures import CLEAN_EMAIL, PHISHING_EMAIL, SUSPICIOUS_EMAIL

parser = EmailParser()

# ── Helpers ────────────────────────────────────────────────────────────────────

def _make_message(content: str) -> MagicMock:
    """Build a minimal mock that looks like an anthropic.Message."""
    msg = MagicMock()
    msg.content = [SimpleNamespace(text=content)]
    return msg


def _claude_response(**kwargs) -> str:
    base = {
        "verdict": "clean",
        "confidence": 10,
        "summary": "No indicators found.",
        "red_flags": [],
        "iocs": [],
        "mitre_ttps": [],
        "recommendations": ["No action required."],
        "analyst_notes": None,
    }
    base.update(kwargs)
    return json.dumps(base)


def _patch_client(return_value: MagicMock):
    """Patch AsyncAnthropic so messages.create returns return_value."""
    mock_client = MagicMock()
    mock_client.messages.create = AsyncMock(return_value=return_value)
    return patch(
        "app.services.ai_analyzer.anthropic.AsyncAnthropic",
        return_value=mock_client,
    )


# ── Tests ──────────────────────────────────────────────────────────────────────

@pytest.mark.asyncio
async def test_clean_email_returns_clean_verdict():
    pe = parser.parse(CLEAN_EMAIL)
    msg = _make_message(_claude_response(verdict="clean", confidence=5))
    with _patch_client(msg):
        result = await AIAnalyzer().analyze_with_claude(pe)
    assert result.verdict == "clean"


@pytest.mark.asyncio
async def test_phishing_email_returns_phishing_verdict():
    pe = parser.parse(PHISHING_EMAIL)
    msg = _make_message(_claude_response(
        verdict="phishing",
        confidence=95,
        red_flags=["SPF fail", "CEO impersonation", "wire transfer request"],
    ))
    with _patch_client(msg):
        result = await AIAnalyzer().analyze_with_claude(pe)
    assert result.verdict == "phishing"
    assert result.confidence >= 80


@pytest.mark.asyncio
async def test_malformed_json_returns_error_verdict():
    pe = parser.parse(SUSPICIOUS_EMAIL)
    msg = _make_message("Sorry, I cannot analyze that email right now.")
    with _patch_client(msg):
        result = await AIAnalyzer().analyze_with_claude(pe)
    assert result.verdict == "error"
    assert result.confidence == 0
    assert "Sorry, I cannot" in (result.analyst_notes or "")


@pytest.mark.asyncio
async def test_api_connection_error_raises_503():
    pe = parser.parse(SUSPICIOUS_EMAIL)
    mock_client = MagicMock()
    mock_client.messages.create = AsyncMock(
        side_effect=anthropic.APIConnectionError(request=MagicMock())
    )
    with patch("app.services.ai_analyzer.anthropic.AsyncAnthropic", return_value=mock_client):
        with pytest.raises(HTTPException) as exc_info:
            await AIAnalyzer().analyze_with_claude(pe)
    assert exc_info.value.status_code == 503


@pytest.mark.asyncio
async def test_rate_limit_error_raises_503():
    pe = parser.parse(SUSPICIOUS_EMAIL)
    mock_client = MagicMock()
    mock_client.messages.create = AsyncMock(
        side_effect=anthropic.RateLimitError(
            message="rate limit", response=MagicMock(), body={}
        )
    )
    with patch("app.services.ai_analyzer.anthropic.AsyncAnthropic", return_value=mock_client):
        with pytest.raises(HTTPException) as exc_info:
            await AIAnalyzer().analyze_with_claude(pe)
    assert exc_info.value.status_code == 503


@pytest.mark.asyncio
async def test_iocs_mapped_correctly():
    pe = parser.parse(SUSPICIOUS_EMAIL)
    payload = _claude_response(
        verdict="suspicious",
        confidence=70,
        iocs=[
            {"type": "url", "value": "http://evil.com/steal", "context": "credential harvesting page"},
            {"type": "domain", "value": "evil.com", "context": "known phishing domain"},
        ],
    )
    with _patch_client(_make_message(payload)):
        result = await AIAnalyzer().analyze_with_claude(pe)
    assert len(result.iocs) == 2
    assert result.iocs[0].type == "url"
    assert result.iocs[0].value == "http://evil.com/steal"
    assert result.iocs[0].context == "credential harvesting page"
    assert result.iocs[1].type == "domain"
    assert result.iocs[1].value == "evil.com"


@pytest.mark.asyncio
async def test_mitre_ttps_mapped_correctly():
    pe = parser.parse(PHISHING_EMAIL)
    payload = _claude_response(
        verdict="phishing",
        confidence=90,
        mitre_ttps=[
            {
                "technique_id": "T1566.001",
                "technique_name": "Spearphishing Attachment",
                "tactic": "Initial Access",
            },
            {
                "technique_id": "T1656",
                "technique_name": "Impersonation",
                "tactic": "Defense Evasion",
            },
        ],
    )
    with _patch_client(_make_message(payload)):
        result = await AIAnalyzer().analyze_with_claude(pe)
    assert len(result.mitre_ttps) == 2
    assert result.mitre_ttps[0].technique_id == "T1566.001"
    assert result.mitre_ttps[0].technique_name == "Spearphishing Attachment"
    assert result.mitre_ttps[0].tactic == "Initial Access"
    assert result.mitre_ttps[1].technique_id == "T1656"


@pytest.mark.asyncio
async def test_processing_time_ms_present_and_positive():
    pe = parser.parse(CLEAN_EMAIL)
    msg = _make_message(_claude_response())
    with _patch_client(msg):
        result = await AIAnalyzer().analyze_with_claude(pe)
    assert result.processing_time_ms >= 0


@pytest.mark.asyncio
async def test_markdown_fences_stripped_before_json_parse():
    pe = parser.parse(CLEAN_EMAIL)
    # Claude sometimes wraps output in ```json ... ```
    fenced = "```json\n" + _claude_response(verdict="clean", confidence=8) + "\n```"
    with _patch_client(_make_message(fenced)):
        result = await AIAnalyzer().analyze_with_claude(pe)
    assert result.verdict == "clean"
    assert result.confidence == 8


@pytest.mark.asyncio
async def test_prompt_contains_spf_dkim_dmarc():
    """Verify the user prompt sent to Claude includes auth results."""
    pe = parser.parse(SUSPICIOUS_EMAIL)
    captured_prompts: list[str] = []

    async def capture_create(**kwargs):
        captured_prompts.append(kwargs["messages"][0]["content"])
        return _make_message(_claude_response())

    mock_client = MagicMock()
    mock_client.messages.create = capture_create

    with patch("app.services.ai_analyzer.anthropic.AsyncAnthropic", return_value=mock_client):
        await AIAnalyzer().analyze_with_claude(pe)

    assert captured_prompts, "No prompt was captured"
    prompt = captured_prompts[0]
    assert "spf" in prompt.lower()
    assert "dkim" in prompt.lower()
    assert "dmarc" in prompt.lower()
    # Values from SUSPICIOUS_EMAIL fixture
    assert "softfail" in prompt.lower()
    assert "none" in prompt.lower()


@pytest.mark.asyncio
async def test_analyst_notes_passed_through():
    pe = parser.parse(CLEAN_EMAIL)
    msg = _make_message(
        _claude_response(analyst_notes="Unusual X-Mailer header worth investigating.")
    )
    with _patch_client(msg):
        result = await AIAnalyzer().analyze_with_claude(pe)
    assert result.analyst_notes == "Unusual X-Mailer header worth investigating."
