'use client';

import React from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import type { OrganizationType } from '@/lib/organization/bootstrap-templates';

interface BasicsStepProps {
  organizationType: OrganizationType;
  onOrganizationTypeChange: (type: OrganizationType) => void;
  organizationName?: string;
  onOrganizationNameChange: (name: string) => void;
  industry?: string;
  onIndustryChange: (industry: string) => void;
  size?: string;
  onSizeChange: (size: string) => void;
  description?: string;
  onDescriptionChange: (desc: string) => void;
  errors?: string[];
}

/**
 * BasicsStep component
 * Story 11.12: Step 1 - Organization basics
 *
 * Allows user to select:
 * - Organization type (legal_office, consultancy, corporation, other)
 * - Organization name
 * - Industry
 * - Size
 * - Description
 */
export function BasicsStep({
  organizationType,
  onOrganizationTypeChange,
  organizationName = '',
  onOrganizationNameChange,
  industry = '',
  onIndustryChange,
  size = '',
  onSizeChange,
  description = '',
  onDescriptionChange,
  errors = [],
}: BasicsStepProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold mb-2">Informações Básicas da Organização</h2>
        <p className="text-sm text-muted-foreground">
          Configure os detalhes fundamentais da sua organização
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

      {/* Form Fields */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Tipo de Organização</CardTitle>
          <CardDescription>Selecione o tipo mais próximo de sua organização</CardDescription>
        </CardHeader>
        <CardContent>
          <Select value={organizationType} onValueChange={onOrganizationTypeChange}>
            <SelectTrigger id="org-type" aria-label="Tipo de organização">
              <SelectValue placeholder="Selecione o tipo de organização" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="legal_office">📋 Escritório Jurídico</SelectItem>
              <SelectItem value="consultancy">💼 Consultoria</SelectItem>
              <SelectItem value="corporation">🏢 Corporação</SelectItem>
              <SelectItem value="other">⚙️ Outro (Customizar)</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Organization Name */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Nome da Organização</CardTitle>
        </CardHeader>
        <CardContent>
          <Label htmlFor="org-name" className="mb-2 block text-sm font-medium">
            Nome
          </Label>
          <Input
            id="org-name"
            placeholder="Ex: Arauz Advogados"
            value={organizationName}
            onChange={(e) => onOrganizationNameChange(e.target.value)}
            aria-label="Nome da organização"
          />
        </CardContent>
      </Card>

      {/* Industry */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Indústria</CardTitle>
        </CardHeader>
        <CardContent>
          <Label htmlFor="industry" className="mb-2 block text-sm font-medium">
            Setor
          </Label>
          <Select value={industry} onValueChange={onIndustryChange}>
            <SelectTrigger id="industry" aria-label="Setor industrial">
              <SelectValue placeholder="Selecione o setor" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="legal">Jurídico</SelectItem>
              <SelectItem value="consulting">Consultoria</SelectItem>
              <SelectItem value="finance">Financeiro</SelectItem>
              <SelectItem value="technology">Tecnologia</SelectItem>
              <SelectItem value="manufacturing">Manufatura</SelectItem>
              <SelectItem value="retail">Varejo</SelectItem>
              <SelectItem value="healthcare">Saúde</SelectItem>
              <SelectItem value="education">Educação</SelectItem>
              <SelectItem value="other">Outro</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Organization Size */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Tamanho da Organização</CardTitle>
        </CardHeader>
        <CardContent>
          <Label htmlFor="size" className="mb-2 block text-sm font-medium">
            Número de Colaboradores
          </Label>
          <Select value={size} onValueChange={onSizeChange}>
            <SelectTrigger id="size" aria-label="Tamanho da organização">
              <SelectValue placeholder="Selecione o tamanho" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1-10">1 a 10</SelectItem>
              <SelectItem value="11-50">11 a 50</SelectItem>
              <SelectItem value="51-200">51 a 200</SelectItem>
              <SelectItem value="201-500">201 a 500</SelectItem>
              <SelectItem value="501-1000">501 a 1.000</SelectItem>
              <SelectItem value="1000+">Mais de 1.000</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Description */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Descrição (Opcional)</CardTitle>
          <CardDescription>Adicione uma descrição breve sobre sua organização</CardDescription>
        </CardHeader>
        <CardContent>
          <Label htmlFor="description" className="mb-2 block text-sm font-medium">
            Descrição
          </Label>
          <Textarea
            id="description"
            placeholder="Ex: Somos um escritório de advocacia com 25 anos de experiência..."
            value={description}
            onChange={(e) => onDescriptionChange(e.target.value)}
            rows={4}
            className="resize-none"
            aria-label="Descrição da organização"
          />
        </CardContent>
      </Card>
    </div>
  );
}
