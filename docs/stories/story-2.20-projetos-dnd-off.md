# Story 2.20 — Projetos DnD Off (KanbanBoard readOnly)

Story ID: 2.20
Epic: PRD-UX-2026
Sprint: 2 — Core PRD
Agente: @dev
Esforço: 4h
Prioridade: Alta
Status: Done ✅

## Como usuário

Como usuário do módulo Projetos,
quero que o Kanban de Projetos seja somente leitura (sem arrastar cards),
pois os dados vêm do ERP Espaider e não podem ser modificados pelo portal.

## Contexto

O Kanban de Projetos estava com @dnd-kit instalado e habilitado por padrão. O PRD
especifica que Projetos é read-only (fonte: ERP). A solução foi adicionar a prop `readOnly`
ao componente genérico `KanbanBoard` e usá-la no `ProjectsKanbanView`.

Esta story também cobre a adição da prop `readOnly` ao `KanbanBoard` genérico,
que é um prerequisito para as Stories 2.17 e 2.20.

## Critérios de aceite

### KanbanBoard.tsx (componente genérico)
- [x] Prop `readOnly?: boolean` adicionada (default: `false`)
- [x] Quando `readOnly=true`: `useDraggable` recebe `disabled: true`
- [x] Cursor muda de `grab`/`grabbing` para `pointer` quando `readOnly=true`
- [x] Remove classe `touch-none` em cards quando `readOnly=true`
- [x] Sem feedback visual de drop quando `readOnly=true`

### ProjectsKanbanView.tsx
- [x] Passa `readOnly` (sem valor explícito = `true`) para `KanbanBoard`
- [x] Cards de projeto não são arrastáveis
- [x] Funcionalidade de visualização (clique para detalhe) mantida

## Implementação

### `src/components/views/KanbanBoard.tsx`

```typescript
interface KanbanBoardProps {
  // ...existente
  readOnly?: boolean; // default: false
}

// Em DraggableCard
const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
  id: item.id,
  disabled: readOnly, // ← novo
});

// Classes do card
className={cn(
  readOnly ? 'cursor-pointer' : isDragging ? 'cursor-grabbing' : 'cursor-grab',
  !readOnly && 'touch-none', // ← condicional
)}
```

### `src/app/projetos/components/ProjectsKanbanView.tsx`

```typescript
<KanbanBoard
  // ...outras props
  readOnly  // ← sem DnD, equivale a readOnly={true}
/>
```

## Dependências

- `@dnd-kit/core` — já instalado (não removido, apenas desabilitado via prop)

## Definition of Done

- [x] Prop `readOnly` no KanbanBoard genérico
- [x] ProjectsKanbanView com DnD desabilitado
- [x] CronogramaKanbanView também usa `readOnly` (Story 2.17)
- [x] Build OK sem erros de tipo

## File List

- `src/components/views/KanbanBoard.tsx` ✅ modificado (adicionado `readOnly`)
- `src/app/projetos/components/ProjectsKanbanView.tsx` ✅ modificado (passa `readOnly`)
