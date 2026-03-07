# Tech Arauz — Database Schema Reference

**Date:** March 6, 2026  
**Version:** 1.0  
**Author:** Dara (Data Engineer)

---

## Core Tables

### Authentication & Tenancy

**tenants**
- id (UUID PK)
- name, owner_id
- created_at, updated_at

**users** (application)
- id (UUID PK)
- tenant_id, auth_user_id, name, email, role
- UNIQUE (tenant_id, auth_user_id)

### Project Portfolio

**projects**
- id, tenant_id, espaider_id
- name, status (active/completed/on-hold), health (low/medium/high)
- manager_id, budget_estimated, budget_spent
- start_date, end_date
- UNIQUE (tenant_id, espaider_id)

**deliverables**
- id, project_id, tenant_id, espaider_id
- name, status, priority
- UNIQUE (tenant_id, espaider_id)
- FK: project (CASCADE)

**schedules**
- id, project_id, deliverable_id, tenant_id, espaider_id
- phase (planning/execution/review), start_date, end_date, status
- UNIQUE (tenant_id, espaider_id)

**requirements**
- id, project_id, tenant_id, espaider_id
- title, description, status, priority
- UNIQUE (tenant_id, espaider_id)

### Integration & Logging

**integration_configs**
- id, tenant_id, integration_type (espaider/slack/email)
- api_url, encrypted_token, is_active
- last_sync
- UNIQUE (tenant_id, integration_type, config_name)

**integration_logs**
- id, tenant_id, integration, action
- status (success/error/pending), message, error_details
- records_affected, created_at
- INDEX: (tenant_id, created_at DESC)

**sync_history**
- id, tenant_id, integration, sync_type
- status, records_affected, duration_ms

### AI & Conversations

**agent_sessions**
- id, user_id, tenant_id, agent_name, title, status
- created_at, updated_at

**agent_messages**
- id, session_id, role (user/assistant/system)
- content, metadata, created_at

### Metadata

**audit_logs**
- id, tenant_id, user_id, action
- resource_type, resource_id, old_values, new_values

**settings**
- id, tenant_id, key, value
- UNIQUE (tenant_id, key)

---

## RLS Policies

**All Tables:**
- Tenant isolation: `USING (tenant_id = current_tenant_id)`
- Service role bypass on: integration_logs, integration_configs

**User-Scoped:**
- agent_sessions: `USING (user_id = current_user_id)`

---

## Indexes (Recommended)

```sql
CREATE INDEX idx_integration_logs_tenant_created 
ON integration_logs(tenant_id, created_at DESC);

CREATE INDEX idx_schedules_project_deliverable 
ON schedules(project_id, deliverable_id);

CREATE INDEX idx_agent_sessions_user_created 
ON agent_sessions(user_id, created_at DESC);

CREATE INDEX idx_projects_tenant_status 
ON projects(tenant_id, status);

CREATE INDEX idx_requirements_project 
ON requirements(project_id);
```

---

## Foreign Keys

- tenants ← users, projects, deliverables, schedules, requirements, integrations
- projects ← deliverables, schedules, requirements
- deliverables ← schedules (optional)

---

## Constraints

### Unique
- users: (tenant_id, auth_user_id)
- projects: (tenant_id, espaider_id)
- deliverables: (tenant_id, espaider_id)
- schedules: (tenant_id, espaider_id)
- requirements: (tenant_id, espaider_id)

### Check (Status Values)
- projects.status: active, completed, on-hold
- projects.health: low, medium, high
- deliverables.status: pending, in-progress, completed, blocked
- integration_logs.status: success, error, pending

---

## Functions & Triggers

- `update_updated_at()` — Auto-update timestamps
- `audit_log_changes()` — Audit trail logging

---

## Views

- `v_project_summary` — Projects with deliverable counts
- `v_schedule_status` — Schedule status (actual vs planned)

---

**Total Tables:** 12  
**Total Migrations:** 55+  
**Estimated Size:** 500MB-2GB

---

**Status:** ✅ SCHEMA DOCUMENTED

*AIOX Brownfield Discovery Workflow*
