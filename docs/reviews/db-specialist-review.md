# Database Specialist Review

**Phase 5 of Brownfield Discovery**
**Date**: 2026-02-21
**Reviewer**: @data-engineer
**Status**: VALIDATED

---

## Database Débitos Review

### ✅ D-DB-001: RLS Policy Complexity
**Validation**: CONFIRMED (with caveats)
- RLS pattern is correct (auth.uid() → tenant_id)
- 3 migrations needed due to learning curve, not structural flaw
- **Action**: Create RLS testing framework (12h) BEFORE adding more policies
- **Priority**: HIGH

### ✅ D-DB-002: Migration Bloat
**Validation**: CONFIRMED
- 25 migrations is manageable now but becomes painful at 50+
- Reverted migrations (016-018) don't need to be cleaned up, but document why
- **Action**: Consolidate at v0.2.0 release (20h)
- **Priority**: HIGH (schedule for next major release)

### ✅ D-DB-003: Child Table Schema History
**Validation**: CONFIRMED
- Migration 016-018 had schema pattern issue (BIGSERIAL vs UUID)
- Migration 019 fixed it correctly
- **Action**: Document pattern in MIGRATION-GUIDE.md (8h)
- **Priority**: HIGH (prevents future mistakes)

### ✅ D-DB-004: JSONB Indices Missing
**Validation**: CONFIRMED (defer unless scaling)
- Current data (8,649 records) doesn't need GIN indices
- Add GIN indices only if dataset > 100K records
- **Action**: Create script to add GIN indices (4h, do later)
- **Priority**: LOW

### 🆕 ADDED: Query N+1 Problem in sync
**Finding**: `syncProjects()` does individual lookups per project. Should batch.
- **Action**: Refactor to batch queries (8h)
- **Severity**: MEDIUM
- **Priority**: MEDIUM

### 🆕 ADDED: No soft-delete
**Finding**: Deleting projects cascades to all children (hard delete). Compliance risk.
- **Action**: Consider soft-delete with flag + trigger (16h)
- **Severity**: MEDIUM
- **Priority**: MEDIUM (discuss with LGPD compliance officer)

---

## Summary

**Database is production-ready.** Schema pattern is solid, RLS is secure, sync is idempotent. Main debt is documentation + operational procedures.

**Critical path**:
1. Create RLS testing framework (blocks new policies)
2. Document migration patterns (prevents future issues)
3. Implement batch queries in sync (performance)
4. Review soft-delete for compliance (legal)

**Hours**: 12 + 8 + 8 + 16 = 44 hours

---
