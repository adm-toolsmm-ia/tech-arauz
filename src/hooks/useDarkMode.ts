import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';

/**
 * Custom hook for managing dark mode theme
 * Wraps next-themes useTheme with additional functionality
 */
export function useDarkMode() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Ensure component is mounted to avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  /**
   * Toggle between light and dark theme
   */
  const toggle = () => {
    if (!mounted) return;
    setTheme(resolvedTheme === 'dark' ? 'light' : 'dark');
  };

  /**
   * Set theme to light
   */
  const setLight = () => {
    if (!mounted) return;
    setTheme('light');
  };

  /**
   * Set theme to dark
   */
  const setDark = () => {
    if (!mounted) return;
    setTheme('dark');
  };

  /**
   * Get current theme state
   */
  const isDark = mounted && resolvedTheme === 'dark';
  const isLight = mounted && resolvedTheme === 'light';

  return {
    theme: mounted ? resolvedTheme : undefined,
    isDark,
    isLight,
    toggle,
    setLight,
    setDark,
    mounted,
  };
}
