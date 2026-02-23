/**
 * Date helpers for project deadline detection and formatting.
 * Used by ProjectKanbanCard, Cronograma, and Dashboard components.
 */

export function isOverdue(
  dateStr: string | null | undefined,
  status: string | null | undefined,
): boolean {
  if (!dateStr) return false;
  const normalised = (status || '').toLowerCase();
  if (normalised.includes('conclu') || normalised.includes('cancelado')) return false;
  try {
    const date = new Date(dateStr);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  } catch {
    return false;
  }
}

export function isWithin7Days(dateStr: string | null | undefined): boolean {
  if (!dateStr) return false;
  try {
    const date = new Date(dateStr);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const in7Days = new Date(today);
    in7Days.setDate(today.getDate() + 7);
    return date >= today && date <= in7Days;
  } catch {
    return false;
  }
}

export function formatDateBR(dateStr: string | null | undefined): string {
  if (!dateStr) return '-';
  try {
    return new Date(dateStr).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: '2-digit',
    });
  } catch {
    return '-';
  }
}
