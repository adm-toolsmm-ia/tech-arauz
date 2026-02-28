import { describe, it, expect } from 'vitest';
import { computeProviderKpis } from '../lm-provider-rules';
import type { ProviderLike } from '../lm-provider-rules';

const providers: ProviderLike[] = [
  { is_active: true, is_system: true },
  { is_active: true, is_system: false },
  { is_active: false, is_system: false },
  { is_active: true, is_system: true },
];

describe('computeProviderKpis', () => {
  it('computes total, active, system counts', () => {
    const kpis = computeProviderKpis(providers);
    expect(kpis.total).toBe(4);
    expect(kpis.active).toBe(3);
    expect(kpis.system).toBe(2);
  });

  it('handles empty array', () => {
    const kpis = computeProviderKpis([]);
    expect(kpis.total).toBe(0);
    expect(kpis.active).toBe(0);
    expect(kpis.system).toBe(0);
  });
});
