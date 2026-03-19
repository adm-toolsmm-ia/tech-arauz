'use client';

import * as React from 'react';
import { X, ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

interface BreadcrumbItem {
  label: string;
  onClick?: () => void;
  isCurrent?: boolean;
}

interface ContextPanelProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  breadcrumb?: BreadcrumbItem[];
  depth?: 1 | 2 | 3;
  children: React.ReactNode;
  className?: string;
}

/**
 * Stacked Context Panel without dark backdrop
 * Z-index: z-50 + (depth * 10)
 * - depth=1 → z-60
 * - depth=2 → z-70
 * - depth=3 → z-80
 */
export function ContextPanel({
  isOpen,
  onClose,
  title,
  subtitle,
  breadcrumb,
  depth = 1,
  children,
  className,
}: ContextPanelProps) {
  // Handle escape key - only close this panel, not parent
  React.useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const zIndexClass = `z-${50 + depth * 10}`;
  const rightOffset = `right-${depth > 1 ? (depth - 1) * 24 : 0}`;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="context-panel-title"
      aria-describedby={subtitle ? 'context-panel-subtitle' : undefined}
      className={cn(
        'animate-slide-in-right fixed inset-y-0 right-0 flex w-full flex-col border-l border-border bg-card shadow-2xl transition-all',
        `z-[${50 + depth * 10}]`,
        'max-w-xl',
        className,
      )}
      style={{
        zIndex: 50 + depth * 10,
        right: `${(depth - 1) * 24}px`,
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b px-6 py-4">
        <div className="flex-1">
          <h2 id="context-panel-title" className="text-lg font-semibold">
            {title}
          </h2>
          {subtitle && (
            <p id="context-panel-subtitle" className="mt-1 text-sm text-muted-foreground">
              {subtitle}
            </p>
          )}

          {breadcrumb && breadcrumb.length > 0 && (
            <div className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
              {breadcrumb.map((item, idx) => (
                <React.Fragment key={idx}>
                  {idx > 0 && <ChevronLeft className="h-3 w-3" />}
                  {item.isCurrent ? (
                    <span className="font-medium">{item.label}</span>
                  ) : (
                    <button
                      onClick={item.onClick}
                      className="hover:text-foreground hover:underline"
                    >
                      {item.label}
                    </button>
                  )}
                </React.Fragment>
              ))}
            </div>
          )}
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
          className="h-8 w-8 flex-shrink-0 p-0"
          aria-label="Fechar painel"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Content */}
      <ScrollArea className="flex-1">
        <div className="px-6 py-4">{children}</div>
      </ScrollArea>
    </div>
  );
}
