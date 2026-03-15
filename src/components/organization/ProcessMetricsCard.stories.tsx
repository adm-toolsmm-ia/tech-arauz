import type { Meta, StoryObj } from '@storybook/react';
import { ProcessMetricsCard } from './ProcessMetricsCard';
import type { OrgProcessSla, OrgProcessMetrics } from '@/types/organization';

/**
 * ProcessMetricsCard Stories
 *
 * Storybook documentation for the ProcessMetricsCard component.
 * Shows different compliance states and empty state.
 *
 * Story 11.9: Process Metrics & SLAs Display
 */

const mockSla: OrgProcessSla = {
  id: '1',
  tenant_id: 'test-tenant',
  process_id: 'process-1',
  metric_name: 'completion_time',
  target_duration_days: 5,
  warning_threshold_pct: 80,
  critical_threshold_pct: 95,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

const meta = {
  title: 'Organization/ProcessMetricsCard',
  component: ProcessMetricsCard,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
} satisfies Meta<typeof ProcessMetricsCard>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Empty state - no metrics
 */
export const Empty: Story = {
  args: {
    processId: 'process-1',
  },
};

/**
 * On-track status (green) - compliance < 80%
 */
export const OnTrack: Story = {
  args: {
    processId: 'process-1',
    sla: mockSla,
    recentMetrics: {
      id: '1',
      tenant_id: 'test-tenant',
      process_id: 'process-1',
      period_start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      period_end: new Date().toISOString(),
      avg_duration_days: 3.5,
      compliance_pct: 70,
      instances_count: 15,
      metric_name: 'completion_time',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  },
};

/**
 * Warning status (yellow) - compliance 80-95%
 */
export const Warning: Story = {
  args: {
    processId: 'process-1',
    sla: mockSla,
    recentMetrics: {
      id: '1',
      tenant_id: 'test-tenant',
      process_id: 'process-1',
      period_start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      period_end: new Date().toISOString(),
      avg_duration_days: 4.5,
      compliance_pct: 90,
      instances_count: 12,
      metric_name: 'completion_time',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  },
};

/**
 * Critical status (red) - compliance > 95%
 */
export const Critical: Story = {
  args: {
    processId: 'process-1',
    sla: mockSla,
    recentMetrics: {
      id: '1',
      tenant_id: 'test-tenant',
      process_id: 'process-1',
      period_start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      period_end: new Date().toISOString(),
      avg_duration_days: 6.8,
      compliance_pct: 98,
      instances_count: 8,
      metric_name: 'completion_time',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  },
};

/**
 * Mobile responsive preview
 */
export const Mobile: Story = {
  args: {
    processId: 'process-1',
    sla: mockSla,
    recentMetrics: {
      id: '1',
      tenant_id: 'test-tenant',
      process_id: 'process-1',
      period_start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      period_end: new Date().toISOString(),
      metric_name: 'completion_time',
      avg_duration_days: 4.2,
      compliance_pct: 85,
      instances_count: 10,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  },
  parameters: {
    viewport: {
      defaultViewport: 'mobile1',
    },
  },
};
