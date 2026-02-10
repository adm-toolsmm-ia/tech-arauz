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
}

interface KanbanBoardProps {
  columns: KanbanColumn[];
  items: KanbanItem[];
  onItemClick?: (item: KanbanItem) => void;
  onStatusChange?: (itemId: string | number, newStatus: string) => void;
  renderItemContent?: (item: KanbanItem) => React.ReactNode;
  emptyMessage?: string;
  className?: string;
}

// Priority styles
const priorityStyles: Record<string, string> = {
  urgente: 'bg-destructive/10 text-destructive border-destructive/20',
  alta: 'bg-warning/10 text-warning border-warning/20',
  normal: 'bg-primary/10 text-primary border-primary/20',
  baixa: 'bg-muted text-muted-foreground border-muted',
};

// Column header colors
const columnColors: Record<string, string> = {
  blue: 'border-l-blue-500',
  amber: 'border-l-amber-500',
  purple: 'border-l-purple-500',
  cyan: 'border-l-cyan-500',
  green: 'border-l-green-500',
  red: 'border-l-red-500',
  gray: 'border-l-gray-500',
};

// Drop indicator colors
const dropIndicatorColors: Record<string, string> = {
  blue: 'ring-blue-500/40',
  amber: 'ring-amber-500/40',
  purple: 'ring-purple-500/40',
  cyan: 'ring-cyan-500/40',
  green: 'ring-green-500/40',
  red: 'ring-red-500/40',
  gray: 'ring-gray-500/40',
};

// Default card content
function DefaultCardContent({ item }: { item: KanbanItem }) {
  return (
    <div className="space-y-2">
      <div className="flex items-start justify-between gap-2">
        <span className="font-medium line-clamp-2">{item.title}</span>
        {item.priority && (
          <Badge
            variant="outline"
            className={cn('shrink-0 text-[10px]', priorityStyles[item.priority])}
          >
            {item.priority}
          </Badge>
        )}
      </div>
      {item.subtitle && (
        <p className="text-sm text-muted-foreground line-clamp-1">
          {item.subtitle}
        </p>
      )}
      {item.value && (
        <div className="text-sm font-semibold text-primary">{item.value}</div>
      )}
    </div>
  );
}

// Draggable Card Component
function DraggableCard({
  item,
  onItemClick,
  renderItemContent,
}: {
  item: KanbanItem;
  onItemClick?: (item: KanbanItem) => void;
  renderItemContent?: (item: KanbanItem) => React.ReactNode;
}) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: item.id,
    data: { item },
  });

  return (
    <Card
      ref={setNodeRef}
      className={cn(
        'cursor-grab transition-all hover:shadow-md hover:border-primary/50',
        'active:cursor-grabbing active:scale-[0.98]',
        isDragging && 'opacity-30 scale-95 shadow-none'
      )}
      onClick={() => onItemClick?.(item)}
      {...listeners}
      {...attributes}
    >
      <CardContent className="p-3">
        {renderItemContent ? renderItemContent(item) : <DefaultCardContent item={item} />}
      </CardContent>
    </Card>
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
    <Card className="shadow-xl border-primary/50 ring-2 ring-primary/20 rotate-2 cursor-grabbing w-[260px]">
      <CardContent className="p-3">
        {renderItemContent ? renderItemContent(item) : <DefaultCardContent item={item} />}
      </CardContent>
    </Card>
  );
}

// Droppable Column Component
function DroppableColumn({
  column,
  items,
  isOver,
  onItemClick,
  renderItemContent,
}: {
  column: KanbanColumn;
  items: KanbanItem[];
  isOver: boolean;
  onItemClick?: (item: KanbanItem) => void;
  renderItemContent?: (item: KanbanItem) => React.ReactNode;
}) {
  const { setNodeRef } = useDroppable({
    id: column.id,
    data: { column },
  });

  const colorClass = columnColors[column.color] || columnColors.gray;
  const dropColor = dropIndicatorColors[column.color] || dropIndicatorColors.gray;

  return (
    <Card
      ref={setNodeRef}
      className={cn(
        'flex h-full flex-col border-l-4 transition-all duration-200',
        colorClass,
        isOver && `ring-2 ${dropColor} bg-muted/30 scale-[1.01]`
      )}
    >
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium">{column.title}</CardTitle>
          <Badge variant="secondary" className="h-6 rounded-full px-2.5">
            {items.length}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="flex-1 overflow-hidden p-2 pt-0">
        <ScrollArea className="h-full">
          <div className="space-y-2 p-1">
            {items.length === 0 ? (
              <div
                className={cn(
                  'py-8 text-center text-sm text-muted-foreground transition-colors',
                  isOver && 'text-primary font-medium'
                )}
              >
                {isOver ? 'Soltar aqui' : 'Nenhum item'}
              </div>
            ) : (
              items.map((item) => (
                <DraggableCard
                  key={item.id}
                  item={item}
                  onItemClick={onItemClick}
                  renderItemContent={renderItemContent}
                />
              ))
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

// Main Kanban Board Component
export function KanbanBoard({
  columns,
  items,
  onItemClick,
  onStatusChange,
  renderItemContent,
  emptyMessage = 'Nenhum item para exibir',
  className,
}: KanbanBoardProps) {
  const [activeItem, setActiveItem] = React.useState<KanbanItem | null>(null);
  const [overColumnId, setOverColumnId] = React.useState<string | null>(null);

  // Configure pointer sensor with activation constraints to distinguish click vs drag
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // 8px of movement before drag activates
      },
    })
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
    }
  };

  const handleDragCancel = () => {
    setActiveItem(null);
    setOverColumnId(null);
  };

  if (columns.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center text-muted-foreground">
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
      <div
        className={cn(
          'grid gap-4',
          columns.length === 1 && 'grid-cols-1',
          columns.length === 2 && 'grid-cols-1 md:grid-cols-2',
          columns.length === 3 && 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
          columns.length >= 4 && 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
          columns.length >= 5 && 'xl:grid-cols-5',
          className
        )}
        style={{ minHeight: '500px' }}
      >
        {columns.map((column) => (
          <DroppableColumn
            key={column.id}
            column={column}
            items={itemsByStatus[column.id] || []}
            isOver={overColumnId === column.id}
            onItemClick={onItemClick}
            renderItemContent={renderItemContent}
          />
        ))}
      </div>

      {/* Drag Overlay - floating card that follows cursor */}
      <DragOverlay dropAnimation={{
        duration: 200,
        easing: 'cubic-bezier(0.18, 0.67, 0.6, 1.22)',
      }}>
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
