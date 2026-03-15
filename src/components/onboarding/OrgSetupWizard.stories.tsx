import type { Meta, StoryObj } from '@storybook/react';
import { OrgSetupWizard } from './OrgSetupWizard';

/**
 * OrgSetupWizard Component Stories
 * Story 11.12: Organizational Setup Wizard
 *
 * Multi-step wizard for initializing organization structure
 */

const meta = {
  title: 'Onboarding/OrgSetupWizard',
  component: OrgSetupWizard,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div className="to-muted/30 min-h-screen bg-gradient-to-br from-background via-background px-4 py-8">
        <div className="mx-auto max-w-3xl">
          <Story />
        </div>
      </div>
    ),
  ],
} satisfies Meta<typeof OrgSetupWizard>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Default wizard with all features enabled
 */
export const Default: Story = {
  args: {
    onComplete: (organizationId: string) => {
      console.log('Organization created:', organizationId);
    },
  },
};

/**
 * Wizard in desktop view (wide screen)
 */
export const DesktopView: Story = {
  parameters: {
    viewport: {
      defaultViewport: 'desktop',
    },
  },
  args: {
    onComplete: (organizationId: string) => {
      console.log('Organization created:', organizationId);
    },
  },
};

/**
 * Wizard in tablet view
 */
export const TabletView: Story = {
  parameters: {
    viewport: {
      defaultViewport: 'tablet',
    },
  },
  args: {
    onComplete: (organizationId: string) => {
      console.log('Organization created:', organizationId);
    },
  },
};

/**
 * Wizard in mobile view
 */
export const MobileView: Story = {
  parameters: {
    viewport: {
      defaultViewport: 'mobile1',
    },
  },
  args: {
    onComplete: (organizationId: string) => {
      console.log('Organization created:', organizationId);
    },
  },
};

/**
 * Wizard with dark mode
 */
export const DarkMode: Story = {
  parameters: {
    backgrounds: {
      default: 'dark',
    },
  },
  decorators: [
    (Story) => (
      <div className="dark">
        <div className="to-muted/30 min-h-screen bg-gradient-to-br from-background via-background px-4 py-8">
          <div className="mx-auto max-w-3xl">
            <Story />
          </div>
        </div>
      </div>
    ),
  ],
  args: {
    onComplete: (organizationId: string) => {
      console.log('Organization created:', organizationId);
    },
  },
};

/**
 * Wizard with custom class name
 */
export const WithCustomClass: Story = {
  args: {
    className: 'shadow-lg rounded-xl',
    onComplete: (organizationId: string) => {
      console.log('Organization created:', organizationId);
    },
  },
};

/**
 * Accessibility test - No errors
 */
export const AccessibilityCompliant: Story = {
  args: {
    onComplete: (organizationId: string) => {
      console.log('Organization created:', organizationId);
    },
  },
  parameters: {
    a11y: {
      config: {
        rules: {
          'color-contrast': { enabled: true },
          'aria-required-attr': { enabled: true },
          'label-title-only': { enabled: false },
        },
      },
    },
  },
};
