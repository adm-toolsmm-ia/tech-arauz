/**
 * Project color system for Kanban cards.
 * Consistent with cronogramas-content.tsx PROJECT_COLORS.
 */

export const PROJECT_BAR_COLORS = [
  'bg-blue-500',
  'bg-purple-500',
  'bg-emerald-500',
  'bg-amber-500',
  'bg-rose-500',
  'bg-cyan-500',
  'bg-indigo-500',
  'bg-teal-500',
  'bg-orange-500',
  'bg-pink-500',
] as const;

export function getProjectColorIndex(projectId: string, projectIds: string[]): number {
  const idx = projectIds.indexOf(projectId);
  return idx >= 0 ? idx % PROJECT_BAR_COLORS.length : 0;
}
