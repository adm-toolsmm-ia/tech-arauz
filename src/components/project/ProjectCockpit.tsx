'use client';

import { RefreshCw, Calendar, Package, FileText, ListChecks } from 'lucide-react';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

interface UIProject {
  id: string;
  espaider_code: string;
  project_name: string;
  status: string;
  end_date: string | null;
  responsible: string | null;
  priority: string | null;
  category: string | null;
}

interface UISchedule {
  id: string;
  schedule_code: string;
  description: string;
  scheduled_date: string;
  status: string;
}

interface UIDelivery {
  id: string;
  description: string;
  deadline: string;
  completed: boolean;
}

interface ProjectCockpitProps {
  project: UIProject;
  schedules: UISchedule[];
  deliveries: UIDelivery[];
  onSync?: () => void;
  isSyncing?: boolean;
}

const statusLabels: Record<string, string> = {
  projeto_futuro: 'Projeto Futuro',
  em_aprovacao: 'Em Aprovacao',
  em_desenvolvimento: 'Em Desenvolvimento',
  em_homologacao: 'Em Homologacao',
  concluido: 'Concluido',
  cancelado: 'Cancelado',
  suspenso: 'Suspenso',
};

const statusStyles: Record<string, string> = {
  projeto_futuro: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
  em_aprovacao: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300',
  em_desenvolvimento: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
  em_homologacao: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-300',
  concluido: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
  cancelado: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
  suspenso: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300',
};

function InfoField({ label, value }: { label: string; value: string | null }) {
  return (
    <div className="space-y-1">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-sm font-medium">{value || '-'}</p>
    </div>
  );
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return '-';
  try {
    return new Date(dateStr).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  } catch {
    return '-';
  }
}

export function ProjectCockpit({
  project,
  schedules,
  deliveries,
  onSync,
  isSyncing = false,
}: ProjectCockpitProps) {
  const completedDeliveries = deliveries.filter((d) => d.completed).length;

  return (
    <div className="space-y-6">
      {/* Status Badges */}
      <div className="flex flex-wrap items-center gap-2">
        <span
          className={cn(
            'inline-flex items-center rounded-md px-2.5 py-1 text-xs font-medium',
            statusStyles[project.status] || statusStyles.projeto_futuro
          )}
        >
          {statusLabels[project.status] || project.status}
        </span>
        {project.priority && (
          <Badge variant="outline" className="text-xs">
            {project.priority}
          </Badge>
        )}
        {project.category && (
          <Badge variant="secondary" className="text-xs">
            {project.category}
          </Badge>
        )}
      </div>

      {/* Tabs */}
      <Tabs defaultValue="detalhes" className="w-full">
        <TabsList className="w-full justify-start border-b rounded-none h-auto p-0 bg-transparent">
          <TabsTrigger
            value="detalhes"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-2.5"
          >
            <FileText className="size-4 mr-2" />
            Detalhes
          </TabsTrigger>
          <TabsTrigger
            value="entregas"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-2.5"
          >
            <Package className="size-4 mr-2" />
            Entregas
            {deliveries.length > 0 && (
              <span className="ml-2 text-xs text-muted-foreground">
                ({completedDeliveries}/{deliveries.length})
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger
            value="cronograma"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-2.5"
          >
            <Calendar className="size-4 mr-2" />
            Cronograma
            {schedules.length > 0 && (
              <span className="ml-2 text-xs text-muted-foreground">
                ({schedules.length})
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger
            value="acoes"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-2.5"
          >
            <ListChecks className="size-4 mr-2" />
            Acoes
          </TabsTrigger>
        </TabsList>

        {/* Tab: Detalhes */}
        <TabsContent value="detalhes" className="mt-6 space-y-6">
          {/* Informacoes */}
          <section>
            <h3 className="text-sm font-semibold mb-4">Informacoes</h3>
            <div className="grid grid-cols-2 gap-x-8 gap-y-4">
              <InfoField label="Responsavel" value={project.responsible} />
              <InfoField label="Categoria" value={project.category} />
              <InfoField label="Prazo Final" value={formatDate(project.end_date)} />
              <InfoField label="Prioridade" value={project.priority} />
            </div>
          </section>

          <Separator />

          {/* Situacao Atual */}
          <section>
            <h3 className="text-sm font-semibold mb-4">Situacao Atual</h3>
            <div className="rounded-lg border bg-muted/30 px-4 py-3">
              <p className="text-sm">{statusLabels[project.status] || project.status}</p>
            </div>
          </section>

          <Separator />

          {/* Resumo */}
          <section>
            <h3 className="text-sm font-semibold mb-4">Resumo</h3>
            <div className="grid grid-cols-2 gap-x-8 gap-y-4">
              <InfoField
                label="Entregas"
                value={deliveries.length > 0 ? `${completedDeliveries} de ${deliveries.length} concluidas` : 'Nenhuma'}
              />
              <InfoField
                label="Cronogramas"
                value={schedules.length > 0 ? `${schedules.length} atividade(s)` : 'Nenhum'}
              />
            </div>
          </section>

          <Separator />

          {/* Metadados */}
          <section>
            <h3 className="text-sm font-semibold mb-4">Metadados</h3>
            <div className="space-y-2 text-xs text-muted-foreground">
              <p>Origem: Espaider</p>
              <p>Codigo: {project.espaider_code}</p>
              <p>ID Interno: {project.id}</p>
            </div>
          </section>
        </TabsContent>

        {/* Tab: Entregas */}
        <TabsContent value="entregas" className="mt-6">
          {deliveries.length === 0 ? (
            <div className="text-center py-12 text-sm text-muted-foreground">
              Nenhuma entrega cadastrada
            </div>
          ) : (
            <div className="space-y-3">
              {deliveries.map((delivery) => (
                <div
                  key={delivery.id}
                  className={cn(
                    'flex items-center justify-between p-4 rounded-lg border',
                    delivery.completed && 'bg-green-50/50 dark:bg-green-950/20'
                  )}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={cn(
                        'size-2.5 rounded-full shrink-0',
                        delivery.completed
                          ? 'bg-green-500'
                          : new Date(delivery.deadline) < new Date()
                            ? 'bg-red-500'
                            : 'bg-amber-500'
                      )}
                    />
                    <span className="text-sm truncate">{delivery.description}</span>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-xs text-muted-foreground">
                      {formatDate(delivery.deadline)}
                    </span>
                    <Badge
                      variant={delivery.completed ? 'outline' : 'secondary'}
                      className={cn(
                        'text-xs',
                        delivery.completed && 'border-green-500 text-green-600'
                      )}
                    >
                      {delivery.completed ? 'Concluida' : 'Pendente'}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Tab: Cronograma */}
        <TabsContent value="cronograma" className="mt-6">
          {schedules.length === 0 ? (
            <div className="text-center py-12 text-sm text-muted-foreground">
              Nenhum cronograma cadastrado
            </div>
          ) : (
            <div className="space-y-3">
              {schedules.map((schedule) => (
                <div
                  key={schedule.id}
                  className="flex items-center justify-between p-4 rounded-lg border"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{schedule.schedule_code}</p>
                    <p className="text-xs text-muted-foreground truncate mt-0.5">
                      {schedule.description}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-xs text-muted-foreground">
                      {formatDate(schedule.scheduled_date)}
                    </span>
                    <Badge variant="secondary" className="text-xs">
                      {schedule.status || 'Pendente'}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Tab: Acoes */}
        <TabsContent value="acoes" className="mt-6">
          <div className="space-y-4">
            {onSync && (
              <Button
                variant="outline"
                className="w-full"
                onClick={onSync}
                disabled={isSyncing}
              >
                <RefreshCw className={cn('size-4 mr-2', isSyncing && 'animate-spin')} />
                {isSyncing ? 'Sincronizando...' : 'Sincronizar com Espaider'}
              </Button>
            )}
            <p className="text-xs text-muted-foreground text-center">
              Os dados deste projeto sao gerenciados no Espaider.
              Use a sincronizacao para atualizar as informacoes.
            </p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
