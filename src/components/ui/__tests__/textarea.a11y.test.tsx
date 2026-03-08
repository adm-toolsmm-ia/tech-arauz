import { axe } from 'jest-axe';
import { render } from '@testing-library/react';
import { describe, it, expect } from 'vitest';

describe('Textarea A11y', () => {
  it('should have no violations with label', async () => {
    const { container } = render(
      <div>
        <label htmlFor="comments">Comments:</label>
        <textarea id="comments" placeholder="Enter comments..." />
      </div>,
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('should announce required state', async () => {
    const { container } = render(
      <div>
        <label htmlFor="required-text">Description *</label>
        <textarea id="required-text" aria-required="true" />
      </div>,
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
