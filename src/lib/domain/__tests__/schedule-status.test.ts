import { describe, it, expect } from 'vitest';
import {
  isConsideredActive,
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
  getProjectColorIndex,
} from '../schedule-status';
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

describe('isConsideredActive', () => {
  it('returns true for null/undefined/empty', () => {
    expect(isConsideredActive(null)).toBe(true);
    expect(isConsideredActive(undefined)).toBe(true);
    expect(isConsideredActive('')).toBe(true);
  });

  it('returns false for cancelado', () => {
    expect(isConsideredActive('cancelado')).toBe(false);
    expect(isConsideredActive('Cancelado')).toBe(false);
  });

  it('returns false for concluído', () => {
    expect(isConsideredActive('concluído')).toBe(false);
    expect(isConsideredActive('Concluído')).toBe(false);
  });

  it('returns true for active statuses', () => {
    expect(isConsideredActive('em execução')).toBe(true);
    expect(isConsideredActive('pendente')).toBe(true);
  });
});

describe('hasValidDeadline', () => {
  it('returns false when no dates', () => {
    expect(hasValidDeadline(makeSchedule())).toBe(false);
  });

  it('returns true with data_fim', () => {
    expect(hasValidDeadline(makeSchedule({ data_fim: '2026-03-01' }))).toBe(true);
  });

  it('returns true with data_prazo', () => {
    expect(hasValidDeadline(makeSchedule({ data_prazo: '2026-03-01' }))).toBe(true);
  });
});

describe('isOverdue', () => {
  it('returns false when no deadline', () => {
    expect(isOverdue(makeSchedule())).toBe(false);
  });

  it('returns true when past deadline', () => {
    const s = makeSchedule({ data_prazo: '2020-01-01' });
    expect(isOverdue(s)).toBe(true);
  });

  it('returns false when future deadline', () => {
    const s = makeSchedule({ data_prazo: '2030-01-01' });
    expect(isOverdue(s)).toBe(false);
  });
});

describe('isDateInPast', () => {
  it('returns false for null', () => {
    expect(isDateInPast(null)).toBe(false);
  });

  it('returns true for past date', () => {
    expect(isDateInPast('2020-01-01')).toBe(true);
  });

  it('returns false for future date', () => {
    expect(isDateInPast('2030-01-01')).toBe(false);
  });
});

describe('isWithin7Days', () => {
  it('returns false for null', () => {
    expect(isWithin7Days(null)).toBe(false);
  });

  it('returns false for past dates', () => {
    expect(isWithin7Days('2020-01-01')).toBe(false);
  });

  it('returns false for dates far in the future', () => {
    expect(isWithin7Days('2030-01-01')).toBe(false);
  });

  it('returns true for dates within 7 days', () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    expect(isWithin7Days(tomorrow.toISOString().split('T')[0])).toBe(true);
  });
});

describe('date utilities', () => {
  it('isSameDay correctly compares', () => {
    expect(isSameDay(new Date(2026, 0, 1), new Date(2026, 0, 1))).toBe(true);
    expect(isSameDay(new Date(2026, 0, 1), new Date(2026, 0, 2))).toBe(false);
  });

  it('isWithinRange works', () => {
    const date = new Date(2026, 0, 5);
    const start = new Date(2026, 0, 1);
    const end = new Date(2026, 0, 10);
    expect(isWithinRange(date, start, end)).toBe(true);
    expect(isWithinRange(new Date(2026, 0, 15), start, end)).toBe(false);
  });

  it('formatDateBR formats correctly', () => {
    expect(formatDateBR(null)).toBe('-');
    // Note: formatDateBR parses the date string; timezone may shift the day
    const result = formatDateBR('2026-01-15');
    expect(result).not.toBe('-');
    expect(result).toMatch(/\d{2}\/\d{2}\/\d{2}/);
  });

  it('getDaysInMonth returns correct days', () => {
    expect(getDaysInMonth(2026, 1)).toBe(28); // February 2026
    expect(getDaysInMonth(2026, 0)).toBe(31); // January
  });

  it('getFirstDayOfMonth returns day of week', () => {
    const day = getFirstDayOfMonth(2026, 0);
    expect(day).toBeGreaterThanOrEqual(0);
    expect(day).toBeLessThanOrEqual(6);
  });

  it('addDays adds correctly', () => {
    const base = new Date(2026, 0, 1);
    const result = addDays(base, 5);
    expect(result.getDate()).toBe(6);
  });

  it('getWeekStart returns Sunday', () => {
    const wed = new Date(2026, 0, 7); // Wednesday
    const start = getWeekStart(wed);
    expect(start.getDay()).toBe(0); // Sunday
  });
});

describe('getProjectColorIndex', () => {
  it('returns correct index', () => {
    const ids = ['a', 'b', 'c'];
    expect(getProjectColorIndex('b', ids)).toBe(1);
  });

  it('returns 0 for unknown project', () => {
    expect(getProjectColorIndex('unknown', ['a', 'b'])).toBe(0);
  });

  it('wraps around for many projects', () => {
    const ids = Array.from({ length: 15 }, (_, i) => `p${i}`);
    expect(getProjectColorIndex('p12', ids)).toBe(2); // 12 % 10
  });
});
