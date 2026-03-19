# ESPAIDER-MODERNIZATION-008: Consolidate Logging Tables (Migration 073-077)

**Epic:** EPIC-ESPAIDER-MODERNIZATION
**Phase:** C (Logging & Observability)
**Priority:** 🔴 CRITICAL (removes fragmentation)
**Effort:** 1.5-2 days
**Owner:** @dev (Dex)
**Status:** READY

---

## Goal

Consolidate fragmented logging from 2 tables (sync_logs + integration_log_entries) into 1 queryable source with correlation ID support.

---

## Acceptance Criteria

- [ ] Create Migration 073: Add correlation_id to sync_log_entries (or new unified table)
- [ ] Create Migration 074: Add new indexes for correlation_id queries
- [ ] Create Migration 075: Archive old integration_log_entries data
- [ ] Create Migration 076: Add RLS policies to log table
- [ ] Create Migration 077: Final validation + constraints
- [ ] Rollback procedures tested (restore from backup)
- [ ] Zero data loss (archive old logs, don't delete)
- [ ] Query performance: correlation ID lookup <10ms
- [ ] RLS policies enforce tenant isolation on logs

---

## Technical Details

### Current State (Problems)

**Table 1: sync_logs**
- Fields: id, sync_id, status, error, created_at
- No correlation ID
- No category/operation type
- Hard to trace multi-step operations

**Table 2: integration_log_entries**
- Fields: id, integration_type, log_text, created_at
- Unstructured (text field)
- No tenant isolation
- No hierarchy (parent-child logs)

### Target State (Unified)

**Table: sync_log_entries (unified)**
```sql
CREATE TABLE sync_log_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  correlation_id TEXT NOT NULL, -- Key for tracing
  parent_span_id UUID, -- For nested operations
  span_id UUID NOT NULL DEFAULT gen_random_uuid(),
  operation TEXT NOT NULL, -- 'api.call', 'mapping', 'db.upsert', etc.
  level TEXT NOT NULL, -- 'debug', 'info', 'warn', 'error'
  message TEXT NOT NULL,
  metadata JSONB, -- Structured metadata
  duration_ms INTEGER, -- For spans
  success BOOLEAN,
  error_details JSONB, -- Error information
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_by TEXT -- user or service name

  -- Indexes for performance
  CONSTRAINT sync_log_entries_level_check CHECK (level IN ('debug', 'info', 'warn', 'error'))
);

CREATE INDEX idx_sync_log_entries_correlation_id ON sync_log_entries(correlation_id);
CREATE INDEX idx_sync_log_entries_tenant_correlation ON sync_log_entries(tenant_id, correlation_id);
CREATE INDEX idx_sync_log_entries_created_at ON sync_log_entries(created_at DESC);
CREATE INDEX idx_sync_log_entries_span_parent ON sync_log_entries(parent_span_id);

-- RLS Policy: tenants can only see their own logs
ALTER TABLE sync_log_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY sync_log_entries_tenant_isolation ON sync_log_entries
  FOR SELECT USING (tenant_id = auth.uid()::uuid);
```

### Migration Strategy

**Migration 073: Create new table with correlation_id**
```sql
CREATE TABLE sync_log_entries (
  id UUID PRIMARY KEY,
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  correlation_id TEXT NOT NULL,
  -- ... other fields
);

CREATE INDEX idx_sync_log_entries_correlation_id ON sync_log_entries(correlation_id);
```

**Migration 074: Add indexes for performance**
```sql
CREATE INDEX idx_sync_log_entries_tenant_correlation
  ON sync_log_entries(tenant_id, correlation_id);
CREATE INDEX idx_sync_log_entries_created_at
  ON sync_log_entries(created_at DESC);
CREATE INDEX idx_sync_log_entries_span_parent
  ON sync_log_entries(parent_span_id);
```

**Migration 075: Archive old data**
```sql
-- Create archive table for old logs
CREATE TABLE sync_log_entries_archive AS
  SELECT * FROM integration_log_entries;

-- Mark for later cleanup
ALTER TABLE sync_log_entries_archive
  ADD COLUMN archived_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
```

**Migration 076: Add RLS policies**
```sql
ALTER TABLE sync_log_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY sync_log_entries_tenant_isolation ON sync_log_entries
  FOR SELECT USING (tenant_id = auth.uid()::uuid);

CREATE POLICY sync_log_entries_insert ON sync_log_entries
  FOR INSERT WITH CHECK (tenant_id = auth.uid()::uuid);
```

**Migration 077: Final validation**
```sql
-- Verify all new tables exist
SELECT COUNT(*) as log_count FROM sync_log_entries;
SELECT COUNT(*) as archived_count FROM sync_log_entries_archive;

-- Verify indexes
SELECT * FROM pg_stat_user_indexes
  WHERE relname LIKE 'sync_log_entries%';

-- Verify RLS policies
SELECT * FROM pg_policies
  WHERE tablename = 'sync_log_entries';
```

---

## Implementation Steps

1. **Create Migration 073**
   - Define sync_log_entries table with all fields
   - Include correlation_id, parent_span_id, span_id
   - Create base indexes

2. **Create Migration 074**
   - Add performance indexes (correlation_id, composite, date range)
   - Test index performance (correlation lookup <10ms)

3. **Create Migration 075**
   - Archive integration_log_entries → sync_log_entries_archive
   - Add archived_at timestamp

4. **Create Migration 076**
   - Enable RLS on sync_log_entries
   - Add tenant isolation policy
   - Add insert policy

5. **Create Migration 077**
   - Validation queries
   - Verify all constraints
   - Verify no data loss

6. **Test Migrations**
   - Run migrations locally
   - Verify data integrity
   - Test rollback (restore from backup)
   - Test query performance

---

## Validation & Testing

### Pre-Deployment Checks

```sql
-- Check table structure
\d sync_log_entries

-- Check indexes exist
SELECT * FROM pg_stat_user_indexes
  WHERE relname LIKE 'sync_log_entries%';

-- Check RLS policies
SELECT * FROM pg_policies
  WHERE tablename = 'sync_log_entries';

-- Count records
SELECT COUNT(*) FROM sync_log_entries;
SELECT COUNT(*) FROM sync_log_entries_archive;
```

### Performance Testing

```sql
-- Test correlation ID lookup (should be <10ms)
EXPLAIN ANALYZE
SELECT * FROM sync_log_entries
  WHERE correlation_id = 'trace-123'
  ORDER BY created_at DESC
  LIMIT 100;

-- Test composite index
EXPLAIN ANALYZE
SELECT * FROM sync_log_entries
  WHERE tenant_id = 'tenant-abc'::uuid
    AND correlation_id = 'trace-123'
  ORDER BY created_at DESC;
```

### RLS Testing

```sql
-- Verify tenant isolation (should return no rows for other tenant)
SET ROLE tenant_user_b;
SELECT COUNT(*) FROM sync_log_entries
  WHERE tenant_id = tenant_a_id; -- Should be 0
```

---

## File List

**Create:**
- [ ] `supabase/migrations/{timestamp}_create_sync_log_entries.sql` (Migration 073)
- [ ] `supabase/migrations/{timestamp}_add_sync_log_indexes.sql` (Migration 074)
- [ ] `supabase/migrations/{timestamp}_archive_old_logs.sql` (Migration 075)
- [ ] `supabase/migrations/{timestamp}_add_log_rls_policies.sql` (Migration 076)
- [ ] `supabase/migrations/{timestamp}_validate_migrations.sql` (Migration 077)
- [ ] `docs/migrations/MIGRATION-GUIDE.md` (manual execution guide)

---

## Validation Checklist

```bash
# Test locally
supabase migration list
supabase db push
supabase db status

# Query test
supabase sql "SELECT COUNT(*) FROM sync_log_entries"
```

Expected results:
- ✅ All migrations apply cleanly
- ✅ No data loss
- ✅ Correlation ID queries <10ms
- ✅ RLS policies enforced
- ✅ Rollback procedure tested

---

## Commit Message

```
chore: Add migrations 073-077 for logging consolidation

- Create unified sync_log_entries table with correlation_id
- Add indexes for performance (correlation_id, composite, date)
- Archive old integration_log_entries to archive table
- Add RLS policies for tenant isolation
- Include rollback procedures and validation queries

Removes logging fragmentation; enables end-to-end request tracing.
```

---

## References

- **Previous Story:** ESPAIDER-MODERNIZATION-007 (structured logger)
- **Next Story:** ESPAIDER-MODERNIZATION-009 (split mappers)
- **Technical Debt Assessment:** Section 8.3 (Migration plan)

---

**Story Status:** ✅ READY FOR ASSIGNMENT
**Assigned to:** @dev (Dex)
**Blocked by:** ESPAIDER-MODERNIZATION-007
**Blocks:** ESPAIDER-MODERNIZATION-009, 010, 011
