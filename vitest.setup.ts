import '@testing-library/jest-dom'
import { expect } from 'vitest'
import { toHaveNoViolations } from 'jest-axe'

// Extend vitest matchers with jest-axe
expect.extend(toHaveNoViolations)

// Suppress console errors in tests (optional)
global.console = {
  ...console,
  error: () => {},
  warn: () => {},
}
