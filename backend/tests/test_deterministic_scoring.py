"""Unit tests for deterministic analyzer and hybrid scoring engine (PRD Section 15 & 18.3)."""

import pytest
from app.schemas.analysis import (
    JobRequirementMatch,
    LLMAnalysisOutput,
)
from app.services.deterministic_analyzer import (
    analyze_deterministic,
    analyze_deterministic_signals,
    get_score_tier,
)
from app.services.scoring_engine import (
    calculate_hybrid_scores,
    calculate_job_match_score,
    calculate_resume_quality_score,
    compute_hybrid_scores,
)

STUDENT_RESUME_TEXT = """
Aarav Sharma
Email: aarav.sharma@example.com | Phone: +91 9876543210 | GitHub: github.com/aaravsharma

SUMMARY
Motivated final-year BCA student with hands-on project experience in Python, FastAPI, relational database design, and modern cloud deployment architectures.

EDUCATION
Bachelor of Computer Applications (BCA) - XYZ University, 2026
CGPA: 8.9 / 10.0

TECHNICAL SKILLS
Languages: Python, Java, JavaScript, SQL
Tools & Frameworks: FastAPI, React, Node.js, Git, Docker, Postman, MySQL, Linux

ACADEMIC PROJECTS
1. Campus Library Automation System (2024)
• Developed scalable RESTful backend services using Python 3.11 and FastAPI framework.
• Engineered normalized relational database schema in MySQL handling book cataloging.
• Implemented role-based authentication and secure token validation for portal users.
• Wrote comprehensive unit and integration test suites using Pytest framework.
• Documented interactive API endpoints using Swagger UI and Postman collections.

2. Student Activity and Event Tracker (2023)
• Built responsive single-page web application using React, Vite, and Tailwind CSS.
• Integrated asynchronous third-party calendar APIs for real-time notification alerts.
• Optimized frontend asset bundles, reducing initial load latency by 35%.
• Deployed production application on Vercel with automated continuous integration pipelines.
"""


def test_student_fairness_rule_full_section_credit():
    """Verify student resume with Projects/Internships receives full RQ-2 experiential credit (+6 pts)."""
    signals = analyze_deterministic_signals(
        text=STUDENT_RESUME_TEXT,
    )

    # Inferred as student/fresh graduate
    assert signals.candidate_profile_type == "student_or_fresh_graduate"

    # Contact points: Email (+4), Phone (+3), GitHub/Profile (+3) = 10 pts
    assert signals.rq1_points == 10
    assert signals.detected_email == "aarav.sharma@example.com"
    assert signals.detected_phone is not None
    assert signals.has_profile_link is True

    # Section points (RQ-2):
    # Education (+6), Skills (+6), Projects (+6) [Student Fairness applied], Summary (+2) = 20 pts
    assert signals.rq2_points == 20
    assert "Projects/Experience: +6" in signals.rq2_note

    # Student with >= 2 project entries and >= 6 bullets receives full RQ-3 baseline volume credit (+5 pts)
    assert signals.rq3_det_points == 5


def test_ats_readability_score_sums_to_100_on_clean_document():
    """Verify that a clean, well-formatted document earns a 100/100 ATS-Readability score."""
    signals = analyze_deterministic_signals(
        text=STUDENT_RESUME_TEXT,
    )

    ats = signals.ats_readability
    assert ats.score == 100
    assert ats.tier == "Excellent"
    assert len(ats.criteria_breakdown) == 5

    # Check breakdown matches 25 + 25 + 20 + 15 + 15 = 100
    breakdown_dict = {item.id: item.earned for item in ats.criteria_breakdown}
    assert breakdown_dict["ATS-1"] == 25
    assert breakdown_dict["ATS-2"] == 25
    assert breakdown_dict["ATS-3"] == 20
    assert breakdown_dict["ATS-4"] == 15
    assert breakdown_dict["ATS-5"] == 15
    assert sum(item.earned for item in ats.criteria_breakdown) == ats.score


def test_ats_readability_broken_glyphs_and_long_paragraphs():
    """Verify deductions for broken unicode glyphs and wall-of-text paragraphs."""
    # Text with broken private-use glyph and a 95-word paragraph
    long_para = "Word " * 95
    bad_text = (
        STUDENT_RESUME_TEXT
        + "\n\nBroken icon: \ufffd\n\n"
        + long_para
    )
    signals = analyze_deterministic_signals(
        text=bad_text,
    )

    ats = signals.ats_readability
    breakdown_dict = {item.id: item.earned for item in ats.criteria_breakdown}

    # Broken glyphs -> ATS-5 loses 10 pts
    assert breakdown_dict["ATS-5"] < 15
    # Long paragraph > 85 words -> ATS-4 loses 7 pts
    assert breakdown_dict["ATS-4"] < 15
    assert ats.score < 100
    assert sum(item.earned for item in ats.criteria_breakdown) == ats.score


def test_job_match_score_missing_jd():
    """When no job description is supplied, Job Match Score must be unavailable with score=None."""
    jm_score = calculate_job_match_score(llm_output=None, has_job_description=False)
    assert jm_score.is_available is False
    assert jm_score.score is None
    assert jm_score.tier is None
    assert jm_score.criteria_breakdown is None


def test_job_match_score_exact_weighted_calculation():
    """Verify JM-1 formula: 40 * sum(w_i) / N with explicitly_found (1.0), related (0.6), missing (0.0)."""
    # 5 requirements: 2 explicit, 2 related, 1 missing
    # sum(w) = 1.0 + 1.0 + 0.6 + 0.6 + 0.0 = 3.2
    # JM-1 = round(40 * 3.2 / 5) = round(25.6) = 26
    reqs = [
        JobRequirementMatch(requirement_name="Python", importance="required", match_status="explicitly_found", resume_evidence="Demonstrated in projects"),
        JobRequirementMatch(requirement_name="FastAPI", importance="required", match_status="explicitly_found", resume_evidence="Built APIs"),
        JobRequirementMatch(requirement_name="PostgreSQL", importance="required", match_status="related_or_equivalent", resume_evidence="MySQL experience"),
        JobRequirementMatch(requirement_name="Docker", importance="required", match_status="related_or_equivalent", resume_evidence="Listed in skills"),
        JobRequirementMatch(requirement_name="Kubernetes", importance="required", match_status="not_found_in_resume", resume_evidence="Not found"),
    ]

    llm_output = LLMAnalysisOutput(
        executive_summary="Solid candidate alignment.",
        requirements=reqs,
        jm3_ai_score=20,
        jm4_ai_score=8,
        jm5_ai_score=8,
    )

    jm_score = calculate_job_match_score(llm_output=llm_output, has_job_description=True)
    assert jm_score.is_available is True
    assert jm_score.score is not None

    breakdown = {item.id: item.earned for item in jm_score.criteria_breakdown}
    assert breakdown["JM-1"] == 26
    assert breakdown["JM-3"] == 20
    assert breakdown["JM-4"] == 8
    assert breakdown["JM-5"] == 8
    assert sum(item.earned for item in jm_score.criteria_breakdown) == jm_score.score


def test_pydantic_subscore_clamping():
    """Verify field validators strictly clamp out-of-bounds AI scores to their max points."""
    llm_output = LLMAnalysisOutput(
        executive_summary="Test clamping",
        rq3_ai_score=999,  # Max is 20
        rq4_ai_score=888,  # Max is 15
        rq5_ai_score=777,  # Max is 10
        rq6_ai_score=-50,  # Min is 0
        jm3_ai_score=150,  # Max is 25
        jm4_ai_score=100,  # Max is 10
        jm5_ai_score=-10,  # Min is 0
    )

    assert llm_output.rq3_ai_score == 20
    assert llm_output.rq4_ai_score == 15
    assert llm_output.rq5_ai_score == 10
    assert llm_output.rq6_ai_score == 0
    assert llm_output.jm3_ai_score == 25
    assert llm_output.jm4_ai_score == 10
    assert llm_output.jm5_ai_score == 0


def test_score_tier_labels():
    """Verify Section 15.D score tier labels mapping."""
    assert get_score_tier(100) == "Excellent"
    assert get_score_tier(85) == "Excellent"
    assert get_score_tier(84) == "Strong"
    assert get_score_tier(70) == "Strong"
    assert get_score_tier(69) == "Fair"
    assert get_score_tier(50) == "Fair"
    assert get_score_tier(49) == "Needs Work"
    assert get_score_tier(0) == "Needs Work"


def test_calculate_hybrid_scores_end_to_end_and_sum_integrity():
    """Verify calculate_hybrid_scores aggregates all 3 scores and verifies exact subscore sum integrity."""
    signals = analyze_deterministic_signals(
        text=STUDENT_RESUME_TEXT,
    )

    llm_output = LLMAnalysisOutput(
        executive_summary="Aarav is an exceptional entry-level candidate.",
        rq3_ai_score=18,
        rq4_ai_score=13,
        rq5_ai_score=9,
        rq6_ai_score=4,
    )

    scores = calculate_hybrid_scores(
        deterministic=signals,
        llm_data=llm_output,
        has_job_description=False,
    )

    # Resume quality score should be an integer between 0 and 100
    assert isinstance(scores.resume_quality.score, int)
    assert 0 <= scores.resume_quality.score <= 100
    assert len(scores.resume_quality.criteria_breakdown) == 6
    # Exact sum equality
    assert scores.resume_quality.score == sum(c.earned for c in scores.resume_quality.criteria_breakdown)

    # Job match score should be null when has_job_description is False
    assert scores.job_match.is_available is False
    assert scores.job_match.score is None

    # ATS-Readability score should be 100
    assert scores.ats_readability.score == 100
    assert len(scores.ats_readability.criteria_breakdown) == 5
    assert scores.ats_readability.score == sum(c.earned for c in scores.ats_readability.criteria_breakdown)


def test_compute_hybrid_scores_alias_compatibility():
    """Verify legacy/alternate compute_hybrid_scores function signature works identically."""
    signals = analyze_deterministic(STUDENT_RESUME_TEXT, word_count=len(STUDENT_RESUME_TEXT.split()))
    scores = compute_hybrid_scores(signals=signals, llm_output=None, has_job_description=False)
    assert scores.resume_quality.score > 0
    assert scores.ats_readability.score == 100
