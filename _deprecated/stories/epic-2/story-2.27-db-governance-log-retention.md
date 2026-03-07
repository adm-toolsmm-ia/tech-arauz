# Story 2.27 — DB Governance (Retenção de Logs)

Story ID: 2.27
Epic: PRD-UX-2026
Sprint: 4 — Segurança e Governança
Agente: @data-engineer / @dev
Esforço: 6h
Prioridade: Média-Alta
Status: Done ✅

## Como usuário

Como responsável técnico,
quero que os logs de integração sejam automaticamente purgados após o período de retenção definido,
para controlar o custo de storage no Supabase e manter a performance das queries.

## Contexto

A Story 1.3 (CI and Observability Hardening) já implementou:
- `docs/architecture/log-retention-policy.md` — política documentada:
  - `integration_log_entries`: retenção de **90 dias**
  - `sync_logs`: retenção de **180 dias**
  - Eventos críticos de segurança: **365 dias**

**Gap identificado:** A política existe apenas como documento. Não há:
- Função SQL que executa a purga
- Job agendado (pg_cron ou script externo)
- Monitoramento de volume de logs

## Critérios de aceite

- [x] `docs/architecture/log-retention-policy.md` define prazos de retenção
- [x] Política define ordem de limpeza: `integration_log_entries` → `sync_logs`
- [x] Migration `041_log_retention_functions.sql` cria função `purge_old_logs()` em PostgreSQL
- [x] Função `purge_old_logs()` respeita os prazos da política:
  - DELETE de `integration_log_entries` com `created_at < NOW() - INTERVAL '90 days'`
  - DELETE de `sync_logs` com `started_at < NOW() - INTERVAL '180 days'`
  - FK safety: sync_logs só deletados se não têm log_entries vinculados
- [x] Função retorna contagem de registros deletados por tabela (para observabilidade)
- [x] Função `log_volume_stats()` adicional para monitoramento de volume
- [x] Modo `p_dry_run` para preview sem deletar
- [x] Script `scripts/db/run-log-retention.mjs` invoca `purge_old_logs()` via Supabase client
- [x] `package.json` expõe script `db:purge-logs`
- [x] Documentado em `log-retention-policy.md` como acionar manualmente (`npm run db:purge-logs`)
- [x] Documentação indica frequência recomendada (semanal manual, futuro: Vercel Cron diário)

## Implementação necessária

### 1. Migration `041_log_retention_functions.sql`

```sql
CREATE OR REPLACE FUNCTION public.purge_old_logs()
RETURNS TABLE (
  table_name TEXT,
  rows_deleted BIGINT
) AS $$
DECLARE
  v_integration_deleted BIGINT;
  v_sync_deleted BIGINT;
BEGIN
  -- Purgar integration_log_entries (90 dias, exceto security events)
  DELETE FROM integration_log_entries
  WHERE created_at < NOW() - INTERVAL '90 days'
    AND COALESCE(log_level, '') != 'security';
  GET DIAGNOSTICS v_integration_deleted = ROW_COUNT;

  -- Purgar sync_logs (180 dias)
  DELETE FROM sync_logs
  WHERE started_at < NOW() - INTERVAL '180 days';
  GET DIAGNOSTICS v_sync_deleted = ROW_COUNT;

  RETURN QUERY VALUES
    ('integration_log_entries', v_integration_deleted),
    ('sync_logs', v_sync_deleted);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### 2. Script `scripts/db/run-log-retention.mjs`

Invoca `purge_old_logs()` via Supabase client e loga o resultado.

### 3. Vercel Cron (opcional, futuro)

Documentar em `log-retention-policy.md` como configurar via `vercel.json`:
```json
{
  "crons": [{ "path": "/api/cron/purge-logs", "schedule": "0 3 * * *" }]
}
```

Ou: rodar `npm run db:purge-logs` manualmente/periodicamente.

## Nota sobre pg_cron

O Supabase free tier não inclui pg_cron. A solução recomendada é script externo
(GitHub Actions scheduled, Vercel Cron, ou execução manual).

## Dependências

- `docs/architecture/log-retention-policy.md` já existe (Story 1.3) ✅
- Verificar se coluna `log_level` existe em `integration_log_entries`

## Definition of Done

- [x] Política de retenção documentada (Story 1.3)
- [x] Função `purge_old_logs()` criada (migration 041)
- [x] Função `log_volume_stats()` criada (migration 041)
- [x] Script CLI `npm run db:purge-logs` funcional (com --dry e --stats)
- [x] Documentação de operação atualizada (seção 5 adicionada)
- [x] Estratégia de agendamento definida (semanal → futuro Vercel Cron)

## File List

- `docs/architecture/log-retention-policy.md` (já existe — atualizar com instrução de execução)
- `supabase/migrations/041_log_retention_functions.sql` (CRIAR)
- `scripts/db/run-log-retention.mjs` (CRIAR)
- `package.json` (modificar — adicionar script `db:purge-logs`)
