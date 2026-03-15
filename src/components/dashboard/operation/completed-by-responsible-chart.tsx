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
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

interface CompletedByResponsibleData {
  responsible: string;
  count: number;
}

interface CompletedByResponsibleChartProps {
  projects: Array<any>;
}

function CustomTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{ payload: CompletedByResponsibleData }>;
}) {
  if (!active || !payload?.length) return null;
  const data = payload[0].payload;
  return (
    <div className="rounded-lg border bg-popover px-3 py-2 text-sm shadow-md">
      <p className="font-medium">{data.responsible}</p>
      <p className="text-muted-foreground">
        {data.count} {data.count === 1 ? 'projeto concluído' : 'projetos concluídos'}
      </p>
    </div>
  );
}

export const CompletedByResponsibleChart: React.FC<CompletedByResponsibleChartProps> = ({
  projects,
}) => {
  const data = buildData(projects);

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-medium">Produtividade por Responsável</CardTitle>
        <CardDescription>Projetos concluídos (Histórico total)</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[280px]">
          {data.length === 0 ? (
            <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
              Sem dados de conclusão por responsável
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
                >
                  {data.map((entry) => (
                    <Cell key={entry.responsible} fill="hsl(var(--emerald-500))" />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

function buildData(projects: Array<any>): CompletedByResponsibleData[] {
  const counts: Record<string, number> = {};

  projects.forEach((p) => {
    const statusObj = (p.status || '').trim().toLowerCase();
    if (statusObj === 'concluído') {
      const resp = p.responsible || 'Sem responsável';
      counts[resp] = (counts[resp] || 0) + 1;
    }
  });

  return Object.entries(counts)
    .map(([responsible, count]) => ({
      responsible,
      count,
    }))
    .sort((a, b) => b.count - a.count);
}
