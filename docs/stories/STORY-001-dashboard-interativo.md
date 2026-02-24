# Story 1: Dashboard Interativo com KPIs e Drill-Down

**ID**: STORY-001
**Status**: Ready
**Sprint**: 1
**Priority**: High
**Points**: 13

## User Story

As a project manager, I want an interactive dashboard with clickable KPIs, charts, and drill-down capabilities, so that I can quickly assess portfolio health and navigate to specific projects without leaving the page.

## Acceptance Criteria

- [x] 8 KPIs de gerente exibidos no dashboard: total, ativos, concluidos, atrasados, alta prioridade, importancia especial, taxa conclusao, areas
- [x] KPIs sao clicaveis e filtram a lista de projetos inline com scroll automatico
- [x] Toggle filter: clicar no mesmo KPI desativa o filtro
- [x] 3 graficos interativos renderizados com Recharts: Pipeline (bar chart), Distribuicao (donut chart), Tendencia (line chart)
- [x] Graficos clicaveis filtram projetos por status com highlight visual
- [x] Drill-down completo: KPI/grafico click gera lista filtrada inline, clique no projeto abre SplitView com ProjectCockpit
- [x] Projetos Recentes clicaveis abrem SplitView com ProjectCockpit
- [x] ProjectFilters component com quick filters (chips) e Sheet com multi-select pills e 12 filtros avancados
- [x] ProjectTable (grid enriquecido) com 9 colunas ordenaveis: projeto, area, responsavel, fase, prioridade, prazo, impacto, mensagem, status
- [x] Dashboard busca projetos com todas as relacoes (schedules, deliveries, histories, approvers, budgets) para SplitView funcionar
- [x] KPIs calculados a partir de chartProjects (dados leves) para performance

## File List

- `src/app/dashboard/page.tsx` -- Pagina principal do dashboard, busca projetos com relacoes completas
- `src/app/dashboard/dashboard-content.tsx` -- Reescrito: 8 KPIs, 3 graficos, drill-down, lista filtrada, SplitView
- `src/components/dashboard/KPICard.tsx` -- Adicionado onClick e estado active para filtro interativo
- `src/components/dashboard/ProjectPipelineChart.tsx` -- Adicionado onBarClick e activeStatus para filtro por status
- `src/components/dashboard/StatusDistributionChart.tsx` -- Adicionado onSegmentClick e activeStatus para filtro por status
- `src/components/filters/ProjectFilters.tsx` -- Novo: quick filters (chips) + Sheet avancado com 12 filtros multi-select
- `src/app/projetos/projects-content.tsx` -- Grid enriquecido com 9 colunas ordenaveis, mensagem_movimentacao e data_movimentacao
- `src/components/views/SplitView.tsx` -- Componente de painel lateral para visualizacao de projeto

## Dev Notes

- Os KPIs sao calculados a partir de `chartProjects` (dados leves sem relacoes) para manter performance, enquanto a lista filtrada usa `UIProject[]` completos para renderizacao rica.
- Charts Recharts: onClick no `<Bar>` e `<Pie>` recebem o data entry completo, permitindo extrair status para filtro.
- `ProjectCockpit.category` foi tornado opcional (`?`) para compatibilidade com o transformer UIProject.
- Componentes Shadcn instalados nesta sprint: calendar, popover, dropdown-menu, command, table.

## Change Log

- 2026-02-13: Implementado por Claude Code (8 melhorias UI/UX - fase P3 Dashboard Interativo)
- 2026-02-24: Validado por @po (Pax) — Score 9.2/10 — GO (sem condições). Status Draft → Ready
