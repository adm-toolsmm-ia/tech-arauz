# 📚 EPIC 9: Context Engineering & Frontend-Backend Synchronization

**Subtitle:** Complete Organization Knowledge Graph with Unified Responsible Party Management

**Timeline:** 2-3 weeks (March 14 — March 28, 2026)
**Team:** Dex (@dev) + Dara (@data-engineer) + Uma (@ux-design-expert) + Aria (@architect)
**Effort:** 35-50 hours
**Status:** 🔄 IN PROGRESS (Story 9.8 deployed ✅, Refinement phase)

---

## 📋 Epic Overview

EPIC 9 focuses on **completing the AI Organizational Knowledge Graph** with proper schema synchronization and unified responsible party management across all organization entities (Areas, Nuclei, Processes, Routines, Activities, Systems, Suppliers, Services, Documents).

### Phase 1: Context Engineering (Stories 9.1-9.8) — ✅ DEPLOYED v0.2.3
- Organizational bootstrap schema
- AI context transformers
- 360º views for all entities

### Phase 2: Refinement (Stories 9.9.1-9.9.3) — 🔄 CURRENT PHASE
- Schema synchronization (add missing fields)
- UI/UX improvements for responsible management
- Display consistency across modules

---

## 🎯 Key Deliverables (Phase 2)

- ✅ Add `responsible_roles` to suppliers, services, documents (DB)
- ✅ Redesign responsible party management UI (tags + autocomplete)
- ✅ Display all fields in ProcessCockpit360 (inputs, outputs, risks, impacts)
- ✅ Unified responsible roles interface across all Cockpit360 components
- ✅ AI Context Engineering for role definitions (enums, patterns)
- ✅ IDS Registry entries for all new components

---

## 📖 Stories (Refinement Phase)

### Story 9.9.1: Add responsible_roles to Database (Suppliers, Services, Documents)

**Owner:** Dara (@data-engineer)
**Effort:** 5-7 hours
**Priority:** CRITICAL
**Status:** ⏳ READY FOR DEV

#### Acceptance Criteria

- [ ] Migration 065 created: `Add responsible_roles to org_suppliers, org_services, org_documents`
- [ ] `org_suppliers.responsible_roles` JSONB default '[]' + index
- [ ] `org_services.responsible_roles` JSONB default '[]' + index
- [ ] `org_documents.responsible_roles` JSONB default '[]' + index
- [ ] RLS policies updated for all 3 tables (USING true, WITH CHECK true per ADR-001)
- [ ] TypeScript types updated (OrgSupplier, OrgService, OrgDocument)
- [ ] DB lint + migration validation passing
- [ ] Rollback script tested and documented

#### Architecture

```sql
-- Pattern for all 3 tables:
ALTER TABLE public.org_suppliers ADD COLUMN responsible_roles JSONB DEFAULT '[]';
CREATE INDEX idx_org_suppliers_responsible_roles_gin ON public.org_suppliers USING GIN(responsible_roles);
COMMENT ON COLUMN public.org_suppliers.responsible_roles
  IS 'Array of roles responsible for this supplier (e.g., ["vendor_manager", "procurement_lead"])';
```

#### Type Updates

```typescript
// Before
export interface OrgSupplier {
  id: string;
  tenant_id: string;
  name: string;
  description: string | null;
  created_at: string;
  updated_at: string;
}

// After
export interface OrgSupplier {
  id: string;
  tenant_id: string;
  name: string;
  description: string | null;
  responsible_roles: string[];  // ← NEW
  created_at: string;
  updated_at: string;
}
```

#### Dev Notes

- Use standard enum pattern for roles (defer to Story 9.9.2)
- Keep consistent with areas/nuclei/processes pattern
- Update action creators: `createSupplierAction`, `updateSupplierAction`
- Run full RLS audit after migration

#### Testing

- [ ] Unit test: Migration creates columns correctly
- [ ] Unit test: RLS policies allow read/write for tenant
- [ ] Integration test: Create supplier WITH responsible_roles
- [ ] Integration test: Update supplier responsible_roles
- [ ] Regression test: Existing suppliers load correctly

#### File List

- `supabase/migrations/065_add_responsible_roles_to_resources.sql` (NEW)
- `src/types/organization.ts` (MODIFIED)
- `src/app/actions/organization.ts` (MODIFIED — action creators)

---

### Story 9.9.2: Redesign Responsible Roles UI Component

**Owner:** Uma (@ux-design-expert) + Dex (@dev)
**Effort:** 12-16 hours
**Priority:** HIGH
**Status:** ⏳ READY FOR DEV

#### Acceptance Criteria

- [ ] Create `ResponsibleRolesInput` component (tags + autocomplete)
- [ ] Component accepts predefined role options (enum/array)
- [ ] Display: tags with remove button (badge style)
- [ ] Input: text field with autocomplete dropdown
- [ ] Keyboard support: backspace to remove last tag
- [ ] Validation: no duplicate roles
- [ ] Responsive: mobile-friendly (stack on small screens)
- [ ] Accessibility: ARIA labels, keyboard navigation (WCAG AA)
- [ ] Integrated in `OrgEntityFormSheet` for all entity types
- [ ] Master role registry created (can extend later)
- [ ] Unit tests: tag add/remove, autocomplete, validation
- [ ] Component story in Storybook

#### Architecture

```typescript
// New Component
interface ResponsibleRolesInputProps {
  value: string[];
  onChange: (roles: string[]) => void;
  availableRoles: Array<{ label: string; value: string }>;
  placeholder?: string;
  disabled?: boolean;
}

export function ResponsibleRolesInput({
  value,
  onChange,
  availableRoles,
  placeholder = "Add a role...",
  disabled = false,
}: ResponsibleRolesInputProps) {
  // Tag display + input field + autocomplete dropdown
}
```

#### Role Registry Pattern

```typescript
// src/lib/organization/role-definitions.ts
export const ORGANIZATION_ROLES = [
  { value: 'coordenador', label: 'Coordenador(a)' },
  { value: 'gerente', label: 'Gerente' },
  { value: 'analista_senior', label: 'Analista Sênior' },
  { value: 'analista_junior', label: 'Analista Júnior' },
  { value: 'especialista', label: 'Especialista' },
  { value: 'diretor', label: 'Diretor' },
  { value: 'supervisor', label: 'Supervisor' },
  { value: 'operacional', label: 'Operacional' },
  { value: 'administrativo', label: 'Administrativo' },
  { value: 'vendor_manager', label: 'Vendor Manager' },
  { value: 'procurement_lead', label: 'Procurement Lead' },
  // Add more as needed
] as const;
```

#### UI Design

```
Responsible Roles Input:
┌────────────────────────────────┐
│ [Coordenador] [Gerente]        │  ← Tags (removable)
│ Type role...                   │  ← Input field
│                                │
│ ▼ Suggestions:                 │  ← Dropdown
│  • Analista Sênior             │
│  • Especialista                │
│  • Supervisor                  │
└────────────────────────────────┘
```

#### Dev Notes

- Reuse shadcn/ui primitives (Badge, Input, Popover, Command)
- No external autocomplete library (keep deps minimal)
- Role definitions extensible (load from DB in future)
- Fully keyboard accessible (no mouse-only)
- A11y: Combobox ARIA pattern (WAI-ARIA 1.2)

#### Testing

- [ ] Unit: Add/remove tags, no duplicates
- [ ] Unit: Autocomplete filtering works
- [ ] Unit: Keyboard navigation (arrow keys, enter, backspace)
- [ ] A11y: Screen reader labels correct
- [ ] Integration: Form submission with multiple roles
- [ ] Visual: Mobile responsiveness

#### File List

- `src/components/organization/ResponsibleRolesInput.tsx` (NEW)
- `src/lib/organization/role-definitions.ts` (NEW)
- `src/components/organization/OrgEntityFormSheet.tsx` (MODIFIED — integrate component)
- `src/components/organization/__tests__/ResponsibleRolesInput.test.tsx` (NEW)

---

### Story 9.9.3: Synchronize Field Display in ProcessCockpit360

**Owner:** Dex (@dev) + Uma (@ux-design-expert)
**Effort:** 8-10 hours
**Priority:** HIGH
**Status:** ⏳ READY FOR DEV

#### Acceptance Criteria

- [ ] ProcessCockpit360 displays: inputs, outputs, risks, impacts
- [ ] AreaCockpit360 displays: full documentation tab (optional)
- [ ] NucleusCockpit360 displays: full process links (already done)
- [ ] RoutineCockpit360 displays: full activity list (already done)
- [ ] All displays consistent with design system
- [ ] All fields editable via onEdit callback (EPIC-9-ADJUSTMENT-001 ✅)
- [ ] Modal/Sheet opens with full OrgEntityFormSheet
- [ ] Edit button appears for: Areas, Nuclei, Processes (via Company module)
- [ ] RLS tested: can edit only own tenant's records
- [ ] Tests passing: Display + Edit flow

#### Architecture Changes

**ProcessCockpit360Enhancement:**

```typescript
// Before: Only name, description, objective displayed
// After: Add tabs for details

<Tabs defaultValue="principal">
  <TabsTrigger value="principal">Principal</TabsTrigger>
  <TabsTrigger value="detalhes">Detalhes</TabsTrigger>  {/* ← NEW */}
  <TabsTrigger value="rotinas">Rotinas</TabsTrigger>
  <TabsTrigger value="sistemas">Sistemas</TabsTrigger>
</Tabs>

// New "Detalhes" tab displays:
// - Inputs (structured list)
// - Outputs (structured list)
// - Risks (list with severity/mitigation)
// - Impacts (list with area affected)
```

#### Display Patterns

```typescript
// Inputs/Outputs card
<InfoSection title="Entradas">
  {process.inputs.map(input => (
    <div>
      <p className="font-medium">{input.name}</p>
      {input.description && <p className="text-sm text-muted">{input.description}</p>}
    </div>
  ))}
</InfoSection>

// Risks card
<InfoSection title="Riscos">
  {process.risks.map(risk => (
    <Badge variant="destructive">{risk}</Badge>
  ))}
</InfoSection>
```

#### Dev Notes

- Use consistent `InfoSection` component (from shared)
- Risk/Impact badges with color coding (if applicable)
- Empty state handling (no inputs/outputs/risks)
- Edit button integrates with OrgEntityFormSheet (already supports inputs/outputs)
- Performance: lazy load details tab on first click (optional optimization)

#### Testing

- [ ] Unit: Inputs/outputs render correctly
- [ ] Unit: Risks/impacts display with correct styling
- [ ] Integration: Edit button opens form with pre-filled data
- [ ] Integration: Save changes and refresh display
- [ ] RLS: Non-tenant users cannot edit
- [ ] Regression: Existing functionality (rotinas, sistemas) unchanged

#### File List

- `src/components/organization/ProcessCockpit360.tsx` (MODIFIED — add details tab)
- `src/components/organization/shared.ts` (MODIFIED — if new components needed)
- `src/components/organization/__tests__/ProcessCockpit360.test.tsx` (MODIFIED)

---

## 🔄 Story Development Cycle

### Workflow per Story

1. **Story Created** → Status: Draft
2. **@po validates** → `*validate-story-draft` (10-point checklist)
3. **@dev implements** → `*develop story-X.X.X` (CodeRabbit + tests)
4. **@qa gates** → `*qa-gate` (7 quality checks)
5. **Status → Ready for Review** when all checks pass
6. **Deploy** via @devops push when grouped

### Checklist per Story

All stories must pass:
- ✅ Lint + Typecheck (0 errors)
- ✅ Tests passing (>90% coverage)
- ✅ CodeRabbit pre-commit review
- ✅ File List complete and accurate
- ✅ No breaking changes (or migrations handled)
- ✅ RLS policies validated
- ✅ Documentation updated

---

## 📊 Dependency Graph

```
Story 9.9.1 (DB Schema)
    ↓
Story 9.9.2 (UI Component)  ← Depends on 9.9.1 types
    ↓
Story 9.9.3 (Display Sync)  ← Depends on 9.9.1 + 9.9.2
```

**Parallel work possible:**
- 9.9.1 + 9.9.2 can start simultaneously (after types defined)
- 9.9.3 waits for 9.9.1 to merge (DB migration + types)

---

## 🎨 AI Context Engineering

### Role Definitions Enum (Story 9.9.2 output)

```typescript
// Extracted to: src/lib/organization/role-definitions.ts
export const ROLE_CATEGORIES = {
  management: ['diretor', 'gerente', 'coordenador'],
  specialist: ['especialista', 'analista_senior', 'analista_junior'],
  operational: ['operacional', 'administrativo', 'supervisor'],
  external: ['vendor_manager', 'procurement_lead', 'fornecedor'],
} as const;
```

### AI Prompt Injection (Story 9.9.2 output)

```typescript
// For AI agents working with org data
const roleContext = `
Available roles in the organization:
- Management: ${ROLE_CATEGORIES.management.join(', ')}
- Specialists: ${ROLE_CATEGORIES.specialist.join(', ')}
- Operational: ${ROLE_CATEGORIES.operational.join(', ')}
- External: ${ROLE_CATEGORIES.external.join(', ')}

When suggesting responsible parties, prefer from these categories.
`;
```

---

## 📋 Deployment & Rollback

### Deployment Order

1. **Deploy 9.9.1** (DB migration + type updates)
   - Run migration: `supabase db push`
   - Verify RLS policies
   - Test rollback

2. **Deploy 9.9.2** (UI component)
   - No DB changes
   - Safe to deploy independently
   - No rollback needed

3. **Deploy 9.9.3** (Display sync)
   - Depends on 9.9.1
   - Backward compatible (optional tab)

### Rollback Procedure

**If 9.9.1 fails in production:**
```sql
-- Rollback migration 065
DROP INDEX idx_org_suppliers_responsible_roles_gin;
DROP INDEX idx_org_services_responsible_roles_gin;
DROP INDEX idx_org_documents_responsible_roles_gin;
ALTER TABLE org_suppliers DROP COLUMN responsible_roles;
ALTER TABLE org_services DROP COLUMN responsible_roles;
ALTER TABLE org_documents DROP COLUMN responsible_roles;
```

---

## 📚 Documentation Updates (Post-Release)

After all stories complete, update:

- [ ] `docs/architecture/ORGANIZATION-SCHEMA.md` — Add role patterns
- [ ] `docs/guides/RESPONSIBLE-PARTY-MANAGEMENT.md` — NEW
- [ ] `docs/api/ORGANIZATION-ENTITIES.md` — Update types
- [ ] Storybook: `ResponsibleRolesInput` component story
- [ ] ADR: "Role Definition Patterns & Extensibility"

---

## 🏁 Sign-Off

**Epic Lead:** Orion (@aiox-master)
**Architecture Review:** Pending
**Product Review:** Pending
**QA Lead:** Quinn (@qa)

---

### Quick Links

- [EPIC-9-ADJUSTMENT-001](./epic-9-context-engineering-sync.md) — ✅ Company module edit button sync
- [Story 9.8](./epic-9-context-engineering-sync.md) — ✅ toAIContext() transformer (deployed v0.2.3)
- [EPIC INDEX](./EPIC-INDEX.md) — All epics and stories
