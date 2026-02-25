---
title: 4 Critical Skills - Implementation Summary
date: 2026-02-13
version: 1.0
---

# 4 Critical Skills for Tech-Arauz MVP - Quick Summary

> **Total Effort:** ~10-11 hours | **Timeline:** 2-3 days | **Priority:** P0 (blocks future development)

---

## Skills Overview

### 1️⃣ espaider-integration (3-4 hours)
**Why:** Centralizes Espaider API knowledge (field mapping, error handling, sync workflows)

**File Structure:**
```
.agent/skills/espaider-integration/
├── SKILL.md (1.2 KB) — Metadata, content map, checklist
├── references/
│   ├── field-mapping.json (2.5 KB) — All 135+ fields documented
│   ├── field-mapping.md (1.8 KB) — Human-readable reference
│   ├── workflow-sync.md (2 KB) — Step-by-step sync guide
│   ├── error-handling.md (1.5 KB) — Timeout, rate limit, null handling
│   ├── data-validation-checklist.md (0.8 KB) — Defensive programming
│   └── examples/ (2 KB) — sync-new-field.md, error-recovery.md
└── scripts/
    ├── validate-espaider-schema.py — Verify schema matches fields
    └── field-coverage-audit.py — Audit which fields are used
```

**Key Content:**
- Field mapping: IDPROJETO → id_espaider, APROVADORATUAL → fase_atual, etc.
- Sync workflow: Fetch → Parse → Map → Insert → Log
- Error scenarios: Timeout, invalid JSON, rate limit, auth failure, partial data
- Null/undefined handling: Fallback values, logging, defensive checks

**Used by:**
- backend-specialist (Phase 3: API implementation)
- database-architect (Phase 3: schema mapping)
- security-auditor (Phase 4: data validation)

---

### 2️⃣ supabase-rls-patterns (2-3 hours)
**Why:** Prevents multi-tenant vulnerabilities (RLS is security mechanism #1)

**File Structure:**
```
.agent/skills/supabase-rls-patterns/
├── SKILL.md (1.2 KB) — Overview, content map
├── references/
│   ├── rls-fundamentals.md (2 KB) — Concepts, auth context
│   ├── rls-templates.sql (2 KB) — Copy-paste policies
│   ├── rls-patterns-by-table.md (2 KB) — Tech-arauz specific (12+ tables)
│   ├── rls-testing-guide.md (1.5 KB) — Manual + automated testing
│   ├── rls-debugging.md (1.5 KB) — Troubleshooting common errors
│   └── rls-checklist.md (1 KB) — Pre-deployment validation
└── scripts/
    ├── audit-rls-coverage.py — Check which tables have RLS
    └── test-rls-bypass.py — Security testing (prevent privilege escalation)
```

**Key Content:**
- RLS fundamentals: Row-level filtering, multi-tenant isolation
- Templates: Tenant isolation (`id_tenant = get_user_tenant_id()`), role-based access
- Tech-arauz tables: policies for projects, deliveries, schedules, requirements, etc.
- Testing: Cross-tenant access blocked, service key bypass, admin operations
- Debugging: "new row violates policy" errors, tenant mismatch

**Used by:**
- database-architect (Phase 3: schema design)
- security-auditor (Phase 4: mandatory validation)
- backend-specialist (Phase 3: API implementation)

---

### 3️⃣ memory-management (2 hours)
**Why:** Formalizes agent memory system (context preservation across sessions)

**File Structure:**
```
.agent/skills/memory-management/
├── SKILL.md (1.2 KB) — Overview, when to create logs
├── references/
│   ├── TEMPLATE.md (1.5 KB) — Copy-paste template (6 sections)
│   ├── when-to-create-log.md (1.2 KB) — Decision tree
│   ├── chesterton-fence.md (1.5 KB) — Referencing past decisions
│   └── examples/ (6 KB)
│       ├── crud-feature-log.md (2 KB) — Create Products module
│       ├── security-audit-log.md (2 KB) — RLS gap found & fixed
│       └── performance-optimization-log.md (1.5 KB) — LCP 3.2s → 1.8s
├── MEMORY-INDEXING.md (1 KB) — How to search logs
└── scripts/
    ├── memory-indexer.py — Index logs by date, tag, agent, skill
    └── memory-search.py — Full-text search memory logs
```

**Key Content:**
- Template sections: Context, Strategy, Execution, Testing, Retrospective, Follow-up, References
- When to create: Multi-agent tasks, architecture changes, Phase 4 audits, critical bugs, refactoring
- Chesterton Fence: Understanding "why is this code here?" by reading memory logs
- Real examples: CRUD feature, security audit, performance optimization
- Indexing: Search by date, tag, agent, skill

**Used by:**
- orchestrator (Phase 1 memory check, Phase 6 memory commit)
- All agents (Phase 2 strategy reference)

---

### 4️⃣ agent-orchestration-patterns (3 hours)
**Why:** Guides multi-agent task force assembly and dependency management

**File Structure:**
```
.agent/skills/agent-orchestration-patterns/
├── SKILL.md (1.2 KB) — Overview, decision checklist
├── references/
│   ├── task-force-patterns.md (3 KB) — 5 standard patterns
│   │   1. Pair (simple feature)
│   │   2. Trio (CRUD feature)
│   │   3. Squad (Espaider sync)
│   │   4. Squad (security audit)
│   │   5. Squad (production hotfix)
│   ├── dependency-chains.md (2 KB) — P0/P1/P2 ordering
│   ├── conflict-resolution.md (1.5 KB) — When agents disagree
│   ├── decision-matrix.md (2 KB) — Task type → Agents mapping
│   └── examples/ (5 KB)
│       ├── crud-task-force.md (1.5 KB) — Products module
│       ├── espaider-sync-task-force.md (1.5 KB) — 10 new fields
│       ├── hotfix-production-task-force.md (1.2 KB) — Export feature down
│       └── security-audit-task-force.md (1.2 KB) — Phase 4 audit
└── scripts/
    ├── validate-task-force.py — Check dependencies, blockers
    └── dependency-visualizer.py — ASCII timeline diagram
```

**Key Content:**
- 5 patterns: Pair (2 agents, 1-2h), Trio (3-4 agents, 2-4h), Squad (4+ agents, 4+ hours)
- Dependency chains: P0 (blocking) → P1 (dependent) → P2 (final) → P3 (optional)
- Conflict resolution: When database-architect and backend-specialist disagree
- Decision matrix: 12 task types mapped to agent combinations
- Real examples: CRUD, Espaider integration, hotfix, security audit

**Used by:**
- orchestrator (Phase 2 strategy, Phase 3 execution)
- project-planner (Phase 2 planning)

---

## Content Totals

| Skill | SKILL.md | References | Scripts | Total |
| --- | --- | --- | --- | --- |
| espaider-integration | 1.2 KB | 11 files (10.5 KB) | 2 | 11 files |
| supabase-rls-patterns | 1.2 KB | 8 files (11 KB) | 2 | 10 files |
| memory-management | 1.2 KB | 8 files (12 KB) | 2 | 10 files |
| agent-orchestration-patterns | 1.2 KB | 9 files (13 KB) | 2 | 11 files |
| **TOTAL** | **4.8 KB** | **36 files (46 KB)** | **8** | **42 files** |

---

## Implementation Timeline

### Day 1 (4-5 hours)
- **3-4 hours:** Create `espaider-integration` skill
  - SKILL.md, field-mapping.json, field-mapping.md, workflow-sync.md
  - error-handling.md, data-validation-checklist.md, 2 examples, 2 scripts

- **1-1.5 hours:** Start `supabase-rls-patterns` skill
  - SKILL.md, rls-fundamentals.md, rls-templates.sql

### Day 2 (4-5 hours)
- **1.5-2 hours:** Complete `supabase-rls-patterns` skill
  - Tech-arauz table patterns, testing guide, debugging, checklist, 2 scripts

- **2-2.5 hours:** Create `memory-management` skill
  - SKILL.md, TEMPLATE.md, when-to-create, chesterton-fence
  - 3 examples, MEMORY-INDEXING.md, 2 scripts

### Day 3 (2-3 hours)
- **2-3 hours:** Create `agent-orchestration-patterns` skill
  - SKILL.md, task-force-patterns (5 patterns), dependency-chains, conflict-resolution
  - decision-matrix, 4 examples, 2 visualization scripts

- **1 hour:** Integration & Testing
  - Verify all skills load correctly
  - Test references between skills
  - Final review

---

## Success Checklist

### Knowledge Coverage
- [ ] 100% of Espaider fields documented
- [ ] 100% of tech-arauz RLS requirements covered
- [ ] Memory log template matches orchestration-protocol.md
- [ ] Orchestration patterns cover all task types from agent-selection-guide.md

### Usability
- [ ] Each skill loadable in < 30 seconds
- [ ] Decision checklists prevent 80% of common mistakes
- [ ] Examples are realistic (from actual project history)
- [ ] Scripts run without errors and produce useful output

### Integration
- [ ] Skills referenced in agent profiles
- [ ] Skills integrated into orchestration protocol phases
- [ ] Memory logs use consistent format
- [ ] Task forces validate without errors

---

## Key Design Principles

### 1. Espaider Integration
- **Central source of truth:** field-mapping.json for all 135+ fields
- **Defensive programming:** Every field can be null/invalid
- **Observable:** All sync operations logged to integration_log_entries
- **Testable:** Scripts validate schema and field coverage

### 2. Supabase RLS
- **Always multi-tenant:** Every policy uses get_user_tenant_id()
- **Tested:** RLS bypass prevention is mandatory (Phase 4)
- **Documented:** Why each policy exists (Chesterton's Fence)
- **Auditable:** Script checks RLS coverage on all tables

### 3. Memory Management
- **Structured:** 6-section template prevents missing context
- **Discoverable:** Indexed by date, tag, agent, skill
- **Leveraged:** Developers reference past decisions via Chesterton's Fence
- **Historical:** 80+ existing logs in .agent/memory/ (use as examples)

### 4. Agent Orchestration
- **Patterns-based:** 5 reusable patterns cover 90% of tasks
- **Dependency-aware:** P0/P1/P2 ordering prevents blocking issues
- **Conflict-resolved:** Process when agents disagree
- **Visualized:** ASCII diagrams show critical paths

---

## Integration with Orchestration Protocol

### Phase 1 (Ingestion)
- **Memory-management:** Orchestrator reads logs using memory search
- Discovers past decisions for similar tasks

### Phase 2 (Strategy)
- **Agent-orchestration-patterns:** Orchestrator assembles task force
- Determines P0/P1/P2 dependency chain
- Identifies potential conflicts

### Phase 3 (Execution)
- **Espaider-integration:** Backend-specialist implements sync
- **Supabase-rls-patterns:** Database-architect designs RLS
- **Agent-orchestration-patterns:** Orchestrator manages parallelization

### Phase 4 (Validation)
- **Supabase-rls-patterns:** Security-auditor audits RLS coverage
- Runs RLS bypass tests
- Uses RLS checklist

### Phase 5 (Documentation)
- **Espaider-integration:** Document API specifics
- **Supabase-rls-patterns:** Document security notes
- **Memory-management:** Prepare for Phase 6 logging

### Phase 6 (Memory Commit)
- **Memory-management:** Create/update memory log using template
- Tag with relevant skills (espaider-integration, supabase-rls-patterns, etc.)
- Index for future discovery

---

## How to Use These Skills

### For Backend-Specialist
1. Task: Add Espaider field to API
2. Load: `@[skills/espaider-integration]` → Check field-mapping.json
3. Load: `@[skills/api-patterns]` → Design endpoint
4. Load: `@[skills/supabase-rls-patterns]` → Ensure RLS if needed
5. Create memory log (if multi-agent task)

### For Database-Architect
1. Task: Create new table with data from Espaider
2. Load: `@[skills/espaider-integration]` → Get field mapping
3. Load: `@[skills/supabase-rls-patterns]` → Design RLS policies
4. Load: `@[skills/database-design]` → Normalize schema
5. Run audit scripts to validate coverage

### For Orchestrator
1. Request: Create new feature
2. Load: `@[skills/memory-management]` → Check past similar tasks
3. Load: `@[skills/agent-orchestration-patterns]` → Assemble task force
4. Load: `@[skills/agent-orchestration-patterns/decision-matrix]` → Choose agents
5. Load: `@[skills/agent-orchestration-patterns/dependency-chains]` → Order work
6. Create memory log (Phase 6)

---

## Files to Update After Skills Created

1. **`.agent/ARCHITECTURE.md`**
   - Update skill count: 36 → 40
   - Add 4 new skills to skill table
   - Reference new skills in agent profiles

2. **`.agent/workflows/agent-selection-guide.md`**
   - Add "Skills per Phase" section (when to load each skill)
   - Add "Skills Carregadas em Cada Recipe" (skills in common workflows)
   - Reference new skills in task examples

3. **`.agent/agents/orchestrator.md`** (if exists)
   - Add "Skill Loading Protocol" section
   - List skills to load in each phase

4. **`.agent/agents/backend-specialist.md`** (if exists)
   - Add `@[skills/espaider-integration]` to skill list

5. **`.agent/agents/database-architect.md`** (if exists)
   - Add `@[skills/espaider-integration]` and `@[skills/supabase-rls-patterns]` to skill list

---

## Next Steps (Phase 2 - After MVP)

1. **Adapt existing `intelligent-routing` skill** (1 hour)
   - Remove Gemini references
   - Add tech-arauz task force patterns

2. **Expand `supabase-mcp` skill** (2 hours)
   - Add WF-005 (Schema Diff)
   - Add WF-006 (Query Performance Analysis)

3. **Create Phase 2 skills** (1-2 weeks)
   - `zustand-state-management` (2h)
   - `react-query-patterns` (2h)
   - `zod-validation-patterns` (2h)

4. **Formalize skill usage in memory logs**
   - Next memory logs should tag which skills were used
   - Build index of "which skills are most useful"

---

## Quick Reference: Skill Locations

```bash
# View all 4 skills
ls -la .agent/skills/{espaider-integration,supabase-rls-patterns,memory-management,agent-orchestration-patterns}

# Read SKILL.md for quick overview
cat .agent/skills/espaider-integration/SKILL.md

# Check field mapping (JSON format for parsing)
cat .agent/skills/espaider-integration/references/field-mapping.json

# Search memory logs using indexer
python .agent/skills/memory-management/scripts/memory-indexer.py

# Validate RLS coverage
python .agent/skills/supabase-rls-patterns/scripts/audit-rls-coverage.py

# Visualize task force dependencies
python .agent/skills/agent-orchestration-patterns/scripts/dependency-visualizer.py
```

---

## Document References

**Full Implementation Plan:** `.agent/skills/IMPLEMENTATION_PLAN.md` (this file's detailed version)

**Skills Roadmap:** `.agent/skills/SKILLS-ROADMAP.md` (strategic planning document)

**Orchestration Protocol:** `.agent/workflows/orchestration-protocol.md` (6-phase lifecycle)

**Memory Protocol:** `.agent/workflows/memory-protocol.md` (memory log guidelines)

**Agent Selection Guide:** `.agent/workflows/agent-selection-guide.md` (which agents to use)

---

**Status: READY FOR EXECUTION**

This summary provides structure, timeline, and checklist for implementing 4 critical skills in 2-3 days. See IMPLEMENTATION_PLAN.md for full details on each skill's content.
