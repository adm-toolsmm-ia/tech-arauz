import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { ActivitySystemsModal } from './ActivitySystemsModal';
import type { OrgSystem } from '@/types/organization';

/**
 * ActivitySystemsModal Stories
 *
 * Storybook documentation for the ActivitySystemsModal component.
 * Shows different states: open, with systems, empty, etc.
 *
 * Story 11.8: Activity-System Relationship UI
 */

const mockSystems: OrgSystem[] = [
  {
    id: '1',
    tenant_id: 'test-tenant',
    name: 'ERP System',
    description: 'Enterprise Resource Planning',
    purpose: 'Financial and operational management',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '2',
    tenant_id: 'test-tenant',
    name: 'CRM System',
    description: 'Customer Relationship Management',
    purpose: 'Client relationship tracking',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '3',
    tenant_id: 'test-tenant',
    name: 'BI Dashboard',
    description: 'Business Intelligence',
    purpose: 'Analytics and reporting',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

const meta = {
  title: 'Organization/ActivitySystemsModal',
  component: ActivitySystemsModal,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    isOpen: {
      control: 'boolean',
      description: 'Is modal open?',
    },
    onClose: {
      description: 'Called when modal closes',
    },
    onSave: {
      description: 'Called when save is clicked',
    },
  },
} satisfies Meta<typeof ActivitySystemsModal>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Modal open - no systems
 */
export const Empty: Story = {
  args: {
    activityId: 'activity-1',
    isOpen: true,
    onClose: () => console.log('Modal closed'),
    onSave: () => console.log('Saved'),
    availableSystems: mockSystems,
  },
};

/**
 * Interactive story wrapper component
 */
function InteractiveWrapper(args: any) {
  const [isOpen, setIsOpen] = React.useState(args.isOpen);

  return (
    <div className="space-y-4">
      <button
        onClick={() => setIsOpen(true)}
        className="px-4 py-2 bg-primary text-primary-foreground rounded-md"
      >
        Open Modal
      </button>

      <ActivitySystemsModal
        {...args}
        isOpen={isOpen}
        onClose={() => {
          setIsOpen(false);
          console.log('Modal closed');
        }}
        onSave={() => {
          console.log('Saved');
          setIsOpen(false);
        }}
      />
    </div>
  );
}

/**
 * Interactive story to control modal state
 */
export const Interactive: Story = {
  render: (args) => <InteractiveWrapper {...args} />,
  args: {
    activityId: 'activity-1',
    isOpen: false,
    availableSystems: mockSystems,
  },
};

/**
 * Mobile responsive preview
 */
export const Mobile: Story = {
  args: {
    activityId: 'activity-1',
    isOpen: true,
    onClose: () => console.log('Modal closed'),
    onSave: () => console.log('Saved'),
    availableSystems: mockSystems,
  },
  parameters: {
    viewport: {
      defaultViewport: 'mobile1',
    },
  },
};
