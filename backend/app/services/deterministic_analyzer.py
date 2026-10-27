"""Deterministic Heuristic Analyzer for ResumeIQ AI (PRD Section 15 & Section 18.3).

Executes linear-time Python regex and token checks:
1. Contact signals: Email, phone, LinkedIn/GitHub/portfolio.
2. Section headings: Education, Skills, Projects, Experience/Internships, Summary, Certifications.
3. Experiential & structural metrics: Bullet count, action-verb ratio, pronouns, paragraph length, broken glyphs.
4. Candidate profile inference: student_or_fresh_graduate vs. experienced.
5. ATS-Readability Score (100% deterministic, 0-100 integer with ATS-1..ATS-5 breakdown).
6. Deterministic baseline points for Resume Quality Score (RQ-1..RQ-6).
"""

import re
from dataclasses import dataclass, field
from typing import Any, Dict, List, Optional, Set

# Common resume action verbs for RQ-4 deterministic check
STRONG_ACTION_VERBS: Set[str] = {
    "accelerated", "accomplished", "achieved", "acquired", "adapted", "administered",
    "advanced", "advised", "analyzed", "architected", "arranged", "assembled",
    "authored", "automated", "boosted", "briefed", "built", "calculated",
    "cataloged", "championed", "co-authored", "coded", "collaborated", "compiled",
    "composed", "computed", "conceptualized", "conducted", "configured", "constructed",
    "consulted", "controlled", "coordinated", "crafted", "created", "customized",
    "debugged", "decreased", "delivered", "deployed", "designed", "detailed",
    "developed", "devised", "diagnosed", "directed", "discovered", "dispatched",
    "distributed", "documented", "drafted", "drove", "earned", "edited",
    "educated", "eliminated", "enabled", "enacted", "engineered", "enhanced",
    "enlarged", "ensured", "established", "estimated", "evaluated", "examined",
    "executed", "expanded", "expedited", "experimented", "explored", "facilitated",
    "finalized", "focused", "forecasted", "formulated", "founded", "framed",
    "gathered", "generated", "guided", "handled", "headed", "identified",
    "implemented", "improved", "increased", "indexed", "influenced", "initiated",
    "innovated", "inspected", "installed", "instituted", "instructed", "integrated",
    "intensified", "interpreted", "introduced", "invented", "investigated", "launched",
    "lead", "led", "leveraged", "maintained", "managed", "mapped",
    "maximized", "measured", "mediated", "mentored", "minimized", "mobilized",
    "modeled", "modified", "monitored", "motivated", "navigated", "negotiated",
    "obtained", "operated", "optimized", "orchestrated", "organized", "originated",
    "overhauled", "oversaw", "packaged", "performed", "pioneered", "planned",
    "prepared", "presented", "produced", "programmed", "projected", "promoted",
    "published", "queried", "raised", "re-engineered", "rebuilt", "received",
    "recommended", "reconciled", "recorded", "recruited", "redesigned", "reduced",
    "refactored", "refined", "reformed", "regulated", "remodeled", "reorganized",
    "repaired", "replaced", "reported", "researched", "resolved", "restructured",
    "revamped", "reviewed", "revised", "routed", "saved", "scheduled",
    "screened", "scrutinized", "secured", "selected", "separated", "simplified",
    "simulated", "solved", "spearheaded", "standardized", "started", "stimulated",
    "streamlined", "structured", "supervised", "supported", "synthesized", "systematized",
    "tabulated", "tested", "tracked", "trained", "transformed", "translated",
    "troubleshot", "unified", "updated", "upgraded", "utilized", "validated",
    "verified", "visualized", "won", "wrote",
}

# Curated set of common technical keywords to deterministically count distinct skills
COMMON_TECHNICAL_SKILLS: Set[str] = {
    "python", "java", "c++", "c#", "c", "javascript", "typescript", "php", "ruby", "rust", "go", "golang",
    "html", "html5", "css", "css3", "sass", "tailwind", "bootstrap", "react", "react.js", "next.js", "vue",
    "angular", "node", "node.js", "express", "fastapi", "flask", "django", "spring", "spring boot",
    "sql", "mysql", "postgresql", "sqlite", "mongodb", "redis", "oracle", "nosql", "firebase",
    "git", "github", "gitlab", "docker", "kubernetes", "aws", "azure", "gcp", "linux", "bash", "rest",
    "restful", "graphql", "postman", "pytest", "unit testing", "ci/cd", "agile", "scrum", "jira",
    "machine learning", "deep learning", "pandas", "numpy", "scikit-learn", "tensorflow", "pytorch",
}

FIRST_PERSON_PATTERN = re.compile(r"\b(i|me|my|mine|myself|we|our|ours|us)\b", re.IGNORECASE)
EMAIL_PATTERN = re.compile(r"[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+")
PHONE_PATTERN = re.compile(r"(?:\+?\d{1,3}[-.\s]?)?(?:\(?\d{2,4}\)?[-.\s]?)?\d{3,5}[-.\s]?\d{3,5}")
PROFILE_LINK_PATTERN = re.compile(
    r"(?:https?://)?(?:www\.)?(?:linkedin\.com/in/|github\.com/|[a-zA-Z0-9.-]+\.github\.io|[a-zA-Z0-9-]+\.(?:portfolio|dev|me|tech))",
    re.IGNORECASE,
)

BULLET_LINE_PATTERN = re.compile(r"^\s*([•\-\*–—\u2022\u2023\u25e6\u2043\u2219\u25aa\u25ab]|\d+[\.\)])\s+(.+)$")


@dataclass
class CriterionBreakdownItem:
    """Represents an individual sub-score in the Section 18.3 criteria breakdown."""
    id: str
    name: str
    earned: int
    max_points: int
    note: str

    def to_dict(self) -> Dict[str, Any]:
        return {
            "id": self.id,
            "name": self.name,
            "earned": self.earned,
            "max_points": self.max_points,
            "note": self.note,
        }


@dataclass
class ATSReadabilityResult:
    """Complete 100-point deterministic ATS-Readability score evaluation."""
    score: int
    tier: str
    disclaimer: str
    explanation: str
    criteria_breakdown: List[CriterionBreakdownItem]

    def to_dict(self) -> Dict[str, Any]:
        return {
            "score": self.score,
            "tier": self.tier,
            "disclaimer": self.disclaimer,
            "explanation": self.explanation,
            "criteria_breakdown": [c.to_dict() for c in self.criteria_breakdown],
        }


@dataclass
class DeterministicSignals:
    """Structured deterministic signals extracted from resume text."""
    # Contact signals
    has_email: bool
    has_phone: bool
    has_profile_link: bool
    detected_email: Optional[str]
    detected_phone: Optional[str]
    detected_profile_link: Optional[str]

    # Section signals
    has_education_section: bool
    has_skills_section: bool
    has_projects_section: bool
    has_experience_section: bool
    has_summary_section: bool
    has_certifications_section: bool
    detected_standard_headings_count: int
    detected_headings: List[str]

    # Metrics
    bullet_count: int
    bullet_lines: List[str]
    average_bullet_words: float
    action_verb_bullet_count: int
    action_verb_ratio: float
    has_first_person_pronouns: bool
    max_paragraph_words: int
    has_broken_glyphs: bool
    cleanliness_ratio: float
    project_role_count: int
    distinct_skills_count: int
    candidate_profile_type: str
    word_count: int
    char_count: int

    # Complete ATS Readability Score
    ats_readability: ATSReadabilityResult

    # Deterministic portions of Resume Quality Score
    rq1_points: int  # Contact (0..10)
    rq1_note: str
    rq2_points: int  # Core Section Structure (0..20)
    rq2_note: str
    rq3_det_points: int  # Experiential volume baseline (0 or 5)
    rq3_det_note: str
    rq4_det_points: int  # Bullet clarity baseline (0 or 5)
    rq4_det_note: str
    rq5_det_points: int  # Skills count baseline (0 or 5)
    rq5_det_note: str
    rq6_det_points: int  # Word count / bullet length baseline (0 or 5)
    rq6_det_note: str


def get_score_tier(score: int) -> str:
    """Map integer 0-100 score to PRD Section 15.D Tier Label."""
    if score >= 85:
        return "Excellent"
    if score >= 70:
        return "Strong"
    if score >= 50:
        return "Fair"
    return "Needs Work"


def extract_bullet_lines(text: str) -> List[str]:
    """Identify lines structured as bullet points or numbered lists."""
    bullets = []
    for line in text.splitlines():
        trimmed = line.strip()
        match = BULLET_LINE_PATTERN.match(trimmed)
        if match:
            bullet_body = match.group(2).strip()
            if bullet_body:
                bullets.append(bullet_body)
    return bullets


def compute_paragraph_metrics(text: str) -> int:
    """Measure the maximum word count of unbroken paragraph blocks (> 85 words flags wall-of-text)."""
    blocks = re.split(r"\n\s*\n", text)
    max_words = 0
    for block in blocks:
        # If block is heavily bulleted, skip measuring as a single paragraph
        lines = [ln.strip() for ln in block.splitlines() if ln.strip()]
        if not lines:
            continue
        bullet_matches = sum(1 for ln in lines if BULLET_LINE_PATTERN.match(ln))
        if bullet_matches >= len(lines) // 2 and bullet_matches > 0:
            # This is a bullet list, not a continuous paragraph block
            continue
        words = block.split()
        if len(words) > max_words:
            max_words = len(words)
    return max_words


def check_broken_glyphs(text: str) -> bool:
    """Detect broken unicode replacement characters (\\ufffd) or private-use icon fonts (\\ue000-\\uf8ff)."""
    return bool(re.search(r"[\ufffd\ue000-\uf8ff]", text))


def compute_cleanliness_ratio(text: str) -> float:
    """Compute ratio of alphanumeric and standard punctuation characters to total non-whitespace chars."""
    non_ws_chars = [c for c in text if not c.isspace()]
    if not non_ws_chars:
        return 0.0

    valid_chars = 0
    standard_punctuation = set(".,;:!?()[]{}'\"-_/\\@#%&*+=<>~|`$")
    for c in non_ws_chars:
        if c.isalnum() or c in standard_punctuation:
            valid_chars += 1

    return valid_chars / len(non_ws_chars)


def infer_candidate_profile(
    text: str,
    has_education: bool,
    has_projects: bool,
    has_experience: bool,
) -> str:
    """Infer candidate profile type ('student_or_fresh_graduate' vs 'experienced')."""
    text_lower = text.lower()

    student_keywords = [
        "student", "undergraduate", "bca", "b.tech", "btech", "b.sc", "bsc", "bachelor",
        "intern", "internship", "final year", "semester", "cgpa", "fresher", "fresh graduate",
    ]
    student_keyword_hits = sum(1 for kw in student_keywords if re.search(r"\b" + re.escape(kw) + r"\b", text_lower))

    # If resume has projects/education but lacks formal work experience, or has strong student keyword signals
    if (has_projects and not has_experience) or (has_education and student_keyword_hits >= 2):
        return "student_or_fresh_graduate"

    # Check for multi-year corporate tenure terms
    experienced_keywords = ["senior", "lead engineer", "staff", "architect", "5+ years", "3+ years", "manager"]
    if any(re.search(r"\b" + re.escape(kw) + r"\b", text_lower) for kw in experienced_keywords):
        return "experienced"

    if has_experience and student_keyword_hits < 2:
        return "experienced"

    return "student_or_fresh_graduate"


def analyze_deterministic_signals(
    text: str,
    word_count: Optional[int] = None,
    page_count: int = 1,
    file_type: str = "pdf",
) -> DeterministicSignals:
    """Perform fast, comprehensive, linear-time deterministic inspection of resume text.

    Args:
        text: Normalized raw text of the resume.
        word_count: Optional word count (computed from text if omitted).
        page_count: Total page count (default 1).
        file_type: "pdf" or "docx" (default "pdf").

    Returns:
        DeterministicSignals: Comprehensive dataclass of heuristic metrics.
    """
    if word_count is None:
        word_count = len(text.split())

    # 1. Contact Signals
    email_match = EMAIL_PATTERN.search(text)
    has_email = bool(email_match)
    detected_email = email_match.group(0) if email_match else None

    phone_match = PHONE_PATTERN.search(text)
    has_phone = bool(phone_match)
    detected_phone = phone_match.group(0) if phone_match else None

    profile_match = PROFILE_LINK_PATTERN.search(text)
    # Also check plain text mentions of github.com or linkedin.com
    if not profile_match:
        if "github.com" in text.lower() or "linkedin.com" in text.lower():
            has_profile_link = True
            detected_profile_link = "Detected profile URL"
        else:
            has_profile_link = False
            detected_profile_link = None
    else:
        has_profile_link = True
        detected_profile_link = profile_match.group(0)

    # 2. Section Headings (Case-insensitive line-based matches)
    text_lines = [ln.strip() for ln in text.splitlines() if ln.strip()]

    def matches_heading(pattern_str: str) -> bool:
        regex = re.compile(pattern_str, re.IGNORECASE)
        for line in text_lines:
            # Check lines that look like headers (short, standalone lines <= 50 chars)
            if len(line) <= 50 and regex.search(line):
                return True
        return False

    has_education = matches_heading(r"^(?:[#*•-]\s*)?(education|academic\s+(?:qualifications|background|history)|academics|qualifications)\b")
    has_skills = matches_heading(r"^(?:[#*•-]\s*)?(skills|technical\s+skills|core\s+competencies|technologies|tools\s*(?:&|and)\s*technologies|tech\s+stack)\b")
    has_projects = matches_heading(r"^(?:[#*•-]\s*)?(projects|academic\s+projects|personal\s+projects|key\s+projects)\b")
    has_experience = matches_heading(r"^(?:[#*•-]\s*)?(experience|work\s+experience|professional\s+experience|employment\s+history|internships|internship\s+experience)\b")
    has_summary = matches_heading(r"^(?:[#*•-]\s*)?(summary|professional\s+summary|profile|objective|career\s+objective|about\s+me)\b")
    has_certifications = matches_heading(r"^(?:[#*•-]\s*)?(certifications?|certificates?|licenses?|achievements?|honors?|awards?)\b")

    detected_headings: List[str] = []
    if has_education:
        detected_headings.append("Education")
    if has_skills:
        detected_headings.append("Skills")
    if has_projects:
        detected_headings.append("Projects")
    if has_experience:
        detected_headings.append("Experience/Internships")
    if has_summary:
        detected_headings.append("Summary/Objective")
    if has_certifications:
        detected_headings.append("Certifications/Achievements")

    # Count standard headings for ATS-2 (out of the 5 standard categories: Education, Skills, Projects, Experience, Summary)
    ats_standard_headings = [has_education, has_skills, has_projects, has_experience, has_summary]
    standard_headings_count = sum(1 for h in ats_standard_headings if h)

    # 3. Bullets and structural metrics
    bullet_lines = extract_bullet_lines(text)
    bullet_count = len(bullet_lines)

    if bullet_count > 0:
        total_bullet_words = sum(len(b.split()) for b in bullet_lines)
        avg_bullet_words = round(total_bullet_words / bullet_count, 1)
    else:
        avg_bullet_words = 0.0

    action_verb_count = 0
    has_first_person = False
    for bullet in bullet_lines:
        words = bullet.split()
        if words:
            first_word = re.sub(r"[^\w]", "", words[0]).lower()
            if first_word in STRONG_ACTION_VERBS:
                action_verb_count += 1
        if FIRST_PERSON_PATTERN.search(bullet):
            has_first_person = True

    action_verb_ratio = (action_verb_count / bullet_count) if bullet_count > 0 else 0.0
    max_paragraph_words = compute_paragraph_metrics(text)
    has_broken_glyphs = check_broken_glyphs(text)
    cleanliness_ratio = compute_cleanliness_ratio(text)

    # Approximate distinct project / role entries
    # e.g. Lines with dates or role keywords or bullet groups
    date_matches = re.findall(r"\b(20\d\d|19\d\d)\b", text)
    project_role_count = max(len(set(date_matches)), (bullet_count // 3) if bullet_count >= 3 else 1)

    # Distinct technical skills count
    text_lower = text.lower()
    distinct_skills_count = sum(
        1 for skill in COMMON_TECHNICAL_SKILLS if re.search(r"\b" + re.escape(skill) + r"\b", text_lower)
    )

    candidate_profile_type = infer_candidate_profile(
        text=text,
        has_education=has_education,
        has_projects=has_projects,
        has_experience=has_experience,
    )

    # 4. ATS-Readability Score Calculation (Section 15.C)
    # ATS-1: Clean Text Extraction & Word Volume (Max 25)
    if 150 <= word_count <= 1200:
        ats1_pts = 25
        ats1_note = f"{word_count} words extracted cleanly within optimal range (150–1,200 words)."
    elif (50 <= word_count < 150) or (1201 <= word_count <= 2000):
        ats1_pts = 15
        ats1_note = f"{word_count} words extracted ({'sparse document' if word_count < 150 else 'verbose document'})."
    else:
        ats1_pts = 8
        ats1_note = f"{word_count} words exceeds standard length (> 2,000 words)."

    # ATS-2: Standard Recognizable Section Headings (Max 25)
    if standard_headings_count >= 4:
        ats2_pts = 25
        ats2_note = f"Found {standard_headings_count} standard headings ({', '.join(detected_headings)})."
    elif standard_headings_count == 3:
        ats2_pts = 18
        ats2_note = f"Found 3 standard headings ({', '.join(detected_headings)})."
    elif standard_headings_count == 2:
        ats2_pts = 10
        ats2_note = f"Found 2 standard headings ({', '.join(detected_headings)})."
    else:
        ats2_pts = 0
        ats2_note = "Only 0 or 1 recognizable standard section heading found."

    # ATS-3: Machine-Readable Contact Information (Max 20: 8 + 6 + 6)
    ats3_email = 8 if has_email else 0
    ats3_phone = 6 if has_phone else 0
    ats3_link = 6 if has_profile_link else 0
    ats3_pts = ats3_email + ats3_phone + ats3_link
    detected_contacts = []
    if has_email:
        detected_contacts.append("email")
    if has_phone:
        detected_contacts.append("phone")
    if has_profile_link:
        detected_contacts.append("profile link")
    ats3_note = f"Detected: {', '.join(detected_contacts) if detected_contacts else 'no machine-readable contacts'}."

    # ATS-4: Paragraph & Bullet Structure Balance (Max 15: 8 + 7)
    ats4_bullet = 8 if bullet_count >= 6 else 0
    ats4_para = 7 if max_paragraph_words <= 85 else 0
    ats4_pts = ats4_bullet + ats4_para
    ats4_note = f"{bullet_count} bullets found; max unbroken block is {max_paragraph_words} words ({'well-balanced' if ats4_pts == 15 else 'dense blocks detected'})."

    # ATS-5: Character & Symbol Cleanliness (Max 15: 10 + 5)
    ats5_glyphs = 0 if has_broken_glyphs else 10
    ats5_clean = 5 if cleanliness_ratio >= 0.92 else 0
    ats5_pts = ats5_glyphs + ats5_clean
    ats5_note = (
        "Clean characters with no broken icon glyphs."
        if ats5_pts == 15
        else "Detected broken Unicode glyphs or unusual symbol clutter."
    )

    ats_total = ats1_pts + ats2_pts + ats3_pts + ats4_pts + ats5_pts
    ats_tier = get_score_tier(ats_total)

    ats_breakdown = [
        CriterionBreakdownItem("ATS-1", "Clean Text Extraction & Word Volume", ats1_pts, 25, ats1_note),
        CriterionBreakdownItem("ATS-2", "Standard Recognizable Section Headings", ats2_pts, 25, ats2_note),
        CriterionBreakdownItem("ATS-3", "Machine-Readable Contact Information", ats3_pts, 20, ats3_note),
        CriterionBreakdownItem("ATS-4", "Paragraph & Bullet Structure Balance", ats4_pts, 15, ats4_note),
        CriterionBreakdownItem("ATS-5", "Character & Symbol Cleanliness", ats5_pts, 15, ats5_note),
    ]

    ats_readability_obj = ATSReadabilityResult(
        score=ats_total,
        tier=ats_tier,
        disclaimer="General text-extraction and structural readability heuristic. Not an official commercial ATS score.",
        explanation=f"Evaluated text extractability and layout scannability ({ats_tier} readability rating).",
        criteria_breakdown=ats_breakdown,
    )

    # 5. Deterministic Portions of Resume Quality Score (Section 15.A)
    # RQ-1: Contact & Profile Completeness (Max 10: 4 + 3 + 3)
    rq1_email = 4 if has_email else 0
    rq1_phone = 3 if has_phone else 0
    rq1_link = 3 if has_profile_link else 0
    rq1_pts = rq1_email + rq1_phone + rq1_link
    rq1_note = f"Email: {'+4' if rq1_email else '0'}, Phone: {'+3' if rq1_phone else '0'}, Profile: {'+3' if rq1_link else '0'}."

    # RQ-2: Core Section Structure (Max 20: 6 + 6 + 6 + 2)
    # Student Fairness: experiential can be satisfied by Projects OR Work Experience OR Internships!
    rq2_edu = 6 if has_education else 0
    rq2_skills = 6 if has_skills else 0
    rq2_exp = 6 if (has_projects or has_experience) else 0
    rq2_bonus = 2 if (has_summary or has_certifications) else 0
    rq2_pts = rq2_edu + rq2_skills + rq2_exp + rq2_bonus
    rq2_note = (
        f"Education: {'+6' if rq2_edu else '0'}, Skills: {'+6' if rq2_skills else '0'}, "
        f"Projects/Experience: {'+6' if rq2_exp else '0'}, Summary/Certifications: {'+2' if rq2_bonus else '0'}."
    )

    # RQ-3 Deterministic Baseline (0 or 5 pts)
    # Check: at least 2 distinct project/role entries with >= 6 total bullets
    if (project_role_count >= 2 or has_projects) and bullet_count >= 6:
        rq3_det = 5
        rq3_note = f"Found {project_role_count} project/role entries and {bullet_count} structured bullets (+5 pts volume credit)."
    else:
        rq3_det = 0
        rq3_note = f"Found {bullet_count} bullets across {project_role_count} roles (requires >= 2 entries and >= 6 bullets for baseline volume)."

    # RQ-4 Deterministic Baseline (0 or 5 pts)
    # Check: >= 50% of bullets start with strong action verbs and avoid first-person pronouns
    if action_verb_ratio >= 0.50 and not has_first_person:
        rq4_det = 5
        rq4_note = f"{round(action_verb_ratio * 100)}% of bullets start with action verbs and zero first-person pronouns (+5 pts)."
    else:
        rq4_det = 0
        rq4_note = f"{round(action_verb_ratio * 100)}% action-verb start ratio; first-person pronouns: {'detected' if has_first_person else 'none'}."

    # RQ-5 Deterministic Baseline (0 or 5 pts)
    # Check: At least 5 distinct technical/domain skills extracted
    if distinct_skills_count >= 5:
        rq5_det = 5
        rq5_note = f"Found {distinct_skills_count} recognizable technical skills in text (+5 pts)."
    else:
        rq5_det = 0
        rq5_note = f"Found {distinct_skills_count} recognizable technical skills in text (requires >= 5 for baseline)."

    # RQ-6 Deterministic Baseline (0 or 5 pts)
    # Check: Total word count between 200 and 1,000 words AND average bullet length <= 35 words
    if (200 <= word_count <= 1000) and (avg_bullet_words <= 35.0):
        rq6_det = 5
        rq6_note = f"Document length ({word_count} words) and avg bullet length ({avg_bullet_words} words) within optimal bounds (+5 pts)."
    else:
        rq6_det = 0
        rq6_note = f"{word_count} words total; avg bullet length: {avg_bullet_words} words."

    return DeterministicSignals(
        has_email=has_email,
        has_phone=has_phone,
        has_profile_link=has_profile_link,
        detected_email=detected_email,
        detected_phone=detected_phone,
        detected_profile_link=detected_profile_link,
        has_education_section=has_education,
        has_skills_section=has_skills,
        has_projects_section=has_projects,
        has_experience_section=has_experience,
        has_summary_section=has_summary,
        has_certifications_section=has_certifications,
        detected_standard_headings_count=standard_headings_count,
        detected_headings=detected_headings,
        bullet_count=bullet_count,
        bullet_lines=bullet_lines,
        average_bullet_words=avg_bullet_words,
        action_verb_bullet_count=action_verb_count,
        action_verb_ratio=action_verb_ratio,
        has_first_person_pronouns=has_first_person,
        max_paragraph_words=max_paragraph_words,
        has_broken_glyphs=has_broken_glyphs,
        cleanliness_ratio=cleanliness_ratio,
        project_role_count=project_role_count,
        distinct_skills_count=distinct_skills_count,
        candidate_profile_type=candidate_profile_type,
        ats_readability=ats_readability_obj,
        rq1_points=rq1_pts,
        rq1_note=rq1_note,
        rq2_points=rq2_pts,
        rq2_note=rq2_note,
        rq3_det_points=rq3_det,
        rq3_det_note=rq3_note,
        rq4_det_points=rq4_det,
        rq4_det_note=rq4_note,
        rq5_det_points=rq5_det,
        rq5_det_note=rq5_note,
        rq6_det_points=rq6_det,
        rq6_det_note=rq6_note,
        word_count=word_count,
        char_count=len(text),
    )


# Alias for backward compatibility and alternate naming
analyze_deterministic = analyze_deterministic_signals

