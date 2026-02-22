# S2-1: Sistema de Notificações — Alertas de Projetos Atrasados

**Epic:** epic-sprint2-uxui
**Story ID:** S2-1
**Status:** Draft
**Complexity:** 15/25 (MEDIUM)
**Story Points:** 13
**Effort:** 3 days
**Owner:** @frontend
**Priority:** P1 (high visibility)
**Business Value:** Users receive real-time alerts when projects are delayed or require attention

---

## User Story

Como gerente de projetos,
Quero receber notificações quando um projeto fica atrasado,
Para que eu possa tomar ações rápidas e manter o controle do portfolio.

---

## Acceptance Criteria

- [ ] AC-1: Bell icon visible in DashboardHeader (top-right navigation)
- [ ] AC-2: Notification badge shows count when > 0 (red dot with number)
- [ ] AC-3: Click bell → notification panel slides from right (200px width)
- [ ] AC-4: Panel shows list of active notifications with timestamp
- [ ] AC-5: Each notification shows: project name, alert type, time ago
- [ ] AC-6: Notification types: "Atrasado", "Risco", "Aprovação Pendente", "Entrega Vencida"
- [ ] AC-7: Click notification → navigate to project details (SplitView)
- [ ] AC-8: Mark as read → notification grays out in list (but stays visible)
- [ ] AC-9: Clear all → removes all notifications from list (via trash icon)
- [ ] AC-10: Dark mode support (colors follow design tokens)

---

## Scope

### IN
- Notification UI component (bell icon + panel)
- Notification list with 4 alert types
- Mark as read functionality
- Clear all notifications
- Routing to project details
- Dark mode support
- localStorage to persist read status

### OUT
- Email/Slack integration (S2-2)
- Notification preferences/settings
- Real-time WebSocket (Phase 2+)
- Notification history export
- Scheduled notifications

---

## Dependencies

- S1-1 (Dark Mode) ✅ DONE
- S1-2 (RLS Framework) ✅ DONE
- Design tokens in `tokens_brand.json` ✅ EXIST
- Project status data ✅ AVAILABLE

---

## Risks

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|-----------|
| Performance with large notification lists | MEDIUM | MEDIUM | Implement pagination (max 20 per page) |
| Notification logic complexity | MEDIUM | MEDIUM | Use Zustand store for state management |
| Dark mode accessibility | LOW | MEDIUM | Test WCAG AA contrast ratios |

---

## Definition of Done

- [ ] NotificationBell component created
- [ ] NotificationPanel component created
- [ ] Notification types defined (enum)
- [ ] localStorage persistence working
- [ ] Unit tests (>80% coverage)
- [ ] Integration tests for user flow
- [ ] Accessibility audit (WCAG AA)
- [ ] Dark mode verified
- [ ] Documentation updated (component API)
- [ ] Code review approved (PASS)

---

## File List

| File | Type | Status |
|------|------|--------|
| `src/components/notifications/NotificationBell.tsx` | Component | TBD |
| `src/components/notifications/NotificationPanel.tsx` | Component | TBD |
| `src/lib/notifications/types.ts` | Types | TBD |
| `src/lib/notifications/store.ts` | State (Zustand) | TBD |
| `src/hooks/useNotifications.ts` | Hook | TBD |
| `src/components/notifications/__tests__/NotificationBell.test.tsx` | Tests | TBD |
| `docs/components/Notifications.md` | Docs | TBD |

---

## Dev Notes

### Notification Types
```typescript
type AlertType = 'Atrasado' | 'Risco' | 'Aprovação Pendente' | 'Entrega Vencida';

interface Notification {
  id: string;
  projectId: UUID;
  projectName: string;
  alertType: AlertType;
  message: string;
  createdAt: Date;
  readAt?: Date;
}
```

### Zustand Store Structure
```typescript
export const useNotificationStore = create((set) => ({
  notifications: [],
  addNotification: (notification) => set(...),
  markAsRead: (id) => set(...),
  clearAll: () => set(...),
  unreadCount: () => { /* computed */ },
}));
```

### UI Layout
```
┌─────────────────────────────────────┐
│ Header                          🔔(2)│  ← Bell icon with badge
├─────────────────────────────────────┤
│ [Projects] [Dashboard] [Agentes]    │
└─────────────────────────────────────┘

                          ┌──────────────┐
                          │ Notificações │
                          ├──────────────┤
                          │ ⚠️ Project X │
                          │   atrasado   │
                          │   5 min ago  │
                          │              │
                          │ 🔴 Project Y │
                          │   risco alto │
                          │   1h ago     │
                          │              │
                          │ [Clear All]  │
                          └──────────────┘
```

### Implementation Path

**Phase 1: UI Components**
1. Create NotificationBell component
2. Create NotificationPanel (slides from right)
3. Style with design tokens

**Phase 2: State Management**
1. Create Zustand store
2. Add localStorage persistence
3. Implement mark-as-read

**Phase 3: Integration**
1. Wire to real notification data (mocked initially)
2. Add routing to project details
3. Test dark mode

**Phase 4: Testing & Polish**
1. Unit tests (80% coverage)
2. Integration tests
3. Accessibility audit
4. Code review

---

## Change Log

- **2026-02-22** | Created | Status: Draft | Sprint 2 Planning initiated

---

## Acceptance Criteria Checklist

```
FEATURE DEVELOPMENT:
- [ ] Bell icon visible in header
- [ ] Notification panel slides from right
- [ ] List shows notifications with types
- [ ] Mark as read works
- [ ] Clear all removes notifications
- [ ] Navigation to project works
- [ ] Dark mode applied

TESTING:
- [ ] Unit tests (>80%)
- [ ] Integration tests (user flow)
- [ ] Accessibility (WCAG AA)
- [ ] E2E tests (main scenarios)

DOCUMENTATION:
- [ ] Component props documented
- [ ] API documented
- [ ] Usage examples provided
- [ ] Design decisions documented

QUALITY:
- [ ] No console errors
- [ ] No TypeScript errors
- [ ] Linting passes
- [ ] Code review approved
```

---
