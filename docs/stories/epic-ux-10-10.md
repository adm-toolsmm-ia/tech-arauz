# Epic: UX/UI, Design System e Engenharia 10/10

Epic ID: UX-EPIC-01
Data: 2026-02-27
Base: `docs/prd/PLANO-ACAO-10-10.md`

Status: Ready

## Objetivo

Elevar o portal Tech Arauz para nota 10/10 em UX/UI, Design System, engenharia frontend e arquitetura de software, com base nos gaps identificados pelo Brownfield Discovery (2026-02-26) e auditoria profunda de codigo (2026-02-27).

## Escopo

- Documentacao formal de design system, tokens e catalogo de componentes
- ErrorBoundary e padroes de estado declarativos
- Formalizacao de jornadas por persona
- Decomposicao de componentes monoliticos (cronogramas 1.263 LOC, projects 1.161 LOC)
- Extracao completa de domain logic para camada compartilhada
- Alinhamento de modulos auxiliares ao baseline
- Baseline de acessibilidade WCAG 2.1 AA
- Testes de componentes criticos e coverage gate
- Padronizacao de feedback async
- Formalizacao de data fetching patterns
- Otimizacao de contexto AI para agentes

## Nao escopo

- Reescrita da plataforma
- Mudanca de stack (Next.js, Supabase, shadcn permanecem)
- Features de produto novas
- Mudancas no AI service Python
- Mudancas de schema de banco (coberto pelo TD-EPIC-01)

## Criterios de sucesso do epic

1. Nenhum content file com mais de 300 linhas.
2. Zero logica de dominio inline em componentes — tudo em `src/lib/domain/`.
3. ErrorBoundary em root layout + cada pagina critica.
4. Design system documentado em `docs/design-system.md` com catalogo completo.
5. WCAG 2.1 AA validado em 5 fluxos criticos (zero violacoes critical/serious).
6. Coverage de testes > 60% com gate no CI.
7. Jornadas por persona documentadas com metricas de sucesso.
8. Data fetching patterns formalizados em ADR.
9. Guia de desenvolvimento AI atualizado e validado.

## Timeline sugerida

- Sprint 1: Stories 2.1, 2.2, 2.3 (Foundation)
- Sprint 2: Stories 2.4, 2.5, 2.6, 2.7 (Decomposition & Domain)
- Sprint 3: Stories 2.8, 2.9, 2.10 (Accessibility & Quality)
- Sprint 4: Stories 2.11, 2.12 (Data Layer & AI Optimization)

## Stories planejadas

1. `story-2.1-design-system-documentation.md`
2. `story-2.2-error-boundary-and-state-patterns.md`
3. `story-2.3-persona-journeys.md`
4. `story-2.4-decompose-cronogramas-content.md`
5. `story-2.5-decompose-projects-content.md`
6. `story-2.6-extract-domain-logic.md`
7. `story-2.7-align-auxiliares-baseline.md`
8. `story-2.8-accessibility-baseline.md`
9. `story-2.9-critical-component-tests.md`
10. `story-2.10-async-feedback-patterns.md`
11. `story-2.11-data-fetching-patterns.md`
12. `story-2.12-ai-context-optimization.md`

## Execucao

- [ ] Story 2.1 concluida
- [ ] Story 2.2 concluida
- [ ] Story 2.3 concluida
- [ ] Story 2.4 concluida
- [ ] Story 2.5 concluida
- [ ] Story 2.6 concluida
- [ ] Story 2.7 concluida
- [ ] Story 2.8 concluida
- [ ] Story 2.9 concluida
- [ ] Story 2.10 concluida
- [ ] Story 2.11 concluida
- [ ] Story 2.12 concluida
