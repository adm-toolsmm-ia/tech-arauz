import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { OrgEntityFormSheet } from './OrgEntityFormSheet';
import type { OrgActivity } from '@/types/organization';

// Mock server actions
vi.mock('@/app/actions/organization', () => ({
  createAreaAction: vi.fn(),
  updateAreaAction: vi.fn(),
  createNucleusAction: vi.fn(),
  updateNucleusAction: vi.fn(),
  createProcessAction: vi.fn(),
  updateProcessAction: vi.fn(),
  createRoutineAction: vi.fn(),
  updateRoutineAction: vi.fn(),
  createActivityAction: vi.fn(),
  updateActivityAction: vi.fn(),
}));

// Mock ResponsibleRolesInput
vi.mock('./ResponsibleRolesInput', () => ({
  ResponsibleRolesInput: ({ value, onChange, disabled }: any) => (
    <div data-testid="responsible-roles-input">
      <input
        data-testid="roles-input"
        value={value.join(',')}
        onChange={(e) => onChange(e.target.value.split(',').filter(Boolean))}
        disabled={disabled}
      />
    </div>
  ),
}));

const mockActivity: OrgActivity = {
  id: 'act-123',
  tenant_id: 'tenant-1',
  routine_id: 'rtn-123',
  name: 'Test Activity',
  description: 'A test activity',
  objective: 'Test objective',
  complexity: 'medium',
  priority: 'high',
  required_role: 'admin',
  average_execution_time: 30,
  responsible_roles: ['admin'],
  inputs: [{ name: 'Input 1', description: 'Desc 1', required: true }],
  outputs: [{ name: 'Output 1', description: 'Desc 1', required: false }],
  risks: ['Risk 1'],
  impacts: ['Impact 1'],
  documentation: { procedures: 'Test procedures' },
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

describe('OrgEntityFormSheet - Story 13.1 Gap 1 & 2', () => {
  it('renders in create mode with initial values', () => {
    render(
      <OrgEntityFormSheet entity="activity" mode="create" isOpen={true} />
    );

    expect(screen.getByDisplayValue('')).toBeInTheDocument(); // Empty name field
  });

  it('renders in edit mode with initial data', () => {
    render(
      <OrgEntityFormSheet
        entity="activity"
        mode="edit"
        isOpen={true}
        initialData={mockActivity}
      />
    );

    expect(screen.getByDisplayValue(mockActivity.name)).toBeInTheDocument();
    expect(screen.getByDisplayValue(mockActivity.description || '')).toBeInTheDocument();
  });

  it('shows info tab by default', () => {
    render(
      <OrgEntityFormSheet
        entity="activity"
        mode="edit"
        isOpen={true}
        initialData={mockActivity}
      />
    );

    const infoTab = screen.getByRole('tab', { name: /informações/i });
    expect(infoTab).toHaveAttribute('data-state', 'active');
  });

  it('switches to initialTab prop when provided', () => {
    render(
      <OrgEntityFormSheet
        entity="activity"
        mode="edit"
        isOpen={true}
        initialData={mockActivity}
        initialTab="bpm"
      />
    );

    const bpmTab = screen.getByRole('tab', { name: /bpm/i });
    expect(bpmTab).toHaveAttribute('data-state', 'active');
  });

  it('updates active tab when initialTab prop changes', async () => {
    const { rerender } = render(
      <OrgEntityFormSheet
        entity="activity"
        mode="edit"
        isOpen={true}
        initialData={mockActivity}
        initialTab="info"
      />
    );

    let infoTab = screen.getByRole('tab', { name: /informações/i });
    expect(infoTab).toHaveAttribute('data-state', 'active');

    // Change initialTab to BPM
    rerender(
      <OrgEntityFormSheet
        entity="activity"
        mode="edit"
        isOpen={true}
        initialData={mockActivity}
        initialTab="bpm"
      />
    );

    const bpmTab = screen.getByRole('tab', { name: /bpm/i });
    expect(bpmTab).toHaveAttribute('data-state', 'active');
  });

  it('displays BPM tab for activity entity', () => {
    render(
      <OrgEntityFormSheet
        entity="activity"
        mode="edit"
        isOpen={true}
        initialData={mockActivity}
      />
    );

    expect(screen.getByRole('tab', { name: /bpm/i })).toBeInTheDocument();
  });

  it('shows inputs section in BPM tab', async () => {
    render(
      <OrgEntityFormSheet
        entity="activity"
        mode="edit"
        isOpen={true}
        initialData={mockActivity}
        initialTab="bpm"
      />
    );

    await waitFor(() => {
      expect(screen.getByText(/inputs \(entradas\)/i)).toBeInTheDocument();
    });
  });

  it('shows outputs section in BPM tab', async () => {
    render(
      <OrgEntityFormSheet
        entity="activity"
        mode="edit"
        isOpen={true}
        initialData={mockActivity}
        initialTab="bpm"
      />
    );

    await waitFor(() => {
      expect(screen.getByText(/outputs \(saídas\)/i)).toBeInTheDocument();
    });
  });

  it('shows risks section in BPM tab', async () => {
    render(
      <OrgEntityFormSheet
        entity="activity"
        mode="edit"
        isOpen={true}
        initialData={mockActivity}
        initialTab="bpm"
      />
    );

    await waitFor(() => {
      expect(screen.getByText(/riscos/i)).toBeInTheDocument();
    });
  });

  it('shows impacts section in BPM tab for activity', async () => {
    render(
      <OrgEntityFormSheet
        entity="activity"
        mode="edit"
        isOpen={true}
        initialData={mockActivity}
        initialTab="bpm"
      />
    );

    await waitFor(() => {
      expect(screen.getByText(/impactos/i)).toBeInTheDocument();
    });
  });

  it('can add input via "Add" button', async () => {
    const user = userEvent.setup();
    render(
      <OrgEntityFormSheet
        entity="activity"
        mode="edit"
        isOpen={true}
        initialData={mockActivity}
        initialTab="bpm"
      />
    );

    const addInputButton = screen.getAllByRole('button', { name: /adicionar/i })[0];
    await user.click(addInputButton);

    // Should have added a new input (now showing 2 inputs)
    await waitFor(() => {
      const inputFields = screen.getAllByPlaceholderText(/nome/i);
      expect(inputFields.length).toBeGreaterThan(1);
    });
  });

  it('can remove input via trash button', async () => {
    const user = userEvent.setup();
    render(
      <OrgEntityFormSheet
        entity="activity"
        mode="edit"
        isOpen={true}
        initialData={mockActivity}
        initialTab="bpm"
      />
    );

    // Get initial input count
    let inputFields = screen.getAllByPlaceholderText(/nome/i);
    const initialCount = inputFields.length;

    // Click trash button for first input
    const trashButtons = screen.getAllByRole('button', { name: '' }).filter(
      (btn) => btn.querySelector('[data-lucide="trash-2"]')
    );
    if (trashButtons.length > 0) {
      await user.click(trashButtons[0]);

      // Input count should decrease
      await waitFor(() => {
        inputFields = screen.queryAllByPlaceholderText(/nome/i) || [];
        expect(inputFields.length).toBeLessThan(initialCount);
      });
    }
  });

  it('displays existing responsible roles', () => {
    render(
      <OrgEntityFormSheet
        entity="activity"
        mode="edit"
        isOpen={true}
        initialData={mockActivity}
      />
    );

    expect(screen.getByTestId('responsible-roles-input')).toBeInTheDocument();
  });

  it('allows editing responsible roles', async () => {
    const user = userEvent.setup();
    render(
      <OrgEntityFormSheet
        entity="activity"
        mode="edit"
        isOpen={true}
        initialData={mockActivity}
      />
    );

    const rolesInput = screen.getByTestId('roles-input') as HTMLInputElement;
    expect(rolesInput.value).toBe('admin');

    // Change roles
    await user.clear(rolesInput);
    await user.type(rolesInput, 'reviewer,admin');

    expect(rolesInput.value).toBe('reviewer,admin');
  });

  it('marks form as dirty when changes are made', async () => {
    const user = userEvent.setup();
    render(
      <OrgEntityFormSheet
        entity="activity"
        mode="edit"
        isOpen={true}
        initialData={mockActivity}
      />
    );

    // Change a field
    const nameInput = screen.getByPlaceholderText(/nome da atividade/i);
    await user.clear(nameInput);
    await user.type(nameInput, 'Updated Activity Name');

    // Dirty state alert should be visible
    await waitFor(() => {
      expect(screen.getByText(/alterações não salvas/i)).toBeInTheDocument();
    });
  });

  it('disables save button when form is not dirty', () => {
    render(
      <OrgEntityFormSheet
        entity="activity"
        mode="edit"
        isOpen={true}
        initialData={mockActivity}
      />
    );

    const saveButton = screen.getByRole('button', { name: /salvar/i });
    expect(saveButton).toBeDisabled();
  });

  it('enables save button when form is dirty', async () => {
    const user = userEvent.setup();
    render(
      <OrgEntityFormSheet
        entity="activity"
        mode="edit"
        isOpen={true}
        initialData={mockActivity}
      />
    );

    const nameInput = screen.getByPlaceholderText(/nome da atividade/i);
    await user.clear(nameInput);
    await user.type(nameInput, 'Updated Name');

    await waitFor(() => {
      const saveButton = screen.getByRole('button', { name: /salvar/i });
      expect(saveButton).not.toBeDisabled();
    });
  });

  it('validates required name field', async () => {
    const user = userEvent.setup();
    render(
      <OrgEntityFormSheet
        entity="activity"
        mode="edit"
        isOpen={true}
        initialData={mockActivity}
      />
    );

    const nameInput = screen.getByPlaceholderText(/nome da atividade/i);
    await user.clear(nameInput);

    const saveButton = screen.getByRole('button', { name: /salvar/i });
    await user.click(saveButton);

    await waitFor(() => {
      expect(screen.getByText(/nome é obrigatório/i)).toBeInTheDocument();
    });
  });

  it('closes form on cancel', async () => {
    const onClose = vi.fn();
    const user = userEvent.setup();

    render(
      <OrgEntityFormSheet
        entity="activity"
        mode="edit"
        isOpen={true}
        initialData={mockActivity}
        onClose={onClose}
      />
    );

    const cancelButton = screen.getByRole('button', { name: /cancelar/i });
    await user.click(cancelButton);

    expect(onClose).toHaveBeenCalled();
  });
});
