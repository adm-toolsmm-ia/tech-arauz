'use client';

import React from 'react';
import { useAgentTemplatesList } from '@/services/agents/agentsStore';
import type { AgentTemplate } from '@/types/agents';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';

interface AgentTemplateSelectorProps {
  agentTypeId: string;
  value?: string;
  onSelect: (template: AgentTemplate) => void;
  disabled?: boolean;
}

export function AgentTemplateSelector({
  agentTypeId,
  value,
  onSelect,
  disabled,
}: AgentTemplateSelectorProps) {
  const { data: templates = [], isLoading } = useAgentTemplatesList(agentTypeId);

  if (!agentTypeId) {
    return (
      <Card className="p-4 bg-muted/50">
        <p className="text-sm text-muted-foreground">
          Selecione um tipo de agente primeiro para visualizar templates
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      <Label>Template (Opcional)</Label>
      <Select
        value={value || ''}
        onValueChange={(templateId) => {
          const template = templates.find((t) => t.id === templateId);
          if (template) onSelect(template);
        }}
        disabled={disabled || isLoading || templates.length === 0}
      >
        <SelectTrigger>
          <SelectValue placeholder="Selecione um template..." />
        </SelectTrigger>
        <SelectContent>
          {templates.map((template) => (
            <SelectItem key={template.id} value={template.id}>
              <div className="flex flex-col">
                <span>{template.name}</span>
                {template.description && (
                  <span className="text-xs text-muted-foreground">{template.description}</span>
                )}
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {templates.length === 0 && !isLoading && (
        <p className="text-sm text-muted-foreground">
          Nenhum template disponível para este tipo
        </p>
      )}

      {isLoading && (
        <p className="text-sm text-muted-foreground">Carregando templates...</p>
      )}
    </div>
  );
}
