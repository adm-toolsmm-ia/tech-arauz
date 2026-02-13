'use client';

import { RefreshCw, Calendar, Package, FileText, ListChecks, Clock, DollarSign, History, UserCheck, ArrowRight } from 'lucide-react';

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
  original_status?: string | null;
  // === Novos campos (Migration 009) ===
  /** Fase atual do projeto - usado para agrupar Kanban */
  fase_atual?: string | null;
  prazo_fase?: string | null;
  area?: string | null;
  current_situation?: string | null;
  last_update?: string | null;
  cronograma_atual?: string | null;
  prazo_cronograma?: string | null;
  pasta_consultivo?: string | null;
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
  // Legacy (mantidos para compatibilidade)
  aprovador_atual?: string | null;
  prazo_aprovador?: string | null;
  end_date: string | null;
  responsible: string | null;
  priority: string | null;
  category?: string | null;
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

export interface UIHistory {
  id: string;
  type: string;
  from: string;
  to: string;
  step_from: string;
  step_to: string;
  message: string;
  date: string;
}

export interface UIApprover {
  id: string;
  type: string;
  responsible: string;
}

export interface UIBudget {
  id: string;
  value: number;
  supplier: string;
  date: string;
  currency: string;
}

interface ProjectCockpitProps {
  project: UIProject;
  schedules: UISchedule[];
  deliveries: UIDelivery[];
  histories?: UIHistory[];
  approvers?: UIApprover[];
  budgets?: UIBudget[];
  onSync?: () => void;
  isSyncing?: boolean;
}

const statusLabels: Record<string, string> = {
  projeto_futuro: 'Projeto Futuro',
  em_aprovacao: 'Em Aprovação',
  em_desenvolvimento: 'Em Desenvolvimento',
  em_homologacao: 'Em Homologação',
  concluido: 'Concluído',
  aprovado_e_concluido: 'Aprovado e Concluído',
  cancelado: 'Cancelado',
  suspenso: 'Suspenso',
};

const statusStyles: Record<string, string> = {
  projeto_futuro: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
  fila_projetos: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
  em_aprovacao: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300',
  em_execucao: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
  execucao_homologacao: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
  execucao_producao: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
  em_homologacao: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-300',
  validacao_homologacao: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-300',
  validacao_producao: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-300',
  concluido: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
  aprovado_e_concluido: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
  monitoramento_producao: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
  cancelado: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
  suspenso: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300',
};

function InfoField({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div className="space-y-1">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-sm font-medium">{value || '-'}</p>
    </div>
  );
}

function formatDate(dateStr: string | null | undefined): string {
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

function formatDateTime(dateStr: string | null | undefined): string {
  if (!dateStr) return '-';
  try {
    return new Date(dateStr).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return '-';
  }
}

export function ProjectCockpit({
  project,
  schedules,
  deliveries,
  histories = [],
  approvers = [],
  budgets = [],
  onSync,
  isSyncing = false,
}: ProjectCockpitProps) {
  const completedDeliveries = deliveries.filter((d) => d.completed).length;

  return (
    <div className="space-y-6">
      {/* Header with Title and Code */}
      {/* Header removed - handled by SplitView */}

      {/* Header badges removed as per user request */}

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
            value="orcamentos"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-2.5"
          >
            <DollarSign className="size-4 mr-2" />
            Orçamentos
            {budgets.length > 0 && (
              <span className="ml-2 text-xs text-muted-foreground">
                ({budgets.length})
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
            value="historicos"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-2.5"
          >
            <History className="size-4 mr-2" />
            Histórico
            {histories.length > 0 && (
              <span className="ml-2 text-xs text-muted-foreground">
                ({histories.length})
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger
            value="aprovadores"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-2.5"
          >
            <UserCheck className="size-4 mr-2" />
            Aprovadores
            {approvers.length > 0 && (
              <span className="ml-2 text-xs text-muted-foreground">
                ({approvers.length})
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger
            value="acoes"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-2.5"
          >
            <ListChecks className="size-4 mr-2" />
            Ações
          </TabsTrigger>
        </TabsList>

        {/* Tab: Detalhes */}
        <TabsContent value="detalhes" className="mt-6 space-y-8">

          {/* 0. Importância Especial (Top Priority) */}
          {project.importancia_especial && (
            <div className="rounded-md bg-amber-50 dark:bg-amber-900/10 p-4 border border-amber-200 dark:border-amber-800">
              <p className="text-sm font-medium text-amber-800 dark:text-amber-300 mb-1 flex items-center gap-2">
                ⚠️ Importância Especial
              </p>
              <p className="text-sm text-amber-700 dark:text-amber-400">
                {project.motivo_importancia_especial || 'Sem motivo especificado'}
              </p>
            </div>
          )}

          {/* 1. Informações Gerais */}
          <section>
            <div className="flex items-center gap-2 mb-4 border-b pb-2">
              <FileText className="size-5 text-primary" />
              <h3 className="font-semibold text-base">Informações Gerais</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <InfoField label="Área" value={project.area} />
              <InfoField label="Categoria" value={project.category} />
              <InfoField label="Prioridade" value={project.priority} />
              {/* Status movido para cá, substituindo Pasta Consultivo */}
              <InfoField label="Status" value={project.current_situation || statusLabels[project.status] || project.status} />
              <InfoField label="Solução Aplicada" value={project.solucao_aplicada} />
              <InfoField label="Complexidade Técnica" value={project.complexidade_tecnica} />
            </div>
          </section>

          {/* 3. Participantes */}
          <section>
            <div className="flex items-center gap-2 mb-4 border-b pb-2">
              <ListChecks className="size-5 text-primary" />
              <h3 className="font-semibold text-base">Participantes</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <InfoField label="Responsável" value={project.responsible} />
              <InfoField label="Solicitante" value={project.solicitante} />
              <InfoField label="Aprovador Atual" value={project.aprovador_atual} />
              <InfoField label="Prazo do Aprovador" value={formatDate(project.prazo_aprovador)} />
            </div>
          </section>

          {/* 4. Datas e Prazos */}
          <section>
            <div className="flex items-center gap-2 mb-4 border-b pb-2">
              <Calendar className="size-5 text-primary" />
              <h3 className="font-semibold text-base">Datas e Prazos</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <InfoField label="Prazo Final" value={formatDate(project.end_date)} />
              <InfoField label="Início Aprovação" value={formatDate(project.data_inicio_aprovacao)} />
              <InfoField label="Encerramento" value={formatDate(project.data_encerramento)} />
              <InfoField label="Última Movimentação" value={formatDateTime(project.last_update)} />
            </div>
          </section>

          {/* 5. Estratégia e Escopo */}
          {/* 5. Estratégia */}
          <section>
            <div className="flex items-center gap-2 mb-4 border-b pb-2">
              <RefreshCw className="size-5 text-primary" />
              <h3 className="font-semibold text-base">Estratégia</h3>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InfoField label="Impacto Estratégico" value={project.impacto_estrategico} />
                <InfoField label="Impacto Operacional" value={project.impacto_operacional} />
              </div>
            </div>
          </section>

          {/* 6. Detalhamento do Projeto (Textos Longos) */}
          <section>
            <div className="flex items-center gap-2 mb-4 border-b pb-2">
              <FileText className="size-5 text-primary" />
              <h3 className="font-semibold text-base">Detalhamento do Projeto</h3>
            </div>

            <div className="grid grid-cols-1 gap-6">
              {project.objetivo && (
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground font-medium">Objetivo</p>
                  <p className="text-sm text-card-foreground bg-muted/40 p-4 rounded-md whitespace-pre-wrap leading-relaxed border">{project.objetivo}</p>
                </div>
              )}
              {project.escopo && (
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground font-medium">Escopo</p>
                  <p className="text-sm text-card-foreground bg-muted/40 p-4 rounded-md whitespace-pre-wrap leading-relaxed border">{project.escopo}</p>
                </div>
              )}
              {project.justificativa && (
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground font-medium">Justificativa</p>
                  <p className="text-sm text-card-foreground bg-muted/40 p-4 rounded-md whitespace-pre-wrap leading-relaxed border">{project.justificativa}</p>
                </div>
              )}
            </div>
          </section>

          {/* 6. Metadados */}
          <section className="pt-4 border-t">
            <h4 className="text-xs font-semibold text-muted-foreground mb-3 uppercase tracking-wider">Metadados do Sistema</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs text-muted-foreground">
              <p>Origem: <span className="font-mono text-foreground">Espaider</span></p>
              <p>ID Interno: <span className="font-mono text-foreground">{project.id}</span></p>
              <p>Código Espaider: <span className="font-mono text-foreground">{project.espaider_code}</span></p>
              <p>TRM Espaider: <span className="font-mono text-foreground">{project.trm_espaider || '-'}</span></p>
            </div>
          </section>

        </TabsContent>

        {/* Tab: Históricos (Timeline) */}
        <TabsContent value="historicos" className="mt-6">
          {histories.length === 0 ? (
            <div className="text-center py-12 text-sm text-muted-foreground">
              Nenhum histórico encontrado
            </div>
          ) : (
            <div className="relative space-y-0">
              {histories
                .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                .map((hist, index) => (
                <div key={hist.id} className="relative flex gap-4 pb-6 last:pb-0">
                  {/* Timeline line */}
                  {index < histories.length - 1 && (
                    <div className="absolute left-[15px] top-8 bottom-0 w-0.5 bg-border" />
                  )}
                  {/* Timeline dot */}
                  <div className="relative z-10 flex size-8 shrink-0 items-center justify-center rounded-full border-2 border-background bg-primary/10">
                    <History className="size-3.5 text-primary" />
                  </div>
                  {/* Content */}
                  <div className="flex-1 min-w-0 space-y-2 p-3 rounded-lg border bg-card">
                    <div className="flex items-center justify-between gap-2">
                      <Badge variant="outline" className="text-xs">{hist.type || 'Movimentação'}</Badge>
                      <span className="text-xs text-muted-foreground shrink-0">{formatDateTime(hist.date)}</span>
                    </div>
                    {hist.message && hist.message !== '-' && (
                      <p className="text-sm text-card-foreground bg-muted/40 p-3 rounded-md whitespace-pre-wrap leading-relaxed">
                        {hist.message}
                      </p>
                    )}
                    {(hist.from !== '-' || hist.to !== '-') && (
                      <div className="flex items-center gap-2 text-xs text-muted-foreground flex-wrap">
                        {hist.from !== '-' && (
                          <span className="bg-muted/50 px-2 py-0.5 rounded">{hist.from}</span>
                        )}
                        {hist.from !== '-' && hist.to !== '-' && (
                          <ArrowRight className="size-3 text-muted-foreground/50" />
                        )}
                        {hist.to !== '-' && (
                          <span className="bg-muted/50 px-2 py-0.5 rounded">{hist.to}</span>
                        )}
                        {hist.step_from !== '-' && hist.step_to !== '-' && (
                          <span className="text-muted-foreground/60 ml-2">
                            ({hist.step_from} → {hist.step_to})
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Tab: Aprovadores */}
        <TabsContent value="aprovadores" className="mt-6">
          {approvers.length === 0 ? (
            <div className="text-center py-12 text-sm text-muted-foreground">
              Nenhum aprovador encontrado
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {approvers.map((appr) => (
                <div key={appr.id} className="flex items-center justify-between p-4 rounded-lg border bg-card">
                  <div>
                    <p className="font-medium text-sm">{appr.responsible}</p>
                    <p className="text-xs text-muted-foreground">{appr.type}</p>
                  </div>
                  <Badge variant="outline">Definido</Badge>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Tab: Orçamentos */}
        <TabsContent value="orcamentos" className="mt-6">
          {budgets.length === 0 ? (
            <div className="text-center py-12 text-sm text-muted-foreground">
              Nenhum orçamento encontrado
            </div>
          ) : (
            <div className="space-y-3">
              {budgets.map((budget) => (
                <div key={budget.id} className="flex items-center justify-between p-4 rounded-lg border bg-card">
                  <div>
                    <p className="font-medium text-sm">{budget.supplier}</p>
                    <p className="text-xs text-muted-foreground">Cotação: {formatDate(budget.date)}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-sm">
                      {budget.currency} {budget.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
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
                      {delivery.completed ? 'Concluída' : 'Pendente'}
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
            <p className="text-xs text-muted-foreground text-center pt-2">
              Os dados deste projeto são gerenciados no Espaider.
              Use a sincronização para atualizar as informações.
            </p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
