/**
 * Schedule Status Domain Logic
 *
 * Pure functions for schedule status evaluation.
 * Extracted from cronogramas-content.tsx (Story 2.4).
 */

import type { CronogramaData } from '@/hooks/useCronogramasFilters';

export type Schedule = CronogramaData;

/** Check if a status string is considered "active" (not cancelado/concluído) */
export function isConsideredActive(statusStr: string | null | undefined): boolean {
  const s = (statusStr || '').trim().toLowerCase();
  return s !== 'cancelado' && s !== 'concluído';
}

/** Check if schedule has a valid deadline (data_fim or data_prazo) */
export function hasValidDeadline(s: Schedule): boolean {
  return !!(s.data_fim || s.data_prazo);
}

/** Check if schedule is overdue relative to a reference date */
export function isOverdue(s: Schedule, refDate: Date = new Date()): boolean {
  const dateStr = s.data_prazo || s.data_fim;
  if (!dateStr) return false;
  const d = new Date(dateStr);
  const refMidnight = new Date(refDate);
  refMidnight.setHours(0, 0, 0, 0);
  return d < refMidnight;
}

/** Check if a date string is in the past */
export function isDateInPast(dateStr: string | null): boolean {
  if (!dateStr) return false;
  try {
    const d = new Date(dateStr);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return d < today;
  } catch {
    return false;
  }
}

/** Check if a date string is within the next 7 days */
export function isWithin7Days(dateStr: string | null): boolean {
  if (!dateStr) return false;
  try {
    const d = new Date(dateStr);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const in7 = new Date(today);
    in7.setDate(in7.getDate() + 7);
    return d >= today && d <= in7;
  } catch {
    return false;
  }
}

// ---------- Date Utility Functions ----------

export function isSameDay(d1: Date, d2: Date): boolean {
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  );
}

export function isWithinRange(date: Date, start: Date, end: Date): boolean {
  const d = new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
  const s = new Date(start.getFullYear(), start.getMonth(), start.getDate()).getTime();
  const e = new Date(end.getFullYear(), end.getMonth(), end.getDate()).getTime();
  return d >= s && d <= e;
}

export function formatDateBR(dateStr: string | null): string {
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

export function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

export function getFirstDayOfMonth(year: number, month: number): number {
  return new Date(year, month, 1).getDay();
}

export function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

/** Get start of ISO-8601 week (Monday) */
export function getWeekStart(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  d.setDate(d.getDate() - ((day + 6) % 7));
  d.setHours(0, 0, 0, 0);
  return d;
}

/** Get end of ISO-8601 week (Sunday) */
export function getWeekEnd(date: Date): Date {
  const start = getWeekStart(date);
  start.setDate(start.getDate() + 6);
  start.setHours(23, 59, 59, 999);
  return start;
}

// ---------- Schedule Kanban Mapping (Story 2.15) ----------

export type ScheduleKanbanColumn = 'pendente' | 'em_execucao' | 'atrasada' | 'concluida';

export const SCHEDULE_KANBAN_COLUMNS: { key: ScheduleKanbanColumn; label: string }[] = [
  { key: 'pendente', label: 'Pendente' },
  { key: 'em_execucao', label: 'Em Execução' },
  { key: 'atrasada', label: 'Atrasada' },
  { key: 'concluida', label: 'Concluída' },
];

/** Map schedule status + atrasado to Kanban column */
export function getKanbanColumn(status: string | null | undefined, atrasado: boolean): ScheduleKanbanColumn {
  const s = (status || '').trim().toLowerCase();
  if (s === 'concluído' || s === 'concluido') return 'concluida';
  if (s === 'cancelado') return 'concluida';
  if (atrasado) return 'atrasada';
  if (s === 'em_execucao' || s === 'em execução' || s === 'em andamento' || s === 'iniciada') return 'em_execucao';
  return 'pendente';
}

// ---------- Constants ----------

export const MONTH_NAMES = [
  'Janeiro',
  'Fevereiro',
  'Março',
  'Abril',
  'Maio',
  'Junho',
  'Julho',
  'Agosto',
  'Setembro',
  'Outubro',
  'Novembro',
  'Dezembro',
];

export const DAY_NAMES = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

export const PROJECT_COLORS = [
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
];

export const PROJECT_COLORS_LIGHT = [
  'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
  'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
  'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300',
  'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300',
  'bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-300',
  'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-300',
  'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300',
  'bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-300',
  'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300',
  'bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-300',
];

export function getProjectColorIndex(projectId: string, projectIds: string[]): number {
  const idx = projectIds.indexOf(projectId);
  return idx >= 0 ? idx % PROJECT_COLORS.length : 0;
}
