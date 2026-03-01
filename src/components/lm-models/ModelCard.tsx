import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import { ExternalLink, Trash2, Copy } from 'lucide-react';
import type { LmModel, LmProvider } from '@/types/agents';

interface ModelCardProps {
  model: LmModel;
  provider?: LmProvider;
  isSelected?: boolean;
  onSelect?: (model: LmModel) => void;
  onDelete?: (e: React.MouseEvent, model: LmModel) => void;
  onCopy?: (model: LmModel) => void;
}

// Tier configurations with colors and emojis
const TIER_CONFIG: Record<
  string,
  { emoji: string; color: string; bgColor: string; label: string }
> = {
  entry: {
    emoji: '🚀',
    color: 'text-green-600',
    bgColor: 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800',
    label: 'Entry',
  },
  balanced: {
    emoji: '⚡',
    color: 'text-blue-600',
    bgColor: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800',
    label: 'Balanced',
  },
  pro: {
    emoji: '💎',
    color: 'text-purple-600',
    bgColor: 'bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800',
    label: 'Pro',
  },
  flagship: {
    emoji: '👑',
    color: 'text-amber-600',
    bgColor: 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800',
    label: 'Flagship',
  },
};

function formatTokens(tokens: number | undefined): string {
  if (!tokens) return '—';
  if (tokens >= 1_000_000) return `${(tokens / 1_000_000).toFixed(1)}M`;
  if (tokens >= 1_000) return `${(tokens / 1_000).toFixed(0)}K`;
  return tokens.toString();
}

export function ModelCard({
  model,
  provider,
  isSelected,
  onSelect,
  onDelete,
  onCopy,
}: ModelCardProps) {
  const barColor = provider?.color_hex || '#64748B';
  const tierConfig = model.tier ? TIER_CONFIG[model.tier] : null;

  return (
    <div
      role="button"
      tabIndex={0}
      className={cn(
        'relative flex cursor-pointer flex-col rounded-lg border transition-colors',
        'p-4 hover:bg-muted/50',
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
      {/* Barra lateral colorida */}
      <div
        className="absolute bottom-0 left-0 top-0 w-1 rounded-l-lg"
        style={{ backgroundColor: barColor }}
      />

      <div className="flex-1 space-y-2 pl-1">
        {/* SEÇÃO 1: HEADER - Nome + Tier Badge */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 space-y-0.5">
            <h3 className="text-sm font-semibold text-foreground">{model.name}</h3>
            <p className="font-mono text-xs text-muted-foreground">{model.model_id}</p>
          </div>
          {tierConfig && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Badge
                  variant="outline"
                  className={cn(
                    'cursor-help whitespace-nowrap border text-[10px] font-semibold',
                    tierConfig.bgColor,
                    tierConfig.color,
                  )}
                >
                  {tierConfig.emoji} {tierConfig.label}
                </Badge>
              </TooltipTrigger>
              <TooltipContent side="left" className="max-w-xs text-xs">
                {model.tier === 'entry'
                  ? 'entry: Gratuito/low-cost'
                  : model.tier === 'balanced'
                    ? 'balanced: Recomendado (padrão)'
                    : model.tier === 'pro'
                      ? 'pro: Profissional'
                      : 'flagship: Cutting-edge'}
              </TooltipContent>
            </Tooltip>
          )}
        </div>

        {/* SEÇÃO 2: CONTEXTO + TOKENS */}
        <div className="space-y-1 border-t border-border/30 pt-2">
          {provider && (
            <div>
              <p className="text-[10px] text-muted-foreground">Provedor:</p>
              <div className="flex items-center gap-2">
                <span className="text-lg">{provider.icon_emoji || '🤖'}</span>
                <span className="text-xs font-semibold text-foreground">{provider.name}</span>
              </div>
            </div>
          )}

          {/* Context Window */}
          {model.context_window != null && (
            <div>
              <Tooltip>
                <TooltipTrigger asChild>
                  <p className="cursor-help border-b border-dashed border-muted-foreground/30 text-[10px] text-muted-foreground">
                    Contexto (entrada)
                  </p>
                </TooltipTrigger>
                <TooltipContent side="right" className="max-w-xs text-xs">
                  Máximo de tokens que o modelo pode processar de uma vez
                </TooltipContent>
              </Tooltip>
              <p className="font-mono text-xs text-foreground">
                {formatTokens(model.context_window)} tokens
              </p>
            </div>
          )}

          {/* Max Tokens (Saída) */}
          {model.max_tokens != null && (
            <div>
              <p className="text-[10px] text-muted-foreground">Saída (máx.):</p>
              <p className="font-mono text-xs text-foreground">
                {formatTokens(model.max_tokens)} tokens
              </p>
            </div>
          )}
        </div>

        {/* SEÇÃO 3: CUSTOS */}
        {(model.input_cost_per_1k_tokens != null || model.output_cost_per_1k_tokens != null) && (
          <div className="space-y-1 border-t border-border/30 pt-2">
            <p className="text-[10px] text-muted-foreground">Custo por 1K tokens:</p>
            {model.input_cost_per_1k_tokens != null && (
              <p className="text-xs text-foreground">
                💰 Entrada: ${model.input_cost_per_1k_tokens.toFixed(6)}
              </p>
            )}
            {model.output_cost_per_1k_tokens != null && (
              <p className="text-xs text-foreground">
                💰 Saída: ${model.output_cost_per_1k_tokens.toFixed(6)}
              </p>
            )}
          </div>
        )}

        {/* SEÇÃO 4: DOCUMENTAÇÃO */}
        {model.docs_url && (
          <div className="flex items-center gap-2 space-y-1 border-t border-border/30 pt-2">
            <p className="text-[10px] text-muted-foreground">Docs:</p>
            <a
              href={model.docs_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1"
              onClick={(e) => e.stopPropagation()}
            >
              <span className="truncate text-xs text-primary underline">Ver documentação</span>
              <ExternalLink className="h-3 w-3 text-muted-foreground hover:text-foreground" />
            </a>
          </div>
        )}

        {/* SEÇÃO 5: RODAPÉ - Status + Ações */}
        <div className="flex items-center justify-between border-t border-border/30 pt-2">
          <Badge variant="outline" className="bg-blue-50 text-[10px] dark:bg-blue-900/20">
            🤖 Modelo IA
          </Badge>

          {/* Ações */}
          <div role="presentation" className="flex gap-1" onClick={(e) => e.stopPropagation()}>
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
        </div>
      </div>
    </div>
  );
}
