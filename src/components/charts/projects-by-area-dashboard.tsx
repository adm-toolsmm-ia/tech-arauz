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
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { DashboardProjectLike } from '@/lib/domain/kpi-calculations';
import { isConsideredActive } from '@/lib/domain/project-health';
import { EmptyState } from '@/components/ui/EmptyState';
import { BarChart3 } from 'lucide-react';

interface AreaData {
  area: string;
  total: number;
  active: number;
  completed: number;
}

interface ProjectsByAreaDashboardProps {
  data: AreaData[];
  className?: string;
  onAreaClick?: (area: string) => void;
  activeArea?: string | null;
}

function CustomTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{ payload: AreaData }>;
}) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="rounded-lg border bg-popover px-3 py-2 text-sm shadow-md">
      <p className="font-medium">{d.area}</p>
      <p className="text-muted-foreground">
        Total: {d.total} · Concluídos: {d.completed} · Ativos: {d.active}
      </p>
    </div>
  );
}

export function ProjectsByAreaDashboard({
  data,
  className,
  onAreaClick,
  activeArea,
}: ProjectsByAreaDashboardProps) {
  const sortedData = [...data].sort((a, b) => b.total - a.total);

  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-medium">Projetos por Área</CardTitle>
        <CardDescription>Visão geral de portfólio (Total / Concluídos / Ativos)</CardDescription>
      </CardHeader>
      <CardContent>
        {sortedData.length === 0 ? (
          <EmptyState
            title="Sem dados de áreas"
            description="Nenhum projeto com área definida para exibir."
            icon={BarChart3}
            className="h-[280px] py-8"
          />
        ) : (
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={sortedData}
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
                  dataKey="area"
                  type="category"
                  width={220}
                  className="fill-muted-foreground text-xs"
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(v) => (v.length > 38 ? `${v.substring(0, 38)}...` : v)}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'hsl(var(--muted) / 0.3)' }} />
                <Bar
                  dataKey="completed"
                  stackId="a"
                  fill="hsl(var(--chart-3))"
                  radius={[0, 0, 0, 0]}
                  name="Concluídos"
                  onClick={(entry) => onAreaClick?.(entry.area)}
                  style={onAreaClick ? { cursor: 'pointer' } : undefined}
                >
                  {sortedData.map((entry) => (
                    <Cell
                      key={`completed-${entry.area}`}
                      fill="hsl(var(--chart-3))"
                      opacity={activeArea && activeArea !== entry.area ? 0.4 : 1}
                    />
                  ))}
                </Bar>
                <Bar
                  dataKey="active"
                  stackId="a"
                  fill="hsl(var(--chart-1))"
                  radius={[0, 4, 4, 0]}
                  name="Ativos"
                  onClick={(entry) => onAreaClick?.(entry.area)}
                  style={onAreaClick ? { cursor: 'pointer' } : undefined}
                >
                  <LabelList
                    dataKey="total"
                    position="right"
                    fill="currentColor"
                    fontSize={12}
                    fontWeight={500}
                  />
                  {sortedData.map((entry) => (
                    <Cell
                      key={`active-${entry.area}`}
                      fill="hsl(var(--chart-1))"
                      opacity={activeArea && activeArea !== entry.area ? 0.4 : 1}
                    />
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

export function buildAreaDashboardData(projects: DashboardProjectLike[]): AreaData[] {
  const map: Record<string, AreaData> = {};

  projects.forEach((p) => {
    const area = (p.area || 'Sem área definida').trim();
    if (!map[area]) {
      map[area] = { area, total: 0, active: 0, completed: 0 };
    }

    map[area].total += 1;

    const statusObj = (p.status || '').trim().toLowerCase();
    if (statusObj === 'concluído') {
      map[area].completed += 1;
    }

    if (isConsideredActive(p.status)) {
      map[area].active += 1;
    }
  });

  return Object.values(map).sort((a, b) => b.total - a.total);
}
