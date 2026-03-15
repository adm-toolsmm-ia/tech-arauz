'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, CheckCircle, AlertTriangle } from 'lucide-react';
import type { OrgProcessSla, OrgProcessMetrics } from '@/types/organization';

interface ProcessMetricsCardProps {
  processId: string;
  sla?: OrgProcessSla;
  recentMetrics?: OrgProcessMetrics;
}

/**
 * ProcessMetricsCard Component
 *
 * Displays:
 * - Target SLA (days)
 * - Current avg duration
 * - Compliance percentage
 * - Visual indicators (green/yellow/red)
 * - Period information
 * - Empty state handling
 *
 * Story 11.9: Process Metrics & SLAs Display
 */
export function ProcessMetricsCard({
  processId,
  sla,
  recentMetrics,
}: ProcessMetricsCardProps) {
  // Calculate compliance status based on actual vs SLA
  const getComplianceStatus = (
    avgDuration?: number | null,
    targetDuration?: number | null,
    compliancePct?: number | null
  ): {
    status: 'on-track' | 'warning' | 'critical';
    color: string;
    icon: React.ReactNode;
    label: string;
  } => {
    const pct = compliancePct || 0;

    if (pct < 80) {
      return {
        status: 'on-track',
        color: 'bg-green-100 text-green-900',
        icon: <CheckCircle className="h-4 w-4 text-green-600" />,
        label: 'No Track',
      };
    } else if (pct < 95) {
      return {
        status: 'warning',
        color: 'bg-yellow-100 text-yellow-900',
        icon: <AlertTriangle className="h-4 w-4 text-yellow-600" />,
        label: 'Aviso',
      };
    } else {
      return {
        status: 'critical',
        color: 'bg-red-100 text-red-900',
        icon: <AlertCircle className="h-4 w-4 text-red-600" />,
        label: 'Crítico',
      };
    }
  };

  if (!sla && !recentMetrics) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Métricas do Processo</CardTitle>
          <CardDescription>
            Nenhuma métrica disponível para este processo.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6 text-sm text-muted-foreground">
            Métricas serão exibidas após os primeiros registros de conclusão.
          </div>
        </CardContent>
      </Card>
    );
  }

  const complianceStatus = getComplianceStatus(
    recentMetrics?.avg_duration_days,
    sla?.target_duration_days,
    recentMetrics?.compliance_pct
  );

  const avgDuration = recentMetrics?.avg_duration_days || 0;
  const targetDuration = sla?.target_duration_days || 0;
  const compliancePct = recentMetrics?.compliance_pct || 0;
  const instanceCount = recentMetrics?.instances_count || 0;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">Métricas do Processo</CardTitle>
            <CardDescription>
              {recentMetrics?.period_start && recentMetrics?.period_end
                ? `Período: ${new Date(recentMetrics.period_start).toLocaleDateString()} - ${new Date(
                    recentMetrics.period_end
                  ).toLocaleDateString()}`
                : 'Período: Últimas execuções'}
            </CardDescription>
          </div>
          <div className={`rounded-full p-2 ${complianceStatus.color}`}>
            {complianceStatus.icon}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Status Badge */}
        <div className="flex gap-2 items-center">
          <Badge variant="outline">{complianceStatus.label}</Badge>
          <span className="text-sm font-medium">{compliancePct.toFixed(1)}% de conformidade</span>
        </div>

        {/* Metrics Grid - Responsive */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Target SLA */}
          <div className="rounded-md border p-3" role="group" aria-label="SLA Alvo">
            <p className="text-xs font-medium text-muted-foreground mb-1">SLA Alvo</p>
            <p className="text-lg font-bold">{targetDuration}</p>
            <p className="text-xs text-muted-foreground">dias</p>
          </div>

          {/* Avg Duration */}
          <div className="rounded-md border p-3" role="group" aria-label="Duração Média">
            <p className="text-xs font-medium text-muted-foreground mb-1">Duração Média</p>
            <p className="text-lg font-bold">{avgDuration.toFixed(1)}</p>
            <p className="text-xs text-muted-foreground">dias</p>
          </div>

          {/* Instance Count */}
          <div className="rounded-md border p-3" role="group" aria-label="Instâncias Executadas">
            <p className="text-xs font-medium text-muted-foreground mb-1">Instâncias</p>
            <p className="text-lg font-bold">{instanceCount}</p>
            <p className="text-xs text-muted-foreground">executadas</p>
          </div>
        </div>

        {/* Status Message */}
        <div className={`rounded-md p-3 ${complianceStatus.color}`}>
          {complianceStatus.status === 'on-track' && (
            <p className="text-sm font-medium">
              O processo está dentro do SLA com margem de segurança.
            </p>
          )}
          {complianceStatus.status === 'warning' && (
            <p className="text-sm font-medium">
              O processo está se aproximando do limite de SLA. Considere otimizar.
            </p>
          )}
          {complianceStatus.status === 'critical' && (
            <p className="text-sm font-medium">
              O processo está excedendo o SLA. Ação corretiva recomendada.
            </p>
          )}
        </div>

        {/* SLA Thresholds */}
        {sla && (
          <div className="text-xs text-muted-foreground pt-2 border-t">
            <p>Limites: Aviso {sla.warning_threshold_pct}% | Crítico {sla.critical_threshold_pct}%</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
