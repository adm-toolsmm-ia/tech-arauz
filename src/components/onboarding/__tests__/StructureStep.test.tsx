import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { StructureStep } from '../steps/StructureStep';
import type { WizardAreaSetup } from '@/lib/organization/bootstrap-templates';

describe('StructureStep', () => {
  const mockAreas: WizardAreaSetup[] = [
    {
      name: 'Área Jurídica',
      description: 'Área de direito',
      nuclei: [
        { name: 'Núcleo Civil', description: 'Civil' },
        { name: 'Núcleo Penal', description: 'Penal' },
      ],
    },
  ];

  const mockOnAreasChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render structure step form', () => {
      render(<StructureStep areas={mockAreas} onAreasChange={mockOnAreasChange} />);

      expect(screen.getByText(/Estrutura Organizacional/i)).toBeInTheDocument();
    });

    it('should display areas list', () => {
      render(<StructureStep areas={mockAreas} onAreasChange={mockOnAreasChange} />);

      expect(screen.getByText('Área Jurídica')).toBeInTheDocument();
    });

    it('should display nuclei count', () => {
      render(<StructureStep areas={mockAreas} onAreasChange={mockOnAreasChange} />);

      expect(screen.getByText(/2 núcleos/i)).toBeInTheDocument();
    });
  });

  describe('Area Expansion', () => {
    it('should expand area to show details', async () => {
      const user = userEvent.setup();
      render(<StructureStep areas={mockAreas} onAreasChange={mockOnAreasChange} />);

      const expandButton = screen.getByRole('button', {
        name: /Área: Área Jurídica/i,
      });

      await user.click(expandButton);

      // Should show area details after expansion
      expect(screen.getByDisplayValue('Área Jurídica')).toBeInTheDocument();
    });
  });

  describe('Adding Areas', () => {
    it('should add new area', async () => {
      const user = userEvent.setup();
      render(<StructureStep areas={mockAreas} onAreasChange={mockOnAreasChange} />);

      const addButton = screen.getByRole('button', {
        name: /Adicionar Área/i,
      });

      await user.click(addButton);

      expect(mockOnAreasChange).toHaveBeenCalled();
    });
  });

  describe('Removing Areas', () => {
    it('should remove area when delete button clicked', async () => {
      const user = userEvent.setup();
      const { rerender } = render(
        <StructureStep areas={mockAreas} onAreasChange={mockOnAreasChange} />,
      );

      const expandButton = screen.getByRole('button', {
        name: /Área: Área Jurídica/i,
      });
      await user.click(expandButton);

      const deleteAreaButton = screen.getByRole('button', {
        name: /Remover área Área Jurídica/i,
      });

      await user.click(deleteAreaButton);

      expect(mockOnAreasChange).toHaveBeenCalled();
    });
  });

  describe('Nuclei Management', () => {
    it('should display nuclei for expanded area', async () => {
      const user = userEvent.setup();
      render(<StructureStep areas={mockAreas} onAreasChange={mockOnAreasChange} />);

      const expandButton = screen.getByRole('button', {
        name: /Área: Área Jurídica/i,
      });
      await user.click(expandButton);

      expect(screen.getByText('Núcleo Civil')).toBeInTheDocument();
      expect(screen.getByText('Núcleo Penal')).toBeInTheDocument();
    });

    it('should add new nucleus', async () => {
      const user = userEvent.setup();
      render(<StructureStep areas={mockAreas} onAreasChange={mockOnAreasChange} />);

      const expandButton = screen.getByRole('button', {
        name: /Área: Área Jurídica/i,
      });
      await user.click(expandButton);

      const addNucleusButton = screen.getByRole('button', {
        name: /Adicionar núcleo à área/i,
      });

      await user.click(addNucleusButton);

      expect(mockOnAreasChange).toHaveBeenCalled();
    });
  });

  describe('Error Display', () => {
    it('should display error messages', () => {
      const errors = ['Pelo menos uma área é obrigatória'];

      render(<StructureStep areas={[]} onAreasChange={mockOnAreasChange} errors={errors} />);

      expect(screen.getByText(errors[0])).toBeInTheDocument();
    });
  });

  describe('Empty State', () => {
    it('should handle empty areas array', () => {
      render(<StructureStep areas={[]} onAreasChange={mockOnAreasChange} />);

      const addButton = screen.getByRole('button', {
        name: /Adicionar Área/i,
      });

      expect(addButton).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have aria-expanded attribute', async () => {
      const user = userEvent.setup();
      render(<StructureStep areas={mockAreas} onAreasChange={mockOnAreasChange} />);

      const expandButton = screen.getByRole('button', {
        name: /Área: Área Jurídica/i,
      });

      expect(expandButton).toHaveAttribute('aria-expanded', 'true');

      await user.click(expandButton);

      expect(expandButton).toHaveAttribute('aria-expanded', 'false');
    });

    it('should have proper labels for input fields', async () => {
      const user = userEvent.setup();
      render(<StructureStep areas={mockAreas} onAreasChange={mockOnAreasChange} />);

      const expandButton = screen.getByRole('button', {
        name: /Área: Área Jurídica/i,
      });
      await user.click(expandButton);

      const nameInput = screen.getByLabelText(/Nome da Área/i);
      expect(nameInput).toBeInTheDocument();
    });
  });
});
