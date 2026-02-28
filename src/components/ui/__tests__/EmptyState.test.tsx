import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { EmptyState } from '../EmptyState';
import { FolderOpen } from 'lucide-react';

describe('EmptyState', () => {
  it('renders title', () => {
    render(<EmptyState title="Nenhum item encontrado" />);
    expect(screen.getByText('Nenhum item encontrado')).toBeInTheDocument();
  });

  it('renders description when provided', () => {
    render(<EmptyState title="Vazio" description="Crie o primeiro item para começar." />);
    expect(screen.getByText('Crie o primeiro item para começar.')).toBeInTheDocument();
  });

  it('renders CTA button when actionLabel and onAction provided', () => {
    const onAction = vi.fn();
    render(<EmptyState title="Vazio" actionLabel="Criar Item" onAction={onAction} />);
    const button = screen.getByRole('button', { name: 'Criar Item' });
    expect(button).toBeInTheDocument();
    fireEvent.click(button);
    expect(onAction).toHaveBeenCalledOnce();
  });

  it('does not render button when actionLabel is not provided', () => {
    render(<EmptyState title="Vazio" />);
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('renders icon when provided', () => {
    const { container } = render(<EmptyState title="Vazio" icon={FolderOpen} />);
    expect(container.querySelector('svg')).toBeInTheDocument();
  });

  it('has role=status for accessibility', () => {
    render(<EmptyState title="Lista vazia" />);
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('renders secondary action button', () => {
    const onSecondary = vi.fn();
    render(<EmptyState title="Vazio" secondaryLabel="Limpar Filtros" onSecondary={onSecondary} />);
    const button = screen.getByRole('button', { name: 'Limpar Filtros' });
    fireEvent.click(button);
    expect(onSecondary).toHaveBeenCalledOnce();
  });

  it('applies custom className', () => {
    const { container } = render(<EmptyState title="Vazio" className="custom-empty" />);
    expect(container.firstChild).toHaveClass('custom-empty');
  });
});
