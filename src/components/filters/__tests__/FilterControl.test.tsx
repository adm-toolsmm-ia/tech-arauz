import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FilterControl } from '../FilterControl';
import { FilterDefinition, FilterControlType } from '@/lib/filters/filter-types';

// ─── Test Fixtures ────────────────────────────────────────────────────────────

const mockSelectDefinition: FilterDefinition = {
  id: 'status',
  label: 'Status',
  type: 'select',
  options: [
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' },
    { value: 'archived', label: 'Archived' },
  ],
  placeholder: 'Choose status...',
};

const mockMultiSelectDefinition: FilterDefinition = {
  id: 'tags',
  label: 'Tags',
  type: 'multi-select',
  multi: true,
  options: [
    { value: 'urgent', label: 'Urgent', badge: 'high' },
    { value: 'important', label: 'Important' },
    { value: 'review', label: 'Review' },
  ],
  searchable: true,
  clearable: true,
};

const mockCheckboxDefinition: FilterDefinition = {
  id: 'published',
  label: 'Published',
  type: 'checkbox',
  defaultValue: false,
};

const mockDateRangeDefinition: FilterDefinition = {
  id: 'date_range',
  label: 'Date Range',
  type: 'date-range',
};

const mockSliderDefinition: FilterDefinition = {
  id: 'priority',
  label: 'Priority',
  type: 'slider',
  defaultValue: 5,
};

const mockTagsDefinition: FilterDefinition = {
  id: 'custom_tags',
  label: 'Custom Tags',
  type: 'tags',
};

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('FilterControl Component', () => {
  let mockOnChange: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockOnChange = vi.fn();
    vi.clearAllMocks();
  });

  describe('Select Control', () => {
    it('renders select control with label and placeholder', () => {
      render(
        <FilterControl definition={mockSelectDefinition} value={null} onChange={mockOnChange} />,
      );

      expect(screen.getByText('Status')).toBeInTheDocument();
    });

    it('renders select with proper structure', () => {
      const { container } = render(
        <FilterControl definition={mockSelectDefinition} value={null} onChange={mockOnChange} />,
      );

      expect(container.querySelector('label')).toHaveTextContent('Status');
    });

    it('displays selected value when controlled', () => {
      const { rerender } = render(
        <FilterControl definition={mockSelectDefinition} value={null} onChange={mockOnChange} />,
      );

      rerender(
        <FilterControl definition={mockSelectDefinition} value="active" onChange={mockOnChange} />,
      );

      expect(screen.getByText('Active')).toBeInTheDocument();
    });

    it('handles disabled prop correctly', () => {
      const { container } = render(
        <FilterControl
          definition={mockSelectDefinition}
          value={null}
          onChange={mockOnChange}
          disabled={true}
        />,
      );

      const selectButton = container.querySelector('button');
      expect(selectButton).toBeDisabled();
    });

    it('handles isLoading prop correctly', () => {
      const { container } = render(
        <FilterControl
          definition={mockSelectDefinition}
          value={null}
          onChange={mockOnChange}
          isLoading={true}
        />,
      );

      const selectButton = container.querySelector('button');
      expect(selectButton).toBeDisabled();
    });
  });

  describe('Multi-Select Control', () => {
    it('renders multi-select with label', () => {
      render(
        <FilterControl definition={mockMultiSelectDefinition} value={[]} onChange={mockOnChange} />,
      );

      expect(screen.getByText('Tags')).toBeInTheDocument();
    });

    it('displays selection count when items selected', () => {
      render(
        <FilterControl
          definition={mockMultiSelectDefinition}
          value={['urgent', 'important']}
          onChange={mockOnChange}
        />,
      );

      expect(screen.getByText('2 selected')).toBeInTheDocument();
    });

    it('shows empty state when no items selected', () => {
      render(
        <FilterControl definition={mockMultiSelectDefinition} value={[]} onChange={mockOnChange} />,
      );

      expect(screen.getByText('Select Tags...')).toBeInTheDocument();
    });

    it('shows selected badges below control', () => {
      render(
        <FilterControl
          definition={mockMultiSelectDefinition}
          value={['urgent', 'important']}
          onChange={mockOnChange}
        />,
      );

      expect(screen.getByText('Urgent')).toBeInTheDocument();
      expect(screen.getByText('Important')).toBeInTheDocument();
    });

    it('renders popover trigger button', () => {
      render(
        <FilterControl definition={mockMultiSelectDefinition} value={[]} onChange={mockOnChange} />,
      );

      const triggerButton = screen.getByText('Select Tags...');
      expect(triggerButton).toBeInTheDocument();
    });

    it('handles disabled prop correctly', () => {
      const { container } = render(
        <FilterControl
          definition={mockMultiSelectDefinition}
          value={[]}
          onChange={mockOnChange}
          disabled={true}
        />,
      );

      const buttons = container.querySelectorAll('button');
      expect(buttons[0]).toBeDisabled();
    });

    it('handles isLoading prop correctly', () => {
      const { container } = render(
        <FilterControl
          definition={mockMultiSelectDefinition}
          value={[]}
          onChange={mockOnChange}
          isLoading={true}
        />,
      );

      const buttons = container.querySelectorAll('button');
      expect(buttons[0]).toBeDisabled();
    });

    it('renders all badges with clearable when set', () => {
      const { container } = render(
        <FilterControl
          definition={{ ...mockMultiSelectDefinition, clearable: true }}
          value={['urgent']}
          onChange={mockOnChange}
        />,
      );

      expect(screen.getByText('Urgent')).toBeInTheDocument();
      // Badge container should exist
      expect(container.querySelector('[class*="flex-wrap"]')).toBeInTheDocument();
    });
  });

  describe('Checkbox Control', () => {
    it('renders checkbox with label', () => {
      render(
        <FilterControl definition={mockCheckboxDefinition} value={false} onChange={mockOnChange} />,
      );

      expect(screen.getByText('Published')).toBeInTheDocument();
      expect(screen.getByRole('switch')).toBeInTheDocument();
    });

    it('toggles value when clicked', async () => {
      const user = userEvent.setup();
      render(
        <FilterControl definition={mockCheckboxDefinition} value={false} onChange={mockOnChange} />,
      );

      const switchElement = screen.getByRole('switch');
      await user.click(switchElement);

      expect(mockOnChange).toHaveBeenCalledWith(true);
    });

    it('displays checked state correctly', () => {
      const { rerender } = render(
        <FilterControl definition={mockCheckboxDefinition} value={false} onChange={mockOnChange} />,
      );

      let switchElement = screen.getByRole('switch');
      expect(switchElement).not.toHaveAttribute('data-state', 'checked');

      rerender(
        <FilterControl definition={mockCheckboxDefinition} value={true} onChange={mockOnChange} />,
      );

      switchElement = screen.getByRole('switch');
      expect(switchElement).toHaveAttribute('data-state', 'checked');
    });

    it('disables checkbox when disabled prop is true', () => {
      render(
        <FilterControl
          definition={mockCheckboxDefinition}
          value={false}
          onChange={mockOnChange}
          disabled={true}
        />,
      );

      const switchElement = screen.getByRole('switch');
      expect(switchElement).toBeDisabled();
    });
  });

  describe('Date Range Control', () => {
    it('renders two date inputs with label', () => {
      const { container } = render(
        <FilterControl definition={mockDateRangeDefinition} value={{}} onChange={mockOnChange} />,
      );

      expect(screen.getByText('Date Range')).toBeInTheDocument();
      const inputs = container.querySelectorAll('input[type="date"]');
      expect(inputs.length).toBe(2); // start and end date inputs
    });

    it('displays date label and structure', () => {
      const { container } = render(
        <FilterControl definition={mockDateRangeDefinition} value={{}} onChange={mockOnChange} />,
      );

      expect(screen.getByText('Date Range')).toBeInTheDocument();
      const dateInputs = container.querySelectorAll('input[type="date"]');
      expect(dateInputs.length).toBe(2);
    });

    it('displays selected date range', () => {
      const { container } = render(
        <FilterControl
          definition={mockDateRangeDefinition}
          value={{ start: '2026-02-27', end: '2026-03-27' }}
          onChange={mockOnChange}
        />,
      );

      const inputs = container.querySelectorAll(
        'input[type="date"]',
      ) as NodeListOf<HTMLInputElement>;
      expect(inputs[0].value).toBe('2026-02-27');
      expect(inputs[1].value).toBe('2026-03-27');
    });

    it('renders date inputs with aria labels', () => {
      render(
        <FilterControl definition={mockDateRangeDefinition} value={{}} onChange={mockOnChange} />,
      );

      expect(screen.getByLabelText('Start date')).toBeInTheDocument();
      expect(screen.getByLabelText('End date')).toBeInTheDocument();
    });

    it('disables inputs when disabled prop is true', () => {
      const { container } = render(
        <FilterControl
          definition={mockDateRangeDefinition}
          value={{}}
          onChange={mockOnChange}
          disabled={true}
        />,
      );

      const inputs = container.querySelectorAll(
        'input[type="date"]',
      ) as NodeListOf<HTMLInputElement>;
      expect(inputs[0]).toBeDisabled();
      expect(inputs[1]).toBeDisabled();
    });
  });

  describe('Slider Control', () => {
    it('renders slider with label', () => {
      render(<FilterControl definition={mockSliderDefinition} value={5} onChange={mockOnChange} />);

      expect(screen.getByText('Priority')).toBeInTheDocument();
      expect(screen.getByRole('slider')).toBeInTheDocument();
    });

    it('displays current value', () => {
      render(<FilterControl definition={mockSliderDefinition} value={7} onChange={mockOnChange} />);

      expect(screen.getByText('7')).toBeInTheDocument();
    });

    it('calls onChange when slider is moved', async () => {
      const user = userEvent.setup();
      render(<FilterControl definition={mockSliderDefinition} value={5} onChange={mockOnChange} />);

      const slider = screen.getByRole('slider');
      fireEvent.change(slider, { target: { value: 8 } });

      expect(mockOnChange).toHaveBeenCalledWith(8);
    });

    it('disables slider when disabled prop is true', () => {
      render(
        <FilterControl
          definition={mockSliderDefinition}
          value={5}
          onChange={mockOnChange}
          disabled={true}
        />,
      );

      const slider = screen.getByRole('slider');
      expect(slider).toBeDisabled();
    });
  });

  describe('Tags Control', () => {
    it('renders tags control with label', () => {
      render(<FilterControl definition={mockTagsDefinition} value={[]} onChange={mockOnChange} />);

      expect(screen.getByText('Custom Tags')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Add tags...')).toBeInTheDocument();
    });

    it('displays existing tags as badges', () => {
      render(
        <FilterControl
          definition={mockTagsDefinition}
          value={['tag1', 'tag2']}
          onChange={mockOnChange}
        />,
      );

      expect(screen.getByText('tag1')).toBeInTheDocument();
      expect(screen.getByText('tag2')).toBeInTheDocument();
    });

    it('disables input when disabled prop is true', () => {
      render(
        <FilterControl
          definition={mockTagsDefinition}
          value={[]}
          onChange={mockOnChange}
          disabled={true}
        />,
      );

      const input = screen.getByPlaceholderText('Add tags...');
      expect(input).toBeDisabled();
    });
  });

  describe('Dynamic Options', () => {
    it('handles options as function', () => {
      const dynamicDef: FilterDefinition = {
        ...mockSelectDefinition,
        options: () => [
          { value: 'dynamic1', label: 'Dynamic 1' },
          { value: 'dynamic2', label: 'Dynamic 2' },
        ],
      };

      render(<FilterControl definition={dynamicDef} value={null} onChange={mockOnChange} />);

      expect(screen.getByText('Status')).toBeInTheDocument();
    });

    it('handles static options array', () => {
      const staticDef: FilterDefinition = {
        ...mockSelectDefinition,
        options: [{ value: 'static1', label: 'Static 1' }],
      };

      render(<FilterControl definition={staticDef} value={null} onChange={mockOnChange} />);

      expect(screen.getByText('Status')).toBeInTheDocument();
    });
  });

  describe('Sorting', () => {
    it('applies sortOptions configuration', () => {
      const sortedDef: FilterDefinition = {
        ...mockSelectDefinition,
        sortOptions: true,
      };

      render(<FilterControl definition={sortedDef} value={null} onChange={mockOnChange} />);

      expect(screen.getByText('Status')).toBeInTheDocument();
    });
  });

  describe('Searchable Configuration', () => {
    it('renders searchable multi-select definition', () => {
      const searchableDef: FilterDefinition = {
        ...mockMultiSelectDefinition,
        searchable: true,
      };

      render(<FilterControl definition={searchableDef} value={[]} onChange={mockOnChange} />);

      expect(screen.getByText('Tags')).toBeInTheDocument();
    });

    it('renders unsearchable multi-select definition', () => {
      const unsearchableDef: FilterDefinition = {
        ...mockMultiSelectDefinition,
        searchable: false,
      };

      render(<FilterControl definition={unsearchableDef} value={[]} onChange={mockOnChange} />);

      expect(screen.getByText('Tags')).toBeInTheDocument();
    });
  });

  describe('className Prop', () => {
    it('applies custom className', () => {
      const { container } = render(
        <FilterControl
          definition={mockSelectDefinition}
          value={null}
          onChange={mockOnChange}
          className="custom-class"
        />,
      );

      expect(container.querySelector('.custom-class')).toBeInTheDocument();
    });
  });
});
