import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useDarkMode } from '../useDarkMode';

// Mock next-themes with more control
const mockSetTheme = vi.fn();
const mockUseTheme = vi.fn();

vi.mock('next-themes', () => ({
  useTheme: () => mockUseTheme(),
}));

describe('useDarkMode Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('AC-1: Initialize light mode', () => {
    it('should initialize with light theme by default', async () => {
      mockUseTheme.mockReturnValue({
        theme: 'light',
        setTheme: mockSetTheme,
        resolvedTheme: 'light',
      });

      const { result } = renderHook(() => useDarkMode());

      // In jsdom environment, useEffect runs immediately
      await waitFor(() => {
        expect(result.current.mounted).toBe(true);
      });

      expect(result.current.isLight).toBe(true);
      expect(result.current.isDark).toBe(false);
    });
  });

  describe('AC-1: Toggle state', () => {
    it('should toggle from light to dark', async () => {
      mockUseTheme.mockReturnValue({
        theme: 'light',
        setTheme: mockSetTheme,
        resolvedTheme: 'light',
      });

      const { result } = renderHook(() => useDarkMode());

      await waitFor(() => {
        expect(result.current.mounted).toBe(true);
      });

      act(() => {
        result.current.toggle();
      });

      expect(mockSetTheme).toHaveBeenCalledWith('dark');
    });

    it('should toggle from dark to light', async () => {
      mockUseTheme.mockReturnValue({
        theme: 'dark',
        setTheme: mockSetTheme,
        resolvedTheme: 'dark',
      });

      const { result } = renderHook(() => useDarkMode());

      await waitFor(() => {
        expect(result.current.mounted).toBe(true);
      });

      act(() => {
        result.current.toggle();
      });

      expect(mockSetTheme).toHaveBeenCalledWith('light');
    });
  });

  describe('AC-7: localStorage persistence', () => {
    it('should persist theme choice to localStorage via next-themes', async () => {
      mockUseTheme.mockReturnValue({
        theme: 'light',
        setTheme: mockSetTheme,
        resolvedTheme: 'light',
      });

      const { result } = renderHook(() => useDarkMode());

      await waitFor(() => {
        expect(result.current.mounted).toBe(true);
      });

      act(() => {
        result.current.setDark();
      });

      expect(mockSetTheme).toHaveBeenCalledWith('dark');
    });

    it('should restore theme from localStorage on mount', async () => {
      mockUseTheme.mockReturnValue({
        theme: 'dark',
        setTheme: mockSetTheme,
        resolvedTheme: 'dark',
      });

      const { result } = renderHook(() => useDarkMode());

      await waitFor(() => {
        expect(result.current.mounted).toBe(true);
      });

      expect(result.current.isDark).toBe(true);
    });
  });

  describe('Apply/remove dark class', () => {
    it('should return isDark flag when theme is dark', async () => {
      mockUseTheme.mockReturnValue({
        theme: 'dark',
        setTheme: mockSetTheme,
        resolvedTheme: 'dark',
      });

      const { result } = renderHook(() => useDarkMode());

      await waitFor(() => {
        expect(result.current.mounted).toBe(true);
      });

      expect(result.current.isDark).toBe(true);
      expect(result.current.isLight).toBe(false);
    });

    it('should return isLight flag when theme is light', async () => {
      mockUseTheme.mockReturnValue({
        theme: 'light',
        setTheme: mockSetTheme,
        resolvedTheme: 'light',
      });

      const { result } = renderHook(() => useDarkMode());

      await waitFor(() => {
        expect(result.current.mounted).toBe(true);
      });

      expect(result.current.isLight).toBe(true);
      expect(result.current.isDark).toBe(false);
    });
  });

  describe('Helper methods', () => {
    it('should have setDark method', async () => {
      mockUseTheme.mockReturnValue({
        theme: 'light',
        setTheme: mockSetTheme,
        resolvedTheme: 'light',
      });

      const { result } = renderHook(() => useDarkMode());

      await waitFor(() => {
        expect(result.current.mounted).toBe(true);
      });

      act(() => {
        result.current.setDark();
      });

      expect(mockSetTheme).toHaveBeenCalledWith('dark');
    });

    it('should have setLight method', async () => {
      mockUseTheme.mockReturnValue({
        theme: 'dark',
        setTheme: mockSetTheme,
        resolvedTheme: 'dark',
      });

      const { result } = renderHook(() => useDarkMode());

      await waitFor(() => {
        expect(result.current.mounted).toBe(true);
      });

      act(() => {
        result.current.setLight();
      });

      expect(mockSetTheme).toHaveBeenCalledWith('light');
    });
  });

  describe('Hydration safety', () => {
    it('should eventually be mounted after useEffect', async () => {
      mockUseTheme.mockReturnValue({
        theme: 'light',
        setTheme: mockSetTheme,
        resolvedTheme: 'light',
      });

      const { result } = renderHook(() => useDarkMode());

      // In jsdom, useEffect runs synchronously, so component is mounted immediately
      await waitFor(() => {
        expect(result.current.mounted).toBe(true);
      });
    });

    it('should return undefined theme when not mounted (server-side)', () => {
      mockUseTheme.mockReturnValue({
        theme: undefined,
        setTheme: mockSetTheme,
        resolvedTheme: undefined,
      });

      const { result } = renderHook(() => useDarkMode());

      // When mounted=false, theme should be undefined
      expect(result.current.theme).toBeUndefined();
      expect(result.current.isDark).toBe(false);
      expect(result.current.isLight).toBe(false);
    });
  });
});
