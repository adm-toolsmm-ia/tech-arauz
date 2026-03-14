# Architecture 10/10 — Master Documentation Index

**Version:** 0.2.3 (Production Live)
**Framework:** Synkra AIOX v1.0.0
**Compiled:** 2026-03-14

---

## Quick Navigation

### 📐 Technical Architecture
1. **[ARCHITECTURE-OVERVIEW.md](./architecture/ARCHITECTURE-OVERVIEW.md)** — Stack, data flow, integrations
   - Tech stack matrix (Next.js, React, TypeScript, Supabase, Tailwind)
   - System architecture diagram
   - Multi-tenant design
   - Performance optimization

2. **[SOFTWARE-ARCHITECTURE.md](./architecture/SOFTWARE-ARCHITECTURE.md)** — Layered design, components, patterns
   - 4-layer architecture (Data Access, Domain, Orchestration, Presentation)
   - Module engineering standard (baseline: projetos module)
   - Component hierarchy
   - State management (Zustand + TanStack Query)

3. **[DATABASE-ARCHITECTURE.md](./architecture/DATABASE-ARCHITECTURE.md)** — Schema, RLS, migrations, sync
   - Multi-tenant database design
   - RLS enforcement (Row Level Security)
   - Composite UNIQUE keys for Espaider sync idempotency
   - 20+ table definitions
   - Query optimization & indexing strategy

4. **[ADR-REGISTRY.md](./architecture/ADR-REGISTRY.md)** — Architectural Decision Records (14 ADRs)
   - ADR-001: RLS on all tables
   - ADR-002: Token fallback to env vars
   - ADR-003: Composite UNIQUE keys for sync
   - ADR-004 through ADR-013: Framework decisions
   - Each with rationale, consequences, alternatives

---

## At a Glance

| Dimension | Details |
|-----------|---------|
| **Frontend** | Next.js 14, React 18, TypeScript 5.5, Tailwind 3.4 |
| **Backend** | Vercel (serverless), Supabase PostgreSQL |
| **Database** | Multi-tenant, RLS enforced, 20+ tables |
| **State** | Zustand (local) + TanStack Query (server) |
| **Styling** | Tailwind + DTCG tokens (80+ extracted) |
| **Testing** | Vitest 92% coverage + Cypress E2E |
| **Deployment** | Vercel (auto from main) + DB migrations |
| **Quality** | Pre-push gate (lint + typecheck + test) |

---

## For Different Audiences

### 👨‍💼 Product Managers
→ Read: ARCHITECTURE-OVERVIEW.md (System Design section)
→ Then: DATABASE-ARCHITECTURE.md (Multi-tenant model)

### 👨‍💻 Developers
→ Read: SOFTWARE-ARCHITECTURE.md (Layered design + module standards)
→ Then: DATABASE-ARCHITECTURE.md (RLS + schema)
→ Then: ADR-REGISTRY.md (decisions that affect code)

### 🏗️ Architects
→ Read: ARCHITECTURE-OVERVIEW.md (full)
→ Then: ADR-REGISTRY.md (decisions)
→ Then: DATABASE-ARCHITECTURE.md (schema decisions)

### 🧪 QA/Testers
→ Read: DATABASE-ARCHITECTURE.md (RLS test strategy)
→ Then: SOFTWARE-ARCHITECTURE.md (component testing)

---

## Document Map

```
docs/
├── ARCHITECTURE-10-10.md (THIS FILE)
├── AIOX-FRAMEWORK-INTEGRATION.md
├── ENGINEERING-10-10.md
├── GOVERNANCE-10-10.md
│
├── architecture/
│   ├── ARCHITECTURE-OVERVIEW.md (15KB)
│   ├── SOFTWARE-ARCHITECTURE.md (12KB)
│   ├── DATABASE-ARCHITECTURE.md (11KB)
│   ├── ADR-REGISTRY.md (14KB)
│   ├── AI-AGENT-ARCHITECTURE.md (16KB)
│   ├── AGENT-AUTHORITY-MATRIX.md (13KB)
│   ├── AIOX-WORKFLOW-MAP.md (14KB)
│   ├── CONSTITUTION-ALIGNMENT.md (12KB)
│   └── [other architecture files]
│
├── engineering/
│   ├── BUILD-SYSTEM.md
│   ├── TEST-STRATEGY.md
│   ├── DEPLOYMENT-GUIDE.md
│   ├── OPERATIONAL-RUNBOOK.md
│   ├── CODE-REVIEW-STANDARDS.md
│   ├── DEVELOPMENT-ENVIRONMENT.md
│   └── DEPENDENCY-MANAGEMENT.md
│
└── governance/
    ├── QUALITY-GATES-FRAMEWORK.md
    ├── STORY-LIFECYCLE-GATES.md
    ├── CONSTITUTIONAL-COMPLIANCE.md
    ├── FRAMEWORK-LAYER-MODEL.md
    ├── CODE-INTELLIGENCE-GOVERNANCE.md
    └── SECURITY-STANDARDS.md
```

---

## Key Concepts

**4-Layer Architecture:**
- L1 Data Access (SSR page.tsx)
- L2 Domain Logic (transformers, validators)
- L3 Orchestration (hooks, stores, state)
- L4 Presentation (components, UI)

**Multi-Tenant Isolation:**
- Every table has `tenant_id` column
- RLS policies enforce `tenant_id` filtering
- Composite keys (tenant_id, espaider_id) ensure sync idempotency

**Quality Gates:**
- Pre-push: lint + typecheck + test (local)
- Pre-PR: CodeRabbit + audit (CI)
- Pre-merge: QA gate 7-point checklist (@qa)
- Pre-deploy: release gate (@devops)

**Decision Log:**
- 14 ADRs document why patterns exist
- Each ADR has: Decision, Status, Rationale, Consequences, Alternatives
- ADRs can be amended (rare, formal process)

---

## References

**Core Framework:** `.aiox-core/constitution.md` (6 principles)
**Rules:** `.claude/rules/` (12 contextual rules)
**Stories:** `docs/stories/EPIC-INDEX.md` (18 stories, 3 completed)

---

**Authored by:** Claude Code (Haiku 4.5) — AIOX Master Orchestrator
**Framework:** Synkra AIOX v1.0.0
**Version:** 0.2.3 (Production Live)
**Last Updated:** 2026-03-14
