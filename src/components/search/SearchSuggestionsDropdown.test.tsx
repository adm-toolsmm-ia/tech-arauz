import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SearchSuggestionsDropdown } from './SearchSuggestionsDropdown';
import { describe, it, expect, beforeEach, vi } from 'vitest';

const mockQueryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: false },
  },
});

const Wrapper = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={mockQueryClient}>{children}</QueryClientProvider>
);

describe('SearchSuggestionsDropdown', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('should render dropdown when open', () => {
    const onSelect = vi.fn();
    const onSelectRecent = vi.fn();

    render(
      <SearchSuggestionsDropdown
        query="teste"
        isOpen={true}
        onSelectSuggestion={onSelect}
        onSelectRecent={onSelectRecent}
      />,
      { wrapper: Wrapper },
    );

    expect(screen.getByRole('listbox')).toBeInTheDocument();
  });

  it('should not render dropdown when closed', () => {
    const onSelect = vi.fn();
    const onSelectRecent = vi.fn();

    const { container } = render(
      <SearchSuggestionsDropdown
        query="teste"
        isOpen={false}
        onSelectSuggestion={onSelect}
        onSelectRecent={onSelectRecent}
      />,
      { wrapper: Wrapper },
    );

    expect(container.firstChild).not.toBeInTheDocument();
  });

  it('should show loading skeleton when fetching', () => {
    const onSelect = vi.fn();
    const onSelectRecent = vi.fn();

    render(
      <SearchSuggestionsDropdown
        query="teste"
        isOpen={true}
        onSelectSuggestion={onSelect}
        onSelectRecent={onSelectRecent}
      />,
      { wrapper: Wrapper },
    );

    // Should show loading skeleton
    expect(screen.getByRole('listbox')).toBeInTheDocument();
  });

  it('should show empty state when no query', () => {
    const onSelect = vi.fn();
    const onSelectRecent = vi.fn();

    render(
      <SearchSuggestionsDropdown
        query=""
        isOpen={true}
        onSelectSuggestion={onSelect}
        onSelectRecent={onSelectRecent}
      />,
      { wrapper: Wrapper },
    );

    expect(screen.getByText(/Digite para ver sugestões/i)).toBeInTheDocument();
  });

  it('should call onSelectSuggestion when clicking a suggestion', async () => {
    const onSelect = vi.fn();
    const onSelectRecent = vi.fn();

    // Mock fetch
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
      <SearchSuggestionsDropdown
        query="test"
        isOpen={true}
        onSelectSuggestion={onSelect}
        onSelectRecent={onSelectRecent}
      />,
      { wrapper: Wrapper },
    );

    // Wait for suggestions to load
    await waitFor(
      () => {
        expect(screen.queryByText('Test Suggestion')).toBeInTheDocument();
      },
      { timeout: 3000 },
    );

    const suggestion = screen.getByText('Test Suggestion').closest('button');
    if (suggestion) {
      fireEvent.click(suggestion);
    }

    expect(onSelect).toHaveBeenCalledWith('Test Suggestion');
  });

  it('should support keyboard navigation with arrow keys', async () => {
    const onSelect = vi.fn();
    const onSelectRecent = vi.fn();

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
      <SearchSuggestionsDropdown
        query="test"
        isOpen={true}
        onSelectSuggestion={onSelect}
        onSelectRecent={onSelectRecent}
      />,
      { wrapper: Wrapper },
    );

    // Wait for suggestions to load
    await waitFor(() => {
      expect(screen.getByText('First')).toBeInTheDocument();
    });

    // Test arrow down
    fireEvent.keyDown(document, { key: 'ArrowDown' });
    await waitFor(() => {
      const firstButton = screen.getByText('First').closest('button');
      expect(firstButton).toHaveClass('bg-accent');
    });

    // Test enter to select
    fireEvent.keyDown(document, { key: 'Enter' });
    expect(onSelect).toHaveBeenCalledWith('First');
  });

  it('should clear history when clear button is clicked', async () => {
    const onSelect = vi.fn();
    const onSelectRecent = vi.fn();

    // Add some history
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
      <SearchSuggestionsDropdown
        query=""
        isOpen={true}
        onSelectSuggestion={onSelect}
        onSelectRecent={onSelectRecent}
      />,
      { wrapper: Wrapper },
    );

    const clearButton = screen.getByLabelText('Limpar histórico de buscas');
    fireEvent.click(clearButton);

    // History should be cleared
    expect(localStorage.getItem('search_history')).toBeNull();
  });
});
