import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useDarkMode } from '../useDarkMode';

// Mock window.matchMedia for system preference detection
const mockMatchMedia = vi.fn();

beforeEach(() => {
  // Setup matchMedia mock to return light mode preference by default
  mockMatchMedia.mockImplementation((query: string) => ({
    matches: query === '(prefers-color-scheme: dark)' ? false : true,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }));

  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: mockMatchMedia,
  });

  localStorage.clear();
  document.documentElement.classList.remove('dark');
  document.documentElement.removeAttribute('data-theme');
});

afterEach(() => {
  vi.clearAllMocks();
  localStorage.clear();
  document.documentElement.classList.remove('dark');
  document.documentElement.removeAttribute('data-theme');
});

describe('useDarkMode Hook', () => {
  describe('Initialize light mode', () => {
    it('should initialize with light theme by default', () => {
      const { result } = renderHook(() => useDarkMode());
      expect(result.current.isDark).toBe(false);
    });
  });

  describe('Toggle state', () => {
    it('should toggle from light to dark', () => {
      const { result } = renderHook(() => useDarkMode());
      expect(result.current.isDark).toBe(false);

      act(() => {
        result.current.toggle();
      });

      expect(result.current.isDark).toBe(true);
      expect(localStorage.getItem('tech-arauz-dark-mode')).toBe('true');
    });

    it('should toggle from dark to light', () => {
      localStorage.setItem('tech-arauz-dark-mode', 'true');

      const { result } = renderHook(() => useDarkMode());
      expect(result.current.isDark).toBe(true);

      act(() => {
        result.current.toggle();
      });

      expect(result.current.isDark).toBe(false);
      expect(localStorage.getItem('tech-arauz-dark-mode')).toBe('false');
    });
  });

  describe('localStorage persistence', () => {
    it('should persist theme choice to localStorage', () => {
      const { result } = renderHook(() => useDarkMode());

      act(() => {
        result.current.setDark(true);
      });

      expect(localStorage.getItem('tech-arauz-dark-mode')).toBe('true');
    });

    it('should restore theme from localStorage on mount', () => {
      localStorage.setItem('tech-arauz-dark-mode', 'true');

      const { result } = renderHook(() => useDarkMode());
      expect(result.current.isDark).toBe(true);
    });

    it('should use system preference when no localStorage value', () => {
      mockMatchMedia.mockImplementation((query: string) => ({
        matches: query === '(prefers-color-scheme: dark)',
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      }));

      const { result } = renderHook(() => useDarkMode());
      expect(result.current.isDark).toBe(true);
    });
  });

  describe('Apply/remove dark class', () => {
    it('should apply dark class to html element when dark mode', () => {
      const { result } = renderHook(() => useDarkMode());

      act(() => {
        result.current.setDark(true);
      });

      expect(document.documentElement.classList.contains('dark')).toBe(true);
      expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
    });

    it('should remove dark class from html element when light mode', () => {
      localStorage.setItem('tech-arauz-dark-mode', 'true');
      const { result } = renderHook(() => useDarkMode());

      act(() => {
        result.current.setDark(false);
      });

      expect(document.documentElement.classList.contains('dark')).toBe(false);
      expect(document.documentElement.getAttribute('data-theme')).toBe('light');
    });
  });

  describe('Helper methods', () => {
    it('should have setDark method', () => {
      const { result } = renderHook(() => useDarkMode());
      expect(typeof result.current.setDark).toBe('function');

      act(() => {
        result.current.setDark(true);
      });

      expect(result.current.isDark).toBe(true);
    });

    it('should have toggle method', () => {
      const { result } = renderHook(() => useDarkMode());
      expect(typeof result.current.toggle).toBe('function');

      act(() => {
        result.current.toggle();
      });

      expect(result.current.isDark).toBe(true);
    });
  });
});
