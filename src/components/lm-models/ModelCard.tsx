import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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

export function ModelCard({
  model,
  provider,
  isSelected,
  onSelect,
  onDelete,
  onCopy,
}: ModelCardProps) {
  const barColor = provider?.color_hex || '#64748B';

  return (
    <div
      role="button"
      tabIndex={0}
      className={cn(
        'cursor-pointer relative flex flex-col rounded-lg border transition-colors',
        'hover:bg-muted/50 p-4',
        isSelected && 'border-primary bg-primary/5'
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
        className="absolute left-0 top-0 bottom-0 w-1 rounded-l-lg"
        style={{ backgroundColor: barColor }}
      />

      <div className="flex-1 space-y-2 pl-1">
        {/* SEÇÃO 1: HEADER - Nome + Model ID */}
        <div className="space-y-0.5">
          <h3 className="font-semibold text-sm text-foreground">{model.name}</h3>
          <p className="text-xs font-mono text-muted-foreground">{model.model_id}</p>
        </div>

        {/* SEÇÃO 2: FORNECEDOR + CONTEXTO */}
        <div className="space-y-1 border-t border-border/30 pt-2">
          {provider && (
            <div>
              <p className="text-[10px] text-muted-foreground">Fornecedor:</p>
              <div className="flex items-center gap-2">
                <span className="text-lg">{provider.icon_emoji || '🤖'}</span>
                <span className="text-xs font-semibold text-foreground">{provider.name}</span>
              </div>
            </div>
          )}
          {model.context_length && (
            <div>
              <p className="text-[10px] text-muted-foreground">Contexto:</p>
              <p className="text-xs text-foreground">
                {model.context_length.toLocaleString('pt-BR')} tokens
              </p>
            </div>
          )}
        </div>

        {/* SEÇÃO 3: DOCUMENTAÇÃO */}
        {model.docs_url && (
          <div className="space-y-1 border-t border-border/30 pt-2 flex items-center gap-2">
            <p className="text-[10px] text-muted-foreground">Docs:</p>
            <a
              href={model.docs_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1"
              onClick={(e) => e.stopPropagation()}
            >
              <span className="text-xs text-primary underline truncate">Ver documentação</span>
              <ExternalLink className="h-3 w-3 text-muted-foreground hover:text-foreground" />
            </a>
          </div>
        )}

        {/* SEÇÃO 4: RODAPÉ - Status + Ações */}
        <div className="flex items-center justify-between border-t border-border/30 pt-2">
          <Badge variant="outline" className="text-[10px] bg-blue-50 dark:bg-blue-900/20">
            🤖 Modelo IA
          </Badge>

          {/* Ações */}
          <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
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
