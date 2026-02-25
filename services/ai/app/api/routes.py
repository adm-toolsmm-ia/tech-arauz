"""
API Routes para o serviço AI
"""

import logging
import os
import uuid
from datetime import datetime, timedelta
from typing import Optional

import jwt
from fastapi import APIRouter, HTTPException, Query, Request, Depends
from pydantic import BaseModel
from supabase import AsyncClient

from app.instrumentation import (
    BudgetExceededError,
    get_budget_manager,
    get_trace_url,
    log_event,
    with_run_context,
)
from app.agents.models import (
    CreateAgentRequest,
    UpdateAgentDraftRequest,
    PublishAgentRequest,
    RollbackAgentRequest,
    PaginatedResponse,
)
from app.agents.service import AgentService, AgentServiceError

router = APIRouter()
logger = logging.getLogger("obs.routes")

# JWT Configuration
SUPABASE_JWT_SECRET = os.getenv("SUPABASE_JWT_SECRET", "super-secret-jwt-token-change-me")


# =============================================================================
# JWT & Auth Helpers
# =============================================================================


async def get_token_data(request: Request) -> dict:
    """Extract and validate JWT token from Authorization header"""
    auth_header = request.headers.get("Authorization", "")
    
    if not auth_header.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing or invalid Authorization header")
    
    token = auth_header.split(" ")[1]
    
    try:
        payload = jwt.decode(token, SUPABASE_JWT_SECRET, algorithms=["HS256"])
        user_id = payload.get("sub")
        
        # Get tenant_id from app_metadata
        app_metadata = payload.get("app_metadata", {})
        tenant_id = app_metadata.get("tenant_id")
        
        if not user_id or not tenant_id:
            logger.warning("JWT missing sub or tenant_id: %s", payload)
            raise HTTPException(status_code=401, detail="Invalid token structure")
        
        return {
            "user_id": user_id,
            "tenant_id": tenant_id,
            "role": payload.get("role", "user"),
            "email": payload.get("email"),
        }
    except jwt.InvalidTokenError as e:
        logger.warning("JWT validation failed: %s", str(e))
        raise HTTPException(status_code=401, detail="Invalid token")
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")


async def get_supabase_client(request: Request) -> AsyncClient:
    """Get Supabase async client from app state"""
    supabase = getattr(request.app.state, "supabase", None)
    if not supabase:
        raise HTTPException(status_code=500, detail="Supabase client not initialized")
    return supabase


# =============================================================================
# Models
# =============================================================================


class AgentInfo(BaseModel):
    """Informações de um agente."""

    id: str
    name: str
    description: str
    type: str  # automation, analysis, integration, assistant
    status: str  # active, inactive, development, deprecated
    version: str
    created_at: datetime
    last_run: Optional[datetime] = None
    total_runs: int = 0
    success_rate: float = 0.0
    avg_latency_ms: int = 0
    total_cost_usd: float = 0.0


class AgentRunRequest(BaseModel):
    """Request para executar um agente."""

    input: str
    config: Optional[dict] = None
    session_id: Optional[str] = None
    user_id: Optional[str] = None


class AgentRunResponse(BaseModel):
    """Response de execução de agente."""

    run_id: str
    agent_id: str
    status: str
    output: Optional[str] = None
    trace_url: Optional[str] = None
    duration_ms: Optional[int] = None
    cost_usd: Optional[float] = None


class TraceInfo(BaseModel):
    """Informações de um trace/execução."""

    id: str
    agent_id: str
    agent_name: str
    status: str  # completed, failed, running
    input_preview: str
    output_preview: Optional[str] = None
    started_at: datetime
    completed_at: Optional[datetime] = None
    duration_ms: Optional[int] = None
    cost_usd: float = 0.0
    tokens_used: int = 0
    steps: list[dict] = []
    trace_url: Optional[str] = None


class PaginatedResponse(BaseModel):
    """Response paginada genérica."""

    items: list
    total: int
    page: int
    page_size: int
    has_next: bool


# =============================================================================
# Mock Data (dados representativos para desenvolvimento UI)
# =============================================================================

now = datetime.now()

MOCK_AGENTS = [
    AgentInfo(
        id="agent-1",
        name="Assistente Geral",
        description="Agente de propósito geral para perguntas e tarefas administrativas. Usa GPT-4o para gerar respostas contextualizadas sobre o negócio.",
        type="assistant",
        status="active",
        version="1.2.0",
        created_at=datetime(2026, 1, 15),
        last_run=now - timedelta(hours=2),
        total_runs=147,
        success_rate=94.5,
        avg_latency_ms=2340,
        total_cost_usd=12.45,
    ),
    AgentInfo(
        id="agent-2",
        name="Analisador de Projetos",
        description="Analisa dados de projetos do Espaider e gera insights sobre prazos, custos e riscos. Integra com o banco de dados para consultas em tempo real.",
        type="analysis",
        status="active",
        version="0.9.0",
        created_at=datetime(2026, 1, 20),
        last_run=now - timedelta(hours=5),
        total_runs=83,
        success_rate=91.2,
        avg_latency_ms=3100,
        total_cost_usd=8.73,
    ),
    AgentInfo(
        id="agent-3",
        name="Sync Espaider Bot",
        description="Agente de automação que orquestra a sincronização de dados entre o ERP Espaider e o banco de dados do portal.",
        type="automation",
        status="active",
        version="1.0.0",
        created_at=datetime(2026, 2, 1),
        last_run=now - timedelta(minutes=30),
        total_runs=312,
        success_rate=98.7,
        avg_latency_ms=1800,
        total_cost_usd=3.21,
    ),
    AgentInfo(
        id="agent-4",
        name="Classificador de Demandas",
        description="Classifica automaticamente novas demandas por tipo, prioridade e área responsável baseado em histórico.",
        type="analysis",
        status="development",
        version="0.3.0",
        created_at=datetime(2026, 2, 5),
        last_run=now - timedelta(days=1),
        total_runs=24,
        success_rate=79.2,
        avg_latency_ms=1500,
        total_cost_usd=1.89,
    ),
    AgentInfo(
        id="agent-5",
        name="Notificador de SLA",
        description="Monitora prazos de projetos e envia alertas quando SLAs estão próximos de serem violados.",
        type="automation",
        status="inactive",
        version="0.1.0",
        created_at=datetime(2026, 2, 7),
        total_runs=0,
        success_rate=0.0,
        avg_latency_ms=0,
        total_cost_usd=0.0,
    ),
]

# Generate mock traces
def _generate_mock_traces() -> list[TraceInfo]:
    traces = []
    statuses = ["completed", "completed", "completed", "completed", "failed"]
    inputs = [
        "Qual o status dos projetos atrasados?",
        "Resuma os projetos em desenvolvimento",
        "Sincronizar dados do Espaider",
        "Classificar demanda: erro no módulo financeiro",
        "Listar projetos com prazo esta semana",
        "Gerar relatório mensal de progresso",
        "Analisar riscos do projeto SUPOR.00023",
        "Quais projetos estão sem responsável?",
    ]
    outputs = [
        "Encontrados 3 projetos com prazo vencido...",
        "Há 5 projetos em desenvolvimento, sendo...",
        "Sincronização concluída: 45 projetos atualizados",
        "Classificação: Tipo=Bug, Prioridade=Alta, Área=TI",
        "2 projetos com prazo até sexta-feira...",
        "Relatório gerado com 12 projetos analisados...",
        "Riscos identificados: 2 altos, 3 médios...",
        "4 projetos sem responsável definido...",
    ]

    for i in range(20):
        agent_idx = i % len(MOCK_AGENTS)
        agent = MOCK_AGENTS[agent_idx]
        status = statuses[i % len(statuses)]
        started = now - timedelta(hours=i * 3, minutes=i * 7)
        duration = 1500 + (i * 200) % 3000
        cost = round(0.002 + (i * 0.003) % 0.05, 4)
        tokens = 150 + (i * 50) % 800

        steps = [
            {"name": "parse_input", "duration_ms": duration // 5, "status": "completed"},
            {"name": "retrieve_context", "duration_ms": duration // 3, "status": "completed"},
            {"name": "llm_call", "duration_ms": duration // 2, "status": status},
            {"name": "format_output", "duration_ms": duration // 10, "status": "completed" if status == "completed" else "skipped"},
        ]

        traces.append(
            TraceInfo(
                id=f"trace-{uuid.uuid4().hex[:8]}",
                agent_id=agent.id,
                agent_name=agent.name,
                status=status,
                input_preview=inputs[i % len(inputs)],
                output_preview=outputs[i % len(outputs)] if status == "completed" else None,
                started_at=started,
                completed_at=started + timedelta(milliseconds=duration) if status != "running" else None,
                duration_ms=duration if status != "running" else None,
                cost_usd=cost,
                tokens_used=tokens,
                steps=steps,
                trace_url=f"https://smith.langchain.com/runs/{uuid.uuid4().hex[:8]}",
            )
        )

    return traces


MOCK_TRACES = _generate_mock_traces()


# =============================================================================
# Endpoints
# =============================================================================


@router.get("/agents")
async def list_agents(
    status: Optional[str] = Query(None, description="Filter by status"),
    type: Optional[str] = Query(None, description="Filter by type"),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
) -> dict:
    """Lista todos os agentes disponíveis com paginação e filtros."""
    filtered = MOCK_AGENTS

    if status:
        filtered = [a for a in filtered if a.status == status]
    if type:
        filtered = [a for a in filtered if a.type == type]

    total = len(filtered)
    start = (page - 1) * page_size
    end = start + page_size
    items = [a.model_dump() for a in filtered[start:end]]

    return {
        "items": items,
        "total": total,
        "page": page,
        "page_size": page_size,
        "has_next": end < total,
    }


@router.get("/agents/{agent_id}")
async def get_agent(agent_id: str) -> dict:
    """Retorna detalhes de um agente específico."""
    for agent in MOCK_AGENTS:
        if agent.id == agent_id:
            return agent.model_dump()
    raise HTTPException(status_code=404, detail="Agent not found")


@router.post("/agents/{agent_id}/run", response_model=AgentRunResponse)
async def run_agent(agent_id: str, request: AgentRunRequest) -> AgentRunResponse:
    """Executa um agente com o input fornecido."""
    agent = None
    for a in MOCK_AGENTS:
        if a.id == agent_id:
            agent = a
            break

    if not agent:
        raise HTTPException(status_code=404, detail="Agent not found")

    if agent.status != "active":
        raise HTTPException(status_code=400, detail="Agent is not active")

    try:
        with with_run_context(
            session_id=request.session_id,
            user_id=request.user_id,
            agent_id=agent_id,
        ) as ctx:
            log_event(
                "agent.run.start",
                agent_id=agent_id,
                session_id=request.session_id,
                user_id=request.user_id,
            )

            # TODO: Implementar execução real com LangGraph
            import time
            t0 = time.perf_counter()
            output = f"Mock response for: {request.input}"
            duration_ms = round((time.perf_counter() - t0) * 1000)

            trace_url = get_trace_url(ctx.run_id)

            log_event(
                "agent.run.complete",
                agent_id=agent_id,
                duration_ms=duration_ms,
                status="completed",
            )

            return AgentRunResponse(
                run_id=ctx.run_id,
                agent_id=agent_id,
                status="completed",
                output=output,
                trace_url=trace_url,
                duration_ms=duration_ms,
                cost_usd=0.0,
            )

    except BudgetExceededError as exc:
        log_event(
            "agent.run.budget_exceeded",
            agent_id=agent_id,
            scope=exc.scope,
            spent=exc.spent,
            limit=exc.limit,
            status="rejected",
        )
        raise HTTPException(
            status_code=429,
            detail={
                "error": "budget_exceeded",
                "scope": exc.scope,
                "spent_usd": round(exc.spent, 6),
                "limit_usd": exc.limit,
                "message": str(exc),
            },
        )


@router.get("/traces")
async def list_traces(
    agent_id: Optional[str] = Query(None, description="Filter by agent"),
    status: Optional[str] = Query(None, description="Filter by status"),
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=50),
) -> dict:
    """Lista traces recentes com paginação e filtros."""
    filtered = MOCK_TRACES

    if agent_id:
        filtered = [t for t in filtered if t.agent_id == agent_id]
    if status:
        filtered = [t for t in filtered if t.status == status]

    total = len(filtered)
    start = (page - 1) * page_size
    end = start + page_size
    items = [t.model_dump() for t in filtered[start:end]]

    return {
        "items": items,
        "total": total,
        "page": page,
        "page_size": page_size,
        "has_next": end < total,
    }


@router.get("/traces/{trace_id}")
async def get_trace(trace_id: str) -> dict:
    """Retorna detalhes de um trace específico."""
    for trace in MOCK_TRACES:
        if trace.id == trace_id:
            return trace.model_dump()
    raise HTTPException(status_code=404, detail="Trace not found")




@router.get("/budget")
async def get_budget_status(
    session_id: str | None = None,
    user_id: str | None = None,
    agent_id: str | None = None,
) -> dict:
    """Return current budget usage and remaining limits."""
    bm = get_budget_manager()
    spent = bm.get_spent(
        session_id=session_id, user_id=user_id, agent_id=agent_id,
    )
    remaining = bm.get_remaining(
        session_id=session_id, user_id=user_id, agent_id=agent_id,
    )

    # Aggregate totals from mock data
    total_spent = sum(a.total_cost_usd for a in MOCK_AGENTS)
    monthly_limit = 50.0  # From project.yaml ai_budget.monthly_tokens

    return {
        "spent_usd": round(spent + total_spent, 4),
        "remaining_usd": round(remaining, 4),
        "total_agents_cost_usd": round(total_spent, 4),
        "monthly_limit_usd": monthly_limit,
        "usage_percentage": round((total_spent / monthly_limit) * 100, 1) if monthly_limit > 0 else 0,
        "limits": {
            "session": bm.limit_session,
            "user": bm.limit_user,
            "agent": bm.limit_agent,
        },
    }


# =============================================================================
# PHASE 2: Agent Configuration API (Supabase Backend)
# =============================================================================
# These endpoints manage agent configuration from Supabase
# Meant to be called from Next.js frontend via proxy routes


@router.get("/agents/v2")
async def list_agents_v2(
    status: Optional[str] = Query(None),
    tag: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    token_data: dict = Depends(get_token_data),
    request: Request = None,
) -> dict:
    """
    List all agents for current tenant (Phase 2).
    Auth and tenant_id passed via Bearer token from frontend.
    """
    try:
        tenant_id = token_data["tenant_id"]
        user_id = token_data["user_id"]
        
        supabase = await get_supabase_client(request)
        service = AgentService(supabase)
        
        agents, total = await service.list_agents(
            tenant_id=tenant_id,
            status=status,
            tag=tag,
            search=search,
            page=page,
            page_size=page_size,
        )
        
        logger.info("Listed %d agents for tenant %s", len(agents), tenant_id)
        
        return {
            "agents": [a.model_dump() for a in agents],
            "total": total,
            "page": page,
            "page_size": page_size,
            "has_next": (page * page_size) < total,
        }
    except AgentServiceError as e:
        logger.warning("Agent service error: %s", str(e))
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.exception("Error listing agents: %s", str(e))
        raise HTTPException(status_code=500, detail="Internal server error")


@router.get("/agents/v2/{agent_id}")
async def get_agent_v2(
    agent_id: str,
    token_data: dict = Depends(get_token_data),
    request: Request = None,
) -> dict:
    """
    Get agent detail by ID (Phase 2).
    """
    try:
        tenant_id = token_data["tenant_id"]
        user_id = token_data["user_id"]
        
        supabase = await get_supabase_client(request)
        service = AgentService(supabase)
        
        agent = await service.get_agent(tenant_id=tenant_id, agent_id=agent_id)
        
        logger.info("Retrieved agent %s for tenant %s", agent_id, tenant_id)
        
        return {
            "agent": agent.model_dump(),
        }
    except AgentServiceError as e:
        if "not found" in str(e).lower():
            raise HTTPException(status_code=404, detail=str(e))
        logger.warning("Agent service error: %s", str(e))
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.exception("Error retrieving agent: %s", str(e))
        raise HTTPException(status_code=500, detail="Internal server error")


@router.post("/agents/v2")
async def create_agent_v2(
    request_body: CreateAgentRequest,
    token_data: dict = Depends(get_token_data),
    request: Request = None,
) -> dict:
    """
    Create new agent draft (Phase 2).
    """
    try:
        tenant_id = token_data["tenant_id"]
        user_id = token_data["user_id"]
        
        supabase = await get_supabase_client(request)
        service = AgentService(supabase)
        
        agent = await service.create_agent(
            tenant_id=tenant_id,
            user_id=user_id,
            request=request_body,
        )
        
        logger.info("Created agent %s for tenant %s", agent.id, tenant_id)
        
        return {
            "agent": agent.model_dump(),
        }
    except AgentServiceError as e:
        logger.warning("Agent service error: %s", str(e))
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.exception("Error creating agent: %s", str(e))
        raise HTTPException(status_code=500, detail="Internal server error")


@router.patch("/agents/v2/{agent_id}")
async def update_agent_draft_v2(
    agent_id: str,
    request_body: UpdateAgentDraftRequest,
    token_data: dict = Depends(get_token_data),
    request: Request = None,
) -> dict:
    """
    Update agent draft (Phase 2).
    """
    try:
        tenant_id = token_data["tenant_id"]
        user_id = token_data["user_id"]
        
        supabase = await get_supabase_client(request)
        service = AgentService(supabase)
        
        agent = await service.update_agent_draft(
            tenant_id=tenant_id,
            agent_id=agent_id,
            user_id=user_id,
            request=request_body,
        )
        
        logger.info("Updated draft for agent %s", agent_id)
        
        return {
            "agent": agent.model_dump(),
        }
    except AgentServiceError as e:
        logger.warning("Agent service error: %s", str(e))
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.exception("Error updating agent: %s", str(e))
        raise HTTPException(status_code=500, detail="Internal server error")


@router.delete("/agents/v2/{agent_id}")
async def delete_agent_draft_v2(
    agent_id: str,
    token_data: dict = Depends(get_token_data),
    request: Request = None,
) -> dict:
    """
    Delete agent draft (Phase 2).
    """
    try:
        tenant_id = token_data["tenant_id"]
        user_id = token_data["user_id"]
        
        supabase = await get_supabase_client(request)
        service = AgentService(supabase)
        
        await service.delete_agent_draft(
            tenant_id=tenant_id,
            agent_id=agent_id,
        )
        
        logger.info("Deleted agent %s", agent_id)
        
        return {
            "success": True,
            "message": f"Agent {agent_id} deleted",
        }
    except AgentServiceError as e:
        logger.warning("Agent service error: %s", str(e))
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.exception("Error deleting agent: %s", str(e))
        raise HTTPException(status_code=500, detail="Internal server error")


@router.post("/agents/v2/{agent_id}/publish")
async def publish_agent_v2(
    agent_id: str,
    request_body: PublishAgentRequest,
    token_data: dict = Depends(get_token_data),
    request: Request = None,
) -> dict:
    """
    Publish agent draft to create immutable version (Phase 2).
    """
    try:
        tenant_id = token_data["tenant_id"]
        user_id = token_data["user_id"]
        
        supabase = await get_supabase_client(request)
        service = AgentService(supabase)
        
        version = await service.publish_agent(
            tenant_id=tenant_id,
            agent_id=agent_id,
            user_id=user_id,
            request=request_body,
        )
        
        logger.info("Published agent %s as version %s", agent_id, version.version)
        
        return {
            "version": version.model_dump(),
        }
    except AgentServiceError as e:
        logger.warning("Agent service error: %s", str(e))
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.exception("Error publishing agent: %s", str(e))
        raise HTTPException(status_code=500, detail="Internal server error")


@router.post("/agents/v2/{agent_id}/rollback")
async def rollback_agent_v2(
    agent_id: str,
    request_body: RollbackAgentRequest,
    token_data: dict = Depends(get_token_data),
    request: Request = None,
) -> dict:
    """
    Rollback agent to a specific version (Phase 2).
    """
    try:
        tenant_id = token_data["tenant_id"]
        user_id = token_data["user_id"]
        
        supabase = await get_supabase_client(request)
        service = AgentService(supabase)
        
        agent = await service.rollback_agent(
            tenant_id=tenant_id,
            agent_id=agent_id,
            user_id=user_id,
            request=request_body,
        )
        
        logger.info("Rolled back agent %s to version %s", agent_id, request_body.version)
        
        return {
            "agent": agent.model_dump(),
        }
    except AgentServiceError as e:
        logger.warning("Agent service error: %s", str(e))
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.exception("Error rolling back agent: %s", str(e))
        raise HTTPException(status_code=500, detail="Internal server error")


@router.get("/agents/v2/{agent_id}/versions")
async def get_agent_versions_v2(
    agent_id: str,
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=50),
    token_data: dict = Depends(get_token_data),
    request: Request = None,
) -> dict:
    """
    Get all versions of an agent (Phase 2).
    """
    try:
        tenant_id = token_data["tenant_id"]
        
        supabase = await get_supabase_client(request)
        service = AgentService(supabase)
        
        versions = await service.get_agent_versions(
            tenant_id=tenant_id,
            agent_id=agent_id,
            page=page,
            page_size=page_size,
        )
        
        logger.info("Retrieved %d versions for agent %s", len(versions), agent_id)
        
        return {
            "versions": [v.model_dump() for v in versions],
            "total": len(versions),
            "page": page,
            "page_size": page_size,
            "has_next": len(versions) >= page_size,
        }
    except AgentServiceError as e:
        logger.warning("Agent service error: %s", str(e))
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.exception("Error retrieving agent versions: %s", str(e))
        raise HTTPException(status_code=500, detail="Internal server error")


@router.get("/agents/v2/{agent_id}/export")
async def export_agent_version_v2(
    agent_id: str,
    version: Optional[str] = Query(None),
    token_data: dict = Depends(get_token_data),
    request: Request = None,
) -> dict:
    """
    Export agent version as canonical JSON (Phase 2).
    """
    try:
        tenant_id = token_data["tenant_id"]
        
        supabase = await get_supabase_client(request)
        service = AgentService(supabase)
        
        exported = await service.export_agent_version(
            tenant_id=tenant_id,
            agent_id=agent_id,
            version=version,
        )
        
        logger.info("Exported agent %s version %s", agent_id, version or "latest")
        
        return {
            "exported": exported,
        }
    except AgentServiceError as e:
        logger.warning("Agent service error: %s", str(e))
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.exception("Error exporting agent: %s", str(e))
        raise HTTPException(status_code=500, detail="Internal server error")
        logger.exception("Error publishing agent: %s", str(e))
        raise HTTPException(status_code=500, detail="Internal server error")
