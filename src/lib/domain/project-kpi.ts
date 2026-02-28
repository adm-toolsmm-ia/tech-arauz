/**
 * Project KPI Domain Logic
 *
 * Pure functions for computing project KPIs.
 * Extracted from projects-content.tsx (Story 2.5).
 */

import { getOverdueData, isConsideredActive } from './project-health';
import { isHighPriorityProject } from './project-priority';

export interface ProjectForKpi {
  id: string;
  status?: string | null;
  fase_atual?: string | null;
  aprovador_atual?: string | null;
  importancia_especial?: boolean | null;
  updated_at?: string | null;
  data_movimentacao?: string | null;
  last_update?: string | null;
  priority?: string | null;
  end_date?: string | null;
  schedules?: Array<{ data_fim?: string | null; data_prazo?: string | null; status: string | null }>;
}

export type ProjectKpiFilterName =
  | 'em_execucao'
  | 'atrasados'
  | 'alta_prioridade'
  | 'importancia_especial'
  | 'recentes'
  | 'sem_movimentacao';

export interface ProjectOverdueInfo {
  count: number;
  maxDays: number;
}

export function countInExecutionProjects(projects: ProjectForKpi[]): number {
  return projects.filter((p) => (p.status || '').trim().toLowerCase() === 'em execução').length;
}

export function countInHomologation(projects: ProjectForKpi[]): number {
  return projects.filter((p) => {
    if (!isConsideredActive(p.status)) return false;
    const fase = (p.fase_atual || '').toLowerCase();
    const aprovador = (p.aprovador_atual || '').toLowerCase();
    return fase.includes('homolog') || aprovador.includes('homolog');
  }).length;
}

export function countInProduction(projects: ProjectForKpi[]): number {
  return projects.filter((p) => {
    if (!isConsideredActive(p.status)) return false;
    const fase = (p.fase_atual || '').toLowerCase();
    const aprovador = (p.aprovador_atual || '').toLowerCase();
    return fase.includes('prod') || aprovador.includes('prod');
  }).length;
}

export function getProjectOverdueInfo(projects: ProjectForKpi[]): ProjectOverdueInfo {
  let count = 0;
  let maxDays = 0;
  const now = new Date();
  projects.forEach((p) => {
    const { isOverdue, maxDays: pMaxDays } = getOverdueData(p, now);
    if (isOverdue) {
      count++;
      if (pMaxDays > maxDays) maxDays = pMaxDays;
    }
  });
  return { count, maxDays };
}

export function countHighPriority(projects: ProjectForKpi[]): number {
  return projects.filter((p) => isHighPriorityProject(p)).length;
}

export function countSpecialImportance(projects: ProjectForKpi[]): { active: number; completed: number } {
  const active = projects.filter((p) => p.importancia_especial && isConsideredActive(p.status)).length;
  const completed = projects.filter(
    (p) => p.importancia_especial && (p.status || '').trim().toLowerCase() === 'concluído',
  ).length;
  return { active, completed };
}

export function countRecentProjects(projects: ProjectForKpi[]): number {
  const now = new Date();
  return projects.filter((p) => {
    const s = (p.status || '').trim().toLowerCase();
    if (s !== 'iniciado' && s !== 'em execução' && s !== 'concluído') return false;
    const lastMove = p.updated_at || p.data_movimentacao || p.last_update;
    if (!lastMove) return false;
    const diffTime = now.getTime() - new Date(lastMove).getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays >= 0 && diffDays <= 7;
  }).length;
}

export function countWithoutMovement(projects: ProjectForKpi[]): number {
  const now = new Date();
  return projects.filter((p) => {
    if ((p.status || '').trim().toLowerCase() !== 'em execução') return false;
    const lastMove = p.updated_at || p.data_movimentacao || p.last_update;
    if (!lastMove) return true;
    const diffTime = now.getTime() - new Date(lastMove).getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 7;
  }).length;
}

export function filterByProjectKpi<T extends ProjectForKpi>(
  projects: T[],
  kpiFilter: ProjectKpiFilterName | null,
): T[] {
  if (!kpiFilter) return projects;
  const now = new Date();

  return projects.filter((p) => {
    switch (kpiFilter) {
      case 'em_execucao':
        return (p.status || '').trim().toLowerCase() === 'em execução';
      case 'atrasados':
        return getOverdueData(p, now).isOverdue;
      case 'alta_prioridade':
        return isHighPriorityProject(p);
      case 'importancia_especial':
        return p.importancia_especial && isConsideredActive(p.status);
      case 'recentes': {
        const s = (p.status || '').trim().toLowerCase();
        if (s !== 'iniciado' && s !== 'em execução' && s !== 'concluído') return false;
        const lastMove = p.updated_at || p.data_movimentacao || p.last_update;
        if (!lastMove) return false;
        const diffTime = now.getTime() - new Date(lastMove).getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays >= 0 && diffDays <= 7;
      }
      case 'sem_movimentacao': {
        if ((p.status || '').trim().toLowerCase() !== 'em execução') return false;
        const lastMove = p.updated_at || p.data_movimentacao || p.last_update;
        if (!lastMove) return true;
        const diffTime = now.getTime() - new Date(lastMove).getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays > 7;
      }
      default:
        return true;
    }
  });
}
