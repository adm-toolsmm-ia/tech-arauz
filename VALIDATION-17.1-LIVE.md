# LIVE VALIDATION — EPIC 17.1 Checkpoint

**Status:** 🔴 IN PROGRESS (Admin validating now)
**Started:** 2026-03-21 15:45 UTC
**Target:** All 7 checks pass → Story 17.1 = DONE
**Sign-Off:** (awaiting admin approval)

---

## ✅ Validation Checklist (7 Steps)

Copy-paste each command, verify response.

### Step 1: API Graph Health ✓ or ✗

```bash
curl "https://[your-vercel-url]/api/knowledge/graph" \
  -H "Authorization: Bearer [your-jwt-token]" \
  -H "Content-Type: application/json"
```

**Expected Response:**
```json
{
  "nodes": [
    {"id": "...", "name": "...", "type": "area", "description": "..."},
    {"id": "...", "name": "...", "type": "process", "description": "..."}
  ],
  "links": [
    {"source": "...", "target": "...", "relation": "contains"},
    {"source": "...", "target": "...", "relation": "uses"}
  ],
  "generatedAt": "2026-03-21T15:45:..."
}
```

**Status:** ⬜ PENDING
- [ ] Response received
- [ ] Has "nodes" array
- [ ] Has "links" array
- [ ] Has "generatedAt" timestamp

---

### Step 2: Documents List Endpoint ✓ or ✗

```bash
curl "https://[your-vercel-url]/api/knowledge/documents?limit=5&sort=recent" \
  -H "Authorization: Bearer [your-jwt-token]"
```

**Expected Response:**
```json
{
  "documents": [
    {
      "id": "...",
      "title": "...",
      "category": "manual",
      "reading_time_minutes": 5,
      "tags": [...],
      "summary": "...",
      "view_count": 0,
      "is_published": true
    }
  ],
  "total": 4,
  "nextCursor": "2026-03-21T...:id",
  "hasMore": false
}
```

**Status:** ⬜ PENDING
- [ ] Response received
- [ ] Has "documents" array
- [ ] Each doc has "reading_time_minutes"
- [ ] Each doc has "tags" (array)
- [ ] "total" count visible
- [ ] "hasMore" boolean present

---

### Step 3: View Count Increment ✓ or ✗

**From Step 2, pick a document ID, then:**

```bash
curl -X POST "https://[your-vercel-url]/api/knowledge/documents/[doc-id]/view" \
  -H "Authorization: Bearer [your-jwt-token]" \
  -H "Content-Type: application/json"
```

**Expected Response:**
```json
{
  "success": true,
  "viewCount": 1
}
```

**Call again (should increment):**
```json
{
  "success": true,
  "viewCount": 2
}
```

**Status:** ⬜ PENDING
- [ ] First call returns viewCount: 1
- [ ] Second call returns viewCount: 2 (incremented)
- [ ] Idempotent (safe to call multiple times)

---

### Step 4: Filters & Search ✓ or ✗

**Test category filter:**
```bash
curl "https://[your-vercel-url]/api/knowledge/documents?category=manual&limit=3" \
  -H "Authorization: Bearer [your-jwt-token]"
```

**Test search (full-text Portuguese):**
```bash
curl "https://[your-vercel-url]/api/knowledge/documents?search=processo&limit=3" \
  -H "Authorization: Bearer [your-jwt-token]"
```

**Test tags filter:**
```bash
curl "https://[your-vercel-url]/api/knowledge/documents?tags=api,backend&limit=3" \
  -H "Authorization: Bearer [your-jwt-token]"
```

**Test popularity sort:**
```bash
curl "https://[your-vercel-url]/api/knowledge/documents?sort=popular&limit=3" \
  -H "Authorization: Bearer [your-jwt-token]"
```

**Status:** ⬜ PENDING
- [ ] Category filter returns only docs with that category
- [ ] Search returns docs matching query (Portuguese)
- [ ] Tags filter works (if any docs have tags)
- [ ] Sort=popular returns by view_count DESC
- [ ] All return correct structure

---

### Step 5: RLS Isolation (CRITICAL) ✓ or ✗

**Setup:** Have 2 user accounts ready (Tenant A & Tenant B)

**Login as Tenant A:**
```bash
# Get JWT for Tenant A user
# Save the response nodes/links count
curl "https://[your-vercel-url]/api/knowledge/graph" \
  -H "Authorization: Bearer [tenant-a-jwt]"
# Note: X nodes, Y links
```

**Login as Tenant B:**
```bash
# Get JWT for Tenant B user
curl "https://[your-vercel-url]/api/knowledge/graph" \
  -H "Authorization: Bearer [tenant-b-jwt]"
# Compare: Should be DIFFERENT from Tenant A
```

**MUST VERIFY:** Tenant A's data is NOT visible to Tenant B ❌ ❌ ❌

**Status:** ⬜ PENDING
- [ ] Tenant A graph retrieved
- [ ] Tenant B graph retrieved
- [ ] Graphs are DIFFERENT (no data leak)
- [ ] Tenant B cannot see Tenant A's docs

---

### Step 6: Related Documents ✓ or ✗

**From Step 2, pick a document ID:**

```bash
curl "https://[your-vercel-url]/api/knowledge/documents/[doc-id]/related" \
  -H "Authorization: Bearer [your-jwt-token]"
```

**Expected Response:**
```json
{
  "related": [
    {"id": "...", "title": "...", "category": "..."},
    {"id": "...", "title": "...", "category": "..."}
  ]
}
```

**Status:** ⬜ PENDING
- [ ] Response received
- [ ] "related" is array (can be empty if no links)
- [ ] Each related doc has id, title, category
- [ ] Max 6 related docs returned

---

### Step 7: Error Handling ✓ or ✗

**Without token (should return 401):**
```bash
curl "https://[your-vercel-url]/api/knowledge/graph"
```

**Expected:**
```json
{
  "error": "Unauthorized",
  "statusCode": 401,
  "timestamp": "2026-03-21T15:45:..."
}
```

**With invalid token:**
```bash
curl "https://[your-vercel-url]/api/knowledge/graph" \
  -H "Authorization: Bearer invalid-token"
```

**Expected:** 401 or 400 error

**Status:** ⬜ PENDING
- [ ] No token → 401
- [ ] Invalid token → 401/400
- [ ] Error response has proper structure
- [ ] No sensitive data in error message

---

## 📊 Database Verification (Optional)

**In Supabase dashboard, run:**

### Check migrations
```sql
SELECT * FROM supabase_migrations.schema_migrations
WHERE name LIKE '%075%' OR name LIKE '%076%'
ORDER BY id DESC LIMIT 2;
```

**Expected:** 2 rows (migrations 075 and 076)

### Check new columns
```sql
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'documents'
AND column_name IN ('reading_time_minutes', 'tags', 'summary', 'view_count', 'cover_image_url', 'search_vector');
```

**Expected:** 6 rows (all columns present)

### Check document_entity_links table
```sql
SELECT * FROM information_schema.tables
WHERE table_name = 'document_entity_links';
```

**Expected:** 1 row (table exists)

### Test graph function
```sql
SELECT public.get_knowledge_graph('00000000-0000-0000-0000-000000000001'::uuid);
```

**Expected:** JSON with nodes and links

---

## ✅ Sign-Off Checklist

**All 7 steps must pass:**

- [ ] Step 1: API Graph Health — ✅ PASS
- [ ] Step 2: Documents List — ✅ PASS
- [ ] Step 3: View Count — ✅ PASS
- [ ] Step 4: Filters & Search — ✅ PASS
- [ ] Step 5: RLS Isolation — ✅ PASS (CRITICAL)
- [ ] Step 6: Related Docs — ✅ PASS
- [ ] Step 7: Error Handling — ✅ PASS

**Database (optional):**
- [ ] Migrations 075-076 present
- [ ] New columns on documents table
- [ ] document_entity_links table exists
- [ ] Function runs without error

---

## 🎯 Final Decision

**If ALL checks pass:**
- ✅ **APPROVED** — Story 17.1 is DONE
- → Story 17.2 (Knowledge Hub Portal) can start immediately
- → Expected delivery: ~25 hours

**If ANY check fails:**
- ❌ **BLOCKED** — Document which step failed
- → Dev team fixes immediately
- → Re-run validation

---

## 📝 Admin Notes Section

Use this space to document your validation results:

```
Admin Name: ________________
Date: 2026-03-21
Start Time: ________________
End Time: ________________

Issues Found (if any):
________________________________
________________________________

Overall Decision: ☐ PASS  ☐ FAIL  ☐ CONDITIONAL
Comments:
________________________________
```

---

## 🔗 Quick Links

- **Build Logs:** Vercel Dashboard
- **Deployment:** https://[your-vercel-url]
- **Documentation:** `docs/stories/CHECKPOINT-17.1-VALIDATION.md`
- **Code:** `src/app/api/knowledge/*`
- **Migrations:** `supabase/migrations/075_*.sql` + `076_*.sql`

---

**Status:** Live — Awaiting validation results
**Support:** Contact dev team (Dex) if errors
**Next:** Merge to main once approved

---

**Last Updated:** 2026-03-21 15:45 UTC
