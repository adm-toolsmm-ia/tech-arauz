import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe, toHaveNoViolations } from 'jest-axe';
import { OrganizationSearchBar } from '../OrganizationSearchBar';
import * as orgActions from '@/app/actions/organization';
import type { SearchResult } from '@/lib/organization/search';

expect.extend(toHaveNoViolations);

// Mock the searchOrganizationAction
vi.mock('@/app/actions/organization', () => ({
  searchOrganizationAction: vi.fn(),
}));

describe('OrganizationSearchBar', () => {
  const mockSearchResults: SearchResult[] = [
    {
      id: '1',
      type: 'area',
      name: 'Recuperação de Crédito',
      breadcrumb: 'Recuperação de Crédito',
      score: 100,
    },
    {
      id: '2',
      type: 'process',
      name: 'Análise de Crédito',
      breadcrumb: 'Recuperação / Análise de Crédito',
      score: 90,
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should render search input with placeholder', () => {
    render(<OrganizationSearchBar />);
    const input = screen.getByPlaceholderText(
      'Buscar áreas, processos, atividades...'
    );
    expect(input).toBeInTheDocument();
  });

  it('should render custom placeholder when provided', () => {
    render(
      <OrganizationSearchBar placeholder="Custom placeholder" />
    );
    const input = screen.getByPlaceholderText('Custom placeholder');
    expect(input).toBeInTheDocument();
  });

  it('should show advanced filters button', () => {
    render(<OrganizationSearchBar />);
    const filterButton = screen.getByRole('button', { name: /Filtros/i });
    expect(filterButton).toBeInTheDocument();
  });

  it('should handle search query', async () => {
    const mockSearchAction = vi.mocked(orgActions.searchOrganizationAction);
    mockSearchAction.mockResolvedValueOnce({
      success: true,
      message: 'Resultados encontrados',
      data: mockSearchResults,
    });

    const user = userEvent.setup();
    render(<OrganizationSearchBar />);

    const input = screen.getByRole('textbox', { name: /Buscar organizações/i });
    await user.type(input, 'Recuperação');

    // Debounce wait
    await waitFor(
      () => {
        expect(mockSearchAction).toHaveBeenCalled();
      },
      { timeout: 500 }
    );
  });

  it('should display search results', async () => {
    const mockSearchAction = vi.mocked(orgActions.searchOrganizationAction);
    mockSearchAction.mockResolvedValueOnce({
      success: true,
      message: 'Resultados encontrados',
      data: mockSearchResults,
    });

    const user = userEvent.setup();
    render(<OrganizationSearchBar />);

    const input = screen.getByRole('textbox', { name: /Buscar organizações/i });
    await user.type(input, 'Recuperação');

    await waitFor(() => {
      expect(
        screen.getByText('Recuperação de Crédito')
      ).toBeInTheDocument();
    });
  });

  it('should call onSelect when result is clicked', async () => {
    const mockSearchAction = vi.mocked(orgActions.searchOrganizationAction);
    const onSelect = vi.fn();

    mockSearchAction.mockResolvedValueOnce({
      success: true,
      message: 'Resultados encontrados',
      data: mockSearchResults,
    });

    const user = userEvent.setup();
    render(<OrganizationSearchBar onSelect={onSelect} />);

    const input = screen.getByRole('textbox', { name: /Buscar organizações/i });
    await user.type(input, 'Recuperação');

    await waitFor(() => {
      expect(
        screen.getByText('Recuperação de Crédito')
      ).toBeInTheDocument();
    });

    const resultButton = screen.getByText('Recuperação de Crédito');
    await user.click(resultButton);

    expect(onSelect).toHaveBeenCalledWith(mockSearchResults[0]);
  });

  it('should show no results message when search returns empty', async () => {
    const mockSearchAction = vi.mocked(orgActions.searchOrganizationAction);
    mockSearchAction.mockResolvedValueOnce({
      success: true,
      message: 'Nenhum resultado',
      data: [],
    });

    const user = userEvent.setup();
    render(<OrganizationSearchBar />);

    const input = screen.getByRole('textbox', { name: /Buscar organizações/i });
    await user.type(input, 'Inexistente');

    await waitFor(() => {
      expect(
        screen.getByText(/Nenhum resultado encontrado/i)
      ).toBeInTheDocument();
    });
  });

  it('should clear query when clear button is clicked', async () => {
    const user = userEvent.setup();
    render(<OrganizationSearchBar />);

    const input = screen.getByRole('textbox', {
      name: /Buscar organizações/i,
    }) as HTMLInputElement;
    await user.type(input, 'test');

    // Wait for clear button to appear
    await waitFor(() => {
      const clearButton = screen.getByRole('button', { name: /Limpar busca/i });
      expect(clearButton).toBeInTheDocument();
    });

    const clearButton = screen.getByRole('button', { name: /Limpar busca/i });
    await user.click(clearButton);

    expect(input.value).toBe('');
  });

  it('should handle keyboard navigation (arrow keys)', async () => {
    const mockSearchAction = vi.mocked(orgActions.searchOrganizationAction);
    mockSearchAction.mockResolvedValueOnce({
      success: true,
      message: 'Resultados encontrados',
      data: mockSearchResults,
    });

    const user = userEvent.setup();
    render(<OrganizationSearchBar />);

    const input = screen.getByRole('textbox', { name: /Buscar organizações/i });
    await user.type(input, 'Recuperação');

    await waitFor(() => {
      expect(
        screen.getByText('Recuperação de Crédito')
      ).toBeInTheDocument();
    });

    // Press ArrowDown
    fireEvent.keyDown(input, { key: 'ArrowDown' });

    const options = screen.getAllByRole('option');
    expect(options[0]).toHaveAttribute('aria-selected', 'true');
  });

  it('should close results on Escape key', async () => {
    const mockSearchAction = vi.mocked(orgActions.searchOrganizationAction);
    mockSearchAction.mockResolvedValueOnce({
      success: true,
      message: 'Resultados encontrados',
      data: mockSearchResults,
    });

    const user = userEvent.setup();
    render(<OrganizationSearchBar />);

    const input = screen.getByRole('textbox', { name: /Buscar organizações/i });
    await user.type(input, 'Recuperação');

    await waitFor(() => {
      expect(
        screen.getByText('Recuperação de Crédito')
      ).toBeInTheDocument();
    });

    // Close with Escape
    fireEvent.keyDown(input, { key: 'Escape' });

    await waitFor(() => {
      expect(
        screen.queryByText('Recuperação de Crédito')
      ).not.toBeInTheDocument();
    });
  });

  it('should save search to recent searches in localStorage', async () => {
    const mockSearchAction = vi.mocked(orgActions.searchOrganizationAction);
    const onSelect = vi.fn();

    mockSearchAction.mockResolvedValueOnce({
      success: true,
      message: 'Resultados encontrados',
      data: mockSearchResults,
    });

    const user = userEvent.setup();
    render(<OrganizationSearchBar onSelect={onSelect} />);

    const input = screen.getByRole('textbox', { name: /Buscar organizações/i });
    await user.type(input, 'Recuperação');

    await waitFor(() => {
      expect(
        screen.getByText('Recuperação de Crédito')
      ).toBeInTheDocument();
    });

    const result = screen.getByText('Recuperação de Crédito');
    await user.click(result);

    const stored = localStorage.getItem('org-search-history');
    expect(stored).toBeDefined();
    const history = JSON.parse(stored!);
    expect(history[0]).toBe('Recuperação');
  });

  it('should be keyboard accessible', async () => {
    const { container } = render(<OrganizationSearchBar />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('should have proper ARIA labels', () => {
    render(<OrganizationSearchBar />);

    const input = screen.getByRole('textbox', { name: /Buscar organizações/i });
    expect(input).toHaveAttribute('aria-autocomplete', 'list');
    expect(input).toHaveAttribute('aria-controls', 'search-results');

    const filterButton = screen.getByRole('button', { name: /Filtros/i });
    expect(filterButton).toBeInTheDocument();
  });

  it('should display entity type badge in results', async () => {
    const mockSearchAction = vi.mocked(orgActions.searchOrganizationAction);
    mockSearchAction.mockResolvedValueOnce({
      success: true,
      message: 'Resultados encontrados',
      data: mockSearchResults,
    });

    const user = userEvent.setup();
    render(<OrganizationSearchBar />);

    const input = screen.getByRole('textbox', { name: /Buscar organizações/i });
    await user.type(input, 'Recuperação');

    await waitFor(() => {
      expect(screen.getByText('Área')).toBeInTheDocument();
      expect(screen.getByText('Processo')).toBeInTheDocument();
    });
  });
});
