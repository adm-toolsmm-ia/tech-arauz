'use client';

import * as React from 'react';
import { Search, Filter, FolderOpen, Clock, DollarSign, TrendingUp, RefreshCw, Loader2, X } from 'lucide-react';
import { toast } from 'sonner';
import { DashboardHeader } from '@/components/layout/DashboardHeader';
import { KPICard } from '@/components/dashboard/KPICard';
import { ViewToggle, type ViewMode } from '@/components/views/ViewToggle';
import { KanbanBoard, projectStatusColumns, type KanbanItem } from '@/components/views/KanbanBoard';
import { SplitView } from '@/components/views/SplitView';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { syncEspaiderAction } from '@/app/actions/sync';
import { updateProjectStatusAction } from '@/app/actions/projects';
import { ProjectCockpit } from '@/components/project';

interface Project {
  id: string;
  espaider_code: string;
  project_name: string;
  status: string;
  total_value: number | null;
  responsible: string | null;
  start_date: string | null;
  end_date: string | null;
  priority: string | null;
  category?: string | null;
  schedules?: Array<{
    id: string;
    schedule_code: string;
    description: string;
    scheduled_date: string;
    status: string;
  }>;
  deliveries?: Array<{
    id: string;
    description: string;
    deadline: string;
    completed: boolean;
  }>;
}

interface ProjectsContentProps {
  projects: Project[];
}

export function ProjectsContent({ projects: initialProjects }: ProjectsContentProps) {
  const [projects, setProjects] = React.useState<Project[]>(initialProjects);
  const [view, setView] = React.useState<ViewMode>('kanban');
  const [searchTerm, setSearchTerm] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState<string>('all');
  const [showFilters, setShowFilters] = React.useState(false);
  const [selectedProject, setSelectedProject] = React.useState<Project | null>(null);
  const [isSyncing, setIsSyncing] = React.useState(false);

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

  // Filter projects
  const filteredProjects = React.useMemo(() => {
    let filtered = projects;

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter((p) => p.status === statusFilter);
    }

    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.project_name.toLowerCase().includes(term) ||
          p.espaider_code.toLowerCase().includes(term)
      );
    }

    return filtered;
  }, [projects, searchTerm, statusFilter]);

  // Calculate KPIs
  const totalValue = projects.reduce((sum, p) => sum + (p.total_value || 0), 0);
  const activeProjects = projects.filter(
    (p) => p.status === 'em_desenvolvimento' || p.status === 'em_homologacao'
  ).length;
  const completedProjects = projects.filter((p) => p.status === 'concluido').length;

  // Transform to Kanban items
  const kanbanItems: KanbanItem[] = filteredProjects.map((p) => ({
    id: p.id,
    title: p.project_name,
    subtitle: p.espaider_code,
    value: p.total_value ? `R$ ${p.total_value.toLocaleString('pt-BR')}` : undefined,
    priority: (p.priority as KanbanItem['priority']) || 'normal',
    status: p.status,
  }));

  // Handle drag-and-drop status change (optimistic update)
  const handleStatusChange = async (itemId: string | number, newStatus: string) => {
    const projectId = String(itemId);
    const oldProject = projects.find((p) => p.id === projectId);
    if (!oldProject) return;

    const oldStatus = oldProject.status;

    // Optimistic update: immediately move card in UI
    setProjects((prev) =>
      prev.map((p) => (p.id === projectId ? { ...p, status: newStatus } : p))
    );
    toast.info('Atualizando status...');

    try {
      const result = await updateProjectStatusAction(projectId, newStatus);
      if (result.success) {
        toast.success(result.message);
      } else {
        // Revert on failure
        setProjects((prev) =>
          prev.map((p) => (p.id === projectId ? { ...p, status: oldStatus } : p))
        );
        toast.error(result.message);
      }
    } catch {
      // Revert on error
      setProjects((prev) =>
        prev.map((p) => (p.id === projectId ? { ...p, status: oldStatus } : p))
      );
      toast.error('Erro inesperado ao atualizar status.');
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
        {/* KPIs */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <KPICard
            title="Total de Projetos"
            value={projects.length}
            icon={FolderOpen}
            trend={{ value: '+3 este mês', positive: true }}
          />
          <KPICard
            title="Em Andamento"
            value={activeProjects}
            icon={Clock}
            subtitle="Desenvolvimento + Homologação"
          />
          <KPICard
            title="Concluídos"
            value={completedProjects}
            icon={TrendingUp}
            trend={{ value: `${Math.round((completedProjects / projects.length) * 100) || 0}%`, positive: true }}
          />
          <KPICard
            title="Valor Total"
            value={`R$ ${(totalValue / 1000).toFixed(0)}k`}
            icon={DollarSign}
            subtitle="Soma de todos os projetos"
          />
        </div>

        {/* Filters Bar */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-1 gap-2">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar projetos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <Button
              variant={showFilters ? 'default' : 'outline'}
              size="icon"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={handleSync}
              disabled={isSyncing}
            >
              {isSyncing ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="mr-2 h-4 w-4" />
              )}
              {isSyncing ? 'Sincronizando...' : 'Sincronizar Espaider'}
            </Button>
            <ViewToggle view={view} onViewChange={setView} />
          </div>
        </div>

        {/* Status Filter Panel */}
        {showFilters && (
          <div className="flex items-center gap-2 flex-wrap animate-fade-in">
            <span className="text-sm text-muted-foreground">Status:</span>
            {[
              { value: 'all', label: 'Todos' },
              { value: 'projeto_futuro', label: 'Futuro' },
              { value: 'em_aprovacao', label: 'Aprovação' },
              { value: 'em_desenvolvimento', label: 'Desenvolvimento' },
              { value: 'em_homologacao', label: 'Homologação' },
              { value: 'concluido', label: 'Concluído' },
              { value: 'cancelado', label: 'Cancelado' },
              { value: 'suspenso', label: 'Suspenso' },
            ].map((opt) => (
              <Button
                key={opt.value}
                variant={statusFilter === opt.value ? 'default' : 'outline'}
                size="sm"
                onClick={() => setStatusFilter(opt.value)}
                className="h-7 text-xs"
              >
                {opt.label}
              </Button>
            ))}
            {statusFilter !== 'all' && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setStatusFilter('all')}
                className="h-7 text-xs"
              >
                <X className="mr-1 h-3 w-3" />
                Limpar
              </Button>
            )}
          </div>
        )}

        {/* Content */}
        {view === 'kanban' ? (
          <KanbanBoard
            columns={projectStatusColumns}
            items={kanbanItems}
            onItemClick={handleItemClick}
            onStatusChange={handleStatusChange}
            emptyMessage="Nenhum projeto encontrado. Sincronize com o Espaider para importar projetos."
          />
        ) : (
          <ProjectList projects={filteredProjects} onItemClick={(p) => setSelectedProject(p)} />
        )}

        {/* Split View - 360° Cockpit */}
        <SplitView
          isOpen={!!selectedProject}
          onClose={() => setSelectedProject(null)}
          title={selectedProject?.project_name || 'Visao 360'}
          subtitle={selectedProject?.espaider_code}
          width="2xl"
        >
          {selectedProject && (
            <ProjectCockpit
              project={{
                id: selectedProject.id,
                espaider_code: selectedProject.espaider_code,
                project_name: selectedProject.project_name,
                status: selectedProject.status,
                end_date: selectedProject.end_date,
                responsible: selectedProject.responsible,
                priority: selectedProject.priority,
                category: selectedProject.category || null,
              }}
              schedules={(selectedProject.schedules || []).map((s) => ({
                id: s.id,
                schedule_code: s.schedule_code,
                description: s.description,
                scheduled_date: s.scheduled_date,
                status: s.status || 'pendente',
              }))}
              deliveries={(selectedProject.deliveries || []).map((d) => ({
                id: d.id,
                description: d.description,
                deadline: d.deadline,
                completed: d.completed,
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

// Project List Component
function ProjectList({
  projects,
  onItemClick,
}: {
  projects: Project[];
  onItemClick: (project: Project) => void;
}) {
  if (projects.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <FolderOpen className="mx-auto h-12 w-12 text-muted-foreground/50" />
          <h3 className="mt-4 text-lg font-medium">Nenhum projeto encontrado</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Sincronize com o Espaider para importar projetos.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-0">
        <div className="divide-y">
          {projects.map((project) => (
            <div
              key={project.id}
              className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors cursor-pointer"
              onClick={() => onItemClick(project)}
            >
              <div className="space-y-1">
                <p className="font-medium">{project.project_name}</p>
                <p className="text-sm text-muted-foreground">{project.espaider_code}</p>
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
      </CardContent>
    </Card>
  );
}

// Project Detail Component (360° View)
function ProjectDetail({ project, onSync, isSyncing }: { project: Project; onSync?: () => void; isSyncing?: boolean }) {
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
                      <p className="font-medium">{schedule.schedule_code}</p>
                      <p className="text-sm text-muted-foreground">{schedule.description}</p>
                    </div>
                    <Badge variant="secondary">
                      {new Date(schedule.scheduled_date).toLocaleDateString('pt-BR')}
                    </Badge>
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
          <p className="text-xs text-muted-foreground text-center pt-2">
            Projetos são gerenciados no Espaider. Use a sincronização para atualizar os dados.
          </p>
        </div>
      </TabsContent>
    </Tabs>
  );
}

// Empty State Component
function EmptyState({ message }: { message: string }) {
  return (
    <div className="py-8 text-center text-sm text-muted-foreground">{message}</div>
  );
}

// Status Badge Component
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
