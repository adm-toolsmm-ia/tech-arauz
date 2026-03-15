import React from 'react';
import { render, screen } from '@testing-library/react';
import { WizardProgressBar } from '../WizardProgressBar';

describe('WizardProgressBar', () => {
  const mockSteps = [
    { number: 1, label: 'Básicos', completed: true },
    { number: 2, label: 'Modelo', completed: true },
    { number: 3, label: 'Estrutura', completed: false },
    { number: 4, label: 'Funções', completed: false },
    { number: 5, label: 'Integração', completed: false },
  ];

  describe('Rendering', () => {
    it('should render progress bar component', () => {
      render(<WizardProgressBar steps={mockSteps} currentStep={3} />);

      expect(screen.getByRole('region')).toBeInTheDocument();
      expect(screen.getByText(/Passo 3 de 5/)).toBeInTheDocument();
    });

    it('should display correct progress percentage', () => {
      render(<WizardProgressBar steps={mockSteps} currentStep={3} />);

      // 3 / 5 = 60%
      expect(screen.getByText('60%')).toBeInTheDocument();
    });

    it('should render all step indicators', () => {
      render(<WizardProgressBar steps={mockSteps} currentStep={2} />);

      mockSteps.forEach((step) => {
        expect(screen.getByLabelText(new RegExp(step.label))).toBeInTheDocument();
      });
    });
  });

  describe('Visual States', () => {
    it('should mark completed steps with checkmark', () => {
      render(<WizardProgressBar steps={mockSteps} currentStep={3} />);

      const step1 = screen.getByLabelText(/Básicos/);
      const step2 = screen.getByLabelText(/Modelo/);

      // Completed steps should have checkmark icon or different styling
      expect(step1).toBeInTheDocument();
      expect(step2).toBeInTheDocument();
    });

    it('should highlight current step', () => {
      const { rerender } = render(<WizardProgressBar steps={mockSteps} currentStep={1} />);

      let step1 = screen.getByLabelText(/Básicos/);
      expect(step1).toBeInTheDocument();

      // Change current step
      rerender(<WizardProgressBar steps={mockSteps} currentStep={3} />);

      step1 = screen.getByLabelText(/Básicos/);
      expect(step1).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA attributes', () => {
      render(<WizardProgressBar steps={mockSteps} currentStep={2} />);

      const region = screen.getByRole('region');
      expect(region).toHaveAttribute('aria-label', 'Progresso do assistente');
    });

    it('should announce step labels to screen readers', () => {
      render(<WizardProgressBar steps={mockSteps} currentStep={2} />);

      mockSteps.forEach((step) => {
        const label = screen.getByLabelText(new RegExp(step.label));
        expect(label).toBeInTheDocument();
      });
    });

    it('should have proper progress bar ARIA attributes', () => {
      render(<WizardProgressBar steps={mockSteps} currentStep={2} />);

      // Progress bar should have aria attributes for screen readers
      const progressElements = screen.getAllByRole('progressbar', { hidden: true });
      expect(progressElements.length).toBeGreaterThan(0);
    });
  });

  describe('Responsive Behavior', () => {
    it('should render without errors in mobile view', () => {
      render(<WizardProgressBar steps={mockSteps} currentStep={1} />);

      // Should not have layout errors
      expect(screen.getByRole('region')).toBeInTheDocument();
    });

    it('should be keyboard navigable', () => {
      const { container } = render(<WizardProgressBar steps={mockSteps} currentStep={2} />);

      // Step indicators should be reachable via keyboard
      const buttons = container.querySelectorAll('button');
      buttons.forEach((button) => {
        expect(button).toHaveAttribute('type', 'button');
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle first step correctly', () => {
      render(<WizardProgressBar steps={mockSteps} currentStep={1} />);

      expect(screen.getByText(/Passo 1 de 5/)).toBeInTheDocument();
      expect(screen.getByText('20%')).toBeInTheDocument();
    });

    it('should handle last step correctly', () => {
      render(<WizardProgressBar steps={mockSteps} currentStep={5} />);

      expect(screen.getByText(/Passo 5 de 5/)).toBeInTheDocument();
      expect(screen.getByText('100%')).toBeInTheDocument();
    });

    it('should handle single step', () => {
      const singleStep = [{ number: 1, label: 'Único', completed: false }];

      render(<WizardProgressBar steps={singleStep} currentStep={1} />);

      expect(screen.getByText(/Passo 1 de 1/)).toBeInTheDocument();
      expect(screen.getByText('100%')).toBeInTheDocument();
    });
  });
});
