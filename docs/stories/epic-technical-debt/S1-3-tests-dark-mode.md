# S1-3: Dark Mode Test Suite — Unit, Integration, E2E Tests

**Epic:** epic-technical-debt
**Story ID:** S1-3
**Status:** Ready
**Complexity:** 8/25 (SIMPLE)
**Story Points:** 5
**Effort:** 4h
**Owner:** @qa
**Priority:** P1 (quality gate)
**Validated By:** @po (Pax)
**Validation Date:** 2026-02-22
**Validation Score:** 10/10
**Verdict:** GO

---

## User Story

Como QA,
Quero testes para dark mode (unit + integration + E2E),
Para garantir que feature funciona em todos browsers/devices.

---

## Acceptance Criteria

- [ ] AC-1: Unit tests para toggle state logic
- [ ] AC-2: Integration tests para CSS application
- [ ] AC-3: E2E tests para user clicking toggle → dark mode applies
- [ ] AC-4: Coverage ≥80% para dark mode code
- [ ] AC-5: All tests passing (npm test)
- [ ] AC-6: Tests documentados com descrições
- [ ] AC-7: Teste localStorage persistence
- [ ] AC-8: WCAG contrast ratio validated

---

## Scope

### IN
- Unit tests (toggle logic)
- Integration tests (CSS vars)
- E2E tests (user workflow)
- Coverage report

### OUT
- Visual regression tests
- Performance tests
- Accessibility tests (não está in scope, apenas WCAG check)

---

## Dependencies

- S1-1 (Dark Mode UI) — 60% complete

---

## Risks

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|-----------|
| Coverage <80% | MEDIUM | MEDIUM | Write more tests, mock as needed |
| E2E flaky | MEDIUM | MEDIUM | Use explicit waits, not sleeps |
| localStorage not testable | LOW | MEDIUM | Mock localStorage in unit tests |

---

## Definition of Done

- [ ] All tests created (unit + integration + E2E)
- [ ] Coverage ≥80%
- [ ] All tests passing
- [ ] npm test: 0 failures
- [ ] Tests documented
- [ ] Reviewed by @qa peer
- [ ] Commit: `test: add comprehensive dark mode test suite [S1-3]`

---

## File List

(will be populated by @qa)

---

## Dev Notes

(will be populated by @qa)

---

## Change Log

- **2026-02-22** | Created | Status: Draft
- **2026-02-22** | Validated | Status: Draft → Ready | 10-point checklist passed (10/10), @po approval, parallelizable with S1-1
