/**
 * NotificationBell Component Tests
 */

import { render, screen, fireEvent } from '@testing-library/react';
import { NotificationBell } from '../NotificationBell';
import { useNotifications } from '@/hooks/useNotifications';

// Mock the useNotifications hook
jest.mock('@/hooks/useNotifications', () => ({
  useNotifications: jest.fn(),
}));

describe('NotificationBell', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders bell icon', () => {
    (useNotifications as jest.Mock).mockReturnValue({
      notifications: [],
      unreadCount: 0,
      hasUnread: false,
    });

    render(<NotificationBell />);
    const button = screen.getByTestId('notification-bell');
    expect(button).toBeInTheDocument();
  });

  it('shows badge when there are unread notifications', () => {
    (useNotifications as jest.Mock).mockReturnValue({
      notifications: [],
      unreadCount: 3,
      hasUnread: true,
    });

    render(<NotificationBell />);
    const badge = screen.getByText('3');
    expect(badge).toBeInTheDocument();
  });

  it('shows 9+ when unread count is greater than 9', () => {
    (useNotifications as jest.Mock).mockReturnValue({
      notifications: [],
      unreadCount: 15,
      hasUnread: true,
    });

    render(<NotificationBell />);
    const badge = screen.getByText('9+');
    expect(badge).toBeInTheDocument();
  });

  it('toggles panel on button click', () => {
    (useNotifications as jest.Mock).mockReturnValue({
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
    (useNotifications as jest.Mock).mockReturnValue({
      notifications: [],
      unreadCount: 5,
      hasUnread: true,
    });

    render(<NotificationBell />);
    const button = screen.getByTestId('notification-bell');
    expect(button).toHaveAttribute('aria-label', 'Notificações (5 não lidas)');
  });
});
