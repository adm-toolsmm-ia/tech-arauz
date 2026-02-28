# Story 2.19 — hideCompleted (Ocultar Concluídos por Padrão)

Story ID: 2.19
Epic: PRD-UX-2026
Sprint: 2 — Core PRD
Agente: @dev
Esforço: 3h
Prioridade: Média-Alta
Status: Done ✅

## Como usuário

Como usuário do módulo Cronogramas,
quero que as atividades concluídas fiquem ocultas por padrão,
para focar no que ainda está pendente/em execução sem poluição visual.

## Contexto

O PRD especificou que cronogramas com status "concluída" devem ser excluídos por padrão
das visualizações Kanban e Tabela, com uma forma fácil de incluí-los quando necessário.

## Critérios de aceite

- [x] `CronogramaKanbanView` aceita prop `hideCompleted` (default: `true`) — filtra coluna e itens com status "concluida"
- [x] `CronogramaTableView` aceita prop `hideCompleted` (default: `true`) — filtra linhas com status "concluida"
- [x] Ambas as views usam o mesmo comportamento padrão (ocultar concluídos)
- [x] Quando `hideCompleted=false`, todos os itens são exibidos normalmente
- [x] Prop é controlada pelo componente pai (`cronogramas-content.tsx` ou filtros)

## Implementação

**Padrão adotado:** prop passada de cima para baixo, sem estado interno nas views.

```typescript
// CronogramaKanbanView
const visibleColumns = hideCompleted
  ? columns.filter(c => c.id !== 'concluida')
  : columns;

const visibleItems = hideCompleted
  ? items.filter(i => i.status !== 'concluida')
  : items;

// CronogramaTableView
const filtered = hideCompleted
  ? schedules.filter(s => s.status !== 'concluida')
  : schedules;
```

## Notas

- Story simples — comportamento implementado diretamente nas Stories 2.17 e 2.18
- A UI de toggle (quick filter "Incluir concluídos") é responsabilidade dos filtros (Story 2.21)

## Definition of Done

- [x] Prop `hideCompleted` em ambas as views
- [x] Default `true` em ambas
- [x] Kanban: filtra coluna + itens
- [x] Tabela: filtra linhas

## File List

- `src/app/cronogramas/components/CronogramaKanbanView.tsx` ✅ (prop hideCompleted)
- `src/app/cronogramas/components/CronogramaTableView.tsx` ✅ (prop hideCompleted)
