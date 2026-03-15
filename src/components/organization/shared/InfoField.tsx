import React from 'react';

interface InfoFieldProps {
  label: string;
  value: React.ReactNode;
  className?: string;
}

/**
 * Simple label-value display component
 * Used consistently across all cockpits
 * Label width: 80px, value flex
 */
export function InfoField({ label, value, className }: InfoFieldProps) {
  return (
    <div className={`flex gap-4 ${className || ''}`}>
      <span className="w-20 flex-shrink-0 text-sm font-semibold text-muted-foreground">
        {label}
      </span>
      <span className="flex-1 text-sm">{value}</span>
    </div>
  );
}
