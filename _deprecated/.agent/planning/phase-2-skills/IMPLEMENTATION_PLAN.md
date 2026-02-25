---
title: Implementation Plan - 4 Critical Skills (MVP)
date: 2026-02-13
version: 1.0
status: READY FOR EXECUTION
scope: espaider-integration, supabase-rls-patterns, memory-management, agent-orchestration-patterns
---

# Implementation Plan: Critical Skills for Tech-Arauz MVP

> **Objective:** Create 4 critical skills that address knowledge gaps in the tech-arauz project, enabling efficient agent-driven development with proper governance, security, and memory management.

**Total Effort:** ~10-11 hours
**Timeline:** 2-3 days concentrated work
**Priority:** P0 (blocks all future development iterations)

---

## Executive Summary

The tech-arauz project operates under a 20-agent governance system with AI-driven orchestration. Four critical skills have been identified as MVP priorities to:

1. **Formalize Espaider API integration patterns** (central to the project)
2. **Standardize Supabase RLS security practices** (prevent multi-tenant vulnerabilities)
3. **Document agent memory management** (enable context preservation across sessions)
4. **Define orchestration patterns** (guide multi-agent task forces)

Each skill follows the established `.agent/skills/` structure with:
- **SKILL.md** - Metadata, content map, decision checklist, anti-patterns
- **references/** - Templates, guides, examples
- **scripts/** - Validation/automation tools

---

## Phase Breakdown

### Phase 1: Analysis & Architecture (1 hour)
- Analyze project codebase structure
- Review existing skills (api-patterns, database-design)
- Identify project-specific patterns
- **Deliverable:** This implementation plan ✅

### Phase 2: Skill 1 - Espaider Integration (3-4 hours)
### Phase 3: Skill 2 - Supabase RLS Patterns (2-3 hours)
### Phase 4: Skill 3 - Memory Management (2 hours)
### Phase 5: Skill 4 - Agent Orchestration Patterns (3 hours)
### Phase 6: Integration & Testing (1 hour)

---

# SKILL 1: espaider-integration

## Overview

**Purpose:** Centralize knowledge about Espaider API integration patterns, field mapping, error handling, and sync workflows specific to tech-arauz.

**Problem Addressed:**
- Currently, each agent needs to "rediscover" how Espaider API works
- No single source of truth for field mapping (API → Database → UI)
- Null/undefined handling patterns not documented
- Error recovery procedures scattered across code

**Agents Using This Skill:**
- `backend-specialist` (Phase 3: API implementation)
- `database-architect` (Phase 3: schema mapping)
- `explorer-agent` (Phase 1: discovery)
- `security-auditor` (Phase 4: data validation)
- `test-engineer` (Phase 3: test strategy)

---

## File Structure

```
.agent/skills/espaider-integration/
├── SKILL.md                                    (1.2 KB)
├── references/
│   ├── field-mapping.json                      (2.5 KB, structured mapping)
│   ├── field-mapping.md                        (1.8 KB, human-readable reference)
│   ├── workflow-sync.md                        (2 KB, step-by-step guide)
│   ├── error-handling.md                       (1.5 KB, error patterns & recovery)
│   ├── data-validation-checklist.md            (0.8 KB, null/undefined handling)
│   └── examples/
│       ├── sync-new-field.md                   (1 KB, worked example)
│       └── error-recovery.md                   (1 KB, worked example)
├── scripts/
│   ├── validate-espaider-schema.py             (200 lines, Python)
│   └── field-coverage-audit.py                 (150 lines, Python)
└── assets/
    └── espaider-api-diagram.md                 (ASCII diagram)
```

**Total Files:** 11 | **Total Estimated Size:** ~15 KB

---

## Content Outline

### SKILL.md

```markdown
---
name: espaider-integration
description: Espaider API integration patterns, field mapping, error handling, sync workflows.
category: Backend Integration
tags: espaider, api, data-sync, error-handling, validation
version: 1.0
allowed-tools: Read, Write, Edit, Glob, Grep
---

# Espaider Integration Skill

## 🎯 Overview
...

## 📑 Content Map
| File | When to Read |
| --- | --- |
| `field-mapping.md` | Implementing new endpoint, adding field to schema |
| `workflow-sync.md` | Creating sync routine, understanding data flow |
| `error-handling.md` | Debugging sync failures, implementing retry logic |
| `data-validation-checklist.md` | Null/undefined handling, defensive programming |
| `examples/sync-new-field.md` | Step-by-step guide: "How do I add field X?" |
| `examples/error-recovery.md` | Step-by-step guide: "How do I debug API timeout?" |

## 🔗 Related Skills
- @[skills/api-patterns] -- HTTP/REST patterns
- @[skills/database-design] -- Schema design
- @[skills/nodejs-best-practices] -- Async error handling

## ✅ Decision Checklist

Before implementing Espaider sync:
- [ ] Identified which Espaider entities (Projeto/Entrega/Cronograma/Requisito)?
- [ ] Documented which API fields map to database columns?
- [ ] Planned error handling strategy (timeout/parsing/rate-limit)?
- [ ] Designed null/undefined fallback values?
- [ ] Planned logging to `integration_log_entries`?
- [ ] Tested with incomplete API responses?

## ❌ Anti-Patterns

**DON'T:**
- Trust Espaider API responses are always complete (fields can be null)
- Skip retry logic on timeout
- Store API response directly without mapping to schema
- Assume field types are consistent (dates might be strings or nulls)

**DO:**
- Use field mapping reference before coding
- Implement exponential backoff for retries
- Validate before INSERT/UPDATE
- Use integration_log_entries for audit trail
```

---

### references/field-mapping.json

Structure: JSON document with all 135+ Espaider fields, mapping to:
- Database column name
- Data type expected
- Nullable? (yes/no)
- Current usage in tech-arauz (Project/Delivery/Schedule/Requirement)
- Example values

Example:

```json
{
  "projetos": [
    {
      "espaider_field": "IDPROJETO",
      "db_column": "id_espaider",
      "data_type": "integer",
      "nullable": false,
      "used_in": ["projects"],
      "example": 12345,
      "notes": "Primary key from Espaider"
    },
    {
      "espaider_field": "APROVADORATUAL",
      "db_column": "fase_atual",
      "data_type": "text",
      "nullable": true,
      "used_in": ["projects"],
      "example": "Análise Técnica",
      "notes": "Used for Kanban grouping; can be null if project not yet approved"
    },
    ...
  ],
  "entregas": [...],
  "cronogramas": [...],
  "requisitos": [...]
}
```

---

### references/field-mapping.md

Human-readable markdown version of above JSON.

Table format:
| Espaider Field | DB Column | Type | Nullable | Entity | Notes |
| --- | --- | --- | --- | --- | --- |

---

### references/workflow-sync.md

**Structure:** Step-by-step guide to Espaider sync workflow.

**Sections:**
1. **Architecture Overview** (2 diagrams in ASCII)
   - Data flow: Espaider API → `integration_log_entries` → Supabase tables
   - Retry logic with circuit breaker

2. **Pre-Sync Validation** (checklist)
   - API credentials valid?
   - Schema up-to-date?
   - Integration log table ready?

3. **Sync Phases**
   - Phase 1: Fetch from Espaider (HTTP GET)
   - Phase 2: Parse response (validation)
   - Phase 3: Map fields using field-mapping.json
   - Phase 4: Insert/update in Supabase (with RLS policies)
   - Phase 5: Log to integration_log_entries

4. **Error Recovery** (cross-reference to error-handling.md)

5. **Data Reconciliation** (how to handle conflicts)

---

### references/error-handling.md

**Error Scenarios:**
1. **Timeout** (API doesn't respond within 30s)
   - Recovery: Exponential backoff, max 5 retries, log to integration_log_entries

2. **Invalid JSON** (API returns malformed response)
   - Recovery: Log raw response, skip record, continue with next

3. **Rate Limit** (429 Too Many Requests)
   - Recovery: Sleep 60s, retry once

4. **Auth Failure** (401 Unauthorized)
   - Recovery: Alert admin, pause sync, check credentials

5. **Partial Data** (field missing but not null)
   - Recovery: Use default value, log as warning

Each scenario includes:
- How to detect
- Recovery strategy
- How to log
- When to alert admin

---

### references/data-validation-checklist.md

**Defensive Programming Guide:**

For each Espaider field:
- [ ] Check for `null` before type cast
- [ ] Check for empty string (`""`)
- [ ] Check for unexpected data type (e.g., date as string)
- [ ] Define fallback value if invalid
- [ ] Log validation failure to integration_log_entries

**Example Checklist for APROVADORATUAL:**
```
- [ ] Parse as string
- [ ] Trim whitespace: value?.trim()
- [ ] Check against known fase values (Analise Tecnica, Aprovacao, etc.)
- [ ] If invalid, set to NULL
- [ ] Log validation failure if value didn't match expected
```

---

### references/examples/sync-new-field.md

**Scenario:** "I need to add DATAALERTAPRAZO field from Espaider to project_schedules table"

**Step-by-step:**
1. Find field in field-mapping.json
   - `espaider_field: "DATAALERTAPRAZO"`
   - `db_column: "data_alerta_prazo"`
   - `data_type: "date"`
   - `nullable: true`

2. Verify database column exists
   - Query: `SELECT data_alerta_prazo FROM project_schedules LIMIT 1`
   - If missing, create migration

3. Update mapper in `src/integrations/espaider/mapper.ts`
   - Add to `CAMPOS_CRONOGRAMA` array
   - Update `mapearCronograma()` function
   - Add validation: check for null/invalid dates

4. Update types in `src/integrations/espaider/types.ts`
   - Add `data_alerta_prazo?: Date` to `CronogramaMapeado`

5. Test with real data
   - Sync subset of records
   - Check integration_log_entries for errors
   - Verify data in database

6. Update this documentation
   - Add field to field-mapping.md

---

### references/examples/error-recovery.md

**Scenario:** "Sync failed with timeout error; how do I debug and retry?"

**Step-by-step:**
1. Check integration_log_entries table
   - Find last error entry
   - Identify which entity (Projeto/Entrega) failed
   - Check timestamp and error message

2. Verify API is responsive
   - Test with curl/Postman
   - Check Espaider API status page

3. Retry manually
   - Run sync again (hopefully transient timeout)
   - Monitor integration_log_entries for success

4. If still failing
   - Check field mapping validation
   - Run data-validation-checklist on sample response
   - Log raw API response for analysis

---

### scripts/validate-espaider-schema.py

**Purpose:** Validate that Supabase schema matches field-mapping.json

**Functionality:**
- Load field-mapping.json
- Connect to Supabase
- For each entity (projetos, entregas, cronogramas, requisitos):
  - Check if all mapped DB columns exist
  - Check if column data types match expected
  - Report missing columns (breaking changes!)

**Usage:**
```bash
python .agent/skills/espaider-integration/scripts/validate-espaider-schema.py
```

**Output:**
```
✅ projects table: All 21 columns present
⚠️  project_schedules table: Missing column data_alerta_prazo
❌ project_deliveries table: Column prioridade has wrong type (text vs integer)
```

---

### scripts/field-coverage-audit.py

**Purpose:** Audit which Espaider fields are actually being used in tech-arauz

**Functionality:**
- Query Supabase schema
- Check espaider_raw JSONB columns
- Count which fields appear in real data
- Report unused fields vs used fields
- Suggest next fields to map from raw → structured

**Output:**
```
Field Coverage Report:

USED (Mapped to column):
- IDPROJETO: 100% of projects (12,450 records)
- NOMEPROJETO: 100% of projects
- APROVADORATUAL: 85% of projects (some null)
- [20 more fields...]

PARTIALLY USED (In espaider_raw only):
- DATAALERTAPRAZO: 45% of schedules (in raw, not yet mapped)
- DETALHAMENTO: 90% of requirements (in raw, not yet mapped)

UNUSED:
- CAMPO_X, CAMPO_Y, ... (10 fields never appear in data)

Recommendation: Next sprint, map DATAALERTAPRAZO (45% usage)
```

---

### assets/espaider-api-diagram.md

ASCII art diagrams:
1. Espaider API request/response structure
2. Field mapping flow (API → DB)
3. Error handling flow (with retry logic)
4. Sync orchestration (parallel Projeto/Entrega/etc.)

---

## Quality Checklist

- [ ] All 135+ Espaider fields documented in field-mapping.json
- [ ] Null/undefined handling examples provided
- [ ] Error scenarios cover 80% of real failures seen
- [ ] Scripts run without errors and produce useful output
- [ ] Workflow guide is step-by-step (junior dev can follow)
- [ ] Memory logs reference this skill in Phase 1-3

---

# SKILL 2: supabase-rls-patterns

## Overview

**Purpose:** Formalize Row-Level Security (RLS) patterns, best practices, and anti-patterns specific to tech-arauz multi-tenant architecture.

**Problem Addressed:**
- RLS bugs discovered in production (tenant isolation failures)
- RLS policies created inconsistently across tables
- Developers don't know how to test RLS
- No checklist to ensure RLS coverage

**Agents Using This Skill:**
- `database-architect` (Phase 3: schema design)
- `security-auditor` (Phase 4: mandatory validation)
- `backend-specialist` (Phase 3: API implementation)
- `test-engineer` (Phase 3-4: security testing)

---

## File Structure

```
.agent/skills/supabase-rls-patterns/
├── SKILL.md                                     (1.2 KB)
├── references/
│   ├── rls-fundamentals.md                      (2 KB, concepts & architecture)
│   ├── rls-templates.sql                        (2 KB, copy-paste policies)
│   ├── rls-patterns-by-table.md                 (2 KB, tech-arauz specific)
│   ├── rls-testing-guide.md                     (1.5 KB, how to test)
│   ├── rls-debugging.md                         (1.5 KB, troubleshooting)
│   └── rls-checklist.md                         (1 KB, validation checklist)
├── scripts/
│   ├── audit-rls-coverage.py                    (200 lines)
│   └── test-rls-bypass.py                       (250 lines, security testing)
└── assets/
    └── rls-architecture.md                      (ASCII diagrams)
```

**Total Files:** 10 | **Total Estimated Size:** ~14 KB

---

## Content Outline

### SKILL.md

```markdown
---
name: supabase-rls-patterns
description: Row-Level Security patterns, multi-tenant isolation, testing, debugging.
category: Database Security
tags: rls, security, multi-tenant, supabase, authorization
version: 1.0
allowed-tools: Read, Write, Edit, Glob, Grep
---

# Supabase RLS Patterns

## 🎯 Overview
RLS is the PRIMARY security mechanism for multi-tenant data isolation in tech-arauz.

## 📑 Content Map
| File | When to Read |
| --- | --- |
| `rls-fundamentals.md` | Learning RLS from scratch |
| `rls-templates.sql` | Creating new RLS policy (copy-paste templates) |
| `rls-patterns-by-table.md` | Understanding tech-arauz table structure + policies |
| `rls-testing-guide.md` | Testing RLS (manual + automated) |
| `rls-debugging.md` | Debugging "access denied" errors |
| `rls-checklist.md` | Pre-deployment validation |

## ✅ Decision Checklist

Before deploying ANY table to production:
- [ ] ENABLE RLS on table?
- [ ] Created ≥1 policy for INSERT/UPDATE/DELETE/SELECT?
- [ ] Policies use `get_user_tenant_id()` function?
- [ ] Tested with 2+ tenants (cross-tenant access should FAIL)?
- [ ] Tested with service key (should bypass RLS, for admin ops)?
- [ ] Logged policy changes in migration comment?

## ❌ Anti-Patterns

**DON'T:**
- Drop RLS without backup (DROP POLICY)
- Create policy with `TRUE` condition (allows all access)
- Use service key in frontend (leaks admin access)
- Assume RLS works without testing
- Enable RLS but forget the policies (blocks all access)

**DO:**
- Always create test to verify cross-tenant isolation
- Use `get_user_tenant_id()` for automatic filtering
- Document why each policy exists
- Review RLS in security audit (Phase 4)
```

---

### references/rls-fundamentals.md

**Sections:**
1. **What is RLS?**
   - Row-level security: database enforces access at row level
   - Executed on every query (SELECT, INSERT, UPDATE, DELETE)
   - Policies defined in SQL, evaluated before data is returned

2. **How Tech-Arauz Uses RLS**
   - Single tenant (`arauz`) today, prepared for multi-tenant future
   - Each user belongs to 1 tenant (table: `user_tenants`)
   - Policies use `get_user_tenant_id()` function to determine tenant
   - Example: User from tenant `arauz` cannot see data from tenant `other`

3. **Policy Structure**
   ```sql
   CREATE POLICY policy_name ON table_name
   FOR SELECT
   USING (condition_here);
   ```

4. **Auth Context**
   - `auth.uid()` - Current user ID from JWT
   - `auth.jwt()` - Full JWT payload
   - Custom function: `get_user_tenant_id(auth.uid())`

---

### references/rls-templates.sql

**Copy-paste templates for common scenarios:**

**Template 1: Users see own tenant data (most common)**
```sql
CREATE POLICY "Users can view own tenant data" ON projects
FOR SELECT
USING (
  id_tenant = get_user_tenant_id(auth.uid())
);

CREATE POLICY "Users can create in own tenant" ON projects
FOR INSERT
WITH CHECK (
  id_tenant = get_user_tenant_id(auth.uid())
);
```

**Template 2: Admins bypass RLS via service key**
```sql
-- Service key requests bypass RLS automatically in Supabase
-- No policy needed; just use service_role key on backend
```

**Template 3: Role-based access**
```sql
CREATE POLICY "Admins can do anything; users can view" ON projects
FOR SELECT
USING (
  get_user_role(auth.uid()) = 'admin'
  OR (
    id_tenant = get_user_tenant_id(auth.uid())
    AND get_user_role(auth.uid()) IN ('admin', 'user')
  )
);
```

---

### references/rls-patterns-by-table.md

**For each table in tech-arauz, document:**
- Required policies (SELECT/INSERT/UPDATE/DELETE)
- Edge cases (can users delete own data? only admins?)
- Who has access (admin/user/viewer?)
- Example policies

**Example: projects table**

| Policy | Action | Condition |
| --- | --- | --- |
| `Users see own tenant projects` | SELECT | `id_tenant = get_user_tenant_id(auth.uid())` |
| `Users create in own tenant` | INSERT | `id_tenant = get_user_tenant_id(auth.uid())` AND `created_by = auth.uid()` |
| `Users update own tenant only` | UPDATE | `id_tenant = get_user_tenant_id(auth.uid())` |
| `Users cannot delete` | DELETE | FALSE (no one can delete, only admin via service key) |

---

### references/rls-testing-guide.md

**How to test RLS (prevents production breaches):**

**Test 1: User A cannot see User B's data**
```sql
-- As User A (auth token for user_a):
SELECT * FROM projects;  -- Should see only tenant_arauz projects

-- As User B (auth token for user_b, different tenant):
SELECT * FROM projects;  -- Should see ZERO rows if user_b in different tenant
```

**Test 2: Cross-tenant access is blocked**
```javascript
// Frontend code
const user_a_token = ...; // User from arauz tenant
const user_b_token = ...; // User from other tenant

// User A tries to query User B's data:
const result = await supabase
  .from('projects')
  .select('*')
  .eq('id_tenant', 'other')  // Try to access other tenant
  .setAuth(user_a_token);

// Should return: 0 rows (RLS silently filtered)
```

**Test 3: Service key bypasses RLS**
```javascript
// Backend code (server action)
// Using service_role key (admin access)
const result = await supabaseAdmin
  .from('projects')
  .select('*');  // Returns ALL projects, ignoring RLS

// Use this for: admin operations, internal audits
```

---

### references/rls-debugging.md

**Error: "new row violates row-level security policy"**

**Cause:** Trying to INSERT/UPDATE a row that fails the RLS condition.

**Example:**
```javascript
// Frontend tries to create project for different tenant
const { error } = await supabase
  .from('projects')
  .insert({
    title: 'Project',
    id_tenant: 'other_tenant'  // ❌ User not in this tenant
  });

// Error: "new row violates row-level security policy"
```

**Fix:** Always set `id_tenant` to user's actual tenant
```javascript
const { error } = await supabase
  .from('projects')
  .insert({
    title: 'Project',
    id_tenant: await get_user_tenant_id(user.id)  // ✅
  });
```

---

### references/rls-checklist.md

**Pre-deployment RLS audit:**

```markdown
## RLS Coverage Checklist

### Table: projects
- [ ] RLS ENABLED?
- [ ] Policy for SELECT (viewing data)?
- [ ] Policy for INSERT (creating data)?
- [ ] Policy for UPDATE (editing data)?
- [ ] Policy for DELETE (or is it forbidden)?
- [ ] Cross-tenant test passed?
- [ ] Service key bypass tested?

### Table: project_deliveries
- [ ] RLS ENABLED?
- [ ] Policy for SELECT?
- [ ] ...

### Summary
- [ ] ≥1 policy per operation (SELECT/INSERT/UPDATE/DELETE)
- [ ] All policies reference `get_user_tenant_id()` or `get_user_role()`
- [ ] No policies with `TRUE` condition (overly permissive)
- [ ] Documentation explains each policy's purpose
```

---

### scripts/audit-rls-coverage.py

**Purpose:** Check which tables have RLS enabled and how many policies.

**Output:**
```
RLS Coverage Audit
==================

Table: projects
  RLS Enabled: ✅ Yes
  Policies: 4
    - Users see own tenant (SELECT)
    - Users create in own tenant (INSERT)
    - Users update own tenant (UPDATE)
    - Only admins can delete (DELETE)
  Coverage: ✅ PASS (all operations protected)

Table: project_deliveries
  RLS Enabled: ✅ Yes
  Policies: 3
  Coverage: ⚠️  WARNING (missing DELETE policy)

Table: users
  RLS Enabled: ❌ NO
  Policies: 0
  Coverage: ❌ FAIL (sensitive table without RLS!)

Summary:
- Total tables: 12
- RLS enabled: 11 (91%)
- Missing RLS: 1 (users table)
- Tables needing more policies: 2
```

---

### scripts/test-rls-bypass.py

**Purpose:** Security testing - verify RLS actually prevents cross-tenant access

**Functionality:**
- Create test users in different tenants
- Attempt cross-tenant queries
- Verify all queries are blocked by RLS
- Report any security gaps

**Output:**
```
RLS Security Testing
====================

Test 1: User A (tenant: arauz) access User B (tenant: other) data
  SELECT projects WHERE id_tenant = 'other'
  Result: ✅ BLOCKED (0 rows returned) — RLS working

Test 2: User A tries to INSERT into other tenant
  INSERT projects SET id_tenant = 'other'
  Result: ✅ BLOCKED (RLS policy violation) — RLS working

Test 3: Service key (admin) can access all tenants
  SELECT projects (using service_role)
  Result: ✅ ALLOWED (127 rows) — Correct for admin operations

Overall: ✅ PASS - No RLS bypass vulnerabilities detected
```

---

## Quality Checklist

- [ ] Covers all 12+ tables in tech-arauz schema
- [ ] Templates are copy-paste ready (tested)
- [ ] Testing guide includes real code examples
- [ ] Debugging section addresses top 5 RLS errors
- [ ] Scripts produce actionable output
- [ ] Every table has documented policies

---

# SKILL 3: memory-management

## Overview

**Purpose:** Formalize the agent memory system - how to write, read, and leverage memory logs for context preservation across sessions.

**Problem Addressed:**
- Memory logs exist but no standardized format or usage guidelines
- New agents don't know when/how to create memory logs
- Memory logs not indexed/searchable
- Decisions documented but not discoverable for future tasks

**Agents Using This Skill:**
- `orchestrator` (Phase 1-6: memory check, memory commit)
- All specialists (Phase 2: strategy reference)
- `documentation-writer` (Phase 5: log creation)

---

## File Structure

```
.agent/skills/memory-management/
├── SKILL.md                                     (1.2 KB)
├── references/
│   ├── TEMPLATE.md                              (1.5 KB, copy-paste template)
│   ├── when-to-create-log.md                    (1.2 KB, decision guide)
│   ├── chesterton-fence.md                      (1.5 KB, referencing past decisions)
│   ├── examples/
│   │   ├── crud-feature-log.md                  (2 KB, worked example)
│   │   ├── security-audit-log.md                (2 KB, worked example)
│   │   └── performance-optimization-log.md      (1.5 KB, worked example)
│   └── MEMORY-INDEXING.md                       (1 KB, how to search logs)
├── scripts/
│   ├── memory-indexer.py                        (250 lines, index memory logs)
│   └── memory-search.py                         (150 lines, search memory logs)
└── assets/
    └── memory-system-architecture.md             (ASCII diagram)
```

**Total Files:** 12 | **Total Estimated Size:** ~16 KB

---

## Content Outline

### SKILL.md

```markdown
---
name: memory-management
description: Agent memory protocols, logging, context preservation, indexing.
category: Governance & Orchestration
tags: memory, logging, context, decision-tracking, audit-trail
version: 1.0
allowed-tools: Read, Write, Edit, Glob, Grep
---

# Memory Management

## 🎯 Overview
Agent memory is the CORE of the governance system. It enables:
- Context preservation across sessions
- Decision tracking and rationale
- Preventing regression (same mistakes don't repeat)
- Audit trail for compliance

## 📑 Content Map
| File | When to Read |
| --- | --- |
| `TEMPLATE.md` | Creating new memory log |
| `when-to-create-log.md` | Deciding when to create vs update log |
| `chesterton-fence.md` | Understanding "why is this here?" |
| `examples/` | Real examples of well-written logs |
| `MEMORY-INDEXING.md` | Finding past decisions |

## ✅ Decision Checklist

Before committing memory:
- [ ] Logged context (what was requested, why)?
- [ ] Logged agents involved (who solved it)?
- [ ] Logged files changed (what was modified)?
- [ ] Logged critical decisions (why X over Y)?
- [ ] Logged lessons (what to avoid next time)?
- [ ] Logged tags (how to find this later)?

## When to Create Memory Log

Memory logs are MANDATORY for:
✅ Multi-agent task forces (≥2 agents)
✅ Architecture changes (new table, new API endpoint)
✅ Security audit (Phase 4 of orchestration protocol)
✅ Bug fix (critical production bugs)
✅ Refactoring (>100 lines changed)

Memory logs are OPTIONAL for:
- Small fixes (<50 lines changed)
- Bug fixes in isolated components
- Documentation updates
```

---

### references/TEMPLATE.md

```markdown
---
id: {{UUID}} -- generate with: python -c "import uuid; print(uuid.uuid4())"
date: {{YYYY-MM-DD}}
time: {{HH:MM}}
trigger: {{User request or event}}
status: {{SUCCESS/FAILURE/IN_PROGRESS}}
tags: [{{TAG1}}, {{TAG2}}]  -- e.g., [espaider, security, performance]
related_logs: [{{ID1}}, {{ID2}}]  -- links to previous related logs
---

# 🧠 Agent Memory Log: {{TASK_NAME}}

> One-line summary of what was accomplished

## 1. Context & Objective

**What was requested?**
> {{DESCRIPTION}} — Keep to 2-3 sentences.

**Why is this necessary?**
- {{REASON_1}}
- {{REASON_2}}

**Business impact if not done:**
> {{IMPACT}}

---

## 2. Strategy & Team Assembly

**Agents Involved:**
- [x] `@orchestrator` — Coordination
- [x] `@backend-specialist` — API implementation
- [ ] `@frontend-specialist` — UI (not needed)

**Skills Loaded (by Phase):**

### Phase 1 (Ingestion)
- `@orchestrator`: `architecture`, `memory-management`

### Phase 2 (Strategy)
- `@project-planner`: `plan-writing`, `brainstorming`
- `@orchestrator`: `agent-orchestration-patterns`

### Phase 3 (Execution)
- `@backend-specialist`: `api-patterns`, `nodejs-best-practices`
- `@database-architect`: `database-design`, `supabase-rls-patterns`

### Phase 4 (Validation)
- `@security-auditor`: `vulnerability-scanner`
- `@test-engineer`: `testing-patterns`

### Phase 5 (Documentation)
- `@documentation-writer`: `documentation-templates`

---

## 3. Execution & Changes

**Files Modified:**

| File | Action | Justification |
| --- | --- | --- |
| `src/api/projects.ts` | Create | New endpoint POST /projects |
| `src/components/ProjectForm.tsx` | Create | Form component for project creation |
| `supabase/migrations/013_projects_table.sql` | Create | Schema for projects table |
| `.env.example` | Edit | Add PROJECT_SYNC_INTERVAL |

**Critical Technical Decisions:**

1. **Decision: Use Supabase for projects table (vs MongoDB)**
   - **Context:** Needed structured data with RLS
   - **Options:** PostgreSQL/Supabase vs MongoDB vs Firebase
   - **Choice:** Supabase (relational + RLS + real-time)
   - **Consequence:** Better multi-tenant security; slightly slower for complex queries

2. **Decision: Sync Espaider every 5 minutes (vs real-time)**
   - **Context:** Espaider API rate limits us to 100 req/min
   - **Options:** Real-time via webhooks vs polling every 1/5/30 min
   - **Choice:** 5-minute polling (safe margin, good freshness)
   - **Consequence:** Data 5-min stale; simpler implementation

---

## 4. Testing & Validation

**Test Coverage:**
- [x] Unit tests for mapper (espaider-integration skill)
- [x] Integration tests for Supabase insertion
- [x] E2E test: sync → database → UI
- [x] Security: RLS policy blocks cross-tenant access
- [x] Error handling: timeout, invalid JSON, null fields

**Test Results:**
```
✅ All tests passing (42 tests)
✅ RLS audit passed (0 gaps)
✅ Code coverage: 87% (target: 80%)
```

---

## 5. Retrospective & Lessons Learned

**What went well?**
- Espaider API more stable than expected
- RLS templates made security audit 60% faster
- Memory logs from previous sprint saved 2 hours of context time

**What could improve?**
- Field mapping docs were incomplete (spent 1 hour rediscovering fields)
- Error handling for null dates took 3 attempts to get right
- Should have tested with incomplete API responses earlier

**Advice for next time:**
> When adding new Espaider fields, immediately update field-mapping.json and add null-check. Don't defer documentation.

---

## 6. Follow-up Actions

**Required:**
- [ ] Deploy migration 013 to staging environment
- [ ] Run security audit on production RLS policies
- [ ] Update API documentation in README

**Optional (Future):**
- [ ] Optimize sync query with index on `id_espaider`
- [ ] Add support for incremental sync (only changed records)

---

## 7. References

**Skills used:**
- @[skills/espaider-integration] — field mapping
- @[skills/supabase-rls-patterns] — security policies
- @[skills/api-patterns] — endpoint design

**Related logs:**
- [2026-02-11_espaider-field-restructure.md] — previous Espaider work
- [2026-02-10_audit-tech-arauz.md] — overall architecture

**Documentation updated:**
- [.context/02-rules/business-rules.md] — BR-003 updated
- [README.md] — API endpoint documented
```

---

### references/when-to-create-log.md

**Decision Tree:**

```
Does task involve MULTIPLE AGENTS?
├─ YES → CREATE memory log (mandatory for multi-agent coordination)
└─ NO  → Is it architecture change? (new table, new API, new module)
         ├─ YES → CREATE memory log (explains design decisions)
         └─ NO  → Is it Phase 4 security audit?
                  ├─ YES → CREATE memory log (for compliance)
                  └─ NO  → Is bug fix critical (production down)?
                           ├─ YES → CREATE memory log (explain root cause)
                           └─ NO  → Is it refactoring >100 lines?
                                    ├─ YES → CREATE memory log (explain why)
                                    └─ NO  → OPTIONAL (you can skip if small)
```

---

### references/chesterton-fence.md

**Concept:** "Don't move that fence unless you understand why it's there."

**In Tech-Arauz:** When you find existing code/config, ask:
1. **Why does this exist?**
   - Check memory logs: `.agent/memory/` directory
   - Search for decision that created it

2. **Who created it?**
   - Check git blame (if committed)
   - Check memory log author

3. **What constraints does it follow?**
   - Business rule (BR-XXX)?
   - Security requirement?
   - Performance optimization?

4. **What breaks if I change it?**
   - Memory logs document consequences
   - Search related logs for impact analysis

**Example:**
```
❌ BAD: "This RLS policy seems overly complex; I'll simplify it"
    → Didn't check memory logs
    → Doesn't understand it prevents tenant isolation

✅ GOOD: "This RLS policy is complex; let me find the memory log"
    → Read: [2026-02-10_rls-migration.md]
    → Understand: Complexity is intentional (prevent privilege escalation)
    → Modify carefully with security-auditor
```

---

### references/examples/crud-feature-log.md

**Real example:** "Create Products CRUD feature"

Shows:
- Multi-agent coordination (database-architect, backend-specialist, frontend-specialist)
- Critical decisions (why table design, why API patterns)
- Test coverage
- Lessons for next feature

---

### references/examples/security-audit-log.md

**Real example:** "Security audit found RLS gap in projects table"

Shows:
- How to document security decisions
- Testing strategy for RLS
- How to reference to fix follow-up actions

---

### references/examples/performance-optimization-log.md

**Real example:** "Optimize Dashboard Web Vitals (LCP 3.2s → 1.8s)"

Shows:
- Performance decision rationale
- Profiling results
- Metrics improvement

---

### references/MEMORY-INDEXING.md

**How to find memory logs:**

Option 1: Search by date
```bash
ls .agent/memory/2026-02-*.md  # All logs from Feb 2026
```

Option 2: Search by tag
```bash
grep -r "tags:.*security" .agent/memory/  # All security-related logs
```

Option 3: Search by skill
```bash
grep -r "@\[skills/espaider-integration\]" .agent/memory/  # Using this skill
```

---

### scripts/memory-indexer.py

**Purpose:** Index memory logs by date, tag, agents, skills

**Output:**
```
Memory Log Index
================

By Date:
- 2026-02-13: 3 logs
- 2026-02-12: 2 logs
- 2026-02-11: 4 logs

By Tag:
- [espaider]: 5 logs
- [security]: 4 logs
- [performance]: 2 logs

By Agent:
- orchestrator: 9 logs (appears in all)
- database-architect: 5 logs
- backend-specialist: 6 logs
- frontend-specialist: 4 logs

By Skill:
- espaider-integration: 3 logs
- supabase-rls-patterns: 4 logs
- memory-management: 2 logs (this skill!)
```

---

### scripts/memory-search.py

**Purpose:** Full-text search memory logs

**Usage:**
```bash
python .agent/skills/memory-management/scripts/memory-search.py "RLS policy"
```

**Output:**
```
Found 4 logs mentioning "RLS policy":

1. 2026-02-11_espaider-field-restructure.md
   Line 34: "...Adicionadas 10 colunas em `projects` com RLS policy..."

2. 2026-02-10_validation-cto-structure.md
   Line 87: "...RLS policy audit passed with 0 gaps..."

3. 2026-02-10_audit-tech-arauz.md
   Line 145: "...Criada RLS policy para tabela projects..."

4. 2026-02-13_crud-feature-log.md (latest)
   Line 112: "...RLS policy prevents tenant isolation..."
```

---

## Quality Checklist

- [ ] Template is easy to copy-paste and fill
- [ ] Real examples cover different scenario types (CRUD, security, performance)
- [ ] Indexing scripts work without errors
- [ ] Search is fast (< 1 sec for 50+ logs)
- [ ] "When to create" decision tree is clear

---

# SKILL 4: agent-orchestration-patterns

## Overview

**Purpose:** Define patterns and templates for assembling task forces (multi-agent teams), managing dependencies, and coordinating execution of complex features.

**Problem Addressed:**
- No standardized way to decide "which agents should work on this task?"
- Dependencies between agents not formalized (database schema needed before API)
- Conflict resolution when 2 agents propose different solutions
- No visibility into "why were these 3 agents chosen?"

**Agents Using This Skill:**
- `orchestrator` (Phase 2-3: strategy, execution)
- `project-planner` (Phase 2: planning)
- `explorer-agent` (Phase 1: discovery)

---

## File Structure

```
.agent/skills/agent-orchestration-patterns/
├── SKILL.md                                     (1.2 KB)
├── references/
│   ├── task-force-patterns.md                   (3 KB, 5 standard patterns)
│   ├── dependency-chains.md                     (2 KB, P0/P1/P2 ordering)
│   ├── conflict-resolution.md                   (1.5 KB, when agents disagree)
│   ├── decision-matrix.md                       (2 KB, task → agents mapping)
│   └── examples/
│       ├── crud-task-force.md                   (1.5 KB, worked example)
│       ├── espaider-sync-task-force.md          (1.5 KB, worked example)
│       ├── hotfix-production-task-force.md      (1.2 KB, worked example)
│       └── security-audit-task-force.md         (1.2 KB, worked example)
├── scripts/
│   ├── validate-task-force.py                   (200 lines)
│   └── dependency-visualizer.py                 (150 lines)
└── assets/
    └── orchestration-patterns.md                (ASCII diagrams)
```

**Total Files:** 13 | **Total Estimated Size:** ~18 KB

---

## Content Outline

### SKILL.md

```markdown
---
name: agent-orchestration-patterns
description: Multi-agent task force assembly, dependency management, conflict resolution.
category: Governance & Orchestration
tags: orchestration, task-force, multi-agent, coordination, dependencies
version: 1.0
allowed-tools: Read, Write, Edit, Glob, Grep
---

# Agent Orchestration Patterns

## 🎯 Overview
Task forces are multi-agent teams assembled for complex tasks.

| Type | Agents | Phase | Example |
| --- | --- | --- | --- |
| Pair | 2 agents | 3 | Database schema → API endpoint |
| Trio | 3 agents | 3 | Feature CRUD (DB + API + UI) |
| Squad | 4+ agents | 4-5 | Major refactor or deployment |

## 📑 Content Map
| File | When to Read |
| --- | --- |
| `task-force-patterns.md` | Assembling a team |
| `dependency-chains.md` | Ordering work (P0 before P1) |
| `conflict-resolution.md` | When agents disagree |
| `decision-matrix.md` | Matching task to agents |
| `examples/` | Real task forces |

## ✅ Decision Checklist

Before dispatching agents:
- [ ] Identified task complexity (simple/pair/trio/squad)?
- [ ] Chose agents from decision matrix?
- [ ] Documented P0/P1/P2 ordering?
- [ ] Verified no blocking dependencies?
- [ ] Planned conflict resolution if needed?
- [ ] Set clear success criteria for each agent?
```

---

### references/task-force-patterns.md

**5 standard patterns:**

**Pattern 1: Pair - Simple Feature**
```
TASK: Add one field to existing table + API endpoint
WHEN: Simple CRUD operation, no schema redesign needed
AGENTS:
- P0: database-architect (30 min) — Add column + index
- P0: backend-specialist (1 hour) — Create endpoint
- P1: test-engineer (30 min) — Write tests
BLOCKERS: None (can parallelize after schema done)
DECISION: Simple, well-defined scope
```

**Pattern 2: Trio - Feature CRUD**
```
TASK: Create new "Products" module (table + API + UI)
WHEN: Feature involves new business entity
AGENTS:
- P0: database-architect (1.5 hours) — Schema design
- P0: backend-specialist (2 hours) — API CRUD endpoints (waiting on schema)
- P1: frontend-specialist (2 hours) — React components (waiting on API)
- P1: test-engineer (1 hour) — Unit + E2E tests
- P2: security-auditor (30 min) — RLS review (waiting on schema)
BLOCKERS: Database → API → UI → Tests
DECISION: All components needed for business feature
```

**Pattern 3: Squad - Espaider Sync**
```
TASK: Add 10 new Espaider fields to project schema + sync logic
WHEN: External integration requires multiple entities
AGENTS:
- P0: explorer-agent (30 min) — Map new fields from Espaider API
- P0: database-architect (1 hour) — Schema migrations
- P0: backend-specialist (1.5 hours) — Mapper + sync logic
- P1: test-engineer (1 hour) — Integration tests (null/undefined handling)
- P2: security-auditor (30 min) — Data validation audit
BLOCKERS: Explore → Schema → Mapper → Tests → Security
DECISION: Multi-layer integration requiring specialists
```

**Pattern 4: Squad - Security Audit**
```
TASK: Full security audit (Phase 4 of orchestration-protocol)
WHEN: Before major deployment
AGENTS:
- orchestrator (30 min) — Plan audit scope
- security-auditor (2 hours) — RLS, auth, input validation
- code-archaeologist (1 hour) — Secret leaks, hardcoded values
- test-engineer (1 hour) — Security testing (OWASP Top 10)
BLOCKERS: None (can parallelize)
DECISION: Comprehensive coverage for production
```

**Pattern 5: Squad - Production Hotfix**
```
TASK: Fix critical bug in production (users can't export data)
WHEN: Production down, time-sensitive
AGENTS:
- orchestrator (15 min) — Root cause analysis strategy
- debugger (30 min) — Find bug root cause
- backend-specialist (30 min) — Fix bug
- test-engineer (30 min) — Verify fix + regression tests
- devops-engineer (15 min) — Deploy hotfix
BLOCKERS: Debugger → Backend → Tests → Deploy
DECISION: Fast parallel execution, skip non-critical steps (docs, performance opt)
```

---

### references/dependency-chains.md

**P0 → P1 → P2 Ordering:**

Example: Feature CRUD

```
P0 - BLOCKING (must complete before P1)
├─ database-architect: Schema design + migration
└─ Acceptance: "Can I query the table?"

P1 - DEPENDENT (can start after P0)
├─ backend-specialist: API endpoints
├─ test-engineer: Unit tests
└─ Acceptance: "Can I CRUD via API?"

P2 - FINAL (can start after P1)
├─ frontend-specialist: React components
├─ test-engineer: E2E tests
└─ Acceptance: "Can I use feature in UI?"

P3 - OPTIONAL (if time permits)
├─ performance-optimizer: Query optimization
└─ seo-specialist: SEO if public feature
```

**Dependency validator (script):**
```
Task: Create Products CRUD
Dependencies:
  database-architect → backend-specialist: ✅ VALID (DB before API)
  backend-specialist → frontend-specialist: ✅ VALID (API before UI)
  frontend-specialist → test-engineer: ✅ VALID (UI before E2E)

Blocking Check:
  P0 agents can start in parallel: ✅ YES
  P1 agents blocked by P0: ✅ YES (expected)
  No circular dependencies: ✅ PASS
```

---

### references/conflict-resolution.md

**When 2 agents propose different solutions:**

**Scenario 1: Database design conflict**
```
TASK: Add RLS policy to projects table

backend-specialist proposes:
  "Policy: users see own tenant with get_user_tenant_id()"

database-architect proposes:
  "Policy: users see own tenant + inherit from parent org"

RESOLUTION:
1. Identify trade-off:
   - Option A: Simpler, faster, matches current user_tenants structure
   - Option B: More flexible for future org hierarchies
2. Check requirements (BR-002, RF-002)
3. Consult security-auditor (mandatory Phase 4)
4. Document in memory log why we chose Option A
5. Record in "Follow-up actions" if Option B needed later
```

**Scenario 2: API endpoint design**
```
TASK: Create endpoint for syncing Espaider

backend-specialist proposes:
  "POST /api/projects/sync - manual sync endpoint"

orchestrator proposes:
  "Background job + webhook - automatic sync on demand"

RESOLUTION:
1. Check espaider-integration skill (API patterns)
2. Discuss constraints: rate-limiting, API stability
3. Check SKILLS-ROADMAP: "5-minute polling chosen in Sprint 1"
4. Proceed with manual endpoint (Phase 1), schedule automatic for Phase 2
5. Document decision in memory log with performance metrics
```

---

### references/decision-matrix.md

**How to choose agents for any task:**

| Task Type | Agents | Notes |
| --- | --- | --- |
| Add database column | database-architect, backend-specialist | Check RLS needed |
| Create API endpoint | backend-specialist | Check auth/rate-limiting |
| Create React component | frontend-specialist | Check accessibility |
| Feature CRUD | orchestrator, database-architect, backend-specialist, frontend-specialist, test-engineer | Trio+ task force |
| Espaider sync | explorer-agent, backend-specialist, database-architect, test-engineer, security-auditor | Squad (high complexity) |
| Security audit | security-auditor, code-archaeologist, test-engineer | Mandatory Phase 4 |
| Performance opt | performance-optimizer, frontend-specialist (or backend-specialist) | When CWV bad |
| Bug fix | debugger, backend-specialist (or frontend-specialist) | Find → Fix |
| Refactor | code-archaeologist, test-engineer | Large changes |
| Deployment | devops-engineer, qa-automation-engineer, security-auditor | Before go-live |
| Documentation | documentation-writer + subject specialist | Phase 5 (mandatory) |

---

### references/examples/crud-task-force.md

**Real example:** "Create Products module"

Shows:
- Why 3 agents (Trio pattern)
- Dependency chain (schema → API → UI)
- Success criteria for each phase
- How to parallelize safely

---

### references/examples/espaider-sync-task-force.md

**Real example:** "Sync 10 new Espaider fields"

Shows:
- Why 5 agents (Squad pattern)
- Handling complexity (field mapping, validation, sync logic)
- Integration testing strategy
- Security requirements

---

### references/examples/hotfix-production-task-force.md

**Real example:** "Fix production bug (export feature down)"

Shows:
- Time-critical execution
- Skipping non-critical steps
- Fast testing strategy
- How to minimize risk

---

### references/examples/security-audit-task-force.md

**Real example:** "Full Phase 4 security audit before MVP deployment"

Shows:
- Comprehensive coverage (RLS, auth, secrets)
- Parallelization (audit can run in parallel)
- Acceptance criteria
- Risk assessment

---

### scripts/validate-task-force.py

**Purpose:** Validate task force definition (agents, dependencies, success criteria)

**Input:**
```markdown
# Task Force: Add Products CRUD

Agents:
- P0: database-architect (1.5h) — Schema
- P0: backend-specialist (2h) — API
- P1: frontend-specialist (2h) — UI
- P2: test-engineer (1h) — Tests

Dependencies:
- database-architect → backend-specialist
- backend-specialist → frontend-specialist
- frontend-specialist → test-engineer
```

**Output:**
```
✅ Task Force Validation

Agents: 4 agents assigned
- P0: 2 agents (can parallelize)
- P1: 1 agent (waits for P0)
- P2: 1 agent (waits for P1)

Dependencies: Valid
- No circular dependencies: ✅
- Critical path identified: ✅
- Estimated total time: 6.5 hours (serial) or 2 hours (parallel P0 + 2h wait P1 + 2h wait P2)

Success Criteria: Not defined ⚠️
Suggestion: Add acceptance criteria for each phase
```

---

### scripts/dependency-visualizer.py

**Purpose:** Visualize task force as ASCII diagram

**Output:**
```
Task Force: Products CRUD
=========================

Timeline (horizontal = time, vertical = agent):

0h          1h          2h          3h          4h          5h          6h
|-----------|-----------|-----------|-----------|-----------|-----------|
database-architect: [=====schema design=====]
backend-specialist:                   [=========API endpoints==========]
frontend-specialist:                                        [==UI==]
test-engineer:                                                     [tests]

Critical path: 6.5 hours (sequential)
Parallelization: database-architect & backend-specialist can start same time

Dependency chain:
  database-architect (P0)
       ↓
  backend-specialist (P0)
       ↓
  frontend-specialist (P1)
       ↓
  test-engineer (P2)
```

---

## Quality Checklist

- [ ] 5 patterns cover 90% of real tasks
- [ ] Decision matrix is exhaustive (all task types covered)
- [ ] Real examples are recent and detailed
- [ ] Conflict resolution addresses common scenarios
- [ ] Scripts validate task force definitions correctly
- [ ] Dependency visualizer is clear and actionable

---

# Integration & Testing

## How Skills Work Together

### Phase 1 (Ingestion)
**Skill**: `architecture`, `memory-management`
- Orchestrator reads memory logs using **memory-management** skill
- References past decisions for similar tasks
- Sets context using project knowledge

### Phase 2 (Strategy)
**Skills**: `plan-writing`, `brainstorming`, `agent-orchestration-patterns`
- Project planner creates plan
- Orchestrator assembles task force using **agent-orchestration-patterns** skill
- Determines dependencies and P0/P1/P2 phases

### Phase 3 (Execution)
**Skills**: `api-patterns`, `database-design`, `espaider-integration`, `supabase-rls-patterns`, `react-best-practices`, etc.
- Backend-specialist loads **espaider-integration** + **api-patterns** for API work
- Database-architect loads **database-design** + **supabase-rls-patterns** for schema work
- Frontend-specialist loads **react-best-practices** for components
- Parallel execution managed by orchestrator using **agent-orchestration-patterns** dependency chains

### Phase 4 (Validation)
**Skills**: `vulnerability-scanner`, `testing-patterns`, `supabase-rls-patterns` (audit)
- Security-auditor uses **supabase-rls-patterns** checklist to validate RLS
- Test-engineer uses **testing-patterns** for comprehensive coverage
- All skills passed? → Proceed to Phase 5; if fail → fix and revalidate

### Phase 5 (Documentation)
**Skills**: `documentation-templates`, `clean-code`
- Documentation-writer creates API docs, README updates
- References **espaider-integration** skill for API specifics
- References **supabase-rls-patterns** skill for security notes

### Phase 6 (Memory Commit)
**Skill**: `memory-management`
- Orchestrator creates memory log using **memory-management** TEMPLATE
- Logs agents involved, skills used, critical decisions
- Tags with relevant skills (espaider-integration, memory-management, etc.)
- Indexes log for future discovery

---

## Validation Checklist

Before considering skills complete:

### Skill 1: espaider-integration
- [ ] All 135+ Espaider fields documented in JSON
- [ ] Field mapping covers 100% of used entities (Projeto/Entrega/Cronograma/Requisito)
- [ ] Sync workflow is step-by-step (junior can follow)
- [ ] Error handling covers timeout, invalid JSON, rate limit, auth failure, partial data
- [ ] Scripts run without errors
- [ ] Examples are realistic

### Skill 2: supabase-rls-patterns
- [ ] RLS concepts explained (not just copy-paste)
- [ ] Templates cover 80% of real-world scenarios
- [ ] Tech-arauz table policies documented (12+ tables)
- [ ] Testing guide includes manual + automated tests
- [ ] Debugging section addresses top errors
- [ ] Scripts validate coverage and test bypass

### Skill 3: memory-management
- [ ] Template is easy to fill (10 min for typical log)
- [ ] Real examples cover CRUD, security, performance
- [ ] "When to create" decision tree is clear
- [ ] Indexing scripts work fast (< 1 sec for 50+ logs)
- [ ] Chesterton Fence concept applied to tech-arauz

### Skill 4: agent-orchestration-patterns
- [ ] 5 patterns cover 90% of tasks
- [ ] Decision matrix is comprehensive
- [ ] Real examples are detailed
- [ ] Conflict resolution scenarios realistic
- [ ] Scripts validate task forces and visualize dependencies
- [ ] Dependency chains clear (P0 → P1 → P2)

---

## File Location Matrix

| Skill | Directory | Files | Size |
| --- | --- | --- | --- |
| espaider-integration | `.agent/skills/espaider-integration/` | 11 | ~15 KB |
| supabase-rls-patterns | `.agent/skills/supabase-rls-patterns/` | 10 | ~14 KB |
| memory-management | `.agent/skills/memory-management/` | 12 | ~16 KB |
| agent-orchestration-patterns | `.agent/skills/agent-orchestration-patterns/` | 13 | ~18 KB |

**Total:** 46 files, ~63 KB of documentation + scripts

---

## Implementation Sequence

### Day 1 (4-5 hours)
1. Create `espaider-integration` skill (3-4 hours)
   - SKILL.md, field-mapping.json/md, workflow-sync.md, error-handling.md
   - 2 worked examples
   - 2 validation scripts

2. Start `supabase-rls-patterns` skill (1-1.5 hours)
   - SKILL.md, rls-fundamentals.md, rls-templates.sql

### Day 2 (4-5 hours)
3. Complete `supabase-rls-patterns` skill (1.5-2 hours)
   - Tech-arauz table patterns, testing guide, debugging, checklist
   - 2 scripts

4. Create `memory-management` skill (2-2.5 hours)
   - SKILL.md, TEMPLATE.md, when-to-create, chesterton-fence
   - 3 worked examples
   - 2 scripts

### Day 3 (2-3 hours)
5. Create `agent-orchestration-patterns` skill (2-3 hours)
   - SKILL.md, task-force-patterns (5 patterns), dependency chains, conflict resolution
   - 4 worked examples
   - 2 visualization scripts

6. Integration & Testing (1 hour)
   - Test skills in orchestration protocol
   - Verify references between skills work
   - Final review

---

## Success Metrics

### Knowledge Coverage
- ✅ 100% of Espaider integration patterns documented
- ✅ 100% of tech-arauz RLS requirements covered
- ✅ Memory log template matches orchestration-protocol.md
- ✅ Orchestration patterns cover all task types in agent-selection-guide.md

### Usability
- ✅ Each skill loadable in < 30 seconds
- ✅ Decision checklists prevent common mistakes
- ✅ Examples are realistic (from actual project)
- ✅ Scripts are automated and useful

### Integration
- ✅ Skills referenced in agent profiles
- ✅ Skills integrated into orchestration protocol
- ✅ Memory logs use consistent format
- ✅ Task forces validate without errors

---

## Next Steps (Phase 2)

After MVP skills are stable (1-2 weeks):

1. **Adapt `intelligent-routing` skill**
   - Remove Gemini references
   - Add tech-arauz patterns (CRUD task force, Espaider sync, hotfix)

2. **Expand `supabase-mcp` skill**
   - Add WF-005 (Schema Diff)
   - Add WF-006 (Query Performance Analysis)

3. **Create Phase 2 skills**
   - `zustand-state-management` (frontend state)
   - `react-query-patterns` (data fetching)
   - `zod-validation-patterns` (end-to-end validation)

4. **Formalize skills in ARCHITECTURE.md**
   - Update skill count: 36 → 40
   - Add custom skills: supabase-mcp, intelligent-routing, nextjs-react-expert

5. **Update agent-selection-guide.md**
   - Add "Skills per Phase" section
   - Add "Skills Carregadas em Cada Recipe" examples
   - Reference new skills in agent profiles

---

# References & Resources

## Core Documents
- `.agent/ARCHITECTURE.md` — Overall system design (UPDATE after skills created)
- `.agent/workflows/orchestration-protocol.md` — 6-phase lifecycle
- `.agent/workflows/agent-selection-guide.md` — Agent routing matrix
- `.context/00-MASTER.md` — Business context and requirements
- `.context/02-rules/business-rules.md` — Business rules (BR-xxx)

## Existing Skills (Models)
- `.agent/skills/api-patterns/SKILL.md` — Reference SKILL.md structure
- `.agent/skills/database-design/SKILL.md` — Reference content map style
- `.agent/skills/supabase-mcp/SKILL.md` — Reference custom skill (if exists)

## Project Context
- `src/integrations/espaider/` — Current Espaider integration code
- `supabase/migrations/` — Schema and RLS policies
- `.agent/memory/` — Past decision logs (80+ logs)

---

## Appendix A: Field Mapping Reference Template

```json
{
  "entidade": "projetos",
  "campos": [
    {
      "id": 1,
      "espaider_field": "IDPROJETO",
      "db_column": "id_espaider",
      "data_type": "bigint",
      "nullable": false,
      "used_in": ["projects"],
      "priority": "P0 (must have)",
      "example": 12345,
      "notes": "Primary key from Espaider API"
    }
  ]
}
```

---

## Appendix B: RLS Policy Template

```sql
-- Template: Multi-tenant data isolation
CREATE POLICY "tenant_isolation_select" ON projects
FOR SELECT
USING (
  id_tenant = get_user_tenant_id(auth.uid())
);

CREATE POLICY "tenant_isolation_insert" ON projects
FOR INSERT
WITH CHECK (
  id_tenant = get_user_tenant_id(auth.uid())
);

-- Test: Verify RLS works
DO $$
DECLARE
  user_a_tenant VARCHAR := (SELECT get_user_tenant_id('user-a-id'));
  user_b_tenant VARCHAR := (SELECT get_user_tenant_id('user-b-id'));
BEGIN
  IF user_a_tenant = user_b_tenant THEN
    RAISE EXCEPTION 'Test users must be in different tenants';
  END IF;
END;
$$;
```

---

## Appendix C: Memory Log Quick Reference

**When to create:**
- ✅ Multi-agent task force (≥2 agents)
- ✅ Architecture change (new table/API/module)
- ✅ Phase 4 security audit
- ✅ Critical production bug fix
- ✅ Refactoring >100 lines

**Required sections:**
1. Context & Objective
2. Strategy & Team
3. Execution & Changes
4. Testing & Validation
5. Retrospective
6. Follow-up Actions
7. References

**File naming:**
```
.agent/memory/YYYY-MM-DD_{task-slug}.md
Example: 2026-02-13_crud-products-feature.md
```

---

# Document History

| Version | Date | Author | Changes |
| --- | --- | --- | --- |
| 1.0 | 2026-02-13 | Claude Haiku 4.5 | Initial implementation plan |

---

**Status: READY FOR EXECUTION**

This plan provides:
1. ✅ Detailed structure for 4 skills
2. ✅ Content outlines with examples
3. ✅ File locations and naming
4. ✅ Integration points
5. ✅ Quality checklist
6. ✅ Success metrics
7. ✅ Next steps for Phase 2

**To execute:** Follow Phase breakdown (Day 1-3) and implement each skill sequentially.
