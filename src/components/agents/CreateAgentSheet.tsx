'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { AgentSupabaseService } from '@/services/agents/agentSupabaseService';
import { AgentTypesService } from '@/services/agents/agentTypesService';
import { LmModelsService } from '@/services/agents/lmModelsService';
import type { CreateAgentRequest, AgentType, LmProvider, LmModel } from '@/types/agents';
import { validateCreateAgentOrSquad360 } from '@/lib/validation/epic16-agentes-skills';

const SELECT_IN_SHEET_Z = 'z-[100]';

export interface CreateAgentSheetProps {
  providers?: LmProvider[];
  onSuccess?: () => void;
  isLoading?: boolean;
}

export const CreateAgentSheet: React.FC<CreateAgentSheetProps> = ({
  providers: initialProviders = [],
  onSuccess,
  isLoading: externalLoading = false,
}) => {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('basic');
  const [agentTypes, setAgentTypes] = useState<AgentType[]>([]);
  const [modelsByProvider, setModelsByProvider] = useState<Record<string, LmModel[]>>({});

  const providers = initialProviders.filter((p) => p.is_active);
  const defaultProvider = providers[0];
  const defaultProviderSlug = defaultProvider?.slug ?? 'openai';

  const buildInitialForm = useCallback((): CreateAgentRequest & { prompt_instructions?: string[] } => {
    return {
      name: '',
      slug: '',
      entity_kind: 'agent',
      description: '',
      agent_type: 'custom',
      agent_type_id: undefined,
      model_provider: defaultProviderSlug,
      model_id: 'gpt-4',
      model_temperature: 0.7,
      model_max_tokens: 2000,
      persona: '',
      prompt_objective: '',
      prompt_instructions: [],
      prompt_template: '',
      tags: [],
      usage_type: 'chatbot',
      show_in_shortcut: false,
      is_global_chatbot: false,
      requirements: [],
      output_schema: undefined,
    };
  }, [defaultProviderSlug]);

  const [formData, setFormData] = useState(buildInitialForm);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (open) {
      setFormData(buildInitialForm());
      setErrors({});
      setActiveTab('basic');
    }
  }, [open, buildInitialForm]);

  useEffect(() => {
    if (open) {
      AgentTypesService.listAgentTypes()
        .then(setAgentTypes)
        .catch(() => {
          toast.error('❌ Erro ao carregar tipos de agentes');
        });
    }
  }, [open]);

  const loadModelsForProvider = useCallback(
    async (providerId: string) => {
      if (modelsByProvider[providerId]) return;
      try {
        const models = await LmModelsService.listModels(providerId);
        const sortedModels = models.sort(
          (a, b) => (a.display_order ?? 100) - (b.display_order ?? 100),
        );
        setModelsByProvider((prev) => ({ ...prev, [providerId]: sortedModels }));
      } catch {
        toast.error('❌ Erro ao carregar modelos');
      }
    },
    [modelsByProvider],
  );

  useEffect(() => {
    const providerSlug = formData.model_provider;
    if (open && providerSlug && providers.length > 0) {
      const provider = providers.find((p) => p.slug === providerSlug);
      if (provider) void loadModelsForProvider(provider.id);
    }
  }, [open, formData.model_provider, providers, loadModelsForProvider]);

  useEffect(() => {
    const providerSlug = formData.model_provider;
    const provider = providerSlug ? providers.find((p) => p.slug === providerSlug) : undefined;
    if (!provider || !modelsByProvider[provider.id]) return;
    const models = modelsByProvider[provider.id];
    const validIds = models.map((m) => m.model_id);
    const currentModelId = formData.model_id ?? '';
    const firstModelId = models[0]?.model_id ?? 'gpt-4';
    if (validIds.length > 0 && !validIds.includes(currentModelId)) {
      setFormData((prev) => ({ ...prev, model_id: firstModelId }));
    }
  }, [formData.model_provider, formData.model_id, modelsByProvider, providers]);

  const validateForm = (): boolean => {
    const result = validateCreateAgentOrSquad360({
      name: formData.name ?? '',
      slug: formData.slug ?? '',
      entity_kind: formData.entity_kind ?? 'agent',
      model_temperature: formData.model_temperature ?? 0,
      model_max_tokens: formData.model_max_tokens ?? 0,
    });
    setErrors(result.fieldErrors);
    return result.ok;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error('❌ Formulário inválido');
      return;
    }

    setIsLoading(true);
    try {
      await AgentSupabaseService.createAgent(formData);
      toast.success(
        formData.entity_kind === 'squad'
          ? `✅ Squad "${formData.name}" criado! Adicione membros na edição.`
          : `✅ Agente "${formData.name}" criado com sucesso!`,
      );
      setOpen(false);
      router.refresh();
      onSuccess?.();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro desconhecido';
      toast.error(`❌ Erro: ${message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNameChange = (value: string) => {
    setErrors({});
    setFormData((prev) => ({
      ...prev,
      name: value,
      slug: value
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, ''),
    }));
  };

  const busy = isLoading || externalLoading;

  const submitLabel = useMemo(() => {
    if (busy) return 'Criando...';
    if (formData.entity_kind === 'squad') return 'Criar squad';
    return 'Criar agente';
  }, [busy, formData.entity_kind]);

  return (
    <>
      <Button type="button" onClick={() => setOpen(true)} className="gap-2">
        <Plus className="h-4 w-4" />
        Novo agente ou squad
      </Button>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent
          side="right"
          className="flex h-full max-h-screen w-full flex-col gap-0 overflow-hidden p-0 sm:max-w-2xl"
        >
          <SheetHeader className="space-y-1 border-b px-6 py-4 text-left">
            <SheetTitle>Novo agente ou squad</SheetTitle>
            <SheetDescription>
              Agente: executor com modelo e prompt. Squad: agrupa agentes (sem chat de teste). Tudo
              editável depois.
            </SheetDescription>
          </SheetHeader>

          <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
            <ScrollArea className="min-h-0 flex-1">
              <div className="space-y-4 px-6 py-4 pb-8">
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="flex h-auto w-full flex-wrap gap-1">
                    <TabsTrigger value="basic" className="min-w-0 flex-1">
                      Básico
                    </TabsTrigger>
                    <TabsTrigger value="classification" className="min-w-0 flex-1">
                      Classificação
                    </TabsTrigger>
                    <TabsTrigger value="llm" className="min-w-0 flex-1">
                      Modelo
                    </TabsTrigger>
                    <TabsTrigger value="persona" className="min-w-0 flex-1">
                      Persona
                    </TabsTrigger>
                    <TabsTrigger value="advanced" className="min-w-0 flex-1">
                      Avançado
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="basic" className="mt-4 space-y-4 pb-2">
                    <div>
                      <Label htmlFor="create-agent-name">Nome *</Label>
                      <Input
                        id="create-agent-name"
                        placeholder="ex: Status Report Bot"
                        value={formData.name}
                        onChange={(e) => handleNameChange(e.target.value)}
                        disabled={busy}
                        className={errors.name ? 'border-destructive' : ''}
                        aria-invalid={!!errors.name}
                      />
                      {errors.name && <p className="mt-1 text-xs text-destructive">{errors.name}</p>}
                    </div>

                    <div>
                      <Label htmlFor="create-agent-slug">Slug *</Label>
                      <Input
                        id="create-agent-slug"
                        placeholder="auto-gerado a partir do nome"
                        value={formData.slug}
                        onChange={(e) => {
                          setErrors((e0) => {
                            const next = { ...e0 };
                            delete next.slug;
                            return next;
                          });
                          setFormData((prev) => ({ ...prev, slug: e.target.value }));
                        }}
                        disabled={busy}
                        className={errors.slug ? 'border-destructive' : ''}
                        aria-invalid={!!errors.slug}
                      />
                      {errors.slug && <p className="mt-1 text-xs text-destructive">{errors.slug}</p>}
                    </div>

                    <div>
                      <Label htmlFor="create-agent-description">Descrição</Label>
                      <Textarea
                        id="create-agent-description"
                        placeholder="Descrição detalhada do que o agente faz..."
                        value={formData.description || ''}
                        onChange={(e) =>
                          setFormData((prev) => ({ ...prev, description: e.target.value }))
                        }
                        disabled={busy}
                        rows={3}
                      />
                    </div>

                    <div>
                      <Label htmlFor="entity-kind">Tipo de registro</Label>
                      <Select
                        value={formData.entity_kind ?? 'agent'}
                        onValueChange={(value) =>
                          setFormData((prev) => ({
                            ...prev,
                            entity_kind: value as 'agent' | 'squad',
                            usage_type: value === 'squad' ? 'workflow' : prev.usage_type,
                            show_in_shortcut: value === 'squad' ? false : prev.show_in_shortcut,
                            is_global_chatbot: value === 'squad' ? false : prev.is_global_chatbot,
                          }))
                        }
                        disabled={busy}
                      >
                        <SelectTrigger id="entity-kind">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className={SELECT_IN_SHEET_Z} position="popper" sideOffset={4}>
                          <SelectItem value="agent">Agente (executor)</SelectItem>
                          <SelectItem value="squad">Squad (equipe de agentes)</SelectItem>
                        </SelectContent>
                      </Select>
                      <p className="mt-1 text-xs text-muted-foreground">
                        Squads agrupam agentes na edição; não aparecem para chat de teste.
                      </p>
                    </div>

                    <div>
                      <Label htmlFor="agent-type">Tipo de Agente</Label>
                      <Select
                        value={formData.agent_type_id || 'no-type'}
                        onValueChange={(value) =>
                          setFormData((prev) => ({
                            ...prev,
                            agent_type_id: value === 'no-type' ? undefined : value,
                          }))
                        }
                        disabled={busy}
                      >
                        <SelectTrigger id="agent-type">
                          <SelectValue placeholder="Selecionar tipo..." />
                        </SelectTrigger>
                        <SelectContent className={SELECT_IN_SHEET_Z} position="popper" sideOffset={4}>
                          <SelectItem value="no-type">Sem tipo (Custom)</SelectItem>
                          {agentTypes.map((type) => (
                            <SelectItem key={type.id} value={type.id}>
                              {type.icon_emoji} {type.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="tags">Tags (separadas por vírgula)</Label>
                      <Input
                        id="tags"
                        placeholder="ex: projetos, relatorios, status"
                        value={(formData.tags ?? []).join(', ')}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            tags: e.target.value
                              .split(',')
                              .map((t) => t.trim())
                              .filter(Boolean),
                          }))
                        }
                        disabled={busy}
                      />
                    </div>
                  </TabsContent>

                  <TabsContent value="classification" className="mt-4 space-y-4 pb-2">
                    <div>
                      <Label htmlFor="usage-type">Tipo de Uso</Label>
                      <Select
                        value={formData.usage_type || 'chatbot'}
                        onValueChange={(value: 'chatbot' | 'workflow') =>
                          setFormData((prev) => ({
                            ...prev,
                            usage_type: value,
                            ...(value === 'workflow' && {
                              show_in_shortcut: false,
                              is_global_chatbot: false,
                            }),
                          }))
                        }
                        disabled={busy || formData.entity_kind === 'squad'}
                      >
                        <SelectTrigger id="usage-type">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className={SELECT_IN_SHEET_Z} position="popper" sideOffset={4}>
                          <SelectItem value="chatbot">Chatbot (conversacional)</SelectItem>
                          <SelectItem value="workflow">Workflow (automação)</SelectItem>
                        </SelectContent>
                      </Select>
                      {formData.entity_kind === 'squad' && (
                        <p className="mt-1 text-xs text-muted-foreground">
                          Squad usa apenas workflow neste produto.
                        </p>
                      )}
                    </div>
                    {formData.usage_type === 'chatbot' && formData.entity_kind === 'agent' && (
                      <div className="bg-muted/30 space-y-3 rounded-lg border p-4">
                        <div className="flex items-center justify-between">
                          <Label htmlFor="show-in-shortcut">Exibir no seletor de chatbot</Label>
                          <Switch
                            id="show-in-shortcut"
                            checked={formData.show_in_shortcut ?? false}
                            onCheckedChange={(checked) =>
                              setFormData((prev) => ({ ...prev, show_in_shortcut: checked }))
                            }
                            disabled={busy}
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <Label htmlFor="is-global-chatbot">Chatbot global (flutuante)</Label>
                          <Switch
                            id="is-global-chatbot"
                            checked={formData.is_global_chatbot ?? false}
                            onCheckedChange={(checked) =>
                              setFormData((prev) => ({ ...prev, is_global_chatbot: checked }))
                            }
                            disabled={busy}
                          />
                        </div>
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="llm" className="mt-4 space-y-4 pb-2">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="provider">Provedor *</Label>
                        <Select
                          value={formData.model_provider || 'openai'}
                          onValueChange={(value) => {
                            const provider = providers.find((p) => p.slug === value);
                            if (provider) {
                              void loadModelsForProvider(provider.id);
                              setFormData((prev) => ({
                                ...prev,
                                model_provider: value,
                                model_id: modelsByProvider[provider.id]?.[0]?.model_id ?? 'gpt-4',
                              }));
                            }
                          }}
                          disabled={busy}
                        >
                          <SelectTrigger id="provider">
                            <SelectValue placeholder="Selecionar provedor..." />
                          </SelectTrigger>
                          <SelectContent className={SELECT_IN_SHEET_Z} position="popper" sideOffset={4}>
                            {providers.map((p) => (
                              <SelectItem key={p.id} value={p.slug}>
                                {p.icon_emoji} {p.name}
                              </SelectItem>
                            ))}
                            {providers.length === 0 && (
                              <SelectItem value="openai">OpenAI (padrão)</SelectItem>
                            )}
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor="model-id">Modelo *</Label>
                        <Select
                          value={formData.model_id}
                          onValueChange={(value) =>
                            setFormData((prev) => ({ ...prev, model_id: value }))
                          }
                          disabled={busy}
                        >
                          <SelectTrigger id="model-id">
                            <SelectValue placeholder="Selecionar modelo..." />
                          </SelectTrigger>
                          <SelectContent className={SELECT_IN_SHEET_Z} position="popper" sideOffset={4}>
                            {(() => {
                              const provider = providers.find(
                                (p) => p.slug === (formData.model_provider || 'openai'),
                              );
                              const models = provider ? (modelsByProvider[provider.id] ?? []) : [];
                              if (models.length === 0 && provider) {
                                void loadModelsForProvider(provider.id);
                              }
                              return models.map((m) => (
                                <SelectItem key={m.id} value={m.model_id}>
                                  <span className="flex items-center gap-2">
                                    <span>{m.name}</span>
                                    {m.tier && <span className="text-xs opacity-70">[{m.tier}]</span>}
                                  </span>
                                </SelectItem>
                              ));
                            })()}
                            {providers.length === 0 && (
                              <>
                                <SelectItem value="gpt-4">GPT-4</SelectItem>
                                <SelectItem value="gpt-3.5-turbo">GPT-3.5 Turbo</SelectItem>
                              </>
                            )}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between">
                        <Label htmlFor="temperature">Temperatura: {formData.model_temperature}</Label>
                        <span className="text-xs text-muted-foreground">
                          (0 = determinístico, 2 = aleatório)
                        </span>
                      </div>
                      <input
                        id="temperature"
                        type="range"
                        min="0"
                        max="2"
                        step="0.1"
                        value={formData.model_temperature}
                        onChange={(e) => {
                          setErrors((e0) => {
                            const next = { ...e0 };
                            delete next.model_temperature;
                            return next;
                          });
                          setFormData((prev) => ({
                            ...prev,
                            model_temperature: parseFloat(e.target.value),
                          }));
                        }}
                        disabled={busy}
                        className="w-full"
                      />
                      {errors.model_temperature && (
                        <p className="mt-1 text-xs text-destructive">{errors.model_temperature}</p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="max-tokens">Max Tokens: {formData.model_max_tokens}</Label>
                      <input
                        id="max-tokens"
                        type="range"
                        min="1"
                        max="4000"
                        step="100"
                        value={formData.model_max_tokens}
                        onChange={(e) => {
                          setErrors((e0) => {
                            const next = { ...e0 };
                            delete next.model_max_tokens;
                            return next;
                          });
                          setFormData((prev) => ({
                            ...prev,
                            model_max_tokens: parseInt(e.target.value, 10),
                          }));
                        }}
                        disabled={busy}
                        className="w-full"
                      />
                      {errors.model_max_tokens && (
                        <p className="mt-1 text-xs text-destructive">{errors.model_max_tokens}</p>
                      )}
                    </div>
                  </TabsContent>

                  <TabsContent value="persona" className="mt-4 space-y-4 pb-2">
                    <div>
                      <Label htmlFor="persona">Persona</Label>
                      <Textarea
                        id="persona"
                        placeholder="ex: Você é um especialista em análise de projetos..."
                        value={formData.persona || ''}
                        onChange={(e) =>
                          setFormData((prev) => ({ ...prev, persona: e.target.value }))
                        }
                        disabled={busy}
                        rows={3}
                      />
                    </div>

                    <div>
                      <Label htmlFor="objective">Objetivo</Label>
                      <Textarea
                        id="objective"
                        placeholder="ex: Analisar status de projetos e gerar relatórios executivos..."
                        value={formData.prompt_objective || ''}
                        onChange={(e) =>
                          setFormData((prev) => ({ ...prev, prompt_objective: e.target.value }))
                        }
                        disabled={busy}
                        rows={3}
                      />
                    </div>

                    <div>
                      <Label htmlFor="prompt-instructions">Instruções (uma por linha)</Label>
                      <Textarea
                        id="prompt-instructions"
                        placeholder="ex: Sempre responda em português"
                        value={(formData.prompt_instructions ?? []).join('\n')}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            prompt_instructions: e.target.value
                              .split('\n')
                              .map((s) => s.trim())
                              .filter(Boolean),
                          }))
                        }
                        disabled={busy}
                        rows={4}
                      />
                    </div>

                    <div>
                      <Label htmlFor="prompt-template">Template de prompt</Label>
                      <Textarea
                        id="prompt-template"
                        placeholder="ex: Analise o projeto {{project_id}} e retorne o status..."
                        value={formData.prompt_template || ''}
                        onChange={(e) =>
                          setFormData((prev) => ({ ...prev, prompt_template: e.target.value }))
                        }
                        disabled={busy}
                        rows={3}
                      />
                    </div>
                  </TabsContent>

                  <TabsContent value="advanced" className="mt-4 space-y-4 pb-2">
                    <div>
                      <Label htmlFor="requirements">Requisitos (um por linha)</Label>
                      <Textarea
                        id="requirements"
                        placeholder="ex: Deve validar datas antes de processar"
                        value={(formData.requirements ?? []).join('\n')}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            requirements: e.target.value
                              .split('\n')
                              .map((s) => s.trim())
                              .filter(Boolean),
                          }))
                        }
                        disabled={busy}
                        rows={4}
                      />
                    </div>

                    <div>
                      <Label htmlFor="output-schema">Output Schema (JSON)</Label>
                      <Textarea
                        id="output-schema"
                        placeholder='{"type": "object", "properties": {...}}'
                        value={
                          formData.output_schema ? JSON.stringify(formData.output_schema, null, 2) : ''
                        }
                        onChange={(e) => {
                          const val = e.target.value.trim();
                          if (!val) {
                            setFormData((prev) => ({ ...prev, output_schema: undefined }));
                            return;
                          }
                          try {
                            const parsed = JSON.parse(val) as Record<string, unknown>;
                            setFormData((prev) => ({ ...prev, output_schema: parsed }));
                          } catch {
                            // ignore invalid JSON while typing
                          }
                        }}
                        disabled={busy}
                        rows={6}
                        className="font-mono text-sm"
                      />
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
            </ScrollArea>

            <div className="flex shrink-0 justify-end gap-3 border-t bg-card px-6 py-4">
              <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={busy}>
                Cancelar
              </Button>
              <Button type="submit" disabled={busy} className="gap-2">
                {busy ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    {submitLabel}
                  </>
                ) : (
                  submitLabel
                )}
              </Button>
            </div>
          </form>
        </SheetContent>
      </Sheet>
    </>
  );
};

/** @deprecated Use CreateAgentSheet — alias mantido para compatibilidade. */
export const CreateAgentDialog = CreateAgentSheet;
