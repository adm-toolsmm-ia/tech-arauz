'use client';

import * as React from 'react';
import { User } from '@supabase/supabase-js';
import {
  FolderOpen,
  Clock,
  CheckCircle,
  AlertTriangle,
  Star,
  TrendingUp,
  BarChart3,
  X,
  ArrowRight,
  Zap,
  Building2,
} from 'lucide-react';
import { DashboardHeader } from '@/components/layout/DashboardHeader';
import { KPICard } from '@/components/dashboard/KPICard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { SplitView } from '@/components/views/SplitView';
import { ProjectCockpit } from '@/components/project/ProjectCockpit';
import {
  ProjectPipelineChart,
  buildPipelineData,
  ProjectTrendChart,
  buildTrendData,
  StatusDistributionChart,
  buildDistributionData,
} from '@/components/charts';
import type { UIProject } from '@/lib/transformers/project';

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
}

type FilterType =
  | 'all'
  | 'active'
  | 'completed'
  | 'overdue'
  | 'high_priority'
  | 'special'
  | 'by_status'
  | 'by_area';

interface ActiveFilter {
  type: FilterType;
  label: string;
  value?: string;
}

interface DashboardContentProps {
  user: User;
  profile: Profile | null;
  projects: UIProject[];
  chartProjects?: ChartProject[];
}

const statusLabels: Record<string, string> = {
  projeto_futuro: 'Futuro',
  em_aprovacao: 'Em Aprovação',
  em_desenvolvimento: 'Em Desenvolvimento',
  em_homologacao: 'Em Homologação',
  concluido: 'Concluído',
  cancelado: 'Cancelado',
  suspenso: 'Suspenso',
};

const statusStyles: Record<string, string> = {
  projeto_futuro: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
  em_aprovacao: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
  em_desenvolvimento: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
  em_homologacao: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-300',
  concluido: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
  cancelado: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
  suspenso: 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-300',
};

function isOverdue(project: UIProject): boolean {
  const status = (project.status || '').trim().toLowerCase();
  if (!project.end_date || status === 'concluído' || status === 'cancelado') return false;
  try {
    return new Date(project.end_date) < new Date();
  } catch {
    return false;
  }
}

export function DashboardContent({
  user,
  profile,
  projects,
  chartProjects = [],
}: DashboardContentProps) {
  const [activeFilter, setActiveFilter] = React.useState<ActiveFilter | null>(null);
  const [selectedProject, setSelectedProject] = React.useState<UIProject | null>(null);
  const filteredListRef = React.useRef<HTMLDivElement>(null);

  // ─── KPI Calculations (manager-focused) ───
  const totalProjects = chartProjects.length;

  const activeProjects = chartProjects.filter(
    (p) => (p.status || '').trim().toLowerCase() === 'em execução',
  ).length;

  const completedProjects = chartProjects.filter(
    (p) => (p.status || '').trim().toLowerCase() === 'concluído',
  ).length;

  const overdueProjects = chartProjects.filter((p) => {
    const status = (p.status || '').trim().toLowerCase();
    if (!p.prazo_final || status === 'concluído' || status === 'cancelado') return false;
    try {
      return new Date(p.prazo_final) < new Date();
    } catch {
      return false;
    }
  }).length;

  const highPriorityCount = chartProjects.filter(
    (p) => p.prioridade === 'urgente' || p.prioridade === 'alta',
  ).length;

  const specialCount = chartProjects.filter((p) => p.importancia_especial).length;

  // Completion rate this month
  const now = new Date();
  const thisMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const lastMonthKey = `${lastMonth.getFullYear()}-${String(lastMonth.getMonth() + 1).padStart(2, '0')}`;

  const completedThisMonth = chartProjects.filter(
    (p) =>
      (p.status || '').trim().toLowerCase() === 'concluído' &&
      p.data_encerramento?.startsWith(thisMonth),
  ).length;
  const completedLastMonth = chartProjects.filter(
    (p) =>
      (p.status || '').trim().toLowerCase() === 'concluído' &&
      p.data_encerramento?.startsWith(lastMonthKey),
  ).length;

  // Top areas
  const areaCounts: Record<string, number> = {};
  chartProjects.forEach((p) => {
    const status = (p.status || '').trim().toLowerCase();
    if (p.area && status !== 'concluído' && status !== 'cancelado') {
      areaCounts[p.area] = (areaCounts[p.area] || 0) + 1;
    }
  });
  const topAreas = Object.entries(areaCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3);

  // ─── Chart Data ───
  const pipelineData = React.useMemo(() => buildPipelineData(chartProjects), [chartProjects]);
  const trendData = React.useMemo(() => buildTrendData(chartProjects), [chartProjects]);
  const distributionData = React.useMemo(
    () => buildDistributionData(chartProjects),
    [chartProjects],
  );

  // ─── Filtered Project List ───
  const filteredProjects = React.useMemo(() => {
    if (!activeFilter) return [];
    switch (activeFilter.type) {
      case 'all':
        return projects;
      case 'active':
        return projects.filter((p) => (p.status || '').trim().toLowerCase() === 'em execução');
      case 'completed':
        return projects.filter((p) => (p.status || '').trim().toLowerCase() === 'concluído');
      case 'overdue':
        return projects.filter(isOverdue);
      case 'high_priority':
        return projects.filter((p) => p.priority === 'urgente' || p.priority === 'alta');
      case 'special':
        return projects.filter((p) => p.importancia_especial);
      case 'by_status':
        return projects.filter((p) => p.status === activeFilter.value);
      case 'by_area':
        return projects.filter((p) => p.area === activeFilter.value);
      default:
        return [];
    }
  }, [activeFilter, projects]);

  const handleKPIClick = (filter: ActiveFilter) => {
    if (activeFilter?.type === filter.type && activeFilter?.value === filter.value) {
      setActiveFilter(null);
    } else {
      setActiveFilter(filter);
      setTimeout(() => {
        filteredListRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    }
  };

  const handleChartStatusClick = (status: string) => {
    const label = statusLabels[status] || status;
    handleKPIClick({ type: 'by_status', label: `Status: ${label}`, value: status });
  };

  const handleProjectClick = (project: UIProject) => {
    setSelectedProject(project);
  };

  return (
    <div className="flex flex-col">
      <DashboardHeader
        title={`Bem-vindo, ${profile?.full_name || user.email?.split('@')[0]}!`}
        subtitle="Painel de gestão de projetos"
      />

      <div className="flex-1 space-y-6 p-6">
        {/* KPIs Row 1: Core Metrics */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <KPICard
            title="Total de Projetos"
            value={totalProjects}
            icon={FolderOpen}
            subtitle={`${activeProjects} ativos`}
            onClick={() => handleKPIClick({ type: 'all', label: 'Todos os Projetos' })}
            active={activeFilter?.type === 'all'}
          />
          <KPICard
            title="Em Andamento"
            value={activeProjects}
            icon={Clock}
            subtitle={`${chartProjects.filter((p) => p.status === 'em_desenvolvimento').length} em desenvolvimento`}
            onClick={() => handleKPIClick({ type: 'active', label: 'Projetos Ativos' })}
            active={activeFilter?.type === 'active'}
          />
          <KPICard
            title="Concluídos"
            value={completedProjects}
            icon={CheckCircle}
            trend={
              completedThisMonth > 0
                ? {
                    value: `${completedThisMonth} este mês`,
                    positive: completedThisMonth >= completedLastMonth,
                  }
                : undefined
            }
            subtitle={completedThisMonth === 0 ? 'Nenhum este mês' : undefined}
            onClick={() => handleKPIClick({ type: 'completed', label: 'Projetos Concluídos' })}
            active={activeFilter?.type === 'completed'}
          />
          <KPICard
            title="Atrasados"
            value={overdueProjects}
            icon={AlertTriangle}
            subtitle={overdueProjects > 0 ? 'Requer atenção imediata' : 'Todos no prazo'}
            className={overdueProjects > 0 ? 'border-destructive/30' : undefined}
            onClick={() => handleKPIClick({ type: 'overdue', label: 'Projetos Atrasados' })}
            active={activeFilter?.type === 'overdue'}
          />
        </div>

        {/* KPIs Row 2: Strategic Metrics */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <KPICard
            title="Alta Prioridade"
            value={highPriorityCount}
            icon={Zap}
            subtitle="Urgente + Alta"
            onClick={() => handleKPIClick({ type: 'high_priority', label: 'Alta Prioridade' })}
            active={activeFilter?.type === 'high_priority'}
          />
          <KPICard
            title="Importância Especial"
            value={specialCount}
            icon={Star}
            subtitle="Projetos estratégicos"
            onClick={() => handleKPIClick({ type: 'special', label: 'Importância Especial' })}
            active={activeFilter?.type === 'special'}
          />
          <KPICard
            title="Taxa de Conclusão"
            value={
              totalProjects > 0 ? `${Math.round((completedProjects / totalProjects) * 100)}%` : '0%'
            }
            icon={TrendingUp}
            trend={
              completedThisMonth > completedLastMonth
                ? {
                    value: `+${completedThisMonth - completedLastMonth} vs mês anterior`,
                    positive: true,
                  }
                : completedLastMonth > completedThisMonth
                  ? {
                      value: `${completedThisMonth - completedLastMonth} vs mês anterior`,
                      positive: false,
                    }
                  : undefined
            }
          />
          <KPICard
            title="Projetos por Área"
            value={Object.keys(areaCounts).length}
            icon={Building2}
            subtitle={
              topAreas.length > 0 ? topAreas.map(([a, c]) => `${a} (${c})`).join(', ') : 'Sem dados'
            }
          />
        </div>

        {/* Charts: Pipeline + Distribution + Trend */}
        {chartProjects.length > 0 && (
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            <ProjectPipelineChart
              data={pipelineData}
              onBarClick={handleChartStatusClick}
              activeStatus={activeFilter?.type === 'by_status' ? activeFilter.value : null}
            />
            <StatusDistributionChart
              data={distributionData}
              onSegmentClick={handleChartStatusClick}
              activeStatus={activeFilter?.type === 'by_status' ? activeFilter.value : null}
            />
            <ProjectTrendChart data={trendData} />
          </div>
        )}

        {/* Filtered Project List (appears when a KPI/chart is clicked) */}
        {activeFilter && (
          <div ref={filteredListRef}>
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <BarChart3 className="size-5 text-primary" />
                    <div>
                      <CardTitle className="text-base">{activeFilter.label}</CardTitle>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {filteredProjects.length}{' '}
                        {filteredProjects.length === 1 ? 'projeto' : 'projetos'}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setActiveFilter(null)}
                    className="text-xs text-muted-foreground"
                  >
                    <X className="mr-1 size-3" />
                    Fechar
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {filteredProjects.length === 0 ? (
                  <div className="py-8 text-center text-sm text-muted-foreground">
                    Nenhum projeto encontrado para este filtro.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {filteredProjects.map((project) => {
                      const overdue = isOverdue(project);
                      return (
                        <div
                          key={project.id}
                          onClick={() => handleProjectClick(project)}
                          className="group flex cursor-pointer items-center justify-between rounded-lg border p-3 transition-colors hover:bg-muted/50"
                        >
                          <div className="min-w-0 flex-1 space-y-1">
                            <div className="flex items-center gap-2">
                              <p className="truncate text-sm font-medium">{project.project_name}</p>
                              {project.importancia_especial && (
                                <Star className="size-3 flex-shrink-0 text-amber-500" />
                              )}
                            </div>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <span>{project.espaider_code}</span>
                              {project.area && (
                                <>
                                  <span>·</span>
                                  <span>{project.area}</span>
                                </>
                              )}
                              {project.responsible && (
                                <>
                                  <span>·</span>
                                  <span>{project.responsible}</span>
                                </>
                              )}
                              {project.end_date && (
                                <>
                                  <span>·</span>
                                  <span className={overdue ? 'font-medium text-destructive' : ''}>
                                    Prazo: {new Date(project.end_date).toLocaleDateString('pt-BR')}
                                  </span>
                                </>
                              )}
                            </div>
                          </div>
                          <div className="ml-4 flex flex-shrink-0 items-center gap-3">
                            {project.priority && <PriorityBadge priority={project.priority} />}
                            <StatusBadge status={project.status} />
                            <ArrowRight className="size-4 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Recent Projects */}
        <Card>
          <CardHeader>
            <CardTitle>Projetos Recentes</CardTitle>
          </CardHeader>
          <CardContent>
            {projects.length === 0 ? (
              <div className="py-12 text-center">
                <FolderOpen className="mx-auto h-12 w-12 text-muted-foreground/50" />
                <h3 className="mt-4 text-lg font-medium">Nenhum projeto encontrado</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Sincronize com o Espaider para importar projetos.
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {projects.slice(0, 8).map((project) => (
                  <div
                    key={project.id}
                    onClick={() => handleProjectClick(project)}
                    className="group flex cursor-pointer items-center justify-between rounded-lg border p-3 transition-colors hover:bg-muted/50"
                  >
                    <div className="min-w-0 flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <p className="truncate text-sm font-medium">{project.project_name}</p>
                        {project.importancia_especial && (
                          <Star className="size-3 flex-shrink-0 text-amber-500" />
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>{project.espaider_code}</span>
                        {project.area && (
                          <>
                            <span>·</span>
                            <span>{project.area}</span>
                          </>
                        )}
                        {project.responsible && (
                          <>
                            <span>·</span>
                            <span>{project.responsible}</span>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="ml-4 flex flex-shrink-0 items-center gap-3">
                      <StatusBadge status={project.status} />
                      <ArrowRight className="size-4 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* SplitView for Project Detail */}
      {selectedProject && (
        <SplitView
          isOpen={!!selectedProject}
          onClose={() => setSelectedProject(null)}
          title={selectedProject.project_name}
          subtitle={selectedProject.espaider_code}
          width="2xl"
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

function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
        statusStyles[status] || statusStyles.projeto_futuro
      }`}
    >
      {statusLabels[status] || status}
    </span>
  );
}

function PriorityBadge({ priority }: { priority: string }) {
  const styles: Record<string, string> = {
    urgente: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
    alta: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300',
    media: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300',
    baixa: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
  };
  const labels: Record<string, string> = {
    urgente: 'Urgente',
    alta: 'Alta',
    media: 'Média',
    baixa: 'Baixa',
  };
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${
        styles[priority] || 'bg-gray-100 text-gray-700'
      }`}
    >
      {labels[priority] || priority}
    </span>
  );
}
