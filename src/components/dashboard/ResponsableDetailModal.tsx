'use client';

import React, { useMemo, useState } from 'react';
import { X, Calendar, Filter, Download, FileText } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import type { PerformanceMetrics } from '@/app/dashboard/operacoes/actions';
import { DetailMetricsChart } from './DetailMetricsChart';
import { exportToCSV, exportToPDF, exportToJSON, downloadJSON, generateFilename } from './export-utils';

interface ResponsableDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  person: PerformanceMetrics | null;
  allData: PerformanceMetrics[];
}

/**
 * ResponsableDetailModal: Organism component
 *
 * Features:
 * - Modal dialog with responsive layout
 * - Person details (name, role, KPIs)
 * - Drill-down timeline chart
 * - Date range and filter controls
 * - Accessibility: focus trap, keyboard close (ESC), ARIA labels
 */
export function ResponsableDetailModal({
  isOpen,
  onClose,
  person,
  allData,
}: ResponsableDetailModalProps) {
  const [dateRange, setDateRange] = useState<'week' | 'month' | '3months' | 'year'>('month');
  const [showMetricsBreakdown, setShowMetricsBreakdown] = useState(true);

  if (!person) return null;

  // Calculate derived metrics
  const efficiency = person.total_movements > 0
    ? Math.round((person.projects_completed / person.total_movements) * 100)
    : 0;

  const movementsPerDayValue = person.average_duration_days > 0
    ? person.total_movements / person.average_duration_days
    : 0;

  const movementsPerDay = movementsPerDayValue.toFixed(1);

  // Calculate comparison with team average
  const teamAvgMovements = allData.length > 0
    ? Math.round(allData.reduce((sum, d) => sum + d.total_movements, 0) / allData.length)
    : 0;

  const performanceDelta = teamAvgMovements > 0
    ? Math.round(((person.total_movements - teamAvgMovements) / teamAvgMovements) * 100)
    : 0;

  const performanceLabel = performanceDelta > 0
    ? `+${performanceDelta}% vs média`
    : `${performanceDelta}% vs média`;

  const performanceColor = performanceDelta > 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400';

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-2xl">{person.responsible}</DialogTitle>
              <p className="text-sm text-muted-foreground mt-1">Análise detalhada de performance</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              aria-label="Fechar modal"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Key Metrics Summary */}
          <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
            <CardHeader>
              <CardTitle className="text-base">Resumo de Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Movimentações</p>
                  <p className="text-2xl font-bold">{person.total_movements}</p>
                  <p className={`text-xs ${performanceColor}`}>{performanceLabel}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Tempo Médio</p>
                  <p className="text-2xl font-bold">{person.average_duration_days}d</p>
                  <p className="text-xs text-muted-foreground">por projeto</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Concluídos</p>
                  <p className="text-2xl font-bold">{person.projects_completed}</p>
                  <p className="text-xs text-muted-foreground">projetos</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Lead Time Médio</p>
                  <p className="text-2xl font-bold">{person.lead_time_average_days}d</p>
                  <p className="text-xs text-muted-foreground">início a fim</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Efficiency Metrics */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Eficiência</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Taxa de Conclusão</p>
                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-blue-500 to-blue-600"
                        style={{ width: `${Math.min(efficiency, 100)}%` }}
                      />
                    </div>
                    <span className="text-lg font-semibold">{efficiency}%</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Movimentações por Dia</p>
                  <p className="text-2xl font-bold">{movementsPerDay}</p>
                  <p className="text-xs text-muted-foreground">velocidade média</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Timeline Chart */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Movimentações ao Longo do Tempo</CardTitle>
                <div className="flex gap-2">
                  <Button
                    variant={dateRange === 'month' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setDateRange('month')}
                  >
                    Mês
                  </Button>
                  <Button
                    variant={dateRange === '3months' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setDateRange('3months')}
                  >
                    3M
                  </Button>
                  <Button
                    variant={dateRange === 'year' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setDateRange('year')}
                  >
                    Ano
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <DetailMetricsChart
                person={person}
                dateRange={dateRange}
              />
            </CardContent>
          </Card>

          {/* Project Insights */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Insights de Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/30 border border-muted">
                  <div className="w-2 h-2 rounded-full bg-blue-500 mt-1.5" />
                  <div>
                    <p className="text-sm font-medium">
                      {efficiency > 70 ? '✨ Excelente taxa de conclusão' : efficiency > 50 ? '📈 Taxa de conclusão acima da média' : '⚠️ Taxa de conclusão abaixo do esperado'}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {efficiency > 70
                        ? `${person.responsible} tem uma das melhores taxas de conclusão do time`
                        : efficiency > 50
                        ? `Desempenho sólido com ${efficiency}% de conclusão`
                        : `Considere aumentar foco em conclusão de projetos`}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/30 border border-muted">
                  <div className="w-2 h-2 rounded-full bg-amber-500 mt-1.5" />
                  <div>
                    <p className="text-sm font-medium">
                      {person.average_duration_days < 15 ? '⚡ Ritmo acelerado' : person.average_duration_days < 30 ? '✓ Ritmo normal' : '🐢 Ritmo lento'}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Tempo médio de {person.average_duration_days} dias por projeto
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/30 border border-muted">
                  <div className="w-2 h-2 rounded-full bg-green-500 mt-1.5" />
                  <div>
                    <p className="text-sm font-medium">Velocidade de Movimentação</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {movementsPerDay} movimentações por dia — {movementsPerDayValue > 2 ? 'muito ativo' : 'atividade moderada'}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Footer Actions */}
          <div className="flex justify-between gap-2 pt-4 border-t">
            <Button
              variant="outline"
              onClick={onClose}
            >
              Fechar
            </Button>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const filename = generateFilename(person.responsible, 'json');
                  const jsonData = exportToJSON(person, { allData, includeComparison: true });
                  downloadJSON(jsonData, filename);
                }}
                className="gap-2"
                title="Exportar como JSON com estrutura completa"
              >
                <Download className="w-4 h-4" />
                JSON
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const filename = generateFilename(person.responsible, 'csv');
                  exportToCSV(person, filename, { allData, includeComparison: true });
                }}
                className="gap-2"
                title="Exportar como CSV com comparação de time"
              >
                <Download className="w-4 h-4" />
                CSV
              </Button>
              <Button
                variant="default"
                size="sm"
                onClick={() => {
                  const filename = generateFilename(person.responsible, 'pdf');
                  exportToPDF(person, filename, { allData, includeComparison: true });
                }}
                className="gap-2"
                title="Exportar como PDF com headers e comparação"
              >
                <FileText className="w-4 h-4" />
                PDF
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
