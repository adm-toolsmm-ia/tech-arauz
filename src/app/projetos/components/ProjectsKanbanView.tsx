'use client';

import * as React from 'react';
import { toast } from 'sonner';
import { Card, CardContent } from '@/components/ui/card';
import { KanbanBoard, type KanbanItem } from '@/components/views/KanbanBoard';
import { ProjectKanbanCard } from '@/components/project/ProjectKanbanCard';
import { SkeletonKanbanCard, SkeletonTableRow } from '@/components/ui/skeletons';
import { normalizePhaseSlug } from '@/lib/domain/project-phase';
import { phaseLabels, phaseColors, phaseOrder, bannedPhases } from '@/lib/constants/phase-labels';
import { updateProjectStatusAction } from '@/app/actions/projects';

interface ProjectsKanbanViewProps<T> {
  projects: T[];
  allProjects: T[];
  filteredData: T[];
  isLoading: boolean;
  selectedProjectId: string | undefined;
  projectIds: string[];
  onItemClick: (project: T) => void;
  onProjectsUpdate: React.Dispatch<React.SetStateAction<T[]>>;
}

// Minimal shape needed for kanban rendering
interface KanbanProject {
  id: string;
  espaider_code: string;
  project_name: string;
  status: string;
  fase_atual?: string | null;
  total_value: number | null;
  priority: string | null;
  responsible: string | null;
  end_date: string | null;
  mensagem_movimentacao?: string | null;
  last_update?: string | null;
  aprovador_atual?: string | null;
}

export function ProjectsKanbanView<T extends KanbanProject>({
  projects,
  allProjects,
  filteredData,
  isLoading,
  selectedProjectId,
  projectIds,
  onItemClick,
  onProjectsUpdate,
}: ProjectsKanbanViewProps<T>) {
  // Transform to Kanban items
  const kanbanItems: KanbanItem[] = projects.map((p) => ({
    id: p.id,
    title: p.project_name,
    subtitle: p.espaider_code,
    value: p.total_value ? `R$ ${p.total_value.toLocaleString('pt-BR')}` : undefined,
    priority: (p.priority as KanbanItem['priority']) || 'normal',
    status: normalizePhaseSlug(p.fase_atual) || normalizePhaseSlug(p.status) || 'fila_projetos',
    metadata: {
      ...(p.mensagem_movimentacao ? { mensagem: p.mensagem_movimentacao } : {}),
      ...(p.last_update ? { data_movimentacao: p.last_update } : {}),
    },
  }));

  // Dynamic columns based on FASE
  const dynamicColumns = React.useMemo(() => {
    const existingPhases = Array.from(
      new Set(
        allProjects.map(
          (p) =>
            normalizePhaseSlug(p.fase_atual) || normalizePhaseSlug(p.status) || 'fila_projetos',
        ),
      ),
    );

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
      const project = allProjects.find(
        (p) => normalizePhaseSlug(p.fase_atual) === phase || normalizePhaseSlug(p.status) === phase,
      );
      const originalTitle = project?.fase_atual || project?.aprovador_atual;
      let title = phaseLabels[phase as keyof typeof phaseLabels];
      if (!title && originalTitle) title = originalTitle;
      if (!title) {
        title = phase
          .split('_')
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ');
      }
      return { id: phase, title, color: phaseColors[phase] || 'blue' };
    });
  }, [allProjects]);

  // Handle drag-and-drop phase change
  const handleStatusChange = async (itemId: string | number, newPhase: string) => {
    const projectId = String(itemId);
    const oldProject = allProjects.find((p) => p.id === projectId);
    if (!oldProject) return;

    const oldFase = oldProject.fase_atual;
    const oldStatus = oldProject.status;

    onProjectsUpdate((prev) =>
      prev.map((p) => (p.id === projectId ? { ...p, fase_atual: newPhase } : p)),
    );
    toast.info('Atualizando fase...');

    try {
      const result = await updateProjectStatusAction(projectId, newPhase);
      if (result.success) {
        toast.success(result.message);
      } else {
        onProjectsUpdate((prev) =>
          prev.map((p) =>
            p.id === projectId ? { ...p, fase_atual: oldFase, status: oldStatus } : p,
          ),
        );
        toast.error(result.message);
      }
    } catch {
      onProjectsUpdate((prev) =>
        prev.map((p) =>
          p.id === projectId ? { ...p, fase_atual: oldFase, status: oldStatus } : p,
        ),
      );
      toast.error('Erro inesperado ao atualizar fase.');
    }
  };

  const handleItemClick = (item: KanbanItem) => {
    const project = allProjects.find((p) => p.id === item.id);
    if (project) onItemClick(project);
  };

  if (isLoading) {
    return (
      <div className="grid auto-cols-[280px] grid-flow-col gap-4 overflow-x-auto pb-4">
        {Array.from({ length: 3 }).map((_, col) => (
          <div key={col} className="bg-muted/20 space-y-3 rounded-lg border p-3">
            <div className="h-6 w-24 animate-pulse rounded bg-muted" />
            {Array.from({ length: 2 }).map((_, row) => (
              <SkeletonKanbanCard key={row} />
            ))}
          </div>
        ))}
      </div>
    );
  }

  return (
    <KanbanBoard
      columns={dynamicColumns}
      items={kanbanItems}
      selectedId={selectedProjectId}
      onItemClick={handleItemClick}
      readOnly
      renderItemContent={(item) => {
        const project = filteredData.find((p) => p.id === item.id);
        if (!project) return null;
        return <ProjectKanbanCard project={project} projectIds={projectIds} />;
      }}
      emptyMessage="Nenhum projeto encontrado. Sincronize com o Espaider para importar projetos."
    />
  );
}
