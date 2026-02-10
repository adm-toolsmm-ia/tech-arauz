'use client';

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

interface PipelineData {
  status: string;
  label: string;
  count: number;
  color: string;
}

interface ProjectPipelineChartProps {
  data: PipelineData[];
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

function CustomTooltip({ active, payload }: { active?: boolean; payload?: Array<{ payload: PipelineData }> }) {
  if (!active || !payload?.length) return null;
  const data = payload[0].payload;
  return (
    <div className="rounded-lg border bg-popover px-3 py-2 text-sm shadow-md">
      <p className="font-medium">{data.label}</p>
      <p className="text-muted-foreground">
        {data.count} {data.count === 1 ? 'projeto' : 'projetos'}
      </p>
    </div>
  );
}

export function ProjectPipelineChart({ data }: ProjectPipelineChartProps) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-medium">Pipeline de Projetos</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[280px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              layout="vertical"
              margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" horizontal={false} />
              <XAxis type="number" className="text-xs fill-muted-foreground" allowDecimals={false} />
              <YAxis
                dataKey="label"
                type="category"
                width={120}
                className="text-xs fill-muted-foreground"
                tickLine={false}
                axisLine={false}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'hsl(var(--muted) / 0.3)' }} />
              <Bar
                dataKey="count"
                radius={[0, 4, 4, 0]}
                animationBegin={0}
                animationDuration={800}
                animationEasing="ease-out"
              >
                {data.map((entry) => (
                  <Cell
                    key={entry.status}
                    fill={statusColors[entry.status] || '#6b7280'}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

// Helper to transform raw project data into chart data
export function buildPipelineData(
  projects: Array<{ status: string }>
): PipelineData[] {
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

  return Object.entries(statusLabels)
    .map(([status, label]) => ({
      status,
      label,
      count: counts[status] || 0,
      color: statusColors[status] || '#6b7280',
    }))
    .filter((d) => d.count > 0);
}
