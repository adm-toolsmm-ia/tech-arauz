import type { Meta, StoryObj } from '@storybook/react'
import { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent } from './card'
import { Button } from './button'

const meta = {
  title: 'UI/Card',
  component: Card,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Card>

export default meta
type Story = StoryObj<typeof meta>

// Basic card
export const Default: Story = {
  render: () => (
    <Card className="w-80">
      <CardHeader>
        <CardTitle>Card Title</CardTitle>
        <CardDescription>Card description goes here</CardDescription>
      </CardHeader>
      <CardContent>
        <p>Card content with your component, text, or any other elements.</p>
      </CardContent>
      <CardFooter>
        <Button>Action</Button>
      </CardFooter>
    </Card>
  ),
}

// Simple card
export const Simple: Story = {
  render: () => (
    <Card className="w-80">
      <CardContent className="pt-6">
        <p>Simple card with just content</p>
      </CardContent>
    </Card>
  ),
}

// Card with complex content
export const Complex: Story = {
  render: () => (
    <Card className="w-80">
      <CardHeader>
        <CardTitle>Project Status</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <p className="text-sm font-medium">Progress: 75%</p>
          <div className="h-2 w-full rounded-full bg-secondary">
            <div className="h-full w-3/4 rounded-full bg-primary" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div className="text-center">
            <p className="text-2xl font-bold">12</p>
            <p className="text-xs text-muted-foreground">Tasks Done</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold">4</p>
            <p className="text-xs text-muted-foreground">In Progress</p>
          </div>
        </div>
      </CardContent>
      <CardFooter className="gap-2">
        <Button variant="outline" className="flex-1">
          Details
        </Button>
        <Button className="flex-1">Update</Button>
      </CardFooter>
    </Card>
  ),
}

// Card variations
export const Variations: Story = {
  render: () => (
    <div className="grid gap-4 md:grid-cols-2">
      {/* Default card */}
      <Card>
        <CardHeader>
          <CardTitle>Default Card</CardTitle>
        </CardHeader>
        <CardContent>Content goes here</CardContent>
      </Card>

      {/* Card with accent border */}
      <Card className="border-l-4 border-l-primary">
        <CardHeader>
          <CardTitle>Accent Card</CardTitle>
        </CardHeader>
        <CardContent>Card with accent border</CardContent>
      </Card>

      {/* Card with shadow hover */}
      <Card className="transition-shadow hover:shadow-card-hover">
        <CardHeader>
          <CardTitle>Hover Card</CardTitle>
        </CardHeader>
        <CardContent>Hover to see elevation change</CardContent>
      </Card>

      {/* Minimal card */}
      <Card className="border-0 bg-secondary">
        <CardContent className="pt-6">
          <p>Minimal card with custom styling</p>
        </CardContent>
      </Card>
    </div>
  ),
}

// Responsive cards grid
export const Grid: Story = {
  render: () => (
    <div className="grid gap-4 md:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <Card key={i}>
          <CardHeader>
            <CardTitle>Card {i + 1}</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Content for card {i + 1}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  ),
}

// Loading state
export const Loading: Story = {
  render: () => (
    <Card className="w-80">
      <CardHeader>
        <CardTitle className="animate-pulse">Loading...</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="h-4 w-full animate-pulse rounded bg-secondary" />
        <div className="h-4 w-3/4 animate-pulse rounded bg-secondary" />
      </CardContent>
    </Card>
  ),
}

// Card with status indicator
export const WithStatus: Story = {
  render: () => (
    <div className="grid gap-4 md:grid-cols-2">
      <Card className="border-l-4 border-l-status-novo">
        <CardHeader>
          <CardTitle>New Project</CardTitle>
        </CardHeader>
        <CardContent>
          <span className="text-xs font-medium text-status-novo">Novo</span>
        </CardContent>
      </Card>
      <Card className="border-l-4 border-l-status-resolvido">
        <CardHeader>
          <CardTitle>Completed Project</CardTitle>
        </CardHeader>
        <CardContent>
          <span className="text-xs font-medium text-status-resolvido">Resolvido</span>
        </CardContent>
      </Card>
    </div>
  ),
}
