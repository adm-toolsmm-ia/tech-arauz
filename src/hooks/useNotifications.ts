/**
 * useNotifications Hook
 * Provides convenient access to notification store methods
 */

'use client';

import { useNotificationStore } from '@/lib/notifications/store';
import type { Notification, AlertType } from '@/lib/notifications/types';

export function useNotifications() {
  const notifications = useNotificationStore((state) => state.notifications);
  const addNotification = useNotificationStore((state) => state.addNotification);
  const markAsRead = useNotificationStore((state) => state.markAsRead);
  const clearAll = useNotificationStore((state) => state.clearAll);
  const removeNotification = useNotificationStore((state) => state.removeNotification);
  const getUnreadCount = useNotificationStore((state) => state.getUnreadCount);

  return {
    notifications,
    unreadCount: getUnreadCount(),
    addNotification: (
      projectId: string,
      projectName: string,
      alertType: AlertType,
      message: string,
    ) => {
      addNotification({
        projectId,
        projectName,
        alertType,
        message,
        readAt: undefined,
      });
    },
    markAsRead,
    clearAll,
    removeNotification,
    hasUnread: getUnreadCount() > 0,
  };
}
