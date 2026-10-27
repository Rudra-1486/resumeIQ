"""Test suite for GET /api/health endpoint (PRD Section 18.2 & 24.1)."""

from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


from app.config import settings

def test_health_check_endpoint():
    """Verify GET /api/health returns 200 OK with correct envelope schema."""
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()

    # Verify Section 18.2 schema keys
    assert data["status"] == "ok"
    assert data["service"] == "ResumeIQ AI Backend"
    assert data["version"] == "1.0.0"
    assert data["ai_provider"] == "groq"
    assert data["model"] == settings.GROQ_MODEL
    assert "groq_key_configured" in data
    assert isinstance(data["groq_key_configured"], bool)
    assert "timestamp" in data
    # Ensure GROQ_API_KEY value is NEVER leaked
    assert "GROQ_API_KEY" not in data
    assert "gsk_" not in str(data)
