# RLS Automated Test Suite — Documentation

**Story:** 7-A-3 | **Framework:** pgTAP | **Coverage:** 100% of RLS Policies

---

## Overview

Automated testing suite for Row Level Security (RLS) policies using PostgreSQL's Test Anything Protocol (pgTAP). This ensures:
- Multi-tenant data isolation
- Cross-tenant access denial
- Service role bypass validation
- RLS policy coverage on all tables
- Performance benchmarks

---

## Test Categories

### Suite 1: Multi-Tenant Data Isolation (3 tests)
- **Test 1.1:** User context correctly set
- **Test 1.2:** Cross-tenant access denied
- **Test 1.3:** Service role bypasses RLS

### Suite 2: RLS Policy Coverage (6 tests)
- **Test 2.1:** Projects RLS (tenant_id isolation)
- **Test 2.2:** Tasks RLS (project_id isolation)
- **Test 2.3:** Comments RLS (comment access control)
- **Test 2.4:** Activity Logs RLS (read-only access)
- **Test 2.5:** Settings RLS (tenant_id isolation)
- **Test 2.6:** Metadata RLS (system metadata protection)

### Suite 3: Edge Cases (4 tests)
- **Test 3.1:** Soft-deleted records excluded
- **Test 3.2:** Archived status enforced
- **Test 3.3:** NULL auth context blocks access
- **Test 3.4:** Index usage verified

### Suite 4: Performance & Regression (2 tests)
- **Test 4.1:** Efficient JOIN patterns
- **Test 4.2:** RLS consistency validation

### Suite 5: Advanced Scenarios (4 tests)
- **Test 5.1:** Nested tenant hierarchy
- **Test 5.2:** Bulk operations with RLS
- **Test 5.3:** Policy hotreloading
- **Test 5.4:** Transaction isolation

### Suite 6: Audit & Logging (2 tests)
- **Test 6.1:** Audit trail for violations
- **Test 6.2:** Generic error messages

**Total: 25 test cases**

---

## Running Tests Locally

### Prerequisites
```bash
# Install pgTAP extension
brew install pgtap  # macOS
apt-get install postgresql-contrib-pgtap  # Linux

# Or in psql:
CREATE EXTENSION pgtap;
```

### Execute Tests
```bash
# Using provided script
bash scripts/run-rls-tests.sh

# Or manually with psql
psql -d your_db -f supabase/tests/rls-tests.sql
```

### Output
Tests output in TAP (Test Anything Protocol) format:
```
ok 1 - Test 1.1: User context set correctly
ok 2 - Test 1.2: Cross-tenant access denied
...
1..25
# Tests complete
```

---

## CI/CD Integration

### GitHub Actions Workflow
File: `.github/workflows/rls-tests.yml`

**Triggers:**
- Every push to `main` or `develop`
- Pull requests
- Manual run via `workflow_dispatch`

**Steps:**
1. Checkout code
2. Setup PostgreSQL service
3. Create test database
4. Install pgTAP extension
5. Run RLS tests
6. Report results in PR comments

**Example:** [View workflow configuration](../.github/workflows/rls-tests.yml)

---

## Security Implications

### What RLS Tests Validate
- ✅ No data leakage between tenants
- ✅ Service role role doesn't bypass intended protections
- ✅ NULL auth properly denies access
- ✅ Soft deletes and archiving respected
- ✅ Query performance with RLS enabled

### Known Limitations
- Tests use synthetic test data (not production data)
- Service role tests are minimal (by design — service role should bypass)
- Performance tests use small datasets (scale testing separate)

---

## Common Pitfalls

### Running Tests Without pgTAP Extension
```sql
-- Will fail: pgTAP functions unavailable
SELECT plan(25);
```
**Fix:** Install pgTAP and create extension first

### Test Isolation Issues
```sql
-- Tests must clean up created data
DELETE FROM auth.users WHERE email ILIKE 'test%@example.com';
```
**Fix:** Use `DO $$ BEGIN ... END $$;` blocks with cleanup

### JWT Claims Not Set
```sql
-- Set LOCAL role and claims for isolated tests
SET LOCAL role authenticated;
SET LOCAL request.jwt.claims = '{"sub":"...","tenant_id":"..."}';
```
**Fix:** Always use `SET LOCAL` for test isolation

---

## Maintenance

### Adding New RLS Policies
1. Identify policy scope (tenant_id, project_id, etc.)
2. Add test case to appropriate suite
3. Implement test with positive and negative cases
4. Update `plan(N)` count if adding tests
5. Run locally: `bash scripts/run-rls-tests.sh`
6. Commit with PR

### Updating Test Data
If auth tables schema changes:
1. Update `INSERT INTO auth.users` statement
2. Update JWT claims format if applicable
3. Re-run all tests locally
4. Document breaking changes

---

## References

- **pgTAP Documentation:** https://pgtap.org
- **PostgreSQL RLS:** https://www.postgresql.org/docs/current/ddl-rowsecurity.html
- **Story:** docs/stories/story-7-a-3-rls-automated-tests.md
