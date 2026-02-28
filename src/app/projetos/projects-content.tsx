'use client';

import * as React from 'react';
import { feedback } from '@/lib/feedback';
import { DashboardHeader } from '@/components/layout/DashboardHeader';
import { type ViewMode } from '@/components/views/ViewToggle';
import { SplitView } from '@/components/views/SplitView';
import { ProjectCockpit } from '@/components/project';
import { syncEspaiderAction } from '@/app/actions/sync';
import { useProjetosFilters } from '@/hooks/useProjetosFilters';
import { ErrorBoundary } from '@/components/error/ErrorBoundary';
import { ErpReadOnlyBanner } from '@/components/shared/erp-readonly-banner';
import type { ProjectKpiFilterName } from '@/lib/domain/project-kpi';
import { filterByProjectKpi } from '@/lib/domain/project-kpi';

import { ProjectsKPIBar } from './components/ProjectsKPIBar';
import { ProjectsFilters } from './components/ProjectsFilters';
import { ProjectsKanbanView } from './components/ProjectsKanbanView';
import { ProjectsListViewWrapper } from './components/ProjectsListView';

// ---------- Types ----------

interface Project {
  id: string;
  espaider_code: string;
  project_name: string;
  status: string;
  original_status?: string | null;
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
  deliveries?: Array<{ id: string; description: string; deadline: string; completed: boolean }>;
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
  approvers?: Array<{ id: string; type: string; responsible: string }>;
  budgets?: Array<{ id: string; value: number; supplier: string; date: string; currency: string }>;
}

interface ProjectsContentProps {
  projects: Project[];
  isLoading?: boolean;
}

// ---------- Main Orchestrator ----------

export function ProjectsContent({
  projects: initialProjects,
  isLoading = false,
}: ProjectsContentProps) {
  const [projects, setProjects] = React.useState<Project[]>(initialProjects);
  const [selectedProject, setSelectedProject] = React.useState<Project | null>(null);
  const [isSyncing, setIsSyncing] = React.useState(false);
  const [activeKpiFilter, setActiveKpiFilter] = React.useState<ProjectKpiFilterName | null>(null);
  const [viewMode, setViewMode] = React.useState<ViewMode>('kanban');

  const {
    filters,
    search,
    viewMode: filterViewMode,
    filteredData,
    updateFilter,
    setSearch,
    setViewMode: setFilterViewMode,
    resetAllFilters,
    registry,
  } = useProjetosFilters(projects);

  const activeViewMode = filterViewMode || viewMode;
  const handleViewModeChange = (mode: string) => {
    setFilterViewMode(mode);
    setViewMode(mode as ViewMode);
  };

  React.useEffect(() => {
    setProjects(initialProjects);
  }, [initialProjects]);

  const handleSync = async () => {
    setIsSyncing(true);
    feedback.info('Iniciando sincronização com Espaider...');
    try {
      const result = await syncEspaiderAction();
      if (result.success) {
        feedback.success(result.message);
      } else {
        feedback.error(result.message);
      }
    } catch {
      feedback.error('Erro inesperado na sincronização. Tente novamente.');
    } finally {
      setIsSyncing(false);
    }
  };

  const handleKpiClick = (filterName: ProjectKpiFilterName) => {
    setActiveKpiFilter((prev) => (prev === filterName ? null : filterName));
  };

  const finalFilteredData = React.useMemo(
    () => filterByProjectKpi(filteredData, activeKpiFilter) as typeof filteredData,
    [filteredData, activeKpiFilter],
  );

  const projectIds = React.useMemo(() => projects.map((p) => p.id).sort(), [projects]);

  const listAnnouncement = activeKpiFilter
    ? `Filtro ativo com ${finalFilteredData.length} projetos.`
    : `Lista com ${finalFilteredData.length} projetos.`;

  return (
    <div className="flex flex-col">
      <DashboardHeader
        title="Gestão de Projetos"
        subtitle="Visualize todos os projetos importados do Espaider"
      />

      <div className="px-6 pt-4">
        <ErpReadOnlyBanner variant="page" />
      </div>

      <div className="flex-1 space-y-6 p-6">
        <p className="sr-only" role="status" aria-live="polite">
          {listAnnouncement}
        </p>

        {/* KPIs */}
        <ErrorBoundary label="KPIs Projetos">
          <ProjectsKPIBar
            projects={projects}
            activeKpiFilter={activeKpiFilter}
            onKpiClick={handleKpiClick}
          />
        </ErrorBoundary>

        {/* Filters + Sync */}
        <ProjectsFilters
          registry={registry}
          filters={filters}
          search={search}
          viewMode={activeViewMode}
          isSyncing={isSyncing}
          onUpdateFilter={updateFilter}
          onResetFilters={() => {
            resetAllFilters();
            setSearch('');
          }}
          onSearchChange={setSearch}
          onViewModeChange={handleViewModeChange}
          onSync={handleSync}
        />

        {/* Content: Kanban or List */}
        <ErrorBoundary label="Projetos View">
          {activeViewMode === 'kanban' ? (
            <ProjectsKanbanView
              projects={finalFilteredData as unknown as Project[]}
              allProjects={projects}
              filteredData={filteredData as unknown as Project[]}
              isLoading={isLoading}
              selectedProjectId={selectedProject?.id}
              projectIds={projectIds}
              onItemClick={(p) => setSelectedProject(p as Project)}
              onProjectsUpdate={setProjects as React.Dispatch<React.SetStateAction<Project[]>>}
            />
          ) : (
            <ProjectsListViewWrapper
              projects={finalFilteredData as unknown as Project[]}
              isLoading={isLoading}
              onSelectProject={(p) => setSelectedProject(p as Project)}
            />
          )}
        </ErrorBoundary>

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
