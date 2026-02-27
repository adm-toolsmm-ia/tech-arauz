# Story 2.12 - Otimizar Contexto AI e Documentacao para Agentes

Status: Ready
Epic: UX-EPIC-01
Prioridade: Media-Alta
Sprint: 4
Esforco estimado: 8h

## Executor Assignment

executor: @architect
quality_gate: @pm
quality_gate_tools: [doc-review, cross-reference-check]

## CodeRabbit Integration

> **CodeRabbit Integration**: Disabled

## User Story

Como agente AI (e time de desenvolvimento),
quero documentacao atualizada e precisa sobre padroes, componentes e arquitetura do projeto,
para implementar features mais rapido, com menos erros e seguindo padroes aprovados.

## Acceptance Criteria

1. `docs/architecture/module-standards.md` atualizado com exemplos de codigo de referencia reais (nao aspiracionais).
2. Existe `docs/architecture/component-catalog.md` listando todos os componentes reutilizaveis com quando/como usar.
3. Existe `docs/architecture/ai-development-guide.md` com:
   - Padroes que devem ser seguidos por agentes AI
   - Exemplos de decomposicao de componentes (referencia: Stories 2.4/2.5)
   - Exemplos de domain extraction (referencia: Story 2.6)
   - Checklist rapido para qualquer nova feature
4. MEMORY.md atualizado com estado pos-plano 10/10.
5. `module-standards.md` reflete estado REAL do codigo (validado contra codebase).

## Tasks

- [ ] Atualizar `module-standards.md` com snippets de codigo reais pos-decomposicao
- [ ] Criar `docs/architecture/component-catalog.md`:
  - 25 primitivos UI (shadcn) com descricao de quando usar
  - Componentes custom (ErrorBoundary, EmptyState, FilterBar, KPIBar, etc.)
  - Componentes de layout (Sidebar, DashboardHeader, SplitView)
  - Componentes de view (KanbanBoard, ProjectListView)
- [ ] Criar `docs/architecture/ai-development-guide.md`:
  - Regras fundamentais (module-standards, design-system, data-fetching)
  - Exemplos de decomposicao (antes/depois de cronogramas e projetos)
  - Exemplos de domain extraction (antes/depois)
  - Checklist "Nova Feature" (10 items)
  - Checklist "Novo Modulo" (referencia module-standards)
  - Anti-patterns (componentes > 300 LOC, calculos inline, confirm() nativo)
- [ ] Atualizar MEMORY.md com estado atual do projeto
- [ ] Validar que module-standards reflete codigo real (diff contra codebase)
- [ ] Cross-reference: design-system.md ← component-catalog.md ← module-standards.md

## Testes

- [ ] Validacao manual de que exemplos no guide compilam e sao corretos
- [ ] Review de consistencia entre os 4 documentos de arquitetura

## File List

- docs/architecture/module-standards.md (ATUALIZAR)
- docs/architecture/component-catalog.md (NOVO)
- docs/architecture/ai-development-guide.md (NOVO)
- MEMORY.md (ATUALIZAR)

## Dev Notes

### Source Tree Relevante
- `docs/architecture/module-standards.md` (145 linhas) — a atualizar com exemplos reais
- `docs/architecture/component-catalog.md` — NAO EXISTE (criar)
- `docs/architecture/ai-development-guide.md` — NAO EXISTE (criar)
- MEMORY.md em `~/.claude/projects/.../memory/MEMORY.md` — a atualizar

### Documentos de Referencia Cross
- `docs/design-system.md` (criado na Story 2.1)
- `docs/architecture/data-fetching-patterns.md` (criado na Story 2.11)
- `docs/ux/personas.md` (criado na Story 2.3)

### Testing Standards
- Validar que exemplos de codigo no guide sao reais (copiar de codebase, nao inventar)

## Change Log

| Date | Version | Description | Author |
|------|---------|-------------|--------|
| 2026-02-27 | 1.0 | Story criada | Orion (aios-master) |
| 2026-02-27 | 1.1 | PO validation: added Executor, Dev Notes, Change Log | Pax (po) |

## Dependencies

- Story 2.4, 2.5 (decomposicao concluida — exemplos reais disponiveis)
- Story 2.6 (domain extraction concluida — exemplos reais disponiveis)
- Story 2.9 (testes validam padroes — pode documentar com confianca)
- Story 2.11 (data fetching patterns formalizados)

## Blocks

- Nenhuma (ultima story do epic)
