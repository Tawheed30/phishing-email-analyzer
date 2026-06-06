import json
import logging

from fastapi import APIRouter, HTTPException, Request

from app.limiter import ANALYZE_RATE_LIMIT, limiter
from app.models.schemas import AnalysisResponse, EmailAnalysisRequest
from app.services.ai_analyzer import AIAnalyzer
from app.services.email_parser import EmailParser

logger = logging.getLogger(__name__)

router = APIRouter(tags=["analyze"])
_parser = EmailParser()
_analyzer = AIAnalyzer()


@router.post("/analyze", response_model=AnalysisResponse)
@limiter.limit(ANALYZE_RATE_LIMIT)
async def analyze(request: Request, payload: EmailAnalysisRequest):
    try:
        parsed = _parser.parse(payload.raw_email)
        result = await _analyzer.analyze_with_claude(parsed)
        logger.info(
            json.dumps({
                "event": "analyze_complete",
                "verdict": result.verdict,
                "confidence": result.confidence,
                "processing_time_ms": result.processing_time_ms,
                "from": parsed.from_address,
                "subject": parsed.subject[:80],
                "ioc_count": len(result.iocs),
                "ttp_count": len(result.mitre_ttps),
            })
        )
        return result
    except HTTPException:
        raise
    except Exception as exc:
        logger.exception("Unexpected error in /analyze")
        raise HTTPException(status_code=500, detail=str(exc)) from exc
