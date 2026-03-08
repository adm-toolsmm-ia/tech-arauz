'use client';

import { FileText, Cpu, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import type { AgentType } from '@/types/agents';

interface AgentTypeCockpitProps {
  agentType: AgentType;
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

export const AgentTypeCockpit: React.FC<AgentTypeCockpitProps> = ({ agentType, onEdit }) => {
  const modelDisplay =
    agentType.default_model_provider && agentType.default_model_id
      ? `${agentType.default_model_provider} / ${agentType.default_model_id}`
      : 'Não definido';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex flex-wrap gap-2">
          <Badge variant={agentType.is_active ? 'default' : 'secondary'}>
            {agentType.is_active ? 'Ativo' : 'Inativo'}
          </Badge>
          {agentType.is_system && <Badge variant="outline">Sistema</Badge>}
        </div>
        {onEdit && !agentType.is_system && (
          <Button variant="outline" size="sm" onClick={onEdit} className="gap-2">
            <ExternalLink className="size-4" />
            Editar
          </Button>
        )}
      </div>

      <Separator />

      <div className="flex items-center gap-3">
        <div
          className="flex size-12 items-center justify-center rounded-lg text-2xl"
          style={{ backgroundColor: `${agentType.color_hex || '#64748B'}20` }}
        >
          {agentType.icon_emoji || '⚙️'}
        </div>
        <div>
          <h3 className="font-semibold">{agentType.name}</h3>
          <p className="font-mono text-sm text-muted-foreground">{agentType.slug}</p>
        </div>
      </div>

      <Separator />

      <div className="space-y-4">
        <InfoField label="Descrição" value={agentType.description} />
      </div>

      <Separator />

      <div className="space-y-4">
        <h4 className="flex items-center gap-2 text-sm font-semibold">
          <Cpu className="size-4" />
          Modelo padrão
        </h4>
        <p className="font-mono text-sm">{modelDisplay}</p>
        {agentType.default_temperature != null && (
          <InfoField label="Temperatura padrão" value={String(agentType.default_temperature)} />
        )}
      </div>
    </div>
  );
};
