"""
Phase 3: Real Claude AI integration for phishing threat analysis.
"""

import json
import logging
import re
import time

import anthropic
from fastapi import HTTPException

from app.models.schemas import AnalysisResponse, IOC, MitreTTP, ParsedEmail

logger = logging.getLogger(__name__)

MODEL = "claude-sonnet-4-20250514"
MAX_TOKENS = 1500
BODY_CHAR_LIMIT = 2000

SYSTEM_PROMPT = """\
You are an expert SOC Tier 2 analyst specializing in phishing detection and email threat intelligence.
You analyze parsed email metadata and content to produce structured threat assessments.
You are precise, evidence-based, and always cite specific indicators from the email when making judgments.
You never guess — if evidence is ambiguous, you reflect that in your confidence score.

Respond ONLY with a single valid JSON object matching this exact schema — no markdown fences, \
no preamble, no trailing text:

{
  "verdict": "phishing | suspicious | clean",
  "confidence": <integer 0-100>,
  "summary": "<2-3 sentence analyst summary citing specific evidence>",
  "red_flags": ["<specific flag citing evidence>", ...],
  "iocs": [
    {"type": "url|ip|domain|email|hash", "value": "...", "context": "<why this is suspicious>"}
  ],
  "mitre_ttps": [
    {"technique_id": "T####.###", "technique_name": "...", "tactic": "..."}
  ],
  "recommendations": ["<concrete analyst action>", ...],
  "analyst_notes": "<anything unusual worth further investigation, or null>"
}"""


def _build_user_prompt(pe: ParsedEmail) -> str:
    flags = pe.suspicious_flags
    active_flags = [
        name.replace("_", " ")
        for name, val in flags.model_dump().items()
        if val is True
    ]

    received_summary = (
        f"{len(pe.received_hops)} hop(s): " + " → ".join(
            h.split("\n")[0].strip()[:120] for h in pe.received_hops[:3]
        )
        if pe.received_hops else "none"
    )

    body_snippet = (pe.plain_text_body or "")[:BODY_CHAR_LIMIT]
    if pe.plain_text_body and len(pe.plain_text_body) > BODY_CHAR_LIMIT:
        body_snippet += f"\n[... truncated, {len(pe.plain_text_body)} chars total]"

    attachments_str = (
        ", ".join(f"{a.filename} ({a.mime_type})" for a in pe.attachments)
        if pe.attachments else "none"
    )

    return f"""\
Analyze the following parsed email for phishing indicators.

=== EMAIL METADATA ===
From:         {pe.from_address}
Display Name: {pe.from_display_name or 'none'}
Reply-To:     {pe.reply_to or 'none'}
Subject:      {pe.subject}
Date:         {pe.date or 'MISSING'}
Message-ID:   {pe.message_id or 'MISSING'}
Return-Path:  {pe.return_path or 'none'}

=== AUTHENTICATION ===
SPF:   {pe.authentication.spf.status}  ({pe.authentication.spf.detail})
DKIM:  {pe.authentication.dkim.status}  ({pe.authentication.dkim.detail})
DMARC: {pe.authentication.dmarc.status}  ({pe.authentication.dmarc.detail})

=== RECEIVED CHAIN ===
{received_summary}

=== PARSER-DETECTED FLAGS ===
{chr(10).join(f"- {f}" for f in active_flags) if active_flags else "- none"}

=== EXTRACTED URLs ===
{chr(10).join(f"- {u}" for u in pe.urls) if pe.urls else "- none"}

=== ATTACHMENTS ===
{attachments_str}

=== EMAIL BODY (plain text) ===
{body_snippet or "(empty)"}
"""


def _strip_fences(text: str) -> str:
    """Remove accidental markdown code fences Claude sometimes adds."""
    text = text.strip()
    text = re.sub(r"^```(?:json)?\s*", "", text)
    text = re.sub(r"\s*```$", "", text)
    return text.strip()


def _fallback_response(pe: ParsedEmail, raw: str, reason: str) -> AnalysisResponse:
    logger.error("Claude JSON parse failure (%s). Raw response: %s", reason, raw[:500])
    return AnalysisResponse(
        verdict="error",
        confidence=0,
        summary=f"Analysis failed: {reason}. Raw Claude output stored in analyst_notes.",
        red_flags=[],
        iocs=[],
        mitre_ttps=[],
        recommendations=["Re-submit the email for analysis. If the problem persists, contact your SOC team."],
        analyst_notes=raw,
        processing_time_ms=0,
        parsed_email=pe,
    )


class AIAnalyzer:
    def __init__(self) -> None:
        self._client = anthropic.AsyncAnthropic()

    async def analyze_with_claude(self, parsed_email: ParsedEmail) -> AnalysisResponse:
        prompt = _build_user_prompt(parsed_email)
        t0 = time.monotonic()

        try:
            message = await self._client.messages.create(
                model=MODEL,
                max_tokens=MAX_TOKENS,
                system=SYSTEM_PROMPT,
                messages=[{"role": "user", "content": prompt}],
            )
        except anthropic.APIConnectionError as exc:
            raise HTTPException(
                status_code=503,
                detail=f"Claude API unreachable: {exc}",
            ) from exc
        except anthropic.RateLimitError as exc:
            raise HTTPException(
                status_code=503,
                detail=f"Claude API rate limit exceeded: {exc}",
            ) from exc
        except anthropic.APIStatusError as exc:
            raise HTTPException(
                status_code=503,
                detail=f"Claude API error {exc.status_code}: {exc.message}",
            ) from exc

        elapsed_ms = int((time.monotonic() - t0) * 1000)
        raw_text = message.content[0].text

        try:
            cleaned = _strip_fences(raw_text)
            data = json.loads(cleaned)
        except (json.JSONDecodeError, IndexError, KeyError) as exc:
            resp = _fallback_response(parsed_email, raw_text, str(exc))
            resp.processing_time_ms = elapsed_ms
            return resp

        try:
            return AnalysisResponse(
                verdict=data.get("verdict", "error"),
                confidence=int(data.get("confidence", 0)),
                summary=data.get("summary", ""),
                red_flags=data.get("red_flags", []),
                iocs=[IOC(**ioc) for ioc in data.get("iocs", [])],
                mitre_ttps=[MitreTTP(**t) for t in data.get("mitre_ttps", [])],
                recommendations=data.get("recommendations", []),
                analyst_notes=data.get("analyst_notes"),
                processing_time_ms=elapsed_ms,
                parsed_email=parsed_email,
            )
        except Exception as exc:
            resp = _fallback_response(parsed_email, raw_text, f"Schema mapping error: {exc}")
            resp.processing_time_ms = elapsed_ms
            return resp
