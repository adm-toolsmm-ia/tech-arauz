'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Lock, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { LmProvider } from '@/types/agents';

interface LmProviderListItemProps {
  provider: LmProvider;
  isSelected: boolean;
  onSelect: (provider: LmProvider) => void;
  onToggleActive: (provider: LmProvider) => void;
  onDelete: (provider: LmProvider) => void;
}

export function LmProviderListItem({
  provider,
  isSelected,
  onSelect,
  onToggleActive,
  onDelete,
}: LmProviderListItemProps) {
  return (
    <div
      role="button"
      tabIndex={0}
      className={cn(
        'hover:bg-muted/50 flex cursor-pointer flex-col rounded-lg border p-4 transition-colors',
        isSelected && 'border-primary bg-primary/5 ring-primary ring-2',
      )}
      onClick={() => onSelect(provider)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelect(provider);
        }
      }}
    >
      <div className="space-y-1.5">
        <span className="text-foreground/90 line-clamp-2 text-sm font-semibold leading-tight">
          {provider.icon_emoji || '🤖'} {provider.name}
        </span>
        {provider.description && (
          <p className="line-clamp-2 text-[11px] text-muted-foreground">{provider.description}</p>
        )}
        <div className="flex flex-wrap items-center gap-1">
          <Badge variant="outline" className="px-1.5 py-0 text-[10px]">
            {provider.slug}
          </Badge>
          {provider.is_system && (
            <Badge variant="outline" className="px-1.5 py-0 text-[10px]">
              <Lock className="mr-0.5 size-2.5" />
              Sistema
            </Badge>
          )}
          <Badge
            variant="secondary"
            className={cn(
              'px-1.5 py-0 text-[10px]',
              provider.is_active
                ? 'bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-200'
                : 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-200',
            )}
          >
            {provider.is_active ? 'Ativo' : 'Inativo'}
          </Badge>
        </div>
      </div>

      {!provider.is_system && (
        <div
          role="presentation"
          className="mt-2 flex justify-end gap-1 border-t border-border/30 pt-2"
          onClick={(e) => e.stopPropagation()}
        >
          <Button
            variant="ghost"
            size="sm"
            className="h-7 text-xs"
            title="Alternar status"
            onClick={(e) => {
              e.stopPropagation();
              onToggleActive(provider);
            }}
          >
            {provider.is_active ? 'Desativar' : 'Ativar'}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0"
            title="Deletar"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(provider);
            }}
          >
            <Trash2 className="h-3.5 w-3.5 text-red-500 hover:text-red-600" />
          </Button>
        </div>
      )}
    </div>
  );
}
