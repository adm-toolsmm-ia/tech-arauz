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

// Stability level configurations
const STABILITY_CONFIG: Record<string, { color: string; label: string }> = {
  ga: { color: 'bg-green-100 text-green-800', label: 'GA' },
  preview: { color: 'bg-yellow-100 text-yellow-800', label: 'Preview' },
  experimental: { color: 'bg-orange-100 text-orange-800', label: 'Experimental' },
  deprecated: { color: 'bg-gray-100 text-gray-800', label: 'Deprecated' },
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
        'hover:bg-muted/50 flex cursor-pointer flex-col rounded-lg border p-4 transition-colors',
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
        <span className="text-foreground/90 line-clamp-2 text-sm font-semibold leading-tight">
          {model.name}
        </span>
        {model.description && (
          <p className="line-clamp-2 text-[11px] text-muted-foreground">{model.description}</p>
        )}
        <div className="flex flex-wrap gap-1">
          <Badge variant="outline" className="px-1.5 py-0 text-[10px]">
            {model.model_id}
          </Badge>
          {model.stability_level && (
            <Badge
              variant="outline"
              className={`px-1.5 py-0 text-[10px] ${STABILITY_CONFIG[model.stability_level]?.color}`}
            >
              {STABILITY_CONFIG[model.stability_level]?.label}
            </Badge>
          )}
          {model.release_channel && (
            <Badge variant="outline" className="px-1.5 py-0 text-[10px]">
              {model.release_channel}
            </Badge>
          )}
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

        {/* Capacidades chips */}
        {(model.supports_tool_calling ||
          model.supports_json_mode ||
          model.supports_streaming ||
          model.supports_vision ||
          model.supports_audio) && (
          <div className="mt-1.5 flex flex-wrap gap-1">
            {model.supports_tool_calling && (
              <Badge className="bg-blue-100 px-1.5 py-0 text-[9px] text-blue-800">🔧</Badge>
            )}
            {model.supports_json_mode && (
              <Badge className="bg-blue-100 px-1.5 py-0 text-[9px] text-blue-800">📄</Badge>
            )}
            {model.supports_streaming && (
              <Badge className="bg-blue-100 px-1.5 py-0 text-[9px] text-blue-800">🌊</Badge>
            )}
            {model.supports_vision && (
              <Badge className="bg-blue-100 px-1.5 py-0 text-[9px] text-blue-800">👁️</Badge>
            )}
            {model.supports_audio && (
              <Badge className="bg-blue-100 px-1.5 py-0 text-[9px] text-blue-800">🎵</Badge>
            )}
          </div>
        )}
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
