'use client';

import * as React from 'react';
import { X, SlidersHorizontal, Star, AlertTriangle, Clock, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
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
  concluidos: boolean;
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
  concluidos: false,
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
    id: 'concluidos',
    label: 'Concluídos',
    icon: Clock, // Usando Clock por enquanto, ou Check se importado
    apply: (f) => ({ ...f, concluidos: true }),
    isActive: (f) => f.concluidos === true,
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
  if (filters.concluidos) count++;
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
              className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium transition-colors ${
                isSelected
                  ? 'border-primary bg-primary text-primary-foreground'
                  : 'border-transparent bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground'
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

export function ProjectFilters({ filters, onFiltersChange, availableValues }: ProjectFiltersProps) {
  const activeCount = getActiveFilterCount(filters);
  const [open, setOpen] = React.useState(false);

  const handleQuickFilter = (qf: QuickFilter) => {
    if (qf.isActive(filters)) {
      // Remove quick filter
      // Se for filtro de concluídos, ao remover volta a ser false (oculta concluídos)
      if (qf.id === 'concluidos') {
        onFiltersChange({ ...filters, concluidos: false });
      } else {
        // Para outros filtros, reset para default mas mantendo campos
        const newFilters = { ...filters };
        if (qf.id === 'alta_prioridade') newFilters.prioridade = [];
        if (qf.id === 'importancia_especial') newFilters.importancia_especial = null;
        if (qf.id === 'atrasados') newFilters.prazo_vencido = false;
        if (qf.id === 'em_aprovacao') newFilters.status = [];
        onFiltersChange(newFilters);
      }
    } else {
      // Aplica o filtro. Se for 'concluidos', reseta status para evitar conflito?
      // O apply já define o estado
      onFiltersChange(qf.apply(filters));
    }
  };

  const handleClear = () => {
    onFiltersChange({ ...defaultFilters, search: filters.search });
  };

  return (
    <div className="flex flex-col gap-3">
      {/* Quick Filters Row */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="mr-1 text-xs font-medium text-muted-foreground">Filtros rápidos:</span>
        {quickFilters.map((qf) => {
          const Icon = qf.icon;
          const active = qf.isActive(filters);
          return (
            <Button
              key={qf.id}
              variant={active ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleQuickFilter(qf)}
              className={`h-7 gap-1.5 rounded-full text-xs ${active ? 'shadow-md' : 'border-muted-foreground/30 bg-transparent'}`}
            >
              <Icon className="size-3" />
              {qf.label}
            </Button>
          );
        })}

        <Separator orientation="vertical" className="mx-1 h-5" />

        {/* Advanced Filter Sheet Trigger */}
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" size="sm" className="h-7 gap-1.5 rounded-full text-xs">
              <SlidersHorizontal className="size-3" />
              Filtros Avançados
              {activeCount > 0 && (
                <Badge variant="default" className="ml-1 h-4 rounded-full px-1.5 text-[10px]">
                  {activeCount}
                </Badge>
              )}
            </Button>
          </SheetTrigger>
          <SheetContent className="w-[400px] overflow-y-auto sm:w-[440px]">
            <SheetHeader>
              <SheetTitle className="flex items-center justify-between">
                Filtros Avançados
                {activeCount > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleClear}
                    className="text-xs text-muted-foreground"
                  >
                    <X className="mr-1 size-3" />
                    Limpar todos
                  </Button>
                )}
              </SheetTitle>
            </SheetHeader>

            <div className="mt-6 space-y-6">
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
                  <Label htmlFor="importancia" className="text-sm">
                    Importância Especial
                  </Label>
                  <Switch
                    id="importancia"
                    checked={filters.importancia_especial === true}
                    onCheckedChange={(checked) =>
                      onFiltersChange({ ...filters, importancia_especial: checked ? true : null })
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="vencido" className="text-sm">
                    Apenas Atrasados
                  </Label>
                  <Switch
                    id="vencido"
                    checked={filters.prazo_vencido}
                    onCheckedChange={(checked) =>
                      onFiltersChange({ ...filters, prazo_vencido: checked })
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="concluidos" className="text-sm">
                    Mostrar Concluídos
                  </Label>
                  <Switch
                    id="concluidos"
                    checked={filters.concluidos}
                    onCheckedChange={(checked) =>
                      onFiltersChange({ ...filters, concluidos: checked })
                    }
                  />
                </div>
              </div>
            </div>
          </SheetContent>
        </Sheet>

        {/* Active filter count & clear */}
        {activeCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClear}
            className="h-7 text-xs text-muted-foreground hover:text-destructive"
          >
            <X className="mr-1 size-3" />
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
  field: keyof T,
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
  filters: ProjectFilterState,
): T[] {
  let result = projects;

  const normalize = (s: string) =>
    s
      ?.trim()
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '_')
      .replace(/^_+|_+$/g, '') || '';

  // Filter Concluídos logic
  if (filters.concluidos) {
    // Show ONLY concluded? Or include them?
    // "visible only via quick filter" implies they are a separate view or only shown when requested.
    // If I select "Concluídos", I usually want to see them.
    // If I select "Concluídos" AND "High Priority", I want completed high priority projects.
    // So if concluidos is true, we simply DO NOT filter them out.
    // Wait, the user said "remove from default view". "leave visible only via quick filter".
    // This implies that normally they are hidden.
    // If filtering by "concluidos=true", does it mean ONLY concluded?
    // Let's assume:
    // - Default (concluidos=false): Hide 'concluido' and 'cancelado'? Or just 'concluido'? User said "projetos concluídos".
    // - Active (concluidos=true): Show ONLY 'concluido'. This is a common pattern for "Archived/Completed" views.
    result = result.filter((p) => normalize(p.status) === 'concluido');
  } else {
    // Default: Hide concluded
    result = result.filter((p) => normalize(p.status) !== 'concluido');
  }

  // Search
  if (filters.search) {
    const term = filters.search.toLowerCase();
    result = result.filter(
      (p) =>
        (p.project_name || '').toLowerCase().includes(term) ||
        (p.espaider_code || '').toLowerCase().includes(term),
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
    result = result.filter(
      (p) =>
        p.complexidade_tecnica && filters.complexidade_tecnica.includes(p.complexidade_tecnica),
    );
  }
  if (filters.impacto_operacional.length > 0) {
    result = result.filter(
      (p) => p.impacto_operacional && filters.impacto_operacional.includes(p.impacto_operacional),
    );
  }

  // Toggle filters
  if (filters.importancia_especial === true) {
    result = result.filter((p) => p.importancia_especial === true);
  }
  if (filters.prazo_vencido) {
    const now = new Date();
    result = result.filter((p) => {
      // Ensure we don't flag completed/cancelled as overdue, regardless of the 'concluidos' filter state override above
      // (Though if 'concluidos=true' we are showing completed, so they shouldn't be overdue anyway)
      const status = normalize(p.status);
      if (!p.end_date || status === 'concluido' || status === 'cancelado') return false;
      try {
        return new Date(p.end_date) < now;
      } catch {
        return false;
      }
    });
  }

  return result;
}
