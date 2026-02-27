# PO Validation Report — UX-EPIC-01

Data: 2026-02-27
Validador: Pax (Product Owner)
Epic: UX-EPIC-01 (12 stories)
Checklist: 10-Point Validation (validate-next-story task)

---

## Validacao Sistematica — 10 Pontos por Story

### Legenda de Checklist

| # | Criterio | Peso |
|---|----------|------|
| 1 | Template Completeness | Estrutura e secoes obrigatorias |
| 2 | File Structure & Source Tree | Paths claros e corretos |
| 3 | UI/Frontend Completeness | Specs de componentes e UX (se aplicavel) |
| 4 | Acceptance Criteria Satisfaction | AC testaveis e completos |
| 5 | Testing Instructions | Abordagem de testes clara |
| 6 | Security Considerations | Requisitos de seguranca (se aplicavel) |
| 7 | Task Sequence Validation | Ordem logica e dependencias |
| 8 | CodeRabbit Integration | N/A (disabled em core-config) |
| 9 | Anti-Hallucination | Claims verificaveis contra codebase |
| 10 | Dev Agent Readiness | Contexto suficiente para implementacao |

---

## Story 2.1 — Design System Documentation

| # | Criterio | Score | Notas |
|---|----------|-------|-------|
| 1 | Template | 7/10 | Falta: Executor Assignment, Dev Notes, Change Log, CodeRabbit skip notice |
| 2 | File Structure | 9/10 | Paths claros com tags (NOVO/REMOVER) |
| 3 | UI/Frontend | 8/10 | Foco em documentacao, nao componentes |
| 4 | AC Satisfaction | 9/10 | 7 ACs testaveis e mensuraveis |
| 5 | Testing | 6/10 | Apenas "verificacao visual" — falta definir como validar que dark mode nao quebrou |
| 6 | Security | N/A | Story de documentacao |
| 7 | Task Sequence | 9/10 | Logica: auditar → documentar → consolidar → validar |
| 8 | CodeRabbit | N/A | Disabled |
| 9 | Anti-Hallucination | 10/10 | Baseado em auditoria real (tailwind.config, globals.css) |
| 10 | Dev Readiness | 7/10 | Falta Dev Notes com source tree e padroes de teste |

**Score: 8.1/10 — GO com melhorias**

**Should-Fix:**
- Adicionar secao `Dev Notes` com source tree relevante (paths exatos de tailwind.config, globals.css, dark-mode.css)
- Expandir secao de testes: como validar dark mode (snapshot visual ou teste de render)
- Adicionar `Executor Assignment`: executor=@ux-design-expert, quality_gate=@dev
- Adicionar skip notice de CodeRabbit

---

## Story 2.2 — ErrorBoundary e Padroes de Estado

| # | Criterio | Score | Notas |
|---|----------|-------|-------|
| 1 | Template | 7/10 | Falta: Executor Assignment, Dev Notes, Change Log |
| 2 | File Structure | 10/10 | 12 arquivos listados com NOVO/MODIFICAR |
| 3 | UI/Frontend | 9/10 | ErrorFallback UI bem especificada |
| 4 | AC Satisfaction | 10/10 | 8 ACs claros e testaveis |
| 5 | Testing | 8/10 | 4 tipos de teste especificados |
| 6 | Security | N/A | Nao e security story |
| 7 | Task Sequence | 9/10 | Criar → aplicar root → aplicar granular → testar |
| 8 | CodeRabbit | N/A | Disabled |
| 9 | Anti-Hallucination | 10/10 | Gap verificado: zero ErrorBoundary no codebase |
| 10 | Dev Readiness | 7/10 | Falta Dev Notes com referencia a layout.tsx atual e providers.tsx |

**Score: 8.7/10 — GO com melhorias**

**Should-Fix:**
- Adicionar Dev Notes com source tree: `src/app/layout.tsx`, `src/components/providers.tsx`
- Adicionar Executor Assignment: executor=@dev, quality_gate=@architect
- AC 7 referencia `AsyncOperationState<T>` — confirmar que AC 10 de story 2.10 nao duplica

---

## Story 2.3 — Persona Journeys

| # | Criterio | Score | Notas |
|---|----------|-------|-------|
| 1 | Template | 7/10 | Falta: Executor Assignment, Dev Notes, Change Log |
| 2 | File Structure | 8/10 | Apenas 1 arquivo novo — simples e correto |
| 3 | UI/Frontend | N/A | Story de documentacao UX |
| 4 | AC Satisfaction | 9/10 | 7 ACs bem definidos |
| 5 | Testing | 5/10 | "Walkthrough" e muito vago — como validar objectively? |
| 6 | Security | N/A | |
| 7 | Task Sequence | 8/10 | Definir personas → mapear jornadas → identificar dores → priorizar |
| 8 | CodeRabbit | N/A | |
| 9 | Anti-Hallucination | 9/10 | Baseado em modulos reais do portal |
| 10 | Dev Readiness | 6/10 | Falta: quais telas existem, quais personas reais usam o sistema |

**Score: 7.4/10 — GO com melhorias**

**Should-Fix:**
- Adicionar Dev Notes com listagem das rotas do portal e mapeamento inicial persona→tela
- Melhorar testes: "Walkthrough" deveria ser checklist com pontos especificos a validar
- Executor Assignment: executor=@ux-design-expert, quality_gate=@pm

---

## Story 2.4 — Decompor cronogramas-content

| # | Criterio | Score | Notas |
|---|----------|-------|-------|
| 1 | Template | 7/10 | Falta: Executor Assignment, Dev Notes, Change Log |
| 2 | File Structure | 10/10 | 10 arquivos com paths claros e tags |
| 3 | UI/Frontend | 9/10 | 5 subcomponentes bem especificados |
| 4 | AC Satisfaction | 10/10 | 9 ACs mensuraveis (LOC target, zero breaking changes) |
| 5 | Testing | 9/10 | 5 tipos de teste de regressao |
| 6 | Security | N/A | Refatoracao |
| 7 | Task Sequence | 9/10 | Mapear → extrair → refatorar → validar → ErrorBoundary |
| 8 | CodeRabbit | N/A | |
| 9 | Anti-Hallucination | 10/10 | 1.263 linhas verificado pela auditoria real |
| 10 | Dev Readiness | 7/10 | Falta Dev Notes com source tree e tipos/interfaces atuais |

**Score: 8.8/10 — GO com melhorias**

**Should-Fix:**
- Adicionar Dev Notes com: imports criticos de cronogramas-content, tipos/interfaces de Schedule, hook useCronogramasFilters
- Executor Assignment: executor=@dev, quality_gate=@architect

---

## Story 2.5 — Decompor projects-content

| # | Criterio | Score | Notas |
|---|----------|-------|-------|
| 1 | Template | 7/10 | Falta: Executor Assignment, Dev Notes, Change Log |
| 2 | File Structure | 10/10 | 11 arquivos com paths claros |
| 3 | UI/Frontend | 9/10 | 5 subcomponentes + charts |
| 4 | AC Satisfaction | 10/10 | 9 ACs mensuraveis |
| 5 | Testing | 9/10 | 5 tipos incluindo DnD e ordenacao |
| 6 | Security | N/A | |
| 7 | Task Sequence | 9/10 | Mesmo padrao bem estruturado de 2.4 |
| 8 | CodeRabbit | N/A | |
| 9 | Anti-Hallucination | 10/10 | 1.161 linhas verificado |
| 10 | Dev Readiness | 7/10 | Falta Dev Notes |

**Score: 8.8/10 — GO com melhorias**

**Should-Fix:**
- Mesmo padrao de 2.4: adicionar Dev Notes com tipos, interfaces, hook useProjetosFilters
- Executor Assignment: executor=@dev, quality_gate=@architect
- Nota: AC7 menciona "logica de dominio restante" — quantificar o que "restante" significa

---

## Story 2.6 — Extract Domain Logic

| # | Criterio | Score | Notas |
|---|----------|-------|-------|
| 1 | Template | 7/10 | Falta: Executor Assignment, Dev Notes, Change Log |
| 2 | File Structure | 10/10 | 16 arquivos mapeados |
| 3 | UI/Frontend | N/A | Story de refatoracao de logica |
| 4 | AC Satisfaction | 9/10 | AC4 "100% cobertura" e ambicioso — OK se scoped a domain/ |
| 5 | Testing | 10/10 | 8 cenarios de teste + regressao |
| 6 | Security | N/A | |
| 7 | Task Sequence | 8/10 | Auditar → criar → atualizar → remover duplicatas → testar |
| 8 | CodeRabbit | N/A | |
| 9 | Anti-Hallucination | 9/10 | Baseado em auditoria (95 LOC extraidas de milhares) |
| 10 | Dev Readiness | 7/10 | Falta Dev Notes com exemplos de calculos inline atuais |

**Score: 8.5/10 — GO com melhorias**

**Should-Fix:**
- Dev Notes com exemplos concretos de calculos inline encontrados na auditoria
- Executor Assignment: executor=@dev, quality_gate=@architect
- Clarificar: schedule-status e schedule-kpi podem ja ter sido criados em 2.4 — task deve dizer "verificar e complementar"

---

## Story 2.7 — Alinhar Auxiliares

| # | Criterio | Score | Notas |
|---|----------|-------|-------|
| 1 | Template | 7/10 | Falta: Executor Assignment, Dev Notes, Change Log |
| 2 | File Structure | 9/10 | 5 arquivos/diretorios |
| 3 | UI/Frontend | 8/10 | Dialog, FilterBar, loading states |
| 4 | AC Satisfaction | 9/10 | 6 ACs claros e mensuraveis (LOC targets) |
| 5 | Testing | 7/10 | 3 testes — poderia ter mais granularidade |
| 6 | Security | N/A | |
| 7 | Task Sequence | 8/10 | Dialog → subcomponentes → filtros → estados → docs |
| 8 | CodeRabbit | N/A | |
| 9 | Anti-Hallucination | 10/10 | Gap verificado em module-standards.md (#3) |
| 10 | Dev Readiness | 7/10 | Falta referencia ao module-standards atual e exemplos |

**Score: 8.1/10 — GO com melhorias**

**Should-Fix:**
- Dev Notes com referencia a module-standards.md secao 5 (gaps atuais)
- Executor Assignment: executor=@dev, quality_gate=@architect

---

## Story 2.8 — Accessibility Baseline

| # | Criterio | Score | Notas |
|---|----------|-------|-------|
| 1 | Template | 7/10 | Falta: Executor Assignment, Dev Notes, Change Log |
| 2 | File Structure | 9/10 | 8+ arquivos listados |
| 3 | UI/Frontend | 10/10 | a11y e completamente frontend |
| 4 | AC Satisfaction | 10/10 | 9 ACs mensuraveis com metricas objetivas (zero critical/serious) |
| 5 | Testing | 9/10 | 4 tipos: axe-core, teclado, contraste, screen reader |
| 6 | Security | N/A | |
| 7 | Task Sequence | 9/10 | Instalar → auditar → corrigir → criar checklist → CI |
| 8 | CodeRabbit | N/A | |
| 9 | Anti-Hallucination | 10/10 | 55 aria-* em 18 files verificado |
| 10 | Dev Readiness | 7/10 | Falta: config atual do eslint, versao do eslint |

**Score: 8.8/10 — GO com melhorias**

**Should-Fix:**
- Dev Notes com: config eslint atual, versao Node, lista de componentes com focus issues conhecidos
- Executor Assignment: executor=@dev, quality_gate=@architect

---

## Story 2.9 — Critical Component Tests

| # | Criterio | Score | Notas |
|---|----------|-------|-------|
| 1 | Template | 7/10 | Falta: Executor Assignment, Dev Notes, Change Log |
| 2 | File Structure | 10/10 | 11 arquivos de teste + 2 config |
| 3 | UI/Frontend | N/A | Story de testes |
| 4 | AC Satisfaction | 9/10 | 7 ACs com metricas (60% coverage, 50% gate) |
| 5 | Testing | 10/10 | Meta-testes — story inteira e sobre testes |
| 6 | Security | N/A | |
| 7 | Task Sequence | 8/10 | Dependencias claras de 2.4-2.8 |
| 8 | CodeRabbit | N/A | |
| 9 | Anti-Hallucination | 10/10 | 19 test files confirmados, gaps verificados |
| 10 | Dev Readiness | 7/10 | Falta: vitest.config atual, coverage atual baseline |

**Score: 8.6/10 — GO com melhorias**

**Should-Fix:**
- Dev Notes com: vitest.config.ts atual, coverage baseline (medir antes de comecar)
- Executor Assignment: executor=@qa, quality_gate=@dev

---

## Story 2.10 — Async Feedback Patterns

| # | Criterio | Score | Notas |
|---|----------|-------|-------|
| 1 | Template | 7/10 | Falta: Executor Assignment, Dev Notes, Change Log |
| 2 | File Structure | 9/10 | 8+ arquivos |
| 3 | UI/Frontend | 9/10 | EmptyState, loading states, toasts |
| 4 | AC Satisfaction | 9/10 | 6 ACs claros |
| 5 | Testing | 8/10 | 3 testes especificos |
| 6 | Security | N/A | |
| 7 | Task Sequence | 8/10 | Hook → regras → loading → empty → retry → docs |
| 8 | CodeRabbit | N/A | |
| 9 | Anti-Hallucination | 9/10 | Sonner ja usado em 14 files (verificado) |
| 10 | Dev Readiness | 7/10 | Falta: como Sonner esta configurado hoje, providers.tsx |

**Score: 8.3/10 — GO com melhorias**

**Should-Fix:**
- Dev Notes com: providers.tsx (Toaster config), uso atual de Sonner
- Executor Assignment: executor=@dev, quality_gate=@architect
- Clarificar relacao com useAsyncOperation da Story 2.2 — evitar duplicacao de hooks

---

## Story 2.11 — Data Fetching Patterns

| # | Criterio | Score | Notas |
|---|----------|-------|-------|
| 1 | Template | 7/10 | Falta: Executor Assignment, Dev Notes, Change Log |
| 2 | File Structure | 9/10 | 4 arquivos de documentacao |
| 3 | UI/Frontend | N/A | Story de arquitetura |
| 4 | AC Satisfaction | 9/10 | 6 ACs claros incluindo ADR |
| 5 | Testing | 6/10 | "Review de code" nao e teste formal |
| 6 | Security | N/A | |
| 7 | Task Sequence | 8/10 | Mapear → definir → documentar → migrar |
| 8 | CodeRabbit | N/A | |
| 9 | Anti-Hallucination | 10/10 | 3 padroes verificados na auditoria |
| 10 | Dev Readiness | 7/10 | Falta: ADR numbering atual, exemplos de inconsistencias |

**Score: 8.0/10 — GO com melhorias**

**Should-Fix:**
- Dev Notes com: numero do proximo ADR, mapeamento completo modulo→padrao da auditoria
- Executor Assignment: executor=@architect, quality_gate=@pm
- Melhorar testes: "review" deveria ser checklist formal de cada modulo

---

## Story 2.12 — AI Context Optimization

| # | Criterio | Score | Notas |
|---|----------|-------|-------|
| 1 | Template | 7/10 | Falta: Executor Assignment, Dev Notes, Change Log |
| 2 | File Structure | 9/10 | 4 arquivos listados |
| 3 | UI/Frontend | N/A | Story de documentacao |
| 4 | AC Satisfaction | 9/10 | 5 ACs claros |
| 5 | Testing | 6/10 | "Validacao manual" — poderia ser mais formal |
| 6 | Security | N/A | |
| 7 | Task Sequence | 8/10 | Atualizar → criar → criar → atualizar → cross-ref |
| 8 | CodeRabbit | N/A | |
| 9 | Anti-Hallucination | 9/10 | module-standards.md real verificado |
| 10 | Dev Readiness | 7/10 | Falta: estado atual de MEMORY.md, localizacao de module-standards |

**Score: 8.0/10 — GO com melhorias**

**Should-Fix:**
- Dev Notes com: path exato de MEMORY.md, estado atual do component-catalog (inexistente)
- Executor Assignment: executor=@architect, quality_gate=@pm

---

## Resumo Consolidado

| Story | Score | Verdict | Issues Criticos | Should-Fix |
|-------|-------|---------|----------------|------------|
| 2.1 | 8.1 | GO | 0 | 4 |
| 2.2 | 8.7 | GO | 0 | 3 |
| 2.3 | 7.4 | GO | 0 | 3 |
| 2.4 | 8.8 | GO | 0 | 2 |
| 2.5 | 8.8 | GO | 0 | 3 |
| 2.6 | 8.5 | GO | 0 | 3 |
| 2.7 | 8.1 | GO | 0 | 2 |
| 2.8 | 8.8 | GO | 0 | 2 |
| 2.9 | 8.6 | GO | 0 | 2 |
| 2.10 | 8.3 | GO | 0 | 3 |
| 2.11 | 8.0 | GO | 0 | 3 |
| 2.12 | 8.0 | GO | 0 | 2 |

**Media geral: 8.3/10**

---

## Verdict Final: GO (todas as 12 stories)

### Zero Issues Criticos (bloqueantes)

Nenhuma story tem informacao tecnicamente incorreta, AC inalcancaveis ou dependencias quebradas. Todas sao implementaveis no estado atual.

### Pattern de Should-Fix Recorrente (aplicar em TODAS)

As 12 stories compartilham os mesmos 3 gaps estruturais:

| Gap | Impacto | Recomendacao |
|-----|---------|-------------|
| **Falta Executor Assignment** | @dev nao sabe quem executa/valida | Adicionar `executor` e `quality_gate` em todas |
| **Falta Dev Notes** | @dev precisa ler docs externos para contexto | Adicionar source tree + snippets relevantes |
| **Falta Change Log** | Sem rastreabilidade de revisoes | Adicionar tabela com v1.0 / 2026-02-27 |

### Recomendacao

**Opcao A (RECOMENDADO):** Aplicar os 3 should-fixes recorrentes em batch (todas as 12 stories de uma vez) e marcar como `Approved`. Esforco: ~30 min.

**Opcao B:** Aprovar as stories como estao e enriquecer Dev Notes sob demanda durante implementacao. Risco: @dev pode precisar de mais contexto e perder tempo.

---

## Dependencias Validadas

O grafo de dependencias esta correto e nao tem ciclos:

```
Sprint 1: 2.1, 2.2, 2.3 (sem deps — OK)
Sprint 2: 2.4←(2.1,2.2), 2.5←(2.1,2.2), 2.6←(2.4,2.5), 2.7←(2.1,2.2)
Sprint 3: 2.8←(2.1), 2.9←(2.4,2.5,2.6,2.8), 2.10←(2.1,2.2)
Sprint 4: 2.11←(2.6), 2.12←(2.4,2.5,2.6,2.9,2.11)
```

Nenhuma dependencia circular. Sequencia logica validada.

---

## Nota sobre Story 2.6 "Blocks: Story 4.1"

A Story 2.6 referencia `Story 4.1` na secao Blocks, mas o epic usa numeracao 2.x. Isso parece ser um erro de referencia — deveria ser `Story 2.11` (data fetching patterns). **Corrigir.**

---

*Validado por Pax (Product Owner) em 2026-02-27*
*Checklist: 10-Point Story Validation (validate-next-story.md)*
— Pax, equilibrando prioridades 🎯
