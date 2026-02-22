/**
 * Mock Notifications Data
 * For testing and development
 */

import type { Notification } from './types';

export const mockNotifications: Notification[] = [
  {
    id: 'notif_001',
    projectId: 'proj_123',
    projectName: 'Sistema de Autenticação',
    alertType: 'Atrasado',
    message: 'Projeto atrasado por 5 dias. Data final era 2026-02-20.',
    createdAt: new Date(Date.now() - 1000 * 60 * 15), // 15 mins ago
    readAt: undefined,
  },
  {
    id: 'notif_002',
    projectId: 'proj_456',
    projectName: 'Dashboard de Analytics',
    alertType: 'Risco',
    message: 'Prazo final em 3 dias. Recomenda-se aceleração da entrega.',
    createdAt: new Date(Date.now() - 1000 * 60 * 60), // 1 hour ago
    readAt: undefined,
  },
  {
    id: 'notif_003',
    projectId: 'proj_789',
    projectName: 'API de Integração Espaider',
    alertType: 'Aprovação Pendente',
    message: 'Aguardando aprovação do gestor. Enviado em 2026-02-21.',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
    readAt: new Date(Date.now() - 1000 * 60 * 30), // Read 30 mins ago
  },
  {
    id: 'notif_004',
    projectId: 'proj_321',
    projectName: 'Refatoração de Componentes',
    alertType: 'Entrega Vencida',
    message: 'Entrega de código estava marcada para 2026-02-15.',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
    readAt: new Date(Date.now() - 1000 * 60 * 60 * 23), // Read 23 hours ago
  },
  {
    id: 'notif_005',
    projectId: 'proj_654',
    projectName: 'Otimização de Performance',
    alertType: 'Risco',
    message: 'Apenas 2 dias para o prazo final de entrega.',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 3), // 3 hours ago
    readAt: undefined,
  },
];

export function generateMockNotification(): Notification {
  const alertTypes = ['Atrasado', 'Risco', 'Aprovação Pendente', 'Entrega Vencida'] as const;
  const projectNames = [
    'Portal de Gestão',
    'Dashboard de KPIs',
    'Sincronização Espaider',
    'Mobile App',
    'API Gateway',
  ];

  return {
    id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    projectId: `proj_${Math.random().toString(36).substr(2, 9)}`,
    projectName: projectNames[Math.floor(Math.random() * projectNames.length)],
    alertType: alertTypes[Math.floor(Math.random() * alertTypes.length)],
    message: `Notificação de teste gerada em ${new Date().toLocaleTimeString('pt-BR')}`,
    createdAt: new Date(),
    readAt: undefined,
  };
}
