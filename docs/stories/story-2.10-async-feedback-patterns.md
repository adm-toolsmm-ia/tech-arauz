# Story 2.10 - Padronizar Feedback Async

Status: Ready
Epic: UX-EPIC-01
Prioridade: Media
Sprint: 3
Esforco estimado: 10h

## Executor Assignment

executor: @dev
quality_gate: @architect
quality_gate_tools: [code-review, pattern-consistency-check]

## CodeRabbit Integration

> **CodeRabbit Integration**: Disabled

## User Story

Como usuario do portal,
quero feedback visual consistente e previsivel em todas as operacoes assincronas,
para saber exatamente o que esta acontecendo e poder agir em caso de erro.

## Acceptance Criteria

1. Tipo `AsyncOperationState<T>` definido e usado em operacoes async (ref: Story 2.2).
2. Hook `useAsyncFeedback` criado para encapsular estado + toast + retry + inline message.
3. Regra formal: toast para eventos globais (sync completo, save sucesso), inline message para contexto local (erro de campo, validacao).
4. Loading state padronizado em todas as operacoes de sync: skeleton → content → toast resultado.
5. Empty states padronizados com ilustracao/mensagem + CTA em todas as telas de listagem.
6. Padroes documentados em `docs/design-system.md` (secao "Feedback Patterns").

## Tasks

- [ ] Criar hook `useAsyncFeedback` em `src/hooks/useAsyncFeedback.ts`
- [ ] Definir contrato: toast = global feedback, inline = local feedback
- [ ] Padronizar loading state na operacao de sync (integracoes)
- [ ] Padronizar loading state em CRUD operations (projetos, auxiliares)
- [ ] Criar componente `EmptyState.tsx` reutilizavel com mensagem + CTA
- [ ] Aplicar `EmptyState` em todas as telas de listagem (projetos, cronogramas, agentes, auxiliares)
- [ ] Padronizar mensagens de erro com contexto (nao apenas "Erro ao salvar")
- [ ] Adicionar retry guidado onde aplicavel (sync, operacoes de rede)
- [ ] Documentar padroes em `docs/design-system.md` secao "Feedback Patterns"

## Testes

- [ ] Teste de useAsyncFeedback (transicoes idle → loading → success/error)
- [ ] Teste de EmptyState (render com mensagem e CTA)
- [ ] Teste de retry (click retry → reexecuta operacao)

## File List

- src/hooks/useAsyncFeedback.ts (NOVO)
- src/components/ui/EmptyState.tsx (NOVO)
- src/app/integracoes/integracoes-content.tsx (MODIFICAR - padrao loading)
- src/app/projetos/projects-content.tsx (MODIFICAR - EmptyState)
- src/app/cronogramas/cronogramas-content.tsx (MODIFICAR - EmptyState)
- src/app/agentes/agentes-content.tsx (MODIFICAR - EmptyState)
- src/app/auxiliares/*/content.tsx (MODIFICAR - EmptyState)
- docs/design-system.md (MODIFICAR - secao Feedback Patterns)

## Dev Notes

### Source Tree Relevante
- `src/components/providers.tsx` — Toaster (Sonner) ja configurado aqui
- Sonner usado em 14 arquivos (toast.success, toast.error)
- `src/components/ui/skeletons.tsx` (89 linhas) — SkeletonKPI, SkeletonKanbanCard, SkeletonTableRow
- `src/lib/types/async.ts` — AsyncOperationState<T> (criado na Story 2.2)
- `src/hooks/useAsyncOperation.ts` — hook base (criado na Story 2.2)

### Relacao com Story 2.2
- Story 2.2 cria AsyncOperationState<T> e useAsyncOperation (generico)
- Story 2.10 cria useAsyncFeedback que EXTENDE useAsyncOperation com toast + inline + retry
- NAO duplicar — useAsyncFeedback deve importar e compor sobre useAsyncOperation

### Testing Standards
- Testes em `src/hooks/__tests__/`
- Testes de componente em `src/components/ui/__tests__/`

## Change Log

| Date | Version | Description | Author |
|------|---------|-------------|--------|
| 2026-02-27 | 1.0 | Story criada | Orion (aios-master) |
| 2026-02-27 | 1.1 | PO validation: added Executor, Dev Notes, Change Log, clarified 2.2 relation | Pax (po) |

## Dependencies

- Story 2.1 (design system docs para documentar padroes)
- Story 2.2 (AsyncOperationState<T> e useAsyncOperation ja criados)

## Blocks

- Nenhuma
