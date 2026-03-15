'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';
import type { OrgInputOutput } from '@/types/organization';

interface OutputsListProps {
  outputs?: OrgInputOutput[];
}

export function OutputsList({ outputs = [] }: OutputsListProps) {
  if (outputs.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Outputs (Saídas)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Nenhuma saída definida</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ArrowLeft className="h-4 w-4" />
          Outputs (Saídas) — {outputs.length}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {outputs.map((output, idx) => (
            <div key={idx} className="flex items-start gap-3 border-b pb-3 last:border-0">
              <div className="mt-1">
                <div className="h-2 w-2 rounded-full bg-green-500" />
              </div>
              <div className="min-w-0 flex-1">
                <span className="block text-sm font-medium">{output.name}</span>
                {output.description && (
                  <p className="mt-1 text-xs text-muted-foreground">{output.description}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
