'use client';

import * as React from 'react';
import Link from 'next/link';
import { Plus, ArrowLeft, Building2 } from 'lucide-react';
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
import { SplitView } from '@/components/views/SplitView';
import { EmptyState } from '@/components/ui/EmptyState';
import {
  createNucleusAction,
  updateNucleusAction,
  deleteNucleusAction,
} from '@/app/actions/organization';
import { toast } from 'sonner';
import type { OrgNucleus } from '@/types/organization';

interface NucleosContentProps {
  areaId: string;
  areaName: string;
  nuclei: OrgNucleus[];
}

interface NucleusFormData {
  name: string;
  description: string;
  objective: string;
  responsible_roles: string;
}

const DEFAULT_FORM: NucleusFormData = {
  name: '',
  description: '',
  objective: '',
  responsible_roles: '',
};

function NucleusCockpit({ nucleus, onEdit }: { nucleus: OrgNucleus; onEdit?: () => void }) {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="font-semibold">{nucleus.name}</h3>
        {nucleus.description && (
          <p className="mt-1 text-sm text-muted-foreground">{nucleus.description}</p>
        )}
      </div>
      {nucleus.objective && (
        <div>
          <p className="text-xs text-muted-foreground">Objetivo</p>
          <p className="text-sm">{nucleus.objective}</p>
        </div>
      )}
      {(nucleus.responsible_roles?.length ?? 0) > 0 && (
        <div>
          <p className="text-xs text-muted-foreground">Roles responsáveis</p>
          <p className="text-sm">{nucleus.responsible_roles!.join(', ')}</p>
        </div>
      )}
      {onEdit && (
        <Button variant="outline" size="sm" onClick={onEdit}>
          Editar
        </Button>
      )}
    </div>
  );
}

export function NucleosContent({ areaId, areaName, nuclei: initialNuclei }: NucleosContentProps) {
  const [nuclei, setNuclei] = React.useState<OrgNucleus[]>(initialNuclei);
  const [selectedNucleus, setSelectedNucleus] = React.useState<OrgNucleus | null>(null);
  const [isFormOpen, setIsFormOpen] = React.useState(false);
  const [editingNucleus, setEditingNucleus] = React.useState<OrgNucleus | null>(null);
  const [nucleusToDelete, setNucleusToDelete] = React.useState<OrgNucleus | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [formData, setFormData] = React.useState<NucleusFormData>(DEFAULT_FORM);

  React.useEffect(() => {
    setNuclei(initialNuclei);
  }, [initialNuclei]);

  const resetForm = React.useCallback(() => {
    setFormData(DEFAULT_FORM);
    setEditingNucleus(null);
  }, []);

  const handleCreate = React.useCallback(async () => {
    if (!formData.name.trim()) {
      toast.error('Nome é obrigatório');
      return;
    }
    setIsLoading(true);
    try {
      const parseRoles = (s: string) =>
        s
          ? s
              .split(',')
              .map((r) => r.trim())
              .filter(Boolean)
          : [];
      const result = await createNucleusAction({
        area_id: areaId,
        name: formData.name.trim(),
        description: formData.description.trim() || null,
        objective: formData.objective.trim() || null,
        responsible_roles: parseRoles(formData.responsible_roles),
        documentation: {},
      });
      if (result.success && result.data) {
        setNuclei((prev) => [...prev, result.data as OrgNucleus]);
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
  }, [areaId, formData, resetForm]);

  const handleUpdate = React.useCallback(async () => {
    if (!editingNucleus) return;
    if (!formData.name.trim()) {
      toast.error('Nome é obrigatório');
      return;
    }
    setIsLoading(true);
    try {
      const parseRoles = (s: string) =>
        s
          ? s
              .split(',')
              .map((r) => r.trim())
              .filter(Boolean)
          : [];
      const result = await updateNucleusAction(editingNucleus.id, {
        name: formData.name.trim(),
        description: formData.description.trim() || null,
        objective: formData.objective.trim() || null,
        responsible_roles: parseRoles(formData.responsible_roles),
        documentation: editingNucleus.documentation,
      });
      if (result.success && result.data) {
        setNuclei((prev) => prev.map((n) => (n.id === editingNucleus.id ? result.data! : n)));
        setSelectedNucleus(result.data);
        toast.success(result.message);
        resetForm();
        setIsFormOpen(false);
        setEditingNucleus(null);
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error(`Erro: ${error instanceof Error ? error.message : 'desconhecido'}`);
    } finally {
      setIsLoading(false);
    }
  }, [editingNucleus, formData, resetForm]);

  const handleOpenEdit = React.useCallback((nucleus: OrgNucleus) => {
    setEditingNucleus(nucleus);
    setFormData({
      name: nucleus.name,
      description: nucleus.description ?? '',
      objective: nucleus.objective ?? '',
      responsible_roles: (nucleus.responsible_roles ?? []).join(', '),
    });
    setIsFormOpen(true);
  }, []);

  const handleConfirmDelete = React.useCallback(async () => {
    if (!nucleusToDelete) return;
    try {
      const result = await deleteNucleusAction(nucleusToDelete.id);
      if (result.success) {
        setNuclei((prev) => prev.filter((n) => n.id !== nucleusToDelete.id));
        setSelectedNucleus(null);
        setNucleusToDelete(null);
        toast.success(result.message);
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error(`Erro: ${error instanceof Error ? error.message : 'desconhecido'}`);
    }
  }, [nucleusToDelete]);

  return (
    <div className="flex flex-col">
      <div className="flex items-center justify-between">
        <div>
          <DashboardHeader
            title={`Núcleos — ${areaName}`}
            subtitle="Especializações dentro da área"
          />
          <OrgBreadcrumb
            items={[
              { label: 'Áreas', href: '/organizacao/areas' },
              { label: areaName, href: `/organizacao/areas/${areaId}/nucleos` },
              { label: 'Núcleos' },
            ]}
          />
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href="/organizacao/areas" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Voltar
            </Link>
          </Button>
          <Button
            className="gap-2"
            onClick={() => {
              resetForm();
              setIsFormOpen(true);
            }}
          >
            <Plus className="h-4 w-4" />
            Novo Núcleo
          </Button>
        </div>
      </div>

      <div className="flex gap-6 p-6">
        <div className="min-w-0 flex-1">
          {nuclei.length === 0 ? (
            <EmptyState
              icon={Building2}
              title="Nenhum núcleo cadastrado"
              description="Crie o primeiro núcleo para especializar esta área."
              actionLabel="Novo Núcleo"
              onAction={() => {
                resetForm();
                setIsFormOpen(true);
              }}
            />
          ) : (
            <Card>
              <CardContent className="p-0">
                <div className="divide-y">
                  {nuclei.map((nucleus) => (
                    <div
                      key={nucleus.id}
                      role="button"
                      tabIndex={0}
                      onClick={() => setSelectedNucleus(nucleus)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          setSelectedNucleus(nucleus);
                        }
                      }}
                      className="flex cursor-pointer items-center justify-between p-4 transition-colors hover:bg-muted/50"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10">
                          <Building2 className="size-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">{nucleus.name}</p>
                          {nucleus.description && (
                            <p className="line-clamp-1 text-sm text-muted-foreground">
                              {nucleus.description}
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
          isOpen={!!selectedNucleus}
          onClose={() => setSelectedNucleus(null)}
          title={selectedNucleus?.name ?? ''}
          width="lg"
        >
          {selectedNucleus && (
            <NucleusCockpit
              nucleus={selectedNucleus}
              onEdit={() => handleOpenEdit(selectedNucleus)}
            />
          )}
        </SplitView>
      </div>

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingNucleus ? 'Editar Núcleo' : 'Novo Núcleo'}</DialogTitle>
            <DialogDescription>
              {editingNucleus
                ? 'Atualize os dados do núcleo.'
                : 'Preencha os dados para criar um novo núcleo.'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="nucleus-name">Nome *</Label>
              <Input
                id="nucleus-name"
                value={formData.name}
                onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))}
                placeholder="ex.: Núcleo de Ajuizamento"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="nucleus-description">Descrição</Label>
              <Textarea
                id="nucleus-description"
                value={formData.description}
                onChange={(e) => setFormData((p) => ({ ...p, description: e.target.value }))}
                placeholder="Descrição do núcleo"
                rows={3}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="nucleus-objective">Objetivo</Label>
              <Textarea
                id="nucleus-objective"
                value={formData.objective}
                onChange={(e) => setFormData((p) => ({ ...p, objective: e.target.value }))}
                placeholder="Objetivo do núcleo"
                rows={2}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="nucleus-roles">Roles responsáveis (separados por vírgula)</Label>
              <Input
                id="nucleus-roles"
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
            <Button onClick={editingNucleus ? handleUpdate : handleCreate} disabled={isLoading}>
              {editingNucleus ? 'Salvar' : 'Criar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!nucleusToDelete} onOpenChange={(open) => !open && setNucleusToDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Excluir núcleo</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir o núcleo &quot;{nucleusToDelete?.name}&quot;?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setNucleusToDelete(null)}>
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
