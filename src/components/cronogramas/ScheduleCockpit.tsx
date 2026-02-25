'use client';

import * as React from 'react';
import { X, Calendar, Clock, CheckCircle2, AlertCircle, User, FolderKanban } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CronogramaData } from '@/hooks/useCronogramasFilters';

export interface ScheduleCockpitProps {
  schedule: CronogramaData | null;
  onClose: () => void;
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

export function ScheduleCockpit({ schedule, onClose }: ScheduleCockpitProps) {
  if (!schedule) {
    return (
      <Card className="h-full rounded-none border-l border-t-0 border-r-0 border-b-0">
        <CardContent className="flex items-center justify-center py-12">
          <p className="text-sm text-muted-foreground">Selecione um cronograma para visualizar detalhes</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full rounded-none border-l border-t-0 border-r-0 border-b-0 overflow-y-auto">
      <CardHeader className="sticky top-0 z-10 border-b bg-background">
        <div className="flex items-start justify-between">
          <div className="flex-1 pr-4">
            <CardTitle className="text-lg">{schedule.atividade || 'Sem nome'}</CardTitle>
            <p className="mt-1 text-xs text-muted-foreground">
              {schedule.project?.titulo || 'Projeto'}
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-6 w-6 p-0 shrink-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="p-4">
        <Tabs defaultValue="details" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="details">Detalhes Cronograma</TabsTrigger>
            <TabsTrigger value="project">Projeto</TabsTrigger>
          </TabsList>

          {/* TAB: Detalhes Cronograma */}
          <TabsContent value="details" className="space-y-4 mt-4">
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
                  <div className="rounded-md bg-muted/30 p-2">
                    <p className="text-[11px] text-muted-foreground">Início</p>
                    <p className="font-medium text-sm">{formatDateBR(schedule.data_inicio)}</p>
                  </div>
                )}
                {schedule.data_fim && (
                  <div className="rounded-md bg-muted/30 p-2">
                    <p className="text-[11px] text-muted-foreground">Fim</p>
                    <p className="font-medium text-sm">{formatDateBR(schedule.data_fim)}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Prazo */}
            <div className="space-y-2">
              <span className="text-xs font-medium text-muted-foreground">Prazos</span>
              <div className="space-y-1">
                {schedule.data_prazo && (
                  <div className="rounded-md bg-muted/30 p-2">
                    <p className="text-[11px] text-muted-foreground">Prazo Original</p>
                    <p className="font-medium text-sm">{formatDateBR(schedule.data_prazo)}</p>
                  </div>
                )}
                {schedule.data_novo_prazo && (
                  <div className="rounded-md bg-amber-50 p-2 dark:bg-amber-950/20">
                    <p className="text-[11px] text-amber-600 dark:text-amber-400">Novo Prazo</p>
                    <p className="font-medium text-sm text-amber-700 dark:text-amber-300">
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
                <p className="font-medium text-sm text-orange-700 dark:text-orange-300">
                  {formatDateBR(schedule.data_alerta_prazo)}
                </p>
              </div>
            )}

            {/* Atrasado */}
            {schedule.atrasado && (
              <div className="rounded-md bg-red-50 p-2 dark:bg-red-950/20">
                <p className="text-xs font-medium text-red-700 dark:text-red-300">⚠️ ATIVIDADE ATRASADA</p>
              </div>
            )}

            {/* Item / Detalhamento */}
            {(schedule.item || schedule.detalhamento) && (
              <div className="space-y-1">
                <span className="text-xs font-medium text-muted-foreground">Informações</span>
                {schedule.item && (
                  <p className="text-sm">{schedule.item}</p>
                )}
                {schedule.detalhamento && (
                  <p className="text-sm text-muted-foreground">{schedule.detalhamento}</p>
                )}
              </div>
            )}
          </TabsContent>

          {/* TAB: Projeto */}
          <TabsContent value="project" className="space-y-4 mt-4">
            {schedule.project ? (
              <>
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                    <FolderKanban className="h-3 w-3" />
                    Projeto
                  </div>
                  <p className="text-sm font-medium">{schedule.project.titulo}</p>
                  {schedule.project.codigo && (
                    <p className="text-[11px] text-muted-foreground">Código: {schedule.project.codigo}</p>
                  )}
                </div>

                {schedule.project.status && (
                  <div className="space-y-1">
                    <span className="text-xs font-medium text-muted-foreground">Status</span>
                    <Badge variant="outline" className="text-xs">
                      {schedule.project.status}
                    </Badge>
                  </div>
                )}

                {schedule.project.fase_atual && (
                  <div className="space-y-1">
                    <span className="text-xs font-medium text-muted-foreground">Fase Atual</span>
                    <p className="text-sm">{schedule.project.fase_atual}</p>
                  </div>
                )}
              </>
            ) : (
              <p className="text-sm text-muted-foreground">Projeto não vinculado</p>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
