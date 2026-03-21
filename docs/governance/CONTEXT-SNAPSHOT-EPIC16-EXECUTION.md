# Snapshot de contexto — execução EPIC 16 (Agentes & Skills)

**Uso:** manter esta janela de contexto ao implementar stories **16.2+** sem reabrir conversas antigas com escopo incorreto.  
**Última atualização:** 2026-03-21  

---

## 1. Problema em uma frase

O tenant precisa **gerir no produto** (não só no repo) **agentes LLM**, **squads** e **catálogo de skills de projeto** com contexto estruturado (Markdown, URLs, anexos), com **RLS multi-tenant**.

---

## 2. Fontes de verdade (ordem de leitura)

1. [Brief](../product/agentes-skills-squads-context-brief.md) — por quê / objetivo.
2. [PRD](../prd/PRD-AGENTES-SKILLS-SQUADS-BROWNFIELD.md) — escopo, ACs, catálogo skills, gaps.
3. [ADR-015](../architecture/ADR-015-agentes-skills-squads-context-model.md) — modelo de dados e decisões.
4. [Revisão AIOX](./AIOX-MULTIAGENT-REVIEW-EPIC16-AGENTES-SKILLS.md) — gate para execução autônoma.
5. [Backlog 16.x](../stories/STORY-BACKLOG-16-agentes-skills-post-prd.md) — próximo trabalho.

---

## 3. Baseline técnica (já mergeada)

| Camada | O quê |
| ------ | ----- |
| DB | `agents.entity_kind` (`agent` \| `squad`), `agent_squad_members`, `project_skills`, `skill_documents` — migration `073_agent_entity_kind_skills_squads.sql` |
| FE | `src/app/agentes/` — `AgentesModuleContent`, abas Agentes/Squads vs Skills, `SkillSupabaseService`, `SquadMemberSupabaseService` |
| Tipos | `src/types/skills.ts`, transformer `src/lib/transformers/skill.ts`, agente `entityKind` em `src/lib/transformers/agent.ts` |

**Regra de produto:** chat de teste **não** para `entity_kind = squad` (redirect na rota de chat).

---

## 4. O que NÃO fazer sem story nova

- Novas tabelas ou mudança brusca de RLS.
- Motor de scrape/OCR agendado (fase 2 / outro epic).
- Escopo não listado no PRD seção 5.2 (gaps) ou backlog 16.x.

---

## 5. Ordem sugerida de implementação

1. **16.2** — UX: ajuda contextual, glossário Agente/Squad/Skill (`@ux` + `@dev`).
2. **16.3** — KPIs / paridade parcial com [module-standards.md](../architecture/module-standards.md) no catálogo skills.
3. **16.4** — Papéis admin (só se @po exigir no PO-VALIDATION).
4. **16.5** — Junction projeto ↔ skill + UI.
5. **16.6 / 16.7** — testes integrados / observabilidade fase 2.

Promover cada linha a `docs/stories/16.x-*.story.md` com file list e ACs antes de codar.

---

## 6. Quality gates (obrigatório)

Conforme `configs/project.yaml`: `npm run lint` ; `npm run typecheck` ; `npm test` ; `npm run format:check` quando aplicável. Shell: PowerShell — encadear com `;`, não `&&`.

---

## 7. Agentes AIOX (quem aciona o quê)

| Situação | Agente |
| -------- | ------ |
| Mudança de escopo no PRD | @pm → @po |
| DDL / RLS | @data-engineer + @architect |
| UX copy / fluxos | @ux-design-expert |
| Fatiar trabalho | @sm |
| Implementar | @dev |
| Gate qualidade | @qa |
| Push remoto / CI | @devops |
