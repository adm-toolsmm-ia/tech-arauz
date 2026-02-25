'use client';

import * as React from 'react';
import * as z from 'zod';
import { Plus } from 'lucide-react';
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
import { toast } from 'sonner';
import { agentsApiService } from '@/services/agents/agentsApiService';
import { useAgentTypesList } from '@/services/agents/agentsStore';

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
});

type CreateAgentFormValues = z.infer<typeof createAgentSchema>;

interface CreateAgentDialogProps {
  onSuccess?: () => void;
}

export function CreateAgentDialog({ onSuccess }: CreateAgentDialogProps) {
  const [open, setOpen] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const [errors, setErrors] = React.useState<Partial<Record<keyof CreateAgentFormValues, string>>>({});
  const [formData, setFormData] = React.useState<CreateAgentFormValues>({
    name: '',
    slug: '',
    description: '',
    agent_type: '',
  });

  const { data: agentTypes = [], isLoading: loadingTypes } = useAgentTypesList();

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

  const validateForm = (): boolean => {
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

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    try {
      await agentsApiService.createAgent({
        name: formData.name,
        slug: formData.slug,
        description: formData.description || undefined,
        agent_type: formData.agent_type || undefined,
      });

      toast.success('Agente criado com sucesso!');
      setFormData({ name: '', slug: '', description: '', agent_type: '' });
      setOpen(false);

      // Call callback if provided
      onSuccess?.();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao criar agente';
      toast.error(message);
      console.error('Create agent error:', error);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Novo Agente
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Criar Novo Agente</DialogTitle>
          <DialogDescription>
            Configure as informações básicas do seu agente. Você poderá editar mais detalhes depois.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Agent Type Select */}
          <div className="space-y-2">
            <Label htmlFor="agent_type">Tipo de Agente (Opcional)</Label>
            <Select
              value={formData.agent_type || ''}
              onValueChange={(value) => setFormData((prev) => ({ ...prev, agent_type: value }))}
              disabled={isLoading || loadingTypes}
            >
              <SelectTrigger id="agent_type">
                <SelectValue placeholder="Selecione um tipo..." />
              </SelectTrigger>
              <SelectContent>
                {agentTypes.map((type) => (
                  <SelectItem key={type.id} value={type.slug}>
                    {type.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-sm text-muted-foreground">
              {loadingTypes ? 'Carregando tipos...' : 'Selecione o tipo de agente para aplicar configurações pré-definidas'}
            </p>
          </div>

          {/* Name field */}
          <div className="space-y-2">
            <Label htmlFor="name">Nome do Agente</Label>
            <Input
              id="name"
              placeholder="ex: Assistente Geral"
              value={formData.name}
              onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
              disabled={isLoading}
            />
            {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
            <p className="text-sm text-muted-foreground">Nome único para identificar o agente</p>
          </div>

          {/* Slug field */}
          <div className="space-y-2">
            <Label htmlFor="slug">Identificador (Slug)</Label>
            <Input
              id="slug"
              placeholder="ex: assistente-geral"
              value={formData.slug}
              onChange={(e) => setFormData((prev) => ({ ...prev, slug: e.target.value }))}
              disabled={isLoading}
            />
            {errors.slug && <p className="text-sm text-destructive">{errors.slug}</p>}
            <p className="text-sm text-muted-foreground">
              Identificador único em minúsculas. Usado em workflows e APIs.
            </p>
          </div>

          {/* Description field */}
          <div className="space-y-2">
            <Label htmlFor="description">Descrição (Opcional)</Label>
            <Textarea
              id="description"
              placeholder="Descreva o propósito e capacidades do agente"
              className="resize-none"
              rows={3}
              value={formData.description || ''}
              onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
              disabled={isLoading}
            />
            {errors.description && <p className="text-sm text-destructive">{errors.description}</p>}
          </div>

          {/* Actions */}
          <div className="flex gap-2 justify-end pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Criando...' : 'Criar Agente'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
