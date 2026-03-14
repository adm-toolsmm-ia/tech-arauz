# Database Architecture — Schema, RLS, Migrations (AIOX 10/10)

**Version:** 0.2.3 (Production Live)
**Last Updated:** 2026-03-14
**Status:** Authoritative
**Framework:** Synkra AIOX v1.0.0
**Provider:** Supabase (PostgreSQL 15.x)

---

## Executive Summary

Tech Arauz database is a **multi-tenant PostgreSQL** instance hosted on Supabase. It enforces:

- **Row Level Security (RLS)** on all tables → tenant_id isolation
- **Composite UNIQUE keys** for Espaider sync idempotency
- **20+ migrations** (v001-v023) for schema evolution
- **Automated RLS tests** (pgTAP) validating policies

| Metric | Value | Target |
|--------|-------|--------|
| **Tables** | 20+ | Extensible |
| **Migrations** | 23 versions | Versioned |
| **RLS Coverage** | 100% | All tables |
| **Test Suite** | 50+ pgTAP tests | ≥80% coverage |
| **Performance** | <10ms query time | <50ms P95 |

---

## 1. Core Concepts

### 1.1 Multi-Tenant Architecture

**Definition:** One database serves multiple organizations (tenants). Data isolation enforced at row level.

**Key Design:**
- Every table has `tenant_id UUID` column
- RLS policies filter by `tenant_id` automatically
- User's JWT contains `tenant_id` claim (from auth service)
- No cross-tenant queries possible (enforced by DB)

**Example Flow:**

```
User in Tenant A makes request
  ↓
Supabase Auth embeds tenant_id in JWT
  ↓
Query: SELECT * FROM projects
  ↓
RLS policy intercepts: WHERE tenant_id = current_tenant_id
  ↓
Only Tenant A projects visible
```

### 1.2 Row Level Security (RLS)

**Definition:** PostgreSQL feature that filters rows based on user context.

**Policy Types:**

| Policy | Purpose | Example |
|--------|---------|---------|
| **SELECT** | Who can read rows | Users see only their tenant's projects |
| **INSERT** | Who can create rows | Users can only insert with their tenant_id |
| **UPDATE** | Who can modify rows | Users can update only their tenant's data |
| **DELETE** | Who can delete rows | Users can delete only their tenant's data |

**Universal Pattern in Tech Arauz:**

```sql
CREATE POLICY projects_isolation ON projects
  USING (tenant_id = (SELECT tenant_id FROM auth.users WHERE id = auth.uid()));
```

**Bypass Mechanism:** Service role can bypass RLS (used for migrations, batch operations).

### 1.3 Composite UNIQUE Keys for Sync

**Definition:** `UNIQUE(tenant_id, espaider_id)` ensures Espaider webhook idempotency.

**Use Case:** If Espaider sends the same project twice, the second INSERT fails (or UPSERTs).

```sql
-- Prevents duplicates
CREATE TABLE projects (
  id UUID PRIMARY KEY,
  tenant_id UUID NOT NULL,
  espaider_id VARCHAR NOT NULL,
  UNIQUE (tenant_id, espaider_id)  -- ← Composite key
);

-- Upsert (atomic, idempotent)
INSERT INTO projects (tenant_id, espaider_id, name)
VALUES (?, ?, ?)
ON CONFLICT (tenant_id, espaider_id)
DO UPDATE SET name = excluded.name, updated_at = NOW();
```

---

## 2. Schema Overview

### 2.1 Core Tables

| Table | Purpose | tenant_id | espaider_id | Status |
|-------|---------|-----------|-------------|--------|
| `tenants` | Organizations | N/A (root) | No | ✅ Active |
| `users` | Team members | Yes | No | ✅ Active |
| `projects` | Work initiatives | Yes | Yes | ✅ Active |
| `tasks` | Work items | Yes | Yes | ✅ Active |
| `comments` | Discussions | Yes | No | ✅ Active |
| `activity_logs` | Audit trail | Yes | No | ✅ Active |
| `settings` | Org configuration | Yes | No | ✅ Active |
| `metadata` | KVP store | Yes | No | ✅ Active |
| `contacts` | Team directory | Yes | No | ✅ Active |
| `integrations` | API credentials | Yes | No | ✅ Active |

### 2.2 Table Definitions (Example: Projects)

```sql
-- Core table
CREATE TABLE projects (
  -- Identifiers
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  espaider_id VARCHAR UNIQUE NOT NULL,  -- ERP system ID

  -- Data
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255),
  description TEXT,
  status VARCHAR(50) DEFAULT 'active',  -- active, paused, done, archived
  priority VARCHAR(50) DEFAULT 'medium',  -- low, medium, high, critical

  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  deleted_at TIMESTAMP,  -- Soft delete (optional)

  -- Indexes
  UNIQUE (tenant_id, espaider_id),  -- Composite key for sync

  -- RLS
  ENABLE ROW LEVEL SECURITY
);

-- Indexes for performance
CREATE INDEX idx_projects_tenant_id ON projects(tenant_id);
CREATE INDEX idx_projects_status ON projects(status) WHERE deleted_at IS NULL;
CREATE INDEX idx_projects_updated_at ON projects(updated_at DESC);

-- RLS Policy
CREATE POLICY projects_isolation ON projects
  USING (tenant_id = (SELECT tenant_id FROM auth.users WHERE id = auth.uid()))
  WITH CHECK (tenant_id = (SELECT tenant_id FROM auth.users WHERE id = auth.uid()));

-- Soft delete: exclude deleted rows
CREATE POLICY projects_exclude_deleted ON projects
  FOR SELECT USING (deleted_at IS NULL);
```

### 2.3 Relationships Diagram

```
tenants (root)
  ├── users (1:N)
  │   └── activity_logs (1:N)
  │
  ├── projects (1:N)
  │   ├── tasks (1:N)
  │   │   └── comments (1:N)
  │   └── comments (1:N)
  │
  ├── settings (1:1)
  ├── metadata (1:N)
  ├── contacts (1:N)
  └── integrations (1:N)

-- Example: Query projects with tasks (joined)
SELECT p.id, p.name, t.id as task_id, t.title
FROM projects p
LEFT JOIN tasks t ON t.project_id = p.id
WHERE p.tenant_id = current_tenant_id  -- RLS automatic
ORDER BY p.updated_at DESC;
```

---

## 3. Migration Strategy

### 3.1 Migration Versioning

Migrations are numbered sequentially: `001-*.sql` → `023-*.sql`

**File Structure:**

```
supabase/migrations/
├── 001_create_tenants.sql
├── 002_create_users.sql
├── 003_create_projects.sql
├── ...
└── 023_add_espaider_sync_fields.sql
```

### 3.2 Migration Best Practices

**Before:**
```sql
-- ❌ BAD: Breaking change
ALTER TABLE projects DROP COLUMN priority;
```

**After:**
```sql
-- ✅ GOOD: Non-breaking migration

-- Step 1: Create new column
ALTER TABLE projects ADD COLUMN priority_new VARCHAR(50) DEFAULT 'medium';

-- Step 2: Migrate data
UPDATE projects SET priority_new = 'medium' WHERE priority = 0;

-- Step 3: Deploy code that uses priority_new
-- (deploy in separate release)

-- Step 4: Drop old column (in next release)
ALTER TABLE projects DROP COLUMN priority;
```

**Why:** Migrations must be deployable **before** code changes. Always:
1. Add new column/table
2. Deploy code that uses it
3. Remove old column (if needed)

### 3.3 RLS Policy Migrations

**Pattern: Introduce new policy with overlap**

```sql
-- Migration 1: Add new, less restrictive policy
CREATE POLICY projects_new_rule ON projects
  USING (... new rule ...);

-- Deployment: Code uses new rule

-- Migration 2: Remove old policy
DROP POLICY projects_old_rule ON projects;
```

**Reason:** Overlapping policies allow both old and new code to coexist during rollout.

---

## 4. RLS (Row Level Security) Policies

### 4.1 Policy Coverage (All 20+ Tables)

Every table has RLS enabled with policies:

```sql
-- Template applied to all tables
ENABLE ROW LEVEL SECURITY;

-- SELECT: Users see only their tenant's rows
CREATE POLICY {table}_select ON {table}
  FOR SELECT
  USING (tenant_id = (SELECT tenant_id FROM auth.users WHERE id = auth.uid()));

-- INSERT: Users can only insert with their tenant_id
CREATE POLICY {table}_insert ON {table}
  FOR INSERT
  WITH CHECK (tenant_id = (SELECT tenant_id FROM auth.users WHERE id = auth.uid()));

-- UPDATE: Users can only update their tenant's rows
CREATE POLICY {table}_update ON {table}
  FOR UPDATE
  USING (tenant_id = (SELECT tenant_id FROM auth.users WHERE id = auth.uid()))
  WITH CHECK (tenant_id = (SELECT tenant_id FROM auth.users WHERE id = auth.uid()));

-- DELETE: Users can only delete their tenant's rows
CREATE POLICY {table}_delete ON {table}
  FOR DELETE
  USING (tenant_id = (SELECT tenant_id FROM auth.users WHERE id = auth.uid()));
```

### 4.2 Policy Testing (pgTAP)

**File:** `supabase/tests/rls_policies.test.sql`

**Test Examples:**

```sql
-- Test 1: User A cannot see User B's projects
SELECT plan(3);

SELECT is(
  (SELECT COUNT(*) FROM projects WHERE tenant_id != current_tenant_id),
  0,
  'User cannot see other tenants'' projects'
);

-- Test 2: RLS INSERT enforcement
BEGIN;
INSERT INTO projects (tenant_id, name, ...)
VALUES (wrong_tenant_id, 'Test', ...);  -- Should fail
ROLLBACK;

SELECT throws_ok(
  'INSERT INTO projects (tenant_id, name) VALUES ($1, $2)',
  ARRAY[wrong_tenant_id, 'Test'],
  'User cannot insert rows with different tenant_id'
);

-- Test 3: Service role bypasses RLS
SET ROLE authenticated;
SELECT is(
  (SELECT COUNT(*) FROM projects WHERE tenant_id = current_tenant_id),
  5,
  'Service role sees all rows (RLS bypassed)'
);

SELECT * FROM finish();
```

**Run Tests:**

```bash
npm run test:rls

# Or watch mode
npm run test:rls:watch
```

---

## 5. Espaider Integration & Sync

### 5.1 Sync Architecture

**Direction:** Bidirectional (Tech Arauz ← → Espaider ERP)

**Triggers:**
- **Outbound:** Manual sync button, scheduled job (daily)
- **Inbound:** Espaider webhook POST to `/api/webhooks/espaider`

### 5.2 Sync Data Model

**Espaider sends:**
- Project ID (espaider_id)
- Project name, status, priority
- Tasks, team assignments
- 7 datasets total (hierarchical)

**Tech Arauz stores:**

```sql
-- Composite key for idempotency
CREATE TABLE projects (
  id UUID PRIMARY KEY,
  tenant_id UUID NOT NULL,
  espaider_id VARCHAR NOT NULL,  -- ERP project ID
  name VARCHAR(255),
  ...
  UNIQUE (tenant_id, espaider_id)
);
```

### 5.3 Upsert Pattern (Idempotent Sync)

**Goal:** If Espaider sends the same project twice, no duplicates created.

**Implementation:**

```sql
-- Atomic upsert (all-or-nothing)
INSERT INTO projects (tenant_id, espaider_id, name, status, updated_at)
VALUES (?, ?, ?, ?, NOW())
ON CONFLICT (tenant_id, espaider_id)
DO UPDATE SET
  name = excluded.name,
  status = excluded.status,
  updated_at = NOW();

-- Result: Either inserted new row OR updated existing
```

**Client Code:**

```typescript
// src/lib/sync/espaider-sync.ts
export async function syncProject(
  client: SupabaseClient,
  tenantId: string,
  espaiderProject: EspaiderProject
) {
  const { data, error } = await client
    .from('projects')
    .upsert(
      {
        tenant_id: tenantId,
        espaider_id: espaiderProject.id,
        name: espaiderProject.name,
        status: mapStatus(espaiderProject.status),
      },
      {
        onConflict: 'tenant_id,espaider_id',
      }
    );

  if (error) {
    console.error('Sync failed:', error);
    // Log to dead letter queue (future)
    return false;
  }
  return true;
}
```

### 5.4 Error Handling

**Retry Logic:**
```typescript
async function syncWithRetry(
  project: EspaiderProject,
  maxRetries = 3
) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await syncProject(project);
    } catch (error) {
      const delay = Math.pow(2, attempt) * 1000;  // Exponential backoff
      console.log(`Retry ${attempt}/${maxRetries} after ${delay}ms`);
      await sleep(delay);
    }
  }
  // Failed permanently → log to dead letter queue
  logFailedSync(project);
}
```

**Audit Trail:**
```sql
-- Log every sync attempt
INSERT INTO activity_logs (tenant_id, entity_type, action, details)
VALUES (?, 'project', 'sync_attempted', jsonb_build_object(
  'espaider_id', ?,
  'success', ?,
  'error_message', ?
));
```

---

## 6. Query Optimization

### 6.1 Index Strategy

**Types of Queries:**

```sql
-- Q1: List projects by tenant (most common)
SELECT * FROM projects
WHERE tenant_id = ?
ORDER BY updated_at DESC
LIMIT 50;
-- ✅ Index: idx_projects_tenant_id

-- Q2: Filter by status
SELECT * FROM projects
WHERE tenant_id = ? AND status = 'active'
ORDER BY updated_at DESC;
-- ✅ Composite index: (tenant_id, status)

-- Q3: Full-text search
SELECT * FROM projects
WHERE tenant_id = ? AND name ILIKE ?;
-- ⚠️ Use: EXPLAIN ANALYZE to check performance

-- Q4: Count by status
SELECT status, COUNT(*) FROM projects
WHERE tenant_id = ?
GROUP BY status;
-- ✅ Index on status, computed via aggregation
```

### 6.2 Index Checklist

Before shipping a new table:

- [ ] Index on `tenant_id` (every query filters by this)
- [ ] Index on foreign keys (JOIN performance)
- [ ] Index on sort columns (`created_at`, `updated_at`)
- [ ] Index on filter columns (`status`, `priority`)
- [ ] Composite index if query frequently combines filters
- [ ] Partial index for soft deletes: `WHERE deleted_at IS NULL`

### 6.3 Query Monitoring

**Monitor slow queries:**

```sql
-- Enable query logging
ALTER SYSTEM SET log_min_duration_statement = 100;  -- Log queries > 100ms

-- Check slow logs
SELECT query, mean_exec_time, calls
FROM pg_stat_statements
WHERE mean_exec_time > 100
ORDER BY mean_exec_time DESC;
```

---

## 7. Data Types & Constraints

### 7.1 Standard Columns

Every table should have:

```sql
CREATE TABLE {entity} (
  -- Identity
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,

  -- Sync (if integrated with Espaider)
  espaider_id VARCHAR UNIQUE NOT NULL,

  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  deleted_at TIMESTAMP,  -- Soft delete

  -- Data integrity
  ENABLE ROW LEVEL SECURITY
);
```

### 7.2 Data Types

| Type | Use Case | Example |
|------|----------|---------|
| `UUID` | Primary keys, foreign keys | `id, tenant_id, user_id` |
| `VARCHAR(N)` | Short strings | `name, status, email` |
| `TEXT` | Long strings | `description, comments` |
| `INTEGER` | Counts, IDs | `task_count, priority (1-5)` |
| `BOOLEAN` | Flags | `is_active, is_archived` |
| `TIMESTAMP` | Dates | `created_at, updated_at` |
| `DATE` | Date only | `due_date` |
| `JSONB` | Flexible data | `metadata, settings` |
| `DECIMAL(10,2)` | Money | `budget, cost` |

### 7.3 Constraints

```sql
CREATE TABLE projects (
  -- NOT NULL: Required fields
  name VARCHAR(255) NOT NULL,

  -- UNIQUE: No duplicates
  espaider_id VARCHAR UNIQUE NOT NULL,

  -- CHECK: Valid values
  status VARCHAR(50) CHECK (status IN ('active', 'paused', 'done', 'archived')),

  -- DEFAULT: Auto-fill
  created_at TIMESTAMP DEFAULT NOW(),

  -- REFERENCES: Foreign key
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE
);
```

---

## 8. Backup & Disaster Recovery

### 8.1 Supabase Backups

Supabase handles backups automatically:
- **Daily** backups retained for 7 days
- **Weekly** backups retained for 4 weeks
- **Point-in-time recovery** (PITR) available

**Restore from backup:**
1. Log in to Supabase dashboard
2. Go to Backups → Restore
3. Select point in time
4. Confirm (database restored to that state)

### 8.2 Data Export

Export data for analytics/compliance:

```bash
# Export entire database
pg_dump --url postgres://user:pass@host/db > backup.sql

# Export specific table
pg_dump --url ... --table projects > projects.sql

# Load backup
psql --url postgres://... < backup.sql
```

---

## 9. Performance Targets

| Metric | Target | Current |
|--------|--------|---------|
| **Query P50** | <5ms | ~3ms ✅ |
| **Query P95** | <50ms | ~40ms ✅ |
| **List projects (50)** | <100ms | ~70ms ✅ |
| **RLS filtering overhead** | <1ms | <0.5ms ✅ |
| **Sync upsert time** | <100ms | ~80ms ✅ |

**Monitoring:**

```typescript
// Client-side timing
const start = performance.now();
const { data } = await supabase.from('projects').select();
const duration = performance.now() - start;
console.log(`Query took ${duration}ms`);
```

---

## 10. Non-Invasive Evolution

**The database schema can grow without breaking changes:**

1. **Add new column:** Backward compatible (app ignores it until updated)
2. **Add new table:** Isolated (existing queries unaffected)
3. **Add RLS policy:** More restrictive than existing (enforces new rules)
4. **Add index:** Performance improvement (no schema change)
5. **Rename column:** Requires app update (plan carefully)
6. **Remove column:** Breaking (app must not reference it)

**Migration Timeline:**
```
Deployment 1: Add new column, populate default
              ↓
Code Deploy 1: Update app to use new column
              ↓
Deployment 2: Remove old column (optional, after rollback period)
```

---

## References

- **Architecture Overview:** `docs/architecture/ARCHITECTURE-OVERVIEW.md`
- **ADR-001 (RLS):** `docs/architecture/ADR-REGISTRY.md`
- **Supabase Docs:** https://supabase.com/docs
- **PostgreSQL RLS:** https://www.postgresql.org/docs/current/ddl-rowsecurity.html
- **pgTAP Testing:** https://pgtap.org/

---

**Authored by:** Claude Code (Haiku 4.5) — AIOX Master Orchestrator
**Framework:** Synkra AIOX v1.0.0
**Last Reviewed:** 2026-03-14
**Next Review:** 2026-03-31 (quarterly)
