/**
 * Filter System Types
 * Centralized type definitions for the standardized filter architecture
 */

/**
 * Filter control types supported by the system
 */
export type FilterControlType =
  | 'select'
  | 'multi-select'
  | 'date-range'
  | 'checkbox'
  | 'slider'
  | 'tags';

/**
 * Single filter option (for select/multi-select/checkbox)
 */
export interface FilterOption {
  value: string | number | boolean;
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
  badge?: string;
  disabled?: boolean;
}

/**
 * Configuration for a single filter control
 */
export interface FilterDefinition {
  id: string; // Unique identifier (e.g., 'status', 'priority', 'date_range')
  label: string; // Display name (e.g., 'Status', 'Priority', 'Data')
  type: FilterControlType; // How to render this filter
  options?: FilterOption[] | (() => FilterOption[]); // Available options (dynamic or static)
  placeholder?: string;
  icon?: React.ComponentType<{ className?: string }>;
  description?: string;
  group?: string; // For grouping in advanced filter sheet (e.g., 'status', 'dates', 'ownership')
  quickFilter?: boolean; // Show in quick filter bar (default: false)
  quickFilterLimit?: number; // Max options to show in quick bar (default: 3)
  defaultValue?: any;
  multi?: boolean; // For multi-select filters
  searchable?: boolean; // Allow searching options (default: true)
  clearable?: boolean; // Show clear button (default: true)
  sortOptions?: boolean; // Sort options alphabetically (default: false)
}

/**
 * Agenda period (when viewMode is 'agenda')
 */
export interface AgendaPeriod {
  id: string; // 'day' | 'week' | 'month'
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
}

/**
 * Filter configuration for a module
 * Defines all available filters for that module
 */
export interface FilterRegistry {
  moduleId: string; // e.g., 'projetos', 'cronogramas'
  filters: FilterDefinition[];
  searchable?: boolean; // Global search available (default: true)
  viewModes?: ViewMode[]; // Available view modes for this module
  agendaPeriods?: AgendaPeriod[]; // Periods when viewMode is 'agenda' (day, week, month)
}

/**
 * View mode configuration
 */
export interface ViewMode {
  id: string; // e.g., 'kanban', 'list', 'calendar'
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
  default?: boolean;
}

/**
 * Current state of filters
 */
export interface FilterState {
  [filterId: string]: any; // e.g., { status: ['iniciado', 'em-execucao'], priority: ['alta'] }
}

/**
 * Filter bar props
 */
export interface FilterBarProps {
  moduleId: string;
  filters: FilterRegistry;
  onFiltersChange: (filters: FilterState) => void;
  onSearchChange?: (search: string) => void;
  onViewModeChange?: (mode: string) => void;
  onAgendaPeriodChange?: (period: string) => void;
  initialFilters?: FilterState;
  initialSearch?: string;
  initialViewMode?: string;
  initialAgendaPeriod?: string;
  className?: string;
}

/**
 * Filter control props
 */
export interface FilterControlProps {
  definition: FilterDefinition;
  value: any;
  onChange: (value: any) => void;
  isLoading?: boolean;
  disabled?: boolean;
  className?: string;
}

/**
 * Filter utilities options (for applyFilters function)
 */
export interface ApplyFiltersOptions {
  search?: string;
  searchFields?: string[]; // Fields to search in
  caseSensitive?: boolean;
  matchMode?: 'exact' | 'partial' | 'fuzzy'; // Match strategy
}

/**
 * Active filter badge info
 */
export interface ActiveFilterInfo {
  count: number;
  summary: string; // e.g., "Status: Iniciado, Em execução"
}

/**
 * Filter persistence
 */
export interface FilterPersistenceConfig {
  enabled: boolean;
  storageKey?: string; // localStorage key (default: `filters-${moduleId}`)
  ttl?: number; // Time to live in ms (default: no expiry)
  include?: string[]; // Filter IDs to persist (default: all)
  exclude?: string[]; // Filter IDs to skip
}

/**
 * Module-specific filter hook return type
 */
export interface UseModuleFiltersReturn<T> {
  filters: FilterState;
  search: string;
  viewMode: string;
  setFilters: (filters: FilterState) => void;
  setSearch: (search: string) => void;
  setViewMode: (mode: string) => void;
  resetFilters: () => void;
  clearFilters: (filterIds?: string[]) => void;
  activeFilterCount: number;
  filteredData: T[];
  isLoading: boolean;
}

/**
 * Common filter operators for advanced filtering
 */
export enum FilterOperator {
  EQUALS = 'eq',
  NOT_EQUALS = 'ne',
  CONTAINS = 'contains',
  NOT_CONTAINS = 'not_contains',
  STARTS_WITH = 'starts_with',
  ENDS_WITH = 'ends_with',
  GREATER_THAN = 'gt',
  LESS_THAN = 'lt',
  GREATER_THAN_OR_EQUALS = 'gte',
  LESS_THAN_OR_EQUALS = 'lte',
  IN = 'in',
  NOT_IN = 'not_in',
  BETWEEN = 'between',
  IS_EMPTY = 'is_empty',
  IS_NOT_EMPTY = 'is_not_empty',
}
