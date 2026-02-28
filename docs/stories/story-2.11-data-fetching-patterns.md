# Story 2.11 - Formalizar Data Fetching Patterns

Status: Ready for Review
Epic: UX-EPIC-01
Prioridade: Media-Alta
Sprint: 4
Esforco estimado: 12h

## Executor Assignment

executor: @architect
quality_gate: @pm
quality_gate_tools: [adr-review, pattern-consistency]

## CodeRabbit Integration

> **CodeRabbit Integration**: Disabled

## User Story

Como time de desenvolvimento e agentes AI,
quero regras claras e documentadas de quando usar cada padrao de data fetching,
para eliminar confusao arquitetural e garantir consistencia em novos modulos.

## Acceptance Criteria

1. Existe `docs/architecture/data-fetching-patterns.md` com regras claras por tipo de operacao.
2. Regras definidas:
   - Server Components → query direta Supabase (read-only, sem interacao)
   - Server Actions → mutations e operacoes autenticadas (CRUD)
   - API Routes → proxy para servicos externos (AI service, webhooks)
   - Client Services → apenas para servicos que precisam de estado real-time (agents store)
3. Cada modulo mapeado para o padrao correto com excecoes documentadas.
4. Inconsistencias identificadas e migradas onde possivel (sem breaking changes).
5. ADR (Architecture Decision Record) criado para registrar a decisao.
6. `docs/architecture/module-standards.md` atualizado com referencia ao padrao de data fetching.

## Tasks

- [x] Mapear padrao de data fetching atual de cada modulo:
  - Dashboard: Server Component query
  - Projetos: Server Component query + Server Actions (CRUD)
  - Cronogramas: Server Component query
  - Integracoes: API Routes
  - Agentes: API Routes (proxy) + Client Services (Zustand)
  - Auxiliares: Server Actions
- [x] Definir regras formais por tipo de operacao
- [x] Identificar inconsistencias (ex: agents usa dual source — API + Supabase)
- [x] Documentar excecoes justificadas (ex: agents precisa de proxy por causa do AI service)
- [x] Criar `docs/architecture/data-fetching-patterns.md`
- [x] Criar ADR em `docs/architecture/adr/` (ADR-005)
- [x] Atualizar `module-standards.md` com secao de data fetching obrigatorio (secao 8)
- [x] Migrar inconsistencias simples se possivel — lmModelsService/lmProvidersService documentados como divida tecnica (sem breaking changes)

## Testes

- [ ] Validacao de que nenhum modulo quebrou apos migracoes
- [ ] Review de code contra o padrao definido

## File List

- docs/architecture/data-fetching-patterns.md (NOVO)
- docs/architecture/adr/ADR-005-data-fetching-patterns.md (NOVO)
- docs/architecture/module-standards.md (MODIFICAR)
- src/services/agents/ (ANALISAR - documentar justificativa de dual source)

## Dev Notes

### Mapeamento Modulo → Padrao Atual (da auditoria)
| Modulo | Padrao Atual | Padrao Correto |
|--------|-------------|---------------|
| Dashboard | Server Component query | Server Component (OK) |
| Projetos | Server Component + Server Actions | Server Component + Server Actions (OK) |
| Cronogramas | Server Component query | Server Component (OK) |
| Integracoes | API Routes | API Routes (OK — servico externo) |
| Agentes | API Routes + Client Services (Zustand) | API Routes + Client Services (justificado: dual source AI+Supabase) |
| Auxiliares | Server Actions | Server Actions (OK) |

### ADR Numbering
- Verificar proximo numero disponivel em `docs/architecture/adr/` (se dir existir)
- Se nao existir, criar diretorio e comecar com ADR-001

### Testing Standards
- Checklist formal: cada modulo mapeado contra padrao definido

## Change Log

| Date | Version | Description | Author |
|------|---------|-------------|--------|
| 2026-02-27 | 1.0 | Story criada | Orion (aios-master) |
| 2026-02-27 | 1.1 | PO validation: added Executor, Dev Notes, Change Log | Pax (po) |
| 2026-02-28 | 1.2 | @architect: criado data-fetching-patterns.md, ADR-005, atualizado module-standards.md | Aria (architect) |

## Dependencies

- Story 2.6 (domain logic extraida — data layer formaliza depois)

## Blocks

- Story 2.12 (AI guide referencia data fetching patterns)
