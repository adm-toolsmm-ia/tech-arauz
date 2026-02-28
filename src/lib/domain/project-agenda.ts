/**
 * Project Agenda Domain Logic
 * Filter projects by end_date within period (month, quarter, semester, year).
 * Includes concluded projects.
 */

export interface ProjectForAgenda {
  id: string;
  project_name?: string | null;
  espaider_code?: string | null;
  status?: string | null;
  end_date?: string | null;
  [key: string]: unknown;
}

export type ProjectAgendaPeriod = 'month' | 'quarter' | 'semester' | 'year';

function getPeriodRange(refDate: Date, period: ProjectAgendaPeriod): { start: Date; end: Date } {
  const year = refDate.getFullYear();
  const month = refDate.getMonth();

  if (period === 'month') {
    return {
      start: new Date(year, month, 1, 0, 0, 0, 0),
      end: new Date(year, month + 1, 0, 23, 59, 59, 999),
    };
  }
  if (period === 'quarter') {
    const q = Math.floor(month / 3) + 1;
    const startMonth = (q - 1) * 3;
    return {
      start: new Date(year, startMonth, 1, 0, 0, 0, 0),
      end: new Date(year, startMonth + 3, 0, 23, 59, 59, 999),
    };
  }
  if (period === 'semester') {
    const startMonth = month < 6 ? 0 : 6;
    return {
      start: new Date(year, startMonth, 1, 0, 0, 0, 0),
      end: new Date(year, startMonth + 6, 0, 23, 59, 59, 999),
    };
  }
  return {
    start: new Date(year, 0, 1, 0, 0, 0, 0),
    end: new Date(year, 11, 31, 23, 59, 59, 999),
  };
}

/** Check if project end_date falls within period range */
export function projectEndDateInPeriod(
  project: ProjectForAgenda,
  refDate: Date,
  period: ProjectAgendaPeriod,
): boolean {
  const endDateStr = project.end_date;
  if (!endDateStr) return false;

  const { start, end } = getPeriodRange(refDate, period);
  const d = new Date(endDateStr);
  return d >= start && d <= end;
}

/** Filter projects by end_date within period. Includes concluded. */
export function filterProjectsByAgendaPeriod<T extends ProjectForAgenda>(
  projects: T[],
  refDate: Date,
  period: ProjectAgendaPeriod,
): T[] {
  return projects.filter((p) => projectEndDateInPeriod(p, refDate, period));
}
