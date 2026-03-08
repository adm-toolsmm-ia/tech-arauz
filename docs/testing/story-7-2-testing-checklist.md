# Story 7.2 — Testing Checklist

**Date:** 2026-03-08
**Story:** 7.2 — Dashboard Team Performance Phase 1 Foundation
**Tester:** @qa (Quinn)
**Subtask:** 7.2.4 — Testing & Validation (3-4h)

---

## ✅ Test Plan

### 1. Data Query Tests (getTeamPerformanceData)

- [ ] **TC-1.1:** Query returns data when period = 'mensal'
  - Expected: Array of PerformanceMetrics with >0 items (if data exists)
  - Actual:
  - Status: PASS / FAIL / N/A

- [ ] **TC-1.2:** Query filters by team_scope = 'minha-equipe'
  - Expected: Returns only current user's team data
  - Actual:
  - Status: PASS / FAIL / N/A

- [ ] **TC-1.3:** Query aggregates correctly (movements counted, duration averaged)
  - Expected: total_movements > 0, average_duration_days calculated
  - Actual:
  - Status: PASS / FAIL / N/A

- [ ] **TC-1.4:** Summary object includes top_performer, avg_tempo_per_person, totals
  - Expected: All 4 summary fields populated
  - Actual:
  - Status: PASS / FAIL / N/A

### 2. Table Component Tests

- [ ] **TC-2.1:** Table renders with correct columns
  - Columns: Nome, Movimentações, Tempo Médio, Concluídos, Lead Time
  - Expected: All 5 columns visible
  - Actual:
  - Status: PASS / FAIL

- [ ] **TC-2.2:** Sorting works (click column header)
  - Click "Movimentações" → Sort descending
  - Click again → Sort ascending
  - Expected: Data re-sorts, arrow indicator changes
  - Actual:
  - Status: PASS / FAIL

- [ ] **TC-2.3:** Pagination works (>20 rows)
  - If >20 items, "Próxima" button enabled
  - Click "Próxima" → Page 2 shows different data
  - Expected: Pagination controls work correctly
  - Actual:
  - Status: PASS / FAIL

- [ ] **TC-2.4:** CSV export generates valid file
  - Click "Exportar CSV"
  - Expected: Download triggers, file is valid CSV with headers + data
  - Actual:
  - Status: PASS / FAIL

### 3. Accessibility Tests

- [ ] **TC-3.1:** Keyboard navigation works
  - Tab through table → All clickable elements reachable
  - Expected: No focus trap, logical tab order
  - Actual:
  - Status: PASS / FAIL

- [ ] **TC-3.2:** ARIA labels present
  - Export button: aria-label="Exportar para CSV"
  - Pagination buttons: aria-label="Próxima página", "Página anterior"
  - Expected: All interactive elements labeled
  - Actual:
  - Status: PASS / FAIL

- [ ] **TC-3.3:** Screen reader announces table content
  - Expected: Table region labeled, column headers announced
  - Actual:
  - Status: PASS / FAIL

### 4. RLS Validation

- [ ] **TC-4.1:** Multi-tenant isolation confirmed
  - User A logs in → Sees only User A's team data
  - User B logs in → Sees only User B's team data
  - Expected: Data filtered by tenant_id
  - Actual:
  - Status: PASS / FAIL

- [ ] **TC-4.2:** No cross-tenant data leakage
  - Expected: No ability to query other tenant's data
  - Actual:
  - Status: PASS / FAIL

### 5. Performance Tests

- [ ] **TC-5.1:** getTeamPerformanceData response <2s (p95)
  - Load: npm run dev
  - Open Performance tab
  - Measure response time
  - Expected: <2000ms
  - Actual: ___ ms
  - Status: PASS / FAIL

- [ ] **TC-5.2:** Table renders smoothly
  - Expected: No lag when clicking sort, pagination
  - Actual:
  - Status: PASS / FAIL

### 6. Filters Tests

- [ ] **TC-6.1:** Period selector changes data
  - Select "Semanal" → Data updates
  - Select "Anual" → Different data
  - Expected: Query re-runs with new period
  - Actual:
  - Status: PASS / FAIL

- [ ] **TC-6.2:** Team filter changes data
  - Select "Minha Equipe" → Shows personal team
  - Select "Todos os Envolvidos" → Shows all users
  - Expected: Different data sets
  - Actual:
  - Status: PASS / FAIL

- [ ] **TC-6.3:** Filters persist in localStorage
  - Select "Trimestral" + "Todos"
  - Refresh page (F5)
  - Expected: Filters still selected
  - Actual:
  - Status: PASS / FAIL

---

## 📊 Test Results Summary

| Category | Tests | Pass | Fail | N/A | Status |
|----------|-------|------|------|-----|--------|
| Data Queries | 4 | _ | _ | _ | ⏳ PENDING |
| Table Component | 4 | _ | _ | _ | ⏳ PENDING |
| Accessibility | 3 | _ | _ | _ | ⏳ PENDING |
| RLS | 2 | _ | _ | _ | ⏳ PENDING |
| Performance | 2 | _ | _ | _ | ⏳ PENDING |
| Filters | 3 | _ | _ | _ | ⏳ PENDING |
| **TOTAL** | **18** | **_** | **_** | **_** | **⏳ PENDING** |

---

## 🐛 Issues Found

(Will be populated during testing)

---

## ✅ Approval

- [ ] All tests PASS
- [ ] No CRITICAL issues
- [ ] Performance validated
- [ ] RLS confirmed
- [ ] Accessibility compliant (WCAG AA minimum)

**Tester Sign-off:** ________________
**Date:** ________________
