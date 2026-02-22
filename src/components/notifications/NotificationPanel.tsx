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
        'border-b border-sidebar-border p-3 cursor-pointer transition-all',
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
      <div className="flex gap-2 items-start">
        {/* Icon */}
        <span className="text-lg mt-0.5 flex-shrink-0">{alertCfg.icon}</span>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h4 className="font-semibold text-sm text-foreground truncate">
                {notification.projectName}
              </h4>
              <p className={cn('text-xs mt-0.5', alertCfg.color)}>
                {notification.alertType}
              </p>
            </div>

            {/* Remove button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onRemove(notification.id);
              }}
              className="text-muted-foreground hover:text-foreground flex-shrink-0 p-0.5"
              aria-label={`Remover notificação de ${notification.projectName}`}
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* Message */}
          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
            {notification.message}
          </p>

          {/* Timestamp */}
          <p className="text-xs text-muted-foreground/60 mt-1">
            {formatTimeAgo(notification.createdAt)}
          </p>
        </div>

        {/* Unread indicator */}
        {!isRead && <div className="h-2 w-2 rounded-full bg-red-500 mt-1.5 flex-shrink-0" />}
      </div>
    </div>
  );
}

export function NotificationPanel({ onClose }: NotificationPanelProps) {
  const router = useRouter();
  const { notifications, markAsRead, clearAll, removeNotification } = useNotifications();

  const handleNavigateToProject = (projectId: string) => {
    router.push(`/projetos?project=${projectId}`);
    onClose();
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="border-b border-sidebar-border p-4 flex items-center justify-between">
        <h2 className="font-semibold text-foreground">Notificações</h2>
        <button
          onClick={onClose}
          className="text-muted-foreground hover:text-foreground transition-colors p-1"
          aria-label="Fechar painel de notificações"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Notifications List */}
      <ScrollArea className="flex-1">
        {notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 gap-2 text-muted-foreground">
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
            className="w-full gap-2 text-destructive hover:text-destructive hover:bg-destructive/10"
            aria-label="Limpar todas as notificações"
          >
            <Trash2 className="h-4 w-4" />
            <span>Limpar tudo</span>
          </Button>
        </div>
      )}
    </div>
  );
}
