# Dependency Management — Package Governance (AIOX 10/10)

**Version:** 0.2.4 (EPIC 11 update)
**Status:** Policy & checklist
**Last Updated:** 2026-03-16
**Maintainer:** @data-engineer (Dara)

---

## Current Dependencies

**Major Versions (locked):**
- Next.js: 14.2.0
- React: 18.3.0
- TypeScript: 5.5.0
- Tailwind: 3.4.0
- Supabase: 2.45.0
- TanStack Query: 5.50.0

**Total:** 60+ dependencies

**Production Bundle Size:** ~185KB (gzipped)

---

## Update Strategy

- **Patch (0.0.x):** Auto-apply (security fixes)
- **Minor (0.x.0):** Review, apply if no breaking changes
- **Major (x.0.0):** Flag to @architect, only if necessary

---

## Security Scanning

```bash
npm audit
# → Shows vulnerabilities
# → Fix: npm audit fix

# Pre-commit hook runs npm audit
# Fails if critical vulnerabilities found
```

---

## Adding Dependencies

**Before adding:**
1. Is it necessary? (don't bloat bundle)
2. Is it maintained? (active commits, no security issues)
3. Size check: `npm bundle-report`

---

## EPIC 11: New Dependencies & Library Support

**Status:** 🟢 COMPLETE (v0.2.4 production ready)

### pgvector + Vector Search

**Purpose:** Semantic search on knowledge base via embeddings (Story 11.11)

**Database Extensions (Server-side):**
```sql
-- Enabled in Migration 071
CREATE EXTENSION IF NOT EXISTS vector;
```

**Dimension Configuration:**
- **Embedding Model:** OpenAI `text-embedding-3-small`
- **Dimension:** 1536 (standard for OpenAI)
- **Index Type:** IVFFlat with `vector_cosine_ops`
- **Lists:** 100 (optimal for 100k+ rows)
- **Similarity Metric:** Cosine distance

**Client Library:**
- No additional NPM package needed (Supabase `@supabase/supabase-js` v2.45.0 already supports vector queries via RPC)
- Vector operations handled via PostgreSQL RPC functions

**Example Query (Server Action):**
```typescript
// Step 1: Generate embedding via OpenAI API
const embedding = await generateEmbedding(queryText);

// Step 2: Call semantic search RPC
const { data } = await supabase.rpc('search_knowledge_semantic', {
  query_embedding: embedding,
  tenant_id_param: tenantId,
  k: 10
});
```

**Cost Optimization:**
- OpenAI `text-embedding-3-small`: $0.02 per 1M tokens
- Embeddings generated incrementally (Story 11.11 research phase)
- Batch job tracking table: `embedding_batch_log`

### Performance Tuning

**IVFFlat Index Parameters:**
```sql
-- Migration 071: org_knowledge_entries
CREATE INDEX idx_org_knowledge_entries_embedding
  ON public.org_knowledge_entries
  USING ivfflat (embedding vector_cosine_ops)
  WITH (lists = 100);
```

**Query Optimization (use in RPC functions):**
```sql
-- Recommended: Add SET local ivfflat.probes for query-time tuning
SET local ivfflat.probes = 10;
SELECT * FROM org_knowledge_entries
ORDER BY embedding <=> query_embedding
LIMIT k;
```

**Index Maintenance:**
- Monitor with: `ANALYZE public.org_knowledge_entries;`
- Rebuild if dataset > 1M rows or performance degrades
- Cost-benefit: Rebuild takes ~2-3 minutes per 100k rows

### Database Schema Changes (EPIC 11)

**Migration Summary:**
| Migration | Table | Purpose |
|-----------|-------|---------|
| 066 | `org_activities` | Add `responsible_roles JSONB` column |
| 067 | `org_activity_systems` | Junction table (Activity ↔ System) |
| 068 | `org_process_slas`, `org_process_metrics` | SLAs & performance tracking |
| 069 | `org_role_definitions`, `org_role_permissions` | RBAC governance |
| 070 | `org_activity_templates`, `org_process_versions` | Templates & version audit trail |
| 071 | `org_knowledge_entries` | Add `embedding vector(1536)` column |

**All migrations include:**
- ✅ RLS policies via `tenant_id` isolation (ADR-001)
- ✅ Performance indexes (GIN, composite keys, IVFFlat)
- ✅ Comprehensive column documentation
- ✅ Idempotent schema changes (`IF NOT EXISTS`)

### Library Versions (Verified)

**Supabase Stack:**
```json
{
  "@supabase/supabase-js": "^2.45.0",    // Supports vector RPC
  "@supabase/ssr": "^0.5.0"               // Server-side auth
}
```

**UI Component Library:**
```json
{
  "@radix-ui/react-*": "^1.x.x",         // Base components
  "shadcn/ui": "[custom]",                // Assembled in src/components/ui/
  "tailwindcss": "^3.4.0"                 // Styling
}
```

**State Management:**
```json
{
  "zustand": "^4.5.0",                    // Lightweight store
  "@tanstack/react-query": "^5.50.0"      // Server state sync
}
```

**Type Safety:**
```json
{
  "typescript": "^5.5.0",                 // Strict mode enabled
  "zod": "^3.23.0"                        // Runtime validation
}
```

### Dependency Compatibility Matrix

**Critical Breaking Changes Avoided:**
- ✅ Next.js 14.2.0 → 15.x would require `dynamic()` changes (DEFERRED)
- ✅ React 18.3.0 → 19.x would require server component updates (DEFERRED)
- ✅ TypeScript 5.5.0 → 6.x compatible but not urgent (MONITOR)

**Why EPIC 11 doesn't add new JS libraries:**
- pgvector operations via SQL (no client library needed)
- OpenAI embedding API called server-side only
- Semantic search UI uses existing Shadcn/Radix components
- Vector math handled by PostgreSQL

### Security Compliance

**npm audit Status (v0.2.4):**
```
0 vulnerabilities (critical=0, high=0, medium=0, low=0)
```

**Dependency Audit Checklist:**
- ✅ All production dependencies: latest minor/patch versions
- ✅ No deprecated packages (checked via npm registry)
- ✅ No transitive vulnerabilities (verified via `npm audit`)
- ✅ License compliance: MIT/Apache-2.0 only

**When to Update:**
1. Critical security patch released → Apply immediately
2. Known vulnerability in dependency → Apply within 24h
3. New minor version available → Review & test within 1 sprint
4. New major version available → @architect decides (usually defer 1-2 releases)

---

## Adding Dependencies — Decision Tree

```
┌─ Is it necessary?
│  ├─ YES: Does Supabase/Next.js provide it?
│  │  ├─ YES: Use built-in (save bundle)
│  │  └─ NO: Is there an actively maintained package?
│  │     ├─ YES: Check size & security, add to package.json
│  │     └─ NO: Build custom or defer
│  └─ NO: Don't add
```

**Example: pgvector**
- Necessary? YES (semantic search)
- Supabase provides? NO (PostgreSQL extension only)
- Client library? NO (use RPC + Supabase JS)
- Result: ✅ No new dependency needed

**Example: OpenAI embeddings**
- Necessary? YES (generate embeddings)
- Supabase provides? NO
- Client library? YES (`openai` package exists)
- Size impact? ~150KB (acceptable for server-side use)
- Bundled? NO (server-side only, not in client bundle)
- Result: ✅ Add if implementation required (currently in Story 11.11 research phase)

---

**Authored by:** @data-engineer (Dara), reviewed by @architect (Aria)
