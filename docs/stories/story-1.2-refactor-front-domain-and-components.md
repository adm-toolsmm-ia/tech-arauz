# Story 1.2 - Refactor Front Domain and Components

Status: Done  
Epic: TD-EPIC-01  
Prioridade: Alta

## User Story

Como time de desenvolvimento,  
quero extrair regras de negocio duplicadas e reduzir tamanho de componentes criticos,  
para aumentar consistencia funcional e velocidade de manutencao.

## Acceptance Criteria

1. Regras de atraso/prioridade centralizadas em camada de dominio compartilhada.
2. `projects-content` e `dashboard-content` reduzidos com separacao por responsabilidade.
3. Nao ha regressao funcional nos fluxos principais de dashboard/projetos.
4. Padrao de feedback async aplicado em telas alvo.
5. Padrao de engenharia de modulo/tabela documentado e adotado como gate para novos modulos.
6. Modulos auxiliares `lm-providers` e `modelos-ia` alinhados ao baseline de layout/filtros/cards.

## Tasks

- [x] Criar modulo de dominio para calculos compartilhados.
- [x] Refatorar componentes para subcomponentes menores.
- [x] Ajustar hooks/servicos para reduzir acoplamento.
- [x] Revisar padrao de mensagens de loading/erro/sucesso.
- [x] Consolidar `docs/architecture/module-standards.md` como referencia oficial.
- [x] Alinhar `lm-providers` e `modelos-ia` ao padrao (FilterBar, lista, Kanban, dialogs e detalhe lateral).

## Testes

- [x] Testes unitarios para funcoes de dominio extraidas.
- [x] Testes de integracao para dashboard/projetos.
- [x] Validacao de acessibilidade basica (focus, teclado, aria-live).

## File List

- src/app/dashboard/dashboard-content.tsx
- src/app/dashboard/__tests__/dashboard-content.integration.test.tsx
- src/app/projetos/projects-content.tsx
- src/app/projetos/__tests__/projects-content.integration.test.tsx
- src/app/auxiliares/lm-providers/lm-providers-content.tsx
- src/app/auxiliares/modelos-ia/modelos-ia-content.tsx
- src/app/actions/lm-models.ts
- src/components/lm-models/ModelsListView.tsx
- src/hooks/useProjetosFilters.ts
- src/hooks/useModelosIaFilters.ts
- src/hooks/__tests__/useModelosIaFilters.test.ts
- src/lib/domain/project-health.ts
- src/lib/domain/project-priority.ts
- src/lib/domain/project-phase.ts
- src/lib/domain/__tests__/project-health.test.ts
- src/lib/domain/__tests__/project-priority.test.ts
- src/lib/domain/__tests__/project-phase.test.ts
- src/lib/filters/filters-lm-providers.ts
- src/lib/filters/filters-modelos-ia.ts
- docs/architecture/module-standards.md
