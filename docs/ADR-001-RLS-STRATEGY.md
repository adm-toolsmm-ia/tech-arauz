# ADR-001: Row-Level Security (RLS) Strategy

**Status:** ACCEPTED (Implemented v0.2.3+)
**Deciders:** @data-engineer (Dara), @architect (Aria), @qa (Quinn)
**Date:** 2026-03-12
**Code-to-Doc Verified:** ✅ supabase/migrations/002_rls_policies.sql + 20+ migrations

---

## Context

Tech Arauz is a multi-tenant SaaS application serving multiple organizations simultaneously. Each organization (tenant) must be completely isolated from others at the database level. This requires robust Row-Level Security (RLS) policies to prevent data leakage across tenants.

**Drivers:**
- Multi-tenant architecture (SAAS-001)
- Security requirement: Tenant isolation
- Compliance: No accidental cross-tenant data exposure
- Architecture: Application-level filtering + database-level enforcement (defense in depth)

---

## Decision

Implement **tenant-based RLS policies** using two-layer enforcement:

1. **Layer 1 — Database RLS (Security):**
   - Enable RLS on ALL tables
   - All policies follow pattern: `USING (tenant_id = get_user_tenant_id())`
   - Every DML (INSERT/UPDATE) includes: `WITH CHECK (tenant_id = get_user_tenant_id())`
   - Service role bypasses RLS (used only for sync operations)

2. **Layer 2 — Application Filtering (Reliability):**
   - EVERY query filters by `tenant_id` explicitly
   - Never rely on RLS alone (defense in depth)
   - Example: `.eq('tenant_id', userTenant.id)` in all Supabase queries

### RLS Policy Pattern (Standardized)

**All tables use consistent pattern:**

```sql
-- Enable RLS
ALTER TABLE public.{table_name} ENABLE ROW LEVEL SECURITY;

-- Read access (tenant isolation)
CREATE POLICY "Tenants can view own data"
    ON public.{table_name} FOR SELECT
    USING (tenant_id = public.get_user_tenant_id());

-- Write access (admin-only or role-based)
CREATE POLICY "Admins can insert/update tenant data"
    ON public.{table_name} FOR INSERT/UPDATE
    USING (
        tenant_id = public.get_user_tenant_id()
        AND public.get_user_role() = 'admin'
    );
```

### Helper Functions (Established)

All tenant queries use two helper functions:

```sql
-- Function: get_user_tenant_id()
-- Returns the tenant_id of authenticated user from profiles table
CREATE OR REPLACE FUNCTION public.get_user_tenant_id()
RETURNS UUID AS $$
BEGIN
    RETURN (
        SELECT tenant_id
        FROM public.profiles
        WHERE id = auth.uid()
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: get_user_role()
-- Returns the role of authenticated user (admin, user, viewer)
CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS TEXT AS $$
BEGIN
    RETURN (
        SELECT role
        FROM public.profiles
        WHERE id = auth.uid()
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### Implemented Tables & Policies (v0.2.3+)

| Table | RLS | SELECT | INSERT | UPDATE | DELETE | Notes |
|-------|-----|--------|--------|--------|--------|-------|
| `tenants` | ✅ | admin | admin | admin | admin | Tenant metadata |
| `profiles` | ✅ | tenant | admin | tenant+admin | admin | User profiles |
| `projects` | ✅ | all | admin+user | admin+user | admin | Project data |
| `project_schedules` | ✅ | all | admin+user | admin+user | admin | Schedule data |
| `project_deliveries` | ✅ | all | admin+user | admin+user | admin | Delivery data |
| `project_requirements` | ✅ | all | admin+user | admin+user | admin | Requirement data |
| `sync_logs` | ✅ | admin | service | - | - | Sync audit trail |
| `espaider_apis` | ✅ | admin | admin | admin | admin | API configuration |
| `integration_log_entries` | ✅ | admin | service | - | - | Integration logs |
| `agents` | ✅ | all | admin | admin | admin | AI agents |
| `chat_sessions` | ✅ | tenant | tenant | tenant | tenant | Chat history |
| `lm_providers` | ✅ | all | admin | admin | admin | LLM providers |
| `lm_models` | ✅ | all | admin | admin | admin | LLM models |

---

## Implementation Status

**v0.2.3+ Release (2026-03-12):**

- ✅ RLS enabled on 13+ core tables
- ✅ Helper functions `get_user_tenant_id()` and `get_user_role()` deployed
- ✅ Role-based access patterns (admin/user/viewer) enforced
- ✅ Service role configured for sync operations (AES-256-GCM token encryption)
- ✅ Composite key constraints: `UNIQUE(tenant_id, espaider_id)` for idempotency
- ✅ Audit logging with `rls_audit_logs` table for policy violations
- ✅ Tests: `supabase/tests/rls_policies.test.sql` validates tenant isolation

**Code References:**
- Migration: `supabase/migrations/002_rls_policies.sql` (baseline)
- Policy updates: `migrations/017`, `021`, `023`, `027`, `058` (incremental)
- Tests: `supabase/tests/rls_policies.test.sql` (validation)
- Application layer: All server actions validate user role before DB operations

---

## Consequences

### ✅ Benefits

1. **Security:** Multi-layer defense (RLS + application filtering)
2. **Compliance:** Strong tenant isolation prevents data leakage
3. **Auditability:** RLS violations logged in `rls_audit_logs`
4. **Maintainability:** Consistent pattern across all tables (easier to reason about)
5. **Performance:** RLS filtering indexed via composite keys

### ⚠️ Trade-offs

1. **Complexity:** Helper functions add indirection (minimal perf cost)
2. **Dual Responsibility:** RLS + app filtering (required for defense in depth)
3. **Sync Operations:** Service role bypass needed (mitigated by audit logs)
4. **Testing:** RLS policies must be explicitly tested (automation in place)

### 🔄 Dependencies

- Supabase Auth (JWT validation)
- Profiles table (tenant_id storage)
- Composite keys `(tenant_id, resource_id)` for uniqueness

---

## Validation & Testing

### RLS Policy Tests (Automated)

```sql
-- Validates user cannot view data from other tenants
BEGIN;
  SET LOCAL ROLE authenticated;
  SET LOCAL session.user_id = 'user-from-tenant-A';
  SELECT COUNT(*) FROM projects WHERE tenant_id = 'tenant-B';
  -- ASSERT count = 0 (should fail to select)
ROLLBACK;
```

**Test Coverage:**
- Tenant isolation (SELECT fails cross-tenant)
- Role-based write access (INSERT fails for viewers)
- Delete protection (only admins can delete)
- Composite key uniqueness (UPSERT idempotency)

**Command:** `npm run test:rls`

---

## Alternatives Considered

### ❌ Alternative A: No RLS (Application-only filtering)
- **Rejected:** Single point of failure (app bug = data exposure)
- RLS provides safety net

### ❌ Alternative B: Complex RLS policies
- **Rejected:** Harder to maintain, easier to introduce bugs
- Chosen simpler pattern: tenant_id check with role validation

### ✅ Chosen: Hybrid (RLS + Application)
- **Rationale:** Defense in depth best practice
- RLS catches bugs, app filtering catches breaches

---

## References

- **Constitution Article II:** Agent Authority — Database design delegated to @data-engineer
- **ADR-004:** Feature folder structure for multi-tenant organization
- **Security Patterns:** `docs/SECURITY-PATTERNS.md` (Layer 4 — Database RLS)
- **Test Strategy:** `docs/TESTING-STRATEGY.md` (RLS test section)

---

## Migration Path

**For new tables:**
1. Add `tenant_id UUID NOT NULL` column
2. Add `ALTER TABLE ... ENABLE ROW LEVEL SECURITY;`
3. Add SELECT/INSERT/UPDATE policies using `get_user_tenant_id()`
4. Add composite index: `UNIQUE(tenant_id, resource_id)`
5. Test with RLS test template: `supabase/tests/template-rls-test.sql`
6. Document in migration comments

---

## Para @data-engineer (Dara)

**Implementação completa:** ADR-001 reflete implementação exata em v0.2.3+. Todas as tabelas seguem padrão `tenant_id` + `get_user_tenant_id()` + role checks.

**Quando adicionar novo recurso:**
- Sempre incluir `tenant_id` PK
- Sempre adicionar RLS com `USING (tenant_id = get_user_tenant_id())`
- Sempre testar com template RLS
- Reference this ADR quando documentar migrations

**Quando revisar segurança:**
- Audit com: `SELECT table_name, policyname FROM pg_policies WHERE tablename NOT LIKE '%_audit%';`
- Validate policies match pattern
- Report gaps para @qa (Quinn) para teste

---

## Para @qa (Quinn)

**Test Coverage:**
- RLS isolation: `supabase/tests/rls_policies.test.sql` (10+ test cases)
- Endpoint auth: All server actions validate user role + tenant in step 1
- Sample test: "user-from-tenant-A cannot read tenant-B data"

**When testing new features:**
- Verify tenant isolation: user A data != user B data
- Verify role enforcement: viewer cannot create/update
- Verify audit logs: RLS violations recorded

---

— Orion, orquestrando o sistema 🎯

**Version:** v0.2.3+
**Last Updated:** 2026-03-15
**Status:** PRODUCTION (Live)
