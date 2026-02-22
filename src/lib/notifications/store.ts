/**
 * Notification Store (Zustand)
 * Manages notification state with localStorage persistence
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Notification, NotificationState } from './types';

const generateId = () => `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

export const useNotificationStore = create<NotificationState>()(
  persist(
    (set, get) => ({
      notifications: [],

      addNotification: (notification) =>
        set((state) => ({
          notifications: [
            {
              ...notification,
              id: generateId(),
              createdAt: new Date(),
            },
            ...state.notifications,
          ],
        })),

      markAsRead: (id) =>
        set((state) => ({
          notifications: state.notifications.map((notif) =>
            notif.id === id ? { ...notif, readAt: new Date() } : notif,
          ),
        })),

      clearAll: () => set({ notifications: [] }),

      removeNotification: (id) =>
        set((state) => ({
          notifications: state.notifications.filter((notif) => notif.id !== id),
        })),

      getUnreadCount: () => {
        const state = get();
        return state.notifications.filter((notif) => !notif.readAt).length;
      },
    }),
    {
      name: 'tech-arauz-notifications',
      version: 1,
      migrate: (persistedState: any, version: number) => {
        // Handle any schema migrations here
        if (version === 1) {
          return persistedState as NotificationState;
        }
        return persistedState;
      },
    },
  ),
);
