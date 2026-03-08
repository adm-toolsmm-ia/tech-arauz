import { axe } from 'jest-axe';
import { render } from '@testing-library/react';
import { describe, it, expect } from 'vitest';

describe('Navigation A11y', () => {
  it('should have no violations for list-based navigation', async () => {
    const { container } = render(
      <nav aria-label="Main navigation">
        <ul>
          <li>
            <a href="/dashboard">Dashboard</a>
          </li>
          <li>
            <a href="/projects">Projects</a>
          </li>
          <li>
            <a href="/settings">Settings</a>
          </li>
        </ul>
      </nav>,
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('should support semantic navigation landmarks', async () => {
    const { container, getByRole } = render(
      <nav aria-label="Primary navigation">
        <ul>
          <li>
            <a href="/" aria-current="page">
              Home
            </a>
          </li>
          <li>
            <a href="/about">About</a>
          </li>
        </ul>
      </nav>,
    );
    expect(getByRole('navigation')).toBeInTheDocument();
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
