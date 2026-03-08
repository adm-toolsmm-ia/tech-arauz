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
  LabelList,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/EmptyState';
import { Calendar } from 'lucide-react';
import { getYearMonthKey, DashboardProjectLike } from '@/lib/domain/kpi-calculations';

interface MonthlyDeadlineData {
  month: string;
  label: string;
  iniciado: number;
  em_execucao: number;
  concluido: number;
  total: number;
}

interface ProjectsByDeadlineChartProps {
  data: MonthlyDeadlineData[];
  className?: string;
  onBarClick?: (month: string) => void;
  activeMonth?: string | null;
}

function normalizeStatus(s: string | null | undefined): string {
  return (s || '')
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
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
        Total: {data.total} · Iniciado: {data.iniciado} · Em execução: {data.em_execucao} ·
        Concluídos: {data.concluido}
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
        <CardTitle className="text-base font-medium">
          Cronograma de Projetos por Prazo Final
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[280px]">
          {data.length === 0 ? (
            <EmptyState
              title="Sem dados de prazo"
              description="Nenhum projeto com prazo final definido."
              icon={Calendar}
              className="h-[280px] py-8"
            />
          ) : (
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
                  dataKey="iniciado"
                  stackId="a"
                  fill="hsl(var(--chart-2))"
                  radius={[0, 0, 0, 0]}
                  name="Iniciado"
                  onClick={(entry) => onBarClick?.(entry.month)}
                  style={onBarClick ? { cursor: 'pointer' } : undefined}
                >
                  {data.map((entry) => (
                    <Cell
                      key={`iniciado-${entry.month}`}
                      fill="hsl(var(--chart-2))"
                      opacity={activeMonth && activeMonth !== entry.month ? 0.3 : 1}
                    />
                  ))}
                </Bar>
                <Bar
                  dataKey="em_execucao"
                  stackId="a"
                  fill="hsl(var(--chart-1))"
                  radius={[0, 0, 0, 0]}
                  name="Em execução"
                  onClick={(entry) => onBarClick?.(entry.month)}
                  style={onBarClick ? { cursor: 'pointer' } : undefined}
                >
                  {data.map((entry) => (
                    <Cell
                      key={`em_execucao-${entry.month}`}
                      fill="hsl(var(--chart-1))"
                      opacity={activeMonth && activeMonth !== entry.month ? 0.3 : 1}
                    />
                  ))}
                </Bar>
                <Bar
                  dataKey="concluido"
                  stackId="a"
                  fill="hsl(var(--chart-3))"
                  radius={[4, 4, 0, 0]}
                  name="Concluídos"
                  onClick={(entry) => onBarClick?.(entry.month)}
                  style={onBarClick ? { cursor: 'pointer' } : undefined}
                >
                  <LabelList
                    dataKey="total"
                    position="top"
                    fill="currentColor"
                    fontSize={12}
                    fontWeight={500}
                  />
                  {data.map((entry) => (
                    <Cell
                      key={`concluido-${entry.month}`}
                      fill="hsl(var(--chart-3))"
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
  const byMonth: Record<string, { iniciado: number; em_execucao: number; concluido: number }> = {};

  projects.forEach((p) => {
    if (!p.prazo_final) return;
    const d = new Date(p.prazo_final);
    if (isNaN(d.getTime())) return;

    const monthKey = getYearMonthKey(d);
    if (!byMonth[monthKey]) {
      byMonth[monthKey] = { iniciado: 0, em_execucao: 0, concluido: 0 };
    }

    const status = normalizeStatus(p.status);
    if (status === 'iniciado') {
      byMonth[monthKey].iniciado += 1;
    } else if (status === 'concluido') {
      byMonth[monthKey].concluido += 1;
    } else {
      byMonth[monthKey].em_execucao += 1;
    }
  });

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

  return Object.entries(byMonth)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([monthKey, counts]) => {
      const [year, m] = monthKey.split('-');
      const label = `${monthNames[parseInt(m, 10) - 1]} ${year}`;
      const total = counts.iniciado + counts.em_execucao + counts.concluido;
      return {
        month: monthKey,
        label,
        iniciado: counts.iniciado,
        em_execucao: counts.em_execucao,
        concluido: counts.concluido,
        total,
      };
    });
}
