"""Pydantic schemas for Resume Analysis, LLM validation, and API responses.

PRD References:
- Section 14: AI Analysis Workflow
- Section 15: Scoring Methodology (Integer scores, clamps, rubric breakdowns)
- Section 18.3: Endpoint 2: Analyze Resume (POST /api/analyze request & response)
"""

from typing import Any, Dict, List, Literal, Optional, Union
from pydantic import BaseModel, Field, field_validator


# --- Sub-Models for Scores and Criteria Breakdowns ---


class CriterionBreakdown(BaseModel):
    """Sub-criterion item in the transparent score breakdown (Section 15 & 18.3)."""

    id: str = Field(..., description="Criterion identifier (e.g. RQ-1, JM-1, ATS-1)")
    name: str = Field(..., description="Human-readable criterion title")
    earned: int = Field(..., description="Points awarded (clamped integer)")
    max_points: int = Field(..., description="Maximum possible points for this criterion")
    note: str = Field(..., description="Specific explanatory evaluation rationale")


class ResumeQualityScore(BaseModel):
    """Resume Quality Score (0-100 integer) with 6-part rubric breakdown."""

    score: int = Field(..., ge=0, le=100, description="Authoritative 0-100 whole integer score")
    tier: Literal["Excellent", "Strong", "Fair", "Needs Work"] = Field(
        ..., description="Score tier according to Section 15.D"
    )
    explanation: str = Field(..., description="Executive summary explanation of the quality score")
    criteria_breakdown: List[CriterionBreakdown] = Field(
        ..., description="6 sub-criteria: RQ-1 through RQ-6"
    )


class JobMatchScore(BaseModel):
    """Job Match Score (0-100 integer or null when JD is omitted)."""

    is_available: bool = Field(..., description="True if a valid job description (>= 50 chars) was evaluated")
    score: Optional[int] = Field(
        default=None,
        ge=0,
        le=100,
        description="Authoritative 0-100 whole integer score; null when is_available is false",
    )
    tier: Optional[Literal["Excellent", "Strong", "Fair", "Needs Work"]] = Field(
        default=None,
        description="Score tier according to Section 15.D; null when is_available is false",
    )
    explanation: Optional[str] = Field(
        default=None,
        description="Summary explanation of candidate alignment with target job requirements",
    )
    criteria_breakdown: Optional[List[CriterionBreakdown]] = Field(
        default=None,
        description="5 sub-criteria: JM-1 through JM-5; null when is_available is false",
    )


class ATSReadabilityScore(BaseModel):
    """ATS-Readability Score (100% deterministic 0-100 integer)."""

    score: int = Field(..., ge=0, le=100, description="100% deterministic 0-100 whole integer score")
    tier: Literal["Excellent", "Strong", "Fair", "Needs Work"] = Field(
        ..., description="Score tier according to Section 15.D"
    )
    disclaimer: str = Field(
        default="General text-extraction and structural readability heuristic. Not an official commercial ATS score.",
        description="Mandatory disclaimer distinguishing heuristic readability from commercial ATS algorithms",
    )
    explanation: str = Field(..., description="Summary explanation of extractability and formatting results")
    criteria_breakdown: List[CriterionBreakdown] = Field(
        ..., description="5 sub-criteria: ATS-1 through ATS-5"
    )


class ReportScores(BaseModel):
    """Three core heuristic scores container."""

    resume_quality: ResumeQualityScore
    job_match: JobMatchScore
    ats_readability: ATSReadabilityScore


# --- Sub-Models for Skills Analysis ---


class ExtractedSkill(BaseModel):
    """Individual skill item extracted from the resume."""

    name: str = Field(..., description="Standardized name of the technical or soft skill")
    source_section: str = Field(..., description="Resume section where evidence was identified")
    evidence: str = Field(..., description="Direct quote or contextual excerpt from resume text")
    confidence: Literal["high", "medium", "low"] = Field(
        default="high", description="Extraction confidence level"
    )


class SkillsAnalysis(BaseModel):
    """Categorized skills matrix (PRD Section 18.3)."""

    technical_skills: List[ExtractedSkill] = Field(default_factory=list)
    tools_and_technologies: List[ExtractedSkill] = Field(default_factory=list)
    soft_skills: List[ExtractedSkill] = Field(default_factory=list)


# --- Sub-Models for Job Match Details ---


class JobRequirementMatch(BaseModel):
    """Comparison item between a JD requirement and the resume."""

    requirement_name: str = Field(..., description="Required skill, technology, or qualification")
    importance: Literal["required", "preferred"] = Field(
        default="required", description="Whether skill is required or preferred"
    )
    match_status: Literal["explicitly_found", "related_or_equivalent", "not_found_in_resume"] = Field(
        ..., description="Match category (weight 1.0, 0.6, or 0.0)"
    )
    resume_evidence: str = Field(
        ..., description="Direct text evidence from resume or explanation of gap"
    )


class JobMatchDetails(BaseModel):
    """Detailed job requirement alignment list."""

    requirements: List[JobRequirementMatch] = Field(default_factory=list)


# --- Sub-Models for Feedback and Recommendations ---


class FeedbackItem(BaseModel):
    """Key strength or improvement area."""

    title: str = Field(..., description="Brief headline summary")
    description: str = Field(..., description="Actionable explanation with context")


class RecommendationItem(BaseModel):
    """Prioritized improvement recommendation."""

    id: str = Field(..., description="Unique recommendation ID (e.g. rec_1)")
    priority: Literal["high", "medium", "low"] = Field(..., description="Priority level")
    category: Literal["keywords", "formatting", "content", "experience", "skills", "general"] = Field(
        default="general", description="Category of improvement"
    )
    title: str = Field(..., description="Short title")
    rationale: str = Field(..., description="Why this edit matters")
    action_steps: str = Field(..., description="Concrete, step-by-step instructions")


class WeakBulletItem(BaseModel):
    """Identified weak bullet point for targeted rewriting."""

    original_text: str = Field(..., description="Original weak bullet point from the resume")
    section: str = Field(..., description="Section where the bullet appears")
    issue: str = Field(..., description="Reason for identification (e.g. task-oriented, missing metrics)")


# --- Report Metadata & Full Response Envelope ---


class ReportMetadata(BaseModel):
    """Report metadata container (Section 18.3)."""

    resume_filename: str
    file_type: Literal["pdf", "docx"]
    file_size_bytes: int
    extracted_word_count: int
    page_count: int
    text_truncated: bool
    target_role: Optional[str] = ""
    has_job_description: bool
    candidate_profile_type: Literal["student_or_fresh_graduate", "experienced"]
    ai_model_used: str = "llama-3.3-70b-versatile"


class AnalysisReportData(BaseModel):
    """Complete data payload for POST /api/analyze."""

    report_id: str
    created_at: str
    metadata: ReportMetadata
    executive_summary: str
    scores: ReportScores
    skills_analysis: SkillsAnalysis
    job_match_details: Optional[JobMatchDetails] = None
    strengths: List[FeedbackItem] = Field(default_factory=list)
    improvement_areas: List[FeedbackItem] = Field(default_factory=list)
    recommendations: List[RecommendationItem] = Field(default_factory=list)
    weak_bullets: List[WeakBulletItem] = Field(default_factory=list)


class AnalysisReportResponse(BaseModel):
    """Standard success envelope for POST /api/analyze."""

    status: Literal["success"] = "success"
    data: AnalysisReportData


# --- Raw LLM Output Validation Schemas with Sub-score Clamping ---


class LLMAnalysisOutput(BaseModel):
    """Schema for validating and strictly clamping raw JSON generated by Groq LLM.

    Sub-score limits enforced by validators:
    - RQ-3 AI part: 0..20
    - RQ-4 AI part: 0..15
    - RQ-5 AI part: 0..10
    - RQ-6 AI part: 0..5
    - JM-3 AI part: 0..25
    - JM-4 AI part: 0..10
    - JM-5 AI part: 0..10
    """

    executive_summary: str = Field(..., description="High-level 2-3 sentence overview")

    # RQ AI Rubrics
    rq3_ai_score: int = Field(default=15, description="Experiential depth AI score (0-20)")
    rq3_ai_note: str = Field(default="", description="Experiential depth rationale")

    rq4_ai_score: int = Field(default=12, description="Bullet clarity AI score (0-15)")
    rq4_ai_note: str = Field(default="", description="Bullet clarity rationale")

    rq5_ai_score: int = Field(default=8, description="Skills categorization AI score (0-10)")
    rq5_ai_note: str = Field(default="", description="Skills categorization rationale")

    rq6_ai_score: int = Field(default=4, description="Language & grammar AI score (0-5)")
    rq6_ai_note: str = Field(default="", description="Language & grammar rationale")

    rq_explanation: str = Field(default="Evaluated resume completeness and technical clarity.")

    # JM AI Rubrics (optional, only populated if JD was supplied)
    requirements: List[JobRequirementMatch] = Field(default_factory=list)
    jm3_ai_score: Optional[int] = Field(default=None, description="Relevance to role (0-25)")
    jm3_ai_note: Optional[str] = Field(default=None)

    jm4_ai_score: Optional[int] = Field(default=None, description="Domain terminology (0-10)")
    jm4_ai_note: Optional[str] = Field(default=None)

    jm5_ai_score: Optional[int] = Field(default=None, description="Education alignment (0-10)")
    jm5_ai_note: Optional[str] = Field(default=None)

    jm_explanation: Optional[str] = Field(default=None)

    # Skills matrix
    technical_skills: List[ExtractedSkill] = Field(default_factory=list)
    tools_and_technologies: List[ExtractedSkill] = Field(default_factory=list)
    soft_skills: List[ExtractedSkill] = Field(default_factory=list)

    # Actionable guidance
    strengths: List[FeedbackItem] = Field(default_factory=list)
    improvement_areas: List[FeedbackItem] = Field(default_factory=list)
    recommendations: List[RecommendationItem] = Field(default_factory=list)
    weak_bullets: List[WeakBulletItem] = Field(default_factory=list)

    @field_validator("rq3_ai_score", mode="before")
    @classmethod
    def clamp_rq3(cls, v: Any) -> int:
        try:
            val = int(v)
            return max(0, min(val, 20))
        except (ValueError, TypeError):
            return 12

    @field_validator("rq4_ai_score", mode="before")
    @classmethod
    def clamp_rq4(cls, v: Any) -> int:
        try:
            val = int(v)
            return max(0, min(val, 15))
        except (ValueError, TypeError):
            return 10

    @field_validator("rq5_ai_score", mode="before")
    @classmethod
    def clamp_rq5(cls, v: Any) -> int:
        try:
            val = int(v)
            return max(0, min(val, 10))
        except (ValueError, TypeError):
            return 7

    @field_validator("rq6_ai_score", mode="before")
    @classmethod
    def clamp_rq6(cls, v: Any) -> int:
        try:
            val = int(v)
            return max(0, min(val, 5))
        except (ValueError, TypeError):
            return 4

    @field_validator("jm3_ai_score", mode="before")
    @classmethod
    def clamp_jm3(cls, v: Any) -> Optional[int]:
        if v is None:
            return None
        try:
            val = int(v)
            return max(0, min(val, 25))
        except (ValueError, TypeError):
            return 15

    @field_validator("jm4_ai_score", mode="before")
    @classmethod
    def clamp_jm4(cls, v: Any) -> Optional[int]:
        if v is None:
            return None
        try:
            val = int(v)
            return max(0, min(val, 10))
        except (ValueError, TypeError):
            return 6

    @field_validator("jm5_ai_score", mode="before")
    @classmethod
    def clamp_jm5(cls, v: Any) -> Optional[int]:
        if v is None:
            return None
        try:
            val = int(v)
            return max(0, min(val, 10))
        except (ValueError, TypeError):
            return 7
