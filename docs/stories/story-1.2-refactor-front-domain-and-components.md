# Story 1.2 - Refactor Front Domain and Components

Status: Draft  
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

- [ ] Criar modulo de dominio para calculos compartilhados.
- [ ] Refatorar componentes para subcomponentes menores.
- [ ] Ajustar hooks/servicos para reduzir acoplamento.
- [ ] Revisar padrao de mensagens de loading/erro/sucesso.
- [ ] Consolidar `docs/architecture/module-standards.md` como referencia oficial.
- [ ] Alinhar `lm-providers` e `modelos-ia` ao padrao (FilterBar, lista, Kanban, dialogs e detalhe lateral).

## Testes

- [ ] Testes unitarios para funcoes de dominio extraidas.
- [ ] Testes de integracao para dashboard/projetos.
- [ ] Validacao de acessibilidade basica (focus, teclado, aria-live).

## File List

- src/app/dashboard/dashboard-content.tsx
- src/app/projetos/projects-content.tsx
- src/app/auxiliares/lm-providers/lm-providers-content.tsx
- src/app/auxiliares/modelos-ia/modelos-ia-content.tsx
- src/lib/domain/* (novo)
- src/components/* (subcomponentes novos/ajustados)
- docs/architecture/module-standards.md
