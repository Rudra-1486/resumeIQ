"""Common Pydantic schemas for Error Envelopes and System Health (PRD Sections 18.1 & 18.2)."""

from datetime import datetime, timezone
from typing import Any, Dict, Literal, Optional
from pydantic import BaseModel, Field


class ErrorDetails(BaseModel):
    """Standardized inner error details payload matching Section 18.1."""

    code: str = Field(
        ...,
        description="Machine-readable error code (e.g. UNREADABLE_OR_SCANNED_DOCUMENT, INVALID_FILE_TYPE)",
    )
    message: str = Field(
        ...,
        description="Clear, actionable, user-facing error explanation",
    )
    details: Optional[Dict[str, Any]] = Field(
        default=None,
        description="Optional diagnostic metadata such as word count or file size limits",
    )


class ErrorResponse(BaseModel):
    """Global error response envelope returned by all endpoints (Section 18.1)."""

    status: Literal["error"] = "error"
    error: ErrorDetails


class HealthResponse(BaseModel):
    """Health check response payload contract matching Section 18.2."""

    status: Literal["ok"] = "ok"
    service: str = "ResumeIQ AI Backend"
    version: str = "1.0.0"
    ai_provider: str = "groq"
    model: str = "llama-3.3-70b-versatile"
    groq_key_configured: bool = Field(
        ...,
        description="Boolean indicating whether a non-empty GROQ_API_KEY is configured",
    )
    timestamp: str = Field(
        default_factory=lambda: datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"),
        description="Current UTC timestamp in ISO 8601 format",
    )
