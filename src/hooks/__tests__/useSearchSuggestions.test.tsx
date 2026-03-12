import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useSearchSuggestions } from '../useSearchSuggestions';
import { describe, it, expect, beforeEach, vi } from 'vitest';

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });
  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  Wrapper.displayName = 'TestWrapper';
  return Wrapper;
};

describe('useSearchSuggestions', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('should return empty array for empty query', () => {
    const { result } = renderHook(() => useSearchSuggestions(''), {
      wrapper: createWrapper(),
    });

    expect(result.current.suggestions).toEqual([]);
    expect(result.current.isLoading).toBe(false);
  });

  it('should return empty array for query shorter than 2 chars', () => {
    const { result } = renderHook(() => useSearchSuggestions('a'), {
      wrapper: createWrapper(),
    });

    expect(result.current.suggestions).toEqual([]);
    expect(result.current.isLoading).toBe(false);
  });

  it('should fetch suggestions for valid query', async () => {
    const mockSuggestions = [
      {
        id: 'test-1',
        text: 'Test Suggestion',
        type: 'system' as const,
        frequency: 5,
        timestamp: new Date().toISOString(),
      },
    ];

    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            suggestions: mockSuggestions,
            cached: false,
          }),
      }),
    ) as any;

    const { result } = renderHook(() => useSearchSuggestions('test'), {
      wrapper: createWrapper(),
    });

    await waitFor(
      () => {
        expect(result.current.suggestions.length).toBeGreaterThan(0);
      },
      { timeout: 3000 },
    );
  });

  it('should cache suggestions in localStorage', async () => {
    const mockSuggestions = [
      {
        id: 'test-1',
        text: 'Test',
        type: 'system' as const,
        frequency: 5,
        timestamp: new Date().toISOString(),
      },
    ];

    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            suggestions: mockSuggestions,
            cached: false,
          }),
      }),
    ) as any;

    const { result } = renderHook(() => useSearchSuggestions('test'), {
      wrapper: createWrapper(),
    });

    await waitFor(
      () => {
        expect(localStorage.getItem('search_suggestions_cache')).toBeTruthy();
      },
      { timeout: 3000 },
    );
  });

  it('should handle API errors gracefully', async () => {
    global.fetch = vi.fn(() =>
      Promise.reject(new Error('Network error')),
    ) as any;

    const { result } = renderHook(() => useSearchSuggestions('test'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.error).toBeDefined();
    });

    expect(result.current.suggestions).toEqual([]);
  });
});
