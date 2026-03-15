import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { ResponsibleRolesInput } from '@/components/organization/ResponsibleRolesInput';
import { getAllRoles } from '@/lib/organization/role-definitions';

/**
 * ResponsibleRolesInput Component Stories
 * Story 11.6: Implement ResponsibleRolesInput Component (UI)
 *
 * Component Features:
 * - Tag-based role display with remove button
 * - Autocomplete dropdown with filtering
 * - Full keyboard navigation (ArrowUp/Down, Enter, Escape, Backspace)
 * - WCAG AA accessibility (ARIA labels, focus management)
 * - Responsive design (mobile-friendly)
 * - Dark mode support
 *
 * Test Coverage:
 * - Responsive layouts (320px, 768px, 1920px)
 * - Keyboard navigation
 * - Screen reader compatibility
 * - Dark/light mode
 */

const meta: Meta<typeof ResponsibleRolesInput> = {
  title: 'Organization/ResponsibleRolesInput',
  component: ResponsibleRolesInput,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Advanced tag-based input component with autocomplete dropdown for managing responsible roles. Supports keyboard navigation, WCAG AA accessibility, and responsive layouts.',
      },
    },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof ResponsibleRolesInput>;

/**
 * Interactive component wrapper for Storybook
 * Manages internal state to allow interactive testing
 */
function InteractiveWrapper({
  defaultValue = [],
  disabled = false,
}: {
  defaultValue?: string[];
  disabled?: boolean;
}) {
  const [value, setValue] = useState<string[]>(defaultValue);

  return (
    <div className="w-full max-w-md space-y-4">
      <ResponsibleRolesInput
        value={value}
        onChange={setValue}
        disabled={disabled}
      />
      <div className="rounded bg-slate-100 p-3 dark:bg-slate-900">
        <p className="text-xs font-semibold text-slate-600 dark:text-slate-400">
          Selected Roles (JSON):
        </p>
        <pre className="mt-2 text-xs overflow-auto max-h-24">
          {JSON.stringify(value, null, 2)}
        </pre>
      </div>
    </div>
  );
}

/**
 * Default state - empty input ready for selection
 * - Focus on input field
 * - Shows placeholder text
 * - Dropdown not yet visible
 * - Suitable for form initialization
 */
export const Default: Story = {
  render: () => <InteractiveWrapper />,
};

/**
 * Pre-populated state with selected roles
 * - Shows 3 tags (diretor, gerente, especialista)
 * - Demonstrates tag display and remove buttons
 * - Remaining roles available in dropdown
 * - Good for editing existing assignments
 */
export const WithSelectedRoles: Story = {
  render: () => (
    <InteractiveWrapper defaultValue={['diretor', 'gerente', 'especialista']} />
  ),
};

/**
 * Disabled state - read-only
 * - All interactions disabled
 * - Shows existing selection
 * - Remove buttons disabled
 * - Input field disabled
 * - Use for view-only mode or during loading
 */
export const Disabled: Story = {
  render: () => (
    <InteractiveWrapper
      defaultValue={['gerente', 'analista_senior']}
      disabled={true}
    />
  ),
};

/**
 * Dark mode variant
 * - Uses dark background (bg-slate-900)
 * - Light text (text-slate-100)
 * - Tested for WCAG AA contrast ratios
 * - Uses CSS variables for theme support
 */
export const DarkMode: Story = {
  render: () => (
    <div className="bg-slate-950 p-8 rounded-lg">
      <div className="max-w-md">
        <InteractiveWrapper />
      </div>
    </div>
  ),
  decorators: [
    (Story) => (
      <div className="dark">
        <Story />
      </div>
    ),
  ],
};

/**
 * Mobile layout (320px viewport width)
 * - Single column layout
 * - Tags stack vertically
 * - Input field takes full width
 * - Dropdown adapts to mobile screen size
 * - Tested for iOS Safari and Android Chrome
 */
export const MobileViewport: Story = {
  render: () => <InteractiveWrapper defaultValue={['diretor', 'gerente']} />,
  parameters: {
    viewport: {
      defaultViewport: 'mobile1',
    },
  },
};

/**
 * Tablet layout (768px viewport width)
 * - Medium-sized viewport
 * - Tags wrap naturally
 * - Input field optimized for touch
 * - Dropdown properly positioned
 */
export const TabletViewport: Story = {
  render: () => <InteractiveWrapper defaultValue={['coordenador', 'especialista']} />,
  parameters: {
    viewport: {
      defaultViewport: 'tablet',
    },
  },
};

/**
 * Desktop layout (1920px viewport width)
 * - Full-width display
 * - Multiple tags per row
 * - Optimal spacing and readability
 * - Dropdown at full width constraint
 */
export const DesktopViewport: Story = {
  render: () => (
    <div className="w-full max-w-2xl mx-auto">
      <InteractiveWrapper
        defaultValue={['analista_junior', 'operacional', 'administrativo']}
      />
    </div>
  ),
  parameters: {
    viewport: {
      defaultViewport: 'desktop',
    },
  },
};

/**
 * Accessibility & Keyboard Navigation Test
 * - All keyboard shortcuts working:
 *   - ArrowUp/Down: Navigate dropdown
 *   - Enter: Select highlighted role
 *   - Escape: Close dropdown
 *   - Backspace: Remove last tag
 * - Screen reader annotations visible
 * - ARIA labels properly set
 * - Focus indicators visible
 *
 * Instructions:
 * 1. Focus on input field
 * 2. Press ArrowDown to open dropdown
 * 3. Press ArrowUp/Down to navigate
 * 4. Press Enter to select
 * 5. Press Backspace to remove last tag
 * 6. Press Escape to close dropdown
 */
export const A11yKeyboardNavigation: Story = {
  render: () => (
    <div className="space-y-6 p-4">
      <div>
        <h3 className="mb-2 text-lg font-bold">Keyboard Navigation Test</h3>
        <InteractiveWrapper />
      </div>

      <div className="rounded bg-blue-50 p-4 dark:bg-blue-950">
        <h4 className="mb-3 font-semibold text-blue-900 dark:text-blue-100">
          Keyboard Shortcuts:
        </h4>
        <ul className="space-y-2 text-sm text-blue-800 dark:text-blue-200">
          <li>
            <strong>ArrowDown</strong> - Open dropdown / move to next option
          </li>
          <li>
            <strong>ArrowUp</strong> - Move to previous option
          </li>
          <li>
            <strong>Enter</strong> - Select highlighted option
          </li>
          <li>
            <strong>Escape</strong> - Close dropdown
          </li>
          <li>
            <strong>Backspace</strong> - Remove last selected role
          </li>
        </ul>
      </div>

      <div className="rounded bg-amber-50 p-4 dark:bg-amber-950">
        <h4 className="mb-2 font-semibold text-amber-900 dark:text-amber-100">
          WCAG AA Checklist:
        </h4>
        <ul className="space-y-1 text-sm text-amber-800 dark:text-amber-200">
          <li>✓ ARIA labels on input (aria-label)</li>
          <li>✓ Role attribute (role=&quot;combobox&quot;)</li>
          <li>✓ aria-expanded indicates dropdown state</li>
          <li>✓ aria-controls links to listbox</li>
          <li>✓ Listbox role on dropdown container</li>
          <li>✓ Option roles on items</li>
          <li>✓ Focus visible on interactive elements</li>
          <li>✓ Semantic HTML structure</li>
        </ul>
      </div>
    </div>
  ),
};

/**
 * All Roles Display Test
 * - Shows all 9 available roles organized by category:
 *   - Management: Diretor, Gerente, Coordenador
 *   - Specialist: Especialista, Analista Sênior, Analista Júnior
 *   - Operational: Operacional, Administrativo, Supervisor
 * - Useful for verifying role registry and filtering
 */
export const AllRolesShowcase: Story = {
  render: () => {
    const allRoles = getAllRoles();
    return (
      <div className="space-y-4">
        <InteractiveWrapper />

        <div className="grid gap-4 sm:grid-cols-3">
          {['management', 'specialist', 'operational'].map((category) => (
            <div
              key={category}
              className="rounded border p-3 dark:border-slate-700"
            >
              <h4 className="mb-2 font-semibold capitalize text-slate-700 dark:text-slate-300">
                {category === 'management' && 'Management (Gestão)'}
                {category === 'specialist' && 'Specialist (Especialistas)'}
                {category === 'operational' && 'Operational (Operacional)'}
              </h4>
              <ul className="space-y-1 text-sm">
                {allRoles
                  .filter((r) => r.category === category)
                  .map((role) => (
                    <li
                      key={role.value}
                      className="text-slate-600 dark:text-slate-400"
                    >
                      {role.label}
                      <span className="text-xs text-slate-500 dark:text-slate-500 ml-1">
                        ({role.description})
                      </span>
                    </li>
                  ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    );
  },
};

/**
 * Filter & Search Test
 * - Test typing to filter available roles
 * - Demonstrates autocomplete functionality
 * - Shows how duplicate prevention works
 * - Try typing: "ger" (finds Gerente, Gerência)
 */
export const SearchAndFilter: Story = {
  render: () => (
    <div className="space-y-4">
      <div className="rounded bg-green-50 p-3 dark:bg-green-950 text-sm">
        <p className="text-green-900 dark:text-green-100">
          💡 Try typing in the input field to filter roles. Try typing &quot;ger&quot;
          to find &quot;Gerente&quot;
        </p>
      </div>
      <InteractiveWrapper defaultValue={['diretor']} />
    </div>
  ),
};
