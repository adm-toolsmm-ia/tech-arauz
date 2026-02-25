'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';
import type { AgentConfig, ModelConfig } from '@/types/agents';

interface AgentConfigEditorProps {
  config: AgentConfig;
  onChange: (config: Partial<AgentConfig>) => void;
  disabled?: boolean;
}

export function AgentConfigEditor({ config, onChange, disabled }: AgentConfigEditorProps) {
  const [newTag, setNewTag] = React.useState('');
  const [newRequirement, setNewRequirement] = React.useState('');
  const [newInstruction, setNewInstruction] = React.useState('');

  const handleAddTag = () => {
    if (newTag.trim()) {
      const updated = [...(config.tags || []), newTag.trim()];
      onChange({ tags: updated });
      setNewTag('');
    }
  };

  const handleRemoveTag = (tag: string) => {
    onChange({ tags: (config.tags || []).filter((t) => t !== tag) });
  };

  const handleAddRequirement = () => {
    if (newRequirement.trim()) {
      const updated = [...(config.requirements || []), newRequirement.trim()];
      onChange({ requirements: updated });
      setNewRequirement('');
    }
  };

  const handleRemoveRequirement = (req: string) => {
    onChange({ requirements: (config.requirements || []).filter((r) => r !== req) });
  };

  const handleAddInstruction = () => {
    if (newInstruction.trim()) {
      const updated = [...(config.prompt_instructions || []), newInstruction.trim()];
      onChange({ prompt_instructions: updated });
      setNewInstruction('');
    }
  };

  const handleRemoveInstruction = (idx: number) => {
    const updated = config.prompt_instructions.filter((_, i) => i !== idx);
    onChange({ prompt_instructions: updated });
  };

  const handleModelChange = (field: keyof ModelConfig, value: unknown) => {
    onChange({
      model: {
        ...config.model,
        [field]: value,
      },
    });
  };

  return (
    <div className="space-y-4">
      <Tabs defaultValue="basic" className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="basic" className="text-xs sm:text-sm">
            Básico
          </TabsTrigger>
          <TabsTrigger value="persona" className="text-xs sm:text-sm">
            Persona
          </TabsTrigger>
          <TabsTrigger value="requirements" className="text-xs sm:text-sm">
            Requisitos
          </TabsTrigger>
          <TabsTrigger value="model" className="text-xs sm:text-sm">
            Modelo
          </TabsTrigger>
          <TabsTrigger value="output" className="text-xs sm:text-sm">
            Output
          </TabsTrigger>
          <TabsTrigger value="metadata" className="text-xs sm:text-sm">
            Meta
          </TabsTrigger>
        </TabsList>

        {/* TAB 1: BASIC */}
        <TabsContent value="basic" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Informações Básicas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome</Label>
                <Input
                  id="name"
                  value={config.name}
                  onChange={(e) => onChange({ name: e.target.value })}
                  disabled={disabled}
                  placeholder="Nome único do agente"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="slug">Slug</Label>
                <Input
                  id="slug"
                  value={config.slug}
                  onChange={(e) => onChange({ slug: e.target.value })}
                  disabled={disabled}
                  placeholder="identificador-unico"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  value={config.description || ''}
                  onChange={(e) => onChange({ description: e.target.value })}
                  disabled={disabled}
                  placeholder="Descreva o propósito do agente"
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="owners">Proprietários (Email ou ID)</Label>
                <Input
                  id="owners"
                  value={config.owners.join(', ')}
                  onChange={(e) =>
                    onChange({ owners: e.target.value.split(',').map((s) => s.trim()) })
                  }
                  disabled={disabled}
                  placeholder="email@example.com, outro@example.com"
                />
              </div>

              <div className="space-y-3">
                <Label>Tags</Label>
                <div className="flex gap-2">
                  <Input
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    placeholder="Adicionar tag"
                    disabled={disabled}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddTag()}
                  />
                  <Button onClick={handleAddTag} disabled={disabled || !newTag.trim()}>
                    Adicionar
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {config.tags?.map((tag) => (
                    <Badge key={tag} variant="secondary" className="gap-1">
                      {tag}
                      <button
                        onClick={() => handleRemoveTag(tag)}
                        disabled={disabled}
                        className="hover:text-destructive"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB 2: PERSONA & PROMPT */}
        <TabsContent value="persona" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Persona & Prompt</CardTitle>
              <CardDescription>Configure a personalidade e instruções do agente</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="persona">Persona</Label>
                <Textarea
                  id="persona"
                  value={config.persona || ''}
                  onChange={(e) => onChange({ persona: e.target.value })}
                  disabled={disabled}
                  placeholder="Descrição curta da personalidade do agente"
                  rows={2}
                />
                <p className="text-xs text-muted-foreground">
                  Ex: &quot;Você é um assistente especializado em análise de projetos com 10 anos de
                  experiência em TI&quot;
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="objective">Objetivo</Label>
                <Textarea
                  id="objective"
                  value={config.prompt_objective}
                  onChange={(e) => onChange({ prompt_objective: e.target.value })}
                  disabled={disabled}
                  placeholder="O que o agente deve fazer (1-2 frases)"
                  rows={2}
                />
              </div>

              <div className="space-y-3">
                <Label>Instruções</Label>
                <div className="flex gap-2">
                  <Input
                    value={newInstruction}
                    onChange={(e) => setNewInstruction(e.target.value)}
                    placeholder="Adicionar instrução"
                    disabled={disabled}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddInstruction()}
                  />
                  <Button onClick={handleAddInstruction} disabled={disabled || !newInstruction.trim()}>
                    Adicionar
                  </Button>
                </div>
                <div className="space-y-2">
                  {config.prompt_instructions.map((instr, idx) => (
                    <div key={idx} className="flex items-start justify-between gap-2 p-2 bg-muted rounded">
                      <span className="text-sm">{instr}</span>
                      <button
                        onClick={() => handleRemoveInstruction(idx)}
                        disabled={disabled}
                        className="hover:text-destructive"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="template">Template de Prompt</Label>
                <Textarea
                  id="template"
                  value={config.prompt_template}
                  onChange={(e) => onChange({ prompt_template: e.target.value })}
                  disabled={disabled}
                  placeholder="Template com {{variables}} para substituição"
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB 3: REQUIREMENTS */}
        <TabsContent value="requirements" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Requisitos</CardTitle>
              <CardDescription>Requisitos específicos para este tipo de agente</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex gap-2">
                <Input
                  value={newRequirement}
                  onChange={(e) => setNewRequirement(e.target.value)}
                  placeholder="Adicionar requisito"
                  disabled={disabled}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddRequirement()}
                />
                <Button onClick={handleAddRequirement} disabled={disabled || !newRequirement.trim()}>
                  Adicionar
                </Button>
              </div>
              <div className="space-y-2">
                {config.requirements?.map((req, idx) => (
                  <div key={idx} className="flex items-start justify-between gap-2 p-2 bg-muted rounded">
                    <span className="text-sm">{req}</span>
                    <button
                      onClick={() =>
                        onChange({ requirements: config.requirements?.filter((_, i) => i !== idx) })
                      }
                      disabled={disabled}
                      className="hover:text-destructive"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB 4: MODEL */}
        <TabsContent value="model" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Configuração do Modelo</CardTitle>
              <CardDescription>LLM e parâmetros de execução</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="provider">Provider</Label>
                  <Input
                    id="provider"
                    value={config.model.provider}
                    onChange={(e) => handleModelChange('provider', e.target.value as any)}
                    disabled={disabled}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="model_id">Model ID</Label>
                  <Input
                    id="model_id"
                    value={config.model.model_id}
                    onChange={(e) => handleModelChange('model_id', e.target.value)}
                    disabled={disabled}
                    placeholder="gpt-4, claude-3-opus, etc"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="temperature">Temperatura</Label>
                  <Input
                    id="temperature"
                    type="number"
                    min="0"
                    max="2"
                    step="0.1"
                    value={config.model.temperature || 0.7}
                    onChange={(e) => handleModelChange('temperature', parseFloat(e.target.value))}
                    disabled={disabled}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="top_p">Top P</Label>
                  <Input
                    id="top_p"
                    type="number"
                    min="0"
                    max="1"
                    step="0.1"
                    value={config.model.top_p || 1}
                    onChange={(e) => handleModelChange('top_p', parseFloat(e.target.value))}
                    disabled={disabled}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="max_tokens">Max Tokens</Label>
                  <Input
                    id="max_tokens"
                    type="number"
                    min="1"
                    step="100"
                    value={config.model.max_tokens || 2000}
                    onChange={(e) => handleModelChange('max_tokens', parseInt(e.target.value, 10))}
                    disabled={disabled}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="presence_penalty">Presence Penalty</Label>
                  <Input
                    id="presence_penalty"
                    type="number"
                    min="-2"
                    max="2"
                    step="0.1"
                    value={config.model.presence_penalty || 0}
                    onChange={(e) => handleModelChange('presence_penalty', parseFloat(e.target.value))}
                    disabled={disabled}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="frequency_penalty">Frequency Penalty</Label>
                  <Input
                    id="frequency_penalty"
                    type="number"
                    min="-2"
                    max="2"
                    step="0.1"
                    value={config.model.frequency_penalty || 0}
                    onChange={(e) => handleModelChange('frequency_penalty', parseFloat(e.target.value))}
                    disabled={disabled}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB 5: OUTPUT */}
        <TabsContent value="output" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Output & Validação</CardTitle>
              <CardDescription>Schema e regras de validação</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="output_schema">JSON Schema de Output</Label>
                <Textarea
                  id="output_schema"
                  value={config.output_schema ? JSON.stringify(config.output_schema, null, 2) : '{}'}
                  onChange={(e) => {
                    try {
                      onChange({ output_schema: JSON.parse(e.target.value) });
                    } catch {
                      // Invalid JSON, allow user to keep typing
                    }
                  }}
                  disabled={disabled}
                  placeholder='{"type": "object", "properties": {...}}'
                  rows={5}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="validation_rules">Regras de Validação (JSON)</Label>
                <Textarea
                  id="validation_rules"
                  value={
                    config.validation_rules ? JSON.stringify(config.validation_rules, null, 2) : '{}'
                  }
                  onChange={(e) => {
                    try {
                      onChange({ validation_rules: JSON.parse(e.target.value) });
                    } catch {
                      // Invalid JSON
                    }
                  }}
                  disabled={disabled}
                  placeholder='{...validation rules...}'
                  rows={4}
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="requires_validation"
                  checked={config.requires_validation || false}
                  onChange={(e) => onChange({ requires_validation: e.target.checked })}
                  disabled={disabled}
                />
                <Label htmlFor="requires_validation">Requer Validação antes de Publicar</Label>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB 6: METADATA */}
        <TabsContent value="metadata" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Metadados</CardTitle>
              <CardDescription>Informações adicionais e configuração avançada</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="agent_type">Tipo de Agente</Label>
                <Input
                  id="agent_type"
                  value={config.agent_type || ''}
                  onChange={(e) => onChange({ agent_type: e.target.value })}
                  disabled={disabled}
                  placeholder="projetos, requisitos, etc"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="config_meta">Configuração Meta (JSON)</Label>
                <Textarea
                  id="config_meta"
                  value={
                    config.configuration_meta ? JSON.stringify(config.configuration_meta, null, 2) : '{}'
                  }
                  onChange={(e) => {
                    try {
                      onChange({ configuration_meta: JSON.parse(e.target.value) });
                    } catch {
                      // Invalid JSON
                    }
                  }}
                  disabled={disabled}
                  placeholder='{...custom metadata...}'
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
