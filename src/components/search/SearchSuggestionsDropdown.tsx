'use client';

import * as React from 'react';
import { Clock, Trash2, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useSearchSuggestions, type SuggestionItem } from '@/hooks/useSearchSuggestions';
import { useSearchHistory } from '@/hooks/useSearchHistory';

interface SearchSuggestionsDropdownProps {
  query: string;
  isOpen: boolean;
  onSelectSuggestion: (text: string) => void;
  onSelectRecent: (query: string) => void;
  className?: string;
  id?: string;
}

/**
 * SearchSuggestionsDropdown Component
 *
 * Displays:
 * 1. Recent searches (from localStorage)
 * 2. Frequent suggestions (from API cache)
 * 3. System suggestions
 *
 * Features:
 * - Keyboard navigation (arrow keys + Enter)
 * - Click to search with suggestion
 * - Clear history option
 * - Responsive design
 */
export function SearchSuggestionsDropdown({
  query,
  isOpen,
  onSelectSuggestion,
  onSelectRecent,
  className,
  id,
}: SearchSuggestionsDropdownProps) {
  const { suggestions, isLoading } = useSearchSuggestions(query);
  const { getRecentSearches, clearHistory } = useSearchHistory();
  const [highlightedIndex, setHighlightedIndex] = React.useState(-1);
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  const recentSearches = getRecentSearches(5);

  // Combine recent searches + suggestions
  const allItems = React.useMemo(() => {
    const items: Array<{ type: 'recent' | 'suggestion'; data: SuggestionItem | string }> = [];

    // Add recent searches
    if (recentSearches.length > 0) {
      recentSearches.forEach((search) => {
        items.push({
          type: 'recent',
          data: {
            id: search.id,
            text: search.query,
            type: 'recent',
            frequency: 1,
            timestamp: new Date(search.timestamp).toISOString(),
          } as SuggestionItem,
        });
      });
    }

    // Add suggestions
    if (suggestions.length > 0) {
      suggestions.forEach((suggestion) => {
        items.push({
          type: 'suggestion',
          data: suggestion,
        });
      });
    }

    return items.slice(0, 10); // Max 10 items
  }, [recentSearches, suggestions]);

  // Keyboard navigation
  React.useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setHighlightedIndex((prev) => (prev < allItems.length - 1 ? prev + 1 : 0));
          break;
        case 'ArrowUp':
          e.preventDefault();
          setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : allItems.length - 1));
          break;
        case 'Enter':
          e.preventDefault();
          if (highlightedIndex >= 0 && allItems[highlightedIndex]) {
            const item = allItems[highlightedIndex];
            const itemData = item.data as SuggestionItem;
            onSelectSuggestion(itemData.text);
          }
          break;
        case 'Escape':
          e.preventDefault();
          setHighlightedIndex(-1);
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, highlightedIndex, allItems, onSelectSuggestion]);

  // Reset highlight when items change
  React.useEffect(() => {
    setHighlightedIndex(-1);
  }, [query]);

  if (!isOpen) return null;

  return (
    <div
      ref={dropdownRef}
      id={id}
      className={cn(
        'absolute left-0 right-0 top-full z-50 mt-1',
        'rounded-md border border-border bg-popover text-popover-foreground shadow-md',
        'w-full',
        className,
      )}
      role="listbox"
    >
      <ScrollArea className="h-auto max-h-[300px]">
        {/* Loading State */}
        {isLoading && query.length >= 2 ? (
          <div className="space-y-2 p-2">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-8 w-full rounded" />
            ))}
          </div>
        ) : allItems.length === 0 ? (
          // Empty State
          <div className="px-4 py-8 text-center text-sm text-muted-foreground">
            {query.length === 0 ? 'Digite para ver sugestões' : 'Nenhuma sugestão encontrada'}
          </div>
        ) : (
          // Suggestions List
          <div className="flex flex-col">
            {allItems.map((item, index) => {
              const itemData = item.data as SuggestionItem;
              const isHighlighted = index === highlightedIndex;
              const isRecent = item.type === 'recent';

              return (
                <button
                  key={itemData.id}
                  onClick={() => {
                    if (isRecent) {
                      onSelectRecent(itemData.text);
                    } else {
                      onSelectSuggestion(itemData.text);
                    }
                  }}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2 text-left text-sm',
                    'border-b border-border/50 last:border-b-0',
                    'transition-colors duration-150',
                    'hover:bg-accent hover:text-accent-foreground',
                    isHighlighted && 'bg-accent text-accent-foreground',
                  )}
                  role="option"
                  aria-selected={isHighlighted}
                >
                  {/* Icon */}
                  <div className="flex-shrink-0">
                    {isRecent ? (
                      <Clock className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    )}
                  </div>

                  {/* Text with highlight */}
                  <div className="flex-1 truncate">
                    <span className="font-medium">{itemData.text}</span>
                    {!isRecent && itemData.frequency > 0 && (
                      <span className="ml-2 text-xs text-muted-foreground">
                        {itemData.frequency}x
                      </span>
                    )}
                  </div>

                  {/* Badge */}
                  {isRecent && (
                    <span className="flex-shrink-0 text-xs text-muted-foreground">recente</span>
                  )}
                </button>
              );
            })}

            {/* Footer: Clear History */}
            {recentSearches.length > 0 && (
              <button
                onClick={() => {
                  clearHistory();
                  setHighlightedIndex(-1);
                }}
                className={cn(
                  'flex items-center justify-center gap-2 px-3 py-2 text-sm',
                  'border-t border-border',
                  'text-muted-foreground hover:text-foreground',
                  'transition-colors duration-150',
                  'bg-muted/30 hover:bg-muted/60',
                )}
                aria-label="Limpar histórico de buscas"
              >
                <Trash2 className="h-4 w-4" />
                <span>Limpar histórico</span>
              </button>
            )}
          </div>
        )}
      </ScrollArea>
    </div>
  );
}
