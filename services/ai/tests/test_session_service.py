"""Tests for session service module."""

import pytest
from unittest.mock import AsyncMock, MagicMock

from app.services.session_service import (
    SessionServiceError,
    get_or_create_session,
    load_message_history,
    persist_turn,
    update_usage_daily,
)


class TestGetOrCreateSessionNew:
    """Tests for creating new sessions."""

    @pytest.mark.asyncio
    async def test_create_new_session(self):
        """Test creating a new session."""
        mock_supabase = AsyncMock()
        mock_supabase.table().insert().execute = AsyncMock(
            return_value=MagicMock(
                data=[{
                    "id": "session-123",
                    "agent_id": "agent-1",
                    "user_id": "user-1",
                    "tenant_id": "tenant-1",
                    "started_at": "2026-03-01T12:00:00",
                    "status": "active",
                    "token_usage": 0,
                }]
            )
        )

        session = await get_or_create_session(
            agent_id="agent-1",
            session_id=None,
            tenant_id="tenant-1",
            user_id="user-1",
            supabase=mock_supabase,
        )

        assert session["agent_id"] == "agent-1"
        assert session["status"] == "active"
        assert session["tenant_id"] == "tenant-1"

    @pytest.mark.asyncio
    async def test_create_session_database_error(self):
        """Test creating session with database error."""
        mock_supabase = AsyncMock()
        mock_supabase.table().insert().execute = AsyncMock(
            return_value=MagicMock(data=None)
        )

        with pytest.raises(SessionServiceError) as exc:
            await get_or_create_session(
                agent_id="agent-1",
                session_id=None,
                tenant_id="tenant-1",
                user_id="user-1",
                supabase=mock_supabase,
            )
        assert exc.value.error_code == "database_error"


class TestGetOrCreateSessionExisting:
    """Tests for retrieving existing sessions."""

    @pytest.mark.asyncio
    async def test_retrieve_existing_session(self):
        """Test retrieving an existing session."""
        mock_supabase = AsyncMock()
        mock_supabase.table().select().eq().eq().execute = AsyncMock(
            return_value=MagicMock(
                data=[{
                    "id": "existing-session",
                    "agent_id": "agent-1",
                    "tenant_id": "tenant-1",
                    "user_id": "user-1",
                    "started_at": "2026-03-01T12:00:00",
                    "status": "active",
                    "token_usage": 0,
                }]
            )
        )

        session = await get_or_create_session(
            agent_id="agent-1",
            session_id="existing-session",
            tenant_id="tenant-1",
            user_id="user-1",
            supabase=mock_supabase,
        )

        assert session["id"] == "existing-session"

    @pytest.mark.asyncio
    async def test_retrieve_missing_session(self):
        """Test retrieving a session that does not exist."""
        mock_supabase = AsyncMock()
        mock_supabase.table().select().eq().eq().execute = AsyncMock(
            return_value=MagicMock(data=[])
        )

        with pytest.raises(SessionServiceError) as exc:
            await get_or_create_session(
                agent_id="agent-1",
                session_id="missing-session",
                tenant_id="tenant-1",
                user_id="user-1",
                supabase=mock_supabase,
            )
        assert exc.value.error_code == "not_found"


class TestLoadMessageHistory:
    """Tests for loading message history."""

    @pytest.mark.asyncio
    async def test_load_messages_success(self):
        """Test loading message history."""
        mock_supabase = AsyncMock()
        mock_supabase.table().select().eq().order().limit().execute = AsyncMock(
            return_value=MagicMock(
                data=[
                    {
                        "id": "msg-1",
                        "role": "user",
                        "content": "Hello",
                        "created_at": "2026-03-01T12:00:00",
                        "tokens_used": 10,
                    },
                    {
                        "id": "msg-2",
                        "role": "assistant",
                        "content": "Hi!",
                        "created_at": "2026-03-01T12:01:00",
                        "tokens_used": 5,
                    },
                ]
            )
        )

        messages = await load_message_history(
            session_id="session-1",
            supabase=mock_supabase,
            limit=10,
        )

        assert len(messages) == 2
        assert messages[0]["role"] == "user"
        assert messages[1]["role"] == "assistant"

    @pytest.mark.asyncio
    async def test_load_empty_history(self):
        """Test loading history when no messages exist."""
        mock_supabase = AsyncMock()
        mock_supabase.table().select().eq().order().limit().execute = AsyncMock(
            return_value=MagicMock(data=[])
        )

        messages = await load_message_history(
            session_id="session-1",
            supabase=mock_supabase,
        )

        assert messages == []

    @pytest.mark.asyncio
    async def test_load_history_error_graceful(self):
        """Test graceful error handling when loading history."""
        mock_supabase = AsyncMock()
        mock_supabase.table().select().eq().order().limit().execute = AsyncMock(
            side_effect=Exception("Database error")
        )

        messages = await load_message_history(
            session_id="session-1",
            supabase=mock_supabase,
        )

        # Should return empty list on error
        assert messages == []


class TestPersistTurn:
    """Tests for persisting message turns."""

    @pytest.mark.asyncio
    async def test_persist_turn_success(self):
        """Test persisting a user/assistant message pair."""
        mock_supabase = AsyncMock()
        mock_supabase.table().insert().execute = AsyncMock(
            return_value=MagicMock(
                data=[
                    {"id": "user-msg-id"},
                    {"id": "asst-msg-id"},
                ]
            )
        )

        user_id, asst_id = await persist_turn(
            session_id="session-1",
            tenant_id="tenant-1",
            user_msg="What projects are active?",
            assistant_msg="There are 5 active projects.",
            run_id="run-123",
            supabase=mock_supabase,
            metadata={"tokens": 50},
        )

        assert user_id is not None
        assert asst_id is not None

    @pytest.mark.asyncio
    async def test_persist_turn_database_error(self):
        """Test persist turn with database error."""
        mock_supabase = AsyncMock()
        mock_supabase.table().insert().execute = AsyncMock(
            return_value=MagicMock(data=[])
        )

        with pytest.raises(SessionServiceError) as exc:
            await persist_turn(
                session_id="session-1",
                tenant_id="tenant-1",
                user_msg="Question",
                assistant_msg="Answer",
                run_id="run-123",
                supabase=mock_supabase,
            )
        assert exc.value.error_code == "database_error"


class TestUpdateUsageDaily:
    """Tests for updating daily usage metrics."""

    @pytest.mark.asyncio
    async def test_update_usage_success(self):
        """Test updating daily usage."""
        mock_supabase = AsyncMock()
        mock_supabase.table().upsert().execute = AsyncMock(
            return_value=MagicMock(data=[{"id": "upsert-1"}])
        )

        # Should not raise
        await update_usage_daily(
            agent_id="agent-1",
            tenant_id="tenant-1",
            supabase=mock_supabase,
            run_result={
                "cost_usd": 0.005,
                "tokens_used": 100,
                "duration_ms": 1000,
            },
        )

    @pytest.mark.asyncio
    async def test_update_usage_error_graceful(self):
        """Test graceful error handling when updating usage."""
        mock_supabase = AsyncMock()
        mock_supabase.table().upsert().execute = AsyncMock(
            side_effect=Exception("Database error")
        )

        # Should not raise (graceful degradation)
        await update_usage_daily(
            agent_id="agent-1",
            tenant_id="tenant-1",
            supabase=mock_supabase,
            run_result={"cost_usd": 0.001},
        )


class TestSessionServiceError:
    """Tests for SessionServiceError."""

    def test_error_attributes(self):
        """Test SessionServiceError attributes and string representation."""
        error = SessionServiceError("not_found", "Session not found")
        assert error.error_code == "not_found"
        assert error.message == "Session not found"
        assert "not_found" in str(error)
        assert "Session not found" in str(error)
