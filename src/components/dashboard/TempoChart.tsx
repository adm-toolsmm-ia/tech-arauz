'use client';

import React, { useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { PerformanceMetrics } from '@/app/dashboard/operacoes/actions';

interface TempoChartProps {
  data: PerformanceMetrics[];
  loading?: boolean;
}

/**
 * TempoChart: Bar chart of average duration with color gradient
 *
 * Color scale:
 * - Green: < 5 days (fast)
 * - Yellow: 5-15 days (medium)
 * - Red: > 15 days (slow)
 *
 * Features:
 * - Color-coded bars by performance level
 * - Tooltip with status label
 * - Sorted descending by duration
 * - Dark mode compatible
 */
export function TempoChart({ data, loading = false }: TempoChartProps) {
  const chartData = useMemo(() => {
    if (!data || data.length === 0) return [];

    // Sort by average_duration_days descending (slowest first)
    return [...data]
      .sort((a, b) => b.average_duration_days - a.average_duration_days)
      .map((item) => ({
        name: item.responsible,
        value: parseFloat(item.average_duration_days.toString()),
        status: getPerformanceStatus(item.average_duration_days),
      }));
  }, [data]);

  const getPerformanceStatus = (days: number): string => {
    if (days < 5) return 'Rápido';
    if (days < 15) return 'Médio';
    return 'Lento';
  };

  const getBarColor = (days: number): string => {
    if (days < 5) return '#22c55e'; // Green
    if (days < 15) return '#eab308'; // Yellow
    return '#ef4444'; // Red
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Tempo Médio de Permanência</CardTitle>
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
          <CardTitle>Tempo Médio de Permanência</CardTitle>
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
        <CardTitle>Tempo Médio de Permanência</CardTitle>
        <p className="text-sm text-muted-foreground">Dias em média por projeto</p>
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
              label={{ value: 'Dias', angle: -90, position: 'insideLeft' }}
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
              formatter={(value: number, name, props) => [
                `${value.toFixed(1)} dias (${props.payload.status})`,
                'Tempo Médio',
              ]}
              labelStyle={{ color: 'var(--foreground)' }}
            />
            <Bar dataKey="value" name="Dias" radius={[8, 8, 0, 0]} isAnimationActive={true}>
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={getBarColor(entry.value)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>

        {/* Legend & Summary */}
        <div className="mt-6 space-y-4">
          <div className="grid grid-cols-3 gap-3">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-green-500" />
              <span className="text-xs">Rápido (&lt;5d)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-yellow-500" />
              <span className="text-xs">Médio (5-15d)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-red-500" />
              <span className="text-xs">Lento (&gt;15d)</span>
            </div>
          </div>

          {/* Summary Stats */}
          <div className="grid grid-cols-3 gap-4">
            <div className="p-3 bg-muted/50 rounded">
              <p className="text-xs text-muted-foreground">Média Geral</p>
              <p className="text-lg font-semibold">
                {(chartData.reduce((sum, d) => sum + d.value, 0) / chartData.length).toFixed(1)}d
              </p>
            </div>
            <div className="p-3 bg-muted/50 rounded">
              <p className="text-xs text-muted-foreground">Mais Rápido</p>
              <p className="text-lg font-semibold">
                {Math.min(...chartData.map((d) => d.value)).toFixed(1)}d
              </p>
            </div>
            <div className="p-3 bg-muted/50 rounded">
              <p className="text-xs text-muted-foreground">Mais Lento</p>
              <p className="text-lg font-semibold">
                {Math.max(...chartData.map((d) => d.value)).toFixed(1)}d
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
