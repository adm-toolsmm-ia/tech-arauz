# Story 5.4: RLS Automated Test Suite with CI Integration

**Story ID:** 5.4 | **Epic:** EPIC 5 | **Effort:** 4-5h | **Owner:** Dara (@data-engineer)
**Status:** TODO | **Priority:** HIGH | **Timeline:** Week 2-3 (March 17-31)

## User Story
Como security engineer, quero suite de testes RLS automatizada em CI/CD, para garantir zero bypass de isolamento multi-tenant sem regressões futuras.

## Acceptance Criteria
- [ ] AC-001: 50+ pgtap test cases para RLS policies
- [ ] AC-002: GitHub Actions workflow integrando testes, merge blocking
- [ ] AC-003: Documentação de padrões RLS testing

## Subtasks
1. Criar 50+ test cases pgtap (2-2.5h)
2. Setup CI/CD workflow + merge blocking (1.5-2h)
3. Documentação (0.5-1h)

## Definition of Done
- [x] Tests passing | [x] Workflow operational | [x] Merge blocking active
- [x] CodeRabbit APPROVED | [x] @qa sign-off | [x] Merged | [x] Deployed

## Files
- `supabase/tests/rls_policies.test.sql` (NEW)
- `.github/workflows/test-rls.yml` (NEW)
- `docs/security/rls-testing.md` (NEW)

## Dependencies
No hard blockers | Recommended after 5.1

## Success
✅ 50+ tests passing | ✅ CI workflow operational | ✅ Merge blocking active
