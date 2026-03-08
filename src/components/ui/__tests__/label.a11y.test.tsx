import { axe } from 'jest-axe'
import { render } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { Label } from '../label'
import { Input } from '../input'

describe('Label A11y', () => {
  it('should have no violations when associated with input', async () => {
    const { container } = render(
      <div>
        <Label htmlFor="name">Name:</Label>
        <Input id="name" />
      </div>
    )
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })

  it('should render as proper label element', () => {
    const { getByText } = render(
      <Label htmlFor="test">Test Label</Label>
    )
    expect(getByText('Test Label')).toBeInTheDocument()
  })
})
