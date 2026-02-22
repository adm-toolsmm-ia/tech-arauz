/**
 * FilterControl Component
 * Base component for rendering individual filter controls
 * Supports select, multi-select, date-range, checkbox
 */

'use client';

import * as React from 'react';
import { ChevronDown, Calendar, X } from 'lucide-react';
import { FilterControlProps, FilterDefinition, FilterOption } from '@/lib/filters/filter-types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';

export function FilterControl({
  definition,
  value,
  onChange,
  isLoading = false,
  disabled = false,
  className,
}: FilterControlProps) {
  const [search, setSearch] = React.useState('');
  const [isOpen, setIsOpen] = React.useState(false);

  // Get options (handle both static and dynamic)
  const options = React.useMemo(() => {
    if (!definition.options) return [];
    if (typeof definition.options === 'function') {
      return definition.options();
    }
    return definition.options;
  }, [definition]);

  // Filter options based on search
  const filteredOptions = React.useMemo(() => {
    if (!search || !definition.searchable) return options;

    const searchLower = search.toLowerCase();
    return options.filter((opt) =>
      String(opt.label).toLowerCase().includes(searchLower),
    );
  }, [options, search, definition.searchable]);

  // Sort options if needed
  const displayOptions = React.useMemo(() => {
    let sorted = [...filteredOptions];
    if (definition.sortOptions) {
      sorted.sort((a, b) => String(a.label).localeCompare(String(b.label)));
    }
    return sorted;
  }, [filteredOptions, definition.sortOptions]);

  // Render based on type
  switch (definition.type) {
    case 'select':
      return (
        <SelectControl
          definition={definition}
          options={displayOptions}
          value={value}
          onChange={onChange}
          disabled={disabled}
          isLoading={isLoading}
          className={className}
        />
      );

    case 'multi-select':
      return (
        <MultiSelectControl
          definition={definition}
          options={displayOptions}
          value={value}
          onChange={onChange}
          search={search}
          onSearchChange={setSearch}
          onOpenChange={setIsOpen}
          isOpen={isOpen}
          disabled={disabled}
          isLoading={isLoading}
          className={className}
        />
      );

    case 'checkbox':
      return (
        <CheckboxControl
          definition={definition}
          options={displayOptions}
          value={value}
          onChange={onChange}
          disabled={disabled}
          className={className}
        />
      );

    case 'date-range':
      return (
        <DateRangeControl
          definition={definition}
          value={value}
          onChange={onChange}
          disabled={disabled}
          className={className}
        />
      );

    case 'slider':
      return (
        <SliderControl
          definition={definition}
          value={value}
          onChange={onChange}
          disabled={disabled}
          className={className}
        />
      );

    case 'tags':
      return (
        <TagsControl
          definition={definition}
          options={displayOptions}
          value={value}
          onChange={onChange}
          search={search}
          onSearchChange={setSearch}
          disabled={disabled}
          className={className}
        />
      );

    default:
      return null;
  }
}

// ============ Sub-components ============

function SelectControl({
  definition,
  options,
  value,
  onChange,
  disabled,
  isLoading,
  className,
}: {
  definition: FilterDefinition;
  options: FilterOption[];
  value: any;
  onChange: (value: any) => void;
  disabled?: boolean;
  isLoading?: boolean;
  className?: string;
}) {
  return (
    <div className={cn('flex flex-col gap-2', className)}>
      <label className="text-sm font-medium">{definition.label}</label>
      <Select value={String(value || '')} onValueChange={onChange} disabled={disabled || isLoading}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder={definition.placeholder || `Select ${definition.label}...`} />
        </SelectTrigger>
        <SelectContent>
          {options.map((opt) => (
            <SelectItem key={String(opt.value)} value={String(opt.value)}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

function MultiSelectControl({
  definition,
  options,
  value = [],
  onChange,
  search,
  onSearchChange,
  onOpenChange,
  isOpen,
  disabled,
  isLoading,
  className,
}: {
  definition: FilterDefinition;
  options: FilterOption[];
  value: any[];
  onChange: (value: any[]) => void;
  search: string;
  onSearchChange: (search: string) => void;
  onOpenChange: (open: boolean) => void;
  isOpen: boolean;
  disabled?: boolean;
  isLoading?: boolean;
  className?: string;
}) {
  const selectedLabels = React.useMemo(() => {
    return value
      .map((v) => options.find((opt) => opt.value === v)?.label || String(v))
      .filter(Boolean);
  }, [value, options]);

  const handleToggle = (optValue: string | number | boolean) => {
    const newValue = value.includes(optValue)
      ? value.filter((v) => v !== optValue)
      : [...value, optValue];
    onChange(newValue);
  };

  const handleClear = (optValue: string | number | boolean) => {
    onChange(value.filter((v) => v !== optValue));
  };

  return (
    <div className={cn('flex flex-col gap-2', className)}>
      <label className="text-sm font-medium">{definition.label}</label>

      <Popover open={isOpen} onOpenChange={onOpenChange}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            disabled={disabled || isLoading}
            className="w-full justify-between"
          >
            <span className="truncate text-left">
              {selectedLabels.length > 0
                ? `${selectedLabels.length} selected`
                : `Select ${definition.label}...`}
            </span>
            <ChevronDown className="h-4 w-4 opacity-50" />
          </Button>
        </PopoverTrigger>

        <PopoverContent className="w-[280px] p-3" align="start">
          {definition.searchable && (
            <Input
              placeholder="Search..."
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              className="mb-2"
              autoFocus
            />
          )}

          <div className="space-y-2 max-h-[300px] overflow-y-auto">
            {options.map((opt) => (
              <label key={String(opt.value)} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={value.includes(opt.value)}
                  onChange={() => handleToggle(opt.value)}
                  disabled={opt.disabled}
                  className="w-4 h-4 rounded border-gray-300"
                />
                <span className="text-sm flex-1">{opt.label}</span>
                {opt.badge && <Badge variant="secondary">{opt.badge}</Badge>}
              </label>
            ))}
          </div>

          {selectedLabels.length > 0 && (
            <div className="mt-3 flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onChange([])}
                className="flex-1"
              >
                Clear
              </Button>
            </div>
          )}
        </PopoverContent>
      </Popover>

      {/* Show selected as badges */}
      {selectedLabels.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {value.map((v, idx) => (
            <Badge key={idx} variant="secondary" className="gap-1">
              {selectedLabels[idx]}
              {definition.clearable && (
                <button
                  onClick={() => handleClear(v)}
                  className="ml-1 hover:opacity-70"
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}

function CheckboxControl({
  definition,
  options,
  value = false,
  onChange,
  disabled,
  className,
}: {
  definition: FilterDefinition;
  options: FilterOption[];
  value: boolean;
  onChange: (value: boolean) => void;
  disabled?: boolean;
  className?: string;
}) {
  return (
    <div className={cn('flex items-center gap-3', className)}>
      <input
        type="checkbox"
        id={definition.id}
        checked={value}
        onChange={(e) => onChange(e.target.checked)}
        disabled={disabled}
        className="w-4 h-4 rounded border-gray-300"
      />
      <label htmlFor={definition.id} className="text-sm font-medium cursor-pointer">
        {definition.label}
      </label>
    </div>
  );
}

function DateRangeControl({
  definition,
  value = {},
  onChange,
  disabled,
  className,
}: {
  definition: FilterDefinition;
  value: { start?: string; end?: string };
  onChange: (value: any) => void;
  disabled?: boolean;
  className?: string;
}) {
  return (
    <div className={cn('flex flex-col gap-2', className)}>
      <label className="text-sm font-medium">{definition.label}</label>
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <Calendar className="absolute left-2 top-2.5 h-4 w-4 opacity-50" />
          <input
            type="date"
            value={value.start || ''}
            onChange={(e) => onChange({ ...value, start: e.target.value })}
            disabled={disabled}
            className="w-full pl-8 pr-3 py-2 border rounded-md text-sm"
          />
        </div>
        <div className="flex-1 relative">
          <Calendar className="absolute left-2 top-2.5 h-4 w-4 opacity-50" />
          <input
            type="date"
            value={value.end || ''}
            onChange={(e) => onChange({ ...value, end: e.target.value })}
            disabled={disabled}
            className="w-full pl-8 pr-3 py-2 border rounded-md text-sm"
          />
        </div>
      </div>
    </div>
  );
}

function SliderControl({
  definition,
  value = 0,
  onChange,
  disabled,
  className,
}: {
  definition: FilterDefinition;
  value: number;
  onChange: (value: number) => void;
  disabled?: boolean;
  className?: string;
}) {
  return (
    <div className={cn('flex flex-col gap-2', className)}>
      <label className="text-sm font-medium">{definition.label}</label>
      <input
        type="range"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        disabled={disabled}
        className="w-full"
      />
      <span className="text-xs text-muted-foreground">{value}</span>
    </div>
  );
}

function TagsControl({
  definition,
  options,
  value = [],
  onChange,
  search,
  onSearchChange,
  disabled,
  className,
}: {
  definition: FilterDefinition;
  options: FilterOption[];
  value: any[];
  onChange: (value: any[]) => void;
  search: string;
  onSearchChange: (search: string) => void;
  disabled?: boolean;
  className?: string;
}) {
  return (
    <div className={cn('flex flex-col gap-2', className)}>
      <label className="text-sm font-medium">{definition.label}</label>
      <Input
        placeholder="Add tags..."
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
        disabled={disabled}
      />
      <div className="flex flex-wrap gap-1">
        {value.map((v, idx) => (
          <Badge key={idx} variant="secondary">
            {v}
          </Badge>
        ))}
      </div>
    </div>
  );
}
