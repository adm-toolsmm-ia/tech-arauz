# EPIC 7 — Quick Wins & Strategic Initiatives: Data Gaps & BI Enhancements

**Document Status:** FASE 10 — Implementation Planning ⏳ READY FOR STORY CREATION
**Data:** 2026-03-07
**Version:** 1.0 (AIOX Brownfield Discovery FASE 10)
**Created By:** Morgan (PM)
**Approved By:** Aria (@architect), Dex (@dev)
**Framework:** AIOX Story Development Cycle (SDC)

---

## Epic Summary

**Objetivo:** Entregar 3 iniciativas estratégicas em paralelo com EPICs 5-6: (1) correção rápida de gap de dados (1.5h, quick win), (2) novo dashboard de performance da equipe (50-60h, estratégica), (3) unificação de chat AI (40h, estratégica).

**Estratégia:** Execução paralela com EPICs anteriores; quick win (4.11) entregue imediatamente, 2 iniciativas maiores distribuídas ao longo de 8-10 semanas.

**Valor de Negócio:**
- Kanban tempo de permanência funcional (quick win, UX imediata)
- BI para RH/Alocação de recursos (50-60h, decisões baseadas em dados)
- Chat AI unificado (40h, ferramenta executiva central)

**Timeline:** Paralelo com EPICs 5-6 + continuação para Maio-Junho
**Team:** Dex (@dev) para quick win, Aria (@architect) + Dex + Uma (@ux) para iniciativas maiores
**Total Effort:** 91.5-101.5 horas

---

## Epic Objectives (MoSCoW)

### MUST (Critical for Delivery)
- [ ] Fix data fetching gap (1.5h, immediate)
- [ ] Dashboard Team Performance Phase 1 (20h, foundation)
- [ ] CHATBOT AI Phase 1 (15h, fix + baseline)

### SHOULD (Strategic Value)
- [ ] Dashboard Team Performance Phase 2-3 (30-40h)
- [ ] CHATBOT AI Phase 2-3 (25-30h)
- [ ] Export functionality (CSV for dashboards)

### COULD (Polish)
- [ ] Mobile responsive optimization
- [ ] Performance caching layer

---

## Stories Breakdown

### STORY 7.1: Data Fetching Gap — Kanban Tempo de Permanência (QUICK WIN)

**Owner:** Dex (@dev)
**Timeline:** ASAP (1.5 hours) — Execute Week 1 of EPIC 5
**Effort:** 1.5h
**Priority:** HIGH (unblocks story 4.11)
**Dependency:** None
**Parallel With:** EPIC 5 + EPIC 6 stories

#### Acceptance Criteria

- [ ] AC-001: Both query files updated
  - [ ] File 1: `src/app/actions/projects.ts` (line 70)
    - [ ] Add `tempos_permanencia:project_tempo_permanencia(*)`
    - [ ] Verify syntax correct in Supabase
  - [ ] File 2: `src/app/dashboard/projetos/actions.ts` (line 30)
    - [ ] Same modification
    - [ ] Both queries identical in structure

- [ ] AC-002: Data flow validation
  - [ ] Run dev server: `npm run dev`
  - [ ] Navigate to Kanban
  - [ ] Verify badges render with time data
  - [ ] Verify colors change based on `diasNaFase`:
    - [ ] Green: < 15 days (normal)
    - [ ] Yellow: 15-30 days (attention)
    - [ ] Red: > 30 days (critical)

- [ ] AC-003: Transformation validation
  - [ ] TypeScript types compile
  - [ ] `dbProjectToUI()` transformer accepts undefined
  - [ ] UI handles both data and empty state

- [ ] AC-004: RLS validation
  - [ ] Multi-tenant isolation confirmed
  - [ ] No cross-tenant data visible
  - [ ] Filters by `tenant_id` working

#### Subtasks

- [ ] Subtask 7.1.1: Query update (0.5h)
  - [ ] Edit `src/app/actions/projects.ts` line 70
  - [ ] Add relation to SELECT
  - [ ] Test query in Supabase console

- [ ] Subtask 7.1.2: Dashboard query update (0.5h)
  - [ ] Edit `src/app/dashboard/projetos/actions.ts` line 30
  - [ ] Same modification
  - [ ] Compare both queries for consistency

- [ ] Subtask 7.1.3: Testing & validation (0.5h)
  - [ ] Dev server test
  - [ ] Kanban badge rendering
  - [ ] RLS validation
  - [ ] CodeRabbit review

#### File List

- `src/app/actions/projects.ts` (UPDATED)
- `src/app/dashboard/projetos/actions.ts` (UPDATED)

#### Validation Checklist

- [ ] Both files updated with relation
- [ ] `npm run dev` succeeds
- [ ] Kanban badges display with time data
- [ ] No TypeScript errors
- [ ] RLS confirmed working
- [ ] CodeRabbit review passed
- [ ] @qa visual verification

---

### STORY 7.2: Dashboard Team Performance — Phase 1 Foundation (Weeks 1-3)

**Owner:** Dex (@dev) + Uma (@ux-design-expert)
**Timeline:** Weeks 1-3 of EPIC 5/6 timeline (20 hours)
**Effort:** 20h
**Priority:** HIGH (strategic BI initiative)
**Dependency:** EPIC 5 (complete) for data stability
**Parallel With:** EPIC 5, EPIC 6 stories

#### Acceptance Criteria

- [ ] AC-001: New tab in Dashboard Operações
  - [ ] Location: `src/app/dashboard/operacoes/operacoes-content.tsx`
  - [ ] New tab: "Performance" (alongside "Fluxo")
  - [ ] Tab selection state persisted (localStorage)

- [ ] AC-002: Period & Team selectors implemented
  - [ ] Period selector: [Semanal] [Mensal] [Trimestral] [Semestral] [Anual]
  - [ ] Team filter: [Minha Equipe] [Todos os Envolvidos]
  - [ ] Date range picker for custom dates
  - [ ] Defaults: Mensal, Minha Equipe

- [ ] AC-003: Performance table with core metrics
  - [ ] Columns:
    - [ ] Nome (responsável)
    - [ ] Movimentações (count)
    - [ ] Tempo Médio (dias)
    - [ ] Projetos Concluídos
    - [ ] Lead Time Médio
  - [ ] Sortable by any column
  - [ ] Pagination for >20 rows
  - [ ] Export to CSV

- [ ] AC-004: Data fetching server action
  - [ ] New file: `src/app/dashboard/operacoes/actions.ts` (or extend)
  - [ ] Function: `getTeamPerformanceData(params)`
  - [ ] Handles: period filtering, team filtering, aggregation
  - [ ] RLS enforced (tenant_id isolation)

- [ ] AC-005: KPI cards for period summary
  - [ ] Top performer (most movements)
  - [ ] Avg tempo por pessoa
  - [ ] Total movimentações período
  - [ ] Projetos concluídos período

#### Subtasks

- [ ] Subtask 7.2.1: Component structure (3-4h)
  - [ ] Create new tab "Performance"
  - [ ] Layout: KPI cards + table + filters
  - [ ] Implement period selector
  - [ ] Implement team filter

- [ ] Subtask 7.2.2: Server action & data fetching (6-8h)
  - [ ] Query project_histories for movements
  - [ ] Query project_tempo_permanencia for time data
  - [ ] Aggregate by responsable
  - [ ] Join with profiles for names
  - [ ] Calculate metrics (avg, count, sum)
  - [ ] Filter by period and team

- [ ] Subtask 7.2.3: Table component (4-5h)
  - [ ] Create ResponsablePerformanceTable
  - [ ] Implement sorting
  - [ ] Implement pagination
  - [ ] Add export to CSV
  - [ ] Accessibility: keyboard navigation, screen readers

- [ ] Subtask 7.2.4: Testing (3-4h)
  - [ ] Data query test (verify aggregations)
  - [ ] Table sorting/pagination
  - [ ] RLS validation (multi-tenant)
  - [ ] Performance: <2s response time
  - [ ] CSV export quality

#### File List

- `src/app/dashboard/operacoes/operacoes-content.tsx` (UPDATED)
- `src/app/dashboard/operacoes/actions.ts` (UPDATED)
- `src/components/dashboard/ResponsablePerformanceTable.tsx` (NEW)
- `src/components/dashboard/PeriodSelector.tsx` (NEW)
- `src/components/dashboard/TeamFilter.tsx` (NEW)
- `docs/dashboard/team-performance-dashboard.md` (NEW)

#### Validation Checklist

- [ ] Tab renders without errors
- [ ] Selectors work correctly
- [ ] Data loads and displays
- [ ] Table sorting works
- [ ] Pagination works
- [ ] CSV export valid
- [ ] RLS enforced
- [ ] Performance <2s
- [ ] CodeRabbit review passed
- [ ] @qa sign-off on data accuracy

---

### STORY 7.3: Dashboard Team Performance — Phase 2 Analytics (Weeks 4-6)

**Owner:** Dex (@dev) + Uma (@ux-design-expert)
**Timeline:** Weeks 4-6 of EPIC roadmap (20 hours)
**Effort:** 20h
**Priority:** MEDIUM-HIGH (data visualization)
**Dependency:** Story 7.2 (foundation)
**Parallel With:** EPIC 6 continuation

#### Acceptance Criteria

- [ ] AC-001: 4 main analytics charts
  - [ ] Chart 1: Bar chart — Movimentações por Responsável (ranked)
    - [ ] X-axis: Person name
    - [ ] Y-axis: Movement count
    - [ ] Sorted descending
    - [ ] Hover: shows exact count + percentage

  - [ ] Chart 2: Bar chart — Tempo Médio de Permanência
    - [ ] X-axis: Person name
    - [ ] Y-axis: Days (average)
    - [ ] Color gradient (green=fast, red=slow)

  - [ ] Chart 3: Line chart — Velocidade ao longo do período
    - [ ] X-axis: Time (days/weeks/months based on period)
    - [ ] Y-axis: Movements per day
    - [ ] Multiple lines if comparing individuals

  - [ ] Chart 4: Heatmap — Atividade por dia da semana
    - [ ] Rows: Days of week
    - [ ] Columns: Hours of day (or weeks if monthly)
    - [ ] Color intensity: activity level

- [ ] AC-002: Drill-down modal
  - [ ] Click on person in any chart → Modal opens
  - [ ] Modal shows: Detailed history of that person's movements
  - [ ] Filters by selected period
  - [ ] Can close and return to main view

- [ ] AC-003: Export functionality
  - [ ] Export chart data to CSV
  - [ ] Export full report to PDF (chart images + tables)
  - [ ] Filename: `performance-{period}-{date}.csv`

#### Subtasks

- [ ] Subtask 7.3.1: Movement chart (4-5h)
  - [ ] Create MovementRankedChart component (Recharts)
  - [ ] Fetch and sort data
  - [ ] Implement ranking visualization
  - [ ] Add tooltips

- [ ] Subtask 7.3.2: Tempo permanencia chart (3-4h)
  - [ ] Create TempoChart component
  - [ ] Color scale based on values
  - [ ] Drill-down on click

- [ ] Subtask 7.3.3: Velocity & heatmap (6-7h)
  - [ ] VelocityChart (line chart over time)
  - [ ] ActivityHeatmap component
  - [ ] Aggregation logic by time bucket

- [ ] Subtask 7.3.4: Drill-down & export (4-5h)
  - [ ] ResponsableDetailModal component
  - [ ] CSV export function
  - [ ] PDF generation (consider html2pdf)
  - [ ] Testing

#### File List

- `src/components/dashboard/MovementRankedChart.tsx` (NEW)
- `src/components/dashboard/TempoChart.tsx` (NEW)
- `src/components/dashboard/VelocityChart.tsx` (NEW)
- `src/components/dashboard/ActivityHeatmap.tsx` (NEW)
- `src/components/dashboard/ResponsableDetailModal.tsx` (NEW)
- `src/lib/export.ts` (UPDATED/NEW for CSV/PDF export)

#### Validation Checklist

- [ ] All 4 charts render correctly
- [ ] Drill-down modal works
- [ ] CSV export valid
- [ ] PDF export includes images
- [ ] Performance <2s for chart loads
- [ ] A11y: charts accessible (ARIA labels)
- [ ] CodeRabbit review passed
- [ ] @qa visual & functional testing

---

### STORY 7.4: CHATBOT AI Module — Phase 1 Fix & Setup (Weeks 3-5)

**Owner:** Dex (@dev)
**Timeline:** Weeks 3-5 of EPIC roadmap (15 hours)
**Effort:** 15h
**Priority:** HIGH (executive tool)
**Dependency:** None (can run in parallel)
**Parallel With:** Stories 7.2-7.3, EPIC 6

#### Acceptance Criteria

- [ ] AC-001: New route `/chatbot/` functional
  - [ ] File: `src/app/chatbot/page.tsx`
  - [ ] Server component rendering successfully
  - [ ] Loads without errors
  - [ ] Navigation works

- [ ] AC-002: Agent selector implemented
  - [ ] Dropdown showing published agents
  - [ ] Filter: `is_global_chatbot = true`
  - [ ] Display: Agent name + description
  - [ ] Selection persists in URL or state
  - [ ] Changing agent creates new session

- [ ] AC-003: Chat interface basic functionality
  - [ ] Display chat messages
  - [ ] Input box for user messages
  - [ ] Send button (or Enter key)
  - [ ] Message display with timestamps
  - [ ] API integration: `POST /api/agents/{id}/chat`

- [ ] AC-004: Session management baseline
  - [ ] Create new session on page load
  - [ ] Fetch and display previous messages (if session exists)
  - [ ] New message added to session
  - [ ] Session persisted in database

- [ ] AC-005: Styling & accessibility
  - [ ] Responsive design (mobile, tablet, desktop)
  - [ ] Dark mode compatible
  - [ ] Keyboard navigation
  - [ ] ARIA labels for screen readers

#### Subtasks

- [ ] Subtask 7.4.1: Route creation (2-3h)
  - [ ] Create `/chatbot/page.tsx`
  - [ ] Create `/chatbot/layout.tsx`
  - [ ] Create `/chatbot/components/` directory
  - [ ] Basic styling

- [ ] Subtask 7.4.2: Agent selector (3-4h)
  - [ ] Fetch published agents
  - [ ] Create AgentSelector component
  - [ ] Implement switching logic
  - [ ] Test with multiple agents

- [ ] Subtask 7.4.3: Chat interface (5-6h)
  - [ ] Reuse ChatContent logic
  - [ ] Input component
  - [ ] Message display component
  - [ ] Session creation/fetch
  - [ ] Send message API call

- [ ] Subtask 7.4.4: Testing (2-3h)
  - [ ] Manual chat with agent
  - [ ] Multiple agent switching
  - [ ] Mobile responsiveness
  - [ ] Error handling (agent down, etc)

#### File List

- `src/app/chatbot/page.tsx` (NEW)
- `src/app/chatbot/layout.tsx` (NEW)
- `src/app/chatbot/components/chatbot-content.tsx` (NEW)
- `src/app/chatbot/components/agent-selector.tsx` (NEW)
- `src/app/chatbot/components/chat-interface.tsx` (NEW)

#### Validation Checklist

- [ ] Route `/chatbot/` loads
- [ ] Agent selector works
- [ ] Chat messages display
- [ ] Send message works
- [ ] Sessions persist
- [ ] Mobile responsive
- [ ] Keyboard navigation works
- [ ] CodeRabbit review passed
- [ ] @qa sign-off on functionality

---

### STORY 7.5: CHATBOT AI Module — Phase 2 History & Sidebar (Weeks 6-8)

**Owner:** Dex (@dev)
**Timeline:** Weeks 6-8 of EPIC roadmap (15 hours)
**Effort:** 15h
**Priority:** MEDIUM-HIGH (UX polish)
**Dependency:** Story 7.4 (baseline)
**Parallel With:** EPIC 6 tail, other stories

#### Acceptance Criteria

- [ ] AC-001: Chat history sidebar
  - [ ] Left sidebar showing recent chats
  - [ ] List format: `[Agent Name] • X messages • Time`
  - [ ] Click to load previous conversation
  - [ ] Newest chats at top
  - [ ] Scrollable if >10 chats
  - [ ] "New Chat" button at top

- [ ] AC-002: Session switching
  - [ ] Click chat → loads messages
  - [ ] Input box focuses
  - [ ] New message appends to chat
  - [ ] URL updates (optional, for bookmarking)

- [ ] AC-003: Delete chat functionality
  - [ ] Hover action: Delete icon (trash)
  - [ ] Confirm before delete
  - [ ] Chat removed from sidebar
  - [ ] DB session deleted

- [ ] AC-004: Search/filter chats (optional for Phase 2)
  - [ ] Search by agent name or message content
  - [ ] Filter by agent type
  - [ ] Filter by date range

- [ ] AC-005: Mobile collapsible sidebar
  - [ ] On mobile: sidebar collapses to drawer
  - [ ] Hamburger menu to toggle
  - [ ] Full chat area when drawer closed

#### Subtasks

- [ ] Subtask 7.5.1: History sidebar component (5-6h)
  - [ ] Fetch sessions list
  - [ ] ChatHistorySidebar component
  - [ ] Click to load session
  - [ ] Styling and layout

- [ ] Subtask 7.5.2: Session switching logic (3-4h)
  - [ ] Update main chat area when session clicked
  - [ ] Fetch messages for selected session
  - [ ] Update input focus

- [ ] Subtask 7.5.3: Delete functionality (2-3h)
  - [ ] Delete endpoint (POST `/api/agents/{id}/sessions/{sessionId}/delete`)
  - [ ] Confirm dialog
  - [ ] Update sidebar after delete

- [ ] Subtask 7.5.4: Mobile & responsive (2-3h)
  - [ ] Drawer on mobile
  - [ ] Hamburger toggle
  - [ ] Test on various devices

#### File List

- `src/app/chatbot/components/chat-history-sidebar.tsx` (NEW)
- `src/components/chat/ChatHistoryItem.tsx` (NEW)
- `src/app/api/agents/[id]/sessions/[sessionId]/delete/route.ts` (NEW)

#### Validation Checklist

- [ ] Sidebar displays session list
- [ ] Click loads chat correctly
- [ ] Delete works and removes from list
- [ ] Mobile drawer works
- [ ] Performance: lazy load sessions if >50
- [ ] CodeRabbit review passed
- [ ] @qa functional testing

---

### STORY 7.6: Dashboard Team Performance — Phase 3 Polish & Performance (Weeks 7-9)

**Owner:** Uma (@ux-design-expert) + Dex (@dev)
**Timeline:** Weeks 7-9 of EPIC roadmap (10-20 hours)
**Effort:** 10-20h
**Priority:** MEDIUM (quality & optimization)
**Dependency:** Story 7.3 (complete)
**Parallel With:** Story 7.5

#### Acceptance Criteria

- [ ] AC-001: Performance optimization
  - [ ] Query response time <2s (p95)
  - [ ] Chart rendering <500ms
  - [ ] Pagination working for 1000+ rows
  - [ ] Lazy loading for historical data

- [ ] AC-002: UX refinement
  - [ ] Charts match design system
  - [ ] Consistent spacing and typography
  - [ ] Loading states (spinners)
  - [ ] Empty states (no data message)
  - [ ] Error states (query failed)

- [ ] AC-003: A11y compliance
  - [ ] WCAG AA compliant
  - [ ] Charts: ARIA labels for data
  - [ ] Keyboard navigation
  - [ ] Screen reader tested

- [ ] AC-004: Stakeholder feedback iteration
  - [ ] Share with 2-3 stakeholders (RH/diretoria)
  - [ ] Collect feedback
  - [ ] Implement top 3 suggestions
  - [ ] Document decisions

- [ ] AC-005: Documentation
  - [ ] User guide: how to use dashboard
  - [ ] Metrics definitions (what is "tempo médio")
  - [ ] Data freshness (when is data updated)
  - [ ] FAQ

#### Subtasks

- [ ] Subtask 7.6.1: Query optimization (2-3h)
  - [ ] Profile slow queries
  - [ ] Add indexes if needed
  - [ ] Implement caching (Redis or ISR)
  - [ ] Test response times

- [ ] Subtask 7.6.2: UX polish (3-5h)
  - [ ] Design review with Uma
  - [ ] Refine colors, spacing, fonts
  - [ ] Add loading/error states
  - [ ] Responsive design tweaks

- [ ] Subtask 7.6.3: A11y testing (2-3h)
  - [ ] Automated testing (jest-axe)
  - [ ] Manual NVDA testing
  - [ ] Keyboard navigation
  - [ ] Fix violations

- [ ] Subtask 7.6.4: Stakeholder feedback (2-3h)
  - [ ] Prepare demo
  - [ ] Present to 2-3 stakeholders
  - [ ] Collect feedback
  - [ ] Prioritize changes

- [ ] Subtask 7.6.5: Documentation (1-2h)
  - [ ] User guide
  - [ ] Metrics definitions
  - [ ] FAQ

#### File List

- `docs/dashboard/team-performance-user-guide.md` (NEW)
- Multiple component files (UPDATED with polish)
- `src/lib/performance-caching.ts` (NEW, if caching implemented)

#### Validation Checklist

- [ ] Query response <2s
- [ ] Charts render smoothly
- [ ] A11y tests pass
- [ ] Stakeholder feedback incorporated
- [ ] Documentation complete
- [ ] CodeRabbit review passed
- [ ] @qa final sign-off

---

## Dependencies & Parallelization

```
EPIC 5/6 Timeline (Parallel)
│
├─ Week 1-3: Story 7.1 (quick win, 1.5h)
│            Story 7.2 (Phase 1 foundation, 20h) — starts
│
├─ Week 4-6: Story 7.2 (continues, finishes)
│            Story 7.3 (Phase 2 analytics, 20h) — starts
│            Story 7.4 (CHATBOT Phase 1, 15h) — starts
│
└─ Week 7-9: Story 7.3 (continues, finishes)
             Story 7.4 (continues, finishes Week 5)
             Story 7.5 (CHATBOT Phase 2, 15h) — starts Week 6
             Story 7.6 (Dashboard Phase 3, 20h) — starts Week 7

CRITICAL PATH: Story 7.2 → 7.3 (dependent)
               Story 7.4 → 7.5 (dependent)
               Story 7.1 (independent, ASAP)
               Story 7.6 (independent, can start Week 7)
```

---

## Resource Allocation

| Role | Stories | Total Hours | Weeks | Availability |
|------|---------|-------------|-------|--------------|
| Dex (@dev) | 7.1, 7.2, 7.3, 7.4, 7.5 | 71.5-81h | 9 | 8-9h/week |
| Uma (@ux-design-expert) | 7.2, 7.3, 7.6 | 20h | 9 | 2-3h/week |
| **TOTAL** | **6 Stories** | **91.5-101.5h** | **9 weeks** | **~10 person-hours/week** |

---

## Success Metrics

### Quick Win (Story 7.1)
- [ ] Kanban badges display with time data
- [ ] No errors in console
- [ ] RLS working correctly

### Team Performance Dashboard (Stories 7.2-7.3-7.6)
- [ ] All metrics calculated correctly
- [ ] Charts render and display data
- [ ] Export functionality works
- [ ] Stakeholder feedback positive
- [ ] Query performance <2s

### CHATBOT AI (Stories 7.4-7.5)
- [ ] Route `/chatbot/` accessible
- [ ] Multiple agents switchable
- [ ] Chat history sidebar works
- [ ] Session persistence verified
- [ ] Users report improved UX

---

## Risk Assessment

| Risk | Severity | Probability | Mitigation | Status |
|------|----------|-------------|-----------|--------|
| Data aggregation slow for large datasets | HIGH | 15% | Optimize queries, add indexes, caching | ✅ MITIGATED |
| Chart library incompatibility | MEDIUM | 5% | Test Recharts thoroughly | ✅ MITIGATED |
| CHATBOT AI requires refactoring existing chat | MEDIUM | 10% | Use existing ChatContent code | ✅ MITIGATED |
| Stakeholder feedback requires major rework | MEDIUM | 20% | Early demo in Phase 1, adjust | ✅ ACCEPTABLE |

**Overall Risk Level: LOW-MEDIUM** — Mitigated with early feedback

---

## Handoff

### Deliverables for Next Cycle
- ✅ Quick win: Kanban functioning
- ✅ Strategic BI: Team performance dashboard live
- ✅ Strategic Chat: Unified chatbot experience
- ✅ Documentation: User guides for all features

---

## Approval & Signatures

**Created By:** Morgan (PM)
**Reviewed By:** Aria (@architect)
**Validated By:** Dex (@dev), Uma (@ux-design-expert)

**Status:** ✅ READY FOR STORY CREATION (@sm)

---

*AIOX Brownfield Discovery — FASE 10 Implementation Planning*
*EPIC 7: Quick Wins & Strategic Initiatives*
*Document created: 2026-03-07 | Version: 1.0*
