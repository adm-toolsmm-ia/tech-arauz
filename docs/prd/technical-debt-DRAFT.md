# Technical Debt Assessment - DRAFT

**Document**: Phase 4 of Brownfield Discovery (Initial Consolidation)
**Date**: 2026-02-21
**Project**: Tech Arauz
**Status**: DRAFT for specialist review

---

## 📋 Overview

This document consolidates technical debt identified across **System**, **Database**, and **Frontend** analyses (Phases 1-3). Each finding is listed below with preliminary severity, impact, and cost estimates. **Specialists will validate and refine these assessments** in Phases 5-7.

---

## 🔴 Débitos Críticos (CRITICAL)

### None identified
All critical infrastructure is stable, tested, and production-ready.

---

## 🟠 Débitos Altos (HIGH)

### 1. **KPI Satisfaction Score Hardcoded** (UI/UX)
- **ID**: D-UX-001
- **Area**: Frontend/Dashboard
- **Description**: KPI card shows hardcoded satisfaction score of 4.5/5.0 with no feedback mechanism
- **Impact**: Dashboard metrics inaccurate, stakeholders unaware of actual satisfaction
- **Severity**: HIGH
- **Estimated Hours**: 16 (form + API + sync)
- **Implementation**:
  1. Add `satisfaction_score` field to projects table (NUMERIC)
  2. Create feedback form in UI (dialog + submission)
  3. Add API endpoint to capture feedback
  4. Sync satisfied_score from feedback to KPI display
  5. Test with sample feedback data

### 2. **RLS Policy Complexity** (Database/Security)
- **ID**: D-DB-001
- **Area**: Database/RLS
- **Description**: RLS policies required 3 migration cycles (016-018, then 023-025) to stabilize. Complexity risk for future policies.
- **Impact**: Future schema changes may break RLS if not carefully tested
- **Severity**: HIGH
- **Estimated Hours**: 12 (documentation + testing framework)
- **Implementation**:
  1. Document RLS pattern (done in DB-AUDIT.md)
  2. Create RLS testing framework (SQL + migration validation)
  3. Add pre-migration RLS validation script
  4. Integrate into CI/CD pipeline
  5. Train team on RLS patterns

### 3. **Migration History Bloat** (Database/DevOps)
- **ID**: D-DB-002
- **Area**: Database/Maintenance
- **Description**: 25 sequential migrations, including 3 reverted (016-018). History makes future squashing complex.
- **Impact**: Onboarding difficulty, longer migrations, complex reset procedures
- **Severity**: HIGH
- **Estimated Hours**: 20 (squash, test, verify)
- **Implementation**:
  1. Create consolidated migration (001_base_schema.sql)
  2. Include all current state (tables, RLS, indices, constraints)
  3. Test on fresh database
  4. Archive old migrations to docs/migrations-archive/
  5. Update setup documentation
  6. Plan for v0.2.0 release

---

## 🟡 Débitos Médios (MEDIUM)

### 4. **TypeScript Strict Mode Disabled** (Code Quality)
- **ID**: D-CODE-001
- **Area**: Frontend/Code Quality
- **Description**: TypeScript strict mode partially disabled (allowJs: true). Some areas missing strict null checks.
- **Impact**: Type safety gaps, potential runtime errors, harder refactoring
- **Severity**: MEDIUM
- **Estimated Hours**: 32 (incremental: 8/week for 4 weeks)
- **Implementation**:
  1. Week 1: Fix obvious null/undefined errors
  2. Week 2: Add explicit types to all function signatures
  3. Week 3: Enable strictNullChecks in tsconfig
  4. Week 4: Full strict mode, test suite pass
  5. Update documentation

### 5. **No Real-Time Sync** (Backend/Integration)
- **ID**: D-INT-001
- **Area**: Backend/Integration
- **Description**: Manual sync only (hourly or button-triggered). Supabase Realtime available but not implemented.
- **Impact**: Delayed project updates, users must refresh manually, stale data in dashboards
- **Severity**: MEDIUM
- **Estimated Hours**: 24 (implement + test)
- **Implementation**:
  1. Enable Supabase Realtime in project settings
  2. Add subscription to projects table
  3. Implement optimistic updates in TanStack Query
  4. Add "live indicator" badge to UI
  5. Test with concurrent updates

### 6. **No Backup/Restore Procedure** (DevOps/Disaster Recovery)
- **ID**: D-DEVOPS-001
- **Area**: DevOps/Infrastructure
- **Description**: Supabase manages backups, but no documented restore procedure or testing plan
- **Impact**: Slow recovery if needed, unclear RTO/RPO, untested process
- **Severity**: MEDIUM
- **Estimated Hours**: 8 (document + test)
- **Implementation**:
  1. Document Supabase backup settings
  2. Create restore procedure (step-by-step)
  3. Schedule monthly restore test
  4. Update disaster recovery plan
  5. Train ops team

### 7. **No Query Performance Monitoring** (Backend/DevOps)
- **ID**: D-DEVOPS-002
- **Area**: DevOps/Monitoring
- **Description**: No application-level query monitoring or slow-query logging
- **Impact**: Slow queries undetected, performance degradation invisible, debugging difficult
- **Severity**: MEDIUM
- **Estimated Hours**: 16 (add logging + dashboard)
- **Implementation**:
  1. Add query performance logging to API routes
  2. Log queries >500ms to separate table
  3. Create dashboard for slow-query analysis
  4. Set up alerts (>2s queries)
  5. Review weekly

### 8. **Notifications Visual Only** (Backend/Integration)
- **ID**: D-INT-002
- **Area**: Backend/Integration
- **Description**: Toast notifications only (Sonner). No email, SMS, or Slack alerts for project updates
- **Impact**: Users miss critical updates if not checking dashboard, limited mobile support
- **Severity**: MEDIUM
- **Estimated Hours**: 40 (email + SMS + Slack)
- **Implementation**:
  1. Email integration (SendGrid): 16 hours
  2. SMS integration (Twilio): 12 hours
  3. Slack integration (webhooks): 8 hours
  4. Notification preferences UI: 4 hours

### 9. **Child Tables Schema Migration History** (Database/Maintenance)
- **ID**: D-DB-003
- **Area**: Database/Maintenance
- **Description**: Histories, approvers, budgets tables added via migrations 013, 019, 021 (iterative fixes). Schema had consistency issues in migrations 016-018.
- **Impact**: Confusing migration history, potential future bugs if pattern not understood
- **Severity**: MEDIUM
- **Estimated Hours**: 8 (documentation)
- **Implementation**:
  1. Document correct child-table pattern in migration-guide.md
  2. Add comments to 019, 021 migrations
  3. Create checklist for future child tables
  4. Add to onboarding docs

---

## 🟢 Débitos Baixos (LOW)

### 10. **No Unit Tests** (Code Quality/Testing)
- **ID**: D-TEST-001
- **Area**: Frontend/Testing
- **Description**: Vitest configured but no component unit tests written
- **Impact**: Regression risk, harder refactoring, harder onboarding
- **Severity**: LOW
- **Estimated Hours**: 24 (initial suite, ongoing)
- **Implementation**:
  1. Create test utility helpers (setup, mocks)
  2. Write tests for KPICard, ProjectCockpit (critical)
  3. Aim for 60% coverage minimum
  4. Add to CI/CD (fail on coverage drop)

### 11. **No E2E Tests** (Testing)
- **ID**: D-TEST-002
- **Area**: Testing
- **Description**: Playwright not configured. No end-to-end scenarios tested.
- **Impact**: Risk of broken user flows, harder deployment confidence
- **Severity**: LOW
- **Estimated Hours**: 32 (setup + core scenarios)
- **Implementation**:
  1. Configure Playwright CI integration
  2. Write 5-10 core scenarios (login, sync, filter, etc.)
  3. Run on every PR
  4. Expand to 30+ scenarios over time

### 12. **PDF Export Missing** (Frontend/Features)
- **ID**: D-UX-002
- **Area**: Frontend/Features
- **Description**: Users cannot export/print projects, schedules, or reports as PDF
- **Impact**: Users resort to screenshots, limited reporting capability
- **Severity**: LOW
- **Estimated Hours**: 12 (React to PDF library)
- **Implementation**:
  1. Add react-pdf or similar library
  2. Create export button on ProjectCockpit
  3. Template for formatted PDF (title, dates, budget)
  4. Test with various data sizes

### 13. **Mobile App Missing** (Frontend/Platform)
- **ID**: D-PLATFORM-001
- **Area**: Frontend/Platform
- **Description**: No native mobile app (iOS/Android). Responsive web exists.
- **Impact**: Limited mobile experience, no offline mode, no push notifications
- **Severity**: LOW (future enhancement)
- **Estimated Hours**: 200+ (React Native full app)
- **Implementation**:
  1. Plan for future roadmap
  2. Consider React Native + Expo
  3. Share business logic with web (custom hooks)
  4. Target for Q3 2026

### 14. **AI Integration Incomplete** (Backend/Features)
- **ID**: D-FEATURES-001
- **Area**: Backend/Features
- **Description**: AIOS framework integrated, but agents not yet implemented in UI (future feature)
- **Impact**: Limited AI intelligence, no automated insights
- **Severity**: LOW (planned feature)
- **Estimated Hours**: 80+ (agents implementation)
- **Implementation**:
  1. Implement agent personas (LangChain/LangGraph)
  2. Add /agentes module (UI)
  3. Connect to LangSmith for observability
  4. Target for Q4 2026

### 15. **Metadata JSONB Indices Missing** (Database/Performance)
- **ID**: D-DB-004
- **Area**: Database/Performance
- **Description**: JSONB fields (`espaider_raw`, `metadata`) not indexed. Complex queries slow.
- **Impact**: Slow searches in large datasets, poor performance on complex filters
- **Severity**: LOW (appears only with 100K+ records)
- **Estimated Hours**: 4 (add GIN indices)
- **Implementation**:
  1. Add GIN index: `CREATE INDEX ON projects USING GIN(espaider_raw);`
  2. Add GIN index: `CREATE INDEX ON integration_log_entries USING GIN(metadata);`
  3. Test query performance
  4. Document JSONB query patterns

### 16. **Theme System Limited** (Frontend/UX)
- **ID**: D-UX-003
- **Area**: Frontend/UX
- **Description**: Light/dark mode only. No custom color schemes, accessibility high-contrast mode
- **Impact**: Limited personalization, no high-contrast option for accessibility
- **Severity**: LOW
- **Estimated Hours**: 8 (add theme variants)
- **Implementation**:
  1. Add 2-3 color theme options (dark, light, high-contrast)
  2. Store theme preference in profiles
  3. Add theme selector in settings
  4. Test WCAG AA with each theme

### 17. **Sync Retry Logic Could Be Smarter** (Backend/Integration)
- **ID**: D-INT-003
- **Area**: Backend/Integration
- **Description**: Fixed retry (3x with backoff). No exponential backoff, circuit breaker basic.
- **Impact**: Sync inefficiency, delayed recovery from API issues
- **Severity**: LOW
- **Estimated Hours**: 8 (implement adaptive retry)
- **Implementation**:
  1. Implement exponential backoff (1s, 2s, 4s, 8s)
  2. Improve circuit breaker (track failure rate)
  3. Add metrics/logging for retry analysis
  4. Test with API throttling scenarios

### 18. **No Audit Log for User Actions** (Security/Compliance)
- **ID**: D-SECURITY-001
- **Area**: Security/Compliance
- **Description**: Only Espaider sync logged. No audit trail for user create/update/delete
- **Impact**: Compliance risk, hard to debug user-caused issues
- **Severity**: LOW (important for LGPD compliance)
- **Estimated Hours**: 12 (create table + logging)
- **Implementation**:
  1. Create `audit_logs` table (user, action, resource, timestamp)
  2. Add logging to all mutations (create, update, delete projects/users)
  3. Add audit view in UI (admin only)
  4. Comply with LGPD retention requirements

---

## 📊 Debt Matrix

### **By Impact & Effort** (Prioritization Grid)

```
HIGH IMPACT, LOW EFFORT (Quick Wins)
─────────────────────────────────────
[D-DB-003] Child table documentation (8h)
[D-DB-004] JSONB indices (4h)
[D-UX-003] Theme variants (8h)

HIGH IMPACT, HIGH EFFORT (Strategic)
─────────────────────────────────────
[D-CODE-001] TypeScript strict (32h)
[D-INT-001] Real-time sync (24h)
[D-INT-002] Notifications (40h)
[D-DEVOPS-002] Query monitoring (16h)

LOW IMPACT, LOW EFFORT (Nice-to-Have)
─────────────────────────────────────
[D-INT-003] Smart retry logic (8h)
[D-SECURITY-001] Audit logs (12h)
[D-TEST-001] Unit tests (24h)

LOW IMPACT, HIGH EFFORT (Defer)
─────────────────────────────────────
[D-TEST-002] E2E tests (32h)
[D-UX-002] PDF export (12h)
[D-PLATFORM-001] Mobile app (200h)
[D-FEATURES-001] AI agents (80h)
```

---

## 💰 Estimated Cost & Timeline

### **Quick Wins** (2-3 weeks, R$ 3K-5K)
- D-DB-003, D-DB-004, D-UX-003, D-INT-003

### **Foundation** (4-6 weeks, R$ 12K-16K)
- D-CODE-001, D-INT-001, D-DEVOPS-002, D-DEVOPS-001, D-DB-001, D-SECURITY-001

### **Enhancements** (6-8 weeks, R$ 10K-15K)
- D-INT-002, D-UX-001, D-TEST-001, D-TEST-002, D-UX-002

### **Future Roadmap** (Q3-Q4 2026, R$ 50K+)
- D-PLATFORM-001, D-FEATURES-001

---

## 🔗 Questions for Specialists

**@data-engineer**:
- Are RLS policies robust enough, or need redesign?
- Should we consolidate migrations now or wait for 0.2.0?
- Priority: Query monitoring or JSONB indices?

**@ux-design-expert**:
- How critical is KPI satisfaction score fix?
- Theme variants worth doing before mobile app?
- PDF export or focus on other features?

**@qa**:
- Unit test or E2E test priority?
- Should we block deployments on coverage %?

---

## 📝 Change Log

| Date | Author | Change |
|------|--------|--------|
| 2026-02-21 | @architect | Initial DRAFT from phases 1-3 |

---

**Status**: DRAFT
**Next Phase**: Specialist validation (Phases 5-7)
**Target**: Complete assessment by 2026-02-28
