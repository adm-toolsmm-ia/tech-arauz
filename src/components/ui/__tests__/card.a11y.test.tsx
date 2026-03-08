import { axe } from 'jest-axe'
import { render } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { Card, CardHeader, CardTitle, CardContent } from '../card'

describe('Card A11y', () => {
  it('should have no violations', async () => {
    const { container } = render(
      <Card>
        <CardHeader>
          <CardTitle>Title</CardTitle>
        </CardHeader>
        <CardContent>Content here</CardContent>
      </Card>
    )
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })

  it('should have semantic structure with heading', async () => {
    const { container, getByRole } = render(
      <Card>
        <CardHeader>
          <CardTitle>Project Details</CardTitle>
        </CardHeader>
        <CardContent>Project information</CardContent>
      </Card>
    )
    expect(getByRole('heading')).toBeInTheDocument()
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })
})
