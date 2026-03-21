'use client';

import React, { useState, useEffect, useCallback } from 'react';
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
import { Save, X, AlertTriangle, Loader2 } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';
import type { LmProvider, AgentType, LmModel } from '@/types/agents';
import type { UIAgent } from '@/lib/transformers/agent';
import { dbAgentToUI, type DBAgent } from '@/lib/transformers/agent';
import { AgentSupabaseService } from '@/services/agents/agentSupabaseService';
import { AgentTypesService } from '@/services/agents/agentTypesService';
import { LmModelsService } from '@/services/agents/lmModelsService';
import { SquadMemberSupabaseService } from '@/services/agents/squadMemberSupabaseService';
import { Checkbox } from '@/components/ui/checkbox';
import { validateAgentEntity360 } from '@/lib/validation/epic16-agentes-skills';

interface AgentEditSheetProps {
  agent: UIAgent | null;
  isOpen: boolean;
  providers: LmProvider[];
  /** Lista completa para compor squads (apenas entityKind agent são elegíveis) */
  allAgents?: UIAgent[];
  onClose: () => void;
  onSaved: (updatedAgent: UIAgent) => void;
}

const statusColor = {
  draft: 'text-yellow-700 bg-yellow-100 dark:bg-yellow-950 dark:text-yellow-200',
  published: 'text-green-700 bg-green-100 dark:bg-green-950 dark:text-green-200',
  deprecated: 'text-red-700 bg-red-100 dark:bg-red-950 dark:text-red-200',
};

export const AgentEditSheet: React.FC<AgentEditSheetProps> = ({
  agent,
  isOpen,
  providers,
  allAgents = [],
  onClose,
  onSaved,
}) => {
  const [isSaving, setIsSaving] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [activeTab, setActiveTab] = useState('basic');
  const [agentTypes, setAgentTypes] = useState<AgentType[]>([]);
  const [modelsByProvider, setModelsByProvider] = useState<Record<string, LmModel[]>>({});
  const [squadMemberIds, setSquadMemberIds] = useState<string[]>([]);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    status: 'draft' as 'draft' | 'published' | 'deprecated',
    entityKind: 'agent' as 'agent' | 'squad',
    agentTypeId: '',
    usageType: 'chatbot' as 'chatbot' | 'workflow',
    showInShortcut: false,
    isGlobalChatbot: false,
    tags: [] as string[],
    owners: [] as string[],
    persona: '',
    promptObjective: '',
    promptInstructions: '',
    promptTemplate: '',
    modelProvider: '',
    modelId: '',
    modelTemperature: 0.7,
    modelMaxTokens: 2000,
    requirements: '',
    outputSchema: '{}',
  });

  // Initialize form from agent prop
  useEffect(() => {
    if (agent) {
      const instructions = agent.fullConfig.promptInstructions;
      setFormData({
        name: agent.name,
        slug: agent.slug,
        description: agent.description,
        status: agent.status,
        entityKind: agent.entityKind || 'agent',
        agentTypeId: agent.agentTypeId || '',
        usageType: agent.usageType || 'chatbot',
        showInShortcut: agent.showInShortcut ?? false,
        isGlobalChatbot: agent.isGlobalChatbot ?? false,
        tags: agent.tags ?? [],
        owners: agent.owners ?? [],
        persona: agent.fullConfig.persona || '',
        promptObjective: agent.fullConfig.promptObjective || '',
        promptInstructions: Array.isArray(instructions)
          ? instructions.join('\n')
          : String(instructions || ''),
        promptTemplate: agent.fullConfig.promptTemplate || '',
        modelProvider: agent.fullConfig.modelProvider,
        modelId: agent.modelId,
        modelTemperature: agent.fullConfig.modelTemperature,
        modelMaxTokens: agent.fullConfig.modelMaxTokens,
        requirements: (agent.fullConfig.requirements || []).join('\n'),
        outputSchema: JSON.stringify(agent.fullConfig.outputSchema || {}, null, 2),
      });
      setIsDirty(false);
      setFieldErrors({});
    }
  }, [agent, isOpen]);

  useEffect(() => {
    if (!agent || !isOpen) return;
    if (agent.entityKind === 'squad') {
      void SquadMemberSupabaseService.listMemberIds(agent.id)
        .then(setSquadMemberIds)
        .catch(() => setSquadMemberIds([]));
    } else {
      setSquadMemberIds([]);
    }
  }, [agent, isOpen]);

  // Load agent types
  useEffect(() => {
    if (isOpen) {
      AgentTypesService.listAgentTypes()
        .then(setAgentTypes)
        .catch(() => {
          toast.error('Erro ao carregar tipos de agentes');
        });
    }
  }, [isOpen]);

  // Load models for selected provider
  const loadModelsForProvider = useCallback(
    async (providerId: string) => {
      if (modelsByProvider[providerId]) return;
      try {
        const models = await LmModelsService.listModels(providerId);
        const sorted = models.sort((a, b) => (a.display_order ?? 100) - (b.display_order ?? 100));
        setModelsByProvider((prev) => ({ ...prev, [providerId]: sorted }));
      } catch {
        toast.error('Erro ao carregar modelos');
      }
    },
    [modelsByProvider],
  );

  // Load models when provider changes
  useEffect(() => {
    const provider = providers.find((p) => p.slug === formData.modelProvider);
    if (provider && isOpen) {
      void loadModelsForProvider(provider.id);
    }
  }, [formData.modelProvider, providers, isOpen, loadModelsForProvider]);

  const handleChange = (field: string, value: unknown) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setIsDirty(true);
    setFieldErrors({});
  };

  const handleSave = async () => {
    if (!agent) return;

    const eligibleMemberAgentIds = allAgents
      .filter((a) => a.entityKind === 'agent' && a.id !== agent.id)
      .map((a) => a.id);

    const validation = validateAgentEntity360({
      name: formData.name,
      slug: formData.slug,
      description: formData.description,
      entityKind: formData.entityKind,
      status: formData.status,
      modelTemperature: formData.modelTemperature,
      modelMaxTokens: formData.modelMaxTokens,
      outputSchemaText: formData.outputSchema,
      squadMemberIds,
      eligibleMemberAgentIds,
    });

    if (!validation.ok) {
      setFieldErrors(validation.fieldErrors);
      const msg =
        Object.values(validation.fieldErrors)[0] ?? 'Corrija os campos destacados antes de salvar.';
      toast.error(msg);
      return;
    }

    setFieldErrors({});
    setIsSaving(true);
    try {
      const instructionsArr = formData.promptInstructions
        .split('\n')
        .map((s) => s.trim())
        .filter(Boolean);
      const updates = {
        name: formData.name,
        slug: formData.slug,
        description: formData.description,
        status: formData.status,
        entity_kind: formData.entityKind,
        agent_type_id: formData.agentTypeId || null,
        agent_type: agentTypes.find((t) => t.id === formData.agentTypeId)?.slug || 'custom',
        usage_type:
          formData.entityKind === 'squad' ? 'workflow' : formData.usageType,
        show_in_shortcut: formData.entityKind === 'squad' ? false : formData.showInShortcut,
        is_global_chatbot: formData.entityKind === 'squad' ? false : formData.isGlobalChatbot,
        tags: formData.tags,
        owners: formData.owners,
        persona: formData.persona,
        prompt_objective: formData.promptObjective,
        prompt_instructions: JSON.stringify(instructionsArr),
        prompt_template: formData.promptTemplate,
        model_provider: formData.modelProvider,
        model_id: formData.modelId,
        model_temperature: formData.modelTemperature,
        model_max_tokens: formData.modelMaxTokens,
        requirements: formData.requirements
          .split('\n')
          .map((s) => s.trim())
          .filter(Boolean),
        output_schema: validation.outputSchema ?? {},
      };

      const updated = await AgentSupabaseService.updateAgent(
        agent.id,
        updates as unknown as Parameters<typeof AgentSupabaseService.updateAgent>[1],
      );

      if (formData.entityKind === 'squad') {
        await SquadMemberSupabaseService.replaceMembers(agent.id, squadMemberIds);
      } else {
        await SquadMemberSupabaseService.replaceMembers(agent.id, []);
      }

      const uiAgent = dbAgentToUI(updated as unknown as DBAgent);
      toast.success('✅ Agente atualizado com sucesso!');
      setIsDirty(false);
      onSaved(uiAgent);
      onClose();
    } catch (error) {
      toast.error(`❌ Erro: ${error instanceof Error ? error.message : 'desconhecido'}`);
    } finally {
      setIsSaving(false);
    }
  };

  if (!agent) return null;

  const selectedType = agentTypes.find((t) => t.id === formData.agentTypeId);
  const selectedProvider = providers.find((p) => p.slug === formData.modelProvider);
  const selectedModels = selectedProvider ? (modelsByProvider[selectedProvider.id] ?? []) : [];

  const eligibleSquadMembers = allAgents.filter(
    (a) => a.entityKind === 'agent' && a.id !== agent.id,
  );

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent side="right" className="w-full max-w-2xl p-0">
        <SheetHeader className="border-b px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <SheetTitle>{agent.name}</SheetTitle>
              <Badge className={`mt-2 text-xs ${statusColor[formData.status]}`}>
                {formData.status === 'draft' && '📝 Rascunho'}
                {formData.status === 'published' && '✅ Publicado'}
                {formData.status === 'deprecated' && '⛔ Deprecado'}
              </Badge>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
              <X className="h-4 w-4" />
              <span className="sr-only">Fechar</span>
            </Button>
          </div>
        </SheetHeader>

        <div className="flex flex-col overflow-hidden">
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
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-4 rounded-none border-b px-6">
                <TabsTrigger value="basic">Básico</TabsTrigger>
                <TabsTrigger value="persona">Persona</TabsTrigger>
                <TabsTrigger value="model">Modelo</TabsTrigger>
                <TabsTrigger value="advanced">Avançado</TabsTrigger>
              </TabsList>

              {/* TAB 1: BASIC */}
              <TabsContent value="basic" className="space-y-4 p-6">
                <div>
                  <Label>Nome</Label>
                  <Input
                    value={formData.name}
                    onChange={(e) => handleChange('name', e.target.value)}
                    className={fieldErrors.name ? 'border-destructive' : ''}
                    aria-invalid={!!fieldErrors.name}
                  />
                  {fieldErrors.name && (
                    <p className="mt-1 text-xs text-destructive">{fieldErrors.name}</p>
                  )}
                </div>

                <div>
                  <Label>Slug</Label>
                  <Input
                    value={formData.slug}
                    onChange={(e) => handleChange('slug', e.target.value)}
                    className={fieldErrors.slug ? 'border-destructive' : ''}
                    aria-invalid={!!fieldErrors.slug}
                  />
                  {fieldErrors.slug && (
                    <p className="mt-1 text-xs text-destructive">{fieldErrors.slug}</p>
                  )}
                </div>

                <div>
                  <Label>Descrição</Label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => handleChange('description', e.target.value)}
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Status</Label>
                    <Select
                      value={formData.status}
                      onValueChange={(value) => handleChange('status', value as any)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="draft">📝 Rascunho</SelectItem>
                        <SelectItem value="published">✅ Publicado</SelectItem>
                        <SelectItem value="deprecated">⛔ Deprecado</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Tipo de Agente</Label>
                    <Select
                      value={formData.agentTypeId || 'no-type'}
                      onValueChange={(value) =>
                        handleChange('agentTypeId', value === 'no-type' ? null : value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecionar..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="no-type">Sem tipo (Custom)</SelectItem>
                        {agentTypes.map((type) => (
                          <SelectItem key={type.id} value={type.id}>
                            {type.icon_emoji} {type.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label>Entidade</Label>
                  <Select
                    value={formData.entityKind}
                    onValueChange={(v) => {
                      const k = v as 'agent' | 'squad';
                      setFormData((prev) => ({
                        ...prev,
                        entityKind: k,
                        usageType: k === 'squad' ? 'workflow' : prev.usageType,
                        showInShortcut: k === 'squad' ? false : prev.showInShortcut,
                        isGlobalChatbot: k === 'squad' ? false : prev.isGlobalChatbot,
                      }));
                      setIsDirty(true);
                      setFieldErrors({});
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="agent">Agente</SelectItem>
                      <SelectItem value="squad">Squad</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Squad agrupa agentes; não utiliza chat de teste nesta tela.
                  </p>
                </div>

                <div className="space-y-3">
                  <Label>Tipo de Uso</Label>
                  <Select
                    value={formData.usageType}
                    onValueChange={(v) => handleChange('usageType', v as 'chatbot' | 'workflow')}
                    disabled={formData.entityKind === 'squad'}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="chatbot">Chatbot</SelectItem>
                      <SelectItem value="workflow">Workflow</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {formData.entityKind === 'agent' && formData.usageType === 'chatbot' && (
                  <div className="space-y-3 rounded-lg border p-4">
                    <div className="flex items-center justify-between">
                      <Label>Exibir no atalho</Label>
                      <Switch
                        checked={formData.showInShortcut}
                        onCheckedChange={(c) => handleChange('showInShortcut', c)}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label>Chatbot global</Label>
                      <Switch
                        checked={formData.isGlobalChatbot}
                        onCheckedChange={(c) => handleChange('isGlobalChatbot', c)}
                      />
                    </div>
                  </div>
                )}

                {formData.entityKind === 'squad' && (
                  <div className="space-y-3 rounded-lg border p-4">
                    <Label>Membros do squad</Label>
                    <p className="text-xs text-muted-foreground">
                      Selecione agentes individuais que fazem parte deste squad.
                    </p>
                    {fieldErrors.squadMembers && (
                      <p className="text-xs text-destructive">{fieldErrors.squadMembers}</p>
                    )}
                    {eligibleSquadMembers.length === 0 ? (
                      <p className="text-sm text-muted-foreground">
                        Nenhum outro agente disponível. Crie agentes primeiro.
                      </p>
                    ) : (
                      <div className="max-h-52 space-y-2 overflow-y-auto pr-1">
                        {eligibleSquadMembers.map((a) => (
                          <label
                            key={a.id}
                            className="flex cursor-pointer items-center gap-2 text-sm"
                          >
                            <Checkbox
                              checked={squadMemberIds.includes(a.id)}
                              onCheckedChange={(c) => {
                                setIsDirty(true);
                                setFieldErrors({});
                                setSquadMemberIds((prev) =>
                                  c === true
                                    ? [...prev, a.id]
                                    : prev.filter((id) => id !== a.id),
                                );
                              }}
                            />
                            <span>{a.name}</span>
                          </label>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                <div>
                  <Label>Tags (separadas por vírgula)</Label>
                  <Input
                    value={formData.tags.join(', ')}
                    onChange={(e) =>
                      handleChange(
                        'tags',
                        e.target.value
                          .split(',')
                          .map((t) => t.trim())
                          .filter(Boolean),
                      )
                    }
                    placeholder="ex: projetos, relatorios"
                  />
                </div>

                <div>
                  <Label>Owners (emails, separados por vírgula)</Label>
                  <Input
                    value={formData.owners.join(', ')}
                    onChange={(e) =>
                      handleChange(
                        'owners',
                        e.target.value
                          .split(',')
                          .map((t) => t.trim())
                          .filter(Boolean),
                      )
                    }
                    placeholder="ex: user@example.com"
                  />
                </div>
              </TabsContent>

              {/* TAB 2: PERSONA */}
              <TabsContent value="persona" className="space-y-4 p-6">
                <div>
                  <Label>Persona</Label>
                  <Textarea
                    value={formData.persona}
                    onChange={(e) => handleChange('persona', e.target.value)}
                    placeholder="Descreva a personalidade do agente..."
                    rows={3}
                  />
                </div>

                <div>
                  <Label>Objetivo</Label>
                  <Textarea
                    value={formData.promptObjective}
                    onChange={(e) => handleChange('promptObjective', e.target.value)}
                    placeholder="O que o agente deve fazer..."
                    rows={2}
                  />
                </div>

                <div>
                  <Label>Instruções</Label>
                  <Textarea
                    value={formData.promptInstructions}
                    onChange={(e) => handleChange('promptInstructions', e.target.value)}
                    placeholder="Instruções detalhadas..."
                    rows={3}
                  />
                </div>

                <div>
                  <Label>Template de Prompt</Label>
                  <Textarea
                    value={formData.promptTemplate}
                    onChange={(e) => handleChange('promptTemplate', e.target.value)}
                    placeholder="Template com {{variables}}..."
                    rows={3}
                  />
                </div>
              </TabsContent>

              {/* TAB 3: MODEL */}
              <TabsContent value="model" className="space-y-4 p-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Provider</Label>
                    <Select
                      value={formData.modelProvider}
                      onValueChange={(value) => {
                        handleChange('modelProvider', value);
                        handleChange('modelId', '');
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {providers.map((p) => (
                          <SelectItem key={p.id} value={p.slug}>
                            {p.icon_emoji} {p.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Modelo</Label>
                    <Select
                      value={formData.modelId}
                      onValueChange={(value) => handleChange('modelId', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {selectedModels.map((m) => (
                          <SelectItem key={m.id} value={m.model_id}>
                            {m.name} {m.tier && `[${m.tier}]`}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label>Temperatura ({formData.modelTemperature.toFixed(1)})</Label>
                  <input
                    type="range"
                    min="0"
                    max="2"
                    step="0.1"
                    value={formData.modelTemperature}
                    onChange={(e) => handleChange('modelTemperature', parseFloat(e.target.value))}
                    className="w-full"
                  />
                  <p className="mt-1 text-xs text-muted-foreground">
                    0 = determinístico, 2 = aleatório
                  </p>
                </div>

                <div>
                  <Label>Max Tokens ({formData.modelMaxTokens})</Label>
                  <input
                    type="range"
                    min="1"
                    max="4000"
                    step="100"
                    value={formData.modelMaxTokens}
                    onChange={(e) => handleChange('modelMaxTokens', parseInt(e.target.value))}
                    className="w-full"
                  />
                </div>
              </TabsContent>

              {/* TAB 4: ADVANCED */}
              <TabsContent value="advanced" className="space-y-4 p-6">
                <div>
                  <Label>Requisitos (um por linha)</Label>
                  <Textarea
                    value={formData.requirements}
                    onChange={(e) => handleChange('requirements', e.target.value)}
                    placeholder="Requisito 1&#10;Requisito 2..."
                    rows={3}
                  />
                </div>

                <div>
                  <Label>Output Schema (JSON)</Label>
                  <Textarea
                    value={formData.outputSchema}
                    onChange={(e) => handleChange('outputSchema', e.target.value)}
                    placeholder='{"type": "object"}'
                    rows={5}
                    className={`font-mono text-sm ${fieldErrors.outputSchema ? 'border-destructive' : ''}`}
                    aria-invalid={!!fieldErrors.outputSchema}
                  />
                  {fieldErrors.outputSchema && (
                    <p className="mt-1 text-xs text-destructive">{fieldErrors.outputSchema}</p>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </div>

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
        </div>
      </SheetContent>
    </Sheet>
  );
};
