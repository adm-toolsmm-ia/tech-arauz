'use client';

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface TrendData {
  month: string;
  label: string;
  created: number;
  completed: number;
}

interface ProjectTrendChartProps {
  data: TrendData[];
}

function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ value: number; name: string; color: string }>;
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border bg-popover px-3 py-2 text-sm shadow-md">
      <p className="mb-1 font-medium">{label}</p>
      {payload.map((entry) => (
        <p key={entry.name} style={{ color: entry.color }}>
          {entry.name === 'created' ? 'Criados' : 'Concluídos'}: {entry.value}
        </p>
      ))}
    </div>
  );
}

export function ProjectTrendChart({ data }: ProjectTrendChartProps) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-medium">Tendência Mensal</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[280px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
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
              <Legend
                formatter={(value) => (value === 'created' ? 'Criados' : 'Concluídos')}
                wrapperStyle={{ fontSize: '12px' }}
              />
              <Line
                type="monotone"
                dataKey="created"
                stroke="hsl(221 83% 53%)"
                strokeWidth={2}
                dot={{ fill: 'hsl(221 83% 53%)', r: 4 }}
                activeDot={{ r: 6 }}
                animationBegin={0}
                animationDuration={1000}
                animationEasing="ease-out"
              />
              <Line
                type="monotone"
                dataKey="completed"
                stroke="hsl(142 71% 45%)"
                strokeWidth={2}
                dot={{ fill: 'hsl(142 71% 45%)', r: 4 }}
                activeDot={{ r: 6 }}
                animationBegin={200}
                animationDuration={1000}
                animationEasing="ease-out"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

// Helper to build trend data from projects
export function buildTrendData(
  projects: Array<{ status: string; created_at: string }>,
): TrendData[] {
  const monthNames = [
    'Jan',
    'Fev',
    'Mar',
    'Abr',
    'Mai',
    'Jun',
    'Jul',
    'Ago',
    'Set',
    'Out',
    'Nov',
    'Dez',
  ];
  const monthMap: Record<string, { created: number; completed: number }> = {};

  projects.forEach((p) => {
    if (!p.created_at) return;
    const date = new Date(p.created_at);
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

    if (!monthMap[key]) {
      monthMap[key] = { created: 0, completed: 0 };
    }
    monthMap[key].created += 1;
    if (p.status === 'concluido') {
      monthMap[key].completed += 1;
    }
  });

  return Object.entries(monthMap)
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-6) // last 6 months
    .map(([key, data]) => {
      const [year, month] = key.split('-');
      return {
        month: key,
        label: `${monthNames[parseInt(month) - 1]}/${year.slice(2)}`,
        created: data.created,
        completed: data.completed,
      };
    });
}
