from pydantic import BaseModel
from typing import List, Optional


# ── Input ──────────────────────────────────────────────────────────────────────

class EmailAnalysisRequest(BaseModel):
    raw_email: str


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
    # Headers
    from_address: str
    from_display_name: Optional[str]
    to_addresses: List[str]
    reply_to: Optional[str]
    subject: str
    date: Optional[str]
    message_id: Optional[str]
    return_path: Optional[str]
    received_hops: List[str]
    # Auth
    authentication: EmailAuthentication
    # Body
    plain_text_body: Optional[str]
    html_body: Optional[str]
    # Extracted artefacts
    urls: List[str]
    attachments: List[Attachment]
    # Anomaly flags
    suspicious_flags: SuspiciousHeaderFlags


# ── Analysis models ────────────────────────────────────────────────────────────

class IOC(BaseModel):
    type: str     # "url" | "ip" | "domain" | "email"
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


# ── Legacy aliases (kept so Phase 1 tests still compile) ──────────────────────

class EmailInput(EmailAnalysisRequest):
    pass
