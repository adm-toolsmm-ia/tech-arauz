'use client';

import React, { useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
} from 'recharts';
import { Button } from '@/components/ui/button';
import type { OrgProcessMetrics } from '@/types/organization';

interface ProcessMetricsHistoryProps {
  processId: string;
  metrics: OrgProcessMetrics[];
  timeframe?: 'week' | 'month' | 'quarter';
  onTimeframeChange?: (timeframe: 'week' | 'month' | 'quarter') => void;
}

/**
 * ProcessMetricsHistory Component
 *
 * Displays time series chart with:
 * - Recharts line chart (actual vs target SLA)
 * - Responsive layout (mobile: stacked bars)
 * - Legend with metric names
 * - Empty state handling
 * - Period selection (week/month/quarter)
 *
 * Story 11.9: Process Metrics & SLAs Display
 */
export function ProcessMetricsHistory({
  processId,
  metrics,
  timeframe = 'month',
  onTimeframeChange,
}: ProcessMetricsHistoryProps) {
  // Transform metrics data for recharts
  const chartData = useMemo(() => {
    if (!metrics || metrics.length === 0) return [];

    return metrics
      .sort((a, b) => new Date(a.period_start).getTime() - new Date(b.period_start).getTime())
      .map((metric) => ({
        period: new Date(metric.period_start).toLocaleDateString('pt-BR', {
          month: 'short',
          day: 'numeric',
        }),
        avgDuration: metric.avg_duration_days || 0,
        compliance: metric.compliance_pct || 0,
        instances: metric.instances_count || 0,
        date: metric.period_start,
      }));
  }, [metrics]);

  if (chartData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Histórico de Métricas</CardTitle>
          <CardDescription>Nenhum histórico disponível para este período.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="py-8 text-center text-sm text-muted-foreground">
            Histórico será exibido conforme dados forem coletados ao longo do tempo.
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <CardTitle className="text-lg">Histórico de Métricas</CardTitle>
            <CardDescription>Tendências de duração e conformidade ao SLA</CardDescription>
          </div>

          {/* Timeframe Selector - Responsive */}
          <div className="flex flex-wrap gap-2" role="group" aria-label="Selecionador de período">
            <Button
              variant={timeframe === 'week' ? 'default' : 'outline'}
              size="sm"
              onClick={() => onTimeframeChange?.('week')}
              aria-pressed={timeframe === 'week'}
            >
              Semana
            </Button>
            <Button
              variant={timeframe === 'month' ? 'default' : 'outline'}
              size="sm"
              onClick={() => onTimeframeChange?.('month')}
              aria-pressed={timeframe === 'month'}
            >
              Mês
            </Button>
            <Button
              variant={timeframe === 'quarter' ? 'default' : 'outline'}
              size="sm"
              onClick={() => onTimeframeChange?.('quarter')}
              aria-pressed={timeframe === 'quarter'}
            >
              Trimestre
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Duration Trend Chart */}
        <div>
          <h3 className="mb-3 text-sm font-semibold">Duração Média Ao Longo do Tempo</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis
                dataKey="period"
                className="text-xs"
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis label={{ value: 'Dias', angle: -90, position: 'insideLeft' }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'var(--background)',
                  border: '1px solid var(--border)',
                  borderRadius: '6px',
                }}
                formatter={(value: number) => value.toFixed(2)}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="avgDuration"
                stroke="hsl(var(--primary))"
                name="Duração Média"
                strokeWidth={2}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Compliance Trend Chart */}
        <div>
          <h3 className="mb-3 text-sm font-semibold">Taxa de Conformidade ao SLA</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis
                dataKey="period"
                className="text-xs"
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis
                label={{ value: 'Conformidade %', angle: -90, position: 'insideLeft' }}
                domain={[0, 100]}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'var(--background)',
                  border: '1px solid var(--border)',
                  borderRadius: '6px',
                }}
                formatter={(value: number) => `${value.toFixed(1)}%`}
              />
              <Legend />
              <Bar
                dataKey="compliance"
                fill="hsl(var(--primary))"
                name="Conformidade %"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Instances Executed Stats - Responsive Grid */}
        <div className="grid grid-cols-1 gap-4 border-t pt-4 sm:grid-cols-3">
          <div className="text-center" role="region" aria-label="Total de instâncias executadas">
            <p className="mb-1 text-xs font-medium text-muted-foreground">Total de Instâncias</p>
            <p className="text-2xl font-bold">
              {chartData.reduce((sum, d) => sum + d.instances, 0)}
            </p>
          </div>
          <div className="text-center" role="region" aria-label="Duração média geral">
            <p className="mb-1 text-xs font-medium text-muted-foreground">Duração Média Geral</p>
            <p className="text-2xl font-bold">
              {(chartData.reduce((sum, d) => sum + d.avgDuration, 0) / chartData.length).toFixed(1)}
            </p>
            <p className="text-xs text-muted-foreground">dias</p>
          </div>
          <div className="text-center" role="region" aria-label="Conformidade média">
            <p className="mb-1 text-xs font-medium text-muted-foreground">Conformidade Média</p>
            <p className="text-2xl font-bold">
              {(chartData.reduce((sum, d) => sum + d.compliance, 0) / chartData.length).toFixed(1)}
            </p>
            <p className="text-xs text-muted-foreground">%</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
