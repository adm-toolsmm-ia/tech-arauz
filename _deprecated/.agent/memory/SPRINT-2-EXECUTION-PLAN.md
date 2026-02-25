# 🚀 SPRINT 2: PLANO DE EXECUÇÃO

**Período:** 2026-02-22 até 2026-03-XX (2 semanas)
**Status:** ⏳ IN PROGRESS
**Total Points:** 29 (3 stories)

---

## 📋 CRONOGRAMA

### Semana 1: S2-1 + S2-2 (Paralelo)
| Dia | S2-1 (Notificações) | S2-2 (UX Refinement) | Status |
|-----|-------------------|-------------------|--------|
| 2/22 (Seg) | Fase 1: UI Blueprint | Fase 1: Research | ⏳ |
| 2/23 | Fase 2: NotificationBell | Fase 2: GlobalSearch | ⏳ |
| 2/24 | Fase 3: NotificationPanel | Fase 3: AdvancedFilters | ⏳ |
| 2/25 | Fase 4: Zustand Store | Fase 4: Keyboard Nav | ⏳ |
| 2/26 | Fase 5: Tests + Polish | Fase 5: ARIA + Tests | ⏳ |

### Semana 2: S2-2 Final + S2-3
| Dia | S2-2 (Continued) | S2-3 (Performance) | Status |
|-----|-----------------|-----------------|--------|
| 2/27 | Screen Reader Testing | Fase 1: Lazy Loading | ⏳ |
| 2/28 | axe Audit + Fixes | Fase 2: Pagination | ⏳ |
| 3/1 | Deploy S2-2 | Fase 3: React Query Config | ⏳ |
| 3/2 | — | Fase 4: Code-Splitting | ⏳ |
| 3/3 | — | Fase 5: Lighthouse Audit | ⏳ |

---

## 🎯 S2-1: SISTEMA DE NOTIFICAÇÕES (13 pts)

**Owner:** @frontend
**Priority:** P1
**Effort:** 3 days

### Fase 1: UI Blueprint & Design ✅ PRÓXIMA
- [ ] Criar estrutura de pastas: `src/components/notifications/`
- [ ] Definir tipos em `src/lib/notifications/types.ts`
- [ ] Criar mock data para testes
- [ ] Wireframe no Figma (ou whiteboard)

### Fase 2: NotificationBell Component
- [ ] Criar `src/components/notifications/NotificationBell.tsx`
- [ ] Bell icon (lucide-react)
- [ ] Badge com contador (red dot)
- [ ] Click handler para abrir panel
- [ ] Dark mode styling

### Fase 3: NotificationPanel Component
- [ ] Criar `src/components/notifications/NotificationPanel.tsx`
- [ ] Slide-in animation (right 200px)
- [ ] Notification list com tipos:
  - Atrasado (red)
  - Risco (yellow)
  - Aprovação Pendente (blue)
  - Entrega Vencida (red)
- [ ] Each item: project name, alert type, timestamp
- [ ] Mark as read (grays out)
- [ ] Clear all button

### Fase 4: State Management (Zustand)
- [ ] Criar `src/lib/notifications/store.ts`
- [ ] Estado: notifications[], unreadCount
- [ ] Actions: addNotification, markAsRead, clearAll
- [ ] localStorage persistence
- [ ] Criar `src/hooks/useNotifications.ts` hook

### Fase 5: Integration & Testing
- [ ] Integrar NotificationBell em `DashboardHeader`
- [ ] Wire para dados reais (mock data for now)
- [ ] Click navigation → SplitView project details
- [ ] Criar `__tests__/NotificationBell.test.tsx` (>80% coverage)
- [ ] Dark mode verification
- [ ] Code review

---

## 🎯 S2-2: REFINAMENTOS UX + ACESSIBILIDADE (8 pts)

**Owner:** @frontend + @ux-design
**Priority:** P1
**Effort:** 2 days (main) + 1 day (accessibility audit)

### Fase 1: Research & Planning
- [ ] Review existing search/filters
- [ ] Identify WCAG AA gaps
- [ ] Create keyboard navigation map
- [ ] ARIA labels strategy

### Fase 2: GlobalSearch Component
- [ ] Criar `src/components/filters/GlobalSearch.tsx`
- [ ] Input com debounce (300ms)
- [ ] Real-time results (5 campos: name, code, objetivo, justificativa, mensagem)
- [ ] ARIA: role="searchbox", aria-label="Buscar projetos"
- [ ] Keyboard: Cmd+K / Ctrl+K focus

### Fase 3: AdvancedFilters Sheet
- [ ] Criar `src/components/filters/AdvancedFilters.tsx`
- [ ] Multi-select options:
  - Status
  - Priority
  - Owner
  - Date Range
  - Budget Range
- [ ] "Select All" / "Clear All" buttons
- [ ] Apply / Reset buttons

### Fase 4: Keyboard Navigation
- [ ] Tab through all elements
- [ ] Space/Enter toggles checkboxes
- [ ] Escape closes Sheet
- [ ] Focus management (trap in Sheet)
- [ ] Test with keyboard only

### Fase 5: ARIA + Screen Reader
- [ ] Add ARIA labels to all inputs
- [ ] Semantic HTML (labels, fieldset, legend)
- [ ] Form validation messages
- [ ] Live region for announcements
- [ ] Create `docs/accessibility/WCAG-CHECKLIST.md`

### Fase 6: Accessibility Audit
- [ ] Test with NVDA/JAWS (or browser built-in)
- [ ] axe DevTools scan
- [ ] Color contrast check (≥4.5:1)
- [ ] Focus indicators visible (3px min)
- [ ] Create audit report

---

## 🎯 S2-3: PERFORMANCE & OPTIMIZATION (8 pts)

**Owner:** @frontend + @data-engineer
**Priority:** P2
**Effort:** 2 days

### Fase 1: Lazy Loading
- [ ] Criar `src/components/common/ImageLazy.tsx`
- [ ] Intersection Observer API
- [ ] Fade-in animation
- [ ] Placeholder support
- [ ] Test with DevTools throttling

### Fase 2: Pagination
- [ ] Criar `src/hooks/usePagination.ts`
- [ ] 20 items per page (configurable)
- [ ] Prev/Next buttons
- [ ] Page indicator
- [ ] Server-side pagination integration

### Fase 3: React Query Caching
- [ ] Update `src/lib/react-query/queryClient.ts`
- [ ] Configure TTL: 5 minutes (staleTime)
- [ ] gcTime: 10 minutes
- [ ] Test cache invalidation

### Fase 4: Code-Splitting
- [ ] Dynamic imports for Dashboard
- [ ] Dynamic imports for Projects
- [ ] Dynamic imports for Agents
- [ ] Skeleton loaders on loading states
- [ ] Test bundle size

### Fase 5: Performance Audit
- [ ] Run Lighthouse (production mode)
- [ ] Target: Performance ≥ 80
- [ ] Measure:
  - LCP < 2.5s
  - FCP < 1.8s
  - CLS < 0.1
  - TTI < 3.8s
- [ ] Bundle size < 500KB (gzipped)
- [ ] Create `docs/performance/LIGHTHOUSE-GUIDE.md`

---

## 📊 DELIVERABLES

### S2-1 Notificações
```
src/components/notifications/
├── NotificationBell.tsx
├── NotificationPanel.tsx
├── index.ts
└── __tests__/
    └── NotificationBell.test.tsx

src/lib/notifications/
├── types.ts
└── store.ts

src/hooks/
└── useNotifications.ts

docs/components/
└── Notifications.md
```

### S2-2 UX Refinement
```
src/components/filters/
├── GlobalSearch.tsx
├── AdvancedFilters.tsx
└── __tests__/
    ├── GlobalSearch.test.tsx
    └── AdvancedFilters.test.tsx

src/hooks/
├── useSearch.ts
└── useFilters.ts

src/lib/filters/
└── filterLogic.ts

docs/accessibility/
└── WCAG-CHECKLIST.md
```

### S2-3 Performance
```
src/components/common/
├── ImageLazy.tsx
└── SkeletonLoader.tsx

src/hooks/
└── usePagination.ts

src/lib/
├── react-query/queryClient.ts (MODIFIED)
└── performance/metrics.ts

docs/performance/
└── LIGHTHOUSE-GUIDE.md
```

---

## ✅ DEFINITION OF DONE (All Stories)

- [ ] All files created/modified
- [ ] Code follows project patterns
- [ ] TypeScript: 0 errors
- [ ] ESLint: 0 warnings
- [ ] Tests: >80% coverage
- [ ] Dark mode: ✅ verified
- [ ] Accessibility: WCAG AA ✅
- [ ] Code review: APPROVED
- [ ] Commit: clean history
- [ ] Deploy: ✅ to Vercel

---

## 🔗 REFERENCE LINKS

- Story S2-1: `docs/stories/epic-sprint2-uxui/S2-1-notifications.md`
- Story S2-2: `docs/stories/epic-sprint2-uxui/S2-2-ux-refinements.md`
- Story S2-3: `docs/stories/epic-sprint2-uxui/S2-3-performance.md`
- Design tokens: `src/app/globals.css`
- Component patterns: `.context/03-specs/component-patterns.md`

---

**Data de Início:** 2026-02-22
**Versão:** 1.0
**Status:** ⏳ IN PROGRESS
