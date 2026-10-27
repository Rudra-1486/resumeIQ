"""Dual-layer file validation service for uploaded resumes (PRD Section 3, 18.3, 21.2, & 22).

Enforces:
1. Volatile memory processing only (io.BytesIO / bytes, never written to disk).
2. Filename presence and strict .pdf / .docx extension.
3. Max file size of 5 MB (5,242,880 bytes).
4. Binary magic-byte signature verification (%PDF- or PK\\x03\\x04 with word/document.xml).
"""

import io
import os
import zipfile
from typing import Tuple
from fastapi import UploadFile

from app.config import MAX_FILE_SIZE_BYTES
from app.utils.exceptions import (
    EmptyDocumentError,
    FileTooLargeError,
    InvalidFileSignatureError,
    InvalidFileTypeError,
)

PDF_MAGIC_BYTES = b"%PDF-"
DOCX_MAGIC_BYTES = b"PK\x03\x04"
DOCX_ENTRY_MEMBER = "word/document.xml"
ALLOWED_EXTENSIONS = {".pdf", ".docx"}


def validate_resume_upload(file_bytes: bytes, filename: str) -> str:
    """Validate file bytes and filename purely in memory.

    Args:
        file_bytes: Raw binary content of the file.
        filename: Uploaded filename.

    Returns:
        str: Detected and verified file format ("pdf" or "docx").

    Raises:
        InvalidFileTypeError: If extension is not .pdf or .docx.
        EmptyDocumentError: If file_bytes is 0 bytes.
        FileTooLargeError: If file_bytes exceeds 5 MB.
        InvalidFileSignatureError: If magic bytes or internal format do not match extension.
    """
    if not filename or not isinstance(filename, str):
        raise InvalidFileTypeError("Unsupported file format. Please upload a .pdf or .docx file.")

    _, ext = os.path.splitext(filename)
    ext_lower = ext.lower().strip()

    if ext_lower not in ALLOWED_EXTENSIONS:
        raise InvalidFileTypeError("Unsupported file format. Please upload a .pdf or .docx file.")

    if len(file_bytes) == 0:
        raise EmptyDocumentError("The selected document appears to be empty. Please upload a resume containing readable text.")

    if len(file_bytes) > MAX_FILE_SIZE_BYTES:
        raise FileTooLargeError(
            f"File size exceeds the 5 MB limit (got {len(file_bytes)} bytes). Please upload a smaller PDF or DOCX file.",
            details={"file_size_bytes": len(file_bytes), "max_allowed_bytes": MAX_FILE_SIZE_BYTES},
        )

    if ext_lower == ".pdf":
        if not file_bytes.startswith(PDF_MAGIC_BYTES):
            raise InvalidFileSignatureError(
                "The uploaded file does not appear to be a valid PDF or Word document.",
                details={"expected_format": "pdf", "magic_bytes_found": file_bytes[:8].hex()},
            )
        return "pdf"

    # Must be .docx
    if not file_bytes.startswith(DOCX_MAGIC_BYTES):
        raise InvalidFileSignatureError(
            "The uploaded file does not appear to be a valid PDF or Word document.",
            details={"expected_format": "docx", "magic_bytes_found": file_bytes[:8].hex()},
        )

    try:
        with zipfile.ZipFile(io.BytesIO(file_bytes)) as zf:
            namelist = zf.namelist()
            if DOCX_ENTRY_MEMBER not in namelist:
                raise InvalidFileSignatureError(
                    "The uploaded file does not appear to be a valid PDF or Word document.",
                    details={"expected_format": "docx", "reason": "missing word/document.xml entry in archive"},
                )
    except (zipfile.BadZipFile, zipfile.LargeZipFile) as exc:
        raise InvalidFileSignatureError(
            "The uploaded file does not appear to be a valid PDF or Word document.",
            details={"expected_format": "docx", "reason": f"invalid zip container: {str(exc)}"},
        ) from exc

    return "docx"


# Alias for backward compatibility and alternate naming
validate_file_content = validate_resume_upload



async def validate_resume_file(file: UploadFile) -> Tuple[bytes, str, str]:
    """Asynchronously read and validate an incoming UploadFile stream without disk I/O.

    Args:
        file: UploadFile from FastAPI request.

    Returns:
        Tuple[bytes, str, str]: (file_bytes, filename, file_type)
    """
    if not file or not file.filename:
        raise InvalidFileTypeError("Please select a PDF or DOCX resume file to analyze.")

    filename = file.filename
    _, ext = os.path.splitext(filename)
    if ext.lower().strip() not in ALLOWED_EXTENSIONS:
        raise InvalidFileTypeError("Unsupported file format. Please upload a .pdf or .docx file.")

    # Read stream incrementally to enforce 5 MB cap before consuming unbounded memory
    content = bytearray()
    chunk_size = 64 * 1024  # 64 KB chunks

    while True:
        chunk = await file.read(chunk_size)
        if not chunk:
            break
        content.extend(chunk)
        if len(content) > MAX_FILE_SIZE_BYTES:
            raise FileTooLargeError(
                "File size exceeds the 5 MB limit. Please upload a smaller PDF or DOCX file.",
                details={"max_allowed_bytes": MAX_FILE_SIZE_BYTES},
            )

    file_bytes = bytes(content)
    file_type = validate_file_content(file_bytes, filename)
    return file_bytes, filename, file_type
