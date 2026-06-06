import pytest
from app.services.email_parser import EmailParser
from tests.fixtures import (
    CLEAN_EMAIL,
    SUSPICIOUS_EMAIL,
    PHISHING_EMAIL,
    MISSING_HEADERS_EMAIL,
)

parser = EmailParser()


class TestCleanEmail:
    def setup_method(self):
        self.parsed = parser.parse(CLEAN_EMAIL)

    def test_from_address(self):
        assert self.parsed.from_address == "bob@gmail.com"

    def test_from_display_name(self):
        assert self.parsed.from_display_name == "Bob Smith"

    def test_subject(self):
        assert self.parsed.subject == "Meeting tomorrow"

    def test_spf_pass(self):
        assert self.parsed.authentication.spf.status == "pass"

    def test_dkim_pass(self):
        assert self.parsed.authentication.dkim.status == "pass"

    def test_dmarc_pass(self):
        assert self.parsed.authentication.dmarc.status == "pass"

    def test_no_reply_to_mismatch(self):
        assert self.parsed.suspicious_flags.reply_to_mismatch is False

    def test_has_message_id(self):
        assert self.parsed.suspicious_flags.missing_message_id is False

    def test_has_date(self):
        assert self.parsed.suspicious_flags.missing_date is False

    def test_no_urls_in_body(self):
        # Clean email body has no URLs
        body_urls = [u for u in self.parsed.urls if "gmail" not in u and "example" not in u]
        assert len(body_urls) == 0


class TestSuspiciousEmail:
    def setup_method(self):
        self.parsed = parser.parse(SUSPICIOUS_EMAIL)

    def test_from_address(self):
        assert self.parsed.from_address == "support@legitbank.com"

    def test_reply_to_mismatch_flagged(self):
        assert self.parsed.suspicious_flags.reply_to_mismatch is True

    def test_reply_to_value(self):
        assert self.parsed.reply_to == "harvester@evil-domain.com"

    def test_spf_softfail(self):
        assert self.parsed.authentication.spf.status == "softfail"

    def test_dkim_none(self):
        assert self.parsed.authentication.dkim.status == "none"

    def test_dmarc_none(self):
        assert self.parsed.authentication.dmarc.status == "none"

    def test_urls_extracted(self):
        assert len(self.parsed.urls) >= 2

    def test_evil_url_present(self):
        combined = " ".join(self.parsed.urls)
        assert "evil-domain.com" in combined or "phishing.example.net" in combined

    def test_suspicious_received_chain(self):
        # Received hop has both private IP 192.168.1.10 and public 203.0.113.50
        assert self.parsed.suspicious_flags.suspicious_received_chain is True


class TestPhishingEmail:
    def setup_method(self):
        self.parsed = parser.parse(PHISHING_EMAIL)

    def test_subject_contains_urgent(self):
        assert "URGENT" in self.parsed.subject or "Wire" in self.parsed.subject

    def test_spf_fail(self):
        assert self.parsed.authentication.spf.status == "fail"

    def test_dkim_fail(self):
        assert self.parsed.authentication.dkim.status == "fail"

    def test_dmarc_fail(self):
        assert self.parsed.authentication.dmarc.status == "fail"

    def test_attachment_detected(self):
        assert len(self.parsed.attachments) == 1
        assert self.parsed.attachments[0].filename == "invoice.pdf"
        assert "pdf" in self.parsed.attachments[0].mime_type

    def test_url_extracted_from_body(self):
        combined = " ".join(self.parsed.urls)
        assert "attacker.com" in combined

    def test_has_date(self):
        assert self.parsed.date is not None


class TestMissingHeadersEmail:
    def setup_method(self):
        self.parsed = parser.parse(MISSING_HEADERS_EMAIL)

    def test_missing_message_id_flagged(self):
        assert self.parsed.suspicious_flags.missing_message_id is True

    def test_missing_date_flagged(self):
        assert self.parsed.suspicious_flags.missing_date is True

    def test_url_in_body(self):
        assert any("prize-scam.com" in u for u in self.parsed.urls)

    def test_graceful_no_auth(self):
        assert self.parsed.authentication.spf.status == "none"
