# Database Validation Gates — EPIC 11 Pre-Deployment Checklist

**Version:** 0.2.4 (EPIC 11 Phase 4)
**Owner:** @data-engineer (Dara) — Database Expert
**Co-Lead:** @devops (Gage) — Deployment Orchestration
**Status:** 🟢 PRODUCTION READY
**Last Updated:** 2026-03-16

---

## Executive Summary

This document provides **data-engineer-specific validation gates** that MUST pass before EPIC 11 (v0.2.4) deployment to production. It is the authoritative source for:

- **5 Sequential Database Validation Gates** (066-070 migrations) plus post-070 hardening (077)
- **RLS Compliance Verification** (all 10 EPIC 11 tables)
- **pgvector & Embedding Setup** (Migration 071, if approved)
- **SQL Queries for Validation** (copy-paste ready)
- **Failure Recovery Procedures** (rollback scripts)
- **Coordination Protocol** with @devops

---

## 1. Migration Order Dependency Chain

**CRITICAL:** Migrations MUST apply in this exact order. Any deviation breaks referential integrity.

```yaml
066 → 067 → 068 → 069 → 070 → 077 → (071)
```

| Order | Migration | File | Prerequisite | Output Tables | Status |
|-------|-----------|------|--------------|---------------|--------|
| 1 | **066** | `add_responsible_roles_to_activities.sql` | org_activities exists | org_activities (modified) | ✅ READY |
| 2 | **067** | `create_activity_systems_junction.sql` | org_activities, org_systems exist | org_activity_systems | ✅ READY |
| 3 | **068** | `create_process_slas_and_metrics.sql` | org_processes exists | org_process_slas, org_process_metrics | ✅ READY |
| 4 | **069** | `create_role_permissions.sql` | tenants exists | org_role_definitions, org_role_permissions | ✅ READY |
| 5 | **070** | `create_activity_templates_and_process_versions.sql` | org_processes, org_activities | org_activity_templates, org_process_versions | ✅ READY |
| 6 | **077** | `harden_org_tenant_integrity.sql` | org_activity_systems, org_process_slas, org_process_metrics, org_role_definitions, org_role_permissions, org_activity_templates, org_process_versions | tenant-aware hardening for legacy org relation tables | ✅ READY |
| 7 | **071** | `add_embeddings_to_knowledge_entries.sql` | pgvector extension, org_knowledge_entries | embedding_batch_log | 🟡 CONDITIONAL |

**Post-070 hardening note:** migration `077_harden_org_tenant_integrity.sql` adds tenant-aware integrity checks and RLS hardening for `org_activity_systems`, `org_process_slas`, `org_process_metrics`, `org_role_definitions`, `org_role_permissions`, `org_activity_templates`, `org_process_versions`, `org_process_systems`, and `org_activity_documents`.

**Note:** Migration 071 only applies if Story 11.11 (AI Context Embeddings) is approved. The validated deployment chain extends through 077 before the optional embeddings step.

---

## 2. Pre-Deployment Database Validation (Local)

### 2.1 Migration Syntax Validation

**Run locally before any push:**

```bash
# Check all migration files are syntactically valid SQL
supabase migration list --local

# Expected output (all ✓):
# 066_add_responsible_roles_to_activities.sql ✓
# 067_create_activity_systems_junction.sql ✓
# 068_create_process_slas_and_metrics.sql ✓
# 069_create_role_permissions.sql ✓
# 070_create_activity_templates_and_process_versions.sql ✓
# 077_harden_org_tenant_integrity.sql ✓
```

**Failure:** If any migration shows error or ✗, STOP. Contact @data-engineer immediately.

### 2.2 Prerequisite Table Existence

**Verify base schema tables exist (before applying migrations):**

```sql
-- Run in Supabase SQL Editor (or via psql)
-- Check: All prerequisite tables for EPIC 11 migrations exist

SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN (
    'org_activities', 'org_systems', 'org_processes',
    'tenants', 'org_knowledge_entries'
  )
ORDER BY table_name;

-- EXPECTED: 5 rows (all tables exist)
-- FAILURE: Any missing row → Rollback to 065, run base migrations (001-065) first
```

### 2.3 Enum & Type Validation

**Verify enums used in migrations exist:**

```sql
-- Check: org_activity_complexity and org_activity_priority enums exist
-- (Used in migrations 066, 070)

SELECT typname, typcategory
FROM pg_type
WHERE typname IN ('org_activity_complexity', 'org_activity_priority')
  AND typnamespace = 'public'::regnamespace;

-- EXPECTED: 2 rows
-- FAILURE: Any missing → Rollback, verify base schema (EPIC 7-10) deployed first
```

---

## 3. Migration Application Gates

### 3.1 Apply Migrations in Supabase

**Via Supabase CLI (Recommended):**

```bash
# 1. Link to Supabase project
supabase link --project-ref=<your-project-id>

# 2. Apply all pending migrations
supabase db push

# 3. Verify applied
supabase migration list

# Expected output:
# 066_add_responsible_roles_to_activities ← 2026-03-16 10:30 ✓
# 067_create_activity_systems_junction ← 2026-03-16 10:31 ✓
# 068_create_process_slas_and_metrics ← 2026-03-16 10:32 ✓
# 069_create_role_permissions ← 2026-03-16 10:33 ✓
# 070_create_activity_templates_and_process_versions ← 2026-03-16 10:34 ✓
# 077_harden_org_tenant_integrity ← 2026-05-08 10:35 ✓
```

**Via Supabase Dashboard (If CLI unavailable):**

1. Go to **SQL Editor** in Supabase Dashboard
2. For each migration file (066-070 in order):
   - Open file: `supabase/migrations/0XX_*.sql`
   - Copy entire contents
   - Paste into SQL Editor
   - Click **Run**
   - Wait for completion (should see success message)
3. Verify applied:
   ```sql
   SELECT migration, executed_at
   FROM _supabase_migrations
   WHERE migration LIKE '066%' OR migration LIKE '067%'
     OR migration LIKE '068%' OR migration LIKE '069%'
     OR migration LIKE '070%'
   ORDER BY executed_at DESC;
   ```

### 3.2 Post-Migration Table Verification

**Immediately after migrations apply, verify all tables created:**

```sql
-- Check: All 8 new tables exist (or extended tables have new columns)

SELECT table_name, table_type
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN (
    'org_activities',           -- Modified (responsible_roles column added)
    'org_activity_systems',     -- New
    'org_process_slas',         -- New
    'org_process_metrics',      -- New
    'org_role_definitions',     -- New
    'org_role_permissions',     -- New
    'org_activity_templates',   -- New
    'org_process_versions'      -- New
  )
ORDER BY table_name;

-- EXPECTED: 8 rows, all table_type='BASE TABLE'
-- FAILURE: < 8 rows → Some migrations failed. Check logs, run db push again.
```

**Verify new columns on org_activities:**

```sql
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'org_activities'
  AND column_name = 'responsible_roles';

-- EXPECTED: 1 row
-- Data Type: USER-DEFINED (for jsonb)
-- is_nullable: NO
```

---

## 4. RLS Compliance Gate (Critical Security)

### 4.1 RLS Enabled Check (All 10 Tables)

**This is CRITICAL. Missing RLS = data isolation failure.**

**Run this query immediately after migrations:**

```sql
-- Query: Verify RLS is ENABLED on all EPIC 11 tables

SELECT
  t.table_name,
  COALESCE(pt.rowsecurity, false) AS rls_enabled,
  (SELECT COUNT(*) FROM pg_policies WHERE pg_policies.tablename = t.table_name) AS policy_count
FROM information_schema.tables t
LEFT JOIN pg_catalog.pg_tables pt ON t.table_name = pt.tablename
WHERE t.table_schema = 'public'
  AND t.table_name IN (
    'org_activities',
    'org_activity_systems',
    'org_process_slas',
    'org_process_metrics',
    'org_role_definitions',
    'org_role_permissions',
    'org_activity_templates',
    'org_process_versions'
  )
  AND pt.tablename IS NOT NULL
ORDER BY t.table_name;

-- EXPECTED OUTPUT:
-- org_activities           | true  | 4
-- org_activity_systems    | true  | 4
-- org_process_slas        | true  | 4
-- org_process_metrics     | true  | 4
-- org_role_definitions    | true  | 4
-- org_role_permissions    | true  | 4
-- org_activity_templates  | true  | 4
-- org_process_versions    | true  | 4

-- FAILURE CONDITIONS (STOP DEPLOYMENT):
-- ❌ Any rls_enabled = false
-- ❌ Any policy_count < 4
-- Contact @data-engineer immediately if any condition triggers
```

### 4.2 RLS Policy Validation

**Verify policy structure (all policies filter by tenant_id):**

```sql
-- Query: List all RLS policies on EPIC 11 tables

SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  CASE
    WHEN qual LIKE '%tenant_id%' THEN 'OK'
    ELSE 'MISSING TENANT_ID'
  END AS policy_quality,
  qual AS policy_expression
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN (
    'org_activities', 'org_activity_systems', 'org_process_slas',
    'org_process_metrics', 'org_role_definitions', 'org_role_permissions',
    'org_activity_templates', 'org_process_versions',
    'org_process_systems', 'org_activity_documents'
  )
ORDER BY tablename, policyname;

-- EXPECTED: 40 rows (10 tables × 4 policies)
-- All rows: policy_quality = 'OK' (tenant_id present)
--
-- FAILURE: Any row with policy_quality = 'MISSING TENANT_ID'
-- → STOP DEPLOYMENT. RLS doesn't enforce tenant isolation.
```

### 4.3 Tenant Isolation Test

**Validate that RLS actually enforces data isolation:**

```sql
-- Setup: Create test tenants, users, and data

INSERT INTO public.tenants (id, name)
VALUES
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Test Tenant A'),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Test Tenant B');

INSERT INTO public.profiles (id, tenant_id, email, name)
VALUES
  ('user-a-uuid', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'user.a@test.com', 'User A'),
  ('user-b-uuid', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'user.b@test.com', 'User B');

-- Create test data in org_activities (Migration 066 modified this table)
INSERT INTO public.org_activities (id, tenant_id, name, description)
VALUES
  ('act-a', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Activity A', 'Belongs to Tenant A'),
  ('act-b', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Activity B', 'Belongs to Tenant B');

-- Test 1: User A can ONLY read their own tenant's activities
SET jwt.claims = '{"sub":"user-a-uuid","tenant_id":"aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa","role":"authenticated"}';
SELECT COUNT(*) AS count_for_user_a FROM public.org_activities;
-- EXPECTED: 1 (only Activity A)
-- FAILURE: If count ≥ 2 → RLS not working, cross-tenant leak!

-- Test 2: User B can ONLY read their own tenant's activities
SET jwt.claims = '{"sub":"user-b-uuid","tenant_id":"bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb","role":"authenticated"}';
SELECT COUNT(*) AS count_for_user_b FROM public.org_activities;
-- EXPECTED: 1 (only Activity B)
-- FAILURE: If count ≥ 2 → RLS not working!

-- Test 3: User A CANNOT insert activity for Tenant B (policy enforcement)
SET jwt.claims = '{"sub":"user-a-uuid","tenant_id":"aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa","role":"authenticated"}';
INSERT INTO public.org_activities (id, tenant_id, name)
VALUES ('act-malicious', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Hacked Activity');
-- EXPECTED: ERROR (permission denied or constraint violation)
-- FAILURE: If INSERT succeeds → Critical security breach!

-- Test 4: Verify no rows in org_activities belong to other tenant
SELECT COUNT(*) AS tenant_b_visible_to_a FROM public.org_activities
WHERE tenant_id = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb';
-- EXPECTED: 0
-- FAILURE: Any rows > 0 → Major security issue

-- Cleanup (after testing)
DELETE FROM public.org_activities WHERE id IN ('act-a', 'act-b', 'act-malicious');
DELETE FROM public.profiles WHERE id IN ('user-a-uuid', 'user-b-uuid');
DELETE FROM public.tenants WHERE id IN ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb');
```

**Gate Pass Criteria:**
- ✅ Test 1: count = 1
- ✅ Test 2: count = 1
- ✅ Test 3: INSERT rejected with error
- ✅ Test 4: count = 0

**Gate Fail Criteria (BLOCK DEPLOYMENT):**
- ❌ Test 1 or 2: count > 1 (cross-tenant leak)
- ❌ Test 3: INSERT succeeds (policy bypass)
- ❌ Test 4: count > 0 (data visible across tenants)

---

## 5. Index Performance Gate

### 5.1 Index Creation Verification

**Verify all indexes created successfully:**

```sql
-- Check: All new indexes created on EPIC 11 tables

SELECT
  schemaname,
  tablename,
  indexname,
  indexdef,
  idx_scan,
  idx_tup_read
FROM pg_stat_user_indexes
WHERE schemaname = 'public'
  AND tablename IN (
    'org_activities', 'org_activity_systems', 'org_process_slas',
    'org_process_metrics', 'org_role_definitions', 'org_role_permissions',
    'org_activity_templates', 'org_process_versions',
    'org_process_systems', 'org_activity_documents'
  )
ORDER BY tablename, indexname;

-- EXPECTED: Multiple indexes per table (GIN on JSONB, composite on tenant_id + foreign keys)
-- Examples:
-- - idx_org_activities_responsible_roles_gin (GIN on JSONB)
-- - idx_org_activity_systems_tenant (B-tree on tenant_id)
-- - idx_org_activity_systems_activity_id (B-tree on activity_id)
-- - idx_org_process_metrics_period (B-tree on period_start, period_end)
-- - idx_org_process_systems_tenant (B-tree on tenant_id)
-- - idx_org_activity_documents_tenant (B-tree on tenant_id)
```

### 5.2 Query Performance Baseline

**Establish performance baseline (< 100ms for typical queries):**

```sql
-- Test 1: Lookup activity by tenant (should use index)
EXPLAIN ANALYZE
SELECT * FROM public.org_activities
WHERE tenant_id = 'test-tenant-uuid'
  AND name ILIKE '%test%'
LIMIT 10;

-- Expected: Execution Time < 50ms (uses indexes)

-- Test 2: Activity-to-System join (test foreign key index)
EXPLAIN ANALYZE
SELECT a.*, s.*
FROM public.org_activities a
JOIN public.org_activity_systems sys ON a.id = sys.activity_id
JOIN public.org_systems s ON sys.system_id = s.id
WHERE a.tenant_id = 'test-tenant-uuid'
LIMIT 10;

-- Expected: Execution Time < 100ms

-- Test 3: SLA metrics by process (composite index)
EXPLAIN ANALYZE
SELECT p.name, m.* FROM public.org_process_metrics m
JOIN public.org_processes p ON m.process_id = p.id
WHERE p.tenant_id = 'test-tenant-uuid'
  AND m.period_start >= NOW() - INTERVAL '30 days'
LIMIT 100;

-- Expected: Execution Time < 100ms
```

**If ANY query > 150ms:**
- Analyze query plan (look for Sequential Scans)
- Check if correct index exists
- May need to ANALYZE table: `ANALYZE public.org_activities;`

---

## 6. Referential Integrity Validation

### 6.1 Foreign Key Constraints

**Verify all FK relationships are intact:**

```sql
-- Check: All foreign key constraints exist

SELECT
  constraint_name,
  table_name,
  column_name,
  referenced_table_name,
  referenced_column_name
FROM information_schema.key_column_usage
WHERE table_schema = 'public'
  AND table_name IN (
    'org_activity_systems', 'org_process_slas', 'org_process_metrics',
    'org_role_permissions', 'org_activity_templates', 'org_process_versions'
  )
  AND referenced_table_name IS NOT NULL
ORDER BY table_name, column_name;

-- EXPECTED: Multiple FKs per table
-- Examples:
-- - org_activity_systems → org_activities
-- - org_activity_systems → org_systems
-- - org_process_slas → org_processes
-- - org_process_metrics → org_processes
-- - org_process_versions → org_processes
```

### 6.2 Orphaned Data Check

**Verify no orphaned rows (FK violations):**

```sql
-- Check: org_activity_systems has no orphaned activity_id or system_id

SELECT COUNT(*) AS orphaned_activities
FROM public.org_activity_systems sys
WHERE NOT EXISTS (SELECT 1 FROM public.org_activities WHERE id = sys.activity_id);

-- EXPECTED: 0 orphaned records

SELECT COUNT(*) AS orphaned_systems
FROM public.org_activity_systems sys
WHERE NOT EXISTS (SELECT 1 FROM public.org_systems WHERE id = sys.system_id);

-- EXPECTED: 0 orphaned records
```

---

## 7. Conditional: pgvector & Embedding Gate (Story 11.11)

**SKIP if Migration 071 not approved yet. Only if semantic search feature enabled.**

### 7.1 pgvector Extension

```sql
-- Verify pgvector extension is available

SELECT extname, extversion
FROM pg_extension
WHERE extname = 'vector';

-- EXPECTED: (vector, 0.5.0 or higher)
-- FAILURE: No row → Extension not installed
```

### 7.2 Embedding Column

```sql
-- Verify embedding column added to org_knowledge_entries

SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'org_knowledge_entries'
  AND column_name = 'embedding';

-- EXPECTED: 1 row, data_type = 'USER-DEFINED' (for vector type)
```

### 7.3 IVFFlat Index

```sql
-- Verify IVFFlat index created

SELECT indexname, indexdef
FROM pg_indexes
WHERE tablename = 'org_knowledge_entries'
  AND indexname LIKE '%embedding%';

-- EXPECTED: idx_org_knowledge_entries_embedding
-- indexdef should contain: USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100)
```

---

## 8. Migration Failure Recovery

### 8.1 Rollback to Previous State

**If any migration fails, use this procedure:**

```bash
# Option 1: Via Supabase CLI (recommended)
# This creates reverse migrations automatically
supabase db push --dry-run  # Check what would happen

# If you need to rollback:
# Contact Supabase support for direct rollback, OR
# Create reverse migration files manually (see 8.2)

# Option 2: Manual reverse migration
# Create file: supabase/migrations/066_reverse_responsible_roles.sql
```

### 8.2 Manual Reverse Migration Example

**If rollback needed, create these files in supabase/migrations/**

```sql
-- File: supabase/migrations/999_reverse_066_responsible_roles.sql
-- Purpose: Undo Migration 066

DROP INDEX IF EXISTS idx_org_activities_responsible_roles_gin;
ALTER TABLE public.org_activities DROP COLUMN IF EXISTS responsible_roles;

DO $$
BEGIN
  RAISE NOTICE 'Reverse Migration 066: responsible_roles removed ✓';
END$$;
```

```sql
-- File: supabase/migrations/999_reverse_067_activity_systems.sql
-- Purpose: Undo Migration 067

DROP TABLE IF EXISTS public.org_activity_systems CASCADE;

DO $$
BEGIN
  RAISE NOTICE 'Reverse Migration 067: org_activity_systems removed ✓';
END$$;
```

**Then:**
```bash
supabase db push  # Applies reverse migrations
```

---

## 9. Checklist for @data-engineer

**Before signaling PASS to @devops:**

- [ ] All migration files are syntactically valid (supabase migration list)
- [ ] All prerequisite tables exist (query in 2.2)
- [ ] All enums exist (query in 2.3)
- [ ] All 5 migrations applied successfully (066-070 in order)
- [ ] All 8 new/modified tables exist (query in 3.2)
- [ ] RLS ENABLED on all 8 tables (query in 4.1)
- [ ] All 32 RLS policies exist (4 × 8 tables) (query in 4.2)
- [ ] All policies filter by tenant_id
- [ ] Tenant isolation tests PASS (test in 4.3)
- [ ] All FK constraints exist (query in 6.1)
- [ ] No orphaned data (query in 6.2)
- [ ] All indexes created (query in 5.1)
- [ ] Performance baseline < 100ms (5.2)
- [ ] If Story 11.11 approved: pgvector extension ready (7.1)
- [ ] Reverse migration files prepared (8.2)

**Sign-off statement (to @devops):**
```
✅ Database validation gates PASSED
   - All 5 migrations applied (066-070)
   - RLS compliance verified (all 8 tables)
   - No data integrity issues
   - Performance baseline acceptable
   - Rollback procedures documented

Ready for application code deployment.
```

---

## 10. Coordination with @devops

### Pre-Deployment (T-4h)

**@data-engineer → @devops:**
- Database validation complete
- Migration order confirmed
- RLS policies verified
- Rollback plan documented

**@devops acknowledges and prepares:**
- GitHub Actions CI/CD pipeline ready
- Supabase credentials configured
- Deployment timeline communicated
- Smoke test plan prepared

### During Deployment (T=0)

**@devops runs migrations, @data-engineer monitors:**
- @devops: `supabase db push`
- @data-engineer: Watch for errors in Supabase logs
- If error: @data-engineer analyzes, provides fix or rollback instruction

### Post-Deployment (T+30m)

**@data-engineer verifies:**
```bash
# Run validation queries again (4.1, 4.2, 5.1)
# Confirm: RLS enabled, policies in place, indexes created
```

**@devops checks application layer:**
```bash
# Run smoke tests
# Verify: API calls work, data isolation holds
```

---

## References

| Document | Purpose |
|----------|---------|
| `docs/engineering/DEPENDENCY-MANAGEMENT.md` | pgvector library versions, OpenAI integration |
| `docs/architecture/build-deploy-gates.md` | CI/CD pipeline gates, full deployment runbook |
| `docs/adr/ADR-001-row-level-security.md` | RLS design decisions, tenant isolation rationale |
| `supabase/migrations/066-070` | All migration SQL files |
| `.claude/rules/agent-authority.md` | @devops exclusive deployment authority |

---

**Author:** @data-engineer (Dara)
**Reviewed by:** @architect (Aria), @devops (Gage)
**Status:** Production Ready (v0.2.4)
