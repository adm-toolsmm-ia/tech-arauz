import { axe } from 'jest-axe'
import { render } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { Progress } from '../progress'

describe('Progress A11y', () => {
  it('should have no violations', async () => {
    const { container } = render(
      <div>
        <label htmlFor="progress">Loading:</label>
        <Progress id="progress" value={65} aria-label="Upload progress" />
      </div>
    )
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })

  it('should announce progress percentage', async () => {
    const { container } = render(
      <Progress
        value={75}
        aria-valuenow={75}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Installation progress: 75%"
      />
    )
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })
})
