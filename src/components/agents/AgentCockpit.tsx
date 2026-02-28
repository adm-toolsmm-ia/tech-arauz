'use client';

import { Cpu, Calendar, PlayCircle, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import type { UIAgent } from '@/lib/transformers/agent';

interface AgentCockpitProps {
  agent: UIAgent;
  onEdit?: () => void;
}

function InfoField({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div className="space-y-1">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-sm font-medium">{value || '-'}</p>
    </div>
  );
}

function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return '-';
  try {
    return new Date(dateStr).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return '-';
  }
}

export function AgentCockpit({ agent, onEdit }: AgentCockpitProps) {
  const modelDisplay = agent.fullConfig?.modelProvider
    ? `${agent.fullConfig.modelProvider} / ${agent.modelId}`
    : agent.modelId;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex flex-wrap gap-2">
          <Badge variant={agent.status === 'published' ? 'default' : 'secondary'}>
            {agent.status}
          </Badge>
          <Badge variant="outline">{agent.agentType}</Badge>
        </div>
        {onEdit && (
          <Button variant="outline" size="sm" onClick={onEdit} className="gap-2">
            <ExternalLink className="size-4" />
            Editar
          </Button>
        )}
      </div>

      <Separator />

      <div className="space-y-4">
        <InfoField label="Nome" value={agent.name} />
        <InfoField label="Slug" value={agent.slug} />
        <InfoField label="Descrição" value={agent.description || undefined} />
      </div>

      <Separator />

      <div className="space-y-4">
        <h4 className="flex items-center gap-2 text-sm font-semibold">
          <Cpu className="size-4" />
          Modelo
        </h4>
        <p className="font-mono text-sm">{modelDisplay}</p>
      </div>

      <Separator />

      <div className="space-y-4">
        <h4 className="flex items-center gap-2 text-sm font-semibold">
          <PlayCircle className="size-4" />
          Métricas
        </h4>
        <div className="grid gap-2 sm:grid-cols-2">
          <InfoField label="Execuções" value={String(agent.executionCount)} />
          <InfoField
            label="Última execução"
            value={agent.lastExecutionAt ? formatDate(agent.lastExecutionAt) : undefined}
          />
        </div>
      </div>

      <Separator />

      <div className="space-y-4">
        <h4 className="flex items-center gap-2 text-sm font-semibold">
          <Calendar className="size-4" />
          Datas
        </h4>
        <div className="grid gap-2 sm:grid-cols-2">
          <InfoField label="Criado em" value={formatDate(agent.createdAt)} />
          <InfoField label="Atualizado em" value={formatDate(agent.updatedAt)} />
        </div>
      </div>
    </div>
  );
}
