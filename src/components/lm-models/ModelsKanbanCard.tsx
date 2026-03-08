'use client';

import { Badge } from '@/components/ui/badge';
import type { LmModel, LmProvider } from '@/types/agents';

interface ModelsKanbanCardProps {
  model: LmModel;
  provider?: LmProvider;
}

// Tier configurations (lightweight, aligned with AgentKanbanCard badges)
const TIER_CONFIG: Record<string, { emoji: string; label: string }> = {
  entry: { emoji: '🚀', label: 'Entry' },
  balanced: { emoji: '⚡', label: 'Balanced' },
  pro: { emoji: '💎', label: 'Pro' },
  flagship: { emoji: '👑', label: 'Flagship' },
};

export const ModelsKanbanCard: React.FC<ModelsKanbanCardProps> = ({ model, provider }) => {
  const tierConfig = model.tier ? TIER_CONFIG[model.tier] : null;

  return (
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
  );
};
