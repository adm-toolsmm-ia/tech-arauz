'use client';

import React, { useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { PerformanceMetrics } from '@/app/dashboard/operacoes/actions';

interface MovementRankedChartProps {
  data: PerformanceMetrics[];
  loading?: boolean;
}

/**
 * MovementRankedChart: Bar chart of team movements ranked by count
 *
 * Features:
 * - Ranked descending by total_movements
 * - Tooltip with count + percentage
 * - Color-coded bars
 * - Responsive design
 * - Dark mode compatible
 */
export function MovementRankedChart({ data, loading = false }: MovementRankedChartProps) {
  const chartData = useMemo(() => {
    if (!data || data.length === 0) return [];

    // Sort by total_movements descending
    const sorted = [...data].sort((a, b) => b.total_movements - a.total_movements);
    const total = sorted.reduce((sum, d) => sum + d.total_movements, 0);

    // Map to chart format with percentage
    return sorted.map((item) => ({
      name: item.responsible,
      value: item.total_movements,
      percentage: total > 0 ? ((item.total_movements / total) * 100).toFixed(1) : 0,
    }));
  }, [data]);

  const colors = ['#3b82f6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

  const getBarColor = (index: number) => colors[index % colors.length];

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Movimentações por Responsável</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80 flex items-center justify-center bg-muted/20 rounded animate-pulse">
            <p className="text-sm text-muted-foreground">Carregando...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!chartData || chartData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Movimentações por Responsável</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80 flex items-center justify-center">
            <p className="text-sm text-muted-foreground">Nenhum dado disponível</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="col-span-1 lg:col-span-2">
      <CardHeader>
        <CardTitle>Movimentações por Responsável</CardTitle>
        <p className="text-sm text-muted-foreground">Ranking de atividade da equipe</p>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={350}>
          <BarChart
            data={chartData}
            margin={{ top: 20, right: 30, left: 0, bottom: 60 }}
          >
            <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
            <XAxis
              dataKey="name"
              angle={-45}
              textAnchor="end"
              height={100}
              tick={{ fontSize: 12 }}
              className="fill-muted-foreground"
            />
            <YAxis
              label={{ value: 'Total de Movimentações', angle: -90, position: 'insideLeft' }}
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
              formatter={(value, name, props) => [
                `${value} movimentações (${props.payload.percentage}%)`,
                'Atividade',
              ]}
              labelStyle={{ color: 'var(--foreground)' }}
            />
            <Legend wrapperStyle={{ paddingTop: '20px' }} />
            <Bar
              dataKey="value"
              name="Movimentações"
              radius={[8, 8, 0, 0]}
              isAnimationActive={true}
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={getBarColor(index)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>

        {/* Summary Stats */}
        <div className="mt-6 grid grid-cols-3 gap-4">
          <div className="p-3 bg-muted/50 rounded">
            <p className="text-xs text-muted-foreground">Total</p>
            <p className="text-lg font-semibold">
              {chartData.reduce((sum, d) => sum + d.value, 0)}
            </p>
          </div>
          <div className="p-3 bg-muted/50 rounded">
            <p className="text-xs text-muted-foreground">Média</p>
            <p className="text-lg font-semibold">
              {(chartData.reduce((sum, d) => sum + d.value, 0) / chartData.length).toFixed(1)}
            </p>
          </div>
          <div className="p-3 bg-muted/50 rounded">
            <p className="text-xs text-muted-foreground">Máximo</p>
            <p className="text-lg font-semibold">{Math.max(...chartData.map((d) => d.value))}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
