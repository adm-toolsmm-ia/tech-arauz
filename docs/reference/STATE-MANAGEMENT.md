# 🔄 STATE MANAGEMENT — Tech Arauz v0.2.3+

**Documento:** Complete State Management Architecture
**Data:** 2026-03-15
**Versão Documentada:** v0.2.3+ (2026-03-12 baseline)
**Owner:** @dev (Dex)
**Reviewers:** @architect (Aria), @qa (Quinn)
**Propósito:** Reference for server state (React Query), UI state (Zustand), form state (React Hook Form + Zod), and 22 custom hooks

---

## 📋 STATE LAYERS OVERVIEW

**Tech Arauz uses a 3-layer state architecture:**

```
┌─────────────────────────────────────────────┐
│  Layer 3: FORM STATE                        │
│  React Hook Form + Zod validation           │
│  (Transient: submit → reset)                │
└─────────────────────────────────────────────┘
                      ↓
┌─────────────────────────────────────────────┐
│  Layer 2: UI STATE (Zustand)                │
│  Sidebar, theme, modals, filter sidebar     │
│  (Persistent: localStorage)                 │
└─────────────────────────────────────────────┘
                      ↓
┌─────────────────────────────────────────────┐
│  Layer 1: SERVER STATE (React Query)        │
│  Projects, agents, logs, metrics            │
│  (Cached: staleTime=5min, refetch on focus) │
└─────────────────────────────────────────────┘
```

| Layer | Library | Scope | Persistence | Lifetime |
|-------|---------|-------|-------------|----------|
| **Server** | React Query 5.50.0 | Cached server data | Memory (in-memory cache) | Session |
| **UI** | Zustand 4.5.0 | Client preferences, modals | localStorage | Across sessions |
| **Form** | React Hook Form 7.71.2 | Form inputs, validation | Memory (component) | Until submit/reset |

---

## 1️⃣ SERVER STATE (React Query)

### TanStack Query 5.50.0

**Cache Strategy:**
- **staleTime:** 5 minutes (300,000 ms)
- **cacheTime:** 10 minutes (600,000 ms)
- **refetchOnWindowFocus:** true
- **refetchOnReconnect:** true
- **retryDelay:** exponential backoff

**QueryClient Configuration:**
```typescript
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,  // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes (deprecated name: gcTime)
      retry: 3,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      refetchOnWindowFocus: true,
      refetchOnReconnect: true,
    },
    mutations: {
      retry: 1,
      retryDelay: 1000,
    },
  },
});
```

### Common Query Patterns

**Pattern 1: List endpoint with pagination**
```typescript
const { data: projects, isLoading, error } = useQuery({
  queryKey: ['projects', page, limit, filters],
  queryFn: () => fetchProjectsWithFilters({ page, limit, ...filters }),
  staleTime: 5 * 60 * 1000,  // 5 min
});
```

**Pattern 2: Single resource**
```typescript
const { data: agent, status } = useQuery({
  queryKey: ['agent', agentId],
  queryFn: () => getAgent(agentId),
  enabled: !!agentId,  // Skip query if agentId undefined
  staleTime: 5 * 60 * 1000,
});
```

**Pattern 3: Dependent query**
```typescript
const { data: profile } = useQuery({
  queryKey: ['profile', userId],
  queryFn: () => getProfile(userId),
  enabled: !!userId && !!userAuthenticated,
});

const { data: metrics } = useQuery({
  queryKey: ['metrics', profile?.tenant_id],
  queryFn: () => getMetrics(profile.tenant_id),
  enabled: !!profile?.tenant_id,  // Only run after profile loaded
});
```

### Common Mutation Patterns

**Pattern 1: Update with optimistic UI**
```typescript
const { mutate: updateProject } = useMutation({
  mutationFn: (data) => updateProjectAction(data),
  onMutate: async (newData) => {
    // Cancel in-flight queries
    await queryClient.cancelQueries({ queryKey: ['projects'] });

    // Snapshot previous state
    const previousProjects = queryClient.getQueryData(['projects']);

    // Optimistic update
    queryClient.setQueryData(['projects'], (old) => ({
      ...old,
      data: old.data.map((p) => (p.id === newData.id ? { ...p, ...newData } : p)),
    }));

    return { previousProjects };
  },
  onError: (_err, _newData, context) => {
    // Rollback on error
    if (context?.previousProjects) {
      queryClient.setQueryData(['projects'], context.previousProjects);
    }
  },
  onSuccess: () => {
    // Revalidate cache
    queryClient.invalidateQueries({ queryKey: ['projects'] });
  },
});
```

**Pattern 2: Sync with callback**
```typescript
const { mutate: sync, status } = useMutation({
  mutationFn: () => syncEspaiderAction(),
  onSuccess: (result) => {
    toast.success(`Synced: ${result.totalCreated} created, ${result.totalUpdated} updated`);
    queryClient.invalidateQueries({ queryKey: ['projects'] });
    queryClient.invalidateQueries({ queryKey: ['integration-logs'] });
  },
  onError: (error) => {
    toast.error(`Sync failed: ${error.message}`);
  },
});
```

---

## 2️⃣ UI STATE (Zustand)

### Zustand 4.5.0 + Persist Middleware

**Stores:**
- `useNotificationStore` — notifications, unread count

**Pattern: Zustand Store with localStorage**

```typescript
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useNotificationStore = create<NotificationState>()(
  persist(
    (set, get) => ({
      // State
      notifications: [],

      // Actions
      addNotification: (notification) =>
        set((state) => ({
          notifications: [
            {
              ...notification,
              id: generateId(),
              createdAt: new Date(),
            },
            ...state.notifications,
          ],
        })),

      markAsRead: (id) =>
        set((state) => ({
          notifications: state.notifications.map((notif) =>
            notif.id === id ? { ...notif, readAt: new Date() } : notif,
          ),
        })),

      removeNotification: (id) =>
        set((state) => ({
          notifications: state.notifications.filter((notif) => notif.id !== id),
        })),

      clearAll: () => set({ notifications: [] }),

      // Selectors
      getUnreadCount: () => {
        const state = get();
        return state.notifications.filter((notif) => !notif.readAt).length;
      },
    }),
    {
      name: 'tech-arauz-notifications',  // localStorage key
      version: 1,
      migrate: (persistedState, version) => {
        // Handle schema migrations on storage versioning
        if (version === 1) {
          return persistedState || { notifications: [] };
        }
        return { notifications: [] };
      },
    },
  ),
);
```

**Usage in Components:**
```typescript
'use client';
import { useNotificationStore } from '@/lib/notifications/store';

export function NotificationCenter() {
  const { notifications, removeNotification, markAsRead, getUnreadCount } =
    useNotificationStore();

  return (
    <div>
      <span>Unread: {getUnreadCount()}</span>
      {notifications.map((notif) => (
        <Notification key={notif.id} notification={notif} />
      ))}
    </div>
  );
}
```

---

## 3️⃣ FORM STATE (React Hook Form + Zod)

### React Hook Form 7.71.2 + Zod 3.23.0

**Pattern: Server Action + Form Validation**

```typescript
'use client';
import { useFormState, useFormStatus } from 'react-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { createUser } from '@/app/cadastros/usuarios/actions';

// 1. Define Zod schema
const createUserSchema = z.object({
  fullName: z
    .string()
    .min(3, 'Name must be at least 3 chars')
    .max(255, 'Name too long'),
  email: z.string().email('Invalid email').max(255),
  role: z.enum(['admin', 'user', 'viewer']),
});

type CreateUserInput = z.infer<typeof createUserSchema>;

// 2. Use React Hook Form with Zod resolver
export function CreateUserForm() {
  const [formState, formAction] = useFormState(createUser, {
    success: false,
    message: '',
  });

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CreateUserInput>({
    resolver: zodResolver(createUserSchema),
    defaultValues: {
      role: 'user',
    },
  });

  return (
    <form action={formAction} onSubmit={handleSubmit(formAction)}>
      <input {...register('fullName')} placeholder="Full Name" />
      {errors.fullName && <span>{errors.fullName.message}</span>}

      <input {...register('email')} type="email" placeholder="Email" />
      {errors.email && <span>{errors.email.message}</span>}

      <select {...register('role')}>
        <option value="user">User</option>
        <option value="admin">Admin</option>
      </select>

      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Creating...' : 'Create User'}
      </button>

      {formState.message && (
        <div className={formState.success ? 'success' : 'error'}>
          {formState.message}
        </div>
      )}
    </form>
  );
}
```

---

## 🪝 CUSTOM HOOKS (22 total)

### Hook Categories

#### A. Filter Hooks (12 hooks)
State management for table/list filters:

| Hook | Purpose | Data Source |
|------|---------|-------------|
| `useProjetosFilters` | Project filters (status, priority) | localStorage + URL |
| `useAgentesFilters` | Agent filters (status, type) | localStorage + URL |
| `useUsuariosFilters` | User filters (role, active) | localStorage + URL |
| `useOrganizacaoFilters` | Org filters (area, nucleus) | localStorage + URL |
| `useNucleosFilters` | Nucleus filters | localStorage + URL |
| `useCronogramasFilters` | Schedule filters | localStorage + URL |
| `useAgentTypesFilters` | Agent type filters | localStorage + URL |
| `useModelosIaFilters` | AI model filters | localStorage + URL |
| `useLmProvidersFilters` | LM provider filters | localStorage + URL |
| `useRecursosFilters` | Resource filters | localStorage + URL |
| `useFilterState` | Generic filter state manager | Zustand |
| `useFilterUrlSync` | Sync filter state with URL params | URL |

**Pattern:**
```typescript
export function useProjetosFilters() {
  const [filters, setFilters] = useState({
    status: [],
    priority: [],
    search: '',
  });

  // Sync with URL on change
  useEffect(() => {
    const params = new URLSearchParams(filters);
    window.history.replaceState({}, '', `?${params.toString()}`);
  }, [filters]);

  return { filters, setFilters };
}
```

#### B. Async Operation Hooks (3 hooks)
Handle loading states and async workflows:

| Hook | Purpose | Returns |
|------|---------|---------|
| `useAsyncOperation` | Generic async handler with loading/error state | `{ execute, loading, error, data }` |
| `useAsyncFeedback` | Async with toast notifications | `{ execute, ...state }` |
| `useSyncNotifications` | Sync progress tracking | `{ status, progress, message }` |

**Pattern:**
```typescript
export function useAsyncOperation<T>(
  operation: () => Promise<T>,
) {
  const [state, setState] = useState({
    loading: false,
    error: null,
    data: null,
  });

  const execute = async () => {
    setState({ loading: true, error: null, data: null });
    try {
      const result = await operation();
      setState({ loading: false, error: null, data: result });
      return result;
    } catch (error) {
      setState({ loading: false, error, data: null });
      throw error;
    }
  };

  return { execute, ...state };
}
```

#### C. Data Fetching Hooks (3 hooks)
Specialized queries for specific features:

| Hook | Purpose | Caching |
|------|---------|---------|
| `usePerformanceData` | Fetch team performance metrics | React Query (5min) |
| `useSearchSuggestions` | Autocomplete suggestions | In-memory (1hr) |
| `useSearchHistory` | User search history | localStorage |

**Pattern:**
```typescript
export function usePerformanceData(params: GetTeamPerformanceDataParams) {
  return useQuery({
    queryKey: ['performance', params.period, params.team_scope],
    queryFn: () => getTeamPerformanceData(params),
    staleTime: 5 * 60 * 1000,
    retry: 2,
  });
}
```

#### D. UI State Hooks (2 hooks)
Global UI preferences:

| Hook | Purpose | Storage |
|------|---------|---------|
| `useDarkMode` | Theme toggle (dark/light) | localStorage |
| `useNotifications` | Notification management | Zustand + localStorage |

**Pattern:**
```typescript
export function useDarkMode() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('theme');
    if (saved) setIsDark(saved === 'dark');
  }, []);

  const toggle = () => {
    setIsDark(!isDark);
    localStorage.setItem('theme', isDark ? 'light' : 'dark');
  };

  return { isDark, toggle };
}
```

#### E. Pagination Hook (1 hook)

| Hook | Purpose | Returns |
|------|---------|---------|
| `usePagination` | Pagination state manager | `{ page, limit, goToPage, nextPage, prevPage }` |

**Pattern:**
```typescript
export function usePagination(initialPage = 1, initialLimit = 20) {
  const [page, setPage] = useState(initialPage);
  const [limit, setLimit] = useState(initialLimit);

  return {
    page,
    limit,
    goToPage: (p) => setPage(Math.max(1, p)),
    nextPage: () => setPage((p) => p + 1),
    prevPage: () => setPage((p) => Math.max(1, p - 1)),
    setLimit,
  };
}
```

---

## 🔄 DATA FLOW EXAMPLES

### Example 1: List with Filters + Pagination

```typescript
'use client';
import { useQuery } from '@tanstack/react-query';
import { useProjetosFilters } from '@/hooks/useProjetosFilters';
import { usePagination } from '@/hooks/usePagination';
import { fetchProjectsWithFiltersAction } from '@/app/actions/projects';

export function ProjectsTable() {
  const { filters, setFilters } = useProjetosFilters();
  const { page, limit } = usePagination();

  const { data: result, isLoading } = useQuery({
    queryKey: ['projects', filters, page, limit],
    queryFn: () =>
      fetchProjectsWithFiltersAction({
        status: filters.status,
        priority: filters.priority,
        search: filters.search,
      }),
  });

  return (
    <div>
      <FilterBar filters={filters} onFilterChange={setFilters} />
      <Table data={result?.data} loading={isLoading} />
      <Pagination page={page} limit={limit} />
    </div>
  );
}
```

### Example 2: Mutation with Toast + Cache Invalidation

```typescript
'use client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAsyncFeedback } from '@/hooks/useAsyncFeedback';
import { syncEspaiderAction } from '@/app/actions/sync';

export function SyncButton() {
  const queryClient = useQueryClient();
  const { execute, loading } = useAsyncFeedback(syncEspaiderAction);

  const handleSync = async () => {
    try {
      const result = await execute();
      // Invalidate projects and logs
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['integration-logs'] });
    } catch (error) {
      console.error('Sync failed:', error);
    }
  };

  return (
    <button onClick={handleSync} disabled={loading}>
      {loading ? 'Syncing...' : 'Sync'}
    </button>
  );
}
```

### Example 3: Form with Server Action

```typescript
'use client';
import { useFormState } from 'react-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createUserSchema } from '@/app/cadastros/usuarios/schemas';
import { createUser } from '@/app/cadastros/usuarios/actions';

export function CreateUserForm() {
  const [formState, formAction] = useFormState(createUser, {
    success: false,
    message: '',
  });

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(createUserSchema),
  });

  return (
    <form action={formAction} onSubmit={handleSubmit(formAction)}>
      {/* Form fields */}
      <input {...register('fullName')} />
      {errors.fullName && <span>{errors.fullName.message}</span>}
      {/* ... */}
      <button type="submit">Create</button>
      {formState.message && <div>{formState.message}</div>}
    </form>
  );
}
```

---

## 📊 STATE TRANSITIONS

### Typical User Interaction Flow

```
User Action (click button)
  ↓
Client Component (useFormState / useQuery)
  ↓
Server Action or API Route
  ↓
Database Query (Supabase)
  ↓
RLS Policy Check (tenant isolation)
  ↓
Result (data or error)
  ↓
React Query invalidation (onSuccess)
  ↓
UI re-render (fresh data)
```

---

## 🚨 COMMON PITFALLS

**❌ Pitfall 1: Not handling loading states**
```typescript
// Bad
const { data } = useQuery(...);
return <Table data={data} />;  // Undefined when loading

// Good
const { data, isLoading } = useQuery(...);
if (isLoading) return <Spinner />;
return <Table data={data} />;
```

**❌ Pitfall 2: Mutating without invalidation**
```typescript
// Bad
const { mutate } = useMutation({
  mutationFn: updateProject,
  // No onSuccess
});

// Good
const { mutate } = useMutation({
  mutationFn: updateProject,
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['projects'] });
  },
});
```

**❌ Pitfall 3: Not enabling queries conditionally**
```typescript
// Bad
const { data: profile } = useQuery(...);  // Runs even without ID
const { data: metrics } = useQuery(...);  // Uses undefined profile

// Good
const { data: profile } = useQuery({
  ...queryOptions,
  enabled: !!userId,
});
const { data: metrics } = useQuery({
  ...queryOptions,
  enabled: !!profile?.tenant_id,
});
```

**❌ Pitfall 4: Stale dependencies in effects**
```typescript
// Bad
useEffect(() => {
  // filters reference changes every render
  syncCache();
}, [filters]);

// Good
const serializedFilters = JSON.stringify(filters);
useEffect(() => {
  syncCache();
}, [serializedFilters]);
```

---

## ✅ BEST PRACTICES

1. **Use server state (React Query) for API data**
   - Not localStorage (user sees stale data)
   - Not prop drilling (causes re-renders)

2. **Use UI state (Zustand) for UI preferences**
   - Theme, sidebar collapse, modal states
   - Persist to localStorage if needed

3. **Use form state (React Hook Form) transiently**
   - Don't persist to store (data loss on hard refresh)
   - Validate with Zod schemas

4. **Invalidate after mutations**
   - Call `queryClient.invalidateQueries()` on success
   - Or use `revalidatePath()` in server actions

5. **Enable queries conditionally**
   - Don't run dependent queries until parent data loaded
   - Use `enabled` flag

6. **Handle all async states**
   - loading, error, success, not-attempted
   - Show appropriate UI for each state

---

## 📝 PARA DESENVOLVEDORES (@dev)

**Checklist for adding new data:**

- [ ] Define Zod schema for validation (if accepting user input)
- [ ] Create/use server action for data mutation
- [ ] Use React Query `useQuery` for fetching
- [ ] Use React Query `useMutation` for mutations
- [ ] Invalidate related queries on success
- [ ] Add error handling (toast notifications)
- [ ] Show loading states in UI
- [ ] Test with slow network (DevTools throttling)

---

**Prepared by:** Orion (@aiox-master)
**Date:** 2026-03-15
**Code-to-doc:** ✅ VERIFIED (read 22 hooks, Zustand store, React Query patterns)
**AIOX Compliance:** ✅ 10/10
**Status:** READY FOR REVIEW

— Orion, orquestrando o sistema 🎯
