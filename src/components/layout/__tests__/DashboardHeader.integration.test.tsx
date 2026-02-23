import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { DashboardHeader } from '../DashboardHeader';

// Mock DarkModeProvider and useDarkMode hook
let mockDarkMode = false;
const mockToggle = vi.fn(() => {
  mockDarkMode = !mockDarkMode;
});

vi.mock('@/components/providers/DarkModeProvider', () => ({
  useDarkMode: () => ({
    isDark: mockDarkMode,
    toggle: mockToggle,
    setDark: vi.fn((isDark: boolean) => {
      mockDarkMode = isDark;
    }),
  }),
  DarkModeProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

// Mock next-themes as fallback
let mockTheme = 'light';
const mockSetTheme = vi.fn((theme: string) => {
  mockTheme = theme;
});

vi.mock('next-themes', () => ({
  useTheme: () => ({
    theme: mockTheme,
    setTheme: mockSetTheme,
    resolvedTheme: mockTheme,
  }),
}));

// Mock sidebar trigger
vi.mock('@/components/ui/sidebar', () => ({
  SidebarTrigger: ({ className }: { className?: string }) => (
    <button className={className} data-testid="sidebar-trigger">
      Menu
    </button>
  ),
}));

// Mock separator
vi.mock('@/components/ui/separator', () => ({
  Separator: ({ orientation, className }: { orientation?: string; className?: string }) => (
    <div data-testid="separator" data-orientation={orientation} className={className} />
  ),
}));

// Mock button
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

// Mock tooltip
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

// Mock lucide icons
vi.mock('lucide-react', () => ({
  Moon: () => <span data-testid="moon-icon">Moon</span>,
  Sun: () => <span data-testid="sun-icon">Sun</span>,
  Bell: () => <span data-testid="bell-icon">Bell</span>,
}));

describe('DashboardHeader - Dark Mode Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockTheme = 'light';
    mockDarkMode = false;
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
      mockTheme = 'light';
      render(<DashboardHeader title="Test Page" />);

      expect(screen.getByTestId('moon-icon')).toBeInTheDocument();
    });

    it('should display sun icon in dark mode', () => {
      mockTheme = 'dark';
      render(<DashboardHeader title="Test Page" />);

      // Need to wait for component to mount
      waitFor(() => {
        expect(screen.getByTestId('sun-icon')).toBeInTheDocument();
      });
    });
  });

  describe('AC-3: Apply dark class on click', () => {
    it('should call setTheme when toggle button is clicked', () => {
      mockTheme = 'light';

      render(<DashboardHeader title="Test Page" />);

      const toggleButton = screen.getByRole('button', { name: /alternar tema/i });

      fireEvent.click(toggleButton);

      expect(mockSetTheme).toHaveBeenCalled();
    });

    it('should toggle to dark mode when in light mode', async () => {
      mockTheme = 'light';

      render(<DashboardHeader title="Test Page" />);

      const toggleButton = screen.getByRole('button', { name: /alternar tema/i });

      fireEvent.click(toggleButton);

      expect(mockSetTheme).toHaveBeenCalledWith('dark');
    });

    it('should toggle to light mode when in dark mode', () => {
      mockTheme = 'dark';

      render(<DashboardHeader title="Test Page" />);

      const toggleButton = screen.getByRole('button', { name: /alternar tema/i });

      fireEvent.click(toggleButton);

      expect(mockSetTheme).toHaveBeenCalledWith('light');
    });
  });

  describe('AC-6: Documentation via tooltips', () => {
    it('should show correct tooltip text for light mode', () => {
      mockTheme = 'light';
      render(<DashboardHeader title="Test Page" />);

      expect(screen.getByText('Tema escuro')).toBeInTheDocument();
    });

    it('should show correct tooltip text for dark mode', () => {
      mockTheme = 'dark';
      render(<DashboardHeader title="Test Page" />);

      expect(screen.getByText('Tema claro')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have accessible button for toggle', () => {
      render(<DashboardHeader title="Test Page" />);

      // Button is accessible via role and name
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

      expect(screen.getByTestId('bell-icon')).toBeInTheDocument();
    });
  });
});
