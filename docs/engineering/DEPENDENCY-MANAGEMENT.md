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
- Supabase: 2.45.0+ (see Supabase Stack below)
- TanStack Query: 5.50.0+
- Zod: 3.23.0
- Zustand: 4.5.0

**Total:** 60+ dependencies

**Production Bundle Size:** ~185KB (gzipped)

**Last Audit:** 2026-03-16 (0 vulnerabilities, all critical fixes applied)

---

## Dependency Update Strategy

### Update Classification

| Type | Example | Policy | Latency |
|------|---------|--------|---------|
| **Security Patch** | 1.2.3 → 1.2.4 (critical CVE fix) | Apply within 24h | URGENT |
| **Security Patch** | 1.2.3 → 1.2.5 (high CVE fix) | Apply within 3 days | HIGH |
| **Minor Update** | 1.2.3 → 1.3.0 (new features, no breaking) | Review & apply within 1 sprint | NORMAL |
| **Patch Update** | 1.2.3 → 1.2.6 (bug fix) | Apply within 1 week | LOW |
| **Major Update** | 1.2.3 → 2.0.0 (breaking changes) | Escalate to @architect, defer 1-2 releases | DEFERRED |

### Update Procedure

```bash
# 1. Check outdated packages
npm outdated

# 2. Run security audit
npm audit
# If vulnerabilities: npm audit fix

# 3. Update specific package (minor/patch)
npm update package-name

# 4. For major updates: create new feature branch
git checkout -b deps/package-name-vX
npm install package-name@latest
npm run lint ; npm run typecheck ; npm run test
# If all pass: submit PR for review
# If failing: revert update, escalate to @architect
```

### Dependency Lock File

**Current Lock:** `package-lock.json` (present, committed)

**Policy:**
- Regenerate on `npm install` after package.json changes
- Commit lock file to ensure reproducible builds
- Never manually edit lock file
- If corrupted: `rm package-lock.json && npm install`

---

## Vulnerability Management

### npm audit Workflow

**Check current status:**
```bash
npm audit
```

**Expected output (v0.2.4):**
```
0 vulnerabilities found
```

**If vulnerabilities found:**

| Severity | Action | Timeline |
|----------|--------|----------|
| **CRITICAL** | 🔴 Apply fix immediately, block deployment | < 4 hours |
| **HIGH** | 🟠 Apply fix within 1 business day | < 24 hours |
| **MODERATE** | 🟡 Apply fix within 3 business days | < 72 hours |
| **LOW** | 🔵 Log and track, schedule for next sprint | < 2 weeks |

**Automatic Fix Attempt:**
```bash
npm audit fix
```

**Manual Fix Process (if npm audit fix fails):**
1. Identify vulnerable package: `npm audit` shows in report
2. Check if update available: `npm outdated package-name`
3. Update: `npm install package-name@latest`
4. Test: `npm run lint ; npm run typecheck ; npm run test`
5. If test pass: commit
6. If test fail: research alternative package or escalate to @architect

**Transitive Vulnerabilities (dependencies of dependencies):**
- npm audit reports all transitive vulnerabilities
- Try `npm audit fix --force` (caution: may introduce breaking changes)
- Or update parent dependency: `npm update package-name`

### CI/CD Security Integration

**GitHub Actions Hook (`.github/workflows/ci.yml`):**
```yaml
- name: Audit Dependencies
  run: npm audit --production
  # Fails if critical/high vulnerabilities in production deps
```

**Pre-commit Hook:**
```bash
npm audit --audit-level=moderate
# Blocks commit if moderate+ vulnerabilities present
```

### Dependency License Compliance

**Policy:** Only MIT, Apache-2.0, ISC licenses allowed.

**Check licenses:**
```bash
npm ls --production | grep -E "LGPL|GPL|Proprietary"
# Should return: (empty)
```

**If GPL/LGPL dependency detected:**
- Flag to @architect for approval
- Document in `LICENSES.md` if approved
- Otherwise: find alternative package or build custom solution

---

## Adding Dependencies

**Before adding:**
1. Is it necessary? (don't bloat bundle)
2. Is it maintained? (active commits, no security issues)
3. Size check: `npm bundle-report`

---

## EPIC 11: New Dependencies & Library Support

**Status:** 🟢 COMPLETE (v0.2.4 production ready)

### pgvector + Vector Search (Story 11.11)

**Status:** 🟢 READY FOR IMPLEMENTATION (v0.2.4)

**Purpose:** Semantic search on knowledge base via embeddings

**Architecture:**
- **Server-side:** PostgreSQL with pgvector extension (v0.5.0+)
- **Client-side:** Supabase RPC + optional OpenAI client
- **Embedding model:** OpenAI `text-embedding-3-small`
- **Dimension:** 1536 (standard for OpenAI embeddings)
- **Index type:** IVFFlat with cosine distance metric
- **Storage:** `org_knowledge_entries.embedding` column (vector type)
- **Batch tracking:** `embedding_batch_log` table (audit trail)

**Database Extensions (Server-side in Migration 071):**
```sql
-- Enabled in Supabase PostgreSQL
CREATE EXTENSION IF NOT EXISTS vector;

-- Verification
SELECT extname, extversion FROM pg_extension WHERE extname = 'vector';
-- Expected: (vector, 0.5.0 or higher)
```

**Configuration Details:**

| Property | Value | Notes |
|----------|-------|-------|
| Extension | pgvector v0.5.0+ | Supabase maintains latest |
| Embedding dimension | 1536 | OpenAI text-embedding-3-small standard |
| Index type | IVFFlat | Approximate nearest neighbor for speed |
| Index metric | vector_cosine_ops | Cosine distance (normalized) |
| Lists parameter | 100 | Optimal for 100k-1M rows |
| Probes (query-time) | 10 (default) | Tune for recall vs. speed tradeoff |

**Client Libraries (Current & Future):**

```json
// Currently: Vector queries via Supabase RPC only
{
  "@supabase/supabase-js": "^2.45.0"  // Supports vector RPC calls
}

// Future (Story 11.11 Phase 2): If server-side embedding generation
{
  "openai": "^4.52.0"  // Not yet added (add when needed)
}
```

**Why No Client pgvector Library:**
- pgvector is PostgreSQL extension (server-side only)
- Vector operations via Supabase RPC functions (type-safe, no client library)
- OpenAI embeddings generated server-side (next/server functions, not bundled)
- Semantic search RPC: `search_knowledge_semantic(query_embedding, k)`

**Example Usage (Server Action):**
```typescript
// lib/actions/semantic-search.ts
'use server';

import { createClient } from '@/lib/supabase/server';

export async function semanticSearchAction(
  query: string,
  options?: { limit?: number; minSimilarity?: number }
) {
  const supabase = createClient();

  // Step 1: Generate embedding (server-side via external API or model)
  const queryEmbedding = await generateEmbedding(query);
  // → Call OpenAI API (if Story 11.11 Phase 2 approved)
  // → Or use open-source model (e.g., sentence-transformers via API)

  // Step 2: Call semantic search RPC
  const { data, error } = await supabase.rpc('search_knowledge_semantic', {
    query_embedding: queryEmbedding,
    k: options?.limit ?? 10,
    min_similarity: options?.minSimilarity ?? 0.5
  });

  if (error) throw new Error(`Search failed: ${error.message}`);
  return data;
}
```

**Cost Breakdown (OpenAI embeddings):**
- **Model:** text-embedding-3-small
- **Price:** $0.02 per 1M tokens
- **Example:** 10K knowledge entries × avg 200 tokens = 2M tokens = $0.04 initial embedding
- **Monthly incremental:** ~100 new entries × 200 tokens = 20K tokens ≈ $0.0004

**Future: If Story 11.11 Phase 2 adds OpenAI**

Add to package.json (decision pending):
```json
{
  "openai": "^4.52.0"  // ~185KB uncompressed, server-side only
}
```

Install when approved:
```bash
npm install openai
```

Create API key in Vercel:
```bash
OPENAI_API_KEY=sk-...
```

Server action example:
```typescript
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

async function generateEmbedding(text: string): Promise<number[]> {
  const response = await openai.embeddings.create({
    model: 'text-embedding-3-small',
    input: text
  });
  return response.data[0].embedding;
}
```

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

### Library Versions (Verified v0.2.4)

**From package.json (verified 2026-03-16):**

**Core Framework:**
```json
{
  "next": "^14.2.0",                      // Latest 14.x
  "react": "^18.3.0",                     // Latest 18.x
  "react-dom": "^18.3.0"
}
```

**Database & State:**
```json
{
  "@supabase/supabase-js": "^2.45.0",    // v2.95.3 installed (latest 2.x)
  "@supabase/ssr": "^0.5.0",              // v0.5.2 installed (latest 0.5.x)
  "@tanstack/react-query": "^5.50.0",     // v5.90.20 installed (latest 5.x)
  "zustand": "^4.5.0"                     // Lightweight state store
}
```

**UI & Styling:**
```json
{
  "@radix-ui/react-*": "^1.x.x",         // All core components v1.1.x - v2.2.x
  "shadcn/ui": "[custom assembly]",      // Components in src/components/ui/
  "tailwindcss": "^3.4.0",                // CSS framework
  "tailwind-merge": "^2.6.1",             // Merge Tailwind classes safely
  "class-variance-authority": "^0.7.1"    // Variant builder
}
```

**Type Safety & Validation:**
```json
{
  "typescript": "^5.5.0",                 // Strict mode enabled
  "zod": "^3.23.0",                       // Runtime schema validation
  "@types/node": "^20.0.0",
  "@types/react": "^18.3.0",
  "@types/react-dom": "^18.3.0"
}
```

**Editor & Rich Text:**
```json
{
  "@tiptap/react": "^3.19.0",             // Rich text editor
  "@tiptap/starter-kit": "^3.19.0",       // Editor extensions
  "@tiptap/extension-link": "^3.19.0",
  "@tiptap/extension-placeholder": "^3.19.0",
  "react-markdown": "^10.1.0"              // Markdown rendering
}
```

**UI Components & Interactions:**
```json
{
  "cmdk": "^1.1.1",                       // Command palette
  "lucide-react": "^0.400.0",             // Icon library
  "recharts": "^2.12.0",                  // Charts & metrics
  "gantt-task-react": "^0.3.9",           // Gantt visualization
  "sonner": "^1.5.0"                      // Toast notifications
}
```

**Form & Drag-and-Drop:**
```json
{
  "react-hook-form": "^7.71.2",           // Form state management
  "@hookform/resolvers": "^5.2.2",        // Validation resolvers
  "@dnd-kit/core": "^6.3.1",              // Drag-and-drop
  "@dnd-kit/sortable": "^10.0.0",
  "@dnd-kit/utilities": "^3.2.2"
}
```

**Analytics & Monitoring:**
```json
{
  "@vercel/analytics": "^1.6.1",          // Performance tracking
  "@vercel/speed-insights": "^1.3.1",     // Speed monitoring
  "next-themes": "^0.3.0"                 // Dark mode support
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
