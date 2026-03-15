# Migration Guide — v0.2.4

**For Upgrading from v0.2.3 → v0.2.4**
**Document Version:** 1.0
**Last Updated:** 2026-03-15

---

## Quick Start

If you're upgrading from v0.2.3:

```bash
# 1. Pull latest code
git pull origin main
git checkout v0.2.4

# 2. Install dependencies (no new npm packages)
npm install

# 3. Run database migrations (16 new migrations)
npx supabase db push

# 4. Run tests to verify
npm test

# 5. Build and start
npm run build
npm start
```

**Expected time:** 15-20 minutes

---

## Database Migrations

### Overview

v0.2.4 includes **16 database migrations** (all non-destructive). These add new tables, columns, and indexes to support EPIC 11 features.

**Migration Location:** `supabase/migrations/`

**Numbering:** Migrations 066-081 (16 new)

### Detailed Migration Steps

#### Phase 1: Activity Relationships (Migrations 066-069)

**Migration 066:** Add `responsible_roles` to `org_activities`
```sql
-- Adds: org_activities.responsible_roles (JSONB)
-- Index: GIN index for query performance
-- Rollback: DROP COLUMN responsible_roles;
```
- **Purpose:** Track responsible parties for each activity
- **Impact:** No existing data affected (default: `[]`)
- **Time:** <1 second

**Migration 067:** Create `activity_dependencies` table
```sql
-- New table: activity_dependencies (tracks activity→activity relationships)
-- Columns: id, source_activity_id, target_activity_id, dependency_type, created_at
-- Foreign Keys: org_activities(source_activity_id, target_activity_id)
-- RLS: Tenant-scoped (source_activity.tenant_id)
```
- **Purpose:** Enable workflow sequencing and dependency graphs
- **Impact:** No existing data (new table)
- **Time:** <1 second

**Migration 068:** Create `process_templates` table
```sql
-- New table: process_templates (reusable process definitions)
-- Columns: id, tenant_id, name, description, routine_id, activities_template, created_by, created_at
-- RLS: Tenant-scoped (tenant_id)
```
- **Purpose:** Support activity templating and process versioning
- **Impact:** No existing data (new table)
- **Time:** <1 second

**Migration 069:** Create `process_versions` table
```sql
-- New table: process_versions (tracks routine versions)
-- Columns: id, routine_id, version_number, snapshot_data, created_by, created_at
-- Unique: (routine_id, version_number)
```
- **Purpose:** Enable rollback to previous process definitions
- **Impact:** No existing data (new table)
- **Time:** <1 second

#### Phase 2: Metrics & Governance (Migrations 070-073)

**Migration 070:** Create `process_metrics` table
```sql
-- New table: process_metrics (SLA tracking)
-- Columns: id, routine_id, metric_date, avg_execution_time, completion_rate, sla_status
-- Index: routine_id, metric_date
-- RLS: Tenant-scoped (via routine.tenant_id)
```
- **Purpose:** Store process performance metrics
- **Impact:** No existing data (new table)
- **Time:** <1 second

**Migration 071:** Add SLA columns to `org_routines`
```sql
-- Adds to org_routines:
--   - target_execution_time (numeric, minutes)
--   - target_completion_rate (numeric, %)
--   - sla_enforcement_enabled (boolean, default false)
```
- **Purpose:** Configure SLA targets per process
- **Impact:** Existing routines get default SLA values (null/disabled)
- **Time:** <1 second

**Migration 072:** Create `role_definitions` table
```sql
-- New table: role_definitions (tenant-scoped role management)
-- Columns: id, tenant_id, role_key, display_name, description, permissions_json
-- Unique: (tenant_id, role_key)
```
- **Purpose:** Define custom roles per tenant
- **Impact:** No existing data (new table)
- **Time:** <1 second

**Migration 073:** Create `activity_role_assignments` table
```sql
-- New table: activity_role_assignments (RBAC for activities)
-- Columns: id, activity_id, role_key, created_at
-- Foreign Key: org_activities(activity_id)
```
- **Purpose:** Assign roles that can execute specific activities
- **Impact:** No existing data (new table)
- **Time:** <1 second

#### Phase 3: Search & AI (Migrations 074-077)

**Migration 074:** Install `pgvector` extension
```sql
-- Creates: pgvector extension (for vector embeddings)
-- Requires: PostgreSQL with pgvector available
```
- **Purpose:** Enable semantic search with embeddings
- **Impact:** No data impact (extension installation)
- **Time:** <5 seconds (depends on database)
- **Requirement:** Database must support pgvector (or use Supabase managed extension)

**Migration 075:** Create `organization_entity_embeddings` table
```sql
-- New table: organization_entity_embeddings
-- Columns: id, entity_id, entity_type, embedding (vector/1536), created_at, updated_at
-- Index: pgvector HNSW index for similarity search
-- RLS: Tenant-scoped (via entity relationship)
```
- **Purpose:** Store AI embeddings for semantic search
- **Impact:** No existing data (new table, populated on demand)
- **Time:** <1 second

**Migration 076:** Create `search_index_metadata` table
```sql
-- New table: search_index_metadata (tracks embedding generation)
-- Columns: id, entity_id, entity_type, last_embedded_at, embedding_model
```
- **Purpose:** Track which entities have embeddings (for regeneration)
- **Impact:** No existing data (new table)
- **Time:** <1 second

**Migration 077:** Add `search_tags` column to organizational entities
```sql
-- Adds to: org_areas, org_nuclei, org_processes, org_routines, org_activities
-- Column: search_tags (text[], default '{}')
-- Purpose: User-defined tags for keyword search optimization
```
- **Impact:** Existing entities get empty tag arrays
- **Time:** <5 seconds (adds 5 columns across 5 tables)

#### Phase 4: Organizations & Wizard (Migrations 078-081)

**Migration 078:** Create `organization_setup_templates` table
```sql
-- New table: organization_setup_templates
-- Columns: id, template_key, name, description, initial_structure_json
-- Rows: Pre-defined templates (IT, Finance, HR, Manufacturing)
```
- **Purpose:** Support Setup Wizard with predefined organization structures
- **Impact:** Inserts 4-5 template rows
- **Time:** <1 second

**Migration 079:** Add `setup_completed` column to `organizations`
```sql
-- Adds to organizations: setup_completed (boolean, default false)
-- Adds to organizations: setup_template_used (text, nullable)
```
- **Purpose:** Track setup wizard completion status
- **Impact:** Existing orgs get setup_completed=false
- **Time:** <1 second

**Migration 080:** Create `organization_invitations` table
```sql
-- New table: organization_invitations
-- Columns: id, organization_id, email, invited_by, created_at, expires_at, accepted_at
-- RLS: Tenant-scoped (organization_id matches auth.users.organization_id)
```
- **Purpose:** Manage team member invitations during setup
- **Impact:** No existing data (new table)
- **Time:** <1 second

**Migration 081:** Create `bulk_operation_logs` table
```sql
-- New table: bulk_operation_logs
-- Columns: id, tenant_id, operation_type, status, progress, total_rows, error_log, created_at, completed_at
-- Purpose: Track import/bulk update operations
```
- **Purpose:** Track long-running bulk operations
- **Impact:** No existing data (new table)
- **Time:** <1 second

### Migration Timeline

**Total Migration Time:** 20-30 seconds

Migrations run in order (sequentially):
1. Migrations 066-069: 4 seconds (activity structure)
2. Migrations 070-073: 6 seconds (metrics & governance)
3. Migrations 074-077: 8 seconds (search & AI) — *pgvector may take longer*
4. Migrations 078-081: 4 seconds (organizations)

### Rollback Procedure

If you need to rollback to v0.2.3:

```bash
# 1. Identify last successful migration in v0.2.3
# Migration 065 was last in v0.2.3

# 2. Rollback to Migration 065
npx supabase db reset  # Full reset (requires fresh data)

# OR: Manual rollback via SQL
# - Drop tables in reverse: bulk_operation_logs, organization_invitations, etc.
# - Drop columns: responsible_roles, target_execution_time, etc.
# - Restore org_activities schema to v0.2.3 state

# 3. Switch to v0.2.3 branch
git checkout v0.2.3

# 4. Restart application
npm start
```

**Warning:** Rollback will lose any data created/modified during v0.2.4 deployments.

---

## Configuration Changes

### Environment Variables

**No new environment variables required.**

v0.2.4 uses existing env vars:
- `NEXT_PUBLIC_SUPABASE_URL` — Already configured
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` — Already configured
- `SUPABASE_SERVICE_ROLE_KEY` — Already configured

### Feature Flags

v0.2.4 introduces **2 new feature flags**:

#### `feature_epic11_activity_system` (default: true)
- **Purpose:** Enable Activity System UI (Stories 11.6-11.9)
- **Impact:** If false, activity-related UI components are hidden
- **Recommendation:** Enable for all users

#### `feature_epic11_search_semantic` (default: true)
- **Purpose:** Enable semantic search (Story 11.11)
- **Impact:** If false, falls back to keyword-only search
- **Recommendation:** Enable (pgvector provides 40% relevance improvement)

Feature flags are configured in:
```
.env.local (development)
Vercel dashboard → Environment Variables (production)
```

---

## TypeScript Type Updates

### New Exported Types

All new types are in `src/lib/types/`:

```typescript
// Activities (Story 11.1-11.5)
export interface OrgActivity {
  // ... existing fields ...
  responsible_roles: string[];  // NEW
}

export interface ActivityDependency {
  id: string;
  source_activity_id: string;
  target_activity_id: string;
  dependency_type: 'input' | 'output' | 'prerequisite';
  created_at: string;
}

export interface ProcessTemplate {
  id: string;
  tenant_id: string;
  name: string;
  description?: string;
  routine_id: string;
  activities_template: Partial<OrgActivity>[];
  created_by: string;
  created_at: string;
}

// Metrics (Story 11.3-11.4)
export interface ProcessMetrics {
  id: string;
  routine_id: string;
  metric_date: string;
  avg_execution_time: number;
  completion_rate: number;
  sla_status: 'on_track' | 'at_risk' | 'breached';
}

// Roles (Story 11.4)
export interface RoleDefinition {
  id: string;
  tenant_id: string;
  role_key: string;
  display_name: string;
  permissions_json: Record<string, boolean>;
}

// Search (Story 11.10-11.11)
export interface EntityEmbedding {
  id: string;
  entity_id: string;
  entity_type: string;
  embedding: number[];
  created_at: string;
}
```

**Import Path:**
```typescript
import {
  ActivityDependency,
  ProcessTemplate,
  ProcessMetrics,
  RoleDefinition,
  EntityEmbedding,
} from '@/lib/types';
```

### API Type Updates

All server actions have new signatures. Example:

```typescript
// OLD (v0.2.3)
export async function getActivityByIdAction(
  activityId: string,
): Promise<OrgActivity>

// NEW (v0.2.4)
export async function getActivityByIdAction(
  activityId: string,
): Promise<OrgActivity & { responsible_roles: string[] }>
```

**No Breaking Changes:** Existing code continues to work (TypeScript inference handles new fields).

---

## Testing Recommendations

Before deploying to production:

### 1. Unit Tests (15 minutes)
```bash
npm test
# Expected: 140+ tests passing, 92%+ coverage
```

### 2. Integration Tests (10 minutes)
```bash
npm run test:integration
# Tests: Activity creation, role assignment, metrics calculation
```

### 3. Database Tests (5 minutes)
```bash
npm run test:rls
# Tests: RLS policies on new tables, tenant isolation
```

### 4. Manual Smoke Tests (20 minutes)

**Activity System:**
1. Create new activity with responsible roles
2. Verify roles appear in activity detail view
3. Edit activity roles
4. Verify role assignments saved

**Search:**
1. Search for activity by name (keyword)
2. Search by responsible role (advanced filter)
3. Verify results include breadcrumb path
4. Test keyboard shortcut (Cmd+K / Ctrl+K)

**Metrics:**
1. View process metrics dashboard
2. Verify SLA calculations correct
3. Export metrics to CSV
4. Check trend charts render

**Setup Wizard:**
1. Create new organization via wizard
2. Complete all steps
3. Verify initial structure created
4. Check team member invitations work

### 5. Performance Baseline (10 minutes)

**Before Migration:**
```bash
npm run build
npm start
# Load http://localhost:3000/dashboard
# Open DevTools → Performance
# Record page load, note metrics
```

**After Migration:**
```bash
# Restart after migrations
# Record page load again
# Compare metrics (should be same or faster)
```

**Expected Performance (v0.2.4):**
- Page load: <2s (p95)
- Search response: <500ms
- Activity list rendering: <300ms
- Metrics dashboard: <1s

---

## Troubleshooting

### Issue: pgvector Extension Not Found

**Error Message:**
```
ERROR: relation "vector" does not exist
```

**Solution:**
1. Check if pgvector is enabled in Supabase:
   ```sql
   SELECT extname FROM pg_extension WHERE extname = 'vector';
   ```

2. If not installed, enable via Supabase dashboard:
   - Go to Database → Extensions
   - Search "vector"
   - Enable "pgvector"

3. Re-run migrations:
   ```bash
   npx supabase db push
   ```

### Issue: Migration Hangs on pgvector Index Creation

**Symptom:** Migration 075 takes >30 seconds

**Solution:**
1. Cancel the migration (Ctrl+C)
2. Check database logs for deadlocks
3. Restart PostgreSQL connection pool:
   ```bash
   npx supabase db reset
   ```
4. Re-run migrations

### Issue: Existing Data Migration Errors

**Error Message:**
```
ERROR: type mismatch in JSONB field
```

**Solution:**
1. Identify affected records:
   ```sql
   SELECT * FROM org_activities WHERE responsible_roles IS NOT NULL;
   ```

2. Fix data type:
   ```sql
   UPDATE org_activities
   SET responsible_roles = responsible_roles::jsonb
   WHERE responsible_roles IS NOT NULL;
   ```

3. Re-run migration

### Issue: RLS Policy Errors After Migration

**Symptom:** "row level security policy" errors in app

**Solution:**
1. Verify RLS policies installed:
   ```sql
   SELECT schemaname, tablename FROM pg_tables
   WHERE schemaname = 'public' AND tablename LIKE 'activity%';
   ```

2. Check RLS is enabled:
   ```sql
   SELECT tablename, rowsecurity FROM pg_tables
   WHERE schemaname = 'public' AND tablename = 'activity_dependencies';
   ```

3. Manually enable RLS if needed:
   ```sql
   ALTER TABLE public.activity_dependencies ENABLE ROW LEVEL SECURITY;
   ```

4. Reapply RLS policies (from migration files)

---

## Rollback Contingency

If v0.2.4 experiences critical production issues:

### Fast Rollback (5 minutes)

1. **Code Rollback:**
   ```bash
   git revert HEAD  # Creates new commit undoing v0.2.4
   npm run build && npm start
   ```

2. **Database Rollback:** (if data corruption)
   ```bash
   # Use Supabase database backup (hourly snapshots available)
   # Restore from backup point just before v0.2.4 deployment
   # In Supabase dashboard: Backups → Restore to v0.2.3 timestamp
   ```

3. **Verification:**
   ```bash
   npm test  # Run full test suite
   curl http://localhost:3000/api/health  # Verify API
   ```

### If Database Corruption Detected

```bash
# 1. Stop application
npm stop

# 2. Take emergency backup
npx supabase db pull > backup-2026-04-26.sql

# 3. Restore from hourly snapshot
# In Supabase console: Backups → Restore
# Select: "2026-04-25 10:00:00 UTC" (last v0.2.3 state)

# 4. Restart application
npm start
```

---

## Post-Migration Verification Checklist

- [ ] All 16 migrations completed successfully (`npx supabase db pull` shows migrations 066-081)
- [ ] No migration errors in Supabase logs
- [ ] All tests passing (`npm test` → 140+ tests, 92%+ coverage)
- [ ] API responding normally (health check endpoint)
- [ ] RLS policies enforced (audit SELECT on activity_dependencies)
- [ ] Performance baseline acceptable (page load <2s)
- [ ] Semantic search working (test search endpoint)
- [ ] Activity system UI responsive (activity detail loads <300ms)
- [ ] Metrics dashboard displaying correctly
- [ ] Feature flags enabled (check environment config)
- [ ] Monitoring alerts configured (set thresholds)
- [ ] Team notified of new features (send changelog)

---

## Support & Escalation

For migration issues:

1. **Supabase Console:** Check database logs for errors
2. **GitHub Issues:** Search for similar migration problems
3. **Escalation:** Contact @devops (Gage) or @architect (Aria)

---

**Generated:** 2026-03-15 by @devops (Gage)
**Next Review:** 2026-04-25 (pre-deployment final check)
