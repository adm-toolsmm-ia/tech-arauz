# S2-3: Performance & Optimization — Lazy Loading, Pagination & Caching

**Epic:** epic-sprint2-uxui
**Story ID:** S2-3
**Status:** Draft
**Complexity:** 11/25 (MEDIUM)
**Story Points:** 8
**Effort:** 2 days
**Owner:** @frontend + @data-engineer
**Priority:** P2 (optimization)
**Business Value:** Faster page loads, better mobile experience, reduced server load

---

## User Story

Como usuário do portal,
Quero que a aplicação carregue rapidamente,
E que a navegação seja suave mesmo com muitos projetos,
Para que eu tenha melhor experiência e produtividade.

---

## Acceptance Criteria

- [ ] AC-1: Initial page load time < 2s (85th percentile on 4G)
- [ ] AC-2: Project list lazy-loads images (intersection observer)
- [ ] AC-3: Pagination implemented: 20 projects per page (projects/kanban views)
- [ ] AC-4: React Query caching with 5-min TTL for projects
- [ ] AC-5: Debounced search (300ms) to reduce API calls
- [ ] AC-6: Code-splitting: lazy-load Dashboard, Projects, Agents modules
- [ ] AC-7: Bundle size < 500KB (gzipped main bundle)
- [ ] AC-8: Lighthouse score ≥ 80 (Performance metric)
- [ ] AC-9: Skeleton loaders on data-loading states
- [ ] AC-10: No layout shift (CLS < 0.1)
- [ ] AC-11: Dark mode doesn't impact performance
- [ ] AC-12: Works smoothly on mobile 4G connection

---

## Scope

### IN
- Lazy image loading (intersection observer)
- Pagination logic (server-side)
- React Query caching with TTL
- Search debouncing
- Code-splitting (dynamic imports)
- Bundle size optimization
- Skeleton loaders
- Lighthouse performance audit
- Mobile 4G testing

### OUT
- Service worker / offline mode (Phase 2)
- Image optimization/CDN (Phase 2)
- Database query optimization (separate ticket)
- API endpoint caching headers (backend task)
- Advanced performance monitoring (Phase 2+)

---

## Dependencies

- S1-1 (Dark Mode) ✅ DONE
- React Query setup ✅ EXIST
- TanStack Query hooks ✅ AVAILABLE
- Skeleton component from shadcn/ui ✅ AVAILABLE

---

## Risks

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|-----------|
| Bundle size ballooning | MEDIUM | MEDIUM | Use bundle analyzer, code-split aggressively |
| Pagination breaks UX | LOW | MEDIUM | Test with real data, gather user feedback |
| Cache invalidation issues | MEDIUM | MEDIUM | Implement proper TTL + manual invalidation |
| Layout shift from skeleton loaders | LOW | MEDIUM | Reserve space, use consistent sizing |

---

## Definition of Done

- [ ] Lazy loading implemented for images
- [ ] Pagination working in list and kanban views
- [ ] React Query caching configured (5-min TTL)
- [ ] Search debounced (300ms)
- [ ] Code-splitting working (dynamic imports)
- [ ] Bundle size analyzed and optimized
- [ ] Skeleton loaders visible on loading states
- [ ] Lighthouse score ≥ 80 (Performance)
- [ ] CLS < 0.1 (no layout shift)
- [ ] Mobile 4G tested and validated
- [ ] Performance metrics documented
- [ ] Code review approved

---

## File List

| File | Type | Status |
|------|------|--------|
| `src/components/common/ImageLazy.tsx` | Component | TBD |
| `src/components/common/SkeletonLoader.tsx` | Component | TBD |
| `src/hooks/usePagination.ts` | Hook | TBD |
| `src/lib/react-query/queryClient.ts` | Config | TBD (update) |
| `src/app/projects/projects-content.tsx` | Component | TBD (update) |
| `src/app/dashboard/page.tsx` | Page | TBD (update - code-split) |
| `src/lib/performance/metrics.ts` | Utility | TBD |
| `docs/performance/LIGHTHOUSE-GUIDE.md` | Docs | TBD |

---

## Dev Notes

### Lazy Image Loading
```typescript
// Using Intersection Observer API
interface ImageLazyProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  placeholder?: string;
}

export function ImageLazy({ src, alt, ...props }: ImageLazyProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        // Lazy load image
        if (imgRef.current) {
          imgRef.current.src = src;
          setIsLoaded(true);
        }
        observer.unobserve(entry.target);
      }
    });

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, [src]);

  return (
    <img
      ref={imgRef}
      alt={alt}
      className={cn('transition-opacity', isLoaded ? 'opacity-100' : 'opacity-0')}
      {...props}
    />
  );
}
```

### Pagination Hook
```typescript
interface UsePaginationProps {
  totalItems: number;
  itemsPerPage?: number;
}

export function usePagination({ totalItems, itemsPerPage = 20 }: UsePaginationProps) {
  const [page, setPage] = useState(1);

  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (page - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;

  return {
    page,
    setPage,
    totalPages,
    startIndex,
    endIndex,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1,
  };
}
```

### React Query Caching Configuration
```typescript
// lib/react-query/queryClient.ts
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
      retry: 2,
      refetchOnWindowFocus: false,
    },
  },
});
```

### Code-Splitting Example
```typescript
// Dynamic imports in app router
import dynamic from 'next/dynamic';

const Dashboard = dynamic(() => import('@/app/dashboard/page'), {
  loading: () => <Skeleton className="w-full h-screen" />,
  ssr: true,
});

const Projects = dynamic(() => import('@/app/projects/page'), {
  loading: () => <Skeleton className="w-full h-screen" />,
  ssr: true,
});
```

### Skeleton Loader
```typescript
// Component with skeleton state
export function ProjectCard({ project, isLoading }: Props) {
  if (isLoading) {
    return (
      <div className="space-y-3 p-4">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
        <Skeleton className="h-10 w-full" />
      </div>
    );
  }

  return (
    <Card>
      <CardContent className="p-4">
        <h3>{project.name}</h3>
        <p>{project.status}</p>
      </CardContent>
    </Card>
  );
}
```

### Performance Metrics Tracking
```typescript
// lib/performance/metrics.ts
export function trackWebVitals() {
  // Largest Contentful Paint (LCP)
  new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      console.log('LCP:', entry.renderTime || entry.loadTime);
    }
  }).observe({ entryTypes: ['largest-contentful-paint'] });

  // Cumulative Layout Shift (CLS)
  let clsValue = 0;
  new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      if (!entry.hadRecentInput) {
        clsValue += entry.value;
        console.log('CLS:', clsValue);
      }
    }
  }).observe({ type: 'layout-shift', buffered: true });

  // First Input Delay (FID)
  new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      console.log('FID:', entry.processingDuration);
    }
  }).observe({ entryTypes: ['first-input'] });
}
```

### Implementation Path

**Phase 1: Lazy Loading**
1. Create ImageLazy component
2. Integrate with ProjectCard/ProjectList
3. Test with network throttling

**Phase 2: Pagination**
1. Implement usePagination hook
2. Add pagination UI (prev/next buttons)
3. Server-side sorting/filtering integration

**Phase 3: React Query Caching**
1. Configure queryClient with TTL
2. Add cache invalidation triggers
3. Test cache behavior

**Phase 4: Code-Splitting**
1. Identify heavy modules (Dashboard, Projects, Agents)
2. Wrap with dynamic imports
3. Add loading states (skeleton loaders)
4. Test bundle size

**Phase 5: Performance Audit**
1. Run Lighthouse in production mode
2. Analyze bundle with webpack-bundle-analyzer
3. Optimize imports and dependencies
4. Test on 4G connection (throttle in DevTools)

---

## Change Log

- **2026-02-22** | Created | Status: Draft | Sprint 2 Planning initiated

---

## Performance Testing Checklist

```
LIGHTHOUSE AUDIT:
- [ ] Performance score ≥ 80
- [ ] First Contentful Paint (FCP) < 1.8s
- [ ] Largest Contentful Paint (LCP) < 2.5s
- [ ] Cumulative Layout Shift (CLS) < 0.1
- [ ] Time to Interactive (TTI) < 3.8s

BUNDLE SIZE:
- [ ] Main bundle < 500KB (gzipped)
- [ ] Code-split chunks < 200KB each
- [ ] Use webpack-bundle-analyzer to identify large deps

MOBILE 4G (DevTools Throttling):
- [ ] Page load < 2s (85th percentile)
- [ ] Interactive within 3s
- [ ] Smooth scrolling (60 FPS)
- [ ] No jank on interactions

REAL-WORLD TESTING:
- [ ] Test on actual 4G device
- [ ] Use SpeedCurve or similar for continuous monitoring
- [ ] Compare before/after metrics
```

---
