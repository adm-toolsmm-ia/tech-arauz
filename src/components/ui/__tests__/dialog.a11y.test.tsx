import { axe } from 'jest-axe'
import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '../dialog'
import { Button } from '../button'

describe('Dialog A11y', () => {
  it('should have no violations', async () => {
    const { container } = render(
      <Dialog>
        <DialogTrigger asChild>
          <Button>Open</Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Action</DialogTitle>
          </DialogHeader>
          <p>Are you sure?</p>
        </DialogContent>
      </Dialog>
    )
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })
})
