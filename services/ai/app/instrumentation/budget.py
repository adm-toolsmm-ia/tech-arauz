"""
Budget manager — enforces per-session / per-user / per-agent spending caps.

Limits are loaded from environment variables with sane defaults.  When a
limit is reached the manager raises :class:`BudgetExceededError` which the
API layer should catch and return HTTP 429.

Storage is **in-memory** for now.  The class exposes a clean interface so
that a Supabase-backed implementation can be swapped in later with zero
changes to call-sites.
"""

from __future__ import annotations

import logging
import os
import threading
from collections import defaultdict
from dataclasses import dataclass, field

logger = logging.getLogger("obs.budget")


# ---------------------------------------------------------------------------
# Exception
# ---------------------------------------------------------------------------

class BudgetExceededError(Exception):
    """Raised when a spending limit has been reached."""

    def __init__(self, scope: str, identifier: str, spent: float, limit: float):
        self.scope = scope
        self.identifier = identifier
        self.spent = spent
        self.limit = limit
        super().__init__(
            f"Budget exceeded for {scope}={identifier}: "
            f"spent ${spent:.6f} / limit ${limit:.2f}"
        )


# ---------------------------------------------------------------------------
# Budget record
# ---------------------------------------------------------------------------

@dataclass
class BudgetRecord:
    total_usd: float = 0.0
    call_count: int = 0


# ---------------------------------------------------------------------------
# Manager
# ---------------------------------------------------------------------------

class BudgetManager:
    """Thread-safe, in-memory spending tracker.

    Three independent scopes are supported:

    * **session** — per HTTP session / conversation
    * **user** — per authenticated user
    * **agent** — per agent id

    Each scope has its own configurable limit (env var → default).
    A value of ``0`` means *unlimited*.
    """

    def __init__(self) -> None:
        self._lock = threading.Lock()
        self._sessions: dict[str, BudgetRecord] = defaultdict(BudgetRecord)
        self._users: dict[str, BudgetRecord] = defaultdict(BudgetRecord)
        self._agents: dict[str, BudgetRecord] = defaultdict(BudgetRecord)

        # Load limits from env (0 = unlimited)
        self.limit_session = float(
            os.getenv("OBS_BUDGET_SESSION_USD", "0.50")
        )
        self.limit_user = float(
            os.getenv("OBS_BUDGET_USER_USD", "5.00")
        )
        self.limit_agent = float(
            os.getenv("OBS_BUDGET_AGENT_USD", "2.00")
        )

    # ------------------------------------------------------------------
    # Public API
    # ------------------------------------------------------------------

    def charge(
        self,
        cost_usd: float,
        *,
        session_id: str | None = None,
        user_id: str | None = None,
        agent_id: str | None = None,
    ) -> None:
        """Record a charge and raise if any limit is exceeded **after** it."""
        if cost_usd <= 0:
            return

        with self._lock:
            if session_id:
                rec = self._sessions[session_id]
                rec.total_usd += cost_usd
                rec.call_count += 1
                self._check(
                    "session", session_id, rec.total_usd, self.limit_session,
                )

            if user_id:
                rec = self._users[user_id]
                rec.total_usd += cost_usd
                rec.call_count += 1
                self._check(
                    "user", user_id, rec.total_usd, self.limit_user,
                )

            if agent_id:
                rec = self._agents[agent_id]
                rec.total_usd += cost_usd
                rec.call_count += 1
                self._check(
                    "agent", agent_id, rec.total_usd, self.limit_agent,
                )

    def assert_remaining(
        self,
        *,
        session_id: str | None = None,
        user_id: str | None = None,
        agent_id: str | None = None,
    ) -> None:
        """Pre-flight check — raises if any scope has already exceeded."""
        with self._lock:
            if session_id:
                self._check(
                    "session",
                    session_id,
                    self._sessions[session_id].total_usd,
                    self.limit_session,
                )
            if user_id:
                self._check(
                    "user",
                    user_id,
                    self._users[user_id].total_usd,
                    self.limit_user,
                )
            if agent_id:
                self._check(
                    "agent",
                    agent_id,
                    self._agents[agent_id].total_usd,
                    self.limit_agent,
                )

    def get_remaining(
        self,
        *,
        session_id: str | None = None,
        user_id: str | None = None,
        agent_id: str | None = None,
    ) -> dict[str, float]:
        """Return remaining budget per scope (``-1`` = unlimited)."""
        result: dict[str, float] = {}
        with self._lock:
            if session_id:
                spent = self._sessions[session_id].total_usd
                result["session"] = (
                    self.limit_session - spent
                    if self.limit_session > 0
                    else -1
                )
            if user_id:
                spent = self._users[user_id].total_usd
                result["user"] = (
                    self.limit_user - spent
                    if self.limit_user > 0
                    else -1
                )
            if agent_id:
                spent = self._agents[agent_id].total_usd
                result["agent"] = (
                    self.limit_agent - spent
                    if self.limit_agent > 0
                    else -1
                )
        return result

    def get_spent(
        self,
        *,
        session_id: str | None = None,
        user_id: str | None = None,
        agent_id: str | None = None,
    ) -> dict[str, float]:
        """Return total spent per scope."""
        result: dict[str, float] = {}
        with self._lock:
            if session_id:
                result["session"] = self._sessions[session_id].total_usd
            if user_id:
                result["user"] = self._users[user_id].total_usd
            if agent_id:
                result["agent"] = self._agents[agent_id].total_usd
        return result

    def reset(
        self,
        *,
        session_id: str | None = None,
        user_id: str | None = None,
        agent_id: str | None = None,
    ) -> None:
        """Reset accumulators (useful for testing)."""
        with self._lock:
            if session_id and session_id in self._sessions:
                del self._sessions[session_id]
            if user_id and user_id in self._users:
                del self._users[user_id]
            if agent_id and agent_id in self._agents:
                del self._agents[agent_id]

    # ------------------------------------------------------------------
    # Internal
    # ------------------------------------------------------------------

    @staticmethod
    def _check(scope: str, identifier: str, spent: float, limit: float) -> None:
        if limit <= 0:
            return  # unlimited
        if spent > limit:
            logger.warning(
                "Budget exceeded: scope=%s id=%s spent=%.6f limit=%.2f",
                scope, identifier, spent, limit,
            )
            raise BudgetExceededError(scope, identifier, spent, limit)


# ---------------------------------------------------------------------------
# Module-level singleton
# ---------------------------------------------------------------------------

_budget_manager: BudgetManager | None = None


def get_budget_manager() -> BudgetManager:
    """Return the global BudgetManager (created on first call)."""
    global _budget_manager
    if _budget_manager is None:
        _budget_manager = BudgetManager()
    return _budget_manager
