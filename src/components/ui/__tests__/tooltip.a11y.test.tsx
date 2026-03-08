import { axe } from 'jest-axe';
import { render } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from '../tooltip';
import { Button } from '../button';

describe('Tooltip A11y', () => {
  it('should have no violations', async () => {
    const { container } = render(
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="outline">Hover me</Button>
          </TooltipTrigger>
          <TooltipContent>This is helpful info</TooltipContent>
        </Tooltip>
      </TooltipProvider>,
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
