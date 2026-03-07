# Dashboards — Arquitetura e Documentação

Data: 2026-03-06
Versão: 1.0
Base: Plano Dashboards 10/10, module-standards.md, design-system.md

---

## 1. Visão geral

Os dashboards do Tech Arauz fornecem visões executivas e operacionais sobre projetos e operações, utilizando dados do ERP Espaider (somente leitura). Seguem o blueprint canônico definido em `module-standards.md`.

### 1.1 Dashboards disponíveis

| Rota | Nome | Propósito |
|------|------|-----------|
| `/dashboard/projetos` | Dashboard Projetos | Visão executiva de portfólio, KPIs, gráficos e projetos recentes |
| `/dashboard/operacoes` | Dashboard Operações | Visão de fluxo, gargalos, SLA e históricos de movimentação |

**Nota:** A rota `/dashboard/operacao` (singular) redireciona para `/dashboard/operacoes` por compatibilidade.

---

## 2. Dashboard Projetos

### 2.1 Estrutura

```
DashboardHeader
ErpReadOnlyBanner (variant page)
KPIs (2 linhas: core + executivos)
Charts (Pipeline, Fase, Área, Prazo, Carga, Tendência)
Lista filtrada (condicional ao clique em KPI/gráfico)
Projetos Recentes
SplitView (ProjectCockpit ao clicar em projeto)
```

### 2.2 Componentes principais

| Componente | Arquivo | Descrição |
|-----------|---------|-----------|
| DashboardContent | `src/app/dashboard/projetos/dashboard-content.tsx` | Orquestrador client |
| ProjectsByAreaDashboard | `src/components/charts/projects-by-area-dashboard.tsx` | Gráfico de barras horizontais empilhadas (Concluídos + Ativos) por área |
| ProjectPipelineChart | `src/components/charts/ProjectPipelineChart.tsx` | Pipeline por status |
| ProjectsByPhaseChart | `src/components/charts/projects-by-phase-chart.tsx` | Distribuição por fase |
| ProjectsByDeadlineChart | `src/components/charts/projects-by-deadline-chart.tsx` | Cronograma de entregas |
| ResponsibleWorkloadChart | `src/components/charts/ResponsibleWorkloadChart.tsx` | Carga por responsável |
| CompletedProjectsTrendChart | `src/components/charts/completed-projects-trend-chart.tsx` | Tendência de conclusões |

### 2.3 Projetos por Área (gráfico)

O componente `ProjectsByAreaDashboard` exibe dados em **gráfico de barras horizontais empilhadas** (Recharts):

- Eixo Y: nomes das áreas
- Eixo X: quantidade
- Barras: segmento verde (Concluídos) + segmento azul (Ativos)
- Clique na barra aplica filtro por área e exibe lista correspondente
- Dados: `buildAreaDashboardData(chartProjects)` — agregação por `project.area`

### 2.4 Fonte de dados

- Server: `src/app/dashboard/projetos/page.tsx` — busca `projects` com `schedules`, `deliveries`, `histories`, `approvers`, `budgets`
- Transformação: `dbProjectToUI` em `src/lib/transformers/project.ts`
- KPIs: `computeDashboardKpis` em `src/lib/domain/kpi-calculations.ts`

---

## 3. Dashboard Operações

### 3.1 Estrutura

```
DashboardHeader
ErpReadOnlyBanner (variant page)
KPIs (Projetos no Funil, Aprovação Pendente, Sinal de sobrecarga, Lead Time)
View principal: lista de projetos ativos (ProjectListView)
Charts (Pipeline, Histórico Movimentações, Volume, Transições)
SplitView (ProjectCockpit ao clicar em projeto)
```

### 3.2 Componentes principais

| Componente | Arquivo | Descrição |
|-----------|---------|-----------|
| OperacoesContent | `src/app/dashboard/operacoes/operacoes-content.tsx` | Orquestrador client |
| ProjectPipelineChart | `src/components/charts/ProjectPipelineChart.tsx` | Pipeline por status (clique filtra lista) |
| HistoryMovementsChart | `src/components/dashboard/operation/history-movements-chart.tsx` | Movimentações por responsável ou área |
| HistoryVolumeChart | `src/components/charts/history-volume-chart.tsx` | Volume de movimentações por período |
| HistoryTransitionsChart | `src/components/charts/history-transitions-chart.tsx` | Transições por etapa (step_from/step_to) |

### 3.3 Históricos de movimentação (project_histories)

Todos os gráficos de histórico utilizam a tabela `project_histories`:

| Gráfico | Campos utilizados | Agrupamento |
|---------|-------------------|-------------|
| HistoryMovementsChart | `date`, `to` (responsible_to), `from` (responsible_from), `project.area` | Por responsável ou por área; filtro 7d/30d/tudo |
| HistoryVolumeChart | `date` | Por dia ou semana (últimos 90 dias) |
| HistoryTransitionsChart | `step_from`, `step_to` | Top etapas de destino ou origem |

**Regra:** Somente dados existentes no banco. Nenhum campo inventado.

### 3.4 Métricas heurísticas (tooltips)

- **Aprovação Pendente:** Projetos com status contendo "aprov"
- **Sinal de sobrecarga:** Pessoas com mais de 3 projetos ativos simultâneos (heurística WIP)

### 3.5 Drill-down

- Clique em barra do Pipeline → filtra lista por status
- Clique em linha da lista → abre SplitView com ProjectCockpit

---

## 4. Padrões de UX

### 4.1 Estados vazios

Utilizar `EmptyState` em todos os cenários:

- Sem projetos
- Sem resultado de filtro
- Gráfico sem dados
- Projetos recentes vazios (nenhum com movimentação em 7 dias)

### 4.2 Acessibilidade

- Linhas clicáveis: `role="button"`, `tabIndex={0}`, `onKeyDown` (Enter + Space)
- Affordance de navegação (seta) sempre visível
- `aria-live="polite"` para mudanças de filtro
- Tooltips em métricas heurísticas

### 4.3 Componentes compartilhados

- `DashboardHeader`, `KPICard`, `SplitView`, `ProjectCockpit`
- `EmptyState`, `ErpReadOnlyBanner`
- Recharts para gráficos (BarChart, layout vertical/horizontal)

---

## 5. Referências

- [module-standards.md](./module-standards.md) — Blueprint obrigatório
- [design-system.md](../design-system.md) — Tokens e componentes
- [data-fetching-patterns.md](./data-fetching-patterns.md) — Padrões de dados
- [SCHEMA.md](../../supabase/docs/SCHEMA.md) — Estrutura do banco (project_histories)
