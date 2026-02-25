# RLS Policy Audit — Current State Analysis

**Date**: 2026-02-22
**Story**: S1-2 RLS Policy Framework
**Phase**: 1 (Current State Analysis)

---

## Executive Summary

Analysis of 11 core tables reveals **CRITICAL** multi-tenant isolation gaps:

| Table | RLS Enabled | Service Role Access | Tenant Isolation | Severity |
|-------|---|---|---|---|
| tenants | ✅ | ⚠️ Implicit | ✅ | PASS |
| profiles | ✅ | ⚠️ Implicit | ✅ | PASS |
| projects | ✅ | ⚠️ Implicit | ✅ | PASS |
| project_schedules | ✅ | ⚠️ Implicit | ✅ | PASS |
| project_deliveries | ✅ | ⚠️ Implicit | ✅ | PASS |
| project_requirements | ✅ | ⚠️ Implicit | ✅ | PASS |
| espaider_apis | ✅ | ⚠️ Implicit | ✅ | PASS |
| sync_logs | ✅ | ⚠️ Implicit | ✅ | PASS |
| integration_log_entries | ✅ | ✅ Explicit | ✅ | PASS |
| project_histories | ✅ | ✅ Explicit | ❌ MISSING | CRITICAL |
| project_approvers | ✅ | ✅ Explicit | ❌ MISSING | CRITICAL |
| project_budgets | ✅ | ✅ Explicit | ❌ MISSING | CRITICAL |

---

## Detailed Findings

### ✅ PASS — Core Tables (Tenants + Projects) with Proper Tenant Isolation

#### tenants
- **RLS**: ✅ Enabled (Migration 002)
- **Policies**:
  - SELECT: `id = get_user_tenant_id()` ✅
  - UPDATE: `id = get_user_tenant_id() AND get_user_role() = 'admin'` ✅
- **Service Role**: Implicit bypass (intended for system sync)
- **Finding**: ✅ PASS

#### profiles
- **RLS**: ✅ Enabled (Migration 002)
- **Policies**:
  - SELECT: `tenant_id = get_user_tenant_id()` ✅
  - INSERT: `tenant_id = get_user_tenant_id() AND get_user_role() = 'admin'` ✅
  - UPDATE: Multiple policies for admin/own profile ✅
- **Service Role**: Implicit bypass
- **Finding**: ✅ PASS

#### projects, project_schedules, project_deliveries, project_requirements
- **RLS**: ✅ Enabled (Migration 002)
- **Policies**: Consistent pattern:
  - SELECT: `tenant_id = get_user_tenant_id()` ✅
  - INSERT: `tenant_id = get_user_tenant_id() AND get_user_role() IN ('admin', 'user')` ✅
  - UPDATE: `tenant_id = get_user_tenant_id() AND ...` ✅
  - DELETE: `tenant_id = get_user_tenant_id() AND get_user_role() = 'admin'` ✅
- **Service Role**: Implicit bypass
- **Finding**: ✅ PASS

#### espaider_apis
- **RLS**: ✅ Enabled (Migration 004 + 007)
- **Policies**: (Fixed in 007)
  - SELECT: `tenant_id = get_user_tenant_id()` ✅
  - INSERT/UPDATE/DELETE: `tenant_id = get_user_tenant_id() AND get_user_role() = 'admin'` ✅
- **Service Role**: Implicit bypass
- **Finding**: ✅ PASS

#### sync_logs
- **RLS**: ✅ Enabled (Migration 002 + 025)
- **Policies**: (Latest from 025)
  - SELECT: `tenant_id = get_user_tenant_id()` ✅
  - ALL (service_role): `TRUE` / `TRUE` ✅
- **Service Role**: Explicit `sync_logs_service_all` policy ✅
- **Finding**: ✅ PASS

#### integration_log_entries
- **RLS**: ✅ Enabled (Migration 006)
- **Policies**: (Latest from 025)
  - SELECT: `tenant_id = get_user_tenant_id()` ✅
  - ALL (service_role): `TRUE` / `TRUE` ✅
- **Service Role**: Explicit `integration_logs_service_all` policy ✅
- **Finding**: ✅ PASS

---

### 🔴 CRITICAL — Child Tables Missing Tenant Isolation

#### project_histories
- **RLS**: ✅ Enabled (Migration 013)
- **Policies** (Migration 013 + 021):
  - **SELECT (authenticated)**: `USING (true)` ❌ **NO TENANT ISOLATION**
  - **ALL (service_role)**: `USING (true) WITH CHECK (true)` ✅
- **Issue**: Authenticated users can see **ANY tenant's histories**, not just their own
- **Root Cause**: Migration 013 created overly permissive policies
- **Finding**: 🔴 **CRITICAL** — Must add `UNIQUE(tenant_id, espaider_id)` and fix SELECT policy

#### project_approvers
- **RLS**: ✅ Enabled (Migration 013)
- **Policies** (Migration 013 + 021):
  - **SELECT (authenticated)**: `USING (true)` ❌ **NO TENANT ISOLATION**
  - **ALL (service_role)**: `USING (true) WITH CHECK (true)` ✅
- **Issue**: Same as project_histories — cross-tenant data leak
- **Finding**: 🔴 **CRITICAL** — Must add tenant isolation

#### project_budgets
- **RLS**: ✅ Enabled (Migration 013)
- **Policies** (Migration 013 + 021):
  - **SELECT (authenticated)**: `USING (true)` ❌ **NO TENANT ISOLATION**
  - **ALL (service_role)**: `USING (true) WITH CHECK (true)` ✅
- **Issue**: Same as above — cross-tenant data leak
- **Finding**: 🔴 **CRITICAL** — Must add tenant isolation

---

## Remediation Plan

### PHASE 2: Audit Function
Create `audit_rls_policy(table_name TEXT)` function that returns:
- RLS enabled status
- Policy count
- Each policy details (SELECT, INSERT, UPDATE, DELETE)
- Service role access (explicit vs implicit)
- Tenant isolation status

### PHASE 3: Audit All Tables
Execute audit against all 11 tables to validate findings.

### PHASE 4: Report
Document all findings in RLS-AUDIT-REPORT.md with:
- Table-by-table status
- Multi-tenant isolation test results
- Vulnerability assessment

### PHASE 5: Remediation
Create Migration 026 that:
1. Adds `tenant_id` to project_histories, project_approvers, project_budgets (if missing)
2. Adds `UNIQUE(tenant_id, espaider_id)` constraints
3. Fixes SELECT policies to include `tenant_id = get_user_tenant_id()`
4. Re-validates all policies follow pattern:
   ```sql
   FOR SELECT: USING (tenant_id = get_user_tenant_id())
   FOR ALL (service_role): USING (TRUE) WITH CHECK (TRUE)
   ```

### PHASE 6: Commit
```bash
git add supabase/migrations/024_create_rls_audit_function.sql
git add supabase/migrations/026_remediate_rls_critical_gaps.sql
git add docs/audit/
git commit -m "feat: add RLS policy audit framework and comprehensive report [S1-2]"
```

---

## Schema Inconsistencies Found

### project_histories, project_approvers, project_budgets
**Issue**: Migration 013 created these with:
- Primary key = `id BIGINT` (Espaider ID)
- NO `tenant_id` column ❌
- NO `UNIQUE(tenant_id, espaider_id)` constraint ❌

**This breaks RLS because**:
1. Can't filter by tenant in WHERE clause
2. Can't guarantee multi-tenant isolation
3. Service role can see/modify any tenant's records

**Solution**:
- Add `tenant_id UUID NOT NULL` column
- Add `UNIQUE(tenant_id, espaider_id)` constraint
- Update sync functions to include tenant_id
- Backfill existing data with tenant_id (Araúz: '00000000-0000-0000-0000-000000000001')

---

## Standards Verified

All policies should follow this pattern:

### Pattern A: Tenant-Isolated (Projects, Deliveries, etc.)
```sql
-- SELECT: Any user in tenant
CREATE POLICY "table_select"
    ON public.table_name FOR SELECT
    USING (tenant_id = public.get_user_tenant_id());

-- INSERT: Admin/User only
CREATE POLICY "table_insert"
    ON public.table_name FOR INSERT
    WITH CHECK (
        tenant_id = public.get_user_tenant_id()
        AND public.get_user_role() IN ('admin', 'user')
    );

-- UPDATE: Admin/User only
CREATE POLICY "table_update"
    ON public.table_name FOR UPDATE
    USING (
        tenant_id = public.get_user_tenant_id()
        AND public.get_user_role() IN ('admin', 'user')
    );

-- DELETE: Admin only
CREATE POLICY "table_delete"
    ON public.table_name FOR DELETE
    USING (
        tenant_id = public.get_user_tenant_id()
        AND public.get_user_role() = 'admin'
    );
```

### Pattern B: Service Role Unrestricted (Sync Operations)
```sql
-- For sync/API operations
CREATE POLICY "table_service_role"
    ON public.table_name FOR ALL
    TO service_role
    USING (TRUE)
    WITH CHECK (TRUE);
```

---

## Next Steps

1. **PHASE 2**: Create `audit_rls_policy()` function
2. **PHASE 3**: Execute audit on all 11 tables
3. **PHASE 4**: Generate comprehensive audit report
4. **PHASE 5**: Apply remediation migration
5. **PHASE 6**: Commit all changes

---

## Testing Checklist (for later phases)

- [ ] Service role can sync all 11 tables without RLS errors
- [ ] User A (tenant_arauz) cannot see projects from tenant_other
- [ ] RLS blocks cross-tenant selects at database level
- [ ] Authenticated users see only their tenant's data
- [ ] Admin users can't bypass tenant isolation
- [ ] Integration tests for multi-tenant scenarios
