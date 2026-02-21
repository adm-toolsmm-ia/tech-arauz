'use client';

import { LayoutGrid, List } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

export type ViewMode = 'kanban' | 'list';

interface ViewToggleProps {
  view: ViewMode;
  onViewChange: (view: ViewMode) => void;
  className?: string;
}

export function ViewToggle({ view, onViewChange, className }: ViewToggleProps) {
  return (
    <TooltipProvider>
      <div className={cn('inline-flex rounded-lg border bg-muted p-1', className)}>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                'h-8 w-8 p-0',
                view === 'kanban' && 'bg-background shadow-sm hover:bg-background',
              )}
              onClick={() => onViewChange('kanban')}
            >
              <LayoutGrid className="h-4 w-4" />
              <span className="sr-only">Visualização Kanban</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>Kanban</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                'h-8 w-8 p-0',
                view === 'list' && 'bg-background shadow-sm hover:bg-background',
              )}
              onClick={() => onViewChange('list')}
            >
              <List className="h-4 w-4" />
              <span className="sr-only">Visualização Lista</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>Lista</TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  );
}
