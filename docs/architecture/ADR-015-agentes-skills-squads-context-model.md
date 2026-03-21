# ADR-015: Modelo de dados e contexto — Skills de projeto, squads e agentes

**Status:** Aceito  
**Data:** 2026-03-21  
**Decisores:** @architect (com @data-engineer, @pm)  

---

## Contexto

O produto precisa que usuários do tenant configurem IA para **gestão de projetos e TI** com três noções distintas: **executor (agente LLM)**, **equipe lógica (squad)** e **pacote de instrução/contexto (skill de projeto)**, sem confundir com skills do runtime de desenvolvimento (`.agent/skills/`).

---

## Decisão

1. **Agentes e squads** compartilham a tabela `agents`, discriminados por `entity_kind ∈ { agent, squad }`.
2. **Composição de squad** usa tabela de junção `agent_squad_members` com `squad_id` e `member_agent_id`, ambos FK para `agents`, com restrição de que o membro seja semanticamente um agente individual (`entity_kind = agent` garantido por aplicação; integridade referencial no banco).
3. **Skills de projeto** residem em tabela dedicada `project_skills` (não na tabela `agents`), com campos para instrução principal, URLs, tags, categorização e metadados JSON extensíveis.
4. **Fragmentos de contexto** anexados a uma skill usam `skill_documents` (1:N com `project_skills`), para texto colado ou resultado de extração manual.
5. **Vínculo futuro projeto ↔ skill** será uma junction separada (ex.: `project_project_skills`), fora do escopo mínimo deste ADR, mas previsto para não remodelar `project_skills` como filho direto de `projects` prematuramente.

---

## Consequências

**Positivas**

- Separação clara entre **executor** e **conteúdo de contexto**; skills podem evoluir sem alterar o modelo de agente.
- RLS por `tenant_id` em todas as tabelas novas, alinhado a ADR-001.
- Squads reutilizam infraestrutura existente de `agents` (versões, variáveis no futuro) onde fizer sentido.

**Negativas / trade-offs**

- `agents` acumula dois papéis conceituais; exige disciplina de UI e queries (`entity_kind`).
- Validação “membro só pode ser agent” não é CHECK SQL completo; depende de camada de aplicação (ou trigger futuro).

---

## Alternativas consideradas

1. **Skills como JSON em `agents`** — rejeitado: acoplamento, difícil reutilizar skill entre agentes/projetos.
2. **Squad como tabela própria sem `agents`** — rejeitado: duplicaria RLS, provedores e padrões de edição já existentes.
3. **Skill apenas no frontend** — rejeitado: viola fonte de verdade e auditoria multi-tenant.

---

## Implementação de referência

- Migration: `supabase/migrations/073_agent_entity_kind_skills_squads.sql`
- Tipos: `src/types/skills.ts`
- Serviços: `src/services/agents/skillSupabaseService.ts`, `squadMemberSupabaseService.ts`

---

## Relacionados

- [PRD-AGENTES-SKILLS-SQUADS-BROWNFIELD.md](../prd/PRD-AGENTES-SKILLS-SQUADS-BROWNFIELD.md)
- [Brief de contexto](../product/agentes-skills-squads-context-brief.md)
- [ADR-001](../ADR-001-RLS-STRATEGY.md) (RLS)
