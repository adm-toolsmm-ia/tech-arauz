/**
 * GlobalSearch Component
 * Global search bar with real-time results and keyboard shortcuts
 */

'use client';

import * as React from 'react';
import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface GlobalSearchProps {
  onSearch: (query: string) => void;
  placeholder?: string;
  className?: string;
}

export function GlobalSearch({
  onSearch,
  placeholder = 'Buscar por nome, código, objetivo...',
  className,
}: GlobalSearchProps) {
  const [query, setQuery] = React.useState('');
  const [isFocused, setIsFocused] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const searchTimeoutRef = React.useRef<NodeJS.Timeout>();

  // Keyboard shortcut: Cmd+K or Ctrl+K to focus search
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd+K (Mac) or Ctrl+K (Windows/Linux)
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
      }
      // Escape to blur
      if (e.key === 'Escape' && isFocused) {
        inputRef.current?.blur();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isFocused]);

  // Debounced search
  const handleInputChange = React.useCallback(
    (value: string) => {
      setQuery(value);

      // Clear existing timeout
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }

      // Set new timeout for debounced search (300ms)
      searchTimeoutRef.current = setTimeout(() => {
        onSearch(value);
      }, 300);
    },
    [onSearch],
  );

  const handleClear = React.useCallback(() => {
    setQuery('');
    onSearch('');
    inputRef.current?.focus();
  }, [onSearch]);

  return (
    <div className={cn('relative w-full max-w-sm', className)}>
      <div className="relative">
        {/* Search Icon */}
        <Search className="pointer-events-none absolute left-3 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

        {/* Input */}
        <Input
          ref={inputRef}
          type="search"
          placeholder={placeholder}
          value={query}
          onChange={(e) => handleInputChange(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className={cn(
            'pl-9 pr-9',
            'transition-all duration-200',
            isFocused && 'ring-2 ring-primary ring-offset-2',
          )}
          aria-label="Buscar projetos"
          role="searchbox"
          aria-describedby="search-help"
          data-testid="global-search-input"
        />

        {/* Clear Button */}
        {query && (
          <button
            onClick={handleClear}
            className={cn(
              'absolute right-3 top-1/2 -translate-y-1/2',
              'text-muted-foreground hover:text-foreground',
              'transition-colors duration-200',
              'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary',
              'p-0.5',
            )}
            aria-label="Limpar busca"
            type="button"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Help Text */}
      <p id="search-help" className="mt-1 text-xs text-muted-foreground">
        💡 Digite para buscar. Use{' '}
        <kbd className="rounded bg-muted px-1.5 py-0.5 text-xs">Cmd+K</kbd> para focar.
      </p>
    </div>
  );
}
