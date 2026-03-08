/**
 * Filter Utilities
 * Common functions for filter application, persistence, and manipulation
 */

import {
  FilterState,
  FilterDefinition,
  ApplyFiltersOptions,
  ActiveFilterInfo,
} from './filter-types';

/**
 * Get nested property value from object using dot notation (e.g., 'project.titulo')
 */
function getNestedValue(obj: Record<string, any>, path: string): any {
  return path.split('.').reduce((current, key) => current?.[key], obj);
}

/**
 * Apply filters and search to a data array
 * Supports multiple filter values (AND logic within same filter, AND between filters)
 * Supports nested properties with dot notation (e.g., 'project.titulo')
 */
export function applyFilters<T extends Record<string, any>>(
  data: T[],
  filters: FilterState,
  options?: ApplyFiltersOptions,
): T[] {
  if (!data || data.length === 0) return [];

  const {
    search = '',
    searchFields = [],
    caseSensitive = false,
    matchMode = 'partial',
  } = options || {};

  return data.filter((item) => {
    // Apply text search
    if (search.trim()) {
      const searchLower = caseSensitive ? search : search.toLowerCase();
      const hasMatch = searchFields.some((field) => {
        const value = getNestedValue(item, field);
        if (!value) return false;

        const stringValue = String(value);
        const compareTo = caseSensitive ? stringValue : stringValue.toLowerCase();

        switch (matchMode) {
          case 'exact':
            return compareTo === searchLower;
          case 'fuzzy':
            return fuzzyMatch(compareTo, searchLower);
          case 'partial':
          default:
            return compareTo.includes(searchLower);
        }
      });

      if (!hasMatch) return false;
    }

    // Apply structured filters (AND logic)
    return Object.entries(filters).every(([filterId, filterValue]) => {
      if (!filterValue || (Array.isArray(filterValue) && filterValue.length === 0)) {
        return true; // No filter applied, include item
      }

      const itemValue = getNestedValue(item, filterId);
      if (itemValue === null || itemValue === undefined) {
        return false; // No value to compare
      }

      // Handle array filters (multi-select)
      if (Array.isArray(filterValue)) {
        return filterValue.includes(itemValue);
      }

      // Handle date range filters
      if (filterValue instanceof Object && 'start' in filterValue && 'end' in filterValue) {
        const itemDate = new Date(itemValue).getTime();
        const start = new Date(filterValue.start).getTime();
        const end = new Date(filterValue.end).getTime();
        return itemDate >= start && itemDate <= end;
      }

      // Handle exact match
      return itemValue === filterValue;
    });
  });
}

/**
 * Simple fuzzy matching algorithm
 */
function fuzzyMatch(text: string, pattern: string): boolean {
  let textIdx = 0;
  let patternIdx = 0;

  while (textIdx < text.length && patternIdx < pattern.length) {
    if (text[textIdx] === pattern[patternIdx]) {
      patternIdx++;
    }
    textIdx++;
  }

  return patternIdx === pattern.length;
}

/**
 * Get active filter information for display
 */
export function getActiveFilterInfo(
  filters: FilterState,
  definitions: FilterDefinition[],
): ActiveFilterInfo {
  const activeFilters = Object.entries(filters)
    .filter(([_, value]) => {
      if (!value) return false;
      if (Array.isArray(value)) return value.length > 0;
      return true;
    })
    .map(([filterId, value]) => {
      const def = definitions.find((d) => d.id === filterId);
      if (!def) return null;

      if (Array.isArray(value)) {
        const labels = value
          .map((v) => {
            const option = Array.isArray(def.options)
              ? def.options.find((o) => o.value === v)
              : undefined;
            return option?.label || String(v);
          })
          .join(', ');
        return `${def.label}: ${labels}`;
      }

      return `${def.label}: ${value}`;
    })
    .filter((item): item is string => item != null);

  return {
    count: activeFilters.length,
    summary: activeFilters.join(' | '),
  };
}

/**
 * Extract unique values from data for filter options
 * Useful for dynamic filter options based on actual data
 */
export function extractUniqueValues<T extends Record<string, any>>(
  data: T[],
  fieldName: string,
): Array<string | number | boolean> {
  const values = new Set<string | number | boolean>();

  data.forEach((item) => {
    const value = getNestedValue(item, fieldName);
    if (value !== null && value !== undefined) {
      values.add(value);
    }
  });

  return Array.from(values).sort((a, b) => {
    if (typeof a === 'string' && typeof b === 'string') {
      return a.localeCompare(b);
    }
    return 0;
  });
}

/**
 * Build filter options from data values
 */
export function buildFilterOptions<T extends Record<string, any>>(
  data: T[],
  fieldName: string,
  labelFn?: (value: any) => string,
): Array<{ value: any; label: string }> {
  return extractUniqueValues(data, fieldName).map((value) => ({
    value,
    label: labelFn ? labelFn(value) : String(value),
  }));
}

/**
 * Reset filters to default state
 */
export function resetFilters(definitions: FilterDefinition[]): FilterState {
  const reset: FilterState = {};

  definitions.forEach((def) => {
    if (def.defaultValue !== undefined) {
      reset[def.id] = def.defaultValue;
    } else {
      reset[def.id] = def.multi ? [] : null;
    }
  });

  return reset;
}

/**
 * Clear specific filters
 */
export function clearFilters(
  filters: FilterState,
  definitions: FilterDefinition[],
  filterIds?: string[],
): FilterState {
  const cleared = { ...filters };

  if (filterIds) {
    // Clear only specified filters
    filterIds.forEach((id) => {
      const def = definitions.find((d) => d.id === id);
      if (def) {
        cleared[id] = def.multi ? [] : null;
      }
    });
  } else {
    // Clear all filters
    definitions.forEach((def) => {
      cleared[def.id] = def.multi ? [] : null;
    });
  }

  return cleared;
}

/**
 * Persist filters to localStorage
 */
export function persistFilters(key: string, filters: FilterState): void {
  try {
    localStorage.setItem(key, JSON.stringify(filters));
  } catch {
    console.warn(`Failed to persist filters with key: ${key}`);
  }
}

/**
 * Restore filters from localStorage
 */
export function restoreFilters(key: string, definitions: FilterDefinition[]): FilterState {
  try {
    const stored = localStorage.getItem(key);
    if (!stored) return resetFilters(definitions);

    const parsed = JSON.parse(stored);
    const filters = typeof parsed === 'object' && parsed !== null ? (parsed as FilterState) : {};
    // Validate against definitions
    const validated: FilterState = {};

    definitions.forEach((def) => {
      if (def.id in filters) {
        validated[def.id] = filters[def.id];
      } else {
        validated[def.id] = def.defaultValue ?? (def.multi ? [] : null);
      }
    });

    return validated;
  } catch {
    console.warn(`Failed to restore filters from key: ${key}`);
    return resetFilters(definitions);
  }
}

/**
 * Merge filter changes (shallow merge)
 */
export function mergeFilters(current: FilterState, changes: Partial<FilterState>): FilterState {
  return { ...current, ...changes };
}

/**
 * Compare two filter states
 */
export function areFiltersEqual(f1: FilterState, f2: FilterState): boolean {
  return JSON.stringify(f1) === JSON.stringify(f2);
}

/**
 * Export filters to URL query string
 */
export function filtersToQuery(filters: FilterState): URLSearchParams {
  const params = new URLSearchParams();

  Object.entries(filters).forEach(([key, value]) => {
    if (!value) return;

    if (Array.isArray(value)) {
      value.forEach((v) => params.append(`filter_${key}`, String(v)));
    } else {
      params.set(`filter_${key}`, String(value));
    }
  });

  return params;
}

/**
 * Parse filters from URL query string
 */
export function queryToFilters(
  params: URLSearchParams,
  definitions: FilterDefinition[],
): FilterState {
  const filters: FilterState = {};

  definitions.forEach((def) => {
    const key = `filter_${def.id}`;
    const values = params.getAll(key);

    if (values.length === 0) {
      filters[def.id] = def.defaultValue ?? (def.multi ? [] : null);
    } else if (def.multi) {
      filters[def.id] = values;
    } else {
      filters[def.id] = values[0];
    }
  });

  return filters;
}

/**
 * Count active filters (non-empty, non-default)
 */
export function countActiveFilters(filters: FilterState, definitions: FilterDefinition[]): number {
  return Object.entries(filters).filter(([filterId, value]) => {
    const def = definitions.find((d) => d.id === filterId);
    if (!def) return false;

    if (!value) return false;
    if (Array.isArray(value)) return value.length > 0;

    // Check if different from default
    if (def.defaultValue !== undefined) {
      return value !== def.defaultValue;
    }

    return true;
  }).length;
}
