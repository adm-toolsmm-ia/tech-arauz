# S2-2: Refinamentos UX — Busca, Filtros Avançados & Acessibilidade

**Epic:** epic-sprint2-uxui
**Story ID:** S2-2
**Status:** Draft
**Complexity:** 12/25 (MEDIUM)
**Story Points:** 8
**Effort:** 2 days
**Owner:** @frontend + @ux-design
**Priority:** P1 (user experience)
**Business Value:** Faster project discovery, better accessibility, professional UX polish

---

## User Story

Como usuário do portal,
Quero encontrar projetos rapidamente com busca e filtros avançados,
E ter melhor acessibilidade (teclado, screen readers),
Para que a aplicação seja mais eficiente e inclusiva.

---

## Acceptance Criteria

- [ ] AC-1: Global search bar visible in DashboardHeader
- [ ] AC-2: Search works across: project name, status, owner, priority
- [ ] AC-3: Results show in real-time (debounced 300ms)
- [ ] AC-4: Advanced filters button opens Sheet with multi-select options
- [ ] AC-5: Filter options: Status, Priority, Owner, Date Range, Budget Range
- [ ] AC-6: Filters persist in localStorage (URL params preferred)
- [ ] AC-7: Keyboard navigation: Tab, Enter, Escape working properly
- [ ] AC-8: Screen reader support (ARIA labels on all interactive elements)
- [ ] AC-9: Focus indicators visible (outline or ring, min 3px width)
- [ ] AC-10: Color contrast: all text ≥ 4.5:1 (WCAG AA standard)
- [ ] AC-11: Form labels properly associated with inputs (for/id attributes)
- [ ] AC-12: Dark mode support for all new components

---

## Scope

### IN
- Global search component (integrated in header)
- Advanced filters panel (Sheet component)
- Multi-select filter logic
- Keyboard navigation accessibility
- ARIA labels and semantic HTML
- Screen reader announcements
- Color contrast verification
- Dark mode styling

### OUT
- Saved searches/favorites (Phase 2)
- Full-text search with ranking (Phase 2)
- Filter presets/templates (Phase 2)
- Search history (Phase 2)
- Mobile-optimized keyboard (future sprint)

---

## Dependencies

- S1-1 (Dark Mode) ✅ DONE
- shadcn/ui components ✅ AVAILABLE
- Design tokens ✅ EXIST
- Project data structure ✅ AVAILABLE

---

## Risks

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|-----------|
| Search performance with large dataset | MEDIUM | MEDIUM | Implement debouncing + memoization |
| Accessibility compliance gaps | MEDIUM | HIGH | Use axe DevTools for testing, WCAG checklist |
| Complex filter state management | MEDIUM | MEDIUM | Use URL params as source of truth |

---

## Definition of Done

- [ ] Global search component integrated in header
- [ ] Advanced filters Sheet implemented
- [ ] Filter state persists (localStorage + optional URL params)
- [ ] All interactive elements keyboard-accessible
- [ ] ARIA labels added to all components
- [ ] Screen reader tested (NVDA or JAWS)
- [ ] Contrast ratio verified (≥4.5:1)
- [ ] Focus indicators visible and clear
- [ ] Unit tests (>80% coverage)
- [ ] Accessibility audit passed (axe DevTools)
- [ ] Dark mode verified
- [ ] Code review approved

---

## File List

| File | Type | Status |
|------|------|--------|
| `src/components/filters/GlobalSearch.tsx` | Component | TBD |
| `src/components/filters/AdvancedFilters.tsx` | Component | TBD |
| `src/hooks/useSearch.ts` | Hook | TBD |
| `src/hooks/useFilters.ts` | Hook | TBD |
| `src/lib/filters/filterLogic.ts` | Utility | TBD |
| `src/components/filters/__tests__/GlobalSearch.test.tsx` | Tests | TBD |
| `src/components/filters/__tests__/AdvancedFilters.test.tsx` | Tests | TBD |
| `docs/accessibility/WCAG-CHECKLIST.md` | Docs | TBD |

---

## Dev Notes

### Global Search Component
```typescript
interface SearchProps {
  onSearch: (query: string) => void;
  placeholder?: string;
}

// Features:
// - Debounced input (300ms)
// - Real-time results
// - Keyboard shortcuts (Cmd+K or Ctrl+K)
// - ARIA labels: role="searchbox", aria-label="Buscar projetos"
// - Focus management
```

### Advanced Filters Sheet
```typescript
interface FilterState {
  status?: string[];
  priority?: string[];
  owner?: string[];
  dateRange?: [Date, Date];
  budgetRange?: [number, number];
}

// Multi-select with:
// - Checkboxes with proper labels
// - "Select All" / "Clear All" buttons
// - Apply / Reset buttons
// - ARIA live region for announcements
```

### Keyboard Navigation
```
Global Search:
  Cmd+K / Ctrl+K  →  Focus search input
  Escape          →  Clear search, blur
  Arrow Down      →  Next result
  Arrow Up        →  Previous result
  Enter           →  Select result

Advanced Filters:
  Tab             →  Move between filters
  Space/Enter     →  Toggle checkbox
  Escape          →  Close Sheet
```

### WCAG Compliance Checklist
```
✅ WCAG 2.1 Level AA Target

Perceivable:
  [ ] 1.4.3 Contrast (Minimum) — 4.5:1 for normal text
  [ ] 1.4.11 Non-text Contrast — 3:1 for UI components

Operable:
  [ ] 2.1.1 Keyboard — All functionality available via keyboard
  [ ] 2.1.3 Keyboard (No Exception) — No keyboard trap
  [ ] 2.4.3 Focus Order — Logical order
  [ ] 2.4.7 Focus Visible — Indicator clearly visible

Understandable:
  [ ] 3.2.4 Consistent Identification — Icons used consistently
  [ ] 3.3.1 Error Identification — Error messages clear

Robust:
  [ ] 4.1.2 Name, Role, Value — Complete for all UI components
  [ ] 4.1.3 Status Messages — ARIA live regions for announcements
```

### Implementation Path

**Phase 1: Global Search**
1. Create GlobalSearch component
2. Add debounced input logic
3. Style with design tokens
4. Add ARIA labels

**Phase 2: Advanced Filters**
1. Create AdvancedFilters Sheet
2. Implement filter state management (URL params)
3. Add multi-select logic
4. Style and test keyboard navigation

**Phase 3: Accessibility**
1. Add ARIA labels to all components
2. Implement keyboard shortcuts
3. Test with screen reader
4. Verify contrast ratios
5. Run axe DevTools audit

**Phase 4: Testing & Polish**
1. Unit tests (>80%)
2. Accessibility testing (manual + automated)
3. Dark mode verification
4. Code review

---

## Change Log

- **2026-02-22** | Created | Status: Draft | Sprint 2 Planning initiated

---

## Accessibility Testing Checklist

```
KEYBOARD NAVIGATION:
- [ ] Tab moves through all interactive elements
- [ ] Shift+Tab moves backwards
- [ ] Enter activates buttons/links
- [ ] Space toggles checkboxes
- [ ] Escape closes modals/sheets
- [ ] Arrow keys work in lists
- [ ] No keyboard traps

SCREEN READER (NVDA/JAWS):
- [ ] All buttons have accessible names
- [ ] Form labels associated with inputs
- [ ] List items announced with count
- [ ] Status messages announced (ARIA live)
- [ ] Headings properly nested (h1 → h2 → h3)
- [ ] Landmark regions used (nav, main, etc.)

COLOR & CONTRAST:
- [ ] Text on background: ≥4.5:1
- [ ] UI components: ≥3:1
- [ ] No information conveyed by color alone
- [ ] Works in high contrast mode

FOCUS INDICATORS:
- [ ] Visible outline on all interactive elements
- [ ] Minimum 3px width
- [ ] Sufficient contrast
- [ ] Not obscured by other elements
```

---
