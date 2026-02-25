'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
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
import { Loader2, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { AgentSupabaseService } from '@/services/agents/agentSupabaseService';
import { AgentTypesService } from '@/services/agents/agentTypesService';
import { LmModelsService } from '@/services/agents/lmModelsService';
import type { CreateAgentRequest, AgentType, LmProvider, LmModel } from '@/types/agents';

interface CreateAgentDialogProps {
  providers?: LmProvider[];
  onSuccess?: () => void;
  isLoading?: boolean;
}

export function CreateAgentDialog({
  providers: initialProviders = [],
  onSuccess,
  isLoading: externalLoading = false,
}: CreateAgentDialogProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('basic');
  const [agentTypes, setAgentTypes] = useState<AgentType[]>([]);
  const [modelsByProvider, setModelsByProvider] = useState<Record<string, LmModel[]>>({});

  const providers = initialProviders.filter((p) => p.is_active);
  const defaultProvider = providers[0];
  const defaultProviderSlug = defaultProvider?.slug ?? 'openai';

  const [formData, setFormData] = useState<
    CreateAgentRequest & {
      persona?: string;
      prompt_objective?: string;
    }
  >({
    name: '',
    slug: '',
    description: '',
    agent_type: 'custom',
    agent_type_id: undefined,
    model_provider: defaultProviderSlug,
    model_id: 'gpt-4',
    model_temperature: 0.7,
    model_max_tokens: 2000,
    persona: '',
    prompt_objective: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Load agent types on mount
  useEffect(() => {
    if (open) {
      AgentTypesService.listAgentTypes()
        .then(setAgentTypes)
        .catch((error) => {
          console.error('Failed to load agent types:', error);
          toast.error('❌ Erro ao carregar tipos de agentes');
        });
    }
  }, [open]);

  // Load models for a provider
  const loadModelsForProvider = useCallback(async (providerId: string) => {
    if (modelsByProvider[providerId]) return;
    try {
      const models = await LmModelsService.listModels(providerId);
      setModelsByProvider((prev) => ({ ...prev, [providerId]: models }));
    } catch {
      toast.error('❌ Erro ao carregar modelos');
    }
  }, [modelsByProvider]);

  // Preload models for selected provider when dialog opens
  useEffect(() => {
    const providerSlug = formData.model_provider;
    if (open && providerSlug && providers.length > 0) {
      const provider = providers.find((p) => p.slug === providerSlug);
      if (provider) void loadModelsForProvider(provider.id);
    }
  }, [open, formData.model_provider, providers, loadModelsForProvider]);

  // When models load for current provider, set default model_id if current one is invalid
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

  // Validate form
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name?.trim()) newErrors.name = 'Nome é obrigatório';
    if (!formData.slug?.trim()) newErrors.slug = 'Slug é obrigatório';
    if ((formData.model_temperature ?? 0) < 0 || (formData.model_temperature ?? 0) > 2)
      newErrors.model_temperature = 'Temperatura deve estar entre 0 e 2';
    if ((formData.model_max_tokens ?? 0) < 1 || (formData.model_max_tokens ?? 0) > 4000)
      newErrors.model_max_tokens = 'Max tokens deve estar entre 1 e 4000';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error('❌ Formulário inválido');
      return;
    }

    setIsLoading(true);
    try {
      await AgentSupabaseService.createAgent(formData);
      toast.success(`✅ Agente "${formData.name}" criado com sucesso!`);
      setOpen(false);
      setFormData({
        name: '',
        slug: '',
        description: '',
        agent_type: 'custom',
        agent_type_id: undefined,
        model_provider: defaultProviderSlug,
        model_id: 'gpt-4',
        model_temperature: 0.7,
        model_max_tokens: 2000,
        persona: '',
        prompt_objective: '',
      });
      router.refresh();
      onSuccess?.();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro desconhecido';
      toast.error(`❌ Erro: ${message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Auto-generate slug from name
  const handleNameChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      name: value,
      slug: value
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, ''),
    }));
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Button onClick={() => setOpen(true)} className="gap-2">
        <Plus className="h-4 w-4" />
        Novo Agente
      </Button>

      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>✨ Criar Novo Agente AI</DialogTitle>
          <DialogDescription>
            Preencha os detalhes do agente. Todos os campos podem ser editados depois.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Tabs for Organization */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="w-full">
              <TabsTrigger value="basic" className="flex-1">
                Básico
              </TabsTrigger>
              <TabsTrigger value="llm" className="flex-1">
                Modelo
              </TabsTrigger>
              <TabsTrigger value="persona" className="flex-1">
                Persona
              </TabsTrigger>
            </TabsList>

            {/* TAB 1: Basic Info */}
            <TabsContent value="basic" className="space-y-4 mt-4">
              <div>
                <Label htmlFor="name">Nome do Agente *</Label>
                <Input
                  id="name"
                  placeholder="ex: Status Report Bot"
                  value={formData.name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  disabled={isLoading || externalLoading}
                  className={errors.name ? 'border-red-500' : ''}
                />
                {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
              </div>

              <div>
                <Label htmlFor="slug">Slug *</Label>
                <Input
                  id="slug"
                  placeholder="auto-gerado"
                  value={formData.slug}
                  onChange={(e) => setFormData((prev) => ({ ...prev, slug: e.target.value }))}
                  disabled={isLoading || externalLoading}
                  className={errors.slug ? 'border-red-500' : ''}
                />
                {errors.slug && <p className="text-xs text-red-500 mt-1">{errors.slug}</p>}
              </div>

              <div>
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  placeholder="Descrição detalhada do que o agente faz..."
                  value={formData.description || ''}
                  onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                  disabled={isLoading || externalLoading}
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="agent-type">Tipo de Agente</Label>
                <Select
                  value={formData.agent_type_id || 'no-type'}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, agent_type_id: value === 'no-type' ? undefined : value }))
                  }
                  disabled={isLoading || externalLoading}
                >
                  <SelectTrigger id="agent-type">
                    <SelectValue placeholder="Selecionar tipo..." />
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
            </TabsContent>

            {/* TAB 2: LLM Configuration (provedores e modelos do banco) */}
            <TabsContent value="llm" className="space-y-4 mt-4">
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
                    disabled={isLoading || externalLoading}
                  >
                    <SelectTrigger id="provider">
                      <SelectValue placeholder="Selecionar provedor..." />
                    </SelectTrigger>
                    <SelectContent>
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
                    disabled={isLoading || externalLoading}
                  >
                    <SelectTrigger id="model-id">
                      <SelectValue placeholder="Selecionar modelo..." />
                    </SelectTrigger>
                    <SelectContent>
                      {(() => {
                        const provider = providers.find(
                          (p) => p.slug === (formData.model_provider || 'openai'),
                        );
                        const models = provider ? modelsByProvider[provider.id] ?? [] : [];
                        if (models.length === 0 && provider) {
                          void loadModelsForProvider(provider.id);
                        }
                        return models.map((m) => (
                          <SelectItem key={m.id} value={m.model_id}>
                            {m.name} ({m.model_id})
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
                    (Criatividade: 0=determinístico, 2=aleatório)
                  </span>
                </div>
                <input
                  id="temperature"
                  type="range"
                  min="0"
                  max="2"
                  step="0.1"
                  value={formData.model_temperature}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      model_temperature: parseFloat(e.target.value),
                    }))
                  }
                  disabled={isLoading || externalLoading}
                  className="w-full"
                />
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
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      model_max_tokens: parseInt(e.target.value),
                    }))
                  }
                  disabled={isLoading || externalLoading}
                  className="w-full"
                />
              </div>
            </TabsContent>

            {/* TAB 3: Persona & Objective */}
            <TabsContent value="persona" className="space-y-4 mt-4">
              <div>
                <Label htmlFor="persona">Persona</Label>
                <Textarea
                  id="persona"
                  placeholder="ex: Você é um especialista em análise de projetos com 10 anos de experiência..."
                  value={formData.persona || ''}
                  onChange={(e) => setFormData((prev) => ({ ...prev, persona: e.target.value }))}
                  disabled={isLoading || externalLoading}
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
                  disabled={isLoading || externalLoading}
                  rows={3}
                />
              </div>
            </TabsContent>
          </Tabs>

          {/* Actions */}
          <div className="flex gap-3 justify-end pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isLoading || externalLoading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading || externalLoading} className="gap-2">
              {isLoading || externalLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Criando...
                </>
              ) : (
                'Criar Agente'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
