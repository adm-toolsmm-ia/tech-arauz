# Story 7-B-3: A11y Automated Testing with jest-axe

**Story ID:** 7-B-3
**Epic:** EPIC 7-A | **Type:** Accessibility
**Assignee:** @ux-design-expert (Uma) | **Effort:** 6-8h
**Sprint:** Week 3 (2026-03-22 to 2026-03-29)
**Status:** Ready for Dev

---

## User Story

As an accessibility advocate,
I want automated accessibility testing in every PR,
So we maintain WCAG AA compliance and catch violations early.

---

## Acceptance Criteria

- [x] jest-axe integrated into test suite
- [x] Automated WCAG AA/AAA scanning on all components
- [x] Manual NVDA keyboard audit completed
- [x] <5 critical accessibility violations remaining
- [x] All tests passing, CI/CD integrated

---

## Subtasks

### 1. Install jest-axe
- [ ] Add jest-axe package
- [ ] Configure in test setup
- [ ] Create test wrapper utility

### 2. Write A11y Tests
- [ ] Test all 109 components
- [ ] Check WCAG AA compliance
- [ ] Check color contrast
- [ ] Check focus management
- [ ] Check keyboard navigation

### 3. Manual Audit with NVDA
- [ ] Test keyboard navigation (Tab, Enter, Esc)
- [ ] Test with screen reader (NVDA on Windows)
- [ ] Document any manual issues
- [ ] Create remediation plan

### 4. CI/CD Integration
- [ ] Add jest-axe to GitHub Actions
- [ ] Report violations in PR comments
- [ ] Setup failure threshold (<5 violations)
- [ ] Auto-comment with remediation steps

---

**Status:** Ready for Development
**Created:** 2026-03-08

*AIOX Story Development Cycle — EPIC 7-A Track B*
