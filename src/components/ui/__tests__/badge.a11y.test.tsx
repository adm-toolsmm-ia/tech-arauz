import { axe } from 'jest-axe';
import { render } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Badge } from '../badge';

describe('Badge A11y', () => {
  it('should have no violations', async () => {
    const { container } = render(<Badge aria-label="Status: Active">Active</Badge>);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('should support semantic variants', async () => {
    const { container } = render(
      <div>
        <Badge variant="default">Default</Badge>
        <Badge variant="secondary">Secondary</Badge>
        <Badge variant="destructive">Error</Badge>
      </div>,
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
