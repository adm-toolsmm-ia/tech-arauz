import { describe, it, expect } from 'vitest';
import { computeModelKpis } from '../lm-model-rules';
import type { ModelLike } from '../lm-model-rules';

const models: ModelLike[] = [
  { provider_id: 'openai' },
  { provider_id: 'openai' },
  { provider_id: 'anthropic' },
  { provider_id: 'google' },
];

describe('computeModelKpis', () => {
  it('computes total and uniqueProviders', () => {
    const kpis = computeModelKpis(models);
    expect(kpis.total).toBe(4);
    expect(kpis.uniqueProviders).toBe(3);
    expect(kpis.byProvider).toBe(0); // no single provider selected
  });

  it('computes byProvider when single provider selected', () => {
    const kpis = computeModelKpis(models, ['openai']);
    expect(kpis.byProvider).toBe(2);
  });

  it('returns 0 for byProvider when multiple providers selected', () => {
    const kpis = computeModelKpis(models, ['openai', 'anthropic']);
    expect(kpis.byProvider).toBe(0);
  });

  it('handles empty array', () => {
    const kpis = computeModelKpis([]);
    expect(kpis.total).toBe(0);
    expect(kpis.uniqueProviders).toBe(0);
    expect(kpis.byProvider).toBe(0);
  });
});
