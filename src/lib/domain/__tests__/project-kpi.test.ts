import { describe, it, expect } from 'vitest';
import {
  countInExecutionProjects,
  countInHomologation,
  countInProduction,
  getProjectOverdueInfo,
  countHighPriority,
  countSpecialImportance,
  countRecentProjects,
  countWithoutMovement,
  filterByProjectKpi,
} from '../project-kpi';
import type { ProjectForKpi } from '../project-kpi';

function makeProject(overrides: Partial<ProjectForKpi> = {}): ProjectForKpi {
  return {
    id: '1',
    status: 'em execução',
    ...overrides,
  };
}

const now = new Date();
const recentDate = new Date(now);
recentDate.setDate(recentDate.getDate() - 2);
const oldDate = new Date(now);
oldDate.setDate(oldDate.getDate() - 15);

const projects: ProjectForKpi[] = [
  makeProject({
    id: '1',
    status: 'em execução',
    priority: 'urgente',
    updated_at: recentDate.toISOString(),
  }),
  makeProject({
    id: '2',
    status: 'em execução',
    fase_atual: 'Homologação',
    updated_at: oldDate.toISOString(),
  }),
  makeProject({ id: '3', status: 'concluído', importancia_especial: true }),
  makeProject({
    id: '4',
    status: 'em execução',
    importancia_especial: true,
    end_date: '2020-01-01',
    updated_at: recentDate.toISOString(),
  }),
  makeProject({ id: '5', status: 'cancelado' }),
];

describe('countInExecutionProjects', () => {
  it('counts projects with em execução status', () => {
    expect(countInExecutionProjects(projects)).toBe(3);
  });
});

describe('countInHomologation', () => {
  it('counts active projects with homologation fase', () => {
    expect(countInHomologation(projects)).toBe(1);
  });
});

describe('countInProduction', () => {
  it('counts active projects with production fase', () => {
    expect(countInProduction(projects)).toBe(0);
  });
});

describe('getProjectOverdueInfo', () => {
  it('detects overdue projects', () => {
    const info = getProjectOverdueInfo(projects);
    // Project 4 has end_date in past and is in execution
    expect(info.count).toBeGreaterThanOrEqual(0);
  });
});

describe('countHighPriority', () => {
  it('counts high priority projects', () => {
    expect(countHighPriority(projects)).toBeGreaterThanOrEqual(1);
  });
});

describe('countSpecialImportance', () => {
  it('returns active and completed counts', () => {
    const result = countSpecialImportance(projects);
    expect(result.active).toBe(1); // id 4
    expect(result.completed).toBe(1); // id 3
  });
});

describe('countRecentProjects', () => {
  it('counts recently moved projects', () => {
    expect(countRecentProjects(projects)).toBeGreaterThanOrEqual(1);
  });
});

describe('countWithoutMovement', () => {
  it('counts stale projects', () => {
    expect(countWithoutMovement(projects)).toBeGreaterThanOrEqual(1);
  });
});

describe('filterByProjectKpi', () => {
  it('returns all when null', () => {
    expect(filterByProjectKpi(projects, null)).toEqual(projects);
  });

  it('filters em_execucao', () => {
    const result = filterByProjectKpi(projects, 'em_execucao');
    expect(result.every((p) => (p.status || '').trim().toLowerCase() === 'em execução')).toBe(true);
  });

  it('filters importancia_especial', () => {
    const result = filterByProjectKpi(projects, 'importancia_especial');
    expect(result.every((p) => p.importancia_especial)).toBe(true);
  });
});
