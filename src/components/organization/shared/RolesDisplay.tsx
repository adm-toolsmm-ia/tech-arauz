import React, { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

interface RolesDisplayProps {
  roles?: string[];
  maxDisplay?: number;
  className?: string;
}

/**
 * Display roles as badges with overflow handling
 * Shows max N badges, rest in "+N more" popover
 */
export function RolesDisplay({ roles = [], maxDisplay = 2, className }: RolesDisplayProps) {
  const [open, setOpen] = useState(false);

  if (!roles || roles.length === 0) {
    return <span className="text-xs text-muted-foreground">Nenhuma role</span>;
  }

  const displayed = roles.slice(0, maxDisplay);
  const overflow = roles.slice(maxDisplay);

  return (
    <div className={`flex gap-1 flex-wrap items-center ${className || ''}`}>
      {displayed.map((role) => (
        <Badge key={role} variant="secondary" className="text-xs">
          {role}
        </Badge>
      ))}

      {overflow.length > 0 && (
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Badge variant="outline" className="text-xs cursor-pointer">
              +{overflow.length} more
            </Badge>
          </PopoverTrigger>
          <PopoverContent className="w-48 p-3">
            <div className="space-y-2">
              {overflow.map((role) => (
                <div key={role} className="text-sm">
                  {role}
                </div>
              ))}
            </div>
          </PopoverContent>
        </Popover>
      )}
    </div>
  );
}
