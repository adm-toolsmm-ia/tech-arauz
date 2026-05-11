'use client';

import React, { useState, useEffect } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { AlertTriangle, Save, Loader2, Plus, Trash2, GitBranch } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';
import type {
  OrgArea,
  OrgNucleus,
  OrgProcess,
  OrgRoutine,
  OrgActivity,
  OrgInputOutput,
} from '@/types/organization';
import {
  createAreaAction,
  updateAreaAction,
  createNucleusAction,
  updateNucleusAction,
  createProcessAction,
  updateProcessAction,
  createRoutineAction,
  updateRoutineAction,
  createActivityAction,
  updateActivityAction,
} from '@/app/actions/organization';
import { ResponsibleRolesInput } from './ResponsibleRolesInput';

type EntityType = 'area' | 'nucleus' | 'process' | 'routine' | 'activity';
type Entity = OrgArea | OrgNucleus | OrgProcess | OrgRoutine | OrgActivity;

interface OrgEntityFormSheetProps {
  entity?: EntityType;
  mode: 'create' | 'edit';
  initialData?: Entity;
  context?: {
    areaId?: string;
    nucleusId?: string;
    processId?: string;
    routineId?: string;
  };
  contextSummary?: Array<{
    label: string;
    value: string;
  }>;
  relationOptions?: {
    areas?: Array<{ id: string; name: string }>;
    nuclei?: Array<{ id: string; name: string; area_id: string }>;
    processes?: Array<{
      id: string;
      name: string;
      area_id?: string | null;
      nucleus_id?: string | null;
    }>;
    routines?: Array<{ id: string; name: string; process_id: string }>;
  };
  isOpen?: boolean;
  onClose?: () => void;
  onSaved?: (saved: Entity) => void;
  initialTab?: string;
}

type FormData = Partial<Entity> & {
  name: string;
  description?: string | null;
  objective?: string | null;
  responsible_roles: string[];
  documentation?: Record<string, any>;
  inputs?: OrgInputOutput[];
  outputs?: OrgInputOutput[];
  risks?: string[];
  impacts?: string[];
  complexity?: 'low' | 'medium' | 'high';
  priority?: 'low' | 'normal' | 'high';
  required_role?: string | null;
  average_execution_time?: number | null;
  area_id?: string;
  nucleus_id?: string;
  process_id?: string;
  routine_id?: string;
};

const defaultFormData: FormData = {
  name: '',
  description: null,
  objective: null,
  responsible_roles: [],
  documentation: {},
  inputs: [],
  outputs: [],
  risks: [],
  impacts: [],
  area_id: '',
  nucleus_id: '',
  process_id: '',
  routine_id: '',
};

const entityLabels: Record<EntityType, string> = {
  area: 'Área',
  nucleus: 'Núcleo',
  process: 'Processo',
  routine: 'Rotina',
  activity: 'Atividade',
};

const serverActions = {
  area: { create: createAreaAction, update: updateAreaAction },
  nucleus: { create: createNucleusAction, update: updateNucleusAction },
  process: { create: createProcessAction, update: updateProcessAction },
  routine: { create: createRoutineAction, update: updateRoutineAction },
  activity: { create: createActivityAction, update: updateActivityAction },
};

export function OrgEntityFormSheet({
  entity,
  mode,
  initialData,
  context,
  contextSummary,
  relationOptions,
  isOpen = true,
  onClose,
  onSaved,
  initialTab = 'info',
}: OrgEntityFormSheetProps) {
  const [formData, setFormData] = useState<FormData>(defaultFormData);
  const [isDirty, setIsDirty] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [activeTab, setActiveTab] = useState(initialTab);

  // Initialize form from initialData
  useEffect(() => {
    if (initialData && isOpen) {
      const baseData = {
        name: initialData.name || '',
        description: initialData.description || null,
        objective: initialData.objective || null,
        responsible_roles: (initialData as any).responsible_roles || [],
        documentation: (initialData as any).documentation || {},
        inputs: (initialData as any).inputs || [],
        outputs: (initialData as any).outputs || [],
        risks: (initialData as any).risks || [],
        impacts: (initialData as any).impacts || [],
        area_id:
          entity === 'nucleus'
            ? ((initialData as OrgNucleus).area_id ?? '')
            : entity === 'process'
              ? ((initialData as OrgProcess).area_id ?? '')
              : '',
        nucleus_id: entity === 'process' ? ((initialData as OrgProcess).nucleus_id ?? '') : '',
        process_id: entity === 'routine' ? ((initialData as OrgRoutine).process_id ?? '') : '',
        routine_id: entity === 'activity' ? ((initialData as OrgActivity).routine_id ?? '') : '',
      };

      const activityData =
        entity === 'activity'
          ? {
              complexity: (initialData as OrgActivity).complexity || 'low',
              priority: (initialData as OrgActivity).priority || 'normal',
              required_role: (initialData as OrgActivity).required_role || null,
              average_execution_time: (initialData as OrgActivity).average_execution_time || null,
            }
          : {};

      setFormData({ ...baseData, ...activityData });
      setIsDirty(false);
      setErrors({});
    } else if (mode === 'create' && isOpen) {
      setFormData({
        ...defaultFormData,
        area_id: context?.areaId ?? '',
        nucleus_id: context?.nucleusId ?? '',
        process_id: context?.processId ?? '',
        routine_id: context?.routineId ?? '',
      });
      setIsDirty(false);
      setErrors({});
    }
  }, [initialData, isOpen, mode, entity, context]);

  // Update active tab when initialTab prop changes
  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab);
    }
  }, [initialTab, isOpen]);

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setIsDirty(true);
  };

  const filteredNuclei = React.useMemo(() => {
    if (!relationOptions?.nuclei?.length) return [];
    if (!formData.area_id) return relationOptions.nuclei;
    return relationOptions.nuclei.filter((nucleus) => nucleus.area_id === formData.area_id);
  }, [relationOptions?.nuclei, formData.area_id]);

  const relationBadges = React.useMemo(() => {
    if (!relationOptions) return [];

    const areaName =
      relationOptions.areas?.find((area) => area.id === formData.area_id)?.name ?? undefined;
    const nucleusName =
      relationOptions.nuclei?.find((nucleus) => nucleus.id === formData.nucleus_id)?.name ??
      undefined;
    const processName =
      relationOptions.processes?.find((process) => process.id === formData.process_id)?.name ??
      undefined;
    const routineName =
      relationOptions.routines?.find((routine) => routine.id === formData.routine_id)?.name ??
      undefined;

    return [
      ...(areaName ? [{ label: 'Área', value: areaName }] : []),
      ...(nucleusName ? [{ label: 'Núcleo', value: nucleusName }] : []),
      ...(processName ? [{ label: 'Processo', value: processName }] : []),
      ...(routineName ? [{ label: 'Rotina', value: routineName }] : []),
    ];
  }, [relationOptions, formData.area_id, formData.nucleus_id, formData.process_id, formData.routine_id]);

  const handleAddArrayItem = (field: 'inputs' | 'outputs' | 'risks' | 'impacts') => {
    const current = formData[field] || [];
    if (field === 'risks' || field === 'impacts') {
      setFormData((prev) => ({ ...prev, [field]: [...current, ''] }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [field]: [...current, { name: '', description: '', required: false }],
      }));
    }
    setIsDirty(true);
  };

  const handleRemoveArrayItem = (
    field: 'inputs' | 'outputs' | 'risks' | 'impacts',
    idx: number,
  ) => {
    const current = formData[field] || [];
    setFormData((prev) => ({
      ...prev,
      [field]: current.filter((_, i) => i !== idx),
    }));
    setIsDirty(true);
  };

  const handleSave = async () => {
    if (!entity) return;

    // Validation
    if (!formData.name || formData.name.trim().length < 3) {
      setErrors({ name: 'Nome é obrigatório (mínimo 3 caracteres)' });
      return;
    }

    if (entity === 'nucleus' && !(formData.area_id || context?.areaId)) {
      setErrors({ area_id: 'Área é obrigatória' });
      return;
    }

    if (entity === 'routine' && !(formData.process_id || context?.processId)) {
      setErrors({ process_id: 'Processo é obrigatório' });
      return;
    }

    if (entity === 'activity' && !(formData.routine_id || context?.routineId)) {
      setErrors({ routine_id: 'Rotina é obrigatória' });
      return;
    }

    setIsSaving(true);
    try {
      const action =
        mode === 'create' ? serverActions[entity].create : serverActions[entity].update;

      // Prepare payload
      const payload = {
        name: formData.name,
        description: formData.description || null,
        objective: formData.objective || null,
        responsible_roles: formData.responsible_roles || [],
        documentation: formData.documentation || {},
        ...(entity === 'nucleus' && {
          area_id: formData.area_id || context?.areaId || '',
        }),
        ...(entity === 'process' && {
          area_id: formData.area_id || null,
          nucleus_id: formData.nucleus_id || null,
        }),
        ...(entity === 'routine' && {
          process_id: formData.process_id || context?.processId || '',
        }),
        ...(entity === 'activity' && {
          routine_id: formData.routine_id || context?.routineId || '',
        }),
        ...(entity !== 'routine' && {
          inputs: formData.inputs || [],
          outputs: formData.outputs || [],
        }),
        ...(entity === 'process' && {
          risks: formData.risks || [],
          impacts: formData.impacts || [],
        }),
        ...(entity === 'activity' && {
          inputs: formData.inputs || [],
          outputs: formData.outputs || [],
          risks: formData.risks || [],
          impacts: formData.impacts || [],
          complexity: formData.complexity || 'low',
          priority: formData.priority || 'normal',
          required_role: formData.required_role || null,
          average_execution_time: formData.average_execution_time || null,
        }),
      };

      // Add context for create mode
      let result: any;
      if (mode === 'create') {
        const createPayload = {
          ...payload,
          ...(entity === 'nucleus' && { area_id: context?.areaId }),
          ...(entity === 'process' && { nucleus_id: context?.nucleusId }),
          ...(entity === 'routine' && { process_id: context?.processId }),
          ...(entity === 'activity' && { routine_id: context?.routineId }),
        };
        const createAction = serverActions[entity].create as (payload: any) => Promise<any>;
        result = await createAction(createPayload);
      } else {
        const updateAction = serverActions[entity].update as (
          id: string,
          payload: any,
        ) => Promise<any>;
        result = await updateAction((initialData as any).id, payload);
      }

      if (result.success && result.data) {
        toast.success(
          `✅ ${entityLabels[entity]} ${mode === 'create' ? 'criada' : 'atualizada'} com sucesso!`,
        );
        setIsDirty(false);
        onSaved?.(result.data);
        onClose?.();
      } else {
        setErrors(result.field_errors || {});
        toast.error(result.message || 'Erro ao salvar');
      }
    } catch (error) {
      toast.error(`Erro: ${error instanceof Error ? error.message : 'desconhecido'}`);
    } finally {
      setIsSaving(false);
    }
  };

  if (!entity) return null;

  const title = `${mode === 'create' ? 'Nova' : 'Editar'} ${entityLabels[entity]}`;
  const descriptionText =
    mode === 'create'
      ? `Preencha os dados do cadastro de ${entityLabels[entity].toLowerCase()}.`
      : `Atualize os dados, vínculos e documentação deste ${entityLabels[entity].toLowerCase()}.`;

  const summaryCards = [
    ...(relationBadges.length > 0
      ? relationBadges.map((item) => ({
          label: item.label,
          value: item.value,
        }))
      : []),
    { label: 'Nome', value: formData.name?.trim() || 'Não informado' },
    {
      label: 'Descrição',
      value: formData.description?.trim() || 'Não informada',
    },
    {
      label: 'Objetivo',
      value: formData.objective?.trim() || 'Não informado',
    },
    {
      label: 'Roles',
      value: `${formData.responsible_roles?.length || 0} vinculada(s)`,
    },
    ...(entity === 'process' || entity === 'activity'
      ? [
          {
            label: 'BPM',
            value: `${(formData.inputs || []).length} entradas · ${(formData.outputs || []).length} saídas`,
          },
          {
            label: 'Riscos',
            value: `${(formData.risks || []).length} item(ns)`,
          },
        ]
      : []),
    ...(entity === 'activity'
      ? [
          {
            label: 'Atividade',
            value: `${String(formData.complexity || 'low').toUpperCase()} · ${String(formData.priority || 'normal').toUpperCase()}`,
          },
          {
            label: 'Tempo médio',
            value: formData.average_execution_time ? `${formData.average_execution_time} min` : 'Não informado',
          },
        ]
      : []),
  ];

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose?.()}>
      <SheetContent
        side="right"
        className="flex w-full max-w-[760px] flex-col overflow-hidden p-0"
      >
        <SheetHeader className="border-b px-6 py-5 text-left">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="space-y-1">
              <SheetTitle>{title}</SheetTitle>
              <p className="text-sm text-muted-foreground">{descriptionText}</p>
            </div>
            <Badge variant="secondary" className="gap-1.5">
              <GitBranch className="h-3.5 w-3.5" />
              {mode === 'create' ? 'Novo' : 'Edição'}
            </Badge>
          </div>
        </SheetHeader>

        {(contextSummary?.length || mode === 'edit') && (
          <div className="border-b bg-muted/30 px-6 py-4">
            {contextSummary?.length ? (
              <div className="mb-4 space-y-2">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Contexto do cadastro
                </p>
                <div className="flex flex-wrap gap-2">
                  {contextSummary.map((item) => (
                    <Badge key={`${item.label}-${item.value}`} variant="outline" className="gap-1.5">
                      <span className="text-muted-foreground">{item.label}:</span>
                      <span className="font-medium text-foreground">{item.value}</span>
                    </Badge>
                  ))}
                </div>
              </div>
            ) : null}

            {mode === 'edit' && (
              <div className="space-y-3">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Resumo atual
                </p>
                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                  {summaryCards.map((item) => (
                    <div key={item.label} className="rounded-lg border bg-background p-3">
                      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                        {item.label}
                      </p>
                      <p className="mt-1 text-sm font-medium text-foreground">{item.value}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Dirty State Alert */}
        {isDirty && (
          <Card className="m-4 border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-950">
            <CardContent className="pt-4">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-yellow-600" />
                <p className="text-sm text-yellow-800 dark:text-yellow-200">
                  Você tem alterações não salvas.
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Content */}
        <ScrollArea className="min-h-0 flex-1">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList
              className="grid w-full rounded-none border-b px-6"
              style={{
                gridTemplateColumns:
                  entity === 'process' || entity === 'activity'
                    ? 'repeat(3, 1fr)'
                    : 'repeat(2, 1fr)',
              }}
            >
              <TabsTrigger value="info">Informações</TabsTrigger>
              {(entity === 'process' || entity === 'activity') && (
                <TabsTrigger value="bpm">BPM</TabsTrigger>
              )}
              <TabsTrigger value="documentation">Documentação</TabsTrigger>
            </TabsList>

            {/* TAB: INFO */}
            <TabsContent value="info" className="space-y-4 p-6">
              {entity === 'nucleus' && relationOptions?.areas?.length ? (
                <div>
                  <Label>Área *</Label>
                  <Select
                    value={formData.area_id || ''}
                    onValueChange={(value) => handleChange('area_id', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a área" />
                    </SelectTrigger>
                    <SelectContent>
                      {relationOptions.areas.map((area) => (
                        <SelectItem key={area.id} value={area.id}>
                          {area.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              ) : null}

              {entity === 'process' && relationOptions?.areas?.length ? (
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Label>Área</Label>
                    <Select
                      value={formData.area_id || 'none'}
                      onValueChange={(value) => {
                        const nextAreaId = value === 'none' ? '' : value;
                        const nextNucleus =
                          relationOptions.nuclei?.some(
                            (nucleus) =>
                              nucleus.id === formData.nucleus_id && nucleus.area_id === nextAreaId,
                          ) && nextAreaId === formData.area_id
                            ? formData.nucleus_id
                            : '';
                        setFormData((prev) => ({
                          ...prev,
                          area_id: nextAreaId,
                          nucleus_id: nextNucleus,
                        }));
                        setIsDirty(true);
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione a área" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Nenhuma</SelectItem>
                        {relationOptions.areas.map((area) => (
                          <SelectItem key={area.id} value={area.id}>
                            {area.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Núcleo</Label>
                    <Select
                      value={formData.nucleus_id || ''}
                      onValueChange={(value) =>
                        handleChange('nucleus_id', value === 'none' ? '' : value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o núcleo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Nenhum</SelectItem>
                        {filteredNuclei.map((nucleus) => (
                          <SelectItem key={nucleus.id} value={nucleus.id}>
                            {nucleus.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              ) : null}

              {entity === 'routine' && relationOptions?.processes?.length ? (
                <div>
                  <Label>Processo *</Label>
                  <Select
                    value={formData.process_id || ''}
                    onValueChange={(value) => handleChange('process_id', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o processo" />
                    </SelectTrigger>
                    <SelectContent>
                      {relationOptions.processes.map((process) => (
                        <SelectItem key={process.id} value={process.id}>
                          {process.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              ) : null}

              {entity === 'activity' && relationOptions?.routines?.length ? (
                <div>
                  <Label>Rotina *</Label>
                  <Select
                    value={formData.routine_id || ''}
                    onValueChange={(value) => handleChange('routine_id', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a rotina" />
                    </SelectTrigger>
                    <SelectContent>
                      {relationOptions.routines.map((routine) => (
                        <SelectItem key={routine.id} value={routine.id}>
                          {routine.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              ) : null}

              <div>
                <Label>Nome *</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  placeholder={`Nome da ${entityLabels[entity].toLowerCase()}`}
                  className={errors.name ? 'border-red-500' : ''}
                />
                {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name}</p>}
              </div>

              <div>
                <Label>Descrição</Label>
                <Textarea
                  value={formData.description || ''}
                  onChange={(e) => handleChange('description', e.target.value || null)}
                  placeholder={`Descrição da ${entityLabels[entity].toLowerCase()}`}
                  rows={3}
                />
              </div>

              <div>
                <Label>Objetivo</Label>
                <Textarea
                  value={formData.objective || ''}
                  onChange={(e) => handleChange('objective', e.target.value || null)}
                  placeholder={`Objetivo da ${entityLabels[entity].toLowerCase()}`}
                  rows={2}
                />
              </div>

              <div>
                <Label htmlFor="responsible_roles">Roles Responsáveis</Label>
                <ResponsibleRolesInput
                  value={formData.responsible_roles || []}
                  onChange={(roles) => handleChange('responsible_roles', roles)}
                  disabled={isSaving}
                />
                {errors.responsible_roles && (
                  <p className="mt-1 text-xs text-red-500">{errors.responsible_roles}</p>
                )}
              </div>

              {/* Activity specific fields */}
              {entity === 'activity' && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Complexidade</Label>
                      <Select
                        value={formData.complexity || 'low'}
                        onValueChange={(value) => handleChange('complexity', value as any)}
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

                    <div>
                      <Label>Prioridade</Label>
                      <Select
                        value={formData.priority || 'normal'}
                        onValueChange={(value) => handleChange('priority', value as any)}
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

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Role Responsável</Label>
                      <Input
                        value={formData.required_role || ''}
                        onChange={(e) => handleChange('required_role', e.target.value || null)}
                        placeholder="ex.: Admin"
                      />
                    </div>

                    <div>
                      <Label>Tempo Médio (minutos)</Label>
                      <Input
                        type="number"
                        value={formData.average_execution_time || ''}
                        onChange={(e) =>
                          handleChange(
                            'average_execution_time',
                            e.target.value ? Number(e.target.value) : null,
                          )
                        }
                        placeholder="ex.: 45"
                      />
                    </div>
                  </div>
                </>
              )}
            </TabsContent>

            {/* TAB: BPM (Processo e Atividade) */}
            {(entity === 'process' || entity === 'activity') && (
              <TabsContent value="bpm" className="space-y-6 p-6">
                {/* Inputs */}
                <div>
                  <div className="mb-3 flex items-center justify-between">
                    <h3 className="font-semibold">Inputs (Entradas)</h3>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleAddArrayItem('inputs')}
                      className="gap-1"
                    >
                      <Plus className="h-3 w-3" />
                      Adicionar
                    </Button>
                  </div>
                  <div className="space-y-2">
                    {(formData.inputs || []).map((input, idx) => (
                      <div key={idx} className="flex gap-2">
                        <Input
                          value={input.name}
                          onChange={(e) => {
                            const newInputs = [...(formData.inputs || [])];
                            newInputs[idx].name = e.target.value;
                            handleChange('inputs', newInputs);
                          }}
                          placeholder="Nome"
                          className="flex-1"
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveArrayItem('inputs', idx)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Outputs */}
                <div>
                  <div className="mb-3 flex items-center justify-between">
                    <h3 className="font-semibold">Outputs (Saídas)</h3>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleAddArrayItem('outputs')}
                      className="gap-1"
                    >
                      <Plus className="h-3 w-3" />
                      Adicionar
                    </Button>
                  </div>
                  <div className="space-y-2">
                    {(formData.outputs || []).map((output, idx) => (
                      <div key={idx} className="flex gap-2">
                        <Input
                          value={output.name}
                          onChange={(e) => {
                            const newOutputs = [...(formData.outputs || [])];
                            newOutputs[idx].name = e.target.value;
                            handleChange('outputs', newOutputs);
                          }}
                          placeholder="Nome"
                          className="flex-1"
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveArrayItem('outputs', idx)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Risks (Processo e Atividade) */}
                <div>
                  <div className="mb-3 flex items-center justify-between">
                    <h3 className="font-semibold">Riscos</h3>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleAddArrayItem('risks')}
                      className="gap-1"
                    >
                      <Plus className="h-3 w-3" />
                      Adicionar
                    </Button>
                  </div>
                  <div className="space-y-2">
                    {(formData.risks || []).map((risk, idx) => (
                      <div key={idx} className="flex gap-2">
                        <Input
                          value={risk}
                          onChange={(e) => {
                            const newRisks = [...(formData.risks || [])];
                            newRisks[idx] = e.target.value;
                            handleChange('risks', newRisks);
                          }}
                          placeholder="Descrição do risco"
                          className="flex-1"
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveArrayItem('risks', idx)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Impacts (apenas Atividade) */}
                {entity === 'activity' && (
                  <div>
                    <div className="mb-3 flex items-center justify-between">
                      <h3 className="font-semibold">Impactos</h3>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleAddArrayItem('impacts')}
                        className="gap-1"
                      >
                        <Plus className="h-3 w-3" />
                        Adicionar
                      </Button>
                    </div>
                    <div className="space-y-2">
                      {(formData.impacts || []).map((impact, idx) => (
                        <div key={idx} className="flex gap-2">
                          <Input
                            value={impact}
                            onChange={(e) => {
                              const newImpacts = [...(formData.impacts || [])];
                              newImpacts[idx] = e.target.value;
                              handleChange('impacts', newImpacts);
                            }}
                            placeholder="Descrição do impacto"
                            className="flex-1"
                          />
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveArrayItem('impacts', idx)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </TabsContent>
            )}

            {/* TAB: DOCUMENTATION */}
            <TabsContent value="documentation" className="space-y-4 p-6">
              <div>
                <Label>Procedimentos</Label>
                <Textarea
                  value={formData.documentation?.procedures || ''}
                  onChange={(e) =>
                    handleChange('documentation', {
                      ...formData.documentation,
                      procedures: e.target.value || undefined,
                    })
                  }
                  placeholder="Procedimentos"
                  rows={3}
                />
              </div>

              <div>
                <Label>Instruções</Label>
                <Textarea
                  value={formData.documentation?.instructions || ''}
                  onChange={(e) =>
                    handleChange('documentation', {
                      ...formData.documentation,
                      instructions: e.target.value || undefined,
                    })
                  }
                  placeholder="Instruções"
                  rows={3}
                />
              </div>

              <div>
                <Label>Regra de Negócio</Label>
                <Textarea
                  value={formData.documentation?.regra || ''}
                  onChange={(e) =>
                    handleChange('documentation', {
                      ...formData.documentation,
                      regra: e.target.value || undefined,
                    })
                  }
                  placeholder="Regra crítica de negócio"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Prazo</Label>
                  <Input
                    value={formData.documentation?.prazo || ''}
                    onChange={(e) =>
                      handleChange('documentation', {
                        ...formData.documentation,
                        prazo: e.target.value || undefined,
                      })
                    }
                    placeholder="ex.: 24h"
                  />
                </div>

                <div>
                  <Label>Horário Limite</Label>
                  <Input
                    value={formData.documentation?.horario_limite || ''}
                    onChange={(e) =>
                      handleChange('documentation', {
                        ...formData.documentation,
                        horario_limite: e.target.value || undefined,
                      })
                    }
                    placeholder="ex.: 18:00"
                  />
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </ScrollArea>

        {/* Footer Actions */}
        <div className="bg-muted/50 flex justify-end gap-3 border-t px-6 py-4">
          <Button variant="outline" onClick={onClose} disabled={isSaving}>
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={!isDirty || isSaving} className="gap-2">
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Salvando...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                Salvar
              </>
            )}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
