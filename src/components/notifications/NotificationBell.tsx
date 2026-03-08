/**
 * NotificationBell Component
 * Bell icon with unread count badge and dropdown panel
 */

'use client';

import * as React from 'react';
import { Bell } from 'lucide-react';
import { useNotifications } from '@/hooks/useNotifications';
import { cn } from '@/lib/utils';
import { NotificationPanel } from './NotificationPanel';

interface NotificationBellProps {
  className?: string;
}

export const NotificationBell: React.FC<NotificationBellProps> = ({ className }) => {
  const [isPanelOpen, setIsPanelOpen] = React.useState(false);
  const { unreadCount, hasUnread } = useNotifications();
  const panelRef = React.useRef<HTMLDivElement>(null);
  const buttonRef = React.useRef<HTMLButtonElement>(null);

  // Close panel when clicking outside
  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        panelRef.current &&
        buttonRef.current &&
        !panelRef.current.contains(event.target as Node) &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsPanelOpen(false);
      }
    }

    if (isPanelOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isPanelOpen]);

  return (
    <div className={cn('relative', className)}>
      {/* Bell Icon Button */}
      <button
        ref={buttonRef}
        onClick={() => setIsPanelOpen(!isPanelOpen)}
        className={cn(
          'relative inline-flex items-center justify-center rounded-md p-2',
          'transition-colors hover:bg-accent',
          'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
          'text-foreground dark:text-sidebar-foreground',
        )}
        aria-label={`Notificações (${unreadCount} não lidas)`}
        aria-pressed={isPanelOpen}
        data-testid="notification-bell"
      >
        <Bell className="h-5 w-5" />

        {/* Badge with unread count */}
        {hasUnread && (
          <span
            className={cn(
              'absolute right-0 top-0 flex items-center justify-center',
              'h-5 w-5 rounded-full bg-red-500 text-[10px] font-semibold text-white',
            )}
            aria-label={`${unreadCount} notificações não lidas`}
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notification Panel */}
      {isPanelOpen && (
        <div
          ref={panelRef}
          className="fixed right-0 top-0 z-50 h-screen w-[280px] border-l border-sidebar-border bg-sidebar shadow-lg duration-300 animate-in slide-in-from-right-full md:w-[320px]"
        >
          <NotificationPanel onClose={() => setIsPanelOpen(false)} />
        </div>
      )}
    </div>
  );
};
