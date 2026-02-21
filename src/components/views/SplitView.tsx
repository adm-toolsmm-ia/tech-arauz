'use client';

import * as React from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

interface SplitViewProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  className?: string;
  width?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | 'wide';
  healthStatus?: 'verde' | 'amarelo' | 'vermelho';
}

const widthClasses = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  '2xl': 'max-w-2xl',
  '3xl': 'max-w-3xl',
  '4xl': 'max-w-4xl',
  wide: 'w-full max-w-[min(90vw,1120px)]',
};

const healthDotColors = {
  verde: 'bg-green-500',
  amarelo: 'bg-amber-500',
  vermelho: 'bg-red-500',
};

export function SplitView({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  className,
  width = 'lg',
  healthStatus,
}: SplitViewProps) {
  // Handle escape key
  React.useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      // Prevent body scroll when open
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="animate-fade-in fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Panel */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="split-view-title"
        className={cn(
          'animate-slide-in-right fixed inset-y-0 right-0 z-50 w-full border-l bg-background shadow-lg',
          widthClasses[width],
          className,
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b px-6 py-4">
          <div className="flex items-center gap-3">
            {healthStatus && (
              <div
                className={cn(
                  'animate-pulse-soft size-3 rounded-full',
                  healthDotColors[healthStatus],
                )}
              />
            )}
            <div>
              <h2 id="split-view-title" className="text-lg font-semibold">
                {title}
              </h2>
              {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
            <X className="h-4 w-4" />
            <span className="sr-only">Fechar</span>
          </Button>
        </div>

        {/* Content */}
        <ScrollArea className="h-[calc(100vh-73px)]">
          <div className="p-6">{children}</div>
        </ScrollArea>
      </div>
    </>
  );
}
