/**
 * Project Overdue Domain Logic
 *
 * Project-specific overdue helpers that build on project-health.ts.
 * Extracted from projects-content.tsx (Story 2.5).
 */

export { getOverdueData, isConsideredActive } from './project-health';

/**
 * Check if a date string represents a past date.
 */
export function isDateOverdue(dateStr: string | null | undefined): boolean {
  if (!dateStr) return false;
  try {
    return new Date(dateStr) < new Date();
  } catch {
    return false;
  }
}

/**
 * Format a date string as relative time (Hoje, Ontem, há X dias, etc.)
 */
export function formatRelativeDate(dateStr: string): string {
  try {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return 'Hoje';
    if (diffDays === 1) return 'Ontem';
    if (diffDays < 7) return `há ${diffDays} dias`;
    if (diffDays < 30) return `há ${Math.floor(diffDays / 7)} sem.`;
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
  } catch {
    return '';
  }
}
