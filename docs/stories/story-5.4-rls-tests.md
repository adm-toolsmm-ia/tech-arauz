# Story 5.4: RLS (Row Level Security) Policies & Testing

**Story ID:** 5.4 | **Epic:** EPIC 5 | **Effort:** 4-5h | **Owner:** Dara (@data-engineer)
**Status:** Draft | **Priority:** HIGH | **Timeline:** Week 1-2 (March 17-24, 2026)
**Completed:** — | **Actual Effort:** — | **Pushed:** —

## User Story

Como engenheiro de banco de dados, quero implementar e testar RLS policies para todas as tabelas críticas (tenant_id + user_id isolation), para garantir dados seguros, audit trail completo, e compliance com zero data leakage.

## Acceptance Criteria

- [ ] AC-001: RLS policies implementados em 8+ tabelas críticas (projects, tasks, schedules, requirements, etc.)
- [ ] AC-002: Service role bypass configurado corretamente para API internal operations
- [ ] AC-003: 35+ testes RLS PASSED (coverage: create, read, update, delete, cross-tenant blocks)
- [ ] AC-004: Audit logging habilitado para todas operações RLS-protected
- [ ] AC-005: Zero security regressions vs baseline (Story 5.1)
- [ ] AC-006: Nenhuma breaking change

## Subtasks

1. [ ] RLS Policy Implementation (2h)
   - [ ] Analyze 8+ critical tables (projects, tasks, schedules, requirements, documents, etc.)
   - [ ] Create USING + WITH CHECK policies for tenant_id + user_id isolation
   - [ ] Test service_role bypass for API internal operations
   - [ ] Deploy policies to RLS-protected tables
   - [ ] Verify `ENABLE ROW LEVEL SECURITY` on all tables

2. [ ] Test Suite Creation (1.5h)
   - [ ] Create RLS test suite: `/supabase/tests/rls_policies.test.sql` (500+ lines)
   - [ ] Test cases per policy: SELECT, INSERT, UPDATE, DELETE
   - [ ] Cross-tenant isolation tests (user in Tenant A cannot see Tenant B data)
   - [ ] Service role bypass validation
   - [ ] Edge cases: NULL values, cascading deletes, etc.

3. [ ] Audit Trail & Compliance (0.75h)
   - [ ] Enable `pgaudit` extension for audit logging
   - [ ] Configure audit triggers for RLS-protected tables
   - [ ] Document audit schema changes in migration
   - [ ] Verify audit logs capture policy violations

4. [ ] Documentation & Validation (0.75h)
   - [ ] Create `/docs/security/rls-policy-guide.md` (comprehensive)
   - [ ] Document each policy: purpose, coverage, test results
   - [ ] SLA: 0 policy enforcement failures in production
   - [ ] Risk assessment: likelihood of data leakage (LOW)

## Definition of Done

- [ ] Code reviewed | [ ] All 35+ tests PASSED | [ ] Linting OK | [ ] Docs complete
- [ ] CodeRabbit approved | [ ] @qa sign-off (7/7 checks) | [ ] Merged | [ ] Deployed

## Files to Create

- [ ] `supabase/migrations/migration_025_enable_rls_policies.sql` (NEW)
  - Enable RLS on 8+ tables
  - Create policies for each table
  - Configure service_role bypass

- [ ] `supabase/migrations/migration_026_audit_logging.sql` (NEW)
  - Enable pgaudit extension
  - Create audit triggers for monitored tables

- [ ] `supabase/tests/rls_policies.test.sql` (NEW - 500+ lines)
  - 35+ RLS policy tests (5 per table)
  - Cross-tenant isolation validation
  - Service role bypass verification
  - Audit logging verification

- [ ] `docs/security/rls-policy-guide.md` (NEW)
  - RLS architecture overview
  - Policy documentation (per table)
  - Test results & coverage matrix
  - Security SLA & compliance notes

## Dependencies

**BLOCKED BY:** 5.1 (DB Indexes) ✅ **COMPLETE**
**UNBLOCKS:** 5.5 (A11y Testing) [soft dependency]
**Must complete by:** March 24, 2026

## Success Criteria

✅ RLS policies on 8+ tables | ✅ 35+ tests PASSING | ✅ Audit logging enabled | ✅ Zero data leakage risk

---

## Dev Agent Record (Phase 3 — Implement)

**Executed By:** Dara (@data-engineer)
**Mode:** Interactive/YOLO
**Timestamp:** [Pending]
**Duration:** 4-5 hours
**Status:** Ready for Dev

### Implementation Checklist

#### Phase 3.1: SQL Migration & Policy Creation
- [ ] Analyze database schema (projects, tasks, schedules, requirements, documents, etc.)
- [ ] Create RLS policies (USING + WITH CHECK for tenant + user isolation)
- [ ] Test service_role bypass (admin API operations)
- [ ] Document policy coverage matrix (8+ tables)

#### Phase 3.2: Test Suite Development
- [ ] Write 5-7 tests per table (CRUD operations: SELECT, INSERT, UPDATE, DELETE)
- [ ] Cross-tenant isolation tests (verify tenant A user cannot access Tenant B data)
- [ ] Service role bypass validation (API calls work without RLS filters)
- [ ] Edge case testing (NULL values, cascading deletes, role inheritance)

#### Phase 3.3: Audit & Compliance
- [ ] Enable pgaudit extension
- [ ] Create audit triggers for RLS-protected tables
- [ ] Verify audit log capture (violations, successful operations)
- [ ] Document compliance posture

#### Phase 3.4: Documentation & Review
- [ ] Create RLS policy guide with architecture overview
- [ ] Document each policy with rationale and test results
- [ ] Generate test coverage report (35+ tests)
- [ ] Prepare for @qa review (QA Gate checks)

### Quality Checkpoints

**Pre-Implementation:**
- [ ] Story dependencies met (Story 5.1 COMPLETE ✅)
- [ ] Database schema analysis complete
- [ ] RLS policy approach documented

**During Implementation:**
- [ ] All 35+ tests passing locally
- [ ] TypeScript compilation passing (no type errors)
- [ ] Linting passing (ESLint clean)
- [ ] Documentation complete

**Pre-QA Review:**
- [ ] CodeRabbit pre-commit review PASSED
- [ ] All quality gates confirmed
- [ ] File List updated with all created/modified files
- [ ] Ready for @qa Phase 4 (Quality Gate)

---

## QA Results (Phase 4 — Quality Gate)

**Gate Decision:** ⏳ PENDING

---

**Last Updated:** 2026-03-07 | **Status:** Ready for Dev
