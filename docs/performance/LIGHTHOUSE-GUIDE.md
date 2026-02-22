# Lighthouse Performance Guide

**Last Updated:** 2026-02-22
**Target:** Lighthouse Performance Score ≥ 80

---

## 📊 Current Configuration

### React Query Caching
```typescript
// staleTime: 5 minutes (projects refresh every 5 mins)
// gcTime: 10 minutes (formerly cacheTime)
// refetchOnWindowFocus: disabled
```

### Code-Splitting Strategy
- Dashboard: Dynamic import
- Projects: Dynamic import
- Agents: Dynamic import
- Notifications: Already tree-shakeable

### Image Optimization
- ImageLazy component: Intersection Observer lazy loading
- Next.js Image component with optimization
- 50px margin before viewport entry

### Pagination
- Default: 20 items per page
- Reduces DOM nodes and rendering
- Improves Time to Interactive (TTI)

---

## 🎯 Performance Targets

| Metric | Target | Current | Status |
|--------|--------|---------|--------|
| **Lighthouse Performance** | ≥ 80 | TBD | ⏳ |
| **First Contentful Paint (FCP)** | < 1.8s | TBD | ⏳ |
| **Largest Contentful Paint (LCP)** | < 2.5s | TBD | ⏳ |
| **Cumulative Layout Shift (CLS)** | < 0.1 | TBD | ⏳ |
| **Time to Interactive (TTI)** | < 3.8s | TBD | ⏳ |
| **Bundle Size (gzipped)** | < 500KB | TBD | ⏳ |

---

## 🚀 How to Run Lighthouse Audit

### Option 1: DevTools (Fastest)
```
1. Open DevTools (F12)
2. Click "Lighthouse" tab
3. Select "Performance"
4. Click "Analyze page load"
```

### Option 2: Vercel Performance Insights
```
1. Go to Vercel dashboard
2. Select project
3. Click "Analytics"
4. View performance metrics
```

### Option 3: Google PageSpeed Insights
```
1. Visit https://pagespeed.web.dev/
2. Enter your URL
3. Click "Analyze"
4. Review performance report
```

---

## 📋 Pre-Audit Checklist

- [ ] Build is production optimized (`npm run build`)
- [ ] CSS is minified
- [ ] JavaScript is minified and code-split
- [ ] Images are optimized (lazy loading enabled)
- [ ] No console errors or warnings
- [ ] Fonts are system fonts or preloaded
- [ ] Unused CSS/JS removed

---

## 🔍 Common Performance Issues & Fixes

### Issue: High LCP (Largest Contentful Paint)
**Cause:** Large images, slow server response, render-blocking CSS/JS

**Fixes:**
1. Use `ImageLazy` component for below-fold images
2. Preload critical resources
3. Optimize server response time (TTFB)
4. Remove render-blocking CSS

```typescript
// ❌ Bad
<img src="/large-image.jpg" />

// ✅ Good
<ImageLazy src="/large-image.jpg" />
```

### Issue: High CLS (Cumulative Layout Shift)
**Cause:** Dynamic content loading, ads, missing dimensions

**Fixes:**
1. Reserve space for dynamic content
2. Use `width` and `height` on images
3. Add `containerSize` to dynamic elements
4. Use `Skeleton` components for loading

```typescript
// ❌ Bad - Will shift layout when image loads
<img src="/image.jpg" />

// ✅ Good - Space reserved
<ImageLazy src="/image.jpg" width={300} height={200} />
```

### Issue: Slow TTI (Time to Interactive)
**Cause:** Large JavaScript bundles, blocking scripts

**Fixes:**
1. Enable code-splitting (already done)
2. Defer non-critical JavaScript
3. Use dynamic imports for heavy components
4. Implement pagination to reduce DOM size

```typescript
// Dynamic import example
const Dashboard = dynamic(
  () => import('@/app/dashboard/page'),
  { loading: () => <Skeleton /> }
);
```

### Issue: Large Bundle Size
**Cause:** Unused dependencies, unoptimized imports

**Fixes:**
1. Use webpack-bundle-analyzer
2. Remove unused packages
3. Tree-shake imports properly
4. Lazy-load heavy libraries

```bash
# Analyze bundle
npm run analyze-bundle
```

---

## 🛠️ Performance Monitoring Hooks

### useWebVitals Hook (Dev-only)
```typescript
import { trackWebVitals } from '@/lib/performance/metrics';

useEffect(() => {
  trackWebVitals((metrics) => {
    console.log('Web Vitals:', metrics);
  });
}, []);
```

### measurePerformance Utility
```typescript
import { measurePerformance } from '@/lib/performance/metrics';

// Synchronous
const { result, duration } = measurePerformance('fetchData', () => {
  return expensiveOperation();
});

// Asynchronous
const { result, duration } = await measurePerformanceAsync('fetchData', async () => {
  return await fetch('/api/data');
});

console.log(`Operation took ${duration}ms`);
```

---

## 📈 Best Practices

### 1. Image Optimization
- ✅ Use `ImageLazy` for images below fold
- ✅ Set `width` and `height` props
- ✅ Use Next.js Image component
- ✅ Provide fallback/placeholder images

### 2. Code Splitting
- ✅ Use dynamic imports for heavy pages
- ✅ Provide loading states (Skeleton)
- ✅ Test bundle size regularly

### 3. Caching Strategy
- ✅ React Query: 5-minute stale time
- ✅ Static assets: Browser cache
- ✅ API routes: Cache-Control headers

### 4. Pagination
- ✅ Default 20 items per page
- ✅ Lazy-load more on scroll (future)
- ✅ Prevents DOM bloat

### 5. Monitoring
- ✅ Track Web Vitals in analytics
- ✅ Set up alerts for regressions
- ✅ Monitor real user metrics

---

## 🎯 Target Optimizations (Next Phase)

- [ ] Service Worker for offline support
- [ ] Image CDN optimization
- [ ] Database query optimization
- [ ] Redis caching for API responses
- [ ] Static generation for static pages

---

## 📞 Support

For performance issues or questions, open an issue with:
1. Lighthouse score
2. Affected page URL
3. Device/connection (desktop/mobile, 4G/5G)
4. Steps to reproduce

---

**Target Completion:** Score ≥ 80 before production
**Status:** ⏳ Pending Audit

