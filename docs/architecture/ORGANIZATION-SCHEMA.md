# ORGANIZATION-SCHEMA.md

**Status:** ✅ COMPLETE (Phase 2 Content Generation — Story 11.14)

## Overview

Complete schema reference for EPIC 11 organizational structure, encompassing all tables, relationships, and query patterns for areas, nuclei, processes, routines, activities, systems, suppliers, services, and knowledge management.

## Table of Contents

- [Complete Table Reference](#complete-table-reference)
- [Entity Relationships](#entity-relationships)
- [Query Examples](#query-examples)
- [Performance Considerations](#performance-considerations)
- [RLS Enforcement](#rls-enforcement)

## Complete Table Reference

### Core Organizational Tables

This section documents all 16 tables in the EPIC 11 organizational schema, organized by functional layer:

#### Organizational Hierarchy Layer

**`org_areas`**
- `id` (UUID, PK)
- `tenant_id` (UUID, FK, RLS)
- `name` (VARCHAR, 255)
- `description` (TEXT, nullable)
- `objective` (TEXT, nullable)
- `responsible_roles` (JSONB, default '[]')
- `documentation` (JSONB)
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)
- **Indexes:** (tenant_id), (name), responsible_roles (GIN)
- **RLS:** SELECT/INSERT/UPDATE/DELETE where tenant_id = auth.jwt()->>'tenant_id'

**`org_nuclei`**
- `id` (UUID, PK)
- `tenant_id` (UUID, FK, RLS)
- `area_id` (UUID, FK)
- `name` (VARCHAR, 255)
- `description` (TEXT, nullable)
- `objective` (TEXT, nullable)
- `responsible_roles` (JSONB, default '[]')
- `documentation` (JSONB)
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)
- **Indexes:** (tenant_id), (area_id), (name), responsible_roles (GIN)
- **Foreign Key:** area_id → org_areas(id) ON DELETE CASCADE
- **RLS:** SELECT/INSERT/UPDATE/DELETE where tenant_id = auth.jwt()->>'tenant_id'

**`org_processes`**
- `id` (UUID, PK)
- `tenant_id` (UUID, FK, RLS)
- `area_id` (UUID, FK, nullable)
- `nucleus_id` (UUID, FK, nullable)
- `name` (VARCHAR, 255)
- `description` (TEXT, nullable)
- `objective` (TEXT, nullable)
- `inputs` (JSONB, array of OrgInputOutput)
- `outputs` (JSONB, array of OrgInputOutput)
- `responsible_roles` (JSONB, default '[]')
- `risks` (JSONB, default '[]')
- `impacts` (JSONB, default '[]')
- `documentation` (JSONB)
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)
- **Indexes:** (tenant_id), (nucleus_id), (name), responsible_roles (GIN)
- **Foreign Keys:** area_id → org_areas(id), nucleus_id → org_nuclei(id)
- **RLS:** SELECT/INSERT/UPDATE/DELETE where tenant_id = auth.jwt()->>'tenant_id'

**`org_routines`**
- `id` (UUID, PK)
- `tenant_id` (UUID, FK, RLS)
- `process_id` (UUID, FK)
- `name` (VARCHAR, 255)
- `description` (TEXT, nullable)
- `objective` (TEXT, nullable)
- `responsible_roles` (JSONB, default '[]')
- `documentation` (JSONB)
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)
- **Indexes:** (tenant_id), (process_id), (name), responsible_roles (GIN)
- **Foreign Key:** process_id → org_processes(id) ON DELETE CASCADE
- **RLS:** SELECT/INSERT/UPDATE/DELETE where tenant_id = auth.jwt()->>'tenant_id'

**`org_activities`**
- `id` (UUID, PK)
- `tenant_id` (UUID, FK, RLS)
- `routine_id` (UUID, FK)
- `name` (VARCHAR, 255)
- `description` (TEXT, nullable)
- `objective` (TEXT, nullable)
- `complexity` (ENUM: low, medium, high)
- `priority` (ENUM: low, normal, high)
- `required_role` (VARCHAR, nullable)
- `average_execution_time` (INTEGER, nullable, minutes)
- `inputs` (JSONB, array of OrgInputOutput)
- `outputs` (JSONB, array of OrgInputOutput)
- `risks` (JSONB, default '[]')
- `impacts` (JSONB, default '[]')
- `responsible_roles` (JSONB, default '[]') — Story 11.1: Added for role-based execution
- `documentation` (JSONB)
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)
- **Indexes:** (tenant_id), (routine_id), (complexity), (priority), responsible_roles (GIN)
- **Foreign Key:** routine_id → org_routines(id) ON DELETE CASCADE
- **RLS:** SELECT/INSERT/UPDATE/DELETE where tenant_id = auth.jwt()->>'tenant_id'

#### Systems & Resources Layer

**`org_systems`**
- `id` (UUID, PK)
- `tenant_id` (UUID, FK, RLS)
- `name` (VARCHAR, 255)
- `description` (TEXT, nullable)
- `purpose` (TEXT, nullable)
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)
- **Indexes:** (tenant_id), (name)
- **RLS:** SELECT/INSERT/UPDATE/DELETE where tenant_id = auth.jwt()->>'tenant_id'

**`org_system_resources`**
- `id` (UUID, PK)
- `tenant_id` (UUID, FK, RLS)
- `system_id` (UUID, FK)
- `name` (VARCHAR, 255)
- `description` (TEXT, nullable)
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)
- **Indexes:** (tenant_id), (system_id), (name)
- **Foreign Key:** system_id → org_systems(id) ON DELETE CASCADE
- **RLS:** SELECT/INSERT/UPDATE/DELETE where tenant_id = auth.jwt()->>'tenant_id'

**`org_activity_systems`** — Story 11.2: Activity-to-System mappings
- `id` (UUID, PK)
- `tenant_id` (UUID, FK, RLS)
- `activity_id` (UUID, FK)
- `system_id` (UUID, FK)
- `usage_context` (TEXT, nullable)
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)
- **Unique Constraint:** (activity_id, system_id)
- **Indexes:** (tenant_id), (activity_id), (system_id)
- **Foreign Keys:** activity_id → org_activities(id) ON DELETE CASCADE, system_id → org_systems(id) ON DELETE CASCADE
- **RLS:** SELECT/INSERT/UPDATE/DELETE where tenant_id = auth.jwt()->>'tenant_id'

#### Suppliers & Services Layer

**`org_suppliers`**
- `id` (UUID, PK)
- `tenant_id` (UUID, FK, RLS)
- `name` (VARCHAR, 255)
- `description` (TEXT, nullable)
- `responsible_roles` (JSONB, default '[]')
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)
- **Indexes:** (tenant_id), (name), responsible_roles (GIN)
- **RLS:** SELECT/INSERT/UPDATE/DELETE where tenant_id = auth.jwt()->>'tenant_id'

**`org_services`**
- `id` (UUID, PK)
- `tenant_id` (UUID, FK, RLS)
- `name` (VARCHAR, 255)
- `description` (TEXT, nullable)
- `responsible_roles` (JSONB, default '[]')
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)
- **Indexes:** (tenant_id), (name), responsible_roles (GIN)
- **RLS:** SELECT/INSERT/UPDATE/DELETE where tenant_id = auth.jwt()->>'tenant_id'

#### Documentation Layer

**`org_documents`**
- `id` (UUID, PK)
- `tenant_id` (UUID, FK, RLS)
- `name` (VARCHAR, 255)
- `type` (VARCHAR, nullable)
- `description` (TEXT, nullable)
- `associated_process_id` (UUID, FK, nullable)
- `responsible_roles` (JSONB, default '[]')
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)
- **Indexes:** (tenant_id), (associated_process_id), (name), responsible_roles (GIN)
- **Foreign Key:** associated_process_id → org_processes(id) ON DELETE SET NULL
- **RLS:** SELECT/INSERT/UPDATE/DELETE where tenant_id = auth.jwt()->>'tenant_id'

#### SLA & Metrics Layer

**`org_process_slas`** — Story 11.3: SLA definitions per process
- `id` (UUID, PK)
- `tenant_id` (UUID, FK, RLS)
- `process_id` (UUID, FK)
- `name` (VARCHAR, 255)
- `target_cycle_time_hours` (INTEGER)
- `target_quality_percentage` (INTEGER, 0-100)
- `escalation_threshold_hours` (INTEGER, nullable)
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)
- **Indexes:** (tenant_id), (process_id)
- **Foreign Key:** process_id → org_processes(id) ON DELETE CASCADE
- **RLS:** SELECT/INSERT/UPDATE/DELETE where tenant_id = auth.jwt()->>'tenant_id'

**`org_process_metrics`** — Story 11.3: Aggregated metrics per process
- `id` (UUID, PK)
- `tenant_id` (UUID, FK, RLS)
- `process_id` (UUID, FK)
- `metric_date` (DATE)
- `total_cases` (INTEGER)
- `completed_cases` (INTEGER)
- `average_cycle_time_hours` (DECIMAL)
- `quality_percentage` (DECIMAL, 0-100)
- `on_time_percentage` (DECIMAL, 0-100)
- `created_at` (TIMESTAMP)
- **Indexes:** (tenant_id), (process_id), (metric_date)
- **Foreign Key:** process_id → org_processes(id) ON DELETE CASCADE
- **RLS:** SELECT/INSERT/UPDATE/DELETE where tenant_id = auth.jwt()->>'tenant_id'

#### AI & Knowledge Layer

**`org_knowledge_entries`** — Story 11.11: Knowledge base with embeddings
- `id` (UUID, PK)
- `tenant_id` (UUID, FK, RLS)
- `title` (VARCHAR, 255)
- `content` (TEXT)
- `type` (ENUM: process, best_practice, case_study, template, role_guide)
- `related_entity_id` (UUID, nullable)
- `related_entity_type` (VARCHAR, nullable)
- `embedding` (vector(1536), pgvector) — OpenAI embeddings
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)
- **Indexes:** (tenant_id), (type), (related_entity_id), embedding (ivfflat)
- **RLS:** SELECT/INSERT/UPDATE/DELETE where tenant_id = auth.jwt()->>'tenant_id'

**`org_activity_templates`** — Story 11.5: Reusable activity patterns
- `id` (UUID, PK)
- `tenant_id` (UUID, FK, RLS)
- `name` (VARCHAR, 255)
- `description` (TEXT, nullable)
- `activity_template` (JSONB) — Complete activity definition
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)
- **Indexes:** (tenant_id), (name)
- **RLS:** SELECT/INSERT/UPDATE/DELETE where tenant_id = auth.jwt()->>'tenant_id'

#### Bulk Operations Layer

**`bulk_operation_logs`** — Story 11.13: Import/export audit trail
- `id` (UUID, PK)
- `tenant_id` (UUID, FK, RLS)
- `operation_type` (ENUM: import_csv, import_json, export_csv, export_json, bulk_update, bulk_delete)
- `entity_type` (VARCHAR)
- `total_records` (INTEGER)
- `successful_records` (INTEGER)
- `failed_records` (INTEGER)
- `errors` (JSONB, array of error objects)
- `started_at` (TIMESTAMP)
- `completed_at` (TIMESTAMP)
- `created_by` (UUID, FK to auth.users)
- `created_at` (TIMESTAMP)
- **Indexes:** (tenant_id), (operation_type), (created_by), (created_at)
- **RLS:** SELECT/INSERT where tenant_id = auth.jwt()->>'tenant_id'

### Field Reference

All timestamp columns (`created_at`, `updated_at`) use TIMESTAMPTZ(6) for precision and timezone handling.

All JSON columns use JSONB type for efficient querying and indexing.

All responsible_roles columns store an array of role names, e.g., `["advogado", "paralegal", "gerente_operacional"]`.

All tenant_id columns enforce tenant isolation via RLS and are marked as NOT NULL.

## Entity Relationships

### Organizational Hierarchy

The organizational hierarchy follows a strict 5-level structure:

```
Organization (tenant)
├─ Areas (1:N)
│  ├─ Nuclei (1:N)
│  │  ├─ Processes (1:N)
│  │  │  ├─ Routines (1:N)
│  │  │  │  ├─ Activities (1:N)
│  │  │  │  │  └─ Responsible Roles (N:M)
│  │  │  │  └─ Responsible Roles (N:M)
│  │  │  ├─ Responsible Roles (N:M)
│  │  │  ├─ Activity-Systems (N:M via org_activity_systems)
│  │  │  └─ Process SLAs (1:N)
│  │  └─ Responsible Roles (N:M)
│  └─ Responsible Roles (N:M)
├─ Systems (1:N)
│  └─ System Resources (1:N)
├─ Suppliers (1:N)
├─ Services (1:N)
├─ Documents (1:N)
├─ Knowledge Entries (1:N)
├─ Activity Templates (1:N)
└─ Bulk Operation Logs (1:N)
```

**Key Cardinalities:**
- Organization → Areas: 1:N (one org has many areas)
- Area → Nuclei: 1:N (one area has many nuclei)
- Nucleus → Processes: 1:N (one nucleus contains many processes)
- Process → Routines: 1:N (one process has many routines)
- Routine → Activities: 1:N (one routine has many activities)
- Activity → Systems: N:M (activities can use multiple systems via org_activity_systems)
- Activity → Responsible Roles: N:M (stored as JSONB array on activity)
- Process → SLA: 1:N (one process can have multiple SLA versions)
- Process → Metrics: 1:N (daily metrics aggregations)

### Cascade Behavior

**ON DELETE CASCADE:**
- Deleting an Area cascades to all Nuclei within it
- Deleting a Nucleus cascades to all Processes within it
- Deleting a Process cascades to all Routines and associated Activity-Systems
- Deleting a Routine cascades to all Activities
- Deleting an Activity cascades to all Activity-System mappings

**ON DELETE SET NULL:**
- Deleting a Document sets associated_process_id to NULL

**Important:** Bulk deletion of higher-level entities (e.g., deleting an Area) will delete all descendant entities. Use with caution.

### ERD (Entity Relationship Diagram)

```
                    ┌─────────────┐
                    │ Organizations│
                    │ (tenant_id)  │
                    └───────┬─────┘
                            │ 1:N
                    ┌───────▼──────┐
                    │  org_areas   │
                    ├──────────────┤
                    │ id (PK)      │
                    │ tenant_id (FK)
                    │ name         │
                    │ responsible_ │
                    │ roles (JSONB)│
                    └───────┬──────┘
                            │ 1:N
                    ┌───────▼────────┐
                    │ org_nuclei     │
                    ├────────────────┤
                    │ id (PK)        │
                    │ area_id (FK)   │
                    │ responsible_   │
                    │ roles (JSONB)  │
                    └───────┬────────┘
                            │ 1:N
                    ┌───────▼─────────┐
                    │ org_processes   │
                    ├─────────────────┤
                    │ id (PK)         │
                    │ nucleus_id (FK) │
                    │ inputs/outputs  │
                    │ risks/impacts   │
                    │ responsible_    │
                    │ roles (JSONB)   │
                    └───────┬─────────┘
                            │ 1:N       1:N (N:M)
                            │    ┌──────────────┐
                    ┌───────▼──┐ │ org_activity_│
                    │ org_     │ │  systems     │
                    │routines  │ └──────┬───────┘
                    ├─────────┤        │ FK
                    │ id (PK) │        │
                    │process_ │   ┌────▼──────┐
                    │id (FK)  │   │org_systems│
                    └───────┬─┘   ├───────────┤
                            │     │ id (PK)   │
                    ┌───────▼─┐  │ name      │
                    │org_     │  │ purpose   │
                    │activities
                    ├─────────┤  └───────────┘
                    │ id (PK) │
                    │routine_ │
                    │id (FK)  │
                    │complexity
                    │priority │
                    │responsible_
                    │roles    │
                    └─────────┘
```

**Cross-Entity Relationships:**
- org_documents → org_processes (associated_process_id, nullable)
- org_activity_systems → org_activities & org_systems (N:M junction)
- org_process_slas → org_processes (1:N SLA versions)
- org_process_metrics → org_processes (1:N daily metrics)
- org_knowledge_entries → various entities (related_entity_type, nullable)
- org_activity_templates → reusable patterns
- bulk_operation_logs → audit trail (created_by → auth.users)

## Query Examples

### Common Queries

#### 1. Get All Activities in an Area (With Full Hierarchy)

```sql
SELECT DISTINCT
  a.id, a.name, a.complexity, a.priority,
  a.responsible_roles,
  r.name as routine_name,
  p.name as process_name,
  n.name as nucleus_name,
  ar.name as area_name
FROM org_activities a
JOIN org_routines r ON a.routine_id = r.id
JOIN org_processes p ON r.process_id = p.id
LEFT JOIN org_nuclei n ON p.nucleus_id = n.id
LEFT JOIN org_areas ar ON n.area_id = ar.id
WHERE ar.id = $1  -- area_id parameter
  AND a.tenant_id = $2
ORDER BY ar.name, n.name, p.name, r.name, a.name;
```

**Performance:** Uses indexed (routine_id, process_id, nucleus_id, area_id). Expected < 100ms for 10K activities.

#### 2. Search Processes by Complexity and Responsible Roles

```sql
SELECT DISTINCT
  p.id, p.name, p.description,
  p.complexity, p.responsible_roles,
  COUNT(DISTINCT r.id) as routine_count,
  COUNT(DISTINCT a.id) as activity_count
FROM org_processes p
LEFT JOIN org_routines r ON p.id = r.process_id
LEFT JOIN org_activities a ON r.id = a.routine_id
WHERE p.tenant_id = $1
  AND p.complexity = $2  -- 'high', 'medium', or 'low'
  AND p.responsible_roles @> $3::jsonb  -- @> is containment operator
GROUP BY p.id, p.name, p.description, p.complexity, p.responsible_roles
ORDER BY p.name;
```

**Performance:** GIN index on responsible_roles enables fast containment checks. Expected < 50ms.

#### 3. Find Activities Assigned to a Specific Role

```sql
SELECT
  a.id, a.name, a.complexity, a.priority,
  r.name as routine_name,
  p.name as process_name,
  n.name as nucleus_name
FROM org_activities a
JOIN org_routines r ON a.routine_id = r.id
JOIN org_processes p ON r.process_id = p.id
LEFT JOIN org_nuclei n ON p.nucleus_id = n.id
WHERE a.tenant_id = $1
  AND a.responsible_roles @> $2::jsonb  -- @> checks if array contains string
ORDER BY a.priority DESC, a.complexity DESC;
```

**To check for specific role:**
```sql
-- Check if activity has "advogado" role assigned
WHERE a.responsible_roles @> '"advogado"'::jsonb
```

#### 4. Get Complete Organization Structure (Full Hierarchy)

```sql
WITH RECURSIVE org_tree AS (
  -- Base case: All areas
  SELECT
    1 as depth,
    ar.id, ar.name, ar.responsible_roles,
    NULL::uuid as parent_id, 'area'::text as entity_type,
    ar.tenant_id
  FROM org_areas ar
  WHERE ar.tenant_id = $1

  UNION ALL

  -- Nuclei under areas
  SELECT
    2, n.id, n.name, n.responsible_roles,
    n.area_id, 'nucleus', n.tenant_id
  FROM org_nuclei n
  JOIN org_tree t ON n.area_id = t.id AND n.tenant_id = t.tenant_id

  UNION ALL

  -- Processes under nuclei
  SELECT
    3, p.id, p.name, p.responsible_roles,
    p.nucleus_id, 'process', p.tenant_id
  FROM org_processes p
  JOIN org_tree t ON p.nucleus_id = t.id AND p.tenant_id = t.tenant_id

  UNION ALL

  -- Routines under processes
  SELECT
    4, r.id, r.name, r.responsible_roles,
    r.process_id, 'routine', r.tenant_id
  FROM org_routines r
  JOIN org_tree t ON r.process_id = t.id AND r.tenant_id = t.tenant_id

  UNION ALL

  -- Activities under routines
  SELECT
    5, a.id, a.name, a.responsible_roles,
    a.routine_id, 'activity', a.tenant_id
  FROM org_activities a
  JOIN org_tree t ON a.routine_id = t.id AND a.tenant_id = t.tenant_id
)
SELECT * FROM org_tree
ORDER BY depth, name;
```

**Performance:** Recursive CTEs are slower but useful for visualizing full structure. Expected ~200-500ms for 5K entities.

#### 5. Retrieve SLA Metrics for a Process

```sql
SELECT
  ps.id, ps.name,
  ps.target_cycle_time_hours,
  ps.target_quality_percentage,
  ps.escalation_threshold_hours,
  pm.metric_date,
  pm.total_cases,
  pm.completed_cases,
  pm.average_cycle_time_hours,
  pm.quality_percentage,
  pm.on_time_percentage,
  CASE
    WHEN pm.on_time_percentage >= ps.target_quality_percentage THEN 'COMPLIANT'
    WHEN pm.on_time_percentage >= (ps.target_quality_percentage * 0.9) THEN 'WARNING'
    ELSE 'NON-COMPLIANT'
  END as sla_status
FROM org_process_slas ps
LEFT JOIN org_process_metrics pm ON ps.process_id = pm.process_id
WHERE ps.process_id = $1  -- process_id parameter
  AND ps.tenant_id = $2
  AND pm.metric_date >= CURRENT_DATE - INTERVAL '30 days'
ORDER BY pm.metric_date DESC;
```

**Performance:** Indexed (process_id, metric_date). Expected < 50ms.

#### 6. Find Activities Using Specific Systems

```sql
SELECT DISTINCT
  a.id, a.name, a.complexity,
  s.name as system_name,
  s.purpose as system_purpose,
  ast.usage_context
FROM org_activities a
JOIN org_activity_systems ast ON a.id = ast.activity_id
JOIN org_systems s ON ast.system_id = s.id
WHERE s.id = $1  -- system_id parameter
  AND a.tenant_id = $2
ORDER BY a.name;
```

**Performance:** Indexed (activity_id, system_id). Expected < 50ms.

#### 7. Get Activities by Template (Story 11.5)

```sql
SELECT
  a.id, a.name, a.complexity, a.priority,
  a.responsible_roles, a.documentation,
  CASE
    WHEN a.documentation @> $1::jsonb THEN 'USES_TEMPLATE'
    ELSE 'CUSTOM'
  END as activity_source
FROM org_activities a
WHERE a.tenant_id = $1
  AND a.documentation @> $2::jsonb  -- Check if uses specific template
ORDER BY a.name;
```

**Performance:** JSONB containment check via GIN index. Expected < 100ms.

#### 8. Knowledge Base Search with Embeddings (Story 11.11)

```sql
SELECT
  ke.id, ke.title, ke.content, ke.type,
  ke.related_entity_type, ke.related_entity_id,
  1 - (ke.embedding <=> $1::vector) as similarity_score
FROM org_knowledge_entries ke
WHERE ke.tenant_id = $2
ORDER BY similarity_score DESC
LIMIT 10;
```

**Performance:** Vector similarity search using pgvector IVFFlat index. Expected 10-50ms.

#### 9. Bulk Operations Audit Trail

```sql
SELECT
  bol.id, bol.operation_type, bol.entity_type,
  bol.total_records, bol.successful_records, bol.failed_records,
  bol.started_at, bol.completed_at,
  bol.errors,
  u.email as performed_by
FROM bulk_operation_logs bol
LEFT JOIN auth.users u ON bol.created_by = u.id
WHERE bol.tenant_id = $1
ORDER BY bol.created_at DESC
LIMIT 20;
```

**Performance:** Indexed (tenant_id, created_by, created_at). Expected < 50ms.

## Performance Considerations

### Indexes

The following indexes are created to ensure optimal query performance:

**B-tree Indexes (Foreign Keys & Common Filters):**
- `idx_org_nuclei_area_id` on org_nuclei(area_id)
- `idx_org_nuclei_tenant_id` on org_nuclei(tenant_id)
- `idx_org_processes_nucleus_id` on org_processes(nucleus_id)
- `idx_org_processes_area_id` on org_processes(area_id)
- `idx_org_processes_tenant_id` on org_processes(tenant_id)
- `idx_org_routines_process_id` on org_routines(process_id)
- `idx_org_routines_tenant_id` on org_routines(tenant_id)
- `idx_org_activities_routine_id` on org_activities(routine_id)
- `idx_org_activities_tenant_id` on org_activities(tenant_id)
- `idx_org_activities_complexity` on org_activities(complexity)
- `idx_org_activities_priority` on org_activities(priority)
- `idx_org_system_resources_system_id` on org_system_resources(system_id)
- `idx_org_activity_systems_activity_id` on org_activity_systems(activity_id)
- `idx_org_activity_systems_system_id` on org_activity_systems(system_id)
- `idx_org_process_slas_process_id` on org_process_slas(process_id)
- `idx_org_process_metrics_process_id` on org_process_metrics(process_id)
- `idx_org_process_metrics_metric_date` on org_process_metrics(metric_date)
- `idx_bulk_operation_logs_created_at` on bulk_operation_logs(created_at)
- `idx_bulk_operation_logs_created_by` on bulk_operation_logs(created_by)

**GIN Indexes (JSONB Columns):**
- `idx_org_areas_responsible_roles_gin` on org_areas using GIN(responsible_roles)
- `idx_org_nuclei_responsible_roles_gin` on org_nuclei using GIN(responsible_roles)
- `idx_org_processes_responsible_roles_gin` on org_processes using GIN(responsible_roles)
- `idx_org_routines_responsible_roles_gin` on org_routines using GIN(responsible_roles)
- `idx_org_activities_responsible_roles_gin` on org_activities using GIN(responsible_roles)
- `idx_org_suppliers_responsible_roles_gin` on org_suppliers using GIN(responsible_roles)
- `idx_org_services_responsible_roles_gin` on org_services using GIN(responsible_roles)
- `idx_org_documents_responsible_roles_gin` on org_documents using GIN(responsible_roles)

**Vector Indexes (Embeddings):**
- `idx_org_knowledge_entries_embedding` on org_knowledge_entries using ivfflat(embedding)

### Query Performance Expectations

| Query Type | Expected Time | Data Size | Notes |
|-----------|--------------|-----------|-------|
| Activity lookup by ID | < 10ms | Single row | Direct PK lookup |
| Activities in routine | 10-30ms | 10-50 rows | Single FK + filter |
| All activities in process | 30-100ms | 50-500 rows | Recursive join (4 levels) |
| All activities in area | 50-200ms | 500-5K rows | Recursive join (5 levels) |
| Search by responsible role | 20-80ms | 100-1K rows | GIN index containment |
| SLA metrics for process | 15-50ms | 30 rows | Indexed FK + date filter |
| Knowledge search (embeddings) | 30-100ms | Top 10 | Vector similarity (IVFFlat) |
| Bulk operation lookup | 10-30ms | 20-100 rows | B-tree index on (tenant_id, created_at) |

### Pagination Strategies

For large result sets (>1000 rows), always use cursor-based pagination:

```sql
-- Cursor-based pagination (recommended)
SELECT * FROM org_activities
WHERE tenant_id = $1
  AND id > $2  -- cursor (last_id from previous page)
ORDER BY id
LIMIT 50;
```

**Avoid OFFSET pagination** on large tables — it rescans all rows:
```sql
-- ❌ SLOW: Rescans all rows
SELECT * FROM org_activities
OFFSET 10000 LIMIT 50;

-- ✅ FAST: Seeks to cursor position
SELECT * FROM org_activities
WHERE id > cursor_value
LIMIT 50;
```

### Caching Recommendations

**Query Results to Cache (with TTL):**
- Organization structure (Areas → Nuclei → Processes) — 5 minute TTL
- Process SLAs per process — 10 minute TTL
- Available roles/responsible_roles — 30 minute TTL
- Activity templates — 1 hour TTL
- Knowledge base search results — 15 minute TTL

**Use Supabase cache layer or Redis for:**
```typescript
// Example: Cache org structure
const cacheKey = `org-structure-${tenant_id}`;
const cached = await redis.get(cacheKey);
if (cached) return JSON.parse(cached);

const structure = await supabase
  .from('org_areas')
  .select('...', { recursive: true })
  .eq('tenant_id', tenant_id);

await redis.setex(cacheKey, 300, JSON.stringify(structure)); // 5 min TTL
return structure;
```

**DO NOT CACHE:**
- Metrics and SLA compliance (real-time data)
- Bulk operation logs (audit trail)
- User-specific role assignments (personalization)
- Real-time embeddings searches

## RLS Enforcement

### Row-Level Security Policies (ADR-001)

All organizational tables implement tenant isolation via PostgreSQL RLS. Each table enforces the following policy structure:

**SELECT Policy:**
```sql
CREATE POLICY "Tenant isolation (select)" ON org_areas
  FOR SELECT USING (tenant_id = auth.jwt()->>'tenant_id');
```

**INSERT Policy:**
```sql
CREATE POLICY "Tenant isolation (insert)" ON org_areas
  FOR INSERT WITH CHECK (tenant_id = auth.jwt()->>'tenant_id');
```

**UPDATE Policy:**
```sql
CREATE POLICY "Tenant isolation (update)" ON org_areas
  FOR UPDATE USING (tenant_id = auth.jwt()->>'tenant_id')
  WITH CHECK (tenant_id = auth.jwt()->>'tenant_id');
```

**DELETE Policy:**
```sql
CREATE POLICY "Tenant isolation (delete)" ON org_areas
  FOR DELETE USING (tenant_id = auth.jwt()->>'tenant_id');
```

### Tenant Filtering Rules

Every query automatically filters by the authenticated user's `tenant_id`:
- Users can only see/modify data where `tenant_id = auth.jwt()->>'tenant_id'`
- Cross-tenant data access is impossible at the database level
- Foreign key relationships are respected (e.g., cannot add process to another tenant's nucleus)

### Write Access Restrictions

**Immutable Fields (Cannot UPDATE):**
- `id` (primary key)
- `tenant_id` (enforced by RLS)
- `created_at` (auto-set)

**Auditable Fields (Update tracked):**
- `updated_at` is automatically set to NOW() on any UPDATE
- No manual update_at modification allowed

**Validation on INSERT/UPDATE:**
- All responsible_roles values must be valid role names
- Activity complexity/priority must be valid ENUMs
- Foreign keys must reference entities in the same tenant
- Hierarchical constraints enforced (e.g., nucleus must have area_id)

### Testing RLS Policies

Test RLS enforcement with:

```typescript
// Test 1: User cannot see other tenant's data
const tenant1_user = supabase.auth.setSession(tenant1_token);
const result = await tenant1_user
  .from('org_areas')
  .select('*')
  .eq('tenant_id', OTHER_TENANT_ID);

// Should return 0 rows (RLS blocks access)
assert(result.data.length === 0, 'RLS isolation failed');

// Test 2: Cannot INSERT with different tenant_id
const insert_result = await tenant1_user
  .from('org_areas')
  .insert({ tenant_id: OTHER_TENANT_ID, name: 'Hacker Area' });

// Should fail (RLS check fails on INSERT)
assert(insert_result.error !== null, 'RLS write check failed');
```

For complete RLS test suite, see `docs/security/rls-testing.md`.

---

**Next:** When Story 11.13 ≥75%, Phase 2 content generation will populate all sections.
