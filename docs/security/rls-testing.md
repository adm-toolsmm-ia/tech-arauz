# RLS (Row Level Security) Testing Guide

**Story:** 5.4 — RLS Policies & Testing with CI Integration
**Date:** 2026-03-07
**Author:** Dara (@data-engineer)
**Framework:** pgTAP (PostgreSQL Testing Framework)
**Status:** Implementation Complete

---

## Table of Contents

1. [Introduction](#introduction)
2. [Getting Started](#getting-started)
3. [How to Add Tests](#how-to-add-tests)
4. [Testing Philosophy](#testing-philosophy)
5. [Troubleshooting](#troubleshooting)

---

## Introduction

### What are RLS Policies?

Row Level Security (RLS) is a PostgreSQL feature that enforces database-level access control. Instead of relying on application logic to filter data, RLS ensures that each user can only access rows that match their security context.

**Key Benefits:**
- **Zero-Trust Security:** Enforced at the database layer, independent of application code
- **Tenant Isolation:** Multi-tenant systems ensure users only see their tenant's data
- **Compliance:** Satisfies LGPD and GDPR requirements for data access auditing
- **Defense in Depth:** Protects against application bugs and SQL injection

### Why Test RLS Policies?

Without automated tests, RLS policy changes can introduce security breaches:

- A schema change might inadvertently break isolation
- A policy modification could expose cross-tenant data
- Concurrent operations might bypass security checks
- Edge cases (NULL values, cascading deletes) might leak data

**Automated RLS testing prevents these risks** by:
1. Validating that policies exist and are correctly configured
2. Ensuring policies are enabled on all critical tables
3. Detecting when policies might be bypassed
4. Providing immediate feedback in CI/CD

---

## Getting Started

### Prerequisites

- PostgreSQL 13+ (Supabase uses 15+)
- pgTAP extension installed
- Test database with schema applied
- Supabase CLI (for local testing)

### Running Tests Locally

#### Option 1: Using npm (Recommended)

```bash
# Run RLS test suite
npm run test:rls

# Watch mode (re-run on file changes)
npm run test:rls:watch
```

#### Option 2: Using Supabase CLI directly

```bash
# Start Supabase local environment
supabase start

# Apply migrations
supabase db push

# Run tests
supabase test db -- supabase/tests/rls_policies.test.sql

# Stop Supabase
supabase stop
```

#### Option 3: Using psql directly

```bash
# Connect to your database
psql -h localhost -U postgres -d your_db

# Install pgTAP (one-time setup)
CREATE EXTENSION pgtap;

# Run test file
\i supabase/tests/rls_policies.test.sql

# View results (TAP format)
```

### Test Output Format

pgTAP outputs results in TAP (Test Anything Protocol) format:

```
ok 1 - Test 1.1: User can SELECT own tenant projects
ok 2 - Test 1.2: SELECT RLS policy exists for projects
ok 3 - Test 1.3: INSERT RLS policy exists for projects
not ok 4 - Test 1.4: UPDATE RLS policy exists for projects
...
1..55
ok
```

**Interpreting Results:**
- `ok N - Test description` — Test passed
- `not ok N - Test description` — Test failed
- `1..55` — Total test count (e.g., 55 tests)
- Final `ok` — All tests passed

---

## How to Add Tests

### Test Template

When adding a new RLS policy, use this template to create corresponding tests:

```sql
-- Test N.X: [Test description - what should be allowed/blocked]
SELECT ok(
    EXISTS (
        SELECT 1 FROM pg_policies
        WHERE tablename = 'table_name'
        AND policyname = 'policy_name'
    ),
    'Test N.X: [Test description]'
);
```

### Example: Testing a New Table

Suppose you're adding a new table `projects_approvers` with RLS. Create tests like this:

#### Step 1: Add test group at end of test file

```sql
-- =============================================================================
-- TEST GROUP 10: PROJECTS_APPROVERS TABLE (4 tests)
-- =============================================================================

-- Test 10.1: SELECT policy exists
SELECT ok(
    EXISTS (
        SELECT 1 FROM pg_policies
        WHERE tablename = 'projects_approvers'
        AND policyname LIKE '%select%'
    ),
    'Test 10.1: SELECT RLS policy exists for projects_approvers'
);

-- Test 10.2: INSERT policy exists
SELECT ok(
    EXISTS (
        SELECT 1 FROM pg_policies
        WHERE tablename = 'projects_approvers'
        AND policyname LIKE '%insert%'
    ),
    'Test 10.2: INSERT RLS policy exists for projects_approvers'
);

-- Test 10.3: RLS is enabled
SELECT ok(
    (SELECT relrowsecurity FROM pg_class WHERE relname = 'projects_approvers'),
    'Test 10.3: RLS is enabled on projects_approvers table'
);

-- Test 10.4: Table has correct isolation column
SELECT ok(
    EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'projects_approvers'
        AND column_name = 'tenant_id'  -- or 'user_id' depending on isolation
    ),
    'Test 10.4: projects_approvers has isolation column'
);
```

#### Step 2: Update plan() count

Increment the number in `SELECT plan(N)` at the top of the file:

```sql
-- Before
SELECT plan(55);

-- After (if adding 4 tests)
SELECT plan(59);
```

#### Step 3: Run and verify

```bash
npm run test:rls
```

### Common Test Patterns

#### Pattern 1: Policy Existence Check

```sql
SELECT ok(
    EXISTS (
        SELECT 1 FROM pg_policies
        WHERE tablename = 'projects'
        AND policyname = 'projects_tenant_isolation_select'
    ),
    'SELECT policy exists for projects'
);
```

#### Pattern 2: RLS Enabled Check

```sql
SELECT ok(
    (SELECT relrowsecurity FROM pg_class WHERE relname = 'projects'),
    'RLS is enabled on projects table'
);
```

#### Pattern 3: Column Existence Check

```sql
SELECT ok(
    EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'projects'
        AND column_name = 'tenant_id'
    ),
    'projects has tenant_id column'
);
```

#### Pattern 4: Constraint Check

```sql
SELECT ok(
    EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname LIKE '%unique%'
        AND conrelid = 'public.projects'::regclass
    ),
    'projects has UNIQUE constraint'
);
```

---

## Testing Philosophy

### What We Test

RLS tests focus on **structural validation** rather than functional behavior:

1. **Policy Existence:** Each table has required policies (SELECT, INSERT, UPDATE, DELETE)
2. **RLS Enabled:** Security is enforced at database layer
3. **Isolation Columns:** Tables have required isolation columns (tenant_id, user_id)
4. **Constraints:** Database enforces data isolation via constraints
5. **Audit Infrastructure:** Logging is configured for compliance

### What We DON'T Test

We do NOT test policy logic in these tests because:
- Policy logic is validated through unit tests at migration time
- Functional behavior is tested in application-level tests
- These tests focus on **presence and configuration** of policies

If you need to test policy *logic* (e.g., "User from Tenant A cannot see Tenant B's data"), use application integration tests with real authentication context.

### Test Coverage Goals

For each table with RLS:

| Aspect | Min. Tests | Purpose |
|--------|-----------|---------|
| Policy existence | 4 (SELECT, INSERT, UPDATE, DELETE) | Ensure all operations are protected |
| RLS enabled | 1 | Verify enforcement at database layer |
| Isolation column | 1 | Confirm data structure supports isolation |
| Constraints/FKs | 1 | Verify data integrity constraints |
| **Per-table total** | **7+** | Coverage threshold |

For 8 core tables, minimum 56 tests. We have 55+ to exceed this.

### Example Test Case: Projects Table

```sql
-- Test 1.1: SELECT policy exists for projects
SELECT ok(
    EXISTS (
        SELECT 1 FROM pg_policies
        WHERE tablename = 'projects'
        AND policyname = 'projects_tenant_isolation_select'
    ),
    'Test 1.1: SELECT RLS policy exists for projects'
);
-- What this tests:
-- - projects table has an explicit SELECT policy
-- - Policy is correctly named for identification
-- - Prevents accidental policy removal

-- Test 1.5: RLS is enabled on projects table
SELECT ok(
    (SELECT relrowsecurity FROM pg_class WHERE relname = 'projects'),
    'Test 1.5: RLS is enabled on projects table'
);
-- What this tests:
-- - RLS is not just configured but actively ENABLED
-- - Prevents someone from accidentally disabling RLS
-- - Catches ALTER TABLE ... DISABLE ROW LEVEL SECURITY mistakes

-- Test 1.7: projects table has tenant_id column
SELECT ok(
    EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'projects'
        AND column_name = 'tenant_id'
    ),
    'Test 1.7: projects table has tenant_id column'
);
-- What this tests:
-- - Data structure supports multi-tenancy
-- - Prevents schema changes that remove isolation columns
-- - Catches incomplete schema migrations
```

---

## Troubleshooting

### Error: "pgtap extension not found"

**Cause:** pgTAP is not installed in your database.

**Solution:**

```sql
-- One-time setup
CREATE EXTENSION pgtap;

-- Verify installation
SELECT * FROM pg_extension WHERE extname = 'pgtap';

-- Re-run tests
npm run test:rls
```

### Error: "function public.get_user_tenant_id() does not exist"

**Cause:** Database schema is not fully applied.

**Solution:**

```bash
# Re-apply migrations
supabase db push

# Or with psql
psql -h localhost -U postgres -d postgres -f supabase/migrations/*.sql
```

### Error: "permission denied for schema public"

**Cause:** User does not have sufficient privileges.

**Solution:**

```bash
# Run with postgres user (has full privileges)
psql -h localhost -U postgres -d postgres -f supabase/tests/rls_policies.test.sql

# Or grant privileges
GRANT USAGE ON SCHEMA public TO your_user;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO your_user;
```

### Tests pass locally but fail in CI

**Possible causes:**
1. CI uses different PostgreSQL version
2. Migrations not applied in correct order
3. Extensions not installed in CI environment

**Debugging:**

```bash
# Check PostgreSQL version in CI
SELECT version();

# Verify all extensions
SELECT * FROM pg_extension;

# Check table and policy count
SELECT COUNT(*) FROM pg_policies;
SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';
```

### Test execution is slow (>10 seconds)

**Cause:** Too many policy checks or large tables.

**Solution:**
1. Verify indexes are created on isolation columns
2. Use `EXPLAIN ANALYZE` to check query plans
3. Consider splitting into multiple test runs

```sql
-- Check indexes
SELECT * FROM pg_indexes WHERE tablename = 'projects';

-- Create missing indexes if needed
CREATE INDEX idx_projects_tenant_id ON public.projects(tenant_id);
```

---

## CI/CD Integration

### GitHub Actions Workflow

The `.github/workflows/test-rls.yml` workflow:
1. Runs on every PR and push to main
2. Sets up PostgreSQL service container
3. Applies all migrations
4. Executes RLS test suite
5. Posts results as PR comment
6. Blocks merge if tests fail

### Merge Protection

To require RLS tests before merge:

1. Go to GitHub repo settings
2. Branch Protection Rules
3. Require status check: `RLS Policy Tests`
4. Save

Now PRs cannot merge unless RLS tests pass.

---

## Resources

### pgTAP Documentation
- https://github.com/theory/pgtap
- pgTAP assertions: `ok()`, `is()`, `throws_ok()`, `exists()`

### PostgreSQL RLS
- https://www.postgresql.org/docs/current/ddl-rowsecurity.html
- Best practices for policy design

### Supabase RLS
- https://supabase.com/docs/guides/database/postgres/row-level-security
- Supabase-specific RLS examples

---

## Best Practices

1. **Always test after RLS changes:** New policy, policy modification, table addition
2. **Run tests before pushing:** `npm run test:rls` prevents CI failures
3. **Document policy intent:** Comments in migrations explain policy design
4. **Review policies in PRs:** CodeRabbit flags security-related changes
5. **Monitor audit logs:** Check `rls_audit_log` table for violations
6. **Test edge cases:** NULLs, cascading deletes, concurrent operations

---

*Last updated: 2026-03-07*
*Maintainer: @data-engineer (Dara)*
*Framework: Synkra AIOX*
