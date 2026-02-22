# Sprint 1 QA Plan

**Sprint Duration:** Feb 24 - Feb 28, 2026
**Release Target:** Staging (Feb 28)
**Team:** @qa + peer reviewers

---

## Testing Strategy

### S1-1: Dark Mode UI (Unit + Integration + E2E)

**Unit Tests**
- Toggle state logic (on/off)
- localStorage save/load
- CSS variable application
- Preference persistence across mounts

**Integration Tests**
- CSS vars applied to all components
- No layout breaks (responsive)
- Animation timing (0.3s transition)
- Color contrast validation (WCAG AA ≥4.5:1)

**E2E Tests**
- User clicks toggle in Sidebar → dark mode visible
- Refresh page → dark mode persists
- Toggle again → light mode returns
- All 5 pages render correctly in dark mode

---

### S1-2: RLS Policy Framework (Integration + Security)

**Integration Tests**
- `audit_rls_policy()` function works
- Identifies missing policies
- Reports overly permissive access
- Handles edge cases (null tables, missing columns)

**Security Tests**
- Service role can sync Espaider data
- User A cannot access Tenant B data
- RLS policies follow standard format (USING + WITH CHECK)
- Multi-tenant isolation verified

**Manual Tests**
- Run audit against live schema
- Verify all 11 tables covered
- Document findings
- Validate fixes

---

### S1-3: Tests (This IS the testing story)

These tests ARE the deliverable. No additional testing needed beyond self-validation.

---

### S1-4: Deploy (Smoke Tests)

**Pre-Deploy Checks**
- [ ] All 3 PRs reviewed and approved
- [ ] Tests passing (S1-1, S1-2, S1-3)
- [ ] No merge conflicts
- [ ] Linting clean

**Post-Deploy Checks (5-10 min)**
- [ ] Homepage loads without errors
- [ ] Dark mode toggle visible in Sidebar
- [ ] Dark mode toggle functional
- [ ] Auth/RLS not broken
- [ ] No console errors (F12)
- [ ] Mobile/tablet responsive

**Stakeholder Testing**
- Share staging URL
- Collect feedback via form/comment
- Document issues
- Prioritize fixes

---

## Test Environment Setup

- [x] Jest configured for unit tests
- [x] Cypress configured for E2E tests
- [ ] Supabase test client ready (S1-2)
- [ ] Coverage threshold: ≥80%
- [ ] WCAG validator tool ready
- [ ] Vercel staging environment verified

---

## Success Criteria

- All unit tests passing
- All integration tests passing
- All E2E tests passing
- Coverage ≥80% on new code
- Zero CRITICAL bugs
- Zero CRITICAL security issues
- Stakeholder sign-off on staging

---

## Escalation

If any tests fail:
1. Document the failure in story file
2. Notify @dev (for S1-1/S1-2) or respective owner
3. Wait for fix + re-test
4. Maximum 2 iterations before escalation to @aios-master

---

## Timeline

| Date | Task | Owner |
|------|------|-------|
| Feb 24 | Create test infrastructure | @qa |
| Feb 25 | S1-1 & S1-3 tests written & passing | @qa + @dev |
| Feb 26 | S1-2 security tests written & passing | @qa + @data-engineer |
| Feb 27 | All tests reviewed, smoke test checklist ready | @qa |
| Feb 28 | Deploy to staging, post-deploy smoke tests | @qa + @devops |
