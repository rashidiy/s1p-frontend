import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';

// Mock apiClient
const mockGetMyDashboard = vi.fn();
const mockGetAdminDashboard = vi.fn();
const mockGetCallOutcomesSummary = vi.fn();
vi.mock('@/lib/api', () => ({
  apiClient: {
    getMyDashboard: (...args: unknown[]) => mockGetMyDashboard(...args),
    getAdminDashboard: (...args: unknown[]) => mockGetAdminDashboard(...args),
    getCallOutcomesSummary: (...args: unknown[]) => mockGetCallOutcomesSummary(...args),
    getMyProfile: vi.fn(),
    getOwnerProfile: vi.fn(),
    logout: vi.fn(),
  },
}));

// Mock antd
vi.mock('antd', () => ({
  Button: ({ children, onClick, ...props }: any) => (
    <button onClick={onClick} {...props}>{children}</button>
  ),
  Alert: ({ message: msg, description, ...props }: any) => (
    <div role="alert" {...props}>{msg} {description}</div>
  ),
  Spin: () => <div data-testid="spinner">Loading...</div>,
  Tabs: ({ items }: any) => (
    <div data-testid="tabs">
      {items?.map((item: any) => (
        <div key={item.key} data-testid={`tab-${item.key}`}>
          <span>{item.label}</span>
          {item.children}
        </div>
      ))}
    </div>
  ),
  message: {
    error: vi.fn(),
    success: vi.fn(),
  },
}));

// Mock @ant-design/icons
vi.mock('@ant-design/icons', () => ({
  PhoneOutlined: () => <span>phone-icon</span>,
  RiseOutlined: () => <span>rise-icon</span>,
  CheckSquareOutlined: () => <span>check-icon</span>,
  FundProjectionScreenOutlined: () => <span>fund-icon</span>,
  TeamOutlined: () => <span>team-icon</span>,
}));

// Mock illustrations
vi.mock('@/components/illustrations/ErrorCharacter', () => ({
  ErrorCharacter: () => <div data-testid="error-character" />,
}));

// Mock recharts - render simple divs instead
vi.mock('recharts', () => ({
  LineChart: ({ children }: any) => <div data-testid="line-chart">{children}</div>,
  Line: () => null,
  BarChart: ({ children }: any) => <div data-testid="bar-chart">{children}</div>,
  Bar: () => null,
  PieChart: ({ children }: any) => <div data-testid="pie-chart">{children}</div>,
  Pie: ({ children }: any) => <div>{children}</div>,
  Cell: () => null,
  XAxis: () => null,
  YAxis: () => null,
  CartesianGrid: () => null,
  Tooltip: () => null,
  Legend: () => null,
  ResponsiveContainer: ({ children }: any) => <div data-testid="chart-container">{children}</div>,
}));

import { useAuthStore } from '@/store/auth';
import { UserRole } from '@/types/api';
import AnalyticsPage from '@/app/(company)/analytics/page';

beforeEach(() => {
  vi.clearAllMocks();
  useAuthStore.setState({
    user: {
      id: '1',
      email: 'admin@test.com',
      first_name: 'Admin',
      last_name: 'User',
      is_active: true,
      role: UserRole.COMPANY_ADMIN,
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

const dashboardData = {
  this_month: {
    calls: { total_calls: 150, answered_calls: 120, success_rate: 80, average_duration: 185, inbound_calls: 90, outbound_calls: 60 },
    leads: { total_leads: 45, converted_leads: 12 },
    deals: { total_deals: 8, total_value: 25000 },
    tasks: { total_tasks: 30, completed_tasks: 22 },
    productivity_score: 78,
    total_activities: 200,
  },
};

const adminDashboardData = {
  this_month: {
    total_operators: 10,
    active_operators: 8,
    calls: { total_calls: 500, answered_calls: 400 },
    leads: { total_leads: 100, converted_leads: 30 },
    deals: { total_deals: 20, total_value: 80000, won: 15 },
    top_operators_by_calls: [
      { user_id: 'u1', name: 'Alice', calls: { total_calls: 80 }, leads: { total_leads: 20 }, productivity_score: 92 },
    ],
  },
};

describe('Analytics Page', () => {
  it('renders stat cards after data loads', async () => {
    mockGetMyDashboard.mockResolvedValue(dashboardData);
    mockGetAdminDashboard.mockResolvedValue(adminDashboardData);
    mockGetCallOutcomesSummary.mockResolvedValue({ by_outcome: {} });

    render(<AnalyticsPage />);

    await vi.waitFor(() => {
      expect(screen.getByText('150')).toBeInTheDocument();
    });

    // Stat cards show data
    expect(screen.getByText('45')).toBeInTheDocument();
    expect(screen.getByText('8')).toBeInTheDocument();
    expect(screen.getByText('22')).toBeInTheDocument();
  });

  it('shows error state with retry button', async () => {
    mockGetMyDashboard.mockRejectedValue(new Error('Network error'));
    mockGetCallOutcomesSummary.mockResolvedValue({ by_outcome: {} });

    render(<AnalyticsPage />);

    await vi.waitFor(() => {
      expect(screen.getByText('somethingWentWrong')).toBeInTheDocument();
    });

    expect(screen.getByTestId('error-character')).toBeInTheDocument();
    expect(screen.getByText('tryAgain')).toBeInTheDocument();
  });

  it('shows loading skeleton initially', () => {
    mockGetMyDashboard.mockReturnValue(new Promise(() => {}));
    mockGetCallOutcomesSummary.mockReturnValue(new Promise(() => {}));

    render(<AnalyticsPage />);

    const pulseElements = document.querySelectorAll('.animate-pulse');
    expect(pulseElements.length).toBeGreaterThan(0);
  });

  it('renders chart containers after load', async () => {
    mockGetMyDashboard.mockResolvedValue(dashboardData);
    mockGetAdminDashboard.mockResolvedValue(adminDashboardData);
    mockGetCallOutcomesSummary.mockResolvedValue({ by_outcome: { interested: 10, no_answer: 5 } });

    render(<AnalyticsPage />);

    await vi.waitFor(() => {
      expect(screen.getByText('150')).toBeInTheDocument();
    });

    // Chart containers are rendered
    const chartContainers = screen.getAllByTestId('chart-container');
    expect(chartContainers.length).toBeGreaterThan(0);
  });

  it('shows team tab for admin users', async () => {
    mockGetMyDashboard.mockResolvedValue(dashboardData);
    mockGetAdminDashboard.mockResolvedValue(adminDashboardData);
    mockGetCallOutcomesSummary.mockResolvedValue({ by_outcome: {} });

    render(<AnalyticsPage />);

    await vi.waitFor(() => {
      expect(screen.getByText('150')).toBeInTheDocument();
    });

    // Team tab renders with team data
    expect(screen.getByText('teamOverview')).toBeInTheDocument();
    expect(screen.getByTestId('tab-team')).toBeInTheDocument();
  });
});
