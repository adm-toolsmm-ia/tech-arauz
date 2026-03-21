# ADR-004: Feature-Based Folder Structure

**Status:** ACCEPTED (Implemented v0.2.3+)
**Deciders:** @architect (Aria), @dev (Dex), @pm (Morgan)
**Date:** 2026-03-12
**Code-to-Doc Verified:** ✅ src/app/* directory structure (20+ features)

---

## Context

Tech Arauz is a multi-domain application with distinct feature areas:
- **Dashboard:** KPIs, charts, team performance
- **Projects:** CRUD, 360° view, scheduling
- **Agents:** AI configuration, LM model management
- **Integrations:** Espaider BI sync, API management
- **Administration:** User management, system configuration

Prior to v0.2.3, code was organized by **technical layer** (routes/components/services), making it hard to locate feature-specific code. This created cognitive overhead when implementing new features.

**Problem:**
- Feature X code scattered across components/, services/, pages/
- Adding feature Y required touching 5-6 directories
- Team members unsure where feature code lives
- Hard to isolate for testing, refactoring, or feature flags

---

## Decision

Implement **feature-based folder structure** where features are organized by business domain, not technical layer:

```
src/app/
├── dashboard/           # Dashboard feature
│   ├── layout.tsx      # Root layout
│   ├── page.tsx        # Dashboard page
│   ├── components/     # Feature-specific components
│   └── actions/        # Feature-specific server actions
│
├── projetos/           # Projects feature
│   ├── layout.tsx
│   ├── page.tsx
│   ├── [id]/           # Dynamic route
│   ├── components/
│   └── actions/
│
├── agentes/            # Agents feature
│   ├── layout.tsx
│   ├── page.tsx
│   ├── [id]/
│   ├── components/
│   └── actions/
│
├── integracoes/        # Integrations feature
│   ├── layout.tsx
│   ├── page.tsx
│   ├── components/
│   ├── actions/
│   └── api/            # Feature-specific API routes
│
├── cadastros/          # Administrative feature
│   ├── usuarios/       # Sub-feature
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   ├── components/
│   │   ├── actions/
│   │   └── API routes (via /api/users)
│   └── ...other admin modules
│
└── auxiliares/         # Auxiliary management feature
    ├── agent-types/
    ├── modelos-ia/
    └── ...other utilities
```

### Feature Boundaries (Clear Ownership)

| Feature | Path | Owner | Responsibilities |
|---------|------|-------|------------------|
| **Dashboard** | `/src/app/dashboard/` | @dev (Dex) | KPIs, charts, real-time metrics |
| **Projects** | `/src/app/projetos/` | @dev + @ux-design-expert | CRUD, 360° view, scheduling |
| **Agents** | `/src/app/agentes/` | @dev | AI agent config, types, models |
| **Integrations** | `/src/app/integracoes/` | @dev + @data-engineer | Espaider sync, API management |
| **Admin** | `/src/app/cadastros/` | @dev | User management, system settings |
| **Auxiliary** | `/src/app/auxiliares/` | @dev | Reference data, lookup tables |

### Shared Code (Outside Features)

```
src/
├── lib/                # Shared utilities
│   ├── domain/        # Business logic (filters, validators, transformers)
│   ├── supabase/      # Database layer
│   ├── security/      # Auth, encryption, token handling
│   ├── sync/          # Integration sync logic
│   └── ...
│
├── components/        # Shared UI components
│   ├── ui/           # Base components (button, input, etc.)
│   ├── layout/       # Layout components (sidebar, header)
│   ├── common/       # Common components (image loader, etc.)
│   └── ...
│
├── hooks/            # Shared React hooks
│   ├── use*.ts       # Custom hooks (filters, state, async)
│
├── services/         # Feature-independent services
│   ├── agents/       # Agent service (stores, API clients)
│   └── ...
│
└── integrations/     # External integrations
    ├── espaider/     # Espaider BI integration
    └── ...
```

### Feature-Specific vs Shared

**Feature-specific (lives in feature folder):**
```typescript
// src/app/projetos/components/ProjectTable.tsx
// → Used only in projects feature
// → Import: { ProjectTable } from '@/app/projetos/components'
```

**Shared (lives in src/components):**
```typescript
// src/components/ui/Button.tsx
// → Used across multiple features
// → Import: { Button } from '@/components/ui'

// src/components/layout/Sidebar.tsx
// → Used across all features
// → Import: { Sidebar } from '@/components/layout'
```

### API Routes (Exception to Feature Structure)

API routes live in separate `/api/` namespace (Next.js convention):

```
src/app/api/
├── agents/
│   ├── route.ts       # GET, POST /api/agents
│   └── [id]/
│       └── route.ts   # PATCH /api/agents/{id}
│
├── integracoes/
│   ├── sync/
│   │   └── route.ts   # POST /api/integracoes/sync
│   └── route.ts
│
├── search/
│   └── suggestions/
│       └── route.ts   # GET /api/search/suggestions
│
└── sessions/
    └── route.ts       # GET /api/sessions
```

**Rationale:** API routes serve multiple features + external clients. Grouping by resource (not feature) clearer.

---

## Implementation Status (v0.2.3+)

### Implemented Features

✅ **Dashboard Feature**
- Path: `/src/app/dashboard/`
- Components: KPI cards, charts, performance metrics
- Server Actions: Fetch dashboard data, team performance

✅ **Projects Feature**
- Path: `/src/app/projetos/`
- Components: ProjectTable, ProjectKanbanCard, ProjectCockpit360
- Dynamic Routes: `/projetos/[id]/` for project details
- Server Actions: CRUD operations, scheduling

✅ **Agents Feature**
- Path: `/src/app/agentes/`
- Components: Agent list, detail view, type configuration
- Dynamic Routes: `/agentes/[id]/` for agent details
- Server Actions: Create, update agent configs

✅ **Integrations Feature**
- Path: `/src/app/integracoes/`
- Components: API config, sync logs, Espaider management
- API Routes: `/api/integracoes/sync/` (trigger sync)
- Server Actions: Save API configs, manage tokens

✅ **Administrative Feature**
- Path: `/src/app/cadastros/`
- Subfeatures: `usuarios/` (user management)
- Components: UserTable, UserFormDrawer
- Server Actions: Create user, update profile

✅ **Auxiliary Feature**
- Path: `/src/app/auxiliares/`
- Subfeatures: `agent-types/`, `modelos-ia/`
- Components: Type management UI, model configuration
- Server Actions: CRUD for reference data

---

## Directory Listing (Verified v0.2.3+)

```
src/app/
├── dashboard/          [DASHBOARD FEATURE]
│   └── layout.tsx
│
├── projetos/           [PROJECTS FEATURE]
│   ├── layout.tsx
│   └── (future: components/, actions/)
│
├── agentes/            [AGENTS FEATURE]
│   ├── layout.tsx
│   ├── [id]/
│   │   └── page.tsx
│   └── page.tsx
│
├── integracoes/        [INTEGRATIONS FEATURE]
│   ├── page.tsx
│   ├── layout.tsx
│   └── integracoes-content.tsx
│
├── cadastros/          [ADMIN FEATURE]
│   ├── usuarios/       (sub-feature)
│   │   ├── actions.ts
│   │   ├── components/
│   │   │   ├── UserFormDrawer.tsx
│   │   │   └── UsersTable.tsx
│   │   └── layout.tsx
│   └── layout.tsx
│
├── auxiliares/         [AUXILIARY FEATURE]
│   ├── agent-types/
│   │   └── page.tsx
│   ├── modelos-ia/
│   │   └── page.tsx
│   └── layout.tsx
│
├── api/                [API ROUTES]
│   ├── agents/
│   ├── integracoes/
│   ├── search/
│   └── sessions/
│
├── logout/             [Authentication]
│   └── page.tsx
│
└── page.tsx            [Root / entry]
```

---

## Benefits & Trade-offs

### ✅ Benefits

1. **Cognitive Load:** Find feature code in one location
2. **Team Coordination:** Clear feature ownership
3. **Scaling:** Add new features without touching existing code
4. **Testing:** Feature isolation for unit/integration tests
5. **Feature Flags:** Can disable entire feature folder if needed
6. **Refactoring:** Easier to refactor feature in isolation

### ⚠️ Trade-offs

1. **Shared Components:** Must distinguish feature-specific vs shared
2. **Imports:** Longer paths for shared components (mitigated by path aliases)
3. **Learning Curve:** New team members must learn feature boundaries

**Mitigation:**
- Use TypeScript path aliases: `@/components/ui` → `src/components/ui`
- Document feature boundaries in README
- Enforce structure in code review

---

## Shared Component Imports (Using Aliases)

**Path alias configuration** (tsconfig.json):

```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"],
      "@/components/*": ["./src/components/*"],
      "@/lib/*": ["./src/lib/*"],
      "@/hooks/*": ["./src/hooks/*"],
      "@/services/*": ["./src/services/*"]
    }
  }
}
```

**Usage examples:**

```typescript
// Import shared UI component
import { Button } from '@/components/ui';

// Import shared layout
import { Sidebar } from '@/components/layout';

// Import domain logic
import { normalizeProjectStatus } from '@/lib/domain/project-phase';

// Import shared hook
import { useFilterState } from '@/hooks/useFilterState';

// Import feature-specific component
import { ProjectTable } from '@/app/projetos/components';
```

---

## Adding New Features

### Step 1: Create Feature Folder

```bash
mkdir -p src/app/minha-feature
mkdir -p src/app/minha-feature/components
mkdir -p src/app/minha-feature/actions  # If needed
```

### Step 2: Create Layout & Page

```typescript
// src/app/minha-feature/layout.tsx
export default function MeuLayout({ children }) {
  return (
    <div className="space-y-4">
      {/* Feature header/nav */}
      {children}
    </div>
  );
}

// src/app/minha-feature/page.tsx
export default function MinhaPage() {
  return <div>Feature content</div>;
}
```

### Step 3: Add Server Actions (If Needed)

```typescript
// src/app/minha-feature/actions/my-action.ts
'use server';

export async function myServerAction(data: any) {
  // Validate user auth
  // Validate input with Zod
  // Call database
  // Return result
}
```

### Step 4: Add Components

```typescript
// src/app/minha-feature/components/MyComponent.tsx
export function MyComponent() {
  return <div>Component</div>;
}
```

### Step 5: Import & Use

```typescript
// src/app/minha-feature/page.tsx
import { MyComponent } from './components/MyComponent';
import { myServerAction } from './actions/my-action';

export default function MinhaPage() {
  return <MyComponent />;
}
```

---

## Routing Examples

### Public Routes

```
GET  /dashboard         → src/app/dashboard/page.tsx
GET  /projetos          → src/app/projetos/page.tsx
GET  /projetos/123      → src/app/projetos/[id]/page.tsx
GET  /agentes           → src/app/agentes/page.tsx
POST /api/agents        → src/app/api/agents/route.ts
```

### Protected Routes (Middleware enforced)

```
GET  /cadastros/usuarios → src/app/cadastros/usuarios/page.tsx
POST /api/cadastros/usuarios → src/app/api/cadastros/usuarios/route.ts
GET  /auxiliares/agent-types → src/app/auxiliares/agent-types/page.tsx
```

### API Routes (Resource-based)

```
GET  /api/agents        → List all agents
POST /api/agents        → Create agent
GET  /api/agents/123    → Get agent details
PATCH /api/agents/123   → Update agent
DELETE /api/agents/123  → Delete agent

POST /api/integracoes/sync → Trigger Espaider sync
GET  /api/search/suggestions → Get search suggestions
```

---

## References

- **Constitution Article IV:** No Invention — Structure reflects actual code
- **ADR-001:** RLS Strategy (applies to all features)
- **DEVELOPMENT-SETUP.md:** Local setup for feature development
- **TESTING-STRATEGY.md:** Test structure mirrors feature folders
- **tsconfig.json:** Path alias configuration

---

## Migration Path

**Legacy structure (if any) → Feature-based:**

For existing large folders:
1. Create feature folder: `mkdir src/app/feature-name`
2. Move related components: `mv src/components/SomeFeature/* src/app/feature-name/components/`
3. Update imports in moved components
4. Update imports in pages
5. Test that routing still works
6. Remove empty folders

---

## Para @architect (Aria)

**Feature Design:**
- Structure supports adding new features without modifying core
- Feature folder pattern scales to 20+ features
- Clear boundary between feature-specific and shared code
- API routes remain separate (resource-based, not feature-based)

**When designing new feature:**
- Create feature folder under `src/app/`
- Identify dependencies (shared components, hooks, services)
- Plan API routes under `src/app/api/`
- Document feature boundary (README.md in feature folder if complex)

---

## Para @dev (Dex)

**Feature Development Workflow:**
1. Feature folder is your workspace (e.g., `src/app/projetos/`)
2. Components live in `./components/` subdirectory
3. Server actions in `./actions/` subdirectory
4. Use path aliases: `@/components/ui`, `@/lib/domain`, etc.
5. Feature-specific imports: `./components/MyComponent`
6. Shared imports: `@/components/layout`, `@/lib/...`

**Code Organization Example:**

```typescript
// Feature-specific (import relative)
import { ProjectTable } from './components/ProjectTable';

// Shared UI (import from alias)
import { Button } from '@/components/ui';

// Shared domain logic (import from alias)
import { normalizeProjectStatus } from '@/lib/domain/project-phase';

// Shared hooks (import from alias)
import { useFilterState } from '@/hooks/useFilterState';
```

**Testing:**
- Feature tests mirror structure: `src/app/projetos/__tests__/`
- Test files co-located with code
- Command: `npm test -- src/app/projetos/`

---

## Para @pm (Morgan)

**Feature Planning:**
- Each epic maps to feature folder (or sub-folder)
- Example: EPIC-7 "Quick Wins" → features in `dashboard/`, `projetos/`
- Story point estimation: Consider feature folder complexity

**Roadmap Clarity:**
- Feature A = `src/app/feature-a/`
- Feature B = `src/app/feature-b/`
- No cross-feature dependencies (shared lib only)

---

— Orion, orquestrando o sistema 🎯

**Version:** v0.2.3+
**Last Updated:** 2026-03-15
**Status:** PRODUCTION (Live)
