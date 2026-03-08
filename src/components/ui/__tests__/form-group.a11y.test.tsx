import { axe } from 'jest-axe'
import { render } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { Label } from '../label'
import { Input } from '../input'
import { Button } from '../button'

describe('Form Group A11y', () => {
  it('should have no violations for complete form', async () => {
    const { container } = render(
      <form>
        <fieldset>
          <legend>Login Form</legend>
          <div>
            <Label htmlFor="username">Username</Label>
            <Input id="username" type="text" required />
          </div>
          <div>
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" required />
          </div>
          <Button type="submit">Sign In</Button>
        </fieldset>
      </form>
    )
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })

  it('should announce form validation errors', async () => {
    const { container } = render(
      <form>
        <div>
          <Label htmlFor="email">Email *</Label>
          <Input
            id="email"
            type="email"
            aria-required="true"
            aria-invalid="true"
            aria-describedby="email-error"
          />
          <span id="email-error" role="alert">
            Please enter a valid email
          </span>
        </div>
      </form>
    )
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })
})
