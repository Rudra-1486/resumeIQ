from pathlib import Path
from typing import List, Union
from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict

# Strict MVP Domain Constants (PRD Sections 3, 17, 21, 22)
MAX_FILE_SIZE_BYTES: int = 5_242_880  # 5 MB (5,242,880 bytes)
MIN_EXTRACTED_WORDS: int = 50
MAX_EXTRACTED_CHARS: int = 25_000
GROQ_TIMEOUT_SECONDS: int = 25


class Settings(BaseSettings):
    """Application configuration loaded from environment variables and defaults."""

    # Core Groq LLM Configuration
    GROQ_API_KEY: str = ""
    GROQ_MODEL: str = "llama-3.3-70b-versatile"

    # Upload & Origin Configurations
    MAX_UPLOAD_SIZE_BYTES: int = MAX_FILE_SIZE_BYTES
    ALLOWED_ORIGINS: Union[List[str], str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ]
    ENVIRONMENT: str = "development"

    # Domain Constants exposed on settings object
    MAX_FILE_SIZE_BYTES: int = MAX_FILE_SIZE_BYTES
    MIN_EXTRACTED_WORDS: int = MIN_EXTRACTED_WORDS
    MAX_EXTRACTED_CHARS: int = MAX_EXTRACTED_CHARS
    GROQ_TIMEOUT_SECONDS: int = GROQ_TIMEOUT_SECONDS

    @field_validator("ALLOWED_ORIGINS", mode="before")
    @classmethod
    def parse_allowed_origins(cls, value: Union[str, List[str]]) -> List[str]:
        if isinstance(value, str):
            return [origin.strip() for origin in value.split(",") if origin.strip()]
        return value

    @property
    def is_groq_key_configured(self) -> bool:
        """Verify whether a valid, non-placeholder GROQ_API_KEY is present."""
        return bool(
            self.GROQ_API_KEY
            and self.GROQ_API_KEY.strip()
            and self.GROQ_API_KEY.strip() != "your_groq_api_key_here"
        )

    model_config = SettingsConfigDict(
        env_file=str(Path(__file__).resolve().parent.parent / ".env"),
        env_file_encoding="utf-8",
        extra="ignore",
    )


settings = Settings()
