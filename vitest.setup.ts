import '@testing-library/jest-dom'
import { expect, vi } from 'vitest'
import { toHaveNoViolations } from 'jest-axe'

// Extend vitest matchers with jest-axe
expect.extend(toHaveNoViolations)

// Mock ResizeObserver for Radix UI components
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}))

// Mock scrollIntoView for cmdk and other components
Element.prototype.scrollIntoView = vi.fn()

// Suppress console errors in tests (optional)
global.console = {
  ...console,
  error: () => {},
  warn: () => {},
}
