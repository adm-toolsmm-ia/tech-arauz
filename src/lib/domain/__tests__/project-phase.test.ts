import { normalizePhaseSlug } from '@/lib/domain/project-phase';

describe('project phase domain rules', () => {
  it('normalizes phase names to slug format', () => {
    expect(normalizePhaseSlug('Execucao Homologacao')).toBe('execucao_homologacao');
    expect(normalizePhaseSlug('Validacao - Producao')).toBe('validacao_producao');
  });

  it('returns empty string for invalid or empty values', () => {
    expect(normalizePhaseSlug('')).toBe('');
    expect(normalizePhaseSlug(null)).toBe('');
    expect(normalizePhaseSlug(undefined)).toBe('');
  });
});
