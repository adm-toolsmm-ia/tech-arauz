# ADR-005: Organization Architecture — Hierarchical Structure for Enterprise BPM

**Status:** 🟡 PENDING ACCEPTANCE (Pending Story 11.14 documentation)

**Deciders:** @architect (Aria), @dev (Dex), @pm (Morgan)

**Date:** 2026-04-25 (expected)

**Related Stories:** EPIC 11.1-11.14, Stories 11.1-11.5 (schema implementation)

---

## Context

Tech Arauz serves legal offices, consultancies, corporations, and other organizations with complex process management needs. Each organization has nested hierarchies of:
- **Areas** (e.g., "Recuperação de Crédito" in legal offices)
- **Nuclei** (sub-departments within areas)
- **Processes** (workflow definitions)
- **Routines** (process steps)
- **Activities** (executable tasks with responsible roles)

### Problem Statement

When designing the organizational schema for EPIC 11, we faced a fundamental architectural decision:

**Q: Should organizational structure be hierarchical (nested) or flat?**

#### Option A: Hierarchical (CHOSEN)
```
Organization
  ├─ Areas (e.g., "Recuperação")
  │   ├─ Nuclei (e.g., "Judicial")
  │   │   ├─ Processes
  │   │   │   ├─ Routines
  │   │   │   │   └─ Activities
```

#### Option B: Flat (Alternative Considered)
```
Organization
  ├─ Processes (all at same level)
  ├─ Activities (all at same level)
  └─ Meta tags for grouping
```

---

## Decision

**Implement hierarchical organization structure** with Areas → Nuclei → Processes → Routines → Activities relationships.

### Rationale

1. **Business Alignment**
   - Legal offices naturally think in terms of practice areas
   - Consultancies have department/sub-department hierarchies
   - Corporations organize by business units and cost centers
   - Hierarchical structure matches mental models

2. **Query Efficiency**
   - Scoped queries (e.g., "all processes in area X") are fast
   - Parent-child relationships via foreign keys
   - Indexes on area_id/nucleus_id improve filtering
   - Pagination within a scope is predictable

3. **Access Control (RLS)**
   - Tenant isolation enforced at organization level
   - Role-based filtering per hierarchy level
   - Responsible_roles can be scope-aware (e.g., "Juiz dentro de Judicial")
   - Easier to implement principle of least privilege

4. **Audit and Compliance**
   - Clear ownership chain (Area → Nucleus → Process → Activity)
   - Audit trails follow hierarchy
   - SLA tracking per scope level
   - Change impact analysis simplified

5. **Scalability**
   - Well-defined hierarchy prevents circular relationships
   - Batch operations on scopes (bulk edit all processes in area)
   - Multi-tenant isolation at hierarchy levels
   - Database indexes on (org_id, area_id, nucleus_id) efficient

### Constraints from Chosen Approach

- Strict parent-child relationships (Process must have nucleus_id, etc.)
- Depth limit: 5 levels max (Organization → Area → Nucleus → Process → Routine → Activity)
- Move operations must update all child entities
- Deletion requires cascade handling

---

## Consequences

### Positive

✅ **Organizational clarity**
- Users understand the structure intuitively
- Team assignments map to areas/nuclei
- Responsibility chains are explicit

✅ **Performance**
- Fast scoped queries (WHERE area_id = ?)
- B-tree indexes work well
- Pagination within scope is predictable

✅ **Security (RLS)**
- Row-level policies can scope by area/nucleus
- Prevents cross-team data leakage
- Granular role assignments per scope

✅ **Future extensibility**
- Can add sub-types (e.g., "Process Groups")
- Metrics and SLAs per hierarchy level
- Process versioning per hierarchy level

### Negative

❌ **Schema rigidity**
- Adding new hierarchy levels requires migration
- Flat structures not well-supported (would need nullable foreign keys)
- Cross-cutting concerns harder to model

❌ **Movement operations**
- Moving a process to different nucleus requires updating process + all routines + all activities
- Batch updates needed for moves
- Audit trails get complex

❌ **Reporting across hierarchies**
- Cross-area reports require UNION queries
- Aggregation more complex
- Some analytics queries less efficient

### Trade-offs

| Aspect | Hierarchical | Flat |
|--------|-------------|------|
| Query scoped by area | ✅ Fast | ❌ Slow (filters) |
| Moving process | ❌ Expensive | ✅ Fast (one field) |
| Reporting across areas | ❌ Complex | ✅ Simple |
| Mental model alignment | ✅ Strong | ❌ Weak |
| RLS enforcement | ✅ Easy | ❌ Complex |
| Scalability (1000+ entities) | ✅ Good | ✅ Good |

---

## Implementation Details

### Schema Structure

**[To be detailed in ORGANIZATION-SCHEMA.md]**

- `organizations` (primary tenant)
- `areas` (org_id, name, description)
- `nuclei` (org_id, area_id, name, description)
- `processes` (org_id, area_id, nucleus_id, name)
- `routines` (org_id, area_id, nucleus_id, process_id, name)
- `activities` (org_id, area_id, nucleus_id, process_id, routine_id, name, responsible_roles)

### Foreign Key Strategy

All child tables have:
- `org_id` (for RLS filtering)
- Parent ID (area_id, nucleus_id, etc.)
- Compound indexes on (org_id, parent_id)

### RLS Policies

All tables enforce `org_id = auth.jwt_claim('org_id')` at row level.

---

## Related Stories

- **Story 11.1:** Add responsible_roles to activities
- **Story 11.2:** Activity system relationships
- **Story 11.3:** Process SLAs and metrics
- **Story 11.4:** Role permissions governance
- **Story 11.5:** Activity templates and process versioning
- **Story 11.14:** Complete documentation (this ADR)

---

## Alternatives Rejected

### Alternative 1: Flat Structure with Meta Tags

**Structure:**
```
organizations
  ├─ all_processes (with meta JSON field)
  └─ all_activities (with meta JSON field)
```

**Rejected because:**
- Requires full table scans for "get all processes in area X"
- Meta tags not indexed (no fast filtering)
- RLS harder to implement
- No clear ownership chain

### Alternative 2: Graph Database Model

**Structure:**
```
nodes (organizations, areas, processes, etc.)
edges (area→nucleus, nucleus→process, etc.)
```

**Rejected because:**
- Over-engineered for current needs
- Additional operational complexity
- Supabase/PostgreSQL not optimal for graphs
- Easier to migrate to graph later if needed

### Alternative 3: No Hierarchy (Services Fully Independent)

**Structure:**
```
areas (standalone)
nuclei (standalone, linked via field)
processes (standalone, linked via field)
```

**Rejected because:**
- No enforcement of parent-child relationships
- Data integrity issues
- Harder to delete with cascades

---

## Validation Approach

### Testing Strategy

- [x] Schema correctly enforces hierarchy
- [x] Foreign keys prevent orphaned records
- [x] RLS policies scope by org_id
- [ ] Performance tests on 100k+ entities
- [ ] Bulk move operations tested
- [ ] Audit trail captures hierarchy

### Success Criteria

- Query performance <100ms for 100k entities
- RLS prevents cross-org data leakage
- Schema validation in place
- Documentation complete

---

## Monitoring

### Key Metrics

- [x] Query response times per scope
- [x] Hierarchy depth (should stay <5)
- [x] RLS policy effectiveness
- [x] Index hit rates
- [ ] Move operation frequency
- [ ] Cascade update performance

### Alerts

- If query >500ms: investigate indexes
- If hierarchy depth >5: review design
- If cascading deletes fail: audit dependencies

---

## Status: Ready for Formal Acceptance

This ADR has:
1. ✅ Schema implementation (Stories 11.1-11.5 complete)
2. ✅ Content generation (Story 11.14 Phase 2 complete)
3. ⏳ Formal acceptance vote (scheduled for 2026-04-25)

**Expected Acceptance Date:** 2026-04-25

---

**Cross-References:**
- Schema Details: `docs/architecture/ORGANIZATION-SCHEMA.md`
- BPM Best Practices: `docs/architecture/BPM-PATTERNS.md`
- Bootstrap Guide: `docs/guides/BOOTSTRAP-CUSTOMIZATION.md`
- AI Context Patterns: `docs/guides/AI-CONTEXT-ENGINEERING.md`

