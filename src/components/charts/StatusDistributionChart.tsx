'use client';

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface DistributionData {
  status: string;
  label: string;
  count: number;
  color: string;
  percentage: number;
}

interface StatusDistributionChartProps {
  data: DistributionData[];
}

const statusColors: Record<string, string> = {
  projeto_futuro: '#3b82f6',
  em_aprovacao: '#f59e0b',
  em_desenvolvimento: '#a855f7',
  em_homologacao: '#06b6d4',
  concluido: '#22c55e',
  cancelado: '#ef4444',
  suspenso: '#6b7280',
};

function CustomTooltip({ active, payload }: { active?: boolean; payload?: Array<{ payload: DistributionData }> }) {
  if (!active || !payload?.length) return null;
  const data = payload[0].payload;
  return (
    <div className="rounded-lg border bg-popover px-3 py-2 text-sm shadow-md">
      <p className="font-medium">{data.label}</p>
      <p className="text-muted-foreground">
        {data.count} ({data.percentage.toFixed(0)}%)
      </p>
    </div>
  );
}

function CustomLegend({ payload }: { payload?: Array<{ value: string; color: string }> }) {
  if (!payload) return null;
  return (
    <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 text-xs">
      {payload.map((entry) => (
        <div key={entry.value} className="flex items-center gap-1.5">
          <div
            className="h-2.5 w-2.5 rounded-full"
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-muted-foreground">{entry.value}</span>
        </div>
      ))}
    </div>
  );
}

export function StatusDistributionChart({ data }: StatusDistributionChartProps) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-medium">Distribuição por Status</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[280px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="45%"
                innerRadius={55}
                outerRadius={90}
                paddingAngle={3}
                dataKey="count"
                nameKey="label"
                animationBegin={0}
                animationDuration={800}
                animationEasing="ease-out"
              >
                {data.map((entry) => (
                  <Cell
                    key={entry.status}
                    fill={entry.color}
                    stroke="hsl(var(--background))"
                    strokeWidth={2}
                  />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend content={<CustomLegend />} verticalAlign="bottom" />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

// Helper to build distribution data
export function buildDistributionData(
  projects: Array<{ status: string }>
): DistributionData[] {
  const statusLabels: Record<string, string> = {
    projeto_futuro: 'Futuro',
    em_aprovacao: 'Em Aprovação',
    em_desenvolvimento: 'Em Desenvolvimento',
    em_homologacao: 'Em Homologação',
    concluido: 'Concluído',
    cancelado: 'Cancelado',
    suspenso: 'Suspenso',
  };

  const counts: Record<string, number> = {};
  projects.forEach((p) => {
    counts[p.status] = (counts[p.status] || 0) + 1;
  });

  const total = projects.length || 1;

  return Object.entries(statusLabels)
    .map(([status, label]) => ({
      status,
      label,
      count: counts[status] || 0,
      color: statusColors[status] || '#6b7280',
      percentage: ((counts[status] || 0) / total) * 100,
    }))
    .filter((d) => d.count > 0);
}
