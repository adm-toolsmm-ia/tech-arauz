import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Badge } from './badge';

const meta = {
  title: 'UI/Badge',
  component: Badge,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'secondary', 'destructive', 'outline'],
    },
  },
} satisfies Meta<typeof Badge>;

export default meta;
type Story = StoryObj<typeof meta>;

// Default badge
export const Default: Story = {
  args: {
    children: 'Badge',
  },
};

// Variants
export const Variants: Story = {
  render: () => (
    <div className="flex gap-2">
      <Badge variant="default">Default</Badge>
      <Badge variant="secondary">Secondary</Badge>
      <Badge variant="destructive">Destructive</Badge>
      <Badge variant="outline">Outline</Badge>
    </div>
  ),
};

// Status badges
export const Status: Story = {
  render: () => (
    <div className="flex gap-2">
      <Badge className="bg-status-novo">Novo</Badge>
      <Badge className="bg-status-em-atendimento">Em-Atendimento</Badge>
      <Badge className="bg-status-aguardando">Aguardando</Badge>
      <Badge className="bg-status-resolvido">Resolvido</Badge>
      <Badge className="bg-status-cancelado">Cancelado</Badge>
    </div>
  ),
};

// Priority badges
export const Priority: Story = {
  render: () => (
    <div className="flex gap-2">
      <Badge className="bg-priority-alta">Alta</Badge>
      <Badge className="bg-priority-normal">Normal</Badge>
      <Badge className="bg-priority-baixa">Baixa</Badge>
    </div>
  ),
};

// With icon/content
export const WithContent: Story = {
  render: () => (
    <div className="space-y-2">
      <div className="flex gap-2">
        <Badge>React 18</Badge>
        <Badge>Next.js 14</Badge>
        <Badge>TypeScript</Badge>
      </div>
      <div className="flex gap-2">
        <Badge variant="outline">UI Design</Badge>
        <Badge variant="outline">Accessibility</Badge>
        <Badge variant="outline">Components</Badge>
      </div>
    </div>
  ),
};

// Pill badges
export const Pill: Story = {
  render: () => (
    <div className="flex gap-2">
      <Badge className="rounded-full">Pill Badge</Badge>
      <Badge variant="secondary" className="rounded-full">
        Pill Secondary
      </Badge>
      <Badge variant="outline" className="rounded-full">
        Pill Outline
      </Badge>
    </div>
  ),
};

// Badges in list
export const InList: Story = {
  render: () => (
    <div className="w-80 space-y-3">
      {[
        { name: 'React Component Library', tags: ['React', 'UI', 'Components'] },
        { name: 'Design System', tags: ['Design', 'System', 'Tokens'] },
        { name: 'Accessibility Focus', tags: ['a11y', 'WCAG AA', 'Inclusive'] },
      ].map((item, i) => (
        <div key={i} className="space-y-1">
          <p className="font-medium">{item.name}</p>
          <div className="flex flex-wrap gap-1">
            {item.tags.map((tag) => (
              <Badge key={tag} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        </div>
      ))}
    </div>
  ),
};

// Size variations
export const Sizes: Story = {
  render: () => (
    <div className="flex items-center gap-2">
      <Badge className="text-xs">Small</Badge>
      <Badge className="text-sm">Default</Badge>
      <Badge className="text-base">Large</Badge>
    </div>
  ),
};

// Closeable badges (with custom onClick)
const CloseableBadgesComponent = () => {
  const [badges, setBadges] = useState(['React', 'Next.js', 'TypeScript']);
  return (
    <div className="flex flex-wrap gap-2">
      {badges.map((badge) => (
        <Badge
          key={badge}
          variant="secondary"
          className="cursor-pointer hover:opacity-75"
          onClick={() => setBadges(badges.filter((b) => b !== badge))}
        >
          {badge} ×
        </Badge>
      ))}
    </div>
  );
};

export const Closeable: Story = {
  render: () => <CloseableBadgesComponent />,
};
