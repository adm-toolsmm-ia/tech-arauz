import { useCallback, useEffect, useState } from 'react';

export interface SearchHistoryItem {
  id: string;
  query: string;
  timestamp: number;
  filters?: Record<string, string>;
}

const HISTORY_KEY = 'search_history';
const MAX_HISTORY_ITEMS = 20;
const HISTORY_RETENTION_DAYS = 30;

/**
 * Initialize or get search history from localStorage
 */
function getHistory(): SearchHistoryItem[] {
  try {
    const stored = localStorage.getItem(HISTORY_KEY);
    if (!stored) return [];

    const items = JSON.parse(stored) as SearchHistoryItem[];

    // Clean up old items (older than 30 days)
    const cutoffTime = Date.now() - HISTORY_RETENTION_DAYS * 24 * 60 * 60 * 1000;
    return items.filter((item) => item.timestamp > cutoffTime);
  } catch (error) {
    console.error('[useSearchHistory] Read error:', error);
    return [];
  }
}

/**
 * Save search history to localStorage
 */
function saveHistory(items: SearchHistoryItem[]): void {
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(items));
  } catch (error) {
    console.error('[useSearchHistory] Write error:', error);
  }
}

/**
 * Hook to manage search history
 *
 * Features:
 * - Store up to 20 recent searches
 * - Auto-cleanup: keeps searches from last 30 days only
 * - Cross-tab sync via storage events
 * - Manual clear history
 */
export function useSearchHistory() {
  const [history, setHistory] = useState<SearchHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load history on mount
  useEffect(() => {
    const items = getHistory();
    setHistory(items);
    setIsLoading(false);
  }, []);

  // Listen for storage changes (cross-tab sync)
  useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === HISTORY_KEY && event.newValue) {
        try {
          const items = JSON.parse(event.newValue) as SearchHistoryItem[];
          setHistory(items);
        } catch (error) {
          console.error('[useSearchHistory] Storage sync error:', error);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  /**
   * Add a search to history
   */
  const addSearch = useCallback(
    (query: string, filters?: Record<string, string>) => {
      if (!query || query.trim().length === 0) return;

      const item: SearchHistoryItem = {
        id: `search-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
        query: query.trim(),
        timestamp: Date.now(),
        filters,
      };

      const updated = [item, ...history].slice(0, MAX_HISTORY_ITEMS);
      setHistory(updated);
      saveHistory(updated);

      // Dispatch custom event for cross-tab sync
      window.dispatchEvent(
        new StorageEvent('storage', {
          key: HISTORY_KEY,
          newValue: JSON.stringify(updated),
          url: window.location.href,
        }),
      );
    },
    [history],
  );

  /**
   * Remove specific search from history
   */
  const removeSearch = useCallback(
    (id: string) => {
      const updated = history.filter((item) => item.id !== id);
      setHistory(updated);
      saveHistory(updated);
    },
    [history],
  );

  /**
   * Clear all search history
   */
  const clearHistory = useCallback(() => {
    setHistory([]);
    localStorage.removeItem(HISTORY_KEY);

    // Dispatch event for cross-tab sync
    window.dispatchEvent(
      new StorageEvent('storage', {
        key: HISTORY_KEY,
        newValue: null,
        url: window.location.href,
      }),
    );
  }, []);

  /**
   * Get recent searches (default: last 5)
   */
  const getRecentSearches = useCallback(
    (limit: number = 5) => {
      return history.slice(0, limit);
    },
    [history],
  );

  return {
    history,
    isLoading,
    addSearch,
    removeSearch,
    clearHistory,
    getRecentSearches,
  };
}
