import { describe, it, expect } from 'vitest';
import { isDateOverdue, formatRelativeDate } from '../project-overdue';

describe('isDateOverdue', () => {
  it('returns false for null/undefined', () => {
    expect(isDateOverdue(null)).toBe(false);
    expect(isDateOverdue(undefined)).toBe(false);
  });

  it('returns true for past date', () => {
    expect(isDateOverdue('2020-01-01')).toBe(true);
  });

  it('returns false for future date', () => {
    expect(isDateOverdue('2030-01-01')).toBe(false);
  });
});

describe('formatRelativeDate', () => {
  it('returns Hoje for today', () => {
    expect(formatRelativeDate(new Date().toISOString())).toBe('Hoje');
  });

  it('returns Ontem for yesterday', () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    expect(formatRelativeDate(yesterday.toISOString())).toBe('Ontem');
  });

  it('returns há X dias for recent dates', () => {
    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
    expect(formatRelativeDate(threeDaysAgo.toISOString())).toBe('há 3 dias');
  });

  it('returns fallback for invalid date', () => {
    // new Date('invalid') returns Invalid Date (no exception thrown)
    const result = formatRelativeDate('invalid');
    expect(typeof result).toBe('string');
  });
});
