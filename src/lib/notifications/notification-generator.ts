/**
 * Notification Generator
 * Generates notifications based on real project data
 */

import type { Notification, AlertType } from './types';

interface ProjectData {
  id: string;
  project_name: string;
  end_date: string | null;
  current_situation?: string | null;
  prazo_aprovador?: string | null;
  mensagem_movimentacao?: string | null;
}

/**
 * Check if project is overdue
 */
export function isProjectOverdue(endDate: string | null): boolean {
  if (!endDate) return false;
  return new Date(endDate) < new Date();
}

/**
 * Check if project is within 7 days
 */
export function isProjectNearDeadline(endDate: string | null): boolean {
  if (!endDate) return false;
  const now = new Date();
  const deadline = new Date(endDate);
  const daysUntil = (deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
  return daysUntil > 0 && daysUntil <= 7;
}

/**
 * Check if project has no recent movement
 */
export function hasNoRecentMovement(lastUpdate: string | null): boolean {
  if (!lastUpdate) return false;
  const days = (new Date().getTime() - new Date(lastUpdate).getTime()) / (1000 * 60 * 60 * 24);
  return days >= 30;
}

/**
 * Generate notifications from project data
 */
export function generateNotificationsFromProject(project: ProjectData): Notification[] {
  const notifications: Notification[] = [];
  const now = new Date();

  // 1. Check for overdue
  if (isProjectOverdue(project.end_date)) {
    notifications.push({
      id: `notif_${project.id}_overdue_${Date.now()}`,
      projectId: project.id,
      projectName: project.project_name,
      alertType: 'Atrasado',
      message: `Projeto atrasado desde ${new Date(project.end_date || '').toLocaleDateString('pt-BR')}`,
      createdAt: now,
    });
  }

  // 2. Check for near deadline (within 7 days)
  if (isProjectNearDeadline(project.end_date) && !isProjectOverdue(project.end_date)) {
    const deadline = new Date(project.end_date || '');
    const daysUntil = Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    notifications.push({
      id: `notif_${project.id}_risk_${Date.now()}`,
      projectId: project.id,
      projectName: project.project_name,
      alertType: 'Risco',
      message: `Prazo final em ${daysUntil} dia(s). Recomenda-se aceleração.`,
      createdAt: now,
    });
  }

  // 3. Check for pending approval
  if (
    project.current_situation &&
    (project.current_situation.toLowerCase().includes('aprova') ||
      project.current_situation.toLowerCase().includes('homolog'))
  ) {
    notifications.push({
      id: `notif_${project.id}_approval_${Date.now()}`,
      projectId: project.id,
      projectName: project.project_name,
      alertType: 'Aprovação Pendente',
      message: `Aguardando aprovação. Situação: ${project.current_situation}`,
      createdAt: now,
    });
  }

  // 4. Check for pending approver deadline
  if (project.prazo_aprovador && isProjectOverdue(project.prazo_aprovador)) {
    notifications.push({
      id: `notif_${project.id}_approver_deadline_${Date.now()}`,
      projectId: project.id,
      projectName: project.project_name,
      alertType: 'Entrega Vencida',
      message: `Prazo do aprovador vencido em ${new Date(project.prazo_aprovador).toLocaleDateString('pt-BR')}`,
      createdAt: now,
    });
  }

  return notifications;
}

/**
 * Deduplicate notifications (remove duplicates by alert type per project)
 */
export function deduplicateNotifications(
  notifications: Notification[],
): Notification[] {
  const seen = new Map<string, boolean>();
  return notifications.filter((notif) => {
    const key = `${notif.projectId}_${notif.alertType}`;
    if (seen.has(key)) return false;
    seen.set(key, true);
    return true;
  });
}
