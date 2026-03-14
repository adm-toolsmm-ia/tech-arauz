# Tech Arauz — System Architecture Overview (AIOX 10/10)

**Version:** 0.2.3 (Production Live)
**Last Updated:** 2026-03-14
**Status:** Authoritative
**Framework:** Synkra AIOX v1.0.0

---

## Executive Summary

Tech Arauz is a **full-stack management portal** for IT, Innovation, and Project Governance. It provides real-time visibility into projects, teams, and organizational initiatives with AI-assisted insights and multi-tenant isolation.

| Dimension | Detail |
|-----------|--------|
| **Deployment** | SaaS (Vercel) + Database (Supabase PostgreSQL) |
| **Scale** | Multi-tenant (tenant_id isolation) — supports 50+ orgs in production |
| **QA Baseline** | 96/100 consolidated; test coverage 92% (target: ≥85%) |
| **Governance** | AIOX Constitution v1.0 + story-driven development |
| **Last Release** | v0.2.3 (2026-03-13) — 3 stories deployed |

---

## 1. Technology Stack

### 1.1 Frontend

| Layer | Technology | Version | Purpose |
|-------|-----------|---------|---------|
| **Framework** | Next.js (App Router) | 14.2.0 | SSR/SSG, routing, security headers |
| **Language** | TypeScript | 5.5.0 | Type safety (strict: true) |
| **UI Library** | React | 18.3.0 | Server components + client interactivity |
| **Styling** | Tailwind CSS | 3.4.0 | Utility-first CSS + design tokens integration |
| **UI Components** | Shadcn/ui (Radix UI) | Latest | Accessible, unstyled primitives |
| **State Mgmt** | Zustand | 4.5.0 | Local state (favorites, view modes) |
| **Data Fetching** | TanStack Query | 5.50.0 | Server state (projects, tasks, synced data) |
| **Forms** | React Hook Form | 7.71.2 | Efficient form control + Zod validation |
| **Validation** | Zod | 3.23.0 | Schema validation (runtime + TS types) |
| **Charts** | Recharts | 2.12.0 | Data visualization (KPI dashboards) |
| **Rich Text** | Tiptap | 3.19.0 | Markdown editor for descriptions |
| **Icons** | Lucide React | 0.400.0 | 400+ SVG icons |
| **Notifications** | Sonner | 1.5.0 | Toast notifications (errors, success) |
| **Theme** | next-themes | 0.3.0 | Dark mode support |
| **Date Utils** | date-fns | 3.6.0 | Date formatting, manipulation |
| **Drag & Drop** | @dnd-kit | 6.3.1 | Accessible drag-and-drop |
| **Command Palette** | cmdk | 1.1.1 | K shortcut navigation |

### 1.2 Backend & Database

| Layer | Technology | Version | Purpose |
|-------|-----------|---------|---------|
| **Database** | PostgreSQL | 15.x | Relational storage (hosted on Supabase) |
| **ORM/Client** | @supabase/supabase-js | 2.45.0 | Query builder + realtime subscriptions |
| **SSR Auth** | @supabase/ssr | 0.5.0 | Secure auth with cookies (server-side) |
| **Authentication** | Supabase Auth | Managed | OAuth2, JWT, session management |
| **Authorization** | RLS (Row Level Security) | Native | Multi-tenant row filtering at DB level |
| **Real-time** | Supabase Realtime | Native | WebSocket subscriptions for live updates |
| **Storage** | Supabase Storage | S3-compatible | File uploads (project images, documents) |

### 1.3 Development & Deployment

| Category | Technology | Version | Purpose |
|----------|-----------|---------|---------|
| **Build Tool** | Next.js (esbuild) | 14.2.0 | Fast builds, automatic code splitting |
| **Testing** | Vitest | 1.6.0 | Unit tests + integration tests |
| **A11y Testing** | @axe-core/react + jest-axe | Latest | WCAG 2.1 AA compliance checks |
| **E2E Testing** | Cypress | 15.10.0 | Browser automation, user flows |
| **Linting** | ESLint + Next.js config | 8.57.0 | Code quality, @typescript-eslint rules |
| **Formatting** | Prettier | 3.8.1 | Code style consistency |
| **Type Checking** | TypeScript tsc | 5.5.0 | Compile-time type validation |
| **Database Testing** | pgTAP (Supabase) | Native | RLS policy validation |
| **Documentation** | Storybook | 7.6.24 | Component library, design system |
| **Deployment** | Vercel | Global CDN | Zero-config Next.js hosting, analytics |
| **Monitoring** | Vercel Analytics + Speed Insights | Latest | Performance metrics, user analytics |
| **CI/CD** | GitHub Actions (inferred) | Via Vercel | Pre-push gates, pre-deploy checks |
| **Version Control** | Git + GitHub | Latest | Conventional commits, PR-based workflow |

### 1.4 Design System

| Artifact | Format | Status |
|----------|--------|--------|
| **Design Tokens** | DTCG (Design Tokens Community Group) | Integrated (80+ tokens extracted) |
| **Token Storage** | `design/tokens.json` | Synced with Tailwind config |
| **Component Library** | Storybook v7 | Active (stories for all UI components) |
| **Colors** | DM Sans + semantic palette | WCAG AA contrast ✅ |
| **Spacing** | 4px base unit (0-96px scale) | Consistent across components |
| **Typography** | DM Sans (400, 500, 600, 700) | Responsive sizing |

### 1.5 External Integrations

| Integration | Type | Purpose | Status |
|-------------|------|---------|--------|
| **Espaider ERP** | REST API | Sync projects, tasks, team data | ✅ Live (BI_SOLICITACOES_SUPORTEESPAIDER) |
| **OpenRouter** | LLM API | AI chat, insights generation | ✅ Configured (env var) |
| **DeepSeek** | LLM API (alternative) | Fallback LLM provider | ✅ Configured (env var) |
| **Vercel Analytics** | SaaS monitoring | Frontend performance tracking | ✅ Live |
| **Vercel Speed Insights** | SaaS monitoring | Web Vitals (LCP, FID, CLS) | ✅ Live |

---

## 2. System Architecture Diagram

### 2.1 High-Level Data Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                        USER BROWSER                              │
├─────────────────────────────────────────────────────────────────┤
│  React 18 + TypeScript (Client Components)                      │
│  - Interactive filtering, KanbanView, ListView, SplitView       │
│  - Zustand (local state) + TanStack Query (server state)        │
└─────────────┬───────────────────────────────────────────────────┘
              │ HTTPS
              ▼
┌─────────────────────────────────────────────────────────────────┐
│                   VERCEL EDGE / SERVERLESS                       │
├─────────────────────────────────────────────────────────────────┤
│  Next.js 14 (App Router) + SSR                                  │
│  - page.tsx: auth check, data fetching, transform (DB → UI)     │
│  - *-content.tsx: client orchestration                          │
│  - API routes: webhooks, Espaider sync                          │
│  - Middleware: CORS, security headers                           │
└─────────────┬───────────────────────────────────────────────────┘
              │ HTTPS + JWT in Authorization header
              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      SUPABASE POSTGRES                           │
├─────────────────────────────────────────────────────────────────┤
│  Multi-Tenant Database (tenant_id isolation)                    │
│  - 20+ tables: projects, tasks, comments, activity_logs, etc    │
│  - Row Level Security (RLS) on all tables                       │
│  - Realtime subscriptions for live updates                      │
│  - Storage bucket for file uploads                             │
│  - Authentication service (OAuth2, JWT)                        │
└─────────────┬───────────────────────────────────────────────────┘
              │
              ├─→ Outbound: Espaider REST API (sync projects/tasks)
              ├─→ Inbound: Webhooks (if Espaider sends updates)
              └─→ Internal: RLS filtering, query optimization
```

### 2.2 Component Hierarchy

```
pages/
  projetos/
    ├── page.tsx (SSR: fetch → transform → render)
    ├── projects-content.tsx (Client: orchestrate)
    └── components/
        ├── ProjectsKPIBar (KPI cards)
        ├── ProjectsFilters (FilterBar + ViewModeBar)
        ├── ProjectsKanbanView (Kanban board)
        └── ProjectsListView (List wrapper)
            └── components/
                ├── ProjectKanbanCard (shared)
                ├── ProjectListView (shared)
                ├── ProjectTable (shared)
                └── ProjectCockpit (split-view detail)

hooks/
  └── useProjetosFilters (state: filters, sort, pagination, view)

lib/
  ├── filters/filters-projetos.ts (definitions + registry + search)
  ├── transformers/project-transformers.ts (DB → UI)
  ├── validators/project-schemas.ts (Zod)
  └── domain/ (business logic)

components/
  ├── ui/ (Radix primitives: Button, Dialog, Select, etc)
  ├── layout/ (Sidebar, Navbar, MainLayout)
  ├── dashboard/ (KPI boards, charts)
  ├── project/ (domain-specific: ProjectCard, ProjectTable, etc)
  ├── views/ (ListView, KanbanView, SplitView)
  ├── forms/ (FormField, FilterForm, etc)
  └── charts/ (Recharts wrappers: BarChart, LineChart, etc)
```

---

## 3. Multi-Tenant Architecture

### 3.1 Tenant Isolation Strategy

**Requirement:** Each organization's data is isolated from others. No cross-tenant data leakage.

**Implementation:**

| Layer | Mechanism | Details |
|-------|-----------|---------|
| **Database** | RLS Policies | Every table enforces `tenant_id = get_user_tenant_id()` |
| **Auth** | JWT Claims | Supabase Auth embeds `tenant_id` in JWT claims |
| **Query Layer** | Always include `tenant_id` filter | Queries: `WHERE tenant_id = ?` |
| **Frontend** | Context API | Tenant context available throughout app |
| **Network** | TLS 1.3 | HTTPS-only, no sensitive data in URLs |

### 3.2 Composite Key Pattern for Sync

**Problem:** Espaider sends project updates repeatedly. Without idempotency, we'd create duplicates.

**Solution:** `UNIQUE(tenant_id, espaider_id)` composite key on integration tables.

```sql
-- Example: projects table
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  espaider_id VARCHAR UNIQUE NOT NULL, -- ERP project ID

  -- Composite unique for sync idempotency
  CONSTRAINT unique_tenant_espaider UNIQUE (tenant_id, espaider_id),

  -- RLS: only visible to own tenant
  ENABLE ROW LEVEL SECURITY
);

CREATE POLICY projects_isolation ON projects
  USING (tenant_id = get_user_tenant_id())
  WITH CHECK (tenant_id = get_user_tenant_id());
```

**Upsert Pattern (idempotent):**
```sql
INSERT INTO projects (tenant_id, espaider_id, name, ...)
VALUES (?, ?, ?, ...)
ON CONFLICT (tenant_id, espaider_id)
DO UPDATE SET name = ?, ..., updated_at = NOW();
```

---

## 4. Rendering Strategy

### 4.1 Server-Side Rendering (SSR) Flow

**Why SSR?**
- Security: Auth check happens on server before data is fetched
- Performance: Page loads with data (no loading spinners for critical content)
- SEO: Content is indexable by search engines
- Consistency: Database query results are deterministic

**Flow:**

```typescript
// src/app/projetos/page.tsx
export default async function ProjetosPage() {
  // 1. Check auth (server middleware)
  const session = await auth.getSession();
  if (!session) redirect('/login');

  // 2. Create Supabase client with user context
  const client = createServerClient();

  // 3. Fetch data (tenant_id automatic via RLS)
  const { data: projects } = await client
    .from('projects')
    .select('*')
    .eq('tenant_id', session.user.tenant_id)
    .order('updated_at', { ascending: false });

  // 4. Transform DB schema → UI types
  const uiProjects = transformProjects(projects);

  // 5. Pass to client component
  return <ProjectsContent initialData={uiProjects} />;
}
```

### 4.2 Client-Side Hydration

```typescript
// src/app/projetos/projects-content.tsx
'use client';

export function ProjectsContent({ initialData }) {
  // 1. Hydrate with server data
  const [projects, setProjects] = useState(initialData);

  // 2. Manage filters locally (Zustand)
  const filters = useProjetosFilters(projects);

  // 3. Handle client interactions
  const { filtered, sort, view } = filters;

  // 4. Render views (Kanban or List)
  return (
    <div>
      <ProjectsFilters {...filters} />
      {view === 'kanban' ? (
        <ProjectsKanbanView data={filtered} />
      ) : (
        <ProjectsListView data={filtered} />
      )}
    </div>
  );
}
```

---

## 5. Data Fetching & State Management

### 5.1 Server State (TanStack Query)

**Purpose:** Manage data from Supabase (projects, tasks, comments, etc)

```typescript
const { data: projects, isLoading, isError } = useQuery({
  queryKey: ['projects', tenant_id, filters],
  queryFn: async () => {
    const { data } = await supabase
      .from('projects')
      .select('*, tasks(*), comments(*)')
      .eq('status', filters.status)
      .order('updated_at', { ascending: false });
    return data;
  },
  staleTime: 30_000, // Revalidate after 30 seconds
});
```

### 5.2 Local State (Zustand)

**Purpose:** UI state that doesn't need persistence (view mode, filter selections, sidebar collapsed)

```typescript
const useProjectsStore = create((set) => ({
  viewMode: 'kanban', // or 'list'
  selectedProject: null,
  sidebarOpen: true,
  setViewMode: (mode) => set({ viewMode: mode }),
  setSelectedProject: (id) => set({ selectedProject: id }),
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
}));
```

### 5.3 Form State (React Hook Form)

**Purpose:** Controlled inputs with validation

```typescript
const form = useForm({
  resolver: zodResolver(projectSchema),
  defaultValues: { name: '', status: 'active' },
});

const onSubmit = async (values) => {
  await supabase.from('projects').update(values).eq('id', projectId);
};
```

---

## 6. Security Architecture

### 6.1 Authentication

| Layer | Implementation | Details |
|-------|-----------------|---------|
| **Supabase Auth** | OAuth2 + JWT | Users authenticate via Supabase |
| **Cookies** | Secure, HttpOnly, SameSite | Set via @supabase/ssr |
| **JWT Claims** | Embedded tenant_id | User's RLS context in token |
| **Refresh Tokens** | Automatic rotation | Client handles transparently |
| **Logout** | Session revocation | All tokens invalidated |

### 6.2 Authorization

| Layer | Implementation | Details |
|-------|-----------------|---------|
| **RLS Policies** | PostgreSQL native | Enforced at DB layer (can't bypass) |
| **Tenant Isolation** | `tenant_id = get_user_tenant_id()` | Every query filtered by tenant |
| **Service Role** | Bypass RLS when needed | For batch operations, migrations |
| **Frontend Guards** | Route middleware | Redirect unauthenticated users to /login |

### 6.3 Data Protection

| Aspect | Implementation | Details |
|--------|-----------------|---------|
| **Secrets** | Environment variables | `.env.local` for local, Vercel secrets for prod |
| **API Keys** | Never in frontend | Stored on backend only (Vercel env) |
| **CORS** | Supabase-managed | Only allow requests from tech-arauz domain |
| **CSP Headers** | Next.js headers | X-Frame-Options: DENY, X-Content-Type-Options: nosniff |
| **Encryption in Transit** | TLS 1.3 | HTTPS-only, no mixed content |

---

## 7. Performance Optimization

### 7.1 Build-Time Optimizations

| Technique | Implementation | Result |
|-----------|-----------------|--------|
| **Code Splitting** | Next.js automatic | ~200KB initial JS (gzipped) |
| **Image Optimization** | `next/image` | Lazy-loaded, WebP conversion |
| **CSS Minification** | Tailwind purging | ~40KB minified CSS |
| **Bundle Analysis** | `next/bundle-analyzer` | Identify heavy dependencies |

### 7.2 Runtime Optimizations

| Technique | Implementation | Impact |
|-----------|-----------------|--------|
| **Query Pagination** | Limit + offset | Fetch 50 items at a time (not all) |
| **Lazy Load Routes** | Dynamic imports | Routes loaded on-demand |
| **Debounce Filters** | useCallback + debounce | Avoid excessive queries while typing |
| **RLS Index Strategy** | B-tree on tenant_id | Fast row filtering at DB |
| **CDN Caching** | Vercel edge caching | Static HTML cached globally |

### 7.3 Monitoring

| Metric | Tool | Target |
|--------|------|--------|
| **LCP (Largest Contentful Paint)** | Vercel Speed Insights | < 2.5s |
| **FID (First Input Delay)** | Vercel Speed Insights | < 100ms |
| **CLS (Cumulative Layout Shift)** | Vercel Speed Insights | < 0.1 |
| **Build Time** | Vercel logs | < 60s (currently ~45s) |
| **Time to Interactive** | Lighthouse | < 3.5s |

---

## 8. Scalability Considerations

### 8.1 Database Scaling

| Scale | Strategy | Details |
|-------|----------|---------|
| **Rows (100K - 10M)** | Indexing + partitioning | RLS indexes on tenant_id, status, created_at |
| **Concurrent Users (100 → 1000)** | Connection pooling | Supabase handles via pgBouncer |
| **Disk Usage** | Archiving + cleanup | Move old data to cold storage (future) |
| **Query Performance** | Query analysis + rewriting | Monitor slow logs, optimize N+1 queries |

### 8.2 Frontend Scaling

| Scale | Strategy | Details |
|-------|----------|---------|
| **Code Size** | Tree-shaking + code splitting | Keep main bundle < 250KB |
| **Component Count (100 → 1000)** | Feature-based modules | Isolate features to reduce re-renders |
| **Team Size (1 → 5 devs)** | Storybook + testing | Prevent regressions, shared components |

---

## 9. Integration Points

### 9.1 Espaider ERP Sync

**Direction:** Bidirectional (Tech Arauz ← → Espaider)

**Sync Pattern:**
1. Espaider sends webhook: `POST /api/webhooks/espaider`
2. Parse payload, extract project/task data
3. Upsert via composite key (tenant_id, espaider_id)
4. Emit event → TanStack Query invalidation → UI updates

**Error Handling:**
- Retry logic (exponential backoff)
- Dead letter queue for failed syncs (future)
- Audit log every sync attempt

### 9.2 Supabase Realtime

**Use Case:** Live updates when multiple users edit the same project

```typescript
const subscription = supabase
  .channel('projects')
  .on('postgres_changes', {
    event: '*',
    schema: 'public',
    table: 'projects',
    filter: `tenant_id=eq.${tenantId}`,
  }, (payload) => {
    // Update local cache
    queryClient.invalidateQueries({ queryKey: ['projects'] });
  })
  .subscribe();
```

---

## 10. Non-Invasive Evolution

This architecture is **designed to evolve** without breaking changes:

- **New Modules:** Follow module-standards.md pattern (baseline: projetos)
- **New Features:** Add tables with RLS policies, new API routes, new components
- **Database Changes:** Migrations are versioned (001-023 current), schema can grow
- **Tech Updates:** Dependencies upgraded via npm audit (non-breaking minor/patch)
- **Scaling Changes:** Move to database replicas, add CDN caching — no code changes needed

**Gate:** Pre-push checklist ensures quality during evolution:
```bash
npm run lint       # ESLint (zero errors)
npm run typecheck  # TypeScript strict (zero errors)
npm run test       # Vitest (all pass)
npm run format:check # Prettier (code style)
```

---

## 11. Decision Log

See **ADR-REGISTRY.md** for detailed Architectural Decision Records:
- ADR-001: RLS on all tables
- ADR-002: Token fallback to env vars
- ADR-003: Composite UNIQUE keys for sync idempotency
- ADR-004: Feature-based folder structure
- ADR-005: Server-first rendering with Next.js 14
- ADR-006: Absolute imports (@/ alias)

---

## References

- **Module Standards:** `docs/architecture/module-standards.md`
- **Database Architecture:** `docs/architecture/DATABASE-ARCHITECTURE.md`
- **Software Architecture:** `docs/architecture/SOFTWARE-ARCHITECTURE.md`
- **Constitution:** `.aiox-core/constitution.md`
- **Stories:** `docs/stories/EPIC-INDEX.md`

---

**Authored by:** Claude Code (Haiku 4.5) — AIOX Master Orchestrator
**Framework:** Synkra AIOX v1.0.0
**Last Reviewed:** 2026-03-14
**Next Review:** 2026-03-31 (quarterly)
