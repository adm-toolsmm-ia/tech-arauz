'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { AlertInfo } from 'lucide-react';

interface Template {
  id: string;
  name: string;
  description: string;
  processCount?: number;
}

interface TemplatesStepProps {
  templates: Template[];
  selectedTemplateId?: string;
  onTemplateSelect: (templateId: string) => void;
  loading?: boolean;
  errors?: string[];
}

/**
 * TemplatesStep component
 * Story 11.12: Step 4 - Process templates selection
 *
 * Allows user to select pre-configured process templates
 */
export function TemplatesStep({
  templates,
  selectedTemplateId,
  onTemplateSelect,
  loading = false,
  errors = [],
}: TemplatesStepProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold mb-2">Modelos de Processos</h2>
        <p className="text-sm text-muted-foreground">
          Selecione um modelo pré-configurado ou comece em branco
        </p>
      </div>

      {/* Error Display */}
      {errors.length > 0 && (
        <Card className="border-red-200 bg-red-50 dark:bg-red-950 dark:border-red-800">
          <CardContent className="pt-4">
            <ul className="text-sm text-red-700 dark:text-red-300 space-y-1">
              {errors.map((error, idx) => (
                <li key={idx} className="flex gap-2">
                  <span>•</span> {error}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Templates Selection */}
      <RadioGroup value={selectedTemplateId || ''} onValueChange={onTemplateSelect}>
        <div className="space-y-3">
          {templates.map((template) => (
            <Card
              key={template.id}
              className={`cursor-pointer transition-all ${
                selectedTemplateId === template.id
                  ? 'border-primary ring-2 ring-ring'
                  : 'hover:border-primary/50'
              }`}
              onClick={() => onTemplateSelect(template.id)}
              role="radio"
              aria-checked={selectedTemplateId === template.id}
              tabIndex={0}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  {/* Radio Button */}
                  <RadioGroupItem
                    value={template.id}
                    id={`template-${template.id}`}
                    className="mt-1 h-5 w-5"
                    aria-label={template.name}
                  />

                  {/* Template Info */}
                  <div className="flex-1 min-w-0">
                    <Label
                      htmlFor={`template-${template.id}`}
                      className="font-semibold text-base cursor-pointer"
                    >
                      {template.name}
                    </Label>
                    <p className="text-sm text-muted-foreground mt-1">
                      {template.description}
                    </p>

                    {template.processCount !== undefined && (
                      <div className="flex items-center gap-2 mt-3">
                        <Badge variant="secondary" className="text-xs">
                          {template.processCount} processos pré-configurados
                        </Badge>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </RadioGroup>

      {/* Information Card */}
      <Card className="bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            ℹ️ Informação
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-blue-900 dark:text-blue-100 space-y-2">
          <p>
            Os modelos incluem processos pré-configurados que você pode customizar posteriormente.
          </p>
          <p>
            Se nenhum modelo se encaixa perfeitamente, você pode começar em branco e adicionar processos manualmente.
          </p>
        </CardContent>
      </Card>

      {loading && (
        <div className="text-center py-4">
          <p className="text-sm text-muted-foreground">Carregando modelos...</p>
        </div>
      )}
    </div>
  );
}
