import { axe } from 'jest-axe';
import { render } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { describe, it, expect } from 'vitest';
import { Checkbox } from '../checkbox';
import { Label } from '../label';

describe('Checkbox A11y', () => {
  it('should have no violations with label', async () => {
    const { container } = render(
      <div>
        <Checkbox id="terms" />
        <Label htmlFor="terms">I agree to terms</Label>
      </div>,
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('should be keyboard accessible', async () => {
    const user = userEvent.setup();
    const { getByRole } = render(
      <div>
        <Checkbox id="agree" />
        <Label htmlFor="agree">Agree</Label>
      </div>,
    );

    const checkbox = getByRole('checkbox');
    await user.tab();
    expect(checkbox).toHaveFocus();
  });
});
