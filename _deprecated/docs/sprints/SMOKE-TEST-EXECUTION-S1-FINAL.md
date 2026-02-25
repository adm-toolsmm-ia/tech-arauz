# Smoke Test Execution — Sprint 1 Final

**Date:** 2026-02-22
**Status:** In Progress
**Objective:** Validate M026 + M027 + UI improvements before closing Sprint 1

---

## ✅ Part 1: Database Validation (SQL Tests)

**File:** `test-smoke-m026-m027.sql`

### Instructions:
1. Open Supabase Dashboard → SQL Editor
2. Copy queries from `test-smoke-m026-m027.sql`
3. Execute each query and document results below

### Query Results:

#### 📋 Query 1: RLS Audit Summary
```sql
SELECT * FROM public.rls_audit_summary;
```

**Expected Result:**
- 12 tables listed
- `tenants` and `profiles`: ✅ PASS (no tenant_id check)
- `project_histories`: ✅ PASS
- `project_approvers`: ✅ PASS
- `project_budgets`: ✅ PASS
- All other tables: ✅ PASS
- **Status:** [ ] PASS [ ] FAIL

**Result:**
```
[Paste query result here]
```

---

#### 📋 Query 2: Audit project_histories
```sql
SELECT * FROM public.audit_rls_policy('project_histories');
```

**Expected Result:**
- `rls_enabled: true`
- `total_policies: 2+`
- `tenant_isolation_found: true`
- `has_tenant_id_column: true`
- **Status:** [ ] PASS [ ] FAIL

**Result:**
```
[Paste query result here]
```

---

#### 📋 Query 3: Audit project_approvers
```sql
SELECT * FROM public.audit_rls_policy('project_approvers');
```

**Expected Result:** Same as Query 2
- **Status:** [ ] PASS [ ] FAIL

**Result:**
```
[Paste query result here]
```

---

#### 📋 Query 4: Audit project_budgets
```sql
SELECT * FROM public.audit_rls_policy('project_budgets');
```

**Expected Result:** Same as Query 2
- **Status:** [ ] PASS [ ] FAIL

**Result:**
```
[Paste query result here]
```

---

#### 📋 Query 5: Verify tenant_id columns
```sql
SELECT table_name, column_name
FROM information_schema.columns
WHERE table_name IN ('project_histories', 'project_approvers', 'project_budgets')
  AND column_name = 'tenant_id'
ORDER BY table_name;
```

**Expected Result:**
- 3 rows (one per table)
- Each showing `tenant_id` column

**Status:** [ ] PASS [ ] FAIL

**Result:**
```
[Paste query result here]
```

---

#### 📋 Query 6: Verify RLS policies
```sql
SELECT tablename, policyname, cmd
FROM pg_policies
WHERE tablename IN ('project_histories', 'project_approvers', 'project_budgets')
ORDER BY tablename, policyname;
```

**Expected Result:**
- Multiple policies per table (SELECT, INSERT, UPDATE, etc.)
- All containing tenant_id checks in `qual`

**Status:** [ ] PASS [ ] FAIL

**Result:**
```
[Paste query result here]
```

---

#### 📋 Query 7: Verify UNIQUE constraints
```sql
SELECT constraint_name, table_name
FROM information_schema.table_constraints
WHERE table_name IN ('project_histories', 'project_approvers', 'project_budgets')
  AND constraint_type = 'UNIQUE'
ORDER BY table_name;
```

**Expected Result:**
- UNIQUE(tenant_id, espaider_id) on each table

**Status:** [ ] PASS [ ] FAIL

**Result:**
```
[Paste query result here]
```

---

## ✅ Part 2: Visual/Feature Tests (Browser)

**Duration:** ~10-15 minutes

### Test Suite 1: Dark Mode Toggle

#### Test 1.1: Light ↔ Dark Switch
**Location:** Any page (Dashboard or Projects)

**Steps:**
1. Open Vercel staging/prod URL
2. Click Moon/Sun icon (top right)
3. Theme switches immediately
4. Click again, returns to original theme

**Status:** [ ] PASS [ ] FAIL

**Notes:**
```
[Add any observations]
```

---

#### Test 1.2: Theme Persistence
**Location:** Dashboard

**Steps:**
1. Toggle to dark mode
2. Open DevTools → Application → Storage → localStorage
3. Find key: `tech-arauz-dark-mode`
4. Verify value: `true` (dark) or `false` (light)
5. Full page refresh (Ctrl+R)
6. Theme persists!

**Status:** [ ] PASS [ ] FAIL

**Notes:**
```
[localStorage value observed]
```

---

### Test Suite 2: UI Improvements

#### Test 2.1: Kanban Card - Movimento Message
**Location:** Projects → Kanban view

**Steps:**
1. View any project card in kanban
2. Look for "Último histórico:" section
3. Message should be 3 lines max, readable
4. Date shown as "há X dias", "Ontem", "Hoje"

**Expected:**
- Label visible: "Último histórico:"
- Message not truncated (3 lines visible)
- Date formatted nicely
- Works in dark/light mode

**Status:** [ ] PASS [ ] FAIL

**Notes:**
```
[Add any observations]
```

---

#### Test 2.2: ProjectCockpit - Status/Situação Fields
**Location:** Projects → Click any project

**Steps:**
1. View project details in right panel
2. Go to "Detalhes" tab
3. Look for "Informações Gerais" section
4. Should show:
   - "Status do Projeto" (Iniciado, Em execução, etc.)
   - "Situação Atual" (Em aprovação, Aguardando, etc.)
5. Verify these are DIFFERENT fields

**Expected:**
- Two separate status fields
- Clearly labeled
- No "Aprovador Atual" field (removed)
- More space in card

**Status:** [ ] PASS [ ] FAIL

**Notes:**
```
[Confirm both fields visible and different]
```

---

#### Test 2.3: Sidebar Auto-Close
**Location:** Projects

**Steps:**
1. Ensure sidebar is expanded (desktop)
2. Click on any project card/row
3. SplitView opens on right
4. Sidebar should auto-collapse to give more space
5. Title should not be truncated anymore

**Expected:**
- Sidebar collapses automatically
- Project title readable
- More space for project details
- Can expand sidebar again if needed

**Status:** [ ] PASS [ ] FAIL

**Notes:**
```
[Confirm sidebar auto-closes]
```

---

### Test Suite 3: Responsive Design

#### Test 3.1: Desktop (1920x1080)
**Status:** [ ] PASS [ ] FAIL

**Observations:**
```
[Layout, sidebar, content, dark mode all good?]
```

---

#### Test 3.2: Mobile (375x667)
**Status:** [ ] PASS [ ] FAIL

**Observations:**
```
[Touch-friendly? Navigation works? Dark mode readable?]
```

---

### Test Suite 4: Features Still Work

#### Test 4.1: Kanban View
**Status:** [ ] PASS [ ] FAIL

**Notes:**
```
[Columns visible? Cards render correctly?]
```

---

#### Test 4.2: List View
**Status:** [ ] PASS [ ] FAIL

**Notes:**
```
[Table loads? Sorting works? Dark mode applied?]
```

---

#### Test 4.3: Project Details
**Status:** [ ] PASS [ ] FAIL

**Notes:**
```
[SplitView opens? Tabs work? All data visible?]
```

---

#### Test 4.4: Filters & Search
**Status:** [ ] PASS [ ] FAIL

**Notes:**
```
[Filtering works? Results update? No lag?]
```

---

### Test Suite 5: Console & Network

#### Test 5.1: No Console Errors
**Location:** DevTools → Console

**Steps:**
1. Open DevTools (F12)
2. Go to Console tab
3. Navigate around app (Dashboard → Projects → Details)
4. Check for red errors

**Status:** [ ] PASS [ ] FAIL

**Errors found:**
```
[List any errors]
```

---

#### Test 5.2: API Calls Return 200
**Location:** DevTools → Network

**Steps:**
1. Open Network tab
2. Go to Projects page
3. Filter by Fetch/XHR
4. Check response statuses

**Status:** [ ] PASS [ ] FAIL

**API Issues:**
```
[List any 4xx/5xx errors]
```

---

## 📊 Final Verification

| Test Suite | Status | Evidence |
|-----------|--------|----------|
| **Database (M026)** | [ ] ✅ [ ] ❌ | Audit summary shows all PASS |
| **Database (M027)** | [ ] ✅ [ ] ❌ | Child tables have tenant_id + policies |
| **Dark Mode** | [ ] ✅ [ ] ❌ | Toggle works + persistence confirmed |
| **UI Improvements** | [ ] ✅ [ ] ❌ | Kanban message, Status/Situação visible |
| **Sidebar Auto-Close** | [ ] ✅ [ ] ❌ | Works on desktop, title not truncated |
| **Responsive Design** | [ ] ✅ [ ] ❌ | Desktop + Mobile both good |
| **Features** | [ ] ✅ [ ] ❌ | Kanban, List, Details all work |
| **Console** | [ ] ✅ [ ] ❌ | No critical errors |
| **API** | [ ] ✅ [ ] ❌ | All calls return 200 |

---

## ✅ Sign-Off

**Date:** _______________

**Tester:** _______________

**Overall Sprint 1 Result:**
- [ ] ✅ PASS - Ready for production
- [ ] ⚠️ ISSUES FOUND - Document below
- [ ] ❌ FAIL - Rollback needed

**Critical Issues (if any):**
```
[Describe any blocking issues]
```

**Non-Critical Observations:**
```
[Minor issues, nice-to-haves, etc.]
```

---

## 🎉 Sprint 1 Completion Checklist

- [ ] Migrations M026 + M027 validated (all tests PASS)
- [ ] Dark mode persistence working
- [ ] UI improvements visible (kanban message, status fields)
- [ ] Sidebar auto-close working
- [ ] No console errors
- [ ] API calls working
- [ ] Features functional
- [ ] Ready for stakeholder approval

---

**Completion Status:** _______________
