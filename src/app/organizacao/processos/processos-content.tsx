'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Plus } from 'lucide-react';
import { DashboardHeader } from '@/components/layout/DashboardHeader';
import { OrgBreadcrumb } from '@/components/organization/OrgBreadcrumb';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
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
import { SplitView } from '@/components/views/SplitView';
import { ProcessCockpit360 } from '@/components/organization/ProcessCockpit360';
import { EmptyState } from '@/components/ui/EmptyState';
import {
  createProcessAction,
  updateProcessAction,
  deleteProcessAction,
  addProcessSystemAction,
  removeProcessSystemAction,
} from '@/app/actions/organization';
import { toast } from 'sonner';
import type { OrgProcess, OrgRoutine, OrgSystem } from '@/types/organization';
import { GitBranch } from 'lucide-react';

interface ProcessosContentProps {
  processes: OrgProcess[];
  areas: { id: string; name: string }[];
  nuclei: { id: string; name: string; area_id: string }[];
  areaMap: Record<string, string>;
  nucleusMap: Record<string, string>;
  routinesByProcessId: Record<string, OrgRoutine[]>;
  systems: OrgSystem[];
  systemsByProcessId: Record<string, OrgSystem[]>;
}

interface ProcessFormData {
  name: string;
  description: string;
  objective: string;
  area_id: string;
  nucleus_id: string;
}

const DEFAULT_FORM: ProcessFormData = {
  name: '',
  description: '',
  objective: '',
  area_id: '',
  nucleus_id: '',
};

export function ProcessosContent({
  processes: initialProcesses,
  areas,
  nuclei,
  areaMap,
  nucleusMap,
  routinesByProcessId = {},
  systems = [],
  systemsByProcessId = {},
}: ProcessosContentProps) {
  const router = useRouter();
  const [processes, setProcesses] = React.useState<OrgProcess[]>(initialProcesses);
  const [selectedProcess, setSelectedProcess] = React.useState<OrgProcess | null>(null);
  const [isFormOpen, setIsFormOpen] = React.useState(false);
  const [editingProcess, setEditingProcess] = React.useState<OrgProcess | null>(null);
  const [processToDelete, setProcessToDelete] = React.useState<OrgProcess | null>(null);
  const [processSystemToUnlink, setProcessSystemToUnlink] = React.useState<{
    processId: string;
    systemId: string;
    systemName: string;
  } | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [formData, setFormData] = React.useState<ProcessFormData>(DEFAULT_FORM);

  React.useEffect(() => {
    setProcesses(initialProcesses);
  }, [initialProcesses]);

  const nucleiForArea = React.useMemo(
    () => nuclei.filter((n) => n.area_id === formData.area_id),
    [nuclei, formData.area_id],
  );

  const resetForm = React.useCallback(() => {
    setFormData(DEFAULT_FORM);
    setEditingProcess(null);
  }, []);

  const handleCreate = React.useCallback(async () => {
    if (!formData.name.trim()) {
      toast.error('Nome é obrigatório');
      return;
    }
    setIsLoading(true);
    try {
      const result = await createProcessAction({
        name: formData.name.trim(),
        description: formData.description.trim() || null,
        objective: formData.objective.trim() || null,
        area_id: formData.area_id || null,
        nucleus_id: formData.nucleus_id || null,
        inputs: [],
        outputs: [],
        responsible_roles: [],
        risks: [],
        impacts: [],
        documentation: {},
      });
      if (result.success && result.data) {
        setProcesses((prev) => [...prev, result.data as OrgProcess]);
        toast.success(result.message);
        resetForm();
        setIsFormOpen(false);
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error(`Erro: ${error instanceof Error ? error.message : 'desconhecido'}`);
    } finally {
      setIsLoading(false);
    }
  }, [formData, resetForm]);

  const handleUpdate = React.useCallback(async () => {
    if (!editingProcess) return;
    if (!formData.name.trim()) {
      toast.error('Nome é obrigatório');
      return;
    }
    setIsLoading(true);
    try {
      const result = await updateProcessAction(editingProcess.id, {
        name: formData.name.trim(),
        description: formData.description.trim() || null,
        objective: formData.objective.trim() || null,
        area_id: formData.area_id || null,
        nucleus_id: formData.nucleus_id || null,
        inputs: editingProcess.inputs,
        outputs: editingProcess.outputs,
        responsible_roles: editingProcess.responsible_roles,
        risks: editingProcess.risks,
        impacts: editingProcess.impacts,
        documentation: editingProcess.documentation,
      });
      if (result.success && result.data) {
        setProcesses((prev) => prev.map((p) => (p.id === editingProcess.id ? result.data! : p)));
        setSelectedProcess(result.data);
        toast.success(result.message);
        resetForm();
        setIsFormOpen(false);
        setEditingProcess(null);
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error(`Erro: ${error instanceof Error ? error.message : 'desconhecido'}`);
    } finally {
      setIsLoading(false);
    }
  }, [editingProcess, formData, resetForm]);

  const handleOpenEdit = React.useCallback((proc: OrgProcess) => {
    setEditingProcess(proc);
    setFormData({
      name: proc.name,
      description: proc.description ?? '',
      objective: proc.objective ?? '',
      area_id: proc.area_id ?? '',
      nucleus_id: proc.nucleus_id ?? '',
    });
    setIsFormOpen(true);
  }, []);

  const handleConfirmDelete = React.useCallback(async () => {
    if (!processToDelete) return;
    try {
      const result = await deleteProcessAction(processToDelete.id);
      if (result.success) {
        setProcesses((prev) => prev.filter((p) => p.id !== processToDelete.id));
        setSelectedProcess(null);
        setProcessToDelete(null);
        toast.success(result.message);
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error(`Erro: ${error instanceof Error ? error.message : 'desconhecido'}`);
    }
  }, [processToDelete]);

  const handleLinkProcessSystem = React.useCallback(
    async (processId: string, systemId: string) => {
      try {
        const result = await addProcessSystemAction(processId, systemId);
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

  const handleUnlinkProcessSystem = React.useCallback(
    async (processId: string, systemId: string) => {
      try {
        const result = await removeProcessSystemAction(processId, systemId);
        if (result.success) {
          toast.success(result.message);
          setProcessSystemToUnlink(null);
          router.refresh();
        } else toast.error(result.message);
      } catch (error) {
        toast.error(`Erro: ${error instanceof Error ? error.message : 'desconhecido'}`);
      }
    },
    [router],
  );

  return (
    <div className="flex flex-col">
      <div className="flex items-center justify-between">
        <div>
          <DashboardHeader title="Processos" subtitle="Fluxos operacionais da organização" />
          <OrgBreadcrumb items={[{ label: 'Processos' }]} />
        </div>
        <Button
          className="gap-2"
          onClick={() => {
            resetForm();
            setIsFormOpen(true);
          }}
        >
          <Plus className="h-4 w-4" />
          Novo Processo
        </Button>
      </div>

      <div className="flex gap-6 p-6">
        <div className="min-w-0 flex-1">
          {processes.length === 0 ? (
            <EmptyState
              icon={GitBranch}
              title="Nenhum processo cadastrado"
              description="Crie processos para mapear os fluxos operacionais da empresa."
              actionLabel="Novo Processo"
              onAction={() => {
                resetForm();
                setIsFormOpen(true);
              }}
            />
          ) : (
            <Card>
              <CardContent className="p-0">
                <div className="divide-y">
                  {processes.map((proc) => (
                    <div
                      key={proc.id}
                      role="button"
                      tabIndex={0}
                      onClick={() => setSelectedProcess(proc)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          setSelectedProcess(proc);
                        }
                      }}
                      className="flex cursor-pointer items-center justify-between p-4 transition-colors hover:bg-muted/50"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10">
                          <GitBranch className="size-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">{proc.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {[
                              proc.area_id && areaMap[proc.area_id],
                              proc.nucleus_id && nucleusMap[proc.nucleus_id],
                            ]
                              .filter(Boolean)
                              .join(' / ') || 'Sem área/núcleo'}
                          </p>
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
          isOpen={!!selectedProcess}
          onClose={() => setSelectedProcess(null)}
          title={selectedProcess?.name ?? ''}
          subtitle={
            selectedProcess
              ? [
                  selectedProcess.area_id && areaMap[selectedProcess.area_id],
                  selectedProcess.nucleus_id && nucleusMap[selectedProcess.nucleus_id],
                ]
                  .filter(Boolean)
                  .join(' / ')
              : undefined
          }
          width="lg"
        >
          {selectedProcess && (
            <ProcessCockpit360
              process={selectedProcess}
              areaName={selectedProcess.area_id ? areaMap[selectedProcess.area_id] : undefined}
              nucleusName={
                selectedProcess.nucleus_id ? nucleusMap[selectedProcess.nucleus_id] : undefined
              }
              routines={routinesByProcessId[selectedProcess.id] ?? []}
              systems={systemsByProcessId[selectedProcess.id] ?? []}
              allSystems={systems}
              onEdit={() => handleOpenEdit(selectedProcess)}
              onDelete={() => setProcessToDelete(selectedProcess)}
              onLinkSystem={(systemId) =>
                handleLinkProcessSystem(selectedProcess.id, systemId)
              }
              onUnlinkSystem={(systemId, systemName) =>
                setProcessSystemToUnlink({
                  processId: selectedProcess.id,
                  systemId,
                  systemName,
                })
              }
            />
          )}
        </SplitView>
      </div>

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingProcess ? 'Editar Processo' : 'Novo Processo'}</DialogTitle>
            <DialogDescription>
              {editingProcess
                ? 'Atualize os dados do processo.'
                : 'Preencha os dados para criar um novo processo.'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="process-name">Nome *</Label>
              <Input
                id="process-name"
                value={formData.name}
                onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))}
                placeholder="ex.: Gestão de Processos Contenciosos"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="process-area">Área</Label>
              <Select
                value={formData.area_id}
                onValueChange={(v) => setFormData((p) => ({ ...p, area_id: v, nucleus_id: '' }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a área" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Nenhuma</SelectItem>
                  {areas.map((a) => (
                    <SelectItem key={a.id} value={a.id}>
                      {a.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="process-nucleus">Núcleo</Label>
              <Select
                value={formData.nucleus_id}
                onValueChange={(v) => setFormData((p) => ({ ...p, nucleus_id: v }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o núcleo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Nenhum</SelectItem>
                  {nucleiForArea.map((n) => (
                    <SelectItem key={n.id} value={n.id}>
                      {n.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="process-description">Descrição</Label>
              <Textarea
                id="process-description"
                value={formData.description}
                onChange={(e) => setFormData((p) => ({ ...p, description: e.target.value }))}
                placeholder="Descrição do processo"
                rows={3}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="process-objective">Objetivo</Label>
              <Textarea
                id="process-objective"
                value={formData.objective}
                onChange={(e) => setFormData((p) => ({ ...p, objective: e.target.value }))}
                placeholder="Objetivo do processo"
                rows={2}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsFormOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={editingProcess ? handleUpdate : handleCreate} disabled={isLoading}>
              {editingProcess ? 'Salvar' : 'Criar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!processToDelete} onOpenChange={(open) => !open && setProcessToDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Excluir processo</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir o processo &quot;{processToDelete?.name}&quot;?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setProcessToDelete(null)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleConfirmDelete}>
              Excluir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={!!processSystemToUnlink}
        onOpenChange={(open) => !open && setProcessSystemToUnlink(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Desvincular sistema</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja desvincular &quot;{processSystemToUnlink?.systemName}&quot; do
              processo?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setProcessSystemToUnlink(null)}>
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (processSystemToUnlink) {
                  handleUnlinkProcessSystem(
                    processSystemToUnlink.processId,
                    processSystemToUnlink.systemId,
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
