# Brownfield Discovery Workflow — Tech Arauz

**Status**: Phase 1 Complete | Phases 2-3 Ready
**Start Date**: 2026-02-21
**Model**: Haiku 4.5
**Workflow Type**: brownfield-discovery (10 phases)

---

## Overview

This directory contains the **Brownfield Discovery** workflow execution — a comprehensive technical audit of the Tech Arauz codebase to identify technical debt, architectural gaps, and improvement opportunities.

The workflow is divided into **10 phases**:

### Data Collection Phases (1-3)
- **Phase 1**: System Architecture (@architect) — COMPLETED ✅
- **Phase 2**: Database Audit (@data-engineer) — READY
- **Phase 3**: Frontend Specification (@ux-design-expert) — READY

### Draft & Validation Phases (4-7)
- **Phase 4**: Draft Technical Debt (@architect) — Blocked (awaits 2-3)
- **Phase 5**: DB Specialist Review (@data-engineer) — Blocked (awaits 4)
- **Phase 6**: UX Specialist Review (@ux-design-expert) — Blocked (awaits 4)
- **Phase 7**: QA Review (@qa) — Blocked (awaits 5-6)

### Finalization Phases (8-10)
- **Phase 8**: Final Assessment (@architect) — Blocked (awaits 7)
- **Phase 9**: Executive Report (@analyst) — Blocked (awaits 8)
- **Phase 10**: Epic + Stories Planning (@pm) — Blocked (awaits 9)

---

## Files in This Directory

### State & Status
- **BROWNFIELD-DISCOVERY-STATE.md** — Current workflow state (updated per phase)
- **PHASE-1-COMPLETION.md** — Phase 1 summary & recommendations

### Phase Outputs
- **system-architecture.md** — Phase 1: Complete architecture documentation ✅

### (Pending)
- **SCHEMA.md** — Phase 2: Database schema analysis (pending)
- **DB-AUDIT.md** — Phase 2: Database audit findings (pending)
- **frontend-spec.md** — Phase 3: Frontend specification (pending)
- **technical-debt-DRAFT.md** — Phase 4: Draft findings (pending)
- **db-specialist-review.md** — Phase 5: Database review (pending)
- **ux-specialist-review.md** — Phase 6: UX review (pending)
- **qa-review.md** — Phase 7: QA findings (pending)
- **technical-debt-assessment.md** — Phase 8: Final assessment (pending)
- **TECHNICAL-DEBT-REPORT.md** — Phase 9: Executive summary (pending)

---

## Quick Start

### Current Status
✅ **Phase 1 is COMPLETE**

You can now:

1. **Review Phase 1 Output**
   ```
   Read: docs/brownfield/system-architecture.md
   ```

2. **Start Phases 2 & 3 (Parallel)**

   For Phase 2 (@data-engineer):
   - Read `docs/brownfield/BROWNFIELD-DISCOVERY-STATE.md`
   - Execute database audit (schema, migrations, RLS, performance)
   - Create `SCHEMA.md` and `DB-AUDIT.md`

   For Phase 3 (@ux-design-expert):
   - Read `docs/brownfield/BROWNFIELD-DISCOVERY-STATE.md`
   - Execute frontend audit (components, routes, state, UX flows)
   - Create `frontend-spec.md`

3. **Monitor Progress**
   - Check `BROWNFIELD-DISCOVERY-STATE.md` for phase status
   - Each phase updates this file upon completion

---

## Phase 1 Highlights

### What Was Discovered

#### Technology Stack
- **Frontend**: React 18 + Next.js 14 (App Router) + TypeScript
- **Styling**: Tailwind CSS 3.4 + Shadcn/ui (Radix-based)
- **State**: TanStack Query (server) + Zustand (client)
- **Backend**: Next.js Server Actions + Route Handlers
- **Database**: Supabase PostgreSQL with RLS
- **Hosting**: Vercel (serverless, 99.9% SLA)

#### Architecture
- **3-Tier Pattern**: Presentation → Application → Data
- **Feature-Based**: Organized by module (dashboard, projetos, cronogramas, etc.)
- **Multi-tenant Ready**: RLS policies enforce tenant isolation
- **Type-Safe**: End-to-end TypeScript

#### Integration
- **Espaider WCF API**: 7-dataset hierarchical sync
- **Sync Pattern**: UPSERT with idempotent UNIQUE(tenant_id, espaider_id)
- **Error Recovery**: Retry logic, circuit breaker, structured logging
- **Audit Trail**: Raw JSON storage + integration_log_entries table

#### Data
- **11 Core Tables**: projects, deliveries, schedules, requirements, histories, approvers, budgets, etc.
- **25 Migrations**: Comprehensive schema evolution
- **RLS Policies**: All tables enforce tenant isolation
- **Constraints**: UNIQUE, FK, CHECK constraints properly configured

### Key Insights
1. **Well-architected**: Clear separation of concerns, professional patterns
2. **Production-ready**: Stable, tested, deployed on Vercel
3. **Secure**: RLS + tenant isolation + service role key management
4. **Scalable**: Prepared for multi-tenant, cloud-native deployment
5. **Mature**: Professional development practices (TypeScript, testing, CI/CD)

---

## How to Navigate

### For Architects
- **Read**: `system-architecture.md` (Phase 1 completed)
- **Plan**: Phase 4 (Draft Technical Debt) — consolidate findings from Phases 2-3
- **Output**: Create `technical-debt-DRAFT.md`

### For Data Engineers
- **Start**: Phase 2 (Database Audit)
- **Focus**: Migrations, schema normalization, RLS effectiveness, performance
- **Output**: Create `SCHEMA.md` and `DB-AUDIT.md`

### For UX/Design Experts
- **Start**: Phase 3 (Frontend Specification)
- **Focus**: Component inventory, routes, state patterns, responsive design, UX flows
- **Output**: Create `frontend-spec.md`

### For QA
- **Wait**: Phase 7 (QA Review) — after Phases 5-6 complete
- **Review**: Findings from architect, data engineer, UX expert
- **Gate**: APPROVED | NEEDS WORK
- **Output**: Create `qa-review.md`

### For Product Managers
- **Wait**: Phase 10 (Epic + Stories Planning) — after Phase 9 complete
- **Input**: Executive report (Phase 9)
- **Output**: Create epics + stories for remediation

---

## State File Format

**Current Location**: `BROWNFIELD-DISCOVERY-STATE.md`

**Updates After Each Phase:**
```yaml
Phase X: {
  status: "COMPLETED" | "IN_PROGRESS" | "PENDING" | "BLOCKED",
  completedAt: "2026-02-21T14:30:00Z",
  agent: "@architect | @data-engineer | @ux-design-expert | @qa | @pm | @analyst",
  outputFile: "docs/brownfield/{filename}.md",
  findings: [
    "Key finding 1",
    "Key finding 2",
    ...
  ],
  nextPhase: "Phase X+1 (agent)"
}
```

---

## Key Documents to Reference

### Project Context
- `docs/prd.md` — Product requirements overview
- `docs/prd/epic-001-gestao-360-projetos.md` — Primary epic
- `docs/framework/coding-standards.md` — Code standards & patterns
- `docs/framework/tech-stack.md` — Technology decisions

### Code Structure
- `src/` — Application source code (organized by feature)
- `supabase/migrations/` — Database schema (25 migrations)
- `docs/stories/` — Completed stories (STORY-001 to STORY-004)

### Integration
- `src/integrations/espaider/` — Espaider API client & types
- `src/lib/sync/espaider-sync.ts` — Sync orchestration engine
- `src/app/api/integracoes/` — Integration API endpoints

---

## Timeline & Duration

| Phase | Agent | Duration | Parallel |
|-------|-------|----------|----------|
| 1: Architecture | @architect | ~30 min | Solo |
| 2: Database | @data-engineer | ~1-2 hrs | With Phase 3 |
| 3: Frontend | @ux-design-expert | ~1-2 hrs | With Phase 2 |
| 4: Draft TD | @architect | ~1 hr | After 2-3 |
| 5: DB Review | @data-engineer | ~30 min | After 4 |
| 6: UX Review | @ux-design-expert | ~30 min | After 4 |
| 7: QA Review | @qa | ~1 hr | After 5-6 |
| 8: Final TD | @architect | ~30 min | After 7 |
| 9: Exec Report | @analyst | ~1 hr | After 8 |
| 10: Planning | @pm | ~1-2 hrs | After 9 |

**Total Estimated Duration**: 5-7 days

---

## Next Immediate Actions

### For @data-engineer
```bash
# Phase 2: Database Audit
1. Read: docs/brownfield/BROWNFIELD-DISCOVERY-STATE.md
2. Analyze: supabase/migrations/ (001-025)
3. Review: RLS policies, schema patterns, constraints
4. Create: docs/brownfield/SCHEMA.md + docs/brownfield/DB-AUDIT.md
5. Update: BROWNFIELD-DISCOVERY-STATE.md with Phase 2 status
```

### For @ux-design-expert
```bash
# Phase 3: Frontend Specification
1. Read: docs/brownfield/BROWNFIELD-DISCOVERY-STATE.md
2. Analyze: src/components/ (50+ components)
3. Review: src/app/ (8 main pages)
4. Audit: Responsive design, accessibility, UX flows
5. Create: docs/brownfield/frontend-spec.md
6. Update: BROWNFIELD-DISCOVERY-STATE.md with Phase 3 status
```

### For Gabriel (CTO / Requestor)
```bash
# Monitor & Guide
1. Read: PHASE-1-COMPLETION.md (Phase 1 summary)
2. Monitor: Phases 2-3 progress via BROWNFIELD-DISCOVERY-STATE.md
3. Review: SCHEMA.md + frontend-spec.md when ready
4. Approve: Phase 4 consolidation before proceeding
```

---

## Getting Help

### Questions About Phase 1?
- Review: `system-architecture.md` (comprehensive guide)
- Questions: Refer to specific section (e.g., "Integration Architecture")

### Questions About Next Phases?
- Reference: `BROWNFIELD-DISCOVERY-STATE.md` (next phase details)
- Focus Areas: Listed per phase in state file

### General Process Questions?
- See: `.claude/rules/workflow-execution.md` (global rules)
- Pattern: Brownfield Discovery workflow defined in `.aios-core/`

---

## Completion Criteria

Each phase is **COMPLETE** when:
1. ✅ Output file created and documented
2. ✅ Findings captured (gaps, issues, recommendations)
3. ✅ State file updated with completion time & status
4. ✅ Next phase dependencies satisfied (if any)
5. ✅ Key insights summarized for Phase 4 consolidation

---

**Last Updated**: 2026-02-21 14:30 UTC
**Next Phase Ready**: Phase 2 & 3 (parallel)
**Estimated Completion**: 2026-02-26 (pending parallel phase execution)
