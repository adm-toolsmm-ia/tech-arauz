'use client';

import { useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import type { AgentType, LmProvider, LmModel } from '@/types/agents';

const EMOJI_OPTIONS = ['⚙️', '📊', '🤖', '📋', '🔍', '🚀', '💡', '🎯', '📈', '🔧'];
const COLOR_OPTIONS = [
  { hex: '#64748B', label: 'Cinza' },
  { hex: '#3B82F6', label: 'Azul' },
  { hex: '#8B5CF6', label: 'Roxo' },
  { hex: '#EC4899', label: 'Rosa' },
  { hex: '#F59E0B', label: 'Âmbar' },
  { hex: '#10B981', label: 'Verde' },
];

export interface AgentTypeFormData {
  name: string;
  slug: string;
  description: string;
  icon_emoji: string;
  color_hex: string;
  is_active: boolean;
  default_model_provider?: string;
  default_model_id?: string;
  default_temperature?: number;
}

interface AgentTypeFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingType: AgentType | null;
  formData: AgentTypeFormData;
  onFormDataChange: (data: Partial<AgentTypeFormData>) => void;
  onNameChange: (name: string) => void;
  onSubmit: () => void;
  isLoading: boolean;
  providers: LmProvider[];
  modelsByProvider: Record<string, LmModel[]>;
  onLoadModels: (providerId: string) => void;
}

export function AgentTypeFormDialog({
  open,
  onOpenChange,
  editingType,
  formData,
  onFormDataChange,
  onNameChange,
  onSubmit,
  isLoading,
  providers,
  modelsByProvider,
  onLoadModels,
}: AgentTypeFormDialogProps) {
  const handleProviderChange = useCallback(
    (value: string) => {
      const slug = value === 'none' ? undefined : value;
      const provider = slug ? providers.find((p) => p.slug === slug) : undefined;
      if (provider) onLoadModels(provider.id);
      onFormDataChange({
        default_model_provider: slug,
        default_model_id: provider ? modelsByProvider[provider.id]?.[0]?.model_id : undefined,
      });
    },
    [providers, modelsByProvider, onFormDataChange, onLoadModels],
  );

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) onOpenChange(false);
        else onOpenChange(true);
      }}
    >
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {editingType ? 'Editar Tipo de Agente' : 'Criar Novo Tipo de Agente'}
          </DialogTitle>
          <DialogDescription>
            {editingType
              ? 'Atualize as configurações do tipo e o modelo padrão (tabelas auxiliares)'
              : 'Defina um novo tipo de agente com suas configurações padrão'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Name */}
          <div>
            <Label htmlFor="agent-type-name">Nome *</Label>
            <Input
              id="agent-type-name"
              placeholder="Ex: Análise de Requisitos"
              value={formData.name}
              onChange={(e) => onNameChange(e.target.value)}
              disabled={isLoading}
            />
          </div>

          {/* Slug */}
          <div>
            <Label htmlFor="agent-type-slug">Slug</Label>
            <Input
              id="agent-type-slug"
              placeholder="Ex: analise_requisitos"
              value={formData.slug}
              disabled
              className="bg-muted text-sm text-muted-foreground"
            />
          </div>

          {/* Description */}
          <div>
            <Label htmlFor="agent-type-description">Descrição</Label>
            <Input
              id="agent-type-description"
              placeholder="Descreva este tipo de agente..."
              value={formData.description}
              onChange={(e) => onFormDataChange({ description: e.target.value })}
              disabled={isLoading}
            />
          </div>

          {/* Emoji */}
          <div>
            <Label>Ícone Emoji</Label>
            <div className="grid grid-cols-5 gap-2">
              {EMOJI_OPTIONS.map((emoji) => (
                <Button
                  key={emoji}
                  variant={formData.icon_emoji === emoji ? 'default' : 'outline'}
                  size="sm"
                  className="text-xl"
                  onClick={() => onFormDataChange({ icon_emoji: emoji })}
                  disabled={isLoading}
                >
                  {emoji}
                </Button>
              ))}
            </div>
          </div>

          {/* Color */}
          <div>
            <Label>Cor</Label>
            <div className="grid grid-cols-3 gap-2">
              {COLOR_OPTIONS.map((color) => (
                <Button
                  key={color.hex}
                  variant={formData.color_hex === color.hex ? 'default' : 'outline'}
                  size="sm"
                  className="justify-start"
                  onClick={() => onFormDataChange({ color_hex: color.hex })}
                  disabled={isLoading}
                >
                  <div className="mr-2 h-4 w-4 rounded" style={{ backgroundColor: color.hex }} />
                  {color.label}
                </Button>
              ))}
            </div>
          </div>

          {/* Provedor e Modelo padrão */}
          {providers.length > 0 && (
            <>
              <div>
                <Label>Provedor padrão</Label>
                <Select
                  value={formData.default_model_provider ?? 'none'}
                  onValueChange={handleProviderChange}
                  disabled={isLoading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecionar provedor..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Nenhum</SelectItem>
                    {providers.map((p) => (
                      <SelectItem key={p.id} value={p.slug}>
                        {p.icon_emoji} {p.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Modelo padrão</Label>
                <Select
                  value={formData.default_model_id ?? 'none'}
                  onValueChange={(value) =>
                    onFormDataChange({
                      default_model_id: value === 'none' ? undefined : value,
                    })
                  }
                  disabled={isLoading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecionar modelo..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Nenhum</SelectItem>
                    {(() => {
                      const provider = providers.find(
                        (p) => p.slug === formData.default_model_provider,
                      );
                      const models = provider ? (modelsByProvider[provider.id] ?? []) : [];
                      if (provider && models.length === 0 && formData.default_model_provider) {
                        onLoadModels(provider.id);
                      }
                      return models.map((m) => (
                        <SelectItem key={m.id} value={m.model_id}>
                          {m.name} ({m.model_id})
                        </SelectItem>
                      ));
                    })()}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Temperatura padrão (0-2)</Label>
                <Input
                  type="number"
                  min={0}
                  max={2}
                  step={0.1}
                  value={formData.default_temperature ?? ''}
                  onChange={(e) => {
                    const v = e.target.value;
                    onFormDataChange({
                      default_temperature: v === '' ? undefined : parseFloat(v),
                    });
                  }}
                  placeholder="Ex: 0.7"
                  disabled={isLoading}
                />
              </div>
            </>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
            Cancelar
          </Button>
          <Button onClick={onSubmit} disabled={isLoading}>
            {isLoading
              ? editingType
                ? 'Salvando...'
                : 'Criando...'
              : editingType
                ? 'Salvar'
                : 'Criar'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
