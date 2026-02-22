# Database Schema — Tech Arauz

**Document**: Phase 2 of Brownfield Discovery
**Date**: 2026-02-21
**Project**: Tech Arauz - Portal de Gestão 360° de TI/Inovação/Projetos
**Status**: 25 migrations applied | All tables syncing | RLS enforced | Production-ready

---

## 🗄️ Executive Summary

Tech Arauz database is a **PostgreSQL 15+ schema** (Supabase managed) with **11 core tables**, **25 sequential migrations**, **multi-tenant RLS isolation**, and **idempotent sync patterns**. The schema is **production-active**, **well-indexed**, and **audit-traced**.

### Key Metrics
- **Total Tables**: 11 core + operational
- **Migrations Applied**: 25 (001-025)
- **RLS Policies**: 40+ (all tables covered)
- **Unique Constraints**: 8 (idempotent sync)
- **Foreign Keys**: 15+ (referential integrity)
- **CHECK Constraints**: 7 (data validation)
- **Indices**: 35+ (query optimization)
- **Synced Datasets**: 7 (Projetos → Entregas → Cronogramas → Requisitos → Históricos → Aprovadores → Orçamentos)

---

## 📋 Table Inventory

### **Tenant & Identity**

#### `tenants`
Multi-tenant container (single-tenant active: "arauz")

```sql
id          UUID PRIMARY KEY DEFAULT gen_random_uuid()
slug        TEXT NOT NULL UNIQUE
name        TEXT NOT NULL
settings    JSONB DEFAULT '{}'
created_at  TIMESTAMPTZ DEFAULT now()
updated_at  TIMESTAMPTZ DEFAULT now()

-- Indices
idx_tenants_slug (slug)
```

**Purpose**: Tenant metadata, configuration
**RLS**: Service role only (system managed)
**Records**: 1 (Araúz & Advogados)

#### `profiles`
User profiles (extends Supabase auth.users)

```sql
id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE
tenant_id   UUID NOT NULL REFERENCES tenants(id)
email       TEXT NOT NULL
full_name   TEXT
role        TEXT CHECK (role IN ('admin', 'user', 'viewer'))
avatar_url  TEXT
settings    JSONB DEFAULT '{}'
is_active   BOOLEAN DEFAULT true
created_at  TIMESTAMPTZ DEFAULT now()
updated_at  TIMESTAMPTZ DEFAULT now()

-- Indices
idx_profiles_tenant_id (tenant_id)
idx_profiles_role (role)
idx_profiles_email (email)

-- Constraint
UNIQUE(tenant_id, email)
```

**Purpose**: User metadata + role assignment
**RLS**: Users see own profile + role checking
**Role Hierarchy**: `admin` > `user` > `viewer`
**Auth Integration**: JWT sub claim → profiles.id

---

### **Core Domain Tables** (Synced from Espaider)

#### `projects`
Project root entities (master record for all children)

```sql
id                      UUID PRIMARY KEY DEFAULT gen_random_uuid()
tenant_id               UUID NOT NULL REFERENCES tenants(id)
espaider_id             BIGINT NOT NULL
codigo                  TEXT NOT NULL
titulo                  TEXT NOT NULL
status                  TEXT DEFAULT 'Novo'
situacao_original       TEXT  -- Raw Espaider status
responsavel             TEXT
prioridade              TEXT DEFAULT 'Normal'
categoria               TEXT
fase_atual              TEXT
progresso_percentual    NUMERIC(5,2)
prazo_final             DATE
descricao_curta         TEXT
notas_html              TEXT  -- Rich text editor (TipTap)
data_inicio             DATE
data_fim                DATE
created_at              TIMESTAMPTZ DEFAULT now()
updated_at              TIMESTAMPTZ DEFAULT now()
espaider_raw            JSONB  -- Audit trail

-- Indices
idx_projects_tenant_id (tenant_id)
idx_projects_espaider_id (espaider_id)
idx_projects_status (status)
idx_projects_categoria (categoria)
idx_projects_updated_at (updated_at DESC)  -- For "recent projects" queries

-- Constraints
UNIQUE(tenant_id, espaider_id)  -- Idempotent sync
```

**Purpose**: Root entity for all child records
**Sync Dataset**: `BI_SOLICITACOES_SUPORTEESPAIDER`
**RLS**: Tenant isolation
**Audit**: espaider_raw stores raw API response
**Records**: 45+ active projects
**Update Frequency**: Hourly (manual trigger available)

#### `deliveries`
Project deliverables/outputs

```sql
id              UUID PRIMARY KEY DEFAULT gen_random_uuid()
tenant_id       UUID NOT NULL REFERENCES tenants(id)
project_id      UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE
espaider_id     BIGINT NOT NULL
titulo          TEXT NOT NULL
status          TEXT
descricao       TEXT
responsavel     TEXT
data_entrega    DATE
fase_entrega    TEXT
created_at      TIMESTAMPTZ DEFAULT now()
updated_at      TIMESTAMPTZ DEFAULT now()
espaider_raw    JSONB

-- Indices
idx_deliveries_tenant_id (tenant_id)
idx_deliveries_project_id (project_id)
idx_deliveries_espaider_id (espaider_id)

-- Constraints
UNIQUE(tenant_id, espaider_id)  -- Idempotent sync
CHECK(status IN ('Planejamento', 'Execução', 'Entregue', 'Cancelada', NULL))
```

**Purpose**: Track project outputs/deliverables
**Parent**: projects (FK)
**RLS**: Tenant isolation + project inheritance
**Records**: 329+ deliverables
**Dependency**: Synced after projects

#### `schedules`
Project activities/timelines (Cronograma)

```sql
id              UUID PRIMARY KEY DEFAULT gen_random_uuid()
tenant_id       UUID NOT NULL REFERENCES tenants(id)
project_id      UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE
espaider_id     BIGINT NOT NULL
atividade       TEXT NOT NULL
descricao       TEXT
status          TEXT
data_inicio     DATE
data_fim        DATE
fase_atividade  TEXT
responsavel     TEXT
created_at      TIMESTAMPTZ DEFAULT now()
updated_at      TIMESTAMPTZ DEFAULT now()
espaider_raw    JSONB

-- Indices
idx_schedules_tenant_id (tenant_id)
idx_schedules_project_id (project_id)
idx_schedules_espaider_id (espaider_id)
idx_schedules_data_inicio (data_inicio)
idx_schedules_data_fim (data_fim)

-- Constraints
UNIQUE(tenant_id, espaider_id)
```

**Purpose**: Timeline management, Gantt chart source
**Parent**: projects (FK)
**RLS**: Tenant isolation
**Records**: 1200+ schedules
**Dependency**: Synced after projects
**Note**: Powers the /cronogramas Gantt view

#### `requirements`
Project specifications/requirements

```sql
id              UUID PRIMARY KEY DEFAULT gen_random_uuid()
tenant_id       UUID NOT NULL REFERENCES tenants(id)
project_id      UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE
espaider_id     BIGINT NOT NULL
codigo          TEXT NOT NULL
descricao       TEXT
tipo            TEXT
status          TEXT
prioridade      TEXT
created_at      TIMESTAMPTZ DEFAULT now()
updated_at      TIMESTAMPTZ DEFAULT now()
espaider_raw    JSONB

-- Indices
idx_requirements_tenant_id (tenant_id)
idx_requirements_project_id (project_id)
idx_requirements_espaider_id (espaider_id)
idx_requirements_tipo (tipo)

-- Constraints
UNIQUE(tenant_id, espaider_id)
```

**Purpose**: Requirement tracking, spec management
**Parent**: projects (FK)
**Records**: 845+ requirements
**Dependency**: Synced after projects

#### `histories`
Project activity history (audit trail from Espaider)

```sql
id              UUID PRIMARY KEY DEFAULT gen_random_uuid()
tenant_id       UUID NOT NULL REFERENCES tenants(id)
project_id      UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE
espaider_id     BIGINT NOT NULL
tipo            TEXT
data            TIMESTAMPTZ
descricao       TEXT
responsavel     TEXT
created_at      TIMESTAMPTZ DEFAULT now()
updated_at      TIMESTAMPTZ DEFAULT now()
espaider_raw    JSONB

-- Indices
idx_histories_tenant_id (tenant_id)
idx_histories_project_id (project_id)
idx_histories_data (data DESC)  -- For timeline view

-- Constraints
UNIQUE(tenant_id, espaider_id)
CHECK(tipo IN ('Criação', 'Modificação', 'Status', 'Anotação', NULL))
```

**Purpose**: Immutable activity timeline
**Parent**: projects (FK)
**Records**: 5,745+ history entries
**Dependency**: Synced after projects
**Note**: Powers ProjectTimeline component

#### `approvers`
Project reviewers/approvers

```sql
id              UUID PRIMARY KEY DEFAULT gen_random_uuid()
tenant_id       UUID NOT NULL REFERENCES tenants(id)
project_id      UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE
espaider_id     BIGINT NOT NULL
tipo            TEXT
responsavel     TEXT
data_aprovacao  DATE
status_aprovacao TEXT
created_at      TIMESTAMPTZ DEFAULT now()
updated_at      TIMESTAMPTZ DEFAULT now()
espaider_raw    JSONB

-- Indices
idx_approvers_tenant_id (tenant_id)
idx_approvers_project_id (project_id)

-- Constraints
UNIQUE(tenant_id, espaider_id)
CHECK(status_aprovacao IN ('Pendente', 'Aprovado', 'Rejeitado', NULL))
```

**Purpose**: Approval workflow tracking
**Parent**: projects (FK)
**Records**: 329+ approvers
**Dependency**: Synced after projects

#### `budgets`
Project budget records (Orçamentos)

```sql
id              UUID PRIMARY KEY DEFAULT gen_random_uuid()
tenant_id       UUID NOT NULL REFERENCES tenants(id)
project_id      UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE
espaider_id     BIGINT NOT NULL
valor           NUMERIC(12,2)
fornecedor      TEXT
descricao       TEXT
status          TEXT
data_criacao    DATE
created_at      TIMESTAMPTZ DEFAULT now()
updated_at      TIMESTAMPTZ DEFAULT now()
espaider_raw    JSONB

-- Indices
idx_budgets_tenant_id (tenant_id)
idx_budgets_project_id (project_id)

-- Constraints
UNIQUE(tenant_id, espaider_id)
CHECK(status IN ('Rascunho', 'Aprovado', 'Executado', 'Cancelado', NULL))
```

**Purpose**: Cost tracking + financial planning
**Parent**: projects (FK)
**Records**: 156+ budgets
**Dependency**: Synced after projects

---

### **Operational Tables**

#### `integration_log_entries`
Sync audit trail (7 datasets tracked)

```sql
id          UUID PRIMARY KEY DEFAULT gen_random_uuid()
tenant_id   UUID NOT NULL REFERENCES tenants(id)
dataset     TEXT NOT NULL  -- 'Projetos', 'Entregas', 'Cronogramas', 'Requisitos', 'Historicos', 'Aprovadores', 'Orcamentos', 'Geral'
level       TEXT NOT NULL  -- 'info', 'warn', 'error'
message     TEXT NOT NULL
metadata    JSONB  -- { recordsCreated, recordsUpdated, error, ... }
created_at  TIMESTAMPTZ DEFAULT now()

-- Indices
idx_integration_logs_tenant_id (tenant_id)
idx_integration_logs_dataset (dataset)
idx_integration_logs_level (level)
idx_integration_logs_created_at (created_at DESC)  -- For filtering by date

-- Constraints
CHECK(dataset IN ('Projetos', 'Entregas', 'Cronogramas', 'Requisitos', 'Historicos', 'Aprovadores', 'Orcamentos', 'Geral'))
CHECK(level IN ('info', 'warn', 'error'))
```

**Purpose**: Sync operation audit trail + debugging
**RLS**: Complex (users see own tenant, admin can view all)
**Records**: 664+ log entries
**Retention**: Unlimited (consider purging older than 90 days)
**Queried By**: LogViewer component + summary API

**Metadata Example**:
```json
{
  "recordsCreated": 12,
  "recordsUpdated": 5,
  "recordsSkipped": 0,
  "error": null,
  "duration_ms": 1234
}
```

#### `espaider_apis`
API credentials + configuration

```sql
id              UUID PRIMARY KEY DEFAULT gen_random_uuid()
tenant_id       UUID NOT NULL REFERENCES tenants(id)
identificador   TEXT NOT NULL  -- e.g., "BI_SOLICITACOES_SUPORTEESPAIDER"
base_url        TEXT NOT NULL
token           TEXT NOT NULL
is_active       BOOLEAN DEFAULT true
created_at      TIMESTAMPTZ DEFAULT now()
updated_at      TIMESTAMPTZ DEFAULT now()

-- Indices
idx_espaider_apis_tenant_id (tenant_id)
idx_espaider_apis_identificador (identificador)

-- Constraints
UNIQUE(tenant_id, identificador)
```

**Purpose**: Multi-API support + credential management
**RLS**: Service role only (sensitive credentials)
**Records**: 1 active (BI_SOLICITACOES_SUPORTEESPAIDER)
**Fallback**: Environment variables if table not available
**Security**: Never expose in responses to client

---

## 🔐 RLS (Row Level Security) Policies

### **Principle**
All tables enforce tenant isolation: users can only access rows where `tenant_id` matches their profile's `tenant_id`.

### **Policy Template**

```sql
-- For SELECT operations
CREATE POLICY "users_can_view_own_tenant" ON <table>
  FOR SELECT TO authenticated
  USING (tenant_id = auth.uid());

-- For service role (sync operations)
CREATE POLICY "service_role_manages_all" ON <table>
  FOR ALL TO service_role
  USING (true) WITH CHECK (true);
```

### **Exceptions & Special Handling**

**integration_log_entries** (Logs are non-critical):
- Service role can write (during sync)
- Authenticated users can read (own tenant)
- Admin users can see detailed metadata
- Graceful degradation if logging fails

**espaider_apis** (Credentials are sensitive):
- Service role only (no authenticated user access)
- Never exposed in API responses
- Token field masked in logs

**profiles** (Identity):
- Users see own profile
- Admin sees all profiles in tenant
- Email is indexed for lookup

### **Helper Functions** (Database-side)

```sql
-- Get current user's tenant ID from JWT
CREATE OR REPLACE FUNCTION public.get_user_tenant_id()
RETURNS UUID AS $$
  SELECT tenant_id FROM public.profiles WHERE id = auth.uid()
$$ LANGUAGE SQL STABLE;

-- Get current user's role
CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS TEXT AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid()
$$ LANGUAGE SQL STABLE;
```

---

## 📊 Migration History

### **Phase 1: Core Schema** (001-007)
| Migration | Purpose | Status |
|-----------|---------|--------|
| 001 | Initial schema (11 tables) | ✅ Applied |
| 002 | RLS policies | ✅ Applied |
| 003 | Seed tenant arauz | ✅ Applied |
| 004 | espaider_apis table | ✅ Applied |
| 005 | Consolidate to single API | ✅ Applied |
| 006 | integration_log_entries | ✅ Applied |
| 007 | Fix espaider_apis RLS | ✅ Applied |

### **Phase 2: Field Additions** (008-015)
| Migration | Purpose | Status |
|-----------|---------|--------|
| 008 | Add project.situacao_original | ✅ Applied |
| 009 | Add project phase fields | ✅ Applied |
| 010 | Add schedule phase fields | ✅ Applied |
| 011 | Add delivery fields | ✅ Applied |
| 012 | Add requirement fields | ✅ Applied |
| 013 | Add child tables schema | ✅ Applied |
| 014 | Add project 360° fields | ✅ Applied |
| 015 | Rename status column | ✅ Applied |

### **Phase 3: Schema Fixes** (016-025)
| Migration | Purpose | Status |
|-----------|---------|--------|
| 016 | Fix child tables (⚠️ reverted) | ❌ Rolled back |
| 017 | Fix RLS policies (⚠️ reverted) | ❌ Rolled back |
| 018 | Fix primary keys (⚠️ reverted) | ❌ Rolled back |
| 019 | Rollback + correct schema | ✅ Applied |
| 020 | Expand dataset constraints | ✅ Applied |
| 021 | Add RLS for child tables | ✅ Applied |
| 022 | Add project.notas_html | ✅ Applied |
| 023 | Fix integration_log RLS | ✅ Applied |
| 024 | Redesign log policies | ✅ Applied |
| 025 | Consolidate RLS | ✅ Applied |

**Key Decision** (Migration 019):
- Rolled back migrations 016-018 which used incorrect schema pattern
- Implemented correct pattern: `id UUID PRIMARY KEY` (not SERIAL)
- Added `UNIQUE(tenant_id, espaider_id)` for idempotent syncs
- Fixed RLS policies to allow service role INSERTs

---

## 📈 Indices & Query Optimization

### **Query Patterns & Supporting Indices**

| Pattern | Indices | Notes |
|---------|---------|-------|
| `SELECT * FROM projects WHERE tenant_id = ?` | idx_projects_tenant_id | Primary query |
| `SELECT * FROM projects WHERE espaider_id = ?` | idx_projects_espaider_id | Sync lookups |
| `SELECT * FROM projects WHERE status = ?` | idx_projects_status | Dashboard filters |
| `SELECT * FROM projects WHERE updated_at > ? ORDER BY updated_at DESC` | idx_projects_updated_at (DESC) | "Recent projects" |
| `SELECT * FROM schedules WHERE data_inicio BETWEEN ? AND ?` | idx_schedules_data_inicio, idx_schedules_data_fim | Gantt chart range queries |
| `SELECT * FROM histories WHERE project_id = ? ORDER BY data DESC` | idx_histories_project_id, idx_histories_data | Timeline view |
| `SELECT * FROM integration_log_entries WHERE created_at > ? ORDER BY created_at DESC` | idx_integration_logs_created_at | Log filtering |

### **Index Coverage**

**Fully Indexed** (all query patterns covered):
- projects (7 indices)
- deliveries (3 indices)
- schedules (5 indices)
- requirements (3 indices)
- histories (3 indices)
- approvers (2 indices)
- budgets (2 indices)

**Composite Index Opportunities** (for future optimization):
```sql
-- For dashboard filtering
CREATE INDEX idx_projects_status_updated ON projects(status, updated_at DESC)

-- For tenant + dataset queries
CREATE INDEX idx_integration_logs_tenant_dataset ON integration_log_entries(tenant_id, dataset)
```

---

## ✅ Data Validation

### **Constraints by Table**

| Table | Constraint Type | Values |
|-------|-----------------|--------|
| profiles | role | 'admin', 'user', 'viewer' |
| deliveries | status | 'Planejamento', 'Execução', 'Entregue', 'Cancelada' |
| schedules | (no CHECK) | — |
| requirements | (no CHECK) | — |
| histories | tipo | 'Criação', 'Modificação', 'Status', 'Anotação' |
| approvers | status_aprovacao | 'Pendente', 'Aprovado', 'Rejeitado' |
| budgets | status | 'Rascunho', 'Aprovado', 'Executado', 'Cancelado' |
| integration_log_entries | level | 'info', 'warn', 'error' |
| integration_log_entries | dataset | 'Projetos', 'Entregas', 'Cronogramas', 'Requisitos', 'Historicos', 'Aprovadores', 'Orcamentos', 'Geral' |

### **Referential Integrity**

All foreign keys use `ON DELETE CASCADE`:
- Child tables (deliveries, schedules, requirements, histories, approvers, budgets) → projects
- profiles → tenants
- Integration tables → tenants

**Impact**: Deleting a project automatically deletes all children (safe cleanup)

---

## 📊 Data Statistics

### **Active Records** (as of 2026-02-21)

| Table | Records | Synced From Espaider | Last Sync |
|-------|---------|---------------------|-----------|
| tenants | 1 | — | — |
| profiles | 2+ | — | — |
| projects | 45+ | BI_SOLICITACOES_SUPORTEESPAIDER | 2026-02-21 |
| deliveries | 329+ | Child: Entregas | 2026-02-21 |
| schedules | 1200+ | Child: Cronogramas | 2026-02-21 |
| requirements | 845+ | Child: Requisitos | 2026-02-21 |
| histories | 5,745+ | Child: Históricos | 2026-02-21 |
| approvers | 329+ | Child: Aprovadores | 2026-02-21 |
| budgets | 156+ | Child: Orçamentos | 2026-02-21 |
| integration_log_entries | 664+ | — (auto-logged) | 2026-02-21 |
| espaider_apis | 1 | — (manually configured) | — |

**Total Synced Records**: 8,649+ (7 datasets)

---

## 🔄 Sync Idempotency Pattern

### **The UPSERT Pattern**

Every synced table uses:
```sql
UNIQUE(tenant_id, espaider_id)
```

This allows safe re-syncing without duplicates:

```typescript
-- Pseudocode (actual implementation in espaider-sync.ts)
const insertQuery = `
  INSERT INTO projects (tenant_id, espaider_id, titulo, status, ...)
  VALUES ($1, $2, $3, $4, ...)
  ON CONFLICT (tenant_id, espaider_id)
  DO UPDATE SET
    titulo = $3,
    status = $4,
    updated_at = now()
`;
```

**Benefit**: Sync can run 1x, 10x, 100x with same result (idempotent)

---

## 🧒 Key Concepts (ELI5)

### What is a Foreign Key?

**Simple**: Imagine a library where each book has a shelf number. The shelf number must exist in the "shelves" table, or the book can't be created. If you delete a shelf, all its books get deleted too (CASCADE). This is a foreign key—it ensures data consistency.

### What is a UNIQUE Constraint?

**Simple**: Imagine a school roll-call list. Each student has a unique student ID. You can't have two students with the same ID. The `UNIQUE(tenant_id, espaider_id)` constraint ensures that for each tenant, each Espaider record appears only once in our database (even if synced multiple times).

### What is an Index?

**Simple**: Imagine a phone book. If you want to find "John Smith", you go to the "S" section (index), then find "Smith" entries—much faster than reading every name. Indices on databases work the same way. `idx_projects_status` lets the database quickly find all projects with status "Active" without scanning the whole table.

---

## ⚠️ Known Issues & Debt

| Issue | Severity | Impact | Resolution |
|-------|----------|--------|-----------|
| RLS policies complex (3 migrations to fix) | MEDIUM | Log visibility timing | Fixed in 023, 024, 025; now stable |
| Child tables schema migrated 3 times | MEDIUM | Migration bloat | Consolidated in 019; pattern now correct |
| No database backup automation | LOW | Disaster recovery | Supabase handles backups; document procedure |
| No query performance monitoring | LOW | Slow queries undetected | Add application-level monitoring |
| 25 migrations (could consolidate) | LOW | Complexity | Consider squashing in 0.2.0 release |
| Metadata JSONB fields not indexed | LOW | Complex queries slow | Add GIN indices if needed |

---

## 🚀 Recommendations

### **Immediate** (Within 2 weeks)

1. **Document RLS policies** in README (what we just did)
2. **Test disaster recovery**: Verify backup/restore procedure with Supabase
3. **Monitor slow queries**: Add application-level query logging

### **Short-term** (1-3 months)

1. **Denormalization opportunity**: Add computed `project_count` to tenants for dashboard
2. **Materialized view**: Create view for "project summary" (join all children with aggregates)
3. **Performance testing**: Load test with 10,000+ projects to validate indices

### **Long-term** (3-6 months)

1. **Archive strategy**: Move old logs (>90 days) to cold storage
2. **Full-text search**: Add PostgreSQL `tsvector` for project search
3. **Real-time**: Implement Supabase Realtime for live updates
4. **Migration consolidation**: Squash 25 migrations into 1-2 base migrations

---

## 🔗 Related Documents

- **System Architecture** (`docs/architecture/system-architecture.md`) — How DB fits in overall system
- **Coding Standards** (`docs/framework/coding-standards.md`) — How to query/mutate data safely
- **Migration Procedures** (`supabase/migrations/README.md`) — How to write new migrations

---

**Document Status**: ✅ COMPLETE
**Data Accuracy**: 2026-02-21 (verified against live DB)
**Next Update**: Upon Phase 5 (specialist review)
