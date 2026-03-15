# org-data-integration.md

**Status:** ✅ COMPLETE (Phase 2 Content Generation — Story 11.14)

## Overview

Integration patterns for consuming organizational data from Tech Arauz, covering data flows, API usage, server action patterns, and real-world integration examples.

## Table of Contents

- [Data Access Patterns](#data-access-patterns)
- [Server Action Usage](#server-action-usage)
- [RLS-Safe Queries](#rls-safe-queries)
- [Bulk Operations](#bulk-operations)
- [Real-World Integration Examples](#real-world-integration-examples)

---

## Data Access Patterns

### Reading Organization Structure

**Pattern 1: Get Full Organizational Hierarchy**

```typescript
// Frontend Component
async function fetchOrganizationHierarchy() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error('User not authenticated');

  // Get profile with tenant_id
  const { data: profile } = await supabase
    .from('profiles')
    .select('tenant_id')
    .eq('id', user.id)
    .single();

  // RLS automatically filters by tenant_id via auth
  const { data: areas } = await supabase
    .from('org_areas')
    .select(`
      id, name, description, responsible_roles,
      org_nuclei (
        id, name, description, responsible_roles,
        org_processes (
          id, name, description, responsible_roles,
          org_routines (
            id, name, description, responsible_roles,
            org_activities (
              id, name, complexity, priority, responsible_roles
            )
          )
        )
      )
    `)
    .order('name');

  return areas;
}
```

**Pattern 2: Get Area with Nuclei Only**

```typescript
// Lighter weight, used for navigation
async function fetchAreaWithNuclei(areaId: string) {
  const supabase = await createClient();

  const { data: area } = await supabase
    .from('org_areas')
    .select(`
      id, name, description, responsible_roles,
      org_nuclei (
        id, name, description, responsible_roles
      )
    `)
    .eq('id', areaId)
    .single();

  return area;
}
```

**Pattern 3: List All Processes in a Nucleus**

```typescript
// Used for process selection UI
async function fetchProcessesInNucleus(nucleusId: string) {
  const supabase = await createClient();

  const { data: processes } = await supabase
    .from('org_processes')
    .select(`
      id, name, description, objective,
      inputs, outputs, responsible_roles,
      org_routines ( count )
    `)
    .eq('nucleus_id', nucleusId)
    .order('name');

  return processes;
}
```

**Performance Considerations:**

- **Full Hierarchy:** Use for org-wide analytics or visualization (cache for 5 minutes)
- **Partial Hierarchy:** Use for navigation (cache for 10 minutes)
- **Filtered Lists:** Use for selections (cache for 15 minutes)

### Query Optimization

**✅ DO: Use Select Projections**

```typescript
// GOOD: Only fetch needed fields
const { data: areas } = await supabase
  .from('org_areas')
  .select('id, name, description')  // Don't fetch documentation JSONB if not needed
  .limit(50);
```

**❌ DON'T: Fetch Everything**

```typescript
// BAD: Fetches all columns including large JSONB
const { data: areas } = await supabase
  .from('org_areas')
  .select('*')
  .limit(50);
```

**Pagination for Large Result Sets:**

```typescript
// Cursor-based pagination (preferred)
async function fetchActivitiesPaginated(routineId: string, cursor?: string) {
  const supabase = await createClient();
  const pageSize = 50;

  let query = supabase
    .from('org_activities')
    .select('id, name, complexity, priority')
    .eq('routine_id', routineId)
    .order('id');

  // Cursor-based: start after last ID from previous page
  if (cursor) {
    query = query.gt('id', cursor);
  }

  const { data: activities } = await query.limit(pageSize + 1);

  return {
    activities: activities?.slice(0, pageSize),
    nextCursor: activities?.[pageSize]?.id || null
  };
}
```

---

## Server Action Usage

### Organization CRUD Actions

**Create Area**

```typescript
const result = await createAreaAction({
  name: 'Recuperação de Crédito',
  description: 'Credit recovery processes',
  objective: 'Maximize debt recovery efficiently',
  responsible_roles: ['gerente_area', 'diretor_juridico'],
  documentation: {
    procedure: 'Standard credit recovery process',
    sla: '30-day target'
  }
});

if (result.success) {
  console.log('Created area:', result.data.id);
  revalidatePath('/organizacao');
} else {
  console.error('Error:', result.message);
}
```

**Update Area**

```typescript
const result = await updateAreaAction(areaId, {
  name: 'Recuperação de Crédito',
  description: 'Updated description',
  responsible_roles: ['gerente_area', 'diretor_juridico', 'consultor_senior'],
  documentation: {
    ...existingArea.documentation,
    updated_at: new Date().toISOString()
  }
});
```

**Delete Area (Cascades to Children)**

```typescript
// WARNING: This deletes the area + all nuclei + processes + routines + activities
const result = await deleteAreaAction(areaId);

if (result.success) {
  console.log('Deleted area and all descendants');
  revalidatePath('/organizacao');
} else {
  console.error('Error:', result.message);
}
```

**Get Responsible Roles for Activity**

```typescript
const roles = await getActivityResponsibleRolesAction(activityId);
// Returns: ['advogado', 'paralegal']
```

### Search and Filter Actions

**Search Organization**

```typescript
// Full-text search across all entities
const results = await searchOrganizationAction({
  query: 'legal review',
  entity_types: ['activities', 'routines', 'processes'],
  filters: {
    complexity: 'high',
    responsible_roles: ['advogado']
  },
  limit: 20
});

// Returns: { activities: [...], routines: [...], processes: [...] }
```

**Advanced Search with Embeddings (Story 11.11)**

```typescript
// Semantic search knowledge base
const knowledgeResults = await semanticSearchKnowledgeAction(
  'how to interview clients effectively',
  10,  // Top 10 results
  0.7  // Similarity threshold
);

// Returns: [
//   { id, type: 'best_practice', title, content, similarity_score }
// ]
```

### Bulk Operations Actions

**Bulk Update Entities**

```typescript
// Update multiple activities at once
const result = await bulkUpdateEntitiesAction(
  'activity',
  [activityId1, activityId2, activityId3],
  {
    priority: 'high',
    responsible_roles: ['advogado_senior']
  }
);

// Returns: { updated: 3, failed: 0, errors: [] }
```

**Bulk Delete Entities**

```typescript
// Delete multiple processes
const result = await bulkDeleteEntitiesAction(
  'process',
  [processId1, processId2]
);

// Returns: { deleted: 2, failed: 0, errors: [] }
```

**Export Organization as CSV**

```typescript
// Export selected entities
const csv = await exportOrganizationAsCSVAction(
  'activity',  // Entity type to export
  {
    filters: { complexity: 'high' }
  }
);

// Returns: "id,name,complexity,priority,responsible_roles\n..."
// Download: trigger download in browser
const blob = new Blob([csv], { type: 'text/csv' });
const url = URL.createObjectURL(blob);
const a = document.createElement('a');
a.href = url;
a.download = 'activities.csv';
a.click();
```

**Import Organization from JSON**

```typescript
const jsonData = {
  areas: [
    {
      name: 'New Area',
      nuclei: [
        {
          name: 'New Nucleus',
          processes: [
            { name: 'New Process' }
          ]
        }
      ]
    }
  ]
};

const result = await importOrganizationFromJSONAction(jsonData, {
  merge: false,  // false = replace, true = merge
  validate: true,
  dry_run: false
});

if (result.success) {
  console.log(`Imported ${result.data.entities_created} entities`);
}
```

---

## RLS-Safe Queries

All organizational data is protected by Row-Level Security (RLS). Users can only access data for their tenant.

**How RLS Works:**

```sql
-- RLS policy on org_areas table
CREATE POLICY "Tenant isolation" ON org_areas
  FOR SELECT USING (tenant_id = auth.jwt()->>'tenant_id');
```

**In Practice:**

```typescript
// This query automatically filters by tenant_id
// No need to add WHERE tenant_id = ... manually
const { data } = await supabase
  .from('org_areas')
  .select('*');

// RLS ensures user can ONLY see their org's areas
// User from different tenant gets empty result set
```

**Testing RLS:**

```typescript
async function testRLSIsolation() {
  // Create two auth sessions (tenant A, tenant B)
  const tenantAUser = await supabase.auth.signInWithPassword({
    email: 'user-a@tenant-a.com',
    password: 'password'
  });

  const { data: dataA } = await supabase
    .from('org_areas')
    .select('*');

  // Switch to tenant B
  const tenantBUser = await supabase.auth.signInWithPassword({
    email: 'user-b@tenant-b.com',
    password: 'password'
  });

  const { data: dataB } = await supabase
    .from('org_areas')
    .select('*');

  // Verify: dataA and dataB should be different
  assert(dataA[0].id !== dataB[0]?.id, 'RLS isolation failed');
}
```

---

## Bulk Operations

**Pattern: CSV Import/Export Workflow**

```typescript
// 1. Export current state
const csv = await exportOrganizationAsCSVAction('activity');

// 2. User edits in Excel/Google Sheets
// ... user modifies CSV locally ...

// 3. Re-import with validation
const result = await importOrganizationFromCSVAction(
  csvContent,
  {
    entity_type: 'activity',
    validate: true,
    dry_run: true  // Test first
  }
);

if (result.success && result.data.validation_passed) {
  // Dry run passed, do actual import
  const finalResult = await importOrganizationFromCSVAction(
    csvContent,
    {
      entity_type: 'activity',
      validate: false,
      dry_run: false
    }
  );

  console.log(`Imported ${finalResult.data.entities_created} entities`);
} else {
  console.error('Validation failed:', result.data.validation_errors);
}
```

---

## Real-World Integration Examples

### Example 1: Org Chart Visualization

```typescript
// Fetch organization for visualization
async function buildOrgChart() {
  const areas = await fetchOrganizationHierarchy();

  // Transform to tree structure for org chart library
  const treeData = areas.map(area => ({
    name: area.name,
    children: area.org_nuclei.map(nucleus => ({
      name: nucleus.name,
      children: nucleus.org_processes.map(process => ({
        name: process.name,
        data: { id: process.id, type: 'process' }
      }))
    }))
  }));

  // Render with library (e.g., react-org-chart)
  return <OrgChart data={treeData} />;
}
```

### Example 2: Activity Assignment Workflow

```typescript
// 1. Get all activities needing assignment
const unassignedActivities = await supabase
  .from('org_activities')
  .select('id, name, complexity')
  .is('responsible_roles', null)
  .order('complexity DESC');

// 2. Get available roles with capacity
const roles = await getRoleContextAction('advogado');

// 3. Suggest assignments
const assignments = unassignedActivities.data?.map(activity => ({
  activity_id: activity.id,
  suggested_role: roles.capacity > 0 ? 'advogado' : 'advogado_senior'
}));

// 4. Bulk update with user confirmation
const confirmed = assignments.filter(a => userApproved(a));
const result = await bulkUpdateEntitiesAction(
  'activity',
  confirmed.map(a => a.activity_id),
  { responsible_roles: [confirmed[0].suggested_role] }
);
```

### Example 3: Process Metrics Dashboard

```typescript
// Fetch all processes with metrics
async function buildMetricsDashboard() {
  const processes = await supabase
    .from('org_processes')
    .select('id, name, nucleus_id')
    .order('name');

  // Get metrics for each
  const metricsData = await Promise.all(
    processes.data?.map(p =>
      getProcessMetricsAction(p.id, {
        start: new Date(Date.now() - 30*24*60*60*1000),
        end: new Date()
      })
    ) || []
  );

  // Combine and render
  return processes.data?.map((p, i) => ({
    ...p,
    metrics: metricsData[i]
  })) || [];
}
```

---

**For complete server action specifications, see:** `docs/architecture/ORGANIZATION-SCHEMA.md`
**For AI integration patterns, see:** `docs/guides/AI-CONTEXT-ENGINEERING.md`
