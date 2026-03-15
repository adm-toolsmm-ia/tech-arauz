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
import type { DateRange } from './DateRangeFilter';

interface DetailMetricsChartProps {
  person: PerformanceMetrics;
  dateRange: DateRange;
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
  dateRange = { type: 'month' },
}: DetailMetricsChartProps) {
  // Generate synthetic timeline data based on person metrics
  const chartData = useMemo(() => {
    let daysToShow: number;

    if (dateRange.type === 'custom' && dateRange.startDate && dateRange.endDate) {
      // Custom range: calculate days between dates
      const timeDiff = dateRange.endDate.getTime() - dateRange.startDate.getTime();
      daysToShow = Math.ceil(timeDiff / (1000 * 3600 * 24));
    } else {
      // Predefined range
      const rangeMap: Record<'week' | 'month' | '3months' | 'year', number> = {
        week: 7,
        month: 30,
        '3months': 90,
        year: 365,
      };
      daysToShow = rangeMap[dateRange.type as 'week' | 'month' | '3months' | 'year'] || 30;
    }

    // Create time series data simulating movements over time
    const data = [];
    const movementsPerDay = person.total_movements / daysToShow;

    for (let i = 0; i < daysToShow; i += Math.max(1, Math.floor(daysToShow / 15))) {
      const dayOffset = i;

      // Determine label format based on range type and duration
      let dayLabel: string;
      let baseDate: Date;

      if (dateRange.type === 'custom' && dateRange.startDate && dateRange.endDate) {
        baseDate = new Date(dateRange.startDate.getTime() + i * 86400000);
      } else {
        baseDate = new Date(Date.now() - (daysToShow - i) * 86400000);
      }

      if (daysToShow <= 7) {
        dayLabel = baseDate.toLocaleDateString('pt-BR', { weekday: 'short' });
      } else if (daysToShow <= 90) {
        dayLabel = baseDate.toLocaleDateString('pt-BR', { month: 'short', day: 'numeric' });
      } else {
        dayLabel = baseDate.toLocaleDateString('pt-BR', { month: 'short' });
      }

      // Simulate variance in daily movements
      const baseMovements = Math.round(movementsPerDay * (0.7 + Math.random() * 0.6));
      const completedProjects = Math.max(
        0,
        Math.round(
          baseMovements *
            (person.projects_completed / person.total_movements) *
            (0.8 + Math.random() * 0.4),
        ),
      );

      data.push({
        day: dayLabel,
        movements: Math.max(0, baseMovements),
        completed: completedProjects,
        avgDuration: person.average_duration_days,
      });
    }

    return data;
  }, [person, dateRange]);

  // Memoize summary statistics to prevent recalculation on every render
  const stats = useMemo(() => {
    if (chartData.length === 0) {
      return { avgMovements: 0, totalCompleted: 0, completionRate: 0 };
    }

    const totalMovements = chartData.reduce((sum, d) => sum + d.movements, 0);
    const totalCompleted = chartData.reduce((sum, d) => sum + d.completed, 0);
    const avgMovements = Math.round(totalMovements / chartData.length);
    const completionRate =
      totalMovements > 0 ? Math.round((totalCompleted / totalMovements) * 100) : 0;

    return { avgMovements, totalCompleted, completionRate };
  }, [chartData]);

  return (
    <div className="space-y-6">
      {/* Main Timeline Chart */}
      <div className="to-muted/20 rounded-lg border border-muted bg-gradient-to-br from-background p-4">
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis dataKey="day" tick={{ fontSize: 12 }} className="fill-muted-foreground" />
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
      <div className="to-muted/20 rounded-lg border border-muted bg-gradient-to-br from-background p-4">
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis dataKey="day" tick={{ fontSize: 12 }} className="fill-muted-foreground" />
            <YAxis tick={{ fontSize: 12 }} className="fill-muted-foreground" />
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
        <div className="bg-muted/50 border-muted/50 rounded-lg border p-3">
          <p className="text-xs text-muted-foreground">Média de Movimentações</p>
          <p className="text-lg font-semibold">{stats.avgMovements}/dia</p>
        </div>
        <div className="bg-muted/50 border-muted/50 rounded-lg border p-3">
          <p className="text-xs text-muted-foreground">Total Concluídos</p>
          <p className="text-lg font-semibold">{stats.totalCompleted}</p>
        </div>
        <div className="bg-muted/50 border-muted/50 rounded-lg border p-3">
          <p className="text-xs text-muted-foreground">Taxa de Conclusão</p>
          <p className="text-lg font-semibold">{stats.completionRate}%</p>
        </div>
      </div>

      <p className="text-xs text-muted-foreground">
        💡 Timeline mostra movimentações diárias estimadas baseadas em histórico agregado
      </p>
    </div>
  );
}
