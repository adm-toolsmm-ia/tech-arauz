'use client';

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Timer, ArrowRightCircle } from 'lucide-react';
import { DashboardProjectLike } from '@/lib/domain/kpi-calculations';

interface PhaseMetric {
  phase: string;
  avgDays: number;
  maxDays: number;
  sampleCount: number;
}

interface PhaseTimeMetricsProps {
  projects: Array<any>;
}

export const PhaseTimeMetrics: React.FC<PhaseTimeMetricsProps> = ({ projects }) => {
  const data = React.useMemo(() => buildPhaseMetrics(projects), [projects]);

  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex items-center gap-2">
          <Timer className="text-primary h-5 w-5" />
          <div>
            <CardTitle className="text-base font-medium">Tempo Médio por Fase</CardTitle>
            <CardDescription>
              Permanência histórica calculada via trilha de auditoria (em dias)
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <div className="flex h-32 items-center justify-center text-sm text-muted-foreground">
            Dados insuficientes para cálculo de médias
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {data.map((item) => (
              <div
                key={item.phase}
                className="hover:bg-muted/50 relative flex flex-col justify-between overflow-hidden rounded-lg border bg-card p-4 shadow-sm transition-all"
              >
                <div className="mb-2 flex items-center justify-between">
                  <h4
                    className="line-clamp-2 text-sm font-medium text-foreground"
                    title={item.phase}
                  >
                    {item.phase}
                  </h4>
                </div>
                <div>
                  <div className="flex items-end gap-1">
                    <span className="text-primary text-3xl font-bold tracking-tight">
                      {item.avgDays}
                    </span>
                    <span className="mb-1 text-sm font-medium text-muted-foreground">dias</span>
                  </div>
                  <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
                    <span title="Maior tempo registrado">Máx {item.maxDays}d</span>
                    <span className="flex items-center gap-1" title="Volume de medições">
                      <ArrowRightCircle className="h-3 w-3" />
                      {item.sampleCount}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

function buildPhaseMetrics(projects: Array<any>): PhaseMetric[] {
  const phaseStats: Record<string, { totalDays: number; maxDays: number; count: number }> = {};
  const now = new Date();

  projects.forEach((p) => {
    const histories = p.histories || [];

    if (histories.length < 2) return; // Need at least two movements or one + current time

    // Sort histories chronologically
    const sorted = [...histories].sort(
      (a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime(),
    );

    for (let i = 0; i < sorted.length; i++) {
      const current = sorted[i];
      const next = sorted[i + 1];
      const phase = current.step_to;

      if (!phase) continue;

      const startDate = new Date(current.date);
      // If there is no next movement and the project is active, calculate until today
      // If project is concluded/canceled we ideally stop at the last action
      let endDate = next ? new Date(next.date) : null;

      const s = (p.status || '').trim().toLowerCase();
      if (!endDate && s !== 'concluído' && s !== 'cancelado') {
        endDate = now;
      }

      if (endDate) {
        const diffMs = endDate.getTime() - startDate.getTime();
        const diffDays = Math.max(0, Math.round(diffMs / (1000 * 60 * 60 * 24)));

        if (!phaseStats[phase]) {
          phaseStats[phase] = { totalDays: 0, maxDays: 0, count: 0 };
        }

        phaseStats[phase].totalDays += diffDays;
        phaseStats[phase].count += 1;
        if (diffDays > phaseStats[phase].maxDays) {
          phaseStats[phase].maxDays = diffDays;
        }
      }
    }
  });

  return (
    Object.entries(phaseStats)
      .map(([phase, stats]) => ({
        phase,
        avgDays: Math.round(stats.totalDays / stats.count),
        maxDays: stats.maxDays,
        sampleCount: stats.count,
      }))
      // Sort by largest avg to smallest
      .sort((a, b) => b.avgDays - a.avgDays)
  );
}
