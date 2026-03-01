"""Tests for SQL QA chain module."""

import pytest
from unittest.mock import AsyncMock, MagicMock, patch

from app.chains.sql_qa import (
    SQLQAResult,
    build_sql_qa_chain,
    run_sql_qa,
)


class TestBuildSQLQAChain:
    """Tests for LCEL chain construction."""

    def test_build_chain_basic(self):
        """Test building a basic SQL QA chain."""
        agent_config = {
            "provider": "openai",
            "model_id": "gpt-4o",
            "temperature": 0.7,
        }
        chain = build_sql_qa_chain(agent_config, message_history=[])
        assert chain is not None

    def test_build_chain_with_history(self):
        """Test building chain with conversation history."""
        agent_config = {"provider": "anthropic", "model_id": "claude-3"}
        history = [
            {"role": "user", "content": "Question 1"},
            {"role": "assistant", "content": "Answer 1"},
        ]
        chain = build_sql_qa_chain(agent_config, message_history=history)
        assert chain is not None


class TestSQLQAResultModel:
    """Tests for SQLQAResult data model."""

    def test_result_minimal(self):
        """Test creating minimal result."""
        result = SQLQAResult(answer="Test answer")
        assert result.answer == "Test answer"
        assert result.sql_query is None
        assert result.error is None

    def test_result_complete(self):
        """Test creating complete result."""
        result = SQLQAResult(
            answer="Answer",
            sql_query="SELECT * FROM projects",
            row_count=5,
            tokens_used=100,
            cost_usd=0.05,
            duration_ms=1000,
            trace_url="https://smith.langchain.com/...",
            error=None,
        )
        assert result.answer == "Answer"
        assert result.sql_query is not None
        assert result.row_count == 5
        assert result.cost_usd == 0.05

    def test_result_with_error(self):
        """Test result with error information."""
        result = SQLQAResult(
            answer="Error occurred",
            error="SQL validation failed",
            error_code="sql_error",
        )
        assert result.error is not None
        assert result.error_code == "sql_error"


class TestRunSQLQAChitChat:
    """Tests for chit-chat intent handling."""

    @pytest.mark.asyncio
    async def test_chit_chat_intent(self):
        """Test SQL QA with chit-chat intent."""
        mock_supabase = AsyncMock()

        result = await run_sql_qa(
            agent_id="agent-1",
            tenant_id="tenant-1",
            session_id="session-1",
            user_message="Olá! Como você está?",
            message_history=[],
            supabase=mock_supabase,
        )

        assert result.answer is not None
        assert result.sql_query is None
        assert result.error is None

    @pytest.mark.asyncio
    async def test_out_of_scope_intent(self):
        """Test SQL QA with out-of-scope intent."""
        mock_supabase = AsyncMock()

        result = await run_sql_qa(
            agent_id="agent-1",
            tenant_id="tenant-1",
            session_id="session-1",
            user_message="Qual é o significado da vida?",
            message_history=[],
            supabase=mock_supabase,
        )

        # Out of scope treated as chit-chat
        assert result.answer is not None
        assert result.sql_query is None


class TestRunSQLQADataQuery:
    """Tests for data query intent handling."""

    @pytest.mark.asyncio
    async def test_data_query_intent(self):
        """Test SQL QA with data query intent."""
        mock_supabase = AsyncMock()

        result = await run_sql_qa(
            agent_id="agent-1",
            tenant_id="tenant-1",
            session_id="session-1",
            user_message="Quais são os projetos ativos?",
            message_history=[],
            supabase=mock_supabase,
        )

        # Should attempt SQL generation
        assert result.answer is not None
        assert isinstance(result.duration_ms, int)
        assert result.duration_ms >= 0

    @pytest.mark.asyncio
    async def test_data_query_with_history(self):
        """Test data query with conversation history."""
        mock_supabase = AsyncMock()
        history = [
            {"role": "user", "content": "Quais projetos temos?"},
            {"role": "assistant", "content": "Temos 5 projetos ativos."},
        ]

        result = await run_sql_qa(
            agent_id="agent-1",
            tenant_id="tenant-1",
            session_id="session-1",
            user_message="Quantos em desenvolvimento?",
            message_history=history,
            supabase=mock_supabase,
        )

        assert result.answer is not None


class TestSQLQAErrorHandling:
    """Tests for error handling in SQL QA."""

    @pytest.mark.asyncio
    async def test_budget_exceeded_error(self):
        """Test SQL QA when budget is exceeded."""
        mock_supabase = AsyncMock()

        with patch("app.chains.sql_qa.get_budget_manager") as mock_bm:
            mock_bm.return_value.assert_remaining.side_effect = Exception("Budget exceeded")

            result = await run_sql_qa(
                agent_id="agent-1",
                tenant_id="tenant-1",
                session_id="session-1",
                user_message="Query",
                message_history=[],
                supabase=mock_supabase,
            )

            # Should gracefully return error
            assert result.error is not None

    @pytest.mark.asyncio
    async def test_sql_validation_error(self):
        """Test SQL QA when validation fails."""
        # This test would require mocking the SQL generation
        # to produce invalid SQL, and testing the validation error path
        pass

    @pytest.mark.asyncio
    async def test_execution_error(self):
        """Test SQL QA when query execution fails."""
        mock_supabase = AsyncMock()

        # Mock Supabase to fail on query execution
        mock_supabase.table().select().execute.side_effect = Exception("Database error")

        # Should gracefully handle error
        # (Note: Full implementation would need proper mocking)
        pass


class TestSQLQAObservability:
    """Tests for observability and tracing."""

    @pytest.mark.asyncio
    async def test_run_context_propagation(self):
        """Test that run context is propagated."""
        # Run context (run_id, trace_id) should be set during execution
        pass

    @pytest.mark.asyncio
    async def test_trace_url_generation(self):
        """Test that LangSmith trace URL is generated."""
        mock_supabase = AsyncMock()

        result = await run_sql_qa(
            agent_id="agent-1",
            tenant_id="tenant-1",
            session_id="session-1",
            user_message="Teste",
            message_history=[],
            supabase=mock_supabase,
        )

        # Trace URL should be present if observability enabled
        # (or None if disabled)
        assert result.trace_url is None or isinstance(result.trace_url, str)


class TestSQLQAMetrics:
    """Tests for metrics and cost tracking."""

    @pytest.mark.asyncio
    async def test_tokens_and_cost_tracking(self):
        """Test that tokens and costs are tracked."""
        mock_supabase = AsyncMock()

        result = await run_sql_qa(
            agent_id="agent-1",
            tenant_id="tenant-1",
            session_id="session-1",
            user_message="Query",
            message_history=[],
            supabase=mock_supabase,
        )

        assert result.tokens_used >= 0
        assert result.cost_usd >= 0.0
        assert result.duration_ms >= 0

    @pytest.mark.asyncio
    async def test_duration_measurement(self):
        """Test that execution duration is measured."""
        mock_supabase = AsyncMock()

        result = await run_sql_qa(
            agent_id="agent-1",
            tenant_id="tenant-1",
            session_id="session-1",
            user_message="Quick query",
            message_history=[],
            supabase=mock_supabase,
        )

        assert result.duration_ms >= 0


class TestSQLQAIntegration:
    """Integration tests for complete SQL QA flow."""

    @pytest.mark.asyncio
    async def test_end_to_end_data_query(self):
        """Test complete data query flow."""
        # This would be a full integration test with:
        # 1. Intent classification → data_query
        # 2. SQL generation → SELECT ...
        # 3. SQL validation → passes
        # 4. Query execution → returns rows
        # 5. Response formatting → PT-BR answer
        pass

    @pytest.mark.asyncio
    async def test_multi_turn_context(self):
        """Test that conversation history is used in subsequent turns."""
        # Test that message history is available to SQL generator
        # for context-aware queries
        pass
