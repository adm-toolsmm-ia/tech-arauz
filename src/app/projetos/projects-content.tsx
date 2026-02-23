'use client';

import * as React from 'react';
import {
  Search,
  FolderOpen,
  Clock,
  DollarSign,
  TrendingUp,
  RefreshCw,
  Loader2,
  AlertTriangle,
  CheckCircle2,
  Star,
  PlayCircle,
} from 'lucide-react';
import { toast } from 'sonner';
import { DashboardHeader } from '@/components/layout/DashboardHeader';
import { KPICard } from '@/components/dashboard/KPICard';
import { ViewToggle, type ViewMode } from '@/components/views/ViewToggle';
import { KanbanBoard, type KanbanItem } from '@/components/views/KanbanBoard';
import { ProjectListView } from '@/components/views/ProjectListView';
import { SplitView } from '@/components/views/SplitView';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { syncEspaiderAction } from '@/app/actions/sync';
import { updateProjectStatusAction } from '@/app/actions/projects';
import { ProjectCockpit } from '@/components/project';
import { ProjectKanbanCard } from '@/components/project/ProjectKanbanCard';
import { FilterBar } from '@/components/filters/FilterBar';
import { useProjetosFilters } from '@/hooks/useProjetosFilters';
import {
  ProjectFilters,
  type ProjectFilterState,
  defaultFilters,
  extractUniqueValues,
  applyProjectFilters,
} from '@/components/filters/ProjectFilters';
import {
  phaseLabels,
  phaseColors,
  phaseOrder,
  bannedPhases,
  resolvePhaseLabel,
} from '@/lib/constants/phase-labels';
import { SkeletonKanbanCard, SkeletonTableRow } from '@/components/ui/skeletons';

interface Project {
  id: string;
  espaider_code: string;
  project_name: string;
  status: string;
  original_status?: string | null;
  /** Fase atual do projeto - usado para agrupar Kanban (Migration 009) */
  fase_atual?: string | null;
  prazo_fase?: string | null;
  area?: string | null;
  current_situation?: string | null;
  last_update?: string | null;
  cronograma_atual?: string | null;
  prazo_cronograma?: string | null;
  pasta_consultivo?: string | null;
  aprovador_atual?: string | null;
  prazo_aprovador?: string | null;
  solucao_aplicada?: string | null;
  data_encerramento?: string | null;
  data_inicio_aprovacao?: string | null;
  // === Visão 360 (Migration 014) ===
  trm_espaider?: string | null;
  tipo_chamado?: string | null;
  tipo_assunto?: string | null;
  solicitante?: string | null;
  objetivo?: string | null;
  motivo_importancia_especial?: string | null;
  mensagem_movimentacao?: string | null;
  justificativa?: string | null;
  importancia_especial?: boolean | null;
  impacto_operacional?: string | null;
  impacto_estrategico?: string | null;
  escopo?: string | null;
  complexidade_tecnica?: string | null;
  notes_html?: string | null;
  total_value: number | null;
  responsible: string | null;
  start_date: string | null;
  end_date: string | null;
  priority: string | null;
  category?: string | null;
  updated_at?: string | null;
  data_movimentacao?: string | null;
  schedules?: Array<{
    id: string;
    atividade: string | null;
    responsavel?: string | null;
    data_inicio?: string | null;
    data_fim?: string | null;
    data_prazo?: string | null;
    status: string | null;
    fase_atividade?: string | null;
    atrasado?: boolean | null;
    setor_responsavel?: string | null;
    item?: string | null;
  }>;
  deliveries?: Array<{
    id: string;
    description: string;
    deadline: string;
    completed: boolean;
  }>;
  histories?: Array<{
    id: string;
    type: string;
    from: string;
    to: string;
    step_from: string;
    step_to: string;
    message: string;
    date: string;
  }>;
  approvers?: Array<{
    id: string;
    type: string;
    responsible: string;
  }>;
  budgets?: Array<{
    id: string;
    value: number;
    supplier: string;
    date: string;
    currency: string;
  }>;
}

interface ProjectsContentProps {
  projects: Project[];
  isLoading?: boolean;
}

export function ProjectsContent({
  projects: initialProjects,
  isLoading = false,
}: ProjectsContentProps) {
  const [projects, setProjects] = React.useState<Project[]>(initialProjects);
  const [selectedProject, setSelectedProject] = React.useState<Project | null>(null);
  const [isSyncing, setIsSyncing] = React.useState(false);

  // New filter system
  const filterState = useProjetosFilters(projects);
  const { filteredData: filteredProjects, viewMode, setViewMode } = filterState;

  // Keep projects in sync when server re-renders with new data
  React.useEffect(() => {
    setProjects(initialProjects);
  }, [initialProjects]);

  const handleSync = async () => {
    setIsSyncing(true);
    toast.info('Iniciando sincronização com Espaider...');
    try {
      const result = await syncEspaiderAction();
      if (result.success) {
        toast.success(result.message);
      } else {
        toast.error(result.message);
      }
    } catch {
      toast.error('Erro inesperado na sincronização. Tente novamente.');
    } finally {
      setIsSyncing(false);
    }
  };

  // ===== CALCULATE KPIs (GERENCIAL) =====

  // KPI 1: Em Execução (status = em execução)
  const inExecutionProjects = React.useMemo(() => {
    return projects.filter((p) => (p.status || '').trim().toLowerCase() === 'em execução').length;
  }, [projects]);

  // KPI 2: Sem Movimentação (30+ dias)
  const withoutMovementProjects = React.useMemo(() => {
    return projects.filter((p) => {
      const now = new Date();
      const lastMove = p.data_movimentacao || p.last_update || p.updated_at;
      if (!lastMove) return true; // Sem data = estagnado

      const diasSemMovimento =
        (now.getTime() - new Date(lastMove).getTime()) / (1000 * 60 * 60 * 24);
      return diasSemMovimento > 30;
    }).length;
  }, [projects]);

  // KPI 3: Importância Especial (não concluídos com importancia_especial)
  const specialImportanceProjects = React.useMemo(() => {
    return projects.filter((p) => {
      const statusNorm = (p.status || '').trim().toLowerCase();
      if (statusNorm === 'concluído' || statusNorm === 'cancelado') return false;
      return p.importancia_especial === true;
    }).length;
  }, [projects]);

  // KPI 4: Concluídos (últimos 30 dias)
  const completedRecent = React.useMemo(() => {
    return projects.filter((p) => {
      if ((p.status || '').toLowerCase() !== 'concluído') return false;

      const now = new Date();
      const endDate = p.data_encerramento || p.updated_at;
      if (!endDate) return false;

      const diasAtrás = (now.getTime() - new Date(endDate).getTime()) / (1000 * 60 * 60 * 24);
      return diasAtrás <= 30;
    }).length;
  }, [projects]);

  // KPI 5: Impacto Estratégico Alto
  const highImpactProjects = React.useMemo(() => {
    return projects.filter((p) => (p.impacto_estrategico || '').toLowerCase() === 'alto').length;
  }, [projects]);

  // Stable sorted list of project IDs for color assignment
  const projectIds = React.useMemo(() => projects.map((p) => p.id).sort(), [projects]);

  // Transform to Kanban items
  // IMPORTANTE: Usa fase_atual para agrupamento, não status!
  const kanbanItems: KanbanItem[] = filteredProjects.map((p) => ({
    id: p.id,
    title: p.project_name,
    subtitle: p.espaider_code,
    value: p.total_value ? `R$ ${p.total_value.toLocaleString('pt-BR')}` : undefined,
    priority: (p.priority as KanbanItem['priority']) || 'normal',
    // Usa fase_atual para agrupamento, fallback para status se fase_atual não existir
    status: normalizeFaseSlug(p.fase_atual) || normalizeFaseSlug(p.status) || 'fila_projetos',
    metadata: {
      ...(p.mensagem_movimentacao ? { mensagem: p.mensagem_movimentacao } : {}),
      ...(p.last_update ? { data_movimentacao: p.last_update } : {}),
    },
  }));

  // Calculate dynamic columns based on FASE (not status)
  const dynamicColumns = React.useMemo(() => {
    // Extrai fases únicas (usa fase_atual, fallback para status)
    const existingPhases = Array.from(
      new Set(projects.map((p) => normalizeFaseSlug(p.fase_atual) || p.status || 'fila_projetos')),
    );

    // Combine phases (only show phases that actually exist, excluding banned)
    const phases = Array.from(new Set(existingPhases)).filter(
      (p) => !(bannedPhases as readonly string[]).includes(p),
    );

    const sortedPhases = phases.sort((a, b) => {
      const indexA = (phaseOrder as readonly string[]).indexOf(a);
      const indexB = (phaseOrder as readonly string[]).indexOf(b);

      if (indexA !== -1 && indexB !== -1) return indexA - indexB;
      if (indexA !== -1) return -1;
      if (indexB !== -1) return 1;
      return a.localeCompare(b);
    });

    return sortedPhases.map((phase) => {
      // Tenta encontrar o título original da fase de um projeto
      const project = projects.find(
        (p) => normalizeFaseSlug(p.fase_atual) === phase || p.status === phase,
      );
      const originalTitle = project?.fase_atual || project?.aprovador_atual;

      // Formata o título: usa label conhecido, ou título original, ou formata o slug
      let title = phaseLabels[phase as keyof typeof phaseLabels];
      if (!title && originalTitle) {
        title = originalTitle;
      }
      if (!title) {
        title = phase
          .split('_')
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ');
      }

      return {
        id: phase,
        title: title,
        color: phaseColors[phase] || 'blue',
      };
    });
  }, [projects]);

  // Handle drag-and-drop phase change (optimistic update)
  // NOTA: Agora atualiza fase_atual ao invés de status
  const handleStatusChange = async (itemId: string | number, newPhase: string) => {
    const projectId = String(itemId);
    const oldProject = projects.find((p) => p.id === projectId);
    if (!oldProject) return;

    const oldFase = oldProject.fase_atual;
    const oldStatus = oldProject.status;

    // Optimistic update: immediately move card in UI
    // Atualiza fase_atual (para agrupamento visual) e mantém status original
    setProjects((prev) =>
      prev.map((p) => (p.id === projectId ? { ...p, fase_atual: newPhase } : p)),
    );
    toast.info('Atualizando fase...');

    try {
      // TODO: Criar nova action updateProjectPhaseAction para atualizar fase_atual
      // Por enquanto, usa a action de status existente
      const result = await updateProjectStatusAction(projectId, newPhase);
      if (result.success) {
        toast.success(result.message);
      } else {
        // Revert on failure
        setProjects((prev) =>
          prev.map((p) =>
            p.id === projectId ? { ...p, fase_atual: oldFase, status: oldStatus } : p,
          ),
        );
        toast.error(result.message);
      }
    } catch {
      // Revert on error
      setProjects((prev) =>
        prev.map((p) =>
          p.id === projectId ? { ...p, fase_atual: oldFase, status: oldStatus } : p,
        ),
      );
      toast.error('Erro inesperado ao atualizar fase.');
    }
  };

  const handleItemClick = (item: KanbanItem) => {
    const project = projects.find((p) => p.id === item.id);
    if (project) {
      setSelectedProject(project);
    }
  };

  return (
    <div className="flex flex-col">
      <DashboardHeader
        title="Gestão de Projetos"
        subtitle="Visualize e gerencie todos os projetos do Espaider"
      />

      <div className="flex-1 space-y-6 p-6">
        {/* KPIs (Gerencial) */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          <KPICard
            title="Em Execução"
            value={inExecutionProjects}
            icon={PlayCircle}
            subtitle={`${inExecutionProjects} projeto(s)`}
            active={filterState.filters.status?.some(
              (s: any) => (s || '').trim().toLowerCase() === 'em execução',
            )}
            onClick={() => {
              const isActive = filterState.filters.status?.some(
                (s: any) => (s || '').trim().toLowerCase() === 'em execução',
              );
              filterState.updateFilter('status', isActive ? [] : ['em execução']);
            }}
          />
          <KPICard
            title="Sem Movimentação"
            value={withoutMovementProjects}
            icon={Clock}
            subtitle="30+ dias"
            active={false}
          />
          <KPICard
            title="Importância Especial"
            value={specialImportanceProjects}
            icon={Star}
            subtitle={`${specialImportanceProjects} projeto(s)`}
            active={filterState.filters.importancia_especial === true}
            onClick={() => {
              const isActive = filterState.filters.importancia_especial === true;
              filterState.updateFilter('importancia_especial', isActive ? null : true);
            }}
          />
          <KPICard
            title="Concluídos (30d)"
            value={completedRecent}
            icon={CheckCircle2}
            subtitle="últimos 30 dias"
            active={false}
          />
          <KPICard
            title="Alto Impacto"
            value={highImpactProjects}
            icon={TrendingUp}
            subtitle="portfólio crítico"
            active={false}
          />
        </div>

        {/* Filters Bar */}
        <div className="flex flex-col gap-4 rounded-lg border bg-card p-4 shadow-sm">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-1 items-center gap-2">
              <div className="relative max-w-sm flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Buscar projetos..."
                  value={filterState.search}
                  onChange={(e) => filterState.setSearch(e.target.value)}
                  className="border-muted-foreground/20 bg-background/50 pl-9 transition-colors focus:border-primary/50"
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleSync}
                disabled={isSyncing}
                className="text-muted-foreground hover:text-foreground"
              >
                {isSyncing ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw className="mr-2 h-4 w-4" />
                )}
                <span className="sr-only sm:not-sr-only">
                  {isSyncing ? 'Sincronizando...' : 'Sincronizar'}
                </span>
              </Button>
            </div>
          </div>

          {/* New Standardized Filter Bar */}
          <FilterBar
            moduleId="projetos"
            filters={filterState.registry}
            onFiltersChange={filterState.setFilters}
            onSearchChange={filterState.setSearch}
            onViewModeChange={setViewMode}
            initialViewMode={viewMode}
          />
        </div>

        {/* Content */}
        {isLoading ? (
          viewMode === 'kanban' ? (
            <div className="grid auto-cols-[280px] grid-flow-col gap-4 overflow-x-auto pb-4">
              {Array.from({ length: 3 }).map((_, col) => (
                <div key={col} className="space-y-3 rounded-lg border bg-muted/20 p-3">
                  <div className="h-6 w-24 animate-pulse rounded bg-muted" />
                  {Array.from({ length: 2 }).map((_, row) => (
                    <SkeletonKanbanCard key={row} />
                  ))}
                </div>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <tbody>
                      {Array.from({ length: 5 }).map((_, i) => (
                        <SkeletonTableRow key={i} />
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )
        ) : viewMode === 'kanban' ? (
          <KanbanBoard
            columns={dynamicColumns}
            items={kanbanItems}
            selectedId={selectedProject?.id}
            onItemClick={handleItemClick}
            onStatusChange={handleStatusChange}
            renderItemContent={(item) => {
              const project = filteredProjects.find((p) => p.id === item.id);
              if (!project) return null;
              return <ProjectKanbanCard project={project as Project} projectIds={projectIds} />;
            }}
            emptyMessage="Nenhum projeto encontrado. Sincronize com o Espaider para importar projetos."
          />
        ) : (
          <ProjectListView
            projects={filteredProjects}
            onSelectProject={(projectId) => {
              const project = filteredProjects.find((p) => p.id === projectId);
              if (project) setSelectedProject(project as Project);
            }}
          />
        )}

        {/* Split View - 360° Cockpit */}
        <SplitView
          isOpen={!!selectedProject}
          onClose={() => setSelectedProject(null)}
          title={selectedProject?.project_name || 'Visao 360'}
          subtitle={
            selectedProject
              ? `${selectedProject.espaider_code}${selectedProject.pasta_consultivo ? ` • ${selectedProject.pasta_consultivo}` : ''}`
              : undefined
          }
          width="wide"
        >
          {selectedProject && (
            <ProjectCockpit
              project={{
                id: selectedProject.id,
                espaider_code: selectedProject.espaider_code,
                project_name: selectedProject.project_name,
                status: selectedProject.status,
                original_status: selectedProject.original_status,
                // Novos campos (Migration 009)
                fase_atual: selectedProject.fase_atual,
                prazo_fase: selectedProject.prazo_fase,
                area: selectedProject.area,
                current_situation: selectedProject.current_situation,
                last_update: selectedProject.last_update,
                cronograma_atual: selectedProject.cronograma_atual,
                prazo_cronograma: selectedProject.prazo_cronograma,
                pasta_consultivo: selectedProject.pasta_consultivo,
                aprovador_atual: selectedProject.aprovador_atual,
                prazo_aprovador: selectedProject.prazo_aprovador,
                solucao_aplicada: selectedProject.solucao_aplicada,
                data_encerramento: selectedProject.data_encerramento,
                data_inicio_aprovacao: selectedProject.data_inicio_aprovacao,
                // === Visão 360 (Migration 014) ===
                trm_espaider: selectedProject.trm_espaider,
                tipo_chamado: selectedProject.tipo_chamado,
                tipo_assunto: selectedProject.tipo_assunto,
                solicitante: selectedProject.solicitante,
                objetivo: selectedProject.objetivo,
                motivo_importancia_especial: selectedProject.motivo_importancia_especial,
                mensagem_movimentacao: selectedProject.mensagem_movimentacao,
                justificativa: selectedProject.justificativa,
                importancia_especial: selectedProject.importancia_especial,
                impacto_operacional: selectedProject.impacto_operacional,
                impacto_estrategico: selectedProject.impacto_estrategico,
                escopo: selectedProject.escopo,
                complexidade_tecnica: selectedProject.complexidade_tecnica,
                notes_html: selectedProject.notes_html ?? null,
                end_date: selectedProject.end_date,
                responsible: selectedProject.responsible,
                priority: selectedProject.priority,
                category: selectedProject.category || null,
              }}
              schedules={(selectedProject.schedules || []).map((s) => ({
                id: s.id,
                atividade: s.atividade,
                responsavel: s.responsavel,
                data_inicio: s.data_inicio,
                data_fim: s.data_fim,
                data_prazo: s.data_prazo,
                status: s.status,
                fase_atividade: s.fase_atividade,
                atrasado: s.atrasado,
                setor_responsavel: s.setor_responsavel,
                item: s.item,
              }))}
              deliveries={(selectedProject.deliveries || []).map((d) => ({
                id: d.id,
                description: d.description,
                deadline: d.deadline,
                completed: d.completed,
              }))}
              histories={(selectedProject.histories || []).map((h) => ({
                id: h.id,
                type: h.type,
                from: h.from,
                to: h.to,
                step_from: h.step_from,
                step_to: h.step_to,
                message: h.message,
                date: h.date,
              }))}
              approvers={(selectedProject.approvers || []).map((a) => ({
                id: a.id,
                type: a.type,
                responsible: a.responsible,
              }))}
              budgets={(selectedProject.budgets || []).map((b) => ({
                id: b.id,
                value: b.value,
                supplier: b.supplier,
                date: b.date,
                currency: b.currency,
              }))}
              onSync={handleSync}
              isSyncing={isSyncing}
            />
          )}
        </SplitView>
      </div>
    </div>
  );
}

// Format relative date helper
function formatRelativeDate(dateStr: string): string {
  try {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return 'Hoje';
    if (diffDays === 1) return 'Ontem';
    if (diffDays < 7) return `há ${diffDays} dias`;
    if (diffDays < 30) return `há ${Math.floor(diffDays / 7)} sem.`;
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
  } catch {
    return '';
  }
}

// Impact badge helper
function ImpactBadge({ level }: { level: string | null | undefined }) {
  if (!level) return <span className="text-xs text-muted-foreground">-</span>;
  const colors: Record<string, string> = {
    alto: 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-300',
    medio: 'bg-amber-100 text-amber-700 dark:bg-amber-900/20 dark:text-amber-300',
    baixo: 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-300',
    normal: 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300',
  };
  const key = level
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
  return (
    <span
      className={`inline-flex items-center rounded-full px-1.5 py-0.5 text-[11px] font-medium ${colors[key] || colors.normal}`}
    >
      {level}
    </span>
  );
}

/**
 * Normaliza fase_atual para slug de coluna Kanban
 */
function normalizeFaseSlug(fase: string | null | undefined): string {
  if (!fase) return '';
  return fase
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove acentos
    .replace(/[^a-z0-9]+/g, '_') // Substitui caracteres especiais por _
    .replace(/^_+|_+$/g, ''); // Remove _ do início e fim
}

// Project List Component (Enhanced Grid)
function ProjectList({
  projects,
  onItemClick,
}: {
  projects: Project[];
  onItemClick: (project: Project) => void;
}) {
  const [sortField, setSortField] = React.useState<string>('project_name');
  const [sortDir, setSortDir] = React.useState<'asc' | 'desc'>('asc');

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDir('asc');
    }
  };

  const sortedProjects = React.useMemo(() => {
    return [...projects].sort((a, b) => {
      const getValue = (p: Project) => {
        switch (sortField) {
          case 'project_name':
            return p.project_name || '';
          case 'area':
            return p.area || '';
          case 'responsible':
            return p.responsible || '';
          case 'fase_atual':
            return p.fase_atual || '';
          case 'priority':
            return p.priority || '';
          case 'end_date':
            return p.end_date || '';
          case 'impacto_operacional':
            return p.impacto_operacional || '';
          case 'impacto_estrategico':
            return p.impacto_estrategico || '';
          case 'status':
            return p.status || '';
          default:
            return '';
        }
      };
      const valA = getValue(a);
      const valB = getValue(b);
      const cmp = valA.localeCompare(valB, 'pt-BR');
      return sortDir === 'asc' ? cmp : -cmp;
    });
  }, [projects, sortField, sortDir]);

  if (projects.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <FolderOpen className="mx-auto h-12 w-12 text-muted-foreground/50" />
          <h3 className="mt-4 text-lg font-medium">Nenhum projeto encontrado</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            {/* Mensagem atualizada para explicar filtro de concluídos */}
            Verifique se há filtros ativos ou sincronize com o Espaider.
          </p>
        </CardContent>
      </Card>
    );
  }

  const SortHeader = ({
    field,
    children,
    className = '',
  }: {
    field: string;
    children: React.ReactNode;
    className?: string;
  }) => {
    const isSorted = sortField === field;

    return (
      <th
        className={`cursor-pointer select-none px-3 py-2.5 text-left text-xs font-medium text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${className}`}
        onClick={() => handleSort(field)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleSort(field);
          }
        }}
        aria-sort={isSorted ? (sortDir === 'asc' ? 'ascending' : 'descending') : undefined}
        tabIndex={0}
        role="columnheader"
      >
        <span className="flex items-center gap-1">
          {children}
          {sortField === field && (
            <span className="text-primary">{sortDir === 'asc' ? '↑' : '↓'}</span>
          )}
        </span>
      </th>
    );
  };

  const isOverdue = (dateStr: string | null | undefined) => {
    if (!dateStr) return false;
    try {
      return new Date(dateStr) < new Date();
    } catch {
      return false;
    }
  };

  return (
    <Card>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b bg-muted/30">
              <tr>
                <SortHeader field="project_name" className="min-w-[200px]">
                  Projeto
                </SortHeader>
                <SortHeader field="area">Área</SortHeader>
                <SortHeader field="responsible">Responsável</SortHeader>
                <SortHeader field="fase_atual">Fase</SortHeader>
                <SortHeader field="priority">Prioridade</SortHeader>
                <SortHeader field="end_date">Prazo</SortHeader>
                <SortHeader field="impacto_operacional">Imp. Operacional</SortHeader>
                <SortHeader field="impacto_estrategico">Imp. Estratégico</SortHeader>
                <th className="min-w-[180px] px-3 py-2.5 text-left text-xs font-medium text-muted-foreground">
                  Última Mensagem
                </th>
                <SortHeader field="status">Status</SortHeader>
              </tr>
            </thead>
            <tbody className="divide-y [&>tr:nth-child(even)]:bg-muted/20">
              {sortedProjects.map((project) => {
                const faseSlug = normalizeFaseSlug(project.fase_atual);
                const statusSlug = normalizeFaseSlug(project.status); // Reuse same normalization for simplicity

                // Now uses shared phaseLabels from @/lib/constants/phase-labels

                const faseLabel = phaseLabels[faseSlug] || project.fase_atual || '-';

                return (
                  <tr
                    key={project.id}
                    className="cursor-pointer transition-colors hover:bg-muted/50"
                    onClick={() => onItemClick(project)}
                  >
                    <td className="px-3 py-3">
                      <p className="line-clamp-1 text-sm font-medium">{project.project_name}</p>
                      <p className="font-mono text-[11px] text-muted-foreground">
                        {project.espaider_code}
                      </p>
                    </td>
                    <td className="px-3 py-3">
                      <span className="text-xs text-muted-foreground">{project.area || '-'}</span>
                    </td>
                    <td className="px-3 py-3">
                      <span className="text-xs">{project.responsible || '-'}</span>
                    </td>
                    <td className="px-3 py-3">
                      <span className="text-xs font-medium">{faseLabel}</span>
                    </td>
                    <td className="px-3 py-3">
                      {project.priority ? (
                        <span
                          className={`inline-flex items-center rounded-full border px-1.5 py-0.5 text-[11px] font-medium uppercase tracking-wider ${
                            project.priority === 'urgente'
                              ? 'border-red-100 bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-300'
                              : project.priority === 'alta'
                                ? 'border-orange-100 bg-orange-50 text-orange-700 dark:bg-orange-900/20 dark:text-orange-300'
                                : 'border-blue-100 bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300'
                          }`}
                        >
                          {project.priority}
                        </span>
                      ) : (
                        <span className="text-xs text-muted-foreground">-</span>
                      )}
                    </td>
                    <td className="px-3 py-3 tabular-nums">
                      {project.end_date ? (
                        <span
                          className={`text-xs ${isOverdue(project.end_date) && project.status !== 'concluido' ? 'font-medium text-red-600 dark:text-red-400' : 'text-muted-foreground'}`}
                        >
                          {new Date(project.end_date).toLocaleDateString('pt-BR', {
                            day: '2-digit',
                            month: '2-digit',
                            year: '2-digit',
                          })}
                        </span>
                      ) : (
                        <span className="text-xs text-muted-foreground">-</span>
                      )}
                    </td>
                    <td className="px-3 py-3">
                      <ImpactBadge level={project.impacto_operacional} />
                    </td>
                    <td className="px-3 py-3">
                      <ImpactBadge level={project.impacto_estrategico} />
                    </td>
                    <td className="px-3 py-3">
                      {project.mensagem_movimentacao ? (
                        <div>
                          <p
                            className="line-clamp-1 text-[11px] text-muted-foreground"
                            title={project.mensagem_movimentacao}
                          >
                            {project.mensagem_movimentacao}
                          </p>
                          {project.last_update && (
                            <p className="text-[10px] text-muted-foreground/60">
                              {formatRelativeDate(project.last_update)}
                            </p>
                          )}
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground">-</span>
                      )}
                    </td>
                    <td className="px-3 py-3">
                      <StatusBadge status={statusSlug} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}

// Project Detail Component (360° View)
function ProjectDetail({
  project,
  onSync,
  isSyncing,
}: {
  project: Project;
  onSync?: () => void;
  isSyncing?: boolean;
}) {
  return (
    <Tabs defaultValue="resumo" className="w-full">
      <TabsList className="w-full justify-start">
        <TabsTrigger value="resumo">Resumo</TabsTrigger>
        <TabsTrigger value="cronogramas">Cronogramas</TabsTrigger>
        <TabsTrigger value="entregas">Entregas</TabsTrigger>
        <TabsTrigger value="acoes">Ações</TabsTrigger>
      </TabsList>

      <TabsContent value="resumo" className="space-y-4 pt-4">
        <div className="grid gap-4">
          <div className="grid gap-2">
            <label className="text-sm font-medium text-muted-foreground">Nome do Projeto</label>
            <p className="font-medium">{project.project_name}</p>
          </div>
          <div className="grid gap-2">
            <label className="text-sm font-medium text-muted-foreground">Código Espaider</label>
            <p>{project.espaider_code}</p>
          </div>
          <div className="grid gap-2">
            <label className="text-sm font-medium text-muted-foreground">Status</label>
            <StatusBadge status={project.status} />
          </div>
          {project.total_value && (
            <div className="grid gap-2">
              <label className="text-sm font-medium text-muted-foreground">Valor Total</label>
              <p className="text-lg font-semibold text-primary">
                R$ {project.total_value.toLocaleString('pt-BR')}
              </p>
            </div>
          )}
          {project.responsible && (
            <div className="grid gap-2">
              <label className="text-sm font-medium text-muted-foreground">Responsável</label>
              <p>{project.responsible}</p>
            </div>
          )}
        </div>
      </TabsContent>

      <TabsContent value="cronogramas" className="pt-4">
        {project.schedules && project.schedules.length > 0 ? (
          <div className="space-y-3">
            {project.schedules.map((schedule) => (
              <Card key={schedule.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{schedule.atividade || 'Sem nome'}</p>
                      {schedule.responsavel && (
                        <p className="text-sm text-muted-foreground">{schedule.responsavel}</p>
                      )}
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      {schedule.status && <Badge variant="secondary">{schedule.status}</Badge>}
                      {schedule.data_fim && (
                        <span className="text-xs text-muted-foreground">
                          Previsão: {new Date(schedule.data_fim).toLocaleDateString('pt-BR')}
                        </span>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <EmptyState message="Nenhum cronograma encontrado" />
        )}
      </TabsContent>

      <TabsContent value="entregas" className="pt-4">
        {project.deliveries && project.deliveries.length > 0 ? (
          <div className="space-y-3">
            {project.deliveries.map((delivery) => (
              <Card key={delivery.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{delivery.description}</p>
                      <p className="text-sm text-muted-foreground">
                        Prazo: {new Date(delivery.deadline).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                    <Badge variant={delivery.completed ? 'success' : 'secondary'}>
                      {delivery.completed ? 'Concluída' : 'Pendente'}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <EmptyState message="Nenhuma entrega encontrada" />
        )}
      </TabsContent>

      <TabsContent value="acoes" className="pt-4">
        <div className="space-y-3">
          <Button className="w-full" variant="outline" onClick={onSync} disabled={isSyncing}>
            {isSyncing ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="mr-2 h-4 w-4" />
            )}
            {isSyncing ? 'Sincronizando...' : 'Sincronizar com Espaider'}
          </Button>
          <p className="pt-2 text-center text-xs text-muted-foreground">
            Projetos são gerenciados no Espaider. Use a sincronização para atualizar os dados.
          </p>
        </div>
      </TabsContent>
    </Tabs>
  );
}

// Empty State Component
function EmptyState({ message }: { message: string }) {
  return <div className="py-8 text-center text-sm text-muted-foreground">{message}</div>;
}

// Status Badge Component
function StatusBadge({ status }: { status: string }) {
  const statusStyles: Record<string, string> = {
    projeto_futuro: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
    fila_projetos: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
    em_aprovacao: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
    em_execucao: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
    execucao_homologacao:
      'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
    execucao_producao: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
    em_homologacao: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-300',
    validacao_homologacao: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-300',
    validacao_producao: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-300',
    concluido: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
    monitoramento_producao: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
    cancelado: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
    suspenso: 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-300',
  };

  const statusLabels: Record<string, string> = {
    projeto_futuro: 'Futuro',
    fila_projetos: 'Fila de Projetos',
    em_aprovacao: 'Em Aprovação',
    em_execucao: 'Em Execução',
    execucao_homologacao: 'Exec - Homolog',
    execucao_producao: 'Exec - Produção',
    em_homologacao: 'Em Homologação',
    validacao_homologacao: 'Valid - Homolog',
    validacao_producao: 'Valid - Produção',
    concluido: 'Concluído',
    monitoramento_producao: 'Monitoramento',
    cancelado: 'Cancelado',
    suspenso: 'Suspenso',
  };

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
