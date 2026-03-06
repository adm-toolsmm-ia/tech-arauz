'use client';

import * as React from 'react';
import { User } from '@supabase/supabase-js';
import { DashboardHeader } from '@/components/layout/DashboardHeader';
import type { UIProject } from '@/lib/transformers/project';
import { SplitView } from '@/components/views/SplitView';
import { ProjectCockpit } from '@/components/project/ProjectCockpit';
import { 
  CompletedByResponsibleChart, 
  HistoryMovementsChart, 
  PhaseTimeMetrics 
} from '@/components/dashboard/operation';

interface Profile {
  id: string;
  full_name: string | null;
  role: string;
}

interface ChartProject extends UIProject {
  histories?: any[];
}

interface DashboardOperacaoContentProps {
  user: User;
  profile: Profile | null;
  projects: UIProject[];
  chartProjects?: ChartProject[];
  isLoading?: boolean;
}

export function DashboardOperacaoContent({
  user,
  profile,
  projects,
  chartProjects = [],
  isLoading = false,
}: DashboardOperacaoContentProps) {
  const [selectedProject, setSelectedProject] = React.useState<UIProject | null>(null);

  return (
    <div className="flex flex-col">
      <DashboardHeader
        title="Operação e Histórico"
        subtitle="Movimentações de projetos, tempos de fase e produtividade"
      />

      <div className="flex-1 space-y-6 p-6">
        {/* Gráficos de Operação */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {chartProjects.length > 0 && (
            <>
              <CompletedByResponsibleChart projects={chartProjects} />
              <HistoryMovementsChart projects={chartProjects} />
            </>
          )}
        </div>
        
        <div className="grid grid-cols-1">
          {chartProjects.length > 0 && (
            <PhaseTimeMetrics projects={chartProjects} />
          )}
        </div>

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
