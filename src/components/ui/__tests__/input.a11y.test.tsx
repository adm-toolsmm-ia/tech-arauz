import { axe } from 'jest-axe';
import { render } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { describe, it, expect } from 'vitest';
import { Input } from '../input';
import { Label } from '../label';

describe('Input A11y', () => {
  it('should have no violations with label association', async () => {
    const { container } = render(
      <div>
        <Label htmlFor="email">Email</Label>
        <Input id="email" type="email" placeholder="Enter email" />
      </div>,
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('should have no violations with aria-label', async () => {
    const { container } = render(<Input aria-label="Search field" placeholder="Search..." />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('should be keyboard navigable', async () => {
    const user = userEvent.setup();
    const { getByRole } = render(<Input placeholder="Type here" />);

    const input = getByRole('textbox');
    await user.tab();
    expect(input).toHaveFocus();
  });

  it('should announce required state', async () => {
    const { container } = render(
      <div>
        <Label htmlFor="required-input">Name *</Label>
        <Input id="required-input" aria-required="true" />
      </div>,
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('should announce error state with aria-invalid', async () => {
    const { container } = render(
      <div>
        <Label htmlFor="error-input">Email</Label>
        <Input id="error-input" type="email" aria-invalid="true" aria-describedby="error-message" />
        <span id="error-message">Invalid email format</span>
      </div>,
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
