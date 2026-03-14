'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle } from 'lucide-react';

interface Risk {
  name: string;
  severity?: string;
}

interface RisksListProps {
  risks?: Risk[] | string[];
}

function getRiskColor(severity?: string) {
  switch (severity?.toLowerCase()) {
    case 'high':
      return 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-200';
    case 'medium':
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-950 dark:text-yellow-200';
    case 'low':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-200';
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-950 dark:text-gray-200';
  }
}

function getRiskSeverityLabel(severity?: string): string {
  switch (severity?.toLowerCase()) {
    case 'high':
      return 'Alta';
    case 'medium':
      return 'Média';
    case 'low':
      return 'Baixa';
    default:
      return severity || 'Não especificado';
  }
}

export function RisksList({ risks = [] }: RisksListProps) {
  if (risks.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            Riscos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Nenhum risco identificado</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-4 w-4" />
          Riscos — {risks.length}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {risks.map((risk, idx) => {
            const riskName = typeof risk === 'string' ? risk : risk.name;
            const riskSeverity = typeof risk === 'string' ? undefined : risk.severity;

            return (
              <div key={idx} className="flex items-start gap-3 pb-3 border-b last:border-0">
                <div className="mt-1">
                  <div className="h-2 w-2 rounded-full bg-red-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm">{riskName}</span>
                    {riskSeverity && (
                      <Badge className={`text-xs ${getRiskColor(riskSeverity)}`}>
                        {getRiskSeverityLabel(riskSeverity)}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
