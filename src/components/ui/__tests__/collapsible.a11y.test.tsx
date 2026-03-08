import { axe } from 'jest-axe'
import { render } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from '../collapsible'
import { Button } from '../button'

describe('Collapsible A11y', () => {
  it('should have no violations', async () => {
    const { container } = render(
      <Collapsible>
        <CollapsibleTrigger asChild>
          <Button variant="outline">Toggle Section</Button>
        </CollapsibleTrigger>
        <CollapsibleContent>
          Hidden content that expands and collapses
        </CollapsibleContent>
      </Collapsible>
    )
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })
})
