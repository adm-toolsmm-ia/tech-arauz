'use client';

import * as React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { GitBranch } from 'lucide-react';
import type { NucleusWithMeta } from '@/hooks/useNucleosFilters';

interface NucleosCardViewProps {
  nuclei: NucleusWithMeta[];
  onNucleusClick: (nucleus: NucleusWithMeta) => void;
}

export function NucleosCardView({ nuclei, onNucleusClick }: NucleosCardViewProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {nuclei.map((nucleus) => (
        <Card
          key={nucleus.id}
          role="button"
          tabIndex={0}
          onClick={() => onNucleusClick(nucleus)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              onNucleusClick(nucleus);
            }
          }}
          className="cursor-pointer transition-shadow hover:shadow-md"
        >
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                <GitBranch className="size-6 text-primary" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium">{nucleus.name}</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {nucleus.area_name ?? 'Sem área'}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {nucleus.processes_count ?? 0} processo(s)
                </p>
                {nucleus.description && (
                  <p className="mt-2 line-clamp-2 text-xs text-muted-foreground">
                    {nucleus.description}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
