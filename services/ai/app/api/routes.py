"""
API Routes para o serviço AI
"""

from datetime import datetime
from typing import Optional

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

router = APIRouter()


# =============================================================================
# Models
# =============================================================================


class AgentInfo(BaseModel):
    """Informações de um agente."""

    id: str
    name: str
    description: str
    status: str
    created_at: datetime
    last_run: Optional[datetime] = None


class AgentRunRequest(BaseModel):
    """Request para executar um agente."""

    input: str
    config: Optional[dict] = None


class AgentRunResponse(BaseModel):
    """Response de execução de agente."""

    run_id: str
    agent_id: str
    status: str
    output: Optional[str] = None
    trace_url: Optional[str] = None
    duration_ms: Optional[int] = None


# =============================================================================
# Mock Data (substituir por LangGraph real)
# =============================================================================

MOCK_AGENTS = [
    AgentInfo(
        id="agent-1",
        name="Assistente Geral",
        description="Agente de propósito geral para perguntas e tarefas",
        status="active",
        created_at=datetime(2026, 2, 7),
    ),
    AgentInfo(
        id="agent-2",
        name="Analisador de Projetos",
        description="Analisa projetos e gera insights",
        status="draft",
        created_at=datetime(2026, 2, 7),
    ),
]


# =============================================================================
# Endpoints
# =============================================================================


@router.get("/agents", response_model=list[AgentInfo])
async def list_agents() -> list[AgentInfo]:
    """Lista todos os agentes disponíveis."""
    return MOCK_AGENTS


@router.get("/agents/{agent_id}", response_model=AgentInfo)
async def get_agent(agent_id: str) -> AgentInfo:
    """Retorna detalhes de um agente específico."""
    for agent in MOCK_AGENTS:
        if agent.id == agent_id:
            return agent
    raise HTTPException(status_code=404, detail="Agent not found")


@router.post("/agents/{agent_id}/run", response_model=AgentRunResponse)
async def run_agent(agent_id: str, request: AgentRunRequest) -> AgentRunResponse:
    """Executa um agente com o input fornecido."""
    # Verificar se agente existe
    agent = None
    for a in MOCK_AGENTS:
        if a.id == agent_id:
            agent = a
            break

    if not agent:
        raise HTTPException(status_code=404, detail="Agent not found")

    if agent.status != "active":
        raise HTTPException(status_code=400, detail="Agent is not active")

    # TODO: Implementar execução real com LangGraph
    # Por enquanto, retorna mock
    return AgentRunResponse(
        run_id=f"run-{datetime.utcnow().timestamp()}",
        agent_id=agent_id,
        status="completed",
        output=f"Mock response for: {request.input}",
        trace_url="https://smith.langchain.com/...",
        duration_ms=150,
    )


@router.get("/traces")
async def list_traces(limit: int = 10) -> dict:
    """Lista traces recentes (via LangSmith)."""
    # TODO: Integrar com LangSmith API
    return {
        "message": "LangSmith integration pending",
        "traces": [],
        "limit": limit,
    }
