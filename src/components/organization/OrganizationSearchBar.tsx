'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Search, ChevronDown, Loader2, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { SearchResult, SearchFilters, EntityType } from '@/lib/organization/search';
import { searchOrganizationAction } from '@/app/actions/organization';

interface OrganizationSearchBarProps {
  onSelect?: (result: SearchResult) => void;
  placeholder?: string;
  className?: string;
}

const ENTITY_TYPE_LABELS: Record<EntityType, string> = {
  area: 'Área',
  nucleus: 'Núcleo',
  process: 'Processo',
  routine: 'Rotina',
  activity: 'Atividade',
  system: 'Sistema',
  supplier: 'Fornecedor',
  service: 'Serviço',
  document: 'Documento',
};

/**
 * OrganizationSearchBar Component
 *
 * Provides full-text search across organizational entities with:
 * - Real-time search with debouncing
 * - Keyboard shortcuts (Cmd+K / Ctrl+K)
 * - Advanced filtering (collapsible panel)
 * - Recent searches in localStorage
 * - Search history display
 * - Responsive design
 * - WCAG AA accessibility
 *
 * Story 11.10: Advanced Search & Filter for Organizations
 */
export function OrganizationSearchBar({
  onSelect,
  placeholder = 'Buscar áreas, processos, atividades...',
  className = '',
}: OrganizationSearchBarProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [filters, setFilters] = useState<SearchFilters>({});
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<NodeJS.Timeout>();

  // Load recent searches from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('org-search-history');
    if (stored) {
      try {
        setRecentSearches(JSON.parse(stored).slice(0, 5));
      } catch (e) {
        // Ignore parse errors
      }
    }
  }, []);

  // Keyboard shortcut: Cmd+K or Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Handle search with debouncing
  const performSearch = useCallback(async (q: string, f: SearchFilters) => {
    if (!q.trim()) {
      setResults([]);
      setShowResults(false);
      return;
    }

    setLoading(true);
    setShowResults(true);

    try {
      const result = await searchOrganizationAction(q, f);
      if (result.success && result.data) {
        setResults(result.data);
        setSelectedIndex(-1);
      }
    } catch (error) {
      console.error('Search error:', error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleQueryChange = (value: string) => {
    setQuery(value);

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      performSearch(value, filters);
    }, 300); // 300ms debounce
  };

  const handleSelectResult = (result: SearchResult) => {
    // Save to recent searches
    const updated = [query, ...recentSearches.filter((s) => s !== query)].slice(
      0,
      5
    );
    setRecentSearches(updated);
    localStorage.setItem('org-search-history', JSON.stringify(updated));

    onSelect?.(result);
    setShowResults(false);
    setQuery('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showResults || results.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev < results.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev > 0 ? prev - 1 : results.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0) {
          handleSelectResult(results[selectedIndex]);
        }
        break;
      case 'Escape':
        e.preventDefault();
        setShowResults(false);
        break;
    }
  };

  const handleClearQuery = () => {
    setQuery('');
    setResults([]);
    setShowResults(false);
    inputRef.current?.focus();
  };

  return (
    <div className={`w-full space-y-2 ${className}`}>
      <div className="relative flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-muted-foreground" />
          <Input
            ref={inputRef}
            type="text"
            placeholder={placeholder}
            value={query}
            onChange={(e) => handleQueryChange(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => {
              if (query || recentSearches.length > 0) {
                setShowResults(true);
              }
            }}
            className="pl-10"
            aria-label="Buscar organizações"
            aria-autocomplete="list"
            aria-controls="search-results"
            aria-expanded={showResults}
          />
          {query && (
            <button
              onClick={handleClearQuery}
              className="absolute right-3 top-1/2 -translate-y-1/2 transform text-muted-foreground hover:text-foreground"
              aria-label="Limpar busca"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Advanced filter toggle */}
        <Popover open={showAdvanced} onOpenChange={setShowAdvanced}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
              aria-label="Filtros avançados"
            >
              <ChevronDown className="h-4 w-4" />
              Filtros
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-72">
            <div className="space-y-4">
              <h3 className="font-semibold text-sm">Filtros Avançados</h3>

              {/* Entity type filter */}
              <div>
                <label htmlFor="entity-type-filter" className="text-sm font-medium">Tipo de Entidade</label>
                <div id="entity-type-filter" className="mt-2 flex flex-wrap gap-2">
                  {(
                    [
                      'area',
                      'nucleus',
                      'process',
                      'routine',
                      'activity',
                      'system',
                      'supplier',
                      'service',
                      'document',
                    ] as EntityType[]
                  ).map((type) => (
                    <Badge
                      key={type}
                      variant={
                        filters.entityType?.includes(type)
                          ? 'default'
                          : 'outline'
                      }
                      className="cursor-pointer"
                      onClick={() => {
                        const currentTypes = Array.isArray(filters.entityType)
                          ? filters.entityType
                          : filters.entityType
                            ? [filters.entityType]
                            : [];

                        const updated = currentTypes.includes(type)
                          ? currentTypes.filter((t) => t !== type)
                          : [...currentTypes, type];

                        const newFilters = {
                          ...filters,
                          entityType: updated.length > 0 ? updated : undefined,
                        };
                        setFilters(newFilters);
                        if (query) {
                          performSearch(query, newFilters);
                        }
                      }}
                    >
                      {ENTITY_TYPE_LABELS[type]}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {/* Search results or recent searches */}
      {showResults && (
        <div
          ref={resultsRef}
          className="absolute left-0 right-0 top-full z-50 mt-2 w-full rounded-md border bg-popover shadow-md"
          id="search-results"
          role="listbox"
        >
          <ScrollArea className="max-h-96">
            {loading && (
              <div className="flex items-center justify-center px-4 py-8">
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                <span className="ml-2 text-sm text-muted-foreground">
                  Buscando...
                </span>
              </div>
            )}

            {!loading && results.length > 0 && (
              <div className="divide-y">
                {results.map((result, idx) => (
                  <button
                    key={result.id}
                    onClick={() => handleSelectResult(result)}
                    onMouseEnter={() => setSelectedIndex(idx)}
                    className={`w-full px-4 py-3 text-left transition-colors ${
                      idx === selectedIndex
                        ? 'bg-accent text-accent-foreground'
                        : 'hover:bg-muted'
                    }`}
                    role="option"
                    aria-selected={idx === selectedIndex}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="font-medium text-sm">{result.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {result.breadcrumb}
                        </p>
                      </div>
                      <Badge variant="secondary" className="ml-2">
                        {ENTITY_TYPE_LABELS[result.type]}
                      </Badge>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {!loading && query && results.length === 0 && (
              <div className="px-4 py-6 text-center">
                <p className="text-sm text-muted-foreground">
                  Nenhum resultado encontrado para &quot;{query}&quot;
                </p>
              </div>
            )}

            {!query && recentSearches.length > 0 && !loading && (
              <div className="divide-y">
                <div className="px-4 py-2">
                  <p className="text-xs font-semibold text-muted-foreground">
                    Buscas Recentes
                  </p>
                </div>
                {recentSearches.map((search, idx) => (
                  <button
                    key={search}
                    onClick={() => handleQueryChange(search)}
                    className={`w-full px-4 py-2 text-left text-sm transition-colors ${
                      idx === selectedIndex
                        ? 'bg-accent text-accent-foreground'
                        : 'hover:bg-muted'
                    }`}
                    role="option"
                    aria-selected={idx === selectedIndex}
                  >
                    {search}
                  </button>
                ))}
              </div>
            )}
          </ScrollArea>
        </div>
      )}
    </div>
  );
}
