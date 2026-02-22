# 🎯 SPRINT 2 VALIDATION - Filter Refactoring Plan (10/10 UX/UI)

**Status:** Planning
**Date:** 2026-02-22
**Objective:** Create standardized, reusable filter architecture for ALL modules

---

## 📊 CURRENT STATE ANALYSIS

### Projetos Module (projects-content.tsx)
- **Filters Used:** 10 dimensions (status, fase_atual, area, tipo_chamado, tipo_assunto, responsável, solicitante, prioridade, complexidade_tecnica, impacto_operacional)
- **Components:** ProjectFilters (custom), ViewToggle (Kanban/List), KPI Cards (8 interactive)
- **Architecture:** State management in projects-content.tsx
- **Search:** Via Sprint 2 components (GlobalSearch, AdvancedFilters, SearchAndFilterBar)
- **UX Issue:** ⚠️ Filters scattered across multiple locations, no clear information hierarchy

### Cronogramas Module (cronogramas-content.tsx)
- **Filters Used:** Date range, Status, Responsável, Setor, Projeto, Activity Type
- **Components:** Inline Popover/Select dropdowns (NO reuse of Sprint 2 components)
- **Architecture:** Self-contained filter logic
- **Search:** Manual input field
- **UX Issue:** ⚠️ Completely different from Projetos, not using standard components

### Sprint 2 Components (Not Fully Utilized)
- `GlobalSearch.tsx` - Search bar with Cmd+K (only in header, not all pages)
- `AdvancedFilters.tsx` - Multi-select filter sheet (not in cronogramas)
- `SearchAndFilterBar.tsx` - Combined component (not in use)
- **Usage:** Only partially integrated, missing from Cronogramas module

---

## 🚨 PROBLEMS IDENTIFIED

| Issue | Projetos | Cronogramas | Impact |
|-------|----------|-------------|--------|
| **Inconsistent UX** | Sprint 2 components | Inline Popover/Select | User confusion, no pattern |
| **No component reuse** | Separate state mgmt | Separate state mgmt | Code duplication |
| **Missing search integration** | Global + Advanced | Manual input only | Inconsistent discovery |
| **Different filter layouts** | Top bar + sidebar | Embedded | Not scalable |
| **Accessibility gaps** | Partial WCAG AA | Needs audit | Compliance risk |
| **Performance tracking** | Via metrics.ts | None | Missing data |

---

## ✅ REQUIREMENTS FOR 10/10 SOLUTION

### 1. Standardization (Same Pattern Everywhere)
```
Every module = [Header Bar] + [Filter Panel] + [View Toggle] + [Results]
```

### 2. Reusability (Shared Components)
- Base filter component system
- Plug-in filter types (select, multi-select, date range, checkbox)
- Context-specific filter definitions

### 3. Contextuality (Module-Specific Filters)
- **Projetos:** Status, Fase, Area, Type, Owner, Priority, Impact, Risk Level
- **Cronogramas:** Date Range, Status, Activity, Responsibility, Sector
- **Future modules:** Easy to add new filter sets

### 4. Information Hierarchy (Clear Priority)
```
Quick Filters (Most Common)
↓
Advanced Filters (Less Common)
↓
Search (Free Text)
↓
View Modes (How to display)
```

### 5. Accessibility (WCAG AA+)
- Semantic HTML (fieldset, legend, label)
- ARIA attributes (aria-label, aria-describedby)
- Keyboard navigation (Tab, Space, Enter, Escape)
- Focus management
- Screen reader support

---

## 🏗️ PROPOSED ARCHITECTURE

### Layer 1: Base Filter System (New)
```
src/components/filters/
├── FilterBar.tsx              # Main container (search + filters + views)
├── FilterSection.tsx          # Grouping for related filters
├── FilterControl.tsx          # Individual filter (Select/MultiSelect/Date/etc)
├── useFilterState.ts          # State management (global)
└── filter-registry.ts         # Module-specific filter definitions
```

### Layer 2: Filter Definitions (Module Config)
```
src/lib/filters/
├── filters-projetos.ts        # Project filter definitions (10 filters)
├── filters-cronogramas.ts     # Schedule filter definitions (6 filters)
└── filters-common.ts          # Shared filters (Search, ViewMode)
```

### Layer 3: Module Integration
```
src/app/projetos/
├── projects-content.tsx       # Uses FilterBar + FilterRegistry for projetos
└── use-projetos-filters.ts    # Module-specific hook

src/app/cronogramas/
├── cronogramas-content.tsx    # Uses FilterBar + FilterRegistry for cronogramas
└── use-cronogramas-filters.ts # Module-specific hook
```

### Layer 4: Utilities
```
src/lib/filters/
├── filter-utils.ts            # Apply, reset, export, import filters
└── filter-types.ts            # TypeScript types for all filters
```

---

## 📐 COMPONENT HIERARCHY

```
<FilterBar>
  <FilterSearch />           ← Search input + Cmd+K
  <FilterQuickSelect />       ← 3-5 most common filters (buttons/chips)
  <FilterSheet>              ← Advanced filter panel (modal)
    <FilterSection>
      <FilterControl type="select|multi|date|checkbox" />
      <FilterControl type="..." />
    </FilterSection>
    <FilterActions />         ← Apply, Reset, Clear buttons
  </FilterSheet>
  <FilterViewToggle />        ← Kanban/List/Calendar/Gantt modes
  <FilterBadge />             ← Shows "3 active filters"
</FilterBar>
```

---

## 🎯 FILTER DEFINITIONS

### PROJETOS Filters (Quick + Advanced)
**Quick Filters (Top):**
- Status: [Iniciado] [Em execução] [Concluído] [Cancelado]
- Priority: [Urgente] [Alta] [Média] [Baixa]
- Owner: [Top 5 users]

**Advanced Filters (Sheet):**
1. **Status:** Multi-select (Iniciado, Em execução, Concluído, Cancelado)
2. **Fase Atual:** Multi-select (custom values from DB)
3. **Area:** Multi-select
4. **Tipo Chamado:** Multi-select
5. **Responsável:** Multi-select
6. **Solicitante:** Multi-select
7. **Complexidade Técnica:** Multi-select (Baixa, Média, Alta, Crítica)
8. **Impacto Operacional:** Multi-select (Nenhum, Baixo, Médio, Alto)
9. **Date Range:** Start/End date pickers
10. **Importance Special:** Checkbox (Sim/Não)

**Search:** Free text across name, code, description

### CRONOGRAMAS Filters (Quick + Advanced)
**Quick Filters (Top):**
- View Mode: [Day] [Week] [Month] [Gantt]
- Status: [Planejado] [Em progresso] [Concluído] [Atrasado]
- Period: [This Week] [This Month] [Next 30 Days] [Custom]

**Advanced Filters (Sheet):**
1. **Date Range:** Start/End
2. **Status:** Multi-select (Planejado, Em progresso, Concluído, Atrasado)
3. **Activity:** Multi-select
4. **Responsável:** Multi-select
5. **Setor Responsável:** Multi-select
6. **Project:** Multi-select (for cross-project view)

**Search:** Free text across activity, description, responsável

---

## 🔄 State Management Pattern

```typescript
// useFilterState.ts (Global Context)
interface FilterState {
  moduleId: string;
  filters: Record<string, any>;
  search: string;
  viewMode: string;
  isOpen: boolean;
  activeCount: number;
}

// Per-module hook
const useProjetosFilters = () => {
  const { filters, setFilters } = useFilterState('projetos');
  const [search, setSearch] = useState('');

  const filteredProjects = useMemo(() => {
    return applyProjetosFilters(projects, filters, search);
  }, [projects, filters, search]);

  return { filters, setFilters, search, setSearch, filteredProjects };
};
```

---

## 📋 Implementation Steps (Phase 1)

### Phase 1A: Foundation (2-3 hours)
- [ ] Create FilterBar.tsx (main container)
- [ ] Create FilterControl.tsx (base control)
- [ ] Create useFilterState.ts (state management)
- [ ] Create filter-types.ts (TypeScript interfaces)

### Phase 1B: Projetos Integration (3-4 hours)
- [ ] Create filters-projetos.ts (filter definitions)
- [ ] Create use-projetos-filters.ts (module hook)
- [ ] Refactor projects-content.tsx to use FilterBar
- [ ] Test all 10 filters + search + views

### Phase 1C: Cronogramas Integration (2-3 hours)
- [ ] Create filters-cronogramas.ts (filter definitions)
- [ ] Create use-cronogramas-filters.ts (module hook)
- [ ] Refactor cronogramas-content.tsx to use FilterBar
- [ ] Test all 6 filters + search + views
- [ ] Integrate CronogramaGantt with new filter system

### Phase 1D: Polish & Testing (2-3 hours)
- [ ] WCAG AA accessibility audit
- [ ] Dark mode verification
- [ ] Mobile responsiveness (768px breakpoint)
- [ ] Performance testing (filter application latency)
- [ ] Documentation & integration guide

---

## 🎨 DESIGN PRINCIPLES

### 1. Information Hierarchy
- **Top:** Search bar (most common action)
- **Second:** Quick filter chips (1-5 most used)
- **Third:** Advanced filters button → Sheet modal
- **Fourth:** View toggle (Kanban/List/Calendar)

### 2. Visual Clarity
- Active filter badges with count
- Color-coded filter types (Status = blue, Date = orange)
- Clear section groups in advanced sheet
- Smooth transitions between states

### 3. Consistency
- Same layout for all modules
- Same color scheme (primary/secondary)
- Same keyboard shortcuts (Cmd+K, Escape)
- Same spacing/sizing across all filters

### 4. Performance
- Lazy render filter options (only visible items)
- Debounce search input (300ms)
- Memoize filtered results
- Cache applied filters in localStorage

---

## 🚀 EXPECTED OUTCOMES

### Before (Current State)
```
PROJETOS
├─ GlobalSearch (top right only)
├─ AdvancedFilters (not integrated)
├─ ProjectFilters (custom)
├─ ViewToggle (separate)
└─ KPI Cards (separate)

CRONOGRAMAS
├─ Manual input search
├─ Inline Popover filters
├─ View toggle (day/week/month/gantt)
└─ No advanced filter panel
```

### After (Standardized)
```
ALL MODULES (Same Pattern)
├─ FilterBar (Standard Container)
│  ├─ Search (Global + Cmd+K)
│  ├─ Quick Filters (Module-specific)
│  ├─ Advanced Filters (Sheet)
│  ├─ View Toggle
│  └─ Active Count Badge
└─ Results (Filtered + Sorted)
```

---

## 📊 SUCCESS METRICS

| Metric | Target | Current | Impact |
|--------|--------|---------|--------|
| **Filter Consistency** | 100% | 40% | User experience |
| **Component Reuse** | 80%+ | 10% | Maintainability |
| **WCAG AA Compliance** | 100% | 70% | Accessibility |
| **Performance (Filter)** | <100ms | ~200ms | User perception |
| **Code Duplication** | <5% | 50%+ | Tech debt reduction |

---

## 🔐 Backward Compatibility

- ✅ Existing ProjectFilters.tsx remains (migration optional)
- ✅ Existing search/filter state works (wrapper layer)
- ✅ No breaking changes to components API
- ✅ Gradual migration: Projetos → Cronogramas → Others

---

## 📝 NOTES FOR IMPLEMENTATION

1. **Do NOT remove existing components** - Wrap/enhance them first
2. **Test filter persistence** - localStorage save/restore between sessions
3. **Handle edge cases:**
   - Empty filter options (no results)
   - No selected filters (show all)
   - Conflicting filters (AND logic)
4. **Performance consideration:** Apply filters after user stops typing (300ms debounce)
5. **Accessibility:** Test with screen reader (NVDA/JAWS) and keyboard-only navigation

---

## 🎓 ARCHITECTURE BENEFITS

✅ **Scalability:** Add new modules by defining filter config + using FilterBar
✅ **Maintainability:** Single source of truth for filter logic
✅ **Consistency:** Same UX/UI across all modules
✅ **Extensibility:** Easy to add new filter types (range slider, tags, etc)
✅ **Performance:** Optimized filter application with memoization
✅ **Accessibility:** WCAG AA compliance by default
✅ **Developer Experience:** Clear APIs, good documentation

---

## 🚦 NEXT STEPS

1. **User Review:** Present this plan to Gabriel (Araúz)
2. **Approval:** Get sign-off on architecture + timeline
3. **Phase 1A:** Start with foundation components
4. **Phase 1B:** Integrate with Projetos
5. **Phase 1C:** Integrate with Cronogramas
6. **Phase 1D:** Polish and testing
7. **Deployment:** Push to Vercel with commit message

**Estimated Timeline:** 8-10 hours total (can split across 2 sessions if needed)

---

## 📞 QUESTIONS FOR GABRIEL

1. **Scope:** Should we also refactor Dashboard module (if it exists)?
2. **Timeline:** Is 8-10 hours acceptable, or prefer phased approach?
3. **Priority Filters:** Are the Quick Filters I proposed correct for each module?
4. **View Modes:** Should Cronogramas keep Day/Week/Month/Gantt or simplify?
5. **Persistence:** Save filter state to localStorage for next session?

---

**Plan Status:** ⏳ Awaiting Review
**Document Version:** 1.0
**Last Updated:** 2026-02-22
