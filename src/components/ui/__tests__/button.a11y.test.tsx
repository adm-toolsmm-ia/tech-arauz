import { axe } from 'jest-axe';
import { render } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { describe, it, expect } from 'vitest';
import { Button } from '../button';

describe('Button A11y', () => {
  it('should have no accessibility violations', async () => {
    const { container } = render(<Button aria-label="Click me">Submit</Button>);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('should have no violations with variant', async () => {
    const { container } = render(
      <Button variant="outline" aria-label="Secondary button">
        Cancel
      </Button>,
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('should be keyboard navigable', async () => {
    const user = userEvent.setup();
    const handleClick = () => {};
    const { getByRole } = render(<Button onClick={handleClick}>Click</Button>);

    const button = getByRole('button');
    expect(button).toHaveAttribute('type', 'button');

    // Tab focus and Enter/Space activation
    await user.tab();
    expect(button).toHaveFocus();
  });

  it('should support disabled state accessibly', async () => {
    const { container } = render(
      <Button disabled aria-label="Disabled button">
        Disabled
      </Button>,
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('should announce loading state', async () => {
    const { container } = render(
      <Button aria-busy="true" aria-label="Loading button">
        Loading...
      </Button>,
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
