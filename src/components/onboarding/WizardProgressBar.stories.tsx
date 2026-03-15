import type { Meta, StoryObj } from '@storybook/react';
import { WizardProgressBar } from './WizardProgressBar';

/**
 * WizardProgressBar Component Stories
 * Story 11.12: Progress indicator for wizard
 *
 * Shows current step and overall progress
 */

const meta = {
  title: 'Onboarding/WizardProgressBar',
  component: WizardProgressBar,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div className="w-full max-w-2xl">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof WizardProgressBar>;

export default meta;
type Story = StoryObj<typeof meta>;

const steps = [
  { number: 1, label: 'Básicos', completed: false },
  { number: 2, label: 'Modelo', completed: false },
  { number: 3, label: 'Estrutura', completed: false },
  { number: 4, label: 'Funções', completed: false },
  { number: 5, label: 'Integração', completed: false },
];

/**
 * Step 1 - Beginning of wizard
 */
export const Step1: Story = {
  args: {
    steps,
    currentStep: 1,
  },
};

/**
 * Step 2 - First step completed
 */
export const Step2: Story = {
  args: {
    steps: [
      { ...steps[0], completed: true },
      steps[1],
      steps[2],
      steps[3],
      steps[4],
    ],
    currentStep: 2,
  },
};

/**
 * Step 3 - Half way through
 */
export const Step3: Story = {
  args: {
    steps: [
      { ...steps[0], completed: true },
      { ...steps[1], completed: true },
      steps[2],
      steps[3],
      steps[4],
    ],
    currentStep: 3,
  },
};

/**
 * Step 4 - Almost complete
 */
export const Step4: Story = {
  args: {
    steps: [
      { ...steps[0], completed: true },
      { ...steps[1], completed: true },
      { ...steps[2], completed: true },
      steps[3],
      steps[4],
    ],
    currentStep: 4,
  },
};

/**
 * Step 5 - Final step
 */
export const Step5: Story = {
  args: {
    steps: [
      { ...steps[0], completed: true },
      { ...steps[1], completed: true },
      { ...steps[2], completed: true },
      { ...steps[3], completed: true },
      steps[4],
    ],
    currentStep: 5,
  },
};

/**
 * Completed - All steps done
 */
export const AllCompleted: Story = {
  args: {
    steps: steps.map((s, idx) => ({
      ...s,
      completed: idx < 5,
    })),
    currentStep: 5,
  },
};

/**
 * With custom class name
 */
export const WithCustomClass: Story = {
  args: {
    steps,
    currentStep: 2,
    className: 'bg-muted p-4 rounded-lg',
  },
};

/**
 * Dark mode
 */
export const DarkMode: Story = {
  decorators: [
    (Story) => (
      <div className="dark">
        <div className="w-full max-w-2xl bg-slate-950 p-6">
          <Story />
        </div>
      </div>
    ),
  ],
  args: {
    steps,
    currentStep: 3,
  },
};

/**
 * Mobile responsive
 */
export const MobileResponsive: Story = {
  parameters: {
    viewport: {
      defaultViewport: 'mobile1',
    },
  },
  args: {
    steps,
    currentStep: 2,
  },
};

/**
 * Accessibility test
 */
export const AccessibilityCompliant: Story = {
  args: {
    steps,
    currentStep: 2,
  },
  parameters: {
    a11y: {
      config: {
        rules: {
          'aria-required-attr': { enabled: true },
          'button-name': { enabled: true },
        },
      },
    },
  },
};

/**
 * Three step variant
 */
export const ThreeSteps: Story = {
  args: {
    steps: [
      { number: 1, label: 'Informações', completed: true },
      { number: 2, label: 'Confirmação', completed: false },
      { number: 3, label: 'Sucesso', completed: false },
    ],
    currentStep: 2,
  },
};

/**
 * Many steps variant
 */
export const ManySteps: Story = {
  args: {
    steps: [
      { number: 1, label: 'Dados Básicos', completed: true },
      { number: 2, label: 'Endereço', completed: true },
      { number: 3, label: 'Contato', completed: true },
      { number: 4, label: 'Documentos', completed: false },
      { number: 5, label: 'Verificação', completed: false },
      { number: 6, label: 'Revisão', completed: false },
      { number: 7, label: 'Conclusão', completed: false },
    ],
    currentStep: 4,
  },
};
