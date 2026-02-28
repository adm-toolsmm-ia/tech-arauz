import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import type { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  /** Primary message */
  title: string;
  /** Optional description */
  description?: string;
  /** Lucide icon component */
  icon?: LucideIcon;
  /** CTA button label */
  actionLabel?: string;
  /** CTA click handler */
  onAction?: () => void;
  /** Secondary CTA label */
  secondaryLabel?: string;
  /** Secondary CTA click handler */
  onSecondary?: () => void;
  className?: string;
}

export function EmptyState({
  title,
  description,
  icon: Icon,
  actionLabel,
  onAction,
  secondaryLabel,
  onSecondary,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn('flex flex-col items-center justify-center gap-4 py-16 text-center', className)}
      role="status"
      aria-label={title}
    >
      {Icon && (
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
          <Icon className="h-8 w-8 text-muted-foreground" aria-hidden="true" />
        </div>
      )}

      <div className="flex flex-col gap-1">
        <p className="text-base font-semibold text-foreground">{title}</p>
        {description && <p className="max-w-sm text-sm text-muted-foreground">{description}</p>}
      </div>

      {(actionLabel || secondaryLabel) && (
        <div className="flex items-center gap-2">
          {actionLabel && onAction && (
            <Button onClick={onAction} size="sm" type="button">
              {actionLabel}
            </Button>
          )}
          {secondaryLabel && onSecondary && (
            <Button onClick={onSecondary} size="sm" variant="outline" type="button">
              {secondaryLabel}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
