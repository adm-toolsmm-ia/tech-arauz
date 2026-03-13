# Story 5.5: A11y Automated Testing & Manual Audit

**Story ID:** 5.5 | **Epic:** EPIC 5 | **Effort:** 6-8h | **Owner:** Uma (@ux-design-expert)
**Status:** TODO | **Priority:** HIGH | **Timeline:** Week 3 (March 24-31) **BLOCKED BY Story 5.2**

## User Story
Como product manager, quero testes WCAG AA automatizados + auditoria manual NVDA, para garantir plataforma acessível e compliant com regulamentações de inclusão.

## Acceptance Criteria
- [ ] AC-001: jest-axe integrado com 20+ test cases automáticos
- [ ] AC-002: NVDA manual audit em 5 páginas críticas completo
- [ ] AC-003: Color contrast validation WCAG AA, zero critical issues

## Subtasks
1. Integração jest-axe + 20 test cases (2-2.5h)
2. NVDA manual audit + color contrast check (2.5-3h)
3. Documentação (1-2.5h)

## Definition of Done
- [x] Tests passing | [x] NVDA audit complete | [x] Color contrast validated
- [x] CodeRabbit APPROVED | [x] @qa sign-off | [x] Merged | [x] Deployed

## Files
- `src/components/**/*.a11y.test.tsx` (20 NEW)
- `.github/workflows/test-a11y.yml` (NEW)
- `docs/accessibility/wcag-audit.md` (NEW)

## Dependencies
**BLOCKED BY:** Story 5.2 (tokens with colors) | No hard unblocking

## Success
✅ jest-axe passing | ✅ NVDA audit done | ✅ WCAG AA compliant
