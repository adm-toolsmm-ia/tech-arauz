/**
 * NotificationTester Component
 * Dev-only component for testing notification system
 * To be removed before production
 */

'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { useNotifications } from '@/hooks/useNotifications';
import { generateMockNotification } from '@/lib/notifications/mock-data';

export function NotificationTester() {
  const { addNotification } = useNotifications();

  const handleAddMockNotification = () => {
    const mockNotif = generateMockNotification();
    addNotification(mockNotif.projectId, mockNotif.projectName, mockNotif.alertType, mockNotif.message);
  };

  const handleAddSpecificNotification = (alertType: string) => {
    const projectNames = ['Sistema de Auth', 'Dashboard Analytics', 'API Espaider', 'Mobile App'];
    const projectName = projectNames[Math.floor(Math.random() * projectNames.length)];

    addNotification(
      `proj_${Math.random().toString(36).substr(2, 9)}`,
      projectName,
      alertType as any,
      `Notificação de tipo ${alertType} para ${projectName}`,
    );
  };

  // Only show in development
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 p-4 bg-primary/10 border border-primary rounded-lg shadow-lg z-40 max-w-xs">
      <p className="text-xs font-semibold mb-2 text-primary">Notification Tester (Dev Only)</p>
      <div className="space-y-2">
        <Button
          size="sm"
          variant="outline"
          onClick={handleAddMockNotification}
          className="w-full"
        >
          Add Random
        </Button>
        <div className="grid grid-cols-2 gap-1">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => handleAddSpecificNotification('Atrasado')}
            className="text-xs"
          >
            Atrasado
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => handleAddSpecificNotification('Risco')}
            className="text-xs"
          >
            Risco
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => handleAddSpecificNotification('Aprovação Pendente')}
            className="text-xs"
          >
            Aprovação
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => handleAddSpecificNotification('Entrega Vencida')}
            className="text-xs"
          >
            Entrega
          </Button>
        </div>
      </div>
    </div>
  );
}
