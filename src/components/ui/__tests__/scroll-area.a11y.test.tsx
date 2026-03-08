import { axe } from 'jest-axe';
import { render } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { ScrollArea } from '../scroll-area';

describe('ScrollArea A11y', () => {
  it('should have no violations', async () => {
    const { container } = render(
      <ScrollArea className="h-72 w-48 rounded-md border">
        <div className="p-4">
          <h4 className="mb-4 text-sm font-medium leading-none">Tags</h4>
          {Array.from({ length: 50 }).map((_, i) => (
            <div key={i} className="text-sm">
              Tag {i}
            </div>
          ))}
        </div>
      </ScrollArea>,
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
