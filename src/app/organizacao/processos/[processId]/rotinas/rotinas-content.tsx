'use client';

import * as React from 'react';
import Link from 'next/link';
import { Plus, ArrowLeft, ListTodo } from 'lucide-react';
import { DashboardHeader } from '@/components/layout/DashboardHeader';
import { OrgBreadcrumb } from '@/components/organization/OrgBreadcrumb';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { SplitView } from '@/components/views/SplitView';
import { EmptyState } from '@/components/ui/EmptyState';
import { RoutineCockpit360 } from '@/components/organization/RoutineCockpit360';
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
import { toast } from 'sonner';
import type { OrgRoutine } from '@/types/organization';

interface RotinasContentProps {
  processId: string;
  processName: string;
  routines: OrgRoutine[];
}

export function RotinasContent({
  processId,
  processName,
  routines: initialRoutines,
}: RotinasContentProps) {
  const [routines, setRoutines] = React.useState<OrgRoutine[]>(initialRoutines);
  const [selectedRoutine, setSelectedRoutine] = React.useState<OrgRoutine | null>(null);
  const [isFormOpen, setIsFormOpen] = React.useState(false);
  const [routineToDelete, setRoutineToDelete] = React.useState<OrgRoutine | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [formData, setFormData] = React.useState({ name: '', description: '', objective: '' });

  React.useEffect(() => {
    setRoutines(initialRoutines);
  }, [initialRoutines]);

  const handleCreate = React.useCallback(async () => {
    if (!formData.name.trim()) {
      toast.error('Nome é obrigatório');
      return;
    }
    setIsLoading(true);
    try {
      const result = await createRoutineAction({
        process_id: processId,
        name: formData.name.trim(),
        description: formData.description.trim() || null,
        objective: formData.objective.trim() || null,
        responsible_roles: [],
        documentation: {},
      });
      if (result.success && result.data) {
        setRoutines((prev) => [...prev, result.data as OrgRoutine]);
        toast.success(result.message);
        setFormData({ name: '', description: '', objective: '' });
        setIsFormOpen(false);
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error(`Erro: ${error instanceof Error ? error.message : 'desconhecido'}`);
    } finally {
      setIsLoading(false);
    }
  }, [processId, formData]);

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
        <div>
          <DashboardHeader
            title={`Rotinas — ${processName}`}
            subtitle="Conjunto recorrente de atividades"
          />
          <OrgBreadcrumb
            items={[
              { label: 'Processos', href: '/organizacao/processos' },
              { label: processName, href: `/organizacao/processos/${processId}/rotinas` },
              { label: 'Rotinas' },
            ]}
          />
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href="/organizacao/processos" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Voltar
            </Link>
          </Button>
          <Button
            className="gap-2"
            onClick={() => {
              setFormData({ name: '', description: '', objective: '' });
              setIsFormOpen(true);
            }}
          >
            <Plus className="h-4 w-4" />
            Nova Rotina
          </Button>
        </div>
      </div>

      <div className="flex gap-6 p-6">
        <div className="min-w-0 flex-1">
          {routines.length === 0 ? (
            <EmptyState
              icon={ListTodo}
              title="Nenhuma rotina cadastrada"
              description="Crie rotinas para organizar as atividades deste processo."
              actionLabel="Nova Rotina"
              onAction={() => setIsFormOpen(true)}
            />
          ) : (
            <Card>
              <CardContent className="p-0">
                <div className="divide-y">
                  {routines.map((r) => (
                    <div
                      key={r.id}
                      role="button"
                      tabIndex={0}
                      onClick={() => setSelectedRoutine(r)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          setSelectedRoutine(r);
                        }
                      }}
                      className="hover:bg-muted/50 flex cursor-pointer items-center justify-between p-4 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="bg-primary/10 flex size-10 items-center justify-center rounded-lg">
                          <ListTodo className="text-primary size-5" />
                        </div>
                        <div>
                          <p className="font-medium">{r.name}</p>
                          {r.description && (
                            <p className="line-clamp-1 text-sm text-muted-foreground">
                              {r.description}
                            </p>
                          )}
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
          isOpen={!!selectedRoutine}
          onClose={() => setSelectedRoutine(null)}
          title={selectedRoutine?.name ?? ''}
          width="lg"
        >
          {selectedRoutine && (
            <RoutineCockpit360
              routine={selectedRoutine}
              processOptions={[{ id: processId, name: processName }]}
              onDelete={() => setRoutineToDelete(selectedRoutine)}
              onRoutineUpdated={(updatedRoutine) => {
                setRoutines((prev) =>
                  prev.map((routine) =>
                    routine.id === updatedRoutine.id ? updatedRoutine : routine,
                  ),
                );
                setSelectedRoutine(updatedRoutine);
              }}
            />
          )}
        </SplitView>
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
              <Label htmlFor="routine-name">Nome *</Label>
              <Input
                id="routine-name"
                value={formData.name}
                onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))}
                placeholder="ex.: análise inicial do processo"
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
