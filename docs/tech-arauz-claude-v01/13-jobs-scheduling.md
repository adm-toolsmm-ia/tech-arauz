---
doc-id: CLAUDE-V01-13
title: Jobs, Agendamento e Idempotência
scope: Cron jobs, pg_cron, runbooks, retry, deduplicação
version: 0.1.0
status: draft
last-updated: 2026-02-05
confidence: Média
depends-on: [09-routines-catalog, 05-espaider-integration, 04-database-schema]
---

# Jobs, Agendamento e Idempotência

> Fonte: `[ref: supabase/migrations/20260119210400_sync_cron.sql]`, `[ref: supabase/functions/sync-espaider/index.ts]`

Relacionado: [[09-routines-catalog]] (rotinas agendáveis), [[05-espaider-integration]] (pipeline de sync), [[04-database-schema]] (tarefas_sincronizacao, sync_jobs_config)

---

## Tabelas de Agendamento

### tarefas_sincronizacao
> Job definitions com scheduling granular. Ver [[04-database-schema]]

| Campo | Uso |
|---|---|
| frequencia | diario / semanal / mensal / manual |
| horario | Hora de execução (ex: "06:00") |
| dias_semana | Array de dias (0=domingo, 6=sábado) |
| dia_mes | Dia do mês para frequência mensal |
| cron_schedule | Expressão cron completa (ex: "0 6 * * *") |
| timezone | Default: "America/Sao_Paulo" |
| prioridade | 1-10 (1 = mais alta) |
| api_id | FK → apis (API a sincronizar) |
| ativo | boolean (default: **false**) |

### sync_jobs_config
> Configuração de jobs pg_cron

| Campo | Uso |
|---|---|
| nome | Nome do job |
| schedule | Expressão cron |
| edge_function | Nome da edge function a invocar |
| ativo | boolean |

---

## Schedules Atuais

| Job | Schedule | Target | Status |
|---|---|---|---|
| Sync Espaider Projetos | Configurável (ex: `0 6 * * *`) | sync-espaider | **Inativo por padrão** |
| Sync Solicitações | Configurável | sync-solicitacoes | **Inativo por padrão** |

> [!warning] Jobs inativos
> Todos os jobs estão com `ativo=false` por padrão. Necessitam ativação manual via:
> 1. UI: /automacoes ou /tarefas
> 2. SQL: `UPDATE tarefas_sincronizacao SET ativo = true WHERE id = '...'`

---

## pg_cron

**Mecanismo**: Extensão PostgreSQL que executa queries/functions em schedule cron.

**Fluxo**:
```
pg_cron lê schedule → executa query → invoca edge function via HTTP
```

**Configuração**: Via migration SQL
[ref: supabase/migrations/20260119210400_sync_cron.sql]

**Timezone**: Jobs usam UTC internamente. A coluna `timezone` em `tarefas_sincronizacao` é para referência, mas a conversão deve ser feita no cron_schedule.

---

## Idempotência

### Estratégia: UPSERT com onConflict

A sincronização Espaider usa UPSERT com `id_espaider` como chave de conflito:

```typescript
// Projetos
await supabase.from('projetos').upsert(records, { onConflict: 'id_espaider' })

// Entregas
await supabase.from('entregas_projeto').upsert(records, { onConflict: 'id_espaider' })

// Cronogramas e Requisitos: mesma estratégia
```

**Resultado**: Executar a mesma sync múltiplas vezes produz o mesmo resultado (idempotente).

---

## Deduplicação

### Em memória durante sync

```typescript
const projetoMap = new Map<number, ProjetoRecord>();
for (const registro of registros) {
  const idEspaider = registro.id_espaider;
  projetoMap.set(idEspaider, registro); // último registro prevalece
}
const deduplicated = Array.from(projetoMap.values());
```

**Cenário**: Se a paginação retornar o mesmo registro em páginas diferentes, o Map garante unicidade.

[ref: sync-espaider/index.ts]

### No banco via UNIQUE constraint

```sql
-- Projetos
CREATE UNIQUE INDEX ON projetos (id_espaider) WHERE id_espaider IS NOT NULL;

-- Entregas, Cronogramas, Requisitos: mesma estratégia
```

**Double safety**: Deduplicação em memória + constraint no banco.

---

## Concorrência e Locks

> [!warning] Sem lock de concorrência
> Não há mecanismo para prevenir duas execuções simultâneas da mesma sync. Se pg_cron e execução manual coincidirem, ambas rodarão em paralelo.
> **Risco**: Possível race condition no UPSERT (mitigado pelo onConflict, mas pode causar logs duplicados).

**Proposta de mitigação**:
1. Advisory lock no PostgreSQL antes de iniciar sync
2. Verificar se já existe `logs_execucao` com status='em_andamento' para a mesma tarefa
3. Circuit breaker via `is_circuit_open()` — já implementado

---

## Runbooks

### Executar Sync Manual

```bash
# Via curl (direto na edge function)
curl -X POST https://{project_id}.supabase.co/functions/v1/sync-espaider \
  -H "Authorization: Bearer {SERVICE_ROLE_KEY}" \
  -H "Content-Type: application/json" \
  -d '{"api_id": "uuid-da-api"}'
```

### Diagnosticar Falha de Sync

```sql
-- Últimas 10 execuções com erro
SELECT id, tarefa_id, status, mensagem_erro, duracao_ms, iniciado_em
FROM logs_execucao
WHERE status = 'erro'
ORDER BY iniciado_em DESC
LIMIT 10;

-- Verificar se circuit breaker está aberto
SELECT is_circuit_open('uuid-da-tarefa');

-- Última sincronização por API
SELECT nome, ultima_sincronizacao FROM apis WHERE ativo = true;
```

### Ativar Job Agendado

```sql
-- Ativar sync diária às 6h
UPDATE tarefas_sincronizacao
SET ativo = true, cron_schedule = '0 6 * * *', timezone = 'America/Sao_Paulo'
WHERE nome = 'Sync Espaider Projetos';
```

### Verificar Saúde dos Jobs

```sql
-- Jobs ativos com próxima execução
SELECT nome, cron_schedule, ultima_execucao, proxima_execucao, ativo
FROM tarefas_sincronizacao
WHERE ativo = true
ORDER BY proxima_execucao;

-- Taxa de sucesso últimos 7 dias
SELECT
  tarefa_id,
  COUNT(*) as total,
  COUNT(*) FILTER (WHERE status = 'sucesso') as sucesso,
  ROUND(COUNT(*) FILTER (WHERE status = 'sucesso')::numeric / COUNT(*) * 100, 1) as taxa_sucesso
FROM logs_execucao
WHERE iniciado_em >= NOW() - INTERVAL '7 days'
GROUP BY tarefa_id;
```

---

## Decisões Pendentes

> [!question] Q-JOB-001: Frequência ideal de sync
> Definir com o CTO: diária (6h), a cada 12h, ou a cada 4h? Depende da volumetria e necessidade de atualização. Ver [[16-risks-gaps]] Q-001.

> [!question] Q-JOB-002: Lock de concorrência
> Implementar advisory lock ou verificação de execução em andamento para prevenir race conditions?

> [!question] Q-JOB-003: Janela de manutenção
> Definir janela onde syncs não devem rodar (ex: backups, manutenção do Espaider).

> [!question] Q-JOB-004: Retry automático pós-falha
> Se uma sync falha, deve tentar novamente automaticamente? Com qual delay? Atualmente o retry é por request individual (3x backoff), mas não por job inteiro.
