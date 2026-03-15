# EPIC 11 Frontend Gaps — Executive Summary

**Architect:** Aria (@architect)
**Status:** Ready for Implementation
**Decision Required:** Approve Story 13.1 (Critical Gaps) for v0.2.4 release

---

## The Situation

EPIC 11 backend is **100% complete** (5 migrations, 9 server actions, RLS security):
- ✅ org_activities.responsible_roles (Migration 066)
- ✅ org_activity_systems junction table (Migration 067)
- ✅ org_process_slas + org_process_metrics (Migration 068)
- ✅ org_role_permissions + governance (Migration 069)
- ✅ org_activity_templates (Migration 070)

**FRONTEND is only 60% synchronized.** Three critical features have no edit forms:

| Feature | DB Status | UI Status | Status |
|---------|-----------|-----------|--------|
| Responsible Roles on Activities | ✅ Exists | ❌ Read-only | 🔴 CRITICAL |
| Activity Inputs/Outputs/Risks/Impacts | ✅ Exists | ❌ Read-only | 🔴 CRITICAL |
| Process SLAs & Metrics | ✅ Exists | ❌ Display-only | 🔴 CRITICAL |
| Usage Context Editing | ✅ Exists | ❌ No update action | 🟡 Medium |
| Role Permissions Governance | ✅ Seeded | ❌ No UI | 🟡 Medium |
| Documentation Editor | ✅ Field exists | ❌ No structured UI | 🟡 Medium |
| Knowledge Base | ✅ Table exists | ❌ No UI | 🟢 Low |
| Audit Trail Logs | ✅ Logged | ❌ No viewer | 🟢 Low |

---

## Critical Path to v0.2.4

**Release date:** April 25, 2026
**Days until release:** 40 (as of March 16)
**Work required:** 14-16 hours (2-3 focused days)

### What Must Be Done (Blocking Fixes)

#### Gap 1: Activity Role Assignment (3-4h)
**Problem:** Users cannot assign responsible_roles when editing activities
**Solution:** Integrate ResponsibleRolesInput into ActivityFormSheet
**Impact:** AC #27 ("User can assign responsible parties to activities") becomes satisfied

#### Gap 2: Activity BPM Fields (2-3h)
**Problem:** Users cannot specify activity inputs, outputs, risks, impacts
**Solution:** Enable BPM tab in OrgEntityFormSheet for activities (form UI already exists!)
**Impact:** AC #28 ("User can specify activity inputs/outputs/risks/impacts") becomes satisfied

#### Gap 3: SLA Management (8-10h)
**Problem:** Process SLAs exist in DB but no create/edit UI
**Solution:** Add CRUD server actions + modal form for SLA definitions
**Impact:** AC #29 ("User can define and view process SLAs") becomes satisfied

### What Can Wait (Post-Release)

**Gap 4-6 (Medium):** 12-14h work
- Role permissions governance UI
- usage_context editing
- Structured documentation editor

**Gap 7-8 (Low):** 13-17h work
- Knowledge base UI (v0.2.5)
- Audit trail visualization (v0.2.5)

---

## Decision: What to Do?

### Option A: Fix All Gaps Before Release (RECOMMENDED)

**Timeline:** 40 hours / 5 days
**Team:** @dev (20h) + @qa (8h) + @ux (2h) + @architect (10h)
**Risk:** Moderate—feasible but aggressive schedule
**Release:** Delayed to May 2, 2026 (1 week slip)

**Pro:**
- All EPIC 11 features fully functional at release
- No technical debt carry-over
- No "incomplete" features in production
- Matches marketing claims for v0.2.4

**Con:**
- Tight timeline (8 working days)
- Less time for integration testing
- Small buffer for issues

---

### Option B: Fix Critical Gaps (Gaps 1-3), Defer Medium/Low (CURRENT RECOMMENDATION)

**Timeline:** 14-16 hours critical / 2-3 days
**Team:** @dev (8-10h) + @qa (3-4h) + @ux (1-2h)
**Risk:** Low—focused scope, all components exist
**Release:** On schedule April 25, 2026

**Pro:**
- Meets all acceptance criteria
- Low risk (components already built)
- Clean release on time
- Medium/low gaps can be v0.2.5 features

**Con:**
- Governance UI delayed (minor issue)
- Documentation editor delayed (nice-to-have)
- Audit trail visualization delayed (not priority)

**Recommendation:** **OPTION B** — Fix critical gaps, release on schedule, deliver medium/low gaps post-release as v0.2.5 features.

---

## Implementation Plan (Recommended)

### Story 13.1: Complete EPIC 11 Frontend Integration — Critical Gaps

**Owner:** @dev (Dex) with @qa (Quinn), @ux (Uma), @architect (Aria)

**Scope:**
1. [Gap 1] Integrate ResponsibleRolesInput into activity edit workflow
2. [Gap 2] Enable BPM form tab for activity inputs/outputs/risks/impacts
3. [Gap 3] Create SLA management (CRUD server actions + UI modal)

**Effort Breakdown:**
- Server actions (Gap 3 SLA CRUD): 2h (@dev)
- Form integrations (Gap 1 + Gap 2): 3h (@dev)
- Component creation (ProcessSlaModal): 2-3h (@dev)
- E2E testing: 3h (@qa)
- UX polish + accessibility: 1-2h (@uma)
- Code review & refinement: 2h (@architect)

**Total:** 14-16 hours
**Timeline:** March 16-18 (3 days, deliver by March 19)
**Status:** Ready to start immediately

---

## Detailed Fixes

### Gap 1: Activity ResponsibleRoles Integration

**Current State:** OrgEntityFormSheet has ResponsibleRolesInput but it's not used in activity edit workflows

**Fix:**
```
ActivityCockpit360.tsx
├── Add "Edit Activity" button
├── Opens OrgEntityFormSheet with mode="edit"
└── ResponsibleRolesInput renders + saves

Activity Detail Page
├── Add "Edit Activity" button
├── Opens OrgEntityFormSheet with mode="edit"
└── ResponsibleRolesInput renders + saves
```

**Database:** Already set up (org_activities.responsible_roles exists)
**Server action:** Already exists (updateActivityAction handles responsible_roles)
**Effort:** 3-4 hours

---

### Gap 2: Activity BPM Fields (Inputs/Outputs/Risks/Impacts)

**Current State:** OrgEntityFormSheet has the entire form (lines 419-477) but activity views don't use it

**Fix:**
```
ActivityCockpit360.tsx
├── Add "BPM Details" button
├── Opens OrgEntityFormSheet with entity="activity"
└── BPM tab renders with full inputs/outputs/risks/impacts form

Activity Detail Page
├── Add "Edit BPM" button
├── Opens OrgEntityFormSheet with entity="activity"
└── BPM tab renders with full form
```

**Database:** Already set up (org_activities has inputs, outputs, risks, impacts columns)
**Server action:** Already exists (updateActivityAction persists all BPM fields)
**Form UI:** Already built in OrgEntityFormSheet—just need to invoke it
**Effort:** 2-3 hours

---

### Gap 3: Process SLA Management

**Current State:** Tables exist, display actions exist, but no create/edit forms

**Fix:**
```
New Server Actions:
├── createProcessSlaAction(processId, target, unit, period)
├── updateProcessSlaAction(slaId, updates)
└── deleteProcessSlaAction(slaId)

New Component: ProcessSlaModal
├── Form to create/edit SLA
├── Calls server actions
└── Integrated into ProcessCockpit360

ProcessCockpit360.tsx
├── Add "SLA Management" section
├── Shows current SLAs
├── "New SLA" button → opens ProcessSlaModal
├── Edit/delete per SLA
└── Updates on save
```

**Database:** Tables exist (org_process_slas, org_process_metrics)
**Server action:** Needs creation (createProcessSlaAction, etc.)
**Effort:** 8-10 hours

---

## Testing Checklist for v0.2.4

### Gap 1: ResponsibleRoles
- [ ] Activity edit opens with OrgEntityFormSheet
- [ ] ResponsibleRolesInput renders in form
- [ ] Can add roles via autocomplete
- [ ] Can remove roles
- [ ] Save persists to database
- [ ] List refreshes after save
- [ ] Keyboard navigation works

### Gap 2: BPM Fields
- [ ] Activity edit shows BPM tab
- [ ] BPM tab shows inputs/outputs/risks/impacts fields
- [ ] Can add new input with name+description
- [ ] Can remove input
- [ ] Can mark input as required
- [ ] Same for outputs, risks, impacts
- [ ] Save persists to database
- [ ] Validation prevents empty names

### Gap 3: SLAs
- [ ] Process view shows "SLA Management" section
- [ ] "New SLA" button opens ProcessSlaModal
- [ ] Can create SLA with target/unit/period
- [ ] SLA appears in list after create
- [ ] Can edit SLA (update target)
- [ ] Can delete SLA
- [ ] Metrics chart updates when SLAs exist
- [ ] RLS prevents non-tenant access

---

## Post-Release Roadmap (v0.2.5)

### Story 13.2: Role Permissions Governance UI (10-12h)
**What:** Admin UI to assign which roles can edit which resources
**Priority:** Medium—enterprises will need this immediately post-release
**Timeline:** Early May 2026

### Story 13.3: Advanced Documentation & Knowledge Management (14-18h)
**What:** Structured documentation editor + knowledge base UI
**Priority:** Low—MVP doesn't require this
**Timeline:** Mid-May 2026

### Story 13.4: Audit Trail Visualization (5-7h)
**What:** Viewer for bulk_operation_logs with filtering
**Priority:** Low—nice-to-have for operators
**Timeline:** Late May 2026

---

## Risk Assessment

### Critical Path Risk: LOW ✅

**Why low?**
- All required components already exist
  - OrgEntityFormSheet ✅
  - ResponsibleRolesInput ✅
  - ActivitySystemsModal ✅
  - Database schema ✅
  - Most server actions ✅
- Only Gap 3 (SLAs) requires new components
- No architectural changes needed
- All developers familiar with this codebase

**Mitigation:**
- Start Gap 3 SLA CRUD server actions first (2h, unblocks rest)
- Parallel work on form integrations (Gaps 1-2)
- E2E testing throughout
- Code review before merge

---

## Decision Required From PM/PO

**Question:** Should we:

1. **Option A:** Delay release 1 week to fix all 8 gaps (40h work)?
   - Pros: Complete feature set, no post-release work
   - Cons: Release slip, aggressive schedule

2. **Option B (RECOMMENDED):** Fix Gaps 1-3 only (14-16h), release on April 25, v0.2.5 for Gaps 4-8?
   - Pros: On-time release, satisfied ACs, low risk
   - Cons: Some features delayed

**My recommendation:** **Option B**

**Rationale:**
- EPIC 11 acceptance criteria depend only on Gaps 1-3
- Gaps 4-8 are enhancements, not blockers
- Medium gaps (4-6) can be v0.2.5 features (May 2026)
- Low gaps (7-8) are v0.2.5+ features
- Releasing on schedule = stakeholder confidence
- 14-16 hours is achievable in 2-3 days
- Zero architectural risk (all components exist)

---

## Next Steps

1. **Approve Story 13.1** (Critical Gaps) for immediate implementation
2. **Assign:** @dev (Dex) as owner, @qa (Quinn) + @ux (Uma) as collaborators
3. **Start:** March 17, 2026
4. **Deliver:** March 19, 2026 (48-72 hours)
5. **Test:** Full E2E + regression
6. **Merge:** To main, deploy to staging
7. **Release:** April 25, 2026 on schedule

---

## Detailed Analysis Document

For comprehensive technical details, see: `.aiox/EPIC-11-FRONTEND-GAPS-ARCHITECTURE-ANALYSIS.md`

That document includes:
- Per-gap technical architecture
- Exact file changes required
- Code examples
- Testing checklists
- Dependency analysis
- Post-release stories
- Technical debt notes

---

**Prepared by:** Aria (@architect)
**For:** @pm (Morgan), @po (Pax), @sm (River)
**Decision:** Approve Story 13.1 for v0.2.4
