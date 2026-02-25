'use client';

import * as React from 'react';
import * as z from 'zod';
import { Plus, ChevronRight, Sparkles } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { AgentSupabaseService } from '@/services/agents/agentSupabaseService';

const createAgentSchema = z.object({
  name: z
    .string()
    .min(1, 'Nome é obrigatório')
    .max(100, 'Nome não pode ter mais de 100 caracteres'),
  slug: z
    .string()
    .min(1, 'Slug é obrigatório')
    .regex(/^[a-z0-9-]+$/, 'Slug deve conter apenas letras minúsculas, números e hífens')
    .max(50, 'Slug não pode ter mais de 50 caracteres'),
  description: z.string().max(500, 'Descrição não pode ter mais de 500 caracteres').optional(),
  agent_type: z.string().optional(),
  model_provider: z.enum(['openai', 'anthropic', 'azure_openai', 'other']).default('openai'),
  model_id: z.string().default('gpt-4'),
  model_temperature: z.number().min(0).max(2).default(0.7),
  model_max_tokens: z.number().min(100).default(2000),
  persona: z.string().optional(),
  prompt_objective: z.string().optional(),
});

type CreateAgentFormValues = z.infer<typeof createAgentSchema>;

interface CreateAgentDialogProps {
  onSuccess?: () => void;
}

const AGENT_TYPES = [
  {
    id: 'status-report',
    name: '📊 Status Report de Projetos',
    description: 'Agente para análise e relatório de status de projetos',
    icon: '📊',
  },
  {
    id: 'requirements',
    name: '📋 Levantamento de Requisitos',
    description: 'Agente para análise e estruturação de requisitos',
    icon: '📋',
  },
  {
    id: 'analysis',
    name: '🔍 Análise Técnica',
    description: 'Agente para análise técnica e recomendações',
    icon: '🔍',
  },
];

const MODEL_OPTIONS = [
  { provider: 'openai', label: 'OpenAI', models: ['gpt-4', 'gpt-4-turbo', 'gpt-3.5-turbo'] },
  {
    provider: 'anthropic',
    label: 'Anthropic',
    models: ['claude-3-opus', 'claude-3-sonnet', 'claude-3-haiku'],
  },
  { provider: 'azure_openai', label: 'Azure OpenAI', models: ['gpt-4', 'gpt-35-turbo'] },
];

export function CreateAgentDialog({ onSuccess }: CreateAgentDialogProps) {
  const [open, setOpen] = React.useState(false);
  const [step, setStep] = React.useState<'type' | 'basic' | 'model' | 'prompt' | 'confirm'>('type');
  const [isLoading, setIsLoading] = React.useState(false);
  const [errors, setErrors] = React.useState<Partial<Record<keyof CreateAgentFormValues, string>>>(
    {},
  );
  const [formData, setFormData] = React.useState<CreateAgentFormValues>({
    name: '',
    slug: '',
    description: '',
    agent_type: '',
    model_provider: 'openai',
    model_id: 'gpt-4',
    model_temperature: 0.7,
    model_max_tokens: 2000,
    persona: '',
    prompt_objective: '',
  });

  // Auto-generate slug from name
  React.useEffect(() => {
    if (formData.name && !formData.slug) {
      const slug = formData.name
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .slice(0, 50);
      setFormData((prev) => ({ ...prev, slug }));
    }
  }, [formData.name, formData.slug]);

  const validateStep = (): boolean => {
    try {
      createAgentSchema.parse(formData);
      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Partial<Record<keyof CreateAgentFormValues, string>> = {};
        error.errors.forEach((err) => {
          const key = err.path[0] as keyof CreateAgentFormValues;
          newErrors[key] = err.message;
        });
        setErrors(newErrors);
      }
      return false;
    }
  };

  const handleNextStep = () => {
    const steps: ('type' | 'basic' | 'model' | 'prompt' | 'confirm')[] = [
      'type',
      'basic',
      'model',
      'prompt',
      'confirm',
    ];
    const currentIndex = steps.indexOf(step);
    if (currentIndex < steps.length - 1) {
      setStep(steps[currentIndex + 1]);
    }
  };

  const handlePreviousStep = () => {
    const steps: ('type' | 'basic' | 'model' | 'prompt' | 'confirm')[] = [
      'type',
      'basic',
      'model',
      'prompt',
      'confirm',
    ];
    const currentIndex = steps.indexOf(step);
    if (currentIndex > 0) {
      setStep(steps[currentIndex - 1]);
    }
  };

  async function handleSubmit() {
    setIsLoading(true);
    try {
      if (!validateStep()) {
        setIsLoading(false);
        return;
      }

      await AgentSupabaseService.createAgent({
        name: formData.name,
        slug: formData.slug,
        description: formData.description,
        agent_type: formData.agent_type,
        model_provider: formData.model_provider,
        model_id: formData.model_id,
        model_temperature: formData.model_temperature,
        model_max_tokens: formData.model_max_tokens,
      });

      toast.success('✅ Agente criado com sucesso!');
      setFormData({
        name: '',
        slug: '',
        description: '',
        agent_type: '',
        model_provider: 'openai',
        model_id: 'gpt-4',
        model_temperature: 0.7,
        model_max_tokens: 2000,
        persona: '',
        prompt_objective: '',
      });
      setStep('type');
      setOpen(false);

      onSuccess?.();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao criar agente';
      toast.error(`❌ ${message}`);
      console.error('Create agent error:', error);
    } finally {
      setIsLoading(false);
    }
  }

  const selectedType = AGENT_TYPES.find((t) => t.id === formData.agent_type);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Novo Agente
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[600px]">
        {/* Header com Progress */}
        <DialogHeader>
          <div className="mb-4 flex items-center justify-between">
            <div>
              <DialogTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-blue-500" />
                Criar Novo Agente AI
              </DialogTitle>
              <DialogDescription>Configuração guiada em 4 passos</DialogDescription>
            </div>
            <Badge variant="outline">
              {step === 'type' && 'Passo 1/5'}
              {step === 'basic' && 'Passo 2/5'}
              {step === 'model' && 'Passo 3/5'}
              {step === 'prompt' && 'Passo 4/5'}
              {step === 'confirm' && 'Passo 5/5'}
            </Badge>
          </div>
          {/* Progress Bar */}
          <div className="h-1 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="h-full bg-blue-500 transition-all duration-300"
              style={{
                width:
                  step === 'type'
                    ? '20%'
                    : step === 'basic'
                      ? '40%'
                      : step === 'model'
                        ? '60%'
                        : step === 'prompt'
                          ? '80%'
                          : '100%',
              }}
            />
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* STEP 1: TYPE SELECTION */}
          {step === 'type' && (
            <div className="space-y-4">
              <div>
                <Label className="mb-3 block text-base font-semibold">Tipo de Agente</Label>
                <p className="mb-4 text-sm text-muted-foreground">
                  Escolha o tipo de agente que deseja criar. Cada tipo vem com configurações
                  pré-definidas.
                </p>
              </div>
              <div className="grid grid-cols-1 gap-3">
                {AGENT_TYPES.map((type) => (
                  <Card
                    key={type.id}
                    className={`cursor-pointer transition-all ${
                      formData.agent_type === type.id
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-950'
                        : 'hover:border-muted-foreground/50'
                    }`}
                    onClick={() => setFormData((prev) => ({ ...prev, agent_type: type.id }))}
                  >
                    <CardContent className="pt-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="text-sm font-semibold">{type.name}</p>
                          <p className="mt-1 text-xs text-muted-foreground">{type.description}</p>
                        </div>
                        {formData.agent_type === type.id && (
                          <Badge className="ml-2">✓ Selecionado</Badge>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* STEP 2: BASIC INFO */}
          {step === 'basic' && (
            <div className="space-y-4">
              <div>
                <Label className="mb-3 block text-base font-semibold">Informações Básicas</Label>
                <p className="mb-4 text-sm text-muted-foreground">
                  Configure o nome e identificador do agente
                </p>
              </div>

              <div className="space-y-3">
                <div>
                  <Label htmlFor="name" className="text-sm">
                    Nome do Agente *
                  </Label>
                  <Input
                    id="name"
                    placeholder="ex: Status Report Q1"
                    value={formData.name}
                    onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                    disabled={isLoading}
                    className="mt-1"
                  />
                  {errors.name && <p className="mt-1 text-xs text-destructive">{errors.name}</p>}
                </div>

                <div>
                  <Label htmlFor="slug" className="text-sm">
                    Identificador (Slug) *
                  </Label>
                  <Input
                    id="slug"
                    placeholder="status-report-q1"
                    value={formData.slug}
                    onChange={(e) => setFormData((prev) => ({ ...prev, slug: e.target.value }))}
                    disabled={isLoading}
                    className="mt-1"
                  />
                  {errors.slug && <p className="mt-1 text-xs text-destructive">{errors.slug}</p>}
                  <p className="mt-1 text-xs text-muted-foreground">Usado em APIs e workflows</p>
                </div>

                <div>
                  <Label htmlFor="description" className="text-sm">
                    Descrição (Opcional)
                  </Label>
                  <Textarea
                    id="description"
                    placeholder="Descreva o propósito do agente..."
                    className="mt-1 resize-none"
                    rows={3}
                    value={formData.description || ''}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, description: e.target.value }))
                    }
                    disabled={isLoading}
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: MODEL CONFIG */}
          {step === 'model' && (
            <div className="space-y-4">
              <div>
                <Label className="mb-3 block text-base font-semibold">
                  Configuração do Modelo LLM
                </Label>
                <p className="mb-4 text-sm text-muted-foreground">
                  Escolha o provider e modelo de IA que será usado
                </p>
              </div>

              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="provider" className="text-sm">
                      Provider *
                    </Label>
                    <Select
                      value={formData.model_provider}
                      onValueChange={(value: any) =>
                        setFormData((prev) => ({
                          ...prev,
                          model_provider: value,
                          model_id:
                            MODEL_OPTIONS.find((m) => m.provider === value)?.models[0] || 'gpt-4',
                        }))
                      }
                      disabled={isLoading}
                    >
                      <SelectTrigger id="provider" className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {MODEL_OPTIONS.map((option) => (
                          <SelectItem key={option.provider} value={option.provider}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="model_id" className="text-sm">
                      Modelo *
                    </Label>
                    <Select
                      value={formData.model_id}
                      onValueChange={(value) =>
                        setFormData((prev) => ({ ...prev, model_id: value }))
                      }
                      disabled={isLoading}
                    >
                      <SelectTrigger id="model_id" className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {MODEL_OPTIONS.find(
                          (m) => m.provider === formData.model_provider,
                        )?.models.map((model) => (
                          <SelectItem key={model} value={model}>
                            {model}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="temperature" className="text-sm">
                      Temperatura ({formData.model_temperature})
                    </Label>
                    <div className="mt-1 flex items-center gap-2">
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
                        disabled={isLoading}
                        className="flex-1"
                      />
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                      0 = Determinístico, 2 = Criativo
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="max_tokens" className="text-sm">
                      Max Tokens *
                    </Label>
                    <Input
                      id="max_tokens"
                      type="number"
                      min="100"
                      step="100"
                      value={formData.model_max_tokens}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          model_max_tokens: parseInt(e.target.value, 10),
                        }))
                      }
                      disabled={isLoading}
                      className="mt-1"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: PROMPT BASICS */}
          {step === 'prompt' && (
            <div className="space-y-4">
              <div>
                <Label className="mb-3 block text-base font-semibold">Persona & Objetivo</Label>
                <p className="mb-4 text-sm text-muted-foreground">
                  Configure como o agente deve se comportar
                </p>
              </div>

              <div className="space-y-3">
                <div>
                  <Label htmlFor="persona" className="text-sm">
                    Persona (Opcional)
                  </Label>
                  <Textarea
                    id="persona"
                    placeholder="ex: Você é um analista experiente com 10 anos em gestão de projetos..."
                    className="mt-1 resize-none"
                    rows={2}
                    value={formData.persona || ''}
                    onChange={(e) => setFormData((prev) => ({ ...prev, persona: e.target.value }))}
                    disabled={isLoading}
                  />
                  <p className="mt-1 text-xs text-muted-foreground">
                    Descreva a personalidade do agente
                  </p>
                </div>

                <div>
                  <Label htmlFor="prompt_objective" className="text-sm">
                    Objetivo Principal (Opcional)
                  </Label>
                  <Textarea
                    id="prompt_objective"
                    placeholder="ex: Analisar status de projetos e gerar relatório executivo..."
                    className="mt-1 resize-none"
                    rows={2}
                    value={formData.prompt_objective || ''}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, prompt_objective: e.target.value }))
                    }
                    disabled={isLoading}
                  />
                  <p className="mt-1 text-xs text-muted-foreground">O que o agente deve fazer</p>
                </div>
              </div>
            </div>
          )}

          {/* STEP 5: CONFIRM */}
          {step === 'confirm' && (
            <div className="space-y-4">
              <div>
                <Label className="mb-3 block text-base font-semibold">Confirmar Criação</Label>
                <p className="mb-4 text-sm text-muted-foreground">
                  Revise as informações antes de criar
                </p>
              </div>

              <Card className="bg-muted/50">
                <CardContent className="pt-4">
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Tipo:</span>
                      <span className="font-semibold">{selectedType?.name || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Nome:</span>
                      <span className="font-semibold">{formData.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Slug:</span>
                      <span className="font-mono text-xs">{formData.slug}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Modelo:</span>
                      <span className="font-semibold">{formData.model_id}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Temperatura:</span>
                      <span className="font-semibold">{formData.model_temperature}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Max Tokens:</span>
                      <span className="font-semibold">{formData.model_max_tokens}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <p className="text-xs text-muted-foreground">
                Você poderá editar todas as informações após a criação
              </p>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex justify-between gap-2 border-t pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={step === 'type' ? () => setOpen(false) : handlePreviousStep}
            disabled={isLoading}
          >
            {step === 'type' ? 'Cancelar' : '← Anterior'}
          </Button>

          {step !== 'confirm' && (
            <Button onClick={handleNextStep} disabled={isLoading}>
              Próximo <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          )}

          {step === 'confirm' && (
            <Button onClick={handleSubmit} disabled={isLoading} className="gap-2">
              {isLoading ? 'Criando...' : '✓ Criar Agente'}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
