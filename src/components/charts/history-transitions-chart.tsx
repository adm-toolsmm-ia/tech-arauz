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
import { GitBranch } from 'lucide-react';

interface TransitionData {
  step: string;
  count: number;
}

interface HistoryTransitionsChartProps {
  projects: Array<{ histories?: Array<{ step_to?: string; step_from?: string }> }>;
  groupBy?: 'step_to' | 'step_from';
}

function CustomTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{ payload: TransitionData }>;
}) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="rounded-lg border bg-popover px-3 py-2 text-sm shadow-md">
      <p className="font-medium">{d.step}</p>
      <p className="text-muted-foreground">
        {d.count} {d.count === 1 ? 'movimentação' : 'movimentações'}
      </p>
    </div>
  );
}

export function HistoryTransitionsChart({
  projects,
  groupBy = 'step_to',
}: HistoryTransitionsChartProps) {
  const data = React.useMemo(() => buildTransitionsData(projects, groupBy), [projects, groupBy]);

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-medium">Transições por Etapa</CardTitle>
        <CardDescription>
          {groupBy === 'step_to'
            ? 'Etapas de destino (step_to) mais frequentes'
            : 'Etapas de origem (step_from) mais frequentes'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <EmptyState
            title="Sem dados de transição"
            description="Nenhum registro com step_from/step_to em project_histories."
            icon={GitBranch}
            className="h-[280px] py-8"
          />
        ) : (
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={data}
                layout="vertical"
                margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" horizontal={false} />
                <XAxis
                  type="number"
                  className="fill-muted-foreground text-xs"
                  allowDecimals={false}
                />
                <YAxis
                  dataKey="step"
                  type="category"
                  width={220}
                  className="fill-muted-foreground text-xs"
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(v) => (v.length > 38 ? `${v.substring(0, 38)}...` : v)}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'hsl(var(--muted) / 0.3)' }} />
                <Bar dataKey="count" radius={[0, 4, 4, 0]} fill="hsl(var(--chart-2))">
                  {data.map((entry) => (
                    <Cell key={entry.step} fill="hsl(var(--chart-2))" />
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

function buildTransitionsData(
  projects: Array<{ histories?: Array<{ step_to?: string; step_from?: string }> }>,
  groupBy: 'step_to' | 'step_from'
): TransitionData[] {
  const counts: Record<string, number> = {};

  projects.forEach((p) => {
    const histories = p.histories || [];
    histories.forEach((h) => {
      const step = (groupBy === 'step_to' ? h.step_to : h.step_from) || 'Sem etapa';
      const key = step.trim() || 'Sem etapa';
      counts[key] = (counts[key] || 0) + 1;
    });
  });

  return Object.entries(counts)
    .map(([step, count]) => ({ step, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 12);
}
