# Story 2.2 - Criar ErrorBoundary e Padroes de Estado

Status: Ready for Review
Epic: UX-EPIC-01
Prioridade: Critica
Sprint: 1
Esforco estimado: 12h

## Executor Assignment

executor: @dev
quality_gate: @architect
quality_gate_tools: [code-review, pattern-validation]

## CodeRabbit Integration

> **CodeRabbit Integration**: Disabled

## User Story

Como usuario do portal,
quero que erros de renderizacao sejam capturados graciosamente com opcao de retry,
para nunca ver uma tela branca e sempre ter como recuperar minha sessao.

## Acceptance Criteria

1. Existe `src/components/error/ErrorBoundary.tsx` com fallback UI amigavel.
2. Existe `src/components/error/ErrorFallback.tsx` com mensagem, botao retry e link para suporte.
3. ErrorBoundary aplicado no root layout (`src/app/layout.tsx`).
4. ErrorBoundary granular aplicado em cada content component critico (dashboard, projetos, cronogramas, integracoes, agentes).
5. Existe `src/app/error.tsx` (Next.js App Router error page).
6. Existe `src/app/not-found.tsx` (404 customizado com design consistente).
7. Tipo compartilhado `AsyncOperationState<T>` definido em `src/lib/types/async.ts` com estados `idle | loading | success | error`.
8. Hook `useAsyncOperation<T>` criado com gerenciamento de estado, retry e integracao com toast.

## Tasks

- [x] Criar `src/components/error/ErrorBoundary.tsx` (class component com componentDidCatch)
- [x] Criar `src/components/error/ErrorFallback.tsx` (UI de fallback com retry)
- [x] Aplicar ErrorBoundary no root layout
- [x] Aplicar ErrorBoundary em cada content component critico
- [x] Criar `src/app/error.tsx` seguindo convencao Next.js App Router
- [x] Criar `src/app/not-found.tsx` com design consistente
- [x] Criar `src/lib/types/async.ts` com `AsyncOperationState<T>` e tipos auxiliares
- [x] Criar `src/hooks/useAsyncOperation.ts` com estado + retry + toast
- [x] Testar ErrorBoundary com erro simulado em dev mode

## Testes

- [x] Teste unitario de ErrorBoundary com erro simulado
- [x] Teste de ErrorFallback (render + retry callback)
- [x] Teste de useAsyncOperation (transicoes de estado)
- [ ] Verificacao visual de error.tsx e not-found.tsx

## File List

- src/components/error/ErrorBoundary.tsx (NOVO)
- src/components/error/ErrorFallback.tsx (NOVO)
- src/components/error/__tests__/ErrorBoundary.test.tsx (NOVO)
- src/components/error/__tests__/ErrorFallback.test.tsx (NOVO)
- src/app/layout.tsx (MODIFICADO)
- src/app/error.tsx (NOVO)
- src/app/not-found.tsx (NOVO)
- src/lib/types/async.ts (NOVO)
- src/hooks/useAsyncOperation.ts (NOVO)
- src/hooks/__tests__/useAsyncOperation.test.ts (NOVO)
- src/app/dashboard/page.tsx (MODIFICADO - ErrorBoundary wrap)
- src/app/projetos/page.tsx (MODIFICADO - ErrorBoundary wrap)
- src/app/cronogramas/page.tsx (MODIFICADO - ErrorBoundary wrap)
- src/app/integracoes/page.tsx (MODIFICADO - ErrorBoundary wrap)
- src/app/agentes/page.tsx (MODIFICADO - ErrorBoundary wrap)

## Dev Notes

### Source Tree Relevante
- `src/app/layout.tsx` — root layout onde ErrorBoundary sera aplicado
- `src/components/providers.tsx` — providers wrapper (Toaster, QueryClient, ThemeProvider)
- `src/app/dashboard/dashboard-content.tsx` (592 linhas) — content component a wrappear
- `src/app/projetos/projects-content.tsx` (1.161 linhas) — content component a wrappear
- `src/app/cronogramas/cronogramas-content.tsx` (1.263 linhas) — content component a wrappear

### Nota sobre AsyncOperationState
- O tipo `AsyncOperationState<T>` criado aqui sera reutilizado pela Story 2.10 (useAsyncFeedback)
- Manter o hook `useAsyncOperation` generico para permitir extensao em 2.10

### Testing Standards
- Testes unitarios em `src/components/error/__tests__/`
- Usar vitest + @testing-library/react para simular erros de render

## Change Log

| Date | Version | Description | Author |
|------|---------|-------------|--------|
| 2026-02-27 | 1.0 | Story criada | Orion (aios-master) |
| 2026-02-27 | 1.1 | PO validation: added Executor, Dev Notes, Change Log | Pax (po) |
| 2026-02-27 | 2.0 | Implementation complete: all ACs implemented, 20 tests passing, 0 lint/type errors | Dex (dev) |
| 2026-02-27 | 2.1 | QA review fixes: stable useCallback via useRef, abort tests, unmount cleanup. 24 tests total | Dex (dev) |

## Dependencies

- Nenhuma (pode iniciar imediatamente)

## Blocks

- Story 2.4, 2.5 (decomposicao usa ErrorBoundary como padrao)
- Story 2.10 (feedback async usa AsyncOperationState)
