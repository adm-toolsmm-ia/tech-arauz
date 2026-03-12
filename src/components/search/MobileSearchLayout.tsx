'use client';

import * as React from 'react';
import { Menu, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface MobileSearchLayoutProps {
  children: React.ReactNode;
  filterContent?: React.ReactNode;
  className?: string;
}

/**
 * MobileSearchLayout Component
 *
 * Provides mobile-optimized search experience with:
 * - Responsive search bar (full-width on mobile)
 * - Toggle-able filter sidebar (drawer pattern)
 * - Proper touch target sizes (44px minimum)
 * - Accessible overlay
 *
 * Works great on:
 * - iPhone SE (375px)
 * - iPhone 12 (390px)
 * - Pixel 4 (412px)
 * - Landscape orientation
 */
export function MobileSearchLayout({
  children,
  filterContent,
  className,
}: MobileSearchLayoutProps) {
  const [isFilterOpen, setIsFilterOpen] = React.useState(false);

  // Close filter drawer when screen size changes to desktop
  React.useEffect(() => {
    const handleResize = () => {
      if (window.matchMedia('(min-width: 768px)').matches) {
        setIsFilterOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className={cn('relative w-full', className)}>
      {/* Search Bar Container */}
      <div className="w-full">
        <div className="flex items-center gap-2 px-4 py-3">
          {/* Filter Toggle (mobile only) */}
          {filterContent && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className={cn(
                'md:hidden',
                'h-10 w-10', // 44px minimum touch target
                'flex-shrink-0',
              )}
              aria-label={isFilterOpen ? 'Fechar filtros' : 'Abrir filtros'}
              aria-expanded={isFilterOpen}
              aria-controls="mobile-filters"
            >
              {isFilterOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          )}

          {/* Search Input */}
          <div className="flex-1 min-w-0">{children}</div>
        </div>
      </div>

      {/* Mobile Filter Drawer */}
      {filterContent && isFilterOpen && (
        <>
          {/* Overlay */}
          <div
            className={cn(
              'fixed inset-0 z-40 bg-black/50 md:hidden',
              'transition-opacity duration-200',
            )}
            onClick={() => setIsFilterOpen(false)}
            aria-hidden="true"
          />

          {/* Drawer Panel */}
          <div
            id="mobile-filters"
            className={cn(
              'fixed left-0 top-0 bottom-0 z-50 md:hidden',
              'w-[80%] max-w-sm',
              'bg-background border-r border-border',
              'overflow-y-auto',
              'animate-in slide-in-from-left-full duration-300',
              'supports-[animation]:animate-in supports-[animation]:slide-in-from-left-full',
            )}
          >
            {/* Drawer Header */}
            <div className="sticky top-0 flex items-center justify-between border-b border-border bg-background p-4">
              <h2 className="text-lg font-semibold">Filtros</h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsFilterOpen(false)}
                className="h-8 w-8"
                aria-label="Fechar filtros"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Drawer Content */}
            <div className="p-4">{filterContent}</div>
          </div>
        </>
      )}
    </div>
  );
}
