'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { AlertCircle } from 'lucide-react';

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
        <h2 className="mb-2 text-lg font-semibold">Modelos de Processos</h2>
        <p className="text-sm text-muted-foreground">
          Selecione um modelo pré-configurado ou comece em branco
        </p>
      </div>

      {/* Error Display */}
      {errors.length > 0 && (
        <Card className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950">
          <CardContent className="pt-4">
            <ul className="space-y-1 text-sm text-red-700 dark:text-red-300">
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
                <input
                  type="radio"
                  id={`template-${template.id}`}
                  name="template-selection"
                  value={template.id}
                  checked={selectedTemplateId === template.id}
                  onChange={() => onTemplateSelect(template.id)}
                  className="mt-1 h-5 w-5 cursor-pointer"
                  aria-label={template.name}
                />

                {/* Template Info */}
                <div className="min-w-0 flex-1">
                  <Label
                    htmlFor={`template-${template.id}`}
                    className="cursor-pointer text-base font-semibold"
                  >
                    {template.name}
                  </Label>
                  <p className="mt-1 text-sm text-muted-foreground">{template.description}</p>

                  {template.processCount !== undefined && (
                    <div className="mt-3 flex items-center gap-2">
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

      {/* Information Card */}
      <Card className="border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm">ℹ️ Informação</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-blue-900 dark:text-blue-100">
          <p>
            Os modelos incluem processos pré-configurados que você pode customizar posteriormente.
          </p>
          <p>
            Se nenhum modelo se encaixa perfeitamente, você pode começar em branco e adicionar
            processos manualmente.
          </p>
        </CardContent>
      </Card>

      {loading && (
        <div className="py-4 text-center">
          <p className="text-sm text-muted-foreground">Carregando modelos...</p>
        </div>
      )}
    </div>
  );
}
