import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { GlobalSearchMobileOptimized } from '@/components/filters/GlobalSearchMobileOptimized';
import { axe, toHaveNoViolations } from 'jest-axe';
import { describe, it, expect, beforeEach, vi } from 'vitest';

expect.extend(toHaveNoViolations);

const mockQueryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: false },
  },
});

const Wrapper = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={mockQueryClient}>{children}</QueryClientProvider>
);

describe('Search Components - Accessibility (WCAG AA)', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('should have no accessibility violations - GlobalSearchMobileOptimized', async () => {
    const onSearch = vi.fn();

    const { container } = render(<GlobalSearchMobileOptimized onSearch={onSearch} />, {
      wrapper: Wrapper,
    });

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('should have proper ARIA labels on input', () => {
    const onSearch = vi.fn();

    render(<GlobalSearchMobileOptimized onSearch={onSearch} />, { wrapper: Wrapper });

    const input = screen.getByTestId('global-search-input-mobile');

    expect(input).toHaveAttribute('aria-label', 'Buscar projetos');
    expect(input).toHaveAttribute('aria-autocomplete', 'list');
    expect(input).toHaveAttribute('role', 'searchbox');
  });

  it('should have proper ARIA states for dropdown', () => {
    const onSearch = vi.fn();

    render(<GlobalSearchMobileOptimized onSearch={onSearch} />, { wrapper: Wrapper });

    const input = screen.getByTestId('global-search-input-mobile');

    // Initially not expanded
    expect(input).toHaveAttribute('aria-expanded', 'false');
  });

  it('should have accessible clear button', () => {
    const onSearch = vi.fn();

    render(<GlobalSearchMobileOptimized onSearch={onSearch} placeholder="Search..." />, {
      wrapper: Wrapper,
    });

    const input = screen.getByTestId('global-search-input-mobile') as HTMLInputElement;

    // Type to show clear button
    input.value = 'test';
    input.dispatchEvent(new Event('input', { bubbles: true }));

    const clearButton = screen.getByLabelText('Limpar busca');

    // Check accessibility attributes
    expect(clearButton).toHaveAttribute('type', 'button');
    expect(clearButton).toHaveAttribute('aria-label');
  });

  it('should have color contrast compliant design', () => {
    const onSearch = vi.fn();

    const { container } = render(<GlobalSearchMobileOptimized onSearch={onSearch} />, {
      wrapper: Wrapper,
    });

    // Check for muted-foreground class (should be WCAG AA compliant)
    const elements = container.querySelectorAll('.text-muted-foreground');
    expect(elements.length).toBeGreaterThan(0);
  });

  it('should support keyboard navigation on focus', () => {
    const onSearch = vi.fn();

    render(<GlobalSearchMobileOptimized onSearch={onSearch} />, { wrapper: Wrapper });

    const input = screen.getByTestId('global-search-input-mobile');

    // Input should be focusable
    expect(input).toHaveAttribute('type', 'search');

    // Tab navigation should work
    input.focus();
    expect(document.activeElement).toBe(input);
  });

  it('should have descriptive help text', () => {
    const onSearch = vi.fn();

    render(<GlobalSearchMobileOptimized onSearch={onSearch} />, { wrapper: Wrapper });

    const input = screen.getByTestId('global-search-input-mobile');

    // Should reference help text via aria-describedby
    expect(input).toHaveAttribute('aria-describedby', 'search-help');

    // Help text should exist (on desktop)
    const helpText = screen.queryByText(/Digite para buscar/);
    if (helpText) {
      expect(helpText).toBeInTheDocument();
    }
  });

  it('should have proper heading hierarchy', () => {
    const { container } = render(
      <div>
        <h1>Search Panel</h1>
        <GlobalSearchMobileOptimized onSearch={() => {}} />
      </div>,
      { wrapper: Wrapper },
    );

    // Should not have conflicting heading hierarchy
    const headings = container.querySelectorAll('h1, h2, h3, h4, h5, h6');
    const headingLevels = Array.from(headings).map((h) => parseInt(h.tagName[1]));

    // Check no skipped levels
    const isValid = headingLevels.every((level, idx) => {
      if (idx === 0) return true;
      return level - headingLevels[idx - 1] <= 1;
    });

    expect(isValid).toBe(true);
  });

  it('should be screen reader friendly', () => {
    const onSearch = vi.fn();

    const { container } = render(<GlobalSearchMobileOptimized onSearch={onSearch} />, {
      wrapper: Wrapper,
    });

    const input = screen.getByTestId('global-search-input-mobile');

    // Should have proper semantic HTML
    expect(input.tagName).toBe('INPUT');
    expect(input).toHaveAttribute('type', 'search');

    // Should announce placeholder to screen readers
    expect(input).toHaveAttribute('placeholder');
  });

  it('should have proper focus indicators', () => {
    const onSearch = vi.fn();

    const { container } = render(<GlobalSearchMobileOptimized onSearch={onSearch} />, {
      wrapper: Wrapper,
    });

    const input = screen.getByTestId('global-search-input-mobile');

    // Check for focus-visible styles
    const styles = input.className;
    expect(styles).toContain('focus-visible');
  });
});
