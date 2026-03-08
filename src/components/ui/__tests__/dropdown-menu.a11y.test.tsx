import { axe } from 'jest-axe'
import { render } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '../dropdown-menu'
import { Button } from '../button'

describe('DropdownMenu A11y', () => {
  it('should have no violations', async () => {
    const { container } = render(
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline">Menu</Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem>Edit</DropdownMenuItem>
          <DropdownMenuItem>Delete</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    )
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })
})
