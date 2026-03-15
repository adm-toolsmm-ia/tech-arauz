'use client';

import * as React from 'react';
import {
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  User,
  FolderKanban,
  FileText,
  Package,
  DollarSign,
  History,
  UserCheck,
  ListChecks,
  StickyNote,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CronogramaData } from '@/hooks/useCronogramasFilters';

export interface ScheduleCockpitProps {
  schedule: CronogramaData | null;
  onClose: () => void;
  // Dados do projeto para as outras abas (mesmo padrão ProjectCockpit)
  project?: any; // Projeto vinculado ao cronograma
  projectSchedules?: any[];
  projectDeliveries?: any[];
  projectHistories?: any[];
  projectApprovers?: any[];
  projectBudgets?: any[];
}

const formatDateBR = (dateStr: string | null): string => {
  if (!dateStr) return '-';
  try {
    return new Date(dateStr).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: '2-digit',
    });
  } catch {
    return '-';
  }
};

const getStatusIcon = (status: string | null) => {
  if (!status) return null;
  const s = (status || '').toLowerCase();
  if (s === 'concluído') return <CheckCircle2 className="h-4 w-4 text-green-500" />;
  if (s === 'cancelado') return <AlertCircle className="h-4 w-4 text-red-500" />;
  if (s.includes('andamento')) return <Clock className="h-4 w-4 text-blue-500" />;
  return <AlertCircle className="h-4 w-4 text-amber-500" />;
};

export function ScheduleCockpit({
  schedule,
  onClose,
  project,
  projectSchedules = [],
  projectDeliveries = [],
  projectHistories = [],
  projectApprovers = [],
  projectBudgets = [],
}: ScheduleCockpitProps) {
  if (!schedule) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-sm text-muted-foreground">
          Selecione um cronograma para visualizar detalhes
        </p>
      </div>
    );
  }

  const completedDeliveries = projectDeliveries.filter((d) => d.completed).length;

  return (
    <div className="space-y-6 overflow-y-auto">
      {/* Tabs */}
      <Tabs defaultValue="atividade" className="w-full">
        <TabsList className="h-auto w-full justify-start rounded-none border-b bg-transparent p-0">
          {/* TAB 1: Atividade (padrão ao abrir) */}
          <TabsTrigger
            value="atividade"
            className="data-[state=active]:border-primary rounded-none border-b-2 border-transparent px-4 py-2.5 data-[state=active]:bg-transparent"
          >
            <Calendar className="mr-2 size-4" />
            Atividade
          </TabsTrigger>

          {/* TAB 2: Detalhes (do Projeto) */}
          <TabsTrigger
            value="detalhes"
            className="data-[state=active]:border-primary rounded-none border-b-2 border-transparent px-4 py-2.5 data-[state=active]:bg-transparent"
          >
            <FileText className="mr-2 size-4" />
            Detalhes
          </TabsTrigger>

          {/* TAB 3: Anotações */}
          <TabsTrigger
            value="anotacoes"
            className="data-[state=active]:border-primary rounded-none border-b-2 border-transparent px-4 py-2.5 data-[state=active]:bg-transparent"
          >
            <StickyNote className="mr-2 size-4" />
            Anotações
          </TabsTrigger>

          {/* TAB 4: Entregas */}
          <TabsTrigger
            value="entregas"
            className="data-[state=active]:border-primary rounded-none border-b-2 border-transparent px-4 py-2.5 data-[state=active]:bg-transparent"
          >
            <Package className="mr-2 size-4" />
            Entregas
            {projectDeliveries.length > 0 && (
              <span className="ml-2 text-xs text-muted-foreground">
                ({completedDeliveries}/{projectDeliveries.length})
              </span>
            )}
          </TabsTrigger>

          {/* TAB 5: Orçamentos */}
          <TabsTrigger
            value="orcamentos"
            className="data-[state=active]:border-primary rounded-none border-b-2 border-transparent px-4 py-2.5 data-[state=active]:bg-transparent"
          >
            <DollarSign className="mr-2 size-4" />
            Orçamentos
            {projectBudgets.length > 0 && (
              <span className="ml-2 text-xs text-muted-foreground">({projectBudgets.length})</span>
            )}
          </TabsTrigger>

          {/* TAB 6: Histórico */}
          <TabsTrigger
            value="historicos"
            className="data-[state=active]:border-primary rounded-none border-b-2 border-transparent px-4 py-2.5 data-[state=active]:bg-transparent"
          >
            <History className="mr-2 size-4" />
            Histórico
            {projectHistories.length > 0 && (
              <span className="ml-2 text-xs text-muted-foreground">
                ({projectHistories.length})
              </span>
            )}
          </TabsTrigger>

          {/* TAB 7: Aprovadores */}
          <TabsTrigger
            value="aprovadores"
            className="data-[state=active]:border-primary rounded-none border-b-2 border-transparent px-4 py-2.5 data-[state=active]:bg-transparent"
          >
            <UserCheck className="mr-2 size-4" />
            Aprovadores
            {projectApprovers.length > 0 && (
              <span className="ml-2 text-xs text-muted-foreground">
                ({projectApprovers.length})
              </span>
            )}
          </TabsTrigger>

          {/* TAB 8: Ações */}
          <TabsTrigger
            value="acoes"
            className="data-[state=active]:border-primary rounded-none border-b-2 border-transparent px-4 py-2.5 data-[state=active]:bg-transparent"
          >
            <ListChecks className="mr-2 size-4" />
            Ações
          </TabsTrigger>
        </TabsList>

        {/* Content */}
        <div className="p-4">
          {/* TAB: Atividade (PRIMEIRO e PADRÃO) */}
          <TabsContent value="atividade" className="mt-4 space-y-4">
            {/* Status */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-muted-foreground">Status</span>
                {getStatusIcon(schedule.status)}
              </div>
              <div className="flex gap-1">
                <Badge variant="secondary" className="text-xs">
                  {schedule.status || 'Pendente'}
                </Badge>
                {schedule.fase_atividade && (
                  <Badge variant="outline" className="text-xs">
                    {schedule.fase_atividade}
                  </Badge>
                )}
              </div>
            </div>

            {/* Responsável */}
            {schedule.responsavel && (
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                  <User className="h-3 w-3" />
                  Responsável
                </div>
                <p className="text-sm">{schedule.responsavel}</p>
              </div>
            )}

            {/* Setor */}
            {schedule.setor_responsavel && (
              <div className="space-y-1">
                <span className="text-xs font-medium text-muted-foreground">Setor</span>
                <p className="text-sm">{schedule.setor_responsavel}</p>
              </div>
            )}

            {/* Datas */}
            <div className="space-y-2">
              <span className="text-xs font-medium text-muted-foreground">Período</span>
              <div className="grid grid-cols-2 gap-3">
                {schedule.data_inicio && (
                  <div className="bg-muted/30 rounded-md p-2">
                    <p className="text-[11px] text-muted-foreground">Início</p>
                    <p className="text-sm font-medium">{formatDateBR(schedule.data_inicio)}</p>
                  </div>
                )}
                {schedule.data_fim && (
                  <div className="bg-muted/30 rounded-md p-2">
                    <p className="text-[11px] text-muted-foreground">Fim</p>
                    <p className="text-sm font-medium">{formatDateBR(schedule.data_fim)}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Prazo */}
            <div className="space-y-2">
              <span className="text-xs font-medium text-muted-foreground">Prazos</span>
              <div className="space-y-1">
                {schedule.data_prazo && (
                  <div className="bg-muted/30 rounded-md p-2">
                    <p className="text-[11px] text-muted-foreground">Prazo Original</p>
                    <p className="text-sm font-medium">{formatDateBR(schedule.data_prazo)}</p>
                  </div>
                )}
                {schedule.data_novo_prazo && (
                  <div className="rounded-md bg-amber-50 p-2 dark:bg-amber-950/20">
                    <p className="text-[11px] text-amber-600 dark:text-amber-400">Novo Prazo</p>
                    <p className="text-sm font-medium text-amber-700 dark:text-amber-300">
                      {formatDateBR(schedule.data_novo_prazo)}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Alertas */}
            {schedule.data_alerta_prazo && (
              <div className="rounded-md bg-orange-50 p-2 dark:bg-orange-950/20">
                <p className="text-[11px] text-orange-600 dark:text-orange-400">Alerta de Prazo</p>
                <p className="text-sm font-medium text-orange-700 dark:text-orange-300">
                  {formatDateBR(schedule.data_alerta_prazo)}
                </p>
              </div>
            )}

            {/* Atrasado */}
            {schedule.atrasado && (
              <div className="rounded-md bg-red-50 p-2 dark:bg-red-950/20">
                <p className="text-xs font-medium text-red-700 dark:text-red-300">
                  ⚠️ ATIVIDADE ATRASADA
                </p>
              </div>
            )}

            {/* Item / Detalhamento */}
            {(schedule.item || schedule.detalhamento) && (
              <div className="space-y-1">
                <span className="text-xs font-medium text-muted-foreground">Informações</span>
                {schedule.item && <p className="text-sm">{schedule.item}</p>}
                {schedule.detalhamento && (
                  <p className="text-sm text-muted-foreground">{schedule.detalhamento}</p>
                )}
              </div>
            )}
          </TabsContent>

          {/* TAB: Detalhes (Projeto) */}
          <TabsContent value="detalhes" className="mt-4 space-y-4">
            {project || schedule.project ? (
              <div className="space-y-4">
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Projeto</p>
                  <p className="text-sm font-medium">
                    {project?.project_name || project?.titulo || schedule.project?.titulo}
                  </p>
                  {(project?.espaider_code || schedule.project?.codigo) && (
                    <p className="text-[11px] text-muted-foreground">
                      Código: {project?.espaider_code || schedule.project?.codigo}
                    </p>
                  )}
                </div>

                {(project?.status || schedule.project?.status) && (
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-muted-foreground">Status</p>
                    <Badge variant="outline" className="text-xs">
                      {project?.status || schedule.project?.status}
                    </Badge>
                  </div>
                )}

                {(project?.fase_atual || schedule.project?.fase_atual) && (
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-muted-foreground">Fase Atual</p>
                    <p className="text-sm">{project?.fase_atual || schedule.project?.fase_atual}</p>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Projeto não vinculado</p>
            )}
          </TabsContent>

          {/* TAB: Anotações */}
          <TabsContent value="anotacoes" className="mt-4 space-y-4">
            <p className="text-sm text-muted-foreground">Anotações do projeto vinculado</p>
          </TabsContent>

          {/* TAB: Entregas */}
          <TabsContent value="entregas" className="mt-4 space-y-4">
            {projectDeliveries.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nenhuma entrega</p>
            ) : (
              <div className="space-y-2">
                {projectDeliveries.map((d) => (
                  <div key={d.id} className="rounded-md border p-3">
                    <p className="text-sm font-medium">{d.description}</p>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          {/* TAB: Orçamentos */}
          <TabsContent value="orcamentos" className="mt-4 space-y-4">
            {projectBudgets.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nenhum orçamento</p>
            ) : (
              <div className="space-y-2">
                {projectBudgets.map((b) => (
                  <div key={b.id} className="rounded-md border p-3">
                    <p className="text-sm font-medium">{b.supplier}</p>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          {/* TAB: Histórico */}
          <TabsContent value="historicos" className="mt-4 space-y-4">
            {projectHistories.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nenhum histórico</p>
            ) : (
              <div className="space-y-2">
                {projectHistories.map((h) => (
                  <div key={h.id} className="rounded-md border p-3 text-xs">
                    <p className="font-medium">{h.type}</p>
                    <p className="text-muted-foreground">{h.message}</p>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          {/* TAB: Aprovadores */}
          <TabsContent value="aprovadores" className="mt-4 space-y-4">
            {projectApprovers.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nenhum aprovador</p>
            ) : (
              <div className="space-y-2">
                {projectApprovers.map((a) => (
                  <div key={a.id} className="rounded-md border p-3">
                    <p className="text-sm font-medium">{a.responsible}</p>
                    <p className="text-xs text-muted-foreground">{a.type}</p>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          {/* TAB: Ações */}
          <TabsContent value="acoes" className="mt-4 space-y-4">
            <p className="text-sm text-muted-foreground">Ações do projeto vinculado</p>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
