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
import { getYearMonthKey, DashboardProjectLike } from '@/lib/domain/kpi-calculations';
import { isConsideredActive } from '@/lib/domain/project-health';

interface MonthlyDeadlineData {
  month: string;
  label: string;
  count: number;
}

interface ProjectsByDeadlineChartProps {
  data: MonthlyDeadlineData[];
  className?: string;
  onBarClick?: (month: string) => void;
  activeMonth?: string | null;
}

function CustomTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{ payload: MonthlyDeadlineData }>;
}) {
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

export function ProjectsByDeadlineChart({
  data,
  className,
  onBarClick,
  activeMonth,
}: ProjectsByDeadlineChartProps) {
  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-medium">Cronograma de Entregas (Prazo Final)</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[280px]">
          {data.length === 0 ? (
            <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
              Sem dados de prazo para projetos ativos
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={data}
                margin={{ top: 20, right: 0, left: -20, bottom: 0 }}
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
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'hsl(var(--muted) / 0.3)' }} />
                <Bar
                  dataKey="count"
                  radius={[4, 4, 0, 0]}
                  animationBegin={0}
                  animationDuration={800}
                  animationEasing="ease-out"
                  onClick={(entry) => onBarClick?.(entry.month)}
                  style={onBarClick ? { cursor: 'pointer' } : undefined}
                >
                  {data.map((entry) => (
                    <Cell
                      key={entry.month}
                      fill="hsl(var(--primary))"
                      opacity={activeMonth && activeMonth !== entry.month ? 0.3 : 1}
                    />
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

export function buildMonthlyDeadlineData(projects: DashboardProjectLike[]): MonthlyDeadlineData[] {
  const counts: Record<string, number> = {};

  projects.forEach((p) => {
    // Apenas projetos ativos que tem prazo no cronograma
    if (isConsideredActive(p.status) && p.prazo_cronograma) {
      const d = new Date(p.prazo_cronograma);
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
      const label = `${monthNames[parseInt(m, 10) - 1]} ${year}`;
      return {
        month: monthKey,
        label,
        count,
      };
    });
}
