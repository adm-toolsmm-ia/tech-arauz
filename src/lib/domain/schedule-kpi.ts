/**
 * Schedule KPI Domain Logic
 *
 * Pure functions for computing schedule KPIs.
 * Extracted from cronogramas-content.tsx (Story 2.4).
 */

import type { Schedule } from './schedule-status';
import { isConsideredActive, hasValidDeadline, isOverdue, isWithin7Days } from './schedule-status';

export interface OverdueInfo {
  count: number;
  maxDays: number;
}

export type KpiFilterName = 'pendentes' | 'em_execucao' | 'atrasados' | 'proximos_vencer' | 'sem_prazo';

/** Count schedules with active project + active status + valid deadline */
export function countPendingSchedules(schedules: Schedule[]): number {
  return schedules.filter(
    (s) =>
      isConsideredActive(s.project?.status) &&
      isConsideredActive(s.status) &&
      hasValidDeadline(s),
  ).length;
}

/** Count schedules where project status is "em execução" */
export function countInExecutionSchedules(schedules: Schedule[]): number {
  return schedules.filter(
    (s) =>
      (s.project?.status || '').trim().toLowerCase() === 'em execução' &&
      isConsideredActive(s.status) &&
      hasValidDeadline(s),
  ).length;
}

/** Get overdue schedules count and max days overdue */
export function getOverdueSchedulesInfo(schedules: Schedule[]): OverdueInfo {
  let count = 0;
  let maxDays = 0;
  const now = new Date();
  const refMidnight = new Date(now);
  refMidnight.setHours(0, 0, 0, 0);

  schedules.forEach((s) => {
    if (
      isConsideredActive(s.project?.status) &&
      isConsideredActive(s.status) &&
      hasValidDeadline(s) &&
      isOverdue(s, now)
    ) {
      count++;
      const d = new Date(s.data_prazo || (s.data_fim as string));
      const diffTime = Math.abs(refMidnight.getTime() - d.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      if (diffDays > maxDays) maxDays = diffDays;
    }
  });
  return { count, maxDays };
}

/** Count schedules near deadline (within 7 days) */
export function countNearDeadlineSchedules(schedules: Schedule[]): number {
  return schedules.filter(
    (s) =>
      isConsideredActive(s.project?.status) &&
      isConsideredActive(s.status) &&
      hasValidDeadline(s) &&
      isWithin7Days(s.data_prazo || s.data_fim),
  ).length;
}

/** Count schedules missing deadline */
export function countMissingDeadlineSchedules(schedules: Schedule[]): number {
  return schedules.filter(
    (s) =>
      isConsideredActive(s.project?.status) &&
      isConsideredActive(s.status) &&
      !hasValidDeadline(s),
  ).length;
}

/** Filter schedules by KPI filter name */
export function filterByKpi(schedules: Schedule[], kpiFilter: KpiFilterName | null): Schedule[] {
  if (!kpiFilter) return schedules;
  const now = new Date();

  return schedules.filter((s) => {
    switch (kpiFilter) {
      case 'pendentes':
        return (
          isConsideredActive(s.project?.status) &&
          isConsideredActive(s.status) &&
          hasValidDeadline(s)
        );
      case 'em_execucao':
        return (
          (s.project?.status || '').trim().toLowerCase() === 'em execução' &&
          isConsideredActive(s.status) &&
          hasValidDeadline(s)
        );
      case 'atrasados':
        return (
          isConsideredActive(s.project?.status) &&
          isConsideredActive(s.status) &&
          hasValidDeadline(s) &&
          isOverdue(s, now)
        );
      case 'proximos_vencer':
        return (
          isConsideredActive(s.project?.status) &&
          isConsideredActive(s.status) &&
          hasValidDeadline(s) &&
          isWithin7Days(s.data_prazo || s.data_fim)
        );
      case 'sem_prazo':
        return (
          isConsideredActive(s.project?.status) &&
          isConsideredActive(s.status) &&
          !hasValidDeadline(s)
        );
      default:
        return true;
    }
  });
}
