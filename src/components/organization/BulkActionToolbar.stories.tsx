import type { Meta, StoryObj } from '@storybook/react';
import { BulkActionToolbar } from './BulkActionToolbar';

const meta = {
  title: 'Organization/BulkActionToolbar',
  component: BulkActionToolbar,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: `Toolbar for bulk operations on organization entities.
        Enables bulk edit, delete, export (CSV/JSON), and import operations.
        Story 11.13: Bulk Operations & Import/Export`,
      },
    },
  },
  tags: ['autodocs'],
} satisfies Meta<typeof BulkActionToolbar>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Hidden when no items are selected
 */
export const Hidden: Story = {
  args: {
    selectedCount: 0,
    entityType: 'areas',
    onBulkUpdate: async () => {},
    onBulkDelete: async () => {},
    onExport: async () => {},
    onImport: async () => {},
  },
  render: () => (
    <div>
      <p className="mb-4 text-sm text-muted-foreground">
        Toolbar é hidden quando selectedCount = 0
      </p>
      <div className="h-8" />
    </div>
  ),
};

/**
 * Visible with single selection
 */
export const SingleSelection: Story = {
  args: {
    selectedCount: 1,
    entityType: 'área',
    onBulkUpdate: async () => console.log('Bulk update'),
    onBulkDelete: async () => console.log('Bulk delete'),
    onExport: async () => console.log('Export'),
    onImport: async () => console.log('Import'),
  },
};

/**
 * Visible with multiple selection
 */
export const MultipleSelection: Story = {
  args: {
    selectedCount: 5,
    entityType: 'núcleos',
    onBulkUpdate: async () => console.log('Bulk update'),
    onBulkDelete: async () => console.log('Bulk delete'),
    onExport: async () => console.log('Export'),
    onImport: async () => console.log('Import'),
  },
};

/**
 * Large selection
 */
export const LargeSelection: Story = {
  args: {
    selectedCount: 47,
    entityType: 'processos',
    onBulkUpdate: async () => console.log('Bulk update'),
    onBulkDelete: async () => console.log('Bulk delete'),
    onExport: async () => console.log('Export'),
    onImport: async () => console.log('Import'),
  },
};

/**
 * Disabled state
 */
export const Disabled: Story = {
  args: {
    selectedCount: 3,
    entityType: 'áreas',
    disabled: true,
    onBulkUpdate: async () => {},
    onBulkDelete: async () => {},
    onExport: async () => {},
    onImport: async () => {},
  },
};

/**
 * Loading state
 */
export const Loading: Story = {
  args: {
    selectedCount: 3,
    entityType: 'áreas',
    isLoading: true,
    onBulkUpdate: async () => {
      await new Promise((resolve) => setTimeout(resolve, 2000));
    },
    onBulkDelete: async () => {
      await new Promise((resolve) => setTimeout(resolve, 2000));
    },
    onExport: async () => {
      await new Promise((resolve) => setTimeout(resolve, 2000));
    },
    onImport: async () => {
      await new Promise((resolve) => setTimeout(resolve, 2000));
    },
  },
};

/**
 * With all handlers connected
 */
export const WithHandlers: Story = {
  args: {
    selectedCount: 12,
    entityType: 'atividades',
    onBulkUpdate: async (updates) => {
      console.log('Updating with:', updates);
      await new Promise((resolve) => setTimeout(resolve, 500));
    },
    onBulkDelete: async () => {
      console.log('Deleting selected items');
      await new Promise((resolve) => setTimeout(resolve, 800));
    },
    onExport: async (format) => {
      console.log(`Exporting as ${format}`);
      // Simulate download
      const content = format === 'csv' ? 'name,description\nItem 1,Desc 1' : '[]';
      const blob = new Blob([content], { type: 'text/plain' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `export.${format}`;
      a.click();
    },
    onImport: async (file) => {
      console.log(`Importing file: ${file.name}`);
      await new Promise((resolve) => setTimeout(resolve, 1000));
    },
  },
};

/**
 * Different entity types
 */
export const DifferentEntityTypes: Story = {
  args: {
    selectedCount: 3,
    entityType: 'item',
  },
  render: () => (
    <div className="space-y-8">
      <div>
        <h3 className="mb-3 text-sm font-semibold">Áreas (3 selecionadas)</h3>
        <BulkActionToolbar
          selectedCount={3}
          entityType="área"
          onBulkUpdate={async () => {}}
          onBulkDelete={async () => {}}
          onExport={async () => {}}
          onImport={async () => {}}
        />
      </div>

      <div>
        <h3 className="mb-3 text-sm font-semibold">Processos (8 selecionados)</h3>
        <BulkActionToolbar
          selectedCount={8}
          entityType="processo"
          onBulkUpdate={async () => {}}
          onBulkDelete={async () => {}}
          onExport={async () => {}}
          onImport={async () => {}}
        />
      </div>

      <div>
        <h3 className="mb-3 text-sm font-semibold">Atividades (15 selecionadas)</h3>
        <BulkActionToolbar
          selectedCount={15}
          entityType="atividade"
          onBulkUpdate={async () => {}}
          onBulkDelete={async () => {}}
          onExport={async () => {}}
          onImport={async () => {}}
        />
      </div>
    </div>
  ),
};

/**
 * Minimal - without handlers
 */
export const Minimal: Story = {
  args: {
    selectedCount: 2,
    entityType: 'item',
  },
};

/**
 * Edge case - exact 1 item (singular)
 */
export const ExactlyOne: Story = {
  args: {
    selectedCount: 1,
    entityType: 'documento',
    onBulkUpdate: async () => {},
    onBulkDelete: async () => {},
    onExport: async () => {},
    onImport: async () => {},
  },
};

/**
 * Edge case - many items
 */
export const ManyItems: Story = {
  args: {
    selectedCount: 999,
    entityType: 'registros',
    onBulkUpdate: async () => {},
    onBulkDelete: async () => {},
    onExport: async () => {},
    onImport: async () => {},
  },
};

/**
 * Accessibility test - keyboard navigation
 * All buttons should be reachable via Tab key
 */
export const Accessible: Story = {
  args: {
    selectedCount: 5,
    entityType: 'áreas',
    onBulkUpdate: async () => console.log('Updated'),
    onBulkDelete: async () => console.log('Deleted'),
    onExport: async () => console.log('Exported'),
    onImport: async () => console.log('Imported'),
  },
  parameters: {
    docs: {
      description: {
        story: 'All interactive elements should be keyboard accessible.',
      },
    },
  },
};

/**
 * RTL test
 */
export const RTL: Story = {
  args: {
    selectedCount: 3,
    entityType: 'elementos',
    onBulkUpdate: async () => {},
    onBulkDelete: async () => {},
    onExport: async () => {},
    onImport: async () => {},
  },
  decorators: [
    (Story) => (
      <div dir="rtl">
        <Story />
      </div>
    ),
  ],
};
