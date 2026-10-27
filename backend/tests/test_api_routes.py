"""Test suite for API routes, Section 18.1 Standard Error Envelope, and Groq integration (Stage 4)."""

import io
import json
from unittest.mock import AsyncMock, patch

import pytest
try:
    import pymupdf as fitz
except ImportError:
    import fitz

from fastapi import APIRouter
from fastapi.testclient import TestClient

from app.main import app
from app.schemas.analysis import (
    ExtractedSkill,
    FeedbackItem,
    JobRequirementMatch,
    LLMAnalysisOutput,
    RecommendationItem,
    WeakBulletItem,
)
from app.services.deterministic_analyzer import analyze_deterministic_signals
from app.services.groq_service import (
    analyze_resume_with_groq,
    rewrite_bullet_with_groq,
)
from app.utils.exceptions import (
    AIConfigurationError,
    AIRateLimitError,
    AIResponseInvalidError,
    AIServiceError,
    AITimeoutError,
    CorruptedDocumentError,
    EmptyDocumentError,
    FileTooLargeError,
    InvalidFileSignatureError,
    InvalidFileTypeError,
    InvalidInputError,
    JDTooShortError,
    UnreadableOrScannedDocumentError,
)

# Mock router to trigger domain exceptions through the FastAPI app exception handlers
error_trigger_router = APIRouter(prefix="/api/test-errors", tags=["Testing"])


@error_trigger_router.get("/invalid-type")
async def trigger_invalid_type():
    raise InvalidFileTypeError()


@error_trigger_router.get("/invalid-sig")
async def trigger_invalid_sig():
    raise InvalidFileSignatureError()


@error_trigger_router.get("/invalid-input")
async def trigger_invalid_input():
    raise InvalidInputError(message="Invalid parameters provided.", code="INVALID_INPUT")


@error_trigger_router.get("/jd-too-short")
async def trigger_jd_too_short():
    raise JDTooShortError(character_count=24)


@error_trigger_router.get("/file-too-large")
async def trigger_file_too_large():
    raise FileTooLargeError()


@error_trigger_router.get("/corrupted-doc")
async def trigger_corrupted_doc():
    raise CorruptedDocumentError(
        message="This document appears to be corrupted.",
        code="CORRUPTED_DOCUMENT",
    )


@error_trigger_router.get("/scanned-pdf")
async def trigger_scanned_pdf():
    raise UnreadableOrScannedDocumentError(extracted_word_count=12, minimum_required_words=50)


@error_trigger_router.get("/empty-doc")
async def trigger_empty_doc():
    raise EmptyDocumentError()


@error_trigger_router.get("/ai-rate-limit")
async def trigger_ai_rate_limit():
    raise AIRateLimitError()


@error_trigger_router.get("/ai-timeout")
async def trigger_ai_timeout():
    raise AITimeoutError()


@error_trigger_router.get("/ai-unavailable")
async def trigger_ai_unavailable():
    raise AIServiceError()


@error_trigger_router.get("/ai-invalid-response")
async def trigger_ai_invalid():
    raise AIResponseInvalidError()


app.include_router(error_trigger_router)

client = TestClient(app)


def create_test_pdf_bytes() -> bytes:
    """Generate in-memory valid PDF bytes with > 50 words and clean sections."""
    doc = fitz.open()
    page = doc.new_page()
    text = (
        "Aarav Sharma\n"
        "aarav@example.com | +91 9876543210 | github.com/aarav\n\n"
        "EDUCATION\n"
        "Bachelor of Computer Applications (BCA) - XYZ College, 2026\n\n"
        "TECHNICAL SKILLS\n"
        "Python, FastAPI, SQL, React, Git, Docker, Postman\n\n"
        "ACADEMIC PROJECTS\n"
        "1. Campus Library Automation\n"
        "- Developed RESTful backend APIs using Python 3.11 and FastAPI framework.\n"
        "- Engineered relational database schema in PostgreSQL for cataloging.\n"
        "- Implemented token authentication and role-based access for students.\n"
        "- Wrote automated test suites using Pytest with 90% endpoint coverage.\n"
        "- Optimized query performance by 30% through index optimization.\n\n"
        "2. Student Portfolio Tracker\n"
        "- Built responsive web application using React, Vite, and Tailwind CSS.\n"
        "- Integrated REST APIs for live campus event data feeds.\n"
        "- Deployed frontend to Vercel with automated continuous delivery.\n"
    )
    page.insert_textbox(fitz.Rect(20, 20, 550, 750), text)
    pdf_bytes = doc.write()
    doc.close()
    return pdf_bytes


MOCK_LLM_ANALYSIS = LLMAnalysisOutput(
    executive_summary="Solid candidate profile with strong Python skills.",
    rq3_ai_score=17,
    rq3_ai_note="Good project architecture and problem-solution framing.",
    rq4_ai_score=12,
    rq4_ai_note="Action-oriented bullet points.",
    rq5_ai_score=8,
    rq5_ai_note="Categorized technical tools backed by project bullets.",
    rq6_ai_score=4,
    rq6_ai_note="Clean grammar and formatting.",
    rq_explanation="Strong technical foundation.",
    requirements=[
        JobRequirementMatch(
            requirement_name="Python",
            importance="required",
            match_status="explicitly_found",
            resume_evidence="Demonstrated in 2 academic projects.",
        ),
        JobRequirementMatch(
            requirement_name="PostgreSQL",
            importance="required",
            match_status="related_or_equivalent",
            resume_evidence="Used MySQL for relational DB project.",
        ),
        JobRequirementMatch(
            requirement_name="Docker",
            importance="preferred",
            match_status="not_found_in_resume",
            resume_evidence="Not found in the supplied resume text.",
        ),
    ],
    jm3_ai_score=20,
    jm3_ai_note="Project deliverables align with target role duties.",
    jm4_ai_score=8,
    jm4_ai_note="Standard REST and database terminology.",
    jm5_ai_score=8,
    jm5_ai_note="Final year student eligible for junior position.",
    jm_explanation="Good overall alignment with core requirements.",
    technical_skills=[
        ExtractedSkill(name="Python", source_section="Skills", evidence="Python 3.11", confidence="high"),
        ExtractedSkill(name="FastAPI", source_section="Projects", evidence="FastAPI backend", confidence="high"),
    ],
    tools_and_technologies=[
        ExtractedSkill(name="Git", source_section="Skills", evidence="Git and GitHub", confidence="high"),
    ],
    soft_skills=[
        ExtractedSkill(name="Collaboration", source_section="Projects", evidence="Team project", confidence="medium"),
    ],
    strengths=[
        FeedbackItem(title="Hands-on Projects", description="Built full stack applications with FastAPI and React."),
    ],
    improvement_areas=[
        FeedbackItem(title="Add Testing Details", description="Mention specific Pytest assertions used."),
    ],
    recommendations=[
        RecommendationItem(
            id="rec_1",
            priority="high",
            category="content",
            title="Expand on Testing",
            rationale="Automated testing is valued in software roles.",
            action_steps="Add bullet detailing Pytest test coverage.",
        ),
    ],
    weak_bullets=[
        WeakBulletItem(
            original_text="Worked on creating backend APIs using Python.",
            section="Academic Projects",
            issue="Starts with passive 'Worked on' instead of strong action verb.",
        ),
    ],
)


# --- Error Envelope Tests ---


def test_error_envelope_invalid_file_type():
    """Verify HTTP 400 INVALID_FILE_TYPE matches Section 18.1 error envelope."""
    response = client.get("/api/test-errors/invalid-type")
    assert response.status_code == 400
    body = response.json()
    assert body["status"] == "error"
    assert body["error"]["code"] == "INVALID_FILE_TYPE"
    assert "Unsupported file format" in body["error"]["message"]


def test_error_envelope_invalid_file_signature():
    """Verify HTTP 400 INVALID_FILE_SIGNATURE matches Section 18.1 error envelope."""
    response = client.get("/api/test-errors/invalid-sig")
    assert response.status_code == 400
    body = response.json()
    assert body["status"] == "error"
    assert body["error"]["code"] == "INVALID_FILE_SIGNATURE"


def test_error_envelope_invalid_input_and_jd_too_short():
    """Verify HTTP 400 INVALID_INPUT and JD_TOO_SHORT error envelopes."""
    res_input = client.get("/api/test-errors/invalid-input")
    assert res_input.status_code == 400
    assert res_input.json()["error"]["code"] == "INVALID_INPUT"

    res_jd = client.get("/api/test-errors/jd-too-short")
    assert res_jd.status_code == 400
    body_jd = res_jd.json()
    assert body_jd["error"]["code"] == "JD_TOO_SHORT"
    assert body_jd["error"]["details"]["character_count"] == 24


def test_error_envelope_file_too_large():
    """Verify HTTP 413 FILE_TOO_LARGE matches Section 18.1 error envelope."""
    response = client.get("/api/test-errors/file-too-large")
    assert response.status_code == 413
    body = response.json()
    assert body["status"] == "error"
    assert body["error"]["code"] == "FILE_TOO_LARGE"


def test_error_envelope_corrupted_doc():
    """Verify HTTP 422 CORRUPTED_DOCUMENT matches Section 18.1 error envelope."""
    response = client.get("/api/test-errors/corrupted-doc")
    assert response.status_code == 422
    body = response.json()
    assert body["status"] == "error"
    assert body["error"]["code"] == "CORRUPTED_DOCUMENT"


def test_error_envelope_scanned_pdf():
    """Verify HTTP 422 UNREADABLE_OR_SCANNED_DOCUMENT matches Section 18.1 error envelope."""
    response = client.get("/api/test-errors/scanned-pdf")
    assert response.status_code == 422
    body = response.json()
    assert body["status"] == "error"
    assert body["error"]["code"] == "UNREADABLE_OR_SCANNED_DOCUMENT"
    assert body["error"]["details"]["extracted_word_count"] == 12
    assert body["error"]["details"]["minimum_required_words"] == 50


def test_error_envelope_empty_doc():
    """Verify HTTP 422 EMPTY_DOCUMENT matches Section 18.1 error envelope."""
    response = client.get("/api/test-errors/empty-doc")
    assert response.status_code == 422
    body = response.json()
    assert body["status"] == "error"
    assert body["error"]["code"] == "EMPTY_DOCUMENT"


def test_error_envelope_ai_errors():
    """Verify HTTP 429, 502, and 504 error envelopes for AI services."""
    res_rate = client.get("/api/test-errors/ai-rate-limit")
    assert res_rate.status_code == 429
    assert res_rate.json()["error"]["code"] == "AI_RATE_LIMIT"

    res_timeout = client.get("/api/test-errors/ai-timeout")
    assert res_timeout.status_code == 504
    assert res_timeout.json()["error"]["code"] == "AI_SERVICE_TIMEOUT"

    res_unavail = client.get("/api/test-errors/ai-unavailable")
    assert res_unavail.status_code == 502
    assert res_unavail.json()["error"]["code"] == "AI_SERVICE_UNAVAILABLE"

    res_invalid = client.get("/api/test-errors/ai-invalid-response")
    assert res_invalid.status_code == 502
    assert res_invalid.json()["error"]["code"] == "AI_RESPONSE_INVALID"


# --- POST /api/analyze End-to-End Route Tests ---


def test_analyze_missing_file_rejected():
    """POST /api/analyze without file returns HTTP 400 NO_FILE_SELECTED."""
    response = client.post("/api/analyze", data={"job_description": ""})
    assert response.status_code == 400
    body = response.json()
    assert body["status"] == "error"
    assert body["error"]["code"] == "NO_FILE_SELECTED"


def test_analyze_short_job_description_rejected():
    """POST /api/analyze with JD between 1 and 49 characters returns HTTP 400 JD_TOO_SHORT."""
    pdf_bytes = create_test_pdf_bytes()
    files = {"resume_file": ("resume.pdf", pdf_bytes, "application/pdf")}
    data = {"job_description": "Python dev"}  # 10 chars (< 50)

    response = client.post("/api/analyze", files=files, data=data)
    assert response.status_code == 400
    body = response.json()
    assert body["status"] == "error"
    assert body["error"]["code"] == "JD_TOO_SHORT"
    assert body["error"]["details"]["character_count"] == 10
    assert body["error"]["details"]["minimum_required"] == 50


def test_analyze_oversized_job_description_rejected():
    """POST /api/analyze with JD > 10,000 characters returns HTTP 400 INVALID_INPUT."""
    pdf_bytes = create_test_pdf_bytes()
    files = {"resume_file": ("resume.pdf", pdf_bytes, "application/pdf")}
    data = {"job_description": "a" * 10001}

    response = client.post("/api/analyze", files=files, data=data)
    assert response.status_code == 400
    body = response.json()
    assert body["status"] == "error"
    assert body["error"]["code"] == "INVALID_INPUT"


def test_analyze_target_role_too_long():
    """POST /api/analyze with target_role > 100 characters returns HTTP 400 INVALID_INPUT."""
    pdf_bytes = create_test_pdf_bytes()
    files = {"resume_file": ("resume.pdf", pdf_bytes, "application/pdf")}
    data = {"target_role": "Senior " * 25}  # > 100 chars

    response = client.post("/api/analyze", files=files, data=data)
    assert response.status_code == 400
    body = response.json()
    assert body["status"] == "error"
    assert body["error"]["code"] == "INVALID_INPUT"


@patch("app.api.routes.analyze_resume_with_groq", new_callable=AsyncMock)
def test_analyze_without_job_description_success(mock_groq):
    """POST /api/analyze without JD returns 200 OK with job_match.is_available=False."""
    mock_groq.return_value = MOCK_LLM_ANALYSIS
    pdf_bytes = create_test_pdf_bytes()
    files = {"resume_file": ("Aarav_Sharma_Resume.pdf", pdf_bytes, "application/pdf")}
    data = {"job_description": "", "target_role": "Junior Backend Developer"}

    response = client.post("/api/analyze", files=files, data=data)
    assert response.status_code == 200
    body = response.json()

    assert body["status"] == "success"
    data_payload = body["data"]
    assert data_payload["report_id"].startswith("rep_")
    assert data_payload["metadata"]["resume_filename"] == "Aarav_Sharma_Resume.pdf"
    assert data_payload["metadata"]["has_job_description"] is False
    assert data_payload["metadata"]["target_role"] == "Junior Backend Developer"

    # Scores verification
    scores = data_payload["scores"]
    assert scores["resume_quality"]["score"] > 0
    assert len(scores["resume_quality"]["criteria_breakdown"]) == 6

    # Job match must be unavailable
    assert scores["job_match"]["is_available"] is False
    assert scores["job_match"]["score"] is None
    assert scores["job_match"]["criteria_breakdown"] is None

    # ATS readability score
    assert scores["ats_readability"]["score"] > 0
    assert len(scores["ats_readability"]["criteria_breakdown"]) == 5


@patch("app.api.routes.analyze_resume_with_groq", new_callable=AsyncMock)
def test_analyze_with_valid_job_description_success(mock_groq):
    """POST /api/analyze with valid JD returns 200 OK with job_match.is_available=True and score."""
    mock_groq.return_value = MOCK_LLM_ANALYSIS
    pdf_bytes = create_test_pdf_bytes()
    files = {"resume_file": ("Aarav_Sharma_Resume.pdf", pdf_bytes, "application/pdf")}
    valid_jd = (
        "We are seeking a talented Junior Python Developer with experience in FastAPI, "
        "relational database schema design, and automated testing with Pytest."
    )
    data = {"job_description": valid_jd, "target_role": "Junior Python Developer"}

    response = client.post("/api/analyze", files=files, data=data)
    assert response.status_code == 200
    body = response.json()

    assert body["status"] == "success"
    data_payload = body["data"]
    assert data_payload["metadata"]["has_job_description"] is True

    # Job match must be available with calculated score
    job_match = data_payload["scores"]["job_match"]
    assert job_match["is_available"] is True
    assert isinstance(job_match["score"], int)
    assert 0 <= job_match["score"] <= 100
    assert len(job_match["criteria_breakdown"]) == 5

    # Job match details list
    assert data_payload["job_match_details"] is not None
    assert len(data_payload["job_match_details"]["requirements"]) == 3


# --- POST /api/rewrite-bullet Route Tests ---


@patch("app.services.groq_service._call_groq_chat", new_callable=AsyncMock)
def test_rewrite_bullet_valid_request(mock_call_groq):
    """POST /api/rewrite-bullet returns 200 with 3 variations and no fabricated numbers."""
    mock_response = json.dumps({
        "variations": [
            {
                "id": "var_1",
                "style_label": "Action-Oriented & Impactful",
                "rewritten_text": "Developed modular Python backend APIs for a campus management portal.",
                "improvements_made": "Replaced passive phrasing with strong action verb.",
            },
            {
                "id": "var_2",
                "style_label": "Concise & Direct",
                "rewritten_text": "Engineered Python backend API endpoints supporting student services.",
                "improvements_made": "Tightened word count for recruiter scanning.",
            },
            {
                "id": "var_3",
                "style_label": "Technical Clarity Focus",
                "rewritten_text": "Architected RESTful Python services and database workflows for campus portal.",
                "improvements_made": "Highlighted technical stack and architectural context.",
            },
        ]
    })
    mock_call_groq.return_value = mock_response

    payload = {
        "original_bullet": "Worked on creating backend APIs for college portal using Python.",
        "target_role": "Junior Python Backend Developer",
        "rewrite_style": "action_oriented",
    }

    response = client.post("/api/rewrite-bullet", json=payload)
    assert response.status_code == 200
    body = response.json()

    assert body["status"] == "success"
    data = body["data"]
    assert data["original_bullet"] == payload["original_bullet"]
    assert data["target_role"] == payload["target_role"]
    assert len(data["variations"]) == 3
    assert data["detected_numbers_in_original"] == []
    assert data["missing_metrics_hint"] is not None
    assert "Verify that every" in data["verification_notice"] or "accurately reflects" in data["verification_notice"]


def test_rewrite_bullet_too_short_rejected():
    """POST /api/rewrite-bullet with < 15 characters is rejected with 400 INVALID_INPUT."""
    response = client.post("/api/rewrite-bullet", json={"original_bullet": "Too short"})
    assert response.status_code == 400
    body = response.json()
    assert body["status"] == "error"
    assert body["error"]["code"] == "INVALID_INPUT"


# --- Groq Service Retry and Error Handling Unit Tests ---


@pytest.mark.anyio
@patch("app.services.groq_service._call_groq_chat", new_callable=AsyncMock)
async def test_groq_service_retry_on_invalid_json_then_success(mock_call_groq):
    """Verify Groq service retries on attempt 1 malformed JSON and succeeds on attempt 2."""
    valid_json = json.dumps({
        "executive_summary": "Promising candidate with solid projects.",
        "rq3_ai_score": 15,
        "rq3_ai_note": "Good projects",
        "rq4_ai_score": 12,
        "rq4_ai_note": "Action verbs",
        "rq5_ai_score": 8,
        "rq5_ai_note": "Skills categorized",
        "rq6_ai_score": 4,
        "rq6_ai_note": "Clean grammar",
        "rq_explanation": "Overall strong",
        "technical_skills": [],
        "tools_and_technologies": [],
        "soft_skills": [],
        "strengths": [{"title": "Projects", "description": "Good projects"}],
        "improvement_areas": [{"title": "Metrics", "description": "Add metrics"}],
        "recommendations": [{"id": "rec_1", "priority": "high", "category": "content", "title": "Add Metrics", "rationale": "Better impact", "action_steps": "Include numbers"}],
        "weak_bullets": [],
    })

    # Attempt 1 returns broken JSON, Attempt 2 returns valid JSON
    mock_call_groq.side_effect = ["{not_valid_json", valid_json]

    signals = analyze_deterministic_signals("Sample resume text with sufficient words " * 15)
    result = await analyze_resume_with_groq(
        resume_text="Sample resume text with sufficient words " * 15,
        deterministic_signals=signals,
    )

    assert result.executive_summary == "Promising candidate with solid projects."
    assert result.rq3_ai_score == 15
    assert mock_call_groq.call_count == 2


@pytest.mark.anyio
@patch("app.services.groq_service._call_groq_chat", new_callable=AsyncMock)
async def test_groq_service_retry_failure_raises_502(mock_call_groq):
    """When both attempt 1 and attempt 2 return malformed JSON, raise AIResponseInvalidError (HTTP 502)."""
    mock_call_groq.side_effect = ["{broken_json_1", "{broken_json_2"]

    signals = analyze_deterministic_signals("Sample resume text " * 15)
    with pytest.raises(AIResponseInvalidError) as exc_info:
        await analyze_resume_with_groq(
            resume_text="Sample resume text " * 15,
            deterministic_signals=signals,
        )

    assert exc_info.value.code == "AI_RESPONSE_INVALID"
    assert exc_info.value.status_code == 502
    assert mock_call_groq.call_count == 2


@pytest.mark.anyio
async def test_groq_service_missing_key_raises_configuration_error(monkeypatch):
    """When GROQ_API_KEY is empty or placeholder, AIConfigurationError is raised."""
    from app.config import settings
    monkeypatch.setattr(settings, "GROQ_API_KEY", "")

    signals = analyze_deterministic_signals("Sample resume text " * 15)
    with pytest.raises(AIConfigurationError) as exc_info:
        await analyze_resume_with_groq(
            resume_text="Sample resume text " * 15,
            deterministic_signals=signals,
        )

    assert exc_info.value.code == "AI_CONFIGURATION_ERROR"
