# Migration Deployment Guide — M026 + M027

**Date:** 2026-02-22
**Migrations:** 026 (audit function) + 027 (CRITICAL RLS fix)
**Priority:** 🔥 **URGENT** (M027 is CRITICAL security fix)

---

## 🚀 Quick Deployment

### Fastest Way (Vercel Auto-Deploy)
```bash
# Just push to main (already done!)
git push origin main

# Vercel will automatically apply migrations during next deploy
# Check Vercel dashboard for migration status
```

### Manual Deployment (Supabase CLI)

**Prerequisites:**
```bash
# 1. Install Supabase CLI
npm install -g supabase

# 2. Authenticate to Supabase
supabase link --project-ref YOUR_PROJECT_REF

# 3. Verify you're in the project directory
cd /path/to/tech-arauz
```

**Deploy Migrations:**
```bash
# Step 1: Apply Migration 026 (audit function - non-breaking)
supabase migration up 026

# Output should show:
# ✓ 026_create_rls_audit_function.sql

# Step 2: Apply Migration 027 (CRITICAL RLS fix)
supabase migration up 027

# Output should show:
# ✓ 027_remediate_rls_critical_gaps.sql
```

---

## 📋 Migration Details

### Migration 026: Create RLS Audit Function

**File:** `supabase/migrations/026_create_rls_audit_function.sql`
**Type:** Non-breaking (additive only)
**Rollback:** Simple (`DROP FUNCTION audit_rls_policy`)
**Time:** <1 second

**What it does:**
- Creates `audit_rls_policy(table_name)` function
- Creates `rls_audit_summary` view
- Enables comprehensive RLS auditing

**Commands:**
```bash
supabase migration up 026

# Verify:
psql $DATABASE_URL -c "SELECT * FROM public.audit_rls_policy('projects');"
```

---

### 🔥 Migration 027: Remediate RLS Critical Gaps (URGENT)

**File:** `supabase/migrations/027_remediate_rls_critical_gaps.sql`
**Type:** CRITICAL SECURITY FIX
**Rollback:** Complex (requires data migration reversal)
**Time:** ~5-10 seconds

**SECURITY ISSUE (Pre-M027):**
```
CRITICAL VULNERABILITY DETECTED:
  3 tables have cross-tenant data leakage:
  - project_histories: ANY user can query ALL tenants' data
  - project_approvers: ANY user can query ALL tenants' data
  - project_budgets: ANY user can query ALL tenants' data

  ROOT CAUSE: Missing tenant_id column + overly permissive RLS policies
  IMPACT: Data breach risk - authenticated users accessing confidential data
  SEVERITY: CRITICAL 🔥
```

**REMEDIATION (M027):**
- Adds `tenant_id` UUID column to 3 vulnerable tables
- Backfills existing data with Araúz tenant ID
- Implements tenant-aware RLS policies
- Enforces UNIQUE(tenant_id, espaider_id) constraints
- Creates indexes on tenant_id for performance

**Commands:**
```bash
# IMPORTANT: Backup first!
# Via Supabase Dashboard → Backups → Create backup

# Deploy migration
supabase migration up 027

# This will:
# 1. Add tenant_id column to 3 tables
# 2. Backfill with Araúz tenant ID
# 3. Add NOT NULL constraint
# 4. Add FK to tenants table
# 5. Create indexes
# 6. Drop old policies
# 7. Create fixed policies
# 8. Add documentation comments
```

**Post-Deployment Verification:**
```bash
# Run the comprehensive audit script
psql $DATABASE_URL < scripts/audit-rls-tables.sql

# Expected output:
# Tenant Isolation: 12/12 ✅ PASS
# RLS Enabled: 12/12 ✅ PASS
# Compliance: 100% ✅

# Also run this query:
psql $DATABASE_URL -c "
  SELECT table_name, rls_enabled, total_policies, tenant_isolation_found
  FROM public.audit_rls_policy('project_histories');
"

# Expected:
# | project_histories | true | 3 | true |
```

---

## 🔧 Deployment Options

### Option A: Vercel Auto-Deploy (RECOMMENDED)
- **Pros:** Automatic, no manual steps, integrated with CI/CD
- **Cons:** Slower, depends on Vercel build timing
- **Timeline:** 5-10 min (includes build + deploy + migrations)

**How:**
```bash
# Migrations already committed to main
git push origin main  # Already done!

# Vercel will apply them automatically on next deploy
# Check: Vercel Dashboard → Deployments → latest
```

### Option B: Supabase CLI (FASTEST)
- **Pros:** Instant, full control, immediate verification
- **Cons:** Manual steps, requires local Supabase CLI setup
- **Timeline:** <2 min

**How:**
```bash
cd /path/to/tech-arauz
supabase link --project-ref YOUR_PROJECT_REF
supabase migration up 026
supabase migration up 027

# Verify immediately:
psql $DATABASE_URL < scripts/audit-rls-tables.sql
```

### Option C: Supabase Dashboard (SLOWEST)
- **Pros:** No CLI required, visual interface
- **Cons:** Manual copy-paste, no automation
- **Timeline:** 5-10 min

**How:**
1. Go to: https://supabase.com/dashboard
2. Select project: tech-arauz
3. Navigate to: SQL Editor
4. Copy contents of `supabase/migrations/026_*.sql`
5. Click: Run
6. Repeat for `027_*.sql`
7. Verify with audit script

---

## ⚠️ CRITICAL Deployment Checklist

Before deploying M027, verify:

- [ ] Backup created (via Supabase Dashboard)
- [ ] Migrations committed to git (✅ already done)
- [ ] Read M027 file to understand changes
- [ ] Database connection verified
- [ ] Have rollback plan (restore from backup)
- [ ] Team notified of upcoming changes
- [ ] Deployment window scheduled (low-traffic time)

**Emergency Rollback Plan:**
1. If M026 fails: Simple rollback (`DROP FUNCTION audit_rls_policy`)
2. If M027 fails: Restore from Supabase backup
3. Contact @data-engineer or @architect for assistance

---

## 📊 Post-Deployment Verification

After both migrations applied, run:

```bash
# Test 1: Verify audit function exists
psql $DATABASE_URL -c "
  SELECT * FROM public.audit_rls_policy('projects')
  LIMIT 1;
"

# Should return: JSONB with audit results

# Test 2: Verify tenant_id columns added
psql $DATABASE_URL -c "
  SELECT table_name
  FROM information_schema.columns
  WHERE table_schema = 'public'
    AND table_name IN ('project_histories', 'project_approvers', 'project_budgets')
    AND column_name = 'tenant_id';
"

# Should return 3 rows

# Test 3: Full RLS compliance check
psql $DATABASE_URL < scripts/audit-rls-tables.sql

# Should show:
# RLS Enabled: 12/12 ✅
# Tenant Isolation: 12/12 ✅
# Compliance: 100% ✅

# Test 4: Verify data integrity
psql $DATABASE_URL -c "
  SELECT
    'project_histories' as table_name, COUNT(*) as row_count
  FROM project_histories
  UNION ALL
  SELECT 'project_approvers', COUNT(*)
  FROM project_approvers
  UNION ALL
  SELECT 'project_budgets', COUNT(*)
  FROM project_budgets;
"

# Should show row counts (no data loss)
```

---

## 🚨 Troubleshooting

### Issue: "Migration already applied"
**Cause:** Migration was already run
**Solution:** This is OK! No action needed. Verify compliance with audit script.

### Issue: "Column 'tenant_id' already exists"
**Cause:** M027 was partially run
**Solution:** Complete the migration or contact support

### Issue: "RLS policy constraint failed"
**Cause:** Data corruption or constraint violation
**Solution:** Restore from backup, contact @data-engineer

### Issue: "Service role cannot sync"
**Cause:** Policies too restrictive
**Solution:** Verify service role bypass is intact in M027

---

## ✅ Success Criteria

Deployment is **COMPLETE** when:

1. ✅ M026 applied successfully
2. ✅ M027 applied successfully
3. ✅ Audit script returns 12/12 PASS
4. ✅ No errors in Supabase logs
5. ✅ Service role can still sync Espaider data
6. ✅ User isolation enforced (can't query other tenant data)

---

## 📞 Support

**Questions?**
- See: `supabase/migrations/026_*.sql` (audit function code)
- See: `supabase/migrations/027_*.sql` (remediation code)
- See: `docs/audit/RLS-AUDIT-REPORT-2026-02-22.md` (audit findings)
- See: `scripts/audit-rls-tables.sql` (verification script)

**Emergency?**
- Contact: @data-engineer, @architect
- Backup location: Supabase Dashboard → Backups
- Rollback: Restore from backup

---

**Ready to deploy? Choose your option above and execute!** 🚀
