---
description: Protocolo oficial de ciclo de vida de demandas complexas gerenciadas pelo Orchestrator (CTO).
---

# 🎻 Orchestration Protocol (The CTO Workflow)

> **Objective:** Ensure consistent, high-quality delivery of complex tasks through structured agent coordination and memory management.

## 🔄 The Lifecycle of a Request

### Phase 1: Ingestion (The Gatekeeper)
**Actor:** `@orchestrator`
1.  **Receive Request:** Analyze user input.
2.  **Memory Check:** `ls .agent/memory` → `read relevant_logs`.
    *   *Question:* "Did we solve this already? What went wrong last time?"
3.  **Feasibility Check:** Can we do this with current tools/skills?

### Phase 2: Strategy (The Architect)
**Actor:** `@orchestrator` + `@project-planner`
1.  **Draft Plan:** Create/Update `task.md` or `implementation_plan.md`.
2.  **Team Assembly:** Define the "Task Force".
    *   *Example:* "Migration Task Force" = Backend (API) + Database (Schema) + DevOps (Deploy).

### Phase 3: Execution (The Conductor)
**Actor:** `@orchestrator` managing Specialists
1.  **Dispatch:** Send clear prompts to specialists.
    *   *Do:* "Frontend, update the Button component using strict Typescript."
    *   *Don't:* "Fix the button."
2.  **Monitor:** Watch tool outputs. If an agent gets stuck, intervene.
3.  **Synthesis:** Combine outputs into a cohesive solution.

### Phase 4: Validation (The Auditor)
**Actor:** `@orchestrator` + `@security-auditor` + `@test-engineer`
1.  **Static Analysis:** Lint, Type Check.
2.  **Security Review:** Inputs sanitized? Secrets protected? RLS active?
3.  **User Acceptance:** Does it match the original request?

### Phase 5: Documentation Sync (The Librarian)
**Actor:** `@documentation-writer`
1.  **Context Check:** Check if touched directories have `README.md`.
2.  **Doc Update:** Update `PRD.md`, `API.md` or `ARCHITECTURE.md` if business logic changed.
3.  **Validation:** Ensure docs match the new code reality.

### Phase 6: Memory Commit (The Historian)
**Actor:** `@orchestrator`
1.  **Log Creation:** Write `.agent/memory/YYYY-MM-DD_{context}.md`.
2.  **Reflect:** What did we learn? What should we update in `ARCHITECTURE.md`?

---

## 🚨 Emergency Protocols

- **Agent Failure:** If a specialist fails 3x, stop. Re-evaluate strategy.
- **Context Overload:** If the task is too big, break it down and ask User to proceed in steps.
- **Architectural Conflict:** If User asks for something that violates `ARCHITECTURE.md`, warn them (Politely but Firmly).
