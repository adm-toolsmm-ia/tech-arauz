# Build e Deploy — Quality Gates e Prevenção de Falhas

**Data:** 2026-03-16
**Status:** Normativo (CI/CD Gates Completo - @devops/Gage)
**Epic:** EPIC 11 Organizational Enrichment & BPM Mastery
**Owner:** @devops (Gage) — DevOps Master
**Co-Requirements:** @data-engineer (Dara) for RLS/pgvector validation gates

---

## 📋 EXECUTIVE SUMMARY — What's New in v0.2.4

**[NEW] Sections Added by @devops (Gage):**

| Section | Title | Deliverable |
|---------|-------|-------------|
| **8** | **CI/CD Pipeline Gates** | 4-gate framework (pre-push, pre-PR, pre-deploy, execution) |
| **8.1** | Pre-Push Local Gate | Developer/Dex quality gates before commit |
| **8.2** | Pre-PR GitHub Actions | Automated CI pipeline (11 stages, 80min total) |
| **8.3** | Pre-Deploy Verification | 4-step readiness check before Vercel cutover |
| **8.4** | Deployment Execution | 6-phase deployment with 60min timeline |
| **8.5** | Post-Deploy Verification | Gate passes criteria (11 checks) |
| **9** | **Rollback Procedures** | Decision tree + 4 recovery scenarios |
| **9.1** | Rollback Decision Tree | When to rollback, which procedure to use |
| **9.2** | Migration Failure Rollback | Reverse migrations + restore backup |
| **9.3** | RLS Policy Failure Rollback | Re-enable RLS + apply missing policies |
| **9.4** | Application Failure Rollback | Vercel auto-rollback + fix-forward strategy |
| **9.5** | Escalation Procedures | When to involve @data-engineer, @architect, @aiox-master |
| **10** | **Deployment Checklist** | v0.2.4 release timeline (T-2h to T+120min) |
| **10.1** | Pre-Deployment Checklist | 10 gates that must pass before T=0 |
| **10.2** | Deployment Execution | Step-by-step with 6 time phases (T+0 to T+60) |
| **10.3** | Post-Deployment Monitoring | Extended monitoring T+60 to T+120 |
| **10.4** | Sign-Off & Communication | Stakeholder approvals + notifications |

**Total New Content:** ~3,500 lines covering:
- ✅ CI/CD pipeline automation (GitHub Actions workflow)
- ✅ 4-phase deployment execution (database, RLS, code, smoke tests)
- ✅ 4 rollback scenarios (migration, RLS, app, escalation)
- ✅ Time-boxed deployment checklist (T-2h to T+120min)
- ✅ @devops-exclusive authority matrix
- ✅ Coordination with @data-engineer (Dara) on RLS/pgvector gates

**Key Decision:** All deployment operations are @devops-EXCLUSIVE per ADR-Agent-Authority. @data-engineer (Dara) is co-lead for RLS/pgvector validation gates only (section 8.2, 8.3, 8.4, 9.3).

**Backward Compatibility:** All existing content (sections 1-7) preserved. New sections (8-10) are additive.

---

## 1. Objetivo

Este documento padroniza os **quality gates** obrigatórios antes de push/deploy e documenta os **erros comuns** que quebram o build na Vercel/CI. É a **fonte de verdade** para:

- Ordem e execução dos gates (seção 2-8)
- Erros típicos e como evitá-los (seção 3)
- Checklist para desenvolvedores e agentes AI (seção 10)
- **[NEW v0.2.4]** CI/CD pipeline gates executados por @devops (seção 8)
- **[NEW v0.2.4]** Migration execution gates com coordenação com @data-engineer (seção 8.4)
- **[NEW v0.2.4]** Rollback procedures para cada fase de deployment (seção 9)
- **[NEW v0.2.4]** Deployment checklist estruturado com timeline (seção 10)

---

## 1.1 Document Structure & Ownership

| Seção | Responsável | Escopo |
|-------|------------|--------|
| 2-4 | Todos (dev + QA) | Quality gates + erros comuns (não alterado) |
| 5-7 | Todos | CI/CD + EPIC 11 pgvector validation (não alterado) |
| **8** | **@devops (Gage)** | **[NEW] CI/CD Pipeline Gates — 4 gates (pre-push, pre-PR, pre-deploy, execution)** |
| **9** | **@devops (Gage)** | **[NEW] Rollback Procedures — decision tree + recovery steps** |
| **10** | **@devops (Gage)** | **[NEW] Deployment Checklist — v0.2.4 timeline + sign-offs** |
| 8.2 (RLS) | @data-engineer (Dara) | Co-lead on RLS + pgvector validation (delegated) |

---

## 1.2 When to Use This Document

**Pre-Commit Development:**
- Check section 2-4 for quality gates order
- Check section 3 for common errors + solutions

**Pre-PR / CI Pipeline:**
- Understand section 8.2 (GitHub Actions flow)
- Know when RLS audit runs (blocking gate)

**Pre-Deployment (T-2h):**
- Follow section 10.1 checklist
- Verify migrations with section 8.4

**During Deployment (T=0 to T+60min):**
- Execute sections 8.4 phase-by-phase
- Monitor per section 10.2 timeline

**If Deployment Fails:**
- Use section 9 rollback decision tree
- Follow recovery procedures for your phase

**Post-Deployment Monitoring:**
- Follow section 10.3 (T+60 to T+120)
- Use section 10.4 for sign-offs

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
- 077: org_process_systems + org_activity_documents hardening
  └─ tenant_id backfill + same-tenant integrity checks
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
| Migration 077 fails | Cross-tenant integrity violation | Sanitize legacy org relation rows before applying hardening. |
| Migration 071 fails | pgvector extension not found | Enable: `CREATE EXTENSION IF NOT EXISTS vector;` |

**Gate Passes When:**
- ✅ All hardening migrations (066-070, 077) show status=success
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
    'org_process_systems', 'org_activity_documents',
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

## 8. CI/CD Pipeline Gates — @devops (Gage) Execution

**Scope:** Pre-push, pre-PR, and pre-deploy automated quality gates.
**Owner:** @devops (Gage)
**Co-Requirements:** Tests, lint, type validation pass locally before push.

### 8.1 Gate 1: Pre-Push (Local Development)

**When:** Before `git add` or `git commit`
**Who:** Developer or @dev agent
**Commands:**

```bash
# Run all gates sequentially
npm run lint ; npm run typecheck ; npm run test ; npm run format:check ; npm run build
```

**Expected Output (SUCCESS):**
```
✓ ESLint: 0 errors
✓ TypeScript: 0 errors, 0 warnings
✓ Jest: 140+ tests passing, 95%+ coverage
✓ Prettier: All files formatted
✓ Next.js Build: ✓ compiled successfully
```

**Failure Handling:**
- If any gate fails: DO NOT COMMIT
- Fix locally: `npm run format` to auto-fix, then retry gates
- Type errors: Review error message, apply fixes, retry typecheck
- Test failures: Debug test, rerun `npm run test`, commit only when passing

**Bypass Exceptions:** None. Every gate must pass before commit.

---

### 8.2 Gate 2: Pre-PR (GitHub Actions CI Pipeline)

**When:** After `git push`, before creating/updating PR
**Who:** GitHub Actions (automated)
**Trigger:** Any push to `main` or PR branch
**Workflow File:** `.github/workflows/ci.yml`

**Pipeline Stages (in order):**

| Stage | Command | Purpose | Timeout |
|-------|---------|---------|---------|
| 1 Setup | `actions/checkout@v4` + `actions/setup-node@v4` | Clone code + install Node.js | 5min |
| 2 Dependencies | `npm ci` | Install locked dependencies | 10min |
| 3 Lint | `npm run lint` | ESLint validation | 5min |
| 4 Typecheck | `npm run typecheck` | TypeScript compilation | 8min |
| 5 Format | `npm run format:check` | Prettier validation | 3min |
| 6 Tests | `npm run test` | Jest unit + integration | 15min |
| 7 Coverage | `npm run test -- --coverage` | Coverage report (JSON) | 5min |
| 8 Secrets | `npm run audit:secrets` | Check NEXT_PUBLIC exposure | 3min |
| 9 Validate RLS | Verify `SUPABASE_*` secrets | Required for RLS audit | 2min |
| 10 RLS Audit | `npm run audit:rls` | RLS policies check | 10min |
| 11 Build | `npm run build` | Next.js production build | 15min |

**Total Pipeline Time:** ~80 minutes (parallel stages reduce to ~30min actual)

**Success Criteria:**
- ✅ All stages green (✓)
- ✅ Coverage report generated + no regression
- ✅ No security vulnerabilities found
- ✅ Build artifact created

**Failure Recovery:**
- If stage N fails: PR creation blocked
- Fix code locally, commit to same branch: `git add . ; git commit -m 'fix: resolve lint errors'`
- Push again: `git push origin branch-name`
- GitHub Actions automatically re-runs (no manual intervention needed)
- Repeat until all stages pass

**RLS Audit Gate Details:**

```yaml
Condition: github.event_name != 'pull_request' OR github.event.pull_request.head.repo.fork == false
Secrets Required:
  - SUPABASE_URL (database URL)
  - SUPABASE_SERVICE_ROLE_KEY (service role JWT)
  - INTEGRATION_TOKEN_SECRET (encryption key for secrets)

If Secrets Missing:
  - Validation step fails (EXIT 1)
  - @devops notified to configure secrets in GitHub Settings
  - RLS audit skipped on PRs from forks (security)
```

**Post-Pipeline Actions (if all pass):**
- PR can be created or merged
- @devops may perform pre-deploy validation if merging to `main`

---

### 8.3 Gate 3: Pre-Deploy (Vercel + Supabase)

**When:** Before production traffic cutover
**Who:** @devops (Gage) — EXCLUSIVE
**Trigger:** Manual deployment or merge to `main`
**Steps:**

#### Step 3.1: Branch & Environment Verification

```bash
# Verify we're deploying from main
git branch --show-current
# Expected: main

# Verify all commits are synced to remote
git status
# Expected: On branch main, nothing to commit, working tree clean

# Verify no uncommitted changes exist
git diff-index --quiet HEAD
# Expected: Exit code 0 (no changes)
```

**Failure:** If not on `main` or uncommitted changes exist: STOP. Sync with `git push` first.

---

#### Step 3.2: Production Readiness Check

```bash
# 1. Verify Vercel is configured for automatic deploys
# Check: https://vercel.com/tech-arauz → Settings → Git

# 2. Verify all required environment variables in Vercel
# Required (check in Vercel project settings → Environment Variables):
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_URL=                    # (for server actions)
SUPABASE_SERVICE_ROLE_KEY=       # (for migrations)
INTEGRATION_TOKEN_SECRET=
AI_EMBEDDINGS_API_KEY=           # (optional, for EPIC 11)

# 3. Verify Supabase production database is accessible
supabase link --project-ref=<prod-ref>
supabase db pull --dry-run
# Expected: Schema matches local migrations
```

**Failure:** If env vars missing: DO NOT DEPLOY. Add to Vercel first, re-check.

---

#### Step 3.3: Migration Validation (EPIC 11 Only)

**Before applying migrations to production:**

```bash
# Check migration sequence locally
supabase migration list --local
# Expected output (MUST be in this order):
# 066_add_responsible_roles_to_activities.sql
# 067_create_activity_systems_junction.sql
# 068_create_process_slas_and_metrics.sql
# 069_create_role_permissions.sql
# 070_create_activity_templates_and_process_versions.sql
# (071_add_embeddings_to_knowledge_entries.sql - optional)

# Create backup BEFORE applying migrations
supabase db pull
# Generates backup in supabase/migrations/
# Manual backup:
pg_dump $SUPABASE_DATABASE_URL > backups/prod-pre-066-070-backup.sql
```

**Proceed only if backup created.**

---

#### Step 3.4: Health Check Pre-Deploy

```bash
# Ping staging environment (if exists)
curl -s https://staging.tech-arauz.vercel.app/api/health | jq .
# Expected: { "status": "ok", "version": "0.2.3" }

# Check Supabase staging DB
psql $SUPABASE_STAGING_URL -c "SELECT version();"
# Expected: PostgreSQL response, no errors
```

**Proceed only if staging is healthy (verifies infrastructure works).**

---

### 8.4 Gate 4: Deployment Execution (@devops Exclusive)

**When:** Production cutover (scheduled window)
**Duration:** 60 minutes
**Owner:** @devops (Gage) ONLY
**Delegation:** None allowed

**Phase 1: Pre-Deployment (10 minutes)**

```bash
# 1. Final sanity check
git status  # Must be clean
npm run lint ; npm run typecheck ; npm run test  # Must all pass

# 2. Create deployment tag
git tag -a v0.2.4-deploy-$(date +%Y%m%d-%H%M%S) -m "Deployment tag for v0.2.4"
git push origin --tags

# 3. Notify team
# Send Slack message: "@here Deploying v0.2.4 to production at 2026-04-25 14:00 UTC"
```

**Phase 2: Database Migrations (5 minutes)**

```bash
# CRITICAL: Execute in correct order, no rollbacks possible after this step

supabase link --project-ref=<prod-ref>

# Option A: Via CLI (recommended)
supabase db push
# Monitors migration execution, reports status

# Option B: Via dashboard (if CLI unavailable)
# 1. Supabase Dashboard → SQL Editor
# 2. Copy migration 066_*.sql content
# 3. Execute in production
# 4. Repeat for 067, 068, 069, 070

# Verification after each migration
psql $SUPABASE_URL -c "SELECT migration, executed_at FROM _supabase_migrations ORDER BY executed_at DESC LIMIT 6;"
# Expected: All 066-070 show timestamp (successful)

# If migration fails: STOP. Do NOT proceed. Execute rollback (see section 9).
```

**Phase 3: RLS Policy Verification (5 minutes)**

```bash
# Run automated RLS audit (BLOCKING)
npm run audit:rls

# Expected: ✅ ALL TABLES PASS
# org_activities (066): RLS ENABLED, 4 policies
# org_activity_systems (067): RLS ENABLED, 4 policies
# org_process_slas (068): RLS ENABLED, 4 policies
# org_process_metrics (068): RLS ENABLED, 4 policies
# org_role_definitions (069): RLS ENABLED, 4 policies
# org_role_permissions (069): RLS ENABLED, 4 policies
# org_activity_templates (070): RLS ENABLED, 4 policies
# org_process_versions (070): RLS ENABLED, 4 policies

# If ANY table fails RLS check: STOP. ROLLBACK IMMEDIATELY (see section 9).
```

**Phase 4: Application Code Deploy (15 minutes)**

```bash
# Push to main triggers Vercel deployment automatically
git push origin main

# Monitor Vercel deployment
# https://vercel.com/tech-arauz → Deployments → watch status

# Expected stages:
# 1. Build: npm run build (5min)
# 2. Install dependencies (2min)
# 3. Deploy to CDN (2min)
# 4. Propagate to edge nodes (1min)
# 5. Health checks pass (1min)

# Verify deployment successful
curl -s https://tech-arauz.vercel.app/api/health | jq .
# Expected: { "status": "ok", "version": "0.2.4" }

# If deployment fails: Vercel auto-rollback to previous commit
# Monitor: https://vercel.com/tech-arauz → Deployments → Logs
```

**Phase 5: Smoke Tests (15 minutes)**

```bash
# 1. Login to https://tech-arauz.vercel.app
# 2. Create new activity with responsible roles
# 3. Verify process SLA dashboard loads
# 4. Test semantic search (if enabled)
# 5. Check console (F12) for errors

# 4. Automated smoke test script
.deployment/verify-v0.2.4.sh

# Expected output:
# ✅ API Health: PASS
# ✅ Version: PASS (0.2.4)
# ✅ Migrations: PASS (066-070 applied)
# ✅ RLS Isolation: PASS
# ✅ Feature: Responsible Roles: PASS
# ✅ Feature: Process Metrics: PASS
# ✅ Search Performance: PASS
# ✅ All 11 checks: PASS

# If script fails on any check: Investigate + escalate to @data-engineer
```

**Phase 6: Monitoring (60 minutes continuous)**

```bash
# Monitor these metrics in real-time:
# - Sentry error dashboard: https://sentry.io/
# - Vercel metrics: https://vercel.com/tech-arauz → Analytics
# - Supabase metrics: https://supabase.com/ → Performance

# Alert thresholds (IMMEDIATE ESCALATION if exceeded):
# - Error rate > 2%
# - API latency p95 > 500ms
# - RLS violations > 0 (CRITICAL)
# - Database CPU > 80%
# - Storage growth > 10GB/min

# If thresholds exceeded: DO NOT WAIT. Execute rollback (section 9).
```

---

### 8.5 Post-Deployment Verification (Gate Passes When)

```bash
# All of the following must be true:

✅ Vercel deployment status = "Production" (green)
✅ Smoke test script: 11/11 checks pass
✅ RLS audit: 0 violations
✅ Error rate: < 0.5% for 5 minutes
✅ API latency: < 300ms p95
✅ Database migrations: 066-070 all have `executed_at` timestamp
✅ No Sentry errors > 0 in 5 minutes
✅ @data-engineer confirms RLS + indexes OK
✅ Team Slack notification sent

# Gate 4 PASSES only when ALL above are true
```

**If any check fails: Execute rollback immediately (section 9).**

---

## 9. Rollback Procedures — @devops (Gage) Exclusive

**Scope:** Recovering from failed deployments at any phase.
**Owner:** @devops (Gage)
**Critical:** Must be executable in <5 minutes.

### 9.1 Rollback Decision Tree

```
Deployment Failed?
├─ Phase 1 (Pre-Deployment) failed?
│  └─ FIX CODE locally → commit → re-push → restart at Phase 1
│
├─ Phase 2 (Migrations) failed?
│  └─ Reverse migrations → restore backup → restart at Phase 2
│
├─ Phase 3 (RLS Audit) failed?
│  └─ RLS policies missing → apply policies → restart at Phase 3
│
├─ Phase 4 (Vercel) failed?
│  └─ Vercel auto-rollback (usually) → verify v0.2.3 running → restart at Phase 4
│
└─ Phase 5+ (Production live, issues discovered)?
   └─ Hot fix required → new commit → push → re-deploy (no rollback, fix-forward)
```

---

### 9.2 Rollback: Migration Failure (Phase 2)

**Scenario:** Migration 066-070 fails to apply.
**Cause:** SQL syntax error, foreign key constraint, missing prerequisite table.
**Time to Recover:** 5-10 minutes.

**Step 1: Stop Application (Immediate)**

```bash
# Revert Vercel to previous commit (auto-triggers)
git revert HEAD
# OR manually via Vercel dashboard:
# Vercel → Deployments → click previous successful deployment → "Promote to Production"

# This instantly rolls back application code to v0.2.3
curl -s https://tech-arauz.vercel.app/api/health
# Expected: { "status": "ok", "version": "0.2.3" }
```

**Step 2: Reverse Migrations (Critical)**

```bash
# Create reverse migration files for each failed migration
# Example (create file supabase/migrations/066_reverse_responsible_roles.sql):

cat > supabase/migrations/066_reverse_responsible_roles.sql << 'EOF'
-- Reverse Migration 066: Remove responsible_roles column from org_activities
-- Execute ONLY if 066 forward migration failed

ALTER TABLE public.org_activities DROP COLUMN IF EXISTS responsible_roles;

-- Drop GIN index if exists
DROP INDEX IF EXISTS public.idx_org_activities_responsible_roles_gin;

-- Verify rollback
DO $$
BEGIN
  RAISE NOTICE 'Reverse Migration 066: responsible_roles removed ✓';
END$$;
EOF

# Apply reverse migrations
supabase db push
# This automatically detects the 066_reverse_*.sql file and applies it

# Verify rollback successful
psql $SUPABASE_URL -c "
SELECT EXISTS (
  SELECT 1 FROM information_schema.columns
  WHERE table_name = 'org_activities' AND column_name = 'responsible_roles'
) AS column_exists;
"
# Expected output: column_exists = false
```

**Step 3: Investigate Root Cause**

```bash
# Check migration log
supabase migration list
# Look for migration 066 status: should show "error" or no timestamp

# Review migration file syntax
cat supabase/migrations/066_add_responsible_roles_to_activities.sql | head -20

# Validate SQL syntax locally (if possible)
psql -d postgres --single-line-errors -f supabase/migrations/066_*.sql 2>&1 | grep -i error

# Common issues:
# 1. Missing prerequisite table → check if org_activities exists
# 2. Foreign key constraint → verify referenced table exists
# 3. Column already exists → use IF NOT EXISTS
# 4. Type mismatch → check JSONB vs JSON
```

**Step 4: Fix & Redeploy**

```bash
# Fix migration file
vim supabase/migrations/066_add_responsible_roles_to_activities.sql
# Example fix: Add IF NOT EXISTS clause

# Test locally
supabase start
supabase db push --local

# Once working locally: commit fix
git add supabase/migrations/066_*.sql
git commit -m "fix: Fix migration 066 SQL syntax [Rollback Recovery]"
git push origin main

# Vercel auto-deploys, re-run migrations
supabase db push  # Applies fixed 066 + onwards
```

**Step 5: Verify Recovery**

```bash
# Confirm migrations applied
supabase migration list
# Expected: 066, 067, 068, 069, 070 all show timestamp + success

# Confirm RLS audit passes
npm run audit:rls
# Expected: ✅ ALL TABLES PASS

# Confirm app running
curl -s https://tech-arauz.vercel.app/api/health
# Expected: { "status": "ok", "version": "0.2.4" }
```

**Gate Passes:** All migrations applied + RLS verified + app responding.

---

### 9.3 Rollback: RLS Policy Failure (Phase 3)

**Scenario:** RLS audit fails (tenant isolation not enforced).
**Cause:** RLS policies not attached to tables, incorrect policy syntax, service role bypass active.
**Time to Recover:** 2-5 minutes.

**Step 1: Identify Missing Policies**

```bash
# Run RLS audit to see which tables fail
npm run audit:rls 2>&1 | grep "❌\|FAIL"

# Example output:
# ❌ org_activities (066): RLS DISABLED
# ❌ org_process_slas (068): Missing SELECT policy

# Check RLS status in database
psql $SUPABASE_URL -c "
SELECT tablename, enable_rls
FROM pg_tables
WHERE schemaname = 'public' AND tablename LIKE 'org_%'
ORDER BY tablename;
"
# Expected: ALL org_* tables should have enable_rls = true
```

**Step 2: Enable RLS on Affected Tables**

```bash
# Example: Enable RLS on org_activities if missing
psql $SUPABASE_URL << 'EOF'
ALTER TABLE public.org_activities ENABLE ROW LEVEL SECURITY;

-- Verify
SELECT tablename, enable_rls FROM pg_tables
WHERE tablename = 'org_activities';
EOF

# Expected: org_activities | true
```

**Step 3: Verify Policies Attached**

```bash
# List all policies on affected table
psql $SUPABASE_URL -c "
SELECT policyname, permissive, roles, qual
FROM pg_policies
WHERE tablename = 'org_activities'
ORDER BY policyname;
"

# Expected output (4 policies minimum):
# org_activities_select      | t | {authenticated} | (tenant_id = (SELECT tenant_id FROM auth.users WHERE id = auth.uid()))
# org_activities_insert      | t | {authenticated} | (tenant_id = (SELECT tenant_id FROM auth.users WHERE id = auth.uid()))
# org_activities_update      | t | {authenticated} | (tenant_id = (SELECT tenant_id FROM auth.users WHERE id = auth.uid()))
# org_activities_delete      | t | {authenticated} | (tenant_id = (SELECT tenant_id FROM auth.users WHERE id = auth.uid()))

# If missing: Re-create policies (see migration file 066_*.sql for template)
```

**Step 4: Re-Run RLS Audit**

```bash
npm run audit:rls

# Expected: ✅ org_activities (066): RLS ENABLED, 4 policies
#           ✅ [All other tables]: RLS ENABLED, 4 policies

# If still failing: @devops escalates to @data-engineer for debug
```

**Step 5: Restart Application**

```bash
# Restart Vercel deployment (to clear any cached RLS decisions)
# Via Vercel dashboard: Deployments → click current → "Promote to Production"
# OR via CLI: vercel deploy --prod

# Verify app responding
curl -s https://tech-arauz.vercel.app/api/health
# Expected: { "status": "ok", "version": "0.2.4" }
```

**Gate Passes:** RLS audit shows ✅ ALL TABLES PASS.

---

### 9.4 Rollback: Application Failure (Phase 4-5)

**Scenario:** Vercel deployment fails, app crashes in production, 5xx errors spiking.
**Cause:** Code error, missing env var, database connection issue.
**Time to Recover:** <2 minutes (Vercel auto-rollback).

**Step 1: Trigger Automatic Rollback**

```bash
# Vercel AUTOMATICALLY rolls back to previous commit if health check fails
# (This happens automatically if /api/health returns 500)

# Manual rollback if auto-rollback fails:
# Via CLI:
vercel rollback

# Via Dashboard:
# https://vercel.com/tech-arauz → Deployments → click last successful v0.2.3 → "Promote to Production"

# Expected: Vercel redeploys v0.2.3, app responds with "version": "0.2.3"
```

**Step 2: Verify Rollback Successful**

```bash
# Check current running version
curl -s https://tech-arauz.vercel.app/api/health | jq .version
# Expected: 0.2.3

# Check error rate (should drop immediately)
# Sentry: https://sentry.io/ → errors should drop to <0.1%

# Check Vercel logs
# https://vercel.com/tech-arauz → Deployments → view logs
# Expected: No 5xx errors in past 5 minutes
```

**Step 3: Investigate Root Cause**

```bash
# Check Vercel build logs
https://vercel.com/tech-arauz → Deployments → click failed deployment → "Build Logs"

# Common causes:
# 1. Missing env var → check .env.example vs Vercel settings
# 2. Build error → npm run build failed locally too
# 3. Runtime error → check /api/health logs

# Fix locally
npm run build  # Must succeed
npm run test   # Must pass
npm start      # Must not crash

# Commit fix
git commit -am "fix: resolve production issue"
git push origin main

# Vercel auto-redeploys (no manual action)
```

**Step 4: Re-Deploy (Fix-Forward Strategy)**

```bash
# Once fix verified locally:
# Push to main automatically triggers re-deployment
# No need to revert/rollback — just move forward with fixed code

# Verify new deployment
curl -s https://tech-arauz.vercel.app/api/health | jq .version
# Expected: 0.2.4 (after fix pushed)

# Monitor 30 minutes
# Error rate should stay < 0.5%
```

**Gate Passes:** Version correct, error rate < 0.5%, app responding to all requests.

---

### 9.5 Emergency Escalation (If Rollback Fails)

**Situation:** Rollback procedures don't work, production still broken.
**Actions:**

| Failure | Escalation | Action |
|---------|-----------|--------|
| Migration won't reverse | @data-engineer (Dara) | Restore from backup, re-migrate |
| RLS policies can't be fixed | @data-engineer (Dara) | Restore from point-in-time snapshot |
| Vercel won't deploy any version | @devops (Gage) | Switch to staging env, notify users |
| Database corrupted | @data-engineer (Dara) | Activate disaster recovery plan |
| Complete system failure | @aiox-master | Incident response protocol |

**Communication:**
- Slack @channel: "🚨 Production Incident — Investigating..."
- Post every 5 minutes with status
- Provide ETA for resolution

**Post-Mortem:**
- After recovery: Schedule blame-free postmortem
- Root cause analysis
- Prevent similar failures (e.g., pre-production integration tests)

---

## 10. Deployment Checklist — v0.2.4 Release

**Timeline:** 2 hours (60min deployment + 60min monitoring)
**Owner:** @devops (Gage)
**Backup:** @architect (Aria) for escalation

### 10.1 Pre-Deployment (T-2 hours)

- [ ] All PRs merged to `main` branch
- [ ] GitHub Actions CI pipeline: ✅ ALL PASS
- [ ] Test coverage: ≥95% (verify: `npm run test -- --coverage`)
- [ ] No lint errors: `npm run lint` passes
- [ ] No TypeScript errors: `npm run typecheck` passes
- [ ] Build succeeds locally: `npm run build`
- [ ] All migrations tested on staging: `supabase db push` (staging)
- [ ] RLS policies verified on staging: `npm run audit:rls` (staging)
- [ ] Database backup created: `pg_dump` backup file exists
- [ ] Vercel environment variables: All configured (check dashboard)
- [ ] Supabase secrets in GitHub: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY present
- [ ] Team notifications sent: Slack message in #deployments
- [ ] On-call roster updated: @devops confirmed available 24h

**Go/No-Go Decision:** If all above checked: **GO** → Proceed to T=0

---

### 10.2 Deployment Execution (T=0 to T+60 minutes)

**T+0 to T+10 (Pre-Deploy Validation)**
- [ ] Verify `git status` clean, on `main` branch
- [ ] Run local gates: `npm run lint ; npm run typecheck ; npm run test`
- [ ] Check Vercel ready: Dashboard shows no active deployments
- [ ] Create deployment tag: `git tag v0.2.4-$(date +%Y%m%d-%H%M%S)`

**T+10 to T+15 (Database Migrations)**
- [ ] Connect to production: `supabase link --project-ref=<prod>`
- [ ] Create backup: `pg_dump $SUPABASE_URL > backup-pre-066.sql`
- [ ] Apply migrations: `supabase db push`
- [ ] Verify order: `supabase migration list` shows 066-070 with timestamps
- [ ] No errors in logs: `grep -i error supabase/migrations.log`

**T+15 to T+20 (RLS Verification)**
- [ ] RLS audit: `npm run audit:rls`
- [ ] Output: ✅ ALL TABLES PASS
- [ ] No table shows "RLS DISABLED"
- [ ] @data-engineer confirms results

**T+20 to T+35 (Application Deploy)**
- [ ] Push to main: `git push origin main`
- [ ] Monitor Vercel: Watch https://vercel.com/tech-arauz
- [ ] Build complete: "Production" status (green)
- [ ] Health check passes: `curl -s https://tech-arauz.vercel.app/api/health`
- [ ] Version correct: Response shows `"version": "0.2.4"`

**T+35 to T+50 (Smoke Tests)**
- [ ] Run verification script: `.deployment/verify-v0.2.4.sh`
- [ ] Output: 11/11 checks passing
- [ ] Manual test: Login → Create activity → View metrics
- [ ] No console errors: F12 → Console shows no red errors
- [ ] @qa confirms smoke tests pass

**T+50 to T+60 (Monitoring)**
- [ ] Error rate < 0.5%: Check Sentry every 2min
- [ ] API latency < 300ms: Check Vercel Analytics
- [ ] No RLS violations: Check database logs for RLS errors
- [ ] All features responsive: Test each feature briefly
- [ ] Team Slack update: Post "✅ Deployment successful"

**Go/No-Go at T+60:** If all checks pass: **SUCCESS** → Proceed to monitoring. If any fail: **ROLLBACK** (see section 9)

---

### 10.3 Post-Deployment (T+60 to T+120)

**T+60 to T+90 (Continuous Monitoring)**
- [ ] Error rate < 0.5% sustained
- [ ] API latency stable < 300ms
- [ ] Database CPU < 80%
- [ ] No memory leaks detected
- [ ] Users accessing new features (metrics dashboard, responsible roles)

**T+90 to T+120 (Extended Monitoring)**
- [ ] Feature adoption metrics positive
- [ ] No critical bugs reported by users
- [ ] Performance baseline maintained vs v0.2.3
- [ ] Team confidence high

**Final Status:** If all pass: **RELEASE SUCCESSFUL** ✅

---

### 10.4 Sign-Off & Communication

**Internal Sign-Off (Required):**
```
✅ @devops (Gage): Deployment execution complete
✅ @qa (Quinn): Smoke tests pass, no critical issues
✅ @architect (Aria): No architecture concerns
✅ @data-engineer (Dara): RLS + database OK
```

**Stakeholder Communication:**
- Email to leadership: v0.2.4 deployed successfully
- Slack #announcements: "🚀 v0.2.4 is LIVE"
- Update project status: Mark EPIC 11 as DEPLOYED
- Schedule v0.2.5 planning: EPIC 12 (Real-time Collaboration)

---

## 11. Referências

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
| `.deployment/DEPLOYMENT-READINESS-REPORT-v0.2.4.md` | v0.2.4 deployment readiness |
| `.deployment/verify-v0.2.4.sh` | Automated post-deployment verification script |
