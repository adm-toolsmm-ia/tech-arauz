# EPIC 19 — Rollout Checklist (Espaider v2)

**Version:** 1.0
**Date:** 2026-05-12
**Owner:** @architect + @devops

---

## Go/No-Go Criteria

All items below must be GREEN before switching any tenant to v2.

| Criterion | Check | Notes |
|-----------|-------|-------|
| v2 connectivity stable | `GET /api/integracoes/test?version=v2` returns 200 | Test in staging first |
| Incremental sync stable | Run with watermark; verify page count matches expected | 3 consecutive clean runs |
| No duplicate creation | Run sync twice for same date window; upsert count = 0 on 2nd run | onConflict: tenant_id,espaider_id |
| Frontend logs visible | `/api/integracoes/logs` returns entries with dataset='Projetos-v2' | After at least 1 v2 run |
| Quarantine working | Inject invalid record; verify row in integration_sync_quarantine | Manual test or staging fixture |
| Rollback switch tested | Set api_version=v2, run, then set api_version=v1, run again | Both must succeed |
| DB migrations applied | Migrations 078–080 applied to production Supabase | Verify via `list_migrations` |
| v1 baseline preserved | Run v1 sync immediately before switch; record metrics | Keep as rollback baseline |

---

## Rollout Sequence

### Step 1 — Apply DB Migrations (non-breaking)

```sql
-- Verify migrations exist
SELECT * FROM supabase_migrations.schema_migrations
WHERE version IN ('078', '079', '080');
```

- Migration 078: `integration_sync_quarantine` table (new, additive)
- Migration 079: Expand `sync_logs` + `integration_log_entries` CHECK constraints (additive)
- Migration 080: Expand `espaider_apis.tipo` CHECK constraint (additive)

All are backward-compatible. v1 continues to work unchanged.

### Step 2 — Deploy Code

Deploy the EPIC 19 commit range via Vercel. No environment variable changes required for v1-default behavior.

### Step 3 — Configure v2 Credentials (per tenant)

Ensure the following env vars are set for v2:
- `ESPAIDER_V2_BASE_URL` — v2 endpoint
- `ESPAIDER_V2_TOKEN` — v2 token
- `ESPAIDER_V2_IDENTIFICADOR` — v2 identificador

### Step 4 — Test Connectivity

```bash
curl -X GET "https://<domain>/api/integracoes/test?version=v2" \
  -H "Authorization: Bearer <admin-token>"
```

Expected: `{ success: true, situacao: "S", recordCount: N }`

### Step 5 — Enable v2 for Tenant (via server action)

Use `switchIntegrationVersion('v2')` from the admin UI or directly via the server action.

SQL alternative for manual switch:
```sql
UPDATE espaider_apis
SET settings = settings || '{"api_version": "v2"}'::jsonb
WHERE tenant_id = '<tenant-id>'
  AND tipo = 'projetos'
  AND is_active = true;
```

### Step 6 — Trigger First v2 Sync

```bash
curl -X POST "https://<domain>/api/integracoes/sync" \
  -H "Authorization: Bearer <admin-token>"
```

Expected response: `{ success: true, version: "v2", ... }`

### Step 7 — Validate Frontend Logs

Navigate to Integrations → Log History. Verify:
- Entries appear with `dataset=Projetos-v2`
- Log levels include `info` + `success`
- No unexpected `error` level entries

### Step 8 — Monitor for 48 Hours

- Check `integration_sync_quarantine` count (should be < 1% of records)
- Verify `projects` table record count matches expectations
- Monitor child tables: `project_histories`, `project_approvers`, etc.

---

## Smoke-Test Checklist (Post-Cutover)

- [ ] `GET /api/integracoes/test?version=v2` returns 200
- [ ] `POST /api/integracoes/sync` completes with `version: "v2"` in response
- [ ] `GET /api/integracoes/logs` returns entries with `dataset` containing `-v2`
- [ ] `GET /api/integracoes/logs/summary` shows v2 run in sync_logs
- [ ] Projects count in DB matches Espaider source (spot-check 5 records)
- [ ] Child datasets populated: `project_histories`, `project_approvers`, `project_schedules`
- [ ] `integration_sync_quarantine` count < 1% of total records
- [ ] v1 rollback switch works (set api_version=v1, run, verify response has `version: "v1"`)

---

## Monitoring Points

| Metric | Expected | Alert Threshold |
|--------|----------|-----------------|
| Quarantine rate | < 1% | > 5% |
| Sync duration | < 5 min | > 15 min |
| Error log entries | 0 | > 0 errors |
| Projects count delta | +/- 10% of v1 | > 20% delta |
