# Epic 5: Auxiliares IA — Alinhamento e Padronização

**Epic ID:** EPIC-5
**Data Criação:** 2026-03-01
**Orquestração:** @pm
**Status:** Ready for Development

---

## Objetivo

Corrigir gaps de Provedores IA, Modelos IA e Tipos de Agentes conforme relatório de alinhamento. Padronizar terminologia para "Provedores IA", expor api_key_field_name e habilitar edição nos cockpit. Padronizar UX/UI dos auxiliares com base no módulo Agentes AI, respeitando a estrutura de dados de cada entidade.

---

## Escopo

### Stories

| Ordem | Story | Objetivo |
|-------|-------|----------|
| 1 | 5.1 Terminologia | Padronizar "Fornecedores IA" → "Provedores IA" em toda aplicação |
| 2 | 5.2 Provedores IA | api_key_field_name + edição no cockpit |
| 3 | 5.3 Modelos IA | updateLmModelAction, form expandido, bulk update via Server Action |
| 4 | 5.4 Tipos de Agentes | Quick filters (is_active, is_system), melhorias SplitView |

---

## Critérios de Sucesso

1. Terminologia unificada: "Provedores IA" em sidebar, headers, labels
2. Provedores: api_key_field_name visível e editável; edição no cockpit
3. Modelos: CRUD completo via Server Actions; form create expandido
4. Tipos: FilterBar com quick filters conforme baseline Agentes AI
5. Zero regressão; quality gates passando

---

## Referências

- Baseline UX/UI: [agentes-content.tsx](src/app/agentes/agentes-content.tsx)
- Module standards: [module-standards.md](docs/architecture/module-standards.md)
