/**
 * Tests for filter-utils
 * Coverage: applyFilters, resetFilters, clearFilters, persistFilters, restoreFilters,
 * countActiveFilters, getActiveFilterInfo, areFiltersEqual
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  applyFilters,
  resetFilters,
  clearFilters,
  persistFilters,
  restoreFilters,
  countActiveFilters,
  getActiveFilterInfo,
  areFiltersEqual,
} from '../filter-utils';
import { FilterDefinition, FilterState } from '../filter-types';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(global, 'localStorage', {
  value: localStorageMock,
});

describe('filter-utils', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('applyFilters', () => {
    const testData = [
      { id: 1, title: 'Project A', status: 'active', priority: 1 },
      { id: 2, title: 'Project B', status: 'inactive', priority: 2 },
      { id: 3, title: 'Project C', status: 'active', priority: 1 },
    ];

    it('should return all items when no filters applied', () => {
      const result = applyFilters(testData, {});
      expect(result).toHaveLength(3);
    });

    it('should filter by exact match', () => {
      const filters: FilterState = { status: 'active' };
      const result = applyFilters(testData, filters);
      expect(result).toHaveLength(2);
      expect(result.every((item) => item.status === 'active')).toBe(true);
    });

    it('should filter by multiple values (OR within same filter)', () => {
      const filters: FilterState = { status: ['active', 'inactive'] };
      const result = applyFilters(testData, filters);
      expect(result).toHaveLength(3);
    });

    it('should apply AND logic between different filters', () => {
      const filters: FilterState = { status: 'active', priority: 1 };
      const result = applyFilters(testData, filters);
      expect(result).toHaveLength(2);
      expect(result.every((item) => item.status === 'active' && item.priority === 1)).toBe(true);
    });

    it('should search with partial match by default', () => {
      const filters: FilterState = {};
      const result = applyFilters(testData, filters, {
        search: 'Project A',
        searchFields: ['title'],
      });
      expect(result).toHaveLength(1);
      expect(result[0].title).toBe('Project A');
    });

    it('should respect case sensitivity in search', () => {
      const filters: FilterState = {};
      const resultInsensitive = applyFilters(testData, filters, {
        search: 'project',
        searchFields: ['title'],
        caseSensitive: false,
      });
      const resultSensitive = applyFilters(testData, filters, {
        search: 'project',
        searchFields: ['title'],
        caseSensitive: true,
      });
      expect(resultInsensitive).toHaveLength(3);
      expect(resultSensitive).toHaveLength(0);
    });

    it('should return empty array for empty data', () => {
      const result = applyFilters([], {});
      expect(result).toHaveLength(0);
    });
  });

  describe('resetFilters', () => {
    it('should reset all filters to null/empty based on definitions', () => {
      const definitions: FilterDefinition[] = [
        { id: 'status', label: 'Status', type: 'select', options: [] },
        { id: 'priority', label: 'Priority', type: 'select', options: [], multi: true },
      ];
      const result = resetFilters(definitions);
      expect(result.status).toBe(null);
      expect(result.priority).toEqual([]);
    });

    it('should use defaultValue when provided', () => {
      const definitions: FilterDefinition[] = [
        { id: 'status', label: 'Status', type: 'select', options: [], defaultValue: 'active' },
      ];
      const result = resetFilters(definitions);
      expect(result.status).toBe('active');
    });
  });

  describe('clearFilters', () => {
    it('should clear specific filter', () => {
      const filters: FilterState = { status: 'active', priority: 1 };
      const definitions: FilterDefinition[] = [
        { id: 'status', label: 'Status', type: 'select', options: [] },
        { id: 'priority', label: 'Priority', type: 'select', options: [] },
      ];
      const result = clearFilters(filters, definitions, ['status']);
      expect(result.status).toBeNull();
      expect(result.priority).toBe(1);
    });

    it('should clear multiple filters', () => {
      const filters: FilterState = { status: 'active', priority: 1, title: 'test' };
      const definitions: FilterDefinition[] = [
        { id: 'status', label: 'Status', type: 'select', options: [] },
        { id: 'priority', label: 'Priority', type: 'select', options: [] },
        { id: 'title', label: 'Title', type: 'text', options: [] },
      ];
      const result = clearFilters(filters, definitions, ['status', 'priority']);
      expect(result.status).toBeNull();
      expect(result.priority).toBeNull();
      expect(result.title).toBe('test');
    });
  });

  describe('persistFilters', () => {
    it('should persist filters to localStorage', () => {
      const filters: FilterState = { status: 'active', priority: 1 };
      persistFilters('test-key', filters);
      const stored = localStorage.getItem('test-key');
      expect(stored).toBeTruthy();
      expect(JSON.parse(stored!)).toEqual(filters);
    });
  });

  describe('restoreFilters', () => {
    it('should restore filters from localStorage', () => {
      const original: FilterState = { status: 'active', priority: 1 };
      const definitions: FilterDefinition[] = [
        { id: 'status', label: 'Status', type: 'select', options: [] },
        { id: 'priority', label: 'Priority', type: 'select', options: [] },
      ];

      persistFilters('test-key', original);
      const restored = restoreFilters('test-key', definitions);
      expect(restored).toEqual(original);
    });

    it('should return filters with null values when no stored filters', () => {
      const definitions: FilterDefinition[] = [
        { id: 'status', label: 'Status', type: 'select', options: [] },
      ];
      const restored = restoreFilters('non-existent', definitions);
      // When no stored data, restoreFilters returns resetFilters() with defaults
      expect(restored.status).toBeNull();
    });

    it('should only restore filters that exist in definitions', () => {
      const stored: FilterState = {
        status: 'active',
        priority: 1,
      };
      const definitions: FilterDefinition[] = [
        { id: 'status', label: 'Status', type: 'select', options: [] },
        { id: 'priority', label: 'Priority', type: 'select', options: [] },
      ];

      persistFilters('test-key', stored);
      const restored = restoreFilters('test-key', definitions);
      expect(restored).toEqual({ status: 'active', priority: 1 });
    });
  });

  describe('countActiveFilters', () => {
    it('should count active filters', () => {
      const filters: FilterState = { status: 'active', priority: 1 };
      const definitions: FilterDefinition[] = [
        { id: 'status', label: 'Status', type: 'select', options: [] },
        { id: 'priority', label: 'Priority', type: 'select', options: [] },
      ];
      expect(countActiveFilters(filters, definitions)).toBe(2);
    });

    it('should not count empty arrays as active', () => {
      const filters: FilterState = { status: [], priority: 1 };
      const definitions: FilterDefinition[] = [
        { id: 'status', label: 'Status', type: 'select', options: [], multi: true },
        { id: 'priority', label: 'Priority', type: 'select', options: [] },
      ];
      expect(countActiveFilters(filters, definitions)).toBe(1);
    });

    it('should not count null/undefined as active', () => {
      const filters: FilterState = { status: null, priority: 1 };
      const definitions: FilterDefinition[] = [
        { id: 'status', label: 'Status', type: 'select', options: [] },
        { id: 'priority', label: 'Priority', type: 'select', options: [] },
      ];
      expect(countActiveFilters(filters, definitions)).toBe(1);
    });

    it('should return 0 for no active filters', () => {
      const definitions: FilterDefinition[] = [];
      expect(countActiveFilters({}, definitions)).toBe(0);
    });
  });

  describe('getActiveFilterInfo', () => {
    it('should return info about active filters', () => {
      const filters: FilterState = { status: 'active', priority: 1 };
      const definitions: FilterDefinition[] = [
        { id: 'status', label: 'Status', type: 'select', options: [] },
        { id: 'priority', label: 'Priority', type: 'select', options: [] },
      ];
      const result = getActiveFilterInfo(filters, definitions);
      expect(result.count).toBe(2);
    });

    it('should have empty array when no active filters', () => {
      const result = getActiveFilterInfo({}, []);
      expect(result.count).toBe(0);
    });
  });

  describe('areFiltersEqual', () => {
    it('should return true for identical filters', () => {
      const filters1: FilterState = { status: 'active', priority: 1 };
      const filters2: FilterState = { status: 'active', priority: 1 };
      expect(areFiltersEqual(filters1, filters2)).toBe(true);
    });

    it('should return false for different filters', () => {
      const filters1: FilterState = { status: 'active', priority: 1 };
      const filters2: FilterState = { status: 'active', priority: 2 };
      expect(areFiltersEqual(filters1, filters2)).toBe(false);
    });

    it('should return false when different keys', () => {
      const filters1: FilterState = { status: 'active' };
      const filters2: FilterState = { status: 'active', priority: 1 };
      expect(areFiltersEqual(filters1, filters2)).toBe(false);
    });

    it('should return true for empty filters', () => {
      expect(areFiltersEqual({}, {})).toBe(true);
    });
  });
});
