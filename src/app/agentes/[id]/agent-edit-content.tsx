'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardHeader } from '@/components/layout/DashboardHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { ChevronLeft, Save, Trash2, AlertTriangle, MessageCircle } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import { AgentSupabaseService } from '@/services/agents/agentSupabaseService';
import { AgentTypesService } from '@/services/agents/agentTypesService';
import { LmModelsService } from '@/services/agents/lmModelsService';
import { AgentMetrics360 } from '@/components/agents/AgentMetrics360';
import { ChatContent } from './chat/chat-content';
import type { AgentType, LmModel, LmProvider } from '@/types/agents';
import type { UIAgent } from '@/lib/transformers/agent';

interface AgentEditContentProps {
  initialAgent: UIAgent;
  providers?: LmProvider[];
}

export function AgentEditContent({
  initialAgent,
  providers = [],
}: AgentEditContentProps) {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [activeTab, setActiveTab] = useState('basic');
  const [agentTypes, setAgentTypes] = useState<AgentType[]>([]);
  const [modelsByProvider, setModelsByProvider] = useState<Record<string, LmModel[]>>({});

  const [agent, setAgent] = useState({
    name: initialAgent.name,
    slug: initialAgent.slug,
    description: initialAgent.description,
    status: initialAgent.status,
    owners: initialAgent.owners,
    tags: initialAgent.tags,
    agentTypeId: initialAgent.agentTypeId || '',
    // Story 7.8: New classification fields
    usageType: initialAgent.usageType || 'chatbot',
    showInShortcut: initialAgent.showInShortcut || false,
    isGlobalChatbot: initialAgent.isGlobalChatbot || false,
    // Persona & prompt
    persona: initialAgent.fullConfig.persona || '',
    promptObjective: initialAgent.fullConfig.promptObjective || '',
    promptInstructions: initialAgent.fullConfig.promptInstructions || '',
    promptTemplate: initialAgent.fullConfig.promptTemplate || '',
    // Model config
    modelProvider: initialAgent.fullConfig.modelProvider,
    modelId: initialAgent.modelId,
    modelTemperature: initialAgent.fullConfig.modelTemperature,
    modelMaxTokens: initialAgent.fullConfig.modelMaxTokens,
    requirements: (initialAgent.fullConfig.requirements || []).join('\n'),
    outputSchema: JSON.stringify(initialAgent.fullConfig.outputSchema || {}, null, 2),
  });

  // Load agent types
  React.useEffect(() => {
    AgentTypesService.listAgentTypes()
      .then(setAgentTypes)
      .catch(() => {
        toast.error('Erro ao carregar tipos de agentes');
      });
  }, []);

  // Load models for selected provider
  const loadModelsForProvider = React.useCallback(
    async (providerId: string) => {
      if (modelsByProvider[providerId]) return;
      try {
        const models = await LmModelsService.listModels(providerId);
        const sorted = models.sort(
          (a, b) => (a.display_order ?? 100) - (b.display_order ?? 100),
        );
        setModelsByProvider((prev) => ({ ...prev, [providerId]: sorted }));
      } catch {
        toast.error('Erro ao carregar modelos');
      }
    },
    [modelsByProvider],
  );

  // Load models when provider changes
  React.useEffect(() => {
    const provider = providers.find((p) => p.slug === agent.modelProvider);
    if (provider) {
      void loadModelsForProvider(provider.id);
    }
  }, [agent.modelProvider, providers, loadModelsForProvider]);

  const handleChange = (field: string, value: unknown) => {
    setAgent((prev) => ({ ...prev, [field]: value }));
    setIsDirty(true);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const selectedType = agentTypes.find((t) => t.id === agent.agentTypeId);
      const updates = {
        name: agent.name,
        slug: agent.slug,
        description: agent.description,
        status: agent.status,
        owners: agent.owners,
        tags: agent.tags,
        agent_type_id: agent.agentTypeId || undefined,
        agent_type: selectedType?.slug || 'custom',
        // Story 7.8: Classification fields
        usage_type: agent.usageType,
        show_in_shortcut: agent.usageType === 'chatbot' && agent.showInShortcut,
        is_global_chatbot: agent.usageType === 'chatbot' && agent.isGlobalChatbot,
        // Persona & prompt
        persona: agent.persona,
        prompt_objective: agent.promptObjective,
        prompt_instructions: Array.isArray(agent.promptInstructions)
          ? JSON.stringify(agent.promptInstructions)
          : (agent.promptInstructions ?? ''),
        prompt_template: agent.promptTemplate,
        // Model config
        model_provider: agent.modelProvider,
        model_id: agent.modelId,
        model_temperature: agent.modelTemperature,
        model_max_tokens: agent.modelMaxTokens,
        requirements: agent.requirements.split('\n').filter(Boolean),
        output_schema: JSON.parse(agent.outputSchema || '{}'),
      };

      await AgentSupabaseService.updateAgent(
        initialAgent.id,
        updates as unknown as Parameters<typeof AgentSupabaseService.updateAgent>[1],
      );
      toast.success('✅ Agente atualizado com sucesso!');
      setIsDirty(false);
      router.refresh();
    } catch (error) {
      toast.error(`❌ Erro ao salvar: ${error instanceof Error ? error.message : 'desconhecido'}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (
      !confirm(
        `Tem certeza que deseja deletar "${initialAgent.name}"?\n\nEsta ação não pode ser desfeita!`,
      )
    ) {
      return;
    }

    setIsDeleting(true);
    try {
      await AgentSupabaseService.deleteAgent(initialAgent.id);
      toast.success('✅ Agente deletado!');
      router.push('/agentes');
    } catch (error) {
      toast.error(`❌ Erro ao deletar: ${error instanceof Error ? error.message : 'desconhecido'}`);
    } finally {
      setIsDeleting(false);
    }
  };

  const statusColor = {
    draft: 'bg-yellow-100 text-yellow-800',
    published: 'bg-green-100 text-green-800',
    deprecated: 'bg-red-100 text-red-800',
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => router.back()} className="gap-2">
            <ChevronLeft className="h-4 w-4" />
            Voltar
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{agent.name}</h1>
            <Badge
              className={`mt-2 text-xs ${statusColor[agent.status as keyof typeof statusColor]}`}
            >
              {agent.status === 'draft' && '📝 Rascunho'}
              {agent.status === 'published' && '✅ Publicado'}
              {agent.status === 'deprecated' && '⛔ Deprecado'}
            </Badge>
          </div>
        </div>
        <div className="flex gap-2">
          {initialAgent.status === 'published' && agent.usageType === 'chatbot' && (
            <Link href={`/agentes/${initialAgent.id}/chat`}>
              <Button variant="default" size="sm" className="gap-2">
                <MessageCircle className="h-4 w-4" />
                Testar Chat
              </Button>
            </Link>
          )}
          <Button
            variant="destructive"
            size="sm"
            onClick={handleDelete}
            disabled={isSaving || isDeleting}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Deletar
          </Button>
          <Button size="sm" onClick={handleSave} disabled={!isDirty || isSaving} className="gap-2">
            <Save className="h-4 w-4" />
            {isSaving ? 'Salvando...' : 'Salvar'}
          </Button>
        </div>
      </div>

      {/* Dirty State Alert */}
      {isDirty && (
        <Card className="border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-950">
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-yellow-600" />
              <p className="text-sm text-yellow-800 dark:text-yellow-200">
                Você tem alterações não salvas. Clique em &quot;Salvar&quot; para persistir as
                mudanças.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="basic">Básico</TabsTrigger>
          <TabsTrigger value="persona">Persona</TabsTrigger>
          <TabsTrigger value="model">Modelo</TabsTrigger>
          <TabsTrigger value="advanced">Avançado</TabsTrigger>
          <TabsTrigger value="ferramentas">Ferramentas</TabsTrigger>
          <TabsTrigger value="deployments">Deployments</TabsTrigger>
          <TabsTrigger value="chat">Chat</TabsTrigger>
        </TabsList>

        {/* TAB 1: BASIC */}
        <TabsContent value="basic" className="mt-4 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Informações Básicas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Nome</Label>
                  <Input
                    value={agent.name}
                    onChange={(e) => handleChange('name', e.target.value)}
                  />
                </div>
                <div>
                  <Label>Slug</Label>
                  <Input
                    value={agent.slug}
                    onChange={(e) => handleChange('slug', e.target.value)}
                  />
                </div>
              </div>

              <div>
                <Label>Descrição</Label>
                <Textarea
                  value={agent.description}
                  onChange={(e) => handleChange('description', e.target.value)}
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label>Status</Label>
                  <Select
                    value={agent.status}
                    onValueChange={(value) => handleChange('status', value)}
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
                  <Label>Tipo</Label>
                  <Select
                    value={agent.agentTypeId}
                    onValueChange={(value) => handleChange('agentTypeId', value || null)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecionar..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Sem tipo (Custom)</SelectItem>
                      {agentTypes.map((type) => (
                        <SelectItem key={type.id} value={type.id}>
                          {type.icon_emoji} {type.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {/* Story 7.8: Usage Type */}
                <div>
                  <Label>Tipo de Uso</Label>
                  <Select
                    value={agent.usageType}
                    onValueChange={(value) => {
                      handleChange('usageType', value);
                      // Reset conditonal fields when switching to workflow
                      if (value === 'workflow') {
                        handleChange('showInShortcut', false);
                        handleChange('isGlobalChatbot', false);
                      }
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="chatbot">🗨️ Chatbot</SelectItem>
                      <SelectItem value="workflow">⚙️ Workflow</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Story 7.8: Conditional Fields - Only show for chatbots */}
              {agent.usageType === 'chatbot' && (
                <div className="space-y-3 rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-950">
                  <div className="flex items-center justify-between">
                    <Label className="cursor-pointer">Exibir no atalho global</Label>
                    <Switch
                      checked={agent.showInShortcut}
                      onCheckedChange={(value) => handleChange('showInShortcut', value)}
                    />
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    Quando ativado, este agente aparecerá na lista de atalhos do chatbot flutuante.
                  </p>

                  <div className="mt-3 flex items-center justify-between pt-3">
                    <Label className="cursor-pointer">Chatbot Global</Label>
                    <Switch
                      checked={agent.isGlobalChatbot}
                      onCheckedChange={(value) => handleChange('isGlobalChatbot', value)}
                    />
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    Apenas um agente por tenant pode ser o chatbot global (flutuante). Ativar aqui o desativa em outros agentes.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB 2: PERSONA */}
        <TabsContent value="persona" className="mt-4 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Persona & Prompt</CardTitle>
              <CardDescription>Configure como o agente deve agir</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Persona</Label>
                <Textarea
                  value={agent.persona}
                  onChange={(e) => handleChange('persona', e.target.value)}
                  placeholder="Descreva a personalidade do agente..."
                  rows={2}
                />
              </div>

              <div>
                <Label>Objetivo</Label>
                <Textarea
                  value={agent.promptObjective}
                  onChange={(e) => handleChange('promptObjective', e.target.value)}
                  placeholder="O que o agente deve fazer..."
                  rows={2}
                />
              </div>

              <div>
                <Label>Instruções</Label>
                <Textarea
                  value={agent.promptInstructions}
                  onChange={(e) => handleChange('promptInstructions', e.target.value)}
                  placeholder="Instruções detalhadas..."
                  rows={3}
                />
              </div>

              <div>
                <Label>Template de Prompt</Label>
                <Textarea
                  value={agent.promptTemplate}
                  onChange={(e) => handleChange('promptTemplate', e.target.value)}
                  placeholder="Template com {{variables}}..."
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB 3: MODEL */}
        <TabsContent value="model" className="mt-4 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Configuração do Modelo LLM</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Provider</Label>
                  <Select
                    value={agent.modelProvider}
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
                  <Label>Model ID</Label>
                  <Select
                    value={agent.modelId}
                    onValueChange={(value) => handleChange('modelId', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {(() => {
                        const provider = providers.find(
                          (p) => p.slug === agent.modelProvider,
                        );
                        const models = provider ? (modelsByProvider[provider.id] ?? []) : [];
                        return models.map((m) => (
                          <SelectItem key={m.id} value={m.model_id}>
                            {m.name} {m.tier ? `[${m.tier}]` : ''}
                          </SelectItem>
                        ));
                      })()}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Temperatura ({agent.modelTemperature})</Label>
                  <input
                    type="range"
                    min="0"
                    max="2"
                    step="0.1"
                    value={agent.modelTemperature}
                    onChange={(e) => handleChange('modelTemperature', parseFloat(e.target.value))}
                    className="w-full"
                  />
                </div>
                <div>
                  <Label>Max Tokens</Label>
                  <Input
                    type="number"
                    value={agent.modelMaxTokens}
                    onChange={(e) => handleChange('modelMaxTokens', parseInt(e.target.value, 10))}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB 4: ADVANCED */}
        <TabsContent value="advanced" className="mt-4 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Configuração Avançada</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Requisitos (um por linha)</Label>
                <Textarea
                  value={agent.requirements}
                  onChange={(e) => handleChange('requirements', e.target.value)}
                  placeholder="Requisito 1&#10;Requisito 2..."
                  rows={3}
                />
              </div>

              <div>
                <Label>Output Schema (JSON)</Label>
                <Textarea
                  value={agent.outputSchema}
                  onChange={(e) => handleChange('outputSchema', e.target.value)}
                  placeholder='{"type": "object", "properties": {...}}'
                  rows={4}
                  className="font-mono text-sm"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="is_template"
                  checked={initialAgent.isTemplate}
                  disabled
                />
                <Label htmlFor="is_template" className="text-sm">
                  Este agente é um template reutilizável
                </Label>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB 5: FERRAMENTAS */}
        <TabsContent value="ferramentas" className="mt-4 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Ferramentas Vinculadas</CardTitle>
              <p className="text-sm text-muted-foreground">
                {initialAgent.id}
              </p>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-muted-foreground">
                <p>Ferramentas vinculadas ao agente serão exibidas aqui.</p>
                <p className="mt-2 text-xs">
                  Nota: Lista completa de ferramentas será carregada do backend quando disponível.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB 6: DEPLOYMENTS */}
        <TabsContent value="deployments" className="mt-4 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Histórico de Deployments</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-muted-foreground">
                <p>Histórico de deployments será exibido aqui.</p>
                <p className="mt-2 text-xs">
                  Nota: Informações de deployment serão carregadas do backend quando disponível.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB 7: CHAT */}
        {agent.status === 'published' && (
          <TabsContent value="chat" className="mt-4 space-y-4">
            <Card className="h-[600px] flex flex-col">
              <CardHeader>
                <CardTitle>Testar Chat</CardTitle>
                <CardDescription>Converse com o agente para testá-lo em tempo real</CardDescription>
              </CardHeader>
              <CardContent className="flex-1 overflow-hidden">
                <ChatContent agentId={initialAgent.id} />
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>

      {/* Dashboard 360° */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Dashboard 360° de Métricas</h3>
        <AgentMetrics360 agentId={initialAgent.id} />
      </div>

      {/* Delete Dialog - Handled via confirm() */}
    </div>
  );
}
