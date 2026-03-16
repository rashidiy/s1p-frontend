import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';

// Mock apiClient
const mockGetOwnerDashboard = vi.fn();
vi.mock('@/lib/api', () => ({
  apiClient: {
    getOwnerDashboard: (...args: unknown[]) => mockGetOwnerDashboard(...args),
    getMyProfile: vi.fn(),
    getOwnerProfile: vi.fn(),
    logout: vi.fn(),
  },
}));

// Mock next-intl with t.rich support
vi.mock('next-intl', () => ({
  useTranslations: () => {
    const t = (key: string, params?: Record<string, any>) => {
      if (params) {
        let result = key;
        Object.entries(params).forEach(([k, v]) => {
          result = result.replace(`{${k}}`, String(v));
        });
        return result;
      }
      return key;
    };
    t.rich = (key: string, params?: Record<string, any>) => {
      if (params) {
        let result = key;
        Object.entries(params).forEach(([k, v]) => {
          if (typeof v !== 'function') {
            result = result.replace(`{${k}}`, String(v));
          }
        });
        return result;
      }
      return key;
    };
    return t;
  },
  useLocale: () => 'en',
}));

// Mock antd
vi.mock('antd', () => ({
  Button: ({ children, onClick, icon, ...props }: any) => (
    <button onClick={onClick} {...props}>{icon}{children}</button>
  ),
  message: {
    error: vi.fn(),
    success: vi.fn(),
    warning: vi.fn(),
  },
}));

// Mock @ant-design/icons
vi.mock('@ant-design/icons', () => ({
  BankOutlined: () => <span>bank</span>,
  TeamOutlined: () => <span>team</span>,
  ThunderboltOutlined: () => <span>thunderbolt</span>,
  RiseOutlined: () => <span>rise</span>,
  PlusOutlined: () => <span>plus</span>,
}));

// Mock next/link
vi.mock('next/link', () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

// Mock illustrations
vi.mock('@/components/illustrations', () => ({
  WelcomeCharacter: (props: any) => <div data-testid="welcome-character" />,
  ErrorCharacter: (props: any) => <div data-testid="error-character" />,
}));

import { useAuthStore } from '@/store/auth';
import OwnerDashboardPage from '@/app/owner/dashboard/page';

beforeEach(() => {
  vi.clearAllMocks();
  useAuthStore.setState({
    user: {
      id: 'owner-1',
      email: 'owner@example.com',
      first_name: 'Admin',
      last_name: 'Owner',
      is_active: true,
    },
    userType: 'owner',
    isAuthenticated: true,
    isInitializing: false,
    isOwner: true,
    isCompanyUser: false,
    permissions: [],
    mustChangePassword: false,
  });
});

describe('Owner Dashboard Page', () => {
  it('renders loading skeleton initially', () => {
    mockGetOwnerDashboard.mockReturnValue(new Promise(() => {}));

    render(<OwnerDashboardPage />);

    const pulseElements = document.querySelectorAll('.animate-pulse');
    expect(pulseElements.length).toBeGreaterThan(0);
  });

  it('renders dashboard with company stats after data loads', async () => {
    const dashboardData = {
      this_month: {
        total_companies: 12,
        active_companies: 10,
        total_users: 45,
        total_calls: 320,
        total_revenue: 5000,
        total_leads: 80,
        total_deals: 25,
        new_companies: 3,
        new_users: 8,
        top_companies: [
          { company_id: 'c1', company_name: 'Acme Corp', total_calls: 120 },
          { company_id: 'c2', company_name: 'Beta Inc', total_calls: 80 },
        ],
      },
    };

    mockGetOwnerDashboard.mockResolvedValue(dashboardData);

    render(<OwnerDashboardPage />);

    await vi.waitFor(() => {
      expect(screen.getByText('12')).toBeInTheDocument();
    });

    expect(screen.getByText('45')).toBeInTheDocument();
    expect(screen.getByText('320')).toBeInTheDocument();
    expect(screen.getByText('$5,000')).toBeInTheDocument();
  });

  it('renders top companies list', async () => {
    const dashboardData = {
      this_month: {
        total_companies: 5,
        active_companies: 4,
        total_users: 20,
        total_calls: 100,
        total_revenue: 2000,
        total_leads: 30,
        total_deals: 10,
        new_companies: 1,
        new_users: 3,
        top_companies: [
          { company_id: 'c1', company_name: 'Acme Corp', total_calls: 50 },
        ],
      },
    };

    mockGetOwnerDashboard.mockResolvedValue(dashboardData);

    render(<OwnerDashboardPage />);

    await vi.waitFor(() => {
      expect(screen.getByText('Acme Corp')).toBeInTheDocument();
    });
  });

  it('shows error state on API failure', async () => {
    const { message } = await import('antd');

    mockGetOwnerDashboard.mockRejectedValue(new Error('Network error'));

    render(<OwnerDashboardPage />);

    await vi.waitFor(() => {
      expect(message.error).toHaveBeenCalledWith('errors.failedToLoadDashboard');
    });

    await vi.waitFor(() => {
      expect(screen.getByText('errors.somethingWentWrong')).toBeInTheDocument();
      expect(screen.getByText('actions.tryAgain')).toBeInTheDocument();
    });
  });

  it('retries loading when Try Again is clicked', async () => {
    mockGetOwnerDashboard.mockRejectedValueOnce(new Error('Network error'));

    render(<OwnerDashboardPage />);

    await vi.waitFor(() => {
      expect(screen.getByText('actions.tryAgain')).toBeInTheDocument();
    });

    // Now resolve on retry
    mockGetOwnerDashboard.mockResolvedValue({
      this_month: {
        total_companies: 77,
        active_companies: 60,
        total_users: 200,
        total_calls: 500,
        total_revenue: 9999,
        total_leads: 150,
        total_deals: 40,
        new_companies: 10,
        new_users: 20,
        top_companies: [],
      },
    });

    fireEvent.click(screen.getByText('actions.tryAgain'));

    await vi.waitFor(() => {
      expect(screen.getByText('77')).toBeInTheDocument();
    });

    expect(mockGetOwnerDashboard).toHaveBeenCalledTimes(2);
  });
});
