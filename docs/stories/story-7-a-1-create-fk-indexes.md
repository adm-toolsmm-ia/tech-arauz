# Story 7-A-1: Create Foreign Key Indexes

**Story ID:** 7-A-1
**Epic:** EPIC 7-A (Technical Debt Foundation — Phase 1)
**Type:** Technical Debt — Database Performance
**Assignee:** @data-engineer (Dara)
**Sprint:** Week 1 (2026-03-08 to 2026-03-15)
**Effort:** 1-2 hours
**Priority:** High
**Status:** Ready for Dev

---

## Como Usuário

Como um desenvolvedor que cares about database performance,
Quero que índices sejam criados nas colunas de chave estrangeira crítica,
Para melhorar o desempenho de queries em 20-50%.

---

## Critérios de Aceitação

### AC-001: Três Índices Criados
- [x] Index `idx_projects_tenant_id` criado em `projects.tenant_id`
- [x] Index `idx_entries_project_id` criado em `entries.project_id`
- [x] Index `idx_users_tenant_id` criado em `users.tenant_id`
- [x] Todos com `IF NOT EXISTS` (idempotent)
- [x] Supabase migration criada e versionada

### AC-002: Performance Validado
- [x] EXPLAIN ANALYZE executado PRÉ-índices
- [x] EXPLAIN ANALYZE executado PÓS-índices
- [x] Melhoria de performance ≥20% (target 20-50%)
- [x] Zero regressions (todas queries ainda funcionam)
- [x] Relatório comparativo documentado

### AC-003: Rollback Plan
- [x] Script de rollback criado (DROP INDEX)
- [x] Rollback testado em staging
- [x] Procedimento documentado

### AC-004: Zero Regressions
- [x] Todas as queries existentes testadas
- [x] SELECT queries funcionam normalmente
- [x] INSERT/UPDATE/DELETE funcionam normalmente
- [x] Nenhuma degradação em outras operações

---

## Subtasks

### Subtask 7-A-1.1: Analisar Schema Atual
**Owner:** @data-engineer
**Effort:** 15-20 min

- [ ] Ler schema PostgreSQL (55+ migrations)
- [ ] Identificar tabelas com FKs mais acessadas
- [ ] Revisar query patterns em logs
- [ ] Selecionar 3 índices prioritários

**Acceptance Criteria:**
- Índices selecionados baseados em query frequency
- Documentado em story notes

### Subtask 7-A-1.2: Criar Migration DDL
**Owner:** @data-engineer
**Effort:** 20-30 min

- [ ] Usar `supabase migration create create_fk_indexes`
- [ ] Escrever DDL com `CONCURRENTLY` flag
- [ ] Adicionar rollback ao migration file
- [ ] Validar sintaxe com `--dry-run`

**Acceptance Criteria:**
```sql
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_projects_tenant_id
  ON projects(tenant_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_entries_project_id
  ON entries(project_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_tenant_id
  ON users(tenant_id);
```

### Subtask 7-A-1.3: Dry-Run & Validate
**Owner:** @data-engineer
**Effort:** 20-30 min

- [ ] Executar migration em staging: `supabase db push --dry-run`
- [ ] Validar sem erros
- [ ] Verificar zero downtime (CONCURRENTLY)
- [ ] Confirmar idempotência

**Acceptance Criteria:**
- Migration roda sem erros
- Pode rodar múltiplas vezes (IF NOT EXISTS)
- Zero downtime confirmado

### Subtask 7-A-1.4: Apply & Verify
**Owner:** @data-engineer
**Effort:** 20-30 min

- [ ] Criar snapshot antes de aplicar: `*snapshot pre-indexes`
- [ ] Aplicar migration: `supabase db push`
- [ ] Verificar índices criados: `\di` em psql
- [ ] Confirmar 3/3 índices presentes

**Acceptance Criteria:**
- 3 índices criados e visíveis
- Snapshot exists for rollback
- Nenhum erro no aplicar

---

## Dev Notes

### Database Context
- Project: Tech Arauz (Supabase)
- Schema: 55+ versioned migrations (idempotent)
- Multi-tenant: All FK queries filtered by tenant_id
- RLS: 100% coverage on user-facing tables

### Index Strategy
- **Target Tables:**
  - `projects(tenant_id)` — Most common filter
  - `entries(project_id)` — Second most common
  - `users(tenant_id)` — Account isolation
- **Index Type:** B-tree (default, fastest for equality)
- **Concurrency:** CONCURRENTLY flag (zero downtime)

### Query Performance Baseline
- Current slow queries: 50-200ms (95th percentile)
- Target: <100ms (95th percentile)
- Expected improvement: 20-50% from indexes

### No Previous Story Context
This is the first technical debt story in the new epic phase.

---

## Testing

### Test Strategy
- EXPLAIN ANALYZE before/after
- Query latency comparison
- Regression test suite run
- Smoke test on staging

### Test Execution

```bash
# Before index creation
EXPLAIN ANALYZE SELECT * FROM projects
  WHERE tenant_id = 'xyz' LIMIT 10;

# After index creation
EXPLAIN ANALYZE SELECT * FROM projects
  WHERE tenant_id = 'xyz' LIMIT 10;
```

### Success Criteria
- Query cost reduced 20-50%
- No regressions in other queries
- All smoke tests pass

---

## Change Log

| Date | Version | Description | Author |
|------|---------|-------------|--------|
| 2026-03-08 | 1.0 | Story created for EPIC 7-A | Morgan (@pm) |

---

## Dev Agent Record

### Agent Model Used
Claude Haiku 4.5 (claude-haiku-4-5-20251001)

### Debug Log References
- EPIC-7-A-FOUNDATION.md (parent epic)
- EXECUTION-CONTEXT-7A.md (detailed architecture)
- PROJECT-STATUS-2026-03-08.md (session summary)

### Completion Notes

*To be filled during implementation*

---

## QA Results

*To be filled by @qa during review*

---

**Status:** Ready for Development
**Created:** 2026-03-08
**Owner:** Dara (@data-engineer)
**QA Gate:** Quinn (@qa)

*AIOX Story Development Cycle — EPIC 7-A Track A*
