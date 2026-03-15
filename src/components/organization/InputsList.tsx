'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowRight } from 'lucide-react';
import type { OrgInputOutput } from '@/types/organization';

interface InputsListProps {
  inputs?: OrgInputOutput[];
}

export function InputsList({ inputs = [] }: InputsListProps) {
  if (inputs.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ArrowRight className="h-4 w-4" />
            Inputs (Entradas)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Nenhuma entrada definida</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ArrowRight className="h-4 w-4" />
          Inputs (Entradas) — {inputs.length}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {inputs.map((input, idx) => (
            <div key={idx} className="flex items-start gap-3 border-b pb-3 last:border-0">
              <div className="mt-1">
                <div className="h-2 w-2 rounded-full bg-blue-500" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">{input.name}</span>
                  {input.required && (
                    <Badge variant="outline" className="text-xs">
                      Obrigatório
                    </Badge>
                  )}
                </div>
                {input.description && (
                  <p className="mt-1 text-xs text-muted-foreground">{input.description}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
