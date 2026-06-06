import json
import anthropic
from app.models.schemas import AnalysisReport, IOCs, MitreAttack
from app.utils.prompt import build_prompt

client = anthropic.AsyncAnthropic()
MODEL = "claude-sonnet-4-20250514"


async def analyze_email(raw_email: str) -> AnalysisReport:
    prompt = build_prompt(raw_email)

    message = await client.messages.create(
        model=MODEL,
        max_tokens=2048,
        messages=[{"role": "user", "content": prompt}],
    )

    raw_text = message.content[0].text
    data = json.loads(raw_text)

    return AnalysisReport(
        verdict=data["verdict"],
        confidence_score=data["confidence_score"],
        summary=data["summary"],
        red_flags=data.get("red_flags", []),
        iocs=IOCs(**data.get("iocs", {})),
        mitre_attack=[MitreAttack(**t) for t in data.get("mitre_attack", [])],
        recommendations=data.get("recommendations", []),
        raw_analysis=raw_text,
    )
