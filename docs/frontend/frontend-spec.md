# Frontend Specification - Tech Arauz

## Componentes (60+)

### Shadcn/UI (20+)
Button, Card, Badge, Tabs, Dialog, Sheet, Select, Input, etc.
All Radix UI based with dark mode support.

### Custom (40+)
- ProjectCockpit (6 tabs)
- KanbanBoard (@dnd-kit)
- ProjectListView (9 cols)
- KPICard
- Charts (Recharts)
- FilterBar
- CronogramaGantt
- LogViewer
- NotificationBell

## Design System

### Colors (Tailwind HSL)
- Primary, Secondary, Accent
- Destructive, Success, Warning
- Status (novo, em-atendimento, resolvido, cancelado)
- Chart (5 variants)

### Typography
- DM Sans - Headings (500, 600, 700)
- Inter - Body (400)

### Spacing
xs, sm, base, lg, xl

### Shadows
soft, medium, card, card-hover, elevated, inner-glow

### Animations
accordion, collapsible, scale-in, slide-in

## Rotas (10+)

```
/dashboard           → KPIs + Charts
/projetos            → Kanban/List/Split
/cronogramas         → Gantt
/integracoes         → LogViewer
/agentes             → Agents
/login               → Auth
```

## Responsividade

- mobile: 1 col
- sm: 2 cols
- lg: 3+ cols
- Mobile patterns: sidebar drawer, scroll tables, sheet modals

## Padrões

- ✅ Named exports
- ✅ Absolute imports (@/)
- ✅ cn() utility
- ✅ Typed interfaces
- ✅ 'use client'
- ✅ Server actions

## Acessibilidade (WCAG 2.1 AA)

### Implementado
- aria-hidden, role="dialog"
- Title attributes
- Keyboard navigation

### Gaps
- SplitView sem focus trap
- Kanban sem ARIA completa
- Charts sem alt text

## Performance

### OK
- React Query staleTime 60s
- Image lazy loading
- Skeleton loaders

### Gaps
- Code splitting
- Bundle analysis
- Lighthouse CI/CD

## Débitos

| Impacto | Débito | Solução |
|---------|--------|---------|
| Alto | ProjectListView type: any | Refatorar |
| Alto | Duplicação formatRelativeDate | Consolidar |
| Alto | LogViewer sem FilterBar | Integrar |
| Alto | Mobile ProjectListView | Card view |
| Médio | Styling inconsistencies | Documentar spacing |
| Médio | Accessibility gaps | Focus trap + ARIA |

## Métricas

- Componentes: 60+
- Páginas: 10
- Design tokens: 50+
- Dark mode: 100%
- Mobile: Responsive
- A11y: WCAG 2.1 AA

## Strengths ✅

- Design system robusto
- Dark mode completo
- Componentes reutilizáveis
- Responsivo
- Charts interativos

## Areas de Melhoria ⚠️

- Duplicação código
- Type safety
- Mobile responsividade
- Accessibility
- Styling consistency
