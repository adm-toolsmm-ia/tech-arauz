# Story 2.4 - Decompor cronogramas-content

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
quero que `cronogramas-content.tsx` (1.263 linhas) seja decomposto em subcomponentes focados,
para facilitar manutencao, testes e evolucao incremental de UX.

## Acceptance Criteria

1. `cronogramas-content.tsx` reduzido para max 150-200 linhas (orquestracao apenas).
2. Subcomponente `CronogramasKPIBar.tsx` extraido com bloco de KPIs.
3. Subcomponente `CronogramaCalendar.tsx` extraido com visualizacao de calendario mes/semana.
4. Subcomponente `CronogramaList.tsx` extraido com visualizacao em lista.
5. Subcomponente `CronogramaFilters.tsx` extraido como wrapper de filtros do modulo.
6. Subcomponente `CronogramaCockpit.tsx` extraido com detalhe lateral (SplitView).
7. Logica de dominio de cronogramas extraida para `src/lib/domain/schedule-*.ts`.
8. Zero breaking changes — funcionalidade identica antes e depois.
9. ErrorBoundary aplicado nos subcomponentes criticos.

## Tasks

- [ ] Mapear responsabilidades dentro de cronogramas-content (KPIs, filtros, calendario, lista, cockpit, estado)
- [ ] Criar `src/app/cronogramas/components/CronogramasKPIBar.tsx`
- [ ] Criar `src/app/cronogramas/components/CronogramaCalendar.tsx`
- [ ] Criar `src/app/cronogramas/components/CronogramaList.tsx`
- [ ] Criar `src/app/cronogramas/components/CronogramaFilters.tsx`
- [ ] Criar `src/app/cronogramas/components/CronogramaCockpit.tsx`
- [ ] Extrair logica de dominio para `src/lib/domain/schedule-status.ts`
- [ ] Extrair logica de dominio para `src/lib/domain/schedule-kpi.ts`
- [ ] Refatorar `cronogramas-content.tsx` para orquestrar subcomponentes
- [ ] Validar que nenhuma funcionalidade foi perdida
- [ ] Aplicar ErrorBoundary nos subcomponentes

## Testes

- [ ] Teste de regressao de KPIs (valores identicos antes/depois)
- [ ] Teste de navegacao calendario mes/semana
- [ ] Teste de filtros aplicados corretamente
- [ ] Teste de abertura de cockpit lateral
- [ ] Testes unitarios para schedule-status.ts e schedule-kpi.ts

## File List

- src/app/cronogramas/cronogramas-content.tsx (REFATORAR)
- src/app/cronogramas/components/CronogramasKPIBar.tsx (NOVO)
- src/app/cronogramas/components/CronogramaCalendar.tsx (NOVO)
- src/app/cronogramas/components/CronogramaList.tsx (NOVO)
- src/app/cronogramas/components/CronogramaFilters.tsx (NOVO)
- src/app/cronogramas/components/CronogramaCockpit.tsx (NOVO)
- src/lib/domain/schedule-status.ts (NOVO)
- src/lib/domain/schedule-kpi.ts (NOVO)
- src/lib/domain/__tests__/schedule-status.test.ts (NOVO)
- src/lib/domain/__tests__/schedule-kpi.test.ts (NOVO)

## Dev Notes

### Source Tree Relevante
- `src/app/cronogramas/cronogramas-content.tsx` (1.263 linhas) — arquivo a decompor
- `src/app/cronogramas/page.tsx` — server page que renderiza cronogramas-content
- `src/hooks/useCronogramasFilters.ts` (270 linhas) — hook de filtros do modulo
- `src/lib/filters/filters-cronogramas.ts` (185 linhas) — filter registry
- `src/components/views/SplitView.tsx` — componente reutilizavel de detalhe lateral
- `src/components/dashboard/KPICard.tsx` — card de KPI reutilizavel
- `src/components/filters/FilterBar.tsx` (445 linhas) — barra de filtros

### Tipos e Interfaces Chave
- UISchedule (em transformers/project.ts) — tipo transformado de schedule
- UIProject — projeto pai dos cronogramas

### Testing Standards
- Testes em `src/app/cronogramas/__tests__/`
- Testes de dominio em `src/lib/domain/__tests__/`
- Usar vitest + @testing-library/react

## Change Log

| Date | Version | Description | Author |
|------|---------|-------------|--------|
| 2026-02-27 | 1.0 | Story criada | Orion (aios-master) |
| 2026-02-27 | 1.1 | PO validation: added Executor, Dev Notes, Change Log | Pax (po) |

## Dependencies

- Story 2.1 (design system docs como referencia de padroes)
- Story 2.2 (ErrorBoundary disponivel para wrapping)

## Blocks

- Story 2.6 (domain extraction inclui outputs desta story)
- Story 2.9 (testes de componentes decompostos)
