/**
 * Notification Generator Tests
 */

import {
  isProjectOverdue,
  isProjectNearDeadline,
  hasNoRecentMovement,
  generateNotificationsFromProject,
  deduplicateNotifications,
} from '../notification-generator';

describe('Notification Generator', () => {
  describe('isProjectOverdue', () => {
    it('returns true for past dates', () => {
      const pastDate = new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(); // 1 day ago
      expect(isProjectOverdue(pastDate)).toBe(true);
    });

    it('returns false for future dates', () => {
      const futureDate = new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString(); // 1 day from now
      expect(isProjectOverdue(futureDate)).toBe(false);
    });

    it('returns false for null', () => {
      expect(isProjectOverdue(null)).toBe(false);
    });
  });

  describe('isProjectNearDeadline', () => {
    it('returns true for dates within 7 days', () => {
      const soonDate = new Date(Date.now() + 1000 * 60 * 60 * 24 * 3).toISOString(); // 3 days from now
      expect(isProjectNearDeadline(soonDate)).toBe(true);
    });

    it('returns false for dates more than 7 days away', () => {
      const laterDate = new Date(Date.now() + 1000 * 60 * 60 * 24 * 10).toISOString(); // 10 days from now
      expect(isProjectNearDeadline(laterDate)).toBe(false);
    });

    it('returns false for past dates', () => {
      const pastDate = new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString();
      expect(isProjectNearDeadline(pastDate)).toBe(false);
    });

    it('returns false for null', () => {
      expect(isProjectNearDeadline(null)).toBe(false);
    });
  });

  describe('generateNotificationsFromProject', () => {
    const baseProject = {
      id: 'proj_123',
      project_name: 'Test Project',
      end_date: null,
    };

    it('generates Atrasado notification for overdue projects', () => {
      const pastDate = new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString();
      const project = { ...baseProject, end_date: pastDate };

      const notifs = generateNotificationsFromProject(project);
      expect(notifs.length).toBeGreaterThan(0);
      expect(notifs[0].alertType).toBe('Atrasado');
    });

    it('generates Risco notification for near deadline', () => {
      const soonDate = new Date(Date.now() + 1000 * 60 * 60 * 24 * 3).toISOString();
      const project = { ...baseProject, end_date: soonDate };

      const notifs = generateNotificationsFromProject(project);
      const riskNotif = notifs.find((n) => n.alertType === 'Risco');
      expect(riskNotif).toBeDefined();
    });

    it('generates Aprovação Pendente for projects in approval', () => {
      const project = {
        ...baseProject,
        current_situation: 'Em aprovação',
      };

      const notifs = generateNotificationsFromProject(project);
      const approvalNotif = notifs.find((n) => n.alertType === 'Aprovação Pendente');
      expect(approvalNotif).toBeDefined();
    });

    it('generates Entrega Vencida for overdue approver deadline', () => {
      const pastDate = new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString();
      const project = {
        ...baseProject,
        prazo_aprovador: pastDate,
      };

      const notifs = generateNotificationsFromProject(project);
      const deliveryNotif = notifs.find((n) => n.alertType === 'Entrega Vencida');
      expect(deliveryNotif).toBeDefined();
    });
  });

  describe('deduplicateNotifications', () => {
    it('removes duplicate alert types for same project', () => {
      const notifs = [
        {
          id: '1',
          projectId: 'proj_1',
          projectName: 'Project 1',
          alertType: 'Atrasado' as const,
          message: 'Message 1',
          createdAt: new Date(),
        },
        {
          id: '2',
          projectId: 'proj_1',
          projectName: 'Project 1',
          alertType: 'Atrasado' as const,
          message: 'Message 2 (duplicate)',
          createdAt: new Date(),
        },
        {
          id: '3',
          projectId: 'proj_2',
          projectName: 'Project 2',
          alertType: 'Atrasado' as const,
          message: 'Message 3',
          createdAt: new Date(),
        },
      ];

      const deduped = deduplicateNotifications(notifs);
      expect(deduped.length).toBe(2);
      expect(deduped.every((n) => n.id !== '2')).toBe(true);
    });

    it('keeps different alert types for same project', () => {
      const notifs = [
        {
          id: '1',
          projectId: 'proj_1',
          projectName: 'Project 1',
          alertType: 'Atrasado' as const,
          message: 'Message 1',
          createdAt: new Date(),
        },
        {
          id: '2',
          projectId: 'proj_1',
          projectName: 'Project 1',
          alertType: 'Risco' as const,
          message: 'Message 2',
          createdAt: new Date(),
        },
      ];

      const deduped = deduplicateNotifications(notifs);
      expect(deduped.length).toBe(2);
    });
  });
});
