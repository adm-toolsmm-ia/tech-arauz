'use client';

import * as React from 'react';
import { Search, Filter, FolderOpen, Clock, DollarSign, TrendingUp, RefreshCw, Loader2, X } from 'lucide-react';
import { toast } from 'sonner';
import { DashboardHeader } from '@/components/layout/DashboardHeader';
import { KPICard } from '@/components/dashboard/KPICard';
import { ViewToggle, type ViewMode } from '@/components/views/ViewToggle';
import { KanbanBoard, type KanbanItem } from '@/components/views/KanbanBoard';
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
  // IMPORTANTE: Usa fase_atual para agrupamento, não status!
  const kanbanItems: KanbanItem[] = filteredProjects.map((p) => ({
    id: p.id,
    title: p.project_name,
    subtitle: p.espaider_code,
    value: p.total_value ? `R$ ${p.total_value.toLocaleString('pt-BR')}` : undefined,
    priority: (p.priority as KanbanItem['priority']) || 'normal',
    // Usa fase_atual para agrupamento, fallback para status se fase_atual não existir
    status: normalizeFaseSlug(p.fase_atual) || p.status || 'fila_projetos',
  }));

  // Calculate dynamic columns based on FASE (not status)
  const dynamicColumns = React.useMemo(() => {
    // Extrai fases únicas (usa fase_atual, fallback para status)
    const existingPhases = Array.from(new Set(projects.map((p) => normalizeFaseSlug(p.fase_atual) || p.status || 'fila_projetos')));

    // Fases Obrigatórias (Sempre visíveis no Board)
    const mandatoryPhases = ['execucao_producao', 'validacao_producao'];

    // Fases Proibidas (Nunca visíveis no Board)
    const bannedPhases = ['fila_projetos', 'fila_de_projetos'];

    // Combine phases, ensuring mandatory ones are present
    const phases = Array.from(new Set([...existingPhases, ...mandatoryPhases]))
      .filter(p => !bannedPhases.includes(p));

    // Ordem das fases no fluxo de projeto
    const phaseOrder = [
      'fila_projetos',
      'fila_de_projetos',
      'levantamentos_iniciais',
      'analise_e_definicao_do_projeto',
      'aprovacao_do_projeto',
      'execucao_homologacao',
      'validacao_homologacao',
      'execucao_producao',
      'validacao_producao',
      'monitoramento_producao',
      'concluido',
      'cancelado',
      'suspenso',
    ];

    const sortedPhases = phases.sort((a, b) => {
      const indexA = phaseOrder.indexOf(a);
      const indexB = phaseOrder.indexOf(b);

      if (indexA !== -1 && indexB !== -1) return indexA - indexB;
      if (indexA !== -1) return -1;
      if (indexB !== -1) return 1;
      return a.localeCompare(b);
    });

    // Labels amigáveis para as fases
    const phaseLabels: Record<string, string> = {
      fila_projetos: 'Fila de Projetos',
      fila_de_projetos: 'Fila de Projetos',
      levantamentos_iniciais: 'Levantamentos',
      analise_e_definicao_do_projeto: 'Análise/Definição',
      aprovacao_do_projeto: 'Aprovação',
      execucao_homologacao: 'Exec - Homolog',
      validacao_homologacao: 'Valid - Homolog',
      execucao_producao: 'Exec - Produção',
      validacao_producao: 'Valid - Produção',
      monitoramento_producao: 'Monitoramento',
      concluido: 'Concluído',
      cancelado: 'Cancelado',
      suspenso: 'Suspenso',
      // Legados
      projeto_futuro: 'Futuro',
      em_execucao: 'Em Execução',
      aguardando_fornecedor: 'Aguard. Fornecedor',
      em_assinatura: 'Em Assinatura',
    };

    // Cores por fase
    const phaseColors: Record<string, string> = {
      fila_projetos: 'blue',
      fila_de_projetos: 'blue',
      levantamentos_iniciais: 'amber',
      analise_e_definicao_do_projeto: 'amber',
      aprovacao_do_projeto: 'amber',
      execucao_homologacao: 'purple',
      validacao_homologacao: 'cyan',
      execucao_producao: 'purple',
      validacao_producao: 'cyan',
      monitoramento_producao: 'green',
      concluido: 'green',
      cancelado: 'red',
      suspenso: 'gray',
    };

    return sortedPhases.map((phase) => {
      // Tenta encontrar o título original da fase de um projeto
      const project = projects.find(p => normalizeFaseSlug(p.fase_atual) === phase || p.status === phase);
      const originalTitle = project?.fase_atual || project?.aprovador_atual;

      // Formata o título: usa label conhecido, ou título original, ou formata o slug
      let title = phaseLabels[phase];
      if (!title && originalTitle) {
        title = originalTitle;
      }
      if (!title) {
        title = phase
          .split('_')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ');
      }

      return {
        id: phase,
        title: title,
        color: phaseColors[phase] || 'blue',
      };
    });
  }, [projects]);

  /**
   * Normaliza fase_atual para slug de coluna Kanban
   */
  function normalizeFaseSlug(fase: string | null | undefined): string {
    if (!fase) return '';
    return fase
      .trim()
      .toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // Remove acentos
      .replace(/[^a-z0-9]+/g, '_') // Substitui caracteres especiais por _
      .replace(/^_+|_+$/g, ''); // Remove _ do início e fim
  }

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
      prev.map((p) => (p.id === projectId ? { ...p, fase_atual: newPhase } : p))
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
          prev.map((p) => (p.id === projectId ? { ...p, fase_atual: oldFase, status: oldStatus } : p))
        );
        toast.error(result.message);
      }
    } catch {
      // Revert on error
      setProjects((prev) =>
        prev.map((p) => (p.id === projectId ? { ...p, fase_atual: oldFase, status: oldStatus } : p))
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
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between bg-card p-4 rounded-lg border shadow-sm">
          <div className="flex flex-1 gap-2 items-center">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar projetos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 bg-background/50 border-muted-foreground/20 focus:border-primary/50 transition-colors"
              />
            </div>
            <div className="h-8 w-px bg-border mx-2" />
            <Button
              variant={showFilters ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className={showFilters ? "text-primary" : "text-muted-foreground"}
            >
              <Filter className="mr-2 h-4 w-4" />
              Filtros
            </Button>
            {statusFilter !== 'all' && (
              <Badge variant="secondary" className="gap-1 animate-in fade-in zoom-in">
                Status: {statusFilter}
                <X
                  className="h-3 w-3 cursor-pointer hover:text-destructive"
                  onClick={() => setStatusFilter('all')}
                />
              </Badge>
            )}
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
              <span className="sr-only sm:not-sr-only">{isSyncing ? 'Sincronizando...' : 'Sincronizar'}</span>
            </Button>
            <div className="h-8 w-px bg-border mx-2" />
            <ViewToggle view={view} onViewChange={setView} />
          </div>
        </div>

        {/* Status Filter Panel (Collapsible) */}
        {showFilters && (
          <div className="p-4 bg-muted/30 rounded-lg border border-dashed animate-in slide-in-from-top-2">
            <div className="flex flex-wrap gap-2">
              {[
                { value: 'all', label: 'Todos' },
                { value: 'projeto_futuro', label: 'Futuro' },
                { value: 'em_aprovacao', label: 'Aprovação' },
                { value: 'em_execucao', label: 'Execução' },
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
                  className={`h-7 text-xs rounded-full ${statusFilter === opt.value ? 'shadow-md' : 'bg-transparent border-muted-foreground/30'}`}
                >
                  {opt.label}
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Content */}
        {view === 'kanban' ? (
          <KanbanBoard
            columns={dynamicColumns}
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
          subtitle={selectedProject ? `${selectedProject.espaider_code}${selectedProject.pasta_consultivo ? ` • ${selectedProject.pasta_consultivo}` : ''}` : undefined}
          width="2xl"
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
    fila_projetos: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
    em_aprovacao: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
    em_execucao: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
    execucao_homologacao: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
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
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${statusStyles[status] || statusStyles.projeto_futuro
        }`}
    >
      {statusLabels[status] || status}
    </span>
  );
}
