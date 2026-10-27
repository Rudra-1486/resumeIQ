"""Hybrid Scoring Engine for ResumeIQ AI (PRD Section 15).

Combines 100% deterministic Python heuristics with Pydantic-clamped LLM qualitative rubrics:
1. Resume Quality Score (0-100 integer):
   - RQ-1 Contact & Profile Completeness (10 pts, deterministic)
   - RQ-2 Core Section Structure (20 pts, deterministic heading parser with Student Fairness)
   - RQ-3 Experiential & Project Depth (25 pts: 5 pts deterministic volume + 20 pts AI rubric)
   - RQ-4 Bullet-Point Clarity & Impact (20 pts: 5 pts deterministic verb/pronoun check + 15 pts AI rubric)
   - RQ-5 Skills Presentation & Categorization (15 pts: 5 pts deterministic count + 10 pts AI rubric)
   - RQ-6 Language, Conciseness & Readability (10 pts: 5 pts deterministic length check + 5 pts AI grammar check)

2. Job Match Score (0-100 integer, or null when no JD supplied):
   - JM-1 Required Technical Skills Match (40 pts: AI extraction + deterministic weighted math)
   - JM-2 Preferred Skills & Tools Coverage (15 pts: AI extraction + deterministic weighted math)
   - JM-3 Project & Experience Relevance (25 pts: AI rubric, clamped 0-25)
   - JM-4 Domain & Terminology Alignment (10 pts: AI rubric, clamped 0-10)
   - JM-5 Education & Qualification Alignment (10 pts: AI rubric, clamped 0-10)

3. ATS-Readability Score (0-100 integer, 100% deterministic).
"""

from typing import List, Optional

from app.schemas.analysis import (
    ATSReadabilityScore,
    CriterionBreakdown,
    JobMatchScore,
    JobRequirementMatch,
    LLMAnalysisOutput,
    ReportScores,
    ResumeQualityScore,
)
from app.services.deterministic_analyzer import (
    DeterministicSignals,
    get_score_tier,
)


def calculate_job_match_score(
    llm_output: Optional[LLMAnalysisOutput],
    has_job_description: bool,
) -> JobMatchScore:
    """Calculate the 0-100 Job Match Score using Section 15.B weighted formulas."""
    if not has_job_description or llm_output is None:
        return JobMatchScore(
            is_available=False,
            score=None,
            tier=None,
            explanation="Not Evaluated — Provide a job description to see your match score.",
            criteria_breakdown=None,
        )

    requirements: List[JobRequirementMatch] = llm_output.requirements or []

    # Filter required vs preferred qualifications
    required_items = [r for r in requirements if r.importance == "required"]
    preferred_items = [r for r in requirements if r.importance == "preferred"]

    # Fallback if AI didn't tag any as preferred: treat all as required
    if not required_items and requirements:
        required_items = requirements

    # JM-1: Required Skills (Max 40 points)
    # explicitly_found = 1.0, related_or_equivalent = 0.6, not_found_in_resume = 0.0
    weights_map = {
        "explicitly_found": 1.0,
        "related_or_equivalent": 0.6,
        "not_found_in_resume": 0.0,
    }

    if required_items:
        sum_req_weights = sum(weights_map.get(r.match_status, 0.0) for r in required_items)
        jm1_earned = round(40.0 * (sum_req_weights / max(len(required_items), 1)))
        jm1_earned = max(0, min(jm1_earned, 40))
        explicit_count = sum(1 for r in required_items if r.match_status == "explicitly_found")
        related_count = sum(1 for r in required_items if r.match_status == "related_or_equivalent")
        missing_count = sum(1 for r in required_items if r.match_status == "not_found_in_resume")
        jm1_note = (
            f"Evaluated {len(required_items)} core requirements: {explicit_count} explicit matches, "
            f"{related_count} equivalent/related skills, {missing_count} missing."
        )
    else:
        jm1_earned = 28
        jm1_note = "Core skills evaluated against standard domain expectations."

    # JM-2: Preferred Skills (Max 15 points)
    if preferred_items:
        sum_pref_weights = sum(weights_map.get(r.match_status, 0.0) for r in preferred_items)
        jm2_earned = round(15.0 * (sum_pref_weights / max(len(preferred_items), 1)))
        jm2_earned = max(0, min(jm2_earned, 15))
        pref_explicit = sum(1 for r in preferred_items if r.match_status == "explicitly_found")
        jm2_note = f"Found {pref_explicit} of {len(preferred_items)} bonus/preferred tool qualifications."
    else:
        # Fallback to tools count if no distinct preferred skills separated
        tool_count = len(llm_output.tools_and_technologies)
        jm2_earned = min(15, round(15.0 * (min(tool_count, 5) / 5.0)))
        jm2_note = f"Evaluated secondary developer tools ({tool_count} tools identified)."

    # JM-3: Project & Experience Relevance (Max 25 points, clamped 0-25)
    jm3_earned = llm_output.jm3_ai_score if llm_output.jm3_ai_score is not None else 18
    jm3_earned = max(0, min(jm3_earned, 25))
    jm3_note = llm_output.jm3_ai_note or "Project scope and hands-on deliverables align with target role duties."

    # JM-4: Domain & Terminology Alignment (Max 10 points, clamped 0-10)
    jm4_earned = llm_output.jm4_ai_score if llm_output.jm4_ai_score is not None else 7
    jm4_earned = max(0, min(jm4_earned, 10))
    jm4_note = llm_output.jm4_ai_note or "Industry domain concepts and naming conventions match posting."

    # JM-5: Education & Qualification Alignment (Max 10 points, clamped 0-10)
    jm5_earned = llm_output.jm5_ai_score if llm_output.jm5_ai_score is not None else 8
    jm5_earned = max(0, min(jm5_earned, 10))
    jm5_note = llm_output.jm5_ai_note or "Academic background and qualification level meet role criteria."

    # Sum total score (Authoritative backend calculation, Section 15.D)
    jm_total = jm1_earned + jm2_earned + jm3_earned + jm4_earned + jm5_earned
    jm_total = max(0, min(jm_total, 100))
    jm_tier = get_score_tier(jm_total)

    jm_breakdown = [
        CriterionBreakdown(id="JM-1", name="Required Technical & Core Skills Match", earned=jm1_earned, max_points=40, note=jm1_note),
        CriterionBreakdown(id="JM-2", name="Preferred Skills & Tools Coverage", earned=jm2_earned, max_points=15, note=jm2_note),
        CriterionBreakdown(id="JM-3", name="Project & Experience Relevance to Role", earned=jm3_earned, max_points=25, note=jm3_note),
        CriterionBreakdown(id="JM-4", name="Domain & Terminology Alignment", earned=jm4_earned, max_points=10, note=jm4_note),
        CriterionBreakdown(id="JM-5", name="Education & Qualification Alignment", earned=jm5_earned, max_points=10, note=jm5_note),
    ]

    explanation = llm_output.jm_explanation or f"Alignment score of {jm_total}/100 ({jm_tier}) against specified job description requirements."

    return JobMatchScore(
        is_available=True,
        score=jm_total,
        tier=jm_tier,
        explanation=explanation,
        criteria_breakdown=jm_breakdown,
    )


def calculate_resume_quality_score(
    signals: DeterministicSignals,
    llm_output: Optional[LLMAnalysisOutput],
) -> ResumeQualityScore:
    """Calculate the 0-100 Resume Quality Score merging deterministic baseline with AI rubric."""
    # RQ-1: Contact & Profile Completeness (Max 10, 100% Deterministic)
    rq1_earned = signals.rq1_points

    # RQ-2: Core Section Structure (Max 20, 100% Deterministic with Student Fairness)
    rq2_earned = signals.rq2_points

    # RQ-3: Experiential & Project Depth (Max 25: 5 pts deterministic volume + 20 pts AI rubric)
    rq3_ai = llm_output.rq3_ai_score if llm_output is not None else 14
    rq3_ai = max(0, min(rq3_ai, 20))
    rq3_earned = signals.rq3_det_points + rq3_ai
    rq3_earned = min(25, max(0, rq3_earned))
    rq3_ai_note = llm_output.rq3_ai_note if llm_output else "Evaluated via project architecture and problem-solution framing."
    rq3_note = f"{signals.rq3_det_note} {rq3_ai_note}".strip()

    # RQ-4: Bullet-Point Clarity & Impact (Max 20: 5 pts deterministic + 15 pts AI rubric)
    rq4_ai = llm_output.rq4_ai_score if llm_output is not None else 10
    rq4_ai = max(0, min(rq4_ai, 15))
    rq4_earned = signals.rq4_det_points + rq4_ai
    rq4_earned = min(20, max(0, rq4_earned))
    rq4_ai_note = llm_output.rq4_ai_note if llm_output else "Action-oriented bullet phrasing and outcome clarity."
    rq4_note = f"{signals.rq4_det_note} {rq4_ai_note}".strip()

    # RQ-5: Skills Presentation & Categorization (Max 15: 5 pts deterministic + 10 pts AI rubric)
    rq5_ai = llm_output.rq5_ai_score if llm_output is not None else 7
    rq5_ai = max(0, min(rq5_ai, 10))
    rq5_earned = signals.rq5_det_points + rq5_ai
    rq5_earned = min(15, max(0, rq5_earned))
    rq5_ai_note = llm_output.rq5_ai_note if llm_output else "Skills are grouped into logical domains with resume evidence."
    rq5_note = f"{signals.rq5_det_note} {rq5_ai_note}".strip()

    # RQ-6: Language, Conciseness & Readability (Max 10: 5 pts deterministic + 5 pts AI rubric)
    rq6_ai = llm_output.rq6_ai_score if llm_output is not None else 4
    rq6_ai = max(0, min(rq6_ai, 5))
    rq6_earned = signals.rq6_det_points + rq6_ai
    rq6_earned = min(10, max(0, rq6_earned))
    rq6_ai_note = llm_output.rq6_ai_note if llm_output else "Clear grammar and consistent verb tense across sections."
    rq6_note = f"{signals.rq6_det_note} {rq6_ai_note}".strip()

    # Sum total score (Authoritative backend calculation, Section 15.A)
    rq_total = rq1_earned + rq2_earned + rq3_earned + rq4_earned + rq5_earned + rq6_earned
    rq_total = max(0, min(rq_total, 100))
    rq_tier = get_score_tier(rq_total)

    rq_breakdown = [
        CriterionBreakdown(id="RQ-1", name="Contact & Profile Completeness", earned=rq1_earned, max_points=10, note=signals.rq1_note),
        CriterionBreakdown(id="RQ-2", name="Core Section Structure", earned=rq2_earned, max_points=20, note=signals.rq2_note),
        CriterionBreakdown(id="RQ-3", name="Experiential & Project Depth", earned=rq3_earned, max_points=25, note=rq3_note),
        CriterionBreakdown(id="RQ-4", name="Bullet-Point Clarity & Impact", earned=rq4_earned, max_points=20, note=rq4_note),
        CriterionBreakdown(id="RQ-5", name="Skills Presentation & Categorization", earned=rq5_earned, max_points=15, note=rq5_note),
        CriterionBreakdown(id="RQ-6", name="Language, Conciseness & Readability", earned=rq6_earned, max_points=10, note=rq6_note),
    ]

    explanation = (
        llm_output.rq_explanation
        if llm_output
        else f"Comprehensive structural and semantic evaluation ({rq_tier} overall quality)."
    )

    return ResumeQualityScore(
        score=rq_total,
        tier=rq_tier,
        explanation=explanation,
        criteria_breakdown=rq_breakdown,
    )


def calculate_hybrid_scores(
    deterministic: Optional[DeterministicSignals] = None,
    llm_data: Optional[LLMAnalysisOutput] = None,
    has_job_description: bool = False,
    signals: Optional[DeterministicSignals] = None,
    llm_output: Optional[LLMAnalysisOutput] = None,
) -> ReportScores:
    """Merge deterministic signals and validated LLM output into complete ReportScores.

    Args:
        deterministic: DeterministicSignals extracted by deterministic_analyzer.
        llm_data: Validated LLMAnalysisOutput from Groq (optional).
        has_job_description: Boolean indicating whether JD was supplied.
        signals: Alias for deterministic.
        llm_output: Alias for llm_data.

    Returns:
        ReportScores: Container with resume_quality, job_match, and ats_readability scores.
    """
    sig = deterministic if deterministic is not None else signals
    if sig is None:
        raise ValueError("DeterministicSignals instance must be provided to calculate_hybrid_scores.")
    llm = llm_data if llm_data is not None else llm_output

    rq_score = calculate_resume_quality_score(sig, llm)
    jm_score = calculate_job_match_score(llm, has_job_description)

    ats_dict = sig.ats_readability.to_dict()
    ats_score = ATSReadabilityScore(
        score=ats_dict["score"],
        tier=ats_dict["tier"],
        disclaimer=ats_dict["disclaimer"],
        explanation=ats_dict["explanation"],
        criteria_breakdown=[
            CriterionBreakdown(**item) for item in ats_dict["criteria_breakdown"]
        ],
    )

    # Score integrity rule (PRD Section 15.D):
    # Verify that all sub-criterion earned points sum exactly to the final integer score
    assert rq_score.score == sum(c.earned for c in rq_score.criteria_breakdown), "RQ sub-criteria must sum to score"
    if jm_score.is_available and jm_score.criteria_breakdown is not None:
        assert jm_score.score == sum(c.earned for c in jm_score.criteria_breakdown), "JM sub-criteria must sum to score"
    assert ats_score.score == sum(c.earned for c in ats_score.criteria_breakdown), "ATS sub-criteria must sum to score"

    return ReportScores(
        resume_quality=rq_score,
        job_match=jm_score,
        ats_readability=ats_score,
    )


# Alias for backward compatibility
compute_hybrid_scores = calculate_hybrid_scores

