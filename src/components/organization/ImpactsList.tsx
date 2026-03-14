'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp } from 'lucide-react';

interface Impact {
  name: string;
  description?: string;
}

interface ImpactsListProps {
  impacts?: Impact[] | string[];
}

export function ImpactsList({ impacts = [] }: ImpactsListProps) {
  if (impacts.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Impactos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Nenhum impacto identificado</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-4 w-4" />
          Impactos — {impacts.length}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {impacts.map((impact, idx) => {
            const impactName = typeof impact === 'string' ? impact : impact.name;
            const impactDescription = typeof impact === 'string' ? undefined : impact.description;

            return (
              <div key={idx} className="flex items-start gap-3 pb-3 border-b last:border-0">
                <div className="mt-1">
                  <div className="h-2 w-2 rounded-full bg-purple-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="font-medium text-sm block">{impactName}</span>
                  {impactDescription && (
                    <p className="text-xs text-muted-foreground mt-1">{impactDescription}</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
