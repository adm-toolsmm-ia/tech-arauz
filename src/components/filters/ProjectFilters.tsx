'use client';

import * as React from 'react';
import { X, SlidersHorizontal, Star, AlertTriangle, Clock, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export interface ProjectFilterState {
  search: string;
  status: string[];
  fase_atual: string[];
  area: string[];
  tipo_chamado: string[];
  tipo_assunto: string[];
  responsavel: string[];
  solicitante: string[];
  prioridade: string[];
  complexidade_tecnica: string[];
  impacto_operacional: string[];
  importancia_especial: boolean | null;
  prazo_vencido: boolean;
}

export const defaultFilters: ProjectFilterState = {
  search: '',
  status: [],
  fase_atual: [],
  area: [],
  tipo_chamado: [],
  tipo_assunto: [],
  responsavel: [],
  solicitante: [],
  prioridade: [],
  complexidade_tecnica: [],
  impacto_operacional: [],
  importancia_especial: null,
  prazo_vencido: false,
};

interface ProjectFiltersProps {
  filters: ProjectFilterState;
  onFiltersChange: (filters: ProjectFilterState) => void;
  availableValues: {
    status: string[];
    fase_atual: string[];
    area: string[];
    tipo_chamado: string[];
    tipo_assunto: string[];
    responsavel: string[];
    solicitante: string[];
    prioridade: string[];
    complexidade_tecnica: string[];
    impacto_operacional: string[];
  };
}

// Quick filter presets
interface QuickFilter {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  apply: (filters: ProjectFilterState) => ProjectFilterState;
  isActive: (filters: ProjectFilterState) => boolean;
}

const quickFilters: QuickFilter[] = [
  {
    id: 'alta_prioridade',
    label: 'Alta Prioridade',
    icon: Zap,
    apply: (f) => ({ ...f, prioridade: ['urgente', 'alta'] }),
    isActive: (f) => f.prioridade.includes('urgente') || f.prioridade.includes('alta'),
  },
  {
    id: 'importancia_especial',
    label: 'Importância Especial',
    icon: Star,
    apply: (f) => ({ ...f, importancia_especial: true }),
    isActive: (f) => f.importancia_especial === true,
  },
  {
    id: 'atrasados',
    label: 'Atrasados',
    icon: AlertTriangle,
    apply: (f) => ({ ...f, prazo_vencido: true }),
    isActive: (f) => f.prazo_vencido === true,
  },
  {
    id: 'em_aprovacao',
    label: 'Em Aprovação',
    icon: Clock,
    apply: (f) => ({ ...f, status: ['em_aprovacao'] }),
    isActive: (f) => f.status.includes('em_aprovacao') && f.status.length === 1,
  },
];

function getActiveFilterCount(filters: ProjectFilterState): number {
  let count = 0;
  if (filters.status.length > 0) count++;
  if (filters.fase_atual.length > 0) count++;
  if (filters.area.length > 0) count++;
  if (filters.tipo_chamado.length > 0) count++;
  if (filters.tipo_assunto.length > 0) count++;
  if (filters.responsavel.length > 0) count++;
  if (filters.solicitante.length > 0) count++;
  if (filters.prioridade.length > 0) count++;
  if (filters.complexidade_tecnica.length > 0) count++;
  if (filters.impacto_operacional.length > 0) count++;
  if (filters.importancia_especial !== null) count++;
  if (filters.prazo_vencido) count++;
  return count;
}

function MultiSelectFilter({
  label,
  options,
  selected,
  onChange,
}: {
  label: string;
  options: string[];
  selected: string[];
  onChange: (values: string[]) => void;
}) {
  if (options.length === 0) return null;

  return (
    <div className="space-y-2">
      <Label className="text-xs font-medium">{label}</Label>
      <div className="flex flex-wrap gap-1.5">
        {options.map((option) => {
          const isSelected = selected.includes(option);
          return (
            <button
              key={option}
              type="button"
              onClick={() => {
                if (isSelected) {
                  onChange(selected.filter((v) => v !== option));
                } else {
                  onChange([...selected, option]);
                }
              }}
              className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium border transition-colors ${
                isSelected
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-muted/50 text-muted-foreground border-transparent hover:bg-muted hover:text-foreground'
              }`}
            >
              {option || '(vazio)'}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function ProjectFilters({
  filters,
  onFiltersChange,
  availableValues,
}: ProjectFiltersProps) {
  const activeCount = getActiveFilterCount(filters);
  const [open, setOpen] = React.useState(false);

  const handleQuickFilter = (qf: QuickFilter) => {
    if (qf.isActive(filters)) {
      // Remove quick filter
      onFiltersChange(defaultFilters);
    } else {
      onFiltersChange(qf.apply({ ...defaultFilters, search: filters.search }));
    }
  };

  const handleClear = () => {
    onFiltersChange({ ...defaultFilters, search: filters.search });
  };

  return (
    <div className="flex flex-col gap-3">
      {/* Quick Filters Row */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs text-muted-foreground font-medium mr-1">Filtros rápidos:</span>
        {quickFilters.map((qf) => {
          const Icon = qf.icon;
          const active = qf.isActive(filters);
          return (
            <Button
              key={qf.id}
              variant={active ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleQuickFilter(qf)}
              className={`h-7 text-xs rounded-full gap-1.5 ${active ? 'shadow-md' : 'bg-transparent border-muted-foreground/30'}`}
            >
              <Icon className="size-3" />
              {qf.label}
            </Button>
          );
        })}

        <Separator orientation="vertical" className="h-5 mx-1" />

        {/* Advanced Filter Sheet Trigger */}
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" size="sm" className="h-7 text-xs rounded-full gap-1.5">
              <SlidersHorizontal className="size-3" />
              Filtros Avançados
              {activeCount > 0 && (
                <Badge variant="default" className="ml-1 h-4 px-1.5 text-[10px] rounded-full">
                  {activeCount}
                </Badge>
              )}
            </Button>
          </SheetTrigger>
          <SheetContent className="w-[400px] sm:w-[440px] overflow-y-auto">
            <SheetHeader>
              <SheetTitle className="flex items-center justify-between">
                Filtros Avançados
                {activeCount > 0 && (
                  <Button variant="ghost" size="sm" onClick={handleClear} className="text-xs text-muted-foreground">
                    <X className="size-3 mr-1" />
                    Limpar todos
                  </Button>
                )}
              </SheetTitle>
            </SheetHeader>

            <div className="space-y-6 mt-6">
              {/* Status */}
              <MultiSelectFilter
                label="Status"
                options={availableValues.status}
                selected={filters.status}
                onChange={(v) => onFiltersChange({ ...filters, status: v })}
              />

              {/* Fase Atual */}
              <MultiSelectFilter
                label="Fase Atual"
                options={availableValues.fase_atual}
                selected={filters.fase_atual}
                onChange={(v) => onFiltersChange({ ...filters, fase_atual: v })}
              />

              {/* Área */}
              <MultiSelectFilter
                label="Área"
                options={availableValues.area}
                selected={filters.area}
                onChange={(v) => onFiltersChange({ ...filters, area: v })}
              />

              {/* Tipo Chamado */}
              <MultiSelectFilter
                label="Tipo de Chamado"
                options={availableValues.tipo_chamado}
                selected={filters.tipo_chamado}
                onChange={(v) => onFiltersChange({ ...filters, tipo_chamado: v })}
              />

              {/* Tipo Assunto */}
              <MultiSelectFilter
                label="Tipo de Assunto"
                options={availableValues.tipo_assunto}
                selected={filters.tipo_assunto}
                onChange={(v) => onFiltersChange({ ...filters, tipo_assunto: v })}
              />

              {/* Responsável */}
              <MultiSelectFilter
                label="Responsável"
                options={availableValues.responsavel}
                selected={filters.responsavel}
                onChange={(v) => onFiltersChange({ ...filters, responsavel: v })}
              />

              {/* Solicitante */}
              <MultiSelectFilter
                label="Solicitante"
                options={availableValues.solicitante}
                selected={filters.solicitante}
                onChange={(v) => onFiltersChange({ ...filters, solicitante: v })}
              />

              {/* Prioridade */}
              <MultiSelectFilter
                label="Prioridade"
                options={availableValues.prioridade}
                selected={filters.prioridade}
                onChange={(v) => onFiltersChange({ ...filters, prioridade: v })}
              />

              {/* Complexidade Técnica */}
              <MultiSelectFilter
                label="Complexidade Técnica"
                options={availableValues.complexidade_tecnica}
                selected={filters.complexidade_tecnica}
                onChange={(v) => onFiltersChange({ ...filters, complexidade_tecnica: v })}
              />

              {/* Impacto Operacional */}
              <MultiSelectFilter
                label="Impacto Operacional"
                options={availableValues.impacto_operacional}
                selected={filters.impacto_operacional}
                onChange={(v) => onFiltersChange({ ...filters, impacto_operacional: v })}
              />

              <Separator />

              {/* Toggle Filters */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="importancia" className="text-sm">Importância Especial</Label>
                  <Switch
                    id="importancia"
                    checked={filters.importancia_especial === true}
                    onCheckedChange={(checked) =>
                      onFiltersChange({ ...filters, importancia_especial: checked ? true : null })
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="vencido" className="text-sm">Apenas Atrasados</Label>
                  <Switch
                    id="vencido"
                    checked={filters.prazo_vencido}
                    onCheckedChange={(checked) =>
                      onFiltersChange({ ...filters, prazo_vencido: checked })
                    }
                  />
                </div>
              </div>
            </div>
          </SheetContent>
        </Sheet>

        {/* Active filter count & clear */}
        {activeCount > 0 && (
          <Button variant="ghost" size="sm" onClick={handleClear} className="h-7 text-xs text-muted-foreground hover:text-destructive">
            <X className="size-3 mr-1" />
            Limpar ({activeCount})
          </Button>
        )}
      </div>
    </div>
  );
}

// Utility: Extract unique non-null values from project field
export function extractUniqueValues<T extends Record<string, any>>(
  items: T[],
  field: keyof T
): string[] {
  const values = new Set<string>();
  items.forEach((item) => {
    const val = item[field];
    if (val && typeof val === 'string' && val.trim()) {
      values.add(val.trim());
    }
  });
  return Array.from(values).sort((a, b) => a.localeCompare(b, 'pt-BR'));
}

// Utility: Apply filters to project list
export function applyProjectFilters<T extends Record<string, any>>(
  projects: T[],
  filters: ProjectFilterState
): T[] {
  let result = projects;

  // Search
  if (filters.search) {
    const term = filters.search.toLowerCase();
    result = result.filter(
      (p) =>
        (p.project_name || '').toLowerCase().includes(term) ||
        (p.espaider_code || '').toLowerCase().includes(term)
    );
  }

  // Multi-select filters
  if (filters.status.length > 0) {
    result = result.filter((p) => filters.status.includes(p.status));
  }
  if (filters.fase_atual.length > 0) {
    result = result.filter((p) => p.fase_atual && filters.fase_atual.includes(p.fase_atual));
  }
  if (filters.area.length > 0) {
    result = result.filter((p) => p.area && filters.area.includes(p.area));
  }
  if (filters.tipo_chamado.length > 0) {
    result = result.filter((p) => p.tipo_chamado && filters.tipo_chamado.includes(p.tipo_chamado));
  }
  if (filters.tipo_assunto.length > 0) {
    result = result.filter((p) => p.tipo_assunto && filters.tipo_assunto.includes(p.tipo_assunto));
  }
  if (filters.responsavel.length > 0) {
    result = result.filter((p) => p.responsible && filters.responsavel.includes(p.responsible));
  }
  if (filters.solicitante.length > 0) {
    result = result.filter((p) => p.solicitante && filters.solicitante.includes(p.solicitante));
  }
  if (filters.prioridade.length > 0) {
    result = result.filter((p) => p.priority && filters.prioridade.includes(p.priority));
  }
  if (filters.complexidade_tecnica.length > 0) {
    result = result.filter((p) => p.complexidade_tecnica && filters.complexidade_tecnica.includes(p.complexidade_tecnica));
  }
  if (filters.impacto_operacional.length > 0) {
    result = result.filter((p) => p.impacto_operacional && filters.impacto_operacional.includes(p.impacto_operacional));
  }

  // Toggle filters
  if (filters.importancia_especial === true) {
    result = result.filter((p) => p.importancia_especial === true);
  }
  if (filters.prazo_vencido) {
    const now = new Date();
    result = result.filter((p) => {
      if (!p.end_date || p.status === 'concluido' || p.status === 'cancelado') return false;
      try { return new Date(p.end_date) < now; } catch { return false; }
    });
  }

  return result;
}
