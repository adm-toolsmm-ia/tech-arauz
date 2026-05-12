# EPIC 19 — Rollback Plan (Espaider v2 → v1)

**Version:** 1.0
**Date:** 2026-05-12
**Owner:** @architect + @devops

---

## Rollback Philosophy

The v2 implementation is designed for zero-downtime rollback:
- **No code deployment required** — version switch is a DB setting
- **v1 code preserved** — `executeSyncAll` is never deleted during migration
- **Independent watermarks** — v2 uses `tipo='Projetos-v2'` row; rolling back to v1 does not affect v1's own `last_sync_at`
- **No data loss** — v2 upserts into the same tables; v1 re-syncing will overwrite with same values (idempotent)

---

## Rollback Triggers (When to Roll Back)

Roll back immediately if **any** of the following occur:

| Trigger | Threshold | Action |
|---------|-----------|--------|
| Quarantine rate spike | > 10% of records quarantined in a single run | Rollback + investigate |
| Sync failure 3 consecutive times | 3 failed runs in a row | Rollback + escalate |
| Projects count anomaly | > 20% delta from v1 baseline | Hold, investigate |
| Child table data corruption | Records with null project_id or invalid data | Rollback + quarantine review |
| Frontend log viewer broken | No entries visible after confirmed v2 run | Rollback + investigate |

---

## Rollback Sequence

### Step 1 — Switch Version Back to v1 (< 1 minute)

**Option A: Server action (admin UI)**
Use `switchIntegrationVersion('v1')` from the admin interface.

**Option B: Direct SQL (emergency)**
```sql
UPDATE espaider_apis
SET settings = settings || '{"api_version": "v1"}'::jsonb
WHERE tenant_id = '<tenant-id>'
  AND tipo = 'projetos'
  AND is_active = true;
```

This takes effect on the next sync trigger. No restart required.

### Step 2 — Verify Rollback

Trigger a sync and confirm the response:
```json
{ "success": true, "version": "v1", ... }
```

### Step 3 — Run v1 Sync to Re-Establish Baseline

```bash
curl -X POST "https://<domain>/api/integracoes/sync" \
  -H "Authorization: Bearer <admin-token>"
```

Verify the sync completes successfully with `version: "v1"`.

### Step 4 — Preserve Quarantine Data for Investigation

Do NOT delete `integration_sync_quarantine` entries. They contain the raw payloads and reasons for each rejected record. Use these for root cause analysis:

```sql
SELECT dataset, stage, reason, created_at
FROM integration_sync_quarantine
WHERE tenant_id = '<tenant-id>'
ORDER BY created_at DESC
LIMIT 50;
```

### Step 5 — Document the Incident

Record in the story file or incident log:
- When rollback was triggered
- Which trigger condition was met
- Root cause (if known)
- Actions taken

---

## v1 Decommission Criteria

v1 (`executeSyncAll` + v1 client/schemas/mappers) can be safely decommissioned when:

| Criterion | Validation |
|-----------|-----------|
| v2 running stable for ≥ 30 days | Check sync_logs: no failed v2 runs |
| Quarantine rate < 0.1% over 30 days | Query integration_sync_quarantine |
| All tenants migrated to v2 | No espaider_apis row with api_version=v1 or no setting |
| v1 watermarks not being advanced | last_sync_at unchanged on v1 projetos rows |
| No open incidents from v2 | Zero P1/P2 issues attributed to sync |
| Team sign-off | Engineering + Product sign-off |

**Decommission steps (when criteria met):**
1. Delete v1 client/schemas/mappers from `src/integrations/espaider/`
2. Remove `executeSyncAll` from `src/lib/sync/espaider-sync.ts`
3. Simplify `sync-orchestrator.ts` to remove v1 branch
4. Archive v1 stories in `_deprecated/`
5. Update EPIC-INDEX.md to mark EPIC 15 as archived

---

## Known Risks

| Risk | Likelihood | Mitigation |
|------|-----------|------------|
| v2 API changes contract mid-migration | Low | Schema contract tests (Story 19.2) catch this |
| Quarantine table fills up | Medium (large tenant) | Add monitoring alert on quarantine count |
| Child pagination timeout | Low | Circuit breaker + retry in client |
| Mixed v1/v2 data in same run | Not possible | Switch is atomic per-tenant per-run |
| v2 watermark corrupted | Low | Manual reset: update `tipo='Projetos-v2'` row's `last_sync_at`, or delete row for full sync |

---

## Emergency: Full Data Reset (Last Resort)

If v2 sync corrupted project data and rollback didn't fix it:

```sql
-- Step 1: Switch back to v1
UPDATE espaider_apis SET settings = settings || '{"api_version": "v1"}'::jsonb
WHERE tipo = 'projetos' AND is_active = true;

-- Step 2: Trigger full v1 sync with fullSync=true (if supported)
-- Or manually clear the watermark to force a full sync

-- Step 3: Contact @data-engineer for table-level restore if needed
```

This scenario is unlikely — v2 upserts are idempotent and non-destructive.
