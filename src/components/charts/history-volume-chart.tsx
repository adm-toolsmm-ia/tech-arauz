'use client';

import * as React from 'react';
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
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/EmptyState';
import { TrendingUp } from 'lucide-react';

interface VolumeData {
  period: string;
  label: string;
  count: number;
}

interface HistoryVolumeChartProps {
  projects: Array<{ histories?: Array<{ date?: string }> }>;
  groupBy?: 'day' | 'week';
}

function CustomTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{ payload: VolumeData }>;
}) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="rounded-lg border bg-popover px-3 py-2 text-sm shadow-md">
      <p className="font-medium">{d.label}</p>
      <p className="text-muted-foreground">
        {d.count} {d.count === 1 ? 'movimentação' : 'movimentações'}
      </p>
    </div>
  );
}

export const HistoryVolumeChart: React.FC<HistoryVolumeChartProps> = ({ projects, groupBy = 'week' }) => {
  const data = React.useMemo(() => buildVolumeData(projects, groupBy), [projects, groupBy]);

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-medium">Volume de Movimentações</CardTitle>
        <CardDescription>
          Quantidade de registros em project_histories por {groupBy === 'day' ? 'dia' : 'semana'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <EmptyState
            title="Sem dados de movimentação"
            description="Nenhum registro em project_histories para exibir."
            icon={TrendingUp}
            className="h-[280px] py-8"
          />
        ) : (
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} margin={{ top: 20, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" vertical={false} />
                <XAxis
                  dataKey="label"
                  className="fill-muted-foreground text-xs"
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  className="fill-muted-foreground text-xs"
                  allowDecimals={false}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'hsl(var(--muted) / 0.3)' }} />
                <Bar
                  dataKey="count"
                  radius={[4, 4, 0, 0]}
                  fill="hsl(var(--chart-1))"
                  label={{ position: 'top', fill: 'currentColor', fontSize: 12, fontWeight: 500 }}
                >
                  {data.map((entry) => (
                    <Cell key={entry.period} fill="hsl(var(--chart-1))" />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function buildVolumeData(
  projects: Array<{ histories?: Array<{ date?: string }> }>,
  groupBy: 'day' | 'week',
): VolumeData[] {
  const counts: Record<string, number> = {};
  const now = new Date();

  projects.forEach((p) => {
    const histories = p.histories || [];
    histories.forEach((h) => {
      const d = h.date ? new Date(h.date) : null;
      if (!d || isNaN(d.getTime())) return;
      const diffDays = (now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24);
      if (diffDays > 90) return;

      let key: string;
      let label: string;
      if (groupBy === 'day') {
        key = d.toISOString().slice(0, 10);
        label = d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
      } else {
        const weekStart = new Date(d);
        weekStart.setDate(d.getDate() - ((d.getDay() + 6) % 7));
        key = weekStart.toISOString().slice(0, 10);
        label = `Sem ${weekStart.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}`;
      }
      counts[key] = (counts[key] || 0) + 1;
    });
  });

  return Object.entries(counts)
    .map(([period, count]) => {
      const d = new Date(period);
      const label =
        groupBy === 'day'
          ? d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
          : `Sem ${d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit' })}`;
      return { period, label, count };
    })
    .sort((a, b) => a.period.localeCompare(b.period))
    .slice(-14);
}
