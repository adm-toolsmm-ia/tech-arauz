# Story 2.5 - Decompor projects-content

Status: Ready
Epic: UX-EPIC-01
Prioridade: Alta
Sprint: 2
Esforco estimado: 24h

## Executor Assignment

executor: @dev
quality_gate: @architect
quality_gate_tools: [code-review, component-decomposition-check]

## CodeRabbit Integration

> **CodeRabbit Integration**: Disabled

## User Story

Como desenvolvedor,
quero que `projects-content.tsx` (1.161 linhas) seja decomposto em subcomponentes focados,
para facilitar manutencao, testes e evolucao incremental de UX.

## Acceptance Criteria

1. `projects-content.tsx` reduzido para max 150-200 linhas (orquestracao apenas).
2. Subcomponente `ProjectsKPIBar.tsx` extraido com bloco de 8 KPIs clicaveis.
3. Subcomponente `ProjectsListView.tsx` extraido com grid de 9 colunas ordenaveis.
4. Subcomponente `ProjectsKanbanView.tsx` extraido com kanban board.
5. Subcomponente `ProjectsFilters.tsx` extraido como wrapper de filtros do modulo.
6. Subcomponente `ProjectsCharts.tsx` extraido com 3 graficos (pipeline, distribuicao, tendencia).
7. Logica de dominio restante extraida para `src/lib/domain/project-*.ts`.
8. Zero breaking changes — funcionalidade identica antes e depois.
9. ErrorBoundary aplicado nos subcomponentes criticos.

## Tasks

- [ ] Mapear responsabilidades dentro de projects-content (KPIs, filtros, kanban, lista, graficos, drill-down, cockpit)
- [ ] Criar `src/app/projetos/components/ProjectsKPIBar.tsx`
- [ ] Criar `src/app/projetos/components/ProjectsListView.tsx`
- [ ] Criar `src/app/projetos/components/ProjectsKanbanView.tsx`
- [ ] Criar `src/app/projetos/components/ProjectsFilters.tsx`
- [ ] Criar `src/app/projetos/components/ProjectsCharts.tsx`
- [ ] Extrair logica de dominio para `src/lib/domain/project-kpi.ts`
- [ ] Extrair logica de dominio para `src/lib/domain/project-overdue.ts`
- [ ] Mover calculos duplicados (dashboard ↔ projetos) para domain compartilhado
- [ ] Refatorar `projects-content.tsx` para orquestrar subcomponentes
- [ ] Validar que drill-down KPI → lista filtrada → SplitView funciona identico
- [ ] Aplicar ErrorBoundary nos subcomponentes

## Testes

- [ ] Teste de regressao de 8 KPIs (valores identicos antes/depois)
- [ ] Teste de drill-down: KPI click → lista filtrada → SplitView
- [ ] Teste de Kanban DnD (drag and drop entre colunas)
- [ ] Teste de ordenacao por coluna na lista
- [ ] Testes unitarios para project-kpi.ts e project-overdue.ts

## File List

- src/app/projetos/projects-content.tsx (REFATORAR)
- src/app/projetos/components/ProjectsKPIBar.tsx (NOVO)
- src/app/projetos/components/ProjectsListView.tsx (NOVO)
- src/app/projetos/components/ProjectsKanbanView.tsx (NOVO)
- src/app/projetos/components/ProjectsFilters.tsx (NOVO)
- src/app/projetos/components/ProjectsCharts.tsx (NOVO)
- src/lib/domain/project-kpi.ts (NOVO)
- src/lib/domain/project-overdue.ts (NOVO)
- src/lib/domain/__tests__/project-kpi.test.ts (NOVO)
- src/lib/domain/__tests__/project-overdue.test.ts (NOVO)
- src/app/dashboard/dashboard-content.tsx (MODIFICAR - usar domain compartilhado)

## Dev Notes

### Source Tree Relevante
- `src/app/projetos/projects-content.tsx` (1.161 linhas) — arquivo a decompor
- `src/app/projetos/page.tsx` — server page com query principal (projects + relacoes)
- `src/hooks/useProjetosFilters.ts` (261 linhas) — hook de filtros
- `src/lib/filters/filters-projetos.ts` (190 linhas) — filter registry
- `src/lib/domain/project-health.ts` (50 linhas) — domain ja extraido
- `src/lib/domain/project-priority.ts` (34 linhas) — domain ja extraido
- `src/lib/domain/project-phase.ts` (11 linhas) — domain ja extraido
- `src/lib/transformers/project.ts` — transformacao DB→UI
- `src/components/views/KanbanBoard.tsx` — kanban reutilizavel
- `src/components/views/ProjectListView.tsx` — lista reutilizavel
- `src/components/views/SplitView.tsx` — detalhe lateral reutilizavel
- `src/components/project/ProjectCockpit.tsx` — cockpit 360

### Nota sobre "logica de dominio restante"
- AC7 diz "restante" = calculos de KPI (total, ativos, concluidos, atrasados, alta prioridade, importancia especial, taxa conclusao, areas) que estao inline no content
- Calculos de "overdue" (getOverdueData ou similar) que estao duplicados com dashboard

### Testing Standards
- Testes em `src/app/projetos/__tests__/` (ja existem integration tests)
- Expandir testes existentes para cobrir subcomponentes novos

## Change Log

| Date | Version | Description | Author |
|------|---------|-------------|--------|
| 2026-02-27 | 1.0 | Story criada | Orion (aios-master) |
| 2026-02-27 | 1.1 | PO validation: added Executor, Dev Notes, Change Log | Pax (po) |

## Dependencies

- Story 2.1 (design system docs como referencia)
- Story 2.2 (ErrorBoundary disponivel)

## Blocks

- Story 2.6 (domain extraction inclui outputs desta story)
- Story 2.9 (testes de componentes decompostos)
