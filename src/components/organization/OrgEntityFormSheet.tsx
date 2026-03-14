'use client';

import React, { useState, useEffect } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { AlertTriangle, Save, Loader2, Plus, Trash2 } from 'lucide-react';
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
  isOpen?: boolean;
  onClose?: () => void;
  onSaved?: (saved: Entity) => void;
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
  isOpen = true,
  onClose,
  onSaved,
}: OrgEntityFormSheetProps) {
  const [formData, setFormData] = useState<FormData>(defaultFormData);
  const [isDirty, setIsDirty] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [activeTab, setActiveTab] = useState('info');

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
      };

      const activityData = entity === 'activity' ? {
        complexity: (initialData as OrgActivity).complexity || 'low',
        priority: (initialData as OrgActivity).priority || 'normal',
        required_role: (initialData as OrgActivity).required_role || null,
        average_execution_time: (initialData as OrgActivity).average_execution_time || null,
      } : {};

      setFormData({ ...baseData, ...activityData });
      setIsDirty(false);
      setErrors({});
    } else if (mode === 'create' && isOpen) {
      setFormData(defaultFormData);
      setIsDirty(false);
      setErrors({});
    }
  }, [initialData, isOpen, mode, entity]);

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setIsDirty(true);
  };

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

  const handleRemoveArrayItem = (field: 'inputs' | 'outputs' | 'risks' | 'impacts', idx: number) => {
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

    setIsSaving(true);
    try {
      const action =
        mode === 'create'
          ? serverActions[entity].create
          : serverActions[entity].update;

      // Prepare payload
      const payload = {
        name: formData.name,
        description: formData.description || null,
        objective: formData.objective || null,
        responsible_roles: formData.responsible_roles || [],
        documentation: formData.documentation || {},
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
        const updateAction = serverActions[entity].update as (id: string, payload: any) => Promise<any>;
        result = await updateAction((initialData as any).id, payload);
      }

      if (result.success && result.data) {
        toast.success(`✅ ${entityLabels[entity]} ${mode === 'create' ? 'criada' : 'atualizada'} com sucesso!`);
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

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose?.()}>
      <SheetContent side="right" className="w-full max-w-2xl p-0 overflow-hidden flex flex-col">
        <SheetHeader className="border-b px-6 py-4">
          <SheetTitle>{title}</SheetTitle>
        </SheetHeader>

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
        <div className="flex-1 overflow-y-auto">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full rounded-none border-b px-6" style={{
              gridTemplateColumns: entity === 'process' || entity === 'activity' ? 'repeat(3, 1fr)' : 'repeat(2, 1fr)',
            }}>
              <TabsTrigger value="info">Informações</TabsTrigger>
              {(entity === 'process' || entity === 'activity') && (
                <TabsTrigger value="bpm">BPM</TabsTrigger>
              )}
              <TabsTrigger value="documentation">Documentação</TabsTrigger>
            </TabsList>

            {/* TAB: INFO */}
            <TabsContent value="info" className="space-y-4 p-6">
              <div>
                <Label>Nome *</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  placeholder={`Nome da ${entityLabels[entity].toLowerCase()}`}
                  className={errors.name ? 'border-red-500' : ''}
                />
                {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
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
                <Label>Roles Responsáveis</Label>
                <Input
                  value={(formData.responsible_roles || []).join(', ')}
                  onChange={(e) =>
                    handleChange(
                      'responsible_roles',
                      e.target.value
                        .split(',')
                        .map((r) => r.trim())
                        .filter(Boolean),
                    )
                  }
                  placeholder="ex.: Admin, Manager, Developer (separe por vírgula)"
                />
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
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold">Inputs (Entradas)</h3>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleAddArrayItem('inputs')}
                      className="gap-1"
                    >
                      <Plus className="w-3 h-3" />
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
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Outputs */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold">Outputs (Saídas)</h3>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleAddArrayItem('outputs')}
                      className="gap-1"
                    >
                      <Plus className="w-3 h-3" />
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
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Risks (Processo e Atividade) */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold">Riscos</h3>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleAddArrayItem('risks')}
                      className="gap-1"
                    >
                      <Plus className="w-3 h-3" />
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
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Impacts (apenas Atividade) */}
                {entity === 'activity' && (
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold">Impactos</h3>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleAddArrayItem('impacts')}
                        className="gap-1"
                      >
                        <Plus className="w-3 h-3" />
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
                            <Trash2 className="w-4 h-4" />
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
        </div>

        {/* Footer Actions */}
        <div className="flex justify-end gap-3 border-t bg-muted/50 px-6 py-4">
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
