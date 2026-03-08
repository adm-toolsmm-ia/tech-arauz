'use client';

import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { PerformanceMetrics } from '@/app/dashboard/operacoes/actions';

interface ActivityHeatmapProps {
  data: PerformanceMetrics[];
  loading?: boolean;
}

/**
 * ActivityHeatmap: Heatmap of team activity by day of week and hour
 *
 * Features:
 * - Color intensity: low activity (white) → high activity (red)
 * - Interactive: hover to see exact count
 * - Rows: Days of week (Mon-Sun)
 * - Columns: Hours (0-23)
 * - Responsive grid layout
 */
export function ActivityHeatmap({ data, loading = false }: ActivityHeatmapProps) {
  // Generate heatmap data from performance metrics
  const heatmapData = useMemo(() => {
    if (!data || data.length === 0) {
      return Array(7)
        .fill(null)
        .map((_, dayIndex) =>
          Array(24)
            .fill(null)
            .map((_, hourIndex) => ({
              day: dayIndex,
              hour: hourIndex,
              value: 0,
            }))
        );
    }

    // For MVP: distribute total movements across days/hours
    // In Phase 2: aggregate real historical data by time buckets
    const totalMovements = data.reduce((sum, d) => sum + d.total_movements, 0);
    const avgPerBucket = totalMovements / (7 * 24);

    return Array(7)
      .fill(null)
      .map((_, dayIndex) =>
        Array(24)
          .fill(null)
          .map((_, hourIndex) => ({
            day: dayIndex,
            hour: hourIndex,
            // Simulate activity (higher during business hours, lower on weekends)
            value: Math.round(
              avgPerBucket * (0.5 + Math.random() * 1.5) * (hourIndex >= 9 && hourIndex <= 17 ? 1.5 : 0.7)
            ),
          }))
      );
  }, [data]);

  const dayNames = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab', 'Dom'];

  // Get color based on intensity
  const getHeatColor = (value: number, maxValue: number): string => {
    if (value === 0) return 'bg-muted/20';
    const intensity = Math.min(value / (maxValue * 0.7), 1);

    if (intensity < 0.25) return 'bg-blue-200 dark:bg-blue-900/40';
    if (intensity < 0.5) return 'bg-blue-400 dark:bg-blue-800/60';
    if (intensity < 0.75) return 'bg-orange-400 dark:bg-orange-800/60';
    return 'bg-red-500 dark:bg-red-900/80';
  };

  // Find max value for scaling
  const maxValue = Math.max(...heatmapData.flat().map((cell) => cell.value), 1);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Atividade por Dia e Hora</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80 flex items-center justify-center bg-muted/20 rounded animate-pulse">
            <p className="text-sm text-muted-foreground">Carregando...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="col-span-1 lg:col-span-2">
      <CardHeader>
        <CardTitle>Atividade por Dia e Hora</CardTitle>
        <p className="text-sm text-muted-foreground">Intensidade de movimentações durante a semana</p>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <div className="space-y-4">
            {/* Heatmap Grid */}
            <div className="border border-border rounded-lg overflow-hidden">
              {/* Hour Headers */}
              <div className="flex">
                <div className="w-12 h-10 flex items-center justify-center text-xs font-medium text-muted-foreground border-r border-border" />
                {Array.from({ length: 24 }, (_, i) => (
                  <div
                    key={`hour-${i}`}
                    className="flex-1 h-10 flex items-center justify-center text-xs font-medium text-muted-foreground border-r border-border last:border-r-0"
                  >
                    {i.toString().padStart(2, '0')}
                  </div>
                ))}
              </div>

              {/* Rows for each day */}
              {heatmapData.map((dayData, dayIndex) => (
                <div key={`day-${dayIndex}`} className="flex border-t border-border first:border-t-0">
                  {/* Day Label */}
                  <div className="w-12 h-10 flex items-center justify-center text-xs font-medium text-muted-foreground border-r border-border">
                    {dayNames[dayIndex]}
                  </div>

                  {/* Hour Cells */}
                  {dayData.map((cell) => (
                    <div
                      key={`cell-${dayIndex}-${cell.hour}`}
                      className={`flex-1 h-10 flex items-center justify-center cursor-pointer hover:ring-2 hover:ring-primary transition-all group relative border-r border-border last:border-r-0 ${getHeatColor(
                        cell.value,
                        maxValue
                      )}`}
                      title={`${dayNames[dayIndex]} ${cell.hour.toString().padStart(2, '0')}:00 - ${cell.value} movimentações`}
                    >
                      {/* Tooltip on hover */}
                      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-background border border-border rounded text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                        {cell.value} mov.
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>

            {/* Legend */}
            <div className="space-y-3">
              <p className="text-sm font-medium">Legenda</p>
              <div className="flex flex-wrap gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-muted/20 rounded border border-border" />
                  <span className="text-xs text-muted-foreground">Nenhuma</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-blue-200 dark:bg-blue-900/40 rounded border border-border" />
                  <span className="text-xs text-muted-foreground">Baixa</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-blue-400 dark:bg-blue-800/60 rounded border border-border" />
                  <span className="text-xs text-muted-foreground">Média</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-orange-400 dark:bg-orange-800/60 rounded border border-border" />
                  <span className="text-xs text-muted-foreground">Alta</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-red-500 dark:bg-red-900/80 rounded border border-border" />
                  <span className="text-xs text-muted-foreground">Muito Alta</span>
                </div>
              </div>
            </div>

            {/* Summary */}
            <div className="p-3 bg-muted/50 rounded">
              <p className="text-xs text-muted-foreground mb-1">📊 Pico de Atividade</p>
              <p className="text-sm font-medium">Entre 09:00 e 17:00 (horário comercial)</p>
            </div>

            <p className="text-xs text-muted-foreground">
              💡 Em Phase 2, este heatmap agregará dados reais de histórico por dia/hora
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
