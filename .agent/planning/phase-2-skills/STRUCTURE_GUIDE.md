---
title: 4 Critical Skills - Directory Structure & Dependencies
date: 2026-02-13
version: 1.0
---

# Directory Structure & Visual Dependencies

---

## Complete File Structure (All 4 Skills)

```
.agent/skills/
│
├── espaider-integration/                       [NEW SKILL #1]
│   ├── SKILL.md                                (metadata, content map, checklist)
│   ├── references/
│   │   ├── field-mapping.json                  (all 135+ Espaider fields, structured)
│   │   ├── field-mapping.md                    (human-readable field reference table)
│   │   ├── workflow-sync.md                    (step-by-step: fetch→parse→map→insert→log)
│   │   ├── error-handling.md                   (timeout, invalid JSON, rate limit, null)
│   │   ├── data-validation-checklist.md        (defensive programming, null checks)
│   │   └── examples/
│   │       ├── sync-new-field.md               (worked example: DATAALERTAPRAZO)
│   │       └── error-recovery.md               (worked example: timeout debugging)
│   └── scripts/
│       ├── validate-espaider-schema.py         (~200 lines) Verify DB matches field-mapping.json
│       └── field-coverage-audit.py             (~150 lines) Check which fields used in real data
│
├── supabase-rls-patterns/                      [NEW SKILL #2]
│   ├── SKILL.md                                (metadata, content map, checklist)
│   ├── references/
│   │   ├── rls-fundamentals.md                 (concepts: what is RLS, auth context, policy structure)
│   │   ├── rls-templates.sql                   (copy-paste: tenant isolation, role-based, admin bypass)
│   │   ├── rls-patterns-by-table.md            (tech-arauz: policies for 12+ tables)
│   │   ├── rls-testing-guide.md                (manual + automated testing for RLS)
│   │   ├── rls-debugging.md                    (troubleshooting: "violates policy" errors)
│   │   └── rls-checklist.md                    (pre-deployment: RLS coverage validation)
│   └── scripts/
│       ├── audit-rls-coverage.py               (~200 lines) Check which tables have RLS
│       └── test-rls-bypass.py                  (~250 lines) Security testing (prevent privilege escalation)
│
├── memory-management/                          [NEW SKILL #3]
│   ├── SKILL.md                                (metadata, when to create logs)
│   ├── references/
│   │   ├── TEMPLATE.md                         (6-section template: context, strategy, execution, test, retro, follow-up)
│   │   ├── when-to-create-log.md               (decision tree: multi-agent? architecture change? security audit?)
│   │   ├── chesterton-fence.md                 (understand "why is this here?" via memory logs)
│   │   ├── MEMORY-INDEXING.md                  (how to search logs by date, tag, agent, skill)
│   │   └── examples/
│   │       ├── crud-feature-log.md             (real: Create Products module with 3 agents)
│   │       ├── security-audit-log.md           (real: Found RLS gap, fixed with audit)
│   │       └── performance-optimization-log.md (real: LCP 3.2s → 1.8s optimization)
│   └── scripts/
│       ├── memory-indexer.py                   (~250 lines) Index logs by date, tag, agent, skill
│       └── memory-search.py                    (~150 lines) Full-text search memory logs
│
├── agent-orchestration-patterns/               [NEW SKILL #4]
│   ├── SKILL.md                                (metadata, decision checklist)
│   ├── references/
│   │   ├── task-force-patterns.md              (5 patterns: Pair, Trio, Squad × 3 scenarios)
│   │   ├── dependency-chains.md                (P0→P1→P2 ordering, critical path)
│   │   ├── conflict-resolution.md              (when 2 agents propose different solutions)
│   │   ├── decision-matrix.md                  (12 task types → agent combinations)
│   │   └── examples/
│   │       ├── crud-task-force.md              (real: Products CRUD = 4 agents, 6.5h)
│   │       ├── espaider-sync-task-force.md     (real: 10 new fields = 5 agents, 5h)
│   │       ├── hotfix-production-task-force.md (real: Export down = 5 agents, 1.5h emergency)
│   │       └── security-audit-task-force.md    (real: Phase 4 = 4 agents, 4.5h)
│   └── scripts/
│       ├── validate-task-force.py              (~200 lines) Check dependencies, blockers
│       └── dependency-visualizer.py            (~150 lines) ASCII timeline diagram
│
├── IMPLEMENTATION_PLAN.md                      [GUIDE - Full detailed plan]
├── IMPLEMENTATION_SUMMARY.md                   [GUIDE - Quick reference]
├── STRUCTURE_GUIDE.md                          [GUIDE - This file]
│
├── SKILLS-ROADMAP.md                           [EXISTING - Strategic planning]
├── api-patterns/                               [EXISTING - API design]
├── database-design/                            [EXISTING - Schema design]
├── [32 other existing skills...]
│
└── README.md                                   [UPDATE - Add section for new skills]
```

---

## File Count Summary

| Skill | SKILL.md | references/ | scripts/ | Total |
|-------|----------|-------------|----------|-------|
| espaider-integration | 1 | 8 files | 2 | **11 files** |
| supabase-rls-patterns | 1 | 6 files | 2 | **10 files** |
| memory-management | 1 | 7 files | 2 | **10 files** |
| agent-orchestration-patterns | 1 | 8 files | 2 | **11 files** |
| **TOTAL** | **4** | **29 files** | **8 scripts** | **42 files** |

**Total Size:** ~63 KB of documentation + Python scripts

---

## Skill Relationships & Dependencies

```
┌─────────────────────────────────────────────────────────────────┐
│  Orchestration Protocol: 6 Phases                               │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  Phase 1: INGESTION (Gatekeeper)                                │
│  └─→ memory-management                                           │
│      [Search past logs: "Have we solved this before?"]           │
│      └─→ find related decision in memory                         │
│                                                                   │
│  Phase 2: STRATEGY (Architect)                                  │
│  └─→ agent-orchestration-patterns                               │
│      [Assemble task force: "Which agents? What order?"]          │
│      └─→ use decision-matrix + dependency-chains                 │
│                                                                   │
│  Phase 3: EXECUTION (Conductor)                                 │
│  └─→ espaider-integration                                        │
│      [Backend working with Espaider API]                         │
│      └─→ Load field-mapping, workflow, error-handling            │
│  └─→ supabase-rls-patterns                                       │
│      [Database designing RLS policies]                           │
│      └─→ Load templates, patterns-by-table                       │
│  └─→ agent-orchestration-patterns                               │
│      [Orchestrator managing parallel agents]                     │
│      └─→ Use dependency visualizer for timeline                  │
│                                                                   │
│  Phase 4: VALIDATION (Auditor)                                  │
│  └─→ supabase-rls-patterns                                       │
│      [Security audit: "Is RLS working?"]                         │
│      └─→ Run audit-rls-coverage.py + test-rls-bypass.py         │
│                                                                   │
│  Phase 5: DOCUMENTATION (Librarian)                             │
│  └─→ espaider-integration (reference API details)               │
│  └─→ supabase-rls-patterns (security notes)                     │
│                                                                   │
│  Phase 6: MEMORY COMMIT (Historian)                             │
│  └─→ memory-management                                           │
│      [Create/update memory log]                                  │
│      └─→ Use TEMPLATE.md, tag with skills used                   │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

---

## Skill Usage by Agent & Phase

```
┌──────────────────────────────────────────────────────────────────────────┐
│ Agent: orchestrator (Maestro)                                            │
├──────────────────────────────────────────────────────────────────────────┤
│ Phase 1 (Ingestion)      │ memory-management      [Search logs]         │
│ Phase 2 (Strategy)       │ agent-orchestration-patterns [Assemble team] │
│ Phase 3 (Execution)      │ agent-orchestration-patterns [Manage timing] │
│ Phase 6 (Memory)         │ memory-management      [Create log]          │
└──────────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────────┐
│ Agent: backend-specialist                                                │
├──────────────────────────────────────────────────────────────────────────┤
│ Phase 3 (Execution)      │ espaider-integration   [Field mapping]       │
│                          │ api-patterns           [Endpoint design]     │
│                          │ nodejs-best-practices  [Async handling]      │
│ Phase 4 (Validation)     │ supabase-rls-patterns  [Data validation]     │
└──────────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────────┐
│ Agent: database-architect                                                │
├──────────────────────────────────────────────────────────────────────────┤
│ Phase 3 (Execution)      │ espaider-integration   [Field mapping]       │
│                          │ database-design        [Schema design]       │
│                          │ supabase-rls-patterns  [RLS policies]        │
│ Phase 4 (Validation)     │ supabase-rls-patterns  [RLS audit]           │
└──────────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────────┐
│ Agent: security-auditor                                                  │
├──────────────────────────────────────────────────────────────────────────┤
│ Phase 3 (Execution)      │ supabase-rls-patterns  [Policy design]       │
│ Phase 4 (Validation)     │ supabase-rls-patterns  [RLS testing]         │
│                          │ vulnerability-scanner  [Security audit]      │
│                          │ espaider-integration   [Data validation]     │
└──────────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────────┐
│ Agent: test-engineer                                                     │
├──────────────────────────────────────────────────────────────────────────┤
│ Phase 3 (Execution)      │ testing-patterns       [Unit tests]          │
│                          │ espaider-integration   [Field validation]    │
│ Phase 4 (Validation)     │ supabase-rls-patterns  [RLS testing]         │
│                          │ webapp-testing         [E2E tests]           │
└──────────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────────┐
│ Agent: project-planner                                                   │
├──────────────────────────────────────────────────────────────────────────┤
│ Phase 2 (Strategy)       │ agent-orchestration-patterns [Task planning] │
│                          │ plan-writing           [Create PLAN.md]      │
└──────────────────────────────────────────────────────────────────────────┘
```

---

## Content Dependency Graph

```
                    ┌─────────────────────────┐
                    │ memory-management       │
                    │ (Context preservation)  │
                    └────────────┬────────────┘
                                 │
                    ┌────────────┴────────────┐
                    │                         │
        ┌───────────▼────────────┐   ┌─────────▼──────────────┐
        │ agent-orchestration    │   │ orchestration-protocol │
        │ patterns               │   │ (6 phases)             │
        │ (Task force assembly)  │   └────────────────────────┘
        └───────────┬────────────┘
                    │
        ┌───────────┴────────────┬──────────────────┐
        │                        │                  │
   ┌────▼─────────┐    ┌────────▼────────┐   ┌────▼──────────────┐
   │ espaider     │    │ supabase-rls    │   │ api-patterns      │
   │ integration  │    │ patterns        │   │ (existing)        │
   │ (API sync)   │    │ (RLS security)  │   │                   │
   └────┬─────────┘    └────────┬────────┘   └──────────────────┘
        │                       │
        │               ┌───────┴────────┐
        │               │                │
        │        ┌──────▼──────┐  ┌─────▼──────────┐
        │        │ database    │  │ vulnerability  │
        │        │ design      │  │ scanner        │
        │        │ (existing)  │  │ (existing)     │
        │        └─────────────┘  └────────────────┘
        │
        └──→ Consumed by: backend-specialist, database-architect, test-engineer
```

---

## Data Flow: How Skills Interact

### Scenario 1: Adding New Espaider Field

```
1. Backend-specialist loads espaider-integration skill
   └─→ References field-mapping.json
       └─→ Finds: "DATAALERTAPRAZO → data_alerta_prazo"

2. Database-architect loads:
   └─→ supabase-rls-patterns (ensure RLS applies to new column)
   └─→ database-design (schema impact)
   └─→ Applies migration with RLS policy

3. Test-engineer loads:
   └─→ espaider-integration/examples/sync-new-field.md
   └─→ Writes test for null/invalid date handling

4. Security-auditor loads:
   └─→ supabase-rls-patterns/rls-checklist.md
   └─→ Audits RLS policy for new column

5. Orchestrator creates memory log:
   └─→ memory-management/TEMPLATE.md
   └─→ Tags: [espaider-integration, supabase-rls-patterns]
   └─→ Logs decision: "Why date field, not datetime?"
```

### Scenario 2: Planning Feature CRUD

```
1. Orchestrator loads agent-orchestration-patterns
   └─→ Uses decision-matrix.md
       └─→ Identifies: "Feature CRUD = Trio pattern (3-4 agents)"
   └─→ Uses task-force-patterns.md
       └─→ Reads Pattern #2: Trio (DB + API + UI)
   └─→ Uses dependency-chains.md
       └─→ Creates: database-architect (P0) → backend-specialist (P0) → frontend-specialist (P1)

2. Project-planner creates PLAN.md with:
   └─→ Phase breakdown (P0/P1/P2 tasks)
   └─→ Parallel vs sequential work

3. During Phase 3, agents load:
   └─→ database-architect: supabase-rls-patterns + database-design
   └─→ backend-specialist: espaider-integration + api-patterns + nodejs-best-practices
   └─→ frontend-specialist: react-best-practices + frontend-design

4. During Phase 4:
   └─→ security-auditor: supabase-rls-patterns (RLS audit)
   └─→ test-engineer: testing-patterns + webapp-testing

5. Orchestrator logs memory:
   └─→ Which agents involved
   └─→ Which skills loaded in each phase
   └─→ Critical decisions (why RLS approach X vs Y?)
   └─→ What took longer than expected (espaider field mapping: 2h vs 1h estimated)
```

---

## File Organization Best Practices

### When Creating Skill Content

```
✅ DO:
- Put complex concepts in separate files (rls-fundamentals.md, not inline)
- Put copy-paste code in examples/ or scripts/
- Put worked examples with real project context
- Keep SKILL.md as quick reference (< 2 KB)
- Make references/ files task-focused ("How do I X?")

❌ DON'T:
- Make SKILL.md too long (readers will skip)
- Mix tutorial content with reference content
- Assume readers know tech-arauz context
- Forget to include real example from project history
- Create scripts without clear input/output documentation
```

### File Naming Conventions

```
SKILL.md                  — Metadata, overview, content map, checklist
references/
  - concept.md            — Conceptual guide ("What is RLS?")
  - how-to.md             — Step-by-step guide ("How do I test RLS?")
  - pattern-name.md       — Pattern reference ("Pattern #1: Pair")
  - checklist.md          — Validation checklist
  - template.sql/.json    — Copy-paste templates
  - examples/
      - worked-example.md — Real example with context & rationale
scripts/
  - validate-*.py         — Check/audit (no side effects)
  - search-*.py           — Find/analyze (read-only)
  - generate-*.py         — Produce output (diagrams, reports)
```

---

## Quick Navigation

### If you need to...

| Need | File |
|------|------|
| Understand what Espaider API returns | `espaider-integration/references/field-mapping.json` |
| Map a new Espaider field to database | `espaider-integration/references/examples/sync-new-field.md` |
| Create RLS policy for new table | `supabase-rls-patterns/references/rls-templates.sql` |
| Debug "violates policy" error | `supabase-rls-patterns/references/rls-debugging.md` |
| Check RLS is working correctly | `supabase-rls-patterns/scripts/test-rls-bypass.py` |
| Create memory log for task | `memory-management/references/TEMPLATE.md` |
| Find past decision about X | `memory-management/scripts/memory-search.py "X"` |
| Decide which agents for task | `agent-orchestration-patterns/references/decision-matrix.md` |
| Understand task dependencies | `agent-orchestration-patterns/references/dependency-chains.md` |
| Visualize timeline for feature | `agent-orchestration-patterns/scripts/dependency-visualizer.py` |

---

## Integration Checklist

### Phase 1: Create Skills
- [ ] Create espaider-integration/ directory with all files
- [ ] Create supabase-rls-patterns/ directory with all files
- [ ] Create memory-management/ directory with all files
- [ ] Create agent-orchestration-patterns/ directory with all files
- [ ] Test all scripts run without errors

### Phase 2: Reference & Link
- [ ] Update `.agent/ARCHITECTURE.md` (skill count: 36 → 40)
- [ ] Update `.agent/workflows/agent-selection-guide.md` (add Skills per Phase section)
- [ ] Add "Skill Loading Protocol" to agent profiles (orchestrator, backend-specialist, database-architect)
- [ ] Ensure memory logs use consistent template

### Phase 3: Verify Integration
- [ ] SKILL.md content maps are accurate
- [ ] All script files referenced in SKILL.md exist
- [ ] All example files are realistic and tested
- [ ] Memory logs tag new skills correctly (Phase 6)
- [ ] Agent profiles load correct skills in each phase

---

## Success Indicators

### Technical
- ✅ All 42 files created successfully
- ✅ All 8 Python scripts run without errors
- ✅ No broken references between skills
- ✅ SKILL.md files follow consistent format

### Practical
- ✅ Backend-specialist can find Espaider field mapping in < 1 minute
- ✅ Database-architect can copy-paste RLS policy in < 5 minutes
- ✅ Orchestrator can create task force definition using decision-matrix in < 10 minutes
- ✅ Any agent can create memory log using template in < 15 minutes

### Organizational
- ✅ All 4 skills integrated into 6-phase orchestration protocol
- ✅ All agents have "Skill Loading Protocol" defined
- ✅ Memory logs reference new skills (by end of Week 2)
- ✅ New developers reference skills instead of rediscovering patterns

---

## Timeline Reference

```
Day 1: 4-5 hours
├─ 3-4h: espaider-integration (11 files + 2 scripts)
└─ 1-1.5h: supabase-rls-patterns start (SKILL.md, rls-fundamentals, templates)

Day 2: 4-5 hours
├─ 1.5-2h: supabase-rls-patterns complete (4 more reference files + 2 scripts)
└─ 2-2.5h: memory-management (10 files + 2 scripts)

Day 3: 2-3 hours
├─ 2-3h: agent-orchestration-patterns (11 files + 2 scripts)
└─ 1h: Integration testing & verification
```

---

**Status: READY FOR EXECUTION**

All structures documented. Ready to create 42 files across 4 skills in 2-3 days.

For detailed content, see `IMPLEMENTATION_PLAN.md`.
For quick reference, see `IMPLEMENTATION_SUMMARY.md`.
