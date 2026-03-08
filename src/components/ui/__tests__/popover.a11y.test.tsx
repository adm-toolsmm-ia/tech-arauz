import { axe } from 'jest-axe'
import { render } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { Popover, PopoverTrigger, PopoverContent } from '../popover'
import { Button } from '../button'

describe('Popover A11y', () => {
  it('should have no violations', async () => {
    const { container } = render(
      <Popover>
        <PopoverTrigger asChild>
          <Button>Open</Button>
        </PopoverTrigger>
        <PopoverContent>Popover content</PopoverContent>
      </Popover>
    )
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })
})
