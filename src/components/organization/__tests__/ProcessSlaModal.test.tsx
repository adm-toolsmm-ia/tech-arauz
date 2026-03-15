import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ProcessSlaModal } from '../ProcessSlaModal';
import type { OrgProcessSla } from '@/types/organization';

// Mock server actions
vi.mock('@/app/actions/organization', () => ({
  createProcessSlaAction: vi.fn(),
  updateProcessSlaAction: vi.fn(),
}));

/**
 * Component Tests - ProcessSlaModal
 * Story 13.1 Phase 3: SLA Management
 */

describe('ProcessSlaModal', () => {
  const processId = 'proc-001';
  const mockOnClose = vi.fn();
  const mockOnSave = vi.fn();

  const mockSlaToEdit: OrgProcessSla = {
    id: 'sla-001',
    process_id: processId,
    tenant_id: 'tenant-001',
    metric_name: 'tempo_conclusão',
    target_duration_days: 5,
    warning_threshold_pct: 75,
    critical_threshold_pct: 95,
    created_at: '2026-03-16T00:00:00Z',
    updated_at: '2026-03-16T00:00:00Z',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Create Mode', () => {
    it('should render create modal with empty fields', () => {
      render(
        <ProcessSlaModal
          processId={processId}
          isOpen={true}
          onClose={mockOnClose}
          mode="create"
        />
      );

      expect(screen.getByText('Criar novo SLA')).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/Ex: tempo_conclusão/i)).toHaveValue('');
      expect(screen.getByPlaceholderText(/Ex: 5/i)).toHaveValue(null);
    });

    it('should validate required fields on submit', async () => {
      const user = userEvent.setup();
      render(
        <ProcessSlaModal
          processId={processId}
          isOpen={true}
          onClose={mockOnClose}
          mode="create"
        />
      );

      const submitButton = screen.getByRole('button', { name: /Criar/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/Métrica é obrigatória/i)).toBeInTheDocument();
      });
    });

    it('should validate target duration is positive', async () => {
      const user = userEvent.setup();
      render(
        <ProcessSlaModal
          processId={processId}
          isOpen={true}
          onClose={mockOnClose}
          mode="create"
        />
      );

      const metricInput = screen.getByPlaceholderText(/Ex: tempo_conclusão/i);
      const durationInput = screen.getByPlaceholderText(/Ex: 5/i);

      await user.type(metricInput, 'test_metric');
      await user.type(durationInput, '0');

      const submitButton = screen.getByRole('button', { name: /Criar/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/maior que 0/i)).toBeInTheDocument();
      });
    });

    it('should validate warning threshold is between 0-100', async () => {
      const user = userEvent.setup();
      render(
        <ProcessSlaModal
          processId={processId}
          isOpen={true}
          onClose={mockOnClose}
          mode="create"
        />
      );

      const metricInput = screen.getByPlaceholderText(/Ex: tempo_conclusão/i);
      const durationInput = screen.getByPlaceholderText(/Ex: 5/i);
      const warningInput = screen.getByPlaceholderText(/Ex: 75/i);

      await user.type(metricInput, 'test_metric');
      await user.type(durationInput, '5');
      await user.type(warningInput, '150');

      const submitButton = screen.getByRole('button', { name: /Criar/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/Threshold de aviso deve estar entre 0 e 100/i)).toBeInTheDocument();
      });
    });

    it('should validate critical threshold is between 0-100', async () => {
      const user = userEvent.setup();
      render(
        <ProcessSlaModal
          processId={processId}
          isOpen={true}
          onClose={mockOnClose}
          mode="create"
        />
      );

      const metricInput = screen.getByPlaceholderText(/Ex: tempo_conclusão/i);
      const durationInput = screen.getByPlaceholderText(/Ex: 5/i);
      const warningInput = screen.getByPlaceholderText(/Ex: 75/i);
      const criticalInput = screen.getAllByDisplayValue('')[3]; // Get the critical threshold input

      await user.type(metricInput, 'test_metric');
      await user.type(durationInput, '5');
      await user.type(warningInput, '75');
      await user.type(criticalInput, '-10');

      const submitButton = screen.getByRole('button', { name: /Criar/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/Threshold crítico deve estar entre 0 e 100/i)).toBeInTheDocument();
      });
    });

    it('should validate warning < critical threshold', async () => {
      const user = userEvent.setup();
      render(
        <ProcessSlaModal
          processId={processId}
          isOpen={true}
          onClose={mockOnClose}
          mode="create"
        />
      );

      const metricInput = screen.getByPlaceholderText(/Ex: tempo_conclusão/i);
      const durationInput = screen.getByPlaceholderText(/Ex: 5/i);
      const warningInput = screen.getByPlaceholderText(/Ex: 75/i);
      const criticalInputs = screen.getAllByRole('spinbutton');
      const criticalInput = criticalInputs[criticalInputs.length - 1];

      await user.type(metricInput, 'test_metric');
      await user.type(durationInput, '5');
      await user.type(warningInput, '95');
      await user.type(criticalInput, '90');

      const submitButton = screen.getByRole('button', { name: /Criar/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/Threshold de aviso deve ser menor que o crítico/i)).toBeInTheDocument();
      });
    });
  });

  describe('Edit Mode', () => {
    it('should populate form with SLA data in edit mode', () => {
      render(
        <ProcessSlaModal
          processId={processId}
          isOpen={true}
          onClose={mockOnClose}
          slaToEdit={mockSlaToEdit}
          mode="edit"
        />
      );

      expect(screen.getByText('Editar SLA')).toBeInTheDocument();
      expect(screen.getByDisplayValue('tempo_conclusão')).toBeInTheDocument();
      expect(screen.getByDisplayValue('5')).toBeInTheDocument();
      expect(screen.getByDisplayValue('75')).toBeInTheDocument();
      expect(screen.getByDisplayValue('95')).toBeInTheDocument();
    });

    it('should show update button in edit mode', () => {
      render(
        <ProcessSlaModal
          processId={processId}
          isOpen={true}
          onClose={mockOnClose}
          slaToEdit={mockSlaToEdit}
          mode="edit"
        />
      );

      expect(screen.getByRole('button', { name: /Atualizar/i })).toBeInTheDocument();
    });

    it('should clear form when closing and reopening in create mode', async () => {
      const { rerender } = render(
        <ProcessSlaModal
          processId={processId}
          isOpen={true}
          onClose={mockOnClose}
          mode="create"
        />
      );

      const metricInput = screen.getByPlaceholderText(/Ex: tempo_conclusão/i) as HTMLInputElement;
      expect(metricInput.value).toBe('');

      rerender(
        <ProcessSlaModal
          processId={processId}
          isOpen={false}
          onClose={mockOnClose}
          mode="create"
        />
      );

      rerender(
        <ProcessSlaModal
          processId={processId}
          isOpen={true}
          onClose={mockOnClose}
          mode="create"
        />
      );

      expect((screen.getByPlaceholderText(/Ex: tempo_conclusão/i) as HTMLInputElement).value).toBe('');
    });
  });

  describe('Form Submission', () => {
    it('should disable submit button while loading', async () => {
      const user = userEvent.setup();
      render(
        <ProcessSlaModal
          processId={processId}
          isOpen={true}
          onClose={mockOnClose}
          mode="create"
        />
      );

      const metricInput = screen.getByPlaceholderText(/Ex: tempo_conclusão/i);
      const durationInput = screen.getByPlaceholderText(/Ex: 5/i);
      const warningInput = screen.getByPlaceholderText(/Ex: 75/i);
      const criticalInputs = screen.getAllByRole('spinbutton');
      const criticalInput = criticalInputs[criticalInputs.length - 1];

      await user.type(metricInput, 'test_metric');
      await user.type(durationInput, '5');
      await user.type(warningInput, '75');
      await user.type(criticalInput, '95');

      const submitButton = screen.getByRole('button', { name: /Criar/i });
      expect(submitButton).not.toBeDisabled();
    });

    it('should call onClose after successful submission', async () => {
      const user = userEvent.setup();
      const { createProcessSlaAction } = await import('@/app/actions/organization');
      (createProcessSlaAction as ReturnType<typeof vi.fn>).mockResolvedValue({
        success: true,
        message: 'SLA created',
        data: mockSlaToEdit,
      });

      render(
        <ProcessSlaModal
          processId={processId}
          isOpen={true}
          onClose={mockOnClose}
          onSave={mockOnSave}
          mode="create"
        />
      );

      const metricInput = screen.getByPlaceholderText(/Ex: tempo_conclusão/i);
      const durationInput = screen.getByPlaceholderText(/Ex: 5/i);
      const warningInput = screen.getByPlaceholderText(/Ex: 75/i);
      const criticalInputs = screen.getAllByRole('spinbutton');
      const criticalInput = criticalInputs[criticalInputs.length - 1];

      await user.type(metricInput, 'test_metric');
      await user.type(durationInput, '5');
      await user.type(warningInput, '75');
      await user.type(criticalInput, '95');

      const submitButton = screen.getByRole('button', { name: /Criar/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockOnClose).toHaveBeenCalled();
        expect(mockOnSave).toHaveBeenCalled();
      });
    });

    it('should display error message on failed submission', async () => {
      const user = userEvent.setup();
      const { createProcessSlaAction } = await import('@/app/actions/organization');
      (createProcessSlaAction as ReturnType<typeof vi.fn>).mockResolvedValue({
        success: false,
        message: 'Failed to create SLA',
      });

      render(
        <ProcessSlaModal
          processId={processId}
          isOpen={true}
          onClose={mockOnClose}
          mode="create"
        />
      );

      const metricInput = screen.getByPlaceholderText(/Ex: tempo_conclusão/i);
      const durationInput = screen.getByPlaceholderText(/Ex: 5/i);
      const warningInput = screen.getByPlaceholderText(/Ex: 75/i);
      const criticalInputs = screen.getAllByRole('spinbutton');
      const criticalInput = criticalInputs[criticalInputs.length - 1];

      await user.type(metricInput, 'test_metric');
      await user.type(durationInput, '5');
      await user.type(warningInput, '75');
      await user.type(criticalInput, '95');

      const submitButton = screen.getByRole('button', { name: /Criar/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/Failed to create SLA/i)).toBeInTheDocument();
      });
    });
  });

  describe('Cancel Button', () => {
    it('should call onClose when cancel button is clicked', async () => {
      const user = userEvent.setup();
      render(
        <ProcessSlaModal
          processId={processId}
          isOpen={true}
          onClose={mockOnClose}
          mode="create"
        />
      );

      const cancelButton = screen.getByRole('button', { name: /Cancelar/i });
      await user.click(cancelButton);

      expect(mockOnClose).toHaveBeenCalled();
    });
  });
});
