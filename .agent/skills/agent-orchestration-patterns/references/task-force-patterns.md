# Task Force Patterns

> **Team Assembly Recipes** for common software engineering tasks.

---

## 🏗️ Pattern 1: The Pair (2 Agents)

**Use Case:** Small features, bug fixes, isolated components.
**Complexity:** Low

| Role        | Agent                | Responsibility             |
| ----------- | -------------------- | -------------------------- |
| **Lead**    | `backend-specialist` | Logic, API, Implementation |
| **Support** | `test-engineer`      | Testing, Validation        |

**Workflow:**
1.  Lead implements changes.
2.  Support reviews and adds tests.
3.  Lead fixes issues found by Support.

---

## 🚀 Pattern 2: The Trio (3 Agents)

**Use Case:** Full-stack feature (Database + API + UI).
**Complexity:** Medium

| Role      | Agent                 | Responsibility               |
| --------- | --------------------- | ---------------------------- |
| **Data**  | `database-architect`  | Schema, RLS, Migrations (P0) |
| **Logic** | `backend-specialist`  | API, Business Logic (P1)     |
| **View**  | `frontend-specialist` | React Components, UI/UX (P2) |

**Workflow:**
1.  **P0:** Data defines schema.
2.  **P1:** Logic builds API on schema.
3.  **P2:** View consumes API.

---

## 🏰 Pattern 3: The Squad (4+ Agents)

**Use Case:** Major refactor, new module integration (e.g., Espaider), system-wide audit.
**Complexity:** High

| Role             | Agent                | Responsibility                        |
| ---------------- | -------------------- | ------------------------------------- |
| **Commander**    | `orchestrator`       | Strategy, Coordination, Deconfliction |
| **Specialist A** | `backend-specialist` | Core Implementation                   |
| **Specialist B** | `database-architect` | Data Layer                            |
| **Quality**      | `test-engineer`      | E2E Testing                           |
| **Security**     | `security-auditor`   | Audit & Compliance (Phase 4)          |

**Workflow:**
1.  **Phase 1:** Orchestrator defines the plan.
2.  **Phase 2:** Specialists execute in parallel streams.
3.  **Phase 3:** Integration & Testing.
4.  **Phase 4:** Security Audit.
