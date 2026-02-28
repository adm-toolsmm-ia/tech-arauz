import { describe, it, expect } from 'vitest';
import {
  getWeekStart,
  getWeekEnd,
  getKanbanColumn,
  SCHEDULE_KANBAN_COLUMNS,
  type ScheduleKanbanColumn,
} from '@/lib/domain/schedule-status';

// ---------- Story 2.16: getWeekStart() ISO-8601 ----------

describe('getWeekStart', () => {
  it('returns Monday for a Monday date', () => {
    const monday = new Date(2026, 2, 2); // Monday March 2, 2026
    const result = getWeekStart(monday);
    expect(result.getDay()).toBe(1); // Monday
    expect(result.getDate()).toBe(2);
  });

  it('returns previous Monday for a Sunday date', () => {
    const sunday = new Date(2026, 2, 1); // Sunday March 1, 2026
    const result = getWeekStart(sunday);
    expect(result.getDay()).toBe(1); // Monday
    expect(result.getDate()).toBe(23); // Feb 23
    expect(result.getMonth()).toBe(1); // February
  });

  it('returns Monday for a Wednesday date', () => {
    const wednesday = new Date(2026, 2, 4); // Wednesday March 4, 2026
    const result = getWeekStart(wednesday);
    expect(result.getDay()).toBe(1);
    expect(result.getDate()).toBe(2); // March 2
  });

  it('returns Monday for a Saturday date', () => {
    const saturday = new Date(2026, 2, 7); // Saturday March 7, 2026
    const result = getWeekStart(saturday);
    expect(result.getDay()).toBe(1);
    expect(result.getDate()).toBe(2); // March 2
  });

  it('handles year boundary (Jan 1 on Thursday)', () => {
    const jan1 = new Date(2026, 0, 1); // Thursday Jan 1, 2026
    const result = getWeekStart(jan1);
    expect(result.getDay()).toBe(1); // Monday
    expect(result.getFullYear()).toBe(2025); // Goes to Dec 29, 2025
    expect(result.getMonth()).toBe(11); // December
    expect(result.getDate()).toBe(29);
  });

  it('sets time to midnight', () => {
    const d = new Date(2026, 2, 4, 15, 30, 45);
    const result = getWeekStart(d);
    expect(result.getHours()).toBe(0);
    expect(result.getMinutes()).toBe(0);
    expect(result.getSeconds()).toBe(0);
    expect(result.getMilliseconds()).toBe(0);
  });
});

describe('getWeekEnd', () => {
  it('returns Sunday for a Monday date', () => {
    const monday = new Date(2026, 2, 2);
    const result = getWeekEnd(monday);
    expect(result.getDay()).toBe(0); // Sunday
    expect(result.getDate()).toBe(8); // March 8
  });

  it('returns end of day (23:59:59.999)', () => {
    const d = new Date(2026, 2, 4);
    const result = getWeekEnd(d);
    expect(result.getHours()).toBe(23);
    expect(result.getMinutes()).toBe(59);
    expect(result.getSeconds()).toBe(59);
    expect(result.getMilliseconds()).toBe(999);
  });
});

// ---------- Story 2.15: getKanbanColumn() ----------

describe('getKanbanColumn', () => {
  it('maps "concluído" to concluida', () => {
    expect(getKanbanColumn('concluído', false)).toBe('concluida');
  });

  it('maps "concluido" (no accent) to concluida', () => {
    expect(getKanbanColumn('concluido', false)).toBe('concluida');
  });

  it('maps "cancelado" to concluida', () => {
    expect(getKanbanColumn('cancelado', false)).toBe('concluida');
  });

  it('maps atrasado=true to atrasada (overrides status)', () => {
    expect(getKanbanColumn('pendente', true)).toBe('atrasada');
    expect(getKanbanColumn('', true)).toBe('atrasada');
    expect(getKanbanColumn(null, true)).toBe('atrasada');
  });

  it('maps "em_execucao" to em_execucao', () => {
    expect(getKanbanColumn('em_execucao', false)).toBe('em_execucao');
  });

  it('maps "em execução" (with spaces) to em_execucao', () => {
    expect(getKanbanColumn('em execução', false)).toBe('em_execucao');
  });

  it('maps "em andamento" to em_execucao', () => {
    expect(getKanbanColumn('em andamento', false)).toBe('em_execucao');
  });

  it('maps "iniciada" to em_execucao', () => {
    expect(getKanbanColumn('iniciada', false)).toBe('em_execucao');
  });

  it('maps unknown status to pendente (fallback)', () => {
    expect(getKanbanColumn('algo_desconhecido', false)).toBe('pendente');
    expect(getKanbanColumn('', false)).toBe('pendente');
    expect(getKanbanColumn(null, false)).toBe('pendente');
    expect(getKanbanColumn(undefined, false)).toBe('pendente');
  });

  it('handles whitespace in status', () => {
    expect(getKanbanColumn('  concluído  ', false)).toBe('concluida');
    expect(getKanbanColumn('  Em_Execucao  ', false)).toBe('em_execucao');
  });

  it('concluido has priority over atrasado', () => {
    expect(getKanbanColumn('concluído', true)).toBe('concluida');
  });
});

describe('SCHEDULE_KANBAN_COLUMNS', () => {
  it('has 4 columns in correct order', () => {
    expect(SCHEDULE_KANBAN_COLUMNS).toHaveLength(4);
    expect(SCHEDULE_KANBAN_COLUMNS.map(c => c.key)).toEqual([
      'pendente',
      'em_execucao',
      'atrasada',
      'concluida',
    ]);
  });
});
