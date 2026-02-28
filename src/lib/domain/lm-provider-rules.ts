/**
 * LM Provider Domain Rules
 *
 * Pure functions for computing LM provider KPIs.
 * Extracted from lm-providers-content.tsx (Story 2.6).
 */

export interface ProviderLike {
  is_active?: boolean | null;
  is_system?: boolean | null;
}

export interface ProviderKpis {
  total: number;
  active: number;
  system: number;
}

export function computeProviderKpis(providers: ProviderLike[]): ProviderKpis {
  return {
    total: providers.length,
    active: providers.filter((p) => p.is_active).length,
    system: providers.filter((p) => p.is_system).length,
  };
}
