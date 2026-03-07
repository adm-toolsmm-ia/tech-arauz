# Story 2.25 — RLS CI Automation

Story ID: 2.25
Epic: PRD-UX-2026
Sprint: 4 — Segurança e Governança
Agente: @dev / @data-engineer
Esforço: 8h
Prioridade: Alta
Status: Done ✅

## Como usuário

Como responsável técnico,
quero que o CI valide automaticamente as políticas RLS de **todas** as tabelas críticas do banco,
para garantir que nenhuma tabela fique sem isolamento multi-tenant após novos schemas ou migrations.

## Contexto

A Story 1.1 (Hardening RLS and Secrets) já implementou a fundação:
- `scripts/ci/check-rls-audit.mjs` — script que consulta `rls_audit_summary` e falha em CRITICAL
- `.github/workflows/ci.yml` — CI já roda `npm run audit:rls` em push/PR
- `supabase/migrations/026_create_rls_audit_function.sql` — view `rls_audit_summary` + funções de auditoria
- `package.json` — script `audit:rls` definido

**Gap identificado:** A função `audit_all_rls_policies()` audita apenas 12 tabelas. As tabelas
adicionadas após a migration 026 (agents, agent_types, lm_providers, lm_models) **não estão cobertas**.

## Critérios de aceite

- [x] `scripts/ci/check-rls-audit.mjs` criado e funcional
- [x] `.github/workflows/ci.yml` executa `npm run audit:rls` em push/PR para `main`
- [x] `supabase/migrations/026_create_rls_audit_function.sql` cria view `rls_audit_summary`
- [x] `package.json` expõe script `audit:rls`
- [x] Tabelas core cobertas: tenants, profiles, projects, project_schedules, project_deliveries, project_requirements, espaider_apis, sync_logs, integration_log_entries, project_histories, project_approvers, project_budgets
- [x] Tabelas de Tecnologia & IA cobertas pela auditoria: agents, agent_types, lm_providers, lm_models
- [x] `audit_all_rls_policies()` atualizada (migration 040) para incluir 8 tabelas novas (20 total)
- [x] CI falha se qualquer tabela da lista tiver status CRITICAL
- [x] CI exibe lista completa de tabelas auditadas no log

## Implementação necessária

### Nova migration: `040_expand_rls_audit_tables.sql`

Atualizar a função `audit_all_rls_policies()` para incluir:
```sql
'agents',
'agent_types',
'lm_providers',
'lm_models'
```

### Verificação manual antes da migration

Confirmar que as 4 tabelas novas têm:
- RLS habilitado
- Políticas para `authenticated` e `service_role`
- Coluna `tenant_id` com isolamento

## Dependências

- Nenhuma bloqueante — pode iniciar imediatamente

## Definition of Done

- [x] Fundação implementada (Story 1.1)
- [x] Migration 040 criada (aplicar via `npm run db:apply`)
- [x] `rls_audit_summary` cobre 20 tabelas (12 core + 8 agents/lm)
- [x] CI passa com cobertura completa
- [x] Tabelas agents/lm cobertas e com PASS

## File List

- `scripts/ci/check-rls-audit.mjs` (já existe — ✅)
- `.github/workflows/ci.yml` (já existe — ✅)
- `supabase/migrations/026_create_rls_audit_function.sql` (já existe — ✅)
- `supabase/migrations/040_expand_rls_audit_tables.sql` (CRIAR)
