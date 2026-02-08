---
doc-id: CLAUDE-V01-08
title: Alertas e Políticas
scope: Regras de alerta, thresholds, canais de notificação, políticas
version: 0.1.0
status: draft
last-updated: 2026-02-05
confidence: Média
depends-on: [07-dashboard-kpis, 09-routines-catalog, 06-feature-map]
---

# Alertas e Políticas

> Status: **Parcialmente implementado**. Alertas visuais existem nos dashboards; alertas ativos (email, Slack) não estão implementados no MVP.

Relacionado: [[07-dashboard-kpis]] (KPIs que disparam alertas), [[09-routines-catalog]] (rotinas monitoradas), [[15-non-functional]] (SLAs)

---

## Alertas Implementados (Visual)

### AL-001: Erros de Sincronização
- **Trigger**: KPI-013 (erros_24h) > 0
- **Canal**: Badge vermelho no Dashboard Tecnologia
- **Dados**: Contagem de execuções com status='erro' nas últimas 24h
- **Ação do usuário**: Navegar para /logs para investigar
- **Confiança**: Alta [ref: useIntegrationStatus.ts:70-76]

### AL-002: Uptime Baixo
- **Trigger**: KPI-014 (uptime_medio) < threshold (ex: 80%)
- **Canal**: Indicador visual no card de API
- **Dados**: Percentual de execuções bem-sucedidas nos últimos 7 dias
- **Threshold**: Não configurável atualmente (visual implícito)
- **Confiança**: Média (threshold não formalizado)

### AL-003: Volume de Tickets Abertos
- **Trigger**: KPI-001 (totalAbertas) acima de valor esperado
- **Canal**: Destaque visual no KPI card (cor, ícone)
- **Threshold**: Não definido formalmente
- **Confiança**: Baixa (alerta implícito pela cor do card)

### AL-004: SLA em Risco
- **Trigger**: KPI-009 (taxa_resolucao_no_prazo) < 80%
- **Canal**: Indicador no Dashboard Gestão
- **Dados**: Taxa calculada sobre todos os tickets concluídos
- **Confiança**: Média

---

## Alertas Propostos (Não Implementados)

### AL-005: Sync Falhou Consecutivamente
- **Trigger**: 3 ou mais execuções consecutivas com status='erro' para mesma API
- **Canal proposto**: Toast persistente + email ao admin
- **Dados**: api_id, últimas 3 mensagens de erro
- **Dependência**: `is_circuit_open()` no banco (threshold = 5, mas ajustar para 3)

### AL-006: Nenhuma Sync nas Últimas 48h
- **Trigger**: `apis.ultima_sincronizacao` > 48h atrás (para APIs ativas)
- **Canal proposto**: Badge de warning no Dashboard Tecnologia
- **Dados**: Nome da API, última data de sync

### AL-007: Projeto sem Movimentação
- **Trigger**: `projetos.data_movimentacao` > 30 dias atrás (projetos não concluídos/cancelados)
- **Canal proposto**: Lista no Dashboard Gestão
- **Dados**: Projetos "estagnados"

### AL-008: Prazo de Projeto Vencido
- **Trigger**: `projetos.prazo_final` < now() AND status NOT IN ('Concluído', 'Cancelado')
- **Canal proposto**: Badge vermelho no Kanban + contagem no Dashboard

---

## Regras de Negócio de Alertas

> Separação entre o QUE alertar (regra de negócio) e COMO alertar (decisão técnica a ser definida nos ADRs).

| Regra | Condição | Ação Esperada |
| --- | --- | --- |
| **RN-AL-01** | `erros_24h > 0` (KPI-013) | Dashboard Tecnologia deve sinalizar visualmente |
| **RN-AL-02** | `uptime_medio < 80%` (KPI-014) | API deve ser destacada com indicador de risco |
| **RN-AL-03** | `taxa_resolucao_no_prazo < 80%` (KPI-009) | Dashboard Gestão deve alertar visualmente |
| **RN-AL-04** | `totalAbertas > threshold` (KPI-001) | Dashboard Geral deve destacar o volume |
| **RN-AL-05** | 3+ execuções consecutivas com erro para mesma API | Notificação ao admin (canal a definir) |
| **RN-AL-06** | API sem sync há 48h+ | Warning no Dashboard Tecnologia |
| **RN-AL-07** | Projeto sem movimentação há 30+ dias (não concluído/cancelado) | Listar no Dashboard Gestão |
| **RN-AL-08** | Prazo de projeto vencido (prazo_final < hoje, status ativo) | Badge vermelho no Kanban |

---

## Canais de Notificação

| Canal | Status | Tecnologia | Uso |
|---|---|---|---|
| **Toast (Sonner)** | Implementado | Sonner v1.7.4 | Feedback imediato de ações |
| **Badge visual** | Implementado | Tailwind CSS + badges | Indicadores em cards/KPIs |
| **Cor de destaque** | Implementado | CSS dinâmico | Thresholds visuais |
| **Email** | Não implementado | — | Alertas assíncronos |
| **Slack** | Não implementado | — | Notificações de equipe |
| **Supabase Realtime** | Não implementado | Supabase Realtime | Push para frontend |

---

## Políticas Transversais

### POL-ALERT-001: Supressão de Alertas
- Não há supressão implementada
- **Proposta**: Após o usuário "ack" um alerta, suprimir por 24h

### POL-ALERT-002: Agrupamento
- Alertas repetidos (mesmo tipo, mesma API) não são agrupados
- **Proposta**: Agrupar por {tipo_alerta, api_id} com contagem

### POL-ALERT-003: Escalonamento
- Não há escalonamento (nível 1 → nível 2)
- **Proposta para futuro**: Se alerta não resolvido em 24h, notificar CTO

---

## Decisões Pendentes

> [!question] Q-AL-001: Thresholds configuráveis
> Thresholds estão implícitos ou hardcoded. Criar tabela `alertas_config` com:
> - tipo_alerta, threshold_valor, canal, destinatários, ativo
> Permitir que admin configure sem deploy?

> [!question] Q-AL-002: Prioridade de implementação de email/Slack
> Alertas por email/Slack são "Won't Have" no MVP. Quando implementar? Fase Beta ou Go-Live? Ver [[18-roadmap-wbs]].

> [!question] Q-AL-003: Supabase Realtime para push
> Supabase oferece Realtime (WebSocket). Usar para push de alertas ao frontend sem polling? Reduziria staleTime e melhoraria latência.
