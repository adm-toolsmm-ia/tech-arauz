'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { DashboardHeader } from '@/components/layout/DashboardHeader';
import { AppSidebar } from '@/components/layout/AppSidebar';
import { AgentConfigEditor } from '@/components/agents/AgentConfigEditor';
import { AgentConfigPreview } from '@/components/agents/AgentConfigPreview';
import { AgentTemplateSelector } from '@/components/agents/AgentTemplateSelector';
import { useAgentTypesList } from '@/services/agents/agentsStore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, Save, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import type { AgentConfig, AgentTemplate, AgentHead } from '@/types/agents';

interface AgentEditContentProps {
  initialAgent: AgentHead;
}

export default function AgentEditContent({ initialAgent }: AgentEditContentProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = React.useState(false);
  const [isDirty, setIsDirty] = React.useState(false);
  const [config, setConfig] = React.useState<AgentConfig>(
    initialAgent.draft || {
      id: initialAgent.id,
      name: initialAgent.name,
      slug: initialAgent.slug,
      status: initialAgent.status,
      owners: initialAgent.owners,
      tags: initialAgent.tags,
      persona: '',
      prompt_objective: '',
      prompt_instructions: [],
      prompt_template: '',
      model: {
        provider: 'openai',
        model_id: 'gpt-4',
        temperature: 0.7,
        max_tokens: 2000,
      },
    }
  );

  const { data: agentTypes = [] } = useAgentTypesList();
  const selectedType = agentTypes.find((t) => t.slug === config.agent_type);

  const handleConfigChange = (updates: Partial<AgentConfig>) => {
    setConfig((prev) => ({ ...prev, ...updates }));
    setIsDirty(true);
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/agents/${initialAgent.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      });

      if (!res.ok) throw new Error('Falha ao salvar');

      toast.success('Agente atualizado com sucesso!');
      setIsDirty(false);
    } catch (error) {
      toast.error('Erro ao salvar agente');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    const confirmDelete = confirm('Tem certeza que deseja deletar este agente?');
    if (!confirmDelete) return;

    setIsLoading(true);
    try {
      const res = await fetch(`/api/agents/${initialAgent.id}`, {
        method: 'DELETE',
      });

      if (!res.ok) throw new Error('Falha ao deletar');

      toast.success('Agente deletado!');
      router.push('/agentes');
    } catch (error) {
      toast.error('Erro ao deletar agente');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTemplateSelect = (template: AgentTemplate) => {
    handleConfigChange({
      persona: template.persona_template || config.persona,
      prompt_objective: template.prompt_objective_template || config.prompt_objective,
      prompt_instructions: template.prompt_instructions_template || config.prompt_instructions,
      output_schema: template.output_schema_template || config.output_schema,
      model: {
        ...config.model,
        provider: (template.model_provider_default || 'openai') as any,
        model_id: template.model_id_default || config.model.model_id,
        temperature: template.model_temperature_default || config.model.temperature,
        max_tokens: template.model_max_tokens_default || config.model.max_tokens,
      },
    });
    toast.success('Template aplicado!');
  };

  return (
    <div className="flex h-screen bg-background">
      <AppSidebar />
      <main className="flex-1 flex flex-col overflow-hidden">
        <DashboardHeader title="Editar Agente" />
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-7xl mx-auto p-6 space-y-6">
            {/* Breadcrumb & Actions */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <button onClick={() => router.back()} className="hover:opacity-70">
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <h1 className="text-3xl font-bold">{config.name}</h1>
                <Badge>{config.status}</Badge>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={handleDelete}
                  variant="destructive"
                  disabled={isLoading}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Deletar
                </Button>
                <Button onClick={handleSave} disabled={isLoading || !isDirty}>
                  <Save className="h-4 w-4 mr-2" />
                  {isLoading ? 'Salvando...' : 'Salvar Alterações'}
                </Button>
              </div>
            </div>

            {/* Main Tabs */}
            <Tabs defaultValue="edit" className="w-full">
              <TabsList>
                <TabsTrigger value="edit">Editar</TabsTrigger>
                <TabsTrigger value="template">Templates</TabsTrigger>
                <TabsTrigger value="preview">Pré-visualização</TabsTrigger>
              </TabsList>

              {/* EDIT TAB */}
              <TabsContent value="edit" className="space-y-4 mt-4">
                {selectedType && (
                  <Card className="bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
                    <CardHeader>
                      <CardTitle className="text-base">Tipo de Agente: {selectedType.name}</CardTitle>
                      <CardDescription>
                        Campos obrigatórios: {selectedType.required_fields?.join(', ')}
                      </CardDescription>
                    </CardHeader>
                  </Card>
                )}
                <AgentConfigEditor config={config} onChange={handleConfigChange} disabled={isLoading} />
              </TabsContent>

              {/* TEMPLATE TAB */}
              <TabsContent value="template" className="space-y-4 mt-4">
                {config.agent_type_id ? (
                  <AgentTemplateSelector
                    agentTypeId={config.agent_type_id}
                    onSelect={handleTemplateSelect}
                    disabled={isLoading}
                  />
                ) : (
                  <Card className="p-4 bg-muted/50">
                    <p className="text-sm text-muted-foreground">
                      Selecione um tipo de agente na aba &quot;Editar&quot; para visualizar templates
                    </p>
                  </Card>
                )}
              </TabsContent>

              {/* PREVIEW TAB */}
              <TabsContent value="preview" className="mt-4">
                <AgentConfigPreview config={config} />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>
    </div>
  );
}
