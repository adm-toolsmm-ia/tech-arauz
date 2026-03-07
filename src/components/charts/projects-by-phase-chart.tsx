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
import { EmptyState } from '@/components/ui/EmptyState';
import { Layers } from 'lucide-react';
import { DashboardProjectLike } from '@/lib/domain/kpi-calculations';
import { isConsideredActive } from '@/lib/domain/project-health';

interface PhaseData {
  phase: string;
  label: string;
  count: number;
}

interface ProjectsByPhaseChartProps {
  data: PhaseData[];
  className?: string;
  onBarClick?: (phase: string) => void;
  activePhase?: string | null;
}

function CustomTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{ payload: PhaseData }>;
}) {
  if (!active || !payload?.length) return null;
  const data = payload[0].payload;
  return (
    <div className="rounded-lg border bg-popover px-3 py-2 text-sm shadow-md">
      <p className="font-medium">{data.label}</p>
      <p className="text-muted-foreground">
        {data.count} {data.count === 1 ? 'projeto ativo' : 'projetos ativos'}
      </p>
    </div>
  );
}

export function ProjectsByPhaseChart({
  data,
  className,
  onBarClick,
  activePhase,
}: ProjectsByPhaseChartProps) {
  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-medium">Projetos por Fase (Ativos)</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[280px]">
          {data.length === 0 ? (
            <EmptyState
              title="Sem dados de fases"
              description="Nenhum projeto ativo com fase definida para exibir."
              icon={Layers}
              className="h-[280px] py-8"
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
                  dataKey="label"
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
                  onClick={(data) => onBarClick?.(data.phase)}
                  style={onBarClick ? { cursor: 'pointer' } : undefined}
                >
                  {data.map((entry) => (
                    <Cell
                      key={entry.phase}
                      fill="hsl(var(--primary))"
                      opacity={activePhase && activePhase !== entry.phase ? 0.3 : 1}
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

export function buildPhaseData(projects: DashboardProjectLike[]): PhaseData[] {
  const counts: Record<string, number> = {};

  projects.forEach((p) => {
    if (isConsideredActive(p.status)) {
      const phase = (p.fase_atual || 'Não informada').trim();
      counts[phase] = (counts[phase] || 0) + 1;
    }
  });

  return Object.entries(counts)
    .map(([phase, count]) => ({
      phase,
      label: phase,
      count,
    }))
    .sort((a, b) => b.count - a.count);
}
