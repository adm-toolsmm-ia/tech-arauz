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

interface WorkloadData {
  responsible: string;
  count: number;
}

interface ResponsibleWorkloadChartProps {
  data: WorkloadData[];
  className?: string;
  onBarClick?: (responsible: string) => void;
}

function CustomTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{ payload: WorkloadData }>;
}) {
  if (!active || !payload?.length) return null;
  const data = payload[0].payload;
  return (
    <div className="rounded-lg border bg-popover px-3 py-2 text-sm shadow-md">
      <p className="font-medium">{data.responsible}</p>
      <p className="text-muted-foreground">
        {data.count} {data.count === 1 ? 'projeto ativo' : 'projetos ativos'}
      </p>
    </div>
  );
}

export function ResponsibleWorkloadChart({ data, className, onBarClick }: ResponsibleWorkloadChartProps) {
  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-medium">Carga de Trabalho (Ativos)</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[280px]">
          {data.length === 0 ? (
            <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
              Sem dados de responsáveis
            </div>
          ) : (
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
                  dataKey="responsible"
                  type="category"
                  width={140}
                  className="fill-muted-foreground text-xs"
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) =>
                    value.length > 20 ? `${value.substring(0, 20)}...` : value
                  }
                />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'hsl(var(--muted) / 0.3)' }} />
                <Bar
                  dataKey="count"
                  radius={[0, 4, 4, 0]}
                  animationBegin={0}
                  animationDuration={800}
                  animationEasing="ease-out"
                  onClick={(data) => onBarClick?.(data.responsible)}
                  style={onBarClick ? { cursor: 'pointer' } : undefined}
                >
                  {data.map((entry, index) => (
                    <Cell key={entry.responsible} fill="hsl(var(--primary))" />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// Helper to transform raw project data into workload data
export function buildWorkloadData(
  projects: Array<{ status: string; responsible?: string | null }>,
): WorkloadData[] {
  const counts: Record<string, number> = {};

  projects.forEach((p) => {
    const status = (p.status || '').trim().toLowerCase();
    // Consider only "iniciado" or "em execução"
    if (status === 'iniciado' || status === 'em execução') {
      const responsible = p.responsible || 'Sem responsável';
      counts[responsible] = (counts[responsible] || 0) + 1;
    }
  });

  return Object.entries(counts)
    .map(([responsible, count]) => ({
      responsible,
      count,
    }))
    .sort((a, b) => b.count - a.count);
}
