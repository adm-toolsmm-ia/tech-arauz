/**
 * LM Model Domain Rules
 *
 * Pure functions for computing LM model KPIs.
 * Extracted from modelos-ia-content.tsx (Story 2.6).
 */

export interface ModelLike {
  provider_id?: string | null;
}

export interface ModelKpis {
  total: number;
  byProvider: number;
  uniqueProviders: number;
}

export function computeModelKpis(
  models: ModelLike[],
  selectedProviderIds: string[] = [],
): ModelKpis {
  return {
    total: models.length,
    byProvider:
      selectedProviderIds.length === 1
        ? models.filter((m) => m.provider_id === selectedProviderIds[0]).length
        : 0,
    uniqueProviders: new Set(models.map((m) => m.provider_id).filter(Boolean)).size,
  };
}
