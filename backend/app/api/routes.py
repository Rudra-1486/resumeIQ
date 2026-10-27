"""API routes for ResumeIQ AI Backend (PRD Section 18).

Endpoints:
1. GET /api/health: Backend operational check and Groq status.
2. POST /api/analyze: Full resume analysis and scoring pipeline (multipart/form-data).
3. POST /api/rewrite-bullet: AI bullet-point rewriter with fact preservation (application/json).
"""

import uuid
from datetime import datetime, timezone
from typing import Optional

from fastapi import APIRouter, File, Form, UploadFile, status

from app.config import settings
from app.schemas.analysis import (
    AnalysisReportData,
    AnalysisReportResponse,
    JobMatchDetails,
    ReportMetadata,
    SkillsAnalysis,
)
from app.schemas.common import HealthResponse
from app.schemas.rewriter import (
    BulletRewriteRequest,
    BulletRewriteResponse,
)
from app.services.deterministic_analyzer import analyze_deterministic_signals
from app.services.file_validator import validate_resume_file
from app.services.groq_service import (
    analyze_resume_with_groq,
    rewrite_bullet_with_groq,
)
from app.services.scoring_engine import calculate_hybrid_scores
from app.services.text_extractor import extract_text_from_bytes
from app.utils.exceptions import InvalidInputError, JDTooShortError

router = APIRouter()


@router.get(
    "/api/health",
    response_model=HealthResponse,
    summary="System Health Check",
    description="Verify backend availability and check whether GROQ_API_KEY is configured without exposing it.",
    tags=["System"],
)
@router.get(
    "/health",
    response_model=HealthResponse,
    include_in_schema=False,
    tags=["System"],
)
async def health_check() -> HealthResponse:
    """Return system operational status and AI provider metadata (PRD Section 18.2)."""
    return HealthResponse(
        status="ok",
        service="ResumeIQ AI Backend",
        version="1.0.0",
        ai_provider="groq",
        model=settings.GROQ_MODEL,
        groq_key_configured=settings.is_groq_key_configured,
        timestamp=datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"),
    )


@router.post(
    "/api/analyze",
    response_model=AnalysisReportResponse,
    status_code=status.HTTP_200_OK,
    summary="Analyze Resume",
    description="Validate and parse uploaded PDF/DOCX resume, perform deterministic checks and Groq AI analysis.",
    tags=["Analysis"],
)
async def analyze_resume(
    resume_file: Optional[UploadFile] = File(default=None),
    job_description: Optional[str] = Form(default=""),
    target_role: Optional[str] = Form(default=""),
) -> AnalysisReportResponse:
    """Execute end-to-end resume evaluation pipeline (PRD Section 14 & 18.3)."""
    # 1. Validate inputs
    if resume_file is None or not resume_file.filename:
        raise InvalidInputError(
            message="Please select a PDF or DOCX resume file to analyze.",
            code="NO_FILE_SELECTED",
            status_code=400,
        )

    jd_clean = (job_description or "").strip()
    if 0 < len(jd_clean) < 50:
        raise JDTooShortError(character_count=len(jd_clean))

    if len(jd_clean) > 10000:
        raise InvalidInputError(
            message="Job description exceeds the 10,000 character maximum limit.",
            code="INVALID_INPUT",
            status_code=400,
        )

    role_clean = (target_role or "").strip()
    if len(role_clean) > 100:
        raise InvalidInputError(
            message="Target role title exceeds 100 characters.",
            code="INVALID_INPUT",
            status_code=400,
        )

    # 2. In-memory file validation
    file_bytes, filename, file_type = await validate_resume_file(resume_file)

    # 3. In-memory text extraction
    extracted_doc = extract_text_from_bytes(file_bytes, file_type)

    # 4. Deterministic analysis
    deterministic_signals = analyze_deterministic_signals(
        text=extracted_doc.text,
        word_count=extracted_doc.word_count,
        page_count=extracted_doc.page_count,
        file_type=file_type,
    )

    # 5. Groq AI semantic analysis
    llm_output = await analyze_resume_with_groq(
        resume_text=extracted_doc.text,
        deterministic_signals=deterministic_signals,
        job_description=jd_clean if jd_clean else None,
        target_role=role_clean if role_clean else None,
    )

    # 6. Hybrid scoring calculation
    scores = calculate_hybrid_scores(
        deterministic=deterministic_signals,
        llm_data=llm_output,
        has_job_description=bool(jd_clean),
    )

    # 7. Package report payload (PRD Section 18.3)
    report_id = f"rep_{datetime.now(timezone.utc).strftime('%Y%m%d')}_{uuid.uuid4().hex[:8]}"
    created_at = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")

    metadata = ReportMetadata(
        resume_filename=filename,
        file_type=file_type,
        file_size_bytes=len(file_bytes),
        extracted_word_count=extracted_doc.word_count,
        page_count=extracted_doc.page_count,
        text_truncated=extracted_doc.text_truncated,
        target_role=role_clean,
        has_job_description=bool(jd_clean),
        candidate_profile_type=deterministic_signals.candidate_profile_type,
        ai_model_used=settings.GROQ_MODEL,
    )

    skills_analysis = SkillsAnalysis(
        technical_skills=llm_output.technical_skills,
        tools_and_technologies=llm_output.tools_and_technologies,
        soft_skills=llm_output.soft_skills,
    )

    job_match_details = (
        JobMatchDetails(requirements=llm_output.requirements)
        if (bool(jd_clean) and llm_output.requirements)
        else None
    )

    report_data = AnalysisReportData(
        report_id=report_id,
        created_at=created_at,
        metadata=metadata,
        executive_summary=llm_output.executive_summary,
        scores=scores,
        skills_analysis=skills_analysis,
        job_match_details=job_match_details,
        strengths=llm_output.strengths,
        improvement_areas=llm_output.improvement_areas,
        recommendations=llm_output.recommendations,
        weak_bullets=llm_output.weak_bullets,
    )

    return AnalysisReportResponse(
        status="success",
        data=report_data,
    )


@router.post(
    "/api/rewrite-bullet",
    response_model=BulletRewriteResponse,
    status_code=status.HTTP_200_OK,
    summary="Rewrite Bullet Point",
    description="Rewrite a weak resume bullet point into 3 improved variations while preserving factual truth.",
    tags=["Rewriter"],
)
async def rewrite_bullet(
    request: BulletRewriteRequest,
) -> BulletRewriteResponse:
    """Generate 3 improved bullet variations via Groq (PRD Section 18.4)."""
    rewrite_data = await rewrite_bullet_with_groq(
        original_bullet=request.original_bullet,
        target_role=request.target_role or "",
        rewrite_style=request.rewrite_style,
    )

    return BulletRewriteResponse(
        status="success",
        data=rewrite_data,
    )
