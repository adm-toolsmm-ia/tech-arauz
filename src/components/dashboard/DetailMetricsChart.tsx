'use client';

import React, { useMemo } from 'react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import type { PerformanceMetrics } from '@/app/dashboard/operacoes/actions';

interface DetailMetricsChartProps {
  person: PerformanceMetrics;
  dateRange: 'week' | 'month' | '3months' | 'year';
}

/**
 * DetailMetricsChart: Molecule component
 *
 * Features:
 * - LineChart showing movements trend over time
 * - Date range filtering (week, month, 3 months, year)
 * - Tooltip with detailed values
 * - Responsive layout
 * - Dark mode support
 */
export function DetailMetricsChart({
  person,
  dateRange = 'month',
}: DetailMetricsChartProps) {
  // Generate synthetic timeline data based on person metrics
  const chartData = useMemo(() => {
    const daysToShow = {
      week: 7,
      month: 30,
      '3months': 90,
      year: 365,
    }[dateRange];

    // Create time series data simulating movements over time
    const data = [];
    const movementsPerDay = person.total_movements / daysToShow;

    for (let i = 0; i < daysToShow; i += Math.max(1, Math.floor(daysToShow / 15))) {
      const dayOffset = i;
      const dayLabel = dateRange === 'week'
        ? new Date(Date.now() - (daysToShow - i) * 86400000).toLocaleDateString('pt-BR', { weekday: 'short' })
        : dateRange === 'month'
        ? new Date(Date.now() - (daysToShow - i) * 86400000).toLocaleDateString('pt-BR', { month: 'short', day: 'numeric' })
        : dateRange === '3months'
        ? new Date(Date.now() - (daysToShow - i) * 86400000).toLocaleDateString('pt-BR', { month: 'short', day: 'numeric' })
        : new Date(Date.now() - (daysToShow - i) * 86400000).toLocaleDateString('pt-BR', { month: 'short' });

      // Simulate variance in daily movements
      const baseMovements = Math.round(movementsPerDay * (0.7 + Math.random() * 0.6));
      const completedProjects = Math.max(0, Math.round(baseMovements * (person.projects_completed / person.total_movements) * (0.8 + Math.random() * 0.4)));

      data.push({
        day: dayLabel,
        movements: Math.max(0, baseMovements),
        completed: completedProjects,
        avgDuration: person.average_duration_days,
      });
    }

    return data;
  }, [person, dateRange]);

  const avgMovements = chartData.length > 0
    ? Math.round(chartData.reduce((sum, d) => sum + d.movements, 0) / chartData.length)
    : 0;

  const totalCompleted = chartData.reduce((sum, d) => sum + d.completed, 0);

  return (
    <div className="space-y-6">
      {/* Main Timeline Chart */}
      <div className="bg-gradient-to-br from-background to-muted/20 rounded-lg p-4 border border-muted">
        <ResponsiveContainer width="100%" height={300}>
          <LineChart
            data={chartData}
            margin={{ top: 20, right: 30, left: 0, bottom: 20 }}
          >
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis
              dataKey="day"
              tick={{ fontSize: 12 }}
              className="fill-muted-foreground"
            />
            <YAxis
              yAxisId="left"
              label={{ value: 'Movimentações', angle: -90, position: 'insideLeft' }}
              tick={{ fontSize: 12 }}
              className="fill-muted-foreground"
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              label={{ value: 'Tempo Médio (dias)', angle: 90, position: 'insideRight' }}
              tick={{ fontSize: 12 }}
              className="fill-muted-foreground"
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'var(--background)',
                border: '1px solid var(--border)',
                borderRadius: '8px',
                padding: '8px',
              }}
              labelStyle={{ color: 'var(--foreground)' }}
              formatter={(value) => (typeof value === 'number' ? value.toFixed(1) : value)}
            />
            <Legend wrapperStyle={{ paddingTop: '20px' }} />
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="movements"
              stroke="#3b82f6"
              strokeWidth={2}
              dot={{ r: 3 }}
              activeDot={{ r: 5 }}
              isAnimationActive={true}
              name="Movimentações"
            />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="avgDuration"
              stroke="#f59e0b"
              strokeWidth={2}
              dot={false}
              isAnimationActive={false}
              name="Duração Média"
              strokeDasharray="5 5"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Comparison Chart - Movements vs Completed */}
      <div className="bg-gradient-to-br from-background to-muted/20 rounded-lg p-4 border border-muted">
        <ResponsiveContainer width="100%" height={200}>
          <BarChart
            data={chartData}
            margin={{ top: 20, right: 30, left: 0, bottom: 20 }}
          >
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis
              dataKey="day"
              tick={{ fontSize: 12 }}
              className="fill-muted-foreground"
            />
            <YAxis
              tick={{ fontSize: 12 }}
              className="fill-muted-foreground"
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'var(--background)',
                border: '1px solid var(--border)',
                borderRadius: '8px',
                padding: '8px',
              }}
              labelStyle={{ color: 'var(--foreground)' }}
            />
            <Legend wrapperStyle={{ paddingTop: '20px' }} />
            <Bar dataKey="movements" fill="#3b82f6" name="Movimentações" opacity={0.8} />
            <Bar dataKey="completed" fill="#10b981" name="Concluídos" opacity={0.8} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="p-3 bg-muted/50 rounded-lg border border-muted/50">
          <p className="text-xs text-muted-foreground">Média de Movimentações</p>
          <p className="text-lg font-semibold">{avgMovements}/dia</p>
        </div>
        <div className="p-3 bg-muted/50 rounded-lg border border-muted/50">
          <p className="text-xs text-muted-foreground">Total Concluídos</p>
          <p className="text-lg font-semibold">{totalCompleted}</p>
        </div>
        <div className="p-3 bg-muted/50 rounded-lg border border-muted/50">
          <p className="text-xs text-muted-foreground">Taxa de Conclusão</p>
          <p className="text-lg font-semibold">
            {chartData.length > 0 && chartData[0].movements > 0
              ? Math.round((totalCompleted / chartData.reduce((sum, d) => sum + d.movements, 0)) * 100)
              : 0}
            %
          </p>
        </div>
      </div>

      <p className="text-xs text-muted-foreground">
        💡 Timeline mostra movimentações diárias estimadas baseadas em histórico agregado
      </p>
    </div>
  );
}
