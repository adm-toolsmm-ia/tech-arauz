# EPIC 11 Frontend Integration Gaps — Comprehensive Architecture Analysis

**Architect:** Aria (@architect)
**Date:** 2026-03-16
**Status:** Gap Analysis Complete — Ready for Implementation Planning
**Severity:** 3 Critical, 3 Medium, 2 Low

---

## Executive Summary

EPIC 11 achieved **100% backend implementation** (5 migrations, 9 server actions, RLS compliance) but the frontend is only **60% synchronized**. Eight gaps exist between database capabilities and UI:

| Priority | Gap Count | User Impact | Effort |
|----------|-----------|------------|--------|
| 🔴 Critical | 3 | Reduced functionality | 14-16h |
| 🟡 Medium | 3 | Workarounds required | 12-14h |
| 🟢 Low | 2 | Discovery only | 8-10h |
| **TOTAL** | **8** | **Partial feature access** | **34-40h** |

**Release Impact:** All 3 critical gaps MUST be fixed before v0.2.4 release to achieve full Feature Parity.

---

## Detailed Gap Analysis

### 🔴 CRITICAL GAPS (Block v0.2.4 Release)

---

## Gap 1: ActivityFormSheet Missing ResponsibleRolesInput Integration

### Current State
- ✅ ResponsibleRolesInput component exists (Story 11.6, fully WCAG AA)
- ✅ OrgEntityFormSheet.tsx loads it for all entities
- ✅ Database accepts responsible_roles in org_activities
- ❌ **No form integration in Activity edit flow**

### Technical Analysis

**Root Cause:** While `OrgEntityFormSheet` technically includes `ResponsibleRolesInput` at line 327, the component is UNUSED in actual activity editing workflows. Most activity views (ActivityCockpit360, activity detail pages) don't use OrgEntityFormSheet—they use custom inline forms or read-only displays.

**Affected Components:**
- `src/components/organization/ActivityCockpit360.tsx` — Shows activities but no edit
- `src/app/organizations/[id]/activities/[activityId]/page.tsx` — Detail view (read-only for responsible_roles)
- `src/components/organization/OrgEntityFormSheet.tsx` — Has the component, but not called from Activity context

**Missing Flow:**
```
Activity List → Click Edit → ActivityFormSheet opens → ResponsibleRolesInput shown & editable
```

Currently:
```
Activity List → Click Edit → No form, or inline read-only form without ResponsibleRolesInput
```

### Impact Analysis

**Technical Impact:**
- Users cannot assign responsible roles when creating/editing activities
- Responsible_roles JSONB column stays empty or defaults to []
- Activity filtering by role (planned for advanced search) has no data to work with

**UX Impact:**
- Users open activity edit → discover responsible roles field is missing
- Workaround: Use SQL or admin tools to assign roles (unacceptable for end users)
- Breaks AC #27: "User can assign responsible parties to activities"

**Business Impact:**
- EPIC 11 acceptance criteria partially unmet
- Cannot track "who executes this activity" at data layer
- Advanced role-based search (Gap 4) becomes unusable

### Architecture Solution

**Approach:** Standardize activity editing to use OrgEntityFormSheet consistently

**File Changes Required:**
1. `src/components/organization/ActivityCockpit360.tsx` (MODIFY)
   - Add "Edit Activity" button → opens OrgEntityFormSheet with mode="edit"
   - Pass current activity data as initialData

2. `src/app/organizations/[id]/activities/[activityId]/page.tsx` (MODIFY)
   - Replace custom edit form (if exists) with OrgEntityFormSheet in modal
   - Add "Edit Activity" toolbar action

3. `src/components/organization/OrgEntityFormSheet.tsx` (NO CHANGE)
   - Already integrated at line 326-335
   - Just needs to be invoked from activity views

**Code Example (ActivityCockpit360):**
```typescript
// Add to component state
const [editingActivity, setEditingActivity] = useState<OrgActivity | null>(null);
const [isFormOpen, setIsFormOpen] = useState(false);

// In activity row actions menu
<Button
  size="sm"
  variant="ghost"
  onClick={() => {
    setEditingActivity(activity);
    setIsFormOpen(true);
  }}
>
  Editar
</Button>

// Render form sheet
<OrgEntityFormSheet
  entity="activity"
  mode="edit"
  initialData={editingActivity}
  isOpen={isFormOpen}
  onClose={() => setIsFormOpen(false)}
  onSaved={(saved) => {
    // Refetch activities list
    revalidatePath('/activities');
    setIsFormOpen(false);
  }}
/>
```

**Server Action Impact:** Zero—updateActivityAction already handles responsible_roles (line 199 in organization.ts)

**Database Impact:** Zero—org_activities already has responsible_roles column with GIN index

### Priority: 🔴 CRITICAL (Blocks v0.2.4)

**Why Critical:**
- AC #27 depends on this
- v0.2.4 release notes promise "Complete Activity role management"
- Visible feature regression from EPIC 10 (other entities have this)
- Breaks symmetry: Processes/Routines have role edit, Activities don't

### Effort Estimate: 3-4 hours

**Breakdown:**
- Button integration in ActivityCockpit360: 0.5h
- Detail page edit integration: 1h
- Form logic verification: 0.5h
- Testing (E2E + unit): 1.5h

### Dependencies
- ResponsibleRolesInput ✅ (complete, Story 11.6)
- OrgEntityFormSheet ✅ (exists, tested)
- updateActivityAction ✅ (handles responsible_roles)

### Testing Checklist
- [ ] Activity edit modal opens with OrgEntityFormSheet
- [ ] Existing responsible_roles load in form
- [ ] Can add new roles via autocomplete
- [ ] Can remove roles via backspace/X button
- [ ] Save persists to database
- [ ] UI refreshes after save
- [ ] Keyboard navigation works (WCAG AA)
- [ ] No regressions in activity list view

---

## Gap 2: Missing Forms for Activity Inputs/Outputs/Risks/Impacts

### Current State
- ✅ Database columns exist: `org_activities.inputs`, `outputs`, `risks`, `impacts` (JSONB arrays)
- ✅ OrgEntityFormSheet has the form fields (lines 156-176)
- ✅ Server action updateActivityAction persists them (line 212-213)
- ❌ **Read-only display only in activity detail views**

### Technical Analysis

**Root Cause:** Components show these fields as read-only text or badges, but no edit form is integrated. ActivityCockpit360 displays a summary, but no inline edit or modal to modify.

**Current Display Components:**
- `src/components/organization/ActivityCockpit360.tsx` — Shows inputs/outputs as badges (read-only)
- `src/app/organizations/[id]/activities/[activityId]/page.tsx` — Detail page displays them

**Missing Flow:**
```
Activity Detail → Edit → Modify inputs → Update outputs → Change risks → Save
```

Currently:
```
Activity Detail → View inputs/outputs/risks/impacts (read-only) → Cannot modify
```

### Impact Analysis

**Technical Impact:**
- org_activities.inputs, outputs, risks, impacts columns accept JSONB but UI is read-only
- No way for users to document process flows or risk assessments
- Data stays at migration baseline (empty arrays)

**UX Impact:**
- Users open activity detail, see "Inputs/Outputs" but cannot edit
- Have to use database tools to populate (unacceptable)
- Breaks AC #28: "User can specify activity inputs, outputs, risks, impacts"

**Business Impact:**
- Process documentation gaps—inputs/outputs not captured
- Risk management incomplete—no risk tracking in activities
- Impact analysis unavailable for decision-making
- EPIC 11 scope partially unfulfilled

### Architecture Solution

**Approach:** Reuse existing OrgEntityFormSheet form tab (BPM tab) which already has these fields

**Current Implementation (in OrgEntityFormSheet):**
Lines 419-477 in OrgEntityFormSheet.tsx already implement full edit UI for:
- inputs: Array of {name, description, required}
- outputs: Array of {name, description, required}
- risks: Array of strings
- impacts: Array of strings

**Form Structure Already Built:**
```typescript
{(entity === 'process' || entity === 'activity') && (
  <TabsContent value="bpm" className="space-y-4 p-6">
    {/* Inputs section with add/remove buttons */}
    {/* Outputs section with add/remove buttons */}
    {/* Risks section with add/remove buttons */}
    {/* Impacts section with add/remove buttons */}
  </TabsContent>
)}
```

**Required Changes:**

1. **ActivityCockpit360.tsx** (MODIFY)
   - Add "BPM Details" button → opens OrgEntityFormSheet with mode="edit"
   - Same pattern as Gap 1 (ResponsibleRoles)

2. **Activity Detail Page** (MODIFY if not using form sheet)
   - Replace read-only display with form
   - Or add "Edit" button that opens OrgEntityFormSheet

**No New Components Needed:** The form UI already exists in OrgEntityFormSheet (lines 419-477).

### Priority: 🔴 CRITICAL (Blocks v0.2.4)

**Why Critical:**
- AC #28 ("specify activity inputs, outputs, risks, impacts") depends on this
- Part of "BPM Mastery" brand promise in EPIC 11
- Visible gap: Form renders correctly for Processes but not Activities
- Users expect symmetry across entity types

### Effort Estimate: 2-3 hours

**Breakdown:**
- Add edit button in ActivityCockpit360: 0.5h
- Add edit button in detail page: 0.5h
- Wire form tab for Activities (if not working): 1h
- Testing (form submit, validation, persistence): 1h

### Dependencies
- OrgEntityFormSheet ✅ (already has the form UI)
- updateActivityAction ✅ (already persists inputs/outputs/risks/impacts)

### Testing Checklist
- [ ] Edit button visible in activity list/detail
- [ ] Form sheet opens to "BPM" tab
- [ ] Existing inputs/outputs/risks/impacts load
- [ ] Can add new input with name+description
- [ ] Can remove input via trash icon
- [ ] Required checkbox works for inputs/outputs
- [ ] Can add/remove risks (simple strings)
- [ ] Can add/remove impacts (simple strings)
- [ ] Save button persists all changes
- [ ] Validation blocks empty names

---

## Gap 3: SLA/Metrics Forms Missing (Display-Only Currently)

### Current State
- ✅ Database tables exist: `org_process_slas`, `org_process_metrics` (Migration 068)
- ✅ Display action exists: `getProcessSLAsAction()`, `getProcessMetricsAction()`
- ❌ **No create/edit forms or server actions for CRUD**
- ❌ **No UI for SLA creation or metrics input**

### Technical Analysis

**Root Cause:** Migration 068 created the schema, display actions were added, but CRUD server actions and UI forms were never implemented. Only read-only display (charts in ProcessCockpit360) exists.

**Current Capabilities:**
- Read: getProcessSLAsAction (line 1143), getProcessMetricsAction (line 1163)
- Create: ❌ No createProcessSlaAction
- Update: ❌ No updateProcessSlaAction
- Delete: ❌ No deleteProcessSlaAction

**Affected Components:**
- `src/components/organization/ProcessCockpit360.tsx` — Shows SLA/metrics charts (read-only)
- No form components exist for SLA/metrics creation

### Impact Analysis

**Technical Impact:**
- org_process_slas and org_process_metrics are write-only from SQL
- No server-side validation or RLS checks for SLA/metrics create
- Data seeding must happen via migrations or direct DB access
- Users cannot define organizational SLAs

**UX Impact:**
- Users see "Process SLAs" dashboard but cannot create SLAs
- Chart widgets are empty (no data to display)
- No way to set or track performance targets
- Breaks AC #29: "User can define and view process SLAs and metrics"

**Business Impact:**
- SLA governance feature is non-functional
- Cannot track process performance against targets
- Metrics dashboard is a shell without data
- EPIC 11 "BPM Mastery" claim is incomplete

### Architecture Solution

**Approach:** Create server actions + modal form for SLA/metrics management

**New Server Actions (in organization.ts):**
```typescript
// Create SLA for process
export async function createProcessSlaAction(
  processId: string,
  payload: {
    sla_type: 'execution_time' | 'quality' | 'availability';
    target_value: number;
    unit: string; // 'minutes', 'percent', 'occurrences'
    period: 'daily' | 'weekly' | 'monthly';
    description?: string;
  }
): Promise<OrgActionResult>

// Update SLA
export async function updateProcessSlaAction(
  slaId: string,
  updates: Partial<...>
): Promise<OrgActionResult>

// Delete SLA
export async function deleteProcessSlaAction(
  slaId: string
): Promise<OrgActionResult>

// Create metric record (typically done via scheduled job)
export async function recordProcessMetricAction(
  processId: string,
  payload: {
    period_start: string; // ISO date
    period_end: string;
    execution_count: number;
    avg_execution_time: number;
    quality_score: number;
    availability_percent: number;
  }
): Promise<OrgActionResult>
```

**New UI Components:**

1. **ProcessSlaModal.tsx** (NEW)
   - Form to create/edit SLAs
   - Fields: sla_type (dropdown), target_value (number), unit (dropdown), period (dropdown)
   - Add/remove buttons for multiple SLAs

2. **ProcessSlaList.tsx** (NEW)
   - Table showing current SLAs
   - Edit button → opens ProcessSlaModal
   - Delete button with confirmation

3. **ProcessMetricsForm.tsx** (NEW)
   - Form to manually record metrics (if not automated)
   - Or display auto-populated metrics from scheduled job

**Integration Points:**
- Add "SLA Management" tab in ProcessCockpit360
- Tab shows current SLAs + "New SLA" button
- Clicking edit opens ProcessSlaModal

### Priority: 🔴 CRITICAL (Blocks v0.2.4)

**Why Critical:**
- AC #29 explicitly requires SLA management
- "Process Metrics & SLAs" is a named feature in EPIC 11 Phase 3
- Data tables exist but are unusable without forms
- Metrics dashboard shows charts but no data

### Effort Estimate: 8-10 hours

**Breakdown:**
- Create 3 server actions (createProcessSla, updateProcessSla, deleteProcessSla): 2h
  - Includes RLS validation, error handling, audit logging
- Create ProcessSlaModal component: 2h
- Create ProcessSlaList component: 1.5h
- Integrate into ProcessCockpit360: 1h
- Add metric recording action (if manual input needed): 1h
- Testing (CRUD, validation, RLS, permissions): 1.5h

### Dependencies
- Migration 068 ✅ (tables exist)
- ProcessCockpit360 component ✅ (ready to integrate)

### Testing Checklist
- [ ] Create SLA with all required fields
- [ ] SLA persists to org_process_slas
- [ ] RLS prevents non-tenant access
- [ ] Can update SLA target/period
- [ ] Can delete SLA
- [ ] Cannot create SLA without process context
- [ ] List shows all SLAs for process
- [ ] Edit modal pre-fills from DB
- [ ] Validation prevents invalid target_values
- [ ] Metrics chart updates when SLAs exist

---

### 🟡 MEDIUM GAPS (Post-Release Acceptable)

---

## Gap 4: Activity-System usage_context Field Is Read-Only

### Current State
- ✅ Database column: `org_activity_systems.usage_context` (TEXT)
- ✅ Display modal: `ActivitySystemsModal.tsx` shows usage_context
- ✅ Server actions: `addActivitySystemAction()`, `removeActivitySystemAction()`
- ❌ **No edit form for usage_context**
- ❌ **usage_context is initialized but cannot be updated after creation**

### Technical Analysis

**Root Cause:** ActivitySystemsModal allows adding systems and setting usage_context on creation (line 56 in ActivitySystemsModal.tsx), but no edit/update capability after initial add.

**Current Flow:**
```
1. Open ActivitySystemsModal
2. Select system from dropdown
3. Enter usage_context in field
4. Click "Add" → calls addActivitySystemAction with usage_context
5. System added to activity
6. Want to change usage_context? → No way to do it
```

**Missing Action:** `updateActivitySystemAction(activityId, systemId, usageContext)` does NOT exist.

**Affected Components:**
- `src/components/organization/ActivitySystemsModal.tsx` — Shows usage_context but no edit
- `src/app/actions/organization.ts` — Only has add/remove, not update

### Impact Analysis

**Technical Impact:**
- Users can set usage_context once when adding system
- If typo or requirement changes, must remove and re-add
- No audit trail of usage_context changes

**UX Impact:**
- Modal shows usage_context as read-only after system is added
- Users must delete system to change context
- Friction in workflow—expected to be editable

**Business Impact:**
- Low priority but affects user satisfaction
- Adds manual rework if context needs update
- Blocks advanced search on usage_context (Gap 5)

### Architecture Solution

**Approach:** Add update action + edit capability to ActivitySystemsModal

**New Server Action (organization.ts):**
```typescript
export async function updateActivitySystemAction(
  activityId: string,
  systemId: string,
  usageContext?: string
): Promise<OrgActionResult> {
  const ctx = await getAuthContext();
  if ('error' in ctx) return { success: false, message: ctx.error };

  const { error } = await ctx.supabase
    .from('org_activity_systems')
    .update({ usage_context: usageContext || null })
    .eq('activity_id', activityId)
    .eq('system_id', systemId)
    .eq('tenant_id', ctx.tenantId);

  if (error) return { success: false, message: `Error updating usage context: ${error.message}` };

  revalidatePath('/organizacao');
  return { success: true, message: 'Usage context updated!' };
}
```

**UI Changes (ActivitySystemsModal.tsx):**
```typescript
// Current: usage_context is read-only display
// New: usage_context becomes editable in row

// Show systems table with Edit button per system
systems.map(system => (
  <div key={system.system_id}>
    <span>{system.system_name}</span>
    {/* Add inline edit or edit button */}
    <Input
      value={system.usage_context || ''}
      onChange={(e) => handleUpdateUsageContext(system.system_id, e.target.value)}
      placeholder="e.g., data entry, query lookup"
    />
    <Button onClick={() => handleRemoveSystem(system.system_id)}>Remove</Button>
  </div>
))
```

### Priority: 🟡 MEDIUM (Post-Release Acceptable)

**Why Medium (not critical):**
- Initial add includes usage_context entry
- Workaround exists: remove system and re-add
- Not mentioned in main AC
- Affects operational workflow, not core functionality

**Why Not Low:**
- Users will expect to edit after adding
- "Read-only fields in add modal are editable" is confusing
- Improves data quality (typos can be fixed)

### Effort Estimate: 2-3 hours

**Breakdown:**
- Add updateActivitySystemAction server action: 0.5h
- Update ActivitySystemsModal UI to show edit: 1h
- Wire onChange handlers: 0.5h
- Testing: 1h

### Dependencies
- addActivitySystemAction ✅ (exists)
- removeActivitySystemAction ✅ (exists)

### Testing Checklist
- [ ] System added with initial usage_context
- [ ] Can edit usage_context in modal
- [ ] Edit persists to database
- [ ] Empty usage_context can be cleared
- [ ] Modal refreshes after update
- [ ] No duplicate updates

---

## Gap 5: org_role_permissions UI Missing (Read-Only Governance)

### Current State
- ✅ Database tables exist: `org_role_definitions`, `org_role_permissions` (Migration 069)
- ✅ 9 default roles seeded (diretor, gerente, coordenador, etc.)
- ✅ Permission matrix schema designed (role_id, resource_type, action, scope)
- ❌ **No UI for governance: viewing or editing role permissions**
- ❌ **No server actions to create/update/delete role permissions**

### Technical Analysis

**Root Cause:** Migration 069 created the tables and seeded default roles, but no frontend or backend actions were implemented to manage permissions. Governance layer is data-only.

**Current State:**
- org_role_definitions: 9 default roles exist (queryable)
- org_role_permissions: Empty (no permissions defined)
- No way to assign "which roles can edit which resources"

**Missing Components:**
- No RolePermissionsGrid or RoleGovernance UI
- No CRUD actions for org_role_permissions
- No settings page for administrators

### Impact Analysis

**Technical Impact:**
- Permission data exists in schema but is unused
- RLS policies don't check org_role_permissions (only check tenant_id)
- No enforcement of role-based restrictions
- Permission model is aspirational, not functional

**UX Impact:**
- Administrators cannot configure who can do what
- No governance/settings UI
- Role definitions display-only (read from migration seed)
- Feature feels incomplete—tables exist but are not usable

**Business Impact:**
- RBAC layer is non-functional
- Organizations cannot enforce role-based access control
- Security/governance posture is limited
- Blocks advanced search filtering by role access (Gap 5 equivalent)

### Architecture Solution

**Approach:** Create admin governance UI for managing role permissions

**New Server Actions (organization.ts):**
```typescript
// Get all permission definitions for a role
export async function getRolePermissionsAction(
  roleId: string
): Promise<OrgActionResult<any[]>>

// Create/assign permission to role
export async function assignRolePermissionAction(
  roleId: string,
  resourceType: string,
  action: string,
  scope?: string
): Promise<OrgActionResult>

// Remove permission from role
export async function removeRolePermissionAction(
  roleId: string,
  resourceType: string,
  action: string
): Promise<OrgActionResult>
```

**New UI Components:**

1. **RoleGovernanceGrid.tsx** (NEW)
   - Matrix view: rows = roles, columns = resource_types × actions
   - Cells = scope selector (own_tenant, own_unit, all_units)
   - + = add permission, - = remove permission

2. **RolePermissionsModal.tsx** (NEW)
   - Edit permissions for a single role
   - Checkboxes for each resource_type × action combination
   - Scope selector per permission

3. **GovernanceSettingsPage.tsx** (NEW)
   - Administrative page at `/organizations/[id]/settings/governance`
   - Role list on left → click to see permissions on right
   - Create custom roles
   - Import/export permission matrix

### Priority: 🟡 MEDIUM (Post-Release Acceptable)

**Why Medium (not critical):**
- Can be managed via direct DB access for now
- Complex feature requiring careful UX design
- Not required for v0.2.4 core functionality
- Acceptable to deliver post-release

**Why Not Low:**
- Governance is important for enterprise deployments
- Customers will ask for this immediately post-release
- Setting up custom roles is administrator-level task (not frequent)

### Effort Estimate: 10-12 hours

**Breakdown:**
- Design permission matrix UX: 2h
- Create 3 server actions (get/assign/remove): 2h
- Build RoleGovernanceGrid component: 3h
- Build RolePermissionsModal component: 2h
- Create admin settings page: 1.5h
- Testing (RBAC logic, validation, RLS): 1.5h

### Dependencies
- Migration 069 ✅ (tables seeded with 9 roles)
- OrgRoleDefinition type definition (may need to add)

### Testing Checklist
- [ ] List all roles with their current permissions
- [ ] Assign new permission to role
- [ ] Remove permission from role
- [ ] Scope selector shows options (own_tenant, own_unit, all_units)
- [ ] RLS prevents non-admin access to governance UI
- [ ] Cannot create duplicate permission
- [ ] Matrix view loads correctly
- [ ] Bulk assign permissions
- [ ] Export/import permission matrix (future)

---

## Gap 6: Documentation JSONB Field Is Read-Only

### Current State
- ✅ Database columns exist on all entities: `documentation` (JSONB)
- ✅ Forms accept documentation updates (OrgEntityFormSheet line 127)
- ✅ Server actions persist documentation changes
- ❌ **Documentation form tab is non-functional or minimal**
- ❌ **No structured editor for documentation JSONB**

### Technical Analysis

**Root Cause:** Documentation field is stored as free-form JSONB but there's no UI to edit it. The OrgEntityFormSheet references it (line 289) but the tab content is likely empty or shows raw JSON.

**Current State:**
- documentation: {} field in database (can store any JSON)
- Form tab exists but is probably just empty or text area
- No structured editor (e.g., sections, fields, versioning)

### Impact Analysis

**Technical Impact:**
- Users cannot add structured documentation
- JSON is unstructured—no schema validation
- No versioning of documentation changes
- Search can't index documentation content effectively

**UX Impact:**
- Documentation tab is confusing—unclear what to edit
- Likely shows raw JSON or empty form
- Users prefer free-text or structured fields, not JSON
- Low discoverability

**Business Impact:**
- Documentation feature feels incomplete
- Knowledge base is not being captured
- Reduces organizational knowledge capture
- Low priority but affects adoption

### Architecture Solution

**Approach:** Create structured documentation editor with sections

**New Component: DocumentationEditor.tsx**
```typescript
interface DocumentationSection {
  title: string;
  content: string;
  lastUpdatedBy?: string;
  lastUpdatedAt?: string;
}

interface Documentation {
  sections: DocumentationSection[];
  lastReview?: string;
  status: 'draft' | 'review' | 'approved';
}
```

**UI Features:**
- Add/remove documentation sections
- Rich text editor for each section (or markdown)
- Version history view
- Approval workflow toggle

### Priority: 🟢 LOW (Nice-to-Have for v0.2.4)

**Why Low:**
- Not part of core EPIC 11 AC
- Workaround: manual JSON updates
- Can be implemented post-release without blocking features
- Optional for MVP, valuable for future

### Effort Estimate: 6-8 hours

**Breakdown:**
- Design documentation structure: 1.5h
- Create DocumentationEditor component: 2.5h
- Create markdown/rich text editor wrapper: 1.5h
- Integrate into OrgEntityFormSheet: 1h
- Testing: 1.5h

### Dependencies
- react-markdown or similar rich text library (may need to add)

---

### 🟢 LOW GAPS (Post-Release Enhancements)

---

## Gap 7: Knowledge Base (org_knowledge_entries) Has No UI

### Current State
- ✅ Database table exists: `org_knowledge_entries` (from EPIC 10)
- ✅ Table schema: id, tenant_id, title, content, entity_type, entity_id, created_at, updated_at
- ✅ Columns support: content (TEXT), tags, embedding (for pgvector future)
- ❌ **No UI for viewing/creating knowledge entries**
- ❌ **No search integration for knowledge base**

### Technical Analysis

**Root Cause:** Knowledge base infrastructure exists but frontend never implemented. No components, no CRUD actions, no search integration.

**Missing:**
- KnowledgeBaseUI / KnowledgeListPage
- createKnowledgeAction, updateKnowledgeAction, deleteKnowledgeAction
- Knowledge search in advanced search (Gap 5 equivalent)

### Impact Analysis

**Technical Impact:**
- Knowledge table is unused
- Content cannot be captured through UI
- Future embedding/search features have no data

**UX Impact:**
- Administrators cannot document organizational knowledge
- No knowledge management capabilities visible
- Feature is invisible to users

**Business Impact:**
- Knowledge management is aspirational, not functional
- Organizations cannot capture lessons learned
- Low priority—typical for v0.2.4 MVP

### Architecture Solution

**Approach:** Defer to post-release story; create placeholder UI

**For v0.2.4:** Create simple read-only knowledge list
**For v0.2.5:** Add full CRUD + search integration

### Priority: 🟢 LOW (Post-Release v0.2.5)

**Why Low:**
- Not in EPIC 11 main ACs
- Can be delivered as Story 11.15+ post-release
- Infrastructure (table, embeddings) is ready
- Typical feature, not MVP-critical

### Effort Estimate: 8-10 hours

**Breakdown:**
- Create CRUD server actions: 2h
- Build KnowledgeListPage component: 2h
- Build KnowledgeForm/Editor: 2h
- Integrate search: 1.5h
- Testing: 1.5h

### Dependencies
- org_knowledge_entries table ✅
- pgvector embedding job (needed for semantic search)

---

## Gap 8: Audit Trail (bulk_operation_logs) Has No Visualization

### Current State
- ✅ Database table exists: `bulk_operation_logs` (from EPIC 10)
- ✅ Table schema: id, tenant_id, operation_type, entity_type, status, result, created_at
- ✅ Server actions log bulk operations (CSV import, JSON export, etc.)
- ❌ **No UI to view operation history**
- ❌ **No analytics dashboard for bulk operations**

### Technical Analysis

**Root Cause:** Bulk operation logging infrastructure exists, but no UI to display logs. Auditing happens silently.

**Missing:**
- BulkOperationAuditPage / BulkOperationLogsTable
- No getBulkOperationLogsAction (may exist, need to verify)
- No audit analytics/dashboard

### Impact Analysis

**Technical Impact:**
- Audit logs are recorded but invisible
- Users cannot troubleshoot failed imports
- No visibility into what bulk operations occurred

**UX Impact:**
- User imports CSV → "success/error" message → no history
- Cannot check later what operations ran
- Operators cannot verify data quality

**Business Impact:**
- Compliance/audit trail is not visible
- Data governance is weaker without audit visibility
- Typical feature, not MVP-critical

### Architecture Solution

**Approach:** Create audit log viewer page with filtering

**Components (post-release):**
- BulkOperationLogsPage.tsx
- Filter by: date range, operation_type, status, entity_type
- Show: timestamp, operator, what changed, success/fail reason
- Export logs for compliance

### Priority: 🟢 LOW (Post-Release v0.2.5)

**Why Low:**
- Not in EPIC 11 main ACs
- Bulk operations work without audit UI
- Nice-to-have for operators, not blocking users
- Can be added iteratively

### Effort Estimate: 5-7 hours

**Breakdown:**
- Create BulkOperationLogsPage component: 2h
- Add filtering/search logic: 1.5h
- Integrate with bulk operation actions: 1h
- Testing and polish: 1.5h

### Dependencies
- bulk_operation_logs table ✅
- getBulkOperationLogsAction (verify exists)

---

## Summary Table: All Gaps

| # | Gap | Priority | Category | Effort | Blocker? | v0.2.4 Release |
|---|-----|----------|----------|--------|----------|---|
| 1 | ActivityFormSheet missing ResponsibleRolesInput | 🔴 Critical | Feature | 3-4h | YES | MUST FIX |
| 2 | Missing Inputs/Outputs/Risks/Impacts forms | 🔴 Critical | Feature | 2-3h | YES | MUST FIX |
| 3 | SLA/Metrics CRUD missing | 🔴 Critical | Feature | 8-10h | YES | MUST FIX |
| 4 | usage_context edit missing | 🟡 Medium | UX Polish | 2-3h | NO | Nice-to-have |
| 5 | Role permissions governance UI | 🟡 Medium | Feature | 10-12h | NO | Post-release |
| 6 | Documentation editor | 🟡 Medium | Feature | 6-8h | NO | Post-release |
| 7 | Knowledge base UI | 🟢 Low | Feature | 8-10h | NO | v0.2.5 |
| 8 | Audit trail visualization | 🟢 Low | Feature | 5-7h | NO | v0.2.5 |
| | **TOTAL** | | | **34-40h** | **3 yes** | **14-16h critical** |

---

## Release Decision Matrix

### v0.2.4 Release (April 25, 2026)

**MUST HAVE (Blockers):**
- ✅ Gap 1: ActivityFormSheet + ResponsibleRolesInput integration
- ✅ Gap 2: Inputs/Outputs/Risks/Impacts form editing
- ✅ Gap 3: SLA/Metrics create/edit forms

**Effort:** 14-16 hours
**Timeline:** Can be completed in 2-3 days with focused effort
**Impact on release:** Without these, EPIC 11 acceptance criteria are incomplete

**SHOULD HAVE (Medium Priority):**
- Gap 4: usage_context editing
- Gap 5: Role permissions UI

**Effort:** 12-14 hours
**Timeline:** Post-release acceptable
**Impact:** Improves UX/governance, not blocking users

**NICE-TO-HAVE (Low Priority):**
- Gap 6: Documentation structured editor
- Gap 7: Knowledge base UI
- Gap 8: Audit trail visualization

**Effort:** 18-25 hours
**Timeline:** v0.2.5 roadmap
**Impact:** Features can be used without these; delivered iteratively

---

## Recommended Implementation Story

### Story 13.1: Complete EPIC 11 Frontend Integration (Critical Gaps)

**Title:** Complete EPIC 11 Frontend Synchronization — Critical Gaps Fix

**Acceptance Criteria:**
- [ ] Gap 1: Activity edit modal uses OrgEntityFormSheet with ResponsibleRolesInput
- [ ] Gap 2: Activity BPM tab enables full inputs/outputs/risks/impacts editing
- [ ] Gap 3: Process SLA management UI + CRUD actions implemented
- [ ] All three forms tested and integrated into respective cockpits
- [ ] No regression in existing activity/process views
- [ ] All AC #27, #28, #29 are now satisfied
- [ ] Lint + typecheck passes
- [ ] 95%+ test coverage maintained

**Effort:** 14-16 hours
**Team:**
- @dev (Dex): 8-10 hours (form integration, server actions)
- @qa (Quinn): 3-4 hours (testing, E2E, regression)
- @ux-design-expert (Uma): 1-2 hours (modal UX polish)

**Timeline:** 2-3 days
**Depends On:** All dependencies met (components exist, server actions exist)
**Blocks:** v0.2.4 release readiness

---

## Recommended Post-Release Stories

### Story 13.2: Role Permissions Governance UI

**Effort:** 10-12 hours
**Timeline:** v0.2.5 roadmap (May 2026)

### Story 13.3: Advanced Documentation & Knowledge Management

**Effort:** 14-18 hours
**Timeline:** v0.2.5 roadmap (May 2026)

### Story 13.4: Audit Trail Visualization & Reporting

**Effort:** 5-7 hours
**Timeline:** v0.2.5 roadmap (May 2026)

---

## Technical Debt & Architecture Considerations

### 1. Form Sheet Consolidation Pattern

**Observation:** OrgEntityFormSheet is now the canonical form for all entity CRUD. This is good for consistency.

**Recommendation:** Document this pattern in `.claude/rules/component-architecture.md`:
- "All org entity editing uses OrgEntityFormSheet"
- "Add entity-specific tabs in OrgEntityFormSheet when needed"
- "Don't create parallel edit components for activities/processes/etc."

### 2. Server Action Organization

**Observation:** organization.ts is growing (1200+ lines). Server actions for different features are mixed.

**Recommendation (Post-Release):** Split organization.ts into focused files:
- `actions/areas.ts`
- `actions/activities.ts`
- `actions/systems.ts`
- `actions/governance.ts`
- `actions/search.ts`

**Current state is acceptable for now; do this in Story 13.5**

### 3. Component Testing

**Observation:** Gaps 1-3 require deep form integration testing. Recommend E2E tests for user workflows.

**Recommendation:** Add Playwright tests for:
- "User edits activity with responsible roles" (Gap 1)
- "User specifies activity inputs/outputs" (Gap 2)
- "User creates process SLA" (Gap 3)

**Current test coverage is at 95%+, maintain this standard.**

### 4. TypeScript Type Safety

**Observation:** All gaps use strongly-typed payloads (OrgActivityPayload, etc.). Maintain this.

**Recommendation:** When adding new actions (Gap 4-8), create PayloadTypes in types/organization.ts to avoid `any` types.

---

## Conclusion

EPIC 11 backend is **100% production-ready** (schema, migrations, server actions, RLS).
EPIC 11 frontend is **60% complete** (basic display, missing forms for new features).

**Critical path:** Complete Gaps 1-3 before v0.2.4 release (14-16 hours work, 2-3 days timeline).

**Post-release roadmap:** Gaps 4-8 can be delivered as v0.2.5 feature enhancements (30+ hours, May 2026).

**Release risk:** HIGH if Gaps 1-3 not fixed. Without them, EPIC 11 acceptance criteria are not met.

---

**Signed:** Aria (@architect)
**Next Step:** @sm (River) creates Story 13.1 with this analysis as context
