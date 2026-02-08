"""
FastAPI Entrypoint
Serviço de AI para Tech Arauz
"""

from contextlib import asynccontextmanager
from datetime import datetime
from typing import AsyncGenerator

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app import __version__
from app.config import get_settings
from app.api.routes import router as api_router


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    """Lifecycle do app - setup e teardown."""
    settings = get_settings()
    
    # Startup
    print(f"🚀 Starting Tech Arauz AI Service v{__version__}")
    print(f"📊 LangSmith: {'enabled' if settings.is_langsmith_enabled else 'disabled'}")
    
    yield
    
    # Shutdown
    print("👋 Shutting down...")


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
    return {
        "status": "healthy",
        "version": __version__,
        "timestamp": datetime.utcnow().isoformat(),
    }


@app.get("/")
async def root() -> dict:
    """Root endpoint."""
    return {
        "service": "Tech Arauz AI",
        "version": __version__,
        "docs": "/docs",
    }
