# Story 2.21 — viewMode Kanban na FilterBar de Cronogramas

Story ID: 2.21
Epic: PRD-UX-2026
Sprint: 2 — Core PRD
Agente: @dev
Esforço: 3h
Prioridade: Média
Status: Done ✅

## Como usuário

Como usuário do módulo Cronogramas,
quero poder alternar entre as visualizações Agenda, Kanban e Lista
usando o seletor de view na barra de filtros,
para escolher a melhor forma de ver meus cronogramas.

## Contexto

Antes desta story, `filters-cronogramas.ts` registrava apenas os viewModes `agenda` e `lista`.
O PRD adicionou a visualização Kanban como terceira opção. Esta story adiciona o viewMode
`kanban` ao registry de filtros e conecta ao `CronogramaKanbanView` no orchestrador.

## Critérios de aceite

- [x] `filters-cronogramas.ts` inclui `viewMode: 'kanban'` no `filterRegistryCronogramas.viewModes`
- [x] ViewMode `kanban` usa ícone `LayoutTemplate` (Lucide)
- [x] ViewMode `kanban` tem label legível (ex: "Kanban")
- [x] 3 viewModes disponíveis: `agenda` (default), `kanban`, `lista`
- [x] O componente `cronogramas-content.tsx` renderiza `CronogramaKanbanView` quando `viewMode === 'kanban'`
- [x] `ViewToggle` na FilterBar exibe os 3 modos corretamente

## Implementação

### `src/lib/filters/filters-cronogramas.ts`

```typescript
viewModes: [
  { id: 'agenda', label: 'Agenda', icon: CalendarDays },
  { id: 'kanban', label: 'Kanban', icon: LayoutTemplate }, // ← novo
  { id: 'lista',  label: 'Lista',  icon: List },
]
```

### `src/app/cronogramas/cronogramas-content.tsx`

```typescript
{viewMode === 'agenda' && <CronogramaCalendar ... />}
{viewMode === 'kanban' && <CronogramaKanbanView ... />}  // ← novo
{viewMode === 'lista'  && <CronogramaTableView  ... />}
```

## Definition of Done

- [x] 3 viewModes no registry
- [x] CronogramaKanbanView renderiza em `viewMode='kanban'`
- [x] Nenhuma regressão nos modos Agenda e Lista

## File List

- `src/lib/filters/filters-cronogramas.ts` ✅ modificado (adicionado viewMode kanban)
- `src/app/cronogramas/cronogramas-content.tsx` ✅ modificado (condicional kanban)
