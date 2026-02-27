# Story 2.6 - Extrair Domain Logic Completa

Status: Ready
Epic: UX-EPIC-01
Prioridade: Alta
Sprint: 2
Esforco estimado: 16h

## Executor Assignment

executor: @dev
quality_gate: @architect
quality_gate_tools: [code-review, domain-purity-check]

## CodeRabbit Integration

> **CodeRabbit Integration**: Disabled

## User Story

Como time de desenvolvimento,
quero que toda logica de dominio esteja centralizada em `src/lib/domain/`,
para eliminar duplicacoes, garantir consistencia de regras e permitir testes unitarios isolados.

## Acceptance Criteria

1. Zero calculos de dominio inline em componentes de UI.
2. Dashboard e projetos usam MESMA funcao de calculo de KPIs (zero duplicacao).
3. Cada modulo tem seu conjunto de domain functions em `src/lib/domain/`.
4. 100% de cobertura de testes nas funcoes de dominio.
5. Funcoes de dominio sao puras (sem side effects, sem dependencia de React).

## Tasks

- [ ] Auditar todos os content components para identificar calculos inline restantes
- [ ] Criar `src/lib/domain/kpi-calculations.ts` (calculos compartilhados dashboard/projetos)
- [ ] Criar `src/lib/domain/schedule-status.ts` (se nao criado na Story 2.4)
- [ ] Criar `src/lib/domain/schedule-kpi.ts` (se nao criado na Story 2.4)
- [ ] Criar `src/lib/domain/agent-rules.ts` (regras de validacao de agentes)
- [ ] Criar `src/lib/domain/lm-provider-rules.ts` (regras de providers)
- [ ] Criar `src/lib/domain/lm-model-rules.ts` (regras de modelos IA)
- [ ] Atualizar `dashboard-content.tsx` para usar funcoes de domain compartilhado
- [ ] Atualizar todos os content components para importar de `src/lib/domain/`
- [ ] Remover calculos duplicados entre dashboard e projetos
- [ ] Criar testes unitarios para CADA funcao de dominio
- [ ] Criar `src/lib/domain/index.ts` barrel export

## Testes

- [ ] Testes para kpi-calculations.ts (todos os KPIs do dashboard)
- [ ] Testes para schedule-status.ts
- [ ] Testes para schedule-kpi.ts
- [ ] Testes para agent-rules.ts
- [ ] Testes para lm-provider-rules.ts
- [ ] Testes para lm-model-rules.ts
- [ ] Teste de regressao: KPIs do dashboard identicos antes/depois
- [ ] Teste de regressao: KPIs de projetos identicos antes/depois

## File List

- src/lib/domain/kpi-calculations.ts (NOVO)
- src/lib/domain/schedule-status.ts (NOVO ou da Story 2.4)
- src/lib/domain/schedule-kpi.ts (NOVO ou da Story 2.4)
- src/lib/domain/agent-rules.ts (NOVO)
- src/lib/domain/lm-provider-rules.ts (NOVO)
- src/lib/domain/lm-model-rules.ts (NOVO)
- src/lib/domain/index.ts (NOVO)
- src/lib/domain/__tests__/kpi-calculations.test.ts (NOVO)
- src/lib/domain/__tests__/agent-rules.test.ts (NOVO)
- src/lib/domain/__tests__/lm-provider-rules.test.ts (NOVO)
- src/lib/domain/__tests__/lm-model-rules.test.ts (NOVO)
- src/app/dashboard/dashboard-content.tsx (MODIFICAR)
- src/app/projetos/projects-content.tsx (MODIFICAR)
- src/app/agentes/agentes-content.tsx (MODIFICAR)
- src/app/auxiliares/lm-providers/lm-providers-content.tsx (MODIFICAR)
- src/app/auxiliares/modelos-ia/modelos-ia-content.tsx (MODIFICAR)

## Dev Notes

### Domain Logic Ja Existente
- `src/lib/domain/project-health.ts` (50 linhas) — healthScore, healthLabel
- `src/lib/domain/project-priority.ts` (34 linhas) — priorityMap, priorityColor
- `src/lib/domain/project-phase.ts` (11 linhas) — phaseMap

### Exemplos de Calculos Inline a Extrair
- KPIs de dashboard: total, ativos, concluidos, atrasados, alta prioridade, importancia especial
- KPIs de projetos: mesmos calculos duplicados
- Calculo de "overdue": comparacao data_prevista vs hoje
- Status de cronograma: calculos de atraso/adiantamento
- Validacao de agente: regras de nome, modelo, configuracao

### Nota sobre schedule-status e schedule-kpi
- Podem ja ter sido criados na Story 2.4. Se sim, verificar e complementar (nao duplicar)

### Testing Standards
- Testes em `src/lib/domain/__tests__/`
- Funcoes PURAS: sem React, sem side effects, sem fetch
- 100% coverage sobre `src/lib/domain/` (exceto index.ts)

## Change Log

| Date | Version | Description | Author |
|------|---------|-------------|--------|
| 2026-02-27 | 1.0 | Story criada | Orion (aios-master) |
| 2026-02-27 | 1.1 | PO validation: added Executor, Dev Notes, Change Log, fixed Story 4.1→2.11 ref | Pax (po) |

## Dependencies

- Story 2.4 (decomposicao cronogramas produz schedule domain files)
- Story 2.5 (decomposicao projetos produz project domain files)

## Blocks

- Story 2.9 (testes de componentes usam domain extraido)
- Story 2.11 (data layer formaliza apos domain extraction)
