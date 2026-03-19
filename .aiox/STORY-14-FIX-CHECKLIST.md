# Story 14.1 — Quick Fix Checklist (AIOX 10/10)

**Status:** ⚠️ Needs Fixes | **Quality:** Code Review Complete | **Time:** ~2 hours to fix

---

## 🔴 CRITICAL ISSUES (Dark Mode Accessibility)

### Issue #1: Card Titles Invisible in Dark Mode
**File:** `src/components/project/ProjectKanbanCard.tsx:170`
**Severity:** CRITICAL (WCAG AA violation)
**Fix:**
```tsx
// BEFORE (❌ Almost invisible)
<h4 className="text-foreground/90 cursor-help text-sm font-semibold">

// AFTER (✅ Readable)
<h4 className="text-foreground cursor-help text-sm font-semibold dark:text-[hsl(0,0%,98%)]">
```

---

### Issue #2: Secondary Text (Responsible, Area) Unreadable
**File:** `src/components/project/ProjectKanbanCard.tsx:216`
**Severity:** CRITICAL (WCAG AA violation)
**Fix:**
```tsx
// BEFORE (❌ 1.3:1 contrast = FAIL)
className="text-foreground/85 leading-snug"

// AFTER (✅ Full contrast)
className="text-foreground dark:text-[hsl(0,0%,90%)] leading-snug"
```

---

### Issue #3: Alert Badges Invisible in Dark Mode
**File:** `src/components/project/ProjectKanbanCard.tsx:200`
**Severity:** CRITICAL (Priority/Status indicators hidden)
**Fix:**
```tsx
// BEFORE (❌ Ghost badge)
dark:bg-amber-900/30 dark:text-amber-300

// AFTER (✅ Visible badge)
dark:bg-amber-900/60 dark:text-amber-100
```

---

## 🟡 MEDIUM ISSUES (Visual Impact)

### Issue #4: Login Logo Isn't Orange
**File:** `src/app/login/page.tsx:61`
**User Impact:** "Logo laranja" requirement not met
**Fix:**
```tsx
// BEFORE (❌ White logo, no orange)
src="/logo-dark.png"

// AFTER (✅ Shows orange)
src="/logo-color.png"
```

---

### Issue #5: Pattern Too Subtle
**File:** `src/app/login/page.tsx:45`
**User Impact:** Pattern isn't visible (should be "sutil" not invisible)
**Fix:**
```tsx
// BEFORE (❌ 0.18 opacity = ghost)
opacity: 0.18

// AFTER (✅ Visible but subtle)
opacity: 0.32
```

---

### Issue #6: Form Panel Has No Brand Connection
**File:** `src/app/login/page.tsx:101`
**User Impact:** Right panel looks disconnected from hero panel
**Fix:**
```tsx
// BEFORE (❌ Plain white)
bg-white

// AFTER (✅ Subtle green tint + orange left border)
bg-gradient-to-b from-[hsl(164,85%,97%)] to-white
// + Add left border stripe
```

---

### Issue #7: Input Focus Uses Green Instead of Orange
**File:** `src/app/login/page.tsx:167`
**User Impact:** Input focus ring should match button (orange)
**Fix:**
```tsx
// BEFORE (❌ Green)
focus:border-[hsl(164,85%,15%)] focus:ring-[hsl(164,85%,15%)]/20

// AFTER (✅ Orange, matches button)
focus:border-[hsl(19,89%,54%)] focus:ring-[hsl(19,89%,54%)]/20
```

---

## 📋 Files to Modify

```
1. src/app/globals.css              [5 min]
   └─ Increase dark mode --foreground brightness

2. src/app/login/page.tsx           [25 min]
   ├─ Change logo from dark to color
   ├─ Increase pattern opacity
   ├─ Boost accent line (add shadow)
   ├─ Add green gradient to form panel
   ├─ Add orange left border
   └─ Change inputs focus from green to orange

3. src/components/project/ProjectKanbanCard.tsx  [20 min]
   ├─ Remove /90 opacity from title
   ├─ Remove /85 opacity from secondary text
   └─ Fix badge dark mode colors

4. All other card components       [30 min]
   └─ Apply same text opacity fixes
```

---

## ✨ Before → After Visual

### Dark Mode Text Contrast

```
BEFORE (❌ FAIL — 1.5:1 contrast)
┌─────────────────────┐
│ Card Title          │  ← Almost invisible white on dark gray
│ Secondary text here │  ← Ghost-like, unreadable
│ ⚠️ Alert Badge     │  ← Invisible warning badge
└─────────────────────┘

AFTER (✅ PASS — 4.5:1+ contrast)
┌─────────────────────┐
│ Card Title          │  ← Clear, bold white on dark gray
│ Secondary text here │  ← Light gray, fully readable
│ ⚠️ Alert Badge     │  ← Orange/amber, stands out
└─────────────────────┘
```

### Login Hero Panel

```
BEFORE (❌ Green only, white logo, subtle pattern)
┌──────────────────────────────┐
│ GREEN PANEL                  │
│ [WHITE LOGO — no orange!]    │  ← Problem!
│                              │
│ Portal de Gestão             │
│ [Corporativo - text only]    │  ← Where's the orange?
│                              │
│ Pattern = invisible (0.18)   │  ← Can't see it
└──────────────────────────────┘

AFTER (✅ Green + Orange, color logo, visible pattern)
┌──────────────────────────────┐
│ GREEN PANEL                  │
│ [COLOR LOGO: Green + Orange] │  ← Fixed!
│ [Visible pattern at 0.32]    │
│ ────────── Orange accent ──  │
│ Portal de Gestão             │
│ Corporativo (orange text)    │  ← Brand visible!
│                              │
│ © Brand tagline             │
└──────────────────────────────┘

[WHITE FORM] with:
- Orange left border stripe ✅
- Subtle green gradient bg ✅
- Orange input focus ring ✅
```

---

## 🚀 Implementation Priority

### Priority 1: WCAG AA Compliance (CRITICAL)
**These are accessibility violations:**
1. Dark mode foreground brightness → `globals.css`
2. Remove opacity from card titles → `ProjectKanbanCard.tsx`
3. Fix badge colors in dark mode → `ProjectKanbanCard.tsx`

**Time:** 30 min | **Impact:** Accessibility compliance ✅

### Priority 2: Visual Impact (MEDIUM)
**These improve "presentation impact":**
1. Logo color (orange visible) → `login/page.tsx`
2. Pattern visibility → `login/page.tsx`
3. Form branding (gradient + border) → `login/page.tsx`
4. Input focus ring color → `login/page.tsx`

**Time:** 40 min | **Impact:** "Alto impacto visual" ✅

### Priority 3: Polish (OPTIONAL but recommended)
1. Apply text fixes to ALL card components
2. Verify WCAG AA across entire app

**Time:** 30 min | **Impact:** Consistent quality across app ✅

---

## ✅ Verification Checklist

After fixes, verify:

- [ ] **Dark Mode Text:** All titles/text readable (use Chrome DevTools dark mode)
- [ ] **Login Logo:** Orange + Green colors visible in hero panel
- [ ] **Badge Visibility:** Priority badges stand out in dark mode
- [ ] **Form Focus:** Orange ring appears on input focus
- [ ] **Pattern:** Hero pattern visible (not ghost-like)
- [ ] **WCAG AA:** Run axe DevTools → no "Moderate" or "Serious" issues
- [ ] `npm run lint` passes
- [ ] `npm run typecheck` passes

---

## 📎 Full Details

See `.aiox/STORY-14-CODE-REVIEW-QUALITY-ASSESSMENT.md` for:
- Detailed root cause analysis
- Contrast ratio calculations (WCAG AA math)
- Why each fix works
- Testing procedures

---

**Status:** Ready for implementation by @dev
**Quality Bar:** AIOX 10/10 (after fixes)
**Estimated Time:** 1.5-2 hours total

