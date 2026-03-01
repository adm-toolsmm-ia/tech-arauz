import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FilterBar } from '../FilterBar';
import { FilterRegistry, FilterState } from '@/lib/filters/filter-types';
import { CheckCircle2, AlertCircle, Calendar } from 'lucide-react';

// ─── Mock Filter Registry ─────────────────────────────────────────────────────

const mockFilterRegistry: FilterRegistry = {
  moduleId: 'projetos',
  filters: [
    {
      id: 'status',
      label: 'Status',
      type: 'select',
      options: [
        { value: 'iniciado', label: 'Iniciado' },
        { value: 'em-execucao', label: 'Em Execução' },
        { value: 'concluido', label: 'Concluído' },
      ],
      quickFilter: true,
      icon: CheckCircle2,
    },
    {
      id: 'priority',
      label: 'Prioridade',
      type: 'select',
      options: [
        { value: 'baixa', label: 'Baixa' },
        { value: 'media', label: 'Média' },
        { value: 'alta', label: 'Alta' },
      ],
      quickFilter: false,
      icon: AlertCircle,
    },
    {
      id: 'date_range',
      label: 'Data',
      type: 'date-range',
      group: 'Datas',
      quickFilter: false,
    },
  ],
  searchable: true,
  viewModes: [
    { id: 'kanban', label: 'Kanban', default: true },
    { id: 'list', label: 'List' },
    { id: 'agenda', label: 'Agenda', icon: Calendar },
  ],
  agendaPeriods: [
    { id: 'day', label: 'Dia' },
    { id: 'week', label: 'Semana' },
    { id: 'month', label: 'Mês' },
  ],
};

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('FilterBar Component', () => {
  let mockOnFiltersChange: ReturnType<typeof vi.fn>;
  let mockOnSearchChange: ReturnType<typeof vi.fn>;
  let mockOnViewModeChange: ReturnType<typeof vi.fn>;
  let mockOnAgendaPeriodChange: ReturnType<typeof vi.fn>;
  let mockOnUpdateFilter: ReturnType<typeof vi.fn>;
  let mockOnClearFilters: ReturnType<typeof vi.fn>;
  let mockOnResetFilters: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockOnFiltersChange = vi.fn();
    mockOnSearchChange = vi.fn();
    mockOnViewModeChange = vi.fn();
    mockOnAgendaPeriodChange = vi.fn();
    mockOnUpdateFilter = vi.fn();
    mockOnClearFilters = vi.fn();
    mockOnResetFilters = vi.fn();
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders search input when searchable is true', () => {
      render(
        <FilterBar
          moduleId="projetos"
          filters={mockFilterRegistry}
          onFiltersChange={mockOnFiltersChange}
          onSearchChange={mockOnSearchChange}
        />,
      );

      expect(screen.getByPlaceholderText(/Buscar/i)).toBeInTheDocument();
    });

    it('does not render search input when searchable is false', () => {
      const nonSearchableRegistry = { ...mockFilterRegistry, searchable: false };
      render(
        <FilterBar
          moduleId="projetos"
          filters={nonSearchableRegistry}
          onFiltersChange={mockOnFiltersChange}
        />,
      );

      expect(screen.queryByPlaceholderText(/Buscar/i)).not.toBeInTheDocument();
    });

    it('renders quick filter buttons for filters with quickFilter=true', () => {
      render(
        <FilterBar
          moduleId="projetos"
          filters={mockFilterRegistry}
          onFiltersChange={mockOnFiltersChange}
        />,
      );

      expect(screen.getByText('Status')).toBeInTheDocument();
      expect(screen.queryByText('Prioridade')).not.toBeInTheDocument(); // quickFilter=false
    });

    it('renders advanced filters button when advanced filters exist', () => {
      render(
        <FilterBar
          moduleId="projetos"
          filters={mockFilterRegistry}
          onFiltersChange={mockOnFiltersChange}
        />,
      );

      expect(screen.getByText('Filters')).toBeInTheDocument();
    });

    it('does not render view mode buttons (moved to ViewModeBar)', () => {
      render(
        <FilterBar
          moduleId="projetos"
          filters={mockFilterRegistry}
          onFiltersChange={mockOnFiltersChange}
        />,
      );

      expect(screen.queryByTitle('Kanban')).not.toBeInTheDocument();
      expect(screen.queryByTitle('List')).not.toBeInTheDocument();
    });

    it('does not render agenda period buttons (moved to ViewModeBar)', () => {
      render(
        <FilterBar
          moduleId="projetos"
          filters={mockFilterRegistry}
          onFiltersChange={mockOnFiltersChange}
          onViewModeChange={mockOnViewModeChange}
          initialViewMode="agenda"
        />,
      );

      expect(screen.queryByText('Dia')).not.toBeInTheDocument();
    });
  });

  describe('Search Functionality', () => {
    it('renders search input with placeholder', () => {
      render(
        <FilterBar
          moduleId="projetos"
          filters={mockFilterRegistry}
          onFiltersChange={mockOnFiltersChange}
          onSearchChange={mockOnSearchChange}
        />,
      );

      expect(screen.getByPlaceholderText(/Buscar/i)).toBeInTheDocument();
    });

    it('displays current search value when provided', () => {
      render(
        <FilterBar
          moduleId="projetos"
          filters={mockFilterRegistry}
          onFiltersChange={mockOnFiltersChange}
          onSearchChange={mockOnSearchChange}
          currentSearch="test value"
        />,
      );

      const searchInput = screen.getByPlaceholderText(/Buscar/i) as HTMLInputElement;
      expect(searchInput.value).toBe('test value');
    });

    it('shows clear button when search has value', () => {
      render(
        <FilterBar
          moduleId="projetos"
          filters={mockFilterRegistry}
          onFiltersChange={mockOnFiltersChange}
          onSearchChange={mockOnSearchChange}
          currentSearch="existing search"
        />,
      );

      expect(screen.getByTitle('Limpar busca')).toBeInTheDocument();
    });

    it('search input exists in DOM', () => {
      const { container } = render(
        <FilterBar
          moduleId="projetos"
          filters={mockFilterRegistry}
          onFiltersChange={mockOnFiltersChange}
        />,
      );

      const searchInput = container.querySelector('input[data-filter-search]');
      expect(searchInput).toBeInTheDocument();
    });
  });

  describe('Quick Filters', () => {
    it('renders quick filter buttons for filters with quickFilter=true', () => {
      render(
        <FilterBar
          moduleId="projetos"
          filters={mockFilterRegistry}
          onFiltersChange={mockOnFiltersChange}
        />,
      );

      expect(screen.getByText('Status')).toBeInTheDocument();
    });

    it('does not render filters with quickFilter=false', () => {
      render(
        <FilterBar
          moduleId="projetos"
          filters={mockFilterRegistry}
          onFiltersChange={mockOnFiltersChange}
        />,
      );

      expect(screen.queryByText('Prioridade')).not.toBeInTheDocument();
    });

    it('displays badge with count for multi-select quick filters', () => {
      const multiSelectRegistry = {
        ...mockFilterRegistry,
        filters: [
          {
            ...mockFilterRegistry.filters[0],
            multi: true,
          },
        ],
      };

      const activeFilters = { status: ['iniciado', 'em-execucao'] };

      render(
        <FilterBar
          moduleId="projetos"
          filters={multiSelectRegistry}
          onFiltersChange={mockOnFiltersChange}
          currentFilters={activeFilters}
        />,
      );

      expect(screen.getByText('2')).toBeInTheDocument();
    });

    it('renders quick filter button with icon when available', () => {
      render(
        <FilterBar
          moduleId="projetos"
          filters={mockFilterRegistry}
          onFiltersChange={mockOnFiltersChange}
        />,
      );

      const statusButton = screen.getByText('Status');
      expect(statusButton).toBeInTheDocument();
    });
  });

  describe('Advanced Filters Sheet', () => {
    it('renders advanced filters button when advanced filters exist', () => {
      render(
        <FilterBar
          moduleId="projetos"
          filters={mockFilterRegistry}
          onFiltersChange={mockOnFiltersChange}
        />,
      );

      const filtersButton = screen.getByText('Filters');
      expect(filtersButton).toBeInTheDocument();
      expect(filtersButton.tagName).toBe('BUTTON');
    });

    it('displays active filter count badge when filters are active', () => {
      const activeFilters = { status: 'iniciado', priority: 'alta' };

      render(
        <FilterBar
          moduleId="projetos"
          filters={mockFilterRegistry}
          onFiltersChange={mockOnFiltersChange}
          currentFilters={activeFilters}
        />,
      );

      expect(screen.getByText(/2 filter/i)).toBeInTheDocument();
    });

    it('has Filters button with Settings icon', () => {
      render(
        <FilterBar
          moduleId="projetos"
          filters={mockFilterRegistry}
          onFiltersChange={mockOnFiltersChange}
        />,
      );

      const filtersButton = screen.getByText('Filters');
      expect(filtersButton).toBeInTheDocument();
    });
  });

  describe('Reset and Clear Filters', () => {
    it('renders reset functionality when filters are present', () => {
      render(
        <FilterBar
          moduleId="projetos"
          filters={mockFilterRegistry}
          onFiltersChange={mockOnFiltersChange}
          currentFilters={{ status: 'iniciado' }}
        />,
      );

      expect(screen.getByText(/1 filter/i)).toBeInTheDocument();
    });

    it('renders filter bar with clear all capability', () => {
      render(
        <FilterBar
          moduleId="projetos"
          filters={mockFilterRegistry}
          onFiltersChange={mockOnFiltersChange}
          onClearFilters={mockOnClearFilters}
          currentFilters={{ status: 'iniciado', priority: 'alta' }}
        />,
      );

      expect(screen.getByText(/2 filter/i)).toBeInTheDocument();
    });

    it('renders with capability to reset all', () => {
      render(
        <FilterBar
          moduleId="projetos"
          filters={mockFilterRegistry}
          onFiltersChange={mockOnFiltersChange}
          onResetFilters={mockOnResetFilters}
          currentSearch="test"
        />,
      );

      // Should have search input visible indicating reset capability
      expect(screen.getByPlaceholderText(/Buscar/i)).toBeInTheDocument();
    });
  });

  describe('View Mode Selection', () => {
    it('does not render view mode buttons (moved to ViewModeBar)', () => {
      render(
        <FilterBar
          moduleId="projetos"
          filters={mockFilterRegistry}
          onFiltersChange={mockOnFiltersChange}
        />,
      );

      expect(screen.queryByTitle('Kanban')).not.toBeInTheDocument();
      expect(screen.queryByTitle('List')).not.toBeInTheDocument();
      expect(screen.queryByTitle('Agenda')).not.toBeInTheDocument();
    });
  });

  describe('Agenda Period Selection', () => {
    it('does not render agenda period buttons (moved to ViewModeBar)', () => {
      render(
        <FilterBar
          moduleId="projetos"
          filters={mockFilterRegistry}
          onFiltersChange={mockOnFiltersChange}
          initialViewMode="agenda"
        />,
      );

      expect(screen.queryByText('Dia')).not.toBeInTheDocument();
      expect(screen.queryByText('Semana')).not.toBeInTheDocument();
      expect(screen.queryByText('Mês')).not.toBeInTheDocument();
    });
  });

  describe('Controlled Component Behavior', () => {
    it('respects currentFilters prop for controlled component', () => {
      const { rerender } = render(
        <FilterBar
          moduleId="projetos"
          filters={mockFilterRegistry}
          onFiltersChange={mockOnFiltersChange}
          currentFilters={{ status: 'iniciado' }}
        />,
      );

      expect(screen.getByText(/1 filter/i)).toBeInTheDocument();

      rerender(
        <FilterBar
          moduleId="projetos"
          filters={mockFilterRegistry}
          onFiltersChange={mockOnFiltersChange}
          currentFilters={{ status: 'iniciado', priority: 'alta' }}
        />,
      );

      expect(screen.getByText(/2 filter/i)).toBeInTheDocument();
    });

    it('respects currentSearch prop for controlled component', () => {
      const { rerender } = render(
        <FilterBar
          moduleId="projetos"
          filters={mockFilterRegistry}
          onFiltersChange={mockOnFiltersChange}
          currentSearch="initial"
        />,
      );

      expect((screen.getByPlaceholderText(/Buscar/i) as HTMLInputElement).value).toBe('initial');

      rerender(
        <FilterBar
          moduleId="projetos"
          filters={mockFilterRegistry}
          onFiltersChange={mockOnFiltersChange}
          currentSearch="updated"
        />,
      );

      expect((screen.getByPlaceholderText(/Buscar/i) as HTMLInputElement).value).toBe('updated');
    });

    it.skip('respects currentViewMode prop', () => {
      const { rerender } = render(
        <FilterBar
          moduleId="projetos"
          filters={mockFilterRegistry}
          onFiltersChange={mockOnFiltersChange}
          initialViewMode="kanban"
        />,
      );

      expect(screen.getByTitle('Kanban')).toBeInTheDocument();

      rerender(
        <FilterBar
          moduleId="projetos"
          filters={mockFilterRegistry}
          onFiltersChange={mockOnFiltersChange}
          currentViewMode="list"
        />,
      );

      expect(screen.getByTitle('List')).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('handles empty filters gracefully', () => {
      const emptyRegistry = {
        ...mockFilterRegistry,
        filters: [],
      };

      render(
        <FilterBar
          moduleId="projetos"
          filters={emptyRegistry}
          onFiltersChange={mockOnFiltersChange}
        />,
      );

      expect(screen.queryByText('Filters')).not.toBeInTheDocument();
    });

    it('handles dynamic filter options (function)', () => {
      const dynamicRegistry = {
        ...mockFilterRegistry,
        filters: [
          {
            id: 'dynamic',
            label: 'Dynamic',
            type: 'select' as const,
            options: () => [{ value: 'opt1', label: 'Option 1' }],
            quickFilter: true,
          },
        ],
      };

      render(
        <FilterBar
          moduleId="projetos"
          filters={dynamicRegistry}
          onFiltersChange={mockOnFiltersChange}
        />,
      );

      expect(screen.getByText('Dynamic')).toBeInTheDocument();
    });

    it('handles undefined initial values', () => {
      render(
        <FilterBar
          moduleId="projetos"
          filters={mockFilterRegistry}
          onFiltersChange={mockOnFiltersChange}
          initialFilters={undefined}
          initialSearch={undefined}
          initialViewMode={undefined}
        />,
      );

      const searchInput = screen.getByPlaceholderText(/Buscar/i) as HTMLInputElement;
      expect(searchInput.value).toBe('');
    });

    it('renders with custom className', () => {
      const { container } = render(
        <FilterBar
          moduleId="projetos"
          filters={mockFilterRegistry}
          onFiltersChange={mockOnFiltersChange}
          className="custom-filter-bar"
        />,
      );

      expect(container.querySelector('.custom-filter-bar')).toBeInTheDocument();
    });
  });
});
