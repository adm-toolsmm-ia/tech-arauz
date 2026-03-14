'use client';

import React from 'react';
import { FileText, AlertCircle, Users, BarChart3, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { InfoField, RolesDisplay, DocumentationAccordion, InputOutputList } from '@/components/organization/shared';
import type { OrgActivity, OrgRoutine } from '@/types/organization';

interface ActivityCockpit360Props {
  activity: OrgActivity;
  routine?: OrgRoutine;
  onEdit?: () => void;
  onDelete?: () => void;
}

const complexityColors: Record<string, string> = {
  low: 'bg-green-600 text-white',
  medium: 'bg-yellow-600 text-black',
  high: 'bg-red-600 text-white',
};

const priorityColors: Record<string, string> = {
  low: 'bg-slate-500 text-white',
  normal: 'bg-blue-600 text-white',
  high: 'bg-orange-600 text-white',
};

export function ActivityCockpit360({
  activity,
  routine,
  onEdit,
  onDelete,
}: ActivityCockpit360Props) {
  const formatExecutionTime = (minutes?: number | null) => {
    if (!minutes) return 'N/A';
    if (minutes < 60) return `${minutes}min`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="info" className="w-full">
        <TabsList className="h-auto w-full justify-start rounded-none border-b bg-transparent p-0">
          <TabsTrigger
            value="info"
            className="rounded-none border-b-2 border-transparent px-4 py-2.5 data-[state=active]:border-primary data-[state=active]:bg-transparent"
          >
            <FileText className="mr-2 size-4" />
            Informações
          </TabsTrigger>
          <TabsTrigger
            value="bpm"
            className="rounded-none border-b-2 border-transparent px-4 py-2.5 data-[state=active]:border-primary data-[state=active]:bg-transparent"
          >
            <BarChart3 className="mr-2 size-4" />
            BPM
          </TabsTrigger>
          <TabsTrigger
            value="docs"
            className="rounded-none border-b-2 border-transparent px-4 py-2.5 data-[state=active]:border-primary data-[state=active]:bg-transparent"
          >
            <AlertCircle className="mr-2 size-4" />
            Documentos
          </TabsTrigger>
          <TabsTrigger
            value="documentation"
            className="rounded-none border-b-2 border-transparent px-4 py-2.5 data-[state=active]:border-primary data-[state=active]:bg-transparent"
          >
            <FileText className="mr-2 size-4" />
            Documentação
          </TabsTrigger>
        </TabsList>

        {/* Tab: Informações */}
        <TabsContent value="info" className="mt-6 space-y-8">
          {(onEdit || onDelete) && (
            <div className="flex justify-end gap-2">
              {onEdit && (
                <Button variant="outline" size="sm" onClick={onEdit}>
                  Editar
                </Button>
              )}
              {onDelete && (
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2 text-destructive hover:text-destructive"
                  onClick={onDelete}
                >
                  <Trash2 className="size-4" />
                  Excluir
                </Button>
              )}
            </div>
          )}

          <section>
            <div className="mb-4 flex items-center gap-2 border-b pb-2">
              <FileText className="size-5 text-primary" />
              <h3 className="text-base font-semibold">Dados Principais</h3>
            </div>
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Nome</p>
                <p className="text-base font-semibold">{activity.name}</p>
              </div>

              <div className="flex gap-3">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Complexidade</p>
                  <Badge className={complexityColors[activity.complexity || 'low']}>
                    {(activity.complexity || 'low').toUpperCase()}
                  </Badge>
                </div>

                <div>
                  <p className="text-xs text-muted-foreground mb-1">Prioridade</p>
                  <Badge className={priorityColors[activity.priority || 'normal']}>
                    {(activity.priority || 'normal').toUpperCase()}
                  </Badge>
                </div>

                <div>
                  <p className="text-xs text-muted-foreground mb-1">Tempo Médio</p>
                  <Badge variant="outline">
                    {formatExecutionTime(activity.average_execution_time)}
                  </Badge>
                </div>
              </div>

              {activity.description && (
                <InfoField label="Descrição" value={activity.description} />
              )}
            </div>
          </section>

          {activity.required_role && (
            <section>
              <div className="mb-4 flex items-center gap-2 border-b pb-2">
                <Users className="size-5 text-primary" />
                <h3 className="text-base font-semibold">Responsável</h3>
              </div>
              <Badge variant="outline" className="gap-2">
                {activity.required_role}
              </Badge>
            </section>
          )}
        </TabsContent>

        {/* Tab: BPM */}
        <TabsContent value="bpm" className="mt-6 space-y-6">
          {activity.inputs && activity.inputs.length > 0 && (
            <section>
              <div className="mb-4 flex items-center gap-2 border-b pb-2">
                <BarChart3 className="size-5 text-primary" />
                <h3 className="text-base font-semibold">Inputs (Entradas)</h3>
              </div>
              <InputOutputList
                items={activity.inputs}
                direction="input"
                variant="default"
              />
            </section>
          )}

          {activity.outputs && activity.outputs.length > 0 && (
            <section>
              <div className="mb-4 flex items-center gap-2 border-b pb-2">
                <BarChart3 className="size-5 text-primary" />
                <h3 className="text-base font-semibold">Outputs (Saídas)</h3>
              </div>
              <InputOutputList
                items={activity.outputs}
                direction="output"
                variant="default"
              />
            </section>
          )}

          {activity.risks && activity.risks.length > 0 && (
            <section>
              <div className="mb-4 flex items-center gap-2 border-b pb-2">
                <AlertCircle className="size-5 text-destructive" />
                <h3 className="text-base font-semibold">Riscos</h3>
              </div>
              <InputOutputList
                items={activity.risks.map((r) => ({ name: r }))}
                direction="risk"
                variant="risk"
              />
            </section>
          )}

          {activity.impacts && activity.impacts.length > 0 && (
            <section>
              <div className="mb-4 flex items-center gap-2 border-b pb-2">
                <BarChart3 className="size-5 text-warning" />
                <h3 className="text-base font-semibold">Impactos</h3>
              </div>
              <InputOutputList
                items={activity.impacts.map((i) => ({ name: i }))}
                direction="impact"
                variant="impact"
              />
            </section>
          )}

          {!activity.inputs && !activity.outputs && !activity.risks && !activity.impacts && (
            <div className="py-8 text-center text-sm text-muted-foreground">
              Nenhum dado BPM cadastrado
            </div>
          )}
        </TabsContent>

        {/* Tab: Documentos */}
        <TabsContent value="docs" className="mt-6">
          <div className="space-y-4">
            <Button variant="outline" size="sm" disabled>
              Vincular Documento
            </Button>
            <div className="py-8 text-center text-sm text-muted-foreground">
              Integração de documentos vinculados disponível em Story 9.6
            </div>
          </div>
        </TabsContent>

        {/* Tab: Documentação */}
        <TabsContent value="documentation" className="mt-6">
          {activity.documentation ? (
            <DocumentationAccordion data={activity.documentation} />
          ) : (
            <div className="py-12 text-center text-sm text-muted-foreground">
              Sem documentação
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
