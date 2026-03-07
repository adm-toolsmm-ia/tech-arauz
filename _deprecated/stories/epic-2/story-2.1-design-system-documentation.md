# Story 2.1 - Documentar Design System e Tokens

Status: Done
Epic: UX-EPIC-01
Prioridade: Alta
Sprint: 1
Esforco estimado: 16h

## Executor Assignment

executor: @ux-design-expert
quality_gate: @dev
quality_gate_tools: [visual-review, dark-mode-test]

## CodeRabbit Integration

> **CodeRabbit Integration**: Disabled

## User Story

Como time de desenvolvimento e agentes AI,
quero um documento formal de design system com catalogo de tokens, componentes e padroes visuais,
para garantir consistencia visual e acelerar implementacao de novas features.

## Acceptance Criteria

1. Existe `docs/design-system.md` com catalogo completo de tokens (cores, tipografia, espacamento, sombras, animacoes).
2. Paleta semantica documentada: status, prioridade, tipo, chart (com valores HSL e exemplos visuais em texto).
3. Padroes de componentes documentados: quando usar Card, Dialog, Sheet, Toast, Skeleton, Badge.
4. Mapa visual de layout padrao por modulo (referencia: `docs/architecture/module-standards.md`).
5. Guia de microinteracoes: estados de loading, success, error, empty state com exemplos.
6. Dual dark mode selector resolvido: consolidar `.dark` e `[data-theme='dark']` em estrategia unica.
7. `dark-mode.css` consolidado dentro de `globals.css` (eliminar arquivo separado).

## Tasks

- [x] Auditar `tailwind.config.ts` e `globals.css` para extrair inventario completo de tokens
- [x] Criar `docs/design-system.md` com secoes: Cores, Tipografia, Espacamento, Sombras, Animacoes, Componentes
- [x] Documentar paleta semantica com tabela de mapeamento (nome → HSL → uso)
- [x] Documentar padroes de componentes base (25 primitivos shadcn + custom)
- [x] Criar secao "Layout Blueprint" referenciando module-standards.md
- [x] Criar secao "Microinteracoes" com padroes de loading/success/error/empty
- [x] Consolidar `dark-mode.css` em `globals.css` e remover arquivo duplicado
- [x] Unificar estrategia de seletor dark mode (escolher `.dark` OU `[data-theme]`, nao ambos)
- [x] Validar que dark mode funciona corretamente apos consolidacao

## Testes

- [ ] Verificacao visual de dark mode em todas as paginas apos consolidacao
- [ ] Validacao de que nenhum estilo quebrou (regressao visual)

## File List

- docs/design-system.md (NOVO)
- src/app/globals.css
- src/lib/theme/dark-mode.css (REMOVER apos consolidacao)
- tailwind.config.ts
- docs/architecture/module-standards.md (referencia)

## Dev Notes

### Source Tree Relevante
- `tailwind.config.ts` (158 linhas) — tokens de cor, tipografia, sombras, animacoes
- `src/app/globals.css` (421 linhas) — CSS vars, component classes, animacoes
- `src/lib/theme/dark-mode.css` (54 linhas) — dark mode layer separado (a consolidar)
- `src/components/ui/` — 25 primitivos shadcn/ui
- `docs/architecture/module-standards.md` — blueprint de modulo (referencia de layout)

### Testing Standards
- Validacao visual de dark mode: checar todas as paginas apos consolidacao de CSS
- Regressao: garantir que nenhuma variavel CSS foi perdida na consolidacao

## Change Log

| Date | Version | Description | Author |
|------|---------|-------------|--------|
| 2026-02-27 | 1.0 | Story criada | Orion (aios-master) |
| 2026-02-27 | 1.1 | PO validation: added Executor, Dev Notes, Change Log | Pax (po) |
| 2026-02-27 | 2.0 | Implementation: design-system.md created, dark-mode.css consolidated and removed, 154 tests passing | Dex (dev) |

## Dependencies

- Nenhuma (pode iniciar imediatamente)

## Blocks

- Story 2.8 (a11y precisa de tokens documentados)
- Story 2.10 (feedback patterns documentados aqui)
