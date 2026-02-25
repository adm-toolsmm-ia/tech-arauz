import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Lock, Zap, ExternalLink, Edit, Trash2 } from 'lucide-react';
import type { LmProvider } from '@/types/agents';

interface ProviderCardProps {
  provider: LmProvider;
  isSelected?: boolean;
  onSelect?: (provider: LmProvider) => void;
  onEdit?: (provider: LmProvider) => void;
  onDelete?: (e: React.MouseEvent, provider: LmProvider) => void;
}

export function ProviderCard({
  provider,
  isSelected,
  onSelect,
  onEdit,
  onDelete,
}: ProviderCardProps) {
  const barColor = provider.color_hex || '#64748B';

  return (
    <div
      role="button"
      tabIndex={0}
      className={cn(
        'cursor-pointer relative flex flex-col rounded-lg border transition-colors',
        'hover:bg-muted/50 p-4',
        isSelected && 'border-primary bg-primary/5'
      )}
      onClick={() => onSelect?.(provider)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelect?.(provider);
        }
      }}
    >
      {/* Barra lateral colorida */}
      <div
        className="absolute left-0 top-0 bottom-0 w-1 rounded-l-lg"
        style={{ backgroundColor: barColor }}
      />

      <div className="flex-1 space-y-2 pl-1">
        {/* SEÇÃO 1: HEADER - Título + Slug */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 space-y-0.5">
            <div className="flex items-center gap-2">
              <span className="text-2xl">{provider.icon_emoji || '🤖'}</span>
              <div className="flex-1">
                <h3 className="font-semibold text-sm text-foreground">{provider.name}</h3>
                <p className="text-xs font-mono text-muted-foreground">{provider.slug}</p>
              </div>
            </div>
            {provider.description && (
              <p className="text-xs text-muted-foreground line-clamp-2">{provider.description}</p>
            )}
          </div>
        </div>

        {/* SEÇÃO 2: API Endpoint */}
        {provider.api_endpoint && (
          <div className="space-y-1 border-t border-border/30 pt-2">
            <p className="text-[10px] text-muted-foreground">Endpoint da API:</p>
            <div className="flex items-center gap-2">
              <p className="text-xs font-mono text-foreground/70 line-clamp-1">
                {provider.api_endpoint}
              </p>
              {provider.docs_url && (
                <a
                  href={provider.docs_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="shrink-0"
                  onClick={(e) => e.stopPropagation()}
                >
                  <ExternalLink className="h-3 w-3 text-muted-foreground hover:text-foreground" />
                </a>
              )}
            </div>
          </div>
        )}

        {/* SEÇÃO 3: RODAPÉ - Status + Ações */}
        <div className="flex items-center justify-between border-t border-border/30 pt-2">
          <div className="flex items-center gap-2">
            {provider.is_system && (
              <Badge variant="outline" className="text-[10px]">
                <Lock className="h-3 w-3 mr-1" />
                Sistema
              </Badge>
            )}
            {provider.is_active ? (
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
          {!provider.is_system && (
            <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
              {onEdit && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 w-7 p-0"
                  title="Editar"
                  onClick={() => onEdit(provider)}
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
                  onClick={(e) => onDelete(e, provider)}
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
