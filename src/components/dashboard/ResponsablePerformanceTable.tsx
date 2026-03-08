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

  // Sort data
  const sortedData = React.useMemo(() => {
    const sorted = [...data].sort((a, b) => {
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
  }, [data, sortField, sortDirection]);

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
      <ChevronUp className="w-4 h-4 inline ml-1" aria-label="Ascendente" />
    ) : (
      <ChevronDown className="w-4 h-4 inline ml-1" aria-label="Descendente" />
    );
  };

  return (
    <div className="space-y-4">
      {/* Export Button */}
      <div className="flex justify-end">
        <Button
          onClick={handleExportCSV}
          variant="outline"
          size="sm"
          disabled={sortedData.length === 0}
          aria-label="Exportar para CSV"
        >
          <Download className="w-4 h-4 mr-2" />
          Exportar CSV
        </Button>
      </div>

      {/* Table */}
      <div className="border rounded-lg overflow-hidden" role="region" aria-label="Tabela de performance">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="cursor-pointer hover:bg-muted" onClick={() => handleSort('responsible')}>
                Nome <SortIndicator field="responsible" />
              </TableHead>
              <TableHead
                className="text-right cursor-pointer hover:bg-muted"
                onClick={() => handleSort('total_movements')}
              >
                Movimentações <SortIndicator field="total_movements" />
              </TableHead>
              <TableHead
                className="text-right cursor-pointer hover:bg-muted"
                onClick={() => handleSort('average_duration_days')}
              >
                Tempo Médio (dias) <SortIndicator field="average_duration_days" />
              </TableHead>
              <TableHead
                className="text-right cursor-pointer hover:bg-muted"
                onClick={() => handleSort('projects_completed')}
              >
                Concluídos <SortIndicator field="projects_completed" />
              </TableHead>
              <TableHead
                className="text-right cursor-pointer hover:bg-muted"
                onClick={() => handleSort('lead_time_average_days')}
              >
                Lead Time (dias) <SortIndicator field="lead_time_average_days" />
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedData.map((item, idx) => (
              <TableRow key={`${item.responsible_id}-${idx}`} className="hover:bg-muted/50">
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
        <div className="flex justify-between items-center text-sm">
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
        <div className="text-center py-8 text-muted-foreground">
          Nenhum dado de performance disponível
        </div>
      )}
    </div>
  );
}
