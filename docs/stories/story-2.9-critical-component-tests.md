# Story 2.9 - Testes de Componentes Criticos

Status: Ready
Epic: UX-EPIC-01
Prioridade: Alta
Sprint: 3
Esforco estimado: 24h

## Executor Assignment

executor: @qa
quality_gate: @dev
quality_gate_tools: [coverage-report, test-execution]

## CodeRabbit Integration

> **CodeRabbit Integration**: Disabled

## User Story

Como time de desenvolvimento,
quero cobertura de testes adequada nos componentes criticos e server actions,
para refatorar com confianca e detectar regressoes antes de chegar a producao.

## Acceptance Criteria

1. Testes de regressao para cronogramas (subcomponentes apos decomposicao Story 2.4).
2. Testes de regressao para dashboard-content.
3. Testes para `FilterBar.tsx` e `FilterControl.tsx` (895 linhas sem testes atualmente).
4. Testes para as 5 Server Actions (projects, lm-models, agent-types, lm-providers, sync).
5. Testes de a11y basicos (axe-core matchers) para telas criticas.
6. Coverage total de `src/` > 60% (medido via `vitest --coverage`).
7. Coverage gate no CI: fail if coverage < 50%.

## Tasks

- [ ] Criar testes para `src/components/filters/FilterBar.tsx`
- [ ] Criar testes para `src/components/filters/FilterControl.tsx`
- [ ] Criar testes de regressao para subcomponentes de cronogramas
- [ ] Criar testes de regressao para dashboard-content (KPIs, graficos, filtros)
- [ ] Criar testes para `src/app/actions/projects.ts`
- [ ] Criar testes para `src/app/actions/lm-models.ts`
- [ ] Criar testes para `src/app/actions/agent-types.ts`
- [ ] Criar testes para `src/app/actions/lm-providers.ts`
- [ ] Criar testes para `src/app/actions/sync.ts`
- [ ] Adicionar axe-core matchers (`@axe-core/react` ou `jest-axe`) em testes de tela
- [ ] Configurar `vitest --coverage` com threshold de 50% no CI
- [ ] Atualizar `.github/workflows/ci.yml` com coverage gate
- [ ] Medir e reportar coverage atual vs target

## Testes

- [ ] FilterBar: render, aplicar filtro, limpar filtros, busca, filtros avancados
- [ ] FilterControl: cada tipo de controle (select, multi-select, date-range, checkbox)
- [ ] Cronogramas: KPIs calculados, navegacao calendario, filtros
- [ ] Dashboard: KPIs renderizados, drill-down funcional
- [ ] Server Actions: CRUD operations com mocks de Supabase
- [ ] a11y: axe-core scan de login, dashboard, projetos (zero critical)

## File List

- src/components/filters/__tests__/FilterBar.test.tsx (NOVO)
- src/components/filters/__tests__/FilterControl.test.tsx (NOVO)
- src/app/cronogramas/__tests__/cronogramas.test.tsx (NOVO)
- src/app/dashboard/__tests__/dashboard-content.test.tsx (NOVO ou EXPANDIR)
- src/app/actions/__tests__/projects.test.ts (NOVO)
- src/app/actions/__tests__/lm-models.test.ts (NOVO)
- src/app/actions/__tests__/agent-types.test.ts (NOVO)
- src/app/actions/__tests__/lm-providers.test.ts (NOVO)
- src/app/actions/__tests__/sync.test.ts (NOVO)
- vitest.config.ts (MODIFICAR - coverage config)
- .github/workflows/ci.yml (MODIFICAR - coverage gate)

## Dev Notes

### Source Tree Relevante
- `vitest.config.ts` (29 linhas) — jsdom, v8 coverage, globals
- `vitest.setup.ts` — setup file
- `.github/workflows/ci.yml` — CI pipeline (lint, typecheck, format, test, rls, build)
- 19 arquivos de teste existentes em `src/**/__tests__/`

### Coverage Baseline Atual
- Medir com `npx vitest --coverage` antes de comecar esta story
- Target: > 60% (partindo do baseline atual)

### Testing Standards
- Framework: vitest + @testing-library/react
- Mock pattern: vi.mock para Supabase client
- a11y: jest-axe ou @axe-core/react matchers

## Change Log

| Date | Version | Description | Author |
|------|---------|-------------|--------|
| 2026-02-27 | 1.0 | Story criada | Orion (aios-master) |
| 2026-02-27 | 1.1 | PO validation: added Executor, Dev Notes, Change Log | Pax (po) |

## Dependencies

- Story 2.4 (componentes de cronogramas decompostos)
- Story 2.5 (componentes de projetos decompostos)
- Story 2.6 (domain logic extraida e testavel)
- Story 2.8 (axe-core instalado e configurado)

## Blocks

- Story 2.12 (AI guide documenta padroes validados por testes)
