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
- [ ] Install pgTAP extension
- [ ] Create test database
- [ ] Setup test runner

### 2. Write RLS Tests
- [ ] Test: User can only see own tenant data
- [ ] Test: Service role can bypass RLS
- [ ] Test: Unauthorized users blocked
- [ ] Test: All 6+ policies covered

### 3. CI/CD Integration
- [ ] Add test runner to GitHub Actions
- [ ] Run on every PR
- [ ] Report results in PR comments

### 4. Documentation
- [ ] Document test cases
- [ ] Add to README
- [ ] Create runbook for testing

---

**Status:** Ready for Development
**Created:** 2026-03-08

*AIOX Story Development Cycle — EPIC 7-A Track A*
