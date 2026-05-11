'use client';

import * as React from 'react';
import { Plus, ClipboardList } from 'lucide-react';
import { DashboardHeader } from '@/components/layout/DashboardHeader';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { SplitView } from '@/components/views/SplitView';
import { EmptyState } from '@/components/ui/EmptyState';
import {
  createRoutineAction,
  deleteRoutineAction,
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
import { RoutineCockpit360 as OrganizationRoutineCockpit360 } from '@/components/organization/RoutineCockpit360';
import { toast } from 'sonner';
import type { OrgRoutine } from '@/types/organization';

interface RoutineWithProcess extends OrgRoutine {
  process_name: string;
}

interface RotinasContentProps {
  routines: RoutineWithProcess[];
  processes: { id: string; name: string }[];
}

export function RotinasContent({ routines: initialRoutines, processes }: RotinasContentProps) {
  const [routines, setRoutines] = React.useState<RoutineWithProcess[]>(initialRoutines);
  const [selectedRoutine, setSelectedRoutine] = React.useState<RoutineWithProcess | null>(null);
  const [isFormOpen, setIsFormOpen] = React.useState(false);
  const [routineToDelete, setRoutineToDelete] = React.useState<RoutineWithProcess | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [filterProcessId, setFilterProcessId] = React.useState<string>('all');
  const [formData, setFormData] = React.useState({
    process_id: '',
    name: '',
    description: '',
    objective: '',
    responsible_roles: '',
  });

  React.useEffect(() => {
    setRoutines(initialRoutines);
  }, [initialRoutines]);

  const filteredRoutines = React.useMemo(() => {
    if (filterProcessId === 'all') return routines;
    return routines.filter((r) => r.process_id === filterProcessId);
  }, [routines, filterProcessId]);

  const resetForm = React.useCallback(() => {
    setFormData({
      process_id: processes[0]?.id ?? '',
      name: '',
      description: '',
      objective: '',
      responsible_roles: '',
    });
  }, [processes]);

  const handleCreate = React.useCallback(async () => {
    if (!formData.name.trim()) {
      toast.error('Nome é obrigatório');
      return;
    }
    if (!formData.process_id) {
      toast.error('Processo é obrigatório');
      return;
    }
    setIsLoading(true);
    try {
      const result = await createRoutineAction({
        process_id: formData.process_id,
        name: formData.name.trim(),
        description: formData.description.trim() || null,
        objective: formData.objective.trim() || null,
        responsible_roles: formData.responsible_roles
          ? formData.responsible_roles
              .split(',')
              .map((s) => s.trim())
              .filter(Boolean)
          : [],
        documentation: {},
      });
      if (result.success && result.data) {
        const processName = processes.find((p) => p.id === formData.process_id)?.name ?? '';
        setRoutines((prev) => [
          ...prev,
          { ...result.data!, process_name: processName } as RoutineWithProcess,
        ]);
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
  }, [formData, processes, resetForm]);

  const handleConfirmDelete = React.useCallback(async () => {
    if (!routineToDelete) return;
    try {
      const result = await deleteRoutineAction(routineToDelete.id);
      if (result.success) {
        setRoutines((prev) => prev.filter((r) => r.id !== routineToDelete.id));
        setSelectedRoutine(null);
        setRoutineToDelete(null);
        toast.success(result.message);
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error(`Erro: ${error instanceof Error ? error.message : 'desconhecido'}`);
    }
  }, [routineToDelete]);

  return (
    <div className="flex flex-col">
      <div className="flex items-center justify-between">
        <DashboardHeader
          title="Rotinas"
          subtitle="Conjuntos recorrentes de atividades dentro dos processos"
        />
        <Button
          className="gap-2"
          onClick={() => {
            setFormData({
              process_id: processes[0]?.id ?? '',
              name: '',
              description: '',
              objective: '',
              responsible_roles: '',
            });
            setIsFormOpen(true);
          }}
          disabled={processes.length === 0}
        >
          <Plus className="h-4 w-4" />
          Nova Rotina
        </Button>
      </div>

      <div className="space-y-6 p-6">
        {processes.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-muted-foreground">Filtrar por processo:</span>
            <Select value={filterProcessId} onValueChange={setFilterProcessId}>
              <SelectTrigger className="w-[280px]">
                <SelectValue placeholder="Todos os processos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os processos</SelectItem>
                {processes.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {routines.length === 0 ? (
          <EmptyState
            icon={ClipboardList}
            title="Nenhuma rotina cadastrada"
            description={
              processes.length === 0
                ? 'Cadastre processos antes de criar rotinas.'
                : 'Crie a primeira rotina para organizar as atividades de um processo.'
            }
            actionLabel={processes.length > 0 ? 'Nova Rotina' : undefined}
            onAction={
              processes.length > 0
                ? () => {
                    setFormData({
                      process_id: processes[0]?.id ?? '',
                      name: '',
                      description: '',
                      objective: '',
                      responsible_roles: '',
                    });
                    setIsFormOpen(true);
                  }
                : undefined
            }
          />
        ) : (
          <div className="flex gap-6">
            <div className="min-w-0 flex-1">
              <Card>
                <CardContent className="p-0">
                  <div className="divide-y">
                    {filteredRoutines.map((routine) => (
                      <div
                        key={routine.id}
                        role="button"
                        tabIndex={0}
                        onClick={() => setSelectedRoutine(routine)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            setSelectedRoutine(routine);
                          }
                        }}
                        className="hover:bg-muted/50 flex cursor-pointer items-center justify-between p-4 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="bg-primary/10 flex size-10 items-center justify-center rounded-lg">
                            <ClipboardList className="text-primary size-5" />
                          </div>
                          <div>
                            <p className="font-medium">{routine.name}</p>
                            <p className="text-sm text-muted-foreground">{routine.process_name}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            <SplitView
              isOpen={!!selectedRoutine}
              onClose={() => setSelectedRoutine(null)}
              title={selectedRoutine?.name ?? ''}
              subtitle={selectedRoutine?.process_name}
              width="wide"
            >
              {selectedRoutine && (
                <OrganizationRoutineCockpit360
                  routine={selectedRoutine}
                  processOptions={processes}
                  onDelete={() => setRoutineToDelete(selectedRoutine)}
                  onRoutineUpdated={(updatedRoutine) => {
                    const processName =
                      processes.find((process) => process.id === updatedRoutine.process_id)?.name ??
                      selectedRoutine.process_name;
                    const nextRoutine = {
                      ...(updatedRoutine as RoutineWithProcess),
                      process_name: processName,
                    };
                    setRoutines((prev) =>
                      prev.map((routine) =>
                        routine.id === nextRoutine.id ? nextRoutine : routine,
                      ),
                    );
                    setSelectedRoutine(nextRoutine);
                  }}
                />
              )}
            </SplitView>
          </div>
        )}
      </div>

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nova Rotina</DialogTitle>
            <DialogDescription>
              Preencha os dados para criar uma nova rotina.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="routine-process">Processo *</Label>
              <Select
                value={formData.process_id}
                onValueChange={(v) => setFormData((p) => ({ ...p, process_id: v }))}
              >
                <SelectTrigger id="routine-process">
                  <SelectValue placeholder="Selecione o processo" />
                </SelectTrigger>
                <SelectContent>
                  {processes.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="routine-name">Nome *</Label>
              <Input
                id="routine-name"
                value={formData.name}
                onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))}
                placeholder="ex.: Gestão de Prazos"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="routine-description">Descrição</Label>
              <Textarea
                id="routine-description"
                value={formData.description}
                onChange={(e) => setFormData((p) => ({ ...p, description: e.target.value }))}
                placeholder="Descrição da rotina"
                rows={3}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="routine-objective">Objetivo</Label>
              <Textarea
                id="routine-objective"
                value={formData.objective}
                onChange={(e) => setFormData((p) => ({ ...p, objective: e.target.value }))}
                placeholder="Objetivo da rotina"
                rows={2}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="routine-roles">Roles responsáveis (separados por vírgula)</Label>
              <Input
                id="routine-roles"
                value={formData.responsible_roles}
                onChange={(e) => setFormData((p) => ({ ...p, responsible_roles: e.target.value }))}
                placeholder="ex.: coordenador, analista"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsFormOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleCreate} disabled={isLoading}>
              Criar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!routineToDelete} onOpenChange={(open) => !open && setRoutineToDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Excluir rotina</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir a rotina &quot;{routineToDelete?.name}&quot;?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRoutineToDelete(null)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleConfirmDelete}>
              Excluir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
