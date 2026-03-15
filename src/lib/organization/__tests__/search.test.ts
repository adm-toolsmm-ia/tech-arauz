import { describe, it, expect } from 'vitest';
import {
  calculateSimilarity,
  rankSearchMatch,
  applyFilters,
  paginateResults,
  buildFacets,
  normalizeQuery,
  type SearchResult,
  type SearchFilters,
} from '../search';

describe('Organization Search - Ranking Algorithm', () => {
  describe('calculateSimilarity', () => {
    it('should return 100 for exact match', () => {
      const score = calculateSimilarity('process', 'process');
      expect(score).toBe(100);
    });

    it('should return 80 for prefix match', () => {
      const score = calculateSimilarity('proc', 'process');
      expect(score).toBe(80);
    });

    it('should return 60+ for partial match', () => {
      const score = calculateSimilarity('rocess', 'process');
      expect(score).toBeGreaterThanOrEqual(60);
    });

    it('should return 0 for very different strings', () => {
      const score = calculateSimilarity('xyz', 'abc');
      expect(score).toBe(0);
    });

    it('should be case-insensitive', () => {
      const score1 = calculateSimilarity('process', 'Process');
      const score2 = calculateSimilarity('PROCESS', 'process');
      expect(score1).toBe(100);
      expect(score2).toBe(100);
    });

    it('should handle fuzzy matching for typos', () => {
      const score = calculateSimilarity('porcess', 'process');
      expect(score).toBeGreaterThan(40); // Should still match with typo
    });
  });

  describe('rankSearchMatch', () => {
    it('should rank exact name match as 100', () => {
      const score = rankSearchMatch('Recuperação', 'Recuperação');
      expect(score).toBe(100);
    });

    it('should rank name prefix match as 85', () => {
      const score = rankSearchMatch('Recuper', 'Recuperação de Crédito');
      expect(score).toBe(85);
    });

    it('should rank partial name match as 70', () => {
      const score = rankSearchMatch('Crédito', 'Recuperação de Crédito');
      expect(score).toBeGreaterThanOrEqual(60);
    });

    it('should rank description match as 50', () => {
      const score = rankSearchMatch(
        'Gestão',
        'Recuperação',
        'Gestão de créditos'
      );
      expect(score).toBe(50);
    });

    it('should rank objective match as 40', () => {
      const score = rankSearchMatch(
        'Créditos',
        'Recuperação',
        'Descrição qualquer',
        'Recuperar créditos'
      );
      expect(score).toBe(40);
    });

    it('should return 0 for no match', () => {
      const score = rankSearchMatch(
        'Inexistente',
        'Recuperação',
        'Descrição',
        'Objetivo'
      );
      expect(score).toBe(0);
    });
  });

  describe('applyFilters', () => {
    const mockResults: SearchResult[] = [
      {
        id: '1',
        type: 'area',
        name: 'Área 1',
        breadcrumb: 'Área 1',
        score: 100,
      },
      {
        id: '2',
        type: 'process',
        name: 'Processo 1',
        breadcrumb: 'Área 1 / Processo 1',
        score: 90,
      },
      {
        id: '3',
        type: 'activity',
        name: 'Atividade 1',
        breadcrumb: 'Processo 1 / Atividade 1',
        score: 80,
      },
    ];

    it('should return all results when no filters applied', () => {
      const filtered = applyFilters(mockResults, {});
      expect(filtered).toHaveLength(3);
    });

    it('should filter by single entity type', () => {
      const filters: SearchFilters = { entityType: 'area' };
      const filtered = applyFilters(mockResults, filters);
      expect(filtered).toHaveLength(1);
      expect(filtered[0].type).toBe('area');
    });

    it('should filter by multiple entity types', () => {
      const filters: SearchFilters = { entityType: ['area', 'process'] };
      const filtered = applyFilters(mockResults, filters);
      expect(filtered).toHaveLength(2);
    });
  });

  describe('paginateResults', () => {
    const mockResults = Array.from({ length: 50 }, (_, i) => ({
      id: String(i),
      type: 'area' as const,
      name: `Item ${i}`,
      breadcrumb: `Item ${i}`,
      score: 100 - i,
    }));

    it('should paginate results correctly', () => {
      const page0 = paginateResults(mockResults, 0, 20);
      expect(page0.results).toHaveLength(20);
      expect(page0.page).toBe(0);
      expect(page0.total).toBe(50);
      expect(page0.hasMore).toBe(true);
    });

    it('should return second page correctly', () => {
      const page1 = paginateResults(mockResults, 1, 20);
      expect(page1.results).toHaveLength(20);
      expect(page1.page).toBe(1);
      expect(page1.hasMore).toBe(true);
    });

    it('should indicate no more results on last page', () => {
      const page2 = paginateResults(mockResults, 2, 20);
      expect(page2.results).toHaveLength(10);
      expect(page2.hasMore).toBe(false);
    });
  });

  describe('buildFacets', () => {
    const mockResults: SearchResult[] = [
      {
        id: '1',
        type: 'area',
        name: 'Área 1',
        breadcrumb: 'Área 1',
        score: 100,
      },
      {
        id: '2',
        type: 'nucleus',
        name: 'Núcleo 1',
        breadcrumb: 'Área 1 / Núcleo 1',
        score: 90,
      },
      {
        id: '3',
        type: 'process',
        name: 'Processo 1',
        breadcrumb: 'Área 1 / Processo 1',
        score: 80,
      },
    ];

    it('should build facets with correct counts', () => {
      const facets = buildFacets(mockResults);

      expect(facets.areas).toHaveLength(1);
      expect(facets.areas[0]).toEqual({ name: 'Área 1', count: 3 });

      expect(facets.entityTypes).toHaveLength(3);
      const typeMap = new Map(facets.entityTypes.map((t) => [t.type, t.count]));
      expect(typeMap.get('area')).toBe(1);
      expect(typeMap.get('nucleus')).toBe(1);
      expect(typeMap.get('process')).toBe(1);
    });

    it('should sort facets by count descending', () => {
      const extendedResults = [
        ...mockResults,
        {
          id: '4',
          type: 'area' as const,
          name: 'Área 2',
          breadcrumb: 'Área 2',
          score: 70,
        },
        {
          id: '5',
          type: 'area' as const,
          name: 'Área 2 / Item',
          breadcrumb: 'Área 2 / Item',
          score: 60,
        },
      ];

      const facets = buildFacets(extendedResults);
      expect(facets.areas[0].count).toBeGreaterThanOrEqual(
        facets.areas[1].count
      );
    });
  });

  describe('normalizeQuery', () => {
    it('should trim whitespace', () => {
      const normalized = normalizeQuery('  query  ');
      expect(normalized).toBe('query');
    });

    it('should convert to lowercase', () => {
      const normalized = normalizeQuery('QUERY');
      expect(normalized).toBe('query');
    });

    it('should remove special characters', () => {
      const normalized = normalizeQuery('query@#$%');
      expect(normalized).toBe('query');
    });

    it('should handle empty string', () => {
      const normalized = normalizeQuery('');
      expect(normalized).toBe('');
    });
  });
});
