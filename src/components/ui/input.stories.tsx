import type { Meta, StoryObj } from '@storybook/react'
import { Input } from './input'

const meta = {
  title: 'UI/Input',
  component: Input,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    type: {
      control: 'select',
      options: ['text', 'email', 'password', 'number', 'search', 'date'],
    },
    disabled: {
      control: 'boolean',
    },
  },
} satisfies Meta<typeof Input>

export default meta
type Story = StoryObj<typeof meta>

// Default input
export const Default: Story = {
  args: {
    placeholder: 'Enter text...',
    type: 'text',
  },
}

// Email input
export const Email: Story = {
  args: {
    type: 'email',
    placeholder: 'user@example.com',
  },
}

// Password input
export const Password: Story = {
  args: {
    type: 'password',
    placeholder: 'Enter password',
  },
}

// Number input
export const Number: Story = {
  args: {
    type: 'number',
    placeholder: '0',
    min: '0',
    max: '100',
  },
}

// Search input
export const Search: Story = {
  args: {
    type: 'search',
    placeholder: 'Search...',
  },
}

// Date input
export const Date: Story = {
  args: {
    type: 'date',
  },
}

// With value
export const WithValue: Story = {
  args: {
    type: 'text',
    value: 'Pre-filled value',
    readOnly: true,
  },
}

// Disabled state
export const Disabled: Story = {
  args: {
    placeholder: 'Disabled input',
    disabled: true,
  },
}

// With error state (using className)
export const Error: Story = {
  render: () => (
    <div className="space-y-2">
      <Input placeholder="Error input" className="border-red-500 focus:ring-red-500" />
      <p className="text-xs text-red-500">This field is required</p>
    </div>
  ),
}

// Input sizes
export const Sizes: Story = {
  render: () => (
    <div className="space-y-4 w-80">
      <div>
        <label className="text-sm font-medium">Small</label>
        <Input placeholder="Small input" className="h-8 text-sm" />
      </div>
      <div>
        <label className="text-sm font-medium">Default</label>
        <Input placeholder="Default input" />
      </div>
      <div>
        <label className="text-sm font-medium">Large</label>
        <Input placeholder="Large input" className="h-12 text-lg" />
      </div>
    </div>
  ),
}

// Input with label and description
export const WithLabel: Story = {
  render: () => (
    <div className="space-y-2 w-80">
      <label htmlFor="username" className="text-sm font-medium">
        Username
      </label>
      <Input id="username" placeholder="Enter your username" />
      <p className="text-xs text-muted-foreground">Must be 3-20 characters</p>
    </div>
  ),
}

// Multiple inputs
export const Form: Story = {
  render: () => (
    <div className="space-y-4 w-80">
      <div className="space-y-1">
        <label className="text-sm font-medium">Email</label>
        <Input type="email" placeholder="your@email.com" />
      </div>
      <div className="space-y-1">
        <label className="text-sm font-medium">Name</label>
        <Input type="text" placeholder="Full Name" />
      </div>
      <div className="space-y-1">
        <label className="text-sm font-medium">Age</label>
        <Input type="number" placeholder="25" min="0" max="120" />
      </div>
    </div>
  ),
}

// Focus state
export const Focused: Story = {
  render: () => (
    <Input autoFocus placeholder="This input is auto-focused" />
  ),
}

// Readonly
export const Readonly: Story = {
  args: {
    value: 'This is read-only',
    readOnly: true,
  },
}
