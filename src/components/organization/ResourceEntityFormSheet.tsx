'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { Loader2, Monitor, Save, ShieldCheck, Truck, Wrench, FileText, GitBranch } from 'lucide-react';
import { toast } from 'sonner';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { ResponsibleRolesInput } from './ResponsibleRolesInput';
import {
  createOrgDocumentAction,
  createServiceAction,
  createSupplierAction,
  createSystemAction,
  updateOrgDocumentAction,
  updateServiceAction,
  updateSupplierAction,
  updateSystemAction,
} from '@/app/actions/organization';
import type { OrgDocument, OrgService, OrgSupplier, OrgSystem } from '@/types/organization';

type ResourceEntityType = 'system' | 'supplier' | 'service' | 'document';
type ResourceEntity = OrgSystem | OrgSupplier | OrgService | OrgDocument;

interface ProcessOption {
  id: string;
  name: string;
}

interface ResourceEntityFormSheetProps {
  entity: ResourceEntityType;
  mode: 'create' | 'edit';
  initialData?: ResourceEntity;
  processOptions?: ProcessOption[];
  isOpen?: boolean;
  onClose?: () => void;
  onSaved?: (saved: ResourceEntity) => void;
}

interface ResourceFormData {
  name: string;
  description: string;
  purpose: string;
  type: string;
  associated_process_id: string;
  responsible_roles: string[];
}

const EMPTY_PROCESS = '__none__';

const defaultFormData: ResourceFormData = {
  name: '',
  description: '',
  purpose: '',
  type: '',
  associated_process_id: '',
  responsible_roles: [],
};

const entityMeta: Record<
  ResourceEntityType,
  {
    label: string;
    icon: React.ElementType;
    tabs: Array<'info' | 'relationships' | 'roles'>;
    accent: string;
  }
> = {
  system: {
    label: 'Sistema',
    icon: Monitor,
    tabs: ['info'],
    accent: 'bg-amber-500/10 text-amber-700',
  },
  supplier: {
    label: 'Fornecedor',
    icon: Truck,
    tabs: ['info', 'roles'],
    accent: 'bg-emerald-500/10 text-emerald-700',
  },
  service: {
    label: 'Serviço',
    icon: Wrench,
    tabs: ['info', 'roles'],
    accent: 'bg-violet-500/10 text-violet-700',
  },
  document: {
    label: 'Documento',
    icon: FileText,
    tabs: ['info', 'relationships', 'roles'],
    accent: 'bg-cyan-500/10 text-cyan-700',
  },
};

export function ResourceEntityFormSheet({
  entity,
  mode,
  initialData,
  processOptions = [],
  isOpen = true,
  onClose,
  onSaved,
}: ResourceEntityFormSheetProps) {
  const [formData, setFormData] = useState<ResourceFormData>(defaultFormData);
  const [isSaving, setIsSaving] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [activeTab, setActiveTab] = useState<'info' | 'relationships' | 'roles'>('info');

  useEffect(() => {
    if (!isOpen) return;

    if (initialData) {
      setFormData({
        name: initialData.name ?? '',
        description: initialData.description ?? '',
        purpose: 'purpose' in initialData ? (initialData.purpose ?? '') : '',
        type: 'type' in initialData ? (initialData.type ?? '') : '',
        associated_process_id:
          'associated_process_id' in initialData ? (initialData.associated_process_id ?? '') : '',
        responsible_roles:
          'responsible_roles' in initialData ? (initialData.responsible_roles ?? []) : [],
      });
    } else {
      setFormData(defaultFormData);
    }

    setIsDirty(false);
    setActiveTab('info');
  }, [initialData, isOpen]);

  const meta = entityMeta[entity];
  const Icon = meta.icon;
  const processName =
    entity === 'document' && formData.associated_process_id
      ? processOptions.find((option) => option.id === formData.associated_process_id)?.name
      : undefined;

  const summaryCards = useMemo(() => {
    const cards = [
      { label: 'Nome', value: formData.name || 'Não definido' },
      { label: 'Descrição', value: formData.description || 'Sem descrição' },
    ];

    if (entity === 'system') {
      cards.push({ label: 'Propósito', value: formData.purpose || 'Não definido' });
    }

    if (entity === 'document') {
      cards.push({ label: 'Tipo', value: formData.type || 'Não definido' });
      cards.push({ label: 'Processo', value: processName || 'Sem vínculo' });
    }

    if (entity !== 'system') {
      cards.push({
        label: 'Roles',
        value:
          formData.responsible_roles.length > 0
            ? `${formData.responsible_roles.length} vinculada(s)`
            : 'Nenhuma role',
      });
    }

    return cards;
  }, [entity, formData, processName]);

  const handleChange = <K extends keyof ResourceFormData>(field: K, value: ResourceFormData[K]) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setIsDirty(true);
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      toast.error('Nome é obrigatório');
      return;
    }

    setIsSaving(true);
    try {
      let result:
        | { success: boolean; message: string; data?: ResourceEntity }
        | undefined;

      if (entity === 'system') {
        const payload = {
          name: formData.name.trim(),
          description: formData.description.trim() || null,
          purpose: formData.purpose.trim() || null,
        };
        result =
          mode === 'create'
            ? await createSystemAction(payload)
            : await updateSystemAction((initialData as OrgSystem).id, payload);
      }

      if (entity === 'supplier') {
        const payload = {
          name: formData.name.trim(),
          description: formData.description.trim() || null,
          responsible_roles: formData.responsible_roles,
        };
        result =
          mode === 'create'
            ? await createSupplierAction(payload)
            : await updateSupplierAction((initialData as OrgSupplier).id, payload);
      }

      if (entity === 'service') {
        const payload = {
          name: formData.name.trim(),
          description: formData.description.trim() || null,
          responsible_roles: formData.responsible_roles,
        };
        result =
          mode === 'create'
            ? await createServiceAction(payload)
            : await updateServiceAction((initialData as OrgService).id, payload);
      }

      if (entity === 'document') {
        const payload = {
          name: formData.name.trim(),
          description: formData.description.trim() || null,
          type: formData.type.trim() || null,
          associated_process_id: formData.associated_process_id || null,
          responsible_roles: formData.responsible_roles,
        };
        result =
          mode === 'create'
            ? await createOrgDocumentAction(payload)
            : await updateOrgDocumentAction((initialData as OrgDocument).id, payload);
      }

      if (!result) {
        toast.error('Não foi possível salvar o cadastro.');
        return;
      }

      if (!result.success || !result.data) {
        toast.error(result.message);
        return;
      }

      toast.success(result.message);
      setIsDirty(false);
      onSaved?.(result.data);
      onClose?.();
    } catch (error) {
      toast.error(`Erro ao salvar: ${error instanceof Error ? error.message : 'desconhecido'}`);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose?.()}>
      <SheetContent
        side="right"
        className="dialog-light-theme w-full border-l bg-white p-0 text-foreground sm:max-w-3xl"
      >
        <SheetHeader className="border-b px-6 py-5">
          <div className="flex items-start gap-3">
            <div className={`mt-1 flex size-11 items-center justify-center rounded-xl ${meta.accent}`}>
              <Icon className="size-5" />
            </div>
            <div className="min-w-0 flex-1">
              <SheetTitle className="text-2xl font-semibold">
                {mode === 'create' ? `Novo ${meta.label}` : `Editar ${meta.label}`}
              </SheetTitle>
              <p className="mt-1 text-sm text-muted-foreground">
                {mode === 'create'
                  ? `Preencha as informações centrais do cadastro de ${meta.label.toLowerCase()}.`
                  : `Atualize os dados, vínculos e responsáveis deste ${meta.label.toLowerCase()}.`}
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <Badge variant="outline">{meta.label}</Badge>
                {mode === 'edit' && <Badge variant="secondary">Edição</Badge>}
              </div>
            </div>
          </div>
        </SheetHeader>

        <ScrollArea className="h-[calc(100vh-176px)]">
          <div className="space-y-6 px-6 py-6">
            {mode === 'edit' && (
              <Card className="border-dashed">
                <CardContent className="grid gap-3 p-4 md:grid-cols-2 xl:grid-cols-4">
                  {summaryCards.map((card) => (
                    <div key={card.label} className="rounded-lg border p-3">
                      <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                        {card.label}
                      </p>
                      <p className="mt-2 text-sm font-medium">{card.value}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            <Tabs
              value={activeTab}
              onValueChange={(value) => setActiveTab(value as 'info' | 'relationships' | 'roles')}
              className="w-full"
            >
              <TabsList className="h-auto w-full justify-start rounded-none border-b bg-transparent p-0">
                <TabsTrigger
                  value="info"
                  className="rounded-none border-b-2 border-transparent px-4 py-2.5 data-[state=active]:border-primary data-[state=active]:bg-transparent"
                >
                  <FileText className="mr-2 size-4" />
                  Informações
                </TabsTrigger>
                {meta.tabs.includes('relationships') && (
                  <TabsTrigger
                    value="relationships"
                    className="rounded-none border-b-2 border-transparent px-4 py-2.5 data-[state=active]:border-primary data-[state=active]:bg-transparent"
                  >
                    <GitBranch className="mr-2 size-4" />
                    Relacionamentos
                  </TabsTrigger>
                )}
                {meta.tabs.includes('roles') && (
                  <TabsTrigger
                    value="roles"
                    className="rounded-none border-b-2 border-transparent px-4 py-2.5 data-[state=active]:border-primary data-[state=active]:bg-transparent"
                  >
                    <ShieldCheck className="mr-2 size-4" />
                    Responsáveis
                  </TabsTrigger>
                )}
              </TabsList>

              <TabsContent value="info" className="mt-6 space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="resource-name">Nome *</Label>
                  <Input
                    id="resource-name"
                    value={formData.name}
                    onChange={(e) => handleChange('name', e.target.value)}
                    placeholder={`Nome do ${meta.label.toLowerCase()}`}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="resource-description">Descrição</Label>
                  <Textarea
                    id="resource-description"
                    value={formData.description}
                    onChange={(e) => handleChange('description', e.target.value)}
                    placeholder={`Contexto operacional do ${meta.label.toLowerCase()}`}
                    rows={4}
                  />
                </div>

                {entity === 'system' && (
                  <div className="grid gap-2">
                    <Label htmlFor="resource-purpose">Propósito</Label>
                    <Textarea
                      id="resource-purpose"
                      value={formData.purpose}
                      onChange={(e) => handleChange('purpose', e.target.value)}
                      placeholder="Objetivo do sistema na operação"
                      rows={3}
                    />
                  </div>
                )}

                {entity === 'document' && (
                  <div className="grid gap-2">
                    <Label htmlFor="resource-type">Tipo do documento</Label>
                    <Input
                      id="resource-type"
                      value={formData.type}
                      onChange={(e) => handleChange('type', e.target.value)}
                      placeholder="Ex.: instrução, template, checklist"
                    />
                  </div>
                )}
              </TabsContent>

              {meta.tabs.includes('relationships') && (
                <TabsContent value="relationships" className="mt-6 space-y-4">
                  <div className="grid gap-2">
                    <Label htmlFor="resource-associated-process">Processo associado</Label>
                    <Select
                      value={formData.associated_process_id || EMPTY_PROCESS}
                      onValueChange={(value) =>
                        handleChange(
                          'associated_process_id',
                          value === EMPTY_PROCESS ? '' : value,
                        )
                      }
                    >
                      <SelectTrigger id="resource-associated-process">
                        <SelectValue placeholder="Selecione um processo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={EMPTY_PROCESS}>Sem vínculo</SelectItem>
                        {processOptions.map((option) => (
                          <SelectItem key={option.id} value={option.id}>
                            {option.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <Card className="border-dashed">
                    <CardContent className="p-4">
                      <p className="text-sm font-medium">Contexto atual</p>
                      <p className="mt-2 text-sm text-muted-foreground">
                        {processName
                          ? `Documento atualmente associado ao processo "${processName}".`
                          : 'Este documento ainda não possui processo associado.'}
                      </p>
                    </CardContent>
                  </Card>
                </TabsContent>
              )}

              {meta.tabs.includes('roles') && (
                <TabsContent value="roles" className="mt-6 space-y-4">
                  <div className="grid gap-2">
                    <Label>Roles responsáveis</Label>
                    <ResponsibleRolesInput
                      value={formData.responsible_roles}
                      onChange={(roles) => handleChange('responsible_roles', roles)}
                    />
                  </div>
                </TabsContent>
              )}
            </Tabs>
          </div>
        </ScrollArea>

        <div className="flex items-center justify-between border-t px-6 py-4">
          <p className="text-sm text-muted-foreground">
            {isDirty ? 'Alterações prontas para salvar.' : 'Nenhuma alteração pendente.'}
          </p>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button onClick={handleSave} disabled={isSaving || !formData.name.trim()}>
              {isSaving ? <Loader2 className="mr-2 size-4 animate-spin" /> : <Save className="mr-2 size-4" />}
              {mode === 'create' ? 'Criar cadastro' : 'Salvar alterações'}
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
