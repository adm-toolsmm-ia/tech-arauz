'use client';

import React, { useState, useEffect } from 'react';
import { FileText, Clock, AlertCircle, Users, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { InfoField, OrgEntityCard, RolesDisplay, DocumentationAccordion } from '@/components/organization/shared';
import type { OrgRoutine, OrgActivity } from '@/types/organization';
import { getActivitiesByRoutine } from '@/app/actions/organization';

interface RoutineCockpit360Props {
  routine: OrgRoutine;
  onEdit?: () => void;
  onDelete?: () => void;
  onCreateActivity?: () => void;
  onSelectActivity?: (activity: OrgActivity) => void;
}

export const RoutineCockpit360: React.FC<RoutineCockpit360Props> = ({
  routine,
  onEdit,
  onDelete,
  onCreateActivity,
  onSelectActivity,
}) => {
  const [activities, setActivities] = useState<OrgActivity[]>([]);
  const [loadingActivities, setLoadingActivities] = useState(false);

  useEffect(() => {
    if (!routine?.id) return;

    setLoadingActivities(true);
    (async () => {
      try {
        const result = await getActivitiesByRoutine(routine.id);
        setActivities(result || []);
      } catch (error) {
        console.error('Erro ao carregar atividades:', error);
      } finally {
        setLoadingActivities(false);
      }
    })();
  }, [routine?.id]);

  return (
    <div className="space-y-6">
      <Tabs defaultValue="principal" className="w-full">
        <TabsList className="h-auto w-full justify-start rounded-none border-b bg-transparent p-0">
          <TabsTrigger
            value="principal"
            className="rounded-none border-b-2 border-transparent px-4 py-2.5 data-[state=active]:border-primary data-[state=active]:bg-transparent"
          >
            <FileText className="mr-2 size-4" />
            Principal
          </TabsTrigger>
          <TabsTrigger
            value="atividades"
            className="rounded-none border-b-2 border-transparent px-4 py-2.5 data-[state=active]:border-primary data-[state=active]:bg-transparent"
          >
            <Clock className="mr-2 size-4" />
            Atividades
            {activities.length > 0 && (
              <span className="ml-2 text-xs text-muted-foreground">({activities.length})</span>
            )}
          </TabsTrigger>
          <TabsTrigger
            value="documentacao"
            className="rounded-none border-b-2 border-transparent px-4 py-2.5 data-[state=active]:border-primary data-[state=active]:bg-transparent"
          >
            <AlertCircle className="mr-2 size-4" />
            Documentação
          </TabsTrigger>
        </TabsList>

        <TabsContent value="principal" className="mt-6 space-y-8">
          {(onEdit || onDelete) && (
            <div className="flex justify-end gap-2">
              {onEdit && (
                <Button variant="outline" size="sm" onClick={onEdit} className="gap-2">
                  Editar
                </Button>
              )}
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
          )}

          <section>
            <div className="mb-4 flex items-center gap-2 border-b pb-2">
              <FileText className="size-5 text-primary" />
              <h3 className="text-base font-semibold">Informações</h3>
            </div>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <InfoField label="Descrição" value={routine.description} />
              <InfoField label="Objetivo" value={routine.objective} />
            </div>
          </section>

          <section>
            <div className="mb-4 flex items-center gap-2 border-b pb-2">
              <Users className="size-5 text-primary" />
              <h3 className="text-base font-semibold">Roles responsáveis</h3>
            </div>
            <RolesDisplay roles={routine.responsible_roles || []} />
          </section>

          {onCreateActivity && (
            <Button
              variant="default"
              className="w-full gap-2"
              onClick={onCreateActivity}
              aria-label="Criar atividade vinculada a esta rotina"
            >
              <Plus className="size-4" />
              Nova Atividade
            </Button>
          )}
        </TabsContent>

        <TabsContent value="atividades" className="mt-6 space-y-3">
          {onCreateActivity && (
            <div className="mb-4">
              <Button
                variant="default"
                size="sm"
                className="gap-2"
                onClick={onCreateActivity}
                aria-label="Criar atividade vinculada a esta rotina"
              >
                <Plus className="size-4" />
                Nova Atividade
              </Button>
            </div>
          )}

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
          {routine.documentation && Object.keys(routine.documentation).length > 0 ? (
            <DocumentationAccordion data={routine.documentation} />
          ) : (
            <div className="py-12 text-center text-sm text-muted-foreground">
              Sem documentação
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};
