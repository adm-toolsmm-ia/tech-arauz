# Story 3: Fix Sync Historicos, Aprovadores e Orcamentos

**ID**: STORY-003
**Status**: Done
**Sprint**: 1
**Priority**: High
**Points**: 8

## User Story

As a system administrator, I want the Espaider sync to correctly import histories, approvers, and budgets following the same proven pattern as deliveries, so that all 7 datasets are synchronized and visible in the frontend.

## Acceptance Criteria

- [x] Migration 019 reverte migrations 016-018 (schema incorreto com BIGSERIAL PK) e recria tabelas com UUID PK padrao
- [x] Tabelas project_histories, project_approvers e project_budgets possuem `id UUID PRIMARY KEY DEFAULT gen_random_uuid()`
- [x] Constraint `UNIQUE(tenant_id, espaider_id)` criado corretamente nas 3 tabelas para upsert multi-tenant
- [x] Indices composite criados para performance de queries
- [x] Migration 020 expande CHECK constraints de sync_logs e integration_log_entries para aceitar 'Historicos', 'Aprovadores', 'Orcamentos'
- [x] syncHistoriesFromRegistros() segue padrao de syncDeliveriesFromRegistros: `.select('espaider_id').eq('tenant_id', tenantId)`
- [x] syncBudgetsFromRegistros() segue padrao correto com verificacao existing e tracking created/updated
- [x] syncApproversFromRegistros() segue padrao correto com verificacao existing e tracking created/updated
- [x] Tracking diferencia created vs updated usando `existingIds.has(row.espaider_id)` em vez de `created = rows.length`
- [x] 7 datasets sincronizados com sucesso: Projetos, Entregas, Cronogramas, Requisitos, Historicos, Aprovadores, Orcamentos
- [x] 5.745+ historicos e 329+ aprovadores sincronizados no banco
- [x] Logs visiveis no frontend `/integracoes` para todos os datasets incluindo os 3 novos
- [x] Tabs Historico e Aprovadores funcionais no ProjectCockpit (6 de 6 tabs)

## File List

- `supabase/migrations/019_rollback_and_fix_child_tables.sql` -- Rollback migrations 016-018 + recriacao com UUID PK, UNIQUE constraint e indices
- `supabase/migrations/020_expand_dataset_constraints.sql` -- Expande CHECK constraints para aceitar Historicos, Aprovadores, Orcamentos
- `src/lib/sync/espaider-sync.ts` -- Fix de 3 funcoes: syncHistoriesFromRegistros (linhas 1070-1133), syncBudgetsFromRegistros (linhas 1138-1203), syncApproversFromRegistros (linhas 1205-1262)

## Dev Notes

- **Root cause**: Migrations 016-018 usaram `BIGSERIAL` como PK (diferente do padrao UUID usado em 6 outras tabelas), nao criaram o UNIQUE constraint corretamente e as sync functions verificavam existing de forma incorreta (`.select('id').eq('id', ...)` sem filtrar por tenant_id).
- **Estrategia**: Copiar EXATAMENTE o padrao de `syncDeliveriesFromRegistros()` que ja funcionava. Regra de ouro: se 4 tabelas usam UUID PK, a 5a DEVE usar UUID PK tambem.
- **Investigacao**: 3 agentes paralelos investigaram (1) erro atual do sync, (2) comparacao padrao funciona vs nao funciona, (3) LogViewer nao mostrando logs.
- **Licao critica**: CHECK constraints em `integration_log_entries` rejeitavam logs silenciosamente sem erro visivel no frontend. A migration 020 foi necessaria para expandir os valores permitidos.
- **Composite UNIQUE**: O `onConflict: 'tenant_id,espaider_id'` do Supabase EXIGE que o constraint exista no banco; PostgreSQL nao cria automaticamente.

## Change Log

- 2026-02-13: Investigacao e primeira tentativa (migrations 016-018) -- falhou
- 2026-02-13: Correcao final por Claude Code com 3 agentes paralelos (migrations 019-020 + fix sync functions)
