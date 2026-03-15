/**
 * NotificationPanel Component
 * Displays list of notifications with actions
 */

'use client';

import * as React from 'react';
import { X, Trash2 } from 'lucide-react';
import { useNotifications } from '@/hooks/useNotifications';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { alertConfig } from '@/lib/notifications/types';
import type { Notification } from '@/lib/notifications/types';

interface NotificationPanelProps {
  onClose: () => void;
}

function formatTimeAgo(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - new Date(date).getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return 'Agora';
  if (diffMins < 60) return `há ${diffMins} min`;
  if (diffHours < 24) return `há ${diffHours}h`;
  if (diffDays < 30) return `há ${diffDays}d`;
  return new Date(date).toLocaleDateString('pt-BR');
}

function NotificationItem({
  notification,
  onNavigate,
  onMarkAsRead,
  onRemove,
}: {
  notification: Notification;
  onNavigate: (projectId: string) => void;
  onMarkAsRead: (id: string) => void;
  onRemove: (id: string) => void;
}) {
  const isRead = !!notification.readAt;
  const alertCfg = alertConfig[notification.alertType];

  return (
    <div
      className={cn(
        'cursor-pointer border-b border-sidebar-border p-3 transition-all',
        isRead ? 'opacity-60 hover:opacity-80' : 'hover:bg-sidebar-accent/50',
      )}
      role="button"
      tabIndex={0}
      onClick={() => {
        onNavigate(notification.projectId);
        if (!isRead) {
          onMarkAsRead(notification.id);
        }
      }}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          onNavigate(notification.projectId);
          if (!isRead) {
            onMarkAsRead(notification.id);
          }
        }
      }}
      data-testid={`notification-item-${notification.id}`}
    >
      <div className="flex items-start gap-2">
        {/* Icon */}
        <span className="mt-0.5 flex-shrink-0 text-lg">{alertCfg.icon}</span>

        {/* Content */}
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h4 className="truncate text-sm font-semibold text-foreground">
                {notification.projectName}
              </h4>
              <p className={cn('mt-0.5 text-xs', alertCfg.color)}>{notification.alertType}</p>
            </div>

            {/* Remove button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onRemove(notification.id);
              }}
              className="flex-shrink-0 p-0.5 text-muted-foreground hover:text-foreground"
              aria-label={`Remover notificação de ${notification.projectName}`}
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* Message */}
          <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{notification.message}</p>

          {/* Timestamp */}
          <p className="text-muted-foreground/60 mt-1 text-xs">
            {formatTimeAgo(notification.createdAt)}
          </p>
        </div>

        {/* Unread indicator */}
        {!isRead && <div className="mt-1.5 h-2 w-2 flex-shrink-0 rounded-full bg-red-500" />}
      </div>
    </div>
  );
}

export const NotificationPanel: React.FC<NotificationPanelProps> = ({ onClose }) => {
  const router = useRouter();
  const { notifications, markAsRead, clearAll, removeNotification } = useNotifications();

  const handleNavigateToProject = (projectId: string) => {
    router.push(`/projetos?project=${projectId}`);
    onClose();
  };

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-sidebar-border p-4">
        <h2 className="font-semibold text-foreground">Notificações</h2>
        <button
          onClick={onClose}
          className="p-1 text-muted-foreground transition-colors hover:text-foreground"
          aria-label="Fechar painel de notificações"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Notifications List */}
      <ScrollArea className="flex-1">
        {notifications.length === 0 ? (
          <div className="flex h-64 flex-col items-center justify-center gap-2 text-muted-foreground">
            <span className="text-3xl">✨</span>
            <p className="text-sm font-medium">Nenhuma notificação</p>
            <p className="text-xs">Você está em dia com tudo!</p>
          </div>
        ) : (
          <div className="divide-y divide-sidebar-border">
            {notifications.map((notification) => (
              <NotificationItem
                key={notification.id}
                notification={notification}
                onNavigate={handleNavigateToProject}
                onMarkAsRead={markAsRead}
                onRemove={removeNotification}
              />
            ))}
          </div>
        )}
      </ScrollArea>

      {/* Footer - Clear All Button */}
      {notifications.length > 0 && (
        <div className="border-t border-sidebar-border p-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={clearAll}
            className="hover:bg-destructive/10 w-full gap-2 text-destructive hover:text-destructive"
            aria-label="Limpar todas as notificações"
          >
            <Trash2 className="h-4 w-4" />
            <span>Limpar tudo</span>
          </Button>
        </div>
      )}
    </div>
  );
};
