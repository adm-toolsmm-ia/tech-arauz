# PRD (Brownfield) — Módulo Agentes & Skills: agentes, squads e skills de projeto

**Versão:** 1.0  
**Data:** 2026-03-21  
**Tipo:** Brownfield (baseline técnica já existente)  
**Dono:** @pm  
**Contribuições:** @architect (dados/contexto), @ux-design-expert (jornadas)  
**Brief de contexto:** [docs/product/agentes-skills-squads-context-brief.md](../product/agentes-skills-squads-context-brief.md)  

---

## 1. Resumo executivo

Formalizar o módulo **Agentes & Skills** como lugar de **gestão por usuário** (frontend + Supabase) de: **agentes LLM**, **squads (equipes de agentes)** e **catálogo de skills de projeto** (instruções + documentos anexos). O escopo MVP do PRD cobre **catálogo, CRUD, RLS por tenant e UX clara**; automações de web scraping e OCR ficam em fase posterior, salvo decisão explícita de escopo.

---

## 2. Problema e oportunidade

- Configuração de IA para projetos/TI não pode depender só do repositório de desenvolvimento.
- Sem distinção clara entre **executor**, **equipe** e **pacote de contexto**, usuários e agentes misturam conceitos.
- Skills pedidas pelo negócio (documentação de fornecedores, extração de cronogramas/orçamentos/manuais) precisam existir como **artefatos nomeados, reutilizáveis e auditáveis** por tenant.

---

## 3. Objetivos do produto (mensuráveis qualitativamente)

1. Usuário autenticado do tenant consegue **criar, listar, filtrar, editar e arquivar** skills e documentos associados.
2. Usuário consegue **criar squads** e **associar agentes** individuais como membros.
3. Interface deixa explícito **Agente vs Squad vs Skill** (badges, filtros, fluxos).
4. Dados persistidos com **`tenant_id`** e políticas RLS alinhadas ao padrão do projeto.
5. Catálogo inicial de skills (seed + PRD) cobre casos de **gestão de projetos e TI** descritos na seção 8.

**Não-objetivos do MVP:** execução agendada de scrape; filas; OCR em lote; injeção automática de skill no chat sem story dedicada.

---

## 4. Personas e permissões

| Persona | Necessidade |
| ------- | ----------- |
| Admin tenant | Configurar catálogo, squads e agentes (assumir mesmo nível de acesso que demais módulos IA hoje, salvo evolução). |
| Usuário operacional | Usar agentes e consultar skills; criar/editar conforme política do tenant (a definir se diferença `admin` vs `user` for necessária). |

**Decisão a documentar na próxima revisão:** se apenas `admin` pode CRUD de skills/squads ou se `user` também pode (hoje: RLS por tenant sem distinção fina no schema de skills — o PRD recomenda manter paridade com `agents` até story de governança).

---

## 5. Escopo funcional (baseline + gaps)

### 5.1 Já implementado (baseline)

- Coluna `agents.entity_kind`: `agent` | `squad`.
- Tabela `agent_squad_members` (membros = agentes individuais).
- Tabelas `project_skills`, `skill_documents` com RLS por tenant.
- UI: abas **Agentes & Squads** e **Skills de projeto**; CRUD skill; composição de squad na edição; chat de teste apenas para agente (não squad).
- Seed idempotente de skills por tenant (subconjunto do catálogo 8).

Referência técnica: `supabase/migrations/073_agent_entity_kind_skills_squads.sql`, `src/app/agentes/`, serviços em `src/services/agents/`.

### 5.2 Gaps sugeridos (pós-PRD, via stories)

- KPIs no módulo skills alinhados a [module-standards.md](../architecture/module-standards.md).
- Vínculo **`projects` ↔ `project_skills`** (junction) e UI no cockpit de projeto.
- Papéis finos (admin-only CRUD) se @po exigir.
- Observabilidade para futuras automações (fase 2).

---

## 6. Regras de negócio

1. **Squad** não abre fluxo de **chat de teste** na UI atual; redirecionar se URL de chat for squad.
2. **Membros do squad** só podem ser registros `entity_kind = agent` (não outro squad, não skill).
3. **Slug** de skill único por `(tenant_id, slug)`.
4. **Skill** possui `status`: `draft` | `published` | `archived`.
5. **Skill document** é filho de uma skill; delete em cascata conforme migration.

---

## 7. UX / jornadas (requisitos)

- Listagem skills com busca e filtros (categoria, status).
- Criação/edição em painel (sheet) com: nome, slug, descrição, categoria, tipo de skill, status, corpo Markdown, URLs (uma por linha), tags.
- Na edição: seção **documentos anexados** (título + conteúdo texto).
- Agentes: filtro **Entidade** (agente/squad); criação com tipo **Agente ou Squad**; edição de squad com checklist de membros.

---

## 8. Catálogo de skills (conteúdo-alvo do produto)

Cada item deve evoluir no PRD operacional com: **finalidade**, **gatilho**, **entradas/saídas**, **fase** (1 = catálogo/UI; 2 = automação backend), **critério de aceite**.

### 8.1 Pedido explícito do negócio

| ID | Nome (referência) | Finalidade resumida | Fase inicial |
| -- | ----------------- | ------------------- | ------------ |
| S-01 | Documentação web fornecedor / API | Playbook para coletar e usar docs públicas de APIs/SDKs com ética e rastreio de URL/data | 1 |
| S-02 | Extração estruturada de documentos | Playbook para extrair cronograma, orçamento, manuais, docs API de PDF/HTML | 1 |

### 8.2 Sugeridas — gestão de projetos e TI

| ID | Nome (referência) | Finalidade resumida | Fase inicial |
| -- | ----------------- | ------------------- | ------------ |
| S-03 | Atas e decisões | Decisões, owners, prazos a partir de notas de reunião | 1 |
| S-04 | Comparativo RFP | Matriz requisito × fornecedor × evidência | 1 |
| S-05 | Registro de riscos | Probabilidade, impacto, mitigação, owner | 1 |
| S-06 | Baseline de custo | Valores aprovados, alçadas, vigência | 1 |
| S-07 | Status report stakeholders | Linguagem acessível, marcos e riscos | 1 |
| S-08 | Marcos e dependências | Alinhar entregas e dependências ao cronograma | 1 |
| S-09 | Contexto por projeto | (Com junction futuro) skill aplicável a projeto específico | 2 |
| S-10 | Pesquisa técnica / spike | Hipóteses, fontes, recomendação | 1 |
| S-11 | ADR e release notes | Decisões técnicas e comunicação de release | 1 |
| S-12 | Segurança leve / licenças OSS | Checklist e mapeamento de licenças | 1 |
| S-13 | Changelog APIs dependências | Playbook para acompanhar breaking changes | 1 |
| S-14 | Postmortem incidente | Linha do tempo, causa raiz, ações | 1 |

O seed SQL pode usar slugs diferentes dos IDs acima; o PRD exige **mapa slug ↔ ID** na documentação de dados ou na story de alinhamento de catálogo.

---

## 9. Requisitos não funcionais (NFRs)

- **Segurança:** RLS em todas as tabelas novas; sem dados cross-tenant.
- **Performance:** listagens pagináveis ou limitadas quando o catálogo crescer (story futura).
- **Acessibilidade:** formulários e listas seguem padrão shadcn/Radix do projeto.
- **Manutenibilidade:** serviços cliente Supabase centralizados; tipos em `src/types/skills.ts`.
- **Governança AIOX:** mudanças de schema via @data-engineer + ADR; features via story + QA gate.

---

## 10. Critérios de aceite (MVP documentado)

- [ ] Usuário do tenant A não visualiza skills/squads/agentes do tenant B (RLS).
- [ ] CRUD de skill persiste `instruction_body`, `source_urls`, `tags`, `status`.
- [ ] CRUD de `skill_documents` apenas ligado a skill do mesmo tenant.
- [ ] Squad composto apenas de agentes; persistência em `agent_squad_members`.
- [ ] Chat de teste indisponível para `entity_kind = squad`.
- [ ] Seed de skills é idempotente (`ON CONFLICT DO NOTHING` ou equivalente).
- [ ] Brief, PRD, ADR e log @po referenciados e atualizados.

---

## 11. Fora de escopo (MVP)

- Motor de scrape agendado, proxies, ou armazenamento de HTML bruto em massa.
- OCR / parsing automático de PDF sem story e infra dedicadas.
- Billing por uso de skill.
- Sincronização bidirecional com repositório `.agent/skills`.

---

## 12. Dependências e riscos

- **Migration 073** deve estar aplicada antes da página carregar `project_skills`.
- **Confusão de nomenclatura** AIOX squad vs produto — mitigada por cópia de UI e ADR.
- **Escopo creep** em automações — mitigado por fases 1/2 explícitas.

---

## 13. Referências

- [module-standards.md](../architecture/module-standards.md)
- [ADR-015](../architecture/ADR-015-agentes-skills-squads-context-model.md)
- [AI-AGENT-ARCHITECTURE.md](../architecture/AI-AGENT-ARCHITECTURE.md) (alinhamento conceitual, se necessário)
- [Revisão AIOX EPIC 16](../governance/AIOX-MULTIAGENT-REVIEW-EPIC16-AGENTES-SKILLS.md)
- [Snapshot de contexto execução](../governance/CONTEXT-SNAPSHOT-EPIC16-EXECUTION.md)
- [Validação @po](../governance/PO-VALIDATION-PRD-AGENTES-SKILLS-SQUADS.md)

---

## 14. Histórico de versões

| Versão | Data | Autor | Notas |
| ------ | ---- | ----- | ----- |
| 1.0 | 2026-03-21 | @pm | Versão inicial pós-baseline |
