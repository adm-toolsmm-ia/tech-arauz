import { describe, it, expect, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { ProjectsContent } from '../projects-content';

vi.mock('@/components/layout/DashboardHeader', () => ({
  DashboardHeader: ({ title }: { title: string }) => <h1>{title}</h1>,
}));

vi.mock('@/components/dashboard/KPICard', () => ({
  KPICard: ({
    title,
    value,
    onClick,
  }: {
    title: string;
    value: string | number;
    onClick?: () => void;
  }) => (
    <button type="button" onClick={onClick}>
      {title}: {value}
    </button>
  ),
}));

vi.mock('@/components/filters/FilterBar', () => ({
  FilterBar: () => <div data-testid="filter-bar" />,
}));

vi.mock('@/components/views/KanbanBoard', () => ({
  KanbanBoard: ({ items }: { items: Array<{ id: string; title: string }> }) => (
    <div>
      {items.map((item) => (
        <div key={item.id}>{item.title}</div>
      ))}
    </div>
  ),
}));

vi.mock('@/components/views/SplitView', () => ({
  SplitView: ({ isOpen, children }: { isOpen: boolean; children: React.ReactNode }) =>
    isOpen ? <div>{children}</div> : null,
}));

vi.mock('@/components/project', () => ({
  ProjectCockpit: () => <div data-testid="project-cockpit" />,
}));

vi.mock('@/components/project/ProjectKanbanCard', () => ({
  ProjectKanbanCard: () => <div />,
}));

vi.mock('@/app/actions/sync', () => ({
  syncEspaiderAction: vi.fn(async () => ({ success: true, message: 'ok' })),
}));

vi.mock('@/app/actions/projects', () => ({
  updateProjectStatusAction: vi.fn(async () => ({ success: true, message: 'ok' })),
}));

vi.mock('sonner', () => ({
  toast: {
    info: vi.fn(),
    success: vi.fn(),
    error: vi.fn(),
  },
}));

function buildProject(params: { id: string; name: string; endDate: string }) {
  return {
    id: params.id,
    espaider_code: `P-${params.id}`,
    project_name: params.name,
    status: 'em execucao',
    total_value: null,
    responsible: 'Dev',
    start_date: '2026-01-01',
    end_date: params.endDate,
    priority: 'alta',
  };
}

describe('ProjectsContent integration', () => {
  it('filters kanban by overdue KPI', () => {
    const overdueProject = buildProject({
      id: '1',
      name: 'Projeto Atrasado',
      endDate: '2026-01-10',
    });
    const normalProject = buildProject({
      id: '2',
      name: 'Projeto Em Dia',
      endDate: '2026-12-20',
    });

    render(<ProjectsContent projects={[overdueProject, normalProject] as any} />);

    fireEvent.click(screen.getByRole('button', { name: /atrasados/i }));

    expect(screen.getByText('Projeto Atrasado')).toBeInTheDocument();
    expect(screen.queryByText('Projeto Em Dia')).not.toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveTextContent('Filtro ativo');
  });
});
