import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ActivitySystemsModal } from './ActivitySystemsModal';
import type { OrgSystem } from '@/types/organization';

// Mock data
const mockSystems: OrgSystem[] = [
  {
    id: '1',
    tenant_id: 'test-tenant',
    name: 'System A',
    description: 'Test System A',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '2',
    tenant_id: 'test-tenant',
    name: 'System B',
    description: 'Test System B',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

describe('ActivitySystemsModal', () => {
  const mockOnClose = vi.fn();
  const mockOnSave = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render modal title and description', () => {
    render(
      <ActivitySystemsModal
        activityId="activity-1"
        isOpen={true}
        onClose={mockOnClose}
        availableSystems={mockSystems}
      />
    );

    expect(screen.getByText('Gerenciar Sistemas da Atividade')).toBeInTheDocument();
    expect(screen.getByText(/Adicione ou remova sistemas/i)).toBeInTheDocument();
  });

  it('should show "no systems" state when empty', () => {
    render(
      <ActivitySystemsModal
        activityId="activity-1"
        isOpen={true}
        onClose={mockOnClose}
        availableSystems={mockSystems}
      />
    );

    expect(screen.getByText('Nenhum sistema adicionado ainda.')).toBeInTheDocument();
  });

  it('should show system dropdown when clicked', async () => {
    const user = userEvent.setup();
    render(
      <ActivitySystemsModal
        activityId="activity-1"
        isOpen={true}
        onClose={mockOnClose}
        availableSystems={mockSystems}
      />
    );

    const dropdownButton = screen.getByRole('button', { name: /Selecione um sistema/i });
    await user.click(dropdownButton);

    // Dropdown should show available systems
    await waitFor(() => {
      expect(screen.getByText('System A')).toBeInTheDocument();
      expect(screen.getByText('System B')).toBeInTheDocument();
    });
  });

  it('should allow adding usage context', async () => {
    const user = userEvent.setup();
    render(
      <ActivitySystemsModal
        activityId="activity-1"
        isOpen={true}
        onClose={mockOnClose}
        availableSystems={mockSystems}
      />
    );

    const contextInput = screen.getByPlaceholderText(/Ex: Sincronização/i);
    await user.type(contextInput, 'Test context');

    expect(contextInput).toHaveValue('Test context');
  });

  it('should call onClose when cancel button clicked', async () => {
    const user = userEvent.setup();
    render(
      <ActivitySystemsModal
        activityId="activity-1"
        isOpen={true}
        onClose={mockOnClose}
        availableSystems={mockSystems}
      />
    );

    const cancelButton = screen.getByRole('button', { name: /Cancelar/i });
    await user.click(cancelButton);

    expect(mockOnClose).toHaveBeenCalled();
  });

  it('should call onSave and onClose when save button clicked', async () => {
    const user = userEvent.setup();
    render(
      <ActivitySystemsModal
        activityId="activity-1"
        isOpen={true}
        onClose={mockOnClose}
        onSave={mockOnSave}
        availableSystems={mockSystems}
      />
    );

    const saveButton = screen.getByRole('button', { name: /Salvar Alterações/i });
    await user.click(saveButton);

    await waitFor(() => {
      expect(mockOnSave).toHaveBeenCalled();
      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  it('should disable add button when no system selected', () => {
    render(
      <ActivitySystemsModal
        activityId="activity-1"
        isOpen={true}
        onClose={mockOnClose}
        availableSystems={mockSystems}
      />
    );

    const addButton = screen.getByRole('button', { name: /Adicionar Sistema/i });
    expect(addButton).toBeDisabled();
  });

  it('should render responsive layout', () => {
    const { container } = render(
      <ActivitySystemsModal
        activityId="activity-1"
        isOpen={true}
        onClose={mockOnClose}
        availableSystems={mockSystems}
      />
    );

    // Check for responsive dialog classes
    expect(container.querySelector('.sm\\:max-w-\\[500px\\]')).toBeInTheDocument();
  });
});
