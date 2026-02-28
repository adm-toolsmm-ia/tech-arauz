'use client';

import * as React from 'react';
import { FolderOpen, Clock, TrendingUp, Star, CheckCircle2, PlayCircle } from 'lucide-react';
import { KPICard } from '@/components/dashboard/KPICard';
import type { ProjectKpiFilterName, ProjectForKpi } from '@/lib/domain/project-kpi';
import {
  countInExecutionProjects,
  countInHomologation,
  countInProduction,
  getProjectOverdueInfo,
  countHighPriority,
  countSpecialImportance,
  countRecentProjects,
  countWithoutMovement,
} from '@/lib/domain/project-kpi';

interface ProjectsKPIBarProps {
  projects: ProjectForKpi[];
  activeKpiFilter: ProjectKpiFilterName | null;
  onKpiClick: (filterName: ProjectKpiFilterName) => void;
}

export function ProjectsKPIBar({ projects, activeKpiFilter, onKpiClick }: ProjectsKPIBarProps) {
  const inExecution = React.useMemo(() => countInExecutionProjects(projects), [projects]);
  const inHomologation = React.useMemo(() => countInHomologation(projects), [projects]);
  const inProduction = React.useMemo(() => countInProduction(projects), [projects]);
  const overdueInfo = React.useMemo(() => getProjectOverdueInfo(projects), [projects]);
  const highPriority = React.useMemo(() => countHighPriority(projects), [projects]);
  const special = React.useMemo(() => countSpecialImportance(projects), [projects]);
  const recent = React.useMemo(() => countRecentProjects(projects), [projects]);
  const withoutMovement = React.useMemo(() => countWithoutMovement(projects), [projects]);

  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-6">
      <KPICard
        title="Em Execução"
        value={inExecution}
        icon={PlayCircle}
        subtitle={`${inHomologation} homologação • ${inProduction} produção`}
        active={activeKpiFilter === 'em_execucao'}
        onClick={() => onKpiClick('em_execucao')}
      />
      <KPICard
        title="Atrasados"
        value={overdueInfo.count}
        icon={Clock}
        subtitle={`Maior atraso: ${overdueInfo.maxDays} dias`}
        active={activeKpiFilter === 'atrasados'}
        onClick={() => onKpiClick('atrasados')}
      />
      <KPICard
        title="Alta Prioridade"
        value={highPriority}
        icon={TrendingUp}
        subtitle="Urgente + Alta + Estratégico"
        active={activeKpiFilter === 'alta_prioridade'}
        onClick={() => onKpiClick('alta_prioridade')}
      />
      <KPICard
        title="Importância Especial"
        value={special.active}
        icon={Star}
        subtitle={`${special.completed} já concluídos`}
        active={activeKpiFilter === 'importancia_especial'}
        onClick={() => onKpiClick('importancia_especial')}
      />
      <KPICard
        title="Projetos Recentes"
        value={recent}
        icon={CheckCircle2}
        subtitle="Movimentados em ≤ 7 dias"
        active={activeKpiFilter === 'recentes'}
        onClick={() => onKpiClick('recentes')}
      />
      <KPICard
        title="S/ Movimentação"
        value={withoutMovement}
        icon={FolderOpen}
        subtitle="Em exec > 7 dias s/ mover"
        active={activeKpiFilter === 'sem_movimentacao'}
        onClick={() => onKpiClick('sem_movimentacao')}
      />
    </div>
  );
}
