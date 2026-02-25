# Plano de Implementação — Módulo Cronogramas (Visualizações e Filtros)

**Status:** Implementado  
**Data:** 2025-02-25

## Objetivo

Ajustar formas de visualização (Gantt, Lista, Agenda), períodos (Dia, Semana, Mês), filtro padrão por status de projeto e UX do Gantt no módulo de Cronogramas.

## Regras de Negócio Implementadas

### Formas de Visualização

- **Agenda** (padrão): visualização em calendário com períodos Dia, Semana ou Mês
- **Gantt**: gráfico de Gantt com cronogramas de projetos iniciado/em execução
- **Lista**: grid de atividades em cards (sem calendário)

### Períodos da Agenda

- **Dia**: visualização diária
- **Semana**: visualização semanal (7 dias)
- **Mês**: visualização mensal

### Filtros Padrão

- **Projetos ativos**: cronogramas apenas de projetos com status diferente de concluído e cancelado (aplicado globalmente)

### Gantt

- Exibe apenas projetos com status **iniciado** ou **em execução**
- Janela de datas baseada nos dados (sem colunas futuras vazias desnecessárias)
- Controles de período (Dia/Semana/Mês) sempre visíveis
- Interface em PT-BR

## Arquivos Modificados

| Arquivo | Alterações |
|---------|------------|
| `src/lib/filters/filter-types.ts` | AgendaPeriod, onAgendaPeriodChange, initialAgendaPeriod |
| `src/lib/filters/filters-cronogramas.ts` | viewModes (agenda, gantt, lista), agendaPeriods |
| `src/hooks/useFilterState.ts` | initialViewMode opcional |
| `src/hooks/useCronogramasFilters.ts` | Filtro projeto ativo, agendaPeriod, setAgendaPeriod |
| `src/components/filters/FilterBar.tsx` | Seletor de período Agenda, placeholder PT-BR |
| `src/app/cronogramas/cronogramas-content.tsx` | Roteamento views, FilterBar sticky, finalFilteredSchedules na lista |
| `src/components/cronogramas/CronogramaGantt.tsx` | Filtro iniciado/em execução, janela de datas dinâmica, UX |

## Critérios de Aceite

- [x] Formas: Gantt, Lista, Agenda (padrão Agenda)
- [x] Períodos Agenda: Dia, Semana, Mês (padrão Dia)
- [x] FilterBar e seletor de período sempre visíveis (sticky)
- [x] Gantt em PT-BR; apenas projetos iniciado/em execução
- [x] Gantt: janela de datas baseada em dados, sem colunas vazias
- [x] Filtro padrão: projetos ≠ concluído e ≠ cancelado
- [x] Lista: view dedicada com grid de atividades

## Referência para Composer

Ao manter ou estender o módulo de Cronogramas:

1. **Estado de visualização**: `viewMode` (agenda | gantt | lista) e `agendaPeriod` (day | week | month) vêm de `useCronogramasFilters`
2. **Filtro de projeto**: aplicado em `useCronogramasFilters` via `isProjectActive()` antes dos demais filtros
3. **Gantt**: filtro adicional `isProjectActiveForGantt()` (iniciado/em execução) em `CronogramaGantt.tsx`
4. **FilterBar**: componente controlado; recebe `currentViewMode`, `currentAgendaPeriod`, `onAgendaPeriodChange`
