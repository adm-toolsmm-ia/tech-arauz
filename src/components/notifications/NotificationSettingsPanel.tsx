'use client';

import * as React from 'react';
import { Bell, Check, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';

interface NotificationCategory {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
}

interface NotificationSettingsPanelProps {
  onCategoryToggle?: (categoryId: string, enabled: boolean) => void;
  className?: string;
}

/**
 * NotificationSettingsPanel Component
 *
 * Features:
 * - Grouped notification categories
 * - Toggle switches for each category
 * - Clear descriptions
 * - Status indicators
 * - Responsive design
 * - Persistence (will be synced to DB in TASK 4.3)
 */
export function NotificationSettingsPanel({
  onCategoryToggle,
  className,
}: NotificationSettingsPanelProps) {
  const [categories, setCategories] = React.useState<NotificationCategory[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [hasChanges, setHasChanges] = React.useState(false);

  // Load notification preferences
  React.useEffect(() => {
    const loadPreferences = async () => {
      try {
        setIsLoading(true);

        // Try to fetch from API (if implemented)
        // For now, use defaults
        const defaults: NotificationCategory[] = [
          {
            id: 'project-updates',
            name: 'Project Updates',
            description: 'Receive updates when project status changes',
            enabled: true,
          },
          {
            id: 'assignments',
            name: 'Assignments',
            description: 'Get notified when you are assigned to a project',
            enabled: true,
          },
          {
            id: 'comments',
            name: 'Comments & Mentions',
            description: 'Receive notifications when someone mentions you',
            enabled: true,
          },
          {
            id: 'deadlines',
            name: 'Deadline Reminders',
            description: 'Be reminded about upcoming deadlines',
            enabled: true,
          },
          {
            id: 'system',
            name: 'System Alerts',
            description: 'Important system notifications and security alerts',
            enabled: true,
          },
          {
            id: 'team-activity',
            name: 'Team Activity',
            description: 'Stay informed about your team activities',
            enabled: false,
          },
        ];

        setCategories(defaults);
      } catch (error) {
        console.error('[NotificationSettingsPanel] Load error:', error);
        setCategories([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadPreferences();
  }, []);

  const handleToggle = React.useCallback(
    (categoryId: string, enabled: boolean) => {
      setCategories((prev) =>
        prev.map((cat) => (cat.id === categoryId ? { ...cat, enabled } : cat)),
      );
      setHasChanges(true);
      onCategoryToggle?.(categoryId, enabled);
    },
    [onCategoryToggle],
  );

  const handleSave = React.useCallback(async () => {
    try {
      // TODO: Save to API endpoint
      console.log('Saving preferences:', categories);
      setHasChanges(false);
    } catch (error) {
      console.error('[NotificationSettingsPanel] Save error:', error);
    }
  }, [categories]);

  if (isLoading) {
    return (
      <div className={cn('space-y-4 p-4', className)}>
        {[...Array(3)].map((_, i) => (
          <div key={i} className="space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-8 w-full" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className={cn('space-y-6 p-4', className)}>
      {/* Header */}
      <div className="flex items-center gap-2">
        <Bell className="text-primary h-5 w-5" />
        <h2 className="text-lg font-semibold">Configurações de Notificações</h2>
      </div>

      {/* Categories List */}
      <div className="space-y-4">
        {categories.map((category) => (
          <div
            key={category.id}
            className={cn(
              'flex items-start justify-between gap-4 p-3',
              'rounded-lg border border-border',
              'hover:bg-accent/30 transition-colors duration-150',
            )}
          >
            {/* Content */}
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <label
                  htmlFor={`notification-${category.id}`}
                  className="hover:text-primary cursor-pointer text-sm font-medium transition-colors"
                >
                  {category.name}
                </label>
                {category.enabled && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-xs text-green-800 dark:bg-green-900 dark:text-green-100">
                    <Check className="h-3 w-3" />
                    Ativo
                  </span>
                )}
                {!category.enabled && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-800 dark:bg-gray-800 dark:text-gray-100">
                    <X className="h-3 w-3" />
                    Desativo
                  </span>
                )}
              </div>
              <p className="mt-1 text-xs text-muted-foreground">{category.description}</p>
            </div>

            {/* Toggle Switch */}
            <div className="flex-shrink-0">
              <Switch
                id={`notification-${category.id}`}
                checked={category.enabled}
                onCheckedChange={(enabled) => handleToggle(category.id, enabled)}
                aria-label={`Ativar/desativar ${category.name}`}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Save Status */}
      {hasChanges && (
        <div className="flex items-center justify-between rounded-lg border border-blue-200 bg-blue-50 p-3 dark:border-blue-800 dark:bg-blue-950">
          <span className="text-sm text-blue-900 dark:text-blue-100">
            Você tem alterações não salvas
          </span>
          <button
            onClick={handleSave}
            className={cn(
              'rounded px-3 py-1 text-sm font-medium',
              'bg-primary text-primary-foreground hover:bg-primary/90',
              'transition-colors duration-150',
              'focus-visible:ring-primary focus:outline-none focus-visible:ring-2',
            )}
          >
            Salvar
          </button>
        </div>
      )}

      {/* Info */}
      <p className="text-center text-xs text-muted-foreground">
        As suas preferências de notificações serão sincronizadas em todos os seus dispositivos
      </p>
    </div>
  );
}
