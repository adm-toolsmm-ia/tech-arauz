/**
 * NotificationSync Component
 * Syncs notifications with project data on mount
 * Wrap your app content with this to enable notification generation
 */

'use client';

import { ReactNode } from 'react';
import { useSyncNotifications } from '@/hooks/useSyncNotifications';

interface Project {
  id: string;
  project_name: string;
  end_date: string | null;
  updated_at?: string | null;
  current_situation?: string | null;
  prazo_aprovador?: string | null;
}

interface NotificationSyncProps {
  children: ReactNode;
  projects?: Project[];
}

export const NotificationSync: React.FC<NotificationSyncProps> = ({ children, projects = [] }) => {
  // This hook will generate notifications from projects on mount
  useSyncNotifications(projects);

  return <>{children}</>;
};
