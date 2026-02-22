# EPIC: Tech Debt Remediation — Tech Arauz

**Epic ID**: EPIC-2026-Q1-TECHDEBT
**Status**: PLANNING
**Created**: 2026-02-21
**Owner**: CTO Gabriel Cristofolini

---

## 📋 Overview

Resolution of identified technical debt across 6 months (R$ 42.6K, 284 hours). Focus: Foundation (RLS testing, monitoring), Features (real-time, notifications, feedback), Quality (tests, documentation).

---

## 🎯 Business Goals

1. **Enable 30% faster feature development** → Remove friction (TypeScript strict, testing)
2. **Achieve LGPD + WCAG AA compliance** → Legal + accessibility requirements
3. **Reduce bug rate by 40%** → Improve reliability (tests, monitoring)
4. **Improve user experience +40%** → Real-time, notifications, dark mode
5. **Build scalable foundation** → Ready for 10x project growth

---

## 📊 Metrics

### Success Criteria

| Metric | Current | Target | Owner |
|--------|---------|--------|-------|
| Test coverage | 0% | > 60% | @qa |
| TypeScript strict | OFF | Phase 1 done | @frontend |
| Real-time latency | 15-60 min | < 2 sec | @dev |
| WCAG AA compliance | ~95% | 100% | @ux-design-expert |
| LGPD compliance | ~60% | 100% | @security |
| Slow queries tracked | No | Dashboard live | @devops |
| Feature velocity | 1x | 1.3x (+30%) | @pm |
| Bug rate | 100% | 60% (-40%) | @qa |

---

## 📅 Timeline

### Phase 0: Immediate (Week 1) — R$ 1.8K
- [x] Fix dark mode color contrast (4h)
- [x] Create RLS testing framework (8h)

### Phase 1: Quick Wins (Weeks 2-3) — R$ 3.6K
- [ ] Document child table pattern (8h)
- [ ] Plan migration consolidation (8h)
- [ ] Test backup/restore (8h)

### Phase 2: Foundation (Weeks 4-7) — R$ 9.6K
- [ ] Implement query monitoring (16h)
- [ ] TypeScript strict phase 1 (8h)
- [ ] Design soft-delete pattern (16h)
- [ ] Improve form validation UX (8h)

### Phase 3: Features (Weeks 8-11) — R$ 12K
- [ ] Deploy real-time sync (24h)
- [ ] Implement KPI feedback (16h)
- [ ] Mobile Gantt alternative (12h)
- [ ] Add audit logs (12h)

### Phase 4: Polish (Weeks 12-15) — R$ 12K
- [ ] Email/SMS/Slack notifications (40h)
- [ ] Unit test suite (24h)
- [ ] Storybook documentation (16h)

### Phase 5+: Future (Ongoing) — R$ 3.6K
- [ ] E2E tests (32h)
- [ ] PDF export (12h)
- [ ] Mobile app planning (TBD)
- [ ] AI agents (TBD)

---

## 📝 Stories

### Phase 0: Immediate

#### Story 0.1: Fix Dark Mode Color Contrast
- **Points**: 3
- **Hours**: 4
- **Owner**: @ux-design-expert
- **AC**:
  - [ ] Audit current colors in dark mode
  - [ ] Find colors < 4.5:1 contrast
  - [ ] Update palette to WCAG AAA (7:1)
  - [ ] Verify with axe DevTools
  - [ ] Deploy to production
- **Acceptance Criteria**: All colors pass WCAG AAA (7:1)

#### Story 0.2: Create RLS Testing Framework
- **Points**: 5
- **Hours**: 8
- **Owner**: @data-engineer
- **AC**:
  - [ ] Design SQL test template
  - [ ] Test RLS with multiple tenants
  - [ ] Test service role bypass
  - [ ] Create pre-migration validation script
  - [ ] Document in MIGRATION-GUIDE.md
- **Acceptance Criteria**: Framework prevents RLS regressions

---

### Phase 1: Quick Wins

#### Story 1.1: Document Child Table Migration Pattern
- **Points**: 3
- **Hours**: 8
- **Owner**: @data-engineer
- **AC**:
  - [ ] Document correct pattern (UUID PK, UNIQUE constraint)
  - [ ] Create checklist for future child tables
  - [ ] Add to MIGRATION-GUIDE.md
  - [ ] Review past migrations, explain 016-018 issue
- **Acceptance Criteria**: Team can create child tables without issues

#### Story 1.2: Plan Migration Consolidation
- **Points**: 3
- **Hours**: 8
- **Owner**: @data-engineer
- **AC**:
  - [ ] Design consolidated migration strategy
  - [ ] Test consolidation locally
  - [ ] Create rollback procedure
  - [ ] Schedule for v0.2.0 release
- **Acceptance Criteria**: Plan approved, ready to execute

#### Story 1.3: Test Backup & Restore Procedure
- **Points**: 3
- **Hours**: 8
- **Owner**: @devops
- **AC**:
  - [ ] Document Supabase backup settings
  - [ ] Create restore procedure (step-by-step)
  - [ ] Test full restore on staging
  - [ ] Schedule monthly tests
  - [ ] Train ops team
- **Acceptance Criteria**: Restore procedure tested, team trained

---

### Phase 2: Foundation

#### Story 2.1: Implement Query Performance Monitoring
- **Points**: 5
- **Hours**: 16
- **Owner**: @devops
- **AC**:
  - [ ] Add query logging to API routes
  - [ ] Create slow-query table (queries > 500ms)
  - [ ] Build monitoring dashboard
  - [ ] Set alerts (> 2s queries)
  - [ ] Weekly review process
- **Acceptance Criteria**: Slow queries visible, alerts working

#### Story 2.2: TypeScript Strict Mode — Phase 1
- **Points**: 5
- **Hours**: 8
- **Owner**: @frontend
- **AC**:
  - [ ] Fix obvious type errors
  - [ ] Add explicit function signatures
  - [ ] Test no runtime errors
  - [ ] Document progress
- **Acceptance Criteria**: No TypeScript errors, team confident

#### Story 2.3: Design Soft-Delete Pattern
- **Points**: 5
- **Hours**: 16
- **Owner**: @data-engineer
- **AC**:
  - [ ] Design soft-delete schema (deleted_at field, is_deleted flag)
  - [ ] Create migration template
  - [ ] Test cascading soft-delete
  - [ ] LGPD retention compliance
  - [ ] Get compliance sign-off
- **Acceptance Criteria**: Design approved, ready to implement

#### Story 2.4: Improve Form Validation UX
- **Points**: 3
- **Hours**: 8
- **Owner**: @frontend
- **AC**:
  - [ ] Add real-time validation feedback
  - [ ] Highlight error fields
  - [ ] Show helpful error messages
  - [ ] Test with sample forms
- **Acceptance Criteria**: Forms validate smoothly, errors clear

---

### Phase 3: Features

#### Story 3.1: Deploy Real-Time Sync
- **Points**: 8
- **Hours**: 24
- **Owner**: @dev
- **AC**:
  - [ ] Enable Supabase Realtime
  - [ ] Add subscription to projects table
  - [ ] Implement optimistic updates
  - [ ] Add "live" indicator badge
  - [ ] Test concurrent updates
  - [ ] Monitor performance (< 2s latency)
- **Acceptance Criteria**: Real-time sync < 2s latency, 100% uptime

#### Story 3.2: Implement KPI Feedback Mechanism
- **Points**: 5
- **Hours**: 16
- **Owner**: @frontend
- **AC**:
  - [ ] Add satisfaction_score field to projects table
  - [ ] Create feedback form (emoji reactions or 1-5 scale)
  - [ ] Add API endpoint to capture feedback
  - [ ] Sync satisfied_score to KPI display
  - [ ] Test with sample feedback
  - [ ] Target > 50% adoption
- **Acceptance Criteria**: KPI satisfaction reflects real data, > 50% use

#### Story 3.3: Mobile Gantt Chart Alternative
- **Points**: 5
- **Hours**: 12
- **Owner**: @frontend
- **AC**:
  - [ ] Analyze current mobile Gantt issues
  - [ ] Design timeline alternative (horizontal scroll + cards)
  - [ ] Implement responsive timeline
  - [ ] Test on iOS/Android
  - [ ] Performance < 1s load
- **Acceptance Criteria**: Mobile users can view timeline easily

#### Story 3.4: Add Audit Logs for LGPD Compliance
- **Points**: 5
- **Hours**: 12
- **Owner**: @security
- **AC**:
  - [ ] Create audit_logs table (user, action, resource, timestamp)
  - [ ] Add logging to all mutations (create, update, delete)
  - [ ] Create audit view (admin only)
  - [ ] Implement retention policy (30-90 days)
  - [ ] Test LGPD compliance
- **Acceptance Criteria**: Audit logs complete, LGPD audit-ready

---

### Phase 4: Polish

#### Story 4.1: Implement Email/SMS/Slack Notifications
- **Points**: 8
- **Hours**: 40
- **Owner**: @dev
- **AC**:
  - [ ] Integrate SendGrid (email)
  - [ ] Integrate Twilio (SMS)
  - [ ] Integrate Slack webhooks
  - [ ] Create notification preferences UI
  - [ ] Test all channels
  - [ ] Monitor delivery > 95%
- **Acceptance Criteria**: All notification channels working, > 80% opt-in

#### Story 4.2: Build Unit Test Suite
- **Points**: 5
- **Hours**: 24
- **Owner**: @qa
- **AC**:
  - [ ] Create test utilities + mocks
  - [ ] Write tests: KPICard, ProjectCockpit (critical)
  - [ ] Aim for 60% coverage
  - [ ] Add to CI/CD (fail on regression)
  - [ ] Document testing patterns
- **Acceptance Criteria**: > 60% coverage, CI/CD enforces

#### Story 4.3: Create Storybook Documentation
- **Points**: 5
- **Hours**: 16
- **Owner**: @frontend
- **AC**:
  - [ ] Set up Storybook
  - [ ] Document UI primitives (button, card, etc.)
  - [ ] Document feature components
  - [ ] Deploy to design.tech-arauz.com
  - [ ] Train team on usage
- **Acceptance Criteria**: Storybook live, all components documented

---

### Phase 5+: Future

#### Story 5.1: E2E Test Automation (Ongoing)
- **Points**: 8
- **Hours**: 32
- **Owner**: @qa
- **AC**:
  - [ ] Configure Playwright
  - [ ] Write 5-10 core scenarios
  - [ ] Run on every PR
  - [ ] Expand to 30+ scenarios
- **Acceptance Criteria**: > 90% critical path covered

#### Story 5.2: PDF Export Feature
- **Points**: 3
- **Hours**: 12
- **Owner**: @frontend
- **AC**:
  - [ ] Add react-pdf library
  - [ ] Create export button on ProjectCockpit
  - [ ] Template for formatted PDF
  - [ ] Test with large datasets
- **Acceptance Criteria**: Export working, file quality good

---

## 👥 Team Assignment

| Role | Phase 0-1 | Phase 2-3 | Phase 4-5 | Capacity |
|------|-----------|-----------|-----------|----------|
| @architect | — | Oversight | — | 10% |
| @data-engineer | 32h | 32h | 8h | 50% |
| @dev | — | 36h | 40h | 50% |
| @frontend | 4h | 20h | 40h | 75% |
| @devops | — | 16h | — | 25% |
| @qa | — | — | 56h | 50% |
| @ux-design-expert | 4h | 12h | — | 25% |
| @security | — | — | 12h | 20% |

---

## 📈 Success Tracking

### Monthly Reviews
- [ ] Phase 0: Compliance + foundation
- [ ] Phase 1: Documentation + procedures
- [ ] Phase 2: Monitoring + TypeScript progress
- [ ] Phase 3: Real-time + compliance
- [ ] Phase 4: Tests + documentation

### KPIs
- Test coverage: Target 60%+
- Bug rate: Target -40%
- Feature velocity: Target +30%
- LGPD compliance: Target 100%
- WCAG compliance: Target 100%

---

## 💰 Budget

- **Phase 0-4**: R$ 42.6K (284 hours)
- **Staffing** (6 months): R$ 120K
- **Total Investment**: R$ 162.6K
- **Expected ROI (Year 1)**: R$ 840K (8.4:1)

---

## 🔗 Related Documents

- **Executive Summary**: `docs/reports/TECHNICAL-DEBT-REPORT.md`
- **Technical Assessment**: `docs/prd/technical-debt-assessment.md`
- **Architecture**: `docs/architecture/system-architecture.md`

---

**Status**: PLANNING → Ready for Sprint 0 kickoff
**Next Step**: Assign stories, estimate, schedule sprints
