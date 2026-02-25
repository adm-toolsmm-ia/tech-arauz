# DEPLOYMENT CHECKLIST: Migrations 037 + 038

## Pre-Deployment Status

**Generated:** 2026-02-25T14:30 UTC
**Project:** Tech Arauz (pybmawlwpmxshtccpqui)
**Tenant:** arauz-advogados

### Files Ready
- ? Migration 037_add_lm_models_360.sql (68 lines)
- ? Migration 038_seed_curated_models.sql (809 lines)

### Prerequisites
- [ ] SUPABASE_ACCESS_TOKEN configured
- [ ] Docker daemon running (local) OR use MCP Supabase
- [ ] Backup current schema (snapshot)
- [ ] Notify stakeholders (downtime window: ~30s)

## Step 1: Apply Migrations

**Command:**
`\ash
npx supabase db push
`\

**Expected Output:**
- ? Migrating from version 036 to 037
- ? Migrating from version 037 to 038
- ? Applied 2 migrations

**Execution Time:** ~5-10s

## Step 2: Validate Migration 037 (Schema)

**Query 1: Verify columns added**
`\sql
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'lm_models' 
  AND column_name IN ('context_window', 'display_order', 'tier')
ORDER BY column_name;
`\

**Expected Result:** 3 rows
| column_name | data_type |
| --- | --- |
| context_window | integer |
| display_order | smallint |
| tier | character varying |

## Step 3: Validate Migration 038 (Data)

**Query 2: Count models by provider (active)**
`\sql
SELECT 
  p.name as provider,
  COUNT(m.id) as total_models,
  COUNT(CASE WHEN m.is_active = true THEN 1 END) as active_models
FROM lm_models m
JOIN lm_providers p ON m.provider_id = p.id
WHERE m.tenant_id = (SELECT id FROM tenants WHERE slug = 'arauz-advogados')
GROUP BY p.id, p.name
ORDER BY active_models DESC;
`\

**Expected Result:** 6 providers with 5 active models each
| provider | total_models | active_models |
| --- | --- | --- |
| OpenAI | N | 5 |
| Anthropic | N | 5 |
| Google | N | 5 |
| Mistral | N | 5 |
| Cohere | N | 5 |
| Groq | N | 5 |

**Query 3: Verify tier distribution**
`\sql
SELECT 
  tier,
  COUNT(*) as count
FROM lm_models
WHERE tenant_id = (SELECT id FROM tenants WHERE slug = 'arauz-advogados')
  AND is_active = true
GROUP BY tier
ORDER BY tier;
`\

**Expected Result:** 4 tiers (entry, balanced, pro, flagship)
| tier | count |
| --- | --- |
| entry | 6 |
| balanced | 6 |
| pro | 6 |
| flagship | 4 |

**Query 4: Verify display_order for curated models**
`\sql
SELECT 
  COUNT(*) as curados_com_low_order
FROM lm_models
WHERE tenant_id = (SELECT id FROM tenants WHERE slug = 'arauz-advogados')
  AND is_active = true
  AND display_order > 99;
`\

**Expected Result:** 0 (all curated models should have display_order 1-99)

**Query 5: Verify FK integrity**
`\sql
SELECT COUNT(*) as agents_ok
FROM agents
WHERE tenant_id = (SELECT id FROM tenants WHERE slug = 'arauz-advogados')
  AND (model_id IS NULL OR model_id IN (SELECT id FROM lm_models WHERE is_active = true));
`\

**Expected Result:** (all agents count)

## Post-Deployment

- [ ] All validation queries return expected results
- [ ] No RLS violations logged
- [ ] Zero errors in application logs
- [ ] UI model selector displays 5 per provider
- [ ] Performance metrics (query latency) unchanged

## Rollback (if needed)

**Command:**
`\ash
npx supabase db push --version 036
`\

**Note:** Rollback will:
- Remove columns: context_window, display_order, tier
- Delete seeded models (can be re-seeded later)
- Restore to schema version 036

## Sign-Off

- Deployment executed: [TIMESTAMP]
- Validated by: @devops
- Go/No-Go decision: [ ] GO / [ ] NO-GO
- Merge approval: [ ] Ready for git push

