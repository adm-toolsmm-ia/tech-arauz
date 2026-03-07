# Log Retention Policy

**Data:** 2026-02-26
**Status:** Archived — Story 1.3 complete, merged into system architecture
**Última atualização:** 2026-03-07
**Escopo:** Story 1.3 - CI and Observability Hardening

## 1. Objetivo

Definir retencao de logs para diagnostico operacional, conformidade minima e controle de custo.

## 2. Escopo de logs

- `sync_logs`: resumo de execucao da sincronizacao.
- `integration_log_entries`: eventos detalhados por request.
- Logs de proxy/API (Next.js e AI service): erros e eventos operacionais.

## 3. Política de retenção

| Fonte | Retenção online | Ação após retenção |
| --- | --- | --- |
| `integration_log_entries` | 90 dias | Purga por janela deslizante |
| `sync_logs` | 180 dias | Purga por janela deslizante |
| Logs de aplicação (stdout/observability backend) | 30 dias | Rotação/expiração automática |
| Eventos críticos de segurança | 365 dias | Arquivo frio (storage de auditoria) |

## 4. Operação e governança

- Execução de limpeza recomendada: diária (job agendado).
- Ordem de limpeza: `integration_log_entries` -> `sync_logs` (preservar FK).
- Logs com segredo/PII devem ser redigidos antes de persistência.
- Alertas:
  - crescimento anormal de volume de logs
  - falha em jobs de retenção

## 5. Execução da purga

### Manual (CLI)

```bash
# Preview do que seria deletado (sem executar)
npm run db:purge-logs -- --dry

# Executar purga
npm run db:purge-logs

# Ver apenas estatísticas de volume
npm run db:purge-logs -- --stats
```

Requer `SUPABASE_URL` e `SUPABASE_SERVICE_ROLE_KEY` no ambiente.

### SQL direto (Supabase SQL Editor)

```sql
-- Preview
SELECT * FROM purge_old_logs(TRUE);

-- Executar
SELECT * FROM purge_old_logs(FALSE);

-- Estatísticas de volume
SELECT * FROM log_volume_stats();
```

### Agendamento recomendado

- **Vercel Cron** (futuro): endpoint `/api/cron/purge-logs` com schedule `0 3 * * *`
- **Manual**: executar `npm run db:purge-logs` semanalmente até volume justificar automação

## 6. Critério de revisão

- Revisão trimestral da política.
- Ajuste de prazos por requisitos legais/compliance e capacidade de storage.

