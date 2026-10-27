"""Custom domain exceptions mapped to clean HTTP status codes (PRD Section 18.1 & Section 22)."""

from typing import Any, Dict, Optional


class ResumeIQBaseException(Exception):
    """Base exception for all application-specific errors."""

    def __init__(
        self,
        code: str,
        message: str,
        status_code: int = 400,
        details: Optional[Dict[str, Any]] = None,
    ):
        super().__init__(message)
        self.code = code
        self.message = message
        self.status_code = status_code
        self.details = details or {}


class InvalidFileTypeError(ResumeIQBaseException):
    """Raised when an uploaded file does not have a .pdf or .docx extension."""

    def __init__(
        self,
        message: str = "Unsupported file format. Please upload a .pdf or .docx file.",
        details: Optional[Dict[str, Any]] = None,
    ):
        super().__init__(
            code="INVALID_FILE_TYPE",
            message=message,
            status_code=400,
            details=details,
        )


class InvalidFileSignatureError(ResumeIQBaseException):
    """Raised when file extension does not match binary magic-byte signature."""

    def __init__(
        self,
        message: str = "The uploaded file does not appear to be a valid PDF or Word document.",
        details: Optional[Dict[str, Any]] = None,
    ):
        super().__init__(
            code="INVALID_FILE_SIGNATURE",
            message=message,
            status_code=400,
            details=details,
        )


class InvalidInputError(ResumeIQBaseException):
    """Raised when request input parameters are invalid or out of allowed bounds."""

    def __init__(
        self,
        message: str = "Invalid request input parameters.",
        code: str = "INVALID_INPUT",
        status_code: int = 400,
        details: Optional[Dict[str, Any]] = None,
    ):
        super().__init__(
            code=code,
            message=message,
            status_code=status_code,
            details=details,
        )


class FileTooLargeError(ResumeIQBaseException):
    """Raised when an upload exceeds the 5 MB file size limit."""

    def __init__(
        self,
        message: str = "File size exceeds the 5 MB limit. Please upload a smaller PDF or DOCX file.",
        details: Optional[Dict[str, Any]] = None,
    ):
        super().__init__(
            code="FILE_TOO_LARGE",
            message=message,
            status_code=413,
            details=details,
        )


class CorruptedDocumentError(ResumeIQBaseException):
    """Raised when a PDF or DOCX archive cannot be parsed or is password-protected."""

    def __init__(
        self,
        message: str = "This document appears to be corrupted or password-protected and could not be opened.",
        code: str = "CORRUPTED_DOCUMENT",
        details: Optional[Dict[str, Any]] = None,
    ):
        super().__init__(
            code=code,
            message=message,
            status_code=422,
            details=details,
        )


class EmptyDocumentError(ResumeIQBaseException):
    """Raised when an uploaded document contains zero extractable characters or bytes."""

    def __init__(
        self,
        message: str = "The selected document appears to be empty. Please upload a resume containing readable text.",
        details: Optional[Dict[str, Any]] = None,
    ):
        super().__init__(
            code="EMPTY_DOCUMENT",
            message=message,
            status_code=422,
            details=details,
        )


class UnreadableOrScannedDocumentError(ResumeIQBaseException):
    """Raised when an uploaded PDF yields fewer than 50 extractable words (scanned image)."""

    def __init__(
        self,
        extracted_word_count: int,
        minimum_required_words: int = 50,
        message: Optional[str] = None,
    ):
        msg = (
            message
            or f"We could not extract enough readable text from this PDF (found only {extracted_word_count} words). "
            f"Scanned image PDFs and OCR are not supported in the MVP. Please upload a text-based PDF or DOCX file."
        )
        super().__init__(
            code="UNREADABLE_OR_SCANNED_DOCUMENT",
            message=msg,
            status_code=422,
            details={
                "extracted_word_count": extracted_word_count,
                "minimum_required_words": minimum_required_words,
            },
        )


class JDTooShortError(InvalidInputError):
    """Raised when job description text is between 1 and 49 characters."""

    def __init__(
        self,
        character_count: int,
        message: str = "Please enter at least 50 characters for the job description, or leave it blank for a general resume analysis.",
    ):
        super().__init__(
            code="JD_TOO_SHORT",
            message=message,
            status_code=400,
            details={"character_count": character_count, "minimum_required": 50},
        )


class AIConfigurationError(ResumeIQBaseException):
    """Raised when the GROQ_API_KEY is missing or invalid."""

    def __init__(
        self,
        message: str = "The server's AI service configuration is missing or invalid. Please check the backend .env configuration.",
    ):
        super().__init__(
            code="AI_CONFIGURATION_ERROR",
            message=message,
            status_code=500,
        )


class AIServiceError(ResumeIQBaseException):
    """Base exception for upstream AI service failures."""

    def __init__(
        self,
        message: str = "The AI analysis service is temporarily unavailable. Please try again.",
        code: str = "AI_SERVICE_UNAVAILABLE",
        status_code: int = 502,
        details: Optional[Dict[str, Any]] = None,
    ):
        super().__init__(
            code=code,
            message=message,
            status_code=status_code,
            details=details,
        )


class AIRateLimitError(AIServiceError):
    """Raised when upstream Groq API returns HTTP 429."""

    def __init__(
        self,
        message: str = "The AI analysis service is temporarily busy due to rate limits. Please wait 30 seconds and click Retry.",
    ):
        super().__init__(
            code="AI_RATE_LIMIT",
            message=message,
            status_code=429,
        )


class AIServiceTimeoutError(AIServiceError):
    """Raised when Groq API call exceeds timeout limit."""

    def __init__(
        self,
        message: str = "The AI analysis request timed out. Your file and job description have been kept—please click Retry Analysis.",
    ):
        super().__init__(
            code="AI_SERVICE_TIMEOUT",
            message=message,
            status_code=504,
        )


# Alias for AIServiceTimeoutError
AITimeoutError = AIServiceTimeoutError


class AIServiceUnavailableError(AIServiceError):
    """Raised when Groq API is unavailable or returns 5xx."""

    def __init__(
        self,
        message: str = "The AI service is currently unavailable. Please try again in a few moments.",
    ):
        super().__init__(
            code="AI_SERVICE_UNAVAILABLE",
            message=message,
            status_code=502,
        )


class AIResponseInvalidError(AIServiceError):
    """Raised when Groq LLM returns unparseable or schema-mismatched JSON after retry."""

    def __init__(
        self,
        message: str = "We received an incomplete analysis format from the AI service. Please click Retry to generate a fresh report.",
    ):
        super().__init__(
            code="AI_RESPONSE_INVALID",
            message=message,
            status_code=502,
        )
