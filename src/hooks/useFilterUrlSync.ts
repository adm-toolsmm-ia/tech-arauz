'use client';

import { useEffect, useCallback } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import type { FilterState, FilterDefinition } from '@/lib/filters/filter-types';
import { filtersToQuery, queryToFilters } from '@/lib/filters/filter-utils';

/**
 * Hook to synchronize filter state with URL query parameters
 *
 * Features:
 * - Restore filters from URL on mount (priority over localStorage)
 * - Update URL when filters change (debounced)
 * - Support for back/forward browser navigation
 * - Shareable links with filters applied
 *
 * @param filters Current filter state
 * @param definitions Filter definitions for validation
 * @param onFiltersChange Callback to update parent component filters
 * @param options Configuration options
 */
export function useFilterUrlSync(
  filters: FilterState,
  definitions: FilterDefinition[],
  onFiltersChange: (filters: FilterState) => void,
  options?: { enabled?: boolean; debounceMs?: number }
) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { enabled = true, debounceMs = 500 } = options || {};

  // Restore filters from URL on mount
  useEffect(() => {
    if (!enabled) return;

    // Only run once on initial mount to restore from URL
    const filtersFromUrl = queryToFilters(searchParams, definitions);
    onFiltersChange(filtersFromUrl);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled]); // Only run once on mount

  // Update URL when filters change (debounced to avoid excessive updates)
  useEffect(() => {
    if (!enabled) return;

    const timer = setTimeout(() => {
      const params = filtersToQuery(filters);
      const queryString = params.toString();
      const newUrl = queryString ? `${pathname}?${queryString}` : pathname;

      router.replace(newUrl, { scroll: false });
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [filters, enabled, debounceMs, pathname, router]);
}
