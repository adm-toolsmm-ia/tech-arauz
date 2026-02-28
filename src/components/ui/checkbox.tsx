'use client';

import * as React from 'react';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CheckboxProps {
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  disabled?: boolean;
  aria?: Record<string, string>;
  'aria-label'?: string;
}

const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  (
    { checked = false, onCheckedChange, disabled = false, 'aria-label': ariaLabel, ...props },
    ref,
  ) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      onCheckedChange?.(e.target.checked);
    };

    return (
      <div className="relative inline-flex items-center">
        <input
          ref={ref}
          type="checkbox"
          checked={checked}
          onChange={handleChange}
          disabled={disabled}
          aria-label={ariaLabel}
          className="sr-only"
          {...props}
        />
        <div
          className={cn(
            'flex h-5 w-5 items-center justify-center rounded border-2 border-primary transition-colors',
            checked
              ? 'border-primary bg-primary'
              : 'border-border bg-background hover:border-primary/80',
            disabled && 'cursor-not-allowed opacity-50',
          )}
        >
          {checked && <Check className="h-3.5 w-3.5 text-primary-foreground" strokeWidth={3} />}
        </div>
      </div>
    );
  },
);

Checkbox.displayName = 'Checkbox';

export { Checkbox };
