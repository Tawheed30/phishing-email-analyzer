from fastapi import APIRouter, HTTPException
from app.models.schemas import EmailAnalysisRequest, AnalysisResponse
from app.services.email_parser import EmailParser
from app.services.ai_analyzer import analyze_with_claude

router = APIRouter(tags=["analyze"])
_parser = EmailParser()


@router.post("/analyze", response_model=AnalysisResponse)
async def analyze(payload: EmailAnalysisRequest):
    if not payload.raw_email.strip():
        raise HTTPException(status_code=422, detail="raw_email must not be empty")
    try:
        parsed = _parser.parse(payload.raw_email)
        return await analyze_with_claude(parsed)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
