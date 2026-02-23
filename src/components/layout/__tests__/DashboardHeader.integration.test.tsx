import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { DashboardHeader } from '../DashboardHeader';

let mockIsDark = false;
const mockToggle = vi.fn(() => {
  mockIsDark = !mockIsDark;
});

vi.mock('@/components/providers/DarkModeProvider', () => ({
  useDarkMode: () => ({
    isDark: mockIsDark,
    toggle: mockToggle,
    setDark: vi.fn((isDark: boolean) => {
      mockIsDark = isDark;
    }),
  }),
  DarkModeProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

vi.mock('@/components/ui/sidebar', () => ({
  SidebarTrigger: ({ className }: { className?: string }) => (
    <button className={className} data-testid="sidebar-trigger">
      Menu
    </button>
  ),
}));

vi.mock('@/components/ui/separator', () => ({
  Separator: ({ orientation, className }: { orientation?: string; className?: string }) => (
    <div data-testid="separator" data-orientation={orientation} className={className} />
  ),
}));

vi.mock('@/components/ui/button', () => ({
  Button: ({
    children,
    onClick,
    disabled,
    variant,
    size,
  }: {
    children?: React.ReactNode;
    onClick?: () => void;
    disabled?: boolean;
    variant?: string;
    size?: string;
  }) => (
    <button onClick={onClick} disabled={disabled} data-variant={variant} data-size={size}>
      {children}
    </button>
  ),
}));

vi.mock('@/components/ui/tooltip', () => ({
  Tooltip: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  TooltipTrigger: ({ children, asChild }: { children?: React.ReactNode; asChild?: boolean }) => (
    <div data-testid="tooltip-trigger">{children}</div>
  ),
  TooltipContent: ({ children }: { children?: React.ReactNode }) => (
    <div data-testid="tooltip-content">{children}</div>
  ),
  TooltipProvider: ({ children }: { children?: React.ReactNode }) => <div>{children}</div>,
}));

vi.mock('lucide-react', () => ({
  Moon: () => <span data-testid="moon-icon">Moon</span>,
  Sun: () => <span data-testid="sun-icon">Sun</span>,
}));

vi.mock('@/components/notifications', () => ({
  NotificationBell: () => <div data-testid="notification-bell">Bell</div>,
}));

describe('DashboardHeader - Dark Mode Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockIsDark = false;
  });

  describe('AC-2: Toggle button rendering', () => {
    it('should render theme toggle button', () => {
      render(<DashboardHeader title="Test Page" />);

      const toggleButton = screen.getByRole('button', { name: /alternar tema/i });
      expect(toggleButton).toBeInTheDocument();
    });

    it('should render with correct title', () => {
      render(<DashboardHeader title="Dashboard" subtitle="Welcome" />);

      expect(screen.getByText('Dashboard')).toBeInTheDocument();
      expect(screen.getByText('Welcome')).toBeInTheDocument();
    });
  });

  describe('AC-2: Display correct icon', () => {
    it('should display moon icon in light mode', () => {
      mockIsDark = false;
      render(<DashboardHeader title="Test Page" />);

      expect(screen.getByTestId('moon-icon')).toBeInTheDocument();
    });

    it('should display sun icon in dark mode', () => {
      mockIsDark = true;
      render(<DashboardHeader title="Test Page" />);

      expect(screen.getByTestId('sun-icon')).toBeInTheDocument();
    });
  });

  describe('AC-3: Apply dark class on click', () => {
    it('should call toggle when toggle button is clicked', () => {
      mockIsDark = false;
      render(<DashboardHeader title="Test Page" />);

      const toggleButton = screen.getByRole('button', { name: /alternar tema/i });
      fireEvent.click(toggleButton);

      expect(mockToggle).toHaveBeenCalled();
    });

    it('should toggle to dark mode when in light mode', () => {
      mockIsDark = false;
      render(<DashboardHeader title="Test Page" />);

      const toggleButton = screen.getByRole('button', { name: /alternar tema/i });
      fireEvent.click(toggleButton);

      expect(mockToggle).toHaveBeenCalled();
    });

    it('should toggle to light mode when in dark mode', () => {
      mockIsDark = true;
      render(<DashboardHeader title="Test Page" />);

      const toggleButton = screen.getByRole('button', { name: /alternar tema/i });
      fireEvent.click(toggleButton);

      expect(mockToggle).toHaveBeenCalled();
    });
  });

  describe('AC-6: Documentation via tooltips', () => {
    it('should show correct tooltip text for light mode', () => {
      mockIsDark = false;
      render(<DashboardHeader title="Test Page" />);

      expect(screen.getByText('Tema escuro')).toBeInTheDocument();
    });

    it('should show correct tooltip text for dark mode', () => {
      mockIsDark = true;
      render(<DashboardHeader title="Test Page" />);

      expect(screen.getByText('Tema claro')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have accessible button for toggle', () => {
      render(<DashboardHeader title="Test Page" />);

      const toggleButton = screen.getByRole('button', { name: /alternar tema/i });
      expect(toggleButton).toBeInTheDocument();
    });

    it('should have sr-only text', () => {
      render(<DashboardHeader title="Test Page" />);

      const screenReaderText = screen.getByText('Alternar tema');
      expect(screenReaderText).toHaveClass('sr-only');
    });
  });

  describe('Header structure', () => {
    it('should have sticky header', () => {
      const { container } = render(<DashboardHeader title="Test Page" />);

      const header = container.querySelector('header');
      expect(header).toHaveClass('sticky', 'top-0', 'z-30');
    });

    it('should display notifications button', () => {
      render(<DashboardHeader title="Test Page" />);

      expect(screen.getByTestId('notification-bell')).toBeInTheDocument();
    });
  });
});
