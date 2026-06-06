"""
Parses raw RFC-2822 email strings into a structured ParsedEmail model.
Uses only the stdlib `email` package — no external dependencies.
"""

import email as _email
import email.policy
import re
from email.message import Message
from typing import List, Optional, Tuple

from app.models.schemas import (
    Attachment,
    AuthResult,
    EmailAuthentication,
    ParsedEmail,
    SuspiciousHeaderFlags,
)

_URL_RE = re.compile(
    r"https?://[^\s\"'<>\]\[)(,;]+",
    re.IGNORECASE,
)
_IP_RE = re.compile(r"\b(?:\d{1,3}\.){3}\d{1,3}\b")


def _get_header(msg: Message, name: str) -> Optional[str]:
    val = msg.get(name)
    if val is None:
        return None
    # Decode RFC-2047 encoded words
    parts = _email.header.decode_header(val)
    decoded = []
    for chunk, charset in parts:
        if isinstance(chunk, bytes):
            decoded.append(chunk.decode(charset or "utf-8", errors="replace"))
        else:
            decoded.append(chunk)
    return "".join(decoded).strip()


def _get_all_headers(msg: Message, name: str) -> List[str]:
    values = msg.get_all(name) or []
    result = []
    for val in values:
        parts = _email.header.decode_header(val)
        decoded = []
        for chunk, charset in parts:
            if isinstance(chunk, bytes):
                decoded.append(chunk.decode(charset or "utf-8", errors="replace"))
            else:
                decoded.append(chunk)
        result.append("".join(decoded).strip())
    return result


def _parse_address(raw: Optional[str]) -> Tuple[Optional[str], Optional[str]]:
    """Return (display_name, email_address) from a header value."""
    if not raw:
        return None, None
    realname, addr = _email.utils.parseaddr(raw)
    return (realname.strip() or None), (addr.strip().lower() or None)


def _extract_domain(addr: Optional[str]) -> Optional[str]:
    if not addr or "@" not in addr:
        return None
    return addr.split("@", 1)[1].lower()


def _parse_auth_results(header_value: Optional[str]) -> EmailAuthentication:
    """
    Parse Authentication-Results header into SPF/DKIM/DMARC statuses.
    Format varies; we look for `spf=X`, `dkim=X`, `dmarc=X`.
    """
    STATUS_RE = re.compile(
        r"\b(spf|dkim|dmarc)\s*=\s*(\S+)", re.IGNORECASE
    )

    results = {"spf": ("none", ""), "dkim": ("none", ""), "dmarc": ("none", "")}

    if header_value:
        for match in STATUS_RE.finditer(header_value):
            proto = match.group(1).lower()
            status = match.group(2).rstrip(";,").lower()
            # Normalise to pass/fail/none/softfail/neutral
            results[proto] = (status, f"{proto}={status}")

    def make(key: str) -> AuthResult:
        status, detail = results[key]
        return AuthResult(status=status, detail=detail or f"{key}=none")

    return EmailAuthentication(spf=make("spf"), dkim=make("dkim"), dmarc=make("dmarc"))


def _extract_urls(text: Optional[str]) -> List[str]:
    if not text:
        return []
    return _URL_RE.findall(text)


def _walk_parts(msg: Message):
    """Yield (content_type, payload_text, part) for all leaf MIME parts."""
    if msg.is_multipart():
        for part in msg.walk():
            if not part.is_multipart():
                yield part
    else:
        yield msg


class EmailParser:
    def parse(self, raw_email: str) -> ParsedEmail:
        msg = _email.message_from_string(
            raw_email, policy=email.policy.compat32
        )

        # ── Headers ──────────────────────────────────────────────────────────
        raw_from = _get_header(msg, "From") or ""
        from_display, from_addr = _parse_address(raw_from)
        from_address = from_addr or raw_from

        raw_to = _get_header(msg, "To") or ""
        to_addresses = [
            addr for _, addr in _email.utils.getaddresses([raw_to]) if addr
        ]

        raw_reply_to = _get_header(msg, "Reply-To")
        _, reply_to_addr = _parse_address(raw_reply_to)
        reply_to = reply_to_addr or raw_reply_to

        subject = _get_header(msg, "Subject") or ""
        date = _get_header(msg, "Date")
        message_id = _get_header(msg, "Message-ID")
        return_path = _get_header(msg, "Return-Path")
        received_hops = _get_all_headers(msg, "Received")

        # ── Authentication ────────────────────────────────────────────────────
        auth_header = _get_header(msg, "Authentication-Results")
        authentication = _parse_auth_results(auth_header)

        # ── Body & attachments ────────────────────────────────────────────────
        plain_text_body: Optional[str] = None
        html_body: Optional[str] = None
        attachments: List[Attachment] = []

        for part in _walk_parts(msg):
            ct = part.get_content_type()
            disposition = part.get_content_disposition() or ""

            if "attachment" in disposition or part.get_filename():
                fname = part.get_filename() or "unknown"
                attachments.append(Attachment(filename=fname, mime_type=ct))
                continue

            if ct == "text/plain" and plain_text_body is None:
                payload = part.get_payload(decode=True)
                if isinstance(payload, bytes):
                    charset = part.get_content_charset() or "utf-8"
                    plain_text_body = payload.decode(charset, errors="replace")

            elif ct == "text/html" and html_body is None:
                payload = part.get_payload(decode=True)
                if isinstance(payload, bytes):
                    charset = part.get_content_charset() or "utf-8"
                    html_body = payload.decode(charset, errors="replace")

        # ── URL extraction ────────────────────────────────────────────────────
        raw_urls = _extract_urls(plain_text_body) + _extract_urls(html_body)
        # Also scan raw email for any missed URLs
        raw_urls += _extract_urls(raw_email)
        urls = list(dict.fromkeys(raw_urls))  # deduplicate, preserve order

        # ── Suspicious header flags ───────────────────────────────────────────
        from_domain = _extract_domain(from_address)
        reply_to_domain = _extract_domain(reply_to)

        reply_to_mismatch = bool(
            reply_to
            and from_domain
            and reply_to_domain
            and reply_to_domain != from_domain
        )

        display_name_mismatch = False
        if from_display and from_addr:
            # If display name looks like an email address from a different domain
            dn_match = re.search(r"@([\w.-]+)", from_display)
            if dn_match:
                dn_domain = dn_match.group(1).lower()
                display_name_mismatch = dn_domain != from_domain

        # Check for suspicious IPs in Received chain (private → public gaps, etc.)
        suspicious_received = _has_suspicious_received_chain(received_hops)

        flags = SuspiciousHeaderFlags(
            reply_to_mismatch=reply_to_mismatch,
            display_name_mismatch=display_name_mismatch,
            missing_message_id=message_id is None,
            missing_date=date is None,
            suspicious_received_chain=suspicious_received,
        )

        return ParsedEmail(
            from_address=from_address,
            from_display_name=from_display,
            to_addresses=to_addresses,
            reply_to=reply_to,
            subject=subject,
            date=date,
            message_id=message_id,
            return_path=return_path,
            received_hops=received_hops,
            authentication=authentication,
            plain_text_body=plain_text_body,
            html_body=html_body,
            urls=urls,
            attachments=attachments,
            suspicious_flags=flags,
        )


def _has_suspicious_received_chain(hops: List[str]) -> bool:
    """
    Flag if any hop contains a mismatched claim: e.g. a private IP
    immediately followed by a public-looking IP without an MX handoff,
    or a hop that claims to be from a well-known domain but uses an
    unrelated IP. This is a heuristic check.
    """
    if not hops:
        return False
    PRIVATE_RE = re.compile(
        r"\b(10\.\d+\.\d+\.\d+|172\.(1[6-9]|2\d|3[01])\.\d+\.\d+|192\.168\.\d+\.\d+)\b"
    )
    for hop in hops:
        ips = _IP_RE.findall(hop)
        if len(ips) >= 2:
            has_private = any(PRIVATE_RE.match(ip) for ip in ips)
            has_public = any(not PRIVATE_RE.match(ip) for ip in ips)
            if has_private and has_public:
                return True
    return False
