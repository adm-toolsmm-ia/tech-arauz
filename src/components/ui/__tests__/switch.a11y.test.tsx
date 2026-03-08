import { axe } from 'jest-axe';
import { render } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Switch } from '../switch';
import { Label } from '../label';

describe('Switch A11y', () => {
  it('should have no violations with label', async () => {
    const { container } = render(
      <div className="flex items-center space-x-2">
        <Switch id="airplane-mode" />
        <Label htmlFor="airplane-mode">Airplane Mode</Label>
      </div>,
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('should support checked and disabled states', async () => {
    const { container } = render(
      <div>
        <Switch id="enabled" defaultChecked />
        <Switch id="disabled" disabled />
      </div>,
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
