# Phases 2 & 3 Instructions — Brownfield Discovery

**Status**: Ready for Parallel Execution
**Date**: 2026-02-21
**Model**: Haiku 4.5
**Mode**: Guided (interactive checkpoints)

---

## Overview

Phases 2 and 3 can execute **in parallel** as they have no dependencies between them:

- **Phase 2**: @data-engineer — Database Audit
- **Phase 3**: @ux-design-expert — Frontend Specification

Both phases should target 1-2 hours of focused analysis, with structured output files that will feed into Phase 4 (Draft Technical Debt consolidation).

---

## Phase 2: Database Audit (@data-engineer)

### Objective
Conduct a deep technical audit of the database schema, migrations, RLS policies, and data integrity patterns. Identify gaps, inconsistencies, and improvement opportunities.

### Deliverables
**Output Files:**
1. `docs/brownfield/SCHEMA.md` — Schema analysis (structure, design patterns, normalization)
2. `docs/brownfield/DB-AUDIT.md` — Audit findings (issues, recommendations, metrics)

### Key Focus Areas

#### 2.1 Migration History Analysis
**Files to Review:** `supabase/migrations/001-025.sql` (25 migrations total)

**Questions to Answer:**
- What is the evolution of the schema? (001 initial → 025 latest)
- Are there any rollbacks or corrections? (Identify migrations like 016-018 rollback)
- Did the schema follow a consistent pattern? (UUID PKs, UNIQUE constraints, RLS)
- Are there any orphaned columns or incomplete migrations?
- What was the intent of each migration group?
  - 001-003: Initial schema + RLS + tenant seed
  - 004-007: Espaider API table + consolidation
  - 008-015: Field additions (status, phases, project details)
  - 016-019: Child tables (histories, approvers, budgets) + rollback/fix
  - 020-025: Constraint expansions + RLS refinements

**Checkpoint 2.1 Findings:**
- [ ] Document migration intent + evolution
- [ ] Identify any problematic migrations
- [ ] Note inconsistencies or broken patterns

#### 2.2 Schema Normalization Review
**Tables to Audit:** (11 core tables)
- tenants, profiles, projects, deliveries, schedules, requirements, histories, approvers, budgets, integration_log_entries, espaider_apis

**Questions to Answer:**
- Is the schema in 3NF (Third Normal Form)?
- Are primary keys consistent (UUID everywhere)?
- Are foreign keys properly defined?
- Do composite UNIQUE constraints follow the pattern `(tenant_id, espaider_id)`?
- Are there denormalized fields? (Why and justified?)
- Are `espaider_raw JSONB` fields used correctly?

**Checkpoint 2.2 Findings:**
- [ ] Schema normalization score (1-10)
- [ ] List of normalization gaps
- [ ] Recommendations for improvement

#### 2.3 RLS Policy Effectiveness Audit
**Policy Locations:** Each table has RLS policies (001_initial_schema.sql + subsequent migrations)

**Questions to Answer:**
- Are RLS policies on ALL tables?
- Do policies enforce tenant isolation (`WHERE tenant_id = auth.uid()`)?
- Are there overly permissive policies? (e.g., `USING (true) WITH CHECK (true)`)
- Do admin operations use service role bypass?
- Are policies enforcing role-based access (admin vs user)?
- Recent changes: Migration 023-025 fixed `integration_log_entries` RLS

**Checkpoint 2.3 Findings:**
- [ ] RLS policy effectiveness score (1-10)
- [ ] List of security gaps
- [ ] Recommendations for tightening

#### 2.4 Performance Analysis
**Areas to Analyze:**
- Index coverage (do key queries have indexes?)
- Query complexity (any N+1 queries visible in code?)
- Table size estimates (projects, deliveries, schedules, logs)
- Constraint overhead (do CHECK constraints slow inserts?)

**Checkpoint 2.4 Findings:**
- [ ] Index strategy recommendations
- [ ] Query optimization opportunities
- [ ] Performance bottleneck areas

#### 2.5 Data Consistency Patterns
**Patterns to Verify:**
- UPSERT logic (is `(tenant_id, espaider_id)` unique enforced?)
- Cascade delete behavior (orphaned records possible?)
- Timestamp tracking (created_at, updated_at patterns)
- Soft deletes vs hard deletes (current strategy?)
- Historical tracking (audit trail completeness?)

**Checkpoint 2.5 Findings:**
- [ ] Consistency pattern score (1-10)
- [ ] Data integrity risks identified
- [ ] Recommendations for data quality

#### 2.6 Backup & Recovery Procedures
**Review:**
- Supabase backup automation (configured?)
- Point-in-time recovery capability
- Data export/import procedures
- Disaster recovery plan

**Checkpoint 2.6 Findings:**
- [ ] Backup strategy documented
- [ ] Recovery time objective (RTO) identified
- [ ] Recovery point objective (RPO) identified

### Output Format: SCHEMA.md

```markdown
# Database Schema Analysis — Tech Arauz

## Executive Summary
[1-2 paragraph overview of schema maturity]

## Schema Overview
[Entity-relationship diagram or matrix of 11 tables]

## Migration History
| Migration | Purpose | Status | Issues |
| ... | ... | ... | ... |

## Normalization Analysis
- Score: X/10
- Findings: [list of issues]
- Recommendations: [list of improvements]

## RLS Policy Audit
- Effectiveness Score: X/10
- Security Gaps: [list]
- Recommendations: [list]

## Key Metrics
- Total Tables: 11
- Total Migrations: 25
- Composite Keys: X
- RLS Policies: X
- Indexes: X

## Recommendations (Priority)
1. High: [...]
2. Medium: [...]
3. Low: [...]
```

### Output Format: DB-AUDIT.md

```markdown
# Database Audit Findings — Tech Arauz

## Performance Analysis
- Index coverage: X%
- Query complexity: [findings]
- Bottlenecks: [list]

## Data Consistency
- Consistency score: X/10
- Integrity risks: [list]
- Pattern validation: [pass/fail]

## Backup & Recovery
- Strategy: [documented/missing]
- RTO: [estimated]
- RPO: [estimated]

## Technical Debt Items
1. [Issue] (Priority: High/Medium/Low)
   - Effort: [estimate]
   - Risk: [risk assessment]

## Conclusion
[Summary of overall database health]
```

---

## Phase 3: Frontend Specification (@ux-design-expert)

### Objective
Conduct a comprehensive audit of the frontend architecture, UI components, user flows, and design patterns. Document the current state and identify areas for improvement.

### Deliverables
**Output File:**
- `docs/brownfield/frontend-spec.md` — Complete frontend specification document

### Key Focus Areas

#### 3.1 Component Inventory
**Files to Review:** `src/components/` (50+ components across 8 subdirectories)

**Questions to Answer:**
- How many components exist? (50+?)
- Which are Shadcn/ui primitives? (30+)
- Which are custom components? (20+)
- Are components properly documented (PropTypes, JSDoc)?
- Do components follow naming conventions?
- Is there component duplication? (DRY principle)
- Are there unused components?

**Component Categories:**
- **UI Primitives** (src/components/ui/): button, card, dialog, table, tabs, etc.
- **Feature Components** (src/components/project/): ProjectCockpit, ProjectFinancials, ProjectTeam, etc.
- **Layout** (src/components/layout/): AppSidebar, DashboardHeader, etc.
- **Charts** (src/components/charts/): ProjectPipelineChart, StatusDistributionChart, etc.
- **Views** (src/components/views/): ProjectListView, KanbanBoard, SplitView, etc.
- **Integrations** (src/components/integracoes/): LogViewer, APIManager
- **Cronogramas** (src/components/cronogramas/): CronogramaGantt
- **Filters** (src/components/filters/): ProjectFilters
- **Agents** (src/components/agents/): AgentCard, AgentKPIs, etc.
- **Dashboard** (src/components/dashboard/): KPICard

**Checkpoint 3.1 Findings:**
- [ ] Complete component matrix (name, type, location, usage)
- [ ] Duplication identified
- [ ] Documentation gaps
- [ ] Naming consistency score

#### 3.2 Page & Route Structure
**Files to Review:** `src/app/` (Next.js App Router structure)

**Questions to Answer:**
- How many main routes exist?
- What is the hierarchy? (app/dashboard → dashboard/page.tsx)
- Are routes well-organized?
- Is navigation logical and intuitive?
- Are there orphaned routes?
- Is the layout system (layout.tsx) consistent?

**Main Routes:**
- `/` — Home (redirect)
- `/dashboard` — Dashboard with KPIs + charts
- `/projetos` — Project list + detail
- `/cronogramas` — Schedule calendar view
- `/integracoes` — Integration logs + API manager
- `/cadastros` — User management (future)
- `/agentes` — AI agents (future)
- `/login` — Auth entry
- `/logout` — Auth exit

**Checkpoint 3.2 Findings:**
- [ ] Route hierarchy documented
- [ ] Navigation flow documented
- [ ] Missing routes identified
- [ ] Route organization score

#### 3.3 State Management Patterns
**Areas to Review:**
- **TanStack Query** (src/lib/supabase/ + useQuery hooks)
- **Zustand** (client-side state)
- **Server Actions** (form submission)
- **Async Data Fetching** (loading states, errors)

**Questions to Answer:**
- How is server state managed? (TanStack Query cache)
- How is client state managed? (Zustand stores)
- Are there state management anti-patterns? (prop drilling, etc.)
- Is error handling consistent?
- Are loading states properly indicated?
- Is data refetching/synchronization optimized?

**Checkpoint 3.3 Findings:**
- [ ] State management architecture documented
- [ ] Anti-patterns identified
- [ ] Optimization opportunities listed

#### 3.4 Responsive Design & Mobile Experience
**Review:**
- Tailwind responsive classes (sm, md, lg, xl, 2xl)
- Mobile-first vs desktop-first approach
- ViewToggle component (table vs cards for mobile)
- Image optimization
- Touch targets (clickable areas ≥ 44px)
- Viewport configuration

**Checkpoint 3.4 Findings:**
- [ ] Mobile responsiveness score (1-10)
- [ ] Breakpoint consistency
- [ ] Mobile UX issues identified
- [ ] Recommendations for mobile improvement

#### 3.5 Navigation Flows & User Journeys
**Key User Journeys:**
1. **Dashboard View**: Home → Dashboard (KPIs) → Click KPI → Filtered Project List → Project Detail
2. **Project Search**: Projetos Page → Apply Filters → View List → Click Project → ProjectCockpit (6 tabs)
3. **Schedule Management**: Cronogramas Page → Month/Week View → Interact with schedule
4. **Integration Monitoring**: Integracoes Page → View Logs → Filter by dataset → Monitor sync status

**Questions to Answer:**
- Is the navigation intuitive?
- Are there too many clicks to reach key features?
- Do users have clear exit paths?
- Are breadcrumbs visible?
- Is the sidebar navigation effective?

**Checkpoint 3.5 Findings:**
- [ ] User journey documentation
- [ ] Navigation friction points identified
- [ ] Recommendations for UX improvement

#### 3.6 Design System Consistency
**Review:**
- Color palette (Shadcn/ui default + custom?)
- Typography (fonts, sizes, weights)
- Spacing (Tailwind's 4px grid)
- Icons (Lucide React consistent usage)
- Animations (tailwindcss-animate)
- Button styles (primary, secondary, destructive)
- Form inputs (consistent styling)

**Checkpoint 3.6 Findings:**
- [ ] Design system consistency score (1-10)
- [ ] Inconsistencies identified
- [ ] Style improvements needed

#### 3.7 Accessibility Compliance
**Review:**
- ARIA labels on interactive elements
- Keyboard navigation support (Tab, Enter, Esc)
- Color contrast ratios (WCAG AA minimum)
- Focus indicators visible
- Screen reader support
- Form error messages

**Checkpoint 3.7 Findings:**
- [ ] Accessibility score (1-10)
- [ ] WCAG compliance gaps
- [ ] Recommendations for accessibility

#### 3.8 Performance Metrics
**Review:**
- Component render counts (React DevTools profiler)
- Bundle size (vercel.com/analytics)
- Lighthouse scores (performance, accessibility, SEO)
- Image optimization (next/image)
- Code splitting (dynamic imports)
- Caching strategies (TanStack Query)

**Checkpoint 3.8 Findings:**
- [ ] Lighthouse scores captured
- [ ] Performance bottlenecks identified
- [ ] Optimization opportunities

### Output Format: frontend-spec.md

```markdown
# Frontend Specification — Tech Arauz

## Executive Summary
[1-2 paragraph overview of frontend maturity]

## Component Inventory
| Category | Count | Examples | Issues |
| ... | ... | ... | ... |

## Page & Route Structure
[Sitemap/hierarchy of routes]

## State Management Architecture
- Server State (TanStack Query): [pattern]
- Client State (Zustand): [pattern]
- Issues: [list]

## Responsive Design
- Mobile Score: X/10
- Breakpoints: [Tailwind classes used]
- Issues: [list]

## Navigation Flows
[User journey diagrams]

## Design System
- Consistency Score: X/10
- Color Palette: [documented]
- Typography: [documented]
- Inconsistencies: [list]

## Accessibility
- WCAG Compliance: [score]
- Gaps: [list]

## Performance
- Lighthouse Scores: [perf, a11y, seo, best-practices]
- Bottlenecks: [list]

## Technical Debt Items
1. [Issue] (Priority: High/Medium/Low)
   - Effort: [estimate]
   - Risk: [assessment]

## Conclusion
[Summary of overall frontend health]
```

---

## Execution Instructions

### For @data-engineer (Phase 2)

**Step 1: Preparation** (~10 min)
- [ ] Read `BROWNFIELD-DISCOVERY-STATE.md`
- [ ] Navigate to `supabase/migrations/` directory
- [ ] List all 25 migrations
- [ ] Copy migration names to notes

**Step 2: Analysis** (~1 hour)
- [ ] Review each migration (001-025) for intent
- [ ] Create mental map of schema evolution
- [ ] Audit each of 11 tables for RLS policies
- [ ] Check constraint patterns
- [ ] Assess performance implications

**Step 3: Documentation** (~30 min)
- [ ] Create `docs/brownfield/SCHEMA.md`
- [ ] Create `docs/brownfield/DB-AUDIT.md`
- [ ] Include findings from all 6 checkpoints
- [ ] List technical debt items with priorities

**Step 4: Completion** (~10 min)
- [ ] Update `BROWNFIELD-DISCOVERY-STATE.md`:
  ```yaml
  Phase 2:
    status: COMPLETED
    completedAt: YYYY-MM-DDTHH:MM:SSZ
    agent: @data-engineer
    findings: [list of key findings]
  ```

### For @ux-design-expert (Phase 3)

**Step 1: Preparation** (~10 min)
- [ ] Read `BROWNFIELD-DISCOVERY-STATE.md`
- [ ] Navigate to `src/components/` directory
- [ ] List component subdirectories
- [ ] Navigate to `src/app/` directory
- [ ] List main routes

**Step 2: Analysis** (~1 hour)
- [ ] Audit component inventory (50+)
- [ ] Map out route hierarchy
- [ ] Review state management patterns
- [ ] Test responsive design (browser dev tools)
- [ ] Trace key user journeys
- [ ] Assess design consistency
- [ ] Check accessibility basics
- [ ] Note performance observations

**Step 3: Documentation** (~30 min)
- [ ] Create `docs/brownfield/frontend-spec.md`
- [ ] Include findings from all 8 focus areas
- [ ] Include component matrix
- [ ] Include sitemap
- [ ] List technical debt items with priorities

**Step 4: Completion** (~10 min)
- [ ] Update `BROWNFIELD-DISCOVERY-STATE.md`:
  ```yaml
  Phase 3:
    status: COMPLETED
    completedAt: YYYY-MM-DDTHH:MM:SSZ
    agent: @ux-design-expert
    findings: [list of key findings]
  ```

---

## Phase 4 Preparation

As you complete Phases 2 & 3, keep these items in mind for Phase 4 (Draft Technical Debt consolidation):

### From Phase 2 (@data-engineer)
- Key schema improvements needed
- RLS security recommendations
- Performance optimization priorities
- Data consistency concerns

### From Phase 3 (@ux-design-expert)
- Component refactoring opportunities
- Navigation/UX improvements
- Accessibility fixes
- Mobile experience enhancements

### For Phase 4 (@architect)
These findings will be consolidated into:
- Priority matrix (High/Medium/Low)
- Effort estimates (S/M/L/XL)
- Risk assessments
- Roadmap recommendations

---

## Expected Outputs

### Phase 2 Output
```
docs/brownfield/
├── SCHEMA.md           (1,500-2,500 words)
└── DB-AUDIT.md         (1,000-2,000 words)
```

### Phase 3 Output
```
docs/brownfield/
└── frontend-spec.md    (2,000-3,500 words)
```

### Updated State File
```
docs/brownfield/BROWNFIELD-DISCOVERY-STATE.md
```
(Updated with Phase 2 & 3 completion status)

---

## Checkpoint Criteria

### Phase 2 is COMPLETE when:
- ✅ SCHEMA.md created with 6 sections
- ✅ DB-AUDIT.md created with findings
- ✅ State file updated with Phase 2 status
- ✅ Key metrics documented (# tables, # migrations, RLS coverage, etc.)
- ✅ Technical debt items listed with priorities

### Phase 3 is COMPLETE when:
- ✅ frontend-spec.md created with 8 focus areas
- ✅ Component inventory documented
- ✅ Route hierarchy documented
- ✅ State file updated with Phase 3 status
- ✅ Technical debt items listed with priorities

---

## Questions?

### General Workflow Questions
- See: `.claude/rules/workflow-execution.md`

### Tech Stack Questions
- See: `docs/framework/tech-stack.md`

### Code Standards Questions
- See: `docs/framework/coding-standards.md`

### Architecture Questions
- See: `docs/brownfield/system-architecture.md` (Phase 1 output)

---

**Ready to Start?**

Both @data-engineer and @ux-design-expert should proceed with their respective phases immediately after reading this document.

**Estimated Completion**: 2026-02-21 by 18:00 UTC (if parallel execution starts now)

Good luck! Phase 4 will consolidate your findings into a comprehensive technical debt assessment.
