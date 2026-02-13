# Task Force Plan: Espaider Sync Expansion

**Pattern:** Squad
**Objective:** Sync 10 new fields from Espaider API

## 👥 Roster

1.  **Commander:** `orchestrator` (Strategy)

2.  **P0 Stream:**
    -   `explorer-agent`: Analyze Espaider API JSON response.
    -   `database-architect`: Update Supabase schema (add columns).

3.  **P1 Stream:**
    -   `backend-specialist`: Update Mapper logic + Sync Service.
    -   `test-engineer`: Write integration tests for new fields.

4.  **P2 Stream:**
    -   `frontend-specialist`: Display new fields on Project Dashboard.

## 🛡️ Security (Phase 4)
-   `security-auditor`: Audit input validation for new fields.

## ✅ Success Criteria
-   [ ] All 10 fields present in DB.
-   [ ] Sync job runs without error.
-   [ ] Data visible in UI.
