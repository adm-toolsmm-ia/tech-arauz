'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Trash2, Plus as PlusIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { WizardAreaSetup, WizardNucleusSetup } from '@/lib/organization/bootstrap-templates';

interface StructureStepProps {
  areas: WizardAreaSetup[];
  onAreasChange: (areas: WizardAreaSetup[]) => void;
  errors?: string[];
}

/**
 * StructureStep component
 * Story 11.12: Step 3 - Organization structure (areas and nuclei)
 *
 * Allows user to:
 * - Add/remove areas
 * - Add/remove nuclei per area
 * - Edit area and nucleus names and descriptions
 * - Visual hierarchy display
 */
export function StructureStep({
  areas,
  onAreasChange,
  errors = [],
}: StructureStepProps) {
  const [expandedAreas, setExpandedAreas] = useState<string[]>(
    areas.map((_, idx) => `area-${idx}`)
  );

  const handleAddArea = () => {
    const newArea: WizardAreaSetup = {
      name: `Área ${areas.length + 1}`,
      description: '',
      nuclei: [{ name: 'Núcleo 1', description: '' }],
    };
    onAreasChange([...areas, newArea]);
    setExpandedAreas([...expandedAreas, `area-${areas.length}`]);
  };

  const handleRemoveArea = (areaIdx: number) => {
    const updated = areas.filter((_, idx) => idx !== areaIdx);
    onAreasChange(updated);
    setExpandedAreas(expandedAreas.filter(id => id !== `area-${areaIdx}`));
  };

  const handleUpdateArea = (areaIdx: number, field: 'name' | 'description', value: string) => {
    const updated = [...areas];
    if (field === 'name') {
      updated[areaIdx].name = value;
    } else {
      updated[areaIdx].description = value;
    }
    onAreasChange(updated);
  };

  const handleAddNucleus = (areaIdx: number) => {
    const updated = [...areas];
    const nucleiCount = updated[areaIdx].nuclei.length + 1;
    updated[areaIdx].nuclei.push({
      name: `Núcleo ${nucleiCount}`,
      description: '',
    });
    onAreasChange(updated);
  };

  const handleRemoveNucleus = (areaIdx: number, nucleusIdx: number) => {
    const updated = [...areas];
    updated[areaIdx].nuclei = updated[areaIdx].nuclei.filter((_, idx) => idx !== nucleusIdx);
    onAreasChange(updated);
  };

  const handleUpdateNucleus = (
    areaIdx: number,
    nucleusIdx: number,
    field: 'name' | 'description',
    value: string
  ) => {
    const updated = [...areas];
    if (field === 'name') {
      updated[areaIdx].nuclei[nucleusIdx].name = value;
    } else {
      updated[areaIdx].nuclei[nucleusIdx].description = value;
    }
    onAreasChange(updated);
  };

  const toggleAreaExpanded = (areaIdx: number) => {
    const areaId = `area-${areaIdx}`;
    setExpandedAreas(prev =>
      prev.includes(areaId)
        ? prev.filter(id => id !== areaId)
        : [...prev, areaId]
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold mb-2">Estrutura Organizacional</h2>
        <p className="text-sm text-muted-foreground">
          Configure as áreas e núcleos da sua organização
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

      {/* Areas List */}
      <div className="space-y-3">
        {areas.map((area, areaIdx) => {
          const areaId = `area-${areaIdx}`;
          const isExpanded = expandedAreas.includes(areaId);

          return (
            <Card key={areaIdx} className="overflow-hidden">
              {/* Area Header */}
              <button
                type="button"
                onClick={() => toggleAreaExpanded(areaIdx)}
                className="w-full text-left p-4 hover:bg-muted/50 transition-colors flex items-center justify-between"
                aria-expanded={isExpanded}
                aria-label={`Área: ${area.name}`}
              >
                <div className="flex-1">
                  <h3 className="font-semibold">{area.name || 'Nova Área'}</h3>
                  <p className="text-xs text-muted-foreground">
                    {area.nuclei.length} núcleo{area.nuclei.length !== 1 ? 's' : ''}
                  </p>
                </div>
                <div className="flex gap-2 items-center">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveArea(areaIdx);
                    }}
                    aria-label={`Remover área ${area.name}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                  <span className="text-muted-foreground">
                    {isExpanded ? '▼' : '▶'}
                  </span>
                </div>
              </button>

              {/* Area Details (Expanded) */}
              {isExpanded && (
                <CardContent className="space-y-4 border-t pt-4">
                  {/* Area Name */}
                  <div className="space-y-2">
                    <Label htmlFor={`area-name-${areaIdx}`} className="text-sm font-medium">
                      Nome da Área
                    </Label>
                    <Input
                      id={`area-name-${areaIdx}`}
                      placeholder="Ex: Área Jurídica"
                      value={area.name}
                      onChange={(e) => handleUpdateArea(areaIdx, 'name', e.target.value)}
                      aria-label={`Nome da área ${areaIdx + 1}`}
                    />
                  </div>

                  {/* Area Description */}
                  <div className="space-y-2">
                    <Label htmlFor={`area-desc-${areaIdx}`} className="text-sm font-medium">
                      Descrição (Opcional)
                    </Label>
                    <Textarea
                      id={`area-desc-${areaIdx}`}
                      placeholder="Descrição breve desta área..."
                      value={area.description || ''}
                      onChange={(e) => handleUpdateArea(areaIdx, 'description', e.target.value)}
                      rows={2}
                      className="resize-none"
                      aria-label={`Descrição da área ${areaIdx + 1}`}
                    />
                  </div>

                  {/* Nuclei */}
                  <div className="space-y-3 mt-4 pt-4 border-t">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-sm">Núcleos</h4>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => handleAddNucleus(areaIdx)}
                        aria-label={`Adicionar núcleo à área ${area.name}`}
                      >
                        <PlusIcon className="h-4 w-4 mr-2" />
                        Adicionar Núcleo
                      </Button>
                    </div>

                    {area.nuclei.map((nucleus, nucleusIdx) => (
                      <Card key={nucleusIdx} className="bg-muted/30 p-3 space-y-2">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 space-y-2">
                            <Label
                              htmlFor={`nucleus-name-${areaIdx}-${nucleusIdx}`}
                              className="text-xs font-medium"
                            >
                              Nome do Núcleo
                            </Label>
                            <Input
                              id={`nucleus-name-${areaIdx}-${nucleusIdx}`}
                              placeholder="Ex: Núcleo Jurídico"
                              value={nucleus.name}
                              onChange={(e) =>
                                handleUpdateNucleus(areaIdx, nucleusIdx, 'name', e.target.value)
                              }
                              size="sm"
                              className="text-sm"
                              aria-label={`Nome do núcleo ${nucleusIdx + 1} da área ${areaIdx + 1}`}
                            />
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveNucleus(areaIdx, nucleusIdx)}
                            aria-label={`Remover núcleo ${nucleus.name}`}
                            className="mt-6"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>

                        <div>
                          <Label
                            htmlFor={`nucleus-desc-${areaIdx}-${nucleusIdx}`}
                            className="text-xs font-medium"
                          >
                            Descrição (Opcional)
                          </Label>
                          <Textarea
                            id={`nucleus-desc-${areaIdx}-${nucleusIdx}`}
                            placeholder="Descrição do núcleo..."
                            value={nucleus.description || ''}
                            onChange={(e) =>
                              handleUpdateNucleus(areaIdx, nucleusIdx, 'description', e.target.value)
                            }
                            rows={1}
                            className="resize-none text-sm"
                            aria-label={`Descrição do núcleo ${nucleusIdx + 1}`}
                          />
                        </div>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              )}
            </Card>
          );
        })}
      </div>

      {/* Add Area Button */}
      <Button
        type="button"
        onClick={handleAddArea}
        variant="outline"
        className="w-full"
        aria-label="Adicionar nova área"
      >
        <Plus className="h-4 w-4 mr-2" />
        Adicionar Área
      </Button>
    </div>
  );
}
