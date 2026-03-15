import type { Meta, StoryObj } from '@storybook/react';
import { OrganizationSearchBar } from './OrganizationSearchBar';
import { fn } from '@storybook/test';

const meta = {
  title: 'Organization/OrganizationSearchBar',
  component: OrganizationSearchBar,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    onSelect: { action: 'selected' },
    placeholder: {
      control: 'text',
      description: 'Placeholder text for the search input',
    },
  },
} satisfies Meta<typeof OrganizationSearchBar>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Default search bar with standard configuration
 */
export const Default: Story = {
  args: {
    onSelect: fn(),
  },
};

/**
 * Search bar with custom placeholder
 */
export const CustomPlaceholder: Story = {
  args: {
    placeholder: 'Digite para buscar por processos, áreas ou atividades...',
    onSelect: fn(),
  },
};

/**
 * Search bar in responsive layout (mobile)
 */
export const Mobile: Story = {
  args: {
    onSelect: fn(),
  },
  parameters: {
    viewport: {
      defaultViewport: 'iphone12',
    },
  },
};

/**
 * Search bar in responsive layout (tablet)
 */
export const Tablet: Story = {
  args: {
    onSelect: fn(),
  },
  parameters: {
    viewport: {
      defaultViewport: 'ipad',
    },
  },
};

/**
 * Search bar in dark mode
 */
export const DarkMode: Story = {
  args: {
    onSelect: fn(),
  },
  parameters: {
    theme: 'dark',
  },
};

/**
 * Search bar with custom CSS class
 */
export const WithCustomClass: Story = {
  args: {
    className: 'border-2 border-blue-500',
    onSelect: fn(),
  },
};

/**
 * Search bar - Accessibility test with screen reader
 */
export const AccessibilityTest: Story = {
  args: {
    onSelect: fn(),
  },
  parameters: {
    a11y: {
      config: {
        rules: [
          {
            id: 'aria-required-attr',
            enabled: true,
          },
          {
            id: 'label-title-only',
            enabled: true,
          },
        ],
      },
    },
  },
};
