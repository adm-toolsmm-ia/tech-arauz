'use client';

import * as React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Building2, Network } from 'lucide-react';
import type { OrgArea } from '@/types/organization';

interface AreasCardViewProps {
  areas: OrgArea[];
  onAreaClick: (area: OrgArea) => void;
}

export function AreasCardView({ areas, onAreaClick }: AreasCardViewProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {areas.map((area) => (
        <Card
          key={area.id}
          role="button"
          tabIndex={0}
          onClick={() => onAreaClick(area)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              onAreaClick(area);
            }
          }}
          className="cursor-pointer transition-shadow hover:shadow-md"
        >
          <CardContent className="p-4 space-y-3">
            <div className="flex items-start gap-3">
              <div className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                <Building2 className="size-6 text-primary" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold">{area.name}</p>
                {area.description && (
                  <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                    {area.description}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Network className="size-4 text-primary" />
              <span>{area.nuclei_count ?? 0} núcleo(s)</span>
            </div>

            {area.responsible_roles && area.responsible_roles.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {area.responsible_roles.slice(0, 2).map((role) => (
                  <Badge key={role} variant="secondary" className="text-xs">
                    {role}
                  </Badge>
                ))}
                {area.responsible_roles.length > 2 && (
                  <Badge variant="outline" className="text-xs">
                    +{area.responsible_roles.length - 2}
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
