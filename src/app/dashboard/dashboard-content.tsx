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
  ResponsibleWorkloadChart,
  buildWorkloadData,
} from '@/components/charts';
import type { UIProject } from '@/lib/transformers/project';
import { SkeletonKPI } from '@/components/ui/skeletons';
import {
  statusLabels,
  statusStyles,
  priorityStyles,
  priorityLabels,
} from '@/lib/constants/phase-labels';
import { getOverdueData, isConsideredActive } from '@/lib/domain/project-health';
import { isHighPriorityProject } from '@/lib/domain/project-priority';
import { computeDashboardKpis } from '@/lib/domain/kpi-calculations';

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
  responsible: string;
}

type FilterType =
  | 'all'
  | 'active'
  | 'completed'
  | 'overdue'
  | 'high_priority'
  | 'special'
  | 'by_status'
  | 'by_phase'
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
  isLoading?: boolean;
}

export function DashboardContent({
  user,
  profile,
  projects,
  chartProjects = [],
  isLoading = false,
}: DashboardContentProps) {
  const [activeFilter, setActiveFilter] = React.useState<ActiveFilter | null>(null);
  const [selectedProject, setSelectedProject] = React.useState<UIProject | null>(null);
  const filteredListRef = React.useRef<HTMLDivElement>(null);

  // ─── KPI Calculations (domain-extracted) ───
  const now = React.useMemo(() => new Date(), []);

  const kpis = React.useMemo(() => computeDashboardKpis(chartProjects), [chartProjects]);

  const {
    totalProjects,
    coreActiveCount,
    activeProjects,
    completedProjects,
    inHomologationCount,
    inProductionCount,
    overdueCount,
    overdueMaxDays,
    highPriorityCount,
    specialActiveCount: specialCount,
    specialCompletedCount,
    completedThisMonth,
    completedLastMonth,
    completionRate: _completionRate,
    topAreas,
  } = kpis;

  const overdueProjectsInfo = { count: overdueCount, maxDays: overdueMaxDays };

  // ─── Chart Data ───
  const pipelineData = React.useMemo(() => buildPipelineData(chartProjects), [chartProjects]);
  const trendData = React.useMemo(() => buildWorkloadData(projects as any), [projects]);

  // ─── Filtered Project List ───
  const filteredProjects = React.useMemo(() => {
    if (!activeFilter) return [];
    switch (activeFilter.type) {
      case 'all':
        return projects.filter((p) => isConsideredActive(p.status));
      case 'active':
        return projects.filter((p) => (p.status || '').trim().toLowerCase() === 'em execução');
      case 'completed':
        return projects.filter((p) => (p.status || '').trim().toLowerCase() === 'concluído');
      case 'overdue':
        return projects.filter((p) => getOverdueData(p, now).isOverdue);
      case 'high_priority':
        return projects.filter((p) => isHighPriorityProject(p));
      case 'special':
        return projects.filter((p) => p.importancia_especial && isConsideredActive(p.status));
      case 'by_status':
        return projects.filter((p) => p.status === activeFilter.value);
      case 'by_phase':
        return projects.filter(
          (p) =>
            isConsideredActive(p.status) && (p.fase_atual || 'Sem fase') === activeFilter.value,
        );
      case 'by_area':
        return projects.filter((p) => p.area === activeFilter.value);
      default:
        return [];
    }
  }, [activeFilter, projects, now]);

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

  const handleChartPhaseClick = (fase: string) => {
    handleKPIClick({ type: 'by_phase', label: `Fase: ${fase}`, value: fase });
  };

  const handleProjectClick = (project: UIProject) => {
    setSelectedProject(project);
  };

  const activeFilterMessage = activeFilter
    ? `Filtro ${activeFilter.label} com ${filteredProjects.length} projetos.`
    : 'Nenhum filtro KPI ativo.';

  return (
    <div className="flex flex-col">
      <DashboardHeader
        title={`Bem-vindo, ${profile?.full_name || user.email?.split('@')[0]}!`}
        subtitle="Painel de gestão de projetos"
      />

      <div className="flex-1 space-y-6 p-6">
        <p className="sr-only" role="status" aria-live="polite">
          {activeFilterMessage}
        </p>

        {/* KPIs Row 1: Core Metrics */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {isLoading ? (
            Array.from({ length: 4 }).map((_, i) => <SkeletonKPI key={i} />)
          ) : (
            <>
              <KPICard
                title="Total de Projetos"
                value={totalProjects}
                icon={FolderOpen}
                subtitle={`${coreActiveCount} ativos`}
                onClick={() => handleKPIClick({ type: 'all', label: 'Todos os Projetos' })}
                active={activeFilter?.type === 'all'}
              />
              <KPICard
                title="Em Execução"
                value={activeProjects}
                icon={Clock}
                subtitle={`${inHomologationCount} homologação • ${inProductionCount} produção`}
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
                value={overdueProjectsInfo.count}
                icon={AlertTriangle}
                subtitle={
                  overdueProjectsInfo.count > 0
                    ? `${overdueProjectsInfo.maxDays} dias (maior atraso)`
                    : 'Todos no prazo'
                }
                className={overdueProjectsInfo.count > 0 ? 'border-destructive/30' : undefined}
                onClick={() => handleKPIClick({ type: 'overdue', label: 'Projetos Atrasados' })}
                active={activeFilter?.type === 'overdue'}
              />
            </>
          )}
        </div>

        {/* KPIs Row 2: Strategic Metrics */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {isLoading ? (
            Array.from({ length: 4 }).map((_, i) => <SkeletonKPI key={i} />)
          ) : (
            <>
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
                subtitle={`${specialCompletedCount} concluídos`}
                onClick={() => handleKPIClick({ type: 'special', label: 'Importância Especial' })}
                active={activeFilter?.type === 'special'}
              />
              <KPICard
                title="Taxa de Conclusão"
                value={
                  totalProjects > 0
                    ? `${Math.round((completedProjects / totalProjects) * 100)}%`
                    : '0%'
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
                title="Top 3 Áreas"
                value={topAreas.length > 0 ? topAreas.length : 0}
                icon={Building2}
                subtitle={
                  topAreas.length > 0
                    ? topAreas.map(([a, c]) => `${a} (${c})`).join(', ')
                    : 'Sem dados'
                }
              />
            </>
          )}
        </div>

        {/* Charts: Pipeline + Distribution + Trend */}
        {chartProjects.length > 0 && (
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            <ProjectPipelineChart
              data={pipelineData}
              onBarClick={handleChartStatusClick}
              activeStatus={activeFilter?.type === 'by_status' ? activeFilter.value : null}
            />
            <ResponsibleWorkloadChart data={trendData} />
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
                      const { isOverdue } = getOverdueData(project, now);
                      return (
                        <div
                          key={project.id}
                          role="button"
                          tabIndex={0}
                          onClick={() => handleProjectClick(project)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleProjectClick(project);
                          }}
                          className="group flex cursor-pointer items-center justify-between rounded-lg border p-3 transition-colors hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
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
                                  <span className={isOverdue ? 'font-medium text-destructive' : ''}>
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
                {projects
                  .filter((p) => {
                    const s = (p.status || '').trim().toLowerCase();
                    if (s !== 'iniciado' && s !== 'em execução' && s !== 'concluído') return false;

                    const lastMove = p.last_update;
                    if (!lastMove) return false;

                    const diffTime = now.getTime() - new Date(lastMove).getTime();
                    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                    return diffDays >= 0 && diffDays <= 7;
                  })
                  .sort((a, b) => {
                    const d1 = new Date(b.last_update || 0).getTime();
                    const d2 = new Date(a.last_update || 0).getTime();
                    return d1 - d2;
                  })
                  .slice(0, 8)
                  .map((project) => (
                    <div
                      key={project.id}
                      role="button"
                      tabIndex={0}
                      onClick={() => handleProjectClick(project)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          handleProjectClick(project);
                        }
                      }}
                      className="group flex cursor-pointer items-center justify-between rounded-lg border p-3 transition-colors hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
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
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium ${
        priorityStyles[priority] || 'bg-gray-100 text-gray-700'
      }`}
    >
      {priorityLabels[priority] || priority}
    </span>
  );
}
