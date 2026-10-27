"""Unit tests for dual-layer file validator (PRD Section 3, 18.3, 21.2, & 22)."""

import io
import zipfile
import pytest
from app.config import MAX_FILE_SIZE_BYTES
from app.services.file_validator import validate_file_content, validate_resume_upload
from app.utils.exceptions import (
    EmptyDocumentError,
    FileTooLargeError,
    InvalidFileSignatureError,
    InvalidFileTypeError,
)


def create_dummy_docx_bytes() -> bytes:
    """Generate in-memory valid DOCX zip bytes containing word/document.xml."""
    buf = io.BytesIO()
    with zipfile.ZipFile(buf, "w", zipfile.ZIP_DEFLATED) as zf:
        zf.writestr("[Content_Types].xml", '<?xml version="1.0" encoding="UTF-8"?><Types/>')
        zf.writestr("word/document.xml", '<?xml version="1.0" encoding="UTF-8"?><w:document/>')
    return buf.getvalue()


def test_valid_pdf_content():
    """Valid PDF header returns 'pdf' for both function names."""
    pdf_bytes = b"%PDF-1.4\n%some binary data\n%%EOF"
    assert validate_resume_upload(pdf_bytes, "resume.pdf") == "pdf"
    assert validate_file_content(pdf_bytes, "Aarav_Sharma_Resume.PDF") == "pdf"


def test_valid_docx_content():
    """Valid DOCX archive returns 'docx' for both function names."""
    docx_bytes = create_dummy_docx_bytes()
    assert validate_resume_upload(docx_bytes, "resume.docx") == "docx"
    assert validate_file_content(docx_bytes, "resume_final.Docx") == "docx"


def test_unsupported_file_extension():
    """Files with extensions other than .pdf or .docx are rejected with 400 INVALID_FILE_TYPE."""
    with pytest.raises(InvalidFileTypeError) as exc_info:
        validate_resume_upload(b"%PDF-fake", "resume.txt")
    assert exc_info.value.code == "INVALID_FILE_TYPE"

    with pytest.raises(InvalidFileTypeError) as exc_info:
        validate_resume_upload(b"%PDF-fake", "resume.png")
    assert exc_info.value.code == "INVALID_FILE_TYPE"

    with pytest.raises(InvalidFileTypeError) as exc_info:
        validate_resume_upload(b"%PDF-fake", "resume.odt")
    assert exc_info.value.code == "INVALID_FILE_TYPE"

    with pytest.raises(InvalidFileTypeError):
        validate_resume_upload(b"%PDF-fake", "")


def test_empty_file_rejection():
    """0-byte files raise EmptyDocumentError."""
    with pytest.raises(EmptyDocumentError) as exc_info:
        validate_resume_upload(b"", "resume.pdf")
    assert exc_info.value.code == "EMPTY_DOCUMENT"
    assert exc_info.value.status_code == 422


def test_file_size_boundary_enforcement():
    """Files exactly at 5 MB (5,242,880 bytes) pass; 5 MB + 1 byte raises FileTooLargeError."""
    # Exactly 5 MB (5,242,880 bytes) with PDF header
    exact_5mb_bytes = b"%PDF-" + b"0" * (MAX_FILE_SIZE_BYTES - 5)
    assert len(exact_5mb_bytes) == MAX_FILE_SIZE_BYTES
    assert validate_resume_upload(exact_5mb_bytes, "max_valid.pdf") == "pdf"

    # 5 MB + 1 byte
    oversized_bytes = b"%PDF-" + b"0" * (MAX_FILE_SIZE_BYTES - 4)
    assert len(oversized_bytes) == MAX_FILE_SIZE_BYTES + 1
    with pytest.raises(FileTooLargeError) as exc_info:
        validate_resume_upload(oversized_bytes, "oversized.pdf")
    assert exc_info.value.code == "FILE_TOO_LARGE"
    assert exc_info.value.status_code == 413


def test_disguised_text_file_as_pdf():
    """A .txt file renamed to .pdf lacking %PDF- signature raises InvalidFileSignatureError."""
    fake_pdf_bytes = b"Hello world, I am just a plain text file pretending to be a PDF."
    with pytest.raises(InvalidFileSignatureError) as exc_info:
        validate_resume_upload(fake_pdf_bytes, "malicious.pdf")
    assert exc_info.value.code == "INVALID_FILE_SIGNATURE"
    assert exc_info.value.status_code == 400


def test_disguised_text_file_as_docx():
    """A text file renamed to .docx lacking PK signature raises InvalidFileSignatureError."""
    fake_docx_bytes = b"Plain text file pretending to be a Word document."
    with pytest.raises(InvalidFileSignatureError) as exc_info:
        validate_resume_upload(fake_docx_bytes, "malicious.docx")
    assert exc_info.value.code == "INVALID_FILE_SIGNATURE"
    assert exc_info.value.status_code == 400


def test_invalid_zip_archive_as_docx():
    """A file starting with PK magic bytes but missing word/document.xml raises InvalidFileSignatureError."""
    buf = io.BytesIO()
    with zipfile.ZipFile(buf, "w", zipfile.ZIP_DEFLATED) as zf:
        zf.writestr("test.txt", "hello")
    broken_zip = buf.getvalue()

    with pytest.raises(InvalidFileSignatureError) as exc_info:
        validate_resume_upload(broken_zip, "fake.docx")
    assert exc_info.value.code == "INVALID_FILE_SIGNATURE"
    assert exc_info.value.status_code == 400
