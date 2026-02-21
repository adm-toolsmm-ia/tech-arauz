# Módulo de Integrações - Arquitetura

## Visão Geral

O módulo de Integrações foi redesenhado com foco em **qualidade 10/10**: separação clara de responsabilidades, error handling robusto, RLS policies simplificadas e UX intuitiva.

**Componentes principais:**

- **APIManager**: Exibe cards de APIs + opção de sincronizar
- **LogViewer**: Histórico de logs com filtros, paginação e múltiplos estados

**API Routes:**

- `GET /api/integracoes` - List APIs
- `GET /api/integracoes/logs` - List logs with filters & pagination
- `GET /api/integracoes/logs/summary` - Fetch sync summaries
- `POST /api/integracoes/sync` - Trigger full sync (admin only)

---

## RLS Architecture (Migration 024)

### Policies

**Policy 1: Tenant Isolation (READ)**

```sql
CREATE POLICY "Log entries: authenticated users can view own tenant"
    ON public.integration_log_entries FOR SELECT
    USING (tenant_id = public.get_user_tenant_id());
```

- ✅ Usuários autenticados conseguem ler logs do seu tenant
- ✅ Não verifica role (delegado à API)
- ✅ Garante isolamento de tenant via RLS

**Policy 2: Service Role (FULL)**

```sql
CREATE POLICY "Log entries: service role unrestricted access"
    ON public.integration_log_entries FOR ALL
    USING (TRUE) WITH CHECK (TRUE);
```

- ✅ Service role (interno) acessa tudo sem restrição
- ✅ Usado por: sync processes, API routes

### Authorization Flow

```
User Request
    ↓
[API Route Auth Check]
  ├─ 401: Not authenticated → reject
  ├─ 404: Profile not found → reject
  └─ 403: Role not authorized → reject
    ↓
[RLS Policy Check]
  ├─ Tenant isolation (SELECT)
  └─ If pass → return data
```

**Key Insight:** RLS garante tenant isolation, mas **role authorization é responsabilidade da API**, não da RLS policy.

---

## API Routes

### GET /api/integracoes/logs

**Authorization:** `role IN ('admin', 'user')`

**Query Params:**

```
?page=1&limit=50
&level=error
&dataset=Projetos
&startDate=2026-02-01&endDate=2026-02-21
&requestId=abc-123
```

**Response:**

```typescript
{
  data: LogEntry[],
  pagination: { page, limit, total, totalPages },
  meta: { query_time_ms, returned_count }
}
```

**Error Handling:**

- `401`: "Não autenticado"
- `403`: "Sua role ({role}) não permite acesso a logs"
- `404`: "Perfil não encontrado"
- `500`: "Erro ao buscar logs"

### POST /api/integracoes/sync

**Authorization:** `role = 'admin'` (ONLY, not 'user')

**Body:** `{ apiId?: string }` (optional)

**Response:**

```typescript
{
  success: boolean,
  message: string,
  request_id: string,
  details?: { ... }
}
```

**Error Handling:**

- `401`: "Não autenticado"
- `403`: "Sua role ({role}) não permite iniciar sincronizações"
- `500`: "Erro ao iniciar sincronização"

---

## Components

### LogViewer

**Features:**

- 2 tabs: "Logs Detalhados" | "Resumo por Execução"
- Filtros: Level, Dataset, DateRange, Search
- Paginação: 50 items/página
- Expandable rows com detalhes em JSON
- Estados: loading, error, empty, success

**Key Implementation:**

```typescript
// Mount: fetch logs + summaries
useEffect(() => {
  fetchLogs(1);
  fetchSummaries();
}, []); // Empty = run once

// Filters: reset to page 1 + refetch
useEffect(() => {
  fetchLogs(1);
}, [filters, fetchLogs]);

// Pagination: update page + fetch
const handlePageChange = (newPage) => {
  setPagination((p) => ({ ...p, page: newPage }));
  fetchLogs(newPage);
};
```

**Error Display:**

```
401 → "Faça login para continuar"
403 → "Sua role ({role}) não permite acesso"
500 → "Erro ao buscar logs"
```

### APIManager

**Features:**

- Grid de API cards (3 colunas em desktop)
- Status badge (Ativo/Inativo)
- Botões: Ver Logs, Config
- Botão global "Sincronizar" (top-right)

**States:**

- Loading
- Error (com retry)
- Empty (nenhuma API)
- Success (cards grid)

**Implementation:**

```typescript
// Single fetch on mount
useEffect(() => {
  fetchAPIs();
}, []);

// Sync handler
const handleSync = async () => {
  POST /api/integracoes/sync
  → show alert + refresh APIs
};
```

---

## Testing Checklist

### 1. RLS Policies (DB Level)

```sql
-- ✅ User can read own tenant
SELECT COUNT(*) FROM integration_log_entries
  WHERE tenant_id = get_user_tenant_id();
-- Expected: Returns count (0 if no logs, OK)

-- ✅ User cannot read other tenant
SELECT COUNT(*) FROM integration_log_entries
  WHERE tenant_id = '<another-tenant-id>';
-- Expected: 0 (RLS blocked)

-- ✅ Service role can read all
SELECT COUNT(*) FROM integration_log_entries;
-- Expected: Total across all tenants
```

### 2. API Routes (HTTP Level)

```bash
# ✅ Unauthenticated
curl /api/integracoes/logs
# Expected: 401 "Não autenticado"

# ✅ Authenticated but viewer role
curl -H "Authorization: Bearer token" /api/integracoes/logs
# Expected: 403 "Sua role (viewer) não permite"

# ✅ Authenticated with admin role
curl -H "Authorization: Bearer token" /api/integracoes/logs
# Expected: 200 + logs

# ✅ Sync requires admin (not user)
curl -X POST -H "Authorization: Bearer user-token" /api/integracoes/sync
# Expected: 403 "Sua role (user) não permite iniciar sincronizações"
```

### 3. Frontend Components

```
LogViewer:
  ✅ Load on mount
  ✅ Filters change → page 1 + refetch
  ✅ Pagination works (prev/next)
  ✅ Error message displays (401/403/500)
  ✅ Empty state shows
  ✅ Details expandable
  ✅ Summary tab shows sync history

APIManager:
  ✅ Load on mount
  ✅ Display API cards
  ✅ Sync button triggers POST
  ✅ Error message displays
  ✅ Empty state shows
```

---

## Performance Optimization

### Indices (Already in 006_integration_log_entries.sql)

```sql
-- Tenant isolation + ordering
idx_log_entries_tenant_id
idx_log_entries_logged_at DESC

-- Filter combinations
idx_log_entries_tenant_level_date (tenant_id, level, logged_at DESC)
idx_log_entries_level
idx_log_entries_dataset

-- FK reference
idx_log_entries_sync_log_id
idx_log_entries_request_id
```

### Query Optimization

**Good:**

```typescript
// Tenant filter first
query = query.eq('tenant_id', tenantId); // ← Narrow down
query = query.eq('level', level); // ← Then filter
```

**Pagination:**

- Fixed limit: 50 items/page
- No OFFSET for large pages (use keyset pagination if needed)
- `count: 'exact'` for total (acceptable for <10K records)

---

## Migration Path (024)

**What changed:**

1. Dropped old policies (006 + 023) that checked `role = 'admin'` in RLS
2. Added 2 simple policies:
   - Tenant isolation (SELECT)
   - Service role (ALL)
3. Authorization moved to API routes

**Why:**

- RLS is for **data isolation**, not **authorization**
- Authorization should be at **API boundary**, not in RLS
- Simpler logic = easier to debug & maintain

**Testing after migration:**

```sql
-- Run test queries from section 2 above
```

---

## Known Limitations & Future Work

- [ ] Email/Slack alerts (UI-only currently)
- [ ] Real-time log streaming (WebSocket)
- [ ] Log retention policy (30 days auto-cleanup)
- [ ] Advanced analytics dashboard
- [ ] Keyset pagination for very large datasets

---

## References

- Migration 024: `supabase/migrations/024_redesign_integration_log_rls.sql`
- API Routes: `src/app/api/integracoes/logs/`
- Components: `src/components/integracoes/`
- Page: `src/app/integracoes/integracoes-content.tsx`

---

_Last Updated: 2026-02-21_
_Architecture: AIOS + Antigravity_
