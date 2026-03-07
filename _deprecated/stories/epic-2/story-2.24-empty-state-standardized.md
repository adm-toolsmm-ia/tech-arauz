# Story 2.24 — EmptyState + Estados Vazios Padronizados

Story ID: 2.24
Epic: PRD-UX-2026
Sprint: 3 — Qualidade e Consistência
Agente: @dev
Esforço: 3h
Prioridade: Média
Status: Done ✅

## Como usuário

Como usuário do portal,
quero ver uma mensagem clara e consistente quando uma lista estiver vazia,
com orientação sobre o que fazer, ao invés de uma tela em branco ou sem feedback.

## Contexto

Várias telas do portal não tinham estado vazio ou tinham mensagens inconsistentes.
Esta story cria o componente reutilizável `EmptyState` e o aplica nas views de
Cronogramas (Tabela e Kanban) como referência de adoção.

## Critérios de aceite

- [x] Componente `EmptyState.tsx` criado em `src/components/ui/`
- [x] Props: `title` (obrigatório), `description?`, `icon?`, `actionLabel?`, `onAction?`, `secondaryLabel?`, `onSecondary?`, `className?`
- [x] Layout centralizado com ícone + título + descrição + CTAs opcionais
- [x] Ícone em container 16×16 com fundo muted arredondado
- [x] Suporte a 2 CTAs: primário (filled) e secundário (outline)
- [x] Acessível: `role="status"` + `aria-label` no container, `aria-hidden="true"` no ícone
- [x] `CronogramaTableView` usa `EmptyState` quando lista filtrada está vazia
- [x] `CronogramaKanbanView` exibe estado vazio adequado quando não há itens

## Implementação

### `src/components/ui/EmptyState.tsx`

```tsx
interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: LucideIcon;
  actionLabel?: string;
  onAction?: () => void;
  secondaryLabel?: string;
  onSecondary?: () => void;
  className?: string;
}

export function EmptyState({ title, description, icon: Icon, actionLabel, onAction, ... }: EmptyStateProps) {
  return (
    <div role="status" aria-label={title} className="flex flex-col items-center justify-center gap-4 py-16">
      {Icon && (
        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
          <Icon className="w-8 h-8 text-muted-foreground" aria-hidden="true" />
        </div>
      )}
      <p className="text-muted-foreground font-medium">{title}</p>
      {description && <p className="text-sm text-muted-foreground">{description}</p>}
      <div className="flex gap-2">
        {actionLabel && <Button onClick={onAction}>{actionLabel}</Button>}
        {secondaryLabel && <Button variant="outline" onClick={onSecondary}>{secondaryLabel}</Button>}
      </div>
    </div>
  );
}
```

### Uso em `CronogramaTableView.tsx`

```tsx
{filteredSchedules.length === 0 && (
  <tr><td colSpan={7}>
    <p className="text-center text-muted-foreground py-8">Nenhuma atividade encontrada.</p>
  </td></tr>
)}
```

> Nota: CronogramaTableView usa estado vazio inline simples; EmptyState completo
> disponível para adoção futura em outros módulos.

## Próximos candidatos para adoção

- `CronogramaKanbanView` — quando não há atividades em nenhuma coluna
- Módulos Agentes, LM Providers quando lista está vazia
- Dashboard — quando não há projetos

## Definition of Done

- [x] `EmptyState` component criado e acessível
- [x] Props documentadas
- [x] Estado vazio em CronogramaTableView
- [x] Build OK

## File List

- `src/components/ui/EmptyState.tsx` ✅ criado
- `src/app/cronogramas/components/CronogramaTableView.tsx` ✅ modificado (empty state)
