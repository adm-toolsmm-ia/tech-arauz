/**
 * Shared mapper helpers for all entities
 * @see Story 15.9 - Split Mappers Per Entity
 */

/**
 * Extract field value by identifier from ListaCampos
 */
export function getCampoValor(
  campos: Array<{ Identificador: string; Valor: string | null }>,
  identificador: string,
): string {
  const campo = campos.find((c) => c.Identificador === identificador);
  return campo?.Valor ?? '';
}

/**
 * Parse Brazilian date format: DD/MM/YYYY or DD/MM/YYYY HH:MM:SS
 */
export function parseData(valor: string | null | undefined): Date | null {
  if (!valor) return null;

  try {
    // Handle ISO format
    if (valor.includes('T')) return new Date(valor);

    // Handle Brazilian format: DD/MM/YYYY or DD/MM/YYYY HH:MM:SS
    const parts = valor.split(' ');
    const datePart = parts[0];
    const [day, month, year] = datePart.split('/').map(Number);

    if (!day || !month || !year) return null;
    return new Date(year, month - 1, day);
  } catch {
    return null;
  }
}

/**
 * Parse Brazilian currency format: "4.033,94" → 4033.94
 */
export function parseCurrency(valor: string | null | undefined): number | null {
  if (!valor) return null;

  try {
    // Remove thousands separator (period) and replace decimal (comma) with period
    const normalized = valor.replace(/\./g, '').replace(',', '.');
    const num = parseFloat(normalized);
    return isNaN(num) ? null : num;
  } catch {
    return null;
  }
}

/**
 * Parse "Sim"/"Nao" to boolean
 */
export function parseSimNao(valor: string | null | undefined): boolean {
  if (!valor) return false;
  return valor.trim().toLowerCase() === 'sim';
}

/**
 * Parse time: "HH:MM" or decimal hours
 */
export function parseTimeStr(timeStr: string | null | undefined): number | null {
  if (!timeStr) return null;

  try {
    // Try decimal first
    const num = parseFloat(timeStr);
    if (!isNaN(num)) return num;

    // Try HH:MM format
    if (timeStr.includes(':')) {
      const [hours, minutes] = timeStr.split(':').map(Number);
      return hours + minutes / 60;
    }

    return null;
  } catch {
    return null;
  }
}

/**
 * Capture unmapped fields in extras object
 */
export function getExtras(
  campos: Array<{ Identificador: string; Valor: unknown }>,
  mappedIds: Set<string>,
): Record<string, unknown> {
  const extras: Record<string, unknown> = {};

  for (const campo of campos) {
    if (!mappedIds.has(campo.Identificador)) {
      extras[campo.Identificador] = campo.Valor;
    }
  }

  return extras;
}

/**
 * Normalize status from Espaider to slug format
 */
export function normalizeStatus(raw: string | null): string {
  if (!raw) return 'projeto_futuro';

  const key = raw.trim().toLowerCase();
  const slug = key
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');

  return slug || 'projeto_futuro';
}
