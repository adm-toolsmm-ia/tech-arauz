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
import { BpmDocumentationPanel } from '@/components/organization/BpmDocumentationPanel';
import {
  createActivityAction,
  updateActivityAction,
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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

function ActivityCockpit({
  activity,
  documents,
  allDocuments,
  onEdit,
  onDelete,
  onLinkDocument,
  onUnlinkDocument,
}: {
  activity: OrgActivity;
  documents: OrgDocument[];
  allDocuments: OrgDocument[];
  onEdit?: () => void;
  onDelete?: () => void;
  onLinkDocument?: (documentId: string) => void;
  onUnlinkDocument?: (documentId: string, documentName: string) => void;
}) {
  const linkedIds = new Set(documents.map((d) => d.id));
  const availableDocuments = allDocuments.filter((d) => !linkedIds.has(d.id));

  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-semibold">{activity.name}</h3>
        <div className="mt-1 flex gap-2">
          <Badge variant="outline">{activity.complexity}</Badge>
          <Badge variant="outline">{activity.priority}</Badge>
        </div>
      </div>
      {activity.description && (
        <p className="text-sm text-muted-foreground">{activity.description}</p>
      )}
      {activity.average_execution_time != null && (
        <p className="text-sm">Tempo médio: {activity.average_execution_time} min</p>
      )}
      <BpmDocumentationPanel
        inputs={activity.inputs}
        outputs={activity.outputs}
        risks={activity.risks}
        impacts={activity.impacts}
        documentation={activity.documentation}
        showSourceBadge={!!(activity.documentation as { source?: string })?.source}
        showActivityDocs
      />
      <div className="flex gap-2">
        {onEdit && (
          <Button variant="outline" size="sm" onClick={onEdit}>
            Editar
          </Button>
        )}
        {onDelete && (
          <Button variant="ghost" size="sm" onClick={onDelete} className="text-destructive">
            Excluir
          </Button>
        )}
      </div>

      <section>
        <div className="mb-3 flex items-center gap-2 border-b pb-2">
          <FileText className="size-5 text-primary" />
          <h4 className="text-sm font-semibold">Documentos vinculados</h4>
        </div>
        {documents.length === 0 && !onLinkDocument ? (
          <p className="text-sm text-muted-foreground">Nenhum documento vinculado</p>
        ) : documents.length === 0 && onLinkDocument && availableDocuments.length > 0 ? (
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              Nenhum documento vinculado. Selecione para vincular:
            </p>
            <Select
              onValueChange={(v) => {
                if (v) onLinkDocument(v);
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione um documento..." />
              </SelectTrigger>
              <SelectContent>
                {availableDocuments.map((d) => (
                  <SelectItem key={d.id} value={d.id}>
                    {d.name}
                    {d.type ? ` (${d.type})` : ''}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        ) : documents.length === 0 && onLinkDocument && availableDocuments.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Nenhum documento disponível. Cadastre em Recursos.
          </p>
        ) : (
          <div className="space-y-2">
            {onLinkDocument && availableDocuments.length > 0 && (
              <div className="flex gap-2">
                <Select
                  key={documents.length}
                  onValueChange={(v) => {
                    if (v) onLinkDocument(v);
                  }}
                >
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Vincular documento..." />
                  </SelectTrigger>
                  <SelectContent>
                    {availableDocuments.map((d) => (
                      <SelectItem key={d.id} value={d.id}>
                        {d.name}
                        {d.type ? ` (${d.type})` : ''}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            <div className="space-y-2">
              {documents.map((d) => (
                <div
                  key={d.id}
                  className="flex items-center justify-between rounded-lg border p-3 transition-colors hover:bg-muted/50"
                >
                  <Link
                    href="/organizacao/recursos?tab=documentos"
                    className="min-w-0 flex-1 hover:underline"
                  >
                    <p className="text-sm font-medium">{d.name}</p>
                    {d.type && (
                      <p className="text-xs text-muted-foreground">{d.type}</p>
                    )}
                  </Link>
                  {onUnlinkDocument && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="gap-2 text-destructive hover:text-destructive shrink-0"
                      onClick={() => onUnlinkDocument(d.id, d.name)}
                      title="Desvincular documento"
                      aria-label={`Desvincular ${d.name}`}
                    >
                      <Unlink className="h-4 w-4" />
                      Desvincular
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </section>
    </div>
  );
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
  const [isFormOpen, setIsFormOpen] = React.useState(false);
  const [editingActivity, setEditingActivity] = React.useState<OrgActivity | null>(null);
  const [activityToDelete, setActivityToDelete] = React.useState<OrgActivity | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [formData, setFormData] = React.useState({
    name: '',
    description: '',
    objective: '',
    complexity: 'medium' as OrgActivity['complexity'],
    priority: 'normal' as OrgActivity['priority'],
    required_role: '',
    average_execution_time: '',
  });

  React.useEffect(() => {
    setActivities(initialActivities);
  }, [initialActivities]);

  React.useEffect(() => {
    setDocumentsByActivityId(initialDocumentsByActivityId);
  }, [initialDocumentsByActivityId]);

  const handleCreate = React.useCallback(async () => {
    if (!formData.name.trim()) {
      toast.error('Nome é obrigatório');
      return;
    }
    setIsLoading(true);
    try {
      const result = await createActivityAction({
        routine_id: routineId,
        name: formData.name.trim(),
        description: formData.description.trim() || null,
        objective: formData.objective.trim() || null,
        complexity: formData.complexity,
        priority: formData.priority,
        required_role: formData.required_role.trim() || null,
        average_execution_time: formData.average_execution_time
          ? parseInt(formData.average_execution_time, 10)
          : null,
        inputs: [],
        outputs: [],
        risks: [],
        impacts: [],
        documentation: {},
      });
      if (result.success && result.data) {
        setActivities((prev) => [...prev, result.data as OrgActivity]);
        toast.success(result.message);
        setFormData({
          name: '',
          description: '',
          objective: '',
          complexity: 'medium',
          priority: 'normal',
          required_role: '',
          average_execution_time: '',
        });
        setIsFormOpen(false);
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error(`Erro: ${error instanceof Error ? error.message : 'desconhecido'}`);
    } finally {
      setIsLoading(false);
    }
  }, [routineId, formData]);

  const handleUpdate = React.useCallback(async () => {
    if (!editingActivity) return;
    if (!formData.name.trim()) {
      toast.error('Nome é obrigatório');
      return;
    }
    setIsLoading(true);
    try {
      const result = await updateActivityAction(editingActivity.id, {
        name: formData.name.trim(),
        description: formData.description.trim() || null,
        objective: formData.objective.trim() || null,
        complexity: formData.complexity,
        priority: formData.priority,
        required_role: formData.required_role.trim() || null,
        average_execution_time: formData.average_execution_time
          ? parseInt(formData.average_execution_time, 10)
          : null,
        inputs: editingActivity.inputs,
        outputs: editingActivity.outputs,
        risks: editingActivity.risks,
        impacts: editingActivity.impacts,
        documentation: editingActivity.documentation,
      });
      if (result.success && result.data) {
        setActivities((prev) => prev.map((a) => (a.id === editingActivity.id ? result.data! : a)));
        setSelectedActivity(result.data);
        toast.success(result.message);
        setEditingActivity(null);
        setIsFormOpen(false);
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error(`Erro: ${error instanceof Error ? error.message : 'desconhecido'}`);
    } finally {
      setIsLoading(false);
    }
  }, [editingActivity, formData]);

  const handleLinkActivityDocument = React.useCallback(
    async (activityId: string, documentId: string) => {
      try {
        const result = await addActivityDocumentAction(activityId, documentId);
        if (result.success) {
          toast.success(result.message);
          router.refresh();
        } else toast.error(result.message);
      } catch (error) {
        toast.error(`Erro: ${error instanceof Error ? error.message : 'desconhecido'}`);
      }
    },
    [router],
  );

  const handleUnlinkActivityDocument = React.useCallback(
    async (activityId: string, documentId: string) => {
      try {
        const result = await removeActivityDocumentAction(activityId, documentId);
        if (result.success) {
          toast.success(result.message);
          setDocumentToUnlink(null);
          router.refresh();
        } else toast.error(result.message);
      } catch (error) {
        toast.error(`Erro: ${error instanceof Error ? error.message : 'desconhecido'}`);
      }
    },
    [router],
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
            onClick={() => {
              setFormData({
                name: '',
                description: '',
                objective: '',
                complexity: 'medium',
                priority: 'normal',
                required_role: '',
                average_execution_time: '',
              });
              setIsFormOpen(true);
            }}
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
              onAction={() => setIsFormOpen(true)}
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
                      className="flex cursor-pointer items-center justify-between p-4 transition-colors hover:bg-muted/50"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10">
                          <CheckSquare className="size-5 text-primary" />
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
            <ActivityCockpit
              activity={selectedActivity}
              documents={documentsByActivityId[selectedActivity.id] ?? []}
              allDocuments={documents}
              onEdit={() => {
                setEditingActivity(selectedActivity);
                setFormData({
                  name: selectedActivity.name,
                  description: selectedActivity.description ?? '',
                  objective: selectedActivity.objective ?? '',
                  complexity: selectedActivity.complexity,
                  priority: selectedActivity.priority,
                  required_role: selectedActivity.required_role ?? '',
                  average_execution_time: selectedActivity.average_execution_time?.toString() ?? '',
                });
                setIsFormOpen(true);
              }}
              onDelete={() => setActivityToDelete(selectedActivity)}
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

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingActivity ? 'Editar Atividade' : 'Nova Atividade'}</DialogTitle>
            <DialogDescription>
              {editingActivity
                ? 'Atualize os dados da atividade.'
                : 'Preencha os dados para criar uma nova atividade.'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="activity-name">Nome *</Label>
              <Input
                id="activity-name"
                value={formData.name}
                onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))}
                placeholder="ex.: análise inicial do processo"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Complexidade</Label>
                <Select
                  value={formData.complexity}
                  onValueChange={(v) =>
                    setFormData((p) => ({ ...p, complexity: v as OrgActivity['complexity'] }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Baixa</SelectItem>
                    <SelectItem value="medium">Média</SelectItem>
                    <SelectItem value="high">Alta</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>Prioridade</Label>
                <Select
                  value={formData.priority}
                  onValueChange={(v) =>
                    setFormData((p) => ({ ...p, priority: v as OrgActivity['priority'] }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Baixa</SelectItem>
                    <SelectItem value="normal">Normal</SelectItem>
                    <SelectItem value="high">Alta</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="activity-role">Role necessário</Label>
              <Input
                id="activity-role"
                value={formData.required_role}
                onChange={(e) => setFormData((p) => ({ ...p, required_role: e.target.value }))}
                placeholder="ex.: advogado_senior"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="activity-time">Tempo médio (min)</Label>
              <Input
                id="activity-time"
                type="number"
                value={formData.average_execution_time}
                onChange={(e) =>
                  setFormData((p) => ({ ...p, average_execution_time: e.target.value }))
                }
                placeholder="30"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="activity-description">Descrição</Label>
              <Textarea
                id="activity-description"
                value={formData.description}
                onChange={(e) => setFormData((p) => ({ ...p, description: e.target.value }))}
                placeholder="Descrição da atividade"
                rows={3}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="activity-objective">Objetivo</Label>
              <Textarea
                id="activity-objective"
                value={formData.objective}
                onChange={(e) => setFormData((p) => ({ ...p, objective: e.target.value }))}
                placeholder="Objetivo da atividade"
                rows={2}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsFormOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={editingActivity ? handleUpdate : handleCreate} disabled={isLoading}>
              {editingActivity ? 'Salvar' : 'Criar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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

      <Dialog
        open={!!documentToUnlink}
        onOpenChange={(open) => !open && setDocumentToUnlink(null)}
      >
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
