import type { Meta, StoryObj } from '@storybook/react';

const meta: Meta = {
  title: 'DesignTokens',
  tags: ['autodocs'],
};

export default meta;

type Story = StoryObj;

/**
 * Color Palette
 * All semantic colors defined in design/tokens.json with WCAG AA contrast ratios
 */
export const Colors: Story = {
  render: () => (
    <div className="space-y-8 p-8">
      <div>
        <h2 className="mb-4 text-2xl font-bold">Semantic Colors</h2>
        <div className="grid grid-cols-3 gap-4">
          <div className="rounded bg-blue-500 p-6 text-white">
            <p className="font-semibold">Primary</p>
            <p className="text-sm">#3b82f6</p>
          </div>
          <div className="rounded bg-green-500 p-6 text-white">
            <p className="font-semibold">Success</p>
            <p className="text-sm">#22c55e</p>
          </div>
          <div className="rounded bg-yellow-500 p-6 text-black">
            <p className="font-semibold">Warning</p>
            <p className="text-sm">#f59e0b</p>
          </div>
          <div className="rounded bg-red-500 p-6 text-white">
            <p className="font-semibold">Error</p>
            <p className="text-sm">#ef4444</p>
          </div>
          <div className="rounded bg-blue-400 p-6 text-white">
            <p className="font-semibold">Info</p>
            <p className="text-sm">#0ea5e9</p>
          </div>
        </div>
      </div>

      <div>
        <h2 className="mb-4 text-2xl font-bold">Grayscale</h2>
        <div className="space-y-2">
          {[50, 100, 200, 300, 400, 500, 600, 700, 800, 900].map((level) => (
            <div key={level} className="flex items-center gap-4">
              <div
                className="h-12 w-24 rounded border"
                style={{
                  backgroundColor: `hsl(0, 0%, ${100 - level / 10}%)`,
                }}
              />
              <span className="font-mono">gray-{level}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  ),
};

/**
 * Typography Tokens
 * Font families, sizes, weights, and line-heights
 */
export const Typography: Story = {
  render: () => (
    <div className="space-y-8 p-8">
      <div>
        <h2 className="mb-4 text-2xl font-bold">Font Families</h2>
        <div className="space-y-4">
          <div style={{ fontFamily: 'DM Sans, sans-serif' }}>
            <p className="text-sm text-gray-500">Body (DM Sans)</p>
            <p className="text-lg">The quick brown fox jumps over the lazy dog</p>
          </div>
          <div style={{ fontFamily: 'Georgia, serif' }}>
            <p className="text-sm text-gray-500">Heading (Georgia)</p>
            <p className="text-lg">The quick brown fox jumps over the lazy dog</p>
          </div>
          <div style={{ fontFamily: 'Courier New, monospace' }}>
            <p className="text-sm text-gray-500">Mono (Courier New)</p>
            <p className="text-lg">const x = 42;</p>
          </div>
        </div>
      </div>

      <div>
        <h2 className="mb-4 text-2xl font-bold">Font Sizes</h2>
        <div className="space-y-2">
          <p className="text-xs">xs: 12px</p>
          <p className="text-sm">sm: 14px</p>
          <p className="text-base">base: 16px</p>
          <p className="text-lg">lg: 18px</p>
          <p className="text-xl">xl: 20px</p>
          <p className="text-2xl">2xl: 24px</p>
          <p className="text-3xl">3xl: 30px</p>
        </div>
      </div>

      <div>
        <h2 className="mb-4 text-2xl font-bold">Font Weights</h2>
        <div className="space-y-2">
          <p style={{ fontWeight: 400 }}>Regular (400)</p>
          <p style={{ fontWeight: 500 }}>Medium (500)</p>
          <p style={{ fontWeight: 600 }}>Semibold (600)</p>
          <p style={{ fontWeight: 700 }}>Bold (700)</p>
        </div>
      </div>
    </div>
  ),
};

/**
 * Spacing Scale
 * Consistent spacing values used throughout the design system
 */
export const Spacing: Story = {
  render: () => (
    <div className="p-8">
      <h2 className="mb-6 text-2xl font-bold">Spacing Scale</h2>
      <div className="space-y-4">
        {[
          { name: 'xs', size: 4, value: '0.25rem' },
          { name: 'sm', size: 8, value: '0.5rem' },
          { name: 'md', size: 12, value: '0.75rem' },
          { name: 'lg', size: 16, value: '1rem' },
          { name: 'xl', size: 24, value: '1.5rem' },
          { name: '2xl', size: 32, value: '2rem' },
          { name: '3xl', size: 40, value: '2.5rem' },
          { name: '4xl', size: 48, value: '3rem' },
        ].map(({ name, size, value }) => (
          <div key={name} className="flex items-center gap-4">
            <div className="bg-blue-200" style={{ width: `${size}px`, height: '20px' }} />
            <span className="min-w-12 font-mono">{name}</span>
            <span className="text-gray-600">{size}px</span>
            <span className="text-gray-600">({value})</span>
          </div>
        ))}
      </div>
    </div>
  ),
};

/**
 * Border Radius
 * Predefined border-radius values
 */
export const BorderRadius: Story = {
  render: () => (
    <div className="space-y-8 p-8">
      <h2 className="mb-6 text-2xl font-bold">Border Radius</h2>
      <div className="grid grid-cols-4 gap-4">
        <div className="rounded bg-blue-100 p-4 text-center">
          <div className="mb-2 h-12 rounded bg-blue-500" />
          <span className="text-sm">rounded</span>
        </div>
        <div className="rounded-lg bg-blue-100 p-4 text-center">
          <div className="mb-2 h-12 rounded-lg bg-blue-500" />
          <span className="text-sm">rounded-lg</span>
        </div>
        <div className="rounded-xl bg-blue-100 p-4 text-center">
          <div className="mb-2 h-12 rounded-xl bg-blue-500" />
          <span className="text-sm">rounded-xl</span>
        </div>
        <div className="rounded-full bg-blue-100 p-4 text-center">
          <div className="mb-2 h-12 rounded-full bg-blue-500" />
          <span className="text-sm">rounded-full</span>
        </div>
      </div>
    </div>
  ),
};

/**
 * Shadows
 * Elevation shadows for layering components
 */
export const Shadows: Story = {
  render: () => (
    <div className="space-y-8 p-8">
      <h2 className="mb-6 text-2xl font-bold">Box Shadows</h2>
      <div className="grid grid-cols-5 gap-4">
        {[
          { name: 'sm', shadow: '0 1px 2px 0 rgb(0 0 0 / 0.05)' },
          { name: 'md', shadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' },
          { name: 'lg', shadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' },
          { name: 'xl', shadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' },
          { name: '2xl', shadow: '0 25px 50px -12px rgb(0 0 0 / 0.25)' },
        ].map(({ name, shadow }) => (
          <div key={name} className="rounded bg-white p-6" style={{ boxShadow: shadow }}>
            <p className="text-center text-sm font-semibold">{name}</p>
          </div>
        ))}
      </div>
    </div>
  ),
};
