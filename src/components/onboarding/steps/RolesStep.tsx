'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ResponsibleRolesInput } from '@/components/organization/ResponsibleRolesInput';
import { Badge } from '@/components/ui/badge';

interface RolesStepProps {
  selectedRoles: string[];
  onRolesChange: (roles: string[]) => void;
  errors?: string[];
}

/**
 * RolesStep component
 * Story 11.12: Step 3 - Responsible roles assignment
 *
 * Reuses ResponsibleRolesInput component from Story 11.6
 * Allows user to select default responsible roles for activities
 */
export function RolesStep({
  selectedRoles,
  onRolesChange,
  errors = [],
}: RolesStepProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold mb-2">Funções Responsáveis</h2>
        <p className="text-sm text-muted-foreground">
          Selecione as funções que serão utilizadas na sua organização para atribuir responsabilidades
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

      {/* Roles Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Selecionar Funções</CardTitle>
          <CardDescription>
            Digite ou clique em uma função para adicioná-la
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <ResponsibleRolesInput
            value={selectedRoles}
            onChange={onRolesChange}
          />

          {selectedRoles.length > 0 && (
            <div className="space-y-2 pt-2 border-t">
              <p className="text-sm font-medium text-muted-foreground">
                {selectedRoles.length} função{selectedRoles.length !== 1 ? 's' : ''} selecionada{selectedRoles.length !== 1 ? 's' : ''}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Information Card */}
      <Card className="bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            💡 Dica
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-blue-900 dark:text-blue-100 space-y-2">
          <p>
            As funções selecionadas aqui serão disponíveis para atribuição em todas as atividades da sua organização.
          </p>
          <p>
            Você pode sempre adicionar ou remover funções depois, durante a configuração de atividades específicas.
          </p>
        </CardContent>
      </Card>

      {/* Role Categories Info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Categorias de Funções</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-2">
            <p className="text-xs font-medium">Gestão</p>
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline">Diretor</Badge>
              <Badge variant="outline">Gerente</Badge>
              <Badge variant="outline">Coordenador</Badge>
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-xs font-medium">Especialistas</p>
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline">Especialista</Badge>
              <Badge variant="outline">Analista Sênior</Badge>
              <Badge variant="outline">Analista Júnior</Badge>
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-xs font-medium">Operacional</p>
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline">Operacional</Badge>
              <Badge variant="outline">Administrativo</Badge>
              <Badge variant="outline">Supervisor</Badge>
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-xs font-medium">Externas</p>
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline">Cliente</Badge>
              <Badge variant="outline">Fornecedor</Badge>
              <Badge variant="outline">Parceiro</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
