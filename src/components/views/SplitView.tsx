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
  onContextPanelOpen?: (depth: number) => void;
  contextDepth?: number;
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
  onContextPanelOpen,
  contextDepth = 0,
}: SplitViewProps) {
  // Dynamic z-index based on context depth
  const zIndexClass = contextDepth > 0 ? `z-[${50 - contextDepth}]` : 'z-50';
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

      {/* Panel - fundo branco em light mode, cinza escuro em dark mode */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="split-view-title"
        aria-describedby={subtitle ? 'split-view-subtitle' : undefined}
        className={cn(
          'animate-slide-in-right fixed inset-y-0 right-0 flex w-full flex-col border-l border-border bg-white shadow-lg dark:bg-card',
          widthClasses[width],
          className,
        )}
        style={{
          zIndex: 50 - contextDepth,
        }}
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
              {subtitle && (
                <p id="split-view-subtitle" className="text-sm text-muted-foreground">
                  {subtitle}
                </p>
              )}
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
            <X className="h-4 w-4" />
            <span className="sr-only">Fechar</span>
          </Button>
        </div>

        {/* Content - fundo branco em light mode, cinza escuro em dark mode */}
        <ScrollArea className="flex-1 overflow-hidden bg-white dark:bg-card">
          <div className="bg-white p-6 dark:bg-card">{children}</div>
        </ScrollArea>
      </div>
    </>
  );
}
