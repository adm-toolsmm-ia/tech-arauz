/**
 * Test suite for BulkActionToolbar component
 * Story 11.13: Bulk Operations & Import/Export
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BulkActionToolbar } from '../BulkActionToolbar';

describe('BulkActionToolbar', () => {
  it('should not render when selectedCount is 0', () => {
    const { container } = render(
      <BulkActionToolbar
        selectedCount={0}
        entityType="areas"
        onBulkUpdate={vi.fn()}
        onBulkDelete={vi.fn()}
        onExport={vi.fn()}
        onImport={vi.fn()}
      />,
    );

    expect(container).toBeEmptyDOMElement();
  });

  it('should render when selectedCount > 0', () => {
    render(
      <BulkActionToolbar
        selectedCount={3}
        entityType="areas"
        onBulkUpdate={vi.fn()}
        onBulkDelete={vi.fn()}
        onExport={vi.fn()}
        onImport={vi.fn()}
      />,
    );

    expect(screen.getByText(/3 selecionado/i)).toBeInTheDocument();
  });

  it('should display correct entity type', () => {
    render(
      <BulkActionToolbar
        selectedCount={5}
        entityType="processos"
        onBulkUpdate={vi.fn()}
        onBulkDelete={vi.fn()}
        onExport={vi.fn()}
        onImport={vi.fn()}
      />,
    );

    expect(screen.getByText(/de processos/i)).toBeInTheDocument();
  });

  it('should show edit button', () => {
    render(
      <BulkActionToolbar
        selectedCount={2}
        entityType="areas"
        onBulkUpdate={vi.fn()}
        onBulkDelete={vi.fn()}
        onExport={vi.fn()}
        onImport={vi.fn()}
      />,
    );

    expect(screen.getByText('Editar')).toBeInTheDocument();
  });

  it('should show delete button', () => {
    render(
      <BulkActionToolbar
        selectedCount={2}
        entityType="areas"
        onBulkUpdate={vi.fn()}
        onBulkDelete={vi.fn()}
        onExport={vi.fn()}
        onImport={vi.fn()}
      />,
    );

    expect(screen.getByText('Deletar')).toBeInTheDocument();
  });

  it('should show more options dropdown', () => {
    render(
      <BulkActionToolbar
        selectedCount={2}
        entityType="areas"
        onBulkUpdate={vi.fn()}
        onBulkDelete={vi.fn()}
        onExport={vi.fn()}
        onImport={vi.fn()}
      />,
    );

    expect(screen.getByText('Mais')).toBeInTheDocument();
  });

  it('should disable buttons when disabled prop is true', () => {
    render(
      <BulkActionToolbar
        selectedCount={2}
        entityType="areas"
        disabled={true}
        onBulkUpdate={vi.fn()}
        onBulkDelete={vi.fn()}
        onExport={vi.fn()}
        onImport={vi.fn()}
      />,
    );

    const editButton = screen.getByText('Editar');
    const deleteButton = screen.getByText('Deletar');

    expect(editButton).toBeDisabled();
    expect(deleteButton).toBeDisabled();
  });

  it('should disable buttons when isLoading is true', () => {
    render(
      <BulkActionToolbar
        selectedCount={2}
        entityType="areas"
        isLoading={true}
        onBulkUpdate={vi.fn()}
        onBulkDelete={vi.fn()}
        onExport={vi.fn()}
        onImport={vi.fn()}
      />,
    );

    const editButton = screen.getByText('Editar');
    const deleteButton = screen.getByText('Deletar');

    expect(editButton).toBeDisabled();
    expect(deleteButton).toBeDisabled();
  });

  it('should open bulk update dialog when edit button is clicked', async () => {
    render(
      <BulkActionToolbar
        selectedCount={2}
        entityType="areas"
        onBulkUpdate={vi.fn()}
        onBulkDelete={vi.fn()}
        onExport={vi.fn()}
        onImport={vi.fn()}
      />,
    );

    const editButton = screen.getByText('Editar');
    fireEvent.click(editButton);

    await waitFor(() => {
      expect(screen.getByText(/Editar 2 item/i)).toBeInTheDocument();
    });
  });

  it('should call onBulkDelete when delete is confirmed', async () => {
    const onBulkDelete = vi.fn();

    render(
      <BulkActionToolbar
        selectedCount={2}
        entityType="areas"
        onBulkUpdate={vi.fn()}
        onBulkDelete={onBulkDelete}
        onExport={vi.fn()}
        onImport={vi.fn()}
      />,
    );

    const deleteButton = screen.getByText('Deletar');
    fireEvent.click(deleteButton);

    await waitFor(() => {
      expect(screen.getByText(/Deletar 2 item/i)).toBeInTheDocument();
    });

    const confirmButton = screen.getByText('Deletar Permanentemente');
    fireEvent.click(confirmButton);

    await waitFor(() => {
      expect(onBulkDelete).toHaveBeenCalled();
    });
  });

  it('should handle singular and plural correctly', () => {
    const { rerender } = render(
      <BulkActionToolbar
        selectedCount={1}
        entityType="área"
        onBulkUpdate={vi.fn()}
        onBulkDelete={vi.fn()}
        onExport={vi.fn()}
        onImport={vi.fn()}
      />,
    );

    expect(screen.getByText('1 selecionado')).toBeInTheDocument();

    rerender(
      <BulkActionToolbar
        selectedCount={2}
        entityType="áreas"
        onBulkUpdate={vi.fn()}
        onBulkDelete={vi.fn()}
        onExport={vi.fn()}
        onImport={vi.fn()}
      />,
    );

    expect(screen.getByText('2 selecionados')).toBeInTheDocument();
  });

  it('should have accessible button labels', () => {
    render(
      <BulkActionToolbar
        selectedCount={3}
        entityType="areas"
        onBulkUpdate={vi.fn()}
        onBulkDelete={vi.fn()}
        onExport={vi.fn()}
        onImport={vi.fn()}
      />,
    );

    expect(screen.getByRole('button', { name: /Editar/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Deletar/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Mais/i })).toBeInTheDocument();
  });
});
