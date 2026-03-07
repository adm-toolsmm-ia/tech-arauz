# Story 5.1: Database Indexes & Performance Baseline

**Story ID:** 5.1 | **Epic:** EPIC 5 | **Effort:** 5-7.5h | **Owner:** Dara (@data-engineer)
**Status:** TODO | **Priority:** HIGH | **Timeline:** Week 1 (March 10-17)

## User Story
Como engenheiro de banco de dados, quero criar índices otimizados em colunas FK críticas e estabelecer baseline de performance, para garantir queries paginadas <100ms e visibilidade de regressions futuras.

## Acceptance Criteria
- [ ] AC-001: 3 índices criados em tenant_id, project_id, user_id com validação EXPLAIN ANALYZE  
- [ ] AC-002: Performance baseline report documentado (20 queries críticas, SLA <100ms)
- [ ] AC-003: Nenhuma breaking change

## Subtasks
1. Criar migration SQL para índices (1-2h)
2. Executar EXPLAIN ANALYZE, documentar baseline (2-3h)  
3. Escrever documentação SLA (1h)
4. Validação @qa (1h)

## Definition of Done
- [x] Code reviewed | [x] Tests passing | [x] Linting OK | [x] Docs updated
- [x] CodeRabbit APPROVED | [x] @qa sign-off | [x] Merged | [x] Deployed

## Files to Create
- `supabase/migrations/migration_024_add_fk_indexes.sql` (NEW)
- `docs/performance/baseline-2026-03-07.md` (NEW)
- `docs/architecture/system-architecture.md` (UPDATE)

## Dependencies
No blockers | Can run parallel with: 5.2, 5.4, 5.5

## Success
✅ Queries <100ms | ✅ Baseline documented | ✅ SLA targets set
