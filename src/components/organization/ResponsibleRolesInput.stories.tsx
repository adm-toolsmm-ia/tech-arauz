import type { Meta, StoryObj } from '@storybook/react';
import { ResponsibleRolesInput } from './ResponsibleRolesInput';

/**
 * ResponsibleRolesInput Stories
 *
 * Storybook documentation for the ResponsibleRolesInput component.
 * Shows different states: empty, populated, disabled, etc.
 *
 * Story 11.6: Implement ResponsibleRolesInput Component
 */
const meta = {
  title: 'Organization/ResponsibleRolesInput',
  component: ResponsibleRolesInput,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    value: {
      control: 'object',
      description: 'Array of selected role values',
    },
    onChange: {
      description: 'Callback when roles change',
    },
    disabled: {
      control: 'boolean',
      description: 'Disable the component',
    },
  },
} satisfies Meta<typeof ResponsibleRolesInput>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Empty state - No roles selected
 */
export const Empty: Story = {
  args: {
    value: [],
    onChange: (roles) => console.log('Selected roles:', roles),
    disabled: false,
  },
};

/**
 * With pre-selected roles
 */
export const WithRoles: Story = {
  args: {
    value: ['manager', 'analyst'],
    onChange: (roles) => console.log('Selected roles:', roles),
    disabled: false,
  },
};

/**
 * Single role selected
 */
export const SingleRole: Story = {
  args: {
    value: ['manager'],
    onChange: (roles) => console.log('Selected roles:', roles),
    disabled: false,
  },
};

/**
 * Disabled state
 */
export const Disabled: Story = {
  args: {
    value: ['manager', 'analyst'],
    onChange: (roles) => console.log('Selected roles:', roles),
    disabled: true,
  },
};

/**
 * Many roles selected
 */
export const ManyRoles: Story = {
  args: {
    value: ['manager', 'analyst', 'coordinator', 'specialist'],
    onChange: (roles) => console.log('Selected roles:', roles),
    disabled: false,
  },
};

/**
 * Interactive story wrapper component
 */
function InteractiveWrapper(args: any) {
  const [roles, setRoles] = React.useState(args.value);

  return (
    <div className="w-96 space-y-4">
      <ResponsibleRolesInput
        {...args}
        value={roles}
        onChange={setRoles}
      />
      <div className="text-sm text-muted-foreground">
        <p>Selected: {roles.length > 0 ? roles.join(', ') : 'None'}</p>
        <p className="text-xs mt-2">
          Try keyboard navigation:
          <br />
          - Arrow Down/Up to navigate
          <br />
          - Enter to select
          <br />
          - Backspace to remove last
          <br />
          - Escape to close dropdown
        </p>
      </div>
    </div>
  );
}

/**
 * Interactive story for testing keyboard navigation
 */
export const Interactive: Story = {
  args: {
    value: [],
    onChange: (roles) => console.log('Selected roles:', roles),
    disabled: false,
  },
  render: (args) => <InteractiveWrapper {...args} />,
};

// Import React for the interactive story
import React from 'react';
