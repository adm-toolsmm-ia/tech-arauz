# Story 9.9.1: PRD Sharded — Add responsible_roles to Database

**Story ID:** 9.9.1
**Epic:** EPIC 9 (Context Engineering & Frontend-Backend Synchronization)
**Owner:** Dara (@data-engineer)
**Timeline:** 1 week (5-7 hours)

---

## 📋 Requirements

### Functional Requirements

**FR-1: Schema Extension**
- Add `responsible_roles` JSONB column to `org_suppliers`, `org_services`, `org_documents`
- Default value: empty array `[]`
- Non-nullable (enforced via DEFAULT)

**FR-2: Indexing**
- Create GIN index on each new column for JSON query performance
- Index naming: `idx_org_{table}_responsible_roles_gin`

**FR-3: RLS Policies**
- Extend existing RLS policies to new columns
- Follow ADR-001: `USING (true) WITH CHECK (true)` for tenant-scoped access
- Policy scope: Read/Write by tenant_id match

**FR-4: Type Definitions**
- Update TypeScript interfaces: `OrgSupplier`, `OrgService`, `OrgDocument`
- Add `responsible_roles: string[]` property to each

---

### Non-Functional Requirements

**NFR-1: Performance**
- Migration executes in <1 second
- GIN indexes support JSON containment queries (~milliseconds)
- No downtime required

**NFR-2: Backward Compatibility**
- Existing records load without errors
- New column defaults to `[]` for all existing rows
- Migration is reversible (rollback script provided)

**NFR-3: Audit & Compliance**
- Migration logs changes to audit table
- RLS policies validated via `rls_audit_log`
- No sensitive data in responsible_roles (roles only, no user IDs)

---

## 🏗️ Architecture Decision

### Schema Pattern

```sql
-- Follows existing pattern from org_areas, org_nuclei, org_processes, org_routines
ALTER TABLE public.org_suppliers
ADD COLUMN responsible_roles JSONB DEFAULT '[]' NOT NULL;

CREATE INDEX idx_org_suppliers_responsible_roles_gin
ON public.org_suppliers USING GIN(responsible_roles);

COMMENT ON COLUMN public.org_suppliers.responsible_roles
IS 'Array of roles responsible for managing this supplier (e.g., ["vendor_manager", "procurement_lead"])';
```

### RLS Policy Pattern

```sql
-- Inherit from parent table RLS (tenant_id check)
-- No new policies needed; existing tenant RLS covers new column
```

### Type Pattern

```typescript
// Before
export interface OrgSupplier {
  id: string;
  tenant_id: string;
  name: string;
  description: string | null;
  created_at: string;
  updated_at: string;
}

// After
export interface OrgSupplier {
  id: string;
  tenant_id: string;
  name: string;
  description: string | null;
  responsible_roles: string[];  // ← NEW
  created_at: string;
  updated_at: string;
}
```

---

## 🛠️ Implementation Tasks

1. **Create Migration File** (`065_add_responsible_roles_to_resources.sql`)
   - Add columns to 3 tables
   - Create GIN indexes
   - Update comments
   - Add to audit log

2. **Update TypeScript Types** (`src/types/organization.ts`)
   - Modify: `OrgSupplier`, `OrgService`, `OrgDocument`
   - Add: `responsible_roles: string[]`

3. **Update Action Creators** (`src/app/actions/organization.ts`)
   - `createSupplierAction`: accept `responsible_roles` in payload
   - `updateSupplierAction`: support `responsible_roles` updates
   - `createServiceAction`: accept `responsible_roles` in payload
   - `updateServiceAction`: support `responsible_roles` updates
   - `createOrgDocumentAction`: accept `responsible_roles` in payload
   - `updateOrgDocumentAction`: support `responsible_roles` updates

4. **Validation & Testing**
   - Run migration: `supabase db push`
   - Verify columns exist: `SELECT column_name FROM information_schema.columns WHERE table_name = 'org_suppliers'`
   - Verify indexes: `SELECT indexname FROM pg_indexes WHERE tablename = 'org_suppliers'`
   - Test RLS: Verify non-tenant users cannot read/write

5. **Rollback Preparation**
   - Document rollback steps
   - Test rollback on staging
   - Prepare rollback script

---

## 📊 Acceptance Criteria Checklist

**Database:**
- [ ] Migration 065 runs successfully
- [ ] 3 new columns created with correct type (JSONB)
- [ ] 3 new GIN indexes created
- [ ] RLS audit logs the changes
- [ ] Rollback script works

**TypeScript:**
- [ ] 3 interfaces updated
- [ ] No type errors (typecheck passing)
- [ ] Action creators updated to handle responsible_roles

**Testing:**
- [ ] Unit test: Migration creates columns
- [ ] Unit test: Indexes created
- [ ] Integration test: Create supplier WITH responsible_roles
- [ ] Integration test: RLS policy enforced
- [ ] Regression test: Existing records load

**Documentation:**
- [ ] Code comments explain columns
- [ ] Rollback procedure documented
- [ ] Migration comment added to git

---

## 🔄 Dependencies

**Blocks:**
- Story 9.9.2 (UI Component) — needs types
- Story 9.9.3 (Display Sync) — needs supplier/service/document types

**Depends On:**
- None (independent story)

---

## 📝 AI Context Engineering Notes

### Role Definition Pattern

When story 9.9.2 defines role enums, these will apply to:
- `org_areas.responsible_roles`
- `org_nuclei.responsible_roles`
- `org_processes.responsible_roles`
- `org_routines.responsible_roles`
- **`org_suppliers.responsible_roles`** ← NEW (this story)
- **`org_services.responsible_roles`** ← NEW (this story)
- **`org_documents.responsible_roles`** ← NEW (this story)

### Usage by AI Agents

When agents query organization data:
```typescript
// Full context for supplier
const supplierContext = {
  name: supplier.name,
  description: supplier.description,
  responsibleRoles: supplier.responsible_roles,  // ← Will be populated by agents
};
```

---

## 🚀 Deployment Checklist

- [ ] Migration tested on staging
- [ ] RLS policies validated
- [ ] Types updated and compiled
- [ ] Action creators tested
- [ ] Rollback script confirmed working
- [ ] Ready for @devops push

---

**Author:** Orion (@aiox-master)
**Status:** Ready for Implementation
**Created:** 2026-03-14
