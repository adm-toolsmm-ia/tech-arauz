"""
FastAPI Entrypoint
Serviço de AI para Tech Arauz
"""

import logging
from contextlib import asynccontextmanager
from datetime import datetime
from typing import AsyncGenerator

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app import __version__
from app.api.routes import router as api_router
from app.config import get_settings
from app.instrumentation import init_observability, log_event

logger = logging.getLogger("obs.main")


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    """Lifecycle do app - setup e teardown."""
    settings = get_settings()

    # Initialize observability (tracing + structured logging)
    init_observability()

    # Startup
    log_event(
        "app.startup",
        version=__version__,
        langsmith_enabled=settings.is_langsmith_enabled,
        obs_enabled=settings.obs_enabled,
        obs_backend=settings.obs_backend,
    )

    yield

    # Shutdown
    log_event("app.shutdown", version=__version__)


app = FastAPI(
    title="Tech Arauz AI Service",
    description="Serviço de gestão de agentes AI com LangGraph",
    version=__version__,
    lifespan=lifespan,
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Next.js dev
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routes
app.include_router(api_router, prefix="/api")


@app.get("/health")
async def health() -> dict:
    """Health check endpoint."""
    settings = get_settings()
    return {
        "status": "healthy",
        "version": __version__,
        "timestamp": datetime.utcnow().isoformat(),
        "observability": {
            "enabled": settings.obs_enabled,
            "backend": settings.obs_backend,
            "langsmith": settings.is_langsmith_enabled,
        },
    }


@app.get("/")
async def root() -> dict:
    """Root endpoint."""
    return {
        "service": "Tech Arauz AI",
        "version": __version__,
        "docs": "/docs",
    }
