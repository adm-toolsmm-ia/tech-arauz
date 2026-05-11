'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Plus, ArrowLeft, CheckSquare, FileText, Unlink } from 'lucide-react';
import { DashboardHeader } from '@/components/layout/DashboardHeader';
import { OrgBreadcrumb } from '@/components/organization/OrgBreadcrumb';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { SplitView } from '@/components/views/SplitView';
import { EmptyState } from '@/components/ui/EmptyState';
import { ActivityCockpit360 } from '@/components/organization/ActivityCockpit360';
import { OrgEntityFormSheet } from '@/components/organization/OrgEntityFormSheet';
import {
  createActivityAction,
  deleteActivityAction,
  addActivityDocumentAction,
  removeActivityDocumentAction,
} from '@/app/actions/organization';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import type { OrgActivity, OrgDocument } from '@/types/organization';

interface AtividadesContentProps {
  processId: string;
  processName: string;
  routineId: string;
  routineName: string;
  activities: OrgActivity[];
  documents: OrgDocument[];
  documentsByActivityId: Record<string, OrgDocument[]>;
}

export function AtividadesContent({
  processId,
  processName,
  routineId,
  routineName,
  activities: initialActivities,
  documents,
  documentsByActivityId: initialDocumentsByActivityId,
}: AtividadesContentProps) {
  const router = useRouter();
  const [activities, setActivities] = React.useState<OrgActivity[]>(initialActivities);
  const [documentsByActivityId, setDocumentsByActivityId] = React.useState(
    initialDocumentsByActivityId,
  );
  const [selectedActivity, setSelectedActivity] = React.useState<OrgActivity | null>(null);
  const [documentToUnlink, setDocumentToUnlink] = React.useState<{
    activityId: string;
    documentId: string;
    documentName: string;
  } | null>(null);
  const [showCreateActivitySheet, setShowCreateActivitySheet] = React.useState(false);
  const [activityToDelete, setActivityToDelete] = React.useState<OrgActivity | null>(null);

  React.useEffect(() => {
    setActivities(initialActivities);
  }, [initialActivities]);

  React.useEffect(() => {
    setDocumentsByActivityId(initialDocumentsByActivityId);
  }, [initialDocumentsByActivityId]);

  const handleLinkActivityDocument = React.useCallback(
    async (activityId: string, documentId: string) => {
      try {
        const result = await addActivityDocumentAction(activityId, documentId);
        if (result.success) {
          const linkedDocument = documents.find((document) => document.id === documentId);
          if (linkedDocument) {
            setDocumentsByActivityId((prev) => ({
              ...prev,
              [activityId]: [...(prev[activityId] ?? []), linkedDocument],
            }));
          }
          toast.success(result.message);
        } else toast.error(result.message);
      } catch (error) {
        toast.error(`Erro: ${error instanceof Error ? error.message : 'desconhecido'}`);
      }
    },
    [documents],
  );

  const handleUnlinkActivityDocument = React.useCallback(
    async (activityId: string, documentId: string) => {
      try {
        const result = await removeActivityDocumentAction(activityId, documentId);
        if (result.success) {
          setDocumentsByActivityId((prev) => ({
            ...prev,
            [activityId]: (prev[activityId] ?? []).filter(
              (document) => document.id !== documentId,
            ),
          }));
          toast.success(result.message);
          setDocumentToUnlink(null);
        } else toast.error(result.message);
      } catch (error) {
        toast.error(`Erro: ${error instanceof Error ? error.message : 'desconhecido'}`);
      }
    },
    [],
  );

  const handleConfirmDelete = React.useCallback(async () => {
    if (!activityToDelete) return;
    try {
      const result = await deleteActivityAction(activityToDelete.id);
      if (result.success) {
        setActivities((prev) => prev.filter((a) => a.id !== activityToDelete.id));
        setSelectedActivity(null);
        setActivityToDelete(null);
        toast.success(result.message);
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error(`Erro: ${error instanceof Error ? error.message : 'desconhecido'}`);
    }
  }, [activityToDelete]);

  return (
    <div className="flex flex-col">
      <div className="flex items-center justify-between">
        <div>
          <DashboardHeader
            title={`Atividades — ${routineName}`}
            subtitle="Unidades operacionais executadas por colaboradores"
          />
          <OrgBreadcrumb
            items={[
              { label: 'Processos', href: '/organizacao/processos' },
              { label: processName, href: `/organizacao/processos/${processId}/rotinas` },
              {
                label: routineName,
                href: `/organizacao/processos/${processId}/rotinas/${routineId}/atividades`,
              },
              { label: 'Atividades' },
            ]}
          />
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href={`/organizacao/processos/${processId}/rotinas`} className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Voltar
            </Link>
          </Button>
          <Button
            className="gap-2"
            onClick={() => setShowCreateActivitySheet(true)}
          >
            <Plus className="h-4 w-4" />
            Nova Atividade
          </Button>
        </div>
      </div>

      <div className="flex gap-6 p-6">
        <div className="min-w-0 flex-1">
          {activities.length === 0 ? (
            <EmptyState
              icon={CheckSquare}
              title="Nenhuma atividade cadastrada"
              description="Crie atividades para detalhar o que é executado nesta rotina."
              actionLabel="Nova Atividade"
              onAction={() => setShowCreateActivitySheet(true)}
            />
          ) : (
            <Card>
              <CardContent className="p-0">
                <div className="divide-y">
                  {activities.map((a) => (
                    <div
                      key={a.id}
                      role="button"
                      tabIndex={0}
                      onClick={() => setSelectedActivity(a)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          setSelectedActivity(a);
                        }
                      }}
                      className="hover:bg-muted/50 flex cursor-pointer items-center justify-between p-4 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="bg-primary/10 flex size-10 items-center justify-center rounded-lg">
                          <CheckSquare className="text-primary size-5" />
                        </div>
                        <div>
                          <p className="font-medium">{a.name}</p>
                          <div className="mt-1 flex gap-1">
                            <Badge variant="outline" className="text-xs">
                              {a.complexity}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {a.priority}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <SplitView
          isOpen={!!selectedActivity}
          onClose={() => setSelectedActivity(null)}
          title={selectedActivity?.name ?? ''}
          width="lg"
        >
          {selectedActivity && (
            <ActivityCockpit360
              activity={selectedActivity}
              documents={documentsByActivityId[selectedActivity.id] ?? []}
              allDocuments={documents}
              routine={
                {
                  id: routineId,
                  tenant_id: '',
                  process_id: processId,
                  name: routineName,
                  description: null,
                  objective: null,
                  responsible_roles: [],
                  documentation: {},
                  created_at: '',
                  updated_at: '',
                } as any
              }
              onDelete={() => setActivityToDelete(selectedActivity)}
              onActivityUpdated={(updatedActivity) => {
                setActivities((prev) =>
                  prev.map((activity) =>
                    activity.id === updatedActivity.id ? updatedActivity : activity,
                  ),
                );
                setSelectedActivity(updatedActivity);
              }}
              onLinkDocument={(documentId) =>
                handleLinkActivityDocument(selectedActivity.id, documentId)
              }
              onUnlinkDocument={(documentId, documentName) =>
                setDocumentToUnlink({
                  activityId: selectedActivity.id,
                  documentId,
                  documentName,
                })
              }
            />
          )}
        </SplitView>
      </div>

      <OrgEntityFormSheet
        entity="activity"
        mode="create"
        isOpen={showCreateActivitySheet}
        context={{ routineId }}
        contextSummary={[
          { label: 'Processo', value: processName },
          { label: 'Rotina', value: routineName },
        ]}
        onClose={() => setShowCreateActivitySheet(false)}
        onSaved={(savedActivity) => {
          setActivities((prev) => [...prev, savedActivity as OrgActivity]);
          setShowCreateActivitySheet(false);
        }}
      />

      <Dialog open={!!activityToDelete} onOpenChange={(open) => !open && setActivityToDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Excluir atividade</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir a atividade &quot;{activityToDelete?.name}&quot;?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setActivityToDelete(null)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleConfirmDelete}>
              Excluir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!documentToUnlink} onOpenChange={(open) => !open && setDocumentToUnlink(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Desvincular documento</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja desvincular &quot;{documentToUnlink?.documentName}&quot; da
              atividade?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDocumentToUnlink(null)}>
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (documentToUnlink) {
                  handleUnlinkActivityDocument(
                    documentToUnlink.activityId,
                    documentToUnlink.documentId,
                  );
                }
              }}
            >
              Desvincular
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
