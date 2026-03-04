/**
 * Shared KPI Calculations — Dashboard & Projects
 *
 * Pure functions for computing KPIs shared between dashboard-content and projects views.
 * Extracted from dashboard-content.tsx (Story 2.6).
 */

import { isConsideredActive, getOverdueData } from './project-health';
import { isHighPriorityProject } from './project-priority';

export interface DashboardProjectLike {
  status?: string | null;
  area?: string | null;
  data_encerramento?: string | null;
  importancia_especial?: boolean | null;
  end_date?: string | null;
  prazo_cronograma?: string | null;
  prazo_aprovador?: string | null;
  priority?: string | null;
  prioridade?: string | null;
  impacto_estrategico?: string | null;
  impacto_operacional?: string | null;
  fase_atual?: string | null;
  aprovador_atual?: string | null;
  last_update?: string | null;
  complexidade_tecnica?: string | null;
  created_at?: string | null;
  budgets?: { value: number; currency: string }[];
  histories?: { date: string; step_from?: string }[];
}

export interface DashboardKpis {
  totalProjects: number;
  coreActiveCount: number;
  activeProjects: number;
  completedProjects: number;
  inHomologationCount: number;
  inProductionCount: number;
  overdueCount: number;
  overdueMaxDays: number;
  highPriorityCount: number;
  specialActiveCount: number;
  specialCompletedCount: number;
  completedThisMonth: number;
  completedLastMonth: number;
  completionRate: number;
  topAreas: Array<[string, number]>;
  totalBudgetValue: number;
  projectsWithHighImpact: number;
  avgLeadTimeDays: number;
}

function normalizeStatus(s: string | null | undefined): string {
  return (s || '').trim().toLowerCase();
}

export function countCompleted(projects: DashboardProjectLike[]): number {
  return projects.filter((p) => normalizeStatus(p.status) === 'concluído').length;
}

export function countCompletedInMonth(projects: DashboardProjectLike[], yearMonth: string): number {
  return projects.filter(
    (p) => normalizeStatus(p.status) === 'concluído' && p.data_encerramento?.startsWith(yearMonth),
  ).length;
}

export function getYearMonthKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

export function computeTopAreas(
  projects: DashboardProjectLike[],
  topN = 3,
): Array<[string, number]> {
  const counts: Record<string, number> = {};
  projects.forEach((p) => {
    const status = normalizeStatus(p.status);
    if (p.area && status !== 'concluído' && status !== 'cancelado') {
      counts[p.area] = (counts[p.area] || 0) + 1;
    }
  });
  return Object.entries(counts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, topN);
}

export function computeCompletionRate(total: number, completed: number): number {
  return total > 0 ? Math.round((completed / total) * 100) : 0;
}

export function computeTotalBudget(projects: DashboardProjectLike[]): number {
  return projects.reduce((total, p) => {
    const pBudget = p.budgets?.reduce((sum, b) => sum + (b.value || 0), 0) || 0;
    return total + pBudget;
  }, 0);
}

export function computeHighImpactProjects(projects: DashboardProjectLike[]): number {
  return projects.filter(p => p.impacto_estrategico?.toLowerCase() === 'alto' && isConsideredActive(p.status)).length;
}

/**
 * computeLeadTime — Average days from project start → data_encerramento
 * Uses the earliest history entry date as "start", falls back to created_at.
 * Only counts completed projects with a valid encerramento date.
 */
export function computeLeadTime(projects: DashboardProjectLike[]): number {
  const completedWithDates = projects.filter(
    (p) => normalizeStatus(p.status) === 'concluído' && p.data_encerramento,
  );

  if (completedWithDates.length === 0) return 0;

  const totalDays = completedWithDates.reduce((sum, p) => {
    const closedAt = new Date(p.data_encerramento!);
    // Earliest history date or created_at as project start
    const historyDates = (p.histories || []).map((h) => new Date(h.date).getTime()).filter(Boolean);
    const startMs =
      historyDates.length > 0
        ? Math.min(...historyDates)
        : p.created_at
          ? new Date(p.created_at).getTime()
          : closedAt.getTime();

    const days = Math.max(0, Math.round((closedAt.getTime() - startMs) / 86_400_000));
    return sum + days;
  }, 0);

  return Math.round(totalDays / completedWithDates.length);
}

export function computeDashboardKpis(projects: DashboardProjectLike[]): DashboardKpis {
  const now = new Date();
  const thisMonth = getYearMonthKey(now);
  const lastMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const lastMonth = getYearMonthKey(lastMonthDate);

  const totalProjects = projects.length;
  const coreActiveCount = projects.filter((p) => isConsideredActive(p.status)).length;
  const activeProjects = projects.filter((p) => normalizeStatus(p.status) === 'em execução').length;
  const completedProjects = countCompleted(projects);

  const inHomologationCount = projects.filter((p) => {
    if (!isConsideredActive(p.status)) return false;
    const fase = (p.fase_atual || '').toLowerCase();
    const aprovador = (p.aprovador_atual || '').toLowerCase();
    return fase.includes('homolog') || aprovador.includes('homolog');
  }).length;

  const inProductionCount = projects.filter((p) => {
    if (!isConsideredActive(p.status)) return false;
    const fase = (p.fase_atual || '').toLowerCase();
    const aprovador = (p.aprovador_atual || '').toLowerCase();
    return fase.includes('prod') || aprovador.includes('prod');
  }).length;

  let overdueCount = 0;
  let overdueMaxDays = 0;
  projects.forEach((p) => {
    const { isOverdue, maxDays } = getOverdueData(p, now);
    if (isOverdue) {
      overdueCount++;
      if (maxDays > overdueMaxDays) overdueMaxDays = maxDays;
    }
  });

  const highPriorityCount = projects.filter((p) => isHighPriorityProject(p)).length;

  const specialActiveCount = projects.filter(
    (p) => p.importancia_especial && isConsideredActive(p.status),
  ).length;
  const specialCompletedCount = projects.filter(
    (p) => p.importancia_especial && normalizeStatus(p.status) === 'concluído',
  ).length;

  const completedThisMonth = countCompletedInMonth(projects, thisMonth);
  const completedLastMonth = countCompletedInMonth(projects, lastMonth);
  const completionRate = computeCompletionRate(totalProjects, completedProjects);
  const topAreas = computeTopAreas(projects);
  const totalBudgetValue = computeTotalBudget(projects);
  const projectsWithHighImpact = computeHighImpactProjects(projects);
  const avgLeadTimeDays = computeLeadTime(projects);

  return {
    totalProjects,
    coreActiveCount,
    activeProjects,
    completedProjects,
    inHomologationCount,
    inProductionCount,
    overdueCount,
    overdueMaxDays,
    highPriorityCount,
    specialActiveCount,
    specialCompletedCount,
    completedThisMonth,
    completedLastMonth,
    completionRate,
    topAreas,
    totalBudgetValue,
    projectsWithHighImpact,
    avgLeadTimeDays,
  };
}
