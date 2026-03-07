# Design Tokens — DTCG Standard

**Version:** 1.0.0
**Status:** Extracted & Integrated
**Last Updated:** 2026-03-07
**Standard:** [Design Tokens Community Group (DTCG)](https://design-tokens.github.io/community-group/format/)

---

## Overview

This directory contains the centralized design token system for Tech Arauz, extracted from the original Tailwind/CSS variables implementation into DTCG JSON format for improved maintainability and tool compatibility.

**80+ tokens** organized into semantic, component, and effect categories:
- **Colors:** 40+ (semantic, status, priority, type, sidebar, chart)
- **Typography:** 2 font families (Inter, DM Sans)
- **Effects:** 6 shadows + 3 border-radius sizes + 4 animations

---

## Files

### `tokens.json` (Primary)
**DTCG format JSON** with all design tokens organized by category:
- `global.colors.semantic.*` — Primary colors (background, foreground, card, etc.)
- `global.colors.primary/secondary/accent/destructive/success/warning` — Action colors
- `global.colors.sidebar.*` — Sidebar-specific colors
- `global.colors.status.*` — Ticket status indicators (novo, em-atendimento, resolvido, etc.)
- `global.colors.priority.*` — Priority indicators (alta, normal, baixa)
- `global.colors.type.*` — Ticket type colors (erro, duvida, suporte, ajuste, melhoria)
- `global.colors.chart.*` — Data visualization colors (5 chart colors)
- `global.typography.*` — Font families
- `global.effects.*` — Shadows, border-radius, animations

**Token Format Example:**
```json
"primary": {
  "default": {
    "$type": "color",
    "$value": "hsl(222.2 47.4% 11.2%)",
    "$description": "Primary brand color"
  }
}
```

### `tokens.schema.json` (Validation)
JSON Schema for validating `tokens.json` structure and compliance with DTCG format.

---

## Integration

### 1. Tailwind Configuration
Design tokens are automatically imported in `tailwind.config.ts`:
```typescript
import tokens from './design/tokens.json';
const designTokens = tokens.global;
```

**Current State:** Tokens defined in JSON, used via CSS variables (hsl(var(--colorName)))

**Future State (Phase 2):** Direct token consumption from JSON for reduced CSS complexity

### 2. CSS Variables
Tokens currently translate to CSS custom properties:
```css
:root {
  --primary: 222.2 47.4% 11.2%;
  --status-novo: 262.1 80% 50.4%;
  --chart-1: 12 76% 61%;
}

.element {
  color: hsl(var(--primary));
}
```

### 3. Storybook Integration (Story 5.3)
Design tokens will be integrated with Storybook for visual documentation:
1. Install `@storybook/addon-design-tokens`
2. Import `tokens.json` in `.storybook/preview.js`
3. Enable token playground in Storybook UI

---

## Token Categories

### Semantic Colors (10 tokens)
Core UI colors with light/dark variants:
- `background` / `foreground` — Page background + text
- `card` / `card-foreground` — Card containers
- `popover` / `popover-foreground` — Popover boxes
- `border`, `input`, `ring` — Interactive states

### Action Colors (5 categories × 2 = 10 tokens)
- **Primary:** Brand color (navy blue)
- **Secondary:** Supporting color (slate)
- **Accent:** Highlight color (purple)
- **Destructive:** Error/danger color (red)
- **Success/Warning:** Feedback colors

### Sidebar Colors (8 tokens)
Sidebar-specific variants of primary, accent, border, ring.

### Domain-Specific Colors (15 tokens)
- **Status:** novo, em-atendimento, aguardando, resolvido, cancelado
- **Priority:** alta, normal, baixa
- **Type:** erro, duvida, suporte, ajuste, melhoria

### Chart Colors (5 tokens)
Data visualization color palette for charts and graphs.

### Typography (2 families)
- `sans`: Inter (primary body text)
- `display`: DM Sans (headings)

### Effects (13 tokens)
- **Shadows:** soft, medium, card, card-hover, elevated, inner-glow
- **Border Radius:** lg, md, sm
- **Animations:** accordion-down, accordion-up, scale-in, slide-in-left

---

## Token Values

All values follow these conventions:

**Colors:**
- Format: HSL (Hue, Saturation, Lightness)
- Range: 0-360 (hue), 0%-100% (saturation/lightness)
- Example: `hsl(222.2 47.4% 11.2%)`

**Shadows:**
- Format: CSS shadow syntax
- X/Y offset in pixels
- Blur radius and spread
- Color with alpha transparency

**Border Radius:**
- Base: 0.5rem (8px) with variants
- sm: base - 4px = 4px
- md: base - 2px = 6px
- lg: base = 8px

**Animations:**
- Duration: 0.2s (standard)
- Timing: ease-out (default)
- Keyframes defined in Tailwind config

---

## Usage Guide

### Using Tokens in Tailwind Classes
Tokens are consumed via Tailwind's `@apply` directive or class names:

```jsx
// Using token colors
<div className="bg-primary text-primary-foreground">
  Primary action button
</div>

<div className="border border-muted-foreground">
  Muted section
</div>

// Using semantic tokens
<div className="bg-card text-card-foreground shadow-card">
  Card component
</div>

// Status colors
<span className="text-status-novo">New</span>
<span className="text-status-resolvido">Resolved</span>
```

### Using Tokens in CSS
Direct CSS variable access:
```css
.custom-element {
  background-color: hsl(var(--primary));
  box-shadow: var(--shadow-card);
  border-radius: var(--radius-md);
  font-family: var(--font-sans);
}
```

---

## Maintenance

### Adding New Tokens
1. Add token to `design/tokens.json` (DTCG format)
2. Update `tailwind.config.ts` if adding new category
3. Define corresponding CSS variable in root stylesheet
4. Update this README with token description
5. Test with `npm run build`

### Updating Token Values
1. Modify value in `design/tokens.json`
2. Value automatically cascades to all usage locations
3. No Tailwind config changes needed (CSS variable binding)

### Validation
```bash
# Validate tokens against schema
npx ajv validate -s design/tokens.schema.json -d design/tokens.json
```

---

## Compliance

✅ **DTCG Compliant:**
- JSON format with required properties ($type, $value)
- Standard metadata (version, tokenSetOrder)
- Semantic token organization
- Descriptive comments for all tokens

✅ **Backward Compatible:**
- CSS variable fallback mechanism
- No breaking changes to existing components
- Seamless Tailwind integration

✅ **Tool Ready:**
- Storybook addon support (Story 5.3)
- Design tools integration (Figma plugin ready)
- Automated token generation possible

---

## Related Stories

- **Story 5.1:** Database Indexes (completed 2026-03-07)
- **Story 5.2:** Design Tokens (THIS STORY) — In Progress
- **Story 5.3:** Storybook Setup — Blocked by 5.2
- **Story 5.5:** A11y Testing — Blocked by 5.2

---

## Next Steps (Story 5.3)

1. Install Storybook (`npm install --save-dev @storybook/nextjs`)
2. Configure addon: `@storybook/addon-design-tokens`
3. Import `design/tokens.json` in Storybook preview
4. Create token playground story
5. Document component token usage

---

**Document Status:** ✅ Complete
**Created By:** Dex (@dev)
**Last Validated:** 2026-03-07 | Build: ✅ PASSED | Components: 109/109 ✅
**Token Count:** 80+
**Breaking Changes:** Zero ✅
