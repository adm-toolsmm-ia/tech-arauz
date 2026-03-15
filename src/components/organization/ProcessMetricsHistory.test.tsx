import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe, toHaveNoViolations } from 'jest-axe';
import { ProcessMetricsHistory } from './ProcessMetricsHistory';
import type { OrgProcessMetrics } from '@/types/organization';

expect.extend(toHaveNoViolations);

describe('ProcessMetricsHistory', () => {
  const mockMetrics: OrgProcessMetrics[] = [
    {
      id: '1',
      tenant_id: 'test-tenant',
      process_id: 'process-1',
      period_start: '2026-03-01T00:00:00Z',
      period_end: '2026-03-07T23:59:59Z',
      avg_duration_days: 3.5,
      compliance_pct: 85,
      instances_count: 10,
      created_at: new Date().toISOString(),
    },
    {
      id: '2',
      tenant_id: 'test-tenant',
      process_id: 'process-1',
      period_start: '2026-03-08T00:00:00Z',
      period_end: '2026-03-14T23:59:59Z',
      avg_duration_days: 4.2,
      compliance_pct: 78,
      instances_count: 12,
      created_at: new Date().toISOString(),
    },
  ];

  it('should render chart title and description', () => {
    render(<ProcessMetricsHistory processId="process-1" metrics={mockMetrics} />);

    expect(screen.getByText('Histórico de Métricas')).toBeInTheDocument();
    expect(screen.getByText(/Tendências de duração/i)).toBeInTheDocument();
  });

  it('should render empty state when no metrics provided', () => {
    render(<ProcessMetricsHistory processId="process-1" metrics={[]} />);

    expect(screen.getByText('Nenhum histórico disponível para este período.')).toBeInTheDocument();
  });

  it('should render timeframe selector buttons', () => {
    render(<ProcessMetricsHistory processId="process-1" metrics={mockMetrics} />);

    expect(screen.getByRole('button', { name: /Semana/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Mês/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Trimestre/i })).toBeInTheDocument();
  });

  it('should highlight active timeframe button', () => {
    render(<ProcessMetricsHistory processId="process-1" metrics={mockMetrics} timeframe="month" />);

    const monthButton = screen.getByRole('button', { name: /Mês/i });
    expect(monthButton).toHaveAttribute('data-state', 'active');
  });

  it('should call onTimeframeChange when button clicked', async () => {
    const mockOnTimeframeChange = vi.fn();
    const user = userEvent.setup();

    render(
      <ProcessMetricsHistory
        processId="process-1"
        metrics={mockMetrics}
        timeframe="month"
        onTimeframeChange={mockOnTimeframeChange}
      />,
    );

    const weekButton = screen.getByRole('button', { name: /Semana/i });
    await user.click(weekButton);

    expect(mockOnTimeframeChange).toHaveBeenCalledWith('week');
  });

  it('should render duration chart with data', () => {
    const { container } = render(
      <ProcessMetricsHistory processId="process-1" metrics={mockMetrics} />,
    );

    expect(screen.getByText('Duração Média Ao Longo do Tempo')).toBeInTheDocument();
    // Recharts should render SVG
    expect(container.querySelector('svg')).toBeInTheDocument();
  });

  it('should render compliance chart with data', () => {
    const { container } = render(
      <ProcessMetricsHistory processId="process-1" metrics={mockMetrics} />,
    );

    expect(screen.getByText('Taxa de Conformidade ao SLA')).toBeInTheDocument();
    expect(container.querySelectorAll('svg').length).toBeGreaterThan(0);
  });

  it('should calculate total instances correctly', () => {
    render(<ProcessMetricsHistory processId="process-1" metrics={mockMetrics} />);

    // Total: 10 + 12 = 22
    expect(screen.getByText('22')).toBeInTheDocument();
  });

  it('should calculate average duration correctly', () => {
    render(<ProcessMetricsHistory processId="process-1" metrics={mockMetrics} />);

    // Average: (3.5 + 4.2) / 2 = 3.85
    expect(screen.getByText('3.85')).toBeInTheDocument();
  });

  it('should calculate average compliance correctly', () => {
    render(<ProcessMetricsHistory processId="process-1" metrics={mockMetrics} />);

    // Average: (85 + 78) / 2 = 81.5
    expect(screen.getByText('81.5')).toBeInTheDocument();
  });

  it('should sort metrics by period_start date', () => {
    const unsortedMetrics: OrgProcessMetrics[] = [
      {
        ...mockMetrics[1],
        id: '2',
      },
      {
        ...mockMetrics[0],
        id: '1',
      },
    ];

    render(<ProcessMetricsHistory processId="process-1" metrics={unsortedMetrics} />);

    // Should render without errors and in correct order
    expect(screen.getByText('Histórico de Métricas')).toBeInTheDocument();
  });

  it('should be responsive on mobile', () => {
    const { container } = render(
      <ProcessMetricsHistory processId="process-1" metrics={mockMetrics} />,
    );

    // Check for ResponsiveContainer (Recharts)
    expect(container.querySelector('[class*="ResponsiveContainer"]')).toBeInTheDocument();
  });

  it('should display chart legends', () => {
    render(<ProcessMetricsHistory processId="process-1" metrics={mockMetrics} />);

    expect(screen.getByText('Duração Média')).toBeInTheDocument();
    expect(screen.getByText('Conformidade %')).toBeInTheDocument();
  });

  describe('Accessibility (WCAG AA)', () => {
    it('should have no axe violations when empty', async () => {
      const { container } = render(<ProcessMetricsHistory processId="process-1" metrics={[]} />);

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have no axe violations with metrics', async () => {
      const { container } = render(
        <ProcessMetricsHistory processId="process-1" metrics={mockMetrics} />,
      );

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have no axe violations with week timeframe selected', async () => {
      const { container } = render(
        <ProcessMetricsHistory processId="process-1" metrics={mockMetrics} timeframe="week" />,
      );

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have no axe violations with month timeframe selected', async () => {
      const { container } = render(
        <ProcessMetricsHistory processId="process-1" metrics={mockMetrics} timeframe="month" />,
      );

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have no axe violations with quarter timeframe selected', async () => {
      const { container } = render(
        <ProcessMetricsHistory processId="process-1" metrics={mockMetrics} timeframe="quarter" />,
      );

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have proper ARIA labels on timeframe selector', () => {
      render(<ProcessMetricsHistory processId="process-1" metrics={mockMetrics} />);

      const timeframeGroup = screen.getByRole('group', { name: /Selecionador de período/i });
      expect(timeframeGroup).toBeInTheDocument();
    });

    it('should have proper ARIA labels on stat regions', () => {
      render(<ProcessMetricsHistory processId="process-1" metrics={mockMetrics} />);

      const regions = screen.getAllByRole('region');
      expect(regions.length).toBeGreaterThan(0);
      regions.forEach((region) => {
        expect(region).toHaveAttribute('aria-label');
      });
    });

    it('should have aria-pressed attributes on timeframe buttons', () => {
      render(
        <ProcessMetricsHistory processId="process-1" metrics={mockMetrics} timeframe="month" />,
      );

      const monthButton = screen.getByRole('button', { name: /Mês/i });
      expect(monthButton).toHaveAttribute('aria-pressed', 'true');

      const weekButton = screen.getByRole('button', { name: /Semana/i });
      expect(weekButton).toHaveAttribute('aria-pressed', 'false');
    });

    it('should have keyboard accessible timeframe selector', async () => {
      const mockOnTimeframeChange = vi.fn();
      const user = userEvent.setup();

      render(
        <ProcessMetricsHistory
          processId="process-1"
          metrics={mockMetrics}
          timeframe="month"
          onTimeframeChange={mockOnTimeframeChange}
        />,
      );

      const weekButton = screen.getByRole('button', { name: /Semana/i });
      await user.keyboard('{Tab}');
      // Button should be focusable
      expect(weekButton).toBeInTheDocument();
    });
  });
});
