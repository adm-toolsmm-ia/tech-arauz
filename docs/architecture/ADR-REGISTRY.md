# Architectural Decision Records (ADR) Registry (AIOX 10/10)

**Version:** 0.2.3 (Production Live)
**Last Updated:** 2026-03-14
**Status:** Authoritative
**Framework:** Synkra AIOX v1.0.0

---

## Overview

This document records **critical architectural decisions** made during Tech Arauz development. Each ADR includes:
- **Decision:** What was decided
- **Status:** Current state (Active, Deprecated, Evolved)
- **Rationale:** Why this was chosen
- **Consequences:** Impacts (positive and negative)
- **Alternatives:** Other options considered

All ADRs are **living documents** — can be amended, deprecated, or evolved as the project grows. They serve as a guide, not immutable law.

---

## ADR-001: RLS on All Tables (Multi-Tenant Isolation)

**Decision:** Enable Row Level Security (RLS) on **every table** in the database. All RLS policies enforce `tenant_id = get_user_tenant_id()`.

**Status:** ✅ Active (Production)

**Rationale:**
- **Mandatory multi-tenant isolation:** Each organization's data must be invisible to others
- **Defense in depth:** Isolation at DB layer (cannot be bypassed by app bugs)
- **Compliance:** Meets GDPR/SOC2 requirements for data segregation
- **Performance:** PostgreSQL RLS is optimized (no performance penalty)
- **Simplicity:** No conditional logic in app code (delegated to DB)

**Consequences:**
- ✅ **Positive:**
  - Impossible to accidentally expose cross-tenant data
  - New developers can't accidentally build leaky code
  - Migrations with service role are explicit (auditable)
  - Query performance unchanged (RLS indexed)

- ⚠️ **Negative:**
  - Service role must be used carefully (can bypass RLS)
  - Batch operations require explicit service role creation
  - Initial learning curve for new team members

**Alternatives Considered:**
1. Application-level filtering (tenant_id in WHERE clause)
   - ❌ Risky (easy to forget in new code)
   - ❌ No protection against SQL injection
2. Separate databases per tenant
   - ❌ Operational complexity (too many DBs)
   - ❌ Hard to run analytics across tenants

**Implementation:**

```sql
-- Applied to ALL tables
CREATE TABLE projects (
  id UUID PRIMARY KEY,
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  -- ... other fields
  ENABLE ROW LEVEL SECURITY
);

-- RLS policy (enforced at row level)
CREATE POLICY projects_isolation ON projects
  USING (tenant_id = (SELECT tenant_id FROM auth.users WHERE id = auth.uid()));
```

**Migration Path:** If RLS ever needs to be modified:
1. Test new policy in staging
2. Deploy with both old + new policy (overlap period)
3. Verify no data leakage
4. Remove old policy

---

## ADR-002: Token Fallback to Environment Variables

**Decision:** When Supabase token is unavailable, fall back to an environment variable `SUPABASE_TOKEN`.

**Status:** ✅ Active (Production)

**Rationale:**
- **Resilience:** If Supabase Auth service is temporarily down, app can still operate using cached token
- **Development:** Local dev can use a hardcoded token without full Supabase setup
- **Service role operations:** Batch jobs need explicit token (not user's JWT)

**Consequences:**
- ✅ **Positive:**
  - Greater operational resilience
  - Simpler local development
  - Batch operations don't require active Supabase session

- ⚠️ **Negative:**
  - Token in env var (security risk if leaked)
  - Must be rotated periodically
  - Can't be revoked immediately (unlike JWT)

**Alternatives Considered:**
1. Only use Supabase Auth (no fallback)
   - ❌ Brittle (single point of failure)
   - ❌ Harder to develop locally
2. Cache tokens in localStorage
   - ❌ Vulnerable to XSS attacks

**Implementation:**

```typescript
// src/lib/supabase/server.ts
export async function createServerClient() {
  const token = process.env.SUPABASE_TOKEN ||
    (await getActiveUserToken()); // from auth session

  return createClient(supabaseUrl, token);
}
```

**Security Note:** `SUPABASE_TOKEN` should:
- Be a service role token (elevated privileges)
- Never be exposed to client-side code
- Be rotated monthly
- Have audit logging enabled

---

## ADR-003: Composite UNIQUE Keys for Sync Idempotency

**Decision:** Use `UNIQUE(tenant_id, espaider_id)` composite key on all tables that sync with Espaider.

**Status:** ✅ Active (Production)

**Rationale:**
- **Idempotent sync:** Espaider webhooks may fire multiple times for the same project
- **Data deduplication:** UNIQUE constraint prevents duplicate rows
- **Simplicity:** Upsert pattern (INSERT...ON CONFLICT) is atomic and simple

**Consequences:**
- ✅ **Positive:**
  - Sync can be replayed without creating duplicates
  - No need for complex deduplication logic
  - Webhook failures are automatically retried (safe)

- ⚠️ **Negative:**
  - `espaider_id` can never change (business constraint)
  - Composite key slightly slower than single column

**Alternatives Considered:**
1. Check before insert (race condition)
   - ❌ Not atomic (between check and insert, duplicate could be created)
2. UUID-based deduplication
   - ❌ Requires tracking webhook IDs (extra infrastructure)

**Implementation:**

```sql
-- Composite key ensures idempotent sync
CREATE TABLE projects (
  id UUID PRIMARY KEY,
  tenant_id UUID NOT NULL,
  espaider_id VARCHAR NOT NULL,

  UNIQUE (tenant_id, espaider_id)
);

-- Upsert (atomic, idempotent)
INSERT INTO projects (tenant_id, espaider_id, name)
VALUES (?, ?, ?)
ON CONFLICT (tenant_id, espaider_id)
DO UPDATE SET name = excluded.name, updated_at = NOW();
```

**Migration Path:** When adding composite key to existing table:
1. Identify duplicate rows (GROUP BY tenant_id, espaider_id HAVING count(*) > 1)
2. Keep one, delete others
3. Add UNIQUE constraint
4. Deploy (backward compatible)

---

## ADR-004: Feature-Based Folder Structure

**Decision:** Organize code by feature/domain, not by technical layer. Example: `src/app/projetos/`, `src/components/project/`, `src/lib/filters/filters-projetos.ts`.

**Status:** ✅ Active (Production)

**Rationale:**
- **Discoverability:** All project-related code in one area
- **Modularity:** Easy to remove/duplicate features
- **Scalability:** Supports growing teams (one team per feature)
- **Dependency clarity:** Clear what depends on what

**Consequences:**
- ✅ **Positive:**
  - New developers find code quickly
  - Features can be worked on independently
  - Easier to identify cross-feature dependencies

- ⚠️ **Negative:**
  - Some code duplication (e.g., Form, Card components used across features)
  - Shared components require coordination

**Alternatives Considered:**
1. Layer-based structure (src/pages/, src/components/, src/services/)
   - ❌ Fragmented (one feature scattered across 3 folders)
   - ❌ Hard to remove features

**Implementation:**

```
src/
├── app/projetos/                 # Route handler
├── components/project/           # Domain components
├── hooks/useProjetosFilters.ts   # Domain hook
├── lib/
│   ├── filters/filters-projetos.ts
│   ├── validators/project-schemas.ts
│   └── transformers/project-transformers.ts
```

**Non-Invasive:** Shared components (Button, Card, Table) live in `src/components/ui/` and can be used across features.

---

## ADR-005: Server-First Rendering with Next.js 14

**Decision:** Use Next.js 14 App Router with Server Components as default. Client Components are opt-in (marked with `'use client'`).

**Status:** ✅ Active (Production)

**Rationale:**
- **Security:** Auth check happens on server before data is exposed
- **Performance:** Page renders with data (no loading spinners for content)
- **Simplicity:** No hydration mismatches (server and client render same thing)
- **Future-proof:** React Server Components are the future

**Consequences:**
- ✅ **Positive:**
  - Impossible to accidentally expose secure data to client
  - Faster initial page loads (data included in HTML)
  - Reduced bundle size (server code not sent to client)

- ⚠️ **Negative:**
  - Learning curve for developers used to client-only frameworks
  - Can't use certain browser APIs in server components (window, localStorage)
  - Debugging server-side errors harder

**Alternatives Considered:**
1. Client-Side Rendering (Next.js Pages Router)
   - ❌ Slower initial loads
   - ❌ Must fetch data after client renders (loading states)
2. Static Site Generation (pre-build everything)
   - ❌ Not feasible for dynamic data (projects, users)

**Implementation:**

```typescript
// Server component (default)
export default async function Page() {
  const data = await fetch('...');
  return <div>{data}</div>;
}

// Client component (opt-in)
'use client';
export function InteractiveComponent() {
  const [state, setState] = useState();
  return <div>{state}</div>;
}
```

**Migration Path:** If moving from Pages Router to App Router:
1. Create app/ directory with new App Router structure
2. Keep pages/ directory (Next.js supports both)
3. Gradually migrate routes (one at a time)
4. Remove pages/ once all routes migrated

---

## ADR-006: Absolute Imports (@/ Alias)

**Decision:** Use `@/*` alias to import from `src/*`. No relative imports like `../../../`.

**Status:** ✅ Active (Production)

**Rationale:**
- **Readability:** Absolute paths are clearer than relative (where am I importing from?)
- **Refactoring safety:** Moving files doesn't break imports
- **Consistency:** Every import follows the same pattern

**Consequences:**
- ✅ **Positive:**
  - Easier to refactor (move files without fixing imports)
  - IDE autocomplete works better (clear root reference)
  - Newbies understand imports immediately

- ⚠️ **Negative:**
  - Must configure TypeScript + bundler (done in tsconfig.json)
  - Slightly longer imports (`@/lib/utils` vs `../utils`)

**Alternatives Considered:**
1. Relative imports (no alias)
   - ❌ Fragile (break when moving files)
   - ❌ Unclear where files are
2. Path aliases like `@lib`, `@components`
   - ✅ Also good, but we use `@/*` convention

**Implementation:**

```json
// tsconfig.json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}

// ESLint rule (enforce absolute imports)
{
  "@typescript-eslint/no-restricted-imports": [
    "error",
    { "patterns": ["../"] }
  ]
}
```

**Non-Invasive:** Existing relative imports work, but new code should use `@/` prefix.

---

## ADR-007: TypeScript Strict Mode

**Decision:** Enable `"strict": true` in tsconfig.json. No `any` types allowed.

**Status:** ✅ Active (Production)

**Rationale:**
- **Type safety:** Catches bugs at compile time, not runtime
- **Refactoring confidence:** Can refactor with compiler as safety net
- **Self-documenting:** Types serve as inline documentation
- **Developer experience:** Better IDE support (autocomplete, error detection)

**Consequences:**
- ✅ **Positive:**
  - Fewer runtime errors
  - Safer refactoring
  - Better IDE support

- ⚠️ **Negative:**
  - Slower initial development (need to type everything)
  - Learning curve for developers from JavaScript background
  - More verbose code

**Alternatives Considered:**
1. Loose TypeScript mode (no strict)
   - ❌ Defeats purpose of TypeScript
   - ❌ False sense of security

**Implementation:**

```json
// tsconfig.json
{
  "compilerOptions": {
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true,
    "noImplicitAny": true
  }
}
```

**Enforcement:**
```bash
# Pre-push gate
npm run typecheck  # Must pass before commit
```

---

## ADR-008: Zod for Runtime Validation

**Decision:** Use Zod for schema validation (both runtime + TypeScript types). No manual `typeof` checks.

**Status:** ✅ Active (Production)

**Rationale:**
- **Single source of truth:** Schema defines both runtime checks and TypeScript types
- **Type inference:** TypeScript types auto-generated from Zod schemas
- **Runtime safety:** Catches invalid data at boundaries (API, forms, etc)
- **Developer experience:** Clear error messages for invalid data

**Consequences:**
- ✅ **Positive:**
  - Schema + types stay in sync (no divergence)
  - Clear contract for API inputs/outputs
  - Easier to debug validation errors

- ⚠️ **Negative:**
  - Runtime validation adds ~1-5ms overhead (negligible)
  - Zod adds ~10KB to bundle (can be tree-shaken)

**Alternatives Considered:**
1. TypeScript types only (no runtime validation)
   - ❌ No protection against invalid data at runtime
2. JSON Schema (separate from TS types)
   - ❌ Schema and types can diverge

**Implementation:**

```typescript
// Define once
const projectSchema = z.object({
  name: z.string().min(1),
  status: z.enum(['active', 'paused', 'done']),
});

// TypeScript type auto-inferred
type Project = z.infer<typeof projectSchema>;

// Runtime validation
const result = projectSchema.safeParse(data);
if (!result.success) {
  throw new Error(result.error.message);
}
```

---

## ADR-009: Supabase Realtime for Live Updates

**Decision:** Use Supabase Realtime subscriptions for live data updates (when multiple users edit the same data).

**Status:** ✅ Active (Limited Use)

**Rationale:**
- **User experience:** Changes appear immediately without manual refresh
- **Reduces polling:** No need to poll the API periodically
- **Collaborative:** Team sees each other's changes in real-time

**Consequences:**
- ✅ **Positive:**
  - Live collaboration experience
  - Reduced server load (no polling)

- ⚠️ **Negative:**
  - Adds complexity (WebSocket connections)
  - Potential for stale state (conflicts in concurrent edits)
  - Scalability concerns (WebSocket overhead)

**Alternatives Considered:**
1. Polling (fetch every N seconds)
   - ✅ Simple
   - ❌ Inefficient (many empty polls)
2. Server-Sent Events (SSE)
   - ✅ Simpler than WebSockets
   - ❌ Unidirectional (can't send data to server)

**Implementation:**

```typescript
const subscription = supabase
  .channel('projects')
  .on(
    'postgres_changes',
    { event: '*', schema: 'public', table: 'projects' },
    (payload) => {
      // Update local cache when DB changes
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    }
  )
  .subscribe();
```

**Limitation:** Currently used sparingly (not on all tables). High-volume tables should use polling + optimistic updates.

---

## ADR-010: TanStack Query for Server State

**Decision:** Use TanStack Query (React Query) for managing server state (data from Supabase).

**Status:** ✅ Active (Production)

**Rationale:**
- **Automatic caching:** No manual state management
- **Stale-while-revalidate:** Serve cached data immediately, update in background
- **Deduplication:** Multiple requests for same data reuse response
- **Background refetching:** Keeps data fresh without user interaction

**Consequences:**
- ✅ **Positive:**
  - Simpler data fetching code
  - Better performance (caching + deduplication)
  - Less boilerplate

- ⚠️ **Negative:**
  - Learning curve (new API)
  - Cache invalidation complexity (can be tricky)
  - Bundle size (~15KB)

**Alternatives Considered:**
1. Manual useState + useEffect
   - ❌ Lots of boilerplate
   - ❌ No caching
2. SWR (Stale-While-Revalidate)
   - ✅ Similar to TanStack Query
   - ❌ Less feature-rich

**Implementation:**

```typescript
const { data: projects, isLoading } = useQuery({
  queryKey: ['projects', tenant_id],
  queryFn: async () => {
    const { data } = await supabase.from('projects').select();
    return data;
  },
});
```

---

## ADR-011: Zustand for UI State

**Decision:** Use Zustand for UI state (view mode, sidebar open, selected item). No Redux.

**Status:** ✅ Active (Production)

**Rationale:**
- **Simplicity:** Minimal boilerplate compared to Redux
- **Bundle size:** ~2KB (vs Redux ~50KB)
- **Flexibility:** No opinions (not opinionated like Redux)
- **Persistence:** Built-in localStorage support

**Consequences:**
- ✅ **Positive:**
  - Simple API (setState pattern)
  - Smaller bundle
  - Faster to write

- ⚠️ **Negative:**
  - No middleware ecosystem (like Redux)
  - Less suitable for complex state machines
  - Fewer debugging tools

**Alternatives Considered:**
1. Redux
   - ✅ More powerful
   - ❌ Overkill for UI state
2. Context API
   - ✅ No library needed
   - ❌ Performance issues with large state

**Implementation:**

```typescript
const useStore = create((set) => ({
  sidebarOpen: true,
  toggleSidebar: () => set(s => ({ sidebarOpen: !s.sidebarOpen })),
}));
```

---

## ADR-012: Shadcn/ui + Radix Primitives

**Decision:** Use Shadcn/ui (built on Radix UI) for UI components. No Material-UI or Bootstrap.

**Status:** ✅ Active (Production)

**Rationale:**
- **Accessibility:** Radix primitives are WCAG 2.1 AA compliant
- **Customization:** No opinionated styling (only Tailwind)
- **Copy-paste:** Components are copyable into project (no node_modules dependency)
- **Modern:** Uses latest React patterns (hooks, compound components)

**Consequences:**
- ✅ **Positive:**
  - Highly accessible
  - Full control over styling
  - Small bundle size

- ⚠️ **Negative:**
  - Need to copy components (vs importing)
  - No pre-built themes
  - Learning curve for new devs

**Alternatives Considered:**
1. Material-UI
   - ✅ Rich component library
   - ❌ Opinionated styling
2. Bootstrap
   - ✅ Well-known
   - ❌ Legacy (not modern React)

**Implementation:**

```bash
# Add component to project
npx shadcn-ui@latest add button

# Use
<Button>Click me</Button>
```

---

## ADR-013: Tailwind CSS for Styling

**Decision:** Use Tailwind CSS for styling. No CSS-in-JS (Styled Components, Emotion).

**Status:** ✅ Active (Production)

**Rationale:**
- **Performance:** CSS compiled at build-time (zero runtime overhead)
- **Consistency:** Design tokens (spacing, colors) enforced by utilities
- **DX:** Class-based styling is fast (no component abstraction needed)
- **Scalability:** Works well as teams grow

**Consequences:**
- ✅ **Positive:**
  - Fast styling (no component overhead)
  - Small bundle size (~40KB)
  - Consistency through constraints

- ⚠️ **Negative:**
  - Learning curve (utility-first paradigm)
  - HTML can be verbose (many classes)
  - Requires purging to remove unused CSS

**Alternatives Considered:**
1. CSS Modules
   - ✅ Scoped styles
   - ❌ No utility classes
2. CSS-in-JS
   - ✅ Component-scoped
   - ❌ Runtime overhead

**Implementation:**

```tsx
// Utility classes
<div className="flex items-center gap-4 p-4 rounded-lg bg-blue-50">
  <h1 className="text-2xl font-bold">Title</h1>
</div>

// Design tokens via Tailwind config
<div className={`px-6 py-4 gap-4 text-lg font-semibold`}>
  {/* tokens ensure consistency */}
</div>
```

---

## ADR-014: DTCG Design Tokens

**Decision:** Extract design tokens to DTCG format (`design/tokens.json`), sync with Tailwind.

**Status:** ✅ Active (Production)

**Rationale:**
- **Single source of truth:** Tokens defined once, synced to Tailwind
- **Design system:** Non-developers (designers) can update tokens
- **Consistency:** All colors, spacing, typography consistent
- **Portability:** Tokens exportable to other platforms (mobile, web, etc)

**Consequences:**
- ✅ **Positive:**
  - Design system is explicit
  - Designers can update without code
  - Tokens portable to other platforms

- ⚠️ **Negative:**
  - Extra tooling (DTCG → Tailwind sync)
  - Learning curve (DTCG format)

**Alternatives Considered:**
1. Tailwind config only (no tokens file)
   - ✅ Simpler
   - ❌ Not portable to other platforms
2. Figma tokens plugin
   - ✅ Designer-friendly
   - ❌ Proprietary (Figma-only)

**Implementation:**

```json
// design/tokens.json (DTCG format)
{
  "color": {
    "primary": { "value": "#0066FF" },
    "secondary": { "value": "#FF6600" }
  }
}

// Synced to tailwind.config.ts
colors: {
  primary: '#0066FF',
  secondary: '#FF6600'
}
```

---

## Decision Evolution Process

As the project grows, ADRs may be:

1. **Extended:** Add new aspects (e.g., ADR-001 extended to cover service role usage)
2. **Superseded:** New ADR replaces old one (e.g., ADR-005 v2 when moving to different framework)
3. **Deprecated:** No longer applies (with migration path documented)

**Example:** If Supabase RLS ever becomes a bottleneck:
1. Create new ADR (ADR-001-ALT: Alternative Isolation Strategy)
2. Propose alternative with trade-offs
3. Get team consensus
4. Mark old ADR as "Superseded" with link to new one
5. Migrate gradually

---

## References

- **Architecture Overview:** `docs/architecture/ARCHITECTURE-OVERVIEW.md`
- **Software Architecture:** `docs/architecture/SOFTWARE-ARCHITECTURE.md`
- **Constitution:** `.aiox-core/constitution.md`
- **ADR Template:** https://github.com/joelparkerhenderson/architecture_decision_record

---

**Authored by:** Claude Code (Haiku 4.5) — AIOX Master Orchestrator
**Framework:** Synkra AIOX v1.0.0
**Last Reviewed:** 2026-03-14
**Next Review:** 2026-06-30 (quarterly)
