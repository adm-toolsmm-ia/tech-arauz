import { axe } from 'jest-axe';
import { render } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Separator } from '../separator';

describe('Separator A11y', () => {
  it('should have no violations', async () => {
    const { container } = render(
      <div>
        <div>Section 1</div>
        <Separator />
        <div>Section 2</div>
      </div>,
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
