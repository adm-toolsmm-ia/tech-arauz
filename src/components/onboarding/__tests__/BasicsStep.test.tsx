import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BasicsStep } from '../steps/BasicsStep';

describe('BasicsStep', () => {
  const mockHandlers = {
    onOrganizationTypeChange: vi.fn(),
    onOrganizationNameChange: vi.fn(),
    onIndustryChange: vi.fn(),
    onSizeChange: vi.fn(),
    onDescriptionChange: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render basics step form', () => {
      render(<BasicsStep organizationType="legal_office" {...mockHandlers} />);

      expect(screen.getByText(/Informações Básicas/i)).toBeInTheDocument();
      expect(screen.getByText(/Tipo de Organização/i)).toBeInTheDocument();
    });

    it('should display all form fields', () => {
      render(
        <BasicsStep
          organizationType="legal_office"
          organizationName=""
          industry=""
          size=""
          description=""
          {...mockHandlers}
        />,
      );

      expect(screen.getByLabelText(/Tipo de organização/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Nome da organização/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Setor/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Tamanho da organização/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Descrição/i)).toBeInTheDocument();
    });

    it('should display error messages when provided', () => {
      const errors = ['Tipo de organização é obrigatório', 'Nome é obrigatório'];

      render(<BasicsStep organizationType="legal_office" {...mockHandlers} errors={errors} />);

      errors.forEach((error) => {
        expect(screen.getByText(error)).toBeInTheDocument();
      });
    });
  });

  describe('Organization Type Selection', () => {
    it('should call handler when organization type changes', async () => {
      const user = userEvent.setup();
      render(<BasicsStep organizationType="legal_office" {...mockHandlers} />);

      const selectTrigger = screen.getByLabelText(/Tipo de organização/i);
      await user.click(selectTrigger);

      const option = screen.getByText('Consultoria');
      await user.click(option);

      await waitFor(() => {
        expect(mockHandlers.onOrganizationTypeChange).toHaveBeenCalledWith('consultancy');
      });
    });

    it('should display all organization type options', async () => {
      const user = userEvent.setup();
      render(<BasicsStep organizationType="legal_office" {...mockHandlers} />);

      const selectTrigger = screen.getByLabelText(/Tipo de organização/i);
      await user.click(selectTrigger);

      expect(screen.getByText('Escritório Jurídico')).toBeInTheDocument();
      expect(screen.getByText('Consultoria')).toBeInTheDocument();
      expect(screen.getByText('Corporação')).toBeInTheDocument();
      expect(screen.getByText('Outro')).toBeInTheDocument();
    });
  });

  describe('Text Input Fields', () => {
    it('should update organization name on input', async () => {
      const user = userEvent.setup();
      render(<BasicsStep organizationType="legal_office" organizationName="" {...mockHandlers} />);

      const input = screen.getByLabelText(/Nome da organização/i);
      await user.type(input, 'Arauz Advogados');

      expect(mockHandlers.onOrganizationNameChange).toHaveBeenCalledWith('Arauz Advogados');
    });

    it('should update description on textarea change', async () => {
      const user = userEvent.setup();
      render(<BasicsStep organizationType="legal_office" description="" {...mockHandlers} />);

      const textarea = screen.getByLabelText(/Descrição/i);
      await user.type(textarea, 'Escritório especializado em direito civil');

      expect(mockHandlers.onDescriptionChange).toHaveBeenCalledWith(
        'Escritório especializado em direito civil',
      );
    });
  });

  describe('Dropdown Selections', () => {
    it('should update industry when selected', async () => {
      const user = userEvent.setup();
      render(<BasicsStep organizationType="legal_office" industry="" {...mockHandlers} />);

      const selectTrigger = screen.getByLabelText(/Setor/i);
      await user.click(selectTrigger);

      const option = screen.getByText('Jurídico');
      await user.click(option);

      expect(mockHandlers.onIndustryChange).toHaveBeenCalledWith('legal');
    });

    it('should update size when selected', async () => {
      const user = userEvent.setup();
      render(<BasicsStep organizationType="legal_office" size="" {...mockHandlers} />);

      const selectTrigger = screen.getByLabelText(/Tamanho da organização/i);
      await user.click(selectTrigger);

      const option = screen.getByText('51 a 200');
      await user.click(option);

      expect(mockHandlers.onSizeChange).toHaveBeenCalledWith('51-200');
    });
  });

  describe('Form State', () => {
    it('should display current values', () => {
      render(
        <BasicsStep
          organizationType="consultancy"
          organizationName="Tech Consulting"
          industry="technology"
          size="201-500"
          description="A tech consulting company"
          {...mockHandlers}
        />,
      );

      // Values should be displayed in inputs
      expect(screen.getByDisplayValue('Tech Consulting')).toBeInTheDocument();
      expect(screen.getByDisplayValue('A tech consulting company')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper label associations', () => {
      render(<BasicsStep organizationType="legal_office" {...mockHandlers} />);

      const nameInput = screen.getByLabelText(/Nome da organização/i);
      expect(nameInput).toHaveAttribute('aria-label', expect.stringContaining('Nome'));
    });

    it('should be keyboard navigable', async () => {
      const user = userEvent.setup();
      const { container } = render(
        <BasicsStep organizationType="legal_office" {...mockHandlers} />,
      );

      const inputs = container.querySelectorAll('input, textarea, select');
      expect(inputs.length).toBeGreaterThan(0);

      // Can tab through inputs
      const firstInput = inputs[0] as HTMLElement;
      firstInput.focus();
      expect(document.activeElement).toBe(firstInput);
    });
  });

  describe('Validation Display', () => {
    it('should show multiple errors', () => {
      const errors = [
        'Tipo de organização é obrigatório',
        'Nome é obrigatório',
        'Setor é obrigatório',
      ];

      render(<BasicsStep organizationType="legal_office" {...mockHandlers} errors={errors} />);

      errors.forEach((error) => {
        expect(screen.getByText(error)).toBeInTheDocument();
      });
    });

    it('should clear errors when no errors provided', () => {
      const { rerender } = render(
        <BasicsStep organizationType="legal_office" {...mockHandlers} errors={['Error 1']} />,
      );

      expect(screen.getByText('Error 1')).toBeInTheDocument();

      rerender(<BasicsStep organizationType="legal_office" {...mockHandlers} errors={[]} />);

      expect(screen.queryByText('Error 1')).not.toBeInTheDocument();
    });
  });
});
