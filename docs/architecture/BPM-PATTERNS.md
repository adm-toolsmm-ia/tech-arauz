# BPM-PATTERNS.md

**Status:** ✅ COMPLETE (Phase 2 Content Generation — Story 11.14)

## Overview

Best practices for Business Process Management in Tech Arauz EPIC 11, covering responsible roles assignment, SLA definition patterns, process versioning use cases, and activity templating strategies.

## Table of Contents

- [Responsible Roles Patterns](#responsible-roles-patterns)
- [SLA Definition Patterns](#sla-definition-patterns)
- [Process Versioning Use Cases](#process-versioning-use-cases)
- [Activity Templating Strategies](#activity-templating-strategies)
- [Real-World Examples](#real-world-examples)

## Responsible Roles Patterns

### When to Use Responsible Roles

Responsible roles are string arrays stored in every organizational entity (Areas, Nuclei, Processes, Routines, Activities, Suppliers, Services, Documents). Use them to track **who is responsible for executing, approving, or overseeing** each entity.

#### Single Role Assignment (Most Common)
Use when one person or role type executes the activity:

```typescript
// Example: Activity requires legal review
const activity = {
  name: 'Legal Document Review',
  responsible_roles: ['advogado'],  // Single role
  complexity: 'high',
  required_time_hours: 2
};
```

**When to use:**
- Activities with clear single responsibility
- Quality assurance checkpoints
- Specialized roles (lawyers, doctors, engineers)
- Cost tracking per role

#### Multiple Roles Assignment (Shared Responsibility)
Use when multiple roles execute or collaborate on an activity:

```typescript
// Example: Process requires both legal and business review
const process = {
  name: 'Contract Review and Approval',
  responsible_roles: ['advogado', 'gerente_comercial', 'cfo'],
  inputs: [{ name: 'Draft Contract' }],
  outputs: [{ name: 'Approved Contract' }]
};

// In UI: Display as [Advogado, Gerente Comercial, CFO]
```

**When to use:**
- Cross-functional processes
- Approval workflows
- Complex decision-making
- Risk mitigation (multiple reviews)

#### Hierarchical Role Delegation
Assign roles at different hierarchy levels:

```typescript
// Area level: Strategic roles
const area = {
  name: 'Recuperação de Crédito',
  responsible_roles: ['gerente_area', 'diretor_juridico']
};

// Nucleus level: Operational roles
const nucleus = {
  name: 'Judicial Recovery',
  responsible_roles: ['gerente_nucleo', 'advogado_senior']
};

// Process level: Execution roles
const process = {
  name: 'Initial Filing',
  responsible_roles: ['advogado', 'analista_processual']
};

// Activity level: Task roles
const activity = {
  name: 'File Paperwork',
  responsible_roles: ['analista_processual']  // Most specific level
};
```

**Pattern:**
- Strategic/approval roles at high levels (Area, Nucleus)
- Operational roles at process level
- Execution roles at activity level

**Benefit:** Clear delegation chain for auditing and escalation.

#### Role-Based Access Control (RBAC) with Responsible Roles

Combine responsible_roles with row-level security for RBAC:

```typescript
// Supabase RLS Policy: User can view activities where their role is listed
CREATE POLICY "role_based_activity_access" ON org_activities
  FOR SELECT USING (
    responsible_roles @> auth.jwt()->'user_metadata'->>'roles'::jsonb
  );

// In application:
async function getAssignedActivities(userId: string) {
  const user = await getUser(userId);  // Get user roles from JWT
  const activities = await supabase
    .from('org_activities')
    .select('*')
    // RLS automatically filters by responsible_roles match
    .eq('tenant_id', user.tenant_id);
  return activities;
}
```

**Security Model:**
- User has `roles` in JWT: `["advogado", "gerente"]`
- Can only see activities where `responsible_roles` includes one of their roles
- Cannot view activities assigned to other roles
- Cannot see other organizations' data (tenant isolation)

### Best Practices for Responsible Roles

#### 1. Role Naming Conventions

**Use consistent, hierarchical naming:**
```typescript
// ✅ GOOD: Descriptive, consistent
const roles = [
  'advogado',                    // Base role
  'advogado_senior',             // Senior variant
  'paralegal',
  'gerente_operacional',
  'analista_senior',
  'cfo',
  'diretor_executivo'
];

// ❌ BAD: Inconsistent, ambiguous
const roles = [
  'lawyer',                      // English mixed with Portuguese
  'Boss',                        // Vague
  'person_who_approves_docs',   // Too specific
  'CEO'                          // Not self-evident in context
];
```

**Guidelines:**
- Portuguese language (match organization)
- Lowercase with underscores (snake_case)
- Avoid special characters
- Keep to 50 characters max
- Document all roles in organization metadata

#### 2. Conflict Resolution

When multiple roles have different permissions:

```typescript
// Example: Review process requires both roles, but CFO can override

const activity = {
  name: 'Final Approval',
  responsible_roles: ['advogado', 'cfo'],  // Both required
  approval_rules: {
    mode: 'AND',  // Both must approve
    override_roles: ['diretor_executivo']  // Can override
  }
};
```

**Patterns:**
- **AND mode:** All roles must approve (strictest)
- **OR mode:** Any role can approve (most permissive)
- **Weighted:** Different roles have different vote power
- **Override:** Escalation roles can force approval

#### 3. Handoff Procedures

Document handoffs between roles:

```typescript
// Activity 1: Analyst prepares
{
  name: 'Prepare Case Analysis',
  responsible_roles: ['analista_senior']
}

// Activity 2: Lawyer reviews (same routine)
{
  name: 'Legal Review',
  responsible_roles: ['advogado'],
  inputs: [
    {
      name: 'Case Analysis',
      source_activity_id: 'activity-1-id'  // From analyst
    }
  ]
}

// Activity 3: CFO approves budget
{
  name: 'Approve Costs',
  responsible_roles: ['cfo'],
  inputs: [
    {
      name: 'Legal Opinion',
      source_activity_id: 'activity-2-id'  // From lawyer
    }
  ]
}
```

**Pattern:** Implicit handoff via activity sequence and documented inputs/outputs.

#### 4. Audit Trails

Track who did what and when:

```sql
-- Query: Audit trail of responsible role assignments
SELECT
  a.id, a.name,
  a.responsible_roles,
  a.updated_at,
  u.email as last_updated_by
FROM org_activities a
LEFT JOIN public.user_audits u ON a.id = u.entity_id
WHERE a.tenant_id = $1
  AND u.entity_type = 'org_activity'
ORDER BY a.updated_at DESC;
```

**Tracking:**
- Use `updated_at` timestamp on activities
- Log user ID when responsible_roles changes
- Store historical versions of role assignments
- Audit: "Who changed the responsible party and when?"

## SLA Definition Patterns

### SLA Structure (Story 11.3)

SLAs are defined per Process and track performance against committed targets. The `org_process_slas` table stores:

```typescript
interface ProcessSLA {
  id: UUID;
  process_id: UUID;
  name: string;                         // e.g., "Standard SLA", "Premium SLA"
  target_cycle_time_hours: integer;     // Max hours to complete
  target_quality_percentage: integer;   // 0-100, quality metric
  escalation_threshold_hours: integer;  // When to escalate (nullable)
}
```

**Example:** Credit Recovery Process
```sql
INSERT INTO org_process_slas (process_id, name, target_cycle_time_hours, target_quality_percentage, escalation_threshold_hours)
VALUES
  ('process-id-123', 'Standard Recovery', 72, 95, 48),  -- 3 days, 95% quality, escalate at 48h
  ('process-id-123', 'Expedited Recovery', 24, 98, 12);  -- 1 day, 98% quality, escalate at 12h
```

### Time-Based SLAs

Define response and completion deadlines:

```typescript
// Response Time SLA: Answer customer within 4 hours
const sla = {
  name: 'Customer Response SLA',
  target_cycle_time_hours: 4,
  escalation_threshold_hours: 2  // Escalate if not started after 2h
};

// Completion Time SLA: Close case within 30 days
const sla = {
  name: '30-Day Close SLA',
  target_cycle_time_hours: 720,  // 30 days * 24 hours
  escalation_threshold_hours: 360  // Escalate at 15 days
};
```

### Metric-Based SLAs

Define quality and outcome targets:

```typescript
// Quality SLA: 95% accuracy required
const sla = {
  name: 'Quality Assurance SLA',
  target_cycle_time_hours: 48,
  target_quality_percentage: 95,  // 95% of cases pass QA first time
  escalation_threshold_hours: 24
};

// Case Resolution SLA: 90% successful closure
const sla = {
  name: 'Case Resolution SLA',
  target_cycle_time_hours: 144,  // 6 days
  target_quality_percentage: 90  // 90% of cases successfully resolved
};
```

### Multi-Level SLAs

Create different SLAs based on case complexity:

```sql
-- Standard cases: 72 hours
INSERT INTO org_process_slas (process_id, name, target_cycle_time_hours, target_quality_percentage)
VALUES ('proc-123', 'Low Complexity', 72, 90);

-- Medium complexity: 10 days
INSERT INTO org_process_slas (process_id, name, target_cycle_time_hours, target_quality_percentage)
VALUES ('proc-123', 'Medium Complexity', 240, 95);

-- High complexity: 30 days
INSERT INTO org_process_slas (process_id, name, target_cycle_time_hours, target_quality_percentage)
VALUES ('proc-123', 'High Complexity', 720, 98);

-- In application, select SLA based on case.complexity
const sla = await selectSLA(processId, caseComplexity);
```

### Common SLA Scenarios

#### Scenario 1: Legal Filing Process
```sql
-- Initial filing: 24 hour response, 48 hour completion
INSERT INTO org_process_slas (process_id, name, target_cycle_time_hours, escalation_threshold_hours)
VALUES
  ('legal-filing', 'Initial Response', 1, 0.5),
  ('legal-filing', 'Complete Filing', 2, 1);
```

#### Scenario 2: Contract Review
```sql
-- Escalation at specific thresholds
INSERT INTO org_process_slas (process_id, name, target_cycle_time_hours, escalation_threshold_hours, target_quality_percentage)
VALUES ('contract-review', 'Review and Approval', 5, 3, 100);  -- 5 days, escalate at 3 days, zero defects
```

#### Scenario 3: Customer Support
```sql
-- Tiered SLA: Response < Resolution
INSERT INTO org_process_slas (process_id, name, target_cycle_time_hours)
VALUES
  ('support-response', 'First Response', 1),     -- 1 hour
  ('support-resolve', 'Issue Resolution', 24);   -- 1 day
```

### Monitoring SLA Compliance

Query current compliance against SLA targets:

```sql
SELECT
  p.name as process_name,
  ps.name as sla_name,
  pm.metric_date,
  pm.total_cases,
  pm.completed_cases,
  pm.average_cycle_time_hours,
  pm.quality_percentage,
  CASE
    WHEN pm.average_cycle_time_hours <= ps.target_cycle_time_hours
      AND pm.quality_percentage >= ps.target_quality_percentage
    THEN '✅ COMPLIANT'
    WHEN pm.average_cycle_time_hours > ps.target_cycle_time_hours * 1.1
      OR pm.quality_percentage < ps.target_quality_percentage * 0.9
    THEN '❌ FAILED'
    ELSE '⚠️ WARNING'
  END as compliance_status
FROM org_processes p
JOIN org_process_slas ps ON p.id = ps.process_id
LEFT JOIN org_process_metrics pm ON ps.process_id = pm.process_id
WHERE p.tenant_id = $1
ORDER BY pm.metric_date DESC;
```

### Escalation Rules

Implement escalation when SLA is at risk:

```typescript
// In activity execution, check if escalation threshold passed
if (
  hoursElapsed > sla.escalation_threshold_hours &&
  !activityCompleted
) {
  // Escalate to manager
  await notifyEscalation({
    process_id: process.id,
    activity_id: activity.id,
    reason: `SLA escalation threshold (${sla.escalation_threshold_hours}h) exceeded`,
    assigned_to: getManagerForRole(activity.responsible_roles[0])
  });
}
```

## Activity Templating Strategies (Story 11.5)

Activity templates (`org_activity_templates`) enable reusable activity patterns across routines and processes. A template captures the complete activity definition and can be instantiated with customizations.

### Template Structure

An activity template stores a complete activity definition:

```typescript
interface ActivityTemplate {
  id: UUID;
  tenant_id: UUID;
  name: string;                  // e.g., "Legal Document Review"
  description: string;
  activity_template: {
    // Complete activity definition
    name: string;
    objective: string;
    complexity: 'low' | 'medium' | 'high';
    priority: 'low' | 'normal' | 'high';
    required_role: string;
    average_execution_time: number;
    inputs: OrgInputOutput[];     // Inputs required
    outputs: OrgInputOutput[];    // Outputs produced
    responsible_roles: string[];  // Default roles
    risks: string[];              // Known risks
    impacts: string[];            // Business impacts
    documentation: {
      procedure: string;
      requirements: string[];
      checklist: string[];
    };
  };
}
```

### Template Instantiation

Create an activity from a template:

```typescript
// Template: "Legal Document Review"
const template = await getActivityTemplate('template-legal-review');

// Instantiate with custom parameters
const activity = {
  routine_id: 'routine-123',
  ...template.activity_template,
  name: 'Review Sales Contract',  // Custom name
  required_role: 'advogado',
  average_execution_time: 3  // Override default time
};

await createActivityAction(activity);
```

### Template Types by Use Case

#### Document Review Template
```typescript
const documentReviewTemplate = {
  name: 'Document Review',
  activity_template: {
    objective: 'Review and approve documents',
    complexity: 'medium',
    required_role: 'advogado',
    average_execution_time: 2,
    inputs: [{ name: 'Draft Document' }],
    outputs: [{ name: 'Approved/Rejected Document' }],
    responsible_roles: ['advogado'],
    checklist: [
      'Check legal compliance',
      'Verify all signatures',
      'Review dates and deadlines',
      'Approve or request changes'
    ]
  }
};
```

#### Quality Assurance Template
```typescript
const qaTemplate = {
  name: 'Quality Assurance Check',
  activity_template: {
    objective: 'Verify work quality and completeness',
    complexity: 'low',
    required_role: 'gerente_operacional',
    average_execution_time: 1,
    inputs: [{ name: 'Completed Work Product' }],
    outputs: [{ name: 'QA Report' }],
    responsible_roles: ['gerente_operacional'],
    documentation: {
      checklist: [
        'Verify all required fields filled',
        'Check for data accuracy',
        'Review for completeness',
        'Approve or send back for revision'
      ]
    }
  }
};
```

### Best Practices for Templating

1. **Reuse High-Value Activities:** Create templates for repetitive activities (reviews, approvals, quality checks)
2. **Keep Templates Generic:** Allow customization of name, time, and role
3. **Document Variations:** Note which fields are always the same vs. customizable
4. **Version Templates:** Track template changes and deprecate old versions
5. **Measure Template Usage:** Track which templates are used most to refine them

---

## Real-World Examples

### Legal Office: "Recuperação de Crédito" (Credit Recovery)

**Organizational Structure:**
```
Organization: Law Firm ABC
├─ Area: Recuperação de Crédito (Credit Recovery)
│  ├─ Nucleus: Judicial Recovery
│  │  └─ Process: Initial Filing
│  │     ├─ Routine: Prepare Documents
│  │     │  ├─ Activity: Interview Client (paralegal)
│  │     │  ├─ Activity: Research Debtor (analyst)
│  │     │  ├─ Activity: Prepare Legal Brief (advogado)
│  │     │  └─ Activity: Legal Review (advogado_senior)
│  │     └─ Routine: File and Track
│  │        ├─ Activity: File Documents (paralegal)
│  │        └─ Activity: Confirm Filing (court_liaison)
│  │
│  └─ Nucleus: Extrajudicial Recovery
│     └─ Process: Negotiation
│        ├─ Routine: Initial Contact
│        │  ├─ Activity: Send Demand Letter
│        │  └─ Activity: Follow-up Call
│        └─ Routine: Negotiation
│           ├─ Activity: Negotiate Settlement
│           └─ Activity: Close Case
```

**Role Assignments:**
```typescript
const roles = [
  'advogado',              // Lawyers
  'advogado_senior',       // Senior lawyers
  'paralegal',             // Paralegals
  'analista_senior',       // Senior analysts
  'court_liaison',         // Court representatives
  'gerente_area',          // Area manager
  'diretor_juridico'       // Legal director
];
```

**SLA Example:**
```sql
-- Initial filing must complete in 72 hours
INSERT INTO org_process_slas (process_id, name, target_cycle_time_hours, target_quality_percentage, escalation_threshold_hours)
VALUES
  ('initial-filing', 'Standard SLA', 72, 100, 48),  -- 100% quality (legal accuracy)
  ('initial-filing', 'Expedited SLA', 24, 100, 12);  -- Expedited option
```

**Activity Template:**
```typescript
const legalBriefTemplate = {
  name: 'Prepare Legal Brief',
  activity_template: {
    objective: 'Draft comprehensive legal argument',
    complexity: 'high',
    required_role: 'advogado',
    average_execution_time: 8,
    inputs: [
      { name: 'Case Facts' },
      { name: 'Research Documents' },
      { name: 'Applicable Laws' }
    ],
    outputs: [
      { name: 'Legal Brief (Draft)' }
    ],
    responsible_roles: ['advogado'],
    risks: ['Incomplete research', 'Legal error'],
    impacts: ['Case viability', 'Filing timeline']
  }
};
```

### Consultancy: Process Optimization Engagement

**Organizational Structure:**
```
Organization: Consulting Firm XYZ
├─ Area: Management Consulting
│  └─ Nucleus: Operations Optimization
│     └─ Process: Operational Audit
│        ├─ Routine: Discovery
│        │  ├─ Activity: Stakeholder Interviews
│        │  ├─ Activity: Document Current Processes
│        │  └─ Activity: Collect Performance Data
│        │
│        ├─ Routine: Analysis
│        │  ├─ Activity: Identify Inefficiencies
│        │  ├─ Activity: Benchmark Against Industry
│        │  └─ Activity: Calculate Potential Savings
│        │
│        └─ Routine: Recommendations
│           ├─ Activity: Draft Recommendations
│           ├─ Activity: Build Business Case
│           └─ Activity: Present to Leadership
```

**Responsible Roles:**
```typescript
const roles = [
  'consultant_junior',
  'consultant_senior',
  'engagement_manager',
  'partner',
  'client_sponsor'
];
```

**Multi-Level Approval:**
```typescript
// Draft recommendations require multiple approvals
const activity = {
  name: 'Draft Recommendations',
  responsible_roles: ['consultant_senior', 'engagement_manager'],
  approval_rules: {
    mode: 'AND',  // Both must approve
    override_roles: ['partner']  // Partner can override
  }
};
```

### Corporate: Procurement Process

**Organizational Structure:**
```
Organization: Large Corporation
├─ Area: Procurement
│  ├─ Nucleus: Vendor Management
│  │  └─ Process: Vendor Onboarding
│  │     ├─ Routine: RFQ and Evaluation
│  │     ├─ Routine: Contract Negotiation
│  │     └─ Routine: Approval and Setup
│  │
│  └─ Nucleus: Purchase Orders
│     └─ Process: PO Processing
│        ├─ Routine: PO Creation
│        ├─ Routine: Approval Workflow
│        └─ Routine: Receipt and Invoice
```

**Cross-Functional Responsible Roles:**
```typescript
const process = {
  name: 'PO Approval',
  responsible_roles: ['procurement_manager', 'finance_controller', 'department_head']
  // All three roles must review and approve
};
```

**SLA with Escalation:**
```sql
INSERT INTO org_process_slas (process_id, name, target_cycle_time_hours, escalation_threshold_hours)
VALUES
  ('po-approval', 'Standard PO', 24, 12),      -- 1 day, escalate at 12h
  ('po-approval', 'High-Value PO', 48, 24);   -- 2 days, escalate at 1 day
```

---

**Next:** For complete AI integration patterns, see `docs/guides/AI-CONTEXT-ENGINEERING.md`

## Real-World Examples

### Legal Office Process

**[Content to be generated when Story 11.13 ≥75%]**

Example: "Recuperação de Crédito" (Credit Recovery)
- Area structure
- Responsible roles assignment
- SLA definitions
- Activity templates

### Consultancy Process

**[Content to be generated when Story 11.13 ≥75%]**

Example consulting process with:
- Role hierarchy
- Approval workflows
- Metrics tracking
- Client communication

### Corporate Operations

**[Content to be generated when Story 11.13 ≥75%]**

Example enterprise process with:
- Multi-department coordination
- Compliance checkpoints
- Performance monitoring
- Change management

---

**Next:** When Story 11.13 ≥75%, Phase 2 content generation will populate all sections with concrete examples.
