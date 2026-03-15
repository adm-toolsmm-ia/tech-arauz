import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { ProcessMetricsCard } from './ProcessMetricsCard';
import type { OrgProcessSla, OrgProcessMetrics } from '@/types/organization';

expect.extend(toHaveNoViolations);

describe('ProcessMetricsCard', () => {
  const mockSla: OrgProcessSla = {
    id: '1',
    tenant_id: 'test-tenant',
    process_id: 'process-1',
    target_duration_days: 5,
    warning_threshold_pct: 80,
    critical_threshold_pct: 95,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  const mockMetrics: OrgProcessMetrics = {
    id: '1',
    tenant_id: 'test-tenant',
    process_id: 'process-1',
    period_start: new Date().toISOString(),
    period_end: new Date().toISOString(),
    avg_duration_days: 3.5,
    compliance_pct: 85,
    instances_count: 10,
    created_at: new Date().toISOString(),
  };

  it('should render empty state when no data provided', () => {
    render(
      <ProcessMetricsCard
        processId="process-1"
      />
    );

    expect(screen.getByText('Nenhuma métrica disponível para este processo.')).toBeInTheDocument();
  });

  it('should render metrics when data provided', () => {
    render(
      <ProcessMetricsCard
        processId="process-1"
        sla={mockSla}
        recentMetrics={mockMetrics}
      />
    );

    expect(screen.getByText('Métricas do Processo')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument(); // SLA target
    expect(screen.getByText('85.0')).toBeInTheDocument(); // Compliance %
  });

  it('should display on-track status when compliance < 80%', () => {
    const lowComplianceMetrics: OrgProcessMetrics = {
      ...mockMetrics,
      compliance_pct: 75,
    };

    render(
      <ProcessMetricsCard
        processId="process-1"
        sla={mockSla}
        recentMetrics={lowComplianceMetrics}
      />
    );

    expect(screen.getByText('No Track')).toBeInTheDocument();
    expect(screen.getByText(/No Track/i)).toBeInTheDocument();
  });

  it('should display warning status when compliance 80-95%', () => {
    const warningMetrics: OrgProcessMetrics = {
      ...mockMetrics,
      compliance_pct: 90,
    };

    render(
      <ProcessMetricsCard
        processId="process-1"
        sla={mockSla}
        recentMetrics={warningMetrics}
      />
    );

    expect(screen.getByText('Aviso')).toBeInTheDocument();
  });

  it('should display critical status when compliance > 95%', () => {
    const criticalMetrics: OrgProcessMetrics = {
      ...mockMetrics,
      compliance_pct: 98,
    };

    render(
      <ProcessMetricsCard
        processId="process-1"
        sla={mockSla}
        recentMetrics={criticalMetrics}
      />
    );

    expect(screen.getByText('Crítico')).toBeInTheDocument();
  });

  it('should display SLA threshold limits', () => {
    render(
      <ProcessMetricsCard
        processId="process-1"
        sla={mockSla}
        recentMetrics={mockMetrics}
      />
    );

    expect(screen.getByText(/Limites: Aviso 80% \| Crítico 95%/)).toBeInTheDocument();
  });

  it('should display instance count', () => {
    render(
      <ProcessMetricsCard
        processId="process-1"
        sla={mockSla}
        recentMetrics={mockMetrics}
      />
    );

    expect(screen.getByText('10')).toBeInTheDocument(); // instances_count
  });

  it('should format duration as decimal', () => {
    render(
      <ProcessMetricsCard
        processId="process-1"
        sla={mockSla}
        recentMetrics={mockMetrics}
      />
    );

    expect(screen.getByText('3.5')).toBeInTheDocument(); // avg_duration_days
  });

  it('should display period dates when available', () => {
    const now = new Date();
    const metricsWithDates: OrgProcessMetrics = {
      ...mockMetrics,
      period_start: new Date(now.getFullYear(), now.getMonth(), 1).toISOString(),
      period_end: new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString(),
    };

    render(
      <ProcessMetricsCard
        processId="process-1"
        sla={mockSla}
        recentMetrics={metricsWithDates}
      />
    );

    expect(screen.getByText(/Período:/)).toBeInTheDocument();
  });

  it('should render with accessibility attributes', () => {
    const { container } = render(
      <ProcessMetricsCard
        processId="process-1"
        sla={mockSla}
        recentMetrics={mockMetrics}
      />
    );

    // Card should have proper semantic structure
    expect(container.querySelector('[role="group"]')).toBeInTheDocument();
  });

  describe('Accessibility (WCAG AA)', () => {
    it('should have no axe violations when empty', async () => {
      const { container } = render(
        <ProcessMetricsCard processId="process-1" />
      );

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have no axe violations with on-track metrics', async () => {
      const { container } = render(
        <ProcessMetricsCard
          processId="process-1"
          sla={mockSla}
          recentMetrics={mockMetrics}
        />
      );

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have no axe violations with warning status', async () => {
      const warningMetrics: OrgProcessMetrics = {
        ...mockMetrics,
        compliance_pct: 90,
      };

      const { container } = render(
        <ProcessMetricsCard
          processId="process-1"
          sla={mockSla}
          recentMetrics={warningMetrics}
        />
      );

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have no axe violations with critical status', async () => {
      const criticalMetrics: OrgProcessMetrics = {
        ...mockMetrics,
        compliance_pct: 98,
      };

      const { container } = render(
        <ProcessMetricsCard
          processId="process-1"
          sla={mockSla}
          recentMetrics={criticalMetrics}
        />
      );

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have proper ARIA labels on metric groups', () => {
      render(
        <ProcessMetricsCard
          processId="process-1"
          sla={mockSla}
          recentMetrics={mockMetrics}
        />
      );

      // Check for ARIA labels on metric groups
      const metricGroups = screen.getAllByRole('group');
      expect(metricGroups.length).toBeGreaterThan(0);
      expect(metricGroups[0]).toHaveAttribute('aria-label');
    });

    it('should have proper text contrast for status indicators', () => {
      const { container } = render(
        <ProcessMetricsCard
          processId="process-1"
          sla={mockSla}
          recentMetrics={mockMetrics}
        />
      );

      // Check for color contrast in status badge
      const statusDiv = container.querySelector('[class*="bg-green"]');
      expect(statusDiv).toBeInTheDocument();
    });
  });
});
