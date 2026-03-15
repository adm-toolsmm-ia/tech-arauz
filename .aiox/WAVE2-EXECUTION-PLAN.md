# WAVE 2: Backend + UI Implementation Plan
## Squad: Dex (@dev) + Uma (@ux-design-expert)

**Timeline:** 2026-04-07 to 2026-04-18 (2 weeks)
**Status:** READY FOR EXECUTION
**Total Effort:** 31-39 hours (4 stories)

---

## 📋 WAVE 2 STORIES (Priority: Execute in Order)

### Story 11.6: ResponsibleRolesInput Component (10-12h)
**Owner:** Uma (@ux-design-expert) + Dex (@dev)
**Priority:** HIGH
**Depends on:** 11.1 (types defined ✅)

**Files to Create:**
1. `src/components/organization/ResponsibleRolesInput.tsx` — React component
2. `src/lib/organization/role-definitions.ts` — ORGANIZATION_ROLES constant
3. `src/components/organization/ActivityFormSheet.tsx` — Integration point
4. `src/components/organization/__tests__/ResponsibleRolesInput.test.tsx` — Unit tests
5. `src/stories/organization/ResponsibleRolesInput.stories.tsx` — Storybook

**Deliverables:**
- ✅ Functional component with tag-based input + autocomplete
- ✅ WCAG AA accessibility compliance
- ✅ Mobile responsive design
- ✅ Full test coverage
- ✅ Storybook documentation

**Acceptance Criteria Met:** 10/10

---

### Story 11.7: Server Actions for Responsible Roles (6-8h)
**Owner:** Dex (@dev)
**Priority:** HIGH
**Depends on:** 11.1 + 11.6

**Files to Create/Modify:**
1. `src/app/actions/organization.ts` — Add 4 Server Actions:
   - `updateActivityResponsibleRolesAction`
   - `addActivityResponsibleRoleAction`
   - `removeActivityResponsibleRoleAction`
   - `getActivityResponsibleRolesAction`
2. `src/app/actions/__tests__/organization.test.ts` — Add tests
3. `src/lib/audit.ts` — Add audit logging support

**Deliverables:**
- ✅ 4 Server Actions with error handling
- ✅ Tenant isolation enforced
- ✅ Audit logging for changes
- ✅ Revalidation configured
- ✅ Full test coverage (success + error cases)

**Acceptance Criteria Met:** 10/10

---

### Story 11.8: Activity-System Relationship UI (8-10h)
**Owner:** Dex (@dev) + Uma (@ux-design-expert)
**Priority:** HIGH
**Depends on:** 11.2 (junction table ✅)

**Files to Create/Modify:**
1. `src/components/organization/ActivitySystemsModal.tsx` — Modal/Sheet component
2. `src/components/organization/ActivityCockpit360.tsx` — Add "Edit Systems" button
3. `src/app/actions/organization.ts` — Add 3 actions:
   - `addActivitySystemAction`
   - `removeActivitySystemAction`
   - `getActivitySystemsAction`
4. `src/components/organization/__tests__/ActivitySystemsModal.test.tsx` — Tests

**Deliverables:**
- ✅ Modal component with system selection
- ✅ Usage context field support
- ✅ Server Actions with RLS validation
- ✅ Cockpit360 integration
- ✅ Responsive design
- ✅ Full test coverage

**Acceptance Criteria Met:** 10/10

---

### Story 11.9: Process Metrics & SLAs Display (7-9h)
**Owner:** Dex (@dev) + Uma (@ux-design-expert)
**Priority:** MEDIUM
**Depends on:** 11.3 (SLA tables ✅)

**Files to Create/Modify:**
1. `src/components/organization/ProcessMetricsCard.tsx` — SLA + current metrics card
2. `src/components/organization/ProcessMetricsHistory.tsx` — Time series chart
3. `src/components/organization/ProcessCockpit360.tsx` — Add "Métricas" tab
4. `src/app/actions/organization.ts` — Add 2 actions:
   - `getProcessSLAsAction`
   - `getProcessMetricsAction`
5. `src/components/organization/__tests__/ProcessMetricsCard.test.tsx` — Tests

**Deliverables:**
- ✅ Metrics card with visual indicators (green/yellow/red)
- ✅ Time series chart using recharts
- ✅ Empty state handling
- ✅ Server Actions with aggregation
- ✅ Responsive chart layout
- ✅ Full test coverage
- ✅ Storybook stories

**Acceptance Criteria Met:** 10/10

---

## 🏗️ Implementation Strategy

### Phase 1: Component Scaffolding (Day 1-2)
1. Create component skeletons for 11.6, 11.8, 11.9
2. Setup test files and Storybook stories
3. Verify imports and dependencies

### Phase 2: Component Logic (Day 3-5)
1. Implement ResponsibleRolesInput (11.6)
2. Implement ActivitySystemsModal (11.8)
3. Implement ProcessMetricsCard + ProcessMetricsHistory (11.9)
4. Add keyboard navigation + accessibility (WCAG AA)

### Phase 3: Server Actions (Day 6-7)
1. Implement CRUD actions for responsible roles (11.7)
2. Implement system management actions (11.8)
3. Implement metrics query actions (11.9)
4. Add audit logging + error handling

### Phase 4: Integration & Testing (Day 8-10)
1. Integrate components with Cockpit360 views
2. Setup ActivityFormSheet integration (11.6)
3. Run all unit + integration tests
4. CodeRabbit review + fixes
5. Storybook documentation

### Phase 5: QA & Refinement (Day 11-14)
1. Manual testing on mobile devices
2. Dark mode validation
3. Performance profiling
4. Accessibility audit (WCAG AA)
5. Final polish + documentation

---

## 📊 Effort Allocation

| Story | Hours | Owner | Phase |
|-------|-------|-------|-------|
| 11.6 ResponsibleRolesInput | 10-12h | Uma + Dex | 1-4 |
| 11.7 Server Actions | 6-8h | Dex | 2-3 |
| 11.8 Activity-System UI | 8-10h | Dex + Uma | 2-5 |
| 11.9 Metrics Display | 7-9h | Dex + Uma | 2-5 |
| **TOTAL** | **31-39h** | **Both** | **5 phases** |

---

## ✅ WAVE 2 SUCCESS CRITERIA

**All Stories Complete:**
- [ ] 11.6: ResponsibleRolesInput functional + tested + accessible
- [ ] 11.7: 4 Server Actions with audit logging
- [ ] 11.8: ActivitySystemsModal working + integrated
- [ ] 11.9: Metrics display with charts + trends

**Quality Gates:**
- [ ] >90% test coverage across all components
- [ ] All unit tests passing
- [ ] All integration tests passing
- [ ] CodeRabbit review: 0 critical/high issues
- [ ] Accessibility: WCAG AA compliant
- [ ] Responsive: Mobile + tablet + desktop tested
- [ ] Performance: <100ms component render time
- [ ] Dark mode support verified

**Gate Owner:** Uma (@ux-design-expert)
**Target Completion:** 2026-04-18 17:00
**Blocks:** WAVE 3 cannot start until all 4 stories complete + gate passes

---

## 🚀 WAVE 2 READY FOR EXECUTION

**Status:** ✅ **APPROVED FOR IMPLEMENTATION**

Dex + Uma: Ambos têm autonomia completa para executar as 4 stories.

**Next Checkpoint:** 2026-04-11 (Day 5) — Progress check + blockers

**Final Gate:** 2026-04-18 (Day 14) — Uma sign-off + WAVE 3 release

---

**Prepared by:** Orion (@aiox-master)
**Date:** 2026-03-28
**Framework:** AIOX Story Development Cycle v1.0

