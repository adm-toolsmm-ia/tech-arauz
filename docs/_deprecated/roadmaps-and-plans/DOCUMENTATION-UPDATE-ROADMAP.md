# 📚 PLANO DE ATUALIZAÇÃO DE DOCUMENTAÇÃO — Tech Arauz v0.2.3+

**Data:** 2026-03-15
**Baseado em:** Análise completa da arquitetura atual (v0.2.3+)
**Objetivo:** Documentar o projeto EXATAMENTE COMO FUNCIONA AGORA

---

## EXECUTIVE SUMMARY

O projeto Tech Arauz v0.2.3+ está **bem organizado** mas **documentação está faltando/desatualizada**.

**Plano:** Criar 12 documentações novas + atualizar 4 existentes em ordem de prioridade.

---

## DOCUMENTAÇÃO EXISTENTE vs. O QUE PRECISA SER CRIADA

### ✅ Documentação Existente (Status)

| Documento | Localização | Status | Ação Necessária |
|-----------|------------|--------|-----------------|
| PROJECT-CURRENT-STATE.md | docs/ | ✅ Atual (2026-03-14) | Manter |
| EPIC-INDEX.md | docs/stories/ | ✅ Atual (2026-03-14) | Manter |
| CONTEXT-ENGINEERING-RULES.md | docs/ | ✅ Atual (2026-03-14) | Manter |
| ADR-001 RLS | docs/adr/ | ⚠️ Existe mas desatualizado | **ATUALIZAR** |
| ADR-002 Token | docs/adr/ | ⚠️ Existe mas desatualizado | **ATUALIZAR** |
| ADR-004 Folders | docs/adr/ | ⚠️ Existe mas desatualizado | **ATUALIZAR** |

### ❌ Documentação FALTANDO (CRÍTICA)

| # | Documento | Prioridade | Esforço | Descrição |
|---|-----------|----------|--------|-----------|
| 1 | **TECH-STACK.md** | 🔴 CRÍTICA | 1h | Stack tecnológico completo (Next.js, React, TanStack Query, Supabase, etc.) |
| 2 | **DATABASE-SCHEMA.md** | 🔴 CRÍTICA | 2h | Schema completo com 65 migrations, RLS, índices, tipos |
| 3 | **ARCHITECTURE-OVERVIEW.md** | 🔴 CRÍTICA | 1.5h | Backend + Frontend + Data Flow (por camadas) |
| 4 | **API-DOCUMENTATION.md** | 🔴 CRÍTICA | 2h | 18 endpoints REST (agents, integration, search, sessions) |
| 5 | **SERVER-ACTIONS-GUIDE.md** | 🔴 CRÍTICA | 1.5h | 8 server actions com exemplos |
| 6 | **COMPONENTS-CATALOG.md** | 🔴 CRÍTICA | 2h | 90+ componentes organizados por categoria |
| 7 | **STATE-MANAGEMENT.md** | 🔴 CRÍTICA | 1h | React Query + Zustand + custom hooks (22 hooks documentados) |
| 8 | **DATA-FLOW-DIAGRAMS.md** | 🟠 ALTA | 1.5h | Request/response lifecycle, RLS, caching, real-time |
| 9 | **ESPAIDER-INTEGRATION.md** | 🟠 ALTA | 1.5h | Circuit breaker, retry, pagination, token fallback |
| 10 | **DEVELOPMENT-SETUP.md** | 🟠 ALTA | 1h | Como rodar projeto localmente, env vars, migrations |
| 11 | **TESTING-STRATEGY.md** | 🟠 ALTA | 1h | Vitest, @testing-library, a11y, RLS tests |
| 12 | **DEPLOYMENT-GUIDE.md** | 🟠 ALTA | 1h | Vercel deployment, environment setup, database migrations |

---

## PARTE 1: DOCUMENTAÇÕES CRÍTICAS (12 arquivos)

### 1️⃣ TECH-STACK.md (CRÍTICA — 1h)

**Localização:** `docs/framework/tech-stack.md` (padronizado)

**Seções:**
- Runtime & Language (Node 18+, TypeScript 5.5)
- Framework (Next.js 14.2 + React 18.3)
- State Management (TanStack Query v5.5, Zustand v4.5)
- Database (Supabase PostgreSQL 15, 65 migrations)
- External APIs (Espaider, OpenAI fallback)
- UI Framework (Shadcn/ui, Tailwind 3.4, Lucide icons)
- Forms (React Hook Form 7.71, Zod 3.23)
- Advanced Components (TipTap, Recharts, dnd-kit, html2pdf)
- Testing (Vitest 1.6, @testing-library, Cypress 15.10)
- Deployment (Vercel, Analytics, Speed Insights)

**Razão:** Novo desenvolvedor precisa saber exatamente qual stack está usando.

---

### 2️⃣ DATABASE-SCHEMA.md (CRÍTICA — 2h)

**Localização:** `docs/schema/DATABASE-SCHEMA.md`

**Seções:**

**A. Tenancy & Auth**
- `tenants` table (PK, slug, name, settings JSONB)
- `profiles` table (tenant_id, role: admin/user/viewer)
- auth.users (Supabase managed)

**B. Projects Core** (synced from Espaider)
- `projects` table (tenant_id, espaider_id composite unique, 15+ fields)
- Child tables: schedules, deliveries, histories, approvers, budgets, tempo_permanencia
- `project_360_fields`: fase_atual, area, impacto_operacional, etc.
- `responsible_roles` (recent, Story 10.1)

**C. Organization Knowledge Graph** (Migrations 060-065)
- Hierarchy: OrgArea → OrgNucleus → OrgProcess → OrgRoutine → OrgActivity
- `org_systems`, `org_suppliers`, `org_services`, `org_documents`
- All with `responsible_roles` JSONB + GIN indexes

**D. AI & Agents** (Migrations 028-050)
- `agents`, `agent_types`, `lm_providers`, `lm_models` (with stability_level, capabilities)
- `chatbot_sessions` (Migration 064)

**E. Integration & Logging**
- `espaider_apis`, `integration_log_entries`, `rls_audit_logs`

**F. Indexes & Performance**
- Composite: (tenant_id, espaider_id) UNIQUE
- Foreign keys: ON DELETE CASCADE
- GIN: responsible_roles, documentation JSONB
- B-tree: created_at, updated_at timestamps

**G. RLS Policies**
- ADR-001: All tables use `USING (true) WITH CHECK (true)`
- Service role bypasses RLS for sync operations

**Format:** SQL code blocks + relationship diagrams (ASCII)

**Razão:** Desenvolvedores precisam entender schema completo, indices, RLS, migrations.

---

### 3️⃣ ARCHITECTURE-OVERVIEW.md (CRÍTICA — 1.5h)

**Localização:** `docs/architecture/ARCHITECTURE-OVERVIEW.md`

**Seções:**

**A. System Layers**
```
┌─────────────────────────────────────────┐
│ Client (Next.js + React 18)             │
├─────────────────────────────────────────┤
│ Server Components + Server Actions      │
├─────────────────────────────────────────┤
│ API Routes (18 endpoints)               │
├─────────────────────────────────────────┤
│ Supabase (PostgreSQL + Auth + Storage) │
├─────────────────────────────────────────┤
│ External: Espaider API, OpenAI         │
└─────────────────────────────────────────┘
```

**B. Frontend Architecture**
- 90+ components (Shadcn/ui + custom)
- 11 main pages + layouts
- TanStack Query for caching/sync
- React Hook Form + Zod for forms
- 22 custom hooks

**C. Backend Architecture**
- 8 server actions (projects, organization, tenant, sync, etc.)
- 18 REST API routes
- Espaider integration with circuit breaker
- Service/server/browser Supabase clients

**D. Data Flow**
- Read: Client → Query → Server Action → Supabase (RLS enforced)
- Write: Client → Server Action → Validate → Upsert → Cache invalidate
- Sync: Espaider → Circuit breaker → Retry → Upsert (composite key)

**E. Key Patterns**
- ADR-001: RLS via app-level enforcement
- ADR-002: Token fallback chain
- ADR-004: Feature-based folder structure
- UPSERT: (tenant_id, espaider_id) composite unique

**Razão:** Arquitetos e novos devs precisam entender como sistema é organizado.

---

### 4️⃣ API-DOCUMENTATION.md (CRÍTICA — 2h)

**Localização:** `docs/api/API-DOCUMENTATION.md`

**18 Endpoints Documentados:**

**Agents:** (10 endpoints)
```
GET    /api/agents
GET    /api/agents/[id]
POST   /api/agents (create)
PUT    /api/agents/[id] (update)
DELETE /api/agents/[id]
POST   /api/agents/[id]/chat (completion)
GET    /api/agents/[id]/sessions (history)
GET    /api/agents/[id]/metrics
GET    /api/agents/[id]/traces
GET    /api/agents/budget
```

**Integration:** (6 endpoints)
```
GET    /api/integracoes (status)
POST   /api/integracoes/sync
POST   /api/integracoes/setup
POST   /api/integracoes/test
GET    /api/integracoes/logs
GET    /api/integracoes/logs/summary
```

**Other:** (2 endpoints)
```
GET    /api/search/suggestions
GET    /api/sessions
```

**Para cada endpoint:**
- Method, path, description
- Authentication required?
- Request body (Zod schema)
- Response body (TypeScript type)
- Error codes
- Example cURL

**Razão:** Integração com agentes externos, frontend, testes.

---

### 5️⃣ SERVER-ACTIONS-GUIDE.md (CRÍTICA — 1.5h)

**Localização:** `docs/backend/SERVER-ACTIONS-GUIDE.md`

**8 Server Actions Files:**

```
src/app/actions/
├── projects.ts
│   ├── fetchProjectsWithFiltersAction()
│   ├── updateStatusAction()
│   └── updateNotesAction()
├── organization.ts
│   ├── createAreaAction()
│   ├── updateAreaAction()
│   ├── createNucleusAction()
│   ├── updateNucleusAction()
│   ├── createProcessAction()
│   ├── updateProcessAction()
│   └── updateProcessInputsOutputs()
├── tenant.ts
│   └── initTenant()
├── sync.ts
│   └── triggerEspaiderSync()
├── documents.ts
│   └── CRUD for org_documents
├── lm-providers.ts
│   ├── createProviderAction()
│   └── updateProviderAction()
├── lm-models.ts
│   └── updateModelsAction()
└── agent-types.ts
    └── CRUD for agent templates
```

**Para cada action:**
- Arquivo e função
- O que faz?
- Parâmetros (tipos)
- Retorno (tipo)
- Validação (Zod schema)
- Erro handling
- Exemplo de uso (Client Component)

**Razão:** Developers precisam saber quais server actions existem e como usá-las.

---

### 6️⃣ COMPONENTS-CATALOG.md (CRÍTICA — 2h)

**Localização:** `docs/frontend/COMPONENTS-CATALOG.md`

**90+ Componentes Organizados:**

**UI Primitives (Shadcn/ui):** 20+ components
- Button, Input, Select, Textarea, Card, Dialog, Dropdown, etc.

**Layout:** 3 components
- AppSidebar, DashboardHeader, MainLayout

**Dashboard:** 8 components
- KPICard, OperationMetrics, Charts (Recharts)

**Projects:** 10 components
- ProjectCockpit (4 tabs), ProjectFinancials, ProjectTeam, ProjectNotesEditor, etc.

**Organization:** 6 components
- OrgArea, OrgNucleus, OrgProcess, OrgRoutine, OrgActivity

**Agents:** 8 components
- AgentCockpit, AgentCard, AgentMetrics360, ChatBubble, TraceList

**Chat:** 2 components
- GlobalChatbot, ChatInterface

**Filters & Controls:** 5 components
- FilterBar, StatusFilter, PriorityFilter, etc.

**Error & Notifications:** 4 components
- ErrorBoundary, ErrorFallback, Toast, SkipNavigation

**Cronogramas:** 2 components
- CronogramaGantt, ScheduleEditor

**Para cada componente:**
- Arquivo path
- O que faz?
- Props (TypeScript interface)
- Estado (hooks usados)
- Exemplos de uso
- Accessibility notes
- Story (Storybook link, se existir)

**Razão:** Component library documentation para reuso e consistency.

---

### 7️⃣ STATE-MANAGEMENT.md (CRÍTICA — 1h)

**Localização:** `docs/frontend/STATE-MANAGEMENT.md`

**A. TanStack React Query v5.5**
- Caching strategy (5min staleTime)
- Mutations (useMutation)
- Invalidation patterns
- Refetch on window focus
- Examples: useQuery, useMutation

**B. Zustand v4.5** (optional)
- Global UI state (sidebar, theme)
- No boilerplate
- Examples

**C. Custom Hooks (22 total)**
| Hook | Purpose | Location |
|------|---------|----------|
| useFilterState | Manage filters | src/hooks/ |
| useFilterUrlSync | Sync filters ↔ URL | src/hooks/ |
| usePagination | Pagination | src/hooks/ |
| useAsyncOperation | Loading/error state | src/hooks/ |
| useAsyncFeedback | Toast on mutation | src/hooks/ |
| useDarkMode | Theme toggle | src/hooks/ |
| useNotifications | Toast manager | src/hooks/ |
| useSearchSuggestions | Autocomplete | src/hooks/ |
| usePerformanceData | KPI computation | src/hooks/ |
| (... 13 more) | ... | ... |

**Para cada hook:**
- Nome, localização
- O que faz?
- Parâmetros e retorno (tipos)
- Exemplo de uso
- Efeitos colaterais

**D. Data Flow Patterns**
- Client Component → useQuery → Server Action → Cache
- Client Component → useMutation → Server Action → Invalidate
- Real-time: React Query refetch on interval

**Razão:** Devs precisam entender como gerenciar estado.

---

### 8️⃣ DATA-FLOW-DIAGRAMS.md (ALTA — 1.5h)

**Localização:** `docs/architecture/DATA-FLOW-DIAGRAMS.md`

**Diagramas (ASCII + descrição):**

**A. Read Request Lifecycle**
```
Client Component (useQuery)
  ↓
Server Action / API Route
  ↓
Authentication (JWT check)
  ↓
Query Supabase + RLS filter
  ↓
Transform (dbProjectToUI)
  ↓
React Query cache
  ↓
Component render
```

**B. Write Request Lifecycle**
```
User action (form submit)
  ↓
Client calls Server Action
  ↓
Auth + authorization check
  ↓
Validate (Zod schema)
  ↓
For Sync: circuit breaker + retry
  ↓
Upsert with composite key
  ↓
Revalidate cache
  ↓
React Query invalidate
  ↓
UI update
```

**C. RLS Tenant Isolation**
```
Request with auth context
  ↓
Supabase checks JWT tenant_id
  ↓
RLS policy: USING (true) enforces tenant filter at app level
  ↓
Only rows with matching tenant_id returned
```

**D. Caching Strategy**
- React Query: client-side (5min staleTime)
- Next.js: server-side (revalidatePath on mutation)
- Supabase: connection pooling

**E. Espaider Sync Flow**
```
triggerEspaiderSync() Server Action
  ↓
Circuit breaker check (open/closed?)
  ↓
exportarDados() POST to Espaider
  ↓
Retry with exponential backoff (if fails)
  ↓
Automatic pagination: GET via URLPaginacao
  ↓
Map to DB schema
  ↓
Upsert: INSERT ON CONFLICT UPDATE
  ↓
Log metrics + request ID
```

**Razão:** Visual understanding de como dados fluem.

---

### 9️⃣ ESPAIDER-INTEGRATION.md (ALTA — 1.5h)

**Localização:** `docs/integrations/ESPAIDER-INTEGRATION.md`

**A. Overview**
- 7 datasets from Espaider BI_SOLICITACOES_SUPORTEESPAIDER
- Synced to projects table (tenant_id, espaider_id composite key)
- Multi-phase integration with fallback

**B. Circuit Breaker Pattern**
- Tracks failure count & timestamps
- Opens after N failures
- Auto-resets after timeout
- Prevents cascade failures

**C. Retry with Exponential Backoff**
- Base delay, max delay, max attempts
- Error classification: timeout, network, rate-limit, auth, unknown
- Only retries transient errors

**D. Automatic Pagination**
- POST to /ExportaDados → GET via URLPaginacao
- Merges all pages automatically
- Safety limit: 50 pages max

**E. Request Tracking**
- Per-request UUID
- Token masking in logs
- Metrics: duration, record count, retry count

**F. Configuration Management**
- Priority: override params → env vars → DB stored → error
- Token fallback: ADR-002
- Error handling: graceful degradation

**G. Usage Example**
```typescript
const syncResult = await triggerEspaiderSync({
  datasets: ['solicitacoes', 'projetos'],
  forceRefresh: true,
  onProgress: (status) => console.log(status),
});
```

**H. Troubleshooting**
- Circuit breaker open? Check integration logs
- Token expired? Update .env or DB settings
- Pagination stuck? Check for 50-page limit
- Request failed? Check retry logs with request ID

**Razão:** Devs precisam entender integração com Espaider, troubleshooting.

---

### 🔟 DEVELOPMENT-SETUP.md (ALTA — 1h)

**Localização:** `docs/guides/DEVELOPMENT-SETUP.md`

**A. Prerequisites**
- Node.js 18+
- Git
- Supabase CLI
- npm or pnpm

**B. Clone & Install**
```bash
git clone <repo>
cd tech-arauz
npm install
```

**C. Environment Setup**
- Copy .env.example → .env.local
- Required vars: SUPABASE_URL, SUPABASE_ANON_KEY, PREENCHER_TOKEN
- Optional: AI_SERVICE_URL, OPENAI_API_KEY

**D. Database Setup**
```bash
supabase db push          # Apply migrations to local
supabase db seed          # Load seed data (if exists)
```

**E. Run Development Server**
```bash
npm run dev               # http://localhost:3000
npm run test              # Run tests
npm run lint              # Check code
npm run typecheck         # Validate types
```

**F. Database Connections**
- Browser: createBrowserClient (Client Components)
- Server: createServerClient (Server Components/Actions)
- Service: service role client (sync operations)

**G. Testing Locally**
```bash
npm test                  # Run all tests
npm run test:watch       # Watch mode
npm run test:a11y        # A11y only
```

**H. Common Issues**
- Port 3000 in use? Change in next.config.js
- Database connection timeout? Check SUPABASE_URL
- Auth failing? Verify SUPABASE_ANON_KEY
- Migrations failing? Check supabase status

**Razão:** Novo dev consegue rodar projeto em 30 minutos.

---

### 1️⃣1️⃣ TESTING-STRATEGY.md (ALTA — 1h)

**Localização:** `docs/guides/TESTING-STRATEGY.md`

**A. Test Frameworks**
- Unit/Integration: Vitest 1.6 (Jest-compatible)
- Component Testing: @testing-library/react
- E2E: Cypress 15.10
- A11y: Jest Axe, @axe-core/react

**B. Test Suites**
| Category | Location | Focus | Coverage |
|----------|----------|-------|----------|
| Unit | src/**/*.test.ts | Functions, utilities | 50% |
| Components | src/components/**/*.test.tsx | Rendering, interactions | 30% |
| Hooks | src/hooks/**/*.test.tsx | State, side effects | 10% |
| A11y | src/**/*.a11y.test.tsx | WCAG compliance | 2% |
| RLS | supabase/tests/rls_policies.test.sql | Security | (separate) |
| **Total** | | | **92% avg** |

**C. Running Tests**
```bash
npm test                  # All tests
npm run test:watch      # Watch mode
npm run test:ui         # Vitest UI
npm run test:coverage   # HTML report
npm run test:a11y       # A11y only
npm run test:rls        # DB policies only
npm run gate            # Full quality check (lint+type+test)
```

**D. Writing Tests**
- Use `describe()` for grouping
- Use `it()` for individual tests
- Arrange-Act-Assert pattern
- Mock Supabase clients in tests
- Test user interactions, not implementation

**E. Quality Gates**
- Linting: ESLint + Prettier
- Type checking: TypeScript strict mode
- Tests: 92% average coverage
- CodeRabbit: no CRITICAL/HIGH issues

**F. A11y Testing**
```typescript
import { axe } from 'jest-axe';
it('should have no a11y violations', async () => {
  const { container } = render(<Component />);
  const results = await axe(container);
  expect(results).toHaveNoViolations();
});
```

**G. CI/CD Integration**
- GitHub Actions runs tests on PR
- Must pass linting + type check + tests before merge
- Coverage reports on PR comments

**Razão:** QA e devs entendem testing strategy.

---

### 1️⃣2️⃣ DEPLOYMENT-GUIDE.md (ALTA — 1h)

**Localização:** `docs/guides/DEPLOYMENT-GUIDE.md`

**A. Pre-Deployment Checklist**
- [ ] All tests passing (`npm run gate`)
- [ ] No uncommitted changes
- [ ] Version bumped in package.json?
- [ ] .env.production vars correct in Vercel?
- [ ] Database migrations ready?

**B. Database Migrations**
```bash
supabase db push --remote  # Push to production Supabase
supabase migration list   # Check history
```

**C. Deployment via Vercel**
1. Commit to main branch
2. Vercel auto-detects and builds
3. Automated tests run during build
4. Deploy to production (gru1 region)
5. Health check monitoring

**D. Environment Variables**
| Variable | Required? | Example |
|----------|-----------|---------|
| SUPABASE_URL | ✅ | https://project.supabase.co |
| SUPABASE_ANON_KEY | ✅ | eyJ0eXAi... |
| PREENCHER_TOKEN | ✅ | token-for-espaider |
| AI_SERVICE_URL | ⚠️ Optional | http://ai-service:8000 |
| OPENAI_API_KEY | ⚠️ Optional | sk-... (fallback) |

**E. Monitoring**
- Vercel Analytics: page load, Core Web Vitals
- Integration logs: Espaider sync metrics
- Error tracking: (configure Sentry if needed)

**F. Rollback Procedure**
```bash
vercel rollback             # Automatic rollback to last stable
# OR
git revert <commit>         # Revert problematic commit
git push                    # Auto-deploy reverted version
```

**G. Production Health Checks**
- Dashboard loads?
- Projects sync working?
- Chatbot responding?
- No database errors in logs?

**H. Post-Deployment**
- Monitor Core Web Vitals
- Check integration sync logs
- Verify all features working
- Announce version to team (e.g., "v0.2.4 deployed")

**Razão:** Devops/devs sabe como deploy funciona.

---

## PARTE 2: ATUALIZAR DOCUMENTAÇÃO EXISTENTE (4 ARQUIVOS)

### ✅ ADR-001: RLS via USING(true)

**Localização:** `docs/adr/001-rls-strategy.md`

**Atualizar com:**
- Current implementation: `USING (true), WITH CHECK (true)` em ALL tables
- Service role usage: Sync operations bypass RLS
- Example SQL policies for each table type
- Migration history (which migration added which policy?)
- Testing: How RLS is validated

**Razão:** ADR deve refletir implementação ATUAL.

---

### ✅ ADR-002: Token Fallback

**Localização:** `docs/adr/002-token-fallback.md`

**Atualizar com:**
- Current fallback chain: env vars → DB espaider_apis → error
- Environment variable: `PREENCHER_TOKEN`
- DB storage: espaider_apis.credentials JSON
- How to update token in production
- Error messages when token missing
- Security implications (token masking in logs)

**Razão:** ADR deve documentar implementação ATUAL.

---

### ✅ ADR-004: Feature-Based Folder Structure

**Localização:** `docs/adr/004-feature-folders.md`

**Atualizar com:**
- Current structure:
  ```
  src/
  ├── app/          # Pages, layouts, API routes
  ├── components/   # React components (90+)
  ├── integrations/ # External APIs (Espaider, etc.)
  ├── lib/          # Utilities, hooks, services
  ├── services/     # Business logic
  ├── types/        # TypeScript types
  └── styles/       # Global CSS
  ```
- Rationale: Separation of concerns
- Examples: Where to add new feature?
- Anti-patterns: What NOT to do

**Razão:** ADR deve documentar padrão ATUAL.

---

## PARTE 3: CRIAR DOCUMENTAÇÃO COM PADRÃO AIOX

Todos os 12 arquivos NOVOS devem seguir:

**Template:**
```markdown
# {{TITLE}}

**Version:** 1.0.0
**Last Updated:** 2026-03-15
**Status:** Active
**Framework:** AIOX Story Development Cycle v1.0
**Owner:** @architect (Aria) or appropriate agent
**Last Review:** 2026-03-15
**Next Review:** 2026-03-22

---

## Overview

Brief description of what this document covers.

**Key Points:**
- Point 1
- Point 2
- Point 3

---

## Content

[Organized sections with clear hierarchy]

---

## Related Documents

- [Document 1](../path/doc1.md)
- [Document 2](../path/doc2.md)

---

*Last Updated By:* [Agent Name] (@agent-id)
*Framework:* AIOX Story Development Cycle v1.0
*Next Review:* 2026-03-22
```

---

## PARTE 4: CRONOGRAMA DE EXECUÇÃO

### SEMANA 1 (2026-03-15 a 2026-03-22)

**CRÍTICAS (3 docs, ~4.5h):**
- Monday: TECH-STACK.md (1h)
- Tuesday: ARCHITECTURE-OVERVIEW.md (1.5h)
- Wednesday: COMPONENTS-CATALOG.md (2h)

**Responsável:** @architect (Aria)

### SEMANA 2 (2026-03-22 a 2026-03-29)

**CRÍTICAS (4 docs, ~6.5h):**
- Monday: DATABASE-SCHEMA.md (2h)
- Tuesday: API-DOCUMENTATION.md (2h)
- Wednesday: SERVER-ACTIONS-GUIDE.md (1.5h)
- Thursday: STATE-MANAGEMENT.md (1h)

**Responsável:** @dev (Dex) + @data-engineer (Dara)

### SEMANA 3 (2026-03-29 a 2026-04-05)

**ALTAS (5 docs, ~6h):**
- Monday: DATA-FLOW-DIAGRAMS.md (1.5h)
- Tuesday: ESPAIDER-INTEGRATION.md (1.5h)
- Wednesday: DEVELOPMENT-SETUP.md (1h)
- Thursday: TESTING-STRATEGY.md (1h)
- Friday: DEPLOYMENT-GUIDE.md (1h)

**Responsável:** @devops (Gage) + @qa (Quinn)

### SEMANA 4 (2026-04-05 a 2026-04-12)

**UPDATES (4 docs, ~2h):**
- Monday: Update ADR-001 (0.5h)
- Tuesday: Update ADR-002 (0.5h)
- Wednesday: Update ADR-004 (0.5h)
- Thursday: Review all docs + fix gaps (0.5h)

**Responsável:** @architect (Aria)

---

## PARTE 5: CHECKLIST DE QUALIDADE

Para CADA documento criado:

- [ ] Segue aiox-doc-template.md (frontmatter, structure)
- [ ] Tem Overview com key points
- [ ] Seções organizadas com headers
- [ ] Exemplos código quando apropriado
- [ ] Diagramas ASCII ou descrições visuais
- [ ] Related Documents linked
- [ ] Owner + review date no bottom
- [ ] Framework identifier (AIOX)
- [ ] Sem informação desatualizada
- [ ] Validado contra código ATUAL
- [ ] Pronto para agent memory @import

---

## PARTE 6: REGISTRO EM ENTITY REGISTRY

Após criar cada documento, adicionar em `.aiox-core/data/entity-registry.yaml`:

```yaml
- id: "tech-stack"
  type: "documentation"
  name: "Technology Stack"
  path: "docs/framework/tech-stack.md"
  version: "1.0.0"
  status: "active"
  owner: "@architect"
  category: "project-context"
  description: "Complete technology stack for Tech Arauz v0.2.3+"
  tags: ["stack", "technology", "context"]
  lastUpdated: "2026-03-15"
  reviewDate: "2026-03-22"
```

---

## RESUMO

| Fase | Documentos | Tempo | Responsável |
|------|-----------|-------|-------------|
| **Semana 1** | TECH-STACK, ARCH, COMPONENTS | 4.5h | @architect |
| **Semana 2** | DATABASE, API, ACTIONS, STATE | 6.5h | @dev + @data-engineer |
| **Semana 3** | FLOW, ESPAIDER, SETUP, TESTING, DEPLOY | 6h | @devops + @qa |
| **Semana 4** | ADRs update, Review & Gaps | 2h | @architect |
| **TOTAL** | **12 new + 4 updated** | **~19h** | **Coordenado** |

---

## PRÓXIMOS PASSOS

1. ✅ Identificar agent responsável para cada documento
2. ✅ Criar tasks no AIOX para cada documento
3. ✅ Começar Semana 1 segunda-feira
4. ✅ Daily check-in on progress
5. ✅ Registry update após cada doc criado

---

**Preparado por:** Orion (@aiox-master)
**Data:** 2026-03-15
**Baseado em:** Análise completa da arquitetura v0.2.3+
**Status:** Pronto para execução
