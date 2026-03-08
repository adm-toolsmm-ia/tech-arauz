'use client';

import * as React from 'react';
import { Moon, Sun } from 'lucide-react';
import { useDarkMode } from '@/components/providers/DarkModeProvider';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { NotificationBell } from '@/components/notifications';

interface DashboardHeaderProps {
  title: string;
  subtitle?: string;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({ title, subtitle }) => {
  const { isDark, toggle } = useDarkMode();

  const toggleTheme = () => {
    toggle();
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center gap-4 border-b bg-background px-4">
      <SidebarTrigger className="-ml-1" />
      <Separator orientation="vertical" className="h-6" />

      {/* Title */}
      <div className="flex-1">
        <h1 className="text-lg font-semibold">{title}</h1>
        {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        {/* Notifications Bell */}
        <NotificationBell />

        {/* Theme Toggle */}
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" onClick={toggleTheme}>
                {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                <span className="sr-only">Alternar tema</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>{isDark ? 'Tema claro' : 'Tema escuro'}</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </header>
  );
};
