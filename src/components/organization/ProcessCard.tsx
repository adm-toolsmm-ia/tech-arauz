'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { GitBranch, ArrowDown, ArrowUp } from 'lucide-react';
import type { OrgProcess } from '@/types/organization';

interface ProcessCardProps {
  process: OrgProcess;
  nucleusName?: string;
  areaName?: string;
  onClick?: () => void;
}

export function ProcessCard({ process, nucleusName, areaName, onClick }: ProcessCardProps) {
  const inputsCount = process.inputs?.length ?? 0;
  const outputsCount = process.outputs?.length ?? 0;

  return (
    <Card
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick?.();
        }
      }}
      className="cursor-pointer transition-shadow hover:shadow-md"
    >
      <CardContent className="space-y-3 p-4">
        <div className="flex items-start gap-3">
          <div className="bg-primary/10 flex size-12 shrink-0 items-center justify-center rounded-lg">
            <GitBranch className="text-primary size-6" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate font-semibold">{process.name}</p>
            {process.description && (
              <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                {process.description}
              </p>
            )}
          </div>
        </div>

        {(areaName || nucleusName) && (
          <div className="flex flex-wrap gap-1">
            {areaName && (
              <Badge variant="outline" className="text-xs">
                {areaName}
              </Badge>
            )}
            {nucleusName && (
              <Badge variant="outline" className="text-xs">
                {nucleusName}
              </Badge>
            )}
          </div>
        )}

        <div className="flex gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <ArrowDown className="size-4 text-blue-600" />
            <span>{inputsCount}</span>
          </div>
          <div className="flex items-center gap-1">
            <ArrowUp className="size-4 text-green-600" />
            <span>{outputsCount}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
