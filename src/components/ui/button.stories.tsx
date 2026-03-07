import type { Meta, StoryObj } from '@storybook/react'
import { Button } from './button'

const meta = {
  title: 'UI/Button',
  component: Button,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'destructive', 'outline', 'secondary', 'ghost', 'link'],
    },
    size: {
      control: 'select',
      options: ['default', 'sm', 'lg', 'icon'],
    },
    disabled: {
      control: 'boolean',
    },
  },
} satisfies Meta<typeof Button>

export default meta
type Story = StoryObj<typeof meta>

// Default button
export const Default: Story = {
  args: {
    children: 'Click me',
    variant: 'default',
    size: 'default',
  },
}

// Primary action (semantic)
export const Primary: Story = {
  args: {
    children: 'Primary Action',
    variant: 'default',
    size: 'default',
  },
  render: (args) => (
    <Button {...args} className="bg-primary text-primary-foreground hover:bg-primary/90">
      {args.children}
    </Button>
  ),
}

// Secondary variant
export const Secondary: Story = {
  args: {
    children: 'Secondary Action',
    variant: 'secondary',
  },
}

// Destructive variant
export const Destructive: Story = {
  args: {
    children: 'Delete',
    variant: 'destructive',
  },
}

// Outline variant
export const Outline: Story = {
  args: {
    children: 'Outlined',
    variant: 'outline',
  },
}

// Ghost variant
export const Ghost: Story = {
  args: {
    children: 'Ghost',
    variant: 'ghost',
  },
}

// Link variant
export const Link: Story = {
  args: {
    children: 'Link Button',
    variant: 'link',
  },
}

// Size variations
export const Small: Story = {
  args: {
    children: 'Small',
    size: 'sm',
  },
}

export const Large: Story = {
  args: {
    children: 'Large',
    size: 'lg',
  },
}

export const Icon: Story = {
  args: {
    children: '→',
    size: 'icon',
  },
}

// Disabled state
export const Disabled: Story = {
  args: {
    children: 'Disabled',
    disabled: true,
  },
}

// Button group
export const ButtonGroup: Story = {
  render: () => (
    <div className="flex gap-2">
      <Button variant="default">Save</Button>
      <Button variant="outline">Cancel</Button>
      <Button variant="destructive">Delete</Button>
    </div>
  ),
}

// Loading state (with disabled)
export const Loading: Story = {
  args: {
    children: 'Loading...',
    disabled: true,
  },
}

// All variants showcase
export const AllVariants: Story = {
  render: () => (
    <div className="grid gap-4">
      <div className="flex gap-2">
        <Button variant="default">Default</Button>
        <Button variant="secondary">Secondary</Button>
        <Button variant="destructive">Destructive</Button>
      </div>
      <div className="flex gap-2">
        <Button variant="outline">Outline</Button>
        <Button variant="ghost">Ghost</Button>
        <Button variant="link">Link</Button>
      </div>
      <div className="flex gap-2">
        <Button size="sm">Small</Button>
        <Button size="default">Default</Button>
        <Button size="lg">Large</Button>
        <Button size="icon">→</Button>
      </div>
    </div>
  ),
}
