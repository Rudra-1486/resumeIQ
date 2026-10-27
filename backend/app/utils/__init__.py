"""Utilities package for ResumeIQ AI."""

from app.utils.exceptions import (
    AIConfigurationError,
    AIRateLimitError,
    AIResponseInvalidError,
    AIServiceError,
    AIServiceTimeoutError,
    AIServiceUnavailableError,
    AITimeoutError,
    CorruptedDocumentError,
    EmptyDocumentError,
    FileTooLargeError,
    InvalidFileSignatureError,
    InvalidFileTypeError,
    InvalidInputError,
    JDTooShortError,
    ResumeIQBaseException,
    UnreadableOrScannedDocumentError,
)

__all__ = [
    "ResumeIQBaseException",
    "InvalidFileTypeError",
    "InvalidFileSignatureError",
    "InvalidInputError",
    "FileTooLargeError",
    "CorruptedDocumentError",
    "EmptyDocumentError",
    "UnreadableOrScannedDocumentError",
    "JDTooShortError",
    "AIConfigurationError",
    "AIServiceError",
    "AIRateLimitError",
    "AIServiceTimeoutError",
    "AITimeoutError",
    "AIServiceUnavailableError",
    "AIResponseInvalidError",
]
