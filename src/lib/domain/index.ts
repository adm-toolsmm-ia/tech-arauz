/**
 * Domain Layer — Barrel Export
 *
 * Central entry point for all domain business logic.
 * Import via: import { ... } from '@/lib/domain';
 */

export * from './agent-rules';
export * from './kpi-calculations';
export * from './lm-model-rules';
export * from './lm-provider-rules';
export * from './project-health';
export * from './project-kpi';
export * from './project-overdue';
export * from './project-phase';
export * from './project-priority';
export * from './schedule-kpi';
export {
    hasValidDeadline,
    isOverdue,
    isDateInPast,
    isWithin7Days,
    isSameDay,
    isWithinRange,
    formatDateBR,
    getDaysInMonth,
    getFirstDayOfMonth,
    addDays,
    getWeekStart,
    MONTH_NAMES,
    DAY_NAMES,
    PROJECT_COLORS,
    PROJECT_COLORS_LIGHT,
    getProjectColorIndex,
} from './schedule-status';
export type { Schedule } from './schedule-status';
