# Agent Selection Guide for Tech Arauz

> Decision matrix and routing protocol for intelligent agent selection in tech-arauz project

---

## 1️⃣ Quick Reference (Decision Table)

Use this table to quickly determine which agent(s) to invoke for your task.

| **Tarefa / Pedido**                          | **Agente(s) Acionado(s)**                                                                                           | **Tipo**    | **Tier** |
| -------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- | ----------- | -------- |
| Criar API endpoint REST/server action        | orchestrator → backend-specialist                                                                                   | Simples     | 2        |
| Implementar componente React                 | orchestrator → frontend-specialist                                                                                  | Simples     | 2        |
| Criar tabela Supabase + RLS policy           | orchestrator → database-architect + security-auditor                                                                | Duplo       | 2        |
| Debugar bug em produção / erro desconhecido  | orchestrator → debugger + backend-specialist (or frontend)                                                          | Duplo       | 2        |
| Adicionar testes unitários / coverage        | orchestrator → test-engineer                                                                                        | Simples     | 3        |
| Adicionar testes E2E (Playwright)            | orchestrator → qa-automation-engineer + test-engineer                                                               | Duplo       | 3        |
| Deploy para produção / staging               | orchestrator → devops-engineer + qa-automation-engineer + security-auditor                                          | Complexo    | 3        |
| Otimizar Web Vitals (LCP, INP, CLS)          | orchestrator → performance-optimizer + frontend-specialist                                                          | Duplo       | 3        |
| Refatorar código legado / 500-line component | orchestrator → code-archaeologist + test-engineer + explorer-agent                                                  | Complexo    | 3        |
| Feature CRUD completa (tabela + API + UI)    | orchestrator → database-architect + backend-specialist + frontend-specialist + test-engineer + documentation-writer | Orquestrado | Mix      |
| Integração Espaider (novo campo/sync)        | orchestrator → explorer-agent + backend-specialist + database-architect + security-auditor + test-engineer          | Orquestrado | Mix      |
| Planejar feature grande ou projeto novo      | orchestrator → project-planner (create PLAN.md) → [user approval] → especialistas                                   | Sequencial  | 2-3      |
| Documentar API / arquitetura / runbook       | orchestrator → documentation-writer (+ explorer-agent se mapping)                                                   | Simples     | 3        |
| Investigar/explorar codebase desconhecido    | orchestrator → explorer-agent (+ especialistas se findings)                                                         | Sequencial  | 1        |

---

## 2️⃣ Agent Tiers

Organize agentes por frequência de uso e criticidade.

### 🔴 TIER 1: Always Active (Toda Sessão)

Estes agentes devem estar presentes em TODA tarefa, em alguma fase do lifecycle.

| Agente           | Fase(s)              | Descrição                                                                  |
| ---------------- | -------------------- | -------------------------------------------------------------------------- |
| `orchestrator`   | Todas (1-6)          | Maestro central, coordena todas as fases, toma decisões arquiteturais      |
| `explorer-agent` | 1, 2 (se necessário) | Mapeia codebase, discovery, análise de padrões, "qual é a estrutura aqui?" |

---

### 🟡 TIER 2: Core Development (Maioria das Sessões)

Estes agentes são acionados na maioria das features/tasks de desenvolvimento.

| Agente                | Tipo de Trabalho | Descrição                                                        | Frequência                     |
| --------------------- | ---------------- | ---------------------------------------------------------------- | ------------------------------ |
| `frontend-specialist` | UI/UX            | React, Next.js, componentes, design, Tailwind, estilo            | ~80% das sessões               |
| `backend-specialist`  | API/Lógica       | Server actions, endpoints, lógica de negócio, Espaider sync      | ~85% das sessões               |
| `database-architect`  | Schema/Data      | Supabase, schema design, migrations, RLS policies                | ~75% das sessões               |
| `security-auditor`    | Segurança        | RLS review, autenticação, validação, proteção de dados           | **100% (obrigatório Phase 4)** |
| `debugger`            | Troubleshooting  | Root cause analysis, investigação de bugs, problema desconhecido | ~30% (conforme necessário)     |

---

### 🟢 TIER 3: Specialized (On-Demand)

Estes agentes são acionados apenas quando necessário, conforme tipo de tarefa.

| Agente                   | Tipo de Trabalho       | Quando Usar                                       | Frequência              |
| ------------------------ | ---------------------- | ------------------------------------------------- | ----------------------- |
| `test-engineer`          | Unit/Integration Tests | Testes unitários, TDD, aumentar coverage          | ~60% (antes de deploy)  |
| `qa-automation-engineer` | E2E Testing            | E2E tests Playwright, CI pipeline, automação      | ~50% (antes de deploy)  |
| `performance-optimizer`  | Performance            | Web Vitals ruins, bundle grande, slow render      | ~20% (on-demand)        |
| `devops-engineer`        | CI/CD/Deploy           | Deployment, CI pipelines, infrastructure          | ~40% (deployments)      |
| `documentation-writer`   | Docs                   | API docs, arquitetura, README, runbooks           | **100% Phase 5**        |
| `project-planner`        | Planning               | Feature scoping, discovery, task breakdown        | ~30% (features grandes) |
| `product-manager`        | Requirements           | User stories, acceptance criteria, prioritization | ~40% (features)         |
| `code-archaeologist`     | Refactoring            | Legacy code, modernization, spaghetti code        | ~10% (refactor sprints) |
| `seo-specialist`         | SEO/Growth             | Meta tags, ranking, Core Web Vitals (public site) | ~5% (launches)          |

---

### ❌ EXCLUDED (Not Applicable)

| Agente               | Motivo                                                      |
| -------------------- | ----------------------------------------------------------- |
| `mobile-developer`   | Sem app mobile nativo (iOS/Android/React Native)            |
| `game-developer`     | Sem game features                                           |
| `penetration-tester` | Usar `security-auditor` ao invés (defensive, não offensive) |

---

## 3️⃣ Agent Profiles (Compact Cards)

Each agent's capabilities, triggers, and interaction patterns.

### ✨ TIER 1 AGENTS

#### 🎼 Orchestrator (`orchestrator`)
- **Scope:** Coordenação de todas as 6 fases, roteamento inteligente de agentes, decisões arquiteturais, validação final
**Gatilhos:** "planejar", "coordenar", "revisar tudo", "gerenciar memória", "montar time"
**Skills:** `parallel-agents`, `plan-writing`, `memory-management`, `agent-orchestration-patterns`
**Output:** Planos de execução, coordenação de agentes, logs de memória, task forces.sões arquiteturais, validação final
- **Preconditions:** Nenhuma
- **Frequency:** **TODA SESSÃO (mandatory)**
- **Conflicts:** Nenhum
- **Must-run-with:** Nenhum (coordena todos)
- **Phase:** 1, 2, 3 (oversight), 4, 6

#### 🔍 explorer-agent
- **Scope:** Mapeamento arquitetural, descoberta, análise de padrões, código desconhecido
- **Skills:** architecture, plan-writing, systematic-debugging, brainstorming
- **Triggers:** "Explorar", "mapear", "entender", "código novo", "arquitetura", "qual é a estrutura", "dependency"
- **Preconditions:** Nenhuma
- **Outputs:** Codebase map, architecture diagram, pattern analysis, risk assessment
- **Frequency:** Primeira sessão + quando código é desconhecido
- **Conflicts:** Nenhum
- **Must-run-with:** (depois invoke especialistas relevantes)
- **Phase:** 1, 2

---

### 🟡 TIER 2 AGENTS

#### 🎨 frontend-specialist
- **Scope:** React, Next.js, componentes, design, Tailwind CSS v4, UX, performance de rendering
- **Skills:** react-best-practices, frontend-design, tailwind-patterns, ui-ux-pro-max, web-design-guidelines
- **Triggers:** "componente", "página", "UI", "design", "estilo", "layout", "button", "form", "React", "Next.js"
- **Preconditions:** Nenhuma
- **Outputs:** React components, styled layouts, performance optimizations, CSS modules
- **Frequency:** ~80% das sessões
- **Conflicts:** Nenhum
- **Must-run-with:** security-auditor (para XSS validation), performance-optimizer (se CWV bad)
- **Phase:** 3 (Execution)
- **Depends-on:** database-architect (schema), backend-specialist (API), security-auditor (data handling)

#### 🔌 backend-specialist
- **Scope:** APIs, server actions, lógica de negócio, Espaider integration, middleware
- **Skills:** api-patterns, nodejs-best-practices, database-design
- **Triggers:** "API", "endpoint", "servidor", "sync", "server action", "route handler", "middleware", "Espaider"
- **Preconditions:** database-architect deve ter run antes (schema existe)
- **Outputs:** API routes, server actions, integration logic, API documentation snippets
- **Frequency:** ~85% das sessões
- **Conflicts:** Nenhum
- **Must-run-with:** security-auditor (autenticação, validação), database-architect (queries)
- **Phase:** 3 (Execution)
- **Depends-on:** database-architect (P0)

#### 🗄️ database-architect
- **Scope:** Supabase, schema design, migrations, RLS policies, data modeling
- **Skills:** database-design, prisma-expert
- **Triggers:** "tabela", "schema", "migração", "RLS", "Supabase", "campo", "coluna", "índice"
- **Preconditions:** Nenhuma
- **Outputs:** Schema definition, migration files, RLS policies, data modeling
- **Frequency:** ~75% das sessões
- **Conflicts:** Nenhum
- **Must-run-with:** security-auditor (RLS review), backend-specialist (queries)
- **Phase:** 3 (Execution) - PRIORITY P0 (deve rodar PRIMEIRO)
- **Depends-on:** Nenhum (first in dependency chain)

#### 🔐 security-auditor
- **Scope:** RLS policies, autenticação, validação, sanitização, proteção de dados sensíveis
- **Skills:** vulnerability-scanner, red-team-tactics, authentication patterns, supabase-rls-patterns
- **Triggers:** "segurança", "RLS", "autenticação", "validação", "sensível", "secret", "token", "OWASP"
- **Preconditions:** Nenhuma (mas deve ser SEMPRE incluído em Fase 4)
- **Outputs:** Security review, RLS policies, validation rules, security recommendations
- **Frequency:** **100% (MANDATORY in Phase 4 Validation)**
- **Conflicts:** Nenhum
- **Must-run-with:** database-architect (RLS), backend-specialist (autenticação), frontend-specialist (XSS)
- **Phase:** 3 (with DB/API), 4 (Validation - mandatory)

#### 🐛 debugger
- **Scope:** Root cause analysis, troubleshooting, investigação de bugs, erro desconhecido
- **Skills:** systematic-debugging, architecture, plan-writing
- **Triggers:** "bug", "erro", "problema", "por que", "investigate", "what's wrong", "crashed"
- **Preconditions:** Nenhuma
- **Outputs:** Root cause analysis, fix recommendations, debugging strategy
- **Frequency:** ~30% (conforme bugs aparecem)
- **Conflicts:** Nenhum
- **Must-run-with:** (especialista relevante: backend/frontend/db)
- **Phase:** 3 (Execution), 4 (Validation)

---

### 🟢 TIER 3 AGENTS

#### ✅ test-engineer
- **Scope:** Unit tests, integration tests, TDD, test coverage
- **Skills:** testing-patterns, tdd-workflow, webapp-testing, code-review-checklist, lint-and-validate
- **Triggers:** "teste", "cobertura", "TDD", "unitário", "integração", "coverage <80%"
- **Preconditions:** Código implementado
- **Outputs:** Test suites, coverage reports, TDD workflows
- **Frequency:** ~60% (obrigatório antes de deploy)
- **Conflicts:** Nenhum
- **Must-run-with:** qa-automation-engineer (para cobertura completa)
- **Phase:** 3 (Execution), 4 (Validation)
- **Depends-on:** backend-specialist ou frontend-specialist (código pronto)

#### 🎯 qa-automation-engineer
- **Scope:** E2E testing (Playwright), CI/CD pipelines, visual regression, test automation
- **Skills:** webapp-testing, testing-patterns, deployment-procedures, web-design-guidelines
- **Triggers:** "E2E", "Playwright", "CI", "pipeline", "automação", "workflow", "visual regression"
- **Preconditions:** Código + testes unitários existem
- **Outputs:** E2E test suites, CI configurations, automation scripts
- **Frequency:** ~50% (obrigatório antes de deployments)
- **Conflicts:** Nenhum
- **Must-run-with:** test-engineer (cobertura unitária)
- **Phase:** 3 (Execution), 4 (Validation)
- **Depends-on:** test-engineer (unit tests first)

#### ⚡ performance-optimizer
- **Scope:** Web Vitals (LCP, INP, CLS), performance profiling, bundle optimization, memory leaks
- **Skills:** performance-profiling, clean-code, react-best-practices
- **Triggers:** "lento", "Web Vitals ruim", "performance", "bundle grande", "otimizar", "LCP", "INP"
- **Preconditions:** Código já existe e roda
- **Outputs:** Performance reports, optimization recommendations, profiling analysis
- **Frequency:** ~20% (conforme necessário, antes de releases)
- **Conflicts:** Nenhum
- **Must-run-with:** frontend-specialist (render optimization)
- **Phase:** 3 (Polish), 4 (Validation)

#### 🚀 devops-engineer
- **Scope:** CI/CD pipelines, deployment, infrastructure, server management, containerization
- **Skills:** deployment-procedures, docker-expert, server-management, bash-linux, powershell-windows
- **Triggers:** "deploy", "produção", "staging", "pipeline", "Docker", "infra", "rollback"
- **Preconditions:** Testes passam, security review OK
- **Outputs:** Deployment configs, CI pipelines, infrastructure code, runbooks
- **Frequency:** ~40% (obrigatório em deployments)
- **Conflicts:** Nenhum
- **Must-run-with:** security-auditor (secrets management), qa-automation-engineer (pre-deploy validation)
- **Phase:** 3 (Polish), 4 (Validation)

#### 📖 documentation-writer
- **Scope:** API docs, arquitetura, runbooks, README, PRD, design docs
- **Skills:** documentation-templates, plan-writing, clean-code
- **Triggers:** "documentar", "API", "README", "runbook", "arquitetura", "PRD"
- **Preconditions:** Código implementado
- **Outputs:** API docs, architecture guides, README updates, runbooks
- **Frequency:** **100% (MANDATORY Phase 5)**
- **Conflicts:** Nenhum
- **Must-run-with:** explorer-agent (se mapeamento necessário)
- **Phase:** 5 (Documentation)

#### 📋 project-planner
- **Scope:** Feature scoping, discovery, task breakdown, project planning, feasibility analysis
- **Skills:** plan-writing, brainstorming, app-builder, clean-code
- **Triggers:** "planejar", "escopo", "descoberta", "tarefas", "breakdown", "viabilidade"
- **Preconditions:** Nenhuma
- **Outputs:** Project plan, task breakdown, architecture proposal, PLAN.md
- **Frequency:** ~30% (features grandes)
- **Conflicts:** Nenhum
- **Must-run-with:** product-manager (para requirements)
- **Phase:** 2 (Strategy)

#### 👤 product-manager
- **Scope:** User stories, requirements, prioritization, acceptance criteria, MoSCoW
- **Skills:** plan-writing, brainstorming, clean-code
- **Triggers:** "requisito", "user story", "prioridade", "MVP", "feature", "acceptance criteria"
- **Preconditions:** Nenhuma
- **Outputs:** User stories, requirements docs, acceptance criteria, prioritization
- **Frequency:** ~40% (antes de features)
- **Conflicts:** Nenhum (prefer `product-manager` por padrão; `product-owner` para roadmap planning)
- **Must-run-with:** project-planner (para scoping)
- **Phase:** 2 (Strategy)
- **Note:** Para Gabriel (PM+PO solo), usar product-manager por padrão

#### 🔨 code-archaeologist
- **Scope:** Legacy code analysis, refactoring, modernization, technical debt
- **Skills:** refactoring-patterns, clean-code, code-review-checklist
- **Triggers:** "refatorar", "legado", "limpar", "jQuery→React", "deprecated", "spaghetti"
- **Preconditions:** Código antigo/messy existe
- **Outputs:** Refactoring plan, characterization tests, modernization roadmap
- **Frequency:** ~10% (refactor sprints)
- **Conflicts:** Nenhum
- **Must-run-with:** test-engineer (characterization tests)
- **Phase:** 3 (Execution)

#### 🔍 seo-specialist
- **Scope:** SEO, ranking, visibility, Core Web Vitals, E-E-A-T, meta tags
- **Skills:** seo-fundamentals, geo-fundamentals, performance-profiling
- **Triggers:** "SEO", "ranking", "meta", "visibilidade", "E-E-A-T", "estruturado"
- **Preconditions:** Site público/publicado existe
- **Outputs:** SEO recommendations, meta tags, Core Web Vitals fixes
- **Frequency:** ~5% (antes de launches)
- **Conflicts:** Nenhum
- **Must-run-with:** performance-optimizer (Web Vitals)
- **Phase:** 3 (Polish), 4 (Validation)

---

## 4️⃣ Disambiguation Rules

When there's overlap between agents, use these rules to decide.

### 📌 Rule 1: product-manager vs product-owner

**Overlap Problem:** Ambos trabalham com user stories, requisitos, priorização.

**Decision Rule:**
- **Use `product-manager`** (PREFERRED) para:
  - Feature scoping (decompor requisito em features)
  - User stories + acceptance criteria
  - Requirements gathering
  - Priorização dentro de feature
- **Use `product-owner`** para:
  - Backlog management (toda uma sprint/release)
  - MVP definition (qual é o core minimal?)
  - Roadmap planning (trimestral/anual)
  - Release strategy

**For tech-arauz:** Gabriel é PM+PO solo. Use `product-manager` por padrão (scoping features), invoke `product-owner` apenas para roadmap/release planning.

---

### 📌 Rule 2: test-engineer vs qa-automation-engineer

**Overlap Problem:** Ambos trabalham com testes, testing-patterns, webapp-testing.

**Decision Rule:**
- **Use `test-engineer`** para:
  - Unit tests (testar função individual)
  - Integration tests (testar módulo inteiro)
  - TDD (test-first development)
  - Aumentar coverage
  - Characterization tests (before refactoring)
- **Use `qa-automation-engineer`** para:
  - E2E tests (testar user flow inteiro, Playwright)
  - CI/CD pipeline setup
  - Test automation na infra
  - Visual regression tests

**Order:** test-engineer first (units), qa-automation-engineer second (E2E validation).

---

### 📌 Rule 3: security-auditor vs penetration-tester

**Overlap Problem:** Ambos trabalham com vulnerability-scanner, red-team-tactics.

**Decision Rule:**
- **Use `security-auditor`** (ALWAYS) para:
  - Defensive security (não permitir attacks)
  - RLS policy review
  - Input validation
  - Authentication/authorization
  - Data protection
  - OWASP compliance checks
- **Use `penetration-tester`** para:
  - Offensive security simulation
  - Exploit testing
  - Formal adversarial testing before major releases
  - Red team exercises

**For tech-arauz:** NUNCA use `penetration-tester`. SEMPRE use `security-auditor` (defensive).

---

## 5️⃣ Dependency Graph (Execution Order)

Agentes devem rodar em ordem específica devido a dependências.

```
┌─────────────────────────────────────────────────────────────┐
│ FASE 1: INGESTION (Orchestrator lê memory, viabilidade)     │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│ FASE 2: STRATEGY (Project-Planner, Explorer se necessário)  │
│ Gera PLAN.md ou strategy document                            │
│ [USER APPROVAL de estratégia]                               │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌──────────────────────────── FASE 3: EXECUTION ─────────────────────────────┐
│                           (Orden P0→P1→P2→P3)                              │
│                                                                             │
│ ┌─ P0: Foundation ──────────────────────────────────────────┐             │
│ │ ├─ database-architect    (create schema + migrations)    │             │
│ │ └─ security-auditor      (review RLS policies)           │             │
│ │                                                            │             │
│ │ ┌─ P1: Core Development ────────────────────────────────┐ │             │
│ │ │ ├─ backend-specialist     (create APIs)               │ │             │
│ │ │ └─ frontend-specialist    (create UI)                 │ │             │
│ │ │                                                        │ │             │
│ │ │ ┌─ P2: Polish & Validate ──────────────────────────┐ │ │             │
│ │ │ │ ├─ test-engineer             (unit tests)        │ │ │             │
│ │ │ │ ├─ qa-automation-engineer    (E2E tests)         │ │ │             │
│ │ │ │ └─ performance-optimizer     (if needed)         │ │ │             │
│ │ │ │                                                  │ │ │             │
│ │ │ │ ┌─ P3: Optional Specialists ──────────────────┐ │ │ │             │
│ │ │ │ │ ├─ code-archaeologist    (if refactoring)  │ │ │ │             │
│ │ │ │ │ ├─ explorer-agent        (if discovery)    │ │ │ │             │
│ │ │ │ │ └─ seo-specialist        (if public site)  │ │ │ │             │
│ │ │ │ └─────────────────────────────────────────────┘ │ │ │             │
│ │ │ └──────────────────────────────────────────────────┘ │ │             │
│ │ └───────────────────────────────────────────────────────┘ │             │
│ └────────────────────────────────────────────────────────────┘             │
└─────────────────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│ FASE 4: VALIDATION (MANDATORY - não é opcional)            │
│                                                             │
│ SEMPRE rodar em paralelo:                                  │
│ ├─ security-auditor      (RLS, auth, data validation)     │
│ ├─ test-engineer         (coverage check)                 │
│ └─ qa-automation-engineer (E2E pass/fail)                 │
│                                                             │
│ Scripts:                                                    │
│ ├─ security_scan.py      (OWASP, vulnerability check)     │
│ └─ lint_runner.py        (TypeScript, ESLint)             │
│                                                             │
│ Orchestrator: Final review & sign-off                      │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│ FASE 5: DOCUMENTATION (documentation-writer)               │
│ Atualizar: README, API docs, ARCHITECTURE.md, runbooks     │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│ FASE 6: MEMORY COMMIT (Orchestrator)                        │
│ Arquivo: `.agent/memory/YYYY-MM-DD_{task-slug}.md`         │
│ Conteúdo: contexto, decisões, mudanças, lições             │
└─────────────────────────────────────────────────────────────┘
```

**Key Rules:**
- **P0 must complete before P1 starts** (schema must exist before API)
- **P1 must complete before P2 starts** (implementation before testing)
- **Phase 4 (Validation) is ALWAYS mandatory** - 3 agents {security-auditor, test-engineer, qa-automation-engineer}
- **Phase 5 (Documentation) is ALWAYS mandatory** - documentation-writer
- **Phase 6 (Memory Commit) is ALWAYS mandatory** - orchestrator

---

## 6️⃣ Memory-Driven Selection Rules

After reading memory logs in Phase 1, apply these auto-include rules:

### Rule 1: Security Warning Auto-Include
**IF** any memory log from last 7 days mentions: "security", "RLS", "data integrity", "vulnerability", "breach attempt"
**THEN** auto-include: `security-auditor` + `database-architect` mesmo que não pareça relacionado.

### Rule 2: Performance Warning Auto-Include
**IF** any memory log from last 7 days mentions: "slow", "Web Vitals", "performance", "memory leak"
**THEN** auto-include: `performance-optimizer` + `frontend-specialist` em próxima sessão relacionada.

### Rule 3: Migration Risk Auto-Include
**IF** any memory log from last 30 days mentions: "migration failed", "rollback", "data loss", "schema change"
**THEN** auto-include: `test-engineer` + `qa-automation-engineer` + `devops-engineer` + `security-auditor` ANTES de próxima migration.

### Rule 4: Integration Risk Auto-Include
**IF** any memory log from last 7 days mentions: "Espaider", "integration broken", "sync failed", "external API error"
**THEN** auto-include: `explorer-agent` + `backend-specialist` + `database-architect` + `security-auditor` ANTES de próximo trabalho em Espaider.

---

## 7️⃣ Common Workflows (Recipes)

Real-world scenarios and their agent task forces.

### Recipe 1️⃣: CRUD Feature Completa

**Scenario:** "Criar tabela de Products com API + UI"

```
User Request
  ↓
orchestrator (Ingestion + Strategy)
  ├─ Read memory
  ├─ Assess dependencies
  └─ Create task force plan
  ↓
[User Approval of Strategy]
  ↓
database-architect (Phase 3 - P0)
  ├─ Create schema: products table (id, name, price, created_at, etc.)
  ├─ Create RLS policy: users can only access own products
  └─ Create migration: supabase/migrations/xxx_create_products.sql
  ↓
security-auditor (Phase 3 - P0)
  ├─ Review RLS policy
  ├─ Validate input constraints
  └─ Check for SQL injection risks
  ↓
backend-specialist (Phase 3 - P1)
  ├─ Create /api/products GET (list + filter)
  ├─ Create /api/products POST (create)
  ├─ Create /api/products/[id] PATCH (update)
  ├─ Create /api/products/[id] DELETE (delete)
  └─ Add validation + error handling
  ↓
frontend-specialist (Phase 3 - P1)
  ├─ Create ProductTable component (display)
  ├─ Create ProductForm component (create/edit)
  ├─ Add hooks: useProducts (fetch), useCreateProduct (create)
  └─ Style with Tailwind
  ↓
test-engineer (Phase 3 - P2)
  ├─ Unit tests: API endpoints (/api/products)
  ├─ Unit tests: ProductTable component
  ├─ Integration tests: create → read → update → delete
  └─ Target coverage > 80%
  ↓
qa-automation-engineer (Phase 3 - P2)
  ├─ E2E test: User creates product → sees in list → edits → deletes
  ├─ E2E test: RLS works (user A can't see user B's products)
  └─ E2E test: Error cases (invalid input, network error)
  ↓
performance-optimizer (Phase 3 - P2 - OPTIONAL)
  ├─ Check: ProductTable renders fast (100 products)
  ├─ Check: API responses < 200ms
  └─ Recommend caching if needed
  ↓
security-auditor (Phase 4)
  ├─ Final RLS check
  ├─ Final input validation review
  └─ Sign-off
  ↓
test-engineer (Phase 4)
  ├─ Verify coverage > 80%
  ├─ Lint check
  └─ Sign-off
  ↓
qa-automation-engineer (Phase 4)
  ├─ Run all E2E tests
  ├─ Sign-off
  ↓
documentation-writer (Phase 5)
  ├─ Document API endpoints (/api/products)
  ├─ Update README: "How to use Products feature"
  └─ Add to ARCHITECTURE.md if significant
  ↓
orchestrator (Phase 6)
  ├─ Final validation
  ├─ Create memory log
  └─ Commit
```

**Agents Used:** database-architect, security-auditor, backend-specialist, frontend-specialist, test-engineer, qa-automation-engineer, [performance-optimizer], documentation-writer
**Estimated Time:** 4-6 hours (feature size dependent)

---

### Recipe 2️⃣: Espaider Integration (New Field)

**Scenario:** "Adicionar campo 'numero_contato' do Espaider às solicitações"

```
User Request
  ↓
explorer-agent (Phase 2)
  ├─ Map Espaider API: BI_SOLICITACOES_SUPORTEESPAIDER schema
  ├─ Find 'numero_contato' field
  └─ Assess impact: where is this used?
  ↓
database-architect (Phase 3 - P0)
  ├─ Add column: solicitacoes.numero_contato (VARCHAR)
  ├─ Create migration
  └─ Update RLS (if user-specific)
  ↓
security-auditor (Phase 3 - P0)
  ├─ Validate: numero_contato is not PII (it is, so encrypt or limit access)
  ├─ Add RLS: only authorized users can see
  └─ Update data validation rules
  ↓
backend-specialist (Phase 3 - P1)
  ├─ Update sync logic: map Espaider numero_contato → DB
  ├─ Handle null/undefined (Espaider data can be incomplete)
  ├─ Add validation: numero_contato format check
  └─ Log sync to integration_log_entries
  ↓
frontend-specialist (Phase 3 - P1)
  ├─ Add numero_contato column to SolicitacaoTable
  ├─ Add filter: filter by numero_contato
  └─ Add to detail view
  ↓
test-engineer (Phase 3 - P2)
  ├─ Test: sync logic handles null numero_contato
  ├─ Test: validation rejects invalid formats
  ├─ Integration test: Espaider → DB → UI
  ↓
qa-automation-engineer (Phase 3 - P2)
  ├─ E2E: Sync from Espaider → see numero_contato in UI
  ├─ E2E: Filter by numero_contato works
  ↓
security-auditor (Phase 4)
  ├─ Final check: RLS properly restricts numero_contato access
  ├─ Final check: No PII leakage in logs
  ↓
documentation-writer (Phase 5)
  ├─ Update integration docs: "Espaider field mapping"
  ├─ Document: numero_contato validation rules
  ↓
orchestrator (Phase 6)
  ├─ Memory log: decision to encrypt/restrict numero_contato
```

**Agents Used:** explorer-agent, database-architect, security-auditor, backend-specialist, frontend-specialist, test-engineer, qa-automation-engineer, documentation-writer
**Estimated Time:** 2-3 hours

---

### Recipe 3️⃣: Production Bugfix (Urgent)

**Scenario:** "Dashboard está mostrando dados de outro usuário (security issue!)"

```
Orchestrator (Phase 1)
  ├─ URGENT: Assess scope (is data exposed? how many users affected?)
  └─ Decide: hotfix now or planned fix?
  ↓
debugger (Phase 3)
  ├─ Root cause: RLS policy misconfigured? JWT issue? Query filter missing?
  ├─ Trace: User A loads dashboard → sees User B's data
  └─ Identify: Line of code responsible
  ↓
(relevant specialist)
  IF RLS issue:
    ├─ database-architect fixes RLS policy
    └─ security-auditor reviews
  IF JWT issue:
    ├─ backend-specialist fixes auth check
    └─ security-auditor reviews
  IF query filter:
    ├─ backend-specialist adds WHERE user_id = current_user
    └─ security-auditor reviews
  ↓
test-engineer (Phase 3 - P2)
  ├─ Write test: User A cannot access User B's dashboard data
  ├─ Add regression test (so this never happens again)
  ↓
qa-automation-engineer (Phase 3 - P2)
  ├─ E2E: Login as User A → can't see User B's data ✓
  ├─ E2E: Login as User B → can't see User A's data ✓
  ↓
security-auditor (Phase 4 - EXPEDITED)
  ├─ Final sign-off: No more data leakage
  └─ APPROVED for deploy
  ↓
devops-engineer (Phase 4)
  ├─ Deploy hotfix to production immediately
  ├─ Monitor for any side effects
  ↓
documentation-writer (Phase 5 - AFTER stabilized)
  ├─ Document: What happened, how fixed
  ├─ Add to postmortems
  ↓
orchestrator (Phase 6)
  ├─ Create memory log: "Security incident - RLS bypass"
  └─ Flag: High priority follow-up investigation
```

**Agents Used:** debugger, (database-architect or backend-specialist), security-auditor, test-engineer, qa-automation-engineer, devops-engineer, documentation-writer
**Estimated Time:** 1-2 hours (urgent)

---

### Recipe 4️⃣: Legacy Code Refactoring

**Scenario:** "ProductForm.tsx is 500 lines, unmaintainable, needs refactoring"

```
orchestrator (Phase 1-2)
  ├─ Assess: Can we refactor without breaking?
  ├─ Decide: Big bang refactor or strangler fig?
  └─ Create strategy
  ↓
explorer-agent (Phase 2)
  ├─ Map ProductForm.tsx: What does each section do?
  ├─ Identify: State management, validation, API calls
  └─ Find dependencies: Where is ProductForm used?
  ↓
code-archaeologist (Phase 3)
  ├─ Propose refactoring strategy:
  │  ├─ Split into smaller components
  │  ├─ Extract form validation logic
  │  ├─ Move API calls to custom hooks
  │  └─ Modernize: Replace old patterns
  ↓
test-engineer (Phase 3 - P0 BEFORE refactoring)
  ├─ Write characterization tests: "Document current behavior"
  │  ├─ Test: Form renders with initial data
  │  ├─ Test: Submit validation works
  │  ├─ Test: Error cases handled
  │  └─ Test: API calls on submit
  └─ Achieve 100% coverage of CURRENT behavior (safety net)
  ↓
code-archaeologist (Phase 3 - AFTER characterization)
  ├─ Safe refactor using strangler fig pattern
  ├─ Bit-by-bit extract components
  ├─ Run characterization tests after each change
  └─ Git commit frequently
  ↓
frontend-specialist (Phase 3 - DURING)
  ├─ Style new components with Tailwind
  ├─ Ensure design consistency
  └─ Performance optimization
  ↓
test-engineer (Phase 3 - AFTER refactoring)
  ├─ Update characterization tests for new structure
  ├─ Add unit tests for extracted components
  ├─ Verify coverage > 80%
  ↓
qa-automation-engineer (Phase 3 - P2)
  ├─ E2E: ProductForm still works exactly like before
  ├─ E2E: All user workflows pass
  ↓
security-auditor (Phase 4)
  ├─ No new security risks introduced? ✓
  ↓
documentation-writer (Phase 5)
  ├─ Document: New component structure
  ├─ Update: Component README
  ↓
orchestrator (Phase 6)
  ├─ Memory log: "ProductForm refactoring completed"
  └─ Note: Characterization testing pattern worked well
```

**Agents Used:** explorer-agent, code-archaeologist, test-engineer, frontend-specialist, qa-automation-engineer, security-auditor, documentation-writer
**Estimated Time:** 4-6 hours (code complexity dependent)

---

### Recipe 5️⃣: Performance Optimization

**Scenario:** "CWV scores are terrible (LCP=4s, INP=250ms, CLS=0.25)"

```
orchestrator (Phase 1-2)
  ├─ Assess: What's causing poor CWV?
  ├─ Create strategy: Which component to optimize first?
  └─ Prioritize: LCP > INP > CLS
  ↓
performance-optimizer (Phase 3)
  ├─ Profile: Run Lighthouse, identify bottlenecks
  ├─ Analysis:
  │  ├─ LCP slow? → Image optimization, server response time
  │  ├─ INP high? → JavaScript blocking main thread
  │  └─ CLS high? → Layout shifts (ads, fonts loading)
  ├─ Recommendations: Specific fixes to apply
  ↓
frontend-specialist (Phase 3 - P2)
  ├─ IF LCP:
  │  ├─ Optimize largest image (use next/image)
  │  ├─ Lazy load non-critical images
  │  └─ Preload critical fonts
  ├─ IF INP:
  │  ├─ Reduce JavaScript in critical path
  │  ├─ Use useTransition for non-blocking updates
  │  └─ Implement debouncing on input handlers
  ├─ IF CLS:
  │  ├─ Reserve space for ads/dynamic content
  │  ├─ font-display: swap (avoid blocking render)
  │  └─ Fix layout shifts
  ↓
backend-specialist (Phase 3 - P2)
  ├─ IF server response slow (>1s):
  │  ├─ Add caching (Redis, in-memory)
  │  ├─ Optimize database queries
  │  └─ Add response compression
  ↓
database-architect (Phase 3 - P2 - OPTIONAL)
  ├─ IF database slow:
  │  ├─ Add indexes to slow queries
  │  ├─ Analyze query plans
  │  └─ Suggest denormalization if needed
  ↓
seo-specialist (Phase 3 - P3)
  ├─ Verify: Core Web Vitals improvements
  ├─ Check: E-E-A-T signals still present
  └─ Meta tags optimization
  ↓
qa-automation-engineer (Phase 4)
  ├─ Run Lighthouse CI on deployment
  ├─ Validate: LCP < 2.5s, INP < 200ms, CLS < 0.1
  ↓
performance-optimizer (Phase 4)
  ├─ Final Lighthouse run
  ├─ Before/after comparison
  ├─ Sign-off if improved
  ↓
documentation-writer (Phase 5)
  ├─ Document: Performance optimization techniques applied
  ├─ Add: Performance monitoring guide
  ↓
orchestrator (Phase 6)
  ├─ Memory log: "CWV optimization completed"
  └─ Note: Techniques for next optimization
```

**Agents Used:** performance-optimizer, frontend-specialist, [backend-specialist], [database-architect], seo-specialist, qa-automation-engineer, documentation-writer
**Estimated Time:** 3-5 hours (depends on complexity)

---

## 🔗 Cross-References

- **Phase 1 (Ingestion):** Apply Memory-Driven Rules (section 6) BEFORE deciding Task Force
- **Phase 2 (Strategy):** Consult this guide's Decision Table (section 1) & Tiers (section 2) to assemble Task Force
- **Phase 3 (Execution):** Follow Dependency Graph (section 5) - P0 → P1 → P2 → P3 order
- **Phase 4 (Validation):** MANDATORY agents: security-auditor + test-engineer + qa-automation-engineer
- **Phase 5 (Documentation):** MANDATORY: documentation-writer
- **Phase 6 (Memory Commit):** Orchestrator creates memory log
- **`.agent/ARCHITECTURE.md`:** Full 20-agent roster and skill mappings
- **`.agent/workflows/orchestration-protocol.md`:** 6-phase lifecycle detailed
- **`.agent/memory/`:** Previous task logs inform current decisions (Phase 1 read)
- **`.context/00-MASTER.md`:** Project business rules and constraints

---

**Last Updated:** 2025-02-12
**Version:** 1.0 (Initial Opus 4.6 refined version)
**Maintained by:** Orchestrator Agent
