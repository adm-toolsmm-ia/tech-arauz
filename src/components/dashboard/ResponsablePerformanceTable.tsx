'use client';

import * as React from 'react';
import { ChevronUp, ChevronDown, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import type { PerformanceMetrics } from '@/app/dashboard/operacoes/actions';
import { ResponsableDetailModal } from './ResponsableDetailModal';
import { AdvancedFilters, type AdvancedFilterState } from './AdvancedFilters';

type SortField = keyof PerformanceMetrics;
type SortDirection = 'asc' | 'desc';

const ITEMS_PER_PAGE = 20;

interface ResponsablePerformanceTableProps {
  data: PerformanceMetrics[];
  loading?: boolean;
}

/**
 * ResponsablePerformanceTable: Organism component
 *
 * Displays team performance metrics with:
 * - Sortable columns (by any metric)
 * - Pagination (>20 rows)
 * - CSV export functionality
 * - Accessibility support (keyboard nav, ARIA labels)
 */
export function ResponsablePerformanceTable({
  data,
  loading = false,
}: ResponsablePerformanceTableProps) {
  const [sortField, setSortField] = React.useState<SortField>('total_movements');
  const [sortDirection, setSortDirection] = React.useState<SortDirection>('desc');
  const [currentPage, setCurrentPage] = React.useState(1);
  const [selectedPerson, setSelectedPerson] = React.useState<PerformanceMetrics | null>(null);
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [filters, setFilters] = React.useState<AdvancedFilterState>({
    status: 'all',
    completionRange: 'all',
    searchTerm: '',
  });

  const handleRowClick = (person: PerformanceMetrics) => {
    setSelectedPerson(person);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedPerson(null);
  };

  // Calculate performance status based on team averages
  const getPerformanceStatus = React.useCallback((person: PerformanceMetrics, teamAvg: number) => {
    if (teamAvg === 0) return 'above-avg';

    const delta = ((person.total_movements - teamAvg) / teamAvg) * 100;
    if (delta > 20) return 'high';
    if (delta > 0) return 'above-avg';
    return 'at-risk';
  }, []);

  // Calculate completion rate percentage
  const getCompletionRate = React.useCallback((person: PerformanceMetrics): number => {
    if (person.total_movements === 0) return 0;
    return Math.round((person.projects_completed / person.total_movements) * 100);
  }, []);

  // Filter data based on advanced filters
  const filteredData = React.useMemo(() => {
    const teamAvg =
      data.length > 0
        ? Math.round(data.reduce((sum, d) => sum + d.total_movements, 0) / data.length)
        : 0;

    return data.filter((person) => {
      // Status filter
      if (filters.status !== 'all') {
        const status = getPerformanceStatus(person, teamAvg);
        if (status !== filters.status) return false;
      }

      // Completion rate filter
      if (filters.completionRange !== 'all') {
        const completionRate = getCompletionRate(person);
        const [minRate, maxRate] = filters.completionRange.split('-').map((v) => parseInt(v, 10));

        if (completionRate < minRate || completionRate > maxRate) return false;
      }

      // Search term filter
      if (filters.searchTerm) {
        const searchLower = filters.searchTerm.toLowerCase();
        if (!person.responsible.toLowerCase().includes(searchLower)) {
          return false;
        }
      }

      return true;
    });
  }, [data, filters, getPerformanceStatus, getCompletionRate]);

  // Sort data
  const sortedData = React.useMemo(() => {
    const sorted = [...filteredData].sort((a, b) => {
      const aValue = a[sortField];
      const bValue = b[sortField];

      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
      }

      const aStr = String(aValue).toLowerCase();
      const bStr = String(bValue).toLowerCase();
      return sortDirection === 'asc' ? aStr.localeCompare(bStr) : bStr.localeCompare(aStr);
    });
    return sorted;
  }, [filteredData, sortField, sortDirection]);

  // Paginate data
  const totalPages = Math.ceil(sortedData.length / ITEMS_PER_PAGE);
  const paginatedData = React.useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    const end = start + ITEMS_PER_PAGE;
    return sortedData.slice(start, end);
  }, [sortedData, currentPage]);

  // Handle sort
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
    setCurrentPage(1);
  };

  // Export to CSV
  const handleExportCSV = () => {
    const headers = [
      'Responsável',
      'Movimentações',
      'Tempo Médio (dias)',
      'Projetos Concluídos',
      'Lead Time (dias)',
    ];

    const rows = sortedData.map((item) => [
      item.responsible,
      item.total_movements,
      item.average_duration_days,
      item.projects_completed,
      item.lead_time_average_days,
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(',')),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `performance-export-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  // Render sort indicator
  const SortIndicator = ({ field }: { field: SortField }) => {
    if (sortField !== field) return null;
    return sortDirection === 'asc' ? (
      <ChevronUp className="ml-1 inline h-4 w-4" aria-label="Ascendente" />
    ) : (
      <ChevronDown className="ml-1 inline h-4 w-4" aria-label="Descendente" />
    );
  };

  return (
    <div className="space-y-4">
      {/* Advanced Filters */}
      <AdvancedFilters
        value={filters}
        onChange={setFilters}
        activeCount={filteredData.length}
        totalCount={data.length}
      />

      {/* Export Button */}
      <div className="flex justify-end">
        <Button
          onClick={handleExportCSV}
          variant="outline"
          size="sm"
          disabled={sortedData.length === 0}
          aria-label="Exportar para CSV"
        >
          <Download className="mr-2 h-4 w-4" />
          Exportar CSV
        </Button>
      </div>

      {/* Table */}
      <div
        className="overflow-hidden rounded-lg border"
        role="region"
        aria-label="Tabela de performance"
      >
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead
                className="cursor-pointer hover:bg-muted"
                onClick={() => handleSort('responsible')}
              >
                Nome <SortIndicator field="responsible" />
              </TableHead>
              <TableHead
                className="cursor-pointer text-right hover:bg-muted"
                onClick={() => handleSort('total_movements')}
              >
                Movimentações <SortIndicator field="total_movements" />
              </TableHead>
              <TableHead
                className="cursor-pointer text-right hover:bg-muted"
                onClick={() => handleSort('average_duration_days')}
              >
                Tempo Médio (dias) <SortIndicator field="average_duration_days" />
              </TableHead>
              <TableHead
                className="cursor-pointer text-right hover:bg-muted"
                onClick={() => handleSort('projects_completed')}
              >
                Concluídos <SortIndicator field="projects_completed" />
              </TableHead>
              <TableHead
                className="cursor-pointer text-right hover:bg-muted"
                onClick={() => handleSort('lead_time_average_days')}
              >
                Lead Time (dias) <SortIndicator field="lead_time_average_days" />
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedData.map((item, idx) => (
              <TableRow
                key={`${item.responsible_id}-${idx}`}
                className="hover:bg-muted/50 cursor-pointer transition-colors"
                onClick={() => handleRowClick(item)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    handleRowClick(item);
                  }
                }}
              >
                <TableCell className="font-medium">{item.responsible}</TableCell>
                <TableCell className="text-right">{item.total_movements}</TableCell>
                <TableCell className="text-right">{item.average_duration_days}</TableCell>
                <TableCell className="text-right">{item.projects_completed}</TableCell>
                <TableCell className="text-right">{item.lead_time_average_days}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">
            Página {currentPage} de {totalPages}
          </span>
          <div className="space-x-2">
            <Button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              variant="outline"
              size="sm"
              aria-label="Página anterior"
            >
              Anterior
            </Button>
            <Button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              variant="outline"
              size="sm"
              aria-label="Próxima página"
            >
              Próxima
            </Button>
          </div>
        </div>
      )}

      {/* Empty State */}
      {sortedData.length === 0 && !loading && (
        <div className="py-8 text-center text-muted-foreground">
          Nenhum dado de performance disponível
        </div>
      )}

      {/* Drill-down Modal */}
      <ResponsableDetailModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        person={selectedPerson}
        allData={data}
      />
    </div>
  );
}
