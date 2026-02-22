/**
 * useSyncNotifications Hook
 * Syncs notifications with real project data on app load
 */

'use client';

import { useEffect, useRef } from 'react';
import { useNotifications } from './useNotifications';
import {
  generateNotificationsFromProject,
  deduplicateNotifications,
} from '@/lib/notifications/notification-generator';

interface ProjectData {
  id: string;
  project_name: string;
  end_date: string | null;
  updated_at?: string | null;
  current_situation?: string | null;
  prazo_aprovador?: string | null;
}

/**
 * Hook to sync notifications with project data
 * Runs once on mount to generate notifications from current projects
 */
export function useSyncNotifications(projects: ProjectData[] = []) {
  const { addNotification } = useNotifications();
  const syncedRef = useRef(false);

  useEffect(() => {
    // Only sync once per mount
    if (syncedRef.current || projects.length === 0) return;

    try {
      const allNotifications: any[] = [];

      // Generate notifications from each project
      projects.forEach((project) => {
        const projectNotifs = generateNotificationsFromProject(project);
        allNotifications.push(...projectNotifs);
      });

      // Deduplicate and add to store
      const uniqueNotifications = deduplicateNotifications(allNotifications);

      uniqueNotifications.forEach((notif) => {
        addNotification(notif.projectId, notif.projectName, notif.alertType, notif.message);
      });

      syncedRef.current = true;
    } catch (error) {
      console.error('Error syncing notifications:', error);
    }
  }, [projects, addNotification]);

  return { synced: syncedRef.current };
}
