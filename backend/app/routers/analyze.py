import logging

from fastapi import APIRouter, HTTPException

from app.models.schemas import AnalysisResponse, EmailAnalysisRequest
from app.services.ai_analyzer import AIAnalyzer
from app.services.email_parser import EmailParser

logger = logging.getLogger(__name__)

router = APIRouter(tags=["analyze"])
_parser = EmailParser()
_analyzer = AIAnalyzer()


@router.post("/analyze", response_model=AnalysisResponse)
async def analyze(payload: EmailAnalysisRequest):
    if not payload.raw_email.strip():
        raise HTTPException(status_code=422, detail="raw_email must not be empty")
    try:
        parsed = _parser.parse(payload.raw_email)
        result = await _analyzer.analyze_with_claude(parsed)
        logger.info(
            "analyze complete verdict=%s confidence=%s time_ms=%s",
            result.verdict,
            result.confidence,
            result.processing_time_ms,
        )
        return result
    except HTTPException:
        raise
    except Exception as exc:
        logger.exception("Unexpected error in /analyze")
        raise HTTPException(status_code=500, detail=str(exc)) from exc
