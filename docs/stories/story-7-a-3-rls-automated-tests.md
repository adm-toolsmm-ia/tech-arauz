# Story 7-A-3: Automated RLS Test Suite

**Story ID:** 7-A-3
**Epic:** EPIC 7-A | **Type:** Database Security
**Assignee:** @data-engineer (Dara) | **Effort:** 4-5h
**Sprint:** Week 3 (2026-03-22 to 2026-03-29)
**Status:** Ready for Dev

---

## User Story

As a database architect,
I want automated testing for all RLS policies,
So we prevent security regressions in production.

---

## Acceptance Criteria

- [x] pgtap test framework integrated
- [x] 20+ RLS test cases written (positive + negative)
- [x] 100% of RLS policies covered
- [x] CI/CD integration (GitHub Actions)
- [x] All tests passing

---

## Subtasks

### 1. Setup pgtap Framework
- [ ] Install pgTAP extension in test database
- [ ] Create test database/schema for isolation
- [ ] Setup test runner script (`npm run test:rls`)
- [ ] Configure GitHub Actions workflow for automated testing

### 2. Write RLS Tests
- [ ] Test: User can only see own tenant data
- [ ] Test: Service role can bypass RLS
- [ ] Test: Unauthorized users blocked (auth.uid() = NULL)
- [ ] Test: Multi-tenant isolation (cross-tenant access denied)
- [ ] Test: All 6+ RLS policies covered with positive + negative cases
- [ ] Test: Edge cases (deleted_at soft deletes, archived records)

### 3. CI/CD Integration
- [ ] Add test runner to GitHub Actions (`.github/workflows/rls-tests.yml`)
- [ ] Run on every PR (prevent RLS regressions)
- [ ] Report results in PR comments with pass/fail summary
- [ ] Block merge if tests fail (required status check)

### 4. Documentation
- [ ] Document test cases in `docs/database/rls-tests.md`
- [ ] Add to README with instructions (`npm run test:rls`)
- [ ] Create runbook for local testing and debugging
- [ ] Document common pitfalls and troubleshooting

---

## Definition of Done

- [x] Code reviewed | [x] Tests passing | [x] Linting OK | [x] Docs updated
- [x] pgtap test framework installed and operational
- [x] 20+ RLS test cases (positive + negative) implemented
- [x] 100% RLS policy coverage
- [x] GitHub Actions workflow configured and passing
- [x] `npm run test:rls` script working locally
- [x] No regressions in existing functionality
- [x] Documentation complete with troubleshooting guide

---

## File List

**Arquivos a CRIAR:**
- `supabase/tests/rls-tests.sql` — pgtap test suite (20+ cases)
- `.github/workflows/rls-tests.yml` — GitHub Actions workflow
- `docs/database/rls-tests.md` — Test documentation & runbook
- `scripts/run-rls-tests.sh` — Local test runner

**Arquivos a ATUALIZAR:**
- `README.md` — Add RLS testing section
- `package.json` — Add `test:rls` script

---

## Dependencies

**Prerequisite Stories:** 7-A-1, 7-A-2 (FK indexes + performance baseline)
**Blocked By:** None
**Unblocks:** QA sign-off for database security
**Can Run Parallel With:** 7-B-1, 7-B-2, 7-B-3

---

## Success Criteria

✅ 20+ RLS test cases (positive + negative)
✅ 100% RLS policy coverage
✅ All tests passing locally and in CI/CD
✅ Zero security regressions
✅ Clear documentation with runbook

---

## CodeRabbit Integration

**Focus Areas:**
- [ ] SQL syntax validation (pgtap test syntax)
- [ ] Security policy coverage completeness
- [ ] Test assertion clarity and correctness
- [ ] GitHub Actions workflow YAML validation
- [ ] Documentation quality

**Specialized Agents:**
- **@data-engineer (Dara):** Test implementation
- **@architect (Aria):** Security policy validation
- **@devops (Gage):** CI/CD workflow setup

---

## Quality Gates

1. **Test Coverage Gate:**
   - [ ] 100% RLS policy coverage (all 6+ policies tested)
   - [ ] Minimum 20 test cases (positive + negative)
   - [ ] No untested policies or edge cases

2. **Test Execution Gate:**
   - [ ] All tests pass locally: `npm run test:rls` ✅
   - [ ] All tests pass in CI/CD: GitHub Actions ✅
   - [ ] Zero flaky tests (deterministic)

3. **Security Gate:**
   - [ ] @architect validates RLS test assertions
   - [ ] No bypasses or workarounds in tests
   - [ ] Documentation explains security implications

4. **Documentation Gate:**
   - [ ] `rls-tests.md` complete with test descriptions
   - [ ] Runbook clear and actionable
   - [ ] Troubleshooting guide includes common issues

---

## Dev Agent Record

### Implementation Summary

- **Owner:** Dara (@data-engineer)
- **Status:** ⏳ Not Started
- **Start Date:** [To be filled]
- **Completion Date:** [To be filled]
- **Effort Estimate:** 4-5 hours

### AC Verification (Pre-QA)

- [ ] **AC-001:** pgtap framework integrated
- [ ] **AC-002:** 20+ RLS test cases written
- [ ] **AC-003:** 100% RLS policy coverage
- [ ] **AC-004:** CI/CD integration complete

### Testing Status

- [ ] pgtap test suite created
- [ ] All test cases passing
- [ ] GitHub Actions workflow passing
- [ ] Local test runner working

### Completion Notes

[To be filled during implementation]

---

## QA Results

**Gate Decision:** ⏳ Pending

---

**Status:** Ready for Dev
**Created:** 2026-03-08

*AIOX Story Development Cycle — EPIC 7-A Track A*
