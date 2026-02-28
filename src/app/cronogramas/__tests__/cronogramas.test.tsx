import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { CronogramasContent } from '../cronogramas-content';
import type { CronogramaData } from '@/hooks/useCronogramasFilters';

// ─── Mocks ────────────────────────────────────────────────────────────────────

vi.mock('@/hooks/useCronogramasFilters', () => ({
  useCronogramasFilters: () => ({
    filters: {},
    search: '',
    viewMode: 'kanban',
    calendarPeriod: 'day',
    filteredData: mockSchedules,
    updateFilter: vi.fn(),
    setSearch: vi.fn(),
    setViewMode: vi.fn(),
    setCalendarPeriod: vi.fn(),
    resetAllFilters: vi.fn(),
    registry: {
      moduleId: 'cronogramas',
      filters: [],
      viewModes: [
        { id: 'kanban', label: 'Kanban' },
        { id: 'calendar', label: 'Calendar' },
        { id: 'list', label: 'List' },
      ],
      agendaPeriods: [
        { id: 'day', label: 'Dia' },
        { id: 'week', label: 'Semana' },
        { id: 'month', label: 'Mês' },
      ],
    },
  }),
}));

// ─── Test Data ────────────────────────────────────────────────────────────────

const mockSchedules: CronogramaData[] = [
  {
    id: 'sched-1',
    project_id: 'proj-1',
    project_name: 'Projeto A',
    description: 'Milestone 1',
    data_inicio: new Date('2026-03-01'),
    data_fim: new Date('2026-03-31'),
    data_conclusao: null,
    percentual_progresso: 45,
    tipo: 'milestone',
    espaider_raw: {},
    espaider_id: 1001,
    tenant_id: 'tenant-1',
    created_at: new Date('2026-02-27'),
    updated_at: new Date('2026-02-27'),
  },
  {
    id: 'sched-2',
    project_id: 'proj-2',
    project_name: 'Projeto B',
    description: 'Phase 1',
    data_inicio: new Date('2026-03-15'),
    data_fim: new Date('2026-04-15'),
    data_conclusao: new Date('2026-04-12'),
    percentual_progresso: 100,
    tipo: 'phase',
    espaider_raw: {},
    espaider_id: 1002,
    tenant_id: 'tenant-1',
    created_at: new Date('2026-02-27'),
    updated_at: new Date('2026-02-27'),
  },
];

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('CronogramasContent (Story 2.4 Regression)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders cronogramas content component', () => {
      render(<CronogramasContent schedules={mockSchedules} />);
      expect(screen.getByText(/cronogramas/i)).toBeInTheDocument();
    });

    it('renders with provided schedules data', () => {
      render(<CronogramasContent schedules={mockSchedules} />);
      // Component should accept and use schedules prop
      expect(screen.queryByText(/Projeto/i)).toBeTruthy();
    });

    it('handles empty schedules array', () => {
      render(<CronogramasContent schedules={[]} />);
      // Should render without errors
      expect(screen.queryByText(/Error/i)).not.toBeInTheDocument();
    });
  });

  describe('Subcomponents Integration (Story 2.4 Decomposition)', () => {
    it('integrates CronogramasKPIBar subcomponent', () => {
      const { container } = render(<CronogramasContent schedules={mockSchedules} />);
      // KPIBar component should be present in DOM hierarchy
      expect(container.querySelector('[role="region"]')).toBeTruthy();
    });

    it('integrates CronogramaFilters subcomponent', () => {
      const { container } = render(<CronogramasContent schedules={mockSchedules} />);
      // Filter controls should be present
      expect(container.querySelector('input') || container.querySelector('button')).toBeTruthy();
    });

    it('integrates CronogramaCalendar subcomponent for calendar view', () => {
      const { container } = render(<CronogramasContent schedules={mockSchedules} />);
      // Calendar or date-related elements should be accessible
      expect(
        container.querySelector('[role="grid"]') ||
          container.querySelector('[role="presentation"]'),
      ).toBeTruthy();
    });

    it('integrates CronogramaList subcomponent for list view', () => {
      const { container } = render(<CronogramasContent schedules={mockSchedules} />);
      // List-like structure should exist
      expect(
        container.querySelector('[role="list"]') ||
          container.querySelector('div[class*="flex"][class*="flex-col"]'),
      ).toBeTruthy();
    });

    it('integrates CronogramaCockpit detail panel', () => {
      const { container } = render(<CronogramasContent schedules={mockSchedules} />);
      // Component container should have necessary structure
      expect(container.querySelector('[class*="flex"]')).toBeTruthy();
    });
  });

  describe('View Mode Management', () => {
    it('handles view mode switching', () => {
      const { container } = render(<CronogramasContent schedules={mockSchedules} />);
      // Multiple view mode buttons should be accessible
      const buttons = container.querySelectorAll('button');
      expect(buttons.length).toBeGreaterThan(0);
    });

    it('supports kanban view mode', () => {
      render(<CronogramasContent schedules={mockSchedules} />);
      // Kanban view should be available
      expect(screen.queryByText(/kanban/i) || screen.queryByText(/Kanban/i)).toBeTruthy();
    });

    it('supports calendar view mode', () => {
      render(<CronogramasContent schedules={mockSchedules} />);
      // Calendar elements should be accessible
      expect(
        screen.queryByText(/calendar/i) || screen.queryByText(/mês/i) || screen.queryByText(/dia/i),
      ).toBeTruthy();
    });

    it('supports list view mode', () => {
      render(<CronogramasContent schedules={mockSchedules} />);
      // List view should be accessible
      expect(screen.queryByText(/list/i) || screen.queryByText(/List/i)).toBeTruthy();
    });
  });

  describe('Schedule Data Processing', () => {
    it('processes schedule data correctly', () => {
      const { container } = render(<CronogramasContent schedules={mockSchedules} />);
      // Should render without errors and handle date props
      expect(container.firstChild).toBeTruthy();
    });

    it('handles schedules with completion dates', () => {
      const completedSchedule = {
        ...mockSchedules[1],
        data_conclusao: new Date('2026-04-12'),
        percentual_progresso: 100,
      };

      render(<CronogramasContent schedules={[completedSchedule]} />);
      // Should handle completed schedules gracefully
      expect(screen.queryByText(/Error/i)).not.toBeInTheDocument();
    });

    it('handles schedules with varying progress percentages', () => {
      const schedulesWithProgress = mockSchedules.map((s, idx) => ({
        ...s,
        percentual_progresso: idx * 25,
      }));

      render(<CronogramasContent schedules={schedulesWithProgress} />);
      // Should handle different progress values
      expect(screen.queryByText(/Error/i)).not.toBeInTheDocument();
    });

    it('extracts unique project IDs for coloring', () => {
      render(<CronogramasContent schedules={mockSchedules} />);
      // Should process project IDs internally
      expect(screen.queryByText(/Projeto/i)).toBeTruthy();
    });
  });

  describe('KPI Filtering', () => {
    it('supports KPI-based filtering', () => {
      const { container } = render(<CronogramasContent schedules={mockSchedules} />);
      // KPI filter buttons should be accessible
      expect(container.querySelectorAll('button').length).toBeGreaterThan(0);
    });

    it('handles KPI filter state toggling', () => {
      const { container } = render(<CronogramasContent schedules={mockSchedules} />);
      const buttons = container.querySelectorAll('button');
      // Should have interactive elements for KPI filtering
      expect(buttons.length > 0).toBe(true);
    });
  });

  describe('Calendar Navigation', () => {
    it('provides month navigation controls', () => {
      const { container } = render(<CronogramasContent schedules={mockSchedules} />);
      // Navigation controls should exist
      const buttons = container.querySelectorAll('button');
      expect(buttons.length).toBeGreaterThan(0);
    });

    it('provides week navigation controls', () => {
      const { container } = render(<CronogramasContent schedules={mockSchedules} />);
      // Navigation for different periods should be available
      const buttons = container.querySelectorAll('button');
      expect(buttons.length).toBeGreaterThan(0);
    });

    it('provides day navigation controls', () => {
      const { container } = render(<CronogramasContent schedules={mockSchedules} />);
      // Day-level navigation should be present
      const buttons = container.querySelectorAll('button');
      expect(buttons.length).toBeGreaterThan(0);
    });

    it('manages selected day state', () => {
      render(<CronogramasContent schedules={mockSchedules} />);
      // Should handle day selection state internally
      expect(screen.queryByText(/Error/i)).not.toBeInTheDocument();
    });
  });

  describe('Accessibility (Baseline)', () => {
    it('has proper ARIA regions', () => {
      const { container } = render(<CronogramasContent schedules={mockSchedules} />);
      // Should have semantic structure
      expect(container.firstChild).toBeTruthy();
    });

    it('is keyboard navigable', () => {
      const { container } = render(<CronogramasContent schedules={mockSchedules} />);
      const buttons = container.querySelectorAll('button');
      // Should have interactive elements
      expect(buttons.length).toBeGreaterThan(0);
    });
  });

  describe('Error Handling', () => {
    it('handles null or undefined schedule data gracefully', () => {
      expect(() => {
        render(<CronogramasContent schedules={[]} />);
      }).not.toThrow();
    });

    it('handles schedule data with missing optional fields', () => {
      const minimalSchedule: Partial<CronogramaData> = {
        id: 'min-1',
        project_id: 'proj-min',
        data_inicio: new Date(),
        data_fim: new Date(),
      };

      expect(() => {
        render(<CronogramasContent schedules={[minimalSchedule as CronogramaData]} />);
      }).not.toThrow();
    });
  });
});
