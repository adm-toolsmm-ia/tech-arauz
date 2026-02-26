import { isHighPriorityProject } from '@/lib/domain/project-priority';

describe('project priority domain rules', () => {
  it('flags urgent and high priority projects as high priority', () => {
    expect(
      isHighPriorityProject({
        status: 'em execucao',
        priority: 'urgente',
      }),
    ).toBe(true);

    expect(
      isHighPriorityProject({
        status: 'em execucao',
        prioridade: 'alta',
      }),
    ).toBe(true);
  });

  it('flags high strategic or operational impact as high priority', () => {
    expect(
      isHighPriorityProject({
        status: 'em execucao',
        impacto_estrategico: 'alto',
      }),
    ).toBe(true);

    expect(
      isHighPriorityProject({
        status: 'em execucao',
        impacto_operacional: 'alto',
      }),
    ).toBe(true);
  });

  it('does not flag inactive projects as high priority', () => {
    expect(
      isHighPriorityProject({
        status: 'concluido',
        priority: 'urgente',
      }),
    ).toBe(false);
  });
});
