import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe, toHaveNoViolations } from 'jest-axe';
import { ResponsibleRolesInput } from './ResponsibleRolesInput';
import * as RoleDefinitions from '@/lib/organization/role-definitions';

expect.extend(toHaveNoViolations);

// Mock role definitions
vi.mock('@/lib/organization/role-definitions', () => ({
  getAllRoles: vi.fn(() => [
    {
      value: 'manager',
      label: 'Manager',
      description: 'Department Manager',
      category: 'management',
    },
    { value: 'analyst', label: 'Analyst', description: 'Data analyst', category: 'specialist' },
    {
      value: 'coordinator',
      label: 'Coordinator',
      description: 'Coordinator',
      category: 'operational',
    },
  ]),
  getRoleLabel: vi.fn((value: string) => {
    const roles: Record<string, string> = {
      manager: 'Manager',
      analyst: 'Analyst',
      coordinator: 'Coordinator',
    };
    return roles[value];
  }),
}));

describe('ResponsibleRolesInput', () => {
  it('should render with initial value', () => {
    const onChange = vi.fn();
    render(<ResponsibleRolesInput value={['manager']} onChange={onChange} />);

    expect(screen.getByText('Manager')).toBeInTheDocument();
  });

  it('should render tags for each role in value', () => {
    const onChange = vi.fn();
    render(<ResponsibleRolesInput value={['manager', 'analyst']} onChange={onChange} />);

    expect(screen.getByText('Manager')).toBeInTheDocument();
    expect(screen.getByText('Analyst')).toBeInTheDocument();
  });

  it('should remove tag when X button clicked', async () => {
    const onChange = vi.fn();
    const { container } = render(
      <ResponsibleRolesInput value={['manager', 'analyst']} onChange={onChange} />,
    );

    const removeButtons = container.querySelectorAll('button[aria-label*="Remove"]');
    fireEvent.click(removeButtons[0]);

    expect(onChange).toHaveBeenCalledWith(['analyst']);
  });

  it('should add role when selected from autocomplete', async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();

    render(<ResponsibleRolesInput value={['manager']} onChange={onChange} />);

    const input = screen.getByRole('combobox');
    await user.click(input);
    await user.type(input, 'analyst');

    // Wait for dropdown and select
    await waitFor(() => {
      const option = screen.getByText('Analyst');
      expect(option).toBeInTheDocument();
    });

    const option = screen.getByText('Analyst');
    await user.click(option);

    expect(onChange).toHaveBeenCalledWith(['manager', 'analyst']);
  });

  it('should filter roles based on input value', async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();

    render(<ResponsibleRolesInput value={[]} onChange={onChange} />);

    const input = screen.getByRole('combobox');
    await user.click(input);
    await user.type(input, 'coord');

    await waitFor(() => {
      expect(screen.getByText('Coordinator')).toBeInTheDocument();
      expect(screen.queryByText('Manager')).not.toBeInTheDocument();
    });
  });

  it('should handle keyboard backspace to remove last tag', async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();

    render(<ResponsibleRolesInput value={['manager', 'analyst']} onChange={onChange} />);

    const input = screen.getByRole('combobox');
    await user.click(input);
    await user.keyboard('{Backspace}');

    expect(onChange).toHaveBeenCalledWith(['manager']);
  });

  it('should handle keyboard escape to close dropdown', async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();

    const { container } = render(<ResponsibleRolesInput value={[]} onChange={onChange} />);

    const input = screen.getByRole('combobox');
    await user.click(input);
    await user.keyboard('{Escape}');

    const dropdown = container.querySelector('[role="listbox"]');
    expect(dropdown).not.toBeInTheDocument();
  });

  it('should not add duplicate roles', async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();

    render(<ResponsibleRolesInput value={['manager']} onChange={onChange} />);

    const input = screen.getByRole('combobox');
    await user.click(input);
    await user.type(input, 'manager');

    // Manager already selected, should not appear in dropdown
    await waitFor(() => {
      expect(screen.queryByText('Manager')).not.toBeInTheDocument();
    });
  });

  it('should be disabled when disabled prop is true', () => {
    const onChange = vi.fn();

    render(<ResponsibleRolesInput value={[]} onChange={onChange} disabled={true} />);

    const input = screen.getByRole('combobox');
    expect(input).toBeDisabled();
  });

  it('should show role count when roles selected', () => {
    const onChange = vi.fn();

    render(<ResponsibleRolesInput value={['manager', 'analyst']} onChange={onChange} />);

    expect(screen.getByText('2 roles selected')).toBeInTheDocument();
  });

  it('should handle keyboard arrow navigation', async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();

    render(<ResponsibleRolesInput value={[]} onChange={onChange} />);

    const input = screen.getByRole('combobox');
    await user.click(input);
    await user.keyboard('{ArrowDown}');

    // First option should be highlighted
    await waitFor(() => {
      const managerOption = screen.getByText('Manager');
      expect(managerOption.closest('[role="option"]')).toHaveAttribute('aria-selected', 'true');
    });
  });

  it('should select role with Enter key', async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();

    render(<ResponsibleRolesInput value={[]} onChange={onChange} />);

    const input = screen.getByRole('combobox');
    await user.click(input);
    await user.keyboard('{ArrowDown}');
    await user.keyboard('{Enter}');

    expect(onChange).toHaveBeenCalledWith(['manager']);
  });

  describe('Accessibility (WCAG AA)', () => {
    it('should have no axe violations when empty', async () => {
      const onChange = vi.fn();
      const { container } = render(<ResponsibleRolesInput value={[]} onChange={onChange} />);

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have no axe violations with selected roles', async () => {
      const onChange = vi.fn();
      const { container } = render(
        <ResponsibleRolesInput value={['manager', 'analyst']} onChange={onChange} />,
      );

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have no axe violations with dropdown open', async () => {
      const onChange = vi.fn();
      const user = userEvent.setup();
      const { container } = render(<ResponsibleRolesInput value={[]} onChange={onChange} />);

      const input = screen.getByRole('combobox');
      await user.click(input);

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have no axe violations when disabled', async () => {
      const onChange = vi.fn();
      const { container } = render(
        <ResponsibleRolesInput value={['manager']} onChange={onChange} disabled={true} />,
      );

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have proper ARIA attributes', () => {
      const onChange = vi.fn();
      render(<ResponsibleRolesInput value={[]} onChange={onChange} />);

      const input = screen.getByRole('combobox');
      expect(input).toHaveAttribute('aria-label', 'Pesquisar e adicionar função responsável');
      expect(input).toHaveAttribute('aria-autocomplete', 'list');
      expect(input).toHaveAttribute('aria-expanded', 'false');
    });
  });
});
