'use client';

import { useState, useEffect } from 'react';

const DARK_MODE_KEY = 'tech-arauz-dark-mode';
const DARK_CLASS = 'dark';

interface UseDarkModeReturn {
  isDark: boolean;
  toggle: () => void;
  setDark: (isDark: boolean) => void;
}

/**
 * Hook to manage dark mode state with localStorage persistence
 * Syncs theme class on html element and respects user preferences
 *
 * @returns {UseDarkModeReturn} isDark state, toggle function, and setDark function
 *
 * @example
 * const { isDark, toggle } = useDarkMode();
 * return (
 *   <button onClick={toggle}>
 *     {isDark ? '☀️' : '🌙'}
 *   </button>
 * );
 */
export function useDarkMode(): UseDarkModeReturn {
  const [isDark, setIsDark] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  // Initialize dark mode state from localStorage on mount
  useEffect(() => {
    const storedValue = localStorage.getItem(DARK_MODE_KEY);

    if (storedValue !== null) {
      // Use stored preference
      const isDarkStored = storedValue === 'true';
      setIsDark(isDarkStored);
      applyTheme(isDarkStored);
    } else {
      // Check system preference
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setIsDark(prefersDark);
      applyTheme(prefersDark);
    }

    setIsMounted(true);
  }, []);

  const applyTheme = (isDarkMode: boolean) => {
    const html = document.documentElement;

    if (isDarkMode) {
      html.classList.add(DARK_CLASS);
      html.setAttribute('data-theme', 'dark');
    } else {
      html.classList.remove(DARK_CLASS);
      html.setAttribute('data-theme', 'light');
    }
  };

  const toggle = () => {
    const newValue = !isDark;
    setIsDark(newValue);
    localStorage.setItem(DARK_MODE_KEY, String(newValue));
    applyTheme(newValue);
  };

  const setDark = (isDarkMode: boolean) => {
    setIsDark(isDarkMode);
    localStorage.setItem(DARK_MODE_KEY, String(isDarkMode));
    applyTheme(isDarkMode);
  };

  return { isDark, toggle, setDark };
}
