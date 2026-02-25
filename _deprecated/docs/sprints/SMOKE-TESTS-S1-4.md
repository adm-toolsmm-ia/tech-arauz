# Smoke Tests — Sprint 1 Deployment (S1-4)

**Date:** 2026-02-22
**Status:** Ready for execution
**Duration:** ~10-15 minutes
**Environment:** Vercel Staging (or production if migrations applied)

---

## 📋 Pre-Test Checklist

- [ ] Migrations M026 + M027 applied successfully ✅ **DONE**
- [ ] Vercel deployment complete or in progress
- [ ] GitHub commits pushed to main ✅ **DONE**
- [ ] Have browser ready (Chrome/Firefox/Safari)
- [ ] Have mobile device or browser DevTools mobile mode ready

---

## 🧪 Test Suite 1: Dark Mode Toggle

### Test 1.1: Light Mode → Dark Mode Switch
**Location:** Any page (e.g., Dashboard)
**Steps:**
1. Load staging URL: `https://tech-arauz-staging.vercel.app` (or your Vercel URL)
2. Look for **Moon/Sun icon** in top navigation (DashboardHeader)
3. Click the icon
4. **Expected:** Page theme switches to dark mode
   - Background: Dark (near black)
   - Text: Light (near white)
   - Sidebar: Dark blue/black
5. Take screenshot ✅ **PASS** or note any issues ❌

**Evidence Needed:**
- [ ] Moon icon visible
- [ ] Dark mode applies immediately
- [ ] All text remains readable
- [ ] Colors follow design tokens

---

### Test 1.2: Dark Mode → Light Mode Switch
**Steps:**
1. From dark mode, click Moon/Sun icon again
2. **Expected:** Page returns to light mode
   - Background: Light/white
   - Text: Dark
   - Sidebar: Light with blue accents

**Evidence Needed:**
- [ ] Light mode applies immediately
- [ ] No flashing or layout shift
- [ ] All elements visible and readable

---

### Test 1.3: Theme Persistence (localStorage)
**Steps:**
1. Toggle to dark mode (or light mode)
2. **Verify persistence:**
   - Press F12 → DevTools → Application tab
   - Find localStorage key: `tech-arauz-dark-mode`
   - Value should be: `true` (dark) or `false` (light)
3. **Full page refresh** (Cmd+R or Ctrl+R)
4. **Expected:** Theme persists after refresh
   - If you set dark mode, page loads in dark mode
   - If you set light mode, page loads in light mode

**Evidence Needed:**
- [ ] localStorage key exists: `tech-arauz-dark-mode`
- [ ] Value matches current theme
- [ ] Theme persists after page reload
- [ ] No flash of wrong theme on load

---

### Test 1.4: System Preference Detection
**Steps:**
1. Clear localStorage (DevTools → Application → Storage → Clear All)
2. Reload page
3. **Expected:** Page respects system preference
   - Windows/Mac: Check if dark/light mode matches OS setting
   - Browser: Test via DevTools → ... → More Tools → Rendering → Emulate CSS media feature prefers-color-scheme

**Evidence Needed:**
- [ ] Page loads in system preference (no localStorage)
- [ ] Fallback works correctly
- [ ] No console errors

---

## 🧪 Test Suite 2: RLS (Row-Level Security)

### Test 2.1: Multi-Tenant Isolation
**Prerequisite:** Have 2 test user accounts (or access to 2 different tenants)

**Steps:**
1. **User A** logs in → sees projects from Tenant A only
2. **User B** logs in → sees projects from Tenant B only
3. **Expected:** Neither user sees the other's projects
4. Open DevTools → Network tab → inspect API calls
   - Check that `WHERE tenant_id = ...` is enforced

**Evidence Needed:**
- [ ] User A cannot see User B's projects
- [ ] API responses filtered by tenant_id
- [ ] No cross-tenant data visible
- [ ] Console shows no auth/RLS errors

---

### Test 2.2: Audit Function Works
**Steps:**
1. Open Supabase Dashboard → SQL Editor
2. Run audit query:
```sql
SELECT * FROM public.rls_audit_summary;
```
3. **Expected output:**
   - All 12 tables listed
   - All showing `✅ PASS` or `✅ PASS (with tenant_id)`
   - No `🔴 CRITICAL` status for any table
   - Especially check: `project_histories`, `project_approvers`, `project_budgets`

**Evidence Needed:**
- [ ] Audit summary shows 12 tables
- [ ] All critical tables have tenant_id column (`has_tenant_id = ✅`)
- [ ] All have tenant isolation (`tenant_isolation = ✅`)
- [ ] No CRITICAL issues

---

### Test 2.3: Verify Migrations Applied
**Steps:**
1. In Supabase Dashboard → SQL Editor, run:
```sql
SELECT * FROM public.audit_rls_policy('project_histories');
```
2. **Expected:** Returns audit info with:
   - `rls_enabled: true`
   - `total_policies: 2+` (at least select + service_role)
   - `tenant_isolation_found: true`
   - `has_tenant_id_column: true`

**Evidence Needed:**
- [ ] M026 audit function exists and runs
- [ ] M027 tenant_id columns created
- [ ] RLS policies updated with tenant checks

---

## 🧪 Test Suite 3: Console & Network

### Test 3.1: No Console Errors
**Steps:**
1. Open DevTools → Console tab
2. Navigate around app (Dashboard → Projects → Project Details)
3. **Expected:** No errors, warnings should be minimal
   - Red errors: ❌ **FAIL**
   - Yellow warnings: ⚠️ Check if critical
   - Green logs: ✅ **OK**

**Evidence Needed:**
- [ ] No RLS-related errors
- [ ] No auth-related errors
- [ ] No 403/401 responses
- [ ] No undefined variable errors

---

### Test 3.2: API Calls Return Data
**Steps:**
1. DevTools → Network tab
2. Navigate to `/dashboard` or `/projetos`
3. **Expected:** API calls return 200/201
   - Look for calls to `/api/...`
   - Response status: `200` ✅ or `201` ✅
   - Response body: contains data (not error)

**Evidence Needed:**
- [ ] API endpoints responding normally
- [ ] RLS applied silently (correct data returned)
- [ ] No 500 errors from server

---

## 🧪 Test Suite 4: Responsive Design

### Test 4.1: Desktop (1920x1080)
**Steps:**
1. Load page on desktop resolution
2. **Expected:**
   - Sidebar visible (collapsible)
   - Main content area wide
   - All buttons clickable
   - Dark mode toggle visible
   - No horizontal scroll

**Evidence Needed:**
- [ ] Layout proper at desktop
- [ ] All elements visible
- [ ] No layout shift on dark mode toggle

---

### Test 4.2: Tablet (768x1024)
**Steps:**
1. DevTools → Toggle device toolbar → iPad or Tablet
2. **Expected:**
   - Sidebar collapses or becomes hamburger menu
   - Content adapts to width
   - Touch targets (buttons) still >44px
   - No horizontal overflow

**Evidence Needed:**
- [ ] Responsive at tablet width
- [ ] Touch-friendly sizing
- [ ] No broken layout

---

### Test 4.3: Mobile (375x667)
**Steps:**
1. DevTools → Toggle device toolbar → iPhone 12 or similar
2. **Expected:**
   - Sidebar hidden by default (hamburger menu shows)
   - Full-width content
   - Dark mode toggle still visible
   - All buttons clickable on touch

**Evidence Needed:**
- [ ] Responsive at mobile width
- [ ] Navigation accessible via menu
- [ ] Text readable (not too small)
- [ ] No horizontal scroll

---

### Test 4.4: Dark Mode on Mobile
**Steps:**
1. On mobile view, toggle dark mode
2. **Expected:**
   - Theme switches correctly
   - All text readable in dark mode
   - No contrast issues
   - Touch targets still visible

**Evidence Needed:**
- [ ] Dark mode works on mobile
- [ ] WCAG AA contrast maintained (6:1 ratio)
- [ ] No visual regression

---

## 🧪 Test Suite 5: Features Still Work

### Test 5.1: Project Kanban View
**Steps:**
1. Navigate to `/projetos`
2. View toggle should show **Kanban** icon
3. **Expected:**
   - Columns visible: Futuro, Em Aprovação, Em Execução, Concluído
   - Projects draggable between columns
   - Dark mode applies to cards

**Evidence Needed:**
- [ ] Kanban board loads
- [ ] Cards visible in correct columns
- [ ] Dark mode applies to cards/columns

---

### Test 5.2: Project List View
**Steps:**
1. Click **List icon** in view toggle
2. **Expected:**
   - Table with projects visible
   - Columns: Name, Status, Priority, Owner, etc.
   - Sort works (click column headers)
   - Dark mode applies to table

**Evidence Needed:**
- [ ] List view loads
- [ ] Table readable in light & dark mode
- [ ] Sorting functional

---

### Test 5.3: Project Details (SplitView)
**Steps:**
1. Click any project in list or kanban
2. **Expected:**
   - SplitView opens on right side
   - Project cockpit displays tabs
   - Dark mode applies
   - Tabs: Details, Deliveries, Timeline, History, Approvals (or similar)

**Evidence Needed:**
- [ ] SplitView opens
- [ ] Project details load
- [ ] All tabs functional
- [ ] Dark mode applies to cockpit

---

### Test 5.4: Filters & Search
**Steps:**
1. Look for **Filters** button or search box
2. Try filtering by status, priority, or search by name
3. **Expected:**
   - Filter applies immediately
   - Results update without page reload
   - Dark mode applied to filter UI

**Evidence Needed:**
- [ ] Filters work
- [ ] Search functional
- [ ] UI responsive to filters

---

## ✅ Final Verification

| Test | Result | Evidence |
|------|--------|----------|
| **Dark Mode Toggle** | ✅ or ❌ | Screenshot |
| **Theme Persistence** | ✅ or ❌ | localStorage screenshot |
| **Multi-Tenant Isolation** | ✅ or ❌ | Two users, different data |
| **Audit Function** | ✅ or ❌ | SQL query result |
| **Console Errors** | ✅ or ❌ | DevTools screenshot |
| **API Responses** | ✅ or ❌ | Network tab screenshot |
| **Responsive Design** | ✅ or ❌ | Screenshots (mobile, tablet, desktop) |
| **Features** | ✅ or ❌ | Kanban, List, Details functional |

---

## 📊 Final Sign-Off

**Date:** _____________
**Tested By:** _____________
**Environment:** Staging / Production
**Overall Result:** ✅ PASS / ⚠️ ISSUES FOUND / ❌ FAIL

**Notes:**
```
[Add any issues found, deviations, or additional observations]
```

---

## 🚀 Next Steps (After Tests Pass)

1. ✅ All smoke tests PASS
2. ✅ Notify stakeholders with staging URL
3. ✅ Request final approval for production
4. ✅ Deploy to production
5. ✅ Run production smoke tests
6. ✅ Mark Sprint 1 as COMPLETE
7. ✅ Begin Sprint 2 Planning

---

**Smoke Tests prepared by:** Claude Haiku 4.5
**Date:** 2026-02-22
**Status:** Ready for execution ✅
