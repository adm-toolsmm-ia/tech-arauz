import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';

interface SkeletonKPIProps {
  className?: string;
}

const SkeletonKPI: React.FC<SkeletonKPIProps> = ({ className }) => {
  return (
    <div className={cn('rounded-lg border bg-card p-6 shadow-soft', className)}>
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-8 w-16" />
          <Skeleton className="h-3 w-32" />
        </div>
        <Skeleton className="h-12 w-12 rounded-lg" />
      </div>
    </div>
  );
};

interface SkeletonKanbanCardProps {
  className?: string;
}

const SkeletonKanbanCard: React.FC<SkeletonKanbanCardProps> = ({ className }) => {
  return (
    <div className={cn('rounded-lg border border-border/40 bg-card p-3', className)}>
      <div className="space-y-2">
        {/* Título + Código */}
        <div className="space-y-1">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-3 w-12" />
        </div>

        {/* Alertas */}
        <div className="flex gap-1">
          <Skeleton className="h-5 w-12 rounded-full" />
          <Skeleton className="h-5 w-12 rounded-full" />
        </div>

        {/* Metadados essenciais */}
        <div className="space-y-1 border-t border-border/30 pt-2">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-3 w-28" />
        </div>

        {/* Rodapé status */}
        <div className="border-t border-border/30 pt-1.5">
          <Skeleton className="h-5 w-16 rounded-full" />
        </div>
      </div>
    </div>
  );
};

interface SkeletonTableRowProps {
  className?: string;
}

const SkeletonTableRow: React.FC<SkeletonTableRowProps> = ({ className }) => {
  return (
    <tr className={cn('border-b', className)}>
      <td className="px-3 py-3">
        <Skeleton className="mb-1 h-4 w-32" />
        <Skeleton className="h-3 w-20" />
      </td>
      <td className="px-3 py-3">
        <Skeleton className="h-3 w-16" />
      </td>
      <td className="px-3 py-3">
        <Skeleton className="h-3 w-20" />
      </td>
      <td className="px-3 py-3">
        <Skeleton className="h-3 w-24" />
      </td>
      <td className="px-3 py-3">
        <Skeleton className="h-5 w-14 rounded-full" />
      </td>
      <td className="px-3 py-3">
        <Skeleton className="h-3 w-16" />
      </td>
      <td className="px-3 py-3">
        <Skeleton className="h-5 w-12 rounded-full" />
      </td>
      <td className="px-3 py-3">
        <Skeleton className="h-5 w-12 rounded-full" />
      </td>
      <td className="px-3 py-3">
        <Skeleton className="h-3 w-28" />
      </td>
      <td className="px-3 py-3">
        <Skeleton className="h-5 w-16 rounded-full" />
      </td>
    </tr>
  );
};

export { SkeletonKPI, SkeletonKanbanCard, SkeletonTableRow };
