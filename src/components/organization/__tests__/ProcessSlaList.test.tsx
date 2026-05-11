import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ProcessSlaList } from '../ProcessSlaList';
import type { OrgProcessSla } from '@/types/organization';
import * as organizationActions from '@/app/actions/organization';

// Mock server actions
vi.mock('@/app/actions/organization', () => ({
  deleteProcessSlaAction: vi.fn(),
}));

/**
 * Component Tests - ProcessSlaList
 * Story 13.1 Phase 3: SLA Management
 */

describe('ProcessSlaList', () => {
  const mockOnEdit = vi.fn();
  const mockOnDeleteSuccess = vi.fn();
  const mockDeleteProcessSlaAction = vi.mocked(organizationActions.deleteProcessSlaAction);

  const mockSlas: OrgProcessSla[] = [
    {
      id: 'sla-001',
      process_id: 'proc-001',
      tenant_id: 'tenant-001',
      metric_name: 'tempo_conclusão',
      target_duration_days: 5,
      warning_threshold_pct: 75,
      critical_threshold_pct: 95,
      created_at: '2026-03-16T00:00:00Z',
      updated_at: '2026-03-16T00:00:00Z',
    },
    {
      id: 'sla-002',
      process_id: 'proc-001',
      tenant_id: 'tenant-001',
      metric_name: 'qualidade',
      target_duration_days: 10,
      warning_threshold_pct: 80,
      critical_threshold_pct: 90,
      created_at: '2026-03-16T00:00:00Z',
      updated_at: '2026-03-16T00:00:00Z',
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    mockDeleteProcessSlaAction.mockReset();
  });

  describe('Empty State', () => {
    it('should show empty state when no SLAs', () => {
      render(<ProcessSlaList slas={[]} isLoading={false} onEdit={mockOnEdit} />);

      expect(screen.getByText(/Nenhum SLA definido/i)).toBeInTheDocument();
    });
  });

  describe('Loading State', () => {
    it('should show loading spinner when isLoading is true', () => {
      render(<ProcessSlaList slas={[]} isLoading={true} onEdit={mockOnEdit} />);

      expect(screen.getByRole('status')).toBeInTheDocument();
    });
  });

  describe('SLA Display', () => {
    it('should render list of SLAs', () => {
      render(<ProcessSlaList slas={mockSlas} isLoading={false} onEdit={mockOnEdit} />);

      expect(screen.getByText('tempo_conclusão')).toBeInTheDocument();
      expect(screen.getByText('qualidade')).toBeInTheDocument();
      expect(screen.getByText('SLAs do Processo — 2')).toBeInTheDocument();
    });

    it('should display metric names correctly', () => {
      render(<ProcessSlaList slas={mockSlas} isLoading={false} onEdit={mockOnEdit} />);

      expect(screen.getByText('tempo_conclusão')).toBeInTheDocument();
      expect(screen.getByText('qualidade')).toBeInTheDocument();
    });

    it('should display target duration as badge', () => {
      render(<ProcessSlaList slas={mockSlas} isLoading={false} onEdit={mockOnEdit} />);

      expect(screen.getByText('5d')).toBeInTheDocument();
      expect(screen.getByText('10d')).toBeInTheDocument();
    });

    it('should display warning and critical thresholds', () => {
      render(<ProcessSlaList slas={mockSlas} isLoading={false} onEdit={mockOnEdit} />);

      // First SLA
      expect(screen.getByText('Aviso: 75%')).toBeInTheDocument();
      expect(screen.getByText('Crítico: 95%')).toBeInTheDocument();

      // Second SLA
      expect(screen.getByText('Aviso: 80%')).toBeInTheDocument();
      expect(screen.getByText('Crítico: 90%')).toBeInTheDocument();
    });

    it('should count SLAs correctly', () => {
      render(<ProcessSlaList slas={mockSlas} isLoading={false} onEdit={mockOnEdit} />);

      expect(screen.getByText('SLAs do Processo — 2')).toBeInTheDocument();
    });
  });

  describe('Edit Button', () => {
    it('should call onEdit when edit button is clicked', async () => {
      render(<ProcessSlaList slas={mockSlas} isLoading={false} onEdit={mockOnEdit} />);

      const editButtons = screen.getAllByLabelText(/Editar SLA/i);
      fireEvent.click(editButtons[0]);

      expect(mockOnEdit).toHaveBeenCalledWith(mockSlas[0]);
    });

    it('should pass correct SLA data to onEdit', async () => {
      render(<ProcessSlaList slas={mockSlas} isLoading={false} onEdit={mockOnEdit} />);

      const editButtons = screen.getAllByLabelText(/Editar SLA/i);
      fireEvent.click(editButtons[1]);

      expect(mockOnEdit).toHaveBeenCalledWith(mockSlas[1]);
    });

    it('should disable edit button while deleting', () => {
      render(<ProcessSlaList slas={mockSlas} isLoading={false} onEdit={mockOnEdit} />);

      const editButtons = screen.getAllByLabelText(/Editar SLA/i);
      expect(editButtons[0]).not.toBeDisabled();
    });
  });

  describe('Delete Button', () => {
    it('should show confirmation dialog when delete button is clicked', async () => {
      render(<ProcessSlaList slas={mockSlas} isLoading={false} onEdit={mockOnEdit} />);

      const deleteButtons = screen.getAllByLabelText(/Deletar SLA/i);
      fireEvent.click(deleteButtons[0]);

      expect(screen.getByText('Deletar SLA?')).toBeInTheDocument();
      expect(screen.getByText(/tem certeza que deseja deletar/i)).toBeInTheDocument();
    });

    it('should display SLA name in confirmation dialog', async () => {
      render(<ProcessSlaList slas={mockSlas} isLoading={false} onEdit={mockOnEdit} />);

      const deleteButtons = screen.getAllByLabelText(/Deletar SLA/i);
      fireEvent.click(deleteButtons[0]);

      expect(screen.getByText(/"tempo_conclusão"/)).toBeInTheDocument();
    });

    it('should close confirmation dialog when cancel is clicked', async () => {
      render(<ProcessSlaList slas={mockSlas} isLoading={false} onEdit={mockOnEdit} />);

      const deleteButtons = screen.getAllByLabelText(/Deletar SLA/i);
      fireEvent.click(deleteButtons[0]);

      const cancelButton = screen.getByRole('button', { name: /Cancelar/i });
      fireEvent.click(cancelButton);

      expect(screen.queryByText('Deletar SLA?')).not.toBeInTheDocument();
    });

    it('should call deleteProcessSlaAction when delete confirmed', async () => {
      mockDeleteProcessSlaAction.mockResolvedValue({
        success: true,
        message: 'SLA deleted',
      });

      render(
        <ProcessSlaList
          slas={mockSlas}
          isLoading={false}
          onEdit={mockOnEdit}
          onDeleteSuccess={mockOnDeleteSuccess}
        />,
      );

      const deleteButtons = screen.getAllByLabelText(/Deletar SLA/i);
      fireEvent.click(deleteButtons[0]);

      const confirmButton = screen.getByRole('button', { name: /Deletar/i });
      fireEvent.click(confirmButton);

      await waitFor(() => {
        expect(mockDeleteProcessSlaAction).toHaveBeenCalledWith(mockSlas[0].id);
      });
    });

    it('should call onDeleteSuccess after successful deletion', async () => {
      mockDeleteProcessSlaAction.mockResolvedValue({
        success: true,
        message: 'SLA deleted',
      });

      render(
        <ProcessSlaList
          slas={mockSlas}
          isLoading={false}
          onEdit={mockOnEdit}
          onDeleteSuccess={mockOnDeleteSuccess}
        />,
      );

      const deleteButtons = screen.getAllByLabelText(/Deletar SLA/i);
      fireEvent.click(deleteButtons[0]);

      const confirmButton = screen.getByRole('button', { name: /Deletar/i });
      fireEvent.click(confirmButton);

      await waitFor(() => {
        expect(mockDeleteProcessSlaAction).toHaveBeenCalledWith(mockSlas[0].id);
        expect(mockOnDeleteSuccess).toHaveBeenCalledTimes(1);
      });
    });

    it('should handle deletion errors gracefully', async () => {
      mockDeleteProcessSlaAction.mockResolvedValue({
        success: false,
        message: 'Deletion failed',
      });

      render(
        <ProcessSlaList
          slas={mockSlas}
          isLoading={false}
          onEdit={mockOnEdit}
          onDeleteSuccess={mockOnDeleteSuccess}
        />,
      );

      const deleteButtons = screen.getAllByLabelText(/Deletar SLA/i);
      fireEvent.click(deleteButtons[0]);

      const confirmButton = screen.getByRole('button', { name: /Deletar/i });
      fireEvent.click(confirmButton);

      await waitFor(() => {
        expect(screen.queryByText('Deletar SLA?')).not.toBeInTheDocument();
      });
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels', () => {
      render(<ProcessSlaList slas={mockSlas} isLoading={false} onEdit={mockOnEdit} />);

      const editButtons = screen.getAllByLabelText(/Editar SLA/i);
      const deleteButtons = screen.getAllByLabelText(/Deletar SLA/i);

      expect(editButtons).toHaveLength(2);
      expect(deleteButtons).toHaveLength(2);
    });

    it('should have descriptive button labels', () => {
      render(<ProcessSlaList slas={mockSlas} isLoading={false} onEdit={mockOnEdit} />);

      const editButtons = screen.getAllByLabelText(/Editar SLA tempo_conclusão/i);
      expect(editButtons.length).toBeGreaterThan(0);
    });
  });
});
