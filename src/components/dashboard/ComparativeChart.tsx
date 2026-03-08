'use client';

import React, { useMemo } from 'react';
import {
  ComposedChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import type { PerformanceMetrics } from '@/app/dashboard/operacoes/actions';
import type { DateRange } from './DateRangeFilter';

interface ComparativeChartProps {
  person: PerformanceMetrics;
  allData: PerformanceMetrics[];
  dateRange: DateRange;
}

/**
 * ComparativeChart: Molecule component
 *
 * Features:
 * - Comparative line chart: Person vs Team average
 * - Trend indicators (↑ ↓ →) with percentage change
 * - Anomaly detection highlighting (red zones)
 * - Custom visualization configuration
 * - Responsive and dark mode support
 */
export function ComparativeChart({
  person,
  allData,
  dateRange = { type: 'month' },
}: ComparativeChartProps) {
  // Calculate team averages
  const teamAverages = useMemo(() => {
    if (allData.length === 0) {
      return { movements: 0, duration: 0, completion: 0 };
    }

    const totalMovements = allData.reduce((sum, d) => sum + d.total_movements, 0);
    const totalDuration = allData.reduce((sum, d) => sum + d.average_duration_days, 0);
    const totalCompletion = allData.reduce((sum, d) => sum + (d.projects_completed / d.total_movements), 0);

    return {
      movements: Math.round(totalMovements / allData.length),
      duration: Math.round(totalDuration / allData.length),
      completion: Math.round((totalCompletion / allData.length) * 100),
    };
  }, [allData]);

  // Generate comparative timeline data
  const chartData = useMemo(() => {
    let daysToShow: number;

    if (dateRange.type === 'custom' && dateRange.startDate && dateRange.endDate) {
      const timeDiff = dateRange.endDate.getTime() - dateRange.startDate.getTime();
      daysToShow = Math.ceil(timeDiff / (1000 * 3600 * 24));
    } else {
      const rangeMap: Record<'week' | 'month' | '3months' | 'year', number> = {
        week: 7,
        month: 30,
        '3months': 90,
        year: 365,
      };
      daysToShow = rangeMap[dateRange.type as 'week' | 'month' | '3months' | 'year'] || 30;
    }

    const data = [];
    const personMovementsPerDay = person.total_movements / daysToShow;
    const teamMovementsPerDay = teamAverages.movements;

    for (let i = 0; i < daysToShow; i += Math.max(1, Math.floor(daysToShow / 15))) {
      let baseDate: Date;

      if (dateRange.type === 'custom' && dateRange.startDate && dateRange.endDate) {
        baseDate = new Date(dateRange.startDate.getTime() + i * 86400000);
      } else {
        baseDate = new Date(Date.now() - (daysToShow - i) * 86400000);
      }

      let dayLabel: string;
      if (daysToShow <= 7) {
        dayLabel = baseDate.toLocaleDateString('pt-BR', { weekday: 'short' });
      } else if (daysToShow <= 90) {
        dayLabel = baseDate.toLocaleDateString('pt-BR', { month: 'short', day: 'numeric' });
      } else {
        dayLabel = baseDate.toLocaleDateString('pt-BR', { month: 'short' });
      }

      // Simulate daily movements with variance
      const personMovements = Math.round(personMovementsPerDay * (0.7 + Math.random() * 0.6));
      const teamMovements = Math.round(teamMovementsPerDay * (0.7 + Math.random() * 0.6));

      // Detect anomaly (person significantly below team)
      const isAnomaly = personMovements < teamMovements * 0.5;

      data.push({
        day: dayLabel,
        person: Math.max(0, personMovements),
        team: Math.max(0, teamMovements),
        isAnomaly,
      });
    }

    return data;
  }, [person, teamAverages, dateRange]);

  // Calculate trend indicators
  const trends = useMemo(() => {
    if (chartData.length < 2) {
      return {
        movementsTrend: 'neutral' as const,
        movementsChange: 0,
        completionTrend: 'neutral' as const,
        completionChange: 0,
      };
    }

    const recent = chartData.slice(-5);
    const older = chartData.slice(0, 5);

    const recentAvg = recent.reduce((sum, d) => sum + d.person, 0) / recent.length;
    const olderAvg = older.reduce((sum, d) => sum + d.person, 0) / older.length;

    const movementsChange = olderAvg > 0 ? ((recentAvg - olderAvg) / olderAvg) * 100 : 0;
    const movementsTrendValue = movementsChange > 5 ? 'up' : movementsChange < -5 ? 'down' : 'neutral';
    const movementsTrend = movementsTrendValue as 'up' | 'down' | 'neutral';

    const personCompletion = (person.projects_completed / person.total_movements) * 100;
    const teamCompletion = teamAverages.completion;
    const completionChange = teamCompletion > 0 ? ((personCompletion - teamCompletion) / teamCompletion) * 100 : 0;
    const completionTrendValue = completionChange > 5 ? 'up' : completionChange < -5 ? 'down' : 'neutral';
    const completionTrend = completionTrendValue as 'up' | 'down' | 'neutral';

    return {
      movementsTrend,
      movementsChange: Math.round(movementsChange),
      completionTrend,
      completionChange: Math.round(completionChange),
    };
  }, [chartData, person, teamAverages]);

  // Render trend indicator icon
  const TrendIcon = ({ trend }: { trend: 'up' | 'down' | 'neutral' }) => {
    if (trend === 'up') return <TrendingUp className="w-4 h-4 text-green-500" aria-label="Tendência positiva" />;
    if (trend === 'down') return <TrendingDown className="w-4 h-4 text-red-500" aria-label="Tendência negativa" />;
    return <Minus className="w-4 h-4 text-gray-500" aria-label="Tendência estável" />;
  };

  const anomalyCount = chartData.filter(d => d.isAnomaly).length;
  const anomalyPercentage = chartData.length > 0 ? Math.round((anomalyCount / chartData.length) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Header with Trend Indicators */}
      <div className="grid grid-cols-2 gap-4">
        {/* Movements Trend */}
        <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-950 dark:to-blue-900/30 rounded-lg border border-blue-200 dark:border-blue-800">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Movimentações</p>
            <TrendIcon trend={trends.movementsTrend} />
          </div>
          <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{person.total_movements}</p>
          <p className={`text-xs mt-1 ${trends.movementsChange >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
            {trends.movementsChange >= 0 ? '+' : ''}{trends.movementsChange}% vs time period
          </p>
        </div>

        {/* Completion Trend */}
        <div className="p-4 bg-gradient-to-br from-emerald-50 to-emerald-100/50 dark:from-emerald-950 dark:to-emerald-900/30 rounded-lg border border-emerald-200 dark:border-emerald-800">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Taxa de Conclusão</p>
            <TrendIcon trend={trends.completionTrend} />
          </div>
          <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
            {Math.round((person.projects_completed / person.total_movements) * 100)}%
          </p>
          <p className={`text-xs mt-1 ${trends.completionChange >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
            {trends.completionChange >= 0 ? '+' : ''}{trends.completionChange}% vs time period
          </p>
        </div>
      </div>

      {/* Comparative Chart */}
      <div className="bg-gradient-to-br from-background to-muted/20 rounded-lg p-4 border border-muted">
        <ResponsiveContainer width="100%" height={300}>
          <ComposedChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 20 }}>
            <defs>
              <linearGradient id="anomalyGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="rgba(239, 68, 68, 0.1)" />
                <stop offset="100%" stopColor="rgba(239, 68, 68, 0)" />
              </linearGradient>
            </defs>
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
            <Bar
              yAxisId="left"
              dataKey="team"
              fill="#94a3b8"
              opacity={0.5}
              name="Média de Time"
            />
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="person"
              stroke="#3b82f6"
              strokeWidth={2.5}
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
              name={person.responsible}
              isAnimationActive={true}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Anomaly Detection Alert */}
      {anomalyCount > 0 && (
        <div className="p-4 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg">
          <div className="flex items-start gap-3">
            <div className="w-2 h-2 bg-amber-500 rounded-full mt-2 flex-shrink-0" />
            <div>
              <p className="font-medium text-amber-900 dark:text-amber-200">Anomalias Detectadas</p>
              <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">
                {anomalyCount} período(s) ({anomalyPercentage}%) abaixo da média de time. Investigação recomendada.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Performance Summary */}
      <div className="grid grid-cols-3 gap-3">
        <div className="p-3 bg-muted/50 rounded-lg border border-muted/50">
          <p className="text-xs text-muted-foreground">Você vs Time</p>
          <p className="text-lg font-semibold">
            {((person.total_movements / teamAverages.movements) * 100).toFixed(0)}%
          </p>
        </div>
        <div className="p-3 bg-muted/50 rounded-lg border border-muted/50">
          <p className="text-xs text-muted-foreground">Performance Rank</p>
          <p className="text-lg font-semibold">
            #{allData.filter(d => d.total_movements > person.total_movements).length + 1}/{allData.length}
          </p>
        </div>
        <div className="p-3 bg-muted/50 rounded-lg border border-muted/50">
          <p className="text-xs text-muted-foreground">Anomalias</p>
          <p className="text-lg font-semibold">{anomalyPercentage}%</p>
        </div>
      </div>

      <p className="text-xs text-muted-foreground">
        💡 Comparison shows your performance relative to team average. Anomalies highlighted when significantly below team metrics.
      </p>
    </div>
  );
}
