import { axe } from 'jest-axe';
import { render } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { EmptyState } from '../EmptyState';
import { Button } from '../button';

describe('EmptyState A11y', () => {
  it('should have no violations', async () => {
    const { container } = render(
      <EmptyState
        title="No projects found"
        description="Create a new project to get started"
        action={<Button>Create Project</Button>}
      />,
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
