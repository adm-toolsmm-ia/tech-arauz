"""
Session Service — Chat session management and message persistence.

Handles:
- Session creation and retrieval (agent_sessions table)
- Message history loading (agent_messages table)
- Turn persistence (user + assistant message pairs)
- Daily usage tracking (agent_usage_daily table)
"""

import logging
import uuid
from datetime import date, datetime
from typing import Any, Optional

from supabase import AsyncClient

logger = logging.getLogger("obs.session_service")


class SessionServiceError(Exception):
    """Raised when session operations fail."""

    def __init__(
        self,
        error_code: str,
        message: str,
    ) -> None:
        """Initialize SessionServiceError.

        Args:
            error_code: Error classification (not_found, access_denied, database_error)
            message: Human-readable error message
        """
        self.error_code = error_code
        self.message = message
        super().__init__(f"[{error_code}] {message}")


async def get_or_create_session(
    agent_id: str,
    session_id: Optional[str],
    tenant_id: str,
    user_id: str,
    supabase: AsyncClient,
) -> dict[str, Any]:
    """Get or create a chat session.

    Args:
        agent_id: Agent ID
        session_id: Existing session ID (if None, create new)
        tenant_id: Tenant ID (for isolation)
        user_id: User ID who owns the session
        supabase: Supabase async client

    Returns:
        Session dict with: id, agent_id, user_id, tenant_id, started_at, status, token_usage

    Raises:
        SessionServiceError: If session not found or access denied
    """
    if session_id:
        # Retrieve existing session
        try:
            response = await supabase.table("agent_sessions").select(
                "id, agent_id, user_id, tenant_id, started_at, status, token_usage"
            ).eq("id", session_id).eq("tenant_id", tenant_id).execute()

            if not response.data:
                raise SessionServiceError(
                    error_code="not_found",
                    message=f"Session {session_id} not found or access denied",
                )

            return response.data[0]

        except SessionServiceError:
            raise
        except Exception as exc:
            logger.exception("Error retrieving session: %s", str(exc))
            raise SessionServiceError(
                error_code="database_error",
                message=f"Failed to retrieve session: {str(exc)}",
            )
    else:
        # Create new session
        try:
            new_session = {
                "id": str(uuid.uuid4()),
                "agent_id": agent_id,
                "user_id": user_id,
                "tenant_id": tenant_id,
                "started_at": datetime.utcnow().isoformat(),
                "status": "active",
                "token_usage": 0,
            }

            response = await supabase.table("agent_sessions").insert([new_session]).execute()

            if not response.data:
                raise SessionServiceError(
                    error_code="database_error",
                    message="Failed to create session (INSERT returned no data)",
                )

            logger.info("Created session %s for agent %s", new_session["id"], agent_id)
            return response.data[0]

        except SessionServiceError:
            raise
        except Exception as exc:
            logger.exception("Error creating session: %s", str(exc))
            raise SessionServiceError(
                error_code="database_error",
                message=f"Failed to create session: {str(exc)}",
            )


async def load_message_history(
    session_id: str,
    supabase: AsyncClient,
    limit: int = 10,
) -> list[dict[str, Any]]:
    """Load message history for a session.

    Args:
        session_id: Session ID
        supabase: Supabase async client
        limit: Maximum number of messages to return (default: 10)

    Returns:
        List of messages: [{ id, role, content, created_at, tokens_used }, ...]
        Ordered by created_at ASC (oldest first, for LCEL context)
    """
    try:
        response = await supabase.table("agent_messages").select(
            "id, role, content, created_at, tokens_used"
        ).eq("session_id", session_id).order(
            "created_at", desc=False
        ).limit(limit).execute()

        logger.debug("Loaded %d messages for session %s", len(response.data), session_id)
        return response.data if response.data else []

    except Exception as exc:
        logger.exception("Error loading message history: %s", str(exc))
        # Graceful degradation: return empty list on error
        return []


async def persist_turn(
    session_id: str,
    tenant_id: str,
    user_msg: str,
    assistant_msg: str,
    run_id: str,
    supabase: AsyncClient,
    metadata: Optional[dict[str, Any]] = None,
) -> tuple[str, str]:
    """Persist a user/assistant message pair.

    Args:
        session_id: Session ID
        tenant_id: Tenant ID
        user_msg: User message content
        assistant_msg: Assistant message content
        run_id: Run ID from LangSmith (for tracing)
        supabase: Supabase async client
        metadata: Optional metadata (tokens, cost, trace_url, etc.)

    Returns:
        Tuple: (user_message_id, assistant_message_id)

    Raises:
        SessionServiceError: If INSERT fails
    """
    metadata = metadata or {}
    now = datetime.utcnow().isoformat()
    user_message_id = str(uuid.uuid4())
    assistant_message_id = str(uuid.uuid4())

    user_record = {
        "id": user_message_id,
        "session_id": session_id,
        "tenant_id": tenant_id,
        "role": "user",
        "content": user_msg,
        "metadata": {"run_id": run_id, **metadata},
        "tokens_used": 0,
        "created_at": now,
    }

    assistant_record = {
        "id": assistant_message_id,
        "session_id": session_id,
        "tenant_id": tenant_id,
        "role": "assistant",
        "content": assistant_msg,
        "metadata": {"run_id": run_id, **metadata},
        "tokens_used": 0,
        "created_at": now,
    }

    try:
        # Insert both messages
        response = await supabase.table("agent_messages").insert(
            [user_record, assistant_record]
        ).execute()

        if not response.data or len(response.data) < 2:
            raise SessionServiceError(
                error_code="database_error",
                message="Failed to persist messages (INSERT returned incomplete data)",
            )

        logger.info(
            "Persisted turn for session %s (user: %s, assistant: %s)",
            session_id,
            user_message_id,
            assistant_message_id,
        )
        return (user_message_id, assistant_message_id)

    except SessionServiceError:
        raise
    except Exception as exc:
        logger.exception("Error persisting turn: %s", str(exc))
        raise SessionServiceError(
            error_code="database_error",
            message=f"Failed to persist messages: {str(exc)}",
        )


async def update_usage_daily(
    agent_id: str,
    tenant_id: str,
    supabase: AsyncClient,
    run_result: dict[str, Any],
) -> None:
    """Update daily usage metrics (UPSERT).

    Args:
        agent_id: Agent ID
        tenant_id: Tenant ID
        supabase: Supabase async client
        run_result: Result dict with cost_usd, tokens_used, etc.
    """
    try:
        today = str(date.today())
        cost_usd = float(run_result.get("cost_usd", 0.0))
        tokens_used = int(run_result.get("tokens_used", 0))

        # Upsert into agent_usage_daily
        # If row exists, increment; if not, create with initial values
        upsert_data = {
            "agent_id": agent_id,
            "tenant_id": tenant_id,
            "date": today,
            "sessions_count": 1,
            "messages_count": 1,
            "cost_total_usd": cost_usd,
            "avg_latency_ms": float(run_result.get("duration_ms", 0)),
            "success_rate_pct": 100.0,
            "created_at": datetime.utcnow().isoformat(),
        }

        # Supabase upsert: (tenant_id, agent_id, date) is unique key
        response = await supabase.table("agent_usage_daily").upsert(
            upsert_data,
            ignore_duplicates=False,
        ).execute()

        logger.debug("Updated daily usage for agent %s (date: %s)", agent_id, today)

    except Exception as exc:
        # Graceful degradation: log error but don't propagate
        logger.warning("Failed to update daily usage: %s", str(exc))
