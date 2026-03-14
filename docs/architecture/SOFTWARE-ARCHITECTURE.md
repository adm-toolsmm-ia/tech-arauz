# Software Architecture — Components, Patterns & Structure (AIOX 10/10)

**Version:** 0.2.3 (Production Live)
**Last Updated:** 2026-03-14
**Status:** Authoritative — normative patterns
**Baseline Reference:** `src/app/projetos/` module

---

## 1. Layered Architecture Model

Tech Arauz follows a **4-layer architecture** with clear separation of concerns:

```
┌─────────────────────────────────────────────────────────────────┐
│ LAYER 4: PRESENTATION (UI Components)                           │
│ React components, styling, interactions, accessibility          │
├─────────────────────────────────────────────────────────────────┤
│ LAYER 3: ORCHESTRATION (Client Logic)                           │
│ Filter state, sort, view mode, user interactions                │
├─────────────────────────────────────────────────────────────────┤
│ LAYER 2: DOMAIN (Business Logic)                                │
│ Transformations, validators, filters, business rules            │
├─────────────────────────────────────────────────────────────────┤
│ LAYER 1: DATA ACCESS (Server + Database)                        │
│ Auth, queries, RLS enforcement, migrations                      │
└─────────────────────────────────────────────────────────────────┘
```

### 1.1 Layer Responsibilities

| Layer | Responsibility | Enforced By |
|-------|-----------------|------------|
| **L1: Data Access** | Fetch, transform, secure | SSR page.tsx, RLS policies |
| **L2: Domain** | Business logic, validation | Zod, utils, transformers |
| **L3: Orchestration** | State management, events | Zustand, React Hook Form, custom hooks |
| **L4: Presentation** | Rendering, UI interactions | React components, Tailwind, Radix |

---

## 2. Module Engineering Standard

### 2.1 Baseline Reference: `src/app/projetos/`

The `projetos` (projects) module is the **canonical reference** for all new modules. Every new module must follow this structure exactly, adapting to domain context.

**Directory Structure:**

```
src/app/projetos/
├── page.tsx                                  [L1] SSR: auth + fetch + transform
├── projects-content.tsx                      [L3] Client: orchestration
├── components/
│   ├── ProjectsKPIBar.tsx                   [L4] KPI cards (status counts, metrics)
│   ├── ProjectsFilters.tsx                  [L4] FilterBar + ViewMode + Sort + Actions
│   ├── ProjectsKanbanView.tsx               [L4] Kanban board (visual task management)
│   └── ProjectsListView.tsx                 [L4] List view (wrapper → shared component)
├── constants.ts (optional)                  [L2] Domain constants (statuses, priorities)
└── types.ts (optional)                      [L2] Local types (if not in src/lib/types)
```

### 2.2 File Naming Conventions

| File Type | Convention | Example |
|-----------|-----------|---------|
| **Server Page** | `page.tsx` | `src/app/projetos/page.tsx` |
| **Client Content** | `{module}-content.tsx` | `projects-content.tsx` |
| **KPI Bar** | `{Module}KPIBar.tsx` | `ProjectsKPIBar.tsx` |
| **Filters Component** | `{Module}Filters.tsx` | `ProjectsFilters.tsx` |
| **Kanban View** | `{Module}KanbanView.tsx` | `ProjectsKanbanView.tsx` |
| **List View** | `{Module}ListView.tsx` | `ProjectsListView.tsx` |
| **Custom Hook** | `use{Module}{Feature}.ts` | `useProjetosFilters.ts` |
| **Filter Registry** | `filters-{module}.ts` | `filters-projetos.ts` |
| **Transformers** | `{domain}-transformers.ts` | `project-transformers.ts` |
| **Validators** | `{domain}-schemas.ts` | `project-schemas.ts` |
| **Types** | `{domain}-types.ts` or `index.ts` | `project-types.ts` |

---

## 3. Layer 1: Data Access (Server-Side)

### 3.1 Server Page Pattern

**File:** `src/app/projetos/page.tsx`

**Responsibilities:**
1. Check authentication (redirect if not logged in)
2. Create Supabase client with user context
3. Fetch data from database (RLS enforced)
4. Transform DB schema → UI types
5. Pass to client component
6. Never expose secrets, never trust client input

**Example:**

```typescript
import { createServerClient } from '@/lib/supabase/server';
import { transformProjects } from '@/lib/transformers/project-transformers';
import { ProjectsContent } from './projects-content';
import { redirect } from 'next/navigation';

export const metadata = {
  title: 'Projetos — Tech Arauz',
  description: 'Manage all projects with Kanban and list views',
};

export default async function ProjetosPage() {
  // 1. Auth check
  const client = await createServerClient();
  const { data: { session } } = await client.auth.getSession();

  if (!session) {
    redirect('/login');
  }

  // 2. Fetch data (RLS automatic via tenant_id claim)
  const { data: projects, error } = await client
    .from('projects')
    .select(`
      id, name, status, priority, description, tenant_id,
      created_at, updated_at,
      tasks(id, title, status, assigned_to),
      comments(id, content, created_by)
    `)
    .order('updated_at', { ascending: false })
    .limit(100);

  if (error) {
    console.error('Failed to fetch projects:', error);
    return <div>Error loading projects</div>;
  }

  // 3. Transform (DB → UI)
  const uiProjects = transformProjects(projects);

  // 4. Pass to client
  return <ProjectsContent initialData={uiProjects} />;
}
```

**Security Checklist:**
- ✅ Auth verified before data access
- ✅ RLS enforced (tenant_id automatic)
- ✅ No sensitive data exposed to client
- ✅ Error handling (no stack traces to client)
- ✅ Query limits (don't fetch all rows)

### 3.2 RLS Enforcement

Every table has a Row Level Security policy:

```sql
-- Enforce tenant isolation at DB level (can't be bypassed)
CREATE POLICY projects_user_isolation ON projects
  FOR SELECT
  USING (tenant_id = (SELECT tenant_id FROM auth.users WHERE id = auth.uid()));

CREATE POLICY projects_user_insert ON projects
  FOR INSERT
  WITH CHECK (tenant_id = (SELECT tenant_id FROM auth.users WHERE id = auth.uid()));

-- Users can only update their own tenant's projects
CREATE POLICY projects_user_update ON projects
  FOR UPDATE
  USING (tenant_id = (SELECT tenant_id FROM auth.users WHERE id = auth.uid()))
  WITH CHECK (tenant_id = (SELECT tenant_id FROM auth.users WHERE id = auth.uid()));
```

---

## 4. Layer 2: Domain Logic

### 4.1 Transformers (DB → UI)

**File:** `src/lib/transformers/project-transformers.ts`

**Purpose:** Convert database schema to UI types, enrich with computed fields.

```typescript
import type { ProjectDB } from '@/lib/types';
import type { ProjectUI } from '@/lib/types';

export function transformProject(db: ProjectDB): ProjectUI {
  return {
    id: db.id,
    name: db.name,
    status: db.status as ProjectStatus,
    priority: db.priority as ProjectPriority,
    description: db.description || '',

    // Computed: count tasks by status
    taskStats: {
      total: db.tasks?.length || 0,
      completed: db.tasks?.filter(t => t.status === 'done').length || 0,
      inProgress: db.tasks?.filter(t => t.status === 'in_progress').length || 0,
    },

    // Computed: latest comment
    latestComment: db.comments?.[0]?.content,

    // Dates
    createdAt: new Date(db.created_at),
    updatedAt: new Date(db.updated_at),
  };
}

export function transformProjects(projects: ProjectDB[]): ProjectUI[] {
  return projects.map(transformProject);
}
```

### 4.2 Validators (Zod Schemas)

**File:** `src/lib/validators/project-schemas.ts`

**Purpose:** Define validation rules (runtime + TypeScript types).

```typescript
import { z } from 'zod';

export const projectStatusSchema = z.enum(['active', 'paused', 'done', 'archived']);
export const projectPrioritySchema = z.enum(['low', 'medium', 'high', 'critical']);

export const projectSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(255),
  status: projectStatusSchema,
  priority: projectPrioritySchema,
  description: z.string().max(5000).optional(),
  tenant_id: z.string().uuid(),
  created_at: z.date(),
  updated_at: z.date(),
});

export const projectCreateSchema = projectSchema.omit({
  id: true,
  tenant_id: true,
  created_at: true,
  updated_at: true,
});

export const projectUpdateSchema = projectCreateSchema.partial();

export type Project = z.infer<typeof projectSchema>;
export type ProjectCreate = z.infer<typeof projectCreateSchema>;
export type ProjectUpdate = z.infer<typeof projectUpdateSchema>;
```

### 4.3 Business Logic (Utils)

**File:** `src/lib/domain/project-utils.ts`

**Purpose:** Pure functions for calculations, status transitions, etc.

```typescript
export function canTransitionStatus(
  from: ProjectStatus,
  to: ProjectStatus
): boolean {
  const validTransitions: Record<ProjectStatus, ProjectStatus[]> = {
    active: ['paused', 'done'],
    paused: ['active', 'done'],
    done: ['archived'],
    archived: [], // Terminal state
  };
  return validTransitions[from]?.includes(to) ?? false;
}

export function getProjectColor(status: ProjectStatus): string {
  const colors = {
    active: 'bg-green-100 text-green-800',
    paused: 'bg-yellow-100 text-yellow-800',
    done: 'bg-blue-100 text-blue-800',
    archived: 'bg-gray-100 text-gray-800',
  };
  return colors[status];
}

export function isProjectOverdue(project: ProjectUI): boolean {
  return project.dueDate < new Date() && project.status !== 'done';
}
```

---

## 5. Layer 3: Orchestration (Client State)

### 5.1 Custom Hooks (State Management)

**File:** `src/hooks/useProjetosFilters.ts`

**Purpose:** Manage filter state, sorting, pagination, computed values.

```typescript
import { useState, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import type { ProjectUI, ProjectFilter } from '@/lib/types';

export function useProjetosFilters(initialData: ProjectUI[]) {
  // Local state: user selections
  const [filters, setFilters] = useState<ProjectFilter>({
    status: [],
    priority: [],
    search: '',
    sortBy: 'updated_at',
    sortOrder: 'desc',
    viewMode: 'kanban', // 'kanban' | 'list'
    pageSize: 50,
    page: 1,
  });

  // Computed: apply filters
  const applyFilters = useCallback((projects: ProjectUI[]) => {
    let result = projects;

    // Status filter
    if (filters.status.length > 0) {
      result = result.filter(p => filters.status.includes(p.status));
    }

    // Priority filter
    if (filters.priority.length > 0) {
      result = result.filter(p => filters.priority.includes(p.priority));
    }

    // Search filter (name + description)
    if (filters.search) {
      const query = filters.search.toLowerCase();
      result = result.filter(p =>
        p.name.toLowerCase().includes(query) ||
        p.description?.toLowerCase().includes(query)
      );
    }

    // Sorting
    result.sort((a, b) => {
      const aVal = a[filters.sortBy as keyof ProjectUI];
      const bVal = b[filters.sortBy as keyof ProjectUI];
      const cmp = aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
      return filters.sortOrder === 'asc' ? cmp : -cmp;
    });

    return result;
  }, [filters]);

  const filtered = applyFilters(initialData);
  const paginated = filtered.slice(
    (filters.page - 1) * filters.pageSize,
    filters.page * filters.pageSize
  );

  return {
    // Computed values
    filtered,
    paginated,
    totalCount: filtered.length,
    pageCount: Math.ceil(filtered.length / filters.pageSize),

    // State setters
    setFilters,
    setStatus: (s: ProjectStatus[]) => setFilters(f => ({ ...f, status: s })),
    setPriority: (p: ProjectPriority[]) => setFilters(f => ({ ...f, priority: p })),
    setSearch: (q: string) => setFilters(f => ({ ...f, search: q, page: 1 })),
    setSortBy: (s: string) => setFilters(f => ({ ...f, sortBy: s })),
    setViewMode: (m: 'kanban' | 'list') => setFilters(f => ({ ...f, viewMode: m })),
    nextPage: () => setFilters(f => ({ ...f, page: f.page + 1 })),
    prevPage: () => setFilters(f => ({ ...f, page: Math.max(1, f.page - 1) })),
  };
}
```

### 5.2 Zustand Store (Persistent State)

**File:** `src/lib/store/projects-store.ts`

**Purpose:** Persist user preferences across sessions.

```typescript
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface ProjectsStoreState {
  // Preferences
  viewMode: 'kanban' | 'list';
  sidebarOpen: boolean;
  selectedProjectId: string | null;

  // Actions
  setViewMode: (m: 'kanban' | 'list') => void;
  toggleSidebar: () => void;
  selectProject: (id: string) => void;
}

export const useProjectsStore = create<ProjectsStoreState>()(
  persist(
    (set) => ({
      viewMode: 'kanban',
      sidebarOpen: true,
      selectedProjectId: null,

      setViewMode: (mode) => set({ viewMode: mode }),
      toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
      selectProject: (id) => set({ selectedProjectId: id }),
    }),
    {
      name: 'projects-store', // Key in localStorage
      partialize: (state) => ({
        viewMode: state.viewMode,
        sidebarOpen: state.sidebarOpen,
      }),
    }
  )
);
```

---

## 6. Layer 4: Presentation (UI Components)

### 6.1 Component Hierarchy

```
ProjectsContent (orchestrator)
  ├── ProjectsKPIBar (metrics cards)
  │   ├── KPICard (reusable card)
  │   ├── KPICard
  │   └── KPICard
  │
  ├── ProjectsFilters (filter/sort controls)
  │   ├── FilterBar (status, priority dropdowns)
  │   ├── ViewModeBar (kanban/list toggle)
  │   ├── SortBar (sort by, order)
  │   └── SearchInput (search projects)
  │
  └── (conditional)
      ├── ProjectsKanbanView (if view === 'kanban')
      │   └── ProjectKanbanCard[] (repeated)
      │       └── ProjectCockpit (split-view detail)
      │
      └── ProjectsListView (if view === 'list')
          └── ProjectTable
              └── ProjectCockpit (split-view detail)
```

### 6.2 Atomic Components (Reusable UI)

**File:** `src/components/ui/*.tsx` (Shadcn/ui + Radix primitives)

| Component | From | Purpose |
|-----------|------|---------|
| `<Button />` | Radix/shadcn | Clickable actions |
| `<Select />` | Radix/shadcn | Dropdown menus |
| `<Input />` | Radix/shadcn | Text fields |
| `<Checkbox />` | Radix/shadcn | Multi-select |
| `<Dialog />` | Radix/shadcn | Modal dialogs |
| `<Tabs />` | Radix/shadcn | Tab navigation |
| `<Tooltip />` | Radix/shadcn | Hover hints |
| `<ScrollArea />` | Radix/shadcn | Scrollable containers |

### 6.3 Domain Components (Business-Specific)

**File:** `src/components/project/`

| Component | Props | Purpose |
|-----------|-------|---------|
| `<ProjectKanbanCard />` | `{ project, onSelect, onUpdate }` | Kanban card |
| `<ProjectTable />` | `{ projects, onSort, onSelect }` | List table |
| `<ProjectCockpit />` | `{ project, onUpdate }` | Detail split-view |
| `<ProjectForm />` | `{ project, onSubmit }` | Edit form |
| `<ProjectBadge />` | `{ status, priority }` | Status indicators |

### 6.4 KPI Components

**File:** `src/app/projetos/components/ProjectsKPIBar.tsx`

```typescript
'use client';

import { Card } from '@/components/ui/card';
import type { ProjectUI } from '@/lib/types';

export function ProjectsKPIBar({ projects }: { projects: ProjectUI[] }) {
  const stats = {
    total: projects.length,
    active: projects.filter(p => p.status === 'active').length,
    inProgress: projects.reduce((acc, p) => acc + (p.taskStats?.inProgress || 0), 0),
    overdue: projects.filter(p => isProjectOverdue(p)).length,
  };

  return (
    <div className="grid grid-cols-4 gap-4">
      <KPICard label="Total Projects" value={stats.total} trend={+5} />
      <KPICard label="Active" value={stats.active} trend={0} />
      <KPICard label="In Progress Tasks" value={stats.inProgress} trend={+12} />
      <KPICard label="Overdue" value={stats.overdue} trend={-2} color="red" />
    </div>
  );
}

function KPICard({
  label,
  value,
  trend,
  color = 'blue',
}: {
  label: string;
  value: number;
  trend: number;
  color?: 'blue' | 'green' | 'red';
}) {
  return (
    <Card className="p-4">
      <p className="text-sm text-gray-600">{label}</p>
      <p className="text-2xl font-bold">{value}</p>
      <p className={`text-xs ${trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
        {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}% vs last month
      </p>
    </Card>
  );
}
```

### 6.5 Accessibility (A11y)

Every component must be accessible:

```typescript
// ✅ Semantic HTML
<button
  aria-label="Delete project"
  aria-describedby="delete-help"
  onClick={handleDelete}
>
  Delete
</button>
<span id="delete-help">This action cannot be undone</span>

// ✅ ARIA attributes
<div role="region" aria-label="Projects list">
  {/* content */}
</div>

// ✅ Focus management
<Dialog>
  <DialogContent>
    {/* Initial focus is first focusable element */}
  </DialogContent>
</Dialog>

// ✅ Keyboard navigation
<Table>
  <tbody>
    {items.map(item => (
      <TableRow key={item.id} tabIndex={0} onKeyDown={handleRowKeyDown}>
        {/* cells */}
      </TableRow>
    ))}
  </tbody>
</Table>
```

---

## 7. Routing Architecture

### 7.1 Next.js App Router Structure

```
src/app/
├── layout.tsx                          # Root layout (sidebar, nav, auth)
├── page.tsx                            # Home page (dashboard)
├── login/
│   └── page.tsx                        # Login page
├── projetos/
│   ├── page.tsx                        # Projects list
│   ├── projects-content.tsx            # Client orchestrator
│   ├── [id]/                           # Dynamic route for project detail
│   │   └── page.tsx
│   └── components/
├── dashboard/
│   ├── page.tsx                        # KPI dashboard
│   └── components/
├── agentes/                            # AI agents configuration
│   └── page.tsx
├── api/
│   ├── webhooks/espaider/              # Webhook handler
│   │   └── route.ts
│   ├── sync/                           # Manual sync endpoint
│   │   └── route.ts
│   └── health/                         # Health check
│       └── route.ts
└── error.tsx                           # Global error handler
```

### 7.2 Dynamic Routes

**File:** `src/app/projetos/[id]/page.tsx`

```typescript
export async function generateStaticParams() {
  // Pre-render most popular projects
  const projects = await fetchTopProjects(10);
  return projects.map(p => ({ id: p.id }));
}

export default async function ProjectDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const project = await fetchProject(params.id);
  if (!project) notFound();
  return <ProjectDetailContent project={project} />;
}
```

---

## 8. Error Handling & Resilience

### 8.1 Error Boundaries

**File:** `src/app/error.tsx`

```typescript
'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-2xl font-bold">Something went wrong</h1>
      <p className="text-gray-600">{error.message}</p>
      <Button onClick={reset}>Try again</Button>
    </div>
  );
}
```

### 8.2 Loading States

```typescript
// ✅ Suspense boundaries
<Suspense fallback={<ProjectsSkeleton />}>
  <ProjectsList />
</Suspense>

// ✅ Loading skeletons
function ProjectsSkeleton() {
  return (
    <div className="space-y-4">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="h-24 bg-gray-200 rounded animate-pulse" />
      ))}
    </div>
  );
}
```

---

## 9. Form Handling Pattern

### 9.1 Form with React Hook Form + Zod

```typescript
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { projectCreateSchema } from '@/lib/validators/project-schemas';
import type { ProjectCreate } from '@/lib/validators/project-schemas';

export function ProjectForm({ onSubmit }: { onSubmit: (data: ProjectCreate) => Promise<void> }) {
  const form = useForm<ProjectCreate>({
    resolver: zodResolver(projectCreateSchema),
    defaultValues: {
      name: '',
      status: 'active',
      priority: 'medium',
      description: '',
    },
  });

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <input
        {...form.register('name')}
        type="text"
        placeholder="Project name"
      />
      {form.formState.errors.name && (
        <span>{form.formState.errors.name.message}</span>
      )}

      <select {...form.register('status')}>
        <option value="active">Active</option>
        <option value="paused">Paused</option>
        <option value="done">Done</option>
      </select>

      <button type="submit" disabled={form.formState.isSubmitting}>
        Save
      </button>
    </form>
  );
}
```

---

## 10. Non-Invasive Design Principle

This architecture is **designed to evolve**:

- **New modules** follow the baseline pattern → no core changes
- **New features** add components → backward compatible
- **New data** adds tables with RLS → existing queries unaffected
- **Tech updates** are non-breaking (semver) → no refactoring needed

**Quality Gate:**
```bash
npm run lint       # Components follow style rules
npm run typecheck  # Type safety maintained
npm run test       # Components tested
```

---

## References

- **Module Standards:** `docs/architecture/module-standards.md`
- **Architecture Overview:** `docs/architecture/ARCHITECTURE-OVERVIEW.md`
- **Database Architecture:** `docs/architecture/DATABASE-ARCHITECTURE.md`
- **Shadcn/ui Docs:** https://ui.shadcn.com
- **Next.js Docs:** https://nextjs.org/docs
- **React Hooks Guide:** https://react.dev/reference/react

---

**Authored by:** Claude Code (Haiku 4.5) — AIOX Master Orchestrator
**Framework:** Synkra AIOX v1.0.0
**Last Reviewed:** 2026-03-14
**Next Review:** 2026-03-31 (quarterly)
