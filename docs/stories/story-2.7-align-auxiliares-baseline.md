# Story 2.7 - Alinhar Auxiliares ao Baseline

Status: Ready
Epic: UX-EPIC-01
Prioridade: Media
Sprint: 2
Esforco estimado: 8h

## Executor Assignment

executor: @dev
quality_gate: @architect
quality_gate_tools: [code-review, module-standards-check]

## CodeRabbit Integration

> **CodeRabbit Integration**: Disabled

## User Story

Como usuario do portal,
quero que todas as telas auxiliares (agent-types, lm-providers, modelos-ia) tenham a mesma qualidade e consistencia das telas principais,
para ter uma experiencia uniforme em todo o portal.

## Acceptance Criteria

1. `agent-types-content.tsx` usa Dialog padrao em vez de `confirm()` nativo para exclusao.
2. `agent-types-content.tsx` reduzido de 770 para ~400 linhas (extrair subcomponentes).
3. `lm-providers-content.tsx` reduzido de 656 para ~350 linhas.
4. Todos os auxiliares seguem FilterBar padrao centralizado.
5. Gap residual documentado em `module-standards.md` atualizado.
6. Estados de loading, vazio e erro consistentes com padrao global.

## Tasks

- [ ] Substituir `confirm()` nativo por Dialog em agent-types-content.tsx
- [ ] Extrair subcomponentes de agent-types-content (lista, form, actions)
- [ ] Extrair subcomponentes de lm-providers-content (lista, form, actions)
- [ ] Verificar que FilterBar padrao esta aplicado em todos os auxiliares
- [ ] Padronizar estados de loading/vazio/erro nos 3 modulos auxiliares
- [ ] Atualizar `docs/architecture/module-standards.md` com status de alinhamento
- [ ] Remover gap residual #3 (agent-types confirm) da documentacao

## Testes

- [ ] Teste de exclusao via Dialog (agent-types)
- [ ] Teste de filtros em cada modulo auxiliar
- [ ] Verificacao visual de consistencia entre os 3 modulos

## File List

- src/app/auxiliares/agent-types/agent-types-content.tsx (REFATORAR)
- src/app/auxiliares/agent-types/components/ (NOVO - subcomponentes)
- src/app/auxiliares/lm-providers/lm-providers-content.tsx (REFATORAR)
- src/app/auxiliares/lm-providers/components/ (NOVO - subcomponentes)
- docs/architecture/module-standards.md (ATUALIZAR)

## Dev Notes

### Source Tree Relevante
- `src/app/auxiliares/agent-types/agent-types-content.tsx` (770 linhas) — usa confirm() nativo
- `src/app/auxiliares/lm-providers/lm-providers-content.tsx` (656 linhas)
- `src/app/auxiliares/modelos-ia/modelos-ia-content.tsx` (605 linhas) — ja parcialmente alinhado
- `docs/architecture/module-standards.md` secao 5 — gaps atuais identificados

### Gap Residual Atual (module-standards.md #3)
- `agent-types` usa `confirm()` nativo para delete → migrar para Dialog

### Testing Standards
- Testes em `src/app/auxiliares/*/__tests__/`

## Change Log

| Date | Version | Description | Author |
|------|---------|-------------|--------|
| 2026-02-27 | 1.0 | Story criada | Orion (aios-master) |
| 2026-02-27 | 1.1 | PO validation: added Executor, Dev Notes, Change Log | Pax (po) |

## Dependencies

- Story 2.1 (design system docs como referencia)
- Story 2.2 (ErrorBoundary e padroes de estado)

## Blocks

- Nenhuma
