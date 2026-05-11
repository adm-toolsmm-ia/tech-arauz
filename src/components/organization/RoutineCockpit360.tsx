'use client';

import React, { useEffect, useState } from 'react';
import { FileText, Clock, AlertCircle, Users, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import {
  InfoField,
  OrgEntityCard,
  RolesDisplay,
  DocumentationAccordion,
} from '@/components/organization/shared';
import { OrgEntityFormSheet } from '@/components/organization/OrgEntityFormSheet';
import type { OrgProcess, OrgRoutine, OrgActivity } from '@/types/organization';
import { getActivitiesByRoutine } from '@/app/actions/organization';

interface RoutineCockpit360Props {
  routine: OrgRoutine;
  processOptions?: Array<Pick<OrgProcess, 'id' | 'name'>>;
  onDelete?: () => void;
  onSelectActivity?: (activity: OrgActivity) => void;
  onActivitiesUpdated?: (activities: OrgActivity[]) => void;
  onRoutineUpdated?: (routine: OrgRoutine) => void;
}

export const RoutineCockpit360: React.FC<RoutineCockpit360Props> = ({
  routine,
  processOptions,
  onDelete,
  onSelectActivity,
  onActivitiesUpdated,
  onRoutineUpdated,
}) => {
  const [showCreateActivitySheet, setShowCreateActivitySheet] = useState(false);
  const [showEditRoutineSheet, setShowEditRoutineSheet] = useState(false);
  const [currentRoutine, setCurrentRoutine] = useState(routine);
  const [activities, setActivities] = useState<OrgActivity[]>([]);
  const [loadingActivities, setLoadingActivities] = useState(false);

  useEffect(() => {
    setCurrentRoutine(routine);
  }, [routine]);

  useEffect(() => {
    if (!currentRoutine?.id) return;

    setLoadingActivities(true);
    (async () => {
      try {
        const result = await getActivitiesByRoutine(currentRoutine.id);
        setActivities(result || []);
      } catch (error) {
        console.error('Erro ao carregar atividades:', error);
      } finally {
        setLoadingActivities(false);
      }
    })();
  }, [currentRoutine?.id]);

  return (
    <div className="space-y-6">
      <Tabs defaultValue="principal" className="w-full">
        <TabsList className="h-auto w-full justify-start rounded-none border-b bg-transparent p-0">
          <TabsTrigger
            value="principal"
            className="data-[state=active]:border-primary rounded-none border-b-2 border-transparent px-4 py-2.5 data-[state=active]:bg-transparent"
          >
            <FileText className="mr-2 size-4" />
            Principal
          </TabsTrigger>
          <TabsTrigger
            value="atividades"
            className="data-[state=active]:border-primary rounded-none border-b-2 border-transparent px-4 py-2.5 data-[state=active]:bg-transparent"
          >
            <Clock className="mr-2 size-4" />
            Atividades
            {activities.length > 0 && (
              <span className="ml-2 text-xs text-muted-foreground">({activities.length})</span>
            )}
          </TabsTrigger>
          <TabsTrigger
            value="documentacao"
            className="data-[state=active]:border-primary rounded-none border-b-2 border-transparent px-4 py-2.5 data-[state=active]:bg-transparent"
          >
            <AlertCircle className="mr-2 size-4" />
            Documentação
          </TabsTrigger>
        </TabsList>

        <TabsContent value="principal" className="mt-6 space-y-8">
          <div className="flex justify-end gap-2">
            <Button variant="outline" size="sm" onClick={() => setShowEditRoutineSheet(true)}>
              Editar
            </Button>
            {onDelete && (
              <Button
                variant="outline"
                size="sm"
                onClick={onDelete}
                className="gap-2 text-destructive hover:text-destructive"
              >
                Excluir
              </Button>
            )}
          </div>

          <section>
            <div className="mb-4 flex items-center gap-2 border-b pb-2">
              <FileText className="text-primary size-5" />
              <h3 className="text-base font-semibold">Informações</h3>
            </div>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <InfoField label="Descrição" value={currentRoutine.description} />
              <InfoField label="Objetivo" value={currentRoutine.objective} />
            </div>
          </section>

          <section>
            <div className="mb-4 flex items-center gap-2 border-b pb-2">
              <Users className="text-primary size-5" />
              <h3 className="text-base font-semibold">Roles responsáveis</h3>
            </div>
            <RolesDisplay roles={currentRoutine.responsible_roles || []} />
          </section>

          <Button
            variant="default"
            className="w-full gap-2"
            onClick={() => setShowCreateActivitySheet(true)}
            aria-label="Criar atividade vinculada a esta rotina"
          >
            <Plus className="size-4" />
            Nova Atividade
          </Button>
        </TabsContent>

        <TabsContent value="atividades" className="mt-6 space-y-3">
          <div className="mb-4">
            <Button
              variant="default"
              size="sm"
              className="gap-2"
              onClick={() => setShowCreateActivitySheet(true)}
              aria-label="Criar atividade vinculada a esta rotina"
            >
              <Plus className="size-4" />
              Nova Atividade
            </Button>
          </div>

          {loadingActivities ? (
            <Skeleton className="h-20" />
          ) : activities.length === 0 ? (
            <div className="py-12 text-center text-sm text-muted-foreground">
              Nenhuma atividade nesta rotina
            </div>
          ) : (
            <div className="space-y-3">
              {activities.map((activity) => (
                <OrgEntityCard
                  key={activity.id}
                  title={activity.name}
                  subtitle={activity.description ?? undefined}
                  badge={`${activity.complexity} — ${activity.priority}`}
                  meta={{
                    roles: activity.required_role ? 1 : 0,
                  }}
                  onClick={() => onSelectActivity?.(activity)}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="documentacao" className="mt-6">
          {currentRoutine.documentation && Object.keys(currentRoutine.documentation).length > 0 ? (
            <DocumentationAccordion data={currentRoutine.documentation} />
          ) : (
            <div className="py-12 text-center text-sm text-muted-foreground">Sem documentação</div>
          )}
        </TabsContent>
      </Tabs>

      <OrgEntityFormSheet
        entity="activity"
        mode="create"
        isOpen={showCreateActivitySheet}
        context={{ routineId: currentRoutine.id }}
        contextSummary={[
          ...(currentRoutine.process?.name
            ? [{ label: 'Processo', value: currentRoutine.process.name }]
            : []),
          { label: 'Rotina', value: currentRoutine.name },
        ]}
        onClose={() => setShowCreateActivitySheet(false)}
        onSaved={(newActivity) => {
          const updated = [...activities, newActivity as OrgActivity];
          setActivities(updated);
          onActivitiesUpdated?.(updated);
          setShowCreateActivitySheet(false);
        }}
      />

      <OrgEntityFormSheet
        entity="routine"
        mode="edit"
        initialData={currentRoutine}
        relationOptions={
          processOptions?.length
            ? {
                processes: processOptions.map((processOption) => ({
                  id: processOption.id,
                  name: processOption.name,
                })),
              }
            : undefined
        }
        isOpen={showEditRoutineSheet}
        contextSummary={[
          ...(currentRoutine.process?.name
            ? [{ label: 'Processo', value: currentRoutine.process.name }]
            : []),
          { label: 'Rotina', value: currentRoutine.name },
        ]}
        onClose={() => setShowEditRoutineSheet(false)}
        onSaved={(savedRoutine) => {
          setCurrentRoutine(savedRoutine as OrgRoutine);
          onRoutineUpdated?.(savedRoutine as OrgRoutine);
          setShowEditRoutineSheet(false);
        }}
      />
    </div>
  );
};
