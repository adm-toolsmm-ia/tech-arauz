export function normalizePhaseSlug(phase: string | null | undefined): string {
  if (!phase) return '';

  return phase
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
}
