import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { GlobalSearchMobileOptimized } from '@/components/filters/GlobalSearchMobileOptimized';
import { describe, it, expect, beforeEach, vi } from 'vitest';

const mockQueryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: false },
  },
});

const Wrapper = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={mockQueryClient}>{children}</QueryClientProvider>
);

describe('Search Suggestions - Integration Tests', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('should show suggestions when typing in search bar', async () => {
    const onSearch = vi.fn();

    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            suggestions: [
              {
                id: 'test-1',
                text: 'Test Suggestion',
                type: 'system',
                frequency: 5,
                timestamp: new Date().toISOString(),
              },
            ],
            cached: false,
          }),
      }),
    ) as any;

    render(
      <GlobalSearchMobileOptimized onSearch={onSearch} />,
      { wrapper: Wrapper },
    );

    const input = screen.getByTestId('global-search-input-mobile');

    // Type in search
    await userEvent.type(input, 'test');

    // Wait for suggestions
    await waitFor(
      () => {
        expect(screen.queryByText('Test Suggestion')).toBeInTheDocument();
      },
      { timeout: 3000 },
    );
  });

  it('should add search to history when selecting suggestion', async () => {
    const onSearch = vi.fn();

    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            suggestions: [
              {
                id: 'test-1',
                text: 'Selected Search',
                type: 'system',
                frequency: 5,
                timestamp: new Date().toISOString(),
              },
            ],
            cached: false,
          }),
      }),
    ) as any;

    render(
      <GlobalSearchMobileOptimized onSearch={onSearch} />,
      { wrapper: Wrapper },
    );

    const input = screen.getByTestId('global-search-input-mobile');
    await userEvent.type(input, 'selected');

    // Wait for suggestion
    await waitFor(() => {
      expect(screen.getByText('Selected Search')).toBeInTheDocument();
    });

    // Click suggestion
    const suggestion = screen.getByText('Selected Search').closest('button');
    if (suggestion) {
      fireEvent.click(suggestion);
    }

    // Verify search was called
    expect(onSearch).toHaveBeenCalledWith('Selected Search');

    // Verify history was updated
    const history = JSON.parse(localStorage.getItem('search_history') || '[]');
    expect(history).toHaveLength(1);
    expect(history[0].query).toBe('Selected Search');
  });

  it('should display recent searches when focused', async () => {
    const onSearch = vi.fn();

    // Pre-populate history
    localStorage.setItem(
      'search_history',
      JSON.stringify([
        {
          id: 'hist-1',
          query: 'Previous Search',
          timestamp: Date.now(),
        },
      ]),
    );

    render(
      <GlobalSearchMobileOptimized onSearch={onSearch} />,
      { wrapper: Wrapper },
    );

    const input = screen.getByTestId('global-search-input-mobile');

    // Focus input
    fireEvent.focus(input);

    // Recent search should appear
    await waitFor(() => {
      expect(screen.getByText('Previous Search')).toBeInTheDocument();
    });
  });

  it('should clear history when clear button is clicked', async () => {
    const onSearch = vi.fn();

    // Pre-populate history
    localStorage.setItem(
      'search_history',
      JSON.stringify([
        {
          id: 'hist-1',
          query: 'Search to Clear',
          timestamp: Date.now(),
        },
      ]),
    );

    render(
      <GlobalSearchMobileOptimized onSearch={onSearch} />,
      { wrapper: Wrapper },
    );

    const input = screen.getByTestId('global-search-input-mobile');

    // Focus to show history
    fireEvent.focus(input);

    // Wait for search to appear
    await waitFor(() => {
      expect(screen.getByText('Search to Clear')).toBeInTheDocument();
    });

    // Click clear button
    const clearButton = screen.getByLabelText('Limpar histórico de buscas');
    fireEvent.click(clearButton);

    // History should be cleared
    expect(localStorage.getItem('search_history')).toBeNull();
  });

  it('should support keyboard navigation in suggestions', async () => {
    const onSearch = vi.fn();

    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            suggestions: [
              {
                id: 'test-1',
                text: 'First',
                type: 'system',
                frequency: 5,
                timestamp: new Date().toISOString(),
              },
              {
                id: 'test-2',
                text: 'Second',
                type: 'system',
                frequency: 4,
                timestamp: new Date().toISOString(),
              },
            ],
            cached: false,
          }),
      }),
    ) as any;

    render(
      <GlobalSearchMobileOptimized onSearch={onSearch} />,
      { wrapper: Wrapper },
    );

    const input = screen.getByTestId('global-search-input-mobile');

    // Type to trigger suggestions
    await userEvent.type(input, 'test');

    // Wait for suggestions
    await waitFor(() => {
      expect(screen.getByText('First')).toBeInTheDocument();
    });

    // Test keyboard navigation
    fireEvent.keyDown(document, { key: 'ArrowDown' });

    await waitFor(() => {
      const button = screen.getByText('First').closest('button');
      expect(button).toHaveClass('bg-accent');
    });

    // Test enter to select
    fireEvent.keyDown(document, { key: 'Enter' });

    expect(onSearch).toHaveBeenCalledWith('First');
  });

  it('should handle API timeout gracefully', async () => {
    const onSearch = vi.fn();

    global.fetch = vi.fn(
      () =>
        new Promise((resolve) => {
          // Simulate timeout - never resolve
          setTimeout(() => {
            resolve({
              ok: true,
              json: () => Promise.resolve({ suggestions: [] }),
            });
          }, 10000);
        }),
    ) as any;

    render(
      <GlobalSearchMobileOptimized onSearch={onSearch} />,
      { wrapper: Wrapper },
    );

    const input = screen.getByTestId('global-search-input-mobile');

    // Type in search
    await userEvent.type(input, 'test');

    // Should show loading skeleton
    expect(screen.getByRole('listbox')).toBeInTheDocument();

    // Input should still be functional
    expect(input).toHaveFocus();
  });

  it('should be mobile responsive with proper touch targets', () => {
    const onSearch = vi.fn();

    render(
      <GlobalSearchMobileOptimized onSearch={onSearch} />,
      { wrapper: Wrapper },
    );

    const input = screen.getByTestId('global-search-input-mobile');

    // Check mobile classes
    expect(input).toHaveClass('min-h-11'); // 44px on mobile
    expect(input).toHaveClass('text-base'); // Larger text on mobile
  });
});
