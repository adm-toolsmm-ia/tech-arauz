'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, CheckCircle2 } from 'lucide-react';

interface IntegrationStepProps {
  integrations: {
    id: string;
    name: string;
    description: string;
    enabled: boolean;
  }[];
  onIntegrationToggle: (id: string, enabled: boolean) => void;
  summary?: {
    organizationName?: string;
    organizationType?: string;
    areaCount?: number;
    nucleusCount?: number;
    roleCount?: number;
  };
  errors?: string[];
}

/**
 * IntegrationStep component
 * Story 11.12: Step 5 - Integration configuration and final review
 *
 * Allows user to:
 * - Enable/disable system integrations (Espaider, etc)
 * - Review all configuration before final submission
 * - Confirm bootstrap initialization
 */
export function IntegrationStep({
  integrations,
  onIntegrationToggle,
  summary,
  errors = [],
}: IntegrationStepProps) {
  const nucleusCount = summary?.nucleusCount || 0;
  const areaCount = summary?.areaCount || 0;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="mb-2 text-lg font-semibold">Integrações e Revisão Final</h2>
        <p className="text-sm text-muted-foreground">
          Configure as integrações de sistemas e revise as configurações antes de finalizar
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

      {/* Configuration Summary */}
      {summary && (
        <Card className="border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              Resumo da Configuração
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-4 text-sm md:grid-cols-2">
            {summary.organizationName && (
              <div>
                <p className="mb-1 text-xs font-medium text-muted-foreground">Organização</p>
                <p className="font-semibold">{summary.organizationName}</p>
              </div>
            )}

            {summary.organizationType && (
              <div>
                <p className="mb-1 text-xs font-medium text-muted-foreground">Tipo</p>
                <Badge variant="secondary" className="w-fit">
                  {summary.organizationType}
                </Badge>
              </div>
            )}

            {areaCount > 0 && (
              <div>
                <p className="mb-1 text-xs font-medium text-muted-foreground">Áreas</p>
                <p className="font-semibold">
                  {areaCount} área{areaCount !== 1 ? 's' : ''}
                </p>
              </div>
            )}

            {nucleusCount > 0 && (
              <div>
                <p className="mb-1 text-xs font-medium text-muted-foreground">Núcleos</p>
                <p className="font-semibold">
                  {nucleusCount} núcleo{nucleusCount !== 1 ? 's' : ''}
                </p>
              </div>
            )}

            {summary.roleCount && summary.roleCount > 0 && (
              <div>
                <p className="mb-1 text-xs font-medium text-muted-foreground">Funções</p>
                <p className="font-semibold">
                  {summary.roleCount} função{summary.roleCount !== 1 ? 's' : ''}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* System Integrations */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Integrações de Sistemas</CardTitle>
          <CardDescription>Configure quais sistemas externos você deseja integrar</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {integrations.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nenhuma integração disponível</p>
          ) : (
            integrations.map((integration) => (
              <div
                key={integration.id}
                className="hover:bg-muted/50 flex items-start gap-3 rounded-lg border p-3 transition-colors"
              >
                <div className="mt-1">
                  <Checkbox
                    checked={integration.enabled}
                    onCheckedChange={(checked) =>
                      onIntegrationToggle(integration.id, checked === true)
                    }
                    aria-label={`Ativar integração ${integration.name}`}
                  />
                </div>

                <div className="min-w-0 flex-1">
                  <p className="cursor-pointer text-sm font-medium">{integration.name}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{integration.description}</p>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* Final Confirmation */}
      <Card className="border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <AlertTriangle className="h-5 w-5 text-amber-600" />
            Próximos Passos
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-amber-900 dark:text-amber-100">
          <p>Ao confirmar, a seguinte estrutura será criada em sua organização:</p>
          <ul className="list-disc space-y-1 pl-5">
            <li>Todas as áreas e núcleos configurados</li>
            <li>Processos padrão do modelo selecionado</li>
            <li>Funções responsáveis disponíveis para atribuição</li>
            {integrations.some((i) => i.enabled) && <li>Integrações de sistemas habilitadas</li>}
          </ul>
          <p className="mt-3">
            Você poderá editar, adicionar ou remover qualquer elemento após a inicialização.
          </p>
        </CardContent>
      </Card>

      {/* Help Section */}
      <Card className="border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950">
        <CardHeader>
          <CardTitle className="text-sm">❓ Precisa de Ajuda?</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-blue-900 dark:text-blue-100">
          <p>
            Se algo não estiver claro, você pode voltar aos passos anteriores para revisar ou
            ajustar as configurações.
          </p>
          <p>Todas as mudanças podem ser feitas após a inicialização na seção de Configurações.</p>
        </CardContent>
      </Card>
    </div>
  );
}
