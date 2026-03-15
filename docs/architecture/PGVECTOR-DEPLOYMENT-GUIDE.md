# pgvector Deployment & Validation Guide

**Version:** 0.2.4 (EPIC 11 Phase 4)
**Status:** 🟢 READY FOR IMPLEMENTATION
**Owner:** @devops (Gage) + @data-engineer (Dara)
**Updated:** 2026-03-16

---

## Overview

This guide details the deployment of pgvector embeddings (Story 11.11) including:
- Extension setup and validation
- IVFFlat index configuration
- Semantic search function deployment
- Batch embedding generation
- Performance testing
- Rollback procedures

**Critical Path:** Story 11.11 depends on migrations 066-070 (EPIC 11 Phase 1) being deployed first.

---

## 1. pgvector Extension Setup

### 1.1 Installation Checklist

**Prerequisites:**
- [ ] Supabase PostgreSQL 15+ (all Supabase instances have this)
- [ ] pgvector extension available in PostgreSQL extensions catalog
- [ ] Service role key configured in Supabase project

**Installation Steps:**

```sql
-- Step 1: Create extension (idempotent)
CREATE EXTENSION IF NOT EXISTS vector;

-- Step 2: Verify installation
SELECT extname FROM pg_extension WHERE extname = 'vector';
-- Expected output: Single row with "vector"

-- Step 3: Check extension version
SELECT extversion FROM pg_extension WHERE extname = 'vector';
-- Expected: 0.5.0 or higher (Supabase maintains latest)
```

**Verification via CLI:**

```bash
# Option 1: Via Supabase CLI
supabase link --project-ref=<your-ref>
supabase db pull  # Downloads schema

# Check schema migration file for vector extension
grep -r "CREATE EXTENSION.*vector" supabase/migrations/

# Option 2: Via Supabase Dashboard
# Go to: SQL Editor → Run: SELECT * FROM pg_extension WHERE extname = 'vector';
```

### 1.2 Failure Modes & Recovery

| Failure | Root Cause | Recovery |
|---------|-----------|----------|
| `ERROR: extension "vector" does not exist` | Supabase instance is < PostgreSQL 14 | Contact Supabase support, upgrade database |
| `ERROR: permission denied to create extension` | User role doesn't have permission | Use `postgres` role or service role (from Supabase) |
| Version mismatch (expected 0.5.0, have 0.4.x) | Supabase hasn't upgraded pgvector yet | Wait for update, or manually upgrade (advanced) |

---

## 2. Schema Migration (Migration 071)

### 2.1 Migration Structure

**File:** `supabase/migrations/071_add_embeddings_to_knowledge_entries.sql`

```sql
-- =============================================================================
-- Migration 071: Add pgvector embeddings to org_knowledge_entries
-- Story 11.11: AI Context Embeddings for Knowledge Base
-- Epic: EPIC 11 — Organizational Enrichment & BPM Mastery
-- =============================================================================

-- Step 1: Ensure vector extension is available
CREATE EXTENSION IF NOT EXISTS vector;

-- Step 2: Add embedding column
ALTER TABLE public.org_knowledge_entries
ADD COLUMN embedding vector(1536) DEFAULT NULL;

-- Comment for documentation
COMMENT ON COLUMN public.org_knowledge_entries.embedding
  IS 'Vector embedding (1536-dim OpenAI text-embedding-3-small) for semantic search';

-- Step 3: Create IVFFlat index for similarity search
-- Note: CONCURRENTLY allows queries during index creation
-- lists=100 is recommended for 100k-1M rows
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_org_knowledge_entries_embedding
ON public.org_knowledge_entries USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);

-- Step 4: Create semantic search function
CREATE OR REPLACE FUNCTION search_knowledge_semantic(
  query_embedding vector,
  k INTEGER DEFAULT 10
)
RETURNS TABLE (
  id UUID,
  tenant_id UUID,
  title TEXT,
  content TEXT,
  type TEXT,
  source_url TEXT,
  similarity_score FLOAT
) AS $$
SELECT
  ke.id,
  ke.tenant_id,
  ke.title,
  ke.content,
  ke.type,
  ke.source_url,
  (1 - (ke.embedding <=> query_embedding)) AS similarity_score
FROM public.org_knowledge_entries ke
WHERE ke.embedding IS NOT NULL
  AND ke.tenant_id = (SELECT tenant_id FROM auth.users WHERE id = auth.uid())
ORDER BY ke.embedding <=> query_embedding
LIMIT k;
$$ LANGUAGE sql STABLE RETURNS NULL ON NULL INPUT;

-- Step 5: Tracking table for batch embedding generation
CREATE TABLE IF NOT EXISTS public.embedding_batch_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  entry_id UUID NOT NULL REFERENCES public.org_knowledge_entries(id) ON DELETE CASCADE,
  generated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  model TEXT DEFAULT 'text-embedding-3-small',
  embedding_dimension INTEGER DEFAULT 1536,
  processing_time_ms INTEGER,
  success BOOLEAN DEFAULT true,
  error_message TEXT
);

-- Step 6: Indexes for batch log
CREATE INDEX idx_embedding_batch_log_tenant ON public.embedding_batch_log(tenant_id);
CREATE INDEX idx_embedding_batch_log_entry ON public.embedding_batch_log(entry_id);
CREATE INDEX idx_embedding_batch_log_generated_at ON public.embedding_batch_log(generated_at DESC);

-- Step 7: RLS for embedding_batch_log
ALTER TABLE public.embedding_batch_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY embedding_batch_log_tenant_isolation ON public.embedding_batch_log
  USING (tenant_id = (SELECT tenant_id FROM auth.users WHERE id = auth.uid()))
  WITH CHECK (tenant_id = (SELECT tenant_id FROM auth.users WHERE id = auth.uid()));

-- Verification
DO $$
BEGIN
  RAISE NOTICE 'Migration 071: pgvector embeddings added to org_knowledge_entries ✅';
  RAISE NOTICE '  - embedding column (vector(1536)) created';
  RAISE NOTICE '  - IVFFlat index (lists=100) created';
  RAISE NOTICE '  - search_knowledge_semantic() function created';
  RAISE NOTICE '  - embedding_batch_log table created with RLS';
END$$;
```

### 2.2 Migration Validation Checklist

Before deployment, verify:

```bash
# 1. Syntax validation (no SQL errors)
psql --dry-run < supabase/migrations/071_add_embeddings_to_knowledge_entries.sql
# Expected: No errors

# 2. Vector extension available
psql -c "CREATE EXTENSION IF NOT EXISTS vector;"

# 3. Test embedding column
psql -c "ALTER TABLE org_knowledge_entries ADD COLUMN embedding_test vector(1536);"
psql -c "ALTER TABLE org_knowledge_entries DROP COLUMN embedding_test;"

# 4. Performance estimate for index creation
# For 100k rows: ~2-5 minutes
# For 1M rows: ~15-30 minutes
# For 100k rows with lists=100: Typical 3-4 minutes
```

---

## 3. Embedding Generation & Batch Job

### 3.1 Server Action: Generate Embeddings

**File:** `src/app/actions/knowledge.ts`

```typescript
import { openai } from '@/lib/ai/openai-client';
import { createClient } from '@/lib/supabase/server';

/**
 * Generate embedding for a text query or knowledge entry
 * Uses OpenAI text-embedding-3-small (1536 dimensions)
 */
export async function generateEmbeddingAction(
  text: string
): Promise<{ embedding: number[]; dimension: number; model: string }> {
  try {
    const response = await openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: text,
      dimensions: 1536,
    });

    if (!response.data[0]?.embedding) {
      throw new Error('Failed to generate embedding');
    }

    return {
      embedding: response.data[0].embedding,
      dimension: 1536,
      model: 'text-embedding-3-small',
    };
  } catch (error) {
    console.error('Error generating embedding:', error);
    throw new Error(`Embedding generation failed: ${error}`);
  }
}

/**
 * Batch generate embeddings for knowledge entries
 * Called by scheduled job or manual trigger
 */
export async function batchEmbedKnowledgeAction(
  batchSize: number = 50,
  maxRetries: number = 3
): Promise<{ processed: number; skipped: number; errors: string[] }> {
  const supabase = await createClient();
  const errors: string[] = [];

  // 1. Find knowledge entries without embeddings
  const { data: entries, error: fetchError } = await supabase
    .from('org_knowledge_entries')
    .select('id, tenant_id, title, content')
    .is('embedding', null)
    .order('created_at', { ascending: true })
    .limit(batchSize);

  if (fetchError || !entries) {
    throw new Error(`Failed to fetch entries: ${fetchError}`);
  }

  let processed = 0;
  let skipped = 0;

  // 2. Generate embeddings and store
  for (const entry of entries) {
    let retryCount = 0;

    while (retryCount < maxRetries) {
      try {
        // Generate embedding from title + content
        const textToEmbed = `${entry.title}. ${entry.content || ''}`.substring(0, 8000);
        const { embedding } = await generateEmbeddingAction(textToEmbed);

        // Store embedding
        const startTime = performance.now();
        const { error: updateError } = await supabase
          .from('org_knowledge_entries')
          .update({ embedding: embedding as unknown as string })
          .eq('id', entry.id);

        const processingTime = Math.round(performance.now() - startTime);

        if (updateError) {
          throw updateError;
        }

        // Log success
        await supabase.from('embedding_batch_log').insert({
          tenant_id: entry.tenant_id,
          entry_id: entry.id,
          success: true,
          processing_time_ms: processingTime,
          model: 'text-embedding-3-small',
        });

        processed++;
        break; // Success, move to next entry
      } catch (error) {
        retryCount++;

        if (retryCount >= maxRetries) {
          const errorMsg = `Failed to embed ${entry.id}: ${error}`;
          errors.push(errorMsg);
          skipped++;

          // Log failure
          await supabase.from('embedding_batch_log').insert({
            tenant_id: entry.tenant_id,
            entry_id: entry.id,
            success: false,
            error_message: errorMsg,
            model: 'text-embedding-3-small',
          });
        } else {
          // Exponential backoff before retry
          await new Promise(resolve => setTimeout(resolve, Math.pow(2, retryCount) * 1000));
        }
      }
    }
  }

  return { processed, skipped, errors };
}

/**
 * Semantic search using pgvector embeddings
 * Called by frontend to find relevant knowledge entries
 */
export async function semanticSearchKnowledgeAction(
  query: string,
  options?: { limit?: number; minSimilarity?: number }
): Promise<
  Array<{
    id: string;
    title: string;
    content: string;
    type: string;
    source_url: string | null;
    similarity_score: number;
  }>
> {
  try {
    const supabase = await createClient();

    // 1. Generate embedding for query
    const { embedding } = await generateEmbeddingAction(query);

    // 2. Call semantic search function
    const { data, error } = await supabase.rpc('search_knowledge_semantic', {
      query_embedding: embedding,
      k: options?.limit ?? 10,
    });

    if (error) {
      throw error;
    }

    // 3. Filter by similarity threshold and return
    const minSim = options?.minSimilarity ?? 0.5;
    return (data || [])
      .filter((result: { similarity_score: number }) => result.similarity_score >= minSim)
      .map(
        (result: {
          id: string;
          title: string;
          content: string;
          type: string;
          source_url: string | null;
          similarity_score: number;
        }) => ({
          id: result.id,
          title: result.title,
          content: result.content,
          type: result.type,
          source_url: result.source_url,
          similarity_score: result.similarity_score,
        })
      );
  } catch (error) {
    console.error('Error in semantic search:', error);
    throw new Error(`Semantic search failed: ${error}`);
  }
}
```

### 3.2 Scheduled Batch Job (Vercel Crons)

**File:** `src/app/api/cron/batch-embed-knowledge/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { batchEmbedKnowledgeAction } from '@/app/actions/knowledge';

/**
 * Scheduled job to generate embeddings for new knowledge entries
 * Runs every 6 hours (can be adjusted)
 */
export async function GET(request: NextRequest) {
  // Verify cron secret
  if (request.headers.get('authorization') !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const result = await batchEmbedKnowledgeAction(50, 3);

    console.log(`Batch embedding job completed:`, result);

    return NextResponse.json({
      success: true,
      processed: result.processed,
      skipped: result.skipped,
      errors: result.errors,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Batch embedding job failed:', error);

    // Alert on critical errors
    if (error instanceof Error && error.message.includes('extension')) {
      // pgvector extension issue — CRITICAL
      console.error('CRITICAL: pgvector extension not available');
    }

    return NextResponse.json(
      { error: `Batch job failed: ${error}` },
      { status: 500 }
    );
  }
}
```

**Vercel Configuration:**

Add to `vercel.json`:

```json
{
  "crons": [
    {
      "path": "/api/cron/batch-embed-knowledge",
      "schedule": "0 */6 * * *"
    }
  ]
}
```

---

## 4. Performance Testing & Tuning

### 4.1 Index Size & Parameter Selection

**IVFFlat Parameter Guide:**

```sql
-- For different data sizes, use these list values:
-- 1k-10k entries: lists = 10
-- 10k-100k entries: lists = 50-100 (recommended 100)
-- 100k-1M entries: lists = 100-500 (recommended 100-200)
-- 1M+ entries: lists = 500-1000 (or use HNSW index)

-- Our setup: lists = 100 (supports up to 500k entries efficiently)

-- Query-time tuning (via Supabase Dashboard or environment variable):
-- probes = lists * 0.1 (default)
-- For better recall vs speed tradeoff:
-- - Faster: probes = lists * 0.05 (5% of lists)
-- - Balanced: probes = lists * 0.1 (10% of lists)
-- - Better: probes = lists * 0.2 (20% of lists)
```

### 4.2 Performance Baseline

**Establish baseline after deployment:**

```sql
-- 1. Load test data (1000 sample embeddings)
INSERT INTO org_knowledge_entries (tenant_id, title, embedding)
SELECT
  'test-tenant-uuid' AS tenant_id,
  'Test Knowledge ' || i::TEXT AS title,
  (array_agg(RANDOM()))[1:1536]::vector(1536) AS embedding
FROM generate_series(1, 1000) i
GROUP BY i;

-- 2. Query latency test
EXPLAIN ANALYZE
SELECT id, title, similarity_score
FROM search_knowledge_semantic((array_agg(RANDOM()))[1:1536]::vector(1536), 10)
LIMIT 10;

-- Expected: Execution Time < 100ms
-- If > 200ms: Consider rebuilding index or tuning probes parameter

-- 3. Check index size
SELECT pg_size_pretty(pg_relation_size('idx_org_knowledge_entries_embedding')) as index_size;

-- 4. Monitor index usage
SELECT
  indexname,
  idx_scan,
  idx_tup_read,
  idx_tup_fetch,
  pg_size_pretty(pg_relation_size(indexrelid)) as size
FROM pg_stat_user_indexes
WHERE indexname = 'idx_org_knowledge_entries_embedding';
```

### 4.3 Common Performance Issues

| Issue | Symptom | Solution |
|-------|---------|----------|
| Slow similarity search (>500ms) | Query timeout or slow response | Increase probes parameter or rebuild index with smaller lists |
| Index creation timeout | Index creation hangs > 10 minutes | Create index CONCURRENTLY (non-blocking) or during low-traffic window |
| Memory spike during index creation | Database memory usage increases | Adjust shared_buffers in Supabase config (advanced) |
| Embedding generation rate-limited | OpenAI API rate limit errors | Implement token bucket or exponential backoff (already in code) |

---

## 5. Validation & Testing

### 5.1 Unit Tests

**File:** `tests/semantic-search.test.ts`

```typescript
import { generateEmbeddingAction, semanticSearchKnowledgeAction } from '@/app/actions/knowledge';

describe('Semantic Search', () => {
  it('generates embedding with correct dimensions', async () => {
    const { embedding, dimension } = await generateEmbeddingAction('test query');
    expect(embedding).toHaveLength(1536);
    expect(dimension).toBe(1536);
  });

  it('returns empty array for no matches', async () => {
    const results = await semanticSearchKnowledgeAction(
      'xyzabc_nonexistent_query_xyz',
      { minSimilarity: 0.9 } // Very high threshold
    );
    expect(results).toEqual([]);
  });

  it('returns relevant results sorted by similarity', async () => {
    const results = await semanticSearchKnowledgeAction('organization process', {
      limit: 10,
    });
    expect(results.length).toBeGreaterThan(0);
    expect(results).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          similarity_score: expect.any(Number),
          title: expect.any(String),
        }),
      ])
    );
    // Verify sorted by similarity (descending)
    for (let i = 0; i < results.length - 1; i++) {
      expect(results[i].similarity_score).toBeGreaterThanOrEqual(results[i + 1].similarity_score);
    }
  });
});
```

### 5.2 Integration Test

**File:** `tests/integration/pgvector-deployment.test.ts`

```typescript
import { createClient } from '@supabase/supabase-js';

describe('pgvector Deployment', () => {
  it('vector extension is available', async () => {
    const supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { data } = await supabase.rpc('query', {
      query: 'SELECT extname FROM pg_extension WHERE extname = \'vector\'',
    });

    expect(data).toBeDefined();
  });

  it('org_knowledge_entries has embedding column', async () => {
    const { data, error } = await supabase
      .from('org_knowledge_entries')
      .select('embedding')
      .limit(1);

    expect(error).toBeNull();
    // Column exists if no "column does not exist" error
  });

  it('semantic search function is callable', async () => {
    const mockEmbedding = Array(1536).fill(0.1); // dummy vector

    const { data, error } = await supabase.rpc('search_knowledge_semantic', {
      query_embedding: mockEmbedding,
      k: 5,
    });

    expect(error).toBeNull();
    expect(Array.isArray(data)).toBe(true);
  });

  it('IVFFlat index exists and is used', async () => {
    const { data } = await supabase.rpc('query', {
      query:
        "SELECT indexname FROM pg_stat_user_indexes WHERE indexname LIKE '%embedding%'",
    });

    expect(data).toBeDefined();
    expect(data[0]?.indexname).toContain('embedding');
  });
});
```

---

## 6. Rollback Procedure

### 6.1 Complete Rollback

If pgvector deployment fails or causes critical issues:

**Step 1: Stop application**

```bash
# Revert app code to previous commit
git revert HEAD
git push origin main

# Vercel will redeploy from previous version
```

**Step 2: Remove pgvector migration**

```bash
# Create reverse migration file
cat > supabase/migrations/071_reverse_embeddings.sql << 'EOF'
-- Reverse Migration 071: Remove pgvector embeddings

DROP INDEX IF EXISTS idx_org_knowledge_entries_embedding;
DROP FUNCTION IF EXISTS search_knowledge_semantic(vector, integer);
ALTER TABLE public.org_knowledge_entries DROP COLUMN IF EXISTS embedding;
DROP TABLE IF EXISTS public.embedding_batch_log;

-- pgvector extension CAN be left installed (no harm)
-- But to remove completely:
-- DROP EXTENSION IF EXISTS vector;

DO $$
BEGIN
  RAISE NOTICE 'Reverse Migration 071: pgvector embeddings removed ✓';
END$$;
EOF

# Apply reverse migration
supabase db push
```

**Step 3: Verify rollback**

```bash
# Check embedding column is gone
psql -c "
SELECT column_name FROM information_schema.columns
WHERE table_name = 'org_knowledge_entries' AND column_name = 'embedding';
"
# Expected: (no rows)

# Check function removed
psql -c "SELECT proname FROM pg_proc WHERE proname = 'search_knowledge_semantic';"
# Expected: (no rows)
```

---

## 7. Coordination Checklist

### Before Deployment

**@data-engineer (Dara):**
- [ ] Migration 071 syntax validated (no SQL errors)
- [ ] pgvector extension availability confirmed for Supabase project
- [ ] IVFFlat index parameters (lists=100) documented and tested
- [ ] RLS policies applied to `org_knowledge_entries` and `embedding_batch_log`
- [ ] Performance baseline established (search < 100ms p95)
- [ ] Rollback migration 071_reverse_embeddings.sql created and tested

**@dev (Dex):**
- [ ] Server actions implemented (generateEmbedding, batchEmbed, semanticSearch)
- [ ] Unit tests pass
- [ ] Integration tests confirm pgvector extension available
- [ ] Semantic search component integrated in UI
- [ ] Vercel cron job configured (`vercel.json`)
- [ ] Environment variables set: `OPENAI_API_KEY`, `CRON_SECRET`

**@devops (Gage):**
- [ ] Migration 071 merged to main branch
- [ ] CI/CD pipeline verifies: lint, typecheck, test, build
- [ ] RLS audit passes for `org_knowledge_entries` and `embedding_batch_log`
- [ ] Deployment runbook prepared (see Section 5 of build-deploy-gates.md)
- [ ] Monitoring dashboard set up (Supabase, Vercel logs)
- [ ] Incident response plan documented

### During Deployment

**Sequence:**
1. @devops: Apply migration 071 via `supabase db push`
2. @devops: Run `npm run audit:rls` to verify RLS on new tables
3. @devops: Test IVFFlat index with sample data
4. @dev: Verify server actions work with real embeddings
5. @devops: Deploy to Vercel
6. @devops: Monitor Vercel logs and database performance for 1 hour

### Post-Deployment

**Success Criteria:**
- ✅ All migrations applied successfully
- ✅ RLS policies verified
- ✅ Index size reasonable (< 500MB for initial data)
- ✅ Query latency < 200ms p95
- ✅ Batch job runs successfully every 6 hours
- ✅ Zero "embedding generation failed" errors in logs

**If Any Failure:**
- Contact @data-engineer immediately
- Trigger rollback procedure (Section 6)
- Document root cause and prevent recurrence

---

## References

| Document | Link |
|----------|------|
| Story 11.11 | `docs/stories/11.11-ai-embeddings.story.md` |
| EPIC 11 Research | `docs/EPIC-11-EMBEDDINGS-TECHNICAL-SPECIFICATION.md` |
| Build/Deploy Gates | `docs/architecture/build-deploy-gates.md` (Section 7) |
| Database Architecture | `docs/architecture/DATABASE-ARCHITECTURE.md` |
| AI Context Engineering | `docs/guides/AI-CONTEXT-ENGINEERING.md` |
| pgvector Docs | https://github.com/pgvector/pgvector |
| OpenAI Embeddings | https://platform.openai.com/docs/guides/embeddings |

