# Quality Gates Framework — Pre-Push, Pre-PR, Pre-Deploy (AIOX 10/10)

**Version:** 0.2.4 (v0.2.3 + pgvector embeddings extension)
**Status:** Authoritative
**Updated:** 2026-03-16 (Phase 3: pgvector quality gates section added)

---

## 3-Layer Gate System

### PRE-PUSH GATE (Local)

**Command:** `npm run gate`

**Checks:**
- [ ] ESLint: zero errors
- [ ] TypeScript: zero errors (strict mode)
- [ ] Tests: all pass, ≥85% coverage
- [ ] Prettier: code style correct

**Bypass:** None (mandatory)

**Failure Action:** Fix locally, re-run gate

---

### PRE-PR GATE (CI)

**Automated on every PR**

**Checks:**
- [ ] CodeRabbit: no critical issues
- [ ] npm audit: no critical vulnerabilities
- [ ] Build size: < 500KB main JS
- [ ] Accessibility: jest-axe WCAG AA pass
- [ ] Embeddings (if pgvector changes): semantic search tests pass ✅ NEW

**Bypass:** Waive specific check (rare, @qa approval)

---

### PRE-DEPLOY GATE (Release)

**Before pushing to production**

**Checks:**
- [ ] QA gate: all 7 points PASS
- [ ] Database migrations: reviewed + tested
- [ ] Environment variables: all present
- [ ] Release notes: generated
- [ ] Rollback plan: documented
- [ ] Embeddings validation (if applicable): pgvector index integrity + API costs ✅ NEW

**Bypass:** None (release-blocking)

---

## Gate Results

| Result | Action | Next Step |
|--------|--------|-----------|
| **PASS** | All checks pass | Proceed to next phase |
| **FAIL** | One or more checks fail | Fix issue, re-run gate |
| **WAIVE** | Intentionally skip check | Document reason, @qa approval |

---

## 🔍 EPIC 11 Extension: pgvector Embeddings Quality Gates

**Applies to:** Stories 11.11 (AI Context Embeddings) and related semantic search features
**Scope:** Embedding validation, similarity thresholds, performance gates
**Testing Reference:** `src/lib/organization/__tests__/search.test.ts` + `src/app/actions/__tests__/organization-systems-metrics.test.ts`
**Implementation Reference:** `docs/EPIC-11-EMBEDDINGS-TECHNICAL-SPECIFICATION.md`

---

### 1. Embedding Generation Validation

#### Gate: OpenAI API Integration

**What it tests:** Embedding model configuration and API connectivity

**Test Cases (from research + specification):**

```typescript
// From EPIC-11 spec: Batch embedding test
✅ generateKnowledgeEmbeddingsBatchAction()
   - Processes embeddings for knowledge entries
   - Generates 1536-dimensional vectors (text-embedding-3-small)
   - Estimated cost calculation: $0.00002 per token
   - Idempotent: skip already-embedded entries

✅ generateEmbedding(text)
   - Converts query/content text to 1536-dim vector
   - Truncates input to 8000 chars (token limits)
   - Handles API errors gracefully
   - Returns null on failure (non-blocking)
```

**Quality Criteria:**
- [ ] API key configured: `OPENAI_API_KEY` present in `.env`
- [ ] Model specification: `text-embedding-3-small` (1536 dims)
- [ ] Batch size: 100 entries per request (optimal for API)
- [ ] Error handling: Exponential backoff, max 3 retries
- [ ] Cost tracking: Logged in `embedding_batch_log` table
- [ ] Idempotency: Can re-run safely (upsert pattern)

**Success Metrics:**
- Cost estimate: ~$0.52/year for 100k entries (negligible)
- Batch latency: 10-15 minutes for 100k entries
- Failed entry count: <1% of total

---

### 2. Semantic Search Validation

#### Gate: Query-to-Results Relevance

**What it tests:** Semantic similarity matching accuracy and ranking

**Test Cases (from real search tests):**

```typescript
// From src/lib/organization/__tests__/search.test.ts

describe('calculateSimilarity', () => {
  ✅ Exact match returns 100
  ✅ Prefix match returns 80+ (e.g., "proc" vs "process")
  ✅ Partial match returns 60+ (e.g., "rocess" vs "process")
  ✅ No match returns 0 (e.g., "xyz" vs "abc")
  ✅ Case-insensitive scoring
  ✅ Fuzzy matching for typos (Levenshtein distance)
})

describe('rankSearchMatch', () => {
  ✅ Exact name match: score = 100
  ✅ Name prefix match: score = 85
  ✅ Partial name match: score = 60-70
  ✅ Description match: score = 50
  ✅ Objective match: score = 40
  ✅ Multi-field fallback ranking
})

// Integration: Semantic similarity validation
semanticSearchKnowledgeAction(query, { minSimilarity: 0.5 })
  ✅ Returns relevant results for semantic queries
  ✅ Respects similarity threshold (default 0.5, configurable)
  ✅ Filters low-relevance results (similarity < threshold)
  ✅ Validates all scores in [0, 1] range
```

**Quality Criteria:**
- [ ] Similarity score validation: All scores ∈ [0, 1]
- [ ] Minimum threshold: Default 0.5 (50%), configurable
- [ ] Exact match detection: Direct content matching
- [ ] Semantic variation: "responsible party" ≈ "role assignment" (>0.7)
- [ ] Ranking order: Results sorted by similarity descending
- [ ] Pagination: 10 results default, configurable limit
- [ ] Empty result handling: Graceful (return [])

**Success Metrics:**
- Precision: >85% (top-5 results relevant to query)
- Recall: >80% (relevant docs in top-10)
- Latency: p95 < 100ms (via IVFFlat index)
- False positives: <5% low-relevance results

---

### 3. Database Index & Query Performance

#### Gate: IVFFlat Index Integrity

**What it tests:** pgvector index health and query efficiency

**Test Cases (from spec + architecture research):**

```typescript
// SQL validation
✅ pgvector extension enabled
✅ embedding column exists (type: vector(1536))
✅ IVFFlat index created on embedding column
✅ Index parameters: lists=100, probes=10 (for 100k rows)
✅ Cosine distance metric: vector_cosine_ops
✅ RLS policy: tenant_id isolation enforced

// Query performance validation
search_knowledge_semantic(query_embedding, tenant_id, k=10)
  ✅ Returns top-k results by similarity
  ✅ Query latency: p50 <25ms, p95 <100ms
  ✅ Correct similarity_score calculation: (1 - <=> operator)
  ✅ RLS enforcement: Only tenant-owned entries returned
  ✅ NULL handling: Skips entries with NULL embedding
```

**Quality Criteria:**
- [ ] Index exists: `idx_org_knowledge_entries_embedding`
- [ ] Index type: `ivfflat`
- [ ] Operator class: `vector_cosine_ops`
- [ ] Lists parameter: 100 (optimal for <100k rows)
- [ ] Query parameter: `probes=10` (sqrt(lists))
- [ ] RLS verified: tenant isolation confirmed
- [ ] NULL handling: Queries skip NULL embeddings
- [ ] Storage: ~1.5 GB for 100k entries + index

**Success Metrics:**
- Query latency: p95 <100ms (benchmark requirement)
- Index size: <30% of vector storage (typical overhead)
- Rows scanned: IVFFlat narrows search efficiently
- No full table scans: Queries use index

**Monitoring:**
```sql
-- Check index status
SELECT schemaname, tablename, indexname, indexdef
FROM pg_indexes
WHERE tablename = 'org_knowledge_entries'
  AND indexname LIKE '%embedding%';

-- Query execution plan
EXPLAIN ANALYZE
SELECT * FROM search_knowledge_semantic(
  $1::vector(1536),
  $2::uuid,
  10
);
-- Should show: Bitmap Index Scan on idx_org_knowledge_entries_embedding
```

---

### 4. Data Consistency & RLS Compliance

#### Gate: Tenant Isolation & Multi-Tenancy

**What it tests:** Security policies and data isolation (ADR-001 compliance)

**Test Cases (from metrics tests):**

```typescript
// From src/app/actions/__tests__/organization-systems-metrics.test.ts

describe('Server Actions - RLS Tenant Isolation', () => {
  ✅ addActivitySystemAction: tenant_id included in insert
  ✅ removeActivitySystemAction: tenant_id filter enforced
  ✅ getActivitySystemsAction: Only return tenant's data
  ✅ getProcessSLAsAction: tenant_id WHERE clause applied
  ✅ getProcessMetricsAction: Respects tenant boundaries

  ✅ Auth validation: User must be authenticated
  ✅ Admin check: Batch operations require admin role
})

// Integration: Multi-tenant embedding query
✅ semanticSearchKnowledgeAction
   - Only searches within user's tenant
   - No cross-tenant leakage possible
   - tenant_id parameter bound in RPC function
```

**Quality Criteria:**
- [ ] RLS policies enabled on `org_knowledge_entries`
- [ ] SELECT policy: `tenant_id = current_user_tenant`
- [ ] INSERT policy: `tenant_id = current_user_tenant`
- [ ] UPDATE policy: `tenant_id = current_user_tenant`
- [ ] Auth check: Every server action validates user
- [ ] Admin-only: Batch embedding operations checked
- [ ] No data leakage: Cross-tenant queries blocked

**Success Metrics:**
- Zero cross-tenant query results
- All server actions include tenant filter
- Admin-only operations enforced
- Audit log for sensitive operations

---

### 5. Batch Job Reliability

#### Gate: Embedding Generation Robustness

**What it tests:** Error handling, idempotency, and cost tracking

**Test Cases (from spec implementation):**

```typescript
// Batch operation validation
✅ generateKnowledgeEmbeddingsBatchAction()
   - Processes entries WITHOUT embeddings only
   - Batch size: 100 entries per API call
   - Retry logic: Exponential backoff (max 3 attempts)
   - Cost estimation: Accurate token counting
   - Failure tracking: Failed entries count recorded

✅ Error scenarios handled:
   - API rate limit: Wait and retry
   - Invalid content: Log and skip
   - Database connection: Backoff retry
   - Partial failure: Resume from checkpoint

✅ Idempotency:
   - Can re-run without duplicating embeddings
   - Already-embedded entries skipped (embedding IS NOT NULL)
   - Second run should process 0 entries (idempotent)
```

**Quality Criteria:**
- [ ] Query filters: `WHERE embedding IS NULL`
- [ ] Batch size: 100 entries per request
- [ ] Retry logic: 3 attempts with exponential backoff
- [ ] Progress logging: Checkpoint every batch
- [ ] Cost tracking: API cost recorded in `embedding_batch_log`
- [ ] Completion status: Logged with timestamp
- [ ] Error details: Failed entries captured
- [ ] Resume capability: Script can restart safely

**Success Metrics:**
- Failure rate: <1% of total entries
- Idempotency: Second run processes 0 entries
- Cost accuracy: Within ±5% of OpenAI billing
- Completion time: <15 min for 100k entries
- Cost per entry: ~$0.000005 (est. $0.52/year)

**Monitoring Dashboard:**
```sql
-- Check batch job progress
SELECT
  batch_type,
  total_entries,
  processed_entries,
  failed_entries,
  (processed_entries::float / total_entries * 100) as pct_complete,
  ROUND(api_cost::numeric, 2) as cost_usd,
  completed_at - started_at as duration
FROM public.embedding_batch_log
WHERE tenant_id = $1
ORDER BY started_at DESC
LIMIT 10;
```

---

### 6. API Cost & Budget Controls

#### Gate: Cost Monitoring (Financial)

**What it tests:** API billing and budget management

**Quality Criteria:**
- [ ] Cost model defined: OpenAI text-embedding-3-small ($0.02 per 1M tokens)
- [ ] Cost tracking: Logged in `embedding_batch_log.api_cost`
- [ ] Budget alert: Monitor for >$1/day spending
- [ ] Batch cost capped: Estimated batch cost <$1 per job
- [ ] Usage metrics: Tokens tracked per operation

**Expected Annual Costs:**
```
Scenario: 100k knowledge entries, quarterly refreshes

Initial batch: 100k entries * 150 tokens/entry = 15M tokens
Quarterly refresh: 33k entries * 150 tokens = 4.95M tokens/quarter
Monthly searches: 10k queries * 50 tokens = 500k tokens/month

Annual Cost = (4 quarters * $0.10) + (12 months * $0.01) = ~$0.52
```

**Success Metrics:**
- Annual cost: <$1 (budgeted as negligible)
- Cost per entry: <$0.00001
- Cost per query: <$0.00001
- No runaway charges: Monthly review of `embedding_batch_log`

---

## Complete Quality Gate Checklist: Embeddings (Story 11.11)

### Pre-Implementation
- [ ] Research phase complete ✅ (EPIC-11-AI-EMBEDDINGS-RESEARCH.md)
- [ ] Technical spec complete ✅ (EPIC-11-EMBEDDINGS-TECHNICAL-SPECIFICATION.md)
- [ ] Test examples reviewed ✅ (search.test.ts, organization-systems-metrics.test.ts)
- [ ] RLS architecture verified ✅ (ADR-001 compliant)

### Pre-Push
- [ ] Migration SQL valid (pgvector syntax)
- [ ] TypeScript types compiled (no strict errors)
- [ ] Unit tests pass: 90%+ coverage
  - [ ] `calculateSimilarity` test suite (6 cases)
  - [ ] `rankSearchMatch` test suite (6 cases)
  - [ ] `semanticSearchKnowledgeAction` tests (4 cases)
  - [ ] `generateKnowledgeEmbeddingsBatchAction` tests (3 cases)
- [ ] Server action mocks validated
- [ ] Lint & prettier: zero errors

### Pre-PR
- [ ] CodeRabbit: no critical issues
- [ ] npm audit: no vulnerabilities
- [ ] Build size unchanged (<500KB main)
- [ ] Index performance benchmarked (<100ms p95)
- [ ] Cost estimate verified (<$1/year)

### Pre-Deploy
- [ ] Migration tested on staging
- [ ] RLS policies verified (tenant isolation)
- [ ] Index integrity checked
- [ ] Initial batch job successful (0% failure)
- [ ] Performance verified: p95 <100ms
- [ ] Cost monitoring set up
- [ ] API key configured in production
- [ ] Rollback plan documented

---

## Rollback Procedure (Embeddings)

**If critical issue discovered post-deployment:**

```sql
-- Step 1: Disable search queries (optional)
-- Set feature flag or return error from semanticSearchKnowledgeAction

-- Step 2: Revert migration
-- DROP INDEX idx_org_knowledge_entries_embedding;
-- DROP TABLE embedding_batch_log;
-- ALTER TABLE org_knowledge_entries DROP COLUMN embedding;

-- Step 3: Verify fallback search still works
-- (Exact match + Levenshtein distance ranking still available)
```

**Timeline:** <30 minutes total
**Data Loss:** None (embedding column only, no data deleted)
**User Impact:** Semantic search temporarily unavailable, keyword search continues

---

---

## EPIC 11.5 Extension: Activity Templates & Process Versioning Quality Gates

**Applies to:** Stories 11.5 (Activity Templates & Process Versioning)
**Scope:** Template validation, variant management, audit trail integrity
**Testing Reference:** `src/app/actions/__tests__/organization-systems-metrics.test.ts`
**Schema Reference:** Migration 070 + ORGANIZATION-SCHEMA.md

---

### 7. Activity Templates Validation

#### Gate: Template Structure & Reusability

**What it tests:** Activity template definition completeness and structure validation

**Test Cases (from migration 070 + AI-CONTEXT-ENGINEERING):**

```typescript
// Activity Template Structure Validation
✅ Template basic fields:
   - name: VARCHAR (255) — required
   - description: TEXT — optional
   - complexity: ENUM (low, medium, high) — default 'medium'
   - priority: ENUM (low, normal, high) — default 'normal'
   - nucleus_id: UUID (nullable) — optional organizational context

✅ Template JSON fields (JSONB):
   - inputs: Array<OrgInputOutput> — expected inputs/data
   - outputs: Array<OrgInputOutput> — expected outputs/deliverables
   - risks: Array<string> — known risks
   - impacts: Array<string> — organizational impacts
   - documentation: Object keyed {procedures, instructions, best_practices, common_errors}

✅ Validation patterns:
   - Name length: 1-255 characters (enforced by VARCHAR)
   - Complexity enumeration: Must match 'low' | 'medium' | 'high'
   - Priority enumeration: Must match 'low' | 'normal' | 'high'
   - JSONB fields: Valid JSON structure
```

**Quality Criteria:**
- [ ] Template name: Non-empty, ≤255 characters
- [ ] Complexity field: One of {low, medium, high}
- [ ] Priority field: One of {low, normal, high}
- [ ] Inputs array: Valid JSON array of objects (each with name, type, description)
- [ ] Outputs array: Valid JSON array of objects
- [ ] Risks array: Array of strings (optional, default [])
- [ ] Impacts array: Array of strings (optional, default [])
- [ ] Documentation object: Valid JSONB with optional keys
- [ ] Tenant isolation: tenant_id present on all templates

**Success Metrics:**
- Template creation: <1s latency
- Template reuse count: Tracked per template (usage analytics)
- Variant creation: <500ms (from template base)
- Storage: ~1-2KB per template (including documentation)

**Monitoring:**
```sql
-- Check template usage (if tracking implemented)
SELECT
  id,
  name,
  COUNT(*) as usage_count,
  created_at
FROM public.org_activity_templates
WHERE tenant_id = $1
GROUP BY id, name, created_at
ORDER BY usage_count DESC;

-- Validate JSONB structure integrity
SELECT
  id,
  name,
  jsonb_typeof(inputs) as inputs_type,
  jsonb_typeof(outputs) as outputs_type,
  jsonb_array_length(risks) as risk_count,
  jsonb_array_length(impacts) as impact_count
FROM public.org_activity_templates
WHERE tenant_id = $1;
```

---

### 8. Process Versioning & Audit Trail

#### Gate: Version Integrity & Rollback Capability

**What it tests:** Process version immutability, snapshot validity, and audit completeness

**Test Cases (from migration 070 spec):**

```typescript
// Process Version Validation
✅ Version sequence validation:
   - version_number: INTEGER, sequential per process (1, 2, 3, ...)
   - UNIQUE constraint: (tenant_id, process_id, version_number)
   - No gaps in sequence (idempotent, append-only)

✅ Snapshot integrity:
   - process_snapshot: JSONB NOT NULL — complete process state
   - Contains all process fields at version time (for rollback)
   - Valid JSON structure (parseable)

✅ Audit trail completeness:
   - changed_by: UUID → profiles(id) — who made the change
   - created_at: TIMESTAMPTZ — immutable timestamp (no updated_at)
   - change_summary: TEXT — human-readable description

✅ Immutability enforcement:
   - created_at only (no UPDATE triggers)
   - Append-only pattern (no DELETE without explicit approval)
   - RLS enforced: tenant_id isolation
```

**Quality Criteria:**
- [ ] Version numbers: Sequential per process (no gaps)
- [ ] UNIQUE constraint: (tenant_id, process_id, version_number)
- [ ] Snapshot: Valid, parseable JSON with all process fields
- [ ] Change tracking: changed_by populated (nullable OK for system changes)
- [ ] Change summary: Non-empty description of what changed
- [ ] Immutability: No UPDATE operations on org_process_versions
- [ ] Timestamps: created_at only, no updated_at
- [ ] Foreign key: process_id → org_processes(id) ON DELETE CASCADE
- [ ] RLS verified: Only tenant's versions accessible

**Success Metrics:**
- Version creation: <100ms latency
- Snapshot parsing: Always valid JSON (pre-validation before insert)
- Rollback feasibility: All fields needed for restore in snapshot
- Storage: ~5-10KB per version (depends on process complexity)
- Query latency: Fetch latest version <50ms (via index)

**Monitoring & Validation:**
```sql
-- Check version sequence integrity
SELECT
  process_id,
  COUNT(*) as version_count,
  MAX(version_number) as max_version,
  CASE WHEN COUNT(*) = MAX(version_number) THEN 'OK' ELSE 'GAP' END as sequence_status
FROM public.org_process_versions
WHERE tenant_id = $1
GROUP BY process_id;

-- Validate snapshot JSON integrity
SELECT
  id,
  process_id,
  version_number,
  jsonb_typeof(process_snapshot) as snapshot_type,
  CASE WHEN jsonb_typeof(process_snapshot) = 'object' THEN 'VALID' ELSE 'INVALID' END as validation
FROM public.org_process_versions
WHERE tenant_id = $1
ORDER BY process_id, version_number DESC;

-- Audit trail completeness
SELECT
  id,
  process_id,
  version_number,
  changed_by IS NOT NULL as has_audit_user,
  change_summary IS NOT NULL as has_summary,
  LENGTH(change_summary) as summary_length,
  created_at
FROM public.org_process_versions
WHERE tenant_id = $1
ORDER BY process_id, version_number DESC;

-- Rollback candidate verification
SELECT
  pv.id,
  pv.process_id,
  pv.version_number,
  pv.change_summary,
  pv.created_at,
  -- Verify all required process fields present in snapshot
  (pv.process_snapshot ? 'name') as has_name,
  (pv.process_snapshot ? 'description') as has_description,
  (pv.process_snapshot ? 'objective') as has_objective,
  (pv.process_snapshot ? 'responsible_roles') as has_roles
FROM public.org_process_versions pv
WHERE pv.tenant_id = $1
ORDER BY pv.process_id, pv.version_number DESC;
```

---

### 9. Process Metrics Aggregation Quality

#### Gate: Metrics Calculation Accuracy & Compliance Tracking

**What it tests:** SLA compliance calculations, metrics aggregation, and historical tracking

**Test Cases (from organization-systems-metrics.test.ts):**

```typescript
// From src/app/actions/__tests__/organization-systems-metrics.test.ts
describe('getProcessMetricsAction', () => {
  ✅ Retrieve metrics for process in date range
     - period_start: TIMESTAMPTZ (RFC 3339 format)
     - period_end: TIMESTAMPTZ (RFC 3339 format)
     - Returns all metrics between dates (inclusive)

  ✅ Metrics fields validation:
     - metric_name: 'completion_time', 'quality', 'cycle_time', etc.
     - avg_duration_days: DECIMAL — average completion time
     - compliance_pct: DECIMAL (0-100) — % of instances meeting SLA
     - instances_count: INTEGER — total process instances in period
     - period_start, period_end: Date range for metric aggregation

  ✅ Aggregation correctness:
     - compliance_pct = (on_time_instances / total_instances) * 100
     - avg_duration_days = SUM(completion_time_days) / instance_count
     - Handles NULL values: Treat as missing data (exclude from avg)
     - Rounding: compliance_pct to nearest integer, avg_duration_days to 2 decimals

  ✅ RLS tenant isolation:
     - Only returns metrics for user's tenant
     - Tenant filter: WHERE tenant_id = auth.jwt()->>'tenant_id'
     - Date range filters: >=period_start AND <=period_end
})

describe('getProcessSLAsAction', () => {
  ✅ Retrieve SLA definitions per process
     - id: UUID
     - process_id: UUID (FK)
     - name: VARCHAR (255) — SLA name
     - target_cycle_time_hours: INTEGER
     - target_quality_percentage: INTEGER (0-100)
     - warning_threshold_pct: INTEGER (e.g., 80%)
     - critical_threshold_pct: INTEGER (e.g., 95%)

  ✅ Alert thresholds:
     - Warning: If compliance < warning_threshold_pct
     - Critical: If compliance < critical_threshold_pct
     - Used for dashboard alerts and notifications
})
```

**Quality Criteria:**
- [ ] Date range filters: Both period_start AND period_end applied
- [ ] Compliance calculation: (on_time / total) * 100, value ∈ [0, 100]
- [ ] Average duration: SUM(durations) / COUNT, excludes NULLs
- [ ] Instance count: Accurate count of process executions in period
- [ ] SLA fields: target_cycle_time_hours, target_quality_percentage present
- [ ] Alert thresholds: warning_threshold_pct, critical_threshold_pct valid
- [ ] RLS enforced: tenant_id filter applied in all queries
- [ ] Empty periods: Handle gracefully (return empty array, not error)
- [ ] NULL handling: Missing metrics not included in calculations

**Success Metrics:**
- Metric query latency: p95 <150ms (with index on process_id, metric_date)
- Compliance calculation accuracy: ±0.1% (rounding tolerance)
- SLA threshold alerts: Accurate (>95% precision in test data)
- Date range filtering: Boundary conditions verified (inclusive)
- Data completeness: No missing calculations for valid period

**Validation Queries:**
```sql
-- Check metrics aggregation correctness
SELECT
  id,
  process_id,
  metric_date,
  metric_name,
  total_cases,
  completed_cases,
  ROUND((completed_cases::float / total_cases * 100)::numeric, 1) as calculated_compliance,
  on_time_percentage as actual_compliance,
  ABS(ROUND((completed_cases::float / total_cases * 100)::numeric, 1) - on_time_percentage) as variance
FROM public.org_process_metrics
WHERE tenant_id = $1
  AND ABS(ROUND((completed_cases::float / total_cases * 100)::numeric, 1) - on_time_percentage) > 0.5
ORDER BY variance DESC;

-- Monitor SLA alert thresholds
SELECT
  sla.id,
  sla.name,
  sla.target_cycle_time_hours,
  sla.target_quality_percentage,
  m.metric_date,
  m.on_time_percentage,
  CASE
    WHEN m.on_time_percentage < sla.critical_threshold_pct THEN 'CRITICAL'
    WHEN m.on_time_percentage < sla.warning_threshold_pct THEN 'WARNING'
    ELSE 'OK'
  END as alert_status
FROM public.org_process_slas sla
LEFT JOIN public.org_process_metrics m
  ON m.process_id = sla.process_id
WHERE sla.tenant_id = $1
ORDER BY alert_status DESC, m.metric_date DESC;

-- Verify date range filtering works correctly
SELECT
  COUNT(*) as metric_count,
  MIN(metric_date) as earliest,
  MAX(metric_date) as latest
FROM public.org_process_metrics
WHERE tenant_id = $1
  AND metric_date >= $2::DATE
  AND metric_date <= $3::DATE;
```

---

### 10. Complete Quality Gate Checklist: EPIC 11.5 (Activity Templates & Process Versioning)

#### Pre-Implementation
- [ ] Migration 070 reviewed ✅ (org_activity_templates, org_process_versions tables)
- [ ] ORGANIZATION-SCHEMA.md updated ✅ (all new tables documented)
- [ ] Test patterns reviewed ✅ (organization-systems-metrics.test.ts)
- [ ] RLS architecture verified ✅ (ADR-001 compliance on all new tables)

#### Pre-Push
- [ ] Migration SQL valid (templates + versions schema)
- [ ] TypeScript types compiled (no strict errors)
- [ ] Unit tests pass: 90%+ coverage
  - [ ] Activity template CRUD tests (create, read, update, delete)
  - [ ] Template variant generation tests (if implemented)
  - [ ] Process version sequence validation tests
  - [ ] Version snapshot JSON validation tests
  - [ ] Metrics aggregation calculation tests (4-5 cases)
- [ ] Lint & prettier: zero errors
- [ ] RLS policies: Verified on org_activity_templates, org_process_versions

#### Pre-PR
- [ ] CodeRabbit: no critical issues
- [ ] npm audit: no vulnerabilities
- [ ] Build size unchanged (<500KB main)
- [ ] Migration tested on local database
- [ ] Template reusability metrics (if tracked) working

#### Pre-Deploy
- [ ] Migration tested on staging
- [ ] RLS policies verified (tenant isolation on all 3 tables)
- [ ] Audit trail immutability confirmed (no UPDATE on versions)
- [ ] Metrics aggregation accuracy tested (sample data verification)
- [ ] Performance verified: Template queries <500ms, metrics <150ms
- [ ] Rollback plan documented
- [ ] Monitoring queries configured in dashboard

---

**Authored by:** Quinn (@qa) Phase 4 - EPIC 11.5 quality gates extension (Activity Templates & Process Versioning)
**Framework:** AIOX 10/10 (Constitution-driven QA)
**Document Status:** Integrated into v0.2.4 release
