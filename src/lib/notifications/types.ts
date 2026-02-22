/**
 * Notification Types & Interfaces
 * Defines all notification-related types for the system
 */

export type AlertType = 'Atrasado' | 'Risco' | 'Aprovação Pendente' | 'Entrega Vencida';

export interface Notification {
  id: string;
  projectId: string;
  projectName: string;
  alertType: AlertType;
  message: string;
  createdAt: Date;
  readAt?: Date;
}

export interface NotificationState {
  notifications: Notification[];
  addNotification: (notification: Omit<Notification, 'id' | 'createdAt'>) => void;
  markAsRead: (id: string) => void;
  clearAll: () => void;
  removeNotification: (id: string) => void;
  getUnreadCount: () => number;
}

/**
 * Alert configuration with colors and icons
 */
export const alertConfig: Record<AlertType, { color: string; bgColor: string; icon: string }> = {
  Atrasado: {
    color: 'text-red-600 dark:text-red-400',
    bgColor: 'bg-red-100 dark:bg-red-900/20',
    icon: '⚠️',
  },
  Risco: {
    color: 'text-amber-600 dark:text-amber-400',
    bgColor: 'bg-amber-100 dark:bg-amber-900/20',
    icon: '🔴',
  },
  'Aprovação Pendente': {
    color: 'text-blue-600 dark:text-blue-400',
    bgColor: 'bg-blue-100 dark:bg-blue-900/20',
    icon: '⏳',
  },
  'Entrega Vencida': {
    color: 'text-red-600 dark:text-red-400',
    bgColor: 'bg-red-100 dark:bg-red-900/20',
    icon: '📦',
  },
};
