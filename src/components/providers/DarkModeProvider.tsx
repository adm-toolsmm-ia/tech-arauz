'use client';

import React, { useEffect, useState } from 'react';

const DARK_MODE_KEY = 'tech-arauz-dark-mode';

/**
 * DarkModeProvider — Persistent dark mode across all pages and sessions
 *
 * Features:
 * ✅ Persists to localStorage
 * ✅ Syncs across all browser tabs (via storage event)
 * ✅ Maintains after page navigation and login/logout
 * ✅ Applies class to html element globally
 * ✅ Respects system preference on first load (if no saved preference)
 *
 * Usage:
 * - Wrap app with <DarkModeProvider>{children}</DarkModeProvider>
 * - Use useDarkMode() hook to access isDark and toggle()
 */

interface DarkModeContextType {
  isDark: boolean;
  toggle: () => void;
  setDark: (isDark: boolean) => void;
}

export const DarkModeContext = React.createContext<DarkModeContextType | undefined>(undefined);

function applyTheme(isDark: boolean) {
  const html = document.documentElement;
  if (isDark) {
    html.classList.add('dark');
    html.setAttribute('data-theme', 'dark');
  } else {
    html.classList.remove('dark');
    html.setAttribute('data-theme', 'light');
  }
}

export function DarkModeProvider({ children }: { children: React.ReactNode }) {
  const [isDark, setIsDark] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  // Initialize on mount (only runs once per page load)
  useEffect(() => {
    // Step 1: Check localStorage for saved preference
    const saved = localStorage.getItem(DARK_MODE_KEY);

    if (saved !== null) {
      // Use saved preference
      const isDarkSaved = saved === 'true';
      setIsDark(isDarkSaved);
      applyTheme(isDarkSaved);
    } else {
      // Step 2: Check system preference
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setIsDark(prefersDark);
      applyTheme(prefersDark);
      // Don't save system preference, let user choose explicitly
    }

    setIsMounted(true);
  }, []);

  // Sync across tabs (listen to storage changes from other tabs)
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === DARK_MODE_KEY && e.newValue !== null) {
        const isDarkFromOtherTab = e.newValue === 'true';
        setIsDark(isDarkFromOtherTab);
        applyTheme(isDarkFromOtherTab);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Apply theme whenever isDark changes
  useEffect(() => {
    if (isMounted) {
      applyTheme(isDark);
      localStorage.setItem(DARK_MODE_KEY, String(isDark));
    }
  }, [isDark, isMounted]);

  const toggle = () => {
    setIsDark((prev) => !prev);
  };

  const setDark = (isDarkMode: boolean) => {
    setIsDark(isDarkMode);
  };

  const value = {
    isDark,
    toggle,
    setDark,
  };

  return <DarkModeContext.Provider value={value}>{children}</DarkModeContext.Provider>;
}

export function useDarkMode(): DarkModeContextType {
  const context = React.useContext(DarkModeContext);
  if (!context) {
    throw new Error('useDarkMode must be used within DarkModeProvider');
  }
  return context;
}
