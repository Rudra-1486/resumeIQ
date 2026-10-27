"""Pydantic schemas for the AI Bullet-Point Rewriter (PRD Section 18.4).

Defines:
1. BulletRewriteRequest: Strict input validation (15-600 characters, style enum).
2. RewriteVariation: Individual rewritten bullet option.
3. BulletRewriteData: Response payload with anti-hallucination verification notice.
4. BulletRewriteResponse: Standard success envelope.
5. LLMRewriteOutput: Structured parser for raw Groq output.
"""

from typing import List, Literal, Optional
from pydantic import BaseModel, Field, field_validator


class BulletRewriteRequest(BaseModel):
    """Request payload for POST /api/rewrite-bullet (PRD Section 18.4)."""

    original_bullet: str = Field(
        ...,
        min_length=15,
        max_length=600,
        description="The original weak resume bullet point (15 to 600 characters)",
    )
    target_role: Optional[str] = Field(
        default="",
        max_length=100,
        description="Optional target role title (e.g. 'Junior Python Backend Developer')",
    )
    rewrite_style: Literal["action_oriented", "concise", "technical_detail"] = Field(
        default="action_oriented",
        description="Target phrasing tone style",
    )

    @field_validator("original_bullet", mode="before")
    @classmethod
    def strip_bullet(cls, v: str) -> str:
        if isinstance(v, str):
            trimmed = v.strip()
            return trimmed
        return v

    @field_validator("target_role", mode="before")
    @classmethod
    def strip_target_role(cls, v: Optional[str]) -> str:
        if isinstance(v, str):
            return v.strip()
        return ""


class RewriteVariation(BaseModel):
    """A single rewritten bullet suggestion."""

    id: str = Field(..., description="Unique variation ID (e.g. var_1, var_2, var_3)")
    style_label: str = Field(..., description="Descriptive label (e.g. 'Action-Oriented & Impactful')")
    rewritten_text: str = Field(..., description="Improved phrasing preserving factual truth")
    improvements_made: str = Field(..., description="Explanation of what was enhanced")


class BulletRewriteData(BaseModel):
    """Data payload for bullet rewrite response."""

    original_bullet: str
    target_role: Optional[str] = ""
    requested_style: str
    detected_numbers_in_original: List[str] = Field(default_factory=list)
    variations: List[RewriteVariation] = Field(..., min_length=1, max_length=5)
    missing_metrics_hint: Optional[str] = Field(
        default="Your original bullet did not include numbers, so none were invented. If accurate, consider manually adding real metrics.",
    )
    verification_notice: str = Field(
        default="AI-generated suggestions preserve your supplied facts. Always verify that the phrasing accurately reflects your real work before adding it to your resume.",
    )


class BulletRewriteResponse(BaseModel):
    """Standard success envelope for POST /api/rewrite-bullet."""

    status: Literal["success"] = "success"
    data: BulletRewriteData


class LLMRewriteOutput(BaseModel):
    """Schema for validating raw LLM response from Groq during bullet rewriting."""

    variations: List[RewriteVariation] = Field(..., min_length=1)
    missing_metrics_hint: Optional[str] = None
    detected_numbers_in_original: List[str] = Field(default_factory=list)
