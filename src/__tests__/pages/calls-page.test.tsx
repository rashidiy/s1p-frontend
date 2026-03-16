import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';

// Mock apiClient
const mockGetCallHistory = vi.fn();
vi.mock('@/lib/api', () => ({
  apiClient: {
    getCallHistory: (...args: unknown[]) => mockGetCallHistory(...args),
    getCallRecording: vi.fn(),
    setCallOutcome: vi.fn(),
    getMyProfile: vi.fn(),
    getOwnerProfile: vi.fn(),
    logout: vi.fn(),
  },
}));

// Mock antd
vi.mock('antd', () => ({
  Button: ({ children, onClick, icon, ...props }: any) => (
    <button onClick={onClick} {...props}>{icon}{children}</button>
  ),
  Input: ({ value, onChange, placeholder, ...props }: any) => (
    <input value={value} onChange={onChange} placeholder={placeholder} {...props} />
  ),
  Select: ({ value, onChange, options, placeholder, ...props }: any) => (
    <select value={value} onChange={(e: any) => onChange?.(e.target.value)} {...props}>
      <option value="">{placeholder}</option>
      {options?.map((o: any) => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  ),
  Tag: ({ children, ...props }: any) => <span {...props}>{children}</span>,
  DatePicker: ({ value, onChange, ...props }: any) => (
    <input type="date" {...props} />
  ),
  Pagination: ({ current, total, onChange }: any) => (
    <div data-testid="pagination">Page {current}</div>
  ),
  Checkbox: ({ children, checked, onChange, ...props }: any) => (
    <label><input type="checkbox" checked={checked} onChange={onChange} {...props} />{children}</label>
  ),
  message: {
    error: vi.fn(),
    success: vi.fn(),
    warning: vi.fn(),
  },
}));

// Mock @ant-design/icons
vi.mock('@ant-design/icons', () => ({
  PhoneOutlined: () => <span>phone-icon</span>,
  PlayCircleOutlined: () => <span>play-icon</span>,
  ClockCircleOutlined: () => <span>clock-icon</span>,
}));

// Mock custom icons
vi.mock('@/components/icons/custom-icons', () => ({
  PhoneIncoming: () => <span>phone-in</span>,
  PhoneOutgoing: () => <span>phone-out</span>,
}));

// Mock illustrations
vi.mock('@/components/illustrations', () => ({
  EmptyStateCharacter: () => <div data-testid="empty-state" />,
  ErrorCharacter: () => <div data-testid="error-character" />,
}));

// Mock dayjs
vi.mock('dayjs', () => {
  const dayjs = (val?: any) => ({
    format: () => val || '',
  });
  dayjs.default = dayjs;
  return { default: dayjs };
});

// Mock constants
vi.mock('@/lib/constants', () => ({
  CALL_DIRECTION_LABELS: { inbound: 'Inbound', outbound: 'Outbound' },
  CALL_DIRECTION_COLORS: { inbound: 'green', outbound: 'blue' },
  CALL_STATUS_LABELS: { answered: 'Answered', missed: 'Missed' },
  CALL_STATUS_COLORS: { answered: 'green', missed: 'red' },
  CALL_DIRECTION_OPTIONS: [
    { label: 'Inbound', value: 'inbound' },
    { label: 'Outbound', value: 'outbound' },
  ],
}));

// Mock next/link
vi.mock('next/link', () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

import { useAuthStore } from '@/store/auth';
import { UserRole } from '@/types/api';
import CallsPage from '@/app/(company)/calls/page';

beforeEach(() => {
  vi.clearAllMocks();
  useAuthStore.setState({
    user: {
      id: '1',
      email: 'test@example.com',
      first_name: 'Test',
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

describe('Calls Page', () => {
  it('renders loading state initially', () => {
    mockGetCallHistory.mockReturnValue(new Promise(() => {}));

    render(<CallsPage />);

    const pulseElements = document.querySelectorAll('.animate-pulse');
    expect(pulseElements.length).toBeGreaterThan(0);
  });

  it('renders call list after data loads', async () => {
    mockGetCallHistory.mockResolvedValue({
      items: [
        {
          id: 'call-1',
          phone_1: '+1234567890',
          phone_2: '+0987654321',
          direction: 'inbound',
          state: 'answered',
          billing_sec: 125,
          outcome: null,
          has_recording: true,
          created_at: '2025-01-15T10:00:00Z',
        },
        {
          id: 'call-2',
          phone_1: '+1111111111',
          phone_2: '+2222222222',
          direction: 'outbound',
          state: 'answered',
          billing_sec: 60,
          outcome: 'interested',
          has_recording: false,
          created_at: '2025-01-14T10:00:00Z',
        },
      ],
      total: 2,
      page: 1,
      page_size: 20,
      total_pages: 1,
    });

    render(<CallsPage />);

    await vi.waitFor(() => {
      expect(screen.getByText(/\+1234567890/)).toBeInTheDocument();
    });

    expect(screen.getByText(/\+0987654321/)).toBeInTheDocument();
    expect(screen.getByText(/\+1111111111/)).toBeInTheDocument();
  });

  it('shows filter controls', async () => {
    mockGetCallHistory.mockResolvedValue({
      items: [],
      total: 0,
      page: 1,
      page_size: 20,
      total_pages: 0,
    });

    render(<CallsPage />);

    await vi.waitFor(() => {
      expect(screen.getByText('direction')).toBeInTheDocument();
    });

    expect(screen.getByText('outcome')).toBeInTheDocument();
    expect(screen.getByText('from')).toBeInTheDocument();
    expect(screen.getByText('to')).toBeInTheDocument();
    expect(screen.getByText('myCalls')).toBeInTheDocument();
  });

  it('shows error state on failure', async () => {
    const { message } = await import('antd');

    mockGetCallHistory.mockRejectedValue(new Error('Network error'));

    render(<CallsPage />);

    await vi.waitFor(() => {
      expect(message.error).toHaveBeenCalledWith('failedToLoadCalls');
    });

    await vi.waitFor(() => {
      expect(screen.getByText('somethingWentWrong')).toBeInTheDocument();
      expect(screen.getByText('tryAgain')).toBeInTheDocument();
    });
  });

  it('shows empty state when no calls', async () => {
    mockGetCallHistory.mockResolvedValue({
      items: [],
      total: 0,
      page: 1,
      page_size: 20,
      total_pages: 0,
    });

    render(<CallsPage />);

    await vi.waitFor(() => {
      expect(screen.getByText('noCallsFound')).toBeInTheDocument();
    });

    expect(screen.getByText('tryAdjustingFilters')).toBeInTheDocument();
    expect(screen.getByTestId('empty-state')).toBeInTheDocument();
  });
});
