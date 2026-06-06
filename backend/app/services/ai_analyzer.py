"""
Stub for Phase 2. Returns a hardcoded mock AnalysisResponse.
Phase 3 will replace this with a real Claude API call.
"""

from app.models.schemas import AnalysisResponse, IOC, MitreTTP, ParsedEmail


async def analyze_with_claude(parsed_email: ParsedEmail) -> AnalysisResponse:
    """Hardcoded mock — replaced by real Claude call in Phase 3."""
    return AnalysisResponse(
        verdict="suspicious",
        confidence=50,
        summary=(
            "Placeholder analysis from Phase 2 stub. "
            "Phase 3 will invoke Claude to produce a real threat report."
        ),
        red_flags=["AI analysis not yet implemented (Phase 2 stub)"],
        iocs=[
            IOC(type="url", value=url, context="extracted from email body")
            for url in parsed_email.urls[:5]
        ],
        mitre_ttps=[
            MitreTTP(
                technique_id="T1566.001",
                technique_name="Spearphishing Attachment",
                tactic="Initial Access",
            )
        ],
        recommendations=[
            "Phase 3 will provide real analyst recommendations via Claude AI."
        ],
        parsed_email=parsed_email,
    )
