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
  LineChart,
  Line,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getYearMonthKey, DashboardProjectLike } from '@/lib/domain/kpi-calculations';
import { isConsideredActive } from '@/lib/domain/project-health';

interface MonthlyCompletedData {
  month: string;
  label: string;
  count: number;
}

interface CompletedProjectsTrendChartProps {
  data: MonthlyCompletedData[];
  className?: string;
  onPointClick?: (month: string) => void;
  activeMonth?: string | null;
}

function CustomTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{ payload: MonthlyCompletedData }>;
}) {
  if (!active || !payload?.length) return null;
  const data = payload[0].payload;
  return (
    <div className="rounded-lg border bg-popover px-3 py-2 text-sm shadow-md">
      <p className="font-medium">{data.label}</p>
      <p className="text-muted-foreground">
        {data.count} {data.count === 1 ? 'projeto concluído' : 'projetos concluídos'}
      </p>
    </div>
  );
}

export function CompletedProjectsTrendChart({
  data,
  className,
  onPointClick,
  activeMonth,
}: CompletedProjectsTrendChartProps) {
  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-medium">Projetos Concluídos por Mês</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[280px]">
          {data.length === 0 ? (
            <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
              Sem dados de conclusão
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={data}
                margin={{ top: 20, right: 20, left: -20, bottom: 0 }}
              >
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
                <Tooltip content={<CustomTooltip />} />
                <Line
                  type="monotone"
                  dataKey="count"
                  stroke="hsl(var(--primary))"
                  strokeWidth={3}
                  activeDot={{ r: 6, cursor: onPointClick ? 'pointer' : 'default', onClick: (_: any, payload: any) => onPointClick?.(payload.payload.month) }}
                  dot={{ r: 4, fill: "hsl(var(--background))", strokeWidth: 2, cursor: onPointClick ? 'pointer' : 'default', onClick: (_: any, payload: any) => onPointClick?.(payload.payload.month) }}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export function buildCompletedTrendData(projects: DashboardProjectLike[]): MonthlyCompletedData[] {
  const counts: Record<string, number> = {};

  projects.forEach((p) => {
    const status = (p.status || '').trim().toLowerCase();
    if (status === 'concluído' && p.end_date) {
      const d = new Date(p.end_date);
      if (!isNaN(d.getTime())) {
        const monthKey = getYearMonthKey(d);
        counts[monthKey] = (counts[monthKey] || 0) + 1;
      }
    }
  });

  const monthNames = [
    'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'
  ];

  return Object.entries(counts)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([monthKey, count]) => {
      const [year, m] = monthKey.split('-');
      const label = `${monthNames[parseInt(m, 10) - 1]}/${year.substring(2)}`;
      return {
        month: monthKey,
        label,
        count,
      };
    });
}
