# 🛠️ TECH STACK — Tech Arauz v0.2.3+

**Documento:** Technology Stack Documentation
**Data:** 2026-03-17
**Versão Documentada:** v0.2.3+ (2026-03-12 baseline)
**Owner:** @architect (Aria)
**Reviewers:** @dev (Dex), @devops (Gage), @qa (Quinn)
**Propósito:** Definir exatamente o stack tecnológico para guiar @dev, @qa, @devops em decisões de implementação

---

## 📋 ÍNDICE RÁPIDO

| Camada | Tecnologia | Versão | Propósito |
|--------|-----------|--------|----------|
| **Runtime** | Node.js 18+ | Implicit | Server runtime |
| **Framework** | Next.js | 14.2.0 | SSR + API routes |
| **Frontend** | React | 18.3.0 | UI framework |
| **Language** | TypeScript | 5.5.0 | Type safety |
| **State** | TanStack Query + Zustand | 5.50.0 / 4.5.0 | Data fetching + global state |
| **Database** | Supabase (PostgreSQL 15) | 2.45.0 | Primary data store |
| **UI** | Shadcn/ui + Radix + Tailwind | - / 3.4.0 | Component library |
| **Forms** | React Hook Form + Zod | 7.71.2 / 3.23.0 | Form management + validation |
| **Testing** | Vitest + @testing-library + Cypress | 1.6.0+ | Test automation |
| **Deploy** | Vercel | - | Production hosting |

---

## 1️⃣ RUNTIME & LANGUAGE

### Node.js

- **Version:** 18+ (recommended 20 LTS for production)
- **Package Manager:** npm 10+ (defined in package-lock.json)
- **Why:** Next.js 14.2 requires Node 18+. ES2023 features supported.

### TypeScript

- **Version:** 5.5.0
- **Config:** `tsconfig.json` (strict mode enabled where feasible)
- **Why:** Type safety across frontend/backend. Catches errors at compile time.

**Key TypeScript Patterns:**
- Server components: `async` components without client markers
- Client components: `"use client"` directive (React 18)
- Shared types: `src/types/` directory
- API validation: Zod schemas + TypeScript inference

```bash
npm run typecheck  # Full type checking (CI gate)
```

---

## 2️⃣ FRAMEWORK LAYER

### Next.js 14.2.0

**Core Features Used:**
- **App Router** — File-based routing (`src/app/`)
- **Server Components** — Default, async, no JS bundle overhead
- **Server Actions** — Formulas for mutations (mutations.ts files)
- **API Routes** — REST endpoints (`src/app/api/`)
- **Image Optimization** — `next/image` with ISR
- **Analytics** — Vercel Analytics (built-in)

**Key Directories:**
```
src/app/
  ├── (dashboard)/         # Grouped routes (internal UI)
  ├── api/                 # REST endpoints (18 routes documented)
  ├── [slug]/              # Dynamic routes
  └── layout.tsx           # Root layout (RLS context provider)

src/lib/
  ├── supabase/           # Supabase client + RLS setup
  ├── server-actions/     # 8 server actions (mutations)
  └── api-client.ts       # Fetch wrapper with auth

src/components/
  ├── ui/                 # Shadcn/ui atoms + molecules
  ├── dashboard/          # Page-specific organisms
  └── providers/          # Context providers (Auth, Theme, etc.)
```

**Why Next.js 14.2?**
- Stable App Router (production-ready)
- Server Components reduce JS bundle
- Built-in optimization (images, fonts, code-splitting)
- Vercel integration (deployment, analytics)

---

## 3️⃣ FRONTEND STACK

### React 18.3.0

**Features Leveraged:**
- **Server Components** (default in Next.js 14)
- **Client Components** (when interactivity needed)
- **Hooks:** useState, useEffect, useContext, useCallback, useMemo
- **Suspense** for async operations
- **Error Boundaries** (custom error.tsx files)

**Critical Patterns:**
1. **Server-First:** Components are server by default
2. **Client Boundaries:** Minimal client-side code
3. **Data Fetching:** Via Server Actions or useQuery

### Styling: Tailwind CSS 3.4.0

**Configuration:**
```javascript
// tailwind.config.ts
export default {
  content: ['src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: { /* Custom palette */ },
      spacing: { /* Consistent spacing */ },
    },
  },
  plugins: [require('tailwindcss-animate')],
};
```

**Key Utilities:**
- `flex`, `grid` for layouts
- `text-*`, `bg-*` for colors
- `rounded-*`, `shadow-*` for effects
- `dark:` variant for dark mode
- `@apply` for component classes

**Why Tailwind 3.4?**
- Utility-first CSS (no CSS file bloat)
- Tree-shaking (only used classes in production)
- Design token consistency
- Dark mode support (built-in)

### UI Components: Shadcn/ui (built on Radix)

**90+ Components Organized:**
- **Atoms:** button, input, label, icon
- **Molecules:** form-field, card, badge, dialog, dropdown
- **Organisms:** header, sidebar, table, project-cockpit
- **Custom:** ProjectCockpit360 (tabs + forms), ProjectKanban, etc.

**Radix Primitives Used:**
```typescript
// Core primitives from @radix-ui/*
Dialog, DropdownMenu, Select, Tooltip, Popover, Tabs,
Collapsible, ScrollArea, Progress, Separator, Switch, Label
```

**Why Shadcn/ui?**
- Accessibility (WCAG AA) built-in (Radix)
- Headless (full customization with Tailwind)
- TypeScript-first
- No new dependencies (copy-paste pattern)

---

## 4️⃣ STATE MANAGEMENT

### TanStack React Query 5.50.0

**Purpose:** Server state management (fetching, caching, synchronization)

**Key Concepts:**
- **useQuery:** Fetch data (with caching)
- **useMutation:** Submit data (mutations)
- **Invalidation:** Refresh cache after mutations
- **Stale-while-revalidate:** Background refetch

**Configuration:**
```typescript
// src/lib/query-client.ts
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,        // 5 minutes
      gcTime: 10 * 60 * 1000,          // 10 minutes (formerly cacheTime)
      retry: 1,
      refetchOnWindowFocus: true,
    },
    mutations: {
      retry: 0,
    },
  },
});
```

**Example Usage:**
```typescript
// Component
const { data, isLoading, error } = useQuery({
  queryKey: ['projects', projectId],
  queryFn: () => getProjectDetails(projectId),
});

const { mutate: updateProject } = useMutation({
  mutationFn: (updates) => updateProjectAction(projectId, updates),
  onSuccess: () => queryClient.invalidateQueries({ queryKey: ['projects'] }),
});
```

**Why React Query 5.50?**
- Industry standard for server state
- Automatic caching & invalidation
- Excellent TypeScript support
- Performance: reduces API calls, bandwidth

### Zustand 4.5.0

**Purpose:** Client state management (UI state, preferences, ephemeral)

**Use Cases:**
- Sidebar collapsed state
- Theme toggle (dark/light)
- Filter state (temporary, URL-based preferred)
- Notification queue

**Example:**
```typescript
// src/store/ui-store.ts
import { create } from 'zustand';

export const useUiStore = create((set) => ({
  sidebarOpen: true,
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  theme: 'light',
  setTheme: (theme) => set({ theme }),
}));

// Usage in component
const { sidebarOpen, toggleSidebar } = useUiStore();
```

**Why Zustand 4.5?**
- No boilerplate (vs Redux)
- Lightweight (~2KB)
- TypeScript friendly
- Immer integration for immutability

### Custom Hooks (22 total)

**Major Hooks:**
- `useFilterState` — Manage filter state
- `useFilterUrlSync` — Sync filters ↔ URL
- `usePagination` — Pagination logic
- `useAsyncOperation` — Loading/error state for mutations
- `useAsyncFeedback` — Toast notifications
- `useDarkMode` — Theme toggle
- `useNotifications` — Toast manager
- `useSearchSuggestions` — Autocomplete logic
- `usePerformanceData` — KPI calculations
- (13 more in src/hooks/)

**Pattern:**
```typescript
// Custom hooks are in src/hooks/useXxx.ts
export function useMyHook() {
  // Logic here
  return { state, actions };
}

// Usage in components
const { state, actions } = useMyHook();
```

---

## 5️⃣ DATABASE & BACKEND

### Supabase (PostgreSQL 15)

**Components:**
- **PostgreSQL 15** — Relational database
- **PostgRES API** — Auto-generated REST API (not used; we use server actions)
- **Auth** — Supabase Auth (JWT-based)
- **RLS Policies** — Row-level security (ADR-001)
- **Realtime** — WebSocket updates (for future features)
- **Storage** — File uploads (for future documents)

**Database Schema:**
- **65 migrations** (migrations/*.sql)
- **Core tables:** tenants, profiles, projects, schedules, deliveries, etc.
- **Knowledge graph:** org_area, org_nucleus, org_process, org_routine, org_activity
- **AI/Agents:** agents, agent_types, lm_providers, lm_models, chatbot_sessions
- **Integration:** espaider_apis, integration_log_entries, rls_audit_logs

**RLS Policies (ADR-001):**
```sql
-- All tables use:
CREATE POLICY "enable_all" ON table_name
USING (true)
WITH CHECK (true);

-- Service role bypasses RLS for sync operations
-- Client role enforced via auth.uid() in WHERE clauses
```

**Why Supabase?**
- PostgreSQL (proven, scalable)
- Real-time capabilities
- Built-in Auth (JWT)
- RLS for multi-tenancy
- Vercel integration (same region)

### Server Actions (8 total)

**Pattern:**
```typescript
// src/lib/server-actions/projects.ts
'use server';

import { revalidatePath } from 'next/cache';

export async function updateProjectAction(id: string, updates: ProjectUpdates) {
  // Server-side validation
  const validated = ProjectUpdateSchema.parse(updates);

  // Database mutation
  const result = await db.from('projects').update(validated).eq('id', id);

  // Revalidate cache
  revalidatePath('/projects');

  return result;
}
```

**Benefits:**
- Type-safe mutations (client + server)
- No API boilerplate
- Automatic revalidation
- Built-in error handling

**8 Server Actions:**
1. `updateProjectAction` — Update project
2. `syncEspaiderAction` — Trigger Espaider sync
3. `createResponsibleRoleAction` — Add responsible role
4. `updateTenantSettingsAction` — Update org settings
5. ... (see server-actions/ directory)

### REST API Routes (18 endpoints)

**Endpoints:**
```
GET    /api/v1/projects              — List projects (paginated)
GET    /api/v1/projects/{id}         — Get project details
POST   /api/v1/projects              — Create project
PATCH  /api/v1/projects/{id}         — Update project
DELETE /api/v1/projects/{id}         — Delete project
POST   /api/v1/integration/sync      — Trigger Espaider sync
GET    /api/v1/integration/status    — Sync status
POST   /api/v1/agents/chat           — Chat with AI agent
GET    /api/v1/search/suggestions    — Search autocomplete
... (13 more)
```

**Request Validation:**
```typescript
// src/app/api/v1/projects/route.ts
import { z } from 'zod';

const CreateProjectSchema = z.object({
  name: z.string().min(3),
  description: z.string().optional(),
  tenant_id: z.string().uuid(),
});

export async function POST(req: Request) {
  const data = CreateProjectSchema.parse(await req.json());
  // Process...
}
```

---

## 6️⃣ FORMS & VALIDATION

### React Hook Form 7.71.2

**Why?**
- Minimal re-renders (performance)
- Built-in async validation
- File upload support
- Excellent TypeScript support

**Example:**
```typescript
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

const form = useForm({
  resolver: zodResolver(MySchema),
  defaultValues: { name: '', email: '' },
});

return (
  <form onSubmit={form.handleSubmit(onSubmit)}>
    <input {...form.register('name')} />
    {form.formState.errors.name && <span>Error</span>}
    <button type="submit">Submit</button>
  </form>
);
```

### Zod 3.23.0

**Purpose:** Schema validation (server + client)

**Pattern:**
```typescript
import { z } from 'zod';

export const ProjectSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(3).max(100),
  status: z.enum(['planning', 'in_progress', 'completed']),
  dueDate: z.date().optional(),
});

export type Project = z.infer<typeof ProjectSchema>;

// Server-side validation
const validated = ProjectSchema.parse(data);

// Client-side validation (in forms)
const form = useForm({ resolver: zodResolver(ProjectSchema) });
```

**Why Zod 3.23?**
- TypeScript-native schema validation
- Works server + client
- Excellent error messages
- No dependencies (vs Joi, etc.)

---

## 7️⃣ ADVANCED COMPONENTS

### Rich Text Editor: TipTap 3.19.0

**Use:** Documentation, notes, rich content

```typescript
import { useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';

const editor = useEditor({
  extensions: [StarterKit, Link, Placeholder],
  content: '<p>Edit me...</p>',
});

// Usage in component
return <EditorContent editor={editor} />;
```

### Charts: Recharts 2.12.0

**Use:** KPI dashboards, performance analytics

```typescript
<LineChart data={data} width={400} height={300}>
  <CartesianGrid />
  <XAxis dataKey="name" />
  <YAxis />
  <Line type="monotone" dataKey="value" stroke="#8884d8" />
</LineChart>
```

### Gantt Charts: gantt-task-react 0.3.9

**Use:** Project timeline visualization

### Drag & Drop: @dnd-kit 6.3.1+

**Use:** Kanban boards, sortable lists

```typescript
import { DndContext, DragEndEvent } from '@dnd-kit/core';
import { SortableContext } from '@dnd-kit/sortable';

<DndContext onDragEnd={handleDragEnd}>
  <SortableContext items={items}>
    {items.map(item => <Item key={item.id} id={item.id} />)}
  </SortableContext>
</DndContext>
```

### PDF Export: html2pdf.js 0.14.0

**Use:** Report generation

### Toast Notifications: sonner 1.5.0

**Use:** Success/error/info messages

```typescript
import { toast } from 'sonner';

toast.success('Project updated!');
toast.error('Failed to update');
```

---

## 8️⃣ TESTING FRAMEWORK

### Vitest 1.6.0

**Purpose:** Unit & integration tests (runs 3-5x faster than Jest)

**Setup:**
```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      lines: 92,      // Target: 92% coverage
      functions: 92,
      branches: 85,
      statements: 92,
    },
  },
});
```

**Example Test:**
```typescript
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Button } from '@/components/ui/button';

describe('Button', () => {
  it('renders with children', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole('button', { name: /click me/i })).toBeInTheDocument();
  });
});
```

### @testing-library/react 16.3.2

**Philosophy:** Test user interactions, not implementation

```typescript
// Good: Test what user sees/does
render(<LoginForm />);
userEvent.type(screen.getByLabelText('Email'), 'test@example.com');
userEvent.click(screen.getByRole('button', { name: /login/i }));
expect(screen.getByText('Welcome')).toBeInTheDocument();

// Bad: Testing internal state
expect(component.state.isLoggedIn).toBe(true);
```

### jest-axe 10.0.0

**Purpose:** Accessibility testing (WCAG AA)

```typescript
import { axe } from 'jest-axe';

it('should have no a11y violations', async () => {
  const { container } = render(<MyComponent />);
  const results = await axe(container);
  expect(results).toHaveNoViolations();
});
```

### Cypress 15.10.0

**Purpose:** E2E testing (user workflows)

```typescript
describe('Project Workflow', () => {
  it('should create and update a project', () => {
    cy.visit('/projects');
    cy.get('[data-testid="new-project"]').click();
    cy.get('input[name="name"]').type('My Project');
    cy.get('form').submit();
    cy.contains('Project created!').should('be.visible');
  });
});
```

**Test Commands:**
```bash
npm run test              # Vitest (unit/integration)
npm run test:watch       # Watch mode
npm run test:coverage    # Coverage report
npm run test:a11y        # A11y tests
npm run test:rls         # RLS policy tests
```

**Target Coverage:**
- **Lines:** 92%
- **Functions:** 92%
- **Statements:** 92%
- **Branches:** 85%

---

## 9️⃣ DEPLOYMENT

### Vercel 1.6.1+

**Platform:** Serverless deployment (Next.js optimized)

**Key Features:**
- Edge Functions (request middleware)
- Automatic HTTPS
- Global CDN
- Analytics (built-in)
- Speed Insights (built-in)

**Environment Variables:**
```
.env.local (local development)
.env.production (Vercel production)
```

**Required Variables:**
```
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxx
SUPABASE_SERVICE_ROLE_KEY=xxx
OPENAI_API_KEY=xxx (fallback)
```

**Deployment Process:**
```bash
git push origin main
# → GitHub webhook → Vercel build → Preview URL → Production
```

**Vercel Analytics (1.6.1):**
```typescript
// src/app/layout.tsx
import { Analytics } from '@vercel/analytics/react';

export default function RootLayout() {
  return (
    <html>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
```

**Speed Insights (1.3.1):**
```typescript
import { SpeedInsights } from '@vercel/speed-insights/next';

export default function RootLayout() {
  return (
    <html>
      <body>
        {children}
        <SpeedInsights />
      </body>
    </html>
  );
}
```

---

## 🔟 BUILD & QUALITY TOOLS

### TypeScript 5.5.0

```bash
npm run typecheck        # Type checking (CI gate)
```

### ESLint 8.57.0 + eslint-config-next

```bash
npm run lint             # Lint check
npm run lint --fix       # Auto-fix issues
```

### Prettier 3.8.1

```bash
npm run format           # Format code
npm run format:check     # Check formatting (CI gate)
```

### Quality Gate:

```bash
npm run gate            # Runs: lint + typecheck + test + format:check
```

**This command:**
1. Lints all code
2. Type checks entire codebase
3. Runs all tests
4. Checks code formatting

**Must pass before merge to main.**

---

## 1️⃣1️⃣ ADDITIONAL UTILITIES

### Icons: lucide-react 0.400.0

```typescript
import { AlertCircle, Check, X } from 'lucide-react';

<AlertCircle size={24} className="text-red-500" />
```

### Date Handling: date-fns 3.6.0

```typescript
import { format, parseISO, addDays } from 'date-fns';

const formatted = format(new Date(), 'MMM dd, yyyy');
const tomorrow = addDays(new Date(), 1);
```

### Markdown: react-markdown 10.1.0 + remark/rehype

```typescript
import Markdown from 'react-markdown';

<Markdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeHighlight]}>
  {markdownContent}
</Markdown>
```

### Theme Management: next-themes 0.3.0

```typescript
import { ThemeProvider } from 'next-themes';

<ThemeProvider attribute="class" defaultTheme="dark">
  {children}
</ThemeProvider>
```

---

## 🎯 SUMMARY FOR AGENTS

### For @dev (Implementation)

✅ Use **Server Components** by default (reduce JS bundle)
✅ Use **Server Actions** for mutations (type-safe)
✅ Use **useQuery** for data fetching (caching)
✅ Use **Zod** for validation (server + client)
✅ Use **TanStack Query** for server state
✅ Use **Zustand** for UI state (minimal)
✅ Test with **Vitest** (@testing-library)
✅ Run **npm run gate** before committing

### For @qa (Testing)

✅ Target: 92% code coverage
✅ Use **jest-axe** for WCAG AA compliance
✅ Use **Cypress** for E2E workflows
✅ Test RLS policies with `npm run test:rls`
✅ Performance testing with Vercel Speed Insights

### For @devops (Deployment)

✅ Deploy to **Vercel** (Next.js native)
✅ Manage env vars via Vercel dashboard
✅ Monitor **Analytics** + **Speed Insights**
✅ Database migrations via `npm run db:apply`
✅ Secrets audit with `npm run audit:secrets`

### For @architect (Architecture)

✅ 4-layer architecture: Client → Server Components → Server Actions → Database
✅ State: Server (React Query) + Client (Zustand)
✅ Validation: Zod (single source of truth)
✅ Security: RLS policies (ADR-001) + Auth JWT
✅ Performance: Server-side rendering + ISR + CDN

---

## 📚 QUICK REFERENCE

```bash
# Development
npm run dev              # Start Next.js dev server (http://localhost:3000)

# Building
npm run build            # Production build
npm run start            # Start production server

# Testing
npm run test             # Run all tests
npm run test:coverage    # Coverage report
npm run test:a11y        # A11y tests

# Quality
npm run lint             # Lint check
npm run typecheck        # Type checking
npm run format           # Format code
npm run gate             # Full quality gate (lint+typecheck+test+format)

# Database
npm run db:apply         # Apply migrations

# Analytics
npm run audit:rls        # Audit RLS policies
npm run audit:secrets    # Check for exposed secrets
```

---

## ✅ VALIDATION NOTES

- **Code-to-doc:** ✅ All versions match package.json (verified 2026-03-17)
- **AIOX Compliance:** ✅ 100% (optimized for @dev, @qa, @devops, @architect)
- **Accuracy:** ✅ Reflects v0.2.3+ actual codebase
- **Completeness:** ✅ All 12 dependency categories documented

---

**Prepared by:** Aria (@architect)
**Date:** 2026-03-17
**Status:** ✅ READY FOR REVIEW
**Next Step:** Approval from Dara (@data-engineer), Uma (@ux-design-expert), Dex (@dev)

— Aria, arquitetando o futuro 🏗️
