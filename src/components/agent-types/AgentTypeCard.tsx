import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Lock, Edit, Trash2 } from 'lucide-react';
import type { AgentType, LmProvider, LmModel } from '@/types/agents';

interface AgentTypeCardProps {
  agentType: AgentType;
  provider?: LmProvider;
  model?: LmModel;
  isSelected?: boolean;
  onSelect?: (agentType: AgentType) => void;
  onEdit?: (agentType: AgentType) => void;
  onDelete?: (e: React.MouseEvent, agentType: AgentType) => void;
}

export function AgentTypeCard({
  agentType,
  provider,
  model,
  isSelected,
  onSelect,
  onEdit,
  onDelete,
}: AgentTypeCardProps) {
  const barColor = agentType.color_hex || '#64748B';

  return (
    <div
      role="button"
      tabIndex={0}
      className={cn(
        'cursor-pointer relative flex flex-col rounded-lg border transition-colors',
        'hover:bg-muted/50 p-4',
        isSelected && 'border-primary bg-primary/5'
      )}
      onClick={() => onSelect?.(agentType)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelect?.(agentType);
        }
      }}
    >
      {/* Barra lateral colorida */}
      <div
        className="absolute left-0 top-0 bottom-0 w-1 rounded-l-lg"
        style={{ backgroundColor: barColor }}
      />

      <div className="flex-1 space-y-2 pl-1">
        {/* SEÇÃO 1: HEADER - Nome + Slug */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 space-y-0.5">
            <div className="flex items-center gap-2">
              <span className="text-2xl">{agentType.icon_emoji || '⚙️'}</span>
              <div className="flex-1">
                <h3 className="font-semibold text-sm text-foreground">{agentType.name}</h3>
                <p className="text-xs font-mono text-muted-foreground">{agentType.slug}</p>
              </div>
            </div>
            {agentType.description && (
              <p className="text-xs text-muted-foreground line-clamp-2">{agentType.description}</p>
            )}
          </div>
        </div>

        {/* SEÇÃO 2: MODELO PADRÃO */}
        {provider && model && (
          <div className="space-y-1 border-t border-border/30 pt-2">
            <p className="text-[10px] text-muted-foreground">Modelo Padrão:</p>
            <div className="flex items-center gap-2">
              <span className="text-lg">{provider.icon_emoji || '🤖'}</span>
              <div className="flex-1">
                <p className="text-xs font-semibold text-foreground">{provider.name}</p>
                <p className="text-xs text-muted-foreground">{model.name}</p>
              </div>
            </div>
          </div>
        )}

        {/* SEÇÃO 3: TEMPERATURA (se definida) */}
        {agentType.default_temperature !== null && agentType.default_temperature !== undefined && (
          <div className="space-y-1 border-t border-border/30 pt-2">
            <p className="text-[10px] text-muted-foreground">Temperatura Padrão:</p>
            <p className="text-xs text-foreground font-mono">{agentType.default_temperature}</p>
          </div>
        )}

        {/* SEÇÃO 4: RODAPÉ - Status + Ações */}
        <div className="flex items-center justify-between border-t border-border/30 pt-2">
          <div className="flex items-center gap-2">
            {agentType.is_system && (
              <Badge variant="outline" className="text-[10px]">
                <Lock className="h-3 w-3 mr-1" />
                Sistema
              </Badge>
            )}
            {agentType.is_active ? (
              <Badge variant="default" className="bg-green-600 text-[10px]">
                ✅ Ativo
              </Badge>
            ) : (
              <Badge variant="secondary" className="text-[10px]">
                ⭐ Inativo
              </Badge>
            )}
          </div>

          {/* Ações */}
          {!agentType.is_system && (
            <div role="presentation" className="flex gap-1" onClick={(e) => e.stopPropagation()}>
              {onEdit && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 w-7 p-0"
                  title="Editar"
                  onClick={() => onEdit(agentType)}
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
                  onClick={(e) => onDelete(e, agentType)}
                >
                  <Trash2 className="h-3.5 w-3.5 text-red-500 hover:text-red-600" />
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
