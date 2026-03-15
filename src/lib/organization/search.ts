/**
 * Search algorithm and utilities for Organization module
 * Story 11.10: Advanced Search & Filter for Organizations
 *
 * Implements fuzzy matching, ranking algorithm, and faceted search
 */

export type EntityType =
  | 'area'
  | 'nucleus'
  | 'process'
  | 'routine'
  | 'activity'
  | 'system'
  | 'supplier'
  | 'service'
  | 'document';

export interface SearchResult {
  id: string;
  type: EntityType;
  name: string;
  breadcrumb: string;
  description?: string;
  icon?: string;
  score: number;
}

export interface SearchFilters {
  entityType?: EntityType | EntityType[];
  responsibleRoles?: string[];
  complexity?: string[];
  priority?: string[];
  areaId?: string;
  nucleusId?: string;
}

export interface FacetedSearchResult {
  results: SearchResult[];
  facets: {
    areas: Array<{ name: string; count: number }>;
    nuclei: Array<{ name: string; count: number }>;
    entityTypes: Array<{ type: EntityType; count: number }>;
  };
}

/**
 * Levenshtein distance for fuzzy matching
 * Returns edit distance between two strings
 */
function levenshteinDistance(a: string, b: string): number {
  const aLen = a.length;
  const bLen = b.length;
  const matrix: number[][] = Array(bLen + 1)
    .fill(null)
    .map(() => Array(aLen + 1).fill(0));

  for (let i = 0; i <= aLen; i++) matrix[0][i] = i;
  for (let j = 0; j <= bLen; j++) matrix[j][0] = j;

  for (let j = 1; j <= bLen; j++) {
    for (let i = 1; i <= aLen; i++) {
      const indicator = a[i - 1] === b[j - 1] ? 0 : 1;
      matrix[j][i] = Math.min(
        matrix[j][i - 1] + 1, // deletion
        matrix[j - 1][i] + 1, // insertion
        matrix[j - 1][i - 1] + indicator, // substitution
      );
    }
  }

  return matrix[bLen][aLen];
}

/**
 * Calculate similarity score between query and text (0-100)
 * Higher score = better match
 */
export function calculateSimilarity(query: string, text: string): number {
  const q = query.toLowerCase();
  const t = text.toLowerCase();

  // Exact match: 100 points
  if (t === q) return 100;

  // Prefix match: 80 points
  if (t.startsWith(q)) return 80;

  // Partial match anywhere: 60 points
  if (t.includes(q)) return 60;

  // Fuzzy match: calculate based on edit distance
  const distance = levenshteinDistance(q, t);
  const maxLen = Math.max(q.length, t.length);
  const similarity = Math.max(0, 100 - (distance / maxLen) * 100);

  return similarity > 40 ? similarity : 0; // Return 0 if very dissimilar
}

/**
 * Rank search result based on field match quality
 * Returns score 0-100 based on:
 * - Name exact match: 100
 * - Name prefix: 80
 * - Name fuzzy: 60
 * - Description/objective: 40
 * - Documentation: 20
 */
export function rankSearchMatch(
  query: string,
  name: string,
  description?: string | null,
  objective?: string | null,
  documentation?: string | null,
): number {
  const nameScore = calculateSimilarity(query, name);
  if (nameScore >= 100) return 100; // Exact match on name
  if (nameScore >= 80) return 85; // Prefix match on name
  if (nameScore >= 60) return 70; // Partial/fuzzy match on name

  // Check description
  const descScore = description ? calculateSimilarity(query, description) : 0;
  if (descScore >= 60) return 50; // Found in description

  // Check objective
  const objScore = objective ? calculateSimilarity(query, objective) : 0;
  if (objScore >= 60) return 40; // Found in objective

  // Check documentation
  const docScore = documentation ? calculateSimilarity(query, documentation) : 0;
  if (docScore >= 60) return 25; // Found in documentation

  return 0; // No match
}

/**
 * Apply filters to search results
 */
export function applyFilters(results: SearchResult[], filters: SearchFilters): SearchResult[] {
  return results.filter((result) => {
    // Filter by entity type
    if (filters.entityType) {
      const types = Array.isArray(filters.entityType) ? filters.entityType : [filters.entityType];
      if (!types.includes(result.type)) return false;
    }

    return true;
  });
}

/**
 * Paginate search results
 */
export function paginateResults(
  results: SearchResult[],
  page: number = 0,
  pageSize: number = 20,
): {
  results: SearchResult[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
} {
  const start = page * pageSize;
  const end = start + pageSize;

  return {
    results: results.slice(start, end),
    total: results.length,
    page,
    pageSize,
    hasMore: end < results.length,
  };
}

/**
 * Build faceted search results with counts
 */
export function buildFacets(results: SearchResult[]): FacetedSearchResult['facets'] {
  const areaMap = new Map<string, number>();
  const nucleusMap = new Map<string, number>();
  const typeMap = new Map<EntityType, number>();

  for (const result of results) {
    // Extract area from breadcrumb (format: "Area / Nucleus / Entity")
    const parts = result.breadcrumb.split(' / ');
    if (parts.length > 0) {
      const areaName = parts[0];
      areaMap.set(areaName, (areaMap.get(areaName) || 0) + 1);
    }

    // Extract nucleus if available
    if (parts.length > 1) {
      const nucleusName = parts[1];
      nucleusMap.set(nucleusName, (nucleusMap.get(nucleusName) || 0) + 1);
    }

    // Count entity types
    typeMap.set(result.type, (typeMap.get(result.type) || 0) + 1);
  }

  return {
    areas: Array.from(areaMap.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count),
    nuclei: Array.from(nucleusMap.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count),
    entityTypes: Array.from(typeMap.entries())
      .map(([type, count]) => ({ type, count }))
      .sort((a, b) => b.count - a.count),
  };
}

/**
 * Normalize query for search
 */
export function normalizeQuery(query: string): string {
  return query
    .trim()
    .toLowerCase()
    .replace(/[^\w\s]/g, '');
}
