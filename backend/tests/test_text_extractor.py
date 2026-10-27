"""Unit tests for in-memory text extractor (PRD Section 3, 14, 18.3, 21.2, & 22)."""

import io
import pytest
try:
    import pymupdf as fitz
except ImportError:
    import fitz
import docx

from app.services.text_extractor import (
    extract_document_text,
    extract_text_from_bytes,
    extract_text_from_docx,
    extract_text_from_pdf,
    normalize_whitespace,
)
from app.utils.exceptions import (
    CorruptedDocumentError,
    EmptyDocumentError,
    UnreadableOrScannedDocumentError,
)

SAMPLE_RESUME_TEXT = """
Aarav Sharma
aarav.sharma@example.com | +91 9876543210 | github.com/aaravsharma

EDUCATION
Bachelor of Computer Applications (BCA) - XYZ College, 2026
CGPA: 8.9 / 10.0

TECHNICAL SKILLS
Languages: Python, Java, JavaScript, SQL
Frameworks & Tools: FastAPI, React, Node.js, Git, Docker, Postman

ACADEMIC PROJECTS
1. Campus Library Management System
- Developed RESTful API backend using Python, FastAPI, and PostgreSQL.
- Implemented JWT authentication and role-based access control for students and librarians.
- Designed relational database schema and wrote automated integration tests with Pytest.
- Optimized query execution times by 35% through indexing frequently searched columns.

2. Student Portfolio & Event Tracker
- Built full-stack web application using React, Vite, and Tailwind CSS.
- Integrated external weather API and event calendar syncing for campus activities.
- Deployed application on Vercel with continuous integration workflows.
"""


def create_in_memory_pdf(text: str, num_pages: int = 1) -> bytes:
    """Helper to generate a valid PDF byte string in volatile memory."""
    doc = fitz.open()
    for _ in range(num_pages):
        page = doc.new_page()
        page.insert_text((50, 50), text)
    pdf_bytes = doc.write()
    doc.close()
    return pdf_bytes


def create_in_memory_docx(paragraphs: list, table_rows: list = None) -> bytes:
    """Helper to generate a valid DOCX byte string in volatile memory."""
    doc = docx.Document()
    for p in paragraphs:
        doc.add_paragraph(p)
    if table_rows:
        table = doc.add_table(rows=len(table_rows), cols=len(table_rows[0]))
        for r_idx, row in enumerate(table_rows):
            for c_idx, val in enumerate(row):
                table.rows[r_idx].cells[c_idx].text = val
    buf = io.BytesIO()
    doc.save(buf)
    return buf.getvalue()


def test_pdf_extraction_success():
    """Verify clean in-memory extraction from a text-based PDF using extract_text_from_bytes."""
    pdf_bytes = create_in_memory_pdf(SAMPLE_RESUME_TEXT)
    doc = extract_text_from_bytes(pdf_bytes, "pdf")

    assert doc.file_type == "pdf"
    assert doc.word_count >= 50
    assert "Aarav Sharma" in doc.text
    assert "FastAPI" in doc.text
    assert doc.page_count == 1
    assert not doc.text_truncated


def test_docx_extraction_with_tables_and_deduplication():
    """Verify DOCX extraction captures paragraphs and deduplicates merged table cells."""
    paragraphs = [
        "Aarav Sharma",
        "EDUCATION: Bachelor of Computer Applications",
        "SKILLS: Python, FastAPI, React, Docker, SQL, Git",
    ]
    # Simulate a table with merged cells where adjacent text is identical
    table_rows = [
        ["Project Name", "Technologies", "Technologies"],  # Duplicate adjacent cells from merged header
        ["Library System", "FastAPI, PostgreSQL", "FastAPI, PostgreSQL"],
    ]
    # Add enough text to meet the 50-word minimum
    long_desc = "Developed backend APIs using Python and FastAPI for college portal management. " * 5
    paragraphs.append(long_desc)

    docx_bytes = create_in_memory_docx(paragraphs, table_rows)
    doc = extract_text_from_bytes(docx_bytes, "docx")

    assert doc.file_type == "docx"
    assert doc.word_count >= 50
    assert "Library System" in doc.text
    # Ensure duplicate adjacent strings in table row were deduplicated
    assert "Technologies | Technologies" not in doc.text


def test_scanned_pdf_rejection_under_50_words():
    """PDFs with fewer than 50 words trigger UnreadableOrScannedDocumentError (HTTP 422)."""
    short_text = "This document only has a few words on it."
    pdf_bytes = create_in_memory_pdf(short_text)

    with pytest.raises(UnreadableOrScannedDocumentError) as exc_info:
        extract_text_from_bytes(pdf_bytes, "pdf")

    assert exc_info.value.code == "UNREADABLE_OR_SCANNED_DOCUMENT"
    assert exc_info.value.status_code == 422
    assert exc_info.value.details["extracted_word_count"] < 50
    assert exc_info.value.details["minimum_required_words"] == 50


def test_scanned_pdf_rejection_under_250_non_whitespace_chars():
    """Documents with < 250 non-whitespace chars trigger UnreadableOrScannedDocumentError."""
    # 55 single-letter words = 55 words, but only 55 non-whitespace chars (< 250)
    sparse_words = "a b c d e f g h i j k l m n o p q r s t u v w x y z " * 3
    pdf_bytes = create_in_memory_pdf(sparse_words)

    with pytest.raises(UnreadableOrScannedDocumentError) as exc_info:
        extract_text_from_bytes(pdf_bytes, "pdf")

    assert exc_info.value.code == "UNREADABLE_OR_SCANNED_DOCUMENT"
    assert exc_info.value.status_code == 422


def test_empty_pdf_rejection():
    """PDF with zero extractable characters raises EmptyDocumentError."""
    doc = fitz.open()
    doc.new_page()  # Blank page
    pdf_bytes = doc.write()
    doc.close()

    with pytest.raises(EmptyDocumentError) as exc_info:
        extract_text_from_bytes(pdf_bytes, "pdf")

    assert exc_info.value.code == "EMPTY_DOCUMENT"
    assert exc_info.value.status_code == 422


def test_corrupted_pdf_rejection():
    """Garbage binary stream raises CorruptedDocumentError."""
    garbage_bytes = b"%PDF-1.4\nCorrupted binary payload that fitz cannot parse"
    with pytest.raises(CorruptedDocumentError) as exc_info:
        extract_text_from_bytes(garbage_bytes, "pdf")
    assert exc_info.value.code == "CORRUPTED_OR_ENCRYPTED_PDF"
    assert exc_info.value.status_code == 422


def test_corrupted_docx_rejection():
    """Corrupted docx binary payload raises CorruptedDocumentError with CORRUPTED_DOCX."""
    garbage_docx = b"PK\x03\x04corrupted docx content"
    with pytest.raises(CorruptedDocumentError) as exc_info:
        extract_text_from_docx(garbage_docx)
    assert exc_info.value.code == "CORRUPTED_DOCX"
    assert exc_info.value.status_code == 422


def test_whitespace_normalization():
    """Verify non-breaking space replacement and blank line collapsing."""
    raw = "Line 1\u00a0with\u00a0NBSP   \ufeff\n\n\n\n\nLine 2 after blanks    "
    cleaned = normalize_whitespace(raw)
    assert "\u00a0" not in cleaned
    assert "\ufeff" not in cleaned
    assert "Line 1 with NBSP" in cleaned
    assert "\n\n\n" not in cleaned
    assert cleaned.endswith("Line 2 after blanks")


def test_pdf_page_truncation():
    """A PDF with 12 pages extracts the first 10 and sets text_truncated=True."""
    pdf_bytes = create_in_memory_pdf(SAMPLE_RESUME_TEXT, num_pages=12)
    doc = extract_text_from_bytes(pdf_bytes, "pdf")

    assert doc.page_count == 12
    assert doc.text_truncated is True


def test_character_ceiling_truncation():
    """Text exceeding 25,000 characters is capped at 25,000 chars with text_truncated=True."""
    doc = fitz.open()
    chunk = " ".join(["Python FastAPI React Docker SQL"] * 150)
    for _ in range(8):
        page = doc.new_page()
        page.insert_textbox(fitz.Rect(10, 10, 500, 800), chunk, fontsize=6)
    pdf_bytes = doc.write()
    doc.close()

    res = extract_text_from_bytes(pdf_bytes, "pdf")
    assert res.char_count == 25000
    assert res.text_truncated is True



def test_extract_document_text_alias_router():
    """Generic extract_document_text alias routes correctly to PDF or DOCX."""
    pdf_bytes = create_in_memory_pdf(SAMPLE_RESUME_TEXT)
    res_pdf = extract_document_text(pdf_bytes, "pdf")
    assert res_pdf.file_type == "pdf"

    paragraphs = ["Aarav Sharma", "Resume Content"] + [SAMPLE_RESUME_TEXT]
    docx_bytes = create_in_memory_docx(paragraphs)
    res_docx = extract_document_text(docx_bytes, "docx")
    assert res_docx.file_type == "docx"
