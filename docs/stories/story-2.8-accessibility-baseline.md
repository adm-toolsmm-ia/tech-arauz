# Story 2.8 - Baseline de Acessibilidade (WCAG 2.1 AA)

Status: Ready
Epic: UX-EPIC-01
Prioridade: Alta
Sprint: 3
Esforco estimado: 20h

## Executor Assignment

executor: @dev
quality_gate: @architect
quality_gate_tools: [axe-core-scan, keyboard-nav-test, contrast-check]

## CodeRabbit Integration

> **CodeRabbit Integration**: Disabled

## User Story

Como usuario com necessidades de acessibilidade,
quero navegar o portal inteiramente por teclado com feedback auditivo/visual adequado,
para usar todas as funcionalidades sem depender exclusivamente do mouse.

## Acceptance Criteria

1. `eslint-plugin-jsx-a11y` configurado no lint com regras em modo `error` (nao `warn`).
2. `@axe-core/react` instalado e ativo em dev mode para deteccao automatica.
3. Navegacao por teclado funcional nos 5 fluxos criticos: login, dashboard, projetos, cronogramas, integracoes.
4. Focus visible consistente em TODOS os elementos interativos (botoes, links, inputs, cards clicaveis).
5. `aria-live` aplicado em todos os feedbacks async (toast, sync status, loading transitions).
6. Contraste minimo AA verificado em toda a paleta (light + dark mode).
7. Checklist de a11y criado em `.aios-core/development/checklists/a11y-checklist.md`.
8. Script `npm run a11y:check` adicionado (via axe-core ou pa11y).
9. Zero violacoes `critical` ou `serious` do axe-core nos 5 fluxos criticos.

## Tasks

- [ ] Instalar `eslint-plugin-jsx-a11y` e configurar em `.eslintrc` (mode: error)
- [ ] Instalar `@axe-core/react` e configurar para dev mode only
- [ ] Auditar navegacao por teclado no fluxo de login
- [ ] Auditar navegacao por teclado no fluxo de dashboard (KPIs, graficos, drill-down)
- [ ] Auditar navegacao por teclado no fluxo de projetos (filtros, kanban, cockpit)
- [ ] Auditar navegacao por teclado no fluxo de cronogramas (calendario, lista)
- [ ] Auditar navegacao por teclado no fluxo de integracoes (sync, logs)
- [ ] Corrigir focus states inconsistentes (garantir ring visible em todos os interativos)
- [ ] Adicionar `aria-live="polite"` em areas de feedback dinamico (toast container, sync status)
- [ ] Adicionar `aria-label` em icones de acao sem texto (botoes icon-only)
- [ ] Verificar contraste AA com ferramenta (light + dark mode)
- [ ] Corrigir violacoes de contraste encontradas
- [ ] Criar `.aios-core/development/checklists/a11y-checklist.md`
- [ ] Adicionar `npm run a11y:check` no package.json
- [ ] Rodar axe-core nos 5 fluxos e corrigir violacoes critical/serious

## Testes

- [ ] axe-core scan dos 5 fluxos criticos (zero critical/serious)
- [ ] Teste manual de navegacao por teclado (Tab, Enter, Escape, Arrow keys)
- [ ] Teste de contraste com Chrome DevTools ou similar
- [ ] Teste de screen reader basico (NVDA ou VoiceOver) em fluxo de login

## File List

- .eslintrc.json ou eslint.config.* (MODIFICAR)
- package.json (MODIFICAR - dependencias + script a11y)
- src/app/layout.tsx (MODIFICAR - axe-core dev init)
- src/components/ui/button.tsx (VERIFICAR focus states)
- src/components/ui/input.tsx (VERIFICAR focus states)
- src/components/ui/card.tsx (VERIFICAR focus states para clicaveis)
- src/app/globals.css (MODIFICAR - focus-visible refinements)
- .aios-core/development/checklists/a11y-checklist.md (NOVO)
- Multiplos componentes (correcoes pontuais de aria/focus)

## Dev Notes

### Source Tree Relevante
- `eslint.config.mjs` ou `.eslintrc.*` — config ESLint atual
- `package.json` — dependencias atuais (verificar se jsx-a11y ja existe)
- `src/app/globals.css` — focus-visible ja definido (verificar e refinar)
- `src/components/ui/button.tsx` (49 linhas) — focus states shadcn
- `src/components/ui/input.tsx` (23 linhas) — focus states shadcn

### Estado Atual de a11y
- 55 ocorrencias de aria-* em 18 arquivos (cobertura parcial)
- Focus-visible com ring offset ja definido em globals.css
- Shadcn primitivos tem a11y built-in via Radix

### Testing Standards
- axe-core via `@axe-core/react` em dev mode
- Script `npm run a11y:check` para CI

## Change Log

| Date | Version | Description | Author |
|------|---------|-------------|--------|
| 2026-02-27 | 1.0 | Story criada | Orion (aios-master) |
| 2026-02-27 | 1.1 | PO validation: added Executor, Dev Notes, Change Log | Pax (po) |

## Dependencies

- Story 2.1 (tokens de design documentados para referencia de contraste)

## Blocks

- Story 2.9 (testes de a11y incluidos no suite de testes)
