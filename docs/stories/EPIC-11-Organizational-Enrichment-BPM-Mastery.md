# 📊 EPIC 11: Organizational Enrichment & BPM Mastery

**Subtitle:** Complete Organization Knowledge Graph with Advanced BPM, Role Management, and AI Context Engineering

**Timeline:** 4-5 weeks (March 28 — April 25, 2026)
**Team:** Dex (@dev) + Dara (@data-engineer) + Uma (@ux-design-expert) + Aria (@architect) + Alex (@analyst)
**Effort:** 55-70 hours
**Status:** 🔄 READY FOR PLANNING

---

## 📋 Epic Overview

**EPIC 11** completes the transformation of Tech Arauz from a **project management platform** into a comprehensive **360° Organizational Management & BPM Platform** with:

1. **Advanced Role Management** — Responsible parties at all hierarchical levels
2. **Process-Activity-System Integration** — Complete data relationships
3. **BPM Mastery** — Metrics, SLAs, versioning, templates
4. **AI Context Engineering** — Deep organizational context for intelligent systems
5. **Bootstrap & Customization** — Reusable organizational patterns
6. **Frontend Synchronization** — Complete UI implementation across all modules

### Current State (EPIC 10 + Refinement)
- ✅ 9 Cockpit360 components deployed
- ✅ 35 Server Actions implemented
- ✅ 10 routes with hierarchical navigation
- ✅ AI context transformers (Story 9.8)
- ✅ Responsive roles in Areas, Nuclei, Processes, Routines
- ✅ Suppliers/Services/Documents with responsible_roles (Migration 065)

### Target State (EPIC 11 + Post-Release)
- ✅ **Responsible roles in Activities** — Complete role coverage
- ✅ **Activity-System relationships** — Mapping which systems each activity uses
- ✅ **Process SLAs & Metrics** — Performance tracking per process
- ✅ **Activity Templates** — Reusable activity patterns
- ✅ **Role Permissions Model** — RBAC governance
- ✅ **Advanced Search/Filter** — Enterprise-grade organizational navigation
- ✅ **Bulk Operations** — Import/export/batch management
- ✅ **AI Context Embeddings** — Semantic search for knowledge base
- ✅ **Complete Frontend Sync** — All fields displayed and editable everywhere
- ✅ **Bootstrap Customization** — User-friendly organizational setup wizard

---

## 🎯 Key Deliverables by Phase

### Phase 1: Schema Enhancements & Role Mastery (Week 1)
- [11.1] Add `responsible_roles` to Activities (DB migration)
- [11.2] Create Activity-System relationship table (Many-to-Many)
- [11.3] Create Process SLAs table (SLA per process level)
- [11.4] Create Role Permissions table (RBAC definitions)
- [11.5] Update TypeScript types for all new relationships

### Phase 2: Backend Implementation (Weeks 2-3)
- [11.6] Implement Server Actions for responsible roles (CRUD in Activities)
- [11.7] Implement Server Actions for Activity-System relationships
- [11.8] Implement Server Actions for Process metrics & SLAs
- [11.9] Implement RLS policies for all new tables
- [11.10] Create audit logging for responsible party changes

### Phase 3: Frontend Synchronization (Weeks 3-4)
- [11.11] Integrate ResponsibleRolesInput in OrgEntityFormSheet
- [11.12] Add Activity-System management UI (modal/sheet)
- [11.13] Display SLA metrics in ProcessCockpit360
- [11.14] Add bulk edit/delete operations
- [11.15] Implement advanced search/filter across org entities

### Phase 4: AI Context Engineering (Week 4-5)
- [11.16] Generate embeddings for knowledge entries (semantic search)
- [11.17] Create role context injector for AI agents
- [11.18] Implement process metrics context transformer
- [11.19] Create organizational setup wizard (bootstrap customization)
- [11.20] Document AI context patterns and usage guidelines

---

## 📖 Stories Detail

### Story 11.1: Add responsible_roles to Activities (DB)

**Owner:** Dara (@data-engineer)
**Effort:** 3-4 hours
**Priority:** CRITICAL
**Status:** ⏳ READY FOR DEV
**Depends on:** None

#### Acceptance Criteria

- [ ] Migration created: `066_add_responsible_roles_to_activities.sql`
- [ ] `org_activities.responsible_roles` JSONB default '[]' + GIN index
- [ ] RLS policies updated (USING true, WITH CHECK true per ADR-001)
- [ ] TypeScript `OrgActivity` type updated with `responsible_roles: string[]`
- [ ] DB lint + migration validation passing
- [ ] Rollback script tested and documented
- [ ] No data loss on rollback

#### Architecture

```sql
ALTER TABLE public.org_activities
ADD COLUMN responsible_roles JSONB DEFAULT '[]' NOT NULL;

CREATE INDEX idx_org_activities_responsible_roles_gin
ON public.org_activities USING GIN(responsible_roles);

COMMENT ON COLUMN public.org_activities.responsible_roles
  IS 'Array of roles responsible for executing this activity (e.g., ["advogado", "analista_senior"])';
```

#### Dev Notes

- Pattern matches existing responsible_roles in Areas, Nuclei, Processes, Routines
- Consistent with Story 10.1 responsible_roles rollout
- Update action creators: `updateActivityAction` must handle responsible_roles

#### Testing

- [ ] Unit: Migration creates column with correct type
- [ ] Unit: RLS allows tenant read/write
- [ ] Integration: Create activity WITH responsible_roles
- [ ] Integration: Update activity responsible_roles
- [ ] Regression: Existing activities load correctly

#### File List

- `supabase/migrations/066_add_responsible_roles_to_activities.sql` (NEW)
- `src/types/organization.ts` (MODIFIED — update OrgActivity type)
- `src/app/actions/organization.ts` (MODIFIED — updateActivityAction)

---

### Story 11.2: Create Activity-System Relationship Table

**Owner:** Dara (@data-engineer)
**Effort:** 4-5 hours
**Priority:** HIGH
**Status:** ⏳ READY FOR DEV
**Depends on:** 11.1

#### Acceptance Criteria

- [ ] Migration created: `067_create_activity_systems_junction.sql`
- [ ] Table `org_activity_systems` with (activity_id, system_id, usage_context TEXT)
- [ ] Unique constraint on (activity_id, system_id)
- [ ] Indexes on both foreign keys
- [ ] RLS policies for tenant isolation
- [ ] TypeScript types created for relationship
- [ ] DB validation passing
- [ ] Can query "which systems does this activity use?"

#### Architecture

```sql
CREATE TABLE IF NOT EXISTS public.org_activity_systems (
  activity_id UUID NOT NULL REFERENCES public.org_activities(id) ON DELETE CASCADE,
  system_id UUID NOT NULL REFERENCES public.org_systems(id) ON DELETE CASCADE,
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  usage_context TEXT,  -- e.g., "data entry", "query lookup", "report generation"
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (activity_id, system_id)
);

-- Indexes
CREATE INDEX idx_org_activity_systems_activity ON public.org_activity_systems(activity_id);
CREATE INDEX idx_org_activity_systems_system ON public.org_activity_systems(system_id);
CREATE INDEX idx_org_activity_systems_tenant ON public.org_activity_systems(tenant_id);
```

#### TypeScript Types

```typescript
export interface OrgActivitySystem {
  activity_id: string;
  system_id: string;
  tenant_id: string;
  usage_context?: string;
  created_at: string;
  updated_at: string;
}

// Extended Activity type
export interface OrgActivity extends // ... existing fields ...
  systems?: OrgSystem[];  // Populated when needed
}
```

#### Testing

- [ ] Unit: Migration creates junction table correctly
- [ ] Unit: Indexes created on both FKs
- [ ] Integration: Add system to activity
- [ ] Integration: Query systems for activity
- [ ] Integration: Delete activity cascades to junction
- [ ] RLS: Non-tenant users cannot see relationships

#### File List

- `supabase/migrations/067_create_activity_systems_junction.sql` (NEW)
- `src/types/organization.ts` (MODIFIED — add OrgActivitySystem)
- `src/app/actions/organization.ts` (MODIFIED — add actions)

---

### Story 11.3: Create Process SLAs & Metrics Table

**Owner:** Dara (@data-engineer) + Aria (@architect)
**Effort:** 5-6 hours
**Priority:** HIGH
**Status:** ⏳ READY FOR DEV
**Depends on:** None

#### Acceptance Criteria

- [ ] Migration created: `068_create_process_slas_and_metrics.sql`
- [ ] Table `org_process_slas` with SLA definitions per process
- [ ] Columns: target_duration_days, warning_threshold_pct, critical_threshold_pct, metric_name
- [ ] Table `org_process_metrics` with aggregated metrics per process per period
- [ ] Columns: period_start, period_end, avg_duration_days, compliance_pct, instances_count
- [ ] Both tables scoped by tenant_id
- [ ] RLS policies for tenant isolation
- [ ] TypeScript types for both tables
- [ ] DB validation passing

#### Architecture

```sql
-- Process-level SLAs
CREATE TABLE IF NOT EXISTS public.org_process_slas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  process_id UUID NOT NULL REFERENCES public.org_processes(id) ON DELETE CASCADE,
  metric_name TEXT NOT NULL,  -- e.g., "completion_time", "quality_score"
  target_duration_days INTEGER NOT NULL,
  warning_threshold_pct DECIMAL(5,2) DEFAULT 80,
  critical_threshold_pct DECIMAL(5,2) DEFAULT 95,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(tenant_id, process_id, metric_name)
);

-- Process metrics (aggregated)
CREATE TABLE IF NOT EXISTS public.org_process_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  process_id UUID NOT NULL REFERENCES public.org_processes(id) ON DELETE CASCADE,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  metric_name TEXT NOT NULL,
  avg_duration_days DECIMAL(10,2),
  compliance_pct DECIMAL(5,2),  -- % of instances meeting SLA
  instances_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(tenant_id, process_id, metric_name, period_start, period_end)
);
```

#### Dev Notes

- SLAs are **configuration** (what we expect)
- Metrics are **observation** (what actually happened)
- Separate tables for flexibility (can add/remove SLAs without historical data loss)
- Period should align with reporting cycles (weekly, monthly)

#### Testing

- [ ] Unit: Both migrations create tables correctly
- [ ] Unit: Unique constraints working
- [ ] Integration: Create process SLA
- [ ] Integration: Record metrics for period
- [ ] Integration: Query metrics for compliance report
- [ ] RLS: Non-tenant users cannot see data

#### File List

- `supabase/migrations/068_create_process_slas_and_metrics.sql` (NEW)
- `src/types/organization.ts` (MODIFIED — add OrgProcessSla, OrgProcessMetrics)
- `src/app/actions/organization.ts` (MODIFIED — SLA CRUD actions)

---

### Story 11.4: Create Role Permissions & Governance Table

**Owner:** Aria (@architect) + Dara (@data-engineer)
**Effort:** 6-7 hours
**Priority:** MEDIUM
**Status:** ⏳ READY FOR DESIGN
**Depends on:** None

#### Acceptance Criteria

- [ ] Migration created: `069_create_role_permissions.sql`
- [ ] Table `org_role_definitions` with role metadata
- [ ] Columns: role_id, role_name, description, category (management|specialist|operational|external)
- [ ] Table `org_role_permissions` with permission grants per role
- [ ] Columns: role_id, resource_type (area|process|activity|document), action (view|create|edit|delete), scope
- [ ] Both tables scoped by tenant_id
- [ ] RLS policies for admin visibility only
- [ ] TypeScript types
- [ ] Seed initial role definitions (from documented role registry)
- [ ] DB validation passing

#### Architecture

```sql
-- Role definitions
CREATE TABLE IF NOT EXISTS public.org_role_definitions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  role_id TEXT NOT NULL,  -- e.g., "advogado", "coordenador"
  role_name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,  -- management | specialist | operational | external
  level INTEGER,  -- 1-10 (for ordering)
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(tenant_id, role_id)
);

-- Role permissions
CREATE TABLE IF NOT EXISTS public.org_role_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  role_id TEXT NOT NULL,  -- references org_role_definitions.role_id
  resource_type TEXT NOT NULL,  -- area | process | activity | document | system | supplier
  action TEXT NOT NULL,  -- view | create | edit | delete | approve
  scope TEXT DEFAULT 'own_tenant',  -- own_tenant | own_unit | all_units
  conditions JSONB DEFAULT '{}',  -- Additional conditions (e.g., specific areas)
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(tenant_id, role_id, resource_type, action)
);
```

#### Seed Data

```typescript
export const DEFAULT_ROLE_DEFINITIONS = [
  { role_id: 'diretor', name: 'Diretor', category: 'management', level: 10 },
  { role_id: 'gerente', name: 'Gerente', category: 'management', level: 8 },
  { role_id: 'coordenador', name: 'Coordenador', category: 'management', level: 6 },
  { role_id: 'especialista', name: 'Especialista', category: 'specialist', level: 7 },
  { role_id: 'analista_senior', name: 'Analista Sênior', category: 'specialist', level: 6 },
  { role_id: 'analista_junior', name: 'Analista Júnior', category: 'specialist', level: 4 },
  { role_id: 'operacional', name: 'Operacional', category: 'operational', level: 2 },
  { role_id: 'administrativo', name: 'Administrativo', category: 'operational', level: 3 },
  { role_id: 'supervisor', name: 'Supervisor', category: 'operational', level: 4 },
] as const;
```

#### Dev Notes

- This is **governance metadata** (defines what roles CAN do)
- NOT the same as Profiles.role (which is user-level: admin|user|viewer)
- Foundation for future RBAC enforcement
- Extensible: new roles can be added without code changes

#### Testing

- [ ] Unit: Tables created correctly
- [ ] Unit: Seed role definitions inserted
- [ ] Integration: Query permissions for a role
- [ ] Integration: Add custom permission rule
- [ ] RLS: Only admins can view/edit permissions
- [ ] Backward compatibility: Existing code unaffected

#### File List

- `supabase/migrations/069_create_role_permissions.sql` (NEW)
- `src/types/organization.ts` (MODIFIED — add OrgRoleDefinition, OrgRolePermission)
- `src/lib/organization/role-definitions.ts` (MODIFIED — add DEFAULT_ROLE_DEFINITIONS)
- `src/app/actions/organization.ts` (MODIFIED — permission query actions)

---

### Story 11.5: Add Activity Templates & Process Versioning

**Owner:** Dara (@data-engineer) + Aria (@architect)
**Effort:** 5-6 hours
**Priority:** MEDIUM
**Status:** ⏳ READY FOR DESIGN
**Depends on:** 11.1, 11.2

#### Acceptance Criteria

- [ ] Migration created: `070_create_activity_templates_and_process_versions.sql`
- [ ] Table `org_activity_templates` with reusable activity patterns
- [ ] Columns: template_id, nucleus_id, name, description, complexity, priority, inputs, outputs, risks, impacts
- [ ] Table `org_process_versions` with process change history
- [ ] Columns: process_id, version_number, change_summary, changed_by, created_at (immutable)
- [ ] Can "restore" process to previous version (creates new version)
- [ ] Both tables scoped by tenant_id
- [ ] RLS policies for tenant isolation
- [ ] TypeScript types
- [ ] DB validation passing

#### Architecture

```sql
-- Activity Templates (reusable patterns)
CREATE TABLE IF NOT EXISTS public.org_activity_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  nucleus_id UUID REFERENCES public.org_nuclei(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  complexity org_activity_complexity DEFAULT 'medium',
  priority org_activity_priority DEFAULT 'normal',
  inputs JSONB DEFAULT '[]',
  outputs JSONB DEFAULT '[]',
  risks JSONB DEFAULT '[]',
  impacts JSONB DEFAULT '[]',
  documentation JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Process Versions (immutable audit trail)
CREATE TABLE IF NOT EXISTS public.org_process_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  process_id UUID NOT NULL REFERENCES public.org_processes(id) ON DELETE CASCADE,
  version_number INTEGER NOT NULL,  -- 1, 2, 3...
  process_snapshot JSONB NOT NULL,  -- Full process state at this version
  change_summary TEXT,
  changed_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(tenant_id, process_id, version_number)
);
```

#### Dev Notes

- Templates accelerate activity creation within Nucleus
- Versions allow rollback while keeping audit trail (immutable append-only)
- Snapshot captures entire process state (for full restore)

#### Testing

- [ ] Unit: Both migrations create tables correctly
- [ ] Integration: Create activity from template
- [ ] Integration: Record process version on edit
- [ ] Integration: Restore process to previous version
- [ ] Integration: Version number auto-increments
- [ ] RLS: Non-tenant users cannot see data

#### File List

- `supabase/migrations/070_create_activity_templates_and_process_versions.sql` (NEW)
- `src/types/organization.ts` (MODIFIED — add OrgActivityTemplate, OrgProcessVersion)
- `src/app/actions/organization.ts` (MODIFIED — template + version actions)

---

### Story 11.6: Implement ResponsibleRolesInput Component (UI)

**Owner:** Uma (@ux-design-expert) + Dex (@dev)
**Effort:** 10-12 hours
**Priority:** HIGH
**Status:** ⏳ READY FOR DEV (Depends on 11.1 types)
**Depends on:** 11.1

#### Acceptance Criteria

- [ ] ResponsibleRolesInput component fully functional (tags + autocomplete)
- [ ] Component accepts predefined role options
- [ ] Display: removable tag badges with visual hierarchy
- [ ] Input: text field with autocomplete dropdown
- [ ] Keyboard support: backspace removes last tag, arrow keys navigate dropdown
- [ ] Validation: no duplicates, no empty entries
- [ ] Responsive: mobile-friendly, stacks on small screens
- [ ] Accessibility: ARIA labels, keyboard navigation (WCAG AA)
- [ ] Integrated in OrgEntityFormSheet (NEW)
- [ ] Integrated in RoutineFormSheet (existing)
- [ ] Role registry extensible (can add new roles via admin panel)
- [ ] Unit tests: tag add/remove, filtering, validation
- [ ] Storybook story created

#### Architecture

```typescript
// Component: src/components/organization/ResponsibleRolesInput.tsx
interface ResponsibleRolesInputProps {
  value: string[];
  onChange: (roles: string[]) => void;
  availableRoles: Array<{ label: string; value: string; category?: string }>;
  placeholder?: string;
  disabled?: boolean;
  maxTags?: number;
  multiline?: boolean;
}

// Role registry: src/lib/organization/role-definitions.ts
export const ORGANIZATION_ROLES = [
  { value: 'diretor', label: 'Diretor', category: 'management' },
  { value: 'gerente', label: 'Gerente', category: 'management' },
  // ... more roles
] as const;

// Usage in form:
<ResponsibleRolesInput
  value={formData.responsible_roles}
  onChange={(roles) => setFormData({...formData, responsible_roles: roles})}
  availableRoles={ORGANIZATION_ROLES}
  placeholder="Selecione responsáveis..."
/>
```

#### UI Design

```
Responsible Roles Input:
┌─────────────────────────────────────────────┐
│ [Diretor] [Coordenador]       [x]           │ ← Tags (removable)
│ Type role or select...                      │ ← Input field + clear button
│                                             │
│ ▼ Suggestions:                              │ ← Dropdown (filtered)
│  • Management                               │
│    ├ Gerente                                │
│    └ Especialista                           │
│  • Specialist                               │
│    ├ Analista Sênior                        │
│    └ Analista Júnior                        │
└─────────────────────────────────────────────┘
```

#### Dev Notes

- Reuse shadcn/ui: Badge, Input, Popover, Command
- No external autocomplete library
- Roles loaded from `ORGANIZATION_ROLES` (can be DB-driven in future)
- Category grouping in dropdown
- Mobile: single column stacking
- A11y: WAI-ARIA Combobox pattern

#### Testing

- [ ] Unit: Add/remove tags, prevent duplicates
- [ ] Unit: Autocomplete filters correctly
- [ ] Unit: Keyboard navigation works (arrows, enter, backspace)
- [ ] A11y: Screen reader announces tags and options
- [ ] Integration: Form submission with multiple roles
- [ ] Visual: Mobile responsiveness, dark mode
- [ ] Regression: No breaking changes to existing components

#### File List

- `src/components/organization/ResponsibleRolesInput.tsx` (NEW)
- `src/components/organization/OrgEntityFormSheet.tsx` (MODIFIED — integrates component)
- `src/components/organization/RoutineFormSheet.tsx` (MODIFIED — ensure integrated)
- `src/components/organization/__tests__/ResponsibleRolesInput.test.tsx` (NEW)
- `src/stories/organization/ResponsibleRolesInput.stories.tsx` (NEW)

---

### Story 11.7: Implement Server Actions for Responsible Roles

**Owner:** Dex (@dev)
**Effort:** 6-8 hours
**Priority:** HIGH
**Status:** ⏳ READY FOR DEV
**Depends on:** 11.1, 11.6

#### Acceptance Criteria

- [ ] `updateActivityResponsibleRolesAction(activityId, roles)` implemented
- [ ] `addActivityResponsibleRoleAction(activityId, role)` implemented
- [ ] `removeActivityResponsibleRoleAction(activityId, role)` implemented
- [ ] `getActivityResponsibleRolesAction(activityId)` implemented
- [ ] All actions include tenant isolation via auth context
- [ ] All actions include error handling + logging
- [ ] Update `updateActivityAction` to accept responsible_roles param
- [ ] RLS policies validated (can modify only own tenant)
- [ ] Revalidation paths configured
- [ ] Unit tests for each action (success + error cases)
- [ ] Integration tests with real DB

#### Architecture

```typescript
// src/app/actions/organization.ts

export async function updateActivityResponsibleRolesAction(
  activityId: string,
  roles: string[]
): Promise<OrgActionResult<OrgActivity>> {
  try {
    const auth = await getSupabaseAuth();
    if (!auth.user) throw new UnauthorizedError('Not authenticated');

    // Validate input
    if (!activityId || !Array.isArray(roles)) {
      throw new ValidationError('Invalid input parameters');
    }

    // Update in Supabase
    const { data, error } = await supabase
      .from('org_activities')
      .update({
        responsible_roles: roles,
        updated_at: new Date().toISOString(),
      })
      .eq('id', activityId)
      .eq('tenant_id', auth.user.user_metadata.tenant_id)
      .select()
      .single();

    if (error) throw error;

    // Audit log
    await logAuditEvent({
      action: 'update_responsible_roles',
      entity: 'org_activity',
      entity_id: activityId,
      changes: { responsible_roles: roles },
    });

    // Revalidate
    revalidatePath('/organizacao');

    return { success: true, data };
  } catch (error) {
    return handleActionError(error);
  }
}
```

#### Testing

- [ ] Unit: Valid roles array updates successfully
- [ ] Unit: Empty array clears roles
- [ ] Unit: Duplicate roles prevented at action level
- [ ] Unit: Tenant isolation enforced (can't modify other tenant)
- [ ] Unit: Audit logging works
- [ ] Unit: Revalidation triggered
- [ ] Integration: Full flow with OrgEntityFormSheet
- [ ] Error handling: Invalid activityId, unauthorized user

#### File List

- `src/app/actions/organization.ts` (MODIFIED — add 4+ actions)
- `src/app/actions/__tests__/organization.test.ts` (MODIFIED — add tests)

---

### Story 11.8: Implement Activity-System Relationship Management (UI)

**Owner:** Dex (@dev) + Uma (@ux-design-expert)
**Effort:** 8-10 hours
**Priority:** HIGH
**Status:** ⏳ READY FOR DEV
**Depends on:** 11.2

#### Acceptance Criteria

- [ ] New component: `ActivitySystemsModal.tsx` (or sheet)
- [ ] Display: current systems linked to activity
- [ ] Add: autocomplete to select system + usage context field
- [ ] Remove: delete button per system
- [ ] Edit usage_context inline (optional refinement)
- [ ] Integrated in ActivityCockpit360 (edit flow)
- [ ] Modal/Sheet opens from "Edit Systems" button
- [ ] Server actions implemented: add, remove, query systems
- [ ] RLS tested: can only modify own tenant
- [ ] Unit tests: add/remove flow
- [ ] Responsive design

#### Architecture

```typescript
// Component: src/components/organization/ActivitySystemsModal.tsx
interface ActivitySystemsModalProps {
  activityId: string;
  isOpen: boolean;
  onClose: () => void;
  onSave?: () => void;
}

// Server Actions (new)
export async function addActivitySystemAction(
  activityId: string,
  systemId: string,
  usageContext?: string
): Promise<OrgActionResult<void>> { /* ... */ }

export async function removeActivitySystemAction(
  activityId: string,
  systemId: string
): Promise<OrgActionResult<void>> { /* ... */ }

export async function getActivitySystemsAction(
  activityId: string
): Promise<OrgActionResult<OrgSystem[]>> { /* ... */ }
```

#### UI Design

```
Activity Systems Modal:
┌──────────────────────────────────────────┐
│ Sistemas da Atividade                    │
├──────────────────────────────────────────┤
│                                          │
│ Sistemas Vinculados:                     │
│ ┌──────────────────────────────────────┐ │
│ │ [PJe] (dados de processos) [x]      │ │
│ │ [e-SAJ] (consulta jurisprudência).. │ │
│ └──────────────────────────────────────┘ │
│                                          │
│ Adicionar Sistema:                       │
│ ┌──────────────────────────────────────┐ │
│ │ Selecione um sistema...         ▼    │ │
│ └──────────────────────────────────────┘ │
│ Contexto de Uso (opcional):              │
│ ┌──────────────────────────────────────┐ │
│ │ ex: "entrada de dados"               │ │
│ └──────────────────────────────────────┘ │
│                                          │
│              [Adicionar] [Fechar]        │
└──────────────────────────────────────────┘
```

#### Testing

- [ ] Unit: Add system to activity
- [ ] Unit: Remove system from activity
- [ ] Unit: Display current systems
- [ ] Integration: Full modal flow (open, add, close)
- [ ] RLS: Cannot modify other tenant's data
- [ ] Responsive: Mobile layout

#### File List

- `src/components/organization/ActivitySystemsModal.tsx` (NEW)
- `src/components/organization/ActivityCockpit360.tsx` (MODIFIED — add "Edit Systems" button)
- `src/app/actions/organization.ts` (MODIFIED — add 3 actions)
- `src/components/organization/__tests__/ActivitySystemsModal.test.tsx` (NEW)

---

### Story 11.9: Display Process Metrics & SLAs in UI

**Owner:** Dex (@dev) + Uma (@ux-design-expert)
**Effort:** 7-9 hours
**Priority:** MEDIUM
**Status:** ⏳ READY FOR DEV
**Depends on:** 11.3

#### Acceptance Criteria

- [ ] New component: `ProcessMetricsCard.tsx` (displays SLA + current metrics)
- [ ] New component: `ProcessMetricsHistory.tsx` (chart with time series)
- [ ] Integrated in ProcessCockpit360 (new "Métricas" tab)
- [ ] Display: Target SLA duration, current avg duration, compliance %
- [ ] Visual indicators: green (on track), yellow (warning), red (critical)
- [ ] Query Server Actions: getProcessSLAsAction, getProcessMetricsAction
- [ ] Responsive charts (recharts or similar)
- [ ] Empty states when no metrics available
- [ ] Unit tests for display logic
- [ ] Storybook stories

#### Architecture

```typescript
// Component: src/components/organization/ProcessMetricsCard.tsx
interface ProcessMetricsCardProps {
  processId: string;
  slas?: OrgProcessSla[];
  recentMetrics?: OrgProcessMetrics[];
}

// Server Actions
export async function getProcessSLAsAction(
  processId: string
): Promise<OrgActionResult<OrgProcessSla[]>> { /* ... */ }

export async function getProcessMetricsAction(
  processId: string,
  periodStart: string,
  periodEnd: string
): Promise<OrgActionResult<OrgProcessMetrics[]>> { /* ... */ }
```

#### UI Design

```
Process Metrics Tab (in ProcessCockpit360):
┌──────────────────────────────────────────────────┐
│ Métricas & SLAs                                  │
├──────────────────────────────────────────────────┤
│                                                  │
│ SLA: Tempo de Conclusão                          │
│ Meta: 5 dias | Alerta: 80% | Crítico: 95%       │
│ Média Atual: 4.2 dias (✅ No SLA)                │
│                                                  │
│ Compliance Histórico (últimos 30 dias):          │
│ ┌──────────────────────────────────────────────┐ │
│ │ 100%  █                                       │ │
│ │  80%  ███ ██████ ████                         │ │
│ │  60%  ████ ████████                           │ │
│ │  40%                                          │ │
│ │   0%  └────────────────────────────────────    │ │
│         S  M  T  W  T  F  S                      │ │
│ └──────────────────────────────────────────────┘ │
│ Instâncias: 42 (período)                         │
│ Compliance: 95.2% ✅                             │
└──────────────────────────────────────────────────┘
```

#### Dev Notes

- Optional enhancement: Allow editing SLAs from UI (Story 11.10 candidate)
- Metrics aggregation can happen batch (daily cron) or on-demand
- Charts use recharts (already in dependencies)

#### Testing

- [ ] Unit: Metrics display correctly
- [ ] Unit: Compliance percentage calculated correctly
- [ ] Unit: Visual indicators (colors) correct
- [ ] Integration: Load metrics from DB
- [ ] Responsive: Mobile chart layout
- [ ] Empty state: No metrics available

#### File List

- `src/components/organization/ProcessMetricsCard.tsx` (NEW)
- `src/components/organization/ProcessMetricsHistory.tsx` (NEW)
- `src/components/organization/ProcessCockpit360.tsx` (MODIFIED — add metrics tab)
- `src/app/actions/organization.ts` (MODIFIED — add 2 query actions)
- `src/components/organization/__tests__/ProcessMetricsCard.test.tsx` (NEW)

---

### Story 11.10: Advanced Search & Filter for Organizations

**Owner:** Dex (@dev) + Uma (@ux-design-expert)
**Effort:** 9-11 hours
**Priority:** MEDIUM
**Status:** ⏳ READY FOR DESIGN
**Depends on:** 11.1, 11.2

#### Acceptance Criteria

- [ ] New component: `OrganizationSearchBar.tsx` (global search)
- [ ] Search across: Areas, Nuclei, Processes, Routines, Activities, Systems, Suppliers, Services, Documents
- [ ] Search fields: name, description, objective, documentation
- [ ] Filter by: entity type, responsible_roles, complexity (activities), priority (activities)
- [ ] Advanced filter panel (collapsible)
- [ ] Results paginated (20 per page)
- [ ] Keyboard shortcut (Cmd+K or Ctrl+K) to open search
- [ ] Recent searches stored in localStorage
- [ ] Search history displayed when empty
- [ ] Responsive design
- [ ] A11y: Keyboard navigation, screen reader support
- [ ] Unit tests for search logic

#### Architecture

```typescript
// Component: src/components/organization/OrganizationSearchBar.tsx
interface OrganizationSearchBarProps {
  onNavigate?: (result: SearchResult) => void;
}

interface SearchResult {
  id: string;
  type: 'area' | 'nucleus' | 'process' | 'routine' | 'activity' | 'system' | 'supplier' | 'service' | 'document';
  name: string;
  breadcrumb: string;  // For display: Area > Nucleus > Process
  icon?: string;
}

// Server Action
export async function searchOrganizationAction(
  query: string,
  filters?: SearchFilters
): Promise<OrgActionResult<SearchResult[]>> { /* ... */ }

interface SearchFilters {
  entityType?: string[];
  responsibleRoles?: string[];
  complexity?: string[];
  priority?: string[];
}
```

#### Search Algorithm

```typescript
// Ranked search:
1. Name exact match (100 points)
2. Name prefix match (80 points)
3. Name fuzzy match (60 points)
4. Description/objective match (40 points)
5. Documentation match (20 points)

// Sort by:
1. Relevance score (descending)
2. Entity type priority (area > nucleus > process > ...)
3. Updated date (descending)
```

#### UI Design

```
Search Bar (in header or sidebar):
┌────────────────────────────────────┐
│ 🔍 Procure na Organização... (⌘K)  │
└────────────────────────────────────┘

Results Panel:
┌──────────────────────────────────────┐
│ 🔍 Procure...                        │ X
├──────────────────────────────────────┤
│ Últimas Buscas:                      │
│ • Processos de Recuperação           │
│ • Adjudicação de Crédito             │
│                                      │
│ Filtros Avançados (⊗)                │
│ ├ Tipo de Entidade: [Area] [Process] │
│ ├ Responsáveis: [Adv...] [Coord...]  │
│ └ [Filtrar]                          │
└──────────────────────────────────────┘

Search Results:
┌──────────────────────────────────────┐
│ (4 resultados)                       │
├──────────────────────────────────────┤
│ 📋 Processo: Recuperação de Crédito  │
│    Area > Recuperação                │
│                                      │
│ 🎯 Atividade: Enviar Petição         │
│    Area > Recuperação > Processo...  │
│                                      │
│ 📄 Documento: Modelo Petição STF     │
│    ...                               │
├──────────────────────────────────────┤
│              [Carregar Mais]          │
└──────────────────────────────────────┘
```

#### Testing

- [ ] Unit: Exact name match ranked highest
- [ ] Unit: Fuzzy matching works (typos)
- [ ] Unit: Filters work correctly
- [ ] Integration: Search returns correct entities
- [ ] Integration: Pagination works
- [ ] A11y: Keyboard navigation (arrows, enter, esc)
- [ ] Responsive: Mobile keyboard interaction

#### File List

- `src/components/organization/OrganizationSearchBar.tsx` (NEW)
- `src/lib/organization/search.ts` (NEW — search algorithm)
- `src/app/actions/organization.ts` (MODIFIED — add searchOrganizationAction)
- `src/components/organization/__tests__/search.test.ts` (NEW)

---

### Story 11.11: AI Context Embeddings for Knowledge Base

**Owner:** Alex (@analyst) + Dex (@dev)
**Effort:** 8-10 hours
**Priority:** MEDIUM
**Status:** ⏳ READY FOR DESIGN
**Depends on:** None

#### Acceptance Criteria

- [ ] Migration created: `071_add_embeddings_to_knowledge_entries.sql`
- [ ] Column: `org_knowledge_entries.embedding` (pgvector, 1536-dim)
- [ ] Create function: `embed_knowledge_entry()` (triggers on insert/update)
- [ ] Create function: `search_knowledge_semantic(query_embedding, k=10)` for similarity search
- [ ] Batch job: Generate embeddings for existing entries (using Claude API)
- [ ] Server action: `semanticSearchKnowledgeAction(query)`
- [ ] Tests: Similarity search returns relevant entries
- [ ] Documentation: How to use semantic search

#### Architecture

```sql
-- Add vector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Add embedding column
ALTER TABLE public.org_knowledge_entries
ADD COLUMN embedding vector(1536) DEFAULT NULL;

-- Index for similarity search (IVFFlat or HNSW)
CREATE INDEX ON org_knowledge_entries USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);

-- Trigger function (call embedding API)
CREATE OR REPLACE FUNCTION embed_knowledge_entry()
RETURNS TRIGGER AS $$
BEGIN
  -- Call Claude API to generate embedding
  -- Store in embedding column
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Similarity search function
CREATE OR REPLACE FUNCTION search_knowledge_semantic(
  query_embedding vector,
  k INTEGER DEFAULT 10
)
RETURNS TABLE (
  id UUID,
  title TEXT,
  content TEXT,
  type TEXT,
  similarity FLOAT
) AS $$
SELECT
  id, title, content, type,
  (1 - (embedding <=> query_embedding)) as similarity
FROM org_knowledge_entries
WHERE embedding IS NOT NULL
ORDER BY embedding <=> query_embedding
LIMIT k;
$$ LANGUAGE sql;
```

#### Server Action

```typescript
// src/app/actions/knowledge.ts
export async function semanticSearchKnowledgeAction(
  query: string,
  limit: number = 10
): Promise<OrgActionResult<KnowledgeSearchResult[]>> {
  try {
    // 1. Generate embedding for query using Claude API
    const queryEmbedding = await generateEmbedding(query);

    // 2. Search in pgvector
    const { data, error } = await supabase
      .rpc('search_knowledge_semantic', {
        query_embedding: queryEmbedding,
        k: limit,
      });

    if (error) throw error;

    return { success: true, data };
  } catch (error) {
    return handleActionError(error);
  }
}
```

#### Testing

- [ ] Unit: Embedding generated correctly
- [ ] Unit: Similarity search returns relevant results
- [ ] Integration: Batch embedding generation for existing entries
- [ ] Integration: Query similar to entry returns that entry highly ranked
- [ ] Performance: Search completes in <500ms

#### File List

- `supabase/migrations/071_add_embeddings_to_knowledge_entries.sql` (NEW)
- `src/app/actions/knowledge.ts` (MODIFIED — add semanticSearchKnowledgeAction)
- `src/lib/ai/embeddings.ts` (NEW — embedding generation)
- `scripts/batch-embed-knowledge.ts` (NEW — batch job for existing entries)

---

### Story 11.12: Organizational Setup Wizard (Bootstrap Customization)

**Owner:** Uma (@ux-design-expert) + Dex (@dev)
**Effort:** 10-12 hours
**Priority:** MEDIUM
**Status:** ⏳ READY FOR DESIGN
**Depends on:** None

#### Acceptance Criteria

- [ ] New flow: `/organizacao/setup` (wizard component)
- [ ] Step 1: Organization type selection (legal_office, consultancy, corporation, other)
- [ ] Step 2: Select predefined template OR start blank
- [ ] Step 3: Customize areas (add/remove/rename)
- [ ] Step 4: Customize nuclei per area
- [ ] Step 5: Review and bootstrap
- [ ] Each template comes with: Areas, Nuclei, Processes, Routines, Activities (pre-populated)
- [ ] User can skip any step or edit after bootstrap
- [ ] Stores selection in org_bootstrap_templates table
- [ ] Responsive design (mobile-friendly)
- [ ] Progress indicator
- [ ] Unit tests for flow logic

#### Architecture

```typescript
// Component: src/app/organizacao/setup/page.tsx
// Multi-step form component

interface SetupStep {
  step: number;
  title: string;
  description: string;
  content: React.ReactNode;
}

interface OrganizationSetupData {
  organization_type: 'legal_office' | 'consultancy' | 'corporation' | 'other';
  template_id?: string;
  areas: AreaSetupData[];
  customization: Record<string, any>;
}

// Server Actions
export async function getBootstrapTemplatesAction(
  organization_type: string
): Promise<OrgActionResult<OrgBootstrapTemplate[]>> { /* ... */ }

export async function applyBootstrapTemplateAction(
  organization_type: string,
  template_id: string
): Promise<OrgActionResult<void>> {
  // Creates Areas, Nuclei, Processes, etc. in bulk
}
```

#### Bootstrap Templates

```typescript
// src/lib/organization/bootstrap-templates.ts
export const BOOTSTRAP_TEMPLATES = {
  legal_office: {
    name: 'Escritório Jurídico',
    description: 'Estrutura para escritórios de advocacia',
    areas: [
      { name: 'Recuperação de Crédito', nuclei: [...] },
      { name: 'Trabalhista', nuclei: [...] },
      // ... 8 more areas
    ],
  },
  consultancy: {
    name: 'Consultoria Empresarial',
    description: 'Estrutura para consultorias',
    areas: [...],
  },
  // ...
} as const;
```

#### UI Design

```
Step 1: Tipo de Organização
┌─────────────────────────────────────────┐
│ Qual é o tipo de sua organização?       │
│                                         │
│ ○ Escritório Jurídico                   │
│ ○ Consultoria Empresarial               │
│ ○ Empresa (Corporativa)                 │
│ ○ Outro (Personalizado)                 │
│                                         │
│  [Anterior] [Próximo]                   │
└─────────────────────────────────────────┘

Step 2: Selecionar Template
┌─────────────────────────────────────────┐
│ Escolha um modelo pré-configurado       │
│                                         │
│ [Card] Template Padrão Jurídico         │
│ [Card] Template Minimalista             │
│ [Card] Começar do Zero                  │
│                                         │
│  [Anterior] [Próximo]                   │
└─────────────────────────────────────────┘

Step 5: Resumo
┌─────────────────────────────────────────┐
│ Resumo da Configuração                  │
│                                         │
│ Tipo: Escritório Jurídico               │
│ Template: Padrão                        │
│ Áreas: 10                               │
│ Núcleos: 28                             │
│ Processos: 85                           │
│ Rotinas: 250                            │
│ Atividades: 1200+                       │
│                                         │
│  [Anterior] [Criar Organização]         │
└─────────────────────────────────────────┘
```

#### Testing

- [ ] Unit: Flow logic (forward/backward navigation)
- [ ] Unit: Form validation at each step
- [ ] Integration: Template loading works
- [ ] Integration: Bootstrap creates all entities
- [ ] Integration: User can edit after bootstrap
- [ ] Responsive: Mobile step-by-step navigation
- [ ] Accessibility: Screen reader support

#### File List

- `src/app/organizacao/setup/page.tsx` (NEW)
- `src/components/organization/SetupWizard.tsx` (NEW)
- `src/lib/organization/bootstrap-templates.ts` (NEW/MODIFIED)
- `src/app/actions/bootstrap.ts` (NEW)

---

### Story 11.13: Bulk Operations & Import/Export

**Owner:** Dex (@dev)
**Effort:** 10-12 hours
**Priority:** MEDIUM
**Status:** ⏳ READY FOR DESIGN
**Depends on:** 11.1-11.5 (schema ready)

#### Acceptance Criteria

- [ ] New feature: Bulk edit organizations (select multiple entities, edit common field)
- [ ] New feature: Bulk delete (with confirmation)
- [ ] New feature: Export as CSV (Areas, Nuclei, Processes, Activities, etc.)
- [ ] New feature: Export as JSON (full organizational schema)
- [ ] New feature: Import from CSV (with conflict detection)
- [ ] New feature: Import from JSON (merge or replace)
- [ ] UI: Bulk action toolbar (appears when items selected)
- [ ] Validation: CSV structure, required fields
- [ ] Error handling: Partial import success (row-by-row errors logged)
- [ ] Audit logging: All bulk operations logged
- [ ] Unit tests for import/export logic

#### Architecture

```typescript
// Bulk operations
export async function bulkUpdateEntitiesAction(
  entityType: string,
  entityIds: string[],
  updates: Record<string, any>
): Promise<OrgActionResult<{ updated: number; failed: number; errors: Error[] }>>

export async function bulkDeleteEntitiesAction(
  entityType: string,
  entityIds: string[]
): Promise<OrgActionResult<{ deleted: number }>>

// Import/Export
export async function exportOrganizationAsCSVAction(
  entityType: string
): Promise<OrgActionResult<string>> // CSV content

export async function exportOrganizationAsJSONAction(): Promise<OrgActionResult<object>>

export async function importOrganizationFromCSVAction(
  entityType: string,
  csvContent: string,
  mode: 'merge' | 'replace'
): Promise<OrgActionResult<{ imported: number; failed: number; errors: any[] }>>

export async function importOrganizationFromJSONAction(
  jsonContent: object,
  mode: 'merge' | 'replace'
): Promise<OrgActionResult<{ imported: number }>>
```

#### CSV Format Example

```csv
name,description,objective,responsible_roles
"Recuperação de Crédito","Gestão de recuperação de créditos","Recuperar créditos pendentes","[""advogado_senior"", ""coordenador""]"
"Trabalhista","Ações trabalhistas","Gerenciar causas trabalhistas","[""especialista""]"
```

#### Testing

- [ ] Unit: CSV parsing handles quotes, newlines
- [ ] Unit: JSON validation
- [ ] Integration: Bulk update applied correctly
- [ ] Integration: Bulk delete removes all selected entities
- [ ] Integration: CSV export/import round-trip (export then import preserves data)
- [ ] Error handling: Invalid CSV structure
- [ ] Performance: Bulk operations on 1000+ entities

#### File List

- `src/components/organization/BulkActionToolbar.tsx` (NEW)
- `src/lib/organization/import-export.ts` (NEW)
- `src/app/actions/bulk-operations.ts` (NEW)
- `src/components/organization/__tests__/import-export.test.ts` (NEW)

---

### Story 11.14: Complete Documentation & AI Context Patterns

**Owner:** Alex (@analyst) + Aria (@architect)
**Effort:** 8-10 hours
**Priority:** MEDIUM
**Status:** ⏳ READY FOR DESIGN
**Depends on:** 11.1-11.13 (implementation done)

#### Acceptance Criteria

- [ ] Document: Organization Schema Reference (all tables + relationships)
- [ ] Document: BPM Best Practices (when to use responsible_roles, SLAs, metrics)
- [ ] Document: AI Context Engineering Guide (how to inject org context into prompts)
- [ ] Document: Bootstrap Customization Guide (how to create custom templates)
- [ ] Document: Role Management Patterns (role hierarchy, permissions)
- [ ] ADR-005: Organizational Data Architecture (decisions, trade-offs)
- [ ] Examples: Sample prompts for org agents
- [ ] Examples: How to query organizational data for reporting
- [ ] Examples: Integration patterns with external systems
- [ ] API Documentation: All new Server Actions documented
- [ ] Update CLAUDE.md with EPIC 11 context

#### Architecture

Documentation structure:
```
docs/
├── architecture/
│   ├── ORGANIZATION-SCHEMA.md (comprehensive schema reference)
│   ├── BPM-PATTERNS.md (best practices)
│   └── ROLE-GOVERNANCE.md (role model documentation)
├── guides/
│   ├── ORGANIZATION-SETUP-WIZARD.md
│   ├── BOOTSTRAP-CUSTOMIZATION.md
│   └── AI-CONTEXT-ENGINEERING.md
├── examples/
│   ├── org-agent-prompts.md
│   └── org-data-integration.md
└── adr/
    └── ADR-005-organization-architecture.md
```

#### Testing

- [ ] Lint: All markdown files pass linting
- [ ] Code examples: Are they runnable/accurate?
- [ ] Cross-references: All links work
- [ ] Completeness: All new features documented

#### File List

- `docs/architecture/ORGANIZATION-SCHEMA.md` (NEW)
- `docs/architecture/BPM-PATTERNS.md` (NEW)
- `docs/guides/BOOTSTRAP-CUSTOMIZATION.md` (NEW)
- `docs/guides/AI-CONTEXT-ENGINEERING.md` (NEW)
- `docs/adr/ADR-005-organization-architecture.md` (NEW)
- `.claude/CLAUDE.md` (MODIFIED — EPIC 11 context)

---

## 🔄 Story Development Cycle

### Per-Story Workflow

1. **Story Created** → Status: Draft
2. **@po validates** → `*validate-story-draft` (10-point checklist)
3. **@dev implements** → `*develop story-X.X` (CodeRabbit + tests)
4. **@qa gates** → `*qa-gate` (7 quality checks)
5. **Status → Ready for Review** when all checks pass
6. **Deploy** via @devops push when grouped

### Quality Checklist (All Stories)

- ✅ Lint + Typecheck (0 errors)
- ✅ Tests passing (>90% coverage)
- ✅ CodeRabbit pre-commit review (max 2 iterations)
- ✅ File List complete and accurate
- ✅ No breaking changes (or migrations handled)
- ✅ RLS policies validated (if DB changes)
- ✅ Documentation updated (README, guides, ADRs)
- ✅ Revalidation paths configured (if Server Actions)
- ✅ A11y checks passed (if UI changes)
- ✅ Performance tested (if bulk operations)

---

## 📊 Dependency Graph

```
Phase 1: Schema (Parallel)
├─ 11.1: responsible_roles in Activities
├─ 11.2: Activity-System junction
├─ 11.3: Process SLAs & Metrics
├─ 11.4: Role Permissions
└─ 11.5: Activity Templates & Process Versioning

Phase 2: Backend (Sequential after Phase 1)
├─ 11.6: ResponsibleRolesInput (UI)  ← depends on 11.1
├─ 11.7: Server Actions (Responsible Roles)  ← depends on 11.1, 11.6
├─ 11.8: Activity-System UI  ← depends on 11.2
├─ 11.9: Metrics Display  ← depends on 11.3
├─ 11.10: Advanced Search  ← depends on 11.1, 11.2
└─ 11.11: Embeddings  ← independent

Phase 3: Frontend (Sequential after Phase 2)
├─ 11.12: Setup Wizard  ← independent
└─ 11.13: Bulk Operations  ← depends on 11.1-11.5

Phase 4: Documentation (Parallel, post-release)
└─ 11.14: Complete Documentation  ← depends on 11.1-11.13
```

**Parallel work possible:**
- Phase 1 stories can develop in parallel (different tables)
- 11.6 + 11.7 can start once 11.1 types are defined
- 11.12 + 11.13 can start independently after core schema

---

## 📈 Success Metrics

### Completion Metrics

- [ ] All 14 stories delivered and deployed
- [ ] 0 critical bugs in production
- [ ] 0 RLS policy gaps
- [ ] >95% test coverage for new code
- [ ] <500ms API response time for searches

### User Experience Metrics

- [ ] Onboarding time <5 minutes with setup wizard
- [ ] All organizational data accessible via search
- [ ] No "missing field" issues in UI
- [ ] Bootstrap templates save 2+ hours of setup

### AI Context Metrics

- [ ] Semantic search returns >80% relevant results
- [ ] AI agents have complete org context
- [ ] Knowledge base embeddable in prompts
- [ ] Role permissions enforceable by AI

---

## 🎨 AI Context Engineering Outputs

### Role Context Injector

```typescript
// src/lib/ai/org-context-injector.ts
export function injectRoleContext(agentPrompt: string, tenant_id: string): string {
  // Load roles from org_role_definitions
  // Inject into system prompt

  const roleContext = `
Available organizational roles:
${roles.map(r => `- ${r.role_id}: ${r.role_name} (${r.category})`).join('\n')}

When suggesting responsible parties, prefer roles in this list.
Consider role levels and categories for appropriate assignments.
`;

  return agentPrompt + '\n\n' + roleContext;
}
```

### Process Context Transformer

```typescript
// src/lib/ai/org-context-transformers.ts
export function toProcessAIContext(process: OrgProcess): ProcessAIContext {
  return {
    name: process.name,
    objective: process.objective,
    inputs: process.inputs,  // Structured inputs for AI
    outputs: process.outputs,
    risks: process.risks,
    impacts: process.impacts,
    responsible_roles: process.responsible_roles,
    systems: process.systems,
    routines: process.routines,
    metrics: process.metrics,  // SLAs & compliance data
    documentation: process.documentation,
  };
}
```

### Knowledge Retrieval for Agents

```typescript
// Usage in AI agent system prompts
const orgContext = await getOrganizationalContext(tenant_id);
const relevantKnowledge = await semanticSearchKnowledgeAction(query);

const enhancedPrompt = `
${basePrompt}

Organization Context:
${JSON.stringify(orgContext, null, 2)}

Relevant Knowledge Base:
${relevantKnowledge.map(k => \`- [\${k.type}] \${k.title}: \${k.content.substring(0, 200)}...\`).join('\n')}
`;
```

---

## 📋 Deployment & Rollback Strategy

### Deployment Order (Phase by Phase)

**Phase 1 → Phase 2 → Phase 3 → Phase 4**

1. **Phase 1 (Migrations):**
   - Deploy all 5 migrations (11.1-11.5)
   - Run RLS audit after each
   - Test rollback of migration 070 (process versions) — most risky

2. **Phase 2 (Backend + UI):**
   - Deploy ResponsibleRolesInput (11.6)
   - Deploy Server Actions (11.7-11.11)
   - Deploy UI components (11.12-11.13)

3. **Phase 3 (Bootstrap + Ops):**
   - Deploy setup wizard (11.12)
   - Deploy bulk operations (11.13)

4. **Phase 4 (Documentation):**
   - Update all docs, ADRs, guides

### Rollback Procedures

**If Phase 1 Migration Fails:**
```sql
-- Rollback all Phase 1 migrations
DROP TABLE IF EXISTS public.org_process_versions CASCADE;
DROP TABLE IF EXISTS public.org_activity_templates CASCADE;
DROP TABLE IF EXISTS public.org_role_permissions CASCADE;
DROP TABLE IF EXISTS public.org_role_definitions CASCADE;
DROP TABLE IF EXISTS public.org_process_metrics CASCADE;
DROP TABLE IF EXISTS public.org_process_slas CASCADE;
DROP TABLE IF EXISTS public.org_activity_systems CASCADE;
ALTER TABLE public.org_activities DROP COLUMN IF EXISTS responsible_roles;
```

**If Phase 2 Fails:**
- Revert code changes (no DB impact)
- Clear revalidation caches

**If Phase 3 Fails:**
- Revert UI/actions (no DB impact)

---

## 📚 Key Documents & References

- **Schema:** `docs/architecture/ORGANIZATION-SCHEMA.md`
- **BPM Patterns:** `docs/architecture/BPM-PATTERNS.md`
- **Bootstrap Guide:** `docs/guides/BOOTSTRAP-CUSTOMIZATION.md`
- **AI Context:** `docs/guides/AI-CONTEXT-ENGINEERING.md`
- **ADR-005:** `docs/adr/ADR-005-organization-architecture.md`
- **EPIC INDEX:** `docs/stories/EPIC-INDEX.md`

---

## 🏁 Sign-Off

**EPIC Lead:** Orion (@aiox-master)
**Architecture Review:** Pending → Aria (@architect)
**Product Review:** Pending → Morgan (@pm)
**QA Lead:** Quinn (@qa)
**Data Architecture:** Pending → Dara (@data-engineer)

**Status:** ✨ READY FOR PLANNING

---

## Quick Links

- [EPIC INDEX](./EPIC-INDEX.md) — All epics
- [EPIC 10 Documentation](./EPIC-10-Org-Knowledge-Graph-Refinement.md)
- [Story Development Cycle](../architecture/STORY-LIFECYCLE.md)
- [AIOX Constitution](../../.aiox-core/constitution.md)
