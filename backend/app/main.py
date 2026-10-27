"""Main FastAPI application entry point for ResumeIQ AI Backend.

PRD References:
- Section 16: Technical Architecture
- Section 17: Project Folder Structure
- Section 18: API Documentation (18.1 Standard Error Envelope, 18.2 Health Check)
- Section 21: Security, Privacy, and Responsible AI (CORS, exception sanitization)
"""

import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI, HTTPException, Request, status
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.api.routes import router as api_router
from app.config import settings
from app.schemas.common import ErrorDetails, ErrorResponse
from app.utils.exceptions import ResumeIQBaseException

# Configure logging
logging.basicConfig(
    level=logging.INFO if settings.ENVIRONMENT == "production" else logging.DEBUG,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger("resumeiq.backend")


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifespan context manager for application startup and shutdown events."""
    logger.info(
        "Starting ResumeIQ AI Backend v1.0.0 (Env: %s, AI Model: %s, Groq Configured: %s)",
        settings.ENVIRONMENT,
        settings.GROQ_MODEL,
        settings.is_groq_key_configured,
    )
    yield
    logger.info("Shutting down ResumeIQ AI Backend.")


# Initialize FastAPI application
app = FastAPI(
    title="ResumeIQ AI Backend",
    description="Intelligent Resume Analyzer and Bullet-Point Rewriter API",
    version="1.0.0",
    docs_url="/docs" if settings.ENVIRONMENT != "production" else None,
    redoc_url="/redoc" if settings.ENVIRONMENT != "production" else None,
    lifespan=lifespan,
)

# Configure CORS Middleware (PRD Section 21.3)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["*"],
    expose_headers=["*"],
)


# Exception Handlers (PRD Section 18.1 & Section 21.3)
@app.exception_handler(ResumeIQBaseException)
async def resumeiq_exception_handler(
    request: Request, exc: ResumeIQBaseException
) -> JSONResponse:
    """Handle custom domain exceptions and return standardized Error Envelope."""
    logger.warning("Domain exception caught [%s]: %s", exc.code, exc.message)
    error_payload = ErrorResponse(
        status="error",
        error=ErrorDetails(
            code=exc.code,
            message=exc.message,
            details=exc.details if exc.details else None,
        ),
    )
    return JSONResponse(
        status_code=exc.status_code,
        content=error_payload.model_dump(),
    )


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(
    request: Request, exc: RequestValidationError
) -> JSONResponse:
    """Transform FastAPI Pydantic validation errors into Section 18.1 Error Envelope."""
    logger.warning("Request validation error: %s", exc.errors())
    error_payload = ErrorResponse(
        status="error",
        error=ErrorDetails(
            code="INVALID_INPUT",
            message="Invalid request input parameters.",
            details={"validation_errors": exc.errors()},
        ),
    )
    return JSONResponse(
        status_code=status.HTTP_400_BAD_REQUEST,
        content=error_payload.model_dump(),
    )


@app.exception_handler(HTTPException)
async def http_exception_handler(
    request: Request, exc: HTTPException
) -> JSONResponse:
    """Transform standard HTTPExceptions into Section 18.1 Error Envelope."""
    logger.warning("HTTPException [%s]: %s", exc.status_code, exc.detail)
    error_payload = ErrorResponse(
        status="error",
        error=ErrorDetails(
            code=f"HTTP_{exc.status_code}",
            message=str(exc.detail),
            details=None,
        ),
    )
    return JSONResponse(
        status_code=exc.status_code,
        content=error_payload.model_dump(),
    )


@app.exception_handler(Exception)
async def generic_exception_handler(
    request: Request, exc: Exception
) -> JSONResponse:
    """Catch-all unexpected exception handler that conceals internal stack traces (PRD Section 21.3)."""
    logger.error("Unhandled server exception: %s", exc, exc_info=True)
    error_payload = ErrorResponse(
        status="error",
        error=ErrorDetails(
            code="INTERNAL_SERVER_ERROR",
            message="An unexpected server error occurred. Please try again.",
            details=None,
        ),
    )
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content=error_payload.model_dump(),
    )


# Register API routes
app.include_router(api_router)
