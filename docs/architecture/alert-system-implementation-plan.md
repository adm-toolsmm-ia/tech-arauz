# Alert System Implementation Plan

**Status:** DOCUMENTED FOR FUTURE IMPLEMENTATION
**Date:** March 6, 2026
**Workflow Phase:** Brownfield Discovery - Decision Captured
**Responsible Agents:** @architect (Aria), @ux-design-expert (Uma), @dev (Dex), @data-engineer (Dara)

---

## Overview

**Objective:** Customizable NO CODE alert system for project management.

**Features:**
- 6 pre-configured alert templates
- Visual builder (NO CODE) for users to create custom alerts
- Frontend management page (create, edit, activate/deactivate)
- Email/Slack/Webhook delivery

---

## 6 Alert Templates (MVP)

### Alert 1: No Activity for X Days
**SQL:** `projects.status = 'active' AND projects.updated_at < NOW() - INTERVAL 'X days'`
**Default:** X = 7 days
**Effort:** 4h
**Fields:** Project name, last activity date

### Alert 2: Project Overdue
**SQL:** `projects.status = 'active' AND projects.end_date < CURRENT_DATE`
**Effort:** 4h
**Fields:** Project name, days overdue

### Alert 3: Project Due in X Days
**SQL:** `projects.status = 'active' AND end_date BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL 'X days'`
**Default:** X = 7 days
**Effort:** 4h
**Fields:** Project name, days remaining

### Alert 4: Deliverables Blocked
**SQL:** `projects.status = 'active' AND EXISTS (SELECT 1 FROM deliverables WHERE project_id = projects.id AND status = 'blocked')`
**Effort:** 6h
**Fields:** Project name, count of blocked deliverables

### Alert 5: Budget Variance > X%
**SQL:** `(projects.budget_spent / projects.budget_estimated) > (X/100)`
**Default:** X = 90%
**Effort:** 6h
**Fields:** Project name, budget spent, budget estimated, % variance

### Alert 6: Health Score = Low
**SQL:** `projects.status = 'active' AND projects.health = 'low'`
**Effort:** 4h
**Fields:** Project name, health status

---

## Architecture Components

### Database Schema (Dara)
- `alert_configs` — Alert configurations + metadata
- `alert_rules` — Rule definitions (condition, operator, threshold)
- `alert_history` — Audit trail of triggered alerts

**Indexes:**
- `idx_alert_configs_tenant_active` — For enabling/disabling
- `idx_alert_history_config_created` — For audit trail

### Frontend (Uma)
- `/dashboard/alerts` — Management page
- Alert card UI (toggle on/off, edit, delete)
- Visual builder for custom alerts (NO CODE)
- Parameter editor (threshold values)

### Backend (Dex)
- Alert evaluator service (cron job)
- Rule matcher logic
- Notification dispatcher (Email/Slack/Webhook)
- Alert history logger

---

## Implementation Timeline

| Phase | Duration | Tasks |
|-------|----------|-------|
| **Schema & API** | 1 week | Dara: Create tables, Dex: API routes |
| **Frontend** | 1 week | Uma: UI builder, management page |
| **Integration** | 1 week | Dex: Evaluator + dispatcher |
| **Testing** | 3-4 days | @qa: Coverage, edge cases |
| **Deployment** | 1 day | @devops: Migration, deployment |

**Total:** ~4 weeks (MVP with 6 templates + builder)

---

## Next Steps

1. **Aria (@architect):** Design alert system architecture
2. **Uma (@ux-design-expert):** Design management page & NO CODE builder
3. **Dara (@data-engineer):** Create schema + migrations
4. **Dex (@dev):** Implement evaluator + dispatcher
5. **Quinn (@qa):** Test coverage

---

## Decision Record

✅ **Approved for Future Implementation**
- 6 pre-configured alert templates
- NO CODE builder for custom alerts
- Email/Slack/Webhook delivery channels
- Frontend management + configuration page
- MVP timeline: ~4 weeks

---

*AIOX Brownfield Discovery Workflow — Alert System Architecture Captured*
