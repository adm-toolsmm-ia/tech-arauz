'use client';

import * as React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { GitBranch, Workflow } from 'lucide-react';
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
          <CardContent className="p-4 space-y-3">
            <div className="flex items-start gap-3">
              <div className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                <GitBranch className="size-6 text-primary" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold">{nucleus.name}</p>
                {nucleus.description && (
                  <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                    {nucleus.description}
                  </p>
                )}
              </div>
            </div>

            {nucleus.area_name && (
              <Badge variant="outline" className="text-xs">
                {nucleus.area_name}
              </Badge>
            )}

            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Workflow className="size-4 text-primary" />
              <span>{nucleus.processes_count ?? 0} processo(s)</span>
            </div>

            {nucleus.responsible_roles && nucleus.responsible_roles.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {nucleus.responsible_roles.slice(0, 2).map((role) => (
                  <Badge key={role} variant="secondary" className="text-xs">
                    {role}
                  </Badge>
                ))}
                {nucleus.responsible_roles.length > 2 && (
                  <Badge variant="outline" className="text-xs">
                    +{nucleus.responsible_roles.length - 2}
                  </Badge>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
