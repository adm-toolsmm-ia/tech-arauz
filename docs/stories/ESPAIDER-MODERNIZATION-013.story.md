# ESPAIDER-MODERNIZATION-013: Implement Feature Flag UI for Dataset Control

**Epic:** EPIC-ESPAIDER-MODERNIZATION
**Phase:** E (Dataset Recovery & Feature Flags)
**Priority:** 🟠 HIGH (enables self-service control)
**Effort:** 1.5-2 days
**Owner:** @dev (Dex)
**Status:** READY

---

## Goal

Create UI component allowing non-technical admins to enable/disable datasets without code changes or deployments.

---

## Acceptance Criteria

- [ ] Create dataset configuration UI component (React)
- [ ] Display toggles for: projects, deliveries, contacts, tasks, TempoPermanencia, HorasLancadas
- [ ] Store feature flag state in database (supabase)
- [ ] Check flags before syncing each dataset
- [ ] Support role-based access (admin only)
- [ ] Show last sync timestamp + status for each dataset
- [ ] WCAG AA accessibility (keyboard navigation, screen reader)
- [ ] <2 min admin time to toggle dataset enable/disable

---

## Implementation

### Feature Flag Table

```sql
CREATE TABLE feature_flags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  flag_name TEXT NOT NULL, -- 'espaider_projects', 'espaider_deliveries', etc.
  enabled BOOLEAN DEFAULT true,
  updated_by UUID REFERENCES auth.users(id),
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  UNIQUE(tenant_id, flag_name)
);

-- RLS: tenants can only manage their own flags
ALTER TABLE feature_flags ENABLE ROW LEVEL SECURITY;
CREATE POLICY feature_flags_tenant ON feature_flags
  FOR ALL USING (tenant_id = auth.uid()::uuid);
```

### UI Component

**components/sync/DatasetFeatureFlags.tsx:**
```typescript
export function DatasetFeatureFlags() {
  const [flags, setFlags] = useState<FeatureFlag[]>([])
  const [syncing, setSyncing] = useState(false)

  useEffect(() => {
    loadFlags()
  }, [])

  async function toggleFlag(flagName: string, enabled: boolean) {
    await updateFeatureFlag(flagName, enabled)
    setFlags(flags.map(f => f.flag_name === flagName ? { ...f, enabled } : f))
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Dataset Sync Configuration</h2>

      {flags.map(flag => (
        <div key={flag.flag_name} className="flex items-center justify-between p-4 border rounded">
          <div>
            <h3 className="font-medium">{formatDatasetName(flag.flag_name)}</h3>
            <p className="text-sm text-gray-600">
              Last synced: {formatDate(flag.last_sync_at)}
            </p>
          </div>
          <Toggle
            checked={flag.enabled}
            onChange={(enabled) => toggleFlag(flag.flag_name, enabled)}
          />
        </div>
      ))}
    </div>
  )
}
```

---

## File List

**Create:**
- [ ] `supabase/migrations/{timestamp}_create_feature_flags_table.sql` (NEW)
- [ ] `src/components/sync/DatasetFeatureFlags.tsx` (NEW - React component)
- [ ] `src/app/api/feature-flags/route.ts` (NEW - API endpoints)
- [ ] `src/lib/feature-flags.ts` (NEW - utility functions)
- [ ] `src/app/admin/sync-config/page.tsx` (NEW - admin page)
- [ ] `src/__tests__/components/DatasetFeatureFlags.test.tsx` (NEW)

**Modify:**
- [ ] `src/integrations/espaider/sync/espaider-sync.ts` (check flags before sync)
- [ ] `src/integrations/espaider/sync/handlers.ts` (check flags)

---

## Validation Checklist

```bash
npm run typecheck
npm run lint
npm test -- src/__tests__/components/DatasetFeatureFlags.test.tsx
# Manual: Toggle flags; verify sync respects settings
```

Expected:
- ✅ All tests pass
- ✅ Accessibility audit passes (WCAG AA)
- ✅ Toggle takes <2 min for admin

---

## Commit Message

```
feat: Implement feature flag UI for dataset control

- Create FeatureFlag table and RLS policies
- Add DatasetFeatureFlags React component
- Add API endpoints for flag management
- Integrate with sync pipeline (check flags before sync)
- Add admin page for configuration

Enables non-technical users to enable/disable datasets.
```

---

**Story Status:** ✅ READY FOR ASSIGNMENT
**Assigned to:** @dev (Dex)
**Blocked by:** ESPAIDER-MODERNIZATION-008
**Blocks:** None (independent)
