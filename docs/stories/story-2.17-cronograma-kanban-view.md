# Story 2.17 — CronogramaKanbanView Read-Only

Story ID: 2.17
Epic: PRD-UX-2026
Sprint: 2 — Core PRD
Agente: @dev
Esforço: 8h
Prioridade: Alta
Status: Done ✅

## Como usuário

Como usuário do portal,
quero visualizar os cronogramas em formato Kanban agrupados por status,
de forma somente leitura (sem arrastar), para ter uma visão rápida do andamento das atividades.

## Contexto

Módulo Cronogramas anteriormente só tinha visualização Agenda (calendário). O PRD especificou
que a visualização Kanban deveria ser adicionada, agrupando atividades por status do ERP,
sem habilitar drag-and-drop (dados são read-only — origem Espaider).

## Critérios de aceite

- [x] Componente `CronogramaKanbanView.tsx` criado em `src/app/cronogramas/components/`
- [x] Utiliza o componente genérico `KanbanBoard` com prop `readOnly={true}` (sem DnD)
- [x] 4 colunas mapeadas por status: `pendente` (âmbar), `em_execucao` (azul), `atrasada` (vermelho), `concluida` (verde)
- [x] Prop `hideCompleted` (default: `true`) — quando ativada, oculta coluna "concluida" e filtra itens concluídos
- [x] Card de cada atividade exibe: data início, data fim, responsável, fase, badge "Atrasada" se overdue
- [x] Clique no card dispara `onActivityClick` para abrir o `CronogramaCockpit` (SplitView)
- [x] Constante `SCHEDULE_KANBAN_COLUMNS` centraliza o mapeamento status → coluna

## Implementação

### Arquivo: `src/app/cronogramas/components/CronogramaKanbanView.tsx`

**Principais decisões:**
- `readOnly={true}` no `KanbanBoard` — zero drag-and-drop, sem `onStatusChange`
- Filtro duplo: colunas (remove "concluida") + itens (remove status "concluida")
- Badge "Atrasada" com variante `destructive` quando `atrasado === true`
- Metadados no card: `inicio`, `fim`, `fase`

### Arquivo modificado: `src/components/views/KanbanBoard.tsx`

- Adicionada prop `readOnly?: boolean` (default: `false`)
- Quando `readOnly=true`: `disabled: true` no useDraggable, cursor `pointer` (não `grab`), sem feedback visual de drop

## Dependências

- `KanbanBoard.tsx` — prop `readOnly` (implementada junto, sem story separada)
- `CronogramaCockpit.tsx` — já existia

## Definition of Done

- [x] Componente criado e funcional
- [x] read-only aplicado (sem DnD)
- [x] hideCompleted funcional
- [x] Cards com informações corretas
- [x] Build OK, testes passando

## File List

- `src/app/cronogramas/components/CronogramaKanbanView.tsx` ✅ criado
- `src/components/views/KanbanBoard.tsx` ✅ modificado (adicionado `readOnly`)
