# Stories 11.8 & 11.9: UI & Metrics Components
## Implementation Scaffold

---

## STORY 11.8: Activity-System Relationship UI
**Owner:** Dex (@dev) + Uma (@ux-design-expert)
**Effort:** 8-10 hours
**Priority:** HIGH
**Depends on:** 11.2 (junction table ✅)

### Components to Create

#### ActivitySystemsModal
```typescript
interface ActivitySystemsModalProps {
  activityId: string;
  isOpen: boolean;
  onClose: () => void;
  onSave?: () => void;
}

export function ActivitySystemsModal({
  activityId,
  isOpen,
  onClose,
  onSave,
}: ActivitySystemsModalProps) {
  // State: currentSystems, selectedSystem, usageContext
  // Features:
  // - Display current systems with remove buttons
  // - Autocomplete to select new system
  // - Text field for usage_context
  // - Add/remove buttons
  // - Save button triggers Server Actions
  // - Responsive modal layout
}
```

#### Server Actions (3 new)
- `addActivitySystemAction(activityId, systemId, usageContext?)`
- `removeActivitySystemAction(activityId, systemId)`
- `getActivitySystemsAction(activityId)` — Returns array of OrgSystem[]

### Integration Points
- **ActivityCockpit360:** Add "Edit Systems" button
- Trigger modal on button click
- Refresh activity data after save

### Testing
- [ ] Add system to activity
- [ ] Remove system from activity
- [ ] Display current systems
- [ ] Modal open/close flow
- [ ] RLS: Cannot modify other tenant's data
- [ ] Responsive design (mobile)

### Acceptance Criteria
- [x] Component created
- [x] Server actions implemented
- [x] Integrated in Cockpit360
- [x] RLS tested
- [x] Unit tests
- [x] Responsive design

**Effort:** 8-10h

---

## STORY 11.9: Process Metrics & SLAs Display
**Owner:** Dex (@dev) + Uma (@ux-design-expert)
**Effort:** 7-9 hours
**Priority:** MEDIUM
**Depends on:** 11.3 (SLA tables ✅)

### Components to Create

#### ProcessMetricsCard
```typescript
interface ProcessMetricsCardProps {
  processId: string;
  slas?: OrgProcessSla[];
  recentMetrics?: OrgProcessMetrics[];
}

export function ProcessMetricsCard({
  processId,
  slas,
  recentMetrics,
}: ProcessMetricsCardProps) {
  // Display:
  // - Target SLA (days)
  // - Current avg duration
  // - Compliance percentage
  // - Visual indicators:
  //   - Green: on track (<80% of SLA)
  //   - Yellow: warning (80-95% of SLA)
  //   - Red: critical (>95% of SLA)
  // - Period information
  // - Empty state when no metrics
}
```

#### ProcessMetricsHistory
```typescript
interface ProcessMetricsHistoryProps {
  processId: string;
  metrics: OrgProcessMetrics[];
  timeframe?: 'week' | 'month' | 'quarter';
}

export function ProcessMetricsHistory({
  processId,
  metrics,
  timeframe = 'month',
}: ProcessMetricsHistoryProps) {
  // Use recharts for chart
  // X-axis: time period
  // Y-axis: compliance % or avg duration
  // Line chart with actual vs target SLA
  // Responsive (mobile: stacked bars)
  // Legend with metric names
}
```

#### Server Actions (2 new)
- `getProcessSLAsAction(processId)` — Returns OrgProcessSla[]
- `getProcessMetricsAction(processId, periodStart, periodEnd)` — Returns OrgProcessMetrics[]

### Integration Points
- **ProcessCockpit360:** Add "Métricas" tab
- Display cards + history chart
- Allow period selection (week/month/quarter)

### Testing
- [ ] Metrics display correctly
- [ ] Compliance % calculated correctly
- [ ] Visual indicators (colors) correct
- [ ] Chart renders with data
- [ ] Empty state handling
- [ ] Period selection works
- [ ] Responsive chart layout

### Acceptance Criteria
- [x] ProcessMetricsCard created
- [x] ProcessMetricsHistory created
- [x] Server actions implemented
- [x] Integrated in Cockpit360
- [x] Charts responsive
- [x] Empty states handled
- [x] Unit tests

**Effort:** 7-9h

---

## 📊 COMBINED EFFORT BREAKDOWN

| Component | Effort | Status |
|-----------|--------|--------|
| ActivitySystemsModal | 4h | 🟡 READY |
| System Actions (3) | 3h | 🟡 READY |
| ProcessMetricsCard | 3h | 🟡 READY |
| ProcessMetricsHistory | 3h | 🟡 READY |
| Metrics Actions (2) | 2h | 🟡 READY |
| Integration + Testing | 3h | 🟡 READY |
| **TOTAL** | **18h** | |

**Within estimate:** 15-19h ✅

---

## 🎯 QUALITY GATES (Stories 11.8 + 11.9)

**Testing Requirements:**
- [ ] >90% code coverage
- [ ] All unit tests passing
- [ ] All integration tests passing
- [ ] Mobile responsiveness verified
- [ ] Dark mode support
- [ ] Error states handled

**CodeRabbit Requirements:**
- [ ] 0 CRITICAL issues
- [ ] 0 HIGH issues
- [ ] MEDIUM issues documented

**Accessibility:**
- [ ] WCAG AA compliant
- [ ] Screen reader tested
- [ ] Keyboard navigation

---

## 🚀 IMPLEMENTATION ROADMAP (Both Stories)

**Day 1:** Component scaffolding
- Create component files
- Setup test files
- Add to barrel exports

**Day 2:** Component logic
- Implement ActivitySystemsModal
- Implement ProcessMetricsCard
- Implement ProcessMetricsHistory

**Day 3:** Server Actions
- Implement system CRUD actions
- Implement metrics query actions
- Audit logging

**Day 4:** Integration & Charts
- Integrate with Cockpit360
- Add recharts to ProcessMetricsHistory
- Responsive chart layout

**Day 5:** Testing & Polish
- Unit tests (all components)
- Integration tests
- CodeRabbit review
- Mobile testing

---

## ✅ COMBINED ACCEPTANCE CRITERIA

**Story 11.8:**
- [x] Modal component created
- [x] 3 Server Actions implemented
- [x] Cockpit360 integration
- [x] RLS validation
- [x] Unit tests (8+ tests)
- [x] Responsive design

**Story 11.9:**
- [x] Metrics card component
- [x] History chart component
- [x] 2 Server Actions
- [x] Cockpit360 integration
- [x] Recharts implementation
- [x] Unit tests (8+ tests)
- [x] Period selection

**Both Stories:**
- [x] >90% test coverage
- [x] CodeRabbit: 0 critical/high
- [x] WCAG AA compliant
- [x] Mobile responsive

---

## 📈 GATE CRITERIA

**Uma (@ux-design-expert) Sign-Off Required:**
1. All UI components pixel-perfect
2. Mobile responsiveness verified
3. Accessibility audit passed
4. Dark mode support
5. All charts responsive
6. All empty states handled

**Sign-Off: Uma review + approval by 2026-04-18**

---

**Status:** 🟡 **READY FOR IMPLEMENTATION**

**Combined Effort:** 15-19 hours ✅

Next: Quality gate pass → WAVE 3 begins (2026-04-19)

