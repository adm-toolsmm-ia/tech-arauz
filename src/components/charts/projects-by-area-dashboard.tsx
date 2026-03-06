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
import { DashboardProjectLike } from '@/lib/domain/kpi-calculations';
import { isConsideredActive } from '@/lib/domain/project-health';
import { Badge } from '@/components/ui/badge';

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

export function ProjectsByAreaDashboard({
  data,
  className,
  onAreaClick,
  activeArea,
}: ProjectsByAreaDashboardProps) {
  // Sort areas by total descending to show the biggest areas first
  const sortedData = [...data].sort((a, b) => b.total - a.total);

  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-medium">Projetos por Área</CardTitle>
        <CardDescription>Visão geral de portfólio (Total / Concluídos / Ativos)</CardDescription>
      </CardHeader>
      <CardContent>
        {sortedData.length === 0 ? (
          <div className="flex h-[280px] items-center justify-center text-sm text-muted-foreground">
            Sem dados de áreas
          </div>
        ) : (
          <div className="space-y-4 pt-2">
            {sortedData.map((areaData) => {
              const isActive = activeArea === areaData.area;
              return (
                <div
                  key={areaData.area}
                  role="button"
                  tabIndex={0}
                  className={`relative cursor-pointer overflow-hidden rounded-lg border p-4 transition-all hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                    isActive ? 'border-primary ring-1 ring-primary' : ''
                  }`}
                  onClick={() => onAreaClick?.(areaData.area)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      onAreaClick?.(areaData.area);
                    }
                  }}
                >
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold">{areaData.area}</h4>
                    <span className="text-2xl font-bold">{areaData.total}</span>
                  </div>
                  <div className="mt-3 flex gap-4 text-sm">
                    <div className="space-y-1">
                      <p className="text-muted-foreground">Concluídos</p>
                      <p className="font-medium text-emerald-500">{areaData.completed}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-muted-foreground">Ativos</p>
                      <p className="font-medium text-blue-500">{areaData.active}</p>
                    </div>
                  </div>
                  {/* Subtle bar background to indicate volume graphically */}
                  <div
                    className="absolute inset-x-0 bottom-0 h-1 bg-primary/20"
                    style={{
                      width: `${(areaData.total / sortedData[0].total) * 100}%`,
                    }}
                  />
                </div>
              );
            })}
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
