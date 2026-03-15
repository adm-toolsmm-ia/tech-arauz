# Onboarding Components

Story 11.12: Organizational Setup Wizard

## Components

### OrgSetupWizard

Multi-step wizard component for initializing organization structure.

**Features:**
- 5-step form with progress tracking
- Form validation at each step
- Mobile responsive design
- Dark mode support
- WCAG AA accessibility compliant

**Props:**
- `onComplete?: (organizationId: string) => void` - Callback when wizard completes
- `className?: string` - Custom CSS class

**Usage:**
```tsx
<OrgSetupWizard onComplete={(id) => redirect('/organizacao')} />
```

### WizardProgressBar

Visual progress indicator showing current step and completion status.

**Features:**
- Progress percentage display
- Step labels
- Visual completion indicators (checkmarks)
- Mobile-friendly step indicators

**Props:**
- `steps: WizardStep[]` - Array of steps with completion status
- `currentStep: number` - Current step number (1-indexed)
- `className?: string` - Custom CSS class

**Usage:**
```tsx
<WizardProgressBar
  steps={steps}
  currentStep={3}
/>
```

### Step Components

#### BasicsStep

Organization basics form (Step 1).

**Collects:**
- Organization type (legal_office, consultancy, corporation, other)
- Organization name
- Industry
- Size
- Description

#### TemplatesStep

Template selection (Step 2).

**Features:**
- Radio button selection
- Template descriptions
- Process count display

#### StructureStep

Area and nucleus customization (Step 3).

**Features:**
- Add/remove areas
- Add/remove nuclei per area
- Edit area and nucleus names
- Collapsible area sections

#### RolesStep

Responsible roles assignment (Step 4).

**Features:**
- Uses ResponsibleRolesInput component (Story 11.6)
- Pre-configured role categories
- Tag-based selection

#### IntegrationStep

System integrations and final review (Step 5).

**Features:**
- Integration toggles
- Configuration summary
- Confirmation messaging

## Server Actions

Located in `/src/app/actions/bootstrap.ts`

### getBootstrapTemplatesAction

Retrieves template by organization type.

```tsx
const result = await getBootstrapTemplatesAction('legal_office');
// Returns: { success: true, data: BootstrapTemplate }
```

### listBootstrapTemplatesAction

Lists all available templates.

```tsx
const result = await listBootstrapTemplatesAction();
// Returns: { success: true, data: TemplateOverview[] }
```

### validateWizardStepAction

Validates data for specific wizard step.

```tsx
const result = await validateWizardStepAction(1, formData);
// Returns: { success: true, data: { valid: boolean, errors: string[] } }
```

### createOrgFromWizardAction

Creates organization structure from wizard data.

```tsx
const result = await createOrgFromWizardAction(wizardData);
// Returns: { success: true, data: { organization_id: string } }
```

## Bootstrap Templates

Located in `/src/lib/organization/bootstrap-templates.ts`

Pre-configured templates for different organization types:

- **legal_office**: Escritório Jurídico (10 areas, 30+ nuclei)
- **consultancy**: Consultoria (4 areas, 12 nuclei)
- **corporation**: Corporação (5 areas, 15+ nuclei)
- **other**: Customizable blank template

## Testing

### Unit Tests

Located in `/src/components/onboarding/__tests__/`

- `WizardProgressBar.test.tsx` - Progress bar functionality
- `BasicsStep.test.tsx` - Form input handling
- `StructureStep.test.tsx` - Area/nucleus management

### Accessibility Tests

- `OrgSetupWizard.a11y.test.tsx` - WCAG AA compliance

### Server Action Tests

Located in `/src/app/actions/__tests__/bootstrap.test.ts`

- Template retrieval
- Step validation
- Organization creation

### Coverage

Target: ≥90% for all components

## Storybook Stories

Located in `*.stories.tsx` files

**OrgSetupWizard stories:**
- Default
- DesktopView
- TabletView
- MobileView
- DarkMode
- AccessibilityCompliant

**WizardProgressBar stories:**
- Step1 through Step5
- AllCompleted
- DarkMode
- MobileResponsive
- Three/ManySteps variants

## Accessibility

### WCAG AA Compliance

- ✅ Proper heading hierarchy (H2)
- ✅ Semantic form elements with labels
- ✅ ARIA attributes (aria-expanded, aria-label, aria-controls)
- ✅ Keyboard navigation (Tab, Arrow Keys, Enter, Escape)
- ✅ Color contrast (4.5:1 minimum)
- ✅ Focus indicators
- ✅ Screen reader support

### Keyboard Navigation

- **Tab** - Move to next field
- **Shift+Tab** - Move to previous field
- **ArrowUp/Down** - Navigate dropdowns
- **Enter** - Select option / Submit
- **Escape** - Close dropdowns
- **Backspace** - Remove tags (ResponsibleRolesInput)

## Responsive Design

### Breakpoints

- **Mobile** - 320px+: Single column, stacked controls
- **Tablet** - 768px+: Two column layout
- **Desktop** - 1024px+: Full layout

### Mobile Features

- Touch-friendly button sizes (44px minimum)
- Proper spacing for mobile interaction
- Scrollable step indicators
- Bottom-fixed navigation buttons

## Dark Mode

All components support dark mode via CSS variables.

```css
.dark .component { /* dark mode styles */ }
```

## Performance

- Lazy loading of templates
- Debounced input handling
- Minimal re-renders (React.memo where appropriate)
- Server actions run on server (no client bundle bloat)

## Integration

The wizard is integrated at `/organizacao/setup` route.

```tsx
// Page: src/app/organizacao/setup/page.tsx
<OrgSetupWizard onComplete={handleComplete} />
```

After completion, redirects to `/organizacao` with `initialized=true` flag.

## Dependencies

- React 18+
- Next.js 14+ (App Router)
- Shadcn/ui components
- Tailwind CSS
- Lucide React (icons)
- Sonner (toast notifications)

## Future Enhancements

- [ ] Conditional steps based on organization type
- [ ] Drag-drop area/nucleus reordering
- [ ] Import from CSV/JSON
- [ ] Multi-language support
- [ ] Save draft feature
- [ ] Analytics tracking
