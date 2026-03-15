'use client';

/**
 * SkipNavigation — WCAG AA requirement
 * Provides keyboard-accessible skip link to main content.
 * Visible only on Tab focus for screen readers and keyboard users.
 *
 * Story 2.22: Accessibility baseline
 */
export function SkipNavigation() {
  return (
    <a
      href="#main-content"
      className="focus:bg-primary focus:text-primary-foreground sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-md focus:px-4 focus:py-2 focus:shadow-lg focus:outline-none"
    >
      Pular para o conteúdo principal
    </a>
  );
}
