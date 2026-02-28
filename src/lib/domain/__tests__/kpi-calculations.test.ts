import { describe, it, expect } from 'vitest';
import {
  countCompleted,
  countCompletedInMonth,
  getYearMonthKey,
  computeTopAreas,
  computeCompletionRate,
  computeDashboardKpis,
} from '../kpi-calculations';
import type { DashboardProjectLike } from '../kpi-calculations';

function makeProject(overrides: Partial<DashboardProjectLike> = {}): DashboardProjectLike {
  return {
    status: 'em execução',
    ...overrides,
  };
}

const projects: DashboardProjectLike[] = [
  makeProject({ status: 'em execução', area: 'TI', priority: 'urgente' }),
  makeProject({ status: 'em execução', area: 'TI', fase_atual: 'Homologação' }),
  makeProject({ status: 'concluído', area: 'RH', data_encerramento: '2026-02-15' }),
  makeProject({
    status: 'em execução',
    importancia_especial: true,
    end_date: '2020-01-01',
    area: 'Jurídico',
  }),
  makeProject({ status: 'cancelado', area: 'TI' }),
  makeProject({ status: 'concluído', importancia_especial: true, data_encerramento: '2026-01-10' }),
];

describe('countCompleted', () => {
  it('counts concluído projects', () => {
    expect(countCompleted(projects)).toBe(2);
  });
});

describe('countCompletedInMonth', () => {
  it('counts completed in specific month', () => {
    expect(countCompletedInMonth(projects, '2026-02')).toBe(1);
    expect(countCompletedInMonth(projects, '2026-01')).toBe(1);
    expect(countCompletedInMonth(projects, '2025-12')).toBe(0);
  });
});

describe('getYearMonthKey', () => {
  it('formats date as YYYY-MM', () => {
    expect(getYearMonthKey(new Date(2026, 0, 15))).toBe('2026-01');
    expect(getYearMonthKey(new Date(2026, 11, 1))).toBe('2026-12');
  });
});

describe('computeTopAreas', () => {
  it('returns top N areas by active project count', () => {
    const result = computeTopAreas(projects, 3);
    expect(result[0][0]).toBe('TI');
    expect(result[0][1]).toBe(2); // 2 active TI projects (cancelado excluded)
  });

  it('excludes concluído and cancelado', () => {
    const areas = computeTopAreas(projects).map(([a]) => a);
    // RH project is concluído, should not appear
    expect(areas).not.toContain('RH');
  });
});

describe('computeCompletionRate', () => {
  it('computes percentage', () => {
    expect(computeCompletionRate(10, 3)).toBe(30);
    expect(computeCompletionRate(4, 2)).toBe(50);
  });

  it('returns 0 when total is 0', () => {
    expect(computeCompletionRate(0, 0)).toBe(0);
  });
});

describe('computeDashboardKpis', () => {
  it('computes all KPIs in one call', () => {
    const kpis = computeDashboardKpis(projects);

    expect(kpis.totalProjects).toBe(6);
    expect(kpis.completedProjects).toBe(2);
    expect(kpis.activeProjects).toBe(3); // em execução
    expect(kpis.coreActiveCount).toBe(3); // 3x 'em execução' (cancelado + 2x concluído excluded)
    expect(kpis.inHomologationCount).toBe(1);
    expect(kpis.highPriorityCount).toBeGreaterThanOrEqual(1);
    expect(kpis.specialActiveCount).toBe(1); // id 4
    expect(kpis.specialCompletedCount).toBe(1); // id 6
    expect(kpis.topAreas.length).toBeGreaterThanOrEqual(1);
    expect(kpis.completionRate).toBe(33); // 2/6 ≈ 33%
  });

  it('handles empty array', () => {
    const kpis = computeDashboardKpis([]);
    expect(kpis.totalProjects).toBe(0);
    expect(kpis.completionRate).toBe(0);
    expect(kpis.topAreas).toEqual([]);
  });
});
