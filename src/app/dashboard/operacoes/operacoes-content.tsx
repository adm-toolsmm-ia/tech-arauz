'use client';

import * as React from 'react';
import { User } from '@supabase/supabase-js';
import { Activity, Timer, AlertTriangle, ArrowRight, UserCheck } from 'lucide-react';
import { DashboardHeader } from '@/components/layout/DashboardHeader';
import { ErpReadOnlyBanner } from '@/components/shared/erp-readonly-banner';
import { KPICard } from '@/components/dashboard/KPICard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { UIProject, DBProject } from '@/lib/transformers/project';
import { SkeletonKPI } from '@/components/ui/skeletons';
import { ProjectPipelineChart, buildPipelineData } from '@/components/charts';
import { HistoryMovementsChart } from '@/components/dashboard/operation/history-movements-chart';
import { HistoryVolumeChart } from '@/components/charts/history-volume-chart';
import { HistoryTransitionsChart } from '@/components/charts/history-transitions-chart';
import { SplitView } from '@/components/views/SplitView';
import { ProjectCockpit } from '@/components/project/ProjectCockpit';
import { ProjectListView } from '@/components/views/ProjectListView';
import { EmptyState } from '@/components/ui/EmptyState';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { PeriodSelector } from '@/components/dashboard/PeriodSelector';
import { TeamFilter } from '@/components/dashboard/TeamFilter';
import { ResponsablePerformanceTable } from '@/components/dashboard/ResponsablePerformanceTable';
import { usePerformanceData } from '@/hooks/usePerformanceData';
import { isConsideredActive } from '@/lib/domain/project-health';
import { computeDashboardKpis } from '@/lib/domain/kpi-calculations';
import { statusLabels } from '@/lib/constants/phase-labels';

interface Profile {
  id: string;
  full_name: string | null;
  role: string;
}

interface ChartProject {
  status: string;
  created_at: string;
  fase_atual: string;
  area: string;
  prazo_final: string;
  data_encerramento: string;
  prioridade: string;
  importancia_especial: boolean;
  impacto_estrategico: string;
  impacto_operacional: string;
  complexidade_tecnica: string;
  responsible: string;
  budgets: { value: number; currency: string }[];
  histories?: { date: string; step_from?: string; step_to?: string }[];
}

interface OperacoesContentProps {
  user: User;
  profile: Profile | null;
  projects: ReadonlyArray<UIProject>;
  chartProjects?: ReadonlyArray<ChartProject>;
  rawDbProjects?: ReadonlyArray<DBProject>;
  isLoading?: boolean;
}

export function OperacoesContent({
  user,
  profile,
  projects,
  chartProjects = [],
  rawDbProjects = [],
  isLoading = false,
}: OperacoesContentProps) {
  // KPIs simples sobre operações

  const activeProjects = React.useMemo(
    () => projects.filter((p) => isConsideredActive(p.status)),
    [projects],
  );
  const totalActive = activeProjects.length;

  const inApprovalCount = activeProjects.filter((p) =>
    (p.status || '').toLowerCase().includes('aprov'),
  ).length;

  // Calculando métrica de WIP (Work in Progress) vs Responsável para os projetos ativos
  const wipSummary = React.useMemo(() => {
    const counts: Record<string, number> = {};
    let overloadedCount = 0;
    activeProjects.forEach((p) => {
      const resp = p.responsible || 'Sem responsável';
      counts[resp] = (counts[resp] || 0) + 1;
    });

    // Simulação: Considerar WIP limit = 3 como ideal
    Object.values(counts).forEach((count) => {
      if (count > 3) overloadedCount++;
    });
    return { totalResponsibles: Object.keys(counts).length, overloadedCount };
  }, [activeProjects]);

  const pipelineData = React.useMemo(
    () => buildPipelineData(chartProjects as ChartProject[]),
    [chartProjects],
  );
  const kpis = React.useMemo(
    () =>
      computeDashboardKpis([
        ...chartProjects,
      ] as import('@/lib/domain/kpi-calculations').DashboardProjectLike[]),
    [chartProjects],
  );

  const [selectedProject, setSelectedProject] = React.useState<UIProject | null>(null);
  const [activeStatusFilter, setActiveStatusFilter] = React.useState<string | null>(null);
  const [activeTab, setActiveTab] = React.useState<string>('fluxo');

  // Performance tab filters (with localStorage persistence)
  const [performancePeriod, setPerformancePeriod] = React.useState<'semanal' | 'mensal' | 'trimestral' | 'semestral' | 'anual'>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('performancePeriod');
      return (saved as any) || 'mensal';
    }
    return 'mensal';
  });

  const [performanceTeam, setPerformanceTeam] = React.useState<'minha-equipe' | 'todos-envolvidos'>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('performanceTeam');
      return (saved as any) || 'minha-equipe';
    }
    return 'minha-equipe';
  });

  // Persist Performance tab selections to localStorage
  React.useEffect(() => {
    localStorage.setItem('performancePeriod', performancePeriod);
    localStorage.setItem('performanceTeam', performanceTeam);
    localStorage.setItem('activeTab', activeTab);
  }, [performancePeriod, performanceTeam, activeTab]);

  // Fetch performance data
  const { data: performanceMetrics, summary: performanceSummary, loading: performanceLoading } = usePerformanceData({
    period: performancePeriod,
    team_scope: performanceTeam,
  });

  const displayedProjects = React.useMemo(() => {
    let list = activeProjects;
    if (activeStatusFilter) {
      list = list.filter(
        (p) => (p.status || '').toLowerCase() === activeStatusFilter.toLowerCase(),
      );
    }
    return list;
  }, [activeProjects, activeStatusFilter]);

  const handlePipelineBarClick = React.useCallback((status: string) => {
    setActiveStatusFilter((prev) => (prev === status ? null : status));
  }, []);

  return (
    <div className="flex flex-col">
      <DashboardHeader title="Operações" subtitle="Visão de Fluxo, Gargalos e SLA" />

      <div className="px-6 pt-4">
        <ErpReadOnlyBanner variant="page" />
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
        <TabsList className="px-6 pt-4 bg-transparent border-b border-border">
          <TabsTrigger value="fluxo" className="px-4">
            Fluxo
          </TabsTrigger>
          <TabsTrigger value="performance" className="px-4">
            Performance
          </TabsTrigger>
        </TabsList>

        <TabsContent value="fluxo" className="flex-1">
          <div className="flex-1 space-y-6 p-6">
        {/* KPIs Row */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {isLoading ? (
            Array.from({ length: 4 }).map((_, i) => <SkeletonKPI key={i} />)
          ) : (
            <>
              <KPICard
                title="Projetos no Funil"
                value={totalActive}
                icon={Activity}
                subtitle="Ativos na esteira"
              />
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div>
                      <KPICard
                        title="Aprovação Pendente"
                        value={inApprovalCount}
                        icon={UserCheck}
                        subtitle="Aguardando aprovadores"
                        className={inApprovalCount > 0 ? 'border-amber-500/30' : undefined}
                      />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Projetos com status contendo &quot;aprov&quot;</p>
                  </TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div>
                      <KPICard
                        title="Sinal de sobrecarga"
                        value={wipSummary.overloadedCount}
                        icon={AlertTriangle}
                        subtitle="Pessoas c/ +3 projetos ativos"
                        className={
                          wipSummary.overloadedCount > 0 ? 'border-destructive/30' : undefined
                        }
                      />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Heurística: pessoas com mais de 3 projetos ativos simultâneos</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <KPICard
                title="Lead Time Médio"
                value={kpis.avgLeadTimeDays > 0 ? `${kpis.avgLeadTimeDays}d` : '—'}
                icon={Timer}
                subtitle={
                  kpis.avgLeadTimeDays > 0
                    ? 'Dias do início ao encerramento'
                    : 'Sem projetos concluídos'
                }
              />
            </>
          )}
        </div>

        {/* View principal: lista de projetos ativos */}
        <Card>
          <CardHeader>
            <CardTitle>Projetos no Funil</CardTitle>
            <p className="text-sm text-muted-foreground">
              {activeStatusFilter
                ? `Filtrado por: ${statusLabels[activeStatusFilter] ?? activeStatusFilter}`
                : 'Clique em uma barra do Pipeline para filtrar'}
            </p>
          </CardHeader>
          <CardContent>
            {displayedProjects.length === 0 ? (
              <EmptyState
                title={activeStatusFilter ? 'Nenhum projeto neste status' : 'Nenhum projeto ativo'}
                description={
                  activeStatusFilter
                    ? 'Tente outro filtro ou limpe o filtro.'
                    : 'Não há projetos em execução no momento.'
                }
                icon={Activity}
                className="py-12"
              />
            ) : (
              <ProjectListView
                projects={displayedProjects as any[]}
                onSelectProject={(id) => {
                  const p = projects.find((x) => x.id === id);
                  if (p) setSelectedProject(p);
                }}
              />
            )}
          </CardContent>
        </Card>

        {/* Charts */}
        {chartProjects.length > 0 && (
          <>
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              <ProjectPipelineChart
                data={pipelineData}
                activeStatus={activeStatusFilter}
                onBarClick={handlePipelineBarClick}
              />
              <HistoryMovementsChart projects={projects as any[]} />
            </div>
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              <HistoryVolumeChart projects={projects as any[]} />
              <HistoryTransitionsChart projects={projects as any[]} />
            </div>
          </>
        )}
        </div>
        </TabsContent>

        <TabsContent value="performance" className="flex-1">
          <div className="flex-1 space-y-6 p-6">
            {/* Performance Filters */}
            <Card>
              <CardHeader>
                <CardTitle>Filtros</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Período</label>
                  <PeriodSelector value={performancePeriod} onChange={setPerformancePeriod} />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Equipe</label>
                  <TeamFilter value={performanceTeam} onChange={setPerformanceTeam} />
                </div>
              </CardContent>
            </Card>

            {/* Performance KPI Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {performanceLoading ? (
                Array.from({ length: 4 }).map((_, i) => <SkeletonKPI key={i} />)
              ) : performanceSummary ? (
                <>
                  <KPICard
                    title="Top Performer"
                    value={performanceSummary.top_performer}
                    subtitle="Mais movimentações"
                  />
                  <KPICard
                    title="Tempo Médio"
                    value={`${performanceSummary.avg_tempo_per_person} dias`}
                    subtitle="Por pessoa"
                  />
                  <KPICard
                    title="Movimentações"
                    value={performanceSummary.total_movements_period}
                    subtitle="Total do período"
                  />
                  <KPICard
                    title="Concluídos"
                    value={performanceSummary.projects_completed_period}
                    subtitle="Projetos encerrados"
                  />
                </>
              ) : (
                <>
                  <KPICard title="Top Performer" value="-" subtitle="Sem dados" />
                  <KPICard title="Tempo Médio" value="-" subtitle="Sem dados" />
                  <KPICard title="Movimentações" value="-" subtitle="Sem dados" />
                  <KPICard title="Concluídos" value="-" subtitle="Sem dados" />
                </>
              )}
            </div>

            {/* Performance Table (Subtask 7.2.3) */}
            <Card>
              <CardHeader>
                <CardTitle>Desempenho por Responsável</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsablePerformanceTable data={performanceMetrics || []} loading={performanceLoading} />
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {selectedProject && (
        <SplitView
          isOpen={!!selectedProject}
          onClose={() => setSelectedProject(null)}
          title={selectedProject.project_name || 'Visão 360'}
          subtitle={
            selectedProject
              ? `${selectedProject.espaider_code}${selectedProject.pasta_consultivo ? ` • ${selectedProject.pasta_consultivo}` : ''}`
              : undefined
          }
          width="wide"
        >
          <ProjectCockpit
            project={selectedProject}
            schedules={selectedProject.schedules || []}
            deliveries={selectedProject.deliveries || []}
            histories={selectedProject.histories || []}
            approvers={selectedProject.approvers || []}
            budgets={selectedProject.budgets || []}
          />
        </SplitView>
      )}
    </div>
  );
}
