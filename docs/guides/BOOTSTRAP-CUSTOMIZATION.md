# BOOTSTRAP-CUSTOMIZATION.md

**Status:** ✅ COMPLETE (Phase 2 Content Generation — Story 11.14)

## Overview

Complete guide for using the Organizational Setup Wizard at `/organizacao/setup` to bootstrap and customize organizational structure based on templates or from scratch. The wizard implements Story 11.12 and uses `createOrgFromWizardAction()` server action.

## Table of Contents

- [Setup Wizard Walkthrough](#setup-wizard-walkthrough)
- [Template Structure](#template-structure)
- [Built-in Templates](#built-in-templates)
- [Customization Guide](#customization-guide)
- [Migration from Other Systems](#migration-from-other-systems)
- [Troubleshooting](#troubleshooting)

---

## Setup Wizard Walkthrough

The setup wizard is a 5-step process guided by `validateWizardStepAction()` for validation and `createOrgFromWizardAction()` for finalization.

### Step 1: Organization Type Selection

**UI Component:** `WizardOrgTypeSelector`

Choose your organization type to determine available templates and default roles:

| Type | Use Case | Default Roles | Available Templates |
|------|----------|----------------|----------------------|
| **Legal Office** | Law firms, legal departments | advogado, paralegal, gerente_area | Legal Office, Dispute Resolution, Contract Management |
| **Consultancy** | Consulting firms, agencies | consultant_senior, engagement_manager, partner | Management Consulting, IT Consulting, Implementation |
| **Corporation** | Large organizations, enterprises | department_head, manager, analyst | Operations, HR, Finance, IT |
| **Healthcare** | Hospitals, clinics, medical centers | doctor, nurse, admin | Patient Care, Administrative, Research |
| **Education** | Universities, schools | professor, coordinator, admin | Academic Programs, Student Services |
| **Non-Profit** | NGOs, associations | executive_director, program_manager | Program Management, Fundraising |

**Action:**
```typescript
const result = await validateWizardStepAction('step1', {
  organization_type: 'legal_office'
});

if (!result.success) {
  // Show error message
  showError(result.message);
} else {
  // Proceed to step 2
  goToStep(2);
}
```

### Step 2: Template Selection

**UI Component:** `WizardTemplateSelector`

Browse and select a pre-built template or choose blank slate:

```typescript
// Fetch available templates
const templates = await listBootstrapTemplatesAction();

// Templates include:
// - Preview of structure (# Areas, # Nuclei, # Processes)
// - Estimated setup time
// - Number of roles
// - Description and use case
```

**Options:**
- **Built-in Template:** Pre-configured structure (see Built-in Templates section)
- **Custom Template:** Upload JSON file with custom structure
- **Blank Slate:** Start completely empty (only organization created)

**Action:**
```typescript
const result = await validateWizardStepAction('step2', {
  template_id: 'legal-office-template' // or null for blank
});
```

### Step 3: Structure Customization

**UI Component:** `WizardStructureEditor`

Customize the selected template's structure:

```typescript
// Example: Customize Legal Office template
const structure = {
  areas: [
    {
      name: 'Recuperação de Crédito',
      description: 'Credit recovery processes',
      responsible_roles: ['gerente_area', 'diretor_juridico'],
      nuclei: [
        {
          name: 'Judicial Recovery',
          responsible_roles: ['advogado_senior'],
          processes: [
            {
              name: 'Initial Filing',
              responsible_roles: ['advogado', 'paralegal'],
              routines: [
                {
                  name: 'Prepare Documents',
                  activities: []  // Can be empty or pre-populated
                }
              ]
            }
          ]
        }
      ]
    }
  ]
};
```

**Actions Available:**
- Add/remove Areas
- Add/remove Nuclei within areas
- Add/remove Processes within nuclei
- Customize names and descriptions
- Update responsible_roles at each level
- Drag-and-drop reordering

**Validation:**
- At least 1 Area required
- Each Area must have at least 1 Nucleus
- Each Nucleus must have at least 1 Process
- Role names must match organization type

```typescript
const result = await validateWizardStepAction('step3', {
  structure: structure
});

if (!result.success) {
  showFieldError(result.fieldErrors);  // e.g., [{ field: 'areas[0].name', error: 'Required' }]
}
```

### Step 4: Roles Assignment

**UI Component:** `WizardRolesAssignment`

Define or customize the roles used throughout the organization:

```typescript
// Roles are organization-wide and can be assigned at any level
const roles = [
  {
    name: 'advogado',
    display_name: 'Lawyer',
    description: 'Legal professional',
    permissions: ['create_document', 'sign_document', 'manage_clients'],
    assignments: {
      areas: ['recuperacao-id'],
      nuclei: ['judicial-id'],
      processes: ['filing-id'],
      activities: ['legal-review-id']
    }
  },
  // ... more roles
];
```

**Options:**
- Use default roles from org type
- Add custom roles
- Remove unused roles
- Define permission mappings (for future RBAC implementation)
- Preview which entities use each role

```typescript
const result = await validateWizardStepAction('step4', {
  roles: roles
});

// Check role consistency
if (!result.success && result.fieldErrors) {
  result.fieldErrors.forEach(error => {
    if (error.field.includes('role_unused')) {
      showWarning(`Role "${error.role_name}" is not assigned to any entity`);
    }
  });
}
```

### Step 5: Review and Bootstrap

**UI Component:** `WizardReview`

Final review before creation:

```typescript
// Summary view shows:
// - Total entities to create
// - All areas, nuclei, processes, routines
// - Role assignments
// - Estimated timeline

const summary = {
  organization_name: 'Law Firm ABC',
  organization_type: 'legal_office',
  areas_count: 3,
  nuclei_count: 8,
  processes_count: 25,
  roles_count: 6,
  estimated_creation_time_ms: 2000
};

// User confirms and triggers bootstrap
const result = await createOrgFromWizardAction({
  organization_name: 'Law Firm ABC',
  structure: structure,
  roles: roles,
  metadata: {
    created_via: 'wizard',
    template_id: 'legal-office',
    wizard_duration_seconds: 180
  }
});

if (result.success) {
  // Redirect to organization dashboard
  router.push(`/organizacao/${result.data.organization_id}/areas`);
} else {
  showError(result.message);
  // Offer to retry or download structure for support
}
```

**Post-Bootstrap Verification:**
```typescript
// After successful creation, verify:
// 1. All areas created
// 2. Nuclei linked to correct areas
// 3. Processes linked to correct nuclei
// 4. Responsible roles assigned
// 5. Organization dashboard accessible

// Server performs automated checks
const verification = await verifyBootstrapResult(org_id);
if (!verification.passed) {
  console.error('Bootstrap verification failed:', verification.errors);
}
```

---

## Template Structure

### JSON Schema for Bootstrap Template

Templates use this structure for import/export:

```json
{
  "name": "Legal Office",
  "description": "Structure for law firms",
  "organization_type": "legal_office",
  "version": "1.0",
  "areas": [
    {
      "name": "Area Name",
      "description": "Area description",
      "objective": "What this area achieves",
      "responsible_roles": ["role1", "role2"],
      "nuclei": [
        {
          "name": "Nucleus Name",
          "description": "Nucleus description",
          "objective": "Nucleus objective",
          "responsible_roles": ["role1"],
          "processes": [
            {
              "name": "Process Name",
              "description": "Process description",
              "objective": "Process objective",
              "inputs": [
                { "name": "Input Name", "type": "document" }
              ],
              "outputs": [
                { "name": "Output Name", "type": "document" }
              ],
              "responsible_roles": ["role1"],
              "risks": ["Risk 1"],
              "impacts": ["Impact 1"],
              "routines": [
                {
                  "name": "Routine Name",
                  "description": "Routine description",
                  "objective": "Routine objective",
                  "responsible_roles": ["role1"],
                  "activities": []
                }
              ]
            }
          ]
        }
      ]
    }
  ],
  "roles": [
    {
      "name": "role_slug",
      "display_name": "Role Display Name",
      "description": "Role description"
    }
  ]
}
```

---

## Built-in Templates

### Legal Office Template

Perfect for law firms, legal departments, and legal consultancies.

**Structure:**
- **Areas:** Recuperação de Crédito, Contencioso, Consultoria
- **Nuclei:** Judicial, Extrajudicial, Preventive
- **Processes:** Initial Filing, Case Management, Settlement Negotiation
- **Roles:** advogado, paralegal, court_liaison, gerente_area, diretor_juridico

**Pre-configured Elements:**
- Document types: Contracts, Briefs, Motions, Court Filings
- Activity templates: Legal Review, Document Preparation, Client Interview
- SLAs: Standard (72h), Expedited (24h)

### Consultancy Template

Designed for consulting firms and agencies.

**Structure:**
- **Areas:** Management Consulting, Technology, Implementation
- **Nuclei:** Strategy, Operations, Technology
- **Processes:** Engagement Initiation, Discovery, Analysis, Recommendations
- **Roles:** consultant_junior, consultant_senior, engagement_manager, partner

**Pre-configured Elements:**
- Deliverables: Analysis Reports, Business Cases, Implementation Plans
- Activity templates: Stakeholder Interview, Data Analysis, Report Writing
- Quality gates: Quality review, Partner review

### Corporation Template

For large organizations and enterprises.

**Structure:**
- **Areas:** Operations, Finance, HR, IT
- **Nuclei:** By department and cost center
- **Processes:** Procurement, Hiring, IT Infrastructure, Financial Reporting
- **Roles:** department_head, manager, analyst, admin, specialist

**Pre-configured Elements:**
- Approval workflows: Manager, Director, CFO
- Compliance checkpoints: Audit, Compliance Review
- Metrics: Cost tracking, timeline tracking, quality scoring

---

## Customization Guide

### Post-Bootstrap Modifications

After initial setup, customize your organization:

**Adding New Areas:**
```typescript
const result = await createAreaAction({
  name: 'New Area Name',
  description: 'Area description',
  objective: 'What this area achieves',
  responsible_roles: ['role1', 'role2'],
  documentation: {}
});
```

**Adding Roles Mid-Setup:**
Update organization metadata to add new roles:
```typescript
const result = await updateTenantAction({
  metadata: {
    custom_roles: ['new_role_1', 'new_role_2']
  }
});

// Notify users of new roles available
```

**Bulk Modification After Bootstrap:**

Use import/export to quickly modify structure:
```typescript
// 1. Export current structure as JSON
const exported = await exportOrganizationAsCSVAction('json');

// 2. Edit JSON locally
const modified = editStructureLocally(exported);

// 3. Re-import to apply changes (overwrites or merges)
const result = await importOrganizationFromJSONAction(modified, {
  merge: true  // true = merge with existing, false = replace
});
```

### Renaming Strategy

When renaming organizational units:

```typescript
// WRONG: Direct rename causes cascade issues
await updateAreaAction(area_id, { name: 'New Name' });

// RIGHT: Update with full context
const area = await getArea(area_id);
const updatedArea = {
  ...area,
  name: 'New Name',
  updated_at: new Date()
};
await updateAreaAction(area_id, updatedArea);

// Invalidate cache
revalidatePath('/organizacao');
```

---

## Migration from Other Systems

### Data Import Guide

Migrating from Excel, other BPM tools, or legacy systems:

**Step 1: Prepare Your Data**

Export from source system into CSV format:
```csv
area_name,nucleus_name,process_name,routine_name,activity_name,responsible_role,description
Recuperação de Crédito,Judicial,Initial Filing,Prepare Documents,Interview Client,paralegal,Gather case information
Recuperação de Crédito,Judicial,Initial Filing,Prepare Documents,Research Debtor,analyst,Research debtor background
```

**Step 2: Convert to JSON**

Create bootstrap JSON structure:
```json
{
  "areas": [
    {
      "name": "Recuperação de Crédito",
      "nuclei": [
        {
          "name": "Judicial",
          "processes": [
            {
              "name": "Initial Filing",
              "routines": [
                {
                  "name": "Prepare Documents",
                  "activities": [
                    { "name": "Interview Client", "responsible_roles": ["paralegal"] },
                    { "name": "Research Debtor", "responsible_roles": ["analyst"] }
                  ]
                }
              ]
            }
          ]
        }
      ]
    }
  ]
}
```

**Step 3: Validate and Import**

```typescript
// 1. Validate structure
const validation = await validateWizardStepAction('step3', { structure: jsonData });

if (!validation.success) {
  console.error('Validation errors:', validation.fieldErrors);
  // Fix errors in JSON and retry
}

// 2. Import via wizard (manual)
// OR use direct action for bulk import
const result = await importOrganizationFromJSONAction(jsonData, {
  merge: false,  // Replace entire structure
  validate: true,
  dry_run: false
});
```

**Step 4: Verify Migration**

Check that all data imported correctly:
```typescript
// Query newly created structure
const areas = await getAreas();
assert(areas.length === expectedAreaCount, 'Area count mismatch');

const nuclei = await getNuclei();
assert(nuclei.length === expectedNucleusCount, 'Nucleus count mismatch');

// Spot check some entities
const activity = await getActivity('expected-activity-id');
assert(activity.responsible_roles.includes('paralegal'), 'Role not assigned');
```

---

## Troubleshooting

### Common Issues and Solutions

**Issue: "Cannot create organization - tenant initialization failed"**

```
Error: TenantInitializationError: Failed to create org_areas for tenant
```

**Solution:**
1. Check that user is authenticated (JWT token valid)
2. Verify database connections in server logs
3. Ensure organization_type is valid
4. Check tenant_id is correctly set in auth

**Issue: "Validation failed - roles not recognized"**

```
Error: ValidationError: Role 'custom_role' not recognized for org type 'legal_office'
```

**Solution:**
1. Verify role names match organization type defaults
2. Add custom roles via metadata before bootstrap
3. Check role name format (lowercase, underscore-separated)

**Issue: "Structure too deep - exceeds maximum hierarchy depth"**

```
Error: StructureDepthError: Hierarchy exceeds 5 levels (Organization → Area → Nucleus → Process → Routine → Activity)
```

**Solution:**
1. Flatten structure - merge some nuclei into single nucleus
2. Consolidate processes if possible
3. Split large processes into multiple smaller processes

**Issue: "Bootstrap timeout - creation took too long"**

```
Error: OperationTimeoutError: Bootstrap creation exceeded 60 second timeout
```

**Solution:**
1. Reduce structure size (fewer areas/nuclei/processes)
2. Run bootstrap during off-peak hours
3. Contact support if regularly timing out

---

**Related:** For bulk import/export, see `docs/stories/11.13-bulk-operations.story.md`
**Related:** For organization schema details, see `docs/architecture/ORGANIZATION-SCHEMA.md`
