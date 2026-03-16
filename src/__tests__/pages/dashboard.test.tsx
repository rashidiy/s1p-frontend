import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';

// Mock apiClient
const mockGetMyDashboard = vi.fn();
vi.mock('@/lib/api', () => ({
  apiClient: {
    getMyDashboard: (...args: unknown[]) => mockGetMyDashboard(...args),
    getMyProfile: vi.fn(),
    getOwnerProfile: vi.fn(),
    logout: vi.fn(),
  },
}));

// Mock recharts
vi.mock('recharts', () => ({
  AreaChart: ({ children }: { children?: React.ReactNode }) => <div data-testid="area-chart">{children}</div>,
  Area: () => <div />,
  ResponsiveContainer: ({ children }: { children?: React.ReactNode }) => <div>{children}</div>,
  Tooltip: () => <div />,
}));

// Mock antd
vi.mock('antd', () => ({
  Button: ({ children, icon, ...props }: { children?: React.ReactNode; icon?: React.ReactNode; [key: string]: unknown }) => <button {...props}>{icon}{children}</button>,
  message: {
    error: vi.fn(),
    success: vi.fn(),
    warning: vi.fn(),
  },
}));

// Mock @ant-design/icons
vi.mock('@ant-design/icons', () => ({
  PhoneOutlined: () => <span>phone</span>,
  RiseOutlined: () => <span>rise</span>,
  FundProjectionScreenOutlined: () => <span>fund</span>,
  CheckSquareOutlined: () => <span>check</span>,
  TeamOutlined: () => <span>team</span>,
  InfoCircleOutlined: () => <span>info</span>,
  ArrowRightOutlined: () => <span>arrow</span>,
  FilterOutlined: () => <span>filter</span>,
  PlusOutlined: () => <span>plus</span>,
}));

// Mock next/link
vi.mock('next/link', () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

import { useAuthStore } from '@/store/auth';
import { UserRole } from '@/types/api';

// Import the component after all mocks
import DashboardPage from '@/app/(company)/dashboard/page';

beforeEach(() => {
  vi.clearAllMocks();
  useAuthStore.setState({
    user: {
      id: '1',
      email: 'test@example.com',
      first_name: 'Test',
      last_name: 'User',
      is_active: true,
      role: UserRole.COMPANY_OPERATOR,
    },
    userType: 'company_user',
    isAuthenticated: true,
    isInitializing: false,
    isOwner: false,
    isCompanyUser: true,
    permissions: [],
    mustChangePassword: false,
  });
});

describe('Dashboard Page', () => {
  it('renders loading state initially', () => {
    // getMyDashboard never resolves — stays loading
    mockGetMyDashboard.mockReturnValue(new Promise(() => {}));

    render(<DashboardPage />);

    // Loading state shows skeleton pulses (animate-pulse classes)
    const pulseElements = document.querySelectorAll('.animate-pulse');
    expect(pulseElements.length).toBeGreaterThan(0);
  });

  it('renders stat cards after data loads', async () => {
    const dashboardData = {
      this_month: {
        calls: { total_calls: 42, answered_calls: 30, missed_calls: 12, success_rate: 71.4 },
        leads: { total_leads: 15, converted_leads: 5, conversion_rate: 33.3 },
        deals: { total_deals: 8, total_value: 25000, won_deals: 3, lost_deals: 1 },
        tasks: { total_tasks: 20, completed_tasks: 14, overdue_tasks: 2 },
        total_activities: 85,
        productivity_score: 72,
      },
    };

    mockGetMyDashboard.mockResolvedValue(dashboardData);

    render(<DashboardPage />);

    // Wait for stat values to appear
    await vi.waitFor(() => {
      expect(screen.getByText('42')).toBeInTheDocument();
    });

    expect(screen.getByText('15')).toBeInTheDocument();
    expect(screen.getByText('8')).toBeInTheDocument();
    expect(screen.getByText('14')).toBeInTheDocument();
  });

  it('handles API error gracefully (shows error message, does not crash)', async () => {
    const { message } = await import('antd');

    mockGetMyDashboard.mockRejectedValue(new Error('Network error'));

    render(<DashboardPage />);

    // Wait for the error to be handled — page should show error state with retry
    await vi.waitFor(() => {
      expect(message.error).toHaveBeenCalledWith('failedToLoadDashboard');
    });

    // Page should show error state UI (not crash)
    await vi.waitFor(() => {
      // Error state shows "somethingWentWrong" text and "tryAgain" button
      expect(screen.getByText('somethingWentWrong')).toBeInTheDocument();
      expect(screen.getByText('tryAgain')).toBeInTheDocument();
    });
  });
});
