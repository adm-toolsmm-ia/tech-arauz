---
doc-id: CLAUDE-V01-07
title: Dashboard KPIs e Métricas
scope: 16 KPIs com fórmulas, queries Supabase, thresholds e polling
version: 0.1.0
status: draft
last-updated: 2026-02-05
confidence: Alta
depends-on: [04-database-schema, 06-feature-map, 08-alerts-policies]
---

# Dashboard KPIs e Métricas

> Fontes: `[ref: src/features/dashboard/hooks/useDashboardStats.ts]`, `[ref: src/features/dashboard/hooks/useSLAMetrics.ts]`, `[ref: src/features/dashboard/hooks/useIntegrationStatus.ts]`

Relacionado: [[04-database-schema]] (tabelas consultadas), [[06-feature-map]] (3 dashboards), [[08-alerts-policies]] (regras de alerta baseadas em KPIs)

---

## Visão Geral dos Dashboards

| Dashboard | Rota | Hook principal | Foco |
|---|---|---|---|
| **Geral** | `/` ou `/dashboard` | useDashboardStats | Solicitações abertas, resolvidas, tendências |
| **Gestão** | `/dashboard/gestao` | useGestaoStats + useSLAMetrics | SLA, taxa de resolução, comparativo mensal |
| **Tecnologia** | `/dashboard/tecnologia` | useTechDashboardStats + useIntegrationStatus | APIs, sync, uptime, erros |

---

## KPIs do Dashboard Geral

### KPI-001: Total de Abertas (totalAbertas)
- **Módulo**: Dashboard Geral
- **Fórmula**: `COUNT(*) FROM solicitacoes WHERE data_conclusao IS NULL`
- **Query Supabase**:
  ```ts
  supabase.from('solicitacoes').select('*', { count: 'exact', head: true }).is('data_conclusao', null)
  ```
- **Unidade**: Contagem
- **Threshold sugerido**: > 50 = atenção (ver [[08-alerts-policies]] AL-003)
- **Stale time**: 2 min
- [ref: useDashboardStats.ts:67-70]

### KPI-002: Em Atendimento (emAtendimento)
- **Módulo**: Dashboard Geral
- **Fórmula**: `COUNT(*) FROM solicitacoes WHERE status.nome = 'em andamento'`
- **Query Supabase**:
  ```ts
  supabase.from('solicitacoes').select('*', { count: 'exact', head: true }).eq('status_id', statusMap['em andamento'])
  ```
- **Dependência**: Lookup na tabela `status` para resolver nome → id
- **Stale time**: 2 min
- [ref: useDashboardStats.ts:73-76]

### KPI-003: Resolvidos Hoje (resolvidosHoje)
- **Módulo**: Dashboard Geral
- **Fórmula**: `COUNT(*) FROM solicitacoes WHERE status.nome = 'concluído' AND data_conclusao >= today 00:00`
- **Query Supabase**:
  ```ts
  supabase.from('solicitacoes').select('*', { count: 'exact', head: true })
    .eq('status_id', statusMap['concluído']).gte('data_conclusao', today.toISOString())
  ```
- **Stale time**: 2 min
- [ref: useDashboardStats.ts:79-83]

### KPI-004: Resolvidos no Período (resolvidosPeriodo)
- **Módulo**: Dashboard Geral
- **Fórmula**: `COUNT(*) FROM solicitacoes WHERE status = 'concluído' AND data_conclusao BETWEEN start AND end`
- **Filtros de período**: today | 7days | 30days | month
- **Cálculo de datas**:
  - today: hoje 00:00 → 23:59
  - 7days: -7 dias 00:00 → hoje 23:59
  - 30days: -30 dias 00:00 → hoje 23:59
  - month: dia 1 do mês atual 00:00 → hoje 23:59
- **Stale time**: 2 min
- [ref: useDashboardStats.ts:22-45, 86-91]

### KPI-005: Aguardando (aguardando)
- **Módulo**: Dashboard Geral
- **Fórmula**: `COUNT(*) FROM solicitacoes WHERE status.nome = 'em revisão'`
- **Stale time**: 2 min
- [ref: useDashboardStats.ts:94-97]

### KPI-006: Tempo Médio de Resolução (tempoMedioResolucao)
- **Módulo**: Dashboard Geral
- **Fórmula**: `AVG((data_conclusao - created_at) / 3600000)` para resolvidos no período
- **Query**:
  ```ts
  // Busca todos os resolvidos no período
  const resolvidosData = await supabase.from('solicitacoes')
    .select('created_at, data_conclusao')
    .eq('status_id', statusMap['concluído'])
    .not('data_conclusao', 'is', null)
    .gte('data_conclusao', start).lte('data_conclusao', end)
  // Calcula: (concluido - criado) / (1000 * 60 * 60) para cada, depois média
  ```
- **Unidade**: Horas (arredondado para inteiro)
- **Nota**: Usa `created_at` (não `data_abertura`) como início
- **Stale time**: 2 min
- [ref: useDashboardStats.ts:107-124]

### KPI-007: Total no Período (totalNoPeriodo)
- **Módulo**: Dashboard Geral
- **Fórmula**: `COUNT(*) FROM solicitacoes WHERE created_at BETWEEN start AND end`
- **Stale time**: 2 min
- [ref: useDashboardStats.ts:100-104]

---

## KPIs do Dashboard Gestão

### KPI-008: Tempo Médio Resolução SLA (tempo_medio_resolucao_horas)
- **Módulo**: Dashboard Gestão
- **Fórmula**: `AVG((data_conclusao - data_abertura) / 3600000)` para TODOS concluídos (sem filtro de período)
- **Diferença do KPI-006**: Usa `data_abertura` (não `created_at`) e calcula sobre TODOS os resolvidos
- **Unidade**: Horas (1 casa decimal)
- **Stale time**: 1 min
- [ref: useSLAMetrics.ts:37-42]

### KPI-009: Taxa de Resolução no Prazo (taxa_resolucao_no_prazo)
- **Módulo**: Dashboard Gestão
- **Fórmula**: `(tickets_no_prazo / (tickets_no_prazo + tickets_atrasados)) * 100`
- **Regra**:
  - Se `data_conclusao <= data_previsao` → no prazo
  - Se `data_conclusao > data_previsao` → atrasado
  - Se `data_previsao IS NULL` → considerado no prazo
  - Se não há tickets → 100%
- **Unidade**: Percentual (arredondado)
- **Threshold**: < 80% = atenção (ver [[08-alerts-policies]] AL-004)
- **Stale time**: 1 min
- [ref: useSLAMetrics.ts:44-65]

### KPI-010: Satisfação Média (satisfacao_media)
- **Módulo**: Dashboard Gestão
- **Fórmula**: Hardcoded `4.5`
- **Status**: TODO — campo de avaliação não implementado
- **Stale time**: 1 min
- [ref: useSLAMetrics.ts:73]

> [!warning] Lacuna KPI-010
> Não existe campo de avaliação de satisfação no banco de dados. O valor 4.5 é estático. Ver [[16-risks-gaps]] Q-006.

### KPI-015: Solicitações do Mês (solicitacoes_mes)
- **Módulo**: Dashboard Gestão
- **Fórmula**: `COUNT(*) FROM solicitacoes WHERE data_abertura >= primeiro_dia_mes_atual`
- **Stale time**: 1 min
- [ref: useSLAMetrics.ts:90-93]

### KPI-016: Variação Mensal (variacao_mes)
- **Módulo**: Dashboard Gestão
- **Fórmula**: `((total_mes_atual - total_mes_anterior) / total_mes_anterior) * 100`
- **Regra**: Se mês anterior = 0, variação = 0 (evita divisão por zero)
- **Unidade**: Percentual (arredondado)
- **Stale time**: 1 min
- [ref: useSLAMetrics.ts:103-105]

### KPI-GESTAO-EXTRA: Taxa de Resolução Mensal
- **Fórmula**: `(concluídas_no_mês / total_no_mês) * 100`
- **Stale time**: 1 min
- [ref: useSLAMetrics.ts:108-116]

---

## KPIs do Dashboard Tecnologia

### KPI-011: APIs Ativas (apis_ativas)
- **Módulo**: Dashboard Tecnologia
- **Fórmula**: `COUNT(*) FROM apis WHERE status = 'ativo'`
- **Stale time**: 30 seg
- [ref: useIntegrationStatus.ts:55-58]

### KPI-012: Sincronizações Hoje (sincronizacoes_hoje)
- **Módulo**: Dashboard Tecnologia
- **Fórmula**: `COUNT(*) FROM logs_execucao WHERE iniciado_em >= today 00:00`
- **Stale time**: 30 seg
- [ref: useIntegrationStatus.ts:63-67]

### KPI-013: Erros 24h (erros_24h)
- **Módulo**: Dashboard Tecnologia
- **Fórmula**: `COUNT(*) FROM logs_execucao WHERE status = 'erro' AND iniciado_em >= now() - 24h`
- **Threshold**: > 0 = badge vermelho (ver [[08-alerts-policies]] AL-001)
- **Stale time**: 30 seg
- [ref: useIntegrationStatus.ts:70-76]

### KPI-014: Uptime Médio (uptime_medio)
- **Módulo**: Dashboard Tecnologia
- **Fórmula**: `(COUNT(status='sucesso') / COUNT(*)) * 100` dos logs dos últimos 7 dias
- **Regra**: Se não há logs, uptime = 100%
- **Unidade**: Percentual (1 casa decimal)
- **Threshold**: < 80% = alerta (ver [[08-alerts-policies]] AL-002)
- **Stale time**: 30 seg
- [ref: useIntegrationStatus.ts:79-95]

---

## Uptime por API (useIntegrationStatus)

Além dos KPIs globais, cada API individual tem uptime calculado:
- **Fórmula**: `(sucesso / total)` dos últimos 20 logs daquela API
- **Base**: `logs_execucao WHERE tarefa_id = api.id ORDER BY iniciado_em DESC LIMIT 20`
- **Regra**: Se não há logs, uptime = 100%
- **Stale time**: 30 seg
- **Polling**: refetchInterval de 30 seg

[ref: useIntegrationStatus.ts:17-47]

---

## Gráficos de Tendência

### Solicitações por Dia (useSolicitacoesPorDia)
- **Tipo**: Line chart / Bar chart
- **Query**: Para cada dia no período, COUNT de solicitações por `created_at`
- **Formatação**: ≤7 dias mostra dia da semana (Seg, Ter...); >7 dias mostra DD/MM
- **Stale time**: 5 min
- [ref: useDashboardStats.ts:164-196]

### Solicitações por Tipo (useSolicitacoesPorTipo)
- **Tipo**: Pie chart
- **Query**: Para cada tipo ativo, COUNT de solicitações com `tipo_id` correspondente
- **Filtro**: Só mostra tipos com value > 0
- **Stale time**: 5 min
- [ref: useDashboardStats.ts:200-228]

### Solicitações por Prioridade (useSolicitacoesPorPrioridade)
- **Tipo**: Pie chart
- **Query**: Para cada prioridade ativa, COUNT de solicitações
- **Stale time**: 5 min
- [ref: useDashboardStats.ts:231-258]

---

## Logs de Sync Recentes (useRecentSyncLogs)
- **Query**: `logs_execucao` JOIN `tarefas_sincronizacao` ORDER BY iniciado_em DESC LIMIT 5
- **Stale time**: 10 seg
- **Polling**: refetchInterval 30 seg (auto-refresh)
- [ref: useIntegrationStatus.ts:103-130]

---

## Drill-Down por Status (useSolicitacoesByStatus)
- **Trigger**: Click em KPI card ou gráfico
- **Query**: Busca status.id por nome (ilike), depois todas solicitações com aquele status_id
- **Joins**: status, prioridade, tipo, area
- **Stale time**: 2 min
- [ref: useDashboardStats.ts:262-295]

---

## Resumo de Stale Times e Polling

| Hook | Stale Time | Polling | Dashboard |
|---|---|---|---|
| useDashboardStats | 2 min | — | Geral |
| useSLAMetrics | 1 min | — | Gestão |
| useGestaoStats | 1 min | — | Gestão |
| useTechDashboardStats | 30 seg | — | Tecnologia |
| useIntegrationStatus | 30 seg | — | Tecnologia |
| useRecentSyncLogs | 10 seg | 30 seg | Tecnologia |
| useSolicitacoesPorDia | 5 min | — | Geral |
| useSolicitacoesPorTipo | 5 min | — | Geral |
| useSolicitacoesPorPrioridade | 5 min | — | Geral |
| useRecentSolicitacoes | 2 min | — | Geral |

---

## Regras de Negócio de KPIs

> Separação entre o QUE medir (regra de negócio) e COMO implementar (decisão técnica).

| Regra | Descrição |
|---|---|
| **RN-KPI-01** | O tempo de resolução de uma solicitação é medido da **abertura** até a **conclusão**. Quando `data_abertura` não está disponível, usar `created_at` como fallback. |
| **RN-KPI-02** | Solicitação está "no prazo" se `data_conclusao <= data_previsao`. Se `data_previsao` é NULL, considera-se no prazo. |
| **RN-KPI-03** | Se não há tickets concluídos, a taxa de resolução no prazo é 100% (não zero). |
| **RN-KPI-04** | O uptime de uma API é calculado sobre os últimos 7 dias de execuções. Se não há logs, uptime = 100%. |
| **RN-KPI-05** | KPI-010 (satisfação) deve refletir avaliação real dos usuários. Enquanto o campo não existir, exibir "N/D" (não um valor fictício). |
| **RN-KPI-06** | Variação mensal: se mês anterior teve zero solicitações, variação = 0% (evitar divisão por zero). |

### Distinção KPI-006 vs KPI-008

| Aspecto | KPI-006 (Dashboard Geral) | KPI-008 (Dashboard Gestão) |
| --- | --- | --- |
| **Mede** | Tempo médio de resolução **no período selecionado** | Tempo médio de resolução **SLA geral** |
| **Campo de início** | `created_at` (data de criação no portal) | `data_abertura` (data de abertura no Espaider) |
| **Escopo** | Resolvidos dentro do filtro de período | TODOS os resolvidos (sem filtro) |
| **Uso** | Acompanhamento operacional diário | Visão gerencial consolidada |

> A diferença de campo (`created_at` vs `data_abertura`) é uma inconsistência herdada do protótipo. Ver Q-KPI-004.

---

## Decisões Pendentes

> [!question] Q-KPI-001: KPI-006 vs KPI-008 usam campos diferentes
> KPI-006 calcula tempo de resolução com `created_at` e KPI-008 com `data_abertura`. Isso é intencional? `data_abertura` é mais preciso para o negócio, mas `created_at` pode diferir se o registro foi importado depois. Unificar?

> [!question] Q-KPI-002: Performance de queries N+1
> `useSolicitacoesPorDia` faz uma query por dia (até 30 queries para período de 30 dias). Considerar migrar para uma query com GROUP BY date ou usar RPC no Supabase.

> [!question] Q-KPI-003: Thresholds configuráveis
> Os thresholds de alerta estão hardcoded (>50 abertas, <80% SLA). Devem ser configuráveis pelo admin? Ver [[08-alerts-policies]].

> [!question] Q-KPI-004: Unificar base de cálculo de tempo de resolução
> KPI-006 e KPI-008 usam campos diferentes como "data de início" (`created_at` vs `data_abertura`). Definir: qual é a data oficial de início para cálculo de SLA? Aplicar regra RN-KPI-01 uniformemente?
