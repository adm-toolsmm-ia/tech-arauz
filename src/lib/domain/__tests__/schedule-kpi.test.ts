import { describe, it, expect } from 'vitest';
import {
  countPendingSchedules,
  countInExecutionSchedules,
  getOverdueSchedulesInfo,
  countNearDeadlineSchedules,
  countMissingDeadlineSchedules,
  filterByKpi,
} from '../schedule-kpi';
import type { Schedule } from '../schedule-status';

function makeSchedule(overrides: Partial<Schedule> = {}): Schedule {
  return {
    id: '1',
    project_id: 'p1',
    atividade: 'Test',
    responsavel: null,
    data_inicio: null,
    data_fim: null,
    status: null,
    fase_atividade: null,
    atrasado: null,
    setor_responsavel: null,
    item: null,
    detalhamento: null,
    data_prazo: null,
    data_novo_prazo: null,
    data_alerta_prazo: null,
    prazo_confirmado: null,
    ...overrides,
  };
}

const activeWithDeadline = makeSchedule({
  id: '1',
  status: 'em andamento',
  data_prazo: '2030-06-01',
  project: { id: 'p1', titulo: 'Proj', codigo: 'C1', status: 'em execução', fase_atual: null },
});

const overdueSchedule = makeSchedule({
  id: '2',
  status: 'em andamento',
  data_prazo: '2020-01-01',
  project: { id: 'p1', titulo: 'Proj', codigo: 'C1', status: 'em execução', fase_atual: null },
});

const canceledSchedule = makeSchedule({
  id: '3',
  status: 'cancelado',
  data_prazo: '2030-06-01',
  project: { id: 'p1', titulo: 'Proj', codigo: 'C1', status: 'em execução', fase_atual: null },
});

const noDeadline = makeSchedule({
  id: '4',
  status: 'em andamento',
  project: { id: 'p1', titulo: 'Proj', codigo: 'C1', status: 'em execução', fase_atual: null },
});

const all = [activeWithDeadline, overdueSchedule, canceledSchedule, noDeadline];

describe('countPendingSchedules', () => {
  it('counts active schedules with deadline', () => {
    expect(countPendingSchedules(all)).toBe(2); // activeWithDeadline + overdueSchedule
  });

  it('returns 0 for empty array', () => {
    expect(countPendingSchedules([])).toBe(0);
  });
});

describe('countInExecutionSchedules', () => {
  it('counts schedules with project in execução', () => {
    expect(countInExecutionSchedules(all)).toBe(2);
  });
});

describe('getOverdueSchedulesInfo', () => {
  it('returns count and max days', () => {
    const info = getOverdueSchedulesInfo(all);
    expect(info.count).toBe(1);
    expect(info.maxDays).toBeGreaterThan(0);
  });

  it('returns 0 for no overdue', () => {
    const info = getOverdueSchedulesInfo([activeWithDeadline]);
    expect(info.count).toBe(0);
    expect(info.maxDays).toBe(0);
  });
});

describe('countNearDeadlineSchedules', () => {
  it('returns 0 when no near deadlines', () => {
    expect(countNearDeadlineSchedules(all)).toBe(0);
  });

  it('counts schedules near deadline', () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const nearSchedule = makeSchedule({
      id: '5',
      status: 'em andamento',
      data_prazo: tomorrow.toISOString().split('T')[0],
      project: { id: 'p1', titulo: 'Proj', codigo: 'C1', status: 'em execução', fase_atual: null },
    });
    expect(countNearDeadlineSchedules([nearSchedule])).toBe(1);
  });
});

describe('countMissingDeadlineSchedules', () => {
  it('counts schedules without deadline', () => {
    expect(countMissingDeadlineSchedules(all)).toBe(1); // noDeadline
  });
});

describe('filterByKpi', () => {
  it('returns all when filter is null', () => {
    expect(filterByKpi(all, null)).toEqual(all);
  });

  it('filters pendentes', () => {
    const result = filterByKpi(all, 'pendentes');
    expect(result.length).toBe(2);
  });

  it('filters atrasados', () => {
    const result = filterByKpi(all, 'atrasados');
    expect(result.length).toBe(1);
    expect(result[0].id).toBe('2');
  });

  it('filters sem_prazo', () => {
    const result = filterByKpi(all, 'sem_prazo');
    expect(result.length).toBe(1);
    expect(result[0].id).toBe('4');
  });

  it('filters em_execucao', () => {
    const result = filterByKpi(all, 'em_execucao');
    expect(result.length).toBe(2);
  });
});
