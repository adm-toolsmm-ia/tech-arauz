'use client';

import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { LmModel, LmProvider } from '@/types/agents';

interface ModelsKanbanCardProps {
  model: LmModel;
  provider?: LmProvider;
}

// Tier configurations (lightweight version)
const TIER_CONFIG: Record<string, { emoji: string; color: string; label: string }> = {
  entry: {
    emoji: '🚀',
    color: 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-300',
    label: 'Entry',
  },
  balanced: {
    emoji: '⚡',
    color: 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300',
    label: 'Balanced',
  },
  pro: {
    emoji: '💎',
    color: 'bg-purple-50 text-purple-700 dark:bg-purple-900/20 dark:text-purple-300',
    label: 'Pro',
  },
  flagship: {
    emoji: '👑',
    color: 'bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-300',
    label: 'Flagship',
  },
};

function formatTokens(tokens: number | undefined): string {
  if (!tokens) return '—';
  if (tokens >= 1_000_000) return `${(tokens / 1_000_000).toFixed(1)}M`;
  if (tokens >= 1_000) return `${(tokens / 1_000).toFixed(0)}K`;
  return tokens.toString();
}

export function ModelsKanbanCard({ model, provider }: ModelsKanbanCardProps) {
  const barColor = provider?.color_hex || '#64748B';
  const tierConfig = model.tier ? TIER_CONFIG[model.tier] : null;

  return (
    <div className="relative flex flex-col space-y-2">
      {/* Barra lateral colorida */}
      <div
        className="absolute bottom-0 left-0 top-0 w-1 rounded-l"
        style={{ backgroundColor: barColor }}
      />

      <div className="space-y-1.5 pl-2">
        {/* HEADER: Nome + Tier Badge */}
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <h4 className="line-clamp-2 text-sm font-semibold text-foreground">{model.name}</h4>
            <p className="line-clamp-1 font-mono text-xs text-muted-foreground">{model.model_id}</p>
          </div>
          {tierConfig && (
            <Badge
              variant="outline"
              className={cn('whitespace-nowrap text-[10px] font-semibold', tierConfig.color)}
            >
              {tierConfig.emoji}
            </Badge>
          )}
        </div>

        {/* Provedor + Contexto */}
        <div className="space-y-1 border-t border-border/30 pt-1">
          {provider && (
            <div className="flex items-center gap-1.5">
              <span className="text-xs">{provider.icon_emoji || '🤖'}</span>
              <span className="line-clamp-1 text-xs font-semibold text-foreground">
                {provider.name}
              </span>
            </div>
          )}

          {/* Context Window e Max Tokens */}
          {(model.context_window != null || model.max_tokens != null) && (
            <div className="space-y-0.5 text-xs">
              {model.context_window != null && (
                <p className="text-muted-foreground">
                  📥 {formatTokens(model.context_window)} entrada
                </p>
              )}
              {model.max_tokens != null && (
                <p className="text-muted-foreground">📤 {formatTokens(model.max_tokens)} saída</p>
              )}
            </div>
          )}
        </div>

        {/* Custo */}
        {(model.input_cost_per_1k_tokens != null || model.output_cost_per_1k_tokens != null) && (
          <div className="space-y-0.5 border-t border-border/30 pt-1 text-xs">
            {model.input_cost_per_1k_tokens != null && (
              <p className="text-muted-foreground">
                💰 ${model.input_cost_per_1k_tokens.toFixed(6)}/1K entrada
              </p>
            )}
            {model.output_cost_per_1k_tokens != null && (
              <p className="text-muted-foreground">
                💰 ${model.output_cost_per_1k_tokens.toFixed(6)}/1K saída
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
