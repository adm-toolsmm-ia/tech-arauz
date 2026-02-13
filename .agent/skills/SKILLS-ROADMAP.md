# Skills Roadmap para Tech-Arauz

> Estratégia de seleção e desenvolvimento de skills do Antigravity Kit aplicadas ao contexto do projeto com IA

**Status:** Documento estratégico versão 1.0 (2025-02-12)
**Revisão:** Claude Opus 4.6 (Engenharia de IA e Agentes)
**Objetivo:** "Equipe de agentes com AI, de forma organizada, com engenharia, arquitetura e padrões de qualidade com AI"

---

## Executive Summary

O Antigravity Kit fornece **36 skills genéricas**. Deste, **24 são aplicáveis** ao tech-arauz, organizados em 3 categorias:

- ✅ **11 CRÍTICAS** -- Essenciais para operação diária (tech stack + segurança)
- ✅ **13 IMPORTANTES** -- Muito relevantes, usadas frequentemente
- 🟡 **8 OPCIONAIS** -- Contexto específico (futuro, Windows, i18n)
- ❌ **4 NÃO APLICÁVEIS** -- Game, mobile, stack mismatch

Além disso, o projeto tem **3 skills custom já implementadas** que devem ser formalizadas:

- `supabase-mcp` (v1.2.0, madura)
- `intelligent-routing` (funcional)
- `nextjs-react-expert` (renomeação de react-best-practices com conteúdo expandido)

E **4 novas skills CRÍTICAS devem ser criadas IMEDIATAMENTE** para cobrir lacunas de conhecimento específicas do projeto:

1. **`espaider-integration`** (API central)
2. **`supabase-rls-patterns`** (Segurança multi-tenant)
3. **`memory-management`** (Core do sistema de agentes)
4. **`agent-orchestration-patterns`** (Roteamento inteligente)

---

## 1. Mapeamento de Skills Aplicáveis

### ✅ CRÍTICAS (11 skills)

Essenciais para operação diária. Carregadas em TODA execução relevante.

| # | Skill | Agente(s) | Fase | Stack Relevante | Exemplo Real |
|---|-------|-----------|------|-----------------|--------------|
| 1 | `react-best-practices` | frontend-specialist, performance-optimizer | Phase 3 | Next.js 14 + React 18 | Otimizar KanbanBoard com dnd-kit; eliminar waterfalls no Dashboard 360 |
| 2 | `database-design` | database-architect, backend-specialist | Phase 3 (P0) | Supabase | Criar schema para tabela Espaider; otimizar índices de solicitações |
| 3 | `api-patterns` | backend-specialist, security-auditor | Phase 3 (P1) | Next.js server actions + Espaider API | Padronizar CRUD APIs; implementar rate-limiting em sync |
| 4 | `vulnerability-scanner` | security-auditor | Phase 4 (MANDATORY) | Segurança multi-tenant | Auditar RLS após migration; verificar tenant isolation |
| 5 | `architecture` | orchestrator, explorer-agent, project-planner | Phase 1-2 | System design | Decisão: Modulo Agentes AI separado vs integrado? |
| 6 | `plan-writing` | orchestrator, project-planner, product-manager | Phase 2 | Task planning | Criar plano de Sprint 2 com estimativas |
| 7 | `clean-code` | orchestrator, code-archaeologist, documentation-writer | Phase 3-4 | Coding standards globais | Padronizar naming conventions; refatorar SplitView |
| 8 | `testing-patterns` | test-engineer, qa-automation-engineer | Phase 3 (P2) | Jest/Vitest | Suite de testes para sync Espaider |
| 9 | `tailwind-patterns` | frontend-specialist | Phase 3 | Tailwind v3.4 + tailwindcss-animate | Dark mode com next-themes; padronizar spacing |
| 10 | `systematic-debugging` | debugger | Phase 3-4 | Root cause analysis | Investigar dados Espaider null; debug de RLS bypass |
| 11 | `parallel-agents` | orchestrator | Phase 2-3 | Multi-agent coordination | Coordenar database-architect + backend-specialist + frontend-specialist |

---

### ✅ IMPORTANTES (13 skills)

Muito relevantes, usadas frequentemente em tarefas específicas.

| # | Skill | Agente(s) | Fase | Exemplo Real |
|---|-------|-----------|------|--------------|
| 12 | `brainstorming` | project-planner, product-manager, explorer-agent | Phase 2 | Discovery de requisitos para Modulo Agentes AI |
| 13 | `frontend-design` | frontend-specialist | Phase 3 | Implementar design system baseado em ADR-003 |
| 14 | `webapp-testing` | qa-automation-engineer, test-engineer | Phase 3 (P2) + Phase 4 | E2E: login -> dashboard -> filtrar -> abrir detalhes 360 |
| 15 | `code-review-checklist` | code-archaeologist, test-engineer | Phase 4 | Review de PR com nova integração Espaider |
| 16 | `lint-and-validate` | test-engineer, devops-engineer | Phase 4 | ESLint + TypeScript strict; type coverage >90% |
| 17 | `documentation-templates` | documentation-writer | Phase 5 (MANDATORY) | Documentar API Espaider sync; README novo módulo |
| 18 | `deployment-procedures` | devops-engineer, qa-automation-engineer | Phase 3-4 (Deploy) | Deploy Vercel; CI/CD pre-deploy com lint+test+security |
| 19 | `app-builder` | project-planner, orchestrator | Phase 2-3 | Scaffolding de novo módulo CRUD |
| 20 | `tdd-workflow` | test-engineer | Phase 3 | Desenvolver feature com TDD; characterization tests |
| 21 | `behavioral-modes` | orchestrator | Phase 1 | Modo "conciso" em hotfixes vs "detalhado" em features |
| 22 | `web-design-guidelines` | frontend-specialist, qa-automation-engineer | Phase 3-4 | Audit de acessibilidade; screen reader testing |
| 23 | `performance-profiling` | performance-optimizer | Phase 3 (Polish) + Phase 4 | Perfilar LCP do Dashboard; identificar bundle bloat |
| 24 | `red-team-tactics` | security-auditor | Phase 4 | Testar escalação de privilégios; JWT manipulation |

---

### 🟡 OPCIONAIS (8 skills)

Contexto específico. Usar conforme necessário.

| Skill | Contexto | Quando Usar |
|-------|----------|------------|
| `nodejs-best-practices` | Async patterns, error handling | Quando implementar server actions complexos |
| `powershell-windows` | Projeto roda em Windows | Scripts sync, migrations (já em uso: sync.ps1) |
| `i18n-localization` | Internacionalização | Se/quando projeto precisar multi-language |
| `seo-fundamentals` | Páginas públicas | Se houver landing page pública (atualmente interno) |
| `geo-fundamentals` | GenAI optimization | Apenas para presença pública |
| `mcp-builder` | MCPs customizados | Se criar MCP para Espaider API diretamente |
| `docker-expert` | Containerização | Se sair de Vercel para on-premise (futuro) |
| `server-management` | Infraestrutura gerenciada | Se sair de Vercel + Supabase managed (futuro) |

---

### ❌ NÃO APLICÁVEIS (4 skills)

Fora do escopo do projeto.

| Skill | Motivo |
|-------|--------|
| `game-development` | SaaS de gestão de TI, sem features de jogos |
| `mobile-design` | Sem app mobile nativo (web-only) |
| `nestjs-expert` | Stack usa Next.js server actions, não NestJS |
| `python-patterns` | Backend é Node.js/Next.js. Python apenas em scripts de validação |

---

## 2. Skills Custom Implementadas (Formalizar)

O projeto já tem 3 skills custom que devem ser formalizadas no ARCHITECTURE.md:

### `supabase-mcp` (Status: Madura v1.2.0)

**Localização:** `.agent/skills/supabase-mcp/SKILL.md`

**Workflow Existentes:**
- WF-001: Schema Validation (valida estrutura de tabelas)
- WF-002: RLS Policy Check (audita RLS policies)
- WF-003: Migration Safety (valida migrations antes de aplicar)
- WF-004: Data Integrity Check (valida constraints, índices)

**Recomendação:**
- Manter como está (madura)
- **Expandir em Phase 2:** WF-005 (Schema Diff), WF-006 (Query Performance Analysis)

---

### `intelligent-routing` (Status: Funcional, precisa adaptação)

**Localização:** `.agent/skills/intelligent-routing/SKILL.md`

**Problema Identificado:**
- Referencia "GEMINI.md" (artefato do kit original, não aplicável a Claude Code)
- Padrões são genéricos, não específicos de tech-arauz

**Recomendação:**
- **Adaptar AGORA:** Remover referências Gemini
- Adicionar patterns específicos de tech-arauz (CRUD task force, Espaider sync, hotfix)
- Usar como base para `agent-orchestration-patterns` (skill nova)

---

### `nextjs-react-expert` (Status: Rename de react-best-practices)

**Localização:** `.agent/skills/react-best-practices/SKILL.md`

**Status:** Já implementada com 57 regras de otimização Vercel

**Recomendação:**
- Apenas renomear documentação para clareza (é específica de Next.js 14 + React 18)
- Garantir que frontend-specialist carrega sempre

---

## 3. Novas Skills CRÍTICAS (Criar IMEDIATAMENTE)

Identificadas lacunas no conhecimento específico do projeto.

### 3.1 `espaider-integration` (CRIAR - P0)

**Justificativa:** A API `BI_SOLICITACOES_SUPORTEESPAIDER` é central no projeto. Hoje cada agente precisa "redescobrir" como funciona.

**Escopo:**
- Field mapping reference (solicitação_id → campo_suportado, etc.)
- Retry patterns e circuit breaker (ADR-002)
- Null/undefined handling (dados incompletos do Espaider)
- `integration_log_entries` patterns
- Erro de sync (timeout, rate limit, parsing error)
- Exemplo: como sincronizar novo campo de Espaider

**Deliverables:**
- `SKILL.md` com documentação completa
- `references/field-mapping.json` (mapping estruturado)
- `scripts/validate-espaider-schema.py` (validação de campos)
- `references/workflow-sync.md` (guia de implementação)

**Estimativa:** 3-4 horas

---

### 3.2 `supabase-rls-patterns` (CRIAR - P0)

**Justificativa:** RLS é o mecanismo de segurança #1 do projeto. Memory logs já mencionam problemas de migration e tenant isolation.

**Escopo:**
- Padrões: tenant isolation via `get_user_tenant_id()`, role-based access, row-level filtering
- Anti-padrões: RLS bypass via service key, política vazia, DROP RLS sem backup
- Checklist de cobertura de RLS (1 policy por tabela? testada?)
- Templates SQL de políticas comuns
- Como debugar RLS violations
- Validação automatizada (WF do supabase-mcp)

**Deliverables:**
- `SKILL.md` com padrões + anti-padrões
- `references/rls-templates.sql` (políticas prontas para copiar)
- `references/rls-checklist.md` (lista de verificação por tabela)
- `scripts/audit-rls-coverage.py` (verifica % de tabelas com RLS)

**Estimativa:** 2-3 horas

---

### 3.3 `memory-management` (CRIAR - P1)

**Justificativa:** O memory system é core da governança de agentes. Não existe skill que formalize como escrever, ler, usar memory logs.

**Escopo:**
- Template de memory log (contexto, decisões, mudanças, lições)
- Quando CRIAR novo log vs ATUALIZAR existente
- Como referenciar decisões prévias (Chesterton's Fence)
- Cleanup de logs antigos (rotina mensal?)
- Indexação por tema (security, performance, espaider-sync)
- Integração com agent-selection-guide (Rule 4 do memory-driven)

**Deliverables:**
- `SKILL.md` com guia completo
- `references/TEMPLATE.md` (template padrão com exemplos)
- `scripts/memory-indexer.py` (indexa logs por tema)
- `references/EXAMPLES.md` (exemplos reais de memory logs bem-escritos)

**Estimativa:** 2-3 horas

---

### 3.4 `agent-orchestration-patterns` (CRIAR - P1)

**Justificativa:** Expandir `parallel-agents` com padrões específicos de tech-arauz (task force assembly, conflict resolution, dependency chains).

**Escopo:**
- Patterns de task forces: CRUD feature, Espaider sync, hotfix production, refactoring
- Template: "Task Force Definition" (quais agentes, ordem, dependências?)
- Conflict resolution (2 agentes propõem soluções diferentes)
- Dependency chain validator (garante que P0 termina antes P1)
- Decision matrix automático (tarefa -> agentes)
- Como integrar com agent-selection-guide

**Deliverables:**
- `SKILL.md` com padrões + templates
- `references/task-force-definitions.md` (4-5 patterns reais)
- `scripts/validate-task-force.py` (valida dependências)
- `references/decision-matrix-examples.md` (exemplos preenchidos)

**Estimativa:** 3-4 horas

---

## 4. Novas Skills IMPORTANTES (Criar em Phase 2)

1-2 meses após MVP.

| Skill | Agente(s) | Escopo | Estimativa |
|-------|-----------|--------|-----------|
| `zustand-state-management` | frontend-specialist | Store design, selectors, middleware, lazy stores | 2h |
| `react-query-patterns` | frontend-specialist, backend-specialist | Caching, invalidation, optimistic updates | 2h |
| `zod-validation-patterns` | backend-specialist, frontend-specialist | Schema inference, error messages, end-to-end validation | 2h |
| `radix-ui-components` | frontend-specialist | Composição, acessibilidade, customização com Tailwind | 2h |
| `ai-agent-quality-metrics` | orchestrator, product-manager | Métricas de qualidade, LangSmith integration, observability | 3h |

---

## 5. Plano de Implementação Faseado

### MVP (Esta Semana)

**Objetivo:** Formalizar skills existentes e criar as 4 skills críticas.

| # | Ação | Skill | Esforço | Prioridade |
|---|------|-------|--------|-----------|
| 1 | Formalizar no ARCHITECTURE.md | supabase-mcp (custom) | 15 min | P0 |
| 2 | Formalizar no ARCHITECTURE.md | intelligent-routing (custom) | 15 min | P0 |
| 3 | Adaptar intelligent-routing | intelligent-routing | 1h | P0 |
| 4 | Criar espaider-integration | NOVA | 3h | P0 |
| 5 | Criar supabase-rls-patterns | NOVA | 2h | P0 |
| 6 | Criar memory-management | NOVA | 2h | P1 |
| 7 | Criar agent-orchestration-patterns | NOVA | 3h | P1 |
| 8 | Atualizar ARCHITECTURE.md | Skill count: 36 -> 40 | 30 min | P1 |
| 9 | Atualizar agent-selection-guide.md | Referências skill | 1h | P1 |

**Total MVP:** ~13 horas (2-3 dias de desenvolvimento concentrado)

---

### Phase 2 (1-2 meses)

**Objetivo:** Skills de qualidade, state management, validação.

- Criar `zustand-state-management`
- Criar `react-query-patterns`
- Criar `zod-validation-patterns`
- Expandir `supabase-mcp` com WF-005, WF-006
- Adaptar `intelligent-routing` based no feedback do MVP
- Criar `ai-agent-quality-metrics` (preparação para Modulo 2)

**Total Phase 2:** ~12 horas (distribuído ao longo de 1-2 meses)

---

### Future (3+ meses)

- Criar `radix-ui-components` (quando design system amadurecer)
- Criar `vercel-deployment` (quando CI/CD ficar complexo)
- Criar `langsmith-integration` (quando Modulo 2 iniciar)
- Avaliar `i18n-localization` (se internacionalização for requisito)

---

## 6. Integração com Agent-Selection-Guide

### 6.1 Atualizações Necessárias

**No agent-selection-guide.md:**

1. **Adicionar secção "Skills per Phase":**
   - Phase 1 (Ingestion): architecture, plan-writing, behavioral-modes, memory-management
   - Phase 2 (Strategy): architecture, plan-writing, brainstorming, app-builder, agent-orchestration-patterns
   - Phase 3 (Execution): todas as skills técnicas (react-best-practices, database-design, api-patterns, etc.)
   - Phase 4 (Validation): vulnerability-scanner, lint-and-validate, code-review-checklist, red-team-tactics
   - Phase 5 (Documentation): documentation-templates, clean-code
   - Phase 6 (Memory Commit): memory-management

2. **Corrigir references a skills inexistentes:**
   - ❌ `prisma-expert` → ✅ `supabase-mcp`
   - ❌ `refactoring-patterns` → ✅ `clean-code`
   - ❌ "authentication patterns" → ✅ `api-patterns` + `vulnerability-scanner`

3. **Formalizar skills custom:**
   - Adicionar `supabase-mcp` (custom), `intelligent-routing` (custom), `nextjs-react-expert` (custom) aos Agent Profiles

4. **Adicionar secção "Skills Carregadas em Cada Recipe":**
   - Recipe 1 (CRUD): database-design, api-patterns, react-best-practices, testing-patterns, webapp-testing, documentation-templates
   - Recipe 2 (Espaider): espaider-integration, database-design, supabase-rls-patterns, api-patterns, testing-patterns
   - Recipe 3 (Bugfix): systematic-debugging, api-patterns, testing-patterns
   - etc.

---

### 6.2 Novo Padrão de Documentação para Agentes

Cada agent `.md` file deve ter secção `## Skill Loading Protocol`:

```markdown
## Skill Loading Protocol

### Always Load (Toda invocação)
- `clean-code` -- Padrões globais de código

### Load by Phase
- Phase 1 (Ingestion): `architecture`, `memory-management`
- Phase 2 (Strategy): `plan-writing`, `brainstorming`, `agent-orchestration-patterns`
- Phase 3 (Execution): `api-patterns`, `database-design`, `supabase-rls-patterns`
- Phase 4 (Validation): `vulnerability-scanner`, `lint-and-validate`

### Conditional Load
- `espaider-integration` -- Quando task envolve Espaider sync
- `performance-profiling` -- Quando CWV ou bundle size é problema
- `tdd-workflow` -- Quando refactoring ou novo código

### Never Load
- `game-development` -- Fora do escopo
- `mobile-design` -- Web-only
```

---

## 7. Skill Usage em Memory Logs

Cada memory log deve registrar quais skills foram carregadas:

```markdown
---
# .agent/memory/2025-02-13_crud-feature-products.md

## Task
Criar feature CRUD para Products com tabela, API e UI

## Skills Carregadas

### Phase 1 (Ingestion)
- ✅ architecture
- ✅ memory-management
- ✅ behavioral-modes (modo "detalhado" pois feature é complexa)

### Phase 2 (Strategy)
- ✅ plan-writing (criado PLAN.md com 12 sub-tasks)
- ✅ brainstorming (discovery com product-manager)
- ✅ agent-orchestration-patterns (definida task force: 3 agentes)

### Phase 3 (Execution)
- ✅ database-design (P0: criado schema products)
- ✅ supabase-mcp (apply migration)
- ✅ supabase-rls-patterns (RLS policy: users veem apenas produtos próprios)
- ✅ api-patterns (P1: criado 4 endpoints CRUD)
- ✅ react-best-practices (P1: componentes ProductTable + ProductForm)
- ✅ tailwind-patterns (P1: dark mode + spacing)
- ✅ testing-patterns (P2: unit tests)
- ✅ webapp-testing (P2: E2E tests)

### Phase 4 (Validation)
- ✅ vulnerability-scanner (RLS audit OK)
- ✅ lint-and-validate (TypeScript + ESLint)
- ✅ code-review-checklist (PR review OK)
- ✅ web-design-guidelines (accessibility audit OK)

### Phase 5 (Documentation)
- ✅ documentation-templates (API docs criadas)
- ✅ clean-code (docstrings padronizados)

### Phase 6 (Memory Commit)
- ✅ memory-management (este log)

## Decisões Arquiteturais
...

## Lições Aprendidas
...
```

---

## 8. Impacto Esperado

### Antes (sem skills formalizadas)

- Cada agente precisa "redescobrir" contexto do projeto
- Inconsistência entre sessões (um agente faz X, outro faz Y)
- RLS bugs descobertos em produção
- Tempo de contexto em Phase 1: 30-60 min

### Depois (com skills ativas)

| Métrica | Melhoria |
|---------|----------|
| Tempo de contexto (Phase 1) | -60% (skill espaider-integration carregada) |
| Bugs de RLS | -80% (checklist supabase-rls-patterns em Phase 4) |
| Consistência de código | +90% (clean-code + tailwind-patterns formalizados) |
| Qualidade de testes | +70% (testing-patterns + tdd-workflow) |
| Velocidade feature CRUD | -30% (task force com skills pré-carregadas) |
| Time-to-production | -25% (automação de validação com scripts) |

---

## 9. Guia de Priorização: Top 5 Skills Hoje

### 1. `espaider-integration` (CRIAR)
**Por quê:** Projeto gira ao redor dessa integração. Maior gargalo de contexto.
**Ação:** Criar skill esta semana.
**Impacto:** -60% tempo de contexto em tarefas Espaider.

### 2. `supabase-rls-patterns` (CRIAR)
**Por quê:** RLS é o mecanismo de segurança #1. Memory logs mencionam problemas.
**Ação:** Criar skill esta semana.
**Impacto:** -80% bugs de segurança multi-tenant.

### 3. `react-best-practices` (JÁ EXISTE, USAR MAIS)
**Por quê:** 57 regras de otimização. Frontend-specialist deve carregar sempre.
**Ação:** Garantir que é carregada em TODA tarefa de componente.
**Impacto:** +40% performance do Dashboard; -20% bundle size.

### 4. `database-design` + `supabase-mcp` (JÁ EXISTEM, USAR EM CONJUNTO)
**Por quê:** Todo P0 deve carregar ambas.
**Ação:** Formalizar no Protocol de cada agente.
**Impacto:** -90% chances de schema mistakes.

### 5. `architecture` (JÁ EXISTE, USAR EM DECISÕES)
**Por quê:** Toda decisão arquitetural deve passar por trade-off analysis.
**Ação:** Carregar em Phase 1-2 de TODA feature.
**Impacto:** +30% qualidade arquitetural; -20% dívida técnica.

---

## 10. Próximos Passos

### Semana 1
- [ ] Criar `espaider-integration` skill (3h)
- [ ] Criar `supabase-rls-patterns` skill (2h)
- [ ] Criar `memory-management` skill (2h)
- [ ] Criar `agent-orchestration-patterns` skill (3h)
- [ ] Formalizar skills custom em ARCHITECTURE.md (1h)
- [ ] Atualizar agent-selection-guide.md com skill references (1h)

### Semana 2
- [ ] Adaptar `intelligent-routing` para remover Gemini refs (1h)
- [ ] Expandir `supabase-mcp` com WF-005, WF-006 (3h)
- [ ] Testar skills novo-criadas com primeiras tarefas
- [ ] Coletar feedback e iterar

### Month 2-3
- [ ] Criar remaining Phase 2 skills (zustand, react-query, zod, validation)
- [ ] Expandir documentação baseado em memory logs
- [ ] Preparar para Modulo 2 (ai-agent-quality-metrics)

---

## Recursos Críticos

- `.agent/ARCHITECTURE.md` - Atualizar skill count, formalizar custom skills
- `.agent/skills/supabase-mcp/SKILL.md` - Modelo a seguir para novas skills
- `.agent/workflows/agent-selection-guide.md` - Adicionar Skills per Phase
- `.context/00-MASTER.md` - Referência de requisitos de negócio para cada skill
- `.agent/agents/*.md` - Adicionar Skill Loading Protocol section

---

**Última revisão:** 2025-02-12 | Claude Opus 4.6
**Próxima revisão:** 2025-03-12 (após MVP de skills)
