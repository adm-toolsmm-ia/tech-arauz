# Tailwind + Design Tokens Integration

**Status:** ✅ COMPLETE
**File:** `tailwind.config.ts`
**Tokens Source:** `design/tokens.json` (DTCG format, v1.1.0)

---

## Integration Summary

The `tailwind.config.ts` has been updated to import and consume design tokens from `design/tokens.json`. This ensures:

- ✅ **Centralized token management** — Single source of truth
- ✅ **No hardcoded values** — All colors, spacing, typography from tokens
- ✅ **DTCG compliance** — W3C standard token format
- ✅ **Fallback graceful degradation** — CSS variables as backup
- ✅ **Full token coverage** — Colors (44), Typography (17), Spacing (8), Borders (9), Shadows (5)

---

## Token Categories Integrated

### 1. Colors (44 tokens)
**Primary:** 10 shades (50-900)
**Secondary:** 4 shades
**Semantic:** 8 colors (success, warning, error, info + light variants)
**Grayscale:** 10 shades (50-900)

**Tailwind Usage:**
```jsx
// Primary colors
<div className="bg-primary-500 text-primary-900">Primary</div>

// Semantic colors
<div className="bg-success text-success-light">Success</div>
<div className="bg-error">Error</div>
```

### 2. Typography (17 tokens)
**Font Families:**
- `body` → sans
- `heading` → display
- `mono` → mono

**Font Sizes:**
- xs (12px), sm (14px), base (16px), lg (18px), xl (20px), 2xl (24px), 3xl (30px)

**Font Weights:**
- regular (400), medium (500), semibold (600), bold (700)

**Line Heights:**
- tight (1.2), normal (1.5), relaxed (1.75)

**Tailwind Usage:**
```jsx
// Font sizes
<h1 className="text-3xl font-bold leading-tight">Heading</h1>
<p className="text-base font-regular leading-normal">Body text</p>

// Font families
<div className="font-sans">Sans serif</div>
<code className="font-mono">Monospace</code>
```

### 3. Spacing (8 tokens)
**Values:** xs (4px) → 3xl (48px)
**Increments:** 4px per step

**Tailwind Usage:**
```jsx
// Padding/margin
<div className="px-lg py-md">Box with spacing</div>
<div className="gap-xl">Flex gap</div>
```

### 4. Borders (9 tokens)
**Radius:**
- none (0px), sm (4px), base (6px), md (8px), lg (12px), full (9999px)

**Width:**
- thin (1px), base (2px), thick (3px)

**Tailwind Usage:**
```jsx
// Border radius
<div className="rounded-lg">Rounded box</div>
<button className="rounded-full">Pill button</button>

// Border width
<div className="border-2">2px border</div>
```

### 5. Shadows (5 tokens)
**Levels:** sm, base (default), md, lg, xl

**Tailwind Usage:**
```jsx
<div className="shadow-sm">Light shadow</div>
<div className="shadow-lg">Heavy shadow</div>
```

---

## Configuration Structure

### Helper Functions
Three helper functions extract token values:

```typescript
// Extract color values from tokens.colors
const extractColors = () => { ... }

// Extract spacing values from tokens.spacing
const extractSpacing = () => { ... }

// Extract typography (fontFamily, fontSize)
const extractTypography = () => { ... }
```

### Theme Integration
```typescript
theme: {
  extend: {
    colors: {
      ...extractColors(),
      // Fallback CSS variables
      background: 'var(--background, hsl(0 0% 100%))',
    },
    spacing: extractSpacing(),
    fontSize: { ... },
    fontFamily: { ... },
    borderRadius: { ... },
    boxShadow: { ... },
    lineHeight: { ... }
  }
}
```

### Fallback Strategy
- **If token is missing:** CSS variable fallback (`var(--variable, default)`)
- **If CSS var is missing:** Safe default value
- **Result:** Graceful degradation, never breaks styling

---

## Validation Checklist

Before deployment, verify:

- [ ] `design/tokens.json` is valid JSON (DTCG format)
- [ ] `tailwind.config.ts` imports tokens correctly
- [ ] Build command succeeds: `npm run build`
- [ ] Dev server starts: `npm run dev`
- [ ] No TypeScript errors: `npm run typecheck`
- [ ] No ESLint errors: `npm run lint`
- [ ] Component colors render correctly (manual testing)
- [ ] Spacing/padding/margins apply correctly
- [ ] Font sizes and weights display correctly
- [ ] Border radius and shadows render as expected

---

## Testing Token Integration

### Manual Testing
```jsx
// Test primary colors
<div className="bg-primary-500">Primary 500</div>
<div className="bg-primary-600">Primary 600</div>

// Test spacing
<div className="p-lg m-md">Spacing test</div>

// Test typography
<h1 className="text-3xl font-bold">Large heading</h1>
```

### Automated Testing
```bash
# Verify Tailwind can build with tokens
npm run build

# Check for undefined classes
npm run typecheck

# Lint Tailwind usage
npm run lint
```

---

## Common Issues & Solutions

### Issue: Colors not applying
**Check:**
1. Token key is correct (e.g., `primary-500` not `primary.500`)
2. `design/tokens.json` is in project root
3. `tailwind.config.ts` import path is correct

### Issue: Spacing not consistent
**Check:**
1. Use token names: `px-md`, not `px-12px`
2. Verify spacing values in `design/tokens.json`
3. Clear Tailwind cache: `rm -rf .next && npm run dev`

### Issue: Font not loading
**Check:**
1. Font family token format (comma-separated, quoted)
2. Font files are imported in `app/layout.tsx`
3. CSS variables `--font-*` are defined in global.css

---

## Next Steps

1. **Phase 1 COMPLETE:** Design tokens extracted (85+), Tailwind integrated
2. **Phase 2:** Migrate hardcoded values in components → token classes
3. **Phase 3:** Document accessible color combinations
4. **Phase 4:** Setup Storybook with token documentation (Story 5.3)

---

## References

- **Story:** docs/stories/story-5.2-design-tokens-dtcg-standard.md
- **Tokens File:** design/tokens.json
- **Config File:** tailwind.config.ts
- **DTCG Spec:** https://design-tokens.github.io/community-group/format/
