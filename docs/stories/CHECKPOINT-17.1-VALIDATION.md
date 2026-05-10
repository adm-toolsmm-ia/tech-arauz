# CHECKPOINT 17.1 Validation — Graph Data API + Database Schema

**Story:** 17.1 — Graph Data API + Database Schema Extensions
**Status:** 🚀 READY FOR ADMIN VALIDATION
**Branch:** `feat/epic17-graph-api` (now merged to `main`)
**Commit:** Latest on `main`
**Deployment:** Vercel (automatic on main)
**Timeline:** ~12 hours implementation complete

---

## 📋 What Was Implemented

### Database Layer (Migrations 075-076)

✅ **Migration 075** — Schema enhancements:
- Enhanced `documents` table with:
  - `reading_time_minutes` — auto-calculated from content length (1500 chars = 1 min)
  - `tags TEXT[]` — array of document tags
  - `summary TEXT` — short document summary
  - `view_count INTEGER` — view tracking
  - `cover_image_url TEXT` — optional cover image
  - `search_vector TSVECTOR` — full-text search index (Portuguese, maintained by trigger)

- Created `document_entity_links` table:
  - Links documents to org entities (areas, processes, activities, systems, skills, etc.)
  - Full RLS isolation via `tenant_id = get_user_tenant_id()`
  - Unique constraint: one link per document-entity-type-entity_id

✅ **Migration 076** — Graph aggregation function:
- PostgreSQL function: `get_knowledge_graph(p_tenant_id UUID) → JSON`
- Aggregates 7 entity types (area, nucleus, process, routine, activity, system, document)
- Aggregates all relationships (contains, uses, references)
- Returns `{ nodes: [...], links: [...], generatedAt: "..." }`
- SECURITY DEFINER with tenant isolation check

### API Layer (4 new routes)

✅ **`GET /api/knowledge/graph`**
- Returns full knowledge graph JSON
- Caches for 60 seconds (fast for heavy queries)
- 401 if unauthenticated
- RLS enforced via PostgreSQL function

✅ **`GET /api/knowledge/documents`**
- Paginated document list (default 10, max 50 per request)
- Filters:
  - `?category=manual|regra_negocio|arquitetura|guia`
  - `?search=termo` — full-text Portuguese search
  - `?tags=tag1,tag2` — array filter
  - `?sort=recent|popular` — order by created_at or view_count
  - `?limit=20&cursor=...` — keyset pagination
- Returns: `{ documents: [...], total: N, nextCursor: "...", hasMore: boolean }`
- RLS: only published documents visible

✅ **`POST /api/knowledge/documents/[id]/view`**
- Increments `view_count` atomically
- Idempotent (safe to call multiple times)
- Returns: `{ success: true, viewCount: N }`

✅ **`GET /api/knowledge/documents/[id]/related`**
- Returns up to 6 related documents
- Strategy 1: Documents sharing entity links (from `document_entity_links`)
- Strategy 2: Documents in same category (fallback)
- Returns: `{ related: [KnowledgeDocument, ...] }`

### TypeScript Types

✅ **`src/types/knowledge-graph.ts`**
- `GraphNodeType` — 8 types (document, process, area, nucleus, activity, system, routine, skill)
- `GraphNode` — with optional runtime fields (x, y, vx, vy) for force-graph
- `GraphLink` — source/target/relation
- `KnowledgeGraphData` — nodes[] + links[] + generatedAt
- `KnowledgeDocument` — all document fields + computed
- `DocumentEntityLink` — link record
- Color palette and labels for graph visualization

---

## ✅ Validation Checklist (Admin)

**Do these checks in Vercel environment after deploy:**

### 1️⃣ API Health Check

```bash
# Check if migrations ran and function exists
curl "https://[vercel-url]/api/knowledge/graph" \
  -H "Authorization: Bearer [your-jwt-token]"

# Expected response:
# {
#   "nodes": [
#     {"id": "...", "name": "...", "type": "area", "description": "..."},
#     ...
#   ],
#   "links": [
#     {"source": "...", "target": "...", "relation": "contains"},
#     ...
#   ],
#   "generatedAt": "2026-03-21T..."
# }
```

### 2️⃣ Documents Endpoint

```bash
# Get list of published documents
curl "https://[vercel-url]/api/knowledge/documents?limit=5&sort=recent" \
  -H "Authorization: Bearer [your-jwt-token]"

# Expected:
# {
#   "documents": [
#     {"id": "...", "title": "...", "reading_time_minutes": 5, "view_count": 0, ...},
#     ...
#   ],
#   "total": 4,
#   "nextCursor": "2026-03-21T...:[id]",
#   "hasMore": false
# }
```

### 3️⃣ View Count Increment

```bash
# Get a document ID from step 2, then:
curl -X POST "https://[vercel-url]/api/knowledge/documents/[doc-id]/view" \
  -H "Authorization: Bearer [your-jwt-token]" \
  -H "Content-Type: application/json"

# Expected: { "success": true, "viewCount": 1 }

# Call again: { "success": true, "viewCount": 2 }
```

### 4️⃣ Filters & Search

```bash
# By category
curl "https://[vercel-url]/api/knowledge/documents?category=manual" \
  -H "Authorization: Bearer [your-jwt-token]"

# Full-text search (Portuguese)
curl "https://[vercel-url]/api/knowledge/documents?search=processo" \
  -H "Authorization: Bearer [your-jwt-token]"

# Multiple tags (exact match required)
curl "https://[vercel-url]/api/knowledge/documents?tags=api,backend" \
  -H "Authorization: Bearer [your-jwt-token]"

# Sorted by popularity
curl "https://[vercel-url]/api/knowledge/documents?sort=popular&limit=3" \
  -H "Authorization: Bearer [your-jwt-token]"
```

### 5️⃣ RLS Isolation (CRITICAL)

**Test with two tenant accounts (Tenant A & Tenant B):**

```bash
# Login as Tenant A user
curl "https://[vercel-url]/api/knowledge/graph" \
  -H "Authorization: Bearer [tenant-A-token]"
# Should return: Tenant A's nodes + links only

# Login as Tenant B user
curl "https://[vercel-url]/api/knowledge/graph" \
  -H "Authorization: Bearer [tenant-B-token]"
# Should return: Tenant B's nodes + links only (DIFFERENT from Tenant A)

# VERIFY: Tenant A's data is NOT in Tenant B's response
```

### 6️⃣ Related Documents

```bash
# Get a document ID, then:
curl "https://[vercel-url]/api/knowledge/documents/[doc-id]/related" \
  -H "Authorization: Bearer [your-jwt-token]"

# Expected: up to 6 related documents (or empty if none)
# { "related": [{...}, {...}] }
```

### 7️⃣ Unauthorized Access (Error Cases)

```bash
# Without token
curl "https://[vercel-url]/api/knowledge/graph"
# Expected 401: { "error": "Unauthorized", "statusCode": 401, ... }

# With invalid token
curl "https://[vercel-url]/api/knowledge/graph" \
  -H "Authorization: Bearer invalid-token"
# Expected 401 or 400
```

---

## 📊 Database Verification

**In Supabase dashboard, run these SQL queries:**

### Check migrations applied
```sql
-- Should show migrations 075 and 076
SELECT * FROM supabase_migrations.schema_migrations
WHERE name LIKE '%075%' OR name LIKE '%076%'
ORDER BY id DESC LIMIT 2;
```

### Check new columns
```sql
-- Should show reading_time_minutes, tags, summary, view_count, cover_image_url, search_vector
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'documents'
AND column_name IN ('reading_time_minutes', 'tags', 'summary', 'view_count', 'cover_image_url', 'search_vector');
```

### Check document_entity_links table
```sql
-- Should return table definition
SELECT * FROM information_schema.tables
WHERE table_name = 'document_entity_links';

-- Should return RLS policies
SELECT * FROM pg_policies
WHERE tablename = 'document_entity_links';
```

### Check graph function
```sql
-- Should return function definition
SELECT * FROM pg_proc
WHERE proname = 'get_knowledge_graph';

-- Test the function (replace with real tenant_id)
SELECT public.get_knowledge_graph('00000000-0000-0000-0000-000000000001'::uuid);
```

---

## 🎯 Success Criteria for Admin Sign-Off

**All of these must pass for Story 17.1 to be marked DONE:**

- [ ] **API Health:** `/api/knowledge/graph` returns valid JSON with nodes and links
- [ ] **Pagination:** `/api/knowledge/documents` returns paginated results with correct structure
- [ ] **View Tracking:** POST `/view` increments `view_count` correctly
- [ ] **Filters:** `?category=`, `?search=`, `?tags=`, `?sort=` all work as expected
- [ ] **RLS Isolation:** Two tenants cannot see each other's data
- [ ] **Related Docs:** `/related` returns documents via graph links or category
- [ ] **Error Handling:** 401 on missing token, proper error messages
- [ ] **Database:** Migrations 075-076 present in schema, tables/indexes/policies visible
- [ ] **Function:** `get_knowledge_graph()` callable and returns expected structure
- [ ] **Performance:** Graph query returns < 2 seconds (even with 1000+ nodes)

---

## 📝 Notes for Admin

### What's Ready for Next Story
- ✅ Full database foundation ready
- ✅ API infrastructure in place
- ✅ RLS isolation tested
- ✅ TypeScript types defined

### What Comes Next (Story 17.2)
- UI Portal at `/conhecimento` (magazine-style reader)
- Uses these API routes to fetch and display documents
- No graph visualization yet (that's Story 17.3)

### Data Seeding
- Existing `documents` records will work immediately
- `reading_time_minutes` auto-calculated for all docs
- `tags`, `summary`, `view_count` start empty/0 (can be filled later or programmatically)
- `document_entity_links` empty until admin creates links (Story 17.4)

---

## 🚀 Deployment Status

**Branch:** `feat/epic17-graph-api` → merged to `main`
**Vercel:** Automatic deployment on push to `main`
**Preview URL:** `https://[project].vercel.app`
**Status:** ✅ Ready for validation

---

## 👤 Admin Next Steps

1. ✅ **Validate** using checklist above
2. ✅ **Sign off** when all checks pass
3. 📋 **Schedule** Story 17.2 (Knowledge Hub Portal)
4. 📝 **Optional:** Seed document tags/summaries for better demo

**Questions?** Check `/docs/stories/17.1-graph-data-api-schema.story.md` for technical details.
