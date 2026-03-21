# Backlog pós-PRD — EPIC 16 (Agentes, Skills, Squads)

**Fonte de verdade do produto:** [PRD-AGENTES-SKILLS-SQUADS-BROWNFIELD.md](../prd/PRD-AGENTES-SKILLS-SQUADS-BROWNFIELD.md)  
**Contexto para implementação:** [CONTEXT-SNAPSHOT-EPIC16-EXECUTION.md](../governance/CONTEXT-SNAPSHOT-EPIC16-EXECUTION.md)  
**Gate AIOX:** [AIOX-MULTIAGENT-REVIEW-EPIC16-AGENTES-SKILLS.md](../governance/AIOX-MULTIAGENT-REVIEW-EPIC16-AGENTES-SKILLS.md)  
**Última atualização:** 2026-03-21  
**Dono do backlog:** @sm (priorização) com @po  

---

## Ordem sugerida (@sm)

1. **Doc-only / UX leve** — alinhar cópias, tooltips e links de ajuda no módulo `/agentes` ao PRD e ao brief.
2. **Governança de papéis** — se @po exigir: apenas `admin` CRUD em `project_skills` / composição de squad (RLS ou policy adicional); story com @data-engineer.
3. **Paridade module-standards** — KPIs e filtros no catálogo de skills conforme [module-standards.md](../architecture/module-standards.md).
4. **Junction projeto ↔ skill** — tabela `project_project_skills` (nome final a definir no design), RLS, UI no módulo projetos.
5. **Alinhamento catálogo** — mapa IDs PRD (S-01 …) ↔ slugs seed; ajustar seed ou documentação.
6. **Fase 2 — automação** — scrape assistido ou pipeline de documento (fora do MVP; epic separado após ADR de integração).

---

## Itens de backlog (rascunho para virar stories)

| Prioridade | ID proposto | Título resumido | Owner sugerido |
| ---------- | ----------- | --------------- | -------------- |
| P1 | 16.2 | UX: ajuda contextual e glossário Agente/Squad/Skill no módulo | @ux + @dev |
| P1 | 16.3 | KPIs + FilterBar skills (paridade projetos) | @dev |
| P2 | 16.4 | RLS / roles: CRUD skills restrito a admin (se aprovado @po) | @data-engineer + @dev |
| P2 | 16.5 | `project` ↔ `project_skills` + UI seleção no projeto | @dev + @data-engineer |
| P3 | 16.6 | Testes E2E ou integração: RLS skills + squad members | @qa + @dev |
| P3 | 16.7 | Observabilidade para jobs futuros (fase 2) | @architect + @devops |

---

## Dependências

- **16.4** depende de decisão registrada em [PO-VALIDATION-PRD-AGENTES-SKILLS-SQUADS.md](../governance/PO-VALIDATION-PRD-AGENTES-SKILLS-SQUADS.md).
- **16.5** depende de modelo relacional acordado com @architect (extensão ADR-015 ou ADR filho).

---

## Como fatiar

@sm deve criar um arquivo `16.x-....story.md` por linha acima, copiar critérios de aceite do PRD quando aplicável, e anexar file list + dependências de migration.
