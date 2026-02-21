'use client';

import * as React from 'react';
import {
  DndContext,
  DragOverlay,
  useDraggable,
  useDroppable,
  PointerSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragEndEvent,
  type DragOverEvent,
} from '@dnd-kit/core';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { AlertTriangle } from 'lucide-react';

// Types
export interface KanbanItem {
  id: string | number;
  title: string;
  subtitle?: string;
  value?: string;
  priority?: 'urgente' | 'alta' | 'normal' | 'baixa';
  status: string;
  metadata?: Record<string, string | number>;
}

export interface KanbanColumn {
  id: string;
  title: string;
  color: string;
  wipLimit?: number;
}

interface KanbanBoardProps {
  columns: KanbanColumn[];
  items: KanbanItem[];
  selectedId?: string | number;
  onItemClick?: (item: KanbanItem) => void;
  onStatusChange?: (itemId: string | number, newStatus: string) => void;
  renderItemContent?: (item: KanbanItem) => React.ReactNode;
  emptyMessage?: string;
  className?: string;
}

import { priorityStyles } from '@/lib/constants/phase-labels';

// Column header colors (Clean accents)
const columnColors: Record<string, string> = {
  blue: 'border-t-blue-500', // Changed to Top border for cleaner look
  amber: 'border-t-amber-500',
  purple: 'border-t-purple-500',
  cyan: 'border-t-cyan-500',
  green: 'border-t-green-500',
  red: 'border-t-red-500',
  gray: 'border-t-gray-500',
};

// Drop indicator colors
const dropIndicatorColors: Record<string, string> = {
  blue: 'bg-blue-50/50 border-blue-200',
  amber: 'bg-amber-50/50 border-amber-200',
  purple: 'bg-purple-50/50 border-purple-200',
  cyan: 'bg-cyan-50/50 border-cyan-200',
  green: 'bg-green-50/50 border-green-200',
  red: 'bg-red-50/50 border-red-200',
  gray: 'bg-gray-50/50 border-gray-200',
};

// Format relative date helper
function formatRelativeDate(dateStr: string): string {
  try {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return 'Hoje';
    if (diffDays === 1) return 'Ontem';
    if (diffDays < 7) return `há ${diffDays} dias`;
    if (diffDays < 30) return `há ${Math.floor(diffDays / 7)} sem.`;
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
  } catch {
    return '';
  }
}

// Default card content (Compact Director's View)
function DefaultCardContent({ item }: { item: KanbanItem }) {
  const lastMessage = item.metadata?.mensagem as string | undefined;
  const lastDate = item.metadata?.data_movimentacao as string | undefined;

  return (
    <div className="space-y-1.5">
      <div className="flex items-start justify-between gap-2">
        <span className="line-clamp-2 text-sm font-semibold leading-tight text-foreground/90">
          {item.title}
        </span>
      </div>

      <div className="flex flex-col gap-1">
        {item.subtitle && (
          <p className="w-fit rounded bg-muted/30 px-1 font-mono text-[11px] text-muted-foreground">
            {item.subtitle}
          </p>
        )}

        <div className="mt-1 flex items-center justify-between">
          {item.value ? (
            <div className="text-xs font-medium text-success dark:text-success">
              {item.value}
            </div>
          ) : (
            <div />
          )}

          {item.priority && (
            <span
              className={cn(
                'rounded-full border px-1.5 py-0.5 text-[11px] font-medium uppercase tracking-wider',
                priorityStyles[item.priority],
              )}
            >
              {item.priority}
            </span>
          )}
        </div>

        {/* Última mensagem de movimentação */}
        {lastMessage && (
          <div className="mt-1.5 border-t border-border/30 pt-1.5">
            <p
              className="line-clamp-2 text-[11px] leading-relaxed text-muted-foreground"
              title={lastMessage}
            >
              {lastMessage}
            </p>
            {lastDate && (
              <p className="mt-0.5 text-[10px] text-muted-foreground/60">
                {formatRelativeDate(lastDate)}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// Draggable Card Component (Cards 2.0)
function DraggableCard({
  item,
  isSelected,
  onItemClick,
  renderItemContent,
}: {
  item: KanbanItem;
  isSelected?: boolean;
  onItemClick?: (item: KanbanItem) => void;
  renderItemContent?: (item: KanbanItem) => React.ReactNode;
}) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: item.id,
    data: { item },
  });

  return (
    <div
      ref={setNodeRef}
      className={cn(
        'group relative rounded-lg border border-border/40 bg-card shadow-sm transition-all duration-200',
        'hover:-translate-y-0.5 hover:border-primary/20 hover:shadow-md',
        'cursor-grab active:cursor-grabbing',
        'focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none',
        isDragging && 'scale-95 opacity-40 shadow-none grayscale',
        isSelected && 'ring-2 ring-primary ring-offset-1 border-primary/30',
      )}
      style={{ touchAction: 'none' }}
      {...listeners}
      {...attributes}
      onClick={() => onItemClick?.(item)}
      aria-roledescription="draggable item"
      aria-label={item.title}
    >
      <div className="p-3">
        {renderItemContent ? renderItemContent(item) : <DefaultCardContent item={item} />}
      </div>

      {/* Hover decoration */}
      <div className="absolute inset-x-0 bottom-0 h-0.5 rounded-b-lg bg-primary/0 transition-colors group-hover:bg-primary/10" />
    </div>
  );
}

// Drag Overlay Card (ghost that follows cursor)
function DragOverlayCard({
  item,
  renderItemContent,
}: {
  item: KanbanItem;
  renderItemContent?: (item: KanbanItem) => React.ReactNode;
}) {
  return (
    <div className="w-[260px] rotate-2 cursor-grabbing rounded-lg border border-primary/30 bg-card p-3 shadow-xl ring-2 ring-primary/10">
      {renderItemContent ? renderItemContent(item) : <DefaultCardContent item={item} />}
    </div>
  );
}

// Droppable Column Component (Clean & Modern)
function DroppableColumn({
  column,
  items,
  isOver,
  selectedId,
  onItemClick,
  renderItemContent,
}: {
  column: KanbanColumn;
  items: KanbanItem[];
  isOver: boolean;
  selectedId?: string | number;
  onItemClick?: (item: KanbanItem) => void;
  renderItemContent?: (item: KanbanItem) => React.ReactNode;
}) {
  const { setNodeRef } = useDroppable({
    id: column.id,
    data: { column },
  });

  const colorBorderClass = columnColors[column.color] || columnColors.gray;
  const dropStateClass = dropIndicatorColors[column.color] || dropIndicatorColors.gray;

  return (
    <div
      ref={setNodeRef}
      className={cn(
        'flex h-full flex-col rounded-xl border border-transparent bg-muted/20 transition-all duration-200',
        isOver && cn('scale-[1.01] border-dashed', dropStateClass),
      )}
    >
      {/* Header */}
      <div
        className={cn(
          'flex items-center justify-between rounded-t-xl border-t-2 bg-background/50 p-3 backdrop-blur-sm',
          colorBorderClass,
        )}
      >
        <h3 className="text-sm font-semibold tracking-tight text-foreground/80">{column.title}</h3>
        <div className="flex items-center gap-1">
          {column.wipLimit != null && items.length > column.wipLimit && (
            <span className="text-amber-500" title={`Limite WIP: ${column.wipLimit}`}>
              <AlertTriangle className="h-3.5 w-3.5" />
            </span>
          )}
          <span
            className={cn(
              'rounded-full px-2 py-0.5 text-[11px] font-bold',
              column.wipLimit != null && items.length > column.wipLimit
                ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300'
                : items.length > 0
                  ? 'bg-primary/10 text-primary'
                  : 'bg-muted text-muted-foreground',
            )}
          >
            {items.length}
          </span>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-hidden p-2">
        <ScrollArea className="h-full pr-2">
          <div className="flex flex-col gap-2 pb-2">
            {items.length === 0 ? (
              <div
                className={cn(
                  'flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted/40 px-4 py-12 text-center transition-colors',
                  isOver ? 'border-primary/30 bg-primary/5' : 'bg-transparent',
                )}
              >
                {isOver ? (
                  <span className="animate-pulse text-sm font-medium text-primary">
                    Solte para mover
                  </span>
                ) : (
                  <div className="space-y-1 opacity-50">
                    <div className="text-xs font-medium text-muted-foreground">Vazio</div>
                  </div>
                )}
              </div>
            ) : (
              items.map((item) => (
                <DraggableCard
                  key={item.id}
                  item={item}
                  isSelected={selectedId != null && item.id === selectedId}
                  onItemClick={onItemClick}
                  renderItemContent={renderItemContent}
                />
              ))
            )}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}

// Main Kanban Board Component
export function KanbanBoard({
  columns,
  items,
  selectedId,
  onItemClick,
  onStatusChange,
  renderItemContent,
  emptyMessage = 'Nenhum item para exibir',
  className,
}: KanbanBoardProps) {
  const [activeItem, setActiveItem] = React.useState<KanbanItem | null>(null);
  const [overColumnId, setOverColumnId] = React.useState<string | null>(null);
  const [announcement, setAnnouncement] = React.useState('');

  // Configure pointer sensor with activation constraints to distinguish click vs drag
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5, // Reduced for snappier feel
      },
    }),
  );

  // Group items by status
  const itemsByStatus = React.useMemo(() => {
    const grouped: Record<string, KanbanItem[]> = {};
    columns.forEach((col) => {
      grouped[col.id] = [];
    });
    items.forEach((item) => {
      if (grouped[item.status]) {
        grouped[item.status].push(item);
      }
    });
    return grouped;
  }, [columns, items]);

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const item = active.data.current?.item as KanbanItem | undefined;
    if (item) {
      setActiveItem(item);
    }
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { over } = event;
    if (over) {
      setOverColumnId(over.id as string);
    } else {
      setOverColumnId(null);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveItem(null);
    setOverColumnId(null);

    if (!over) return;

    const draggedItem = active.data.current?.item as KanbanItem | undefined;
    if (!draggedItem) return;

    const newStatus = over.id as string;

    // Only trigger if status actually changed
    if (draggedItem.status !== newStatus && onStatusChange) {
      onStatusChange(draggedItem.id, newStatus);
      const targetCol = columns.find((c) => c.id === newStatus);
      setAnnouncement(`${draggedItem.title} movido para ${targetCol?.title || newStatus}`);
    }
  };

  const handleDragCancel = () => {
    setActiveItem(null);
    setOverColumnId(null);
  };

  if (columns.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center rounded-xl border border-dashed border-muted bg-muted/10 p-8 text-muted-foreground">
        {emptyMessage}
      </div>
    );
  }

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <div className="sr-only" aria-live="polite" role="status">
        {announcement}
      </div>
      <div
        className={cn(
          'grid items-start gap-4',
          columns.length === 1 && 'grid-cols-1',
          columns.length === 2 && 'grid-cols-1 md:grid-cols-2',
          columns.length === 3 && 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
          columns.length >= 4 && 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
          columns.length >= 5 && 'xl:grid-cols-5',
          className,
        )}
        style={{ minHeight: 'calc(100vh - 200px)' }}
      >
        {columns.map((column) => (
          <DroppableColumn
            key={column.id}
            column={column}
            items={itemsByStatus[column.id] || []}
            isOver={overColumnId === column.id}
            selectedId={selectedId}
            onItemClick={onItemClick}
            renderItemContent={renderItemContent}
          />
        ))}
      </div>

      {/* Drag Overlay - floating card that follows cursor */}
      <DragOverlay
        dropAnimation={{
          duration: 250,
          easing: 'cubic-bezier(0.18, 0.67, 0.6, 1.22)',
        }}
      >
        {activeItem ? (
          <DragOverlayCard item={activeItem} renderItemContent={renderItemContent} />
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}

// Preset columns for project statuses (RF-004)
export const projectStatusColumns: KanbanColumn[] = [
  { id: 'projeto_futuro', title: 'Projeto Futuro', color: 'blue' },
  { id: 'em_aprovacao', title: 'Em Aprovação', color: 'amber' },
  { id: 'em_desenvolvimento', title: 'Em Desenvolvimento', color: 'purple' },
  { id: 'em_homologacao', title: 'Em Homologação', color: 'cyan' },
  { id: 'concluido', title: 'Concluído', color: 'green' },
];
