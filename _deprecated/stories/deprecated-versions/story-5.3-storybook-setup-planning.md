# Story 5.3 — Storybook Setup & Component Documentation

**Status:** PLANNING PHASE
**Blocked By:** Story 5.2 (Design Tokens) — ✅ UNBLOCKED (85+ tokens complete)
**Related:** Story 5.2 (tokens), Story 5.1 (indexes)
**Effort:** 5-8 hours
**Owner:** Uma (@ux-design-expert)

---

## Planning Summary

With design tokens (Story 5.2) now complete, Story 5.3 can proceed to catalog all 109 components in Storybook using the centralized token system.

### Objectives
1. Install and configure Storybook with React/TypeScript
2. Create stories for 109 existing components
3. Document component usage with design tokens
4. Validate visual consistency across components
5. Setup Storybook build in CI/CD

### Success Criteria
- ✅ Storybook running on `npm run storybook`
- ✅ 109 components cataloged with stories
- ✅ Component props documented (TypeScript)
- ✅ Design tokens visible in Storybook (token documentation)
- ✅ Visual regression detection setup
- ✅ CI/CD integration (GitHub Pages publish)

---

## Implementation Plan

### Phase 1: Setup (1-2h)
```bash
# Install Storybook
npx storybook@latest init

# Configure for Next.js + TypeScript
# Update: .storybook/main.ts, .storybook/preview.ts
```

**Deliverables:**
- `.storybook/main.ts` — Storybook webpack/vite config
- `.storybook/preview.ts` — Global decorators, theme
- `package.json` — Add `storybook` script
- `.storybook/manager-head.html` — Custom styles

### Phase 2: Component Stories (3-4h)
Create story files for component categories:

```
src/stories/
├── atoms/                 # 20 base components
│  ├── Button.stories.tsx
│  ├── Input.stories.tsx
│  └── ...
├── molecules/             # 35 combinations
│  ├── FormField.stories.tsx
│  ├── Card.stories.tsx
│  └── ...
├── organisms/             # 30 complex components
│  ├── Modal.stories.tsx
│  ├── Table.stories.tsx
│  └── ...
├── templates/             # 15 layouts
│  ├── PageLayout.stories.tsx
│  └── ...
└── pages/                 # 9 full page examples
   ├── Dashboard.stories.tsx
   └── ...
```

**Story Template Pattern:**
```typescript
// src/stories/Button.stories.tsx
import { Meta, StoryObj } from '@storybook/react';
import { Button } from '@/components/ui/Button';

const meta: Meta<typeof Button> = {
  title: 'Atoms/Button',
  component: Button,
  tags: ['autodocs'],
  argTypes: {
    variant: { control: 'select', options: ['primary', 'secondary'] },
    size: { control: 'select', options: ['sm', 'md', 'lg'] },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: {
    variant: 'primary',
    children: 'Click me',
  },
};
```

**Coverage Target:** 109 components = ~1-1.5 min per story

### Phase 3: Token Documentation (1-2h)
Create token showcases in Storybook:

```typescript
// src/stories/DesignTokens.stories.tsx
export const Colors: Story = {
  render: () => (
    <div>
      {Object.entries(tokens.colors).map(([name, values]) => (
        <div key={name}>
          <h3>{name}</h3>
          {/* Display color swatches */}
        </div>
      ))}
    </div>
  ),
};

export const Spacing: Story = { /* ... */ };
export const Typography: Story = { /* ... */ };
```

### Phase 4: CI/CD Integration (1h)
- GitHub Actions workflow to build & deploy Storybook
- GitHub Pages publication
- Lighthouse CI for visual regression detection

**Workflow:** `.github/workflows/storybook-build.yml`

---

## Dependency: Design Tokens Integration

Story 5.3 requires:
- ✅ `design/tokens.json` (v1.1.0) — COMPLETE
- ✅ Tailwind integration — COMPLETE
- ✅ `docs/design/tokens.md` — TO CREATE

**Token Showcase:** Storybook should display all token categories with examples.

---

## QA & Validation

### Visual Regression Testing
```bash
npm run storybook:test  # Playwright visual tests
```

### Performance Targets
- Build time: < 2 min
- Bundle size: < 5MB (gzipped)
- Lighthouse score: > 90

### Accessibility
- WCAG AA minimum on all stories
- Color contrast validated
- Keyboard navigation tested

---

## File List (To Create)

```
.storybook/
├── main.ts              # Config
├── preview.ts           # Decorators/theme
├── manager-head.html    # Custom styles
└── fonts/               # Font files (DM Sans, etc)

src/stories/
├── Introduction.mdx
├── DesignTokens.stories.tsx
├── atoms/               # ~20 component stories
├── molecules/           # ~35 component stories
├── organisms/           # ~30 component stories
├── templates/           # ~15 component stories
└── pages/               # ~9 page examples

.github/workflows/
├── storybook-build.yml  # Build & deploy workflow
└── storybook-test.yml   # Visual regression testing

package.json
├── scripts.storybook
├── scripts.storybook:build
└── scripts.storybook:test
```

---

## Timeline & Milestones

| Phase | Duration | Milestone |
|-------|----------|-----------|
| Setup (Phase 1) | 1-2h | Storybook running |
| Component Stories (Phase 2) | 3-4h | 109 components cataloged |
| Token Documentation (Phase 3) | 1-2h | Token showcase complete |
| CI/CD Integration (Phase 4) | 1h | GitHub Pages deployed |
| **Total** | **6-9h** | **Ready for Production** |

---

## Known Blockers & Risks

### Blocker: Font Loading
**Risk:** DM Sans font not loading in Storybook
**Mitigation:** Pre-load fonts in `.storybook/preview-head.html`

### Blocker: Next.js-specific Components
**Risk:** Some components use Next.js-specific features (Image, Link)
**Mitigation:** Create Storybook-compatible wrappers or mock Next.js components

### Risk: Component Story Creation Time
**Risk:** 109 components × 1-2 min/story = 2-3 hours
**Mitigation:** Batch create initial stories, refine in Phase 2

---

## Success Metrics

- ✅ Storybook accessible at `npm run storybook`
- ✅ 109 components with visible stories
- ✅ All design tokens documented with examples
- ✅ CI/CD pipeline deploys Storybook to GitHub Pages
- ✅ Visual regression tests passing
- ✅ WCAG AA compliance validated

---

## Next Steps (After EOD 17:00 UTC)

1. **Day 2:** Begin Phase 1 (Storybook setup)
2. **Day 3-4:** Complete Phase 2 (Component stories bulk creation)
3. **Day 5:** Phase 3-4 (Token docs + CI/CD)
4. **Day 6:** QA validation & refinement
5. **Day 7:** Ready for production deployment

---

*Planning document for Story 5.3 — Created as part of EPIC 7-A execution (Checkpoint 3)*
*Unblocked by Story 5.2 (Design Tokens) completion at 13:00 UTC*
