import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Zap, Edit, Trash2, ExternalLink } from 'lucide-react';
import type { UIAgent } from '@/lib/transformers/agent';

interface AgentCardProps {
  agent: UIAgent;
  isSelected?: boolean;
  onSelect?: (agent: UIAgent) => void;
  onEdit?: (agent: UIAgent) => void;
  onDelete?: (e: React.MouseEvent, agent: UIAgent) => void;
}

// Status colors
const statusStyles: Record<string, { bg: string; text: string; label: string }> = {
  draft: {
    bg: 'bg-gray-100 dark:bg-gray-900/30',
    text: 'text-gray-700 dark:text-gray-300',
    label: '📝 Rascunho',
  },
  published: {
    bg: 'bg-green-100 dark:bg-green-900/30',
    text: 'text-green-700 dark:text-green-300',
    label: '✅ Publicado',
  },
  deprecated: {
    bg: 'bg-red-100 dark:bg-red-900/30',
    text: 'text-red-700 dark:text-red-300',
    label: '⛔ Descontinuado',
  },
};

const getStatusStyle = (status: string) => {
  return statusStyles[status] || statusStyles.draft;
};

export const AgentCard: React.FC<AgentCardProps> = ({
  agent,
  isSelected,
  onSelect,
  onEdit,
  onDelete,
}) => {
  const statusStyle = getStatusStyle(agent.status);

  return (
    <div
      role="button"
      tabIndex={0}
      className={cn(
        'relative flex cursor-pointer flex-col rounded-lg border transition-colors',
        'hover:bg-muted/50 p-4',
        isSelected && 'border-primary bg-primary/5',
      )}
      onClick={() => onSelect?.(agent)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelect?.(agent);
        }
      }}
    >
      {/* Barra lateral colorida (azul primária) */}
      <div className="absolute bottom-0 left-0 top-0 w-1 rounded-l-lg bg-blue-500" />

      <div className="flex-1 space-y-2 pl-1">
        {/* SEÇÃO 1: HEADER - Nome + Slug */}
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🤖</span>
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-foreground">{agent.name}</h3>
              <p className="font-mono text-xs text-muted-foreground">{agent.slug}</p>
            </div>
          </div>
          {agent.description && (
            <p className="line-clamp-2 text-xs text-muted-foreground">{agent.description}</p>
          )}
        </div>

        {/* SEÇÃO 2: TIPO */}
        <div className="space-y-1 border-t border-border/30 pt-2">
          <p className="text-[10px] text-muted-foreground">Tipo:</p>
          <p className="text-xs font-semibold text-foreground">{agent.agentType}</p>
        </div>

        {/* SEÇÃO 3: MODELO + TEMPERATURA (se aplicável) */}
        {(agent.modelId || agent.fullConfig?.modelTemperature != null) && (
          <div className="space-y-1 border-t border-border/30 pt-2">
            <p className="text-[10px] text-muted-foreground">Modelo:</p>
            <div className="flex items-center gap-2">
              <span className="text-lg">⚡</span>
              <div className="flex-1">
                <p className="font-mono text-xs text-foreground">{agent.modelId || '-'}</p>
                {agent.fullConfig?.modelTemperature != null && (
                  <p className="text-xs text-muted-foreground">
                    Temperatura: {agent.fullConfig.modelTemperature}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* SEÇÃO 4: RODAPÉ - Status + Ações */}
        <div className="flex items-center justify-between border-t border-border/30 pt-2">
          <Badge variant="outline" className={cn('text-[10px]', statusStyle.bg, statusStyle.text)}>
            {statusStyle.label}
          </Badge>

          {/* Ações */}
          <div role="presentation" className="flex gap-1" onClick={(e) => e.stopPropagation()}>
            {onEdit && (
              <Button
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0"
                title="Editar"
                onClick={() => onEdit(agent)}
              >
                <Edit className="h-3.5 w-3.5 text-muted-foreground hover:text-foreground" />
              </Button>
            )}
            {onDelete && (
              <Button
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0"
                title="Deletar"
                onClick={(e) => onDelete(e, agent)}
              >
                <Trash2 className="h-3.5 w-3.5 text-red-500 hover:text-red-600" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
