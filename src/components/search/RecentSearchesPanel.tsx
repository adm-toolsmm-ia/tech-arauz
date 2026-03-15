'use client';

import * as React from 'react';
import { Clock, Trash2, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useSearchHistory } from '@/hooks/useSearchHistory';

interface RecentSearchesPanelProps {
  onSelectSearch: (query: string) => void;
  maxItems?: number;
  className?: string;
}

/**
 * RecentSearchesPanel Component
 *
 * Displays recent search history with:
 * - Time-relative display (e.g., "2 hours ago")
 * - Click to re-execute search
 * - Individual or bulk delete options
 * - Responsive grid layout
 */
export function RecentSearchesPanel({
  onSelectSearch,
  maxItems = 5,
  className,
}: RecentSearchesPanelProps) {
  const { history, removeSearch, clearHistory } = useSearchHistory();

  const recentItems = React.useMemo(() => history.slice(0, maxItems), [history, maxItems]);

  const getTimeString = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;

    const minute = 60 * 1000;
    const hour = 60 * minute;
    const day = 24 * hour;

    if (diff < minute) return 'agora';
    if (diff < hour) return `${Math.floor(diff / minute)}m atrás`;
    if (diff < day) return `${Math.floor(diff / hour)}h atrás`;
    return `${Math.floor(diff / day)}d atrás`;
  };

  const handleClearAll = React.useCallback(() => {
    const confirmed = confirm(
      `Tem certeza que quer limpar as ${recentItems.length} buscas do histórico? Essa ação não pode ser desfeita.`,
    );
    if (confirmed) {
      clearHistory();
    }
  }, [recentItems.length, clearHistory]);

  if (recentItems.length === 0) {
    return (
      <div className={cn('py-8 text-center text-sm text-muted-foreground', className)}>
        <p>Nenhuma busca recente</p>
        <p className="mt-2 text-xs">Suas buscas aparecerão aqui</p>
      </div>
    );
  }

  return (
    <div className={className}>
      {/* Header */}
      <div className="mb-4 flex items-center justify-between px-4 pt-4">
        <h3 className="flex items-center gap-2 text-sm font-semibold">
          <Clock className="h-4 w-4" />
          Buscas Recentes
        </h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleClearAll}
          className="text-xs text-muted-foreground hover:text-foreground"
        >
          <Trash2 className="mr-1 h-3 w-3" />
          Limpar
        </Button>
      </div>

      {/* Scrollable List */}
      <ScrollArea className="h-auto max-h-[200px]">
        <div className="space-y-1 px-4">
          {recentItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onSelectSearch(item.query)}
              className={cn(
                'w-full rounded-sm px-3 py-2 text-left',
                'text-sm text-foreground',
                'hover:bg-accent/50',
                'transition-colors duration-150',
                'border border-transparent hover:border-accent',
                'group flex items-center justify-between',
              )}
            >
              <span className="truncate font-medium">{item.query}</span>
              <span className="ml-2 whitespace-nowrap text-xs text-muted-foreground">
                {getTimeString(item.timestamp)}
              </span>

              {/* Delete Button (hidden by default, shown on hover) */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  removeSearch(item.id);
                }}
                className={cn(
                  'hover:bg-destructive/20 ml-2 rounded p-1',
                  'opacity-0 group-hover:opacity-100',
                  'transition-opacity duration-150',
                )}
                aria-label={`Remover busca: ${item.query}`}
              >
                <Trash2 className="h-3 w-3 text-destructive" />
              </button>
            </button>
          ))}
        </div>
        <div className="py-2" />
      </ScrollArea>
    </div>
  );
}
