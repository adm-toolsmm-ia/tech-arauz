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
      <span className="w-20 font-semibold text-sm text-muted-foreground flex-shrink-0">
        {label}
      </span>
      <span className="text-sm flex-1">{value}</span>
    </div>
  );
}
