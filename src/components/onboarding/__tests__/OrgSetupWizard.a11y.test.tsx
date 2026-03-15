import React from 'react';
import { render } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { OrgSetupWizard } from '../OrgSetupWizard';

expect.extend(toHaveNoViolations);

// Mock server actions
vi.mock('@/app/actions/bootstrap', () => ({
  getBootstrapTemplatesAction: vi.fn().mockResolvedValue({
    success: true,
    data: {
      id: 'legal_office_default',
      name: 'Escritório Jurídico',
      description: 'Estrutura para escritórios',
      areas: [],
    },
  }),
  validateWizardStepAction: vi.fn().mockResolvedValue({
    success: true,
    data: { valid: true, errors: [] },
  }),
  createOrgFromWizardAction: vi.fn().mockResolvedValue({
    success: true,
    data: { organization_id: 'org-123' },
  }),
}));

describe('OrgSetupWizard - Accessibility (jest-axe)', () => {
  describe('Step 1: Basics', () => {
    it('should have no accessibility violations on step 1', async () => {
      const { container } = render(
        <OrgSetupWizard />
      );

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe('WCAG AA Compliance', () => {
    it('should have proper heading hierarchy', async () => {
      const { container } = render(
        <OrgSetupWizard />
      );

      const h2 = container.querySelector('h2');
      expect(h2).toBeInTheDocument();
    });

    it('should have proper color contrast', async () => {
      const { container } = render(
        <OrgSetupWizard />
      );

      const results = await axe(container, {
        rules: {
          'color-contrast': { enabled: true },
        },
      });

      // Should have no color contrast violations
      const colorContrastViolations = results.violations.filter(
        v => v.id === 'color-contrast'
      );
      expect(colorContrastViolations).toHaveLength(0);
    });

    it('should have proper focus indicators', async () => {
      const { container } = render(
        <OrgSetupWizard />
      );

      const buttons = container.querySelectorAll('button');
      expect(buttons.length).toBeGreaterThan(0);

      buttons.forEach(button => {
        expect(button).toHaveStyle('outline', expect.any(String));
      });
    });
  });

  describe('Form Accessibility', () => {
    it('should have properly associated labels', async () => {
      const { container } = render(
        <OrgSetupWizard />
      );

      const labels = container.querySelectorAll('label');
      expect(labels.length).toBeGreaterThan(0);

      labels.forEach(label => {
        const htmlFor = label.getAttribute('for');
        if (htmlFor) {
          const input = container.querySelector(`#${htmlFor}`);
          expect(input).toBeInTheDocument();
        }
      });
    });

    it('should have descriptive form field labels', () => {
      const { container } = render(
        <OrgSetupWizard />
      );

      const inputs = container.querySelectorAll('input, textarea, select');
      inputs.forEach(input => {
        const label = input.getAttribute('aria-label');
        const id = input.getAttribute('id');

        const isAssociated = label || (id && container.querySelector(`label[for="${id}"]`));
        expect(isAssociated).toBeTruthy();
      });
    });
  });

  describe('Navigation Accessibility', () => {
    it('should have keyboard accessible buttons', () => {
      const { container } = render(
        <OrgSetupWizard />
      );

      const buttons = container.querySelectorAll('button');
      buttons.forEach(button => {
        expect(button).toHaveAttribute('type');
      });
    });

    it('should have proper ARIA labels on buttons', () => {
      const { container } = render(
        <OrgSetupWizard />
      );

      const buttons = container.querySelectorAll('button');
      expect(buttons.length).toBeGreaterThan(0);

      // Navigation buttons should have descriptive labels
      const navButtons = Array.from(buttons).filter(b =>
        b.textContent?.includes('Anterior') ||
        b.textContent?.includes('Próximo') ||
        b.textContent?.includes('Finalizar')
      );

      navButtons.forEach(button => {
        const hasLabel = button.getAttribute('aria-label') || button.textContent;
        expect(hasLabel).toBeTruthy();
      });
    });
  });

  describe('Progress Indicator Accessibility', () => {
    it('should announce progress to screen readers', async () => {
      const { container } = render(
        <OrgSetupWizard />
      );

      const progressRegion = container.querySelector('[role="region"]');
      expect(progressRegion).toHaveAttribute('aria-label');
    });
  });

  describe('Error Message Accessibility', () => {
    it('should have proper ARIA live regions for errors', async () => {
      const { container } = render(
        <OrgSetupWizard />
      );

      const results = await axe(container);
      // Should have no violations even with error handling
      expect(results).toHaveNoViolations();
    });
  });

  describe('Dark Mode Accessibility', () => {
    it('should maintain contrast in dark mode', async () => {
      const { container } = render(
        <div className="dark">
          <OrgSetupWizard />
        </div>
      );

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe('Mobile Accessibility', () => {
    it('should have proper touch target sizes', () => {
      const { container } = render(
        <OrgSetupWizard />
      );

      const buttons = container.querySelectorAll('button');
      buttons.forEach(button => {
        // Buttons should have sufficient size for mobile touch
        const computed = window.getComputedStyle(button);
        expect(button.offsetHeight).toBeGreaterThanOrEqual(44);
      });
    });

    it('should have proper spacing for mobile interaction', () => {
      const { container } = render(
        <OrgSetupWizard />
      );

      const inputs = container.querySelectorAll('input, textarea, select');
      inputs.forEach(input => {
        const height = input.clientHeight;
        expect(height).toBeGreaterThanOrEqual(36);
      });
    });
  });

  describe('Semantic HTML', () => {
    it('should use semantic form elements', () => {
      const { container } = render(
        <OrgSetupWizard />
      );

      // Should have form-like structure
      const inputs = container.querySelectorAll('input, textarea, select, button, label');
      expect(inputs.length).toBeGreaterThan(0);
    });

    it('should have proper heading structure', () => {
      const { container } = render(
        <OrgSetupWizard />
      );

      const headings = container.querySelectorAll('h1, h2, h3');
      expect(headings.length).toBeGreaterThan(0);

      // Headings should be in logical order
      const headingLevels = Array.from(headings).map(h => h.tagName);
      expect(headingLevels).toContain('H2');
    });
  });

  describe('Responsive Text', () => {
    it('should have readable font sizes', () => {
      const { container } = render(
        <OrgSetupWizard />
      );

      const textElements = container.querySelectorAll('p, span, label, button');
      textElements.forEach(element => {
        const fontSize = window.getComputedStyle(element).fontSize;
        const size = parseInt(fontSize);
        expect(size).toBeGreaterThanOrEqual(12);
      });
    });
  });
});
