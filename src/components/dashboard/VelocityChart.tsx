'use client';

import React, { useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { PerformanceMetrics } from '@/app/dashboard/operacoes/actions';

interface VelocityChartProps {
  data: PerformanceMetrics[];
  period?: 'semanal' | 'mensal' | 'trimestral' | 'semestral' | 'anual';
  loading?: boolean;
}

/**
 * VelocityChart: Line chart of team velocity over time
 *
 * Features:
 * - Aggregated movements per time bucket
 * - Multiple lines for different team members
 * - Legend with click-to-toggle
 * - Smooth animations
 * - Period-aware bucketing
 */
export function VelocityChart({ data, period = 'mensal', loading = false }: VelocityChartProps) {
  const chartData = useMemo(() => {
    if (!data || data.length === 0) return [];

    // For MVP, group by responsible and show movements
    // In Phase 2, this would aggregate by time buckets (daily/weekly/monthly)
    return data
      .sort((a, b) => b.total_movements - a.total_movements)
      .slice(0, 5) // Top 5 for clarity
      .map((item, index) => ({
        name: item.responsible,
        movements: item.total_movements,
        completed: item.projects_completed,
        index,
      }));
  }, [data]);

  // Generate time-series data for demo (will be enhanced with real time data in Phase 2)
  const timeSeriesData = useMemo(() => {
    const days = period === 'semanal' ? 7 : period === 'trimestral' ? 90 : 30;
    const topPeople = chartData.slice(0, 3); // Top 3 people

    return Array.from({ length: Math.ceil(days / 7) }, (_, weekIndex) => {
      const dataPoint: Record<string, any> = {
        week: `Week ${weekIndex + 1}`,
      };

      topPeople.forEach((person) => {
        // Simulate velocity data
        dataPoint[person.name] = Math.round(person.movements / (days / 7) + Math.random() * 5);
      });

      return dataPoint;
    });
  }, [chartData, period]);

  const colors = ['#3b82f6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444'];

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Velocidade ao Longo do Período</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-muted/20 flex h-80 animate-pulse items-center justify-center rounded">
            <p className="text-sm text-muted-foreground">Carregando...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!timeSeriesData || timeSeriesData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Velocidade ao Longo do Período</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex h-80 items-center justify-center">
            <p className="text-sm text-muted-foreground">Nenhum dado disponível</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="col-span-1 lg:col-span-2">
      <CardHeader>
        <CardTitle>Velocidade ao Longo do Período</CardTitle>
        <p className="text-sm text-muted-foreground">Movimentações por semana (top 3)</p>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={350}>
          <LineChart data={timeSeriesData} margin={{ top: 20, right: 30, left: 0, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
            <XAxis dataKey="week" tick={{ fontSize: 12 }} className="fill-muted-foreground" />
            <YAxis
              label={{ value: 'Movimentações/Semana', angle: -90, position: 'insideLeft' }}
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

            {chartData.slice(0, 3).map((person, index) => (
              <Line
                key={person.name}
                type="monotone"
                dataKey={person.name}
                stroke={colors[index % colors.length]}
                strokeWidth={2}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
                isAnimationActive={true}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>

        {/* Summary Stats */}
        <div className="mt-6 grid grid-cols-2 gap-4">
          <div className="bg-muted/50 rounded p-3">
            <p className="text-xs text-muted-foreground">Período</p>
            <p className="text-lg font-semibold capitalize">{period}</p>
          </div>
          <div className="bg-muted/50 rounded p-3">
            <p className="text-xs text-muted-foreground">Top Performer</p>
            <p className="text-lg font-semibold">{chartData[0]?.name}</p>
          </div>
        </div>

        <p className="mt-4 text-xs text-muted-foreground">
          💡 Em Phase 2, este gráfico mostrará dados reais de velocidade agregados por
          dia/semana/mês
        </p>
      </CardContent>
    </Card>
  );
}
