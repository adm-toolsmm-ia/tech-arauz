'use client';

import * as React from 'react';
import { User } from '@supabase/supabase-js';
import { FolderOpen, Clock, CheckCircle, AlertTriangle } from 'lucide-react';
import { DashboardHeader } from '@/components/layout/DashboardHeader';
import { KPICard } from '@/components/dashboard/KPICard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  ProjectPipelineChart,
  buildPipelineData,
  ProjectTrendChart,
  buildTrendData,
} from '@/components/charts';

interface Profile {
  id: string;
  full_name: string | null;
  role: string;
}

interface Project {
  id: string;
  espaider_code: string;
  project_name: string;
  status: string;
  total_value: number | null;
}

interface ChartProject {
  status: string;
  created_at: string;
}

interface DashboardContentProps {
  user: User;
  profile: Profile | null;
  projects: Project[];
  chartProjects?: ChartProject[];
}

export function DashboardContent({ user, profile, projects, chartProjects = [] }: DashboardContentProps) {
  // Calculate KPIs
  const totalProjects = projects.length;
  const activeProjects = projects.filter(
    (p) => p.status === 'em_desenvolvimento' || p.status === 'em_aprovacao'
  ).length;
  const completedProjects = projects.filter((p) => p.status === 'concluido').length;
  const pendingApproval = projects.filter((p) => p.status === 'em_aprovacao').length;

  // Chart data (memoized)
  const pipelineData = React.useMemo(() => buildPipelineData(chartProjects), [chartProjects]);
  const trendData = React.useMemo(() => buildTrendData(chartProjects), [chartProjects]);

  return (
    <div className="flex flex-col">
      <DashboardHeader
        title={`Bem-vindo, ${profile?.full_name || user.email?.split('@')[0]}!`}
        subtitle="Aqui está o resumo do seu portal de gestão"
      />

      <div className="flex-1 space-y-6 p-6">
        {/* KPIs */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <KPICard
            title="Total de Projetos"
            value={totalProjects}
            icon={FolderOpen}
            trend={{ value: '+3 este mês', positive: true }}
          />
          <KPICard
            title="Em Andamento"
            value={activeProjects}
            icon={Clock}
            subtitle="Projetos ativos no momento"
          />
          <KPICard
            title="Concluídos"
            value={completedProjects}
            icon={CheckCircle}
            trend={{ value: '+2 este mês', positive: true }}
          />
          <KPICard
            title="Aguardando Aprovação"
            value={pendingApproval}
            icon={AlertTriangle}
            subtitle="Requer atenção"
          />
        </div>

        {/* Charts */}
        {chartProjects.length > 0 && (
          <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
            <ProjectPipelineChart data={pipelineData} />
            <ProjectTrendChart data={trendData} />
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
              <div className="space-y-4">
                {projects.slice(0, 5).map((project) => (
                  <div
                    key={project.id}
                    className="flex items-center justify-between rounded-lg border p-4 hover:bg-muted/50 transition-colors cursor-pointer"
                  >
                    <div className="space-y-1">
                      <p className="text-sm font-medium">{project.project_name}</p>
                      <p className="text-xs text-muted-foreground">
                        {project.espaider_code}
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      {project.total_value && (
                        <span className="text-sm font-medium text-primary">
                          R$ {project.total_value.toLocaleString('pt-BR')}
                        </span>
                      )}
                      <StatusBadge status={project.status} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const statusStyles: Record<string, string> = {
    projeto_futuro: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
    em_aprovacao: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
    em_desenvolvimento: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
    em_homologacao: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-300',
    concluido: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
    cancelado: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
    suspenso: 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-300',
  };

  const statusLabels: Record<string, string> = {
    projeto_futuro: 'Futuro',
    em_aprovacao: 'Em Aprovação',
    em_desenvolvimento: 'Em Desenvolvimento',
    em_homologacao: 'Em Homologação',
    concluido: 'Concluído',
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
