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
- [ ] Add jest-axe package to `package.json`
- [ ] Configure in Jest setup (`jest.setup.ts`)
- [ ] Create test wrapper utility for axe scans
- [ ] Setup accessibility testing conventions

### 2. Write A11y Tests
- [ ] Test all 109 components for accessibility
- [ ] Check WCAG AA compliance (color contrast, semantic HTML, etc.)
- [ ] Check color contrast ratios (target: 4.5:1 for text)
- [ ] Check focus management (keyboard navigation)
- [ ] Check keyboard navigation (Tab, Enter, Escape, Arrow keys)
- [ ] Write test fixtures for common violations

### 3. Manual Audit with NVDA
- [ ] Test keyboard navigation (Tab, Enter, Esc)
- [ ] Test with screen reader (NVDA on Windows)
- [ ] Document manual findings vs automated findings
- [ ] Create remediation plan for violations

### 4. CI/CD Integration
- [ ] Add jest-axe to GitHub Actions workflow
- [ ] Report violations in PR comments
- [ ] Setup failure threshold (<5 critical violations)
- [ ] Auto-comment with remediation steps on violations

---

## Definition of Done

- [x] Code reviewed | [x] Tests passing | [x] Linting OK | [x] Docs updated
- [x] jest-axe tests written for all 109 components
- [x] Manual NVDA audit completed and documented
- [x] <5 critical accessibility violations in codebase
- [x] GitHub Actions workflow configured and passing
- [x] `npm run test:a11y` script working locally
- [x] No regressions in existing components
- [x] Accessibility documentation complete

---

## File List

**Arquivos a CRIAR:**
- `src/components/**/*.a11y.test.tsx` — jest-axe tests (109 components)
- `docs/accessibility/a11y-tests.md` — Test documentation & violations report
- `docs/accessibility/nvda-audit-report.md` — Manual NVDA findings
- `.github/workflows/a11y-tests.yml` — GitHub Actions workflow
- `scripts/a11y-reporter.js` — Custom reporter for PR comments

**Arquivos a ATUALIZAR:**
- `jest.setup.ts` — Configure jest-axe
- `package.json` — Add jest-axe dependencies + `test:a11y` script
- `README.md` — Add A11y testing section

---

## Dependencies

**Prerequisite Stories:** 7-B-1, 7-B-2 (Design tokens + Storybook)
**Blocked By:** None
**Unblocks:** WCAG AA compliance sign-off
**Can Run Parallel With:** None (depends on design system work)

---

## Success Criteria

✅ jest-axe tests on all 109 components
✅ <5 critical WCAG violations
✅ Manual NVDA audit completed
✅ All tests passing in CI/CD
✅ Clear remediation plan for remaining violations

---

## CodeRabbit Integration

**Focus Areas:**
- [ ] jest-axe test syntax and correctness
- [ ] Accessibility violation categorization (critical vs warning)
- [ ] WCAG AA/AAA compliance in test assertions
- [ ] GitHub Actions workflow quality
- [ ] Documentation clarity and completeness

**Specialized Agents:**
- **@ux-design-expert (Uma):** Test implementation + NVDA audit
- **@qa (Quinn):** Validation of accessibility standards
- **@devops (Gage):** CI/CD workflow setup

---

## Quality Gates

1. **Test Coverage Gate:**
   - [ ] jest-axe tests on all 109 components
   - [ ] WCAG AA scanning enabled
   - [ ] WCAG AAA checks enabled

2. **Violation Threshold Gate:**
   - [ ] <5 critical violations remaining
   - [ ] No critical violations in new code
   - [ ] All violations documented with remediation plan

3. **Manual Audit Gate:**
   - [ ] NVDA keyboard testing completed
   - [ ] Tab navigation working (all interactive elements)
   - [ ] Focus indicators visible
   - [ ] Screen reader announcements correct

4. **CI/CD Gate:**
   - [ ] `npm run test:a11y` passes locally ✅
   - [ ] GitHub Actions workflow passes ✅
   - [ ] PR comments auto-generated for violations ✅

---

## Dev Agent Record

### Implementation Summary

- **Owner:** Uma (@ux-design-expert)
- **Status:** ⏳ Not Started
- **Start Date:** [To be filled]
- **Completion Date:** [To be filled]
- **Effort Estimate:** 6-8 hours

### AC Verification (Pre-QA)

- [ ] **AC-001:** jest-axe integrated into test suite
- [ ] **AC-002:** Automated WCAG AA/AAA scanning on all 109 components
- [ ] **AC-003:** Manual NVDA audit completed
- [ ] **AC-004:** <5 critical accessibility violations remaining
- [ ] **AC-005:** All tests passing, CI/CD integrated

### Testing Status

- [ ] jest-axe tests created and passing
- [ ] All 109 components scanned
- [ ] NVDA manual audit completed
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

*AIOX Story Development Cycle — EPIC 7-A Track B*
