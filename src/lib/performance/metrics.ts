/**
 * Performance Metrics Tracking
 * Tracks Web Vitals and performance metrics
 */

export interface WebVitals {
  CLS?: number;
  FCP?: number;
  FID?: number;
  INP?: number;
  LCP?: number;
  TTFB?: number;
}

let isMonitoring = false;

/**
 * Start monitoring Web Vitals
 */
export function trackWebVitals(callback?: (metrics: WebVitals) => void) {
  if (typeof window === 'undefined' || isMonitoring) return;

  isMonitoring = true;
  const metrics: WebVitals = {};

  try {
    const lcpObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const lastEntry = entries[entries.length - 1] as PerformanceEntry & {
        renderTime?: number;
        loadTime?: number;
      };
      if (lastEntry) {
        metrics.LCP = lastEntry.renderTime || lastEntry.loadTime;
        if (callback) callback(metrics);
      }
    });
    lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
  } catch (e) {
    // Silently fail
  }

  try {
    const clsObserver = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        const layoutEntry = entry as PerformanceEntry & {
          hadRecentInput?: boolean;
          value?: number;
        };
        if (!layoutEntry.hadRecentInput && layoutEntry.value !== undefined) {
          metrics.CLS = (metrics.CLS || 0) + layoutEntry.value;
          if (callback) callback(metrics);
        }
      }
    });
    clsObserver.observe({ type: 'layout-shift', buffered: true });
  } catch (e) {
    // Silently fail
  }
}

/**
 * Measure performance of a function
 */
export function measurePerformance<T>(name: string, fn: () => T): { result: T; duration: number } {
  const start = performance.now();
  const result = fn();
  const duration = performance.now() - start;

  if (process.env.NODE_ENV === 'development') {
    console.log(`⏱️  ${name}: ${duration.toFixed(2)}ms`);
  }

  return { result, duration };
}

/**
 * Async version of measurePerformance
 */
export async function measurePerformanceAsync<T>(
  name: string,
  fn: () => Promise<T>,
): Promise<{ result: T; duration: number }> {
  const start = performance.now();
  const result = await fn();
  const duration = performance.now() - start;

  if (process.env.NODE_ENV === 'development') {
    console.log(`⏱️  ${name}: ${duration.toFixed(2)}ms`);
  }

  return { result, duration };
}
