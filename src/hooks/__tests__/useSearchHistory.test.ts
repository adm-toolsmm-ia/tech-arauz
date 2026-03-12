import { renderHook, act } from '@testing-library/react';
import { useSearchHistory } from '../useSearchHistory';
import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('useSearchHistory', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('should initialize with empty history', () => {
    const { result } = renderHook(() => useSearchHistory());

    expect(result.current.history).toEqual([]);
    expect(result.current.isLoading).toBe(false);
  });

  it('should add search to history', () => {
    const { result } = renderHook(() => useSearchHistory());

    act(() => {
      result.current.addSearch('Test Query');
    });

    expect(result.current.history).toHaveLength(1);
    expect(result.current.history[0].query).toBe('Test Query');
  });

  it('should not add empty searches', () => {
    const { result } = renderHook(() => useSearchHistory());

    act(() => {
      result.current.addSearch('');
    });

    expect(result.current.history).toHaveLength(0);
  });

  it('should limit history to 20 items', () => {
    const { result } = renderHook(() => useSearchHistory());

    act(() => {
      for (let i = 0; i < 25; i++) {
        result.current.addSearch(`Query ${i}`);
      }
    });

    expect(result.current.history).toHaveLength(20);
  });

  it('should persist history to localStorage', () => {
    const { result } = renderHook(() => useSearchHistory());

    act(() => {
      result.current.addSearch('Persistent Query');
    });

    const stored = localStorage.getItem('search_history');
    expect(stored).toBeTruthy();

    const parsed = JSON.parse(stored!);
    expect(parsed).toHaveLength(1);
    expect(parsed[0].query).toBe('Persistent Query');
  });

  it('should remove specific search from history', () => {
    const { result } = renderHook(() => useSearchHistory());

    act(() => {
      result.current.addSearch('Query 1');
      result.current.addSearch('Query 2');
    });

    expect(result.current.history).toHaveLength(2);

    const idToRemove = result.current.history[0].id;

    act(() => {
      result.current.removeSearch(idToRemove);
    });

    expect(result.current.history).toHaveLength(1);
    expect(result.current.history[0].id).not.toBe(idToRemove);
  });

  it('should clear all history', () => {
    const { result } = renderHook(() => useSearchHistory());

    act(() => {
      result.current.addSearch('Query 1');
      result.current.addSearch('Query 2');
      result.current.addSearch('Query 3');
    });

    expect(result.current.history).toHaveLength(3);

    act(() => {
      result.current.clearHistory();
    });

    expect(result.current.history).toHaveLength(0);
    expect(localStorage.getItem('search_history')).toBeNull();
  });

  it('should get recent searches with limit', () => {
    const { result } = renderHook(() => useSearchHistory());

    act(() => {
      result.current.addSearch('Query 1');
      result.current.addSearch('Query 2');
      result.current.addSearch('Query 3');
      result.current.addSearch('Query 4');
      result.current.addSearch('Query 5');
    });

    const recent = result.current.getRecentSearches(3);
    expect(recent).toHaveLength(3);
    expect(recent[0].query).toBe('Query 5');
  });

  it('should sync history across tabs via storage event', () => {
    const { result } = renderHook(() => useSearchHistory());

    act(() => {
      result.current.addSearch('Query 1');
    });

    // Simulate storage change from another tab
    const newHistory = [
      {
        id: 'test-1',
        query: 'Query from another tab',
        timestamp: Date.now(),
      },
    ];

    act(() => {
      window.dispatchEvent(
        new StorageEvent('storage', {
          key: 'search_history',
          newValue: JSON.stringify(newHistory),
          url: window.location.href,
        }),
      );
    });

    expect(result.current.history).toHaveLength(1);
    expect(result.current.history[0].query).toBe('Query from another tab');
  });

  it('should clean up old searches (> 30 days)', () => {
    const { result } = renderHook(() => useSearchHistory());

    // Create old search (31 days ago)
    const oldTimestamp = Date.now() - 31 * 24 * 60 * 60 * 1000;
    const newTimestamp = Date.now();

    const oldSearch = {
      id: 'old-1',
      query: 'Old Query',
      timestamp: oldTimestamp,
    };

    const newSearch = {
      id: 'new-1',
      query: 'New Query',
      timestamp: newTimestamp,
    };

    localStorage.setItem('search_history', JSON.stringify([oldSearch, newSearch]));

    const { result: result2 } = renderHook(() => useSearchHistory());

    expect(result2.current.history).toHaveLength(1);
    expect(result2.current.history[0].query).toBe('New Query');
  });
});
