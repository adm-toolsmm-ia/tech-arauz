# Build e Deploy — Quality Gates e Prevenção de Falhas

**Data:** 2026-03-08  
**Status:** Normativo  
**Epic:** Engenharia e Arquitetura

---

## 1. Objetivo

Este documento padroniza os **quality gates** obrigatórios antes de push/deploy e documenta os **erros comuns** que quebram o build na Vercel/CI. É a **fonte de verdade** para:

- Ordem e execução dos gates
- Erros típicos e como evitá-los
- Checklist para desenvolvedores e agentes AI

---

## 2. Quality Gates — Ordem Obrigatória

A ordem está definida em `configs/project.yaml` → `coding_standards.quality_gates`:

| Ordem | Comando | Propósito |
|-------|---------|-----------|
| 1 | `npm run lint` | ESLint — erros de código e acessibilidade |
| 2 | `npm run typecheck` | TypeScript — erros de tipo que quebram o build |
| 3 | `npm run test` | Testes unitários e integração |
| 4 | `npm run format:check` | Prettier — formatação consistente |
| 5 | `npm run sync:ide:check` | Validação de estrutura AIOS (quando aplicável) |
| 6 | `npm run build` | Build de produção (Next.js) |

**Regra:** Se qualquer gate falhar localmente, o deploy na Vercel falhará. Resolver antes de commitar.

### 2.1 Comando de Gate Local (PowerShell)

```powershell
npm run lint ; npm run typecheck ; npm run test ; npm run format:check ; npm run build
```

**Importante:** No Windows/PowerShell, usar `;` para encadear comandos. O `&&` não existe no PowerShell 5.x.

---

## 3. Erros Comuns e Soluções

### 3.1 Formatação (Prettier) — `format:check` falha

**Sintoma:** CI/Vercel falha com `[warn] src/...` em arquivos específicos.

**Causa:** Arquivos alterados sem rodar `npm run format` antes do commit.

**Solução:**

```bash
npm run format
```

Isso formata todos os arquivos em `src/**/*.{ts,tsx,js,jsx,css,md}`. Commitar as alterações geradas.

**Prevenção:** Configurar format-on-save no editor ou rodar `npm run format` antes de cada commit.

---

### 3.2 TypeScript — `null` vs `undefined` em props

**Sintoma:** `Type error: Type 'string | null' is not assignable to type 'string | undefined'`.

**Causa:** APIs como `URLSearchParams.get()` e `searchParams.get()` retornam `string | null`. Componentes (shadcn/ui, Radix) esperam `string | undefined`.

**NÃO fazer:**

```tsx
const tab = searchParams.get('tab');
<Tabs defaultValue={tab} />  // Erro: null não assignable
```

**Fazer:**

```tsx
const tab = searchParams.get('tab');
const defaultTab: string = tab && VALID_TABS.includes(tab) ? tab : 'sistemas';
<Tabs defaultValue={defaultTab} />
```

Ou: `defaultValue={value ?? undefined}` ou `defaultValue={value ?? 'fallback'}`.

**Referência:** `docs/architecture/module-standards.md` — Seção 13 (Type Safety).

---

### 3.3 ESLint — Regras de acessibilidade

**Sintoma:** `npm run lint` falha com avisos de jsx-a11y.

**Causa:** Elementos interativos sem `role`, `tabIndex` ou `onKeyDown`.

**Solução:** Seguir `docs/accessibility/component-a11y-guide.md`. Cards/linhas clicáveis devem ter `role="button"`, `tabIndex={0}` e `onKeyDown` para Enter/Space.

---

### 3.4 label-has-associated-control

**Sintoma:** `A form label must be associated with a control`.

**Causa:** Uso de `<label>` sem `htmlFor`+`id` ou sem envolvimento do controle.

**Soluções:**

- Input/Select nativo: `<Label htmlFor="id">` + `id` no controle
- Select customizado (Radix/shadcn): componente deve aceitar prop `id` e repassar ao trigger
- Grupo de botões: usar `<fieldset>` + `<legend>` em vez de `label`

**Referência:** `docs/accessibility/component-a11y-guide.md` — seção "Filtros e componentes customizados".

---

### 3.5 react-hooks/exhaustive-deps

**Sintoma:** `React Hook useEffect has a missing dependency: 'params'`.

**Causa:** Objeto usado no efeito mas apenas propriedades no array de deps.

**Soluções:**

- Preferir: incluir `params` e memoizar no chamador com `useMemo` quando necessário
- Alternativa: `eslint-disable-next-line` com justificativa quando as deps por valor forem intencionais

---

### 3.6 Build Next.js — Falha de memória ou timeout

**Sintoma:** Build trava ou falha com erro de memória na Vercel.

**Causa:** Projeto muito grande, dependências pesadas ou loops de import.

**Soluções:**

- Verificar imports circulares
- Considerar code splitting para rotas pesadas
- Aumentar memória no `vercel.json` se necessário (configuração avançada)

---

### 3.7 TypeScript — indexação em union types

**Sintoma:** `Element implicitly has an 'any' type because expression of type 'X' can't be used to index type 'A | B'. Property 'Y' does not exist on type 'A'`.

**Causa:** Indexar objeto com tipo union (ex.: `OrgDocumentation | Record<string, unknown>`) usando chave que não existe em todos os membros da union. Ex.: `step_by_step` existe em `OrgActivityDocumentation` mas não em `OrgDocumentation`.

**NÃO fazer:**

```tsx
const keys = ['step_by_step', 'guidelines'] as const;
keys.filter((k) => doc[k] && typeof doc[k] === 'string');  // Erro: Property 'step_by_step' does not exist
```

**Fazer:**

```tsx
const keys = ['step_by_step', 'guidelines'] as const;
keys.filter((k) => {
  const v = (doc as Record<string, unknown>)[k];
  return v != null && typeof v === 'string';
});
```

**Regra:** Ao iterar chaves dinâmicas em objeto com union, usar cast para `Record<string, unknown>` antes de indexar.

---

### 3.8 Variáveis de ambiente ausentes

**Sintoma:** Build passa, mas runtime falha com `undefined` em env vars.

**Causa:** Variáveis obrigatórias não configuradas na Vercel.

**Solução:** Garantir que todas as variáveis em `.env.example` estejam configuradas no projeto Vercel. Nunca commitar secrets.

---

## 4. Checklist Pré-Push (Gate de Workflow)

Antes de `git push` ou abrir PR:

- [ ] `npm run lint` — sem erros
- [ ] `npm run typecheck` — sem erros
- [ ] `npm run test` — todos passando
- [ ] `npm run format:check` — sem warnings
- [ ] `npm run build` — build concluído com sucesso

**Script sugerido (package.json):**

```json
"predeploy": "npm run lint && npm run typecheck && npm run test && npm run format:check"
```

Nota: No PowerShell local, usar `;` em vez de `&&` se rodar manualmente.

---

## 5. Integração CI/CD

O workflow `.github/workflows/ci.yml` executa, em ordem:

1. Lint  
2. Typecheck  
3. Format check  
4. Tests  
5. Audit secrets  
6. RLS audit (quando secrets disponíveis)  
7. **Build**

Se qualquer etapa falhar, o job inteiro falha. O build na Vercel segue o mesmo padrão (`next build` inclui typecheck).

---

## 6. Política para Agentes AI

Este documento é **normativo** para agentes que implementam código:

1. **Antes de concluir uma alteração:** Rodar `npm run lint ; npm run typecheck ; npm run format:check` no mínimo.
2. **Ao editar arquivos:** Garantir que a formatação esteja correta (ou rodar `npm run format`).
3. **Ao usar `searchParams.get()` ou similares:** Aplicar fallback para `string` antes de passar a props que esperam `string | undefined`.
4. **Exceções:** Documentar na story com justificativa técnica.

---

## 7. EPIC 11: pgvector & Embedding Validation Gates

**Status:** 🟢 NEW (v0.2.4 — Semantic Search Support)

### 7.1 Database Migration Validation Gate

**Purpose:** Verify all 5 EPIC 11 migrations (066-070) and embedding extension (071) deploy correctly.

**Before Deployment:**

```bash
# 1. Verify pgvector extension enabled
npm run db:verify-extension -- vector

# 2. Check all migrations applied in order
supabase migration list
# Should show: 066, 067, 068, 069, 070, 071 (all status=success)

# 3. Validate schema via psql
supabase db pull --dry-run  # Compare local schema
```

**RLS Compliance Check (Critical):**

```sql
-- Story 11.1-11.5: Verify tenant_id isolation on all new tables
SELECT table_name, has_rls
FROM information_schema.tables t
LEFT JOIN pg_catalog.pg_tables pt ON t.table_name = pt.tablename
WHERE table_schema = 'public'
  AND table_name LIKE 'org_%'
  AND pt.tablename IS NOT NULL;

-- Expected: ALL org_* tables have RLS enabled = 'true'
-- Critical: If ANY row shows 'false' or NULL → FAIL DEPLOYMENT
```

**Migration Order Dependency Chain:**

```yaml
# Critical: Must apply in this order
- 066: org_activities.responsible_roles (prerequisite: org_activities exists)
  └─ Indexes: GIN on responsible_roles
- 067: org_activity_systems (prerequisite: org_activities, org_systems)
  └─ Junction table: activity_id + system_id (PK)
- 068: org_process_slas + org_process_metrics (prerequisite: org_processes)
  └─ Indexes: (tenant_id, process_id), (period_start, period_end)
- 069: org_role_definitions + org_role_permissions
  └─ Seed: 9 default roles injected per tenant
- 070: org_activity_templates + org_process_versions
  └─ Audit trail: append-only versioning
- 071: org_knowledge_entries.embedding (prerequisite: pgvector extension)
  └─ Index: IVFFlat with vector_cosine_ops
```

**Failure Modes & Recovery:**

| Failure | Root Cause | Recovery |
|---------|-----------|----------|
| Migration 066 fails | `org_activities` table doesn't exist | Check if base migrations (001-030) ran. Rollback to 065, reapply. |
| Migration 067 fails | Foreign key constraint on `org_systems` | Verify `org_systems` table created. Check referential integrity. |
| Migration 068 fails | Duplicate UNIQUE constraint | Check if `org_process_slas` already exists. Use `IF NOT EXISTS`. |
| Migration 069 fails | Seed INSERT conflicts | Tenants table mismatch. Verify all tenants have entries. |
| Migration 070 fails | Column type mismatch | `org_activity_complexity` enum may not exist. Check base schema. |
| Migration 071 fails | pgvector extension not found | Enable: `CREATE EXTENSION IF NOT EXISTS vector;` |

**Gate Passes When:**
- ✅ All 6 migrations (066-071) show status=success
- ✅ All `org_*` tables have RLS enabled = true
- ✅ `embedding_batch_log` table exists (071)
- ✅ IVFFlat index created on `embedding` column

---

### 7.2 RLS Policy Validation (Data Isolation)

**Purpose:** Ensure ADR-001 (tenant isolation) enforced on all EPIC 11 tables.

**Automated RLS Audit:**

```bash
# Run RLS policy tests
npm run test:rls

# Loads: supabase/tests/rls_policies.test.sql
# Tests each org_* table for tenant isolation
```

**Manual RLS Verification (pgSQL):**

```sql
-- Query: List all RLS policies on EPIC 11 tables
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  qual AS policy_expression
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN (
    'org_activities', 'org_activity_systems',
    'org_process_slas', 'org_process_metrics',
    'org_role_definitions', 'org_role_permissions',
    'org_activity_templates', 'org_process_versions',
    'org_knowledge_entries', 'embedding_batch_log'
  )
ORDER BY tablename, policyname;
```

**Expected RLS Pattern (All tables):**

```sql
-- SELECT policy (read isolation)
CREATE POLICY {table}_tenant_isolation ON public.{table}
  USING (tenant_id = (SELECT tenant_id FROM auth.users WHERE id = auth.uid()));

-- INSERT policy (write isolation)
CREATE POLICY {table}_insert ON public.{table}
  WITH CHECK (tenant_id = (SELECT tenant_id FROM auth.users WHERE id = auth.uid()));

-- UPDATE policy (write isolation)
CREATE POLICY {table}_update ON public.{table}
  USING (tenant_id = (SELECT tenant_id FROM auth.users WHERE id = auth.uid()))
  WITH CHECK (tenant_id = (SELECT tenant_id FROM auth.users WHERE id = auth.uid()));

-- DELETE policy (write isolation)
CREATE POLICY {table}_delete ON public.{table}
  USING (tenant_id = (SELECT tenant_id FROM auth.users WHERE id = auth.uid()));
```

**Test Case: Tenant Isolation**

```sql
-- Setup: Two tenants, two users
INSERT INTO tenants (id, name) VALUES ('tenant-a-uuid', 'Tenant A'), ('tenant-b-uuid', 'Tenant B');
INSERT INTO auth.users (id, tenant_id, email) VALUES ('user-a-uuid', 'tenant-a-uuid', 'a@example.com');
INSERT INTO auth.users (id, tenant_id, email) VALUES ('user-b-uuid', 'tenant-b-uuid', 'b@example.com');

-- Insert data
INSERT INTO org_activities (id, tenant_id, name) VALUES ('act-1', 'tenant-a-uuid', 'Activity A');
INSERT INTO org_activities (id, tenant_id, name) VALUES ('act-2', 'tenant-b-uuid', 'Activity B');

-- Test: User A selects only Activity A
SET jwt.claims = '{"sub": "user-a-uuid", "tenant_id": "tenant-a-uuid"}';
SELECT * FROM org_activities;
-- Expected: 1 row (Activity A only)
-- Failure: If 2 rows → RLS not working

-- Test: User B selects only Activity B
SET jwt.claims = '{"sub": "user-b-uuid", "tenant_id": "tenant-b-uuid"}';
SELECT * FROM org_activities;
-- Expected: 1 row (Activity B only)
```

**Failure Gate Triggers:**
- ❌ Any table WITHOUT RLS enabled
- ❌ RLS policies don't filter by tenant_id
- ❌ Service role bypass active in production (security risk)
- ❌ Test case shows cross-tenant data leak

---

### 7.3 Embedding Index Performance Gate

**Purpose:** Verify IVFFlat index created correctly and semantic search performs <200ms.

**Index Creation Validation:**

```sql
-- Check IVFFlat index exists and is valid
SELECT
  indexname,
  indexdef,
  idx_scan,
  idx_tup_read,
  idx_tup_fetch
FROM pg_stat_user_indexes
WHERE relname = 'org_knowledge_entries'
  AND indexname LIKE '%embedding%';

-- Expected:
-- indexname: idx_org_knowledge_entries_embedding
-- indexdef: CREATE INDEX ... USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100)
-- idx_scan: > 0 (if queries already ran)
```

**Performance Benchmark Test:**

```sql
-- Setup: Insert 1000 sample embeddings (vectors with dimension 1536)
INSERT INTO org_knowledge_entries (tenant_id, title, embedding)
SELECT
  'test-tenant-uuid' AS tenant_id,
  'Test Knowledge ' || i AS title,
  (array_agg(random()))[1:1536]::vector(1536) AS embedding
FROM generate_series(1, 1000) i
GROUP BY i;

-- Query: Semantic search latency
EXPLAIN ANALYZE
SELECT *
FROM org_knowledge_entries
WHERE tenant_id = 'test-tenant-uuid'
  AND embedding IS NOT NULL
ORDER BY embedding <=> (array_agg(random()))[1:1536]::vector(1536)
LIMIT 10;

-- Expected: Execution Time < 200ms
-- Warning: If > 500ms, tune ivfflat.probes or rebuild index
```

**Query Optimization Pattern (Production):**

```typescript
// Server action: Semantic search with tuning
export async function semanticSearchKnowledgeAction(
  query: string,
  options?: { limit?: number; minSimilarity?: number }
): Promise<OrgKnowledgeSearchResult[]> {
  const supabase = createClient();
  const queryEmbedding = await generateEmbedding(query);

  // Call RPC with IVFFlat index
  const { data, error } = await supabase.rpc(
    'search_knowledge_semantic',
    {
      query_embedding: queryEmbedding,
      tenant_id_param: tenantId,
      k: options?.limit ?? 10
    },
    {
      // Client-side optimization hint (future: Supabase may support)
      // probes: 10 (increase for better recall, decrease for speed)
    }
  );

  // Filter by minimum similarity threshold
  return (data || [])
    .filter(result => result.similarity_score >= (options?.minSimilarity ?? 0.5))
    .map(result => ({
      id: result.id,
      title: result.title,
      content: result.content,
      type: result.type,
      source_url: result.source_url,
      similarity_score: result.similarity_score
    }));
}
```

**Performance Gate Checklist:**

- ✅ IVFFlat index exists on `embedding` column
- ✅ Index parameter: `lists=100` (for ~100k+ rows)
- ✅ Semantic search RPC function created (`search_knowledge_semantic`)
- ✅ Query latency < 200ms (p95)
- ✅ Similarity score calculation: `(1 - (embedding <=> query))` returns [0, 1]
- ✅ Cosine distance metric confirmed: `vector_cosine_ops`

**Failure Recovery:**

```sql
-- If index corrupted or slow:
DROP INDEX IF EXISTS idx_org_knowledge_entries_embedding;

-- Recreate with tuning
CREATE INDEX CONCURRENTLY idx_org_knowledge_entries_embedding
ON public.org_knowledge_entries USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);

-- Monitor rebuild progress
SELECT
  schemaname, tablename, indexname,
  idx_scan, idx_tup_read, idx_tup_fetch
FROM pg_stat_user_indexes
WHERE indexname = 'idx_org_knowledge_entries_embedding';
```

---

### 7.4 Deployment Sequence Runbook (EPIC 11 v0.2.4)

**Timeline:** Deployment takes 30-45 minutes total

**Step 1: Pre-Deployment Validation (5 minutes)**

```bash
# 1. Verify all tests pass locally
npm run lint ; npm run typecheck ; npm run test

# 2. Verify build succeeds
npm run build

# 3. Check migrations are syntactically valid
supabase migration list --local

# Expected output:
# 066_add_responsible_roles_to_activities.sql ✓
# 067_create_activity_systems_junction.sql ✓
# 068_create_process_slas_and_metrics.sql ✓
# 069_create_role_permissions.sql ✓
# 070_create_activity_templates_and_process_versions.sql ✓
# (071_add_embeddings_to_knowledge_entries.sql - if ready)
```

**Step 2: Supabase Migration Application (10 minutes)**

```bash
# This is the CRITICAL step — no rollback possible after this without data loss

# Option A: Via Supabase CLI (recommended for DevOps)
supabase link --project-ref=<your-project-ref>
supabase db push

# Option B: Via Supabase Dashboard (if CLI unavailable)
# 1. Go to Supabase Dashboard → SQL Editor
# 2. Paste contents of migration 066_*.sql → Execute
# 3. Repeat for 067, 068, 069, 070
# 4. (Skip 071 until Story 11.11 is ready)

# Verification after each migration
SELECT migration FROM _supabase_migrations ORDER BY executed_at DESC LIMIT 6;
```

**Step 3: RLS Policy Verification (5 minutes)**

```bash
# Run automated RLS audit
npm run audit:rls

# Output should show:
# ✅ org_activities (066): RLS ENABLED, 4 policies (SELECT/INSERT/UPDATE/DELETE)
# ✅ org_activity_systems (067): RLS ENABLED, 4 policies
# ✅ org_process_slas (068): RLS ENABLED, 4 policies
# ✅ org_process_metrics (068): RLS ENABLED, 4 policies
# ✅ org_role_definitions (069): RLS ENABLED, 4 policies
# ✅ org_role_permissions (069): RLS ENABLED, 4 policies
# ✅ org_activity_templates (070): RLS ENABLED, 4 policies
# ✅ org_process_versions (070): RLS ENABLED, 4 policies

# If ANY shows ❌: STOP, do NOT proceed to Step 4. Contact @data-engineer.
```

**Step 4: Index Performance Verification (5 minutes)**

```bash
# Check all indexes created
psql $DATABASE_URL -c "
SELECT tablename, indexname
FROM pg_indexes
WHERE schemaname = 'public'
  AND tablename LIKE 'org_%'
ORDER BY tablename, indexname;
"

# Check index stats (if queries already ran)
psql $DATABASE_URL -c "
SELECT indexname, idx_scan, idx_tup_read, pg_size_pretty(pg_relation_size(indexrelid))
FROM pg_stat_user_indexes
WHERE relname LIKE 'org_%'
ORDER BY indexname;
"
```

**Step 5: Application Code Deployment (10 minutes)**

```bash
# Push to main branch (triggers CI/CD)
git push origin main

# Wait for GitHub Actions to complete
# Check: https://github.com/<org>/tech-arauz/actions

# GitHub Actions workflow runs:
# 1. npm run lint ✓
# 2. npm run typecheck ✓ (NEW: TypeScript types updated for new tables)
# 3. npm run test ✓
# 4. npm run format:check ✓
# 5. npm run audit:rls ✓ (uses SUPABASE_* secrets)
# 6. npm run build ✓

# If any step fails: STOP. Fix in code, push again.
```

**Step 6: Vercel Deployment (5 minutes)**

```bash
# Vercel automatically deploys from main branch
# Monitor: https://vercel.com/tech-arauz

# Expected:
# 1. Build starts automatically
# 2. Installs dependencies
# 3. Runs build command: npm run build
# 4. Deploys to production: https://tech-arauz.vercel.app

# Wait for "✅ Production" status

# If deployment fails:
# - Check Vercel logs for errors
# - Likely: environment variables missing (SUPABASE_URL, etc.)
# - Fix in Vercel project settings, re-trigger deployment
```

**Step 7: Smoke Tests (5 minutes)**

```bash
# 1. Login to https://tech-arauz.vercel.app
# 2. Navigate to Organizations → Activities
# 3. Create new activity: Click "Create Activity"
#    - Fill: Name, Description
#    - NEW FIELD: Responsible Roles (select from dropdown)
#    - Save
# 4. Navigate to new activity, verify:
#    - responsible_roles field displays correctly
#    - Can edit responsible roles
# 5. Navigate to Processes → select one → view metrics
#    - NEW FIELD: Process SLAs dashboard
#    - Should display target_duration, warning threshold
# 6. Check browser console (F12 → Console) for errors
#    - Should show NO red errors
#    - OK to have warnings (e.g., deprecated React warnings)
```

**Step 8: Post-Deployment Monitoring (ongoing)**

```bash
# Monitor database performance for 1 hour
psql $DATABASE_URL -c "
SELECT query, mean_exec_time, calls
FROM pg_stat_statements
WHERE mean_exec_time > 100
ORDER BY mean_exec_time DESC
LIMIT 10;
" | tee deployment_perf_baseline.txt

# Check application error logs
# Sentry: https://sentry.io/ (if configured)
# Vercel: https://vercel.com/tech-arauz → Deployments → Logs

# Expected: Zero critical errors, no RLS violations
```

### 7.5 Emergency Rollback Procedure (If Deployment Fails)

**ONLY if Step 3 (RLS verification) or later fails**

```bash
# WARNING: This is destructive. Only use if production is broken.

# Phase 1: Stop application deployment
# 1. If Vercel deployment in progress: Click "Rollback" button
# 2. Revert to previous commit: git revert HEAD
# 3. Push to main (triggers redeploy of previous code)

# Phase 2: Reverse migrations (if Step 3 failed)
# Create reverse migration files for each failed migration:

# Example: reverse migration for 066
cat > supabase/migrations/066_reverse_responsible_roles.sql << 'EOF'
-- Reverse Migration 066: Remove responsible_roles from org_activities

DROP INDEX IF EXISTS idx_org_activities_responsible_roles_gin;
ALTER TABLE public.org_activities DROP COLUMN responsible_roles;

DO $$
BEGIN
  RAISE NOTICE 'Reverse Migration 066: responsible_roles column removed ✓';
END$$;
EOF

# Then apply reverse migrations in reverse order:
supabase db push  # This applies 066_reverse_*, 067_reverse_*, etc.

# Phase 3: Verify rollback successful
supabase migration list
# Should show all _reverse_*.sql migrations as applied

# Phase 4: Redeploy application code pointing to old commit
git revert HEAD  # Creates new commit reverting the revert
git push origin main
```

**Escalation (If Rollback Also Fails):**
- Contact @architect (Aria) for schema review
- Contact @data-engineer (Dara) for RLS debug
- Last resort: Supabase dashboard → Backups → Restore to point-in-time

---

### 7.6 Coordination with @data-engineer (Dara)

**Before Deployment (1-2 days):**

```yaml
✅ @data-engineer validates:
   - All 5 migrations (066-070) tested locally
   - RLS policies cover all new tables
   - No circular foreign key references
   - Indexes created with correct parameters
   - Performance baseline established (queries < 200ms)
   - Rollback procedures documented
   - pgvector extension (071) ready if embedding story approved

✅ @data-engineer provides:
   - Migration validation checklist (attached to this doc)
   - RLS test results (pgTAP)
   - Performance benchmark results
   - Rollback migration files (reverse_*.sql)
```

**During Deployment:**

```yaml
✅ @devops (Gage) runs:
   - Migrations via supabase db push
   - RLS audit (npm run audit:rls)
   - Performance verification
   - Smoke tests

✅ @devops communicates to @data-engineer:
   - Step 3 RLS verification PASSED ✅
   - All index scans > 0 (indexes being used)
   - Query performance baseline acceptable
```

**Post-Deployment (If Issues):**

```yaml
❌ If RLS audit fails:
   - @devops: Do NOT proceed to Step 5
   - @data-engineer: Debug RLS policies immediately
   - Investigate: Policy syntax, tenant_id calculations, role assignments

❌ If performance degrades:
   - @devops: Monitor CPU/memory in Supabase dashboard
   - @data-engineer: Analyze slow queries, may need index tuning
   - Trigger: If any query > 500ms, rebuild problematic index

❌ If semantic search (Story 11.11) fails:
   - @devops: Check pgvector extension enabled
   - @data-engineer: Verify IVFFlat index parameters
   - Contact: AI embeddings team for embedding generation issues
```

---

## 8. Referências

| Documento | Conteúdo |
|-----------|----------|
| `docs/engineering/DEPENDENCY-MANAGEMENT.md` | EPIC 11 dependencies & pgvector setup |
| `docs/architecture/ORGANIZATION-SCHEMA.md` | Complete EPIC 11 schema (16 tables) |
| `docs/EPIC-11-EMBEDDINGS-TECHNICAL-SPECIFICATION.md` | Embedding implementation guide |
| `supabase/migrations/066-071` | All EPIC 11 schema migrations |
| `supabase/tests/rls_policies.test.sql` | RLS compliance tests |
| `docs/adr/ADR-001-row-level-security.md` | RLS design decision record |
| `configs/project.yaml` | quality_gates.order, shell_chain |
| `docs/architecture/module-standards.md` | Seção 13 — Type Safety |
| `docs/accessibility/component-a11y-guide.md` | Acessibilidade em componentes |
| `.github/workflows/ci.yml` | Pipeline CI |
