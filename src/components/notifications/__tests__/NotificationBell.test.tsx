/**
 * NotificationBell Component Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { NotificationBell } from '../NotificationBell';
import { useNotifications } from '@/hooks/useNotifications';

// Mock the useNotifications hook
vi.mock('@/hooks/useNotifications', () => ({
  useNotifications: vi.fn(),
}));

describe('NotificationBell', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders bell icon', () => {
    (useNotifications as ReturnType<typeof vi.fn>).mockReturnValue({
      notifications: [],
      unreadCount: 0,
      hasUnread: false,
    });

    render(<NotificationBell />);
    const button = screen.getByTestId('notification-bell');
    expect(button).toBeInTheDocument();
  });

  it('shows badge when there are unread notifications', () => {
    (useNotifications as ReturnType<typeof vi.fn>).mockReturnValue({
      notifications: [],
      unreadCount: 3,
      hasUnread: true,
    });

    render(<NotificationBell />);
    const badge = screen.getByText('3');
    expect(badge).toBeInTheDocument();
  });

  it('shows 9+ when unread count is greater than 9', () => {
    (useNotifications as ReturnType<typeof vi.fn>).mockReturnValue({
      notifications: [],
      unreadCount: 15,
      hasUnread: true,
    });

    render(<NotificationBell />);
    const badge = screen.getByText('9+');
    expect(badge).toBeInTheDocument();
  });

  it('toggles panel on button click', () => {
    (useNotifications as ReturnType<typeof vi.fn>).mockReturnValue({
      notifications: [],
      unreadCount: 0,
      hasUnread: false,
    });

    render(<NotificationBell />);
    const button = screen.getByTestId('notification-bell');

    // Initially panel should not be visible
    expect(screen.queryByText('Notificações')).not.toBeInTheDocument();

    // Click to open
    fireEvent.click(button);
    expect(screen.getByText('Notificações')).toBeInTheDocument();

    // Click to close
    fireEvent.click(button);
    expect(screen.queryByText('Notificações')).not.toBeInTheDocument();
  });

  it('has correct aria labels', () => {
    (useNotifications as ReturnType<typeof vi.fn>).mockReturnValue({
      notifications: [],
      unreadCount: 5,
      hasUnread: true,
    });

    render(<NotificationBell />);
    const button = screen.getByTestId('notification-bell');
    expect(button).toHaveAttribute('aria-label', 'Notificações (5 não lidas)');
  });
});
