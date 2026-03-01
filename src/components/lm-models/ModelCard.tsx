import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Trash2, Copy } from 'lucide-react';
import type { LmModel, LmProvider } from '@/types/agents';

interface ModelCardProps {
  model: LmModel;
  provider?: LmProvider;
  isSelected?: boolean;
  onSelect?: (model: LmModel) => void;
  onDelete?: (e: React.MouseEvent, model: LmModel) => void;
  onCopy?: (model: LmModel) => void;
}

// Tier configurations (aligned with AgentKanbanCard badges)
const TIER_CONFIG: Record<string, { emoji: string; label: string }> = {
  entry: { emoji: '🚀', label: 'Entry' },
  balanced: { emoji: '⚡', label: 'Balanced' },
  pro: { emoji: '💎', label: 'Pro' },
  flagship: { emoji: '👑', label: 'Flagship' },
};

export function ModelCard({
  model,
  provider,
  isSelected,
  onSelect,
  onDelete,
  onCopy,
}: ModelCardProps) {
  const tierConfig = model.tier ? TIER_CONFIG[model.tier] : null;

  return (
    <div
      role="button"
      tabIndex={0}
      className={cn(
        'flex cursor-pointer flex-col rounded-lg border p-4 transition-colors hover:bg-muted/50',
        isSelected && 'border-primary bg-primary/5',
      )}
      onClick={() => onSelect?.(model)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelect?.(model);
        }
      }}
    >
      <div className="space-y-1.5">
        <span className="line-clamp-2 text-sm font-semibold leading-tight text-foreground/90">
          {model.name}
        </span>
        {model.description && (
          <p className="line-clamp-2 text-[11px] text-muted-foreground">{model.description}</p>
        )}
        <div className="flex flex-wrap gap-1">
          <Badge variant="outline" className="px-1.5 py-0 text-[10px]">
            {model.model_id}
          </Badge>
          {tierConfig && (
            <Badge variant="outline" className="px-1.5 py-0 text-[10px]">
              {tierConfig.emoji} {tierConfig.label}
            </Badge>
          )}
          {provider && (
            <Badge variant="secondary" className="px-1.5 py-0 text-[10px]">
              {provider.icon_emoji || '🤖'} {provider.name}
            </Badge>
          )}
        </div>
      </div>

      {(onCopy || onDelete) && (
        <div
          role="presentation"
          className="mt-2 flex justify-end gap-1 border-t border-border/30 pt-2"
          onClick={(e) => e.stopPropagation()}
        >
          {onCopy && (
            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0"
              title="Copiar Model ID"
              onClick={() => onCopy(model)}
            >
              <Copy className="h-3.5 w-3.5 text-muted-foreground hover:text-foreground" />
            </Button>
          )}
          {onDelete && (
            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0"
              title="Deletar"
              onClick={(e) => onDelete(e, model)}
            >
              <Trash2 className="h-3.5 w-3.5 text-red-500 hover:text-red-600" />
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
