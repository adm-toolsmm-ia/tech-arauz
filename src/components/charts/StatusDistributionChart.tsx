'use client';

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface DistributionData {
  status: string;
  label: string;
  count: number;
  color: string;
  percentage: number;
}

interface StatusDistributionChartProps {
  data: DistributionData[];
  onSegmentClick?: (fase: string) => void;
  activeStatus?: string | null;
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

function CustomTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{ payload: DistributionData }>;
}) {
  if (!active || !payload?.length) return null;
  const data = payload[0].payload;
  return (
    <div className="rounded-lg border bg-popover px-3 py-2 text-sm shadow-md">
      <p className="font-medium">{data.label}</p>
      <p className="text-muted-foreground">
        {data.count} ({data.percentage.toFixed(0)}%)
      </p>
    </div>
  );
}

function CustomLegend({ payload }: { payload?: Array<{ value: string; color: string }> }) {
  if (!payload) return null;
  return (
    <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 text-xs">
      {payload.map((entry) => (
        <div key={entry.value} className="flex items-center gap-1.5">
          <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: entry.color }} />
          <span className="text-muted-foreground">{entry.value}</span>
        </div>
      ))}
    </div>
  );
}

export function StatusDistributionChart({
  data,
  onSegmentClick,
  activeStatus,
}: StatusDistributionChartProps) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-medium">Distribuição por Fase</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[280px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="45%"
                innerRadius={55}
                outerRadius={90}
                paddingAngle={3}
                dataKey="count"
                nameKey="label"
                animationBegin={0}
                animationDuration={800}
                animationEasing="ease-out"
                onClick={(data) => onSegmentClick?.(data.status)}
                style={onSegmentClick ? { cursor: 'pointer' } : undefined}
              >
                {data.map((entry) => (
                  <Cell
                    key={entry.status}
                    fill={entry.color}
                    stroke="hsl(var(--background))"
                    strokeWidth={2}
                    opacity={activeStatus && activeStatus !== entry.status ? 0.3 : 1}
                  />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend content={<CustomLegend />} verticalAlign="bottom" />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

// Helper to build distribution data
export function buildDistributionData(
  projects: Array<{ status: string; fase_atual?: string | null }>,
): DistributionData[] {
  const counts: Record<string, number> = {};
  let totalActive = 0;

  projects.forEach((p) => {
    const status = (p.status || '').trim().toLowerCase();
    // Considerar somente projetos com status de ativo
    if (status !== 'cancelado' && status !== 'concluído') {
      const fase = p.fase_atual || 'Sem fase';
      counts[fase] = (counts[fase] || 0) + 1;
      totalActive++;
    }
  });

  const total = totalActive || 1;

  // Since phases are dynamic, we use a predefined palette
  const defaultColors = [
    '#3b82f6',
    '#f59e0b',
    '#a855f7',
    '#06b6d4',
    '#22c55e',
    '#ef4444',
    '#6b7280',
    '#eab308',
    '#ec4899',
    '#14b8a6',
    '#8b5cf6',
    '#f97316',
  ];

  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .map(([fase, count], index) => ({
      status: fase, // Keeping 'status' key for component compatibility
      label: fase,
      count,
      color: defaultColors[index % defaultColors.length],
      percentage: (count / total) * 100,
    }));
}
