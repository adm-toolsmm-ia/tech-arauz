"""
SQL QA Chain — LCEL chain for SQL generation and execution.

5-step pipeline:
1. Intent Classification (fast model)
2. SQL Generation (if data_query)
3. SQL Validation
4. Query Execution
5. Response Formatting

Each step has observability (LangSmith spans) and error handling.
"""

import json
import logging
import time
from typing import Any, Optional

from langchain_core.messages import SystemMessage, HumanMessage
from langchain_core.runnables import Runnable, RunnableLambda
from pydantic import BaseModel
from supabase import AsyncClient

from app.chains.sql_validator import SQLValidationError, validate_sql
from app.config import get_settings
from app.instrumentation.budget import BudgetExceededError, get_budget_manager
from app.instrumentation.logging import log_event
from app.instrumentation.tracing import create_span, get_current_run, get_trace_url, with_run_context
from app.instrumentation.wrappers import wrap_llm_call
from app.llm.factory import LLMProviderError, create_with_fallback, get_llm

logger = logging.getLogger("obs.sql_qa")

# Schema for SQL generation (whitelisted tables only)
SCHEMA_FOR_SQL = """
-- projects: id, tenant_id, espaider_id, codigo, titulo, situacao_original, status_original, responsavel, prioridade, categoria, prazo_final, fase_atual, cronograma_atual, prazo_cronograma, area, data_encerramento, created_at, updated_at
-- project_schedules: id, tenant_id, project_id, espaider_id, atividade, responsavel, data_inicio, data_fim, status, fase_atividade, atrasado, data_prazo, created_at, updated_at
-- project_deliveries: id, tenant_id, project_id, espaider_id, titulo, status, prioridade, data_prevista, data_realizada, created_at, updated_at
-- project_requirements: id, tenant_id, project_id, espaider_id, codigo, descricao, tipo, prioridade, created_at, updated_at
-- project_histories: id, tenant_id, project_id, data, evento, descricao, created_at
-- project_budgets: id, tenant_id, project_id, valor_previsto, valor_realizado, created_at, updated_at

Todas as tabelas têm tenant_id (UUID). Use sempre tenant_id no WHERE para isolamento.
"""


class SQLQAResult(BaseModel):
    """Result of SQL QA chain execution."""

    answer: str
    sql_query: Optional[str] = None
    row_count: Optional[int] = None
    tokens_used: int = 0
    cost_usd: float = 0.0
    duration_ms: int = 0
    trace_url: Optional[str] = None
    error: Optional[str] = None
    error_code: Optional[str] = None


def build_sql_qa_chain(
    agent_config: dict[str, Any],
    message_history: list[dict[str, str]],
) -> Runnable:
    """Build SQL QA LCEL chain.

    Args:
        agent_config: Agent configuration (provider, model_id, temperature, etc.)
        message_history: Conversation history for context

    Returns:
        LCEL Runnable that accepts { input: str } and returns { answer, sql_query, ... }
    """
    # Placeholder implementation — full chain would be more complex
    # This demonstrates the pattern for Story 4.4

    def process_input(user_input: str) -> dict[str, Any]:
        """Process user input through the chain."""
        return {
            "answer": f"Processando: {user_input}",
            "sql_query": None,
            "row_count": None,
            "tokens_used": 0,
            "cost_usd": 0.0,
        }

    return RunnableLambda(process_input)


async def run_sql_qa(
    agent_id: str,
    tenant_id: str,
    session_id: str,
    user_message: str,
    message_history: list[dict[str, Any]],
    supabase: AsyncClient,
    agent_config: Optional[dict[str, Any]] = None,
) -> SQLQAResult:
    """Execute SQL QA chain with full observability and error handling.

    5-step pipeline:
    1. Intent Classification
    2. SQL Generation (if data_query)
    3. SQL Validation
    4. Query Execution
    5. Response Formatting

    Args:
        agent_id: Agent ID
        tenant_id: Tenant ID (for isolation)
        session_id: Chat session ID
        user_message: User input message
        message_history: Previous messages in session
        supabase: Supabase async client
        agent_config: Agent configuration (provider, model, etc.)

    Returns:
        SQLQAResult with answer, sql_query, tokens, cost, error info
    """
    agent_config = agent_config or {}
    t0 = time.perf_counter()
    run_id = None

    try:
        settings = get_settings()
        bm = get_budget_manager()

        # Get current run context or create new
        current_run = get_current_run()
        run_id = current_run.run_id if current_run else None

        # Pre-flight budget check
        try:
            bm.assert_remaining(session_id=session_id, agent_id=agent_id)
        except BudgetExceededError as exc:
            duration_ms = round((time.perf_counter() - t0) * 1000)
            return SQLQAResult(
                answer="Orçamento mensal excedido para este agente.",
                tokens_used=0,
                cost_usd=0.0,
                duration_ms=duration_ms,
                trace_url=get_trace_url(run_id) if run_id else None,
                error=str(exc),
                error_code="budget_exceeded",
            )

        # Step 1: Intent Classification
        intent = await _classify_intent(user_message, agent_config)
        log_event("sql_qa.intent_classified", agent_id=agent_id, intent=intent)

        # If not a data query, just respond with chit-chat
        if intent != "data_query":
            answer = await _format_chit_chat_response(user_message, agent_config)
            duration_ms = round((time.perf_counter() - t0) * 1000)
            return SQLQAResult(
                answer=answer,
                tokens_used=0,
                cost_usd=0.0,
                duration_ms=duration_ms,
                trace_url=get_trace_url(run_id) if run_id else None,
            )

        # Step 2: SQL Generation
        raw_sql = await _generate_sql(
            user_message,
            message_history,
            agent_config,
            tenant_id=tenant_id,
            supabase=supabase,
        )
        if not raw_sql:
            answer = "Não consegui gerar uma query para essa pergunta. Tente ser mais específico."
            duration_ms = round((time.perf_counter() - t0) * 1000)
            return SQLQAResult(
                answer=answer,
                tokens_used=0,
                cost_usd=0.0,
                duration_ms=duration_ms,
                trace_url=get_trace_url(run_id) if run_id else None,
                error="SQL generation failed",
                error_code="sql_generation_error",
            )

        # Step 3: SQL Validation
        try:
            clean_sql = validate_sql(
                raw_sql,
                tenant_id=tenant_id,
                default_limit=settings.sql_qa_default_limit,
                max_limit=settings.sql_qa_max_limit,
            )
        except SQLValidationError as exc:
            answer = f"A query não é segura. Motivo: {exc.error_code}"
            duration_ms = round((time.perf_counter() - t0) * 1000)
            return SQLQAResult(
                answer=answer,
                sql_query=raw_sql,
                tokens_used=0,
                cost_usd=0.0,
                duration_ms=duration_ms,
                trace_url=get_trace_url(run_id) if run_id else None,
                error=str(exc),
                error_code=exc.error_code,
            )

        # Step 4: Query Execution
        rows, row_count = await _execute_query(clean_sql, supabase)
        log_event(
            "sql_qa.query_executed",
            agent_id=agent_id,
            row_count=row_count,
        )

        # Step 5: Response Formatting
        answer = await _format_response(
            user_message,
            rows,
            agent_config,
            tenant_id=tenant_id,
            supabase=supabase,
        )

        # Charge budget
        cost_usd = 0.0  # TODO: estimate from tokens
        bm.charge(cost_usd, session_id=session_id, agent_id=agent_id)

        duration_ms = round((time.perf_counter() - t0) * 1000)

        log_event(
            "sql_qa.complete",
            agent_id=agent_id,
            duration_ms=duration_ms,
            cost_usd=cost_usd,
            row_count=row_count,
        )

        return SQLQAResult(
            answer=answer,
            sql_query=clean_sql,
            row_count=row_count,
            tokens_used=0,
            cost_usd=cost_usd,
            duration_ms=duration_ms,
            trace_url=get_trace_url(run_id) if run_id else None,
        )

    except Exception as exc:
        logger.exception("Error in SQL QA chain: %s", str(exc))
        duration_ms = round((time.perf_counter() - t0) * 1000)
        return SQLQAResult(
            answer="Erro ao processar sua pergunta. Tente novamente.",
            tokens_used=0,
            cost_usd=0.0,
            duration_ms=duration_ms,
            trace_url=get_trace_url(run_id) if run_id else None,
            error=str(exc),
            error_code="internal_error",
        )


async def _classify_intent(user_message: str, agent_config: dict[str, Any]) -> str:
    """Classify user intent (data_query, chit_chat, out_of_scope).

    Uses fast model (gpt-4o-mini) for cost efficiency.

    Args:
        user_message: User input
        agent_config: Agent configuration

    Returns:
        Intent classification: "data_query", "chit_chat", or "out_of_scope"
    """
    try:
        with create_span("intent_classify", kind="llm.call") as span:
            # TODO: Call actual LLM for classification
            # For now, placeholder logic
            user_lower = user_message.lower()

            if any(w in user_lower for w in ["projeto", "cronograma", "entrega", "orçamento", "histórico", "requisito"]):
                intent = "data_query"
            elif any(w in user_lower for w in ["olá", "oi", "como vai", "obrigado"]):
                intent = "chit_chat"
            else:
                intent = "chit_chat"

            span.attributes.update({
                "input.preview": user_message[:100],
                "output.intent": intent,
            })

            return intent

    except Exception as exc:
        logger.warning("Intent classification failed: %s", str(exc))
        return "chit_chat"  # Safe fallback


async def _generate_sql(
    user_message: str,
    message_history: list[dict[str, Any]],
    agent_config: dict[str, Any],
    *,
    tenant_id: str,
    supabase: AsyncClient,
) -> Optional[str]:
    """Generate SQL from user message using LLM with schema context.

    Uses agent's configured model (gpt-4o, claude-3, etc.)

    Args:
        user_message: User question
        message_history: Conversation context
        agent_config: Agent configuration
        tenant_id: Tenant ID (for LLM fallback)
        supabase: Supabase client (for LLM fallback)

    Returns:
        Generated SQL string or None if failed
    """
    try:
        with create_span("sql_generate", kind="llm.call") as span:
            model_config = agent_config.get("model", {})
            provider = model_config.get("provider", "openai")
            model_id = model_config.get("model_id", "gpt-4o-mini")
            temperature = model_config.get("temperature", 0.2)
            max_tokens = model_config.get("max_tokens", 500)

            llm, _, _ = await create_with_fallback(
                primary_provider=provider,
                primary_model_id=model_id,
                supabase_client=supabase,
                tenant_id=tenant_id,
                temperature=temperature,
                max_tokens=max_tokens,
            )

            history_context = ""
            if message_history:
                recent = message_history[-3:]
                history_context = "\n".join(
                    f"{m.get('role', 'user')}: {m.get('content', '')[:200]}"
                    for m in recent
                )

            system_prompt = f"""Você é um assistente que gera SQL PostgreSQL para consultar dados de projetos.
Schema disponível (apenas estas tabelas):
{SCHEMA_FOR_SQL}

Regras:
- Gere APENAS SELECT. Não use INSERT, UPDATE, DELETE.
- Use apenas tabelas: projects, project_schedules, project_deliveries, project_requirements, project_histories, project_budgets.
- Retorne SEMPRE o SQL puro, sem markdown, sem explicação."""
            user_prompt = f"""Pergunta: {user_message}
{f'Contexto da conversa:\n{history_context}' if history_context else ''}

Gere o SQL para responder à pergunta."""
            messages = [
                SystemMessage(content=system_prompt),
                HumanMessage(content=user_prompt),
            ]
            response = await llm.ainvoke(messages)
            sql = (response.content or "").strip()
            # Remove markdown code blocks if present
            if sql.startswith("```"):
                lines = sql.split("\n")
                if lines[0].startswith("```"):
                    lines = lines[1:]
                if lines and lines[-1].strip() == "```":
                    lines = lines[:-1]
                sql = "\n".join(lines)
            sql = sql.strip() or None

            span.attributes.update({
                "input.preview": user_message[:100],
                "output.sql": (sql or "")[:200],
            })

            return sql

    except Exception as exc:
        logger.warning("SQL generation failed: %s", str(exc))
        return None


async def _execute_query(
    clean_sql: str,
    supabase: AsyncClient,
) -> tuple[list[dict[str, Any]], int]:
    """Execute SQL query via Supabase RPC execute_readonly_query.

    Args:
        clean_sql: Validated SQL query (tenant_id already injected by sql_validator)
        supabase: Supabase async client

    Returns:
        Tuple: (rows, row_count)
    """
    try:
        with create_span("query_execute", kind="tool.call") as span:
            response = await supabase.rpc(
                "execute_readonly_query",
                {"query_text": clean_sql},
            ).execute()

            # RPC returns SETOF jsonb: list of row objects
            data = response.data or []
            rows = []
            for item in data:
                if isinstance(item, dict):
                    rows.append(item)
                else:
                    rows.append({"value": item})

            row_count = len(rows)

            span.attributes.update({
                "output.row_count": row_count,
                "output.preview": str(rows)[:200],
            })

            return rows, row_count

    except Exception as exc:
        logger.exception("Query execution failed: %s", str(exc))
        raise


async def _format_response(
    user_message: str,
    rows: list[dict[str, Any]],
    agent_config: dict[str, Any],
    *,
    tenant_id: str = "",
    supabase: Optional[AsyncClient] = None,
) -> str:
    """Format query results into PT-BR prose response.

    Args:
        user_message: Original user question
        rows: Query results
        agent_config: Agent configuration
        tenant_id: Tenant ID (for optional LLM formatting)
        supabase: Supabase client (for optional LLM formatting)

    Returns:
        Formatted response in Portuguese (PT-BR)
    """
    try:
        with create_span("response_format", kind="llm.call") as span:
            if not rows:
                answer = "Nenhum resultado encontrado para sua pergunta."
            else:
                # Simple formatting: summarize count and list key fields
                count = len(rows)
                sample = rows[0]
                keys = [k for k in sample.keys() if k not in ("tenant_id", "espaider_raw")]
                if "titulo" in sample or "titulo" in keys:
                    items = [r.get("titulo", r.get("codigo", str(r)[:50])) for r in rows[:10]]
                    answer = f"Encontrei {count} registro(s). "
                    if count <= 10:
                        answer += "Detalhes: " + "; ".join(str(i) for i in items)
                    else:
                        answer += f"Primeiros: {', '.join(str(i) for i in items)}..."
                elif "codigo" in sample or "codigo" in keys:
                    items = [r.get("codigo", str(r)[:30]) for r in rows[:10]]
                    answer = f"Encontrei {count} registro(s): {', '.join(str(i) for i in items)}"
                    if count > 10:
                        answer += "..."
                else:
                    answer = f"Encontrei {count} registro(s). " + json.dumps(rows[:3], default=str, ensure_ascii=False)[:300]
                    if count > 3:
                        answer += "..."

            span.attributes.update({
                "input.preview": user_message[:100],
                "output.preview": answer[:100],
            })

            return answer

    except Exception as exc:
        logger.warning("Response formatting failed: %s", str(exc))
        return f"Resultados: {json.dumps(rows[:5], default=str, ensure_ascii=False)}"


async def _format_chit_chat_response(
    user_message: str,
    agent_config: dict[str, Any],
) -> str:
    """Generate chit-chat response (not data query).

    Args:
        user_message: User input
        agent_config: Agent configuration

    Returns:
        Friendly response
    """
    try:
        # TODO: Call LLM for friendly response
        if "olá" in user_message.lower() or "oi" in user_message.lower():
            return "Oi! Como posso ajudá-lo com informações sobre seus projetos?"
        else:
            return "Que pergunta interessante! Gostaria de saber mais sobre seus projetos?"

    except Exception as exc:
        logger.warning("Chit-chat response generation failed: %s", str(exc))
        return "Desculpe, não consegui entender sua pergunta. Pode reformular?"
