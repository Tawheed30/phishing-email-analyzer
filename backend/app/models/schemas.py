from pydantic import BaseModel, field_validator
from typing import List, Optional

EMAIL_MIN_CHARS = 10
EMAIL_MAX_CHARS = 500_000


# ── Input ──────────────────────────────────────────────────────────────────────

class EmailAnalysisRequest(BaseModel):
    raw_email: str

    @field_validator("raw_email")
    @classmethod
    def validate_size(cls, v: str) -> str:
        stripped = v.strip()
        if len(stripped) < EMAIL_MIN_CHARS:
            raise ValueError(
                f"raw_email must be at least {EMAIL_MIN_CHARS} characters after stripping whitespace"
            )
        if len(stripped) > EMAIL_MAX_CHARS:
            raise ValueError(
                f"raw_email exceeds the 500KB limit ({len(stripped):,} chars)"
            )
        return stripped


# ── Parser sub-models ──────────────────────────────────────────────────────────

class AuthResult(BaseModel):
    status: str   # "pass" | "fail" | "none" | "unknown"
    detail: str


class EmailAuthentication(BaseModel):
    spf: AuthResult
    dkim: AuthResult
    dmarc: AuthResult


class Attachment(BaseModel):
    filename: str
    mime_type: str


class SuspiciousHeaderFlags(BaseModel):
    reply_to_mismatch: bool
    display_name_mismatch: bool
    missing_message_id: bool
    missing_date: bool
    suspicious_received_chain: bool


class ParsedEmail(BaseModel):
    from_address: str
    from_display_name: Optional[str]
    to_addresses: List[str]
    reply_to: Optional[str]
    subject: str
    date: Optional[str]
    message_id: Optional[str]
    return_path: Optional[str]
    received_hops: List[str]
    authentication: EmailAuthentication
    plain_text_body: Optional[str]
    html_body: Optional[str]
    urls: List[str]
    attachments: List[Attachment]
    suspicious_flags: SuspiciousHeaderFlags


# ── Analysis models ────────────────────────────────────────────────────────────

class IOC(BaseModel):
    type: str
    value: str
    context: str


class MitreTTP(BaseModel):
    technique_id: str
    technique_name: str
    tactic: str


class AnalysisResponse(BaseModel):
    verdict: str                        # "phishing" | "suspicious" | "clean" | "error"
    confidence: int                     # 0–100
    summary: str
    red_flags: List[str]
    iocs: List[IOC]
    mitre_ttps: List[MitreTTP]
    recommendations: List[str]
    analyst_notes: Optional[str] = None
    processing_time_ms: int = 0
    parsed_email: ParsedEmail


# ── Legacy aliases ────────────────────────────────────────────────────────────

class EmailInput(EmailAnalysisRequest):
    pass
