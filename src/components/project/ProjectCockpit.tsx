'use client';

import {
  RefreshCw,
  Calendar,
  Package,
  FileText,
  ListChecks,
  Clock,
  DollarSign,
  History,
  UserCheck,
  ArrowRight,
  StickyNote,
  ClipboardList,
} from 'lucide-react';
import { ProjectNotesEditor } from './ProjectNotesEditor';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { statusLabels, statusStyles } from '@/lib/constants/phase-labels';

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
  data_movimentacao?: string | null;
  justificativa?: string | null;
  importancia_especial?: boolean | null;
  impacto_operacional?: string | null;
  impacto_estrategico?: string | null;
  escopo?: string | null;
  complexidade_tecnica?: string | null;
  notes_html?: string | null;
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
  /** When opened from Cronogramas: the activity/schedule clicked. Shows "Atividade" tab. */
  selectedSchedule?: UISchedule | null;
  onSync?: () => void;
  isSyncing?: boolean;
}

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
  selectedSchedule = null,
  onSync,
  isSyncing = false,
}: ProjectCockpitProps) {
  const completedDeliveries = deliveries.filter((d) => d.completed).length;
  const showAtividadeTab = !!selectedSchedule;
  const defaultTab = showAtividadeTab ? 'atividade' : 'projeto';

  return (
    <div className="space-y-6">
      {/* Header with Title and Code */}
      {/* Header removed - handled by SplitView */}

      {/* Header badges removed as per user request */}

      {/* Tabs */}
      <Tabs defaultValue={defaultTab} className="w-full">
        <TabsList className="h-auto w-full justify-start rounded-none border-b bg-transparent p-0">
          {showAtividadeTab && (
            <TabsTrigger
              value="atividade"
              className="rounded-none border-b-2 border-transparent px-4 py-2.5 data-[state=active]:border-primary data-[state=active]:bg-transparent"
            >
              <ClipboardList className="mr-2 size-4" />
              Atividade
            </TabsTrigger>
          )}
          <TabsTrigger
            value="projeto"
            className="rounded-none border-b-2 border-transparent px-4 py-2.5 data-[state=active]:border-primary data-[state=active]:bg-transparent"
          >
            <FileText className="mr-2 size-4" />
            Projeto
          </TabsTrigger>
          <TabsTrigger
            value="anotacoes"
            className="rounded-none border-b-2 border-transparent px-4 py-2.5 data-[state=active]:border-primary data-[state=active]:bg-transparent"
          >
            <StickyNote className="mr-2 size-4" />
            Anotações
          </TabsTrigger>
          <TabsTrigger
            value="entregas"
            className="rounded-none border-b-2 border-transparent px-4 py-2.5 data-[state=active]:border-primary data-[state=active]:bg-transparent"
          >
            <Package className="mr-2 size-4" />
            Entregas
            {deliveries.length > 0 && (
              <span className="ml-2 text-xs text-muted-foreground">
                ({completedDeliveries}/{deliveries.length})
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger
            value="orcamentos"
            className="rounded-none border-b-2 border-transparent px-4 py-2.5 data-[state=active]:border-primary data-[state=active]:bg-transparent"
          >
            <DollarSign className="mr-2 size-4" />
            Orçamentos
            {budgets.length > 0 && (
              <span className="ml-2 text-xs text-muted-foreground">({budgets.length})</span>
            )}
          </TabsTrigger>
          <TabsTrigger
            value="cronograma"
            className="rounded-none border-b-2 border-transparent px-4 py-2.5 data-[state=active]:border-primary data-[state=active]:bg-transparent"
          >
            <Calendar className="mr-2 size-4" />
            Cronograma
            {schedules.length > 0 && (
              <span className="ml-2 text-xs text-muted-foreground">({schedules.length})</span>
            )}
          </TabsTrigger>
          <TabsTrigger
            value="historicos"
            className="rounded-none border-b-2 border-transparent px-4 py-2.5 data-[state=active]:border-primary data-[state=active]:bg-transparent"
          >
            <History className="mr-2 size-4" />
            Histórico
            {histories.length > 0 && (
              <span className="ml-2 text-xs text-muted-foreground">({histories.length})</span>
            )}
          </TabsTrigger>
          <TabsTrigger
            value="aprovadores"
            className="rounded-none border-b-2 border-transparent px-4 py-2.5 data-[state=active]:border-primary data-[state=active]:bg-transparent"
          >
            <UserCheck className="mr-2 size-4" />
            Aprovadores
            {approvers.length > 0 && (
              <span className="ml-2 text-xs text-muted-foreground">({approvers.length})</span>
            )}
          </TabsTrigger>
          <TabsTrigger
            value="acoes"
            className="rounded-none border-b-2 border-transparent px-4 py-2.5 data-[state=active]:border-primary data-[state=active]:bg-transparent"
          >
            <ListChecks className="mr-2 size-4" />
            Ações
          </TabsTrigger>
        </TabsList>

        {/* Tab: Atividade (when opened from Cronogramas) */}
        {showAtividadeTab && selectedSchedule && (
          <TabsContent value="atividade" className="mt-6 space-y-8">
            <section>
              <div className="mb-4 flex items-center gap-2 border-b pb-2">
                <ClipboardList className="size-5 text-primary" />
                <h3 className="text-base font-semibold">Dados da Atividade</h3>
                {selectedSchedule.atrasado && (
                  <Badge variant="destructive" className="ml-2">
                    Atrasada
                  </Badge>
                )}
              </div>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                <InfoField label="Atividade" value={selectedSchedule.atividade} />
                <InfoField label="Responsável" value={selectedSchedule.responsavel} />
                <InfoField label="Setor" value={selectedSchedule.setor_responsavel} />
                <InfoField label="Status" value={selectedSchedule.status} />
                <InfoField label="Fase" value={selectedSchedule.fase_atividade} />
                <InfoField label="Item" value={selectedSchedule.item} />
                <InfoField label="Data Início" value={formatDate(selectedSchedule.data_inicio)} />
                <InfoField label="Data Fim" value={formatDate(selectedSchedule.data_fim)} />
                <InfoField label="Data Prazo" value={formatDate(selectedSchedule.data_prazo)} />
              </div>
            </section>
          </TabsContent>
        )}

        {/* Tab: Anotações */}
        <TabsContent value="anotacoes" className="mt-6">
          <ProjectNotesEditor projectId={project.id} initialContent={project.notes_html ?? null} />
        </TabsContent>

        {/* Tab: Projeto (ex-Detalhes) */}
        <TabsContent value="projeto" className="mt-6 space-y-8">
          {/* 0. Importância Especial (Top Priority) */}
          {project.importancia_especial && (
            <div className="rounded-md border border-amber-200 bg-amber-50 p-4 dark:border-amber-800 dark:bg-amber-900/10">
              <p className="mb-1 flex items-center gap-2 text-sm font-medium text-amber-800 dark:text-amber-300">
                ⚠️ Importância Especial
              </p>
              <p className="text-sm text-amber-700 dark:text-amber-400">
                {project.motivo_importancia_especial || 'Sem motivo especificado'}
              </p>
            </div>
          )}

          {/* 1. Informações Gerais */}
          <section>
            <div className="mb-4 flex items-center gap-2 border-b pb-2">
              <FileText className="size-5 text-primary" />
              <h3 className="text-base font-semibold">Informações Gerais</h3>
            </div>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              <InfoField label="Área" value={project.area} />
              <InfoField label="Categoria" value={project.category} />
              <InfoField label="Prioridade" value={project.priority} />
              <InfoField
                label="Status do Projeto"
                value={
                  statusLabels[project.original_status || ''] || project.original_status || '-'
                }
              />
              <InfoField label="Situação Atual" value={project.current_situation} />
              <InfoField label="Complexidade Técnica" value={project.complexidade_tecnica} />
            </div>
          </section>

          {/* 3. Participantes */}
          <section>
            <div className="mb-4 flex items-center gap-2 border-b pb-2">
              <ListChecks className="size-5 text-primary" />
              <h3 className="text-base font-semibold">Participantes</h3>
            </div>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <InfoField label="Responsável" value={project.responsible} />
              <InfoField label="Solicitante" value={project.solicitante} />
              <InfoField label="Aprovador Atual" value={project.aprovador_atual} />
              <InfoField label="Prazo do Aprovador" value={formatDate(project.prazo_aprovador)} />
            </div>
          </section>

          {/* 4. Datas e Prazos */}
          <section>
            <div className="mb-4 flex items-center gap-2 border-b pb-2">
              <Calendar className="size-5 text-primary" />
              <h3 className="text-base font-semibold">Datas e Prazos</h3>
            </div>
            <div className="space-y-6">
              {/* Linha 1: Prazos Críticos */}
              <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                <InfoField label="Prazo Final" value={formatDate(project.end_date)} />
                <InfoField label="Prazo do Aprovador" value={formatDate(project.prazo_aprovador)} />
                <InfoField
                  label="Prazo do Cronograma"
                  value={formatDate(project.prazo_cronograma)}
                />
              </div>
              {/* Linha 2: Datas de Eventos */}
              <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                <InfoField
                  label="Início Aprovação"
                  value={formatDate(project.data_inicio_aprovacao)}
                />
                <InfoField label="Encerramento" value={formatDate(project.data_encerramento)} />
                <InfoField
                  label="Última Movimentação"
                  value={formatDateTime(project.last_update)}
                />
              </div>
            </div>
          </section>

          {/* 5. Estratégia e Escopo */}
          {/* 5. Estratégia */}
          <section>
            <div className="mb-4 flex items-center gap-2 border-b pb-2">
              <RefreshCw className="size-5 text-primary" />
              <h3 className="text-base font-semibold">Estratégia</h3>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <InfoField label="Impacto Estratégico" value={project.impacto_estrategico} />
                <InfoField label="Impacto Operacional" value={project.impacto_operacional} />
              </div>
            </div>
          </section>

          {/* 6. Detalhamento do Projeto (Textos Longos) */}
          <section>
            <div className="mb-4 flex items-center gap-2 border-b pb-2">
              <FileText className="size-5 text-primary" />
              <h3 className="text-base font-semibold">Detalhamento do Projeto</h3>
            </div>

            <div className="space-y-6">
              {project.objetivo && (
                <div className="space-y-2">
                  <p className="text-sm font-semibold">Objetivo</p>
                  <p className="whitespace-pre-wrap rounded-md border bg-muted/30 p-4 text-sm leading-relaxed text-card-foreground">
                    {project.objetivo}
                  </p>
                </div>
              )}
              {project.escopo && (
                <div className="space-y-2">
                  <p className="text-sm font-semibold">Escopo</p>
                  <p className="whitespace-pre-wrap rounded-md border bg-muted/30 p-4 text-sm leading-relaxed text-card-foreground">
                    {project.escopo}
                  </p>
                </div>
              )}
              {project.justificativa && (
                <div className="space-y-2">
                  <p className="text-sm font-semibold">Justificativa</p>
                  <p className="whitespace-pre-wrap rounded-md border bg-muted/30 p-4 text-sm leading-relaxed text-card-foreground">
                    {project.justificativa}
                  </p>
                </div>
              )}
              {project.mensagem_movimentacao && (
                <div className="space-y-2">
                  <p className="text-sm font-semibold">Última Movimentação</p>
                  <div className="space-y-1">
                    <p className="whitespace-pre-wrap rounded-md border bg-muted/30 p-4 text-sm leading-relaxed text-card-foreground">
                      {project.mensagem_movimentacao}
                    </p>
                    {project.data_movimentacao && (
                      <p className="text-xs text-muted-foreground">
                        {formatDateTime(project.data_movimentacao)}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* 6. Metadados */}
          <section className="border-t pt-4">
            <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Metadados do Sistema
            </h4>
            <div className="grid grid-cols-2 gap-4 text-xs text-muted-foreground md:grid-cols-4">
              <p>
                Origem: <span className="font-mono text-foreground">Espaider</span>
              </p>
              <p>
                ID Interno: <span className="font-mono text-foreground">{project.id}</span>
              </p>
              <p>
                Código Espaider:{' '}
                <span className="font-mono text-foreground">{project.espaider_code}</span>
              </p>
              <p>
                TRM Espaider:{' '}
                <span className="font-mono text-foreground">{project.trm_espaider || '-'}</span>
              </p>
            </div>
          </section>
        </TabsContent>

        {/* Tab: Históricos (Timeline) */}
        <TabsContent value="historicos" className="mt-6">
          {histories.length === 0 ? (
            <div className="py-12 text-center text-sm text-muted-foreground">
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
                      <div className="absolute bottom-0 left-[15px] top-8 w-0.5 bg-border" />
                    )}
                    {/* Timeline dot */}
                    <div className="relative z-10 flex size-8 shrink-0 items-center justify-center rounded-full border-2 border-background bg-primary/10">
                      <History className="size-3.5 text-primary" />
                    </div>
                    {/* Content */}
                    <div className="min-w-0 flex-1 space-y-2 rounded-lg border bg-card p-3">
                      <div className="flex items-center justify-between gap-2">
                        <Badge variant="outline" className="text-xs">
                          {hist.type || 'Movimentação'}
                        </Badge>
                        <span className="shrink-0 text-xs text-muted-foreground">
                          {formatDateTime(hist.date)}
                        </span>
                      </div>
                      {hist.message && hist.message !== '-' && (
                        <p className="whitespace-pre-wrap rounded-md bg-muted/40 p-3 text-sm leading-relaxed text-card-foreground">
                          {hist.message}
                        </p>
                      )}
                      {(hist.from !== '-' || hist.to !== '-') && (
                        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                          {hist.from !== '-' && (
                            <span className="rounded bg-muted/50 px-2 py-0.5">{hist.from}</span>
                          )}
                          {hist.from !== '-' && hist.to !== '-' && (
                            <ArrowRight className="size-3 text-muted-foreground/50" />
                          )}
                          {hist.to !== '-' && (
                            <span className="rounded bg-muted/50 px-2 py-0.5">{hist.to}</span>
                          )}
                          {hist.step_from !== '-' && hist.step_to !== '-' && (
                            <span className="ml-2 text-muted-foreground/60">
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
            <div className="py-12 text-center text-sm text-muted-foreground">
              Nenhum aprovador encontrado
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {approvers.map((appr) => (
                <div
                  key={appr.id}
                  className="flex items-center justify-between rounded-lg border bg-card p-4"
                >
                  <div>
                    <p className="text-sm font-medium">{appr.responsible}</p>
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
            <div className="py-12 text-center text-sm text-muted-foreground">
              Nenhum orçamento encontrado
            </div>
          ) : (
            <div className="space-y-3">
              {budgets.map((budget) => (
                <div
                  key={budget.id}
                  className="flex items-center justify-between rounded-lg border bg-card p-4"
                >
                  <div>
                    <p className="text-sm font-medium">{budget.supplier}</p>
                    <p className="text-xs text-muted-foreground">
                      Cotação: {formatDate(budget.date)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold">
                      {budget.currency}{' '}
                      {budget.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
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
            <div className="py-12 text-center text-sm text-muted-foreground">
              Nenhuma entrega cadastrada
            </div>
          ) : (
            <div className="space-y-3">
              {deliveries.map((delivery) => (
                <div
                  key={delivery.id}
                  className={cn(
                    'flex items-center justify-between rounded-lg border p-4',
                    delivery.completed && 'bg-green-50/50 dark:bg-green-950/20',
                  )}
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <div
                      className={cn(
                        'size-2.5 shrink-0 rounded-full',
                        delivery.completed
                          ? 'bg-green-500'
                          : new Date(delivery.deadline) < new Date()
                            ? 'bg-red-500'
                            : 'bg-amber-500',
                      )}
                    />
                    <span className="truncate text-sm">{delivery.description}</span>
                  </div>
                  <div className="flex shrink-0 items-center gap-3">
                    <span className="text-xs text-muted-foreground">
                      {formatDate(delivery.deadline)}
                    </span>
                    <Badge
                      variant={delivery.completed ? 'outline' : 'secondary'}
                      className={cn(
                        'text-xs',
                        delivery.completed && 'border-green-500 text-green-600',
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
            <div className="py-12 text-center text-sm text-muted-foreground">
              Nenhum cronograma cadastrado
            </div>
          ) : (
            <div className="space-y-3">
              {schedules.map((schedule) => (
                <div
                  key={schedule.id}
                  className="flex items-center justify-between rounded-lg border p-4"
                >
                  <div className="min-w-0 flex-1 pr-4">
                    <div className="flex items-center gap-2">
                      <p className="truncate text-sm font-medium">
                        {schedule.atividade || 'Atividade sem nome'}
                      </p>
                      {schedule.atrasado && (
                        <Badge variant="destructive" className="h-5 px-1.5 text-[10px]">
                          Atrasado
                        </Badge>
                      )}
                    </div>
                    <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground">
                      {schedule.item && (
                        <span>
                          Item:{' '}
                          <span className="font-medium text-foreground/80">{schedule.item}</span>
                        </span>
                      )}
                      {schedule.setor_responsavel && (
                        <span>
                          Setor:{' '}
                          <span className="font-medium text-foreground/80">
                            {schedule.setor_responsavel}
                          </span>
                        </span>
                      )}
                      {schedule.responsavel && (
                        <span>
                          Resp:{' '}
                          <span className="font-medium text-foreground/80">
                            {schedule.responsavel}
                          </span>
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-1.5">
                    <div className="flex items-center gap-2">
                      {schedule.fase_atividade && (
                        <Badge variant="outline" className="text-[10px]">
                          {schedule.fase_atividade}
                        </Badge>
                      )}
                      <Badge variant="secondary" className="text-[10px]">
                        {schedule.status || 'Pendente'}
                      </Badge>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {schedule.data_fim ? (
                        <span>Previsão: {formatDate(schedule.data_fim)}</span>
                      ) : schedule.data_prazo ? (
                        <span>Prazo: {formatDate(schedule.data_prazo)}</span>
                      ) : (
                        <span>-</span>
                      )}
                    </div>
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
              <Button variant="outline" className="w-full" onClick={onSync} disabled={isSyncing}>
                <RefreshCw className={cn('mr-2 size-4', isSyncing && 'animate-spin')} />
                {isSyncing ? 'Sincronizando...' : 'Sincronizar com Espaider'}
              </Button>
            )}
            <p className="pt-2 text-center text-xs text-muted-foreground">
              Os dados deste projeto são gerenciados no Espaider. Use a sincronização para atualizar
              as informações.
            </p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
