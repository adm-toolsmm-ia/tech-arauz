# Conflict Resolution Protocol

> **Scenario:** Two agents propose different solutions to the same problem.

---

## ⚖️ Resolution Framework

### 1. The "Trade-off" Method (Standard)

When agents disagree (e.g., Performance vs Readability):

1.  **Identify Constraints:** Is performance critical (P0)? Or is maintainability P0?
2.  **Consult Memory:** Check past logs (`chesterton-fence`). Has this been decided before?
3.  **Select & Log:** Choose the option that best fits *current* constraints.
    -   *Example:* "Chose readability because this is a admin script, not a hot path."

### 2. The "Specialist Override"

When domains overlap:

-   **Database Design:** `database-architect` overrides `backend-specialist`.
-   **API Contract:** `backend-specialist` overrides `frontend-specialist`.
-   **Security:** `security-auditor` overrides **EVERYONE**.
-   **UX/UI:** `frontend-specialist` overrides `backend-specialist`.

### 3. The "Orchestrator Decision" (Final Appeal)

If deadlock persists:
1.  Escalate to `orchestrator` (or human user).
2.  Orchestrator reviews both proposals.
3.  Orchestrator issues a binding decision.
4.  Decision is logged in a Memory Log.
