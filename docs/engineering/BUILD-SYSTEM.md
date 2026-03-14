# Build System — Next.js 14 Pipeline (AIOX 10/10)

**Version:** 0.2.3 (Production Live)
**Last Updated:** 2026-03-14
**Status:** Authoritative
**Build Tool:** Next.js 14 (esbuild)

---

## Build Pipeline

### Local Development Build

```bash
npm run dev
# → Starts Next.js dev server on http://localhost:3000
# → Hot reload enabled (changes visible immediately)
# → Source maps enabled (easy debugging)
# → Turbopack (fast compilation)
```

### Production Build

```bash
npm run build
# → Compiles Next.js app
# → Optimizes JavaScript (code splitting, minification)
# → Optimizes CSS (purging, minification)
# → Optimizes images (WebP conversion, lazy loading)
# → Output: .next/ directory
```

### Build Checklist

- [ ] TypeScript strict mode passes (`npm run typecheck`)
- [ ] ESLint zero errors (`npm run lint`)
- [ ] All tests pass (`npm run test`)
- [ ] No bundle bloat (< 500KB main JS)
- [ ] No missing environment variables
- [ ] No hardcoded secrets

### Build Time

**Current:** ~45 seconds (Vercel)
**Target:** < 60 seconds

---

## Optimization Strategies

### 1. Code Splitting

Next.js automatically splits code per route:
```
src/app/projetos/ → projects-chunk.js (~50KB)
src/app/dashboard/ → dashboard-chunk.js (~40KB)
src/components/ui/ → shared-ui-chunk.js (~80KB)
```

### 2. Image Optimization

```typescript
import Image from 'next/image';

// ✅ CORRECT: Optimized
<Image src="/projects.png" width={400} height={300} />

// ❌ WRONG: Not optimized
<img src="/projects.png" />
```

### 3. Dynamic Imports

```typescript
// Lazy-load heavy components
const HeavyChart = dynamic(() => import('@/components/charts/HeavyChart'), {
  loading: () => <ChartSkeleton />
});
```

---

## Asset Optimization

### CSS

- **Tailwind Purging:** Removes unused classes (40KB → 12KB)
- **PostCSS:** Autoprefixer, minification
- **Critical CSS:** Inline critical styles

### Images

- **WebP conversion:** Smaller file size
- **Lazy loading:** Load below-fold images on demand
- **Responsive images:** Serve different sizes per device

### JavaScript

- **Tree-shaking:** Remove dead code
- **Minification:** Compress variable names
- **Code splitting:** Load only needed chunks

---

## Environment Variables

```bash
# .env.local (local development)
NEXT_PUBLIC_SUPABASE_URL=https://...
NEXT_PUBLIC_SUPABASE_KEY=...
OPENROUTER_API_KEY=...

# .env.production (Vercel secrets)
SUPABASE_TOKEN=... (service role, never client-side)
DATABASE_URL=... (internal only)
```

---

## Production Build Gate

```bash
# Pre-production checklist
npm run typecheck
npm run lint
npm run test
npm run build

# All must pass before deployment
```

---

**Authored by:** Claude Code (Haiku 4.5)
**Framework:** Synkra AIOX v1.0.0
**Last Reviewed:** 2026-03-14
