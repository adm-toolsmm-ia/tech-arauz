import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ErrorFallback } from '../ErrorFallback';

describe('ErrorFallback', () => {
  it('renders error message', () => {
    render(<ErrorFallback error={new Error('Something failed')} />);

    expect(screen.getByText('Algo deu errado')).toBeInTheDocument();
    expect(screen.getByText(/Ocorreu um erro inesperado/)).toBeInTheDocument();
  });

  it('renders label when provided', () => {
    render(<ErrorFallback error={new Error('fail')} label="Projetos" />);

    expect(screen.getByText('Algo deu errado em Projetos')).toBeInTheDocument();
  });

  it('renders retry button and calls onRetry', () => {
    const onRetry = vi.fn();
    render(<ErrorFallback error={new Error('fail')} onRetry={onRetry} />);

    const retryButton = screen.getByText('Tentar novamente');
    expect(retryButton).toBeInTheDocument();

    fireEvent.click(retryButton);
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it('renders home button', () => {
    render(<ErrorFallback error={new Error('fail')} />);

    expect(screen.getByText('Pagina inicial')).toBeInTheDocument();
  });

  it('does not render retry button when onRetry is not provided', () => {
    render(<ErrorFallback error={null} />);

    expect(screen.queryByText('Tentar novamente')).not.toBeInTheDocument();
  });

  it('renders support text', () => {
    render(<ErrorFallback error={null} />);

    expect(screen.getByText(/entre em contato com o suporte/)).toBeInTheDocument();
  });
});
