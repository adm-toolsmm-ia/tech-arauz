import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { ProcessMetricsHistory } from './ProcessMetricsHistory';
import type { OrgProcessMetrics } from '@/types/organization';

/**
 * ProcessMetricsHistory Stories
 *
 * Storybook documentation for the ProcessMetricsHistory component.
 * Shows charts with real data, empty state, and different timeframes.
 *
 * Story 11.9: Process Metrics & SLAs Display
 */

const generateMockMetrics = (months: number): OrgProcessMetrics[] => {
  const metrics: OrgProcessMetrics[] = [];
  const now = new Date();

  for (let i = months - 1; i >= 0; i--) {
    const startDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const endDate = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);

    metrics.push({
      id: `metric-${i}`,
      tenant_id: 'test-tenant',
      process_id: 'process-1',
      metric_name: 'completion_time',
      period_start: startDate.toISOString(),
      period_end: endDate.toISOString(),
      avg_duration_days: 3 + Math.sin(i * 0.5) * 2 + Math.random() * 0.5,
      compliance_pct: 85 + Math.cos(i * 0.3) * 10 + Math.random() * 5,
      instances_count: Math.floor(10 + Math.random() * 10),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });
  }

  return metrics;
};

const meta = {
  title: 'Organization/ProcessMetricsHistory',
  component: ProcessMetricsHistory,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
  argTypes: {
    timeframe: {
      control: 'radio',
      options: ['week', 'month', 'quarter'],
      description: 'Current timeframe',
    },
  },
} satisfies Meta<typeof ProcessMetricsHistory>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Empty state - no metrics
 */
export const Empty: Story = {
  args: {
    processId: 'process-1',
    metrics: [],
    timeframe: 'month',
  },
};

/**
 * Monthly view with 3 months of data
 */
export const MonthlyView: Story = {
  args: {
    processId: 'process-1',
    metrics: generateMockMetrics(3),
    timeframe: 'month',
    onTimeframeChange: (timeframe) => console.log('Changed to:', timeframe),
  },
};

/**
 * Weekly view with multiple weeks
 */
export const WeeklyView: Story = {
  args: {
    processId: 'process-1',
    metrics: generateMockMetrics(4),
    timeframe: 'week',
    onTimeframeChange: (timeframe) => console.log('Changed to:', timeframe),
  },
};

/**
 * Quarterly view with 3 months
 */
export const QuarterlyView: Story = {
  args: {
    processId: 'process-1',
    metrics: generateMockMetrics(3),
    timeframe: 'quarter',
    onTimeframeChange: (timeframe) => console.log('Changed to:', timeframe),
  },
};

/**
 * Interactive story wrapper component
 */
function InteractiveWrapper(args: any) {
  const [timeframe, setTimeframe] = React.useState<'week' | 'month' | 'quarter'>('month');

  return <ProcessMetricsHistory {...args} timeframe={timeframe} onTimeframeChange={setTimeframe} />;
}

/**
 * Interactive story with timeframe controls
 */
export const Interactive: Story = {
  render: (args) => <InteractiveWrapper {...args} />,
  args: {
    processId: 'process-1',
    metrics: generateMockMetrics(6),
  },
};

/**
 * Mobile responsive preview
 */
export const Mobile: Story = {
  args: {
    processId: 'process-1',
    metrics: generateMockMetrics(3),
    timeframe: 'month',
    onTimeframeChange: (timeframe) => console.log('Changed to:', timeframe),
  },
  parameters: {
    viewport: {
      defaultViewport: 'mobile1',
    },
  },
};

/**
 * Large dataset with 12 months
 */
export const YearlyData: Story = {
  args: {
    processId: 'process-1',
    metrics: generateMockMetrics(12),
    timeframe: 'month',
    onTimeframeChange: (timeframe) => console.log('Changed to:', timeframe),
  },
};
