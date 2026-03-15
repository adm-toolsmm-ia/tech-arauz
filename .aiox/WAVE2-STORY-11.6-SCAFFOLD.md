# Story 11.6: ResponsibleRolesInput Component
## Implementation Scaffold & Code Templates

**Story:** 11.6 Implement ResponsibleRolesInput Component (UI)
**Owner:** Uma (@ux-design-expert) + Dex (@dev)
**Effort:** 10-12 hours
**Priority:** HIGH
**Status:** 🟡 IMPLEMENTATION STARTED

---

## ✅ COMPLETED TASKS

### 1. Role Registry Updated ✅
**File:** `src/lib/organization/role-definitions.ts`

**Changes Made:**
- Updated from 16 roles (English) to 9 roles (Portuguese)
- Aligned with Migration 069 seed data
- Added category grouping: Management, Specialist, Operational, External
- Maintained backward compatibility with existing functions

**New ORGANIZATION_ROLES (9 roles):**
```typescript
export const ORGANIZATION_ROLES: RoleDefinition[] = [
  // Management (Gestão)
  { value: 'diretor', label: 'Diretor', description: 'Direção/Diretoria', category: 'management' },
  { value: 'gerente', label: 'Gerente', description: 'Gerência de área', category: 'management' },
  { value: 'coordenador', label: 'Coordenador', description: 'Coordenação de núcleo/processo', category: 'management' },

  // Specialist (Especialistas)
  { value: 'especialista', label: 'Especialista', description: 'Especialista técnico', category: 'specialist' },
  { value: 'analista_senior', label: 'Analista Sênior', description: 'Analista com senioridade', category: 'specialist' },
  { value: 'analista_junior', label: 'Analista Júnior', description: 'Analista em treinamento', category: 'specialist' },

  // Operational (Operacional)
  { value: 'operacional', label: 'Operacional', description: 'Executor operacional', category: 'operational' },
  { value: 'administrativo', label: 'Administrativo', description: 'Apoio administrativo', category: 'operational' },
  { value: 'supervisor', label: 'Supervisor', description: 'Supervisão operacional', category: 'operational' },
];
```

---

## 🔧 IMPLEMENTATION TEMPLATES

### ResponsibleRolesInput Component Code

**File:** `src/components/organization/ResponsibleRolesInput.tsx`

**Component Features:**
✅ Tag-based display of selected roles (Badge components)
✅ Text input with real-time filtering
✅ Autocomplete dropdown grouped by category
✅ Keyboard navigation:
  - Arrow Down/Up: navigate dropdown
  - Enter: select highlighted option
  - Backspace: remove last role
  - Escape: close dropdown
✅ No duplicates validation
✅ Max tags support (optional)
✅ WCAG AA accessibility:
  - ARIA labels and roles
  - Semantic HTML
  - Keyboard navigation support
  - Screen reader friendly

**Props Interface:**
```typescript
interface ResponsibleRolesInputProps {
  value: string[];              // Selected role values
  onChange: (roles: string[]) => void;
  availableRoles?: RoleDefinition[];
  placeholder?: string;
  disabled?: boolean;
  maxTags?: number;
  multiline?: boolean;          // For wrapping display
}
```

**Implementation Strategy:**
1. Use shadcn/ui components: Badge, Input
2. Lucide React for icons (X for remove)
3. useState for input, isOpen, highlightedIndex
4. useMemo for filtered and grouped roles
5. Keyboard event handling in handleKeyDown
6. Responsive CSS with Tailwind

**Estimated Code:** ~250 lines

---

### Acceptance Criteria Checklist

- [x] Role registry updated (9 roles, Portuguese)
- [ ] ResponsibleRolesInput component created
- [ ] Tag badges with visual hierarchy
- [ ] Input field with autocomplete dropdown
- [ ] Keyboard support (arrows, enter, backspace)
- [ ] Validation (no duplicates)
- [ ] Responsive mobile design
- [ ] WCAG AA accessibility (ARIA labels, keyboard nav)
- [ ] Integrated in ActivityFormSheet (Story 11.6 requirement)
- [ ] Unit tests created (tag add/remove, filtering, validation)
- [ ] Storybook story created
- [ ] CodeRabbit review passing

---

## 📝 NEXT STEPS

### Phase 1: Component Implementation (Day 1)
1. Create ResponsibleRolesInput.tsx from scaffold
2. Add to component barrel export (`src/components/organization/index.ts`)
3. Test basic functionality

### Phase 2: Integration (Day 2)
1. Integrate with ActivityFormSheet
2. Integrate with RoutineFormSheet
3. Add to Cockpit360 views

### Phase 3: Testing (Day 3)
1. Unit tests (tag operations, filtering)
2. Accessibility testing (screen reader, keyboard)
3. Mobile responsiveness testing

### Phase 4: Documentation (Day 4)
1. Storybook stories (basic, with preselected, disabled state)
2. Usage examples in comments
3. CodeRabbit review & fixes

---

## 📊 QUALITY GATES

**Unit Tests Required:**
- ✅ Add role (no duplicate, validates)
- ✅ Remove role (backspace, click X button)
- ✅ Autocomplete filters correctly
- ✅ Keyboard navigation (arrows, enter, escape)
- ✅ Max tags enforcement
- ✅ Disabled state

**Accessibility Tests:**
- ✅ Screen reader announces tags
- ✅ Keyboard navigation complete
- ✅ Focus indicators visible
- ✅ ARIA labels correct
- ✅ Contrast ratios meet WCAG AA

**Visual Tests:**
- ✅ Desktop layout
- ✅ Mobile layout (stacked tags)
- ✅ Dark mode support
- ✅ Responsive dropdown positioning

---

## 🚀 BLOCKERS & DEPENDENCIES

**Dependencies Met:**
- ✅ Story 11.1: responsible_roles column on org_activities (Migration 066 ✅)
- ✅ Story 10.2: ResponsibleRolesInput pattern established
- ✅ Role registry updated with 9 roles

**No Current Blockers**

---

## 📈 ESTIMATED COMPLETION

**Story 11.6 Timeline:**
- Day 1-2: Component + Integration (8h)
- Day 3: Testing (2h)
- Day 4: Documentation (2h)
- **Total:** 10-12h (within estimate)

**Gate Pass Criteria:**
- ✅ All acceptance criteria met
- ✅ >95% test coverage
- ✅ WCAG AA compliance verified
- ✅ CodeRabbit review: 0 critical/high issues
- ✅ Storybook stories complete

---

**Status:** 🟡 **READY FOR COMPONENT IMPLEMENTATION**

Next: Story 11.7 (Server Actions) begins after 11.6 integration complete.

