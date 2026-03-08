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
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { Activity } from 'lucide-react';

interface HistoryMovementData {
  entity: string;
  count: number;
}

interface HistoryMovementsChartProps {
  projects: Array<any>;
}

type FilterPeriod = '7days' | '30days' | 'all';
type FilterType = 'responsible' | 'area';

function CustomTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{ payload: HistoryMovementData }>;
}) {
  if (!active || !payload?.length) return null;
  const data = payload[0].payload;
  return (
    <div className="rounded-lg border bg-popover px-3 py-2 text-sm shadow-md">
      <p className="font-medium">{data.entity}</p>
      <p className="text-muted-foreground">
        {data.count} {data.count === 1 ? 'movimentação' : 'movimentações'}
      </p>
    </div>
  );
}

export const HistoryMovementsChart: React.FC<HistoryMovementsChartProps> = ({ projects }) => {
  const [period, setPeriod] = React.useState<FilterPeriod>('7days');
  const [type, setType] = React.useState<FilterType>('responsible');

  const data = React.useMemo(() => buildData(projects, period, type), [projects, period, type]);

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <CardTitle className="text-base font-medium">Histórico de Movimentações</CardTitle>
            <CardDescription>Ações de avanço registradas</CardDescription>
          </div>
          <div className="flex flex-col gap-2 sm:items-end">
            <div className="flex gap-1">
              <Badge
                variant={type === 'responsible' ? 'default' : 'outline'}
                className="cursor-pointer"
                onClick={() => setType('responsible')}
              >
                Responsável
              </Badge>
              <Badge
                variant={type === 'area' ? 'default' : 'outline'}
                className="cursor-pointer"
                onClick={() => setType('area')}
              >
                Área
              </Badge>
            </div>
            <div className="flex gap-1">
              <Badge
                variant={period === '7days' ? 'secondary' : 'outline'}
                className="cursor-pointer text-[10px]"
                onClick={() => setPeriod('7days')}
              >
                7 Dias
              </Badge>
              <Badge
                variant={period === '30days' ? 'secondary' : 'outline'}
                className="cursor-pointer text-[10px]"
                onClick={() => setPeriod('30days')}
              >
                30 Dias
              </Badge>
              <Badge
                variant={period === 'all' ? 'secondary' : 'outline'}
                className="cursor-pointer text-[10px]"
                onClick={() => setPeriod('all')}
              >
                Tudo
              </Badge>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[280px]">
          {data.length === 0 ? (
            <EmptyState
              title="Nenhuma movimentação no período"
              description="Não há registros em project_histories para o período selecionado."
              icon={Activity}
              className="h-full py-8"
            />
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
                  dataKey="entity"
                  type="category"
                  width={220}
                  className="fill-muted-foreground text-xs"
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) =>
                    value.length > 38 ? `${value.substring(0, 38)}...` : value
                  }
                />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'hsl(var(--muted) / 0.3)' }} />
                <Bar
                  dataKey="count"
                  radius={[0, 4, 4, 0]}
                  animationBegin={0}
                  animationDuration={800}
                  animationEasing="ease-out"
                  label={{ position: 'right', fill: 'currentColor', fontSize: 12, fontWeight: 500 }}
                >
                  {data.map((entry) => (
                    <Cell key={entry.entity} fill="hsl(var(--primary))" />
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

function buildData(
  projects: Array<any>,
  period: FilterPeriod,
  type: FilterType,
): HistoryMovementData[] {
  const counts: Record<string, number> = {};
  const now = new Date();

  projects.forEach((p) => {
    const histories = p.histories || [];
    histories.forEach((h: any) => {
      // Filter by period
      if (period !== 'all') {
        const hDate = new Date(h.date);
        const diffMs = now.getTime() - hDate.getTime();
        const diffDays = diffMs / (1000 * 60 * 60 * 24);

        if (period === '7days' && diffDays > 7) return;
        if (period === '30days' && diffDays > 30) return;
      }

      // Group by type: responsible_to/responsible_from (h.to/h.from) or project area
      let entityKey = 'Não identificado';
      if (type === 'responsible') {
        entityKey = (h.to || h.from || '-').trim();
        if (entityKey === '-') entityKey = 'Não identificado';
      } else if (type === 'area') {
        entityKey = (p.area || 'Sem área').trim();
      }

      counts[entityKey] = (counts[entityKey] || 0) + 1;
    });
  });

  return Object.entries(counts)
    .map(([entity, count]) => ({
      entity,
      count,
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 15); // limit to top 15 to avoid immense chart
}
