import { getOverdueData, isConsideredActive } from '@/lib/domain/project-health';

describe('project health domain rules', () => {
  it('considers cancelled and completed projects as inactive', () => {
    expect(isConsideredActive('cancelado')).toBe(false);
    expect(isConsideredActive('concluido')).toBe(false);
    expect(isConsideredActive('concluído')).toBe(false);
    expect(isConsideredActive('em execução')).toBe(true);
  });

  it('flags overdue project by end_date when status is em execução', () => {
    const result = getOverdueData(
      {
        status: 'em execução',
        end_date: '2026-01-01',
      },
      new Date('2026-01-10'),
    );

    expect(result.isOverdue).toBe(true);
    expect(result.maxDays).toBeGreaterThan(0);
  });

  it('does not flag project as overdue if status is not em execução', () => {
    const resultConcluido = getOverdueData(
      {
        status: 'concluído',
        end_date: '2026-01-01',
      },
      new Date('2026-01-10'),
    );
    expect(resultConcluido.isOverdue).toBe(false);

    const resultParalisado = getOverdueData(
      {
        status: 'paralisado',
        end_date: '2026-01-01',
      },
      new Date('2026-01-10'),
    );
    expect(resultParalisado.isOverdue).toBe(false);
  });

  it('does not flag as overdue based on prazo_cronograma', () => {
    const result = getOverdueData(
      {
        status: 'em execução',
        end_date: '2026-01-20', // future
        prazo_cronograma: '2026-01-01', // past
      },
      new Date('2026-01-10'),
    );

    expect(result.isOverdue).toBe(false);
    expect(result.maxDays).toBe(0);
  });
});
