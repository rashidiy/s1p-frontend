import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';

// Mock apiClient
const mockGetUsers = vi.fn();
const mockGetInviteTokens = vi.fn();
vi.mock('@/lib/api', () => ({
  apiClient: {
    getUsers: (...args: unknown[]) => mockGetUsers(...args),
    getInviteTokens: (...args: unknown[]) => mockGetInviteTokens(...args),
    activateUser: vi.fn(),
    deactivateUser: vi.fn(),
    revokeInviteToken: vi.fn(),
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
  Input: Object.assign(
    ({ value, onChange, placeholder, ...props }: any) => (
      <input value={value} onChange={onChange} placeholder={placeholder} {...props} />
    ),
    {
      Search: ({ value, onChange, placeholder, ...props }: any) => (
        <input value={value} onChange={onChange} placeholder={placeholder} {...props} />
      ),
    }
  ),
  Tag: ({ children, ...props }: any) => <span {...props}>{children}</span>,
  Pagination: ({ current, total, onChange }: any) => (
    <div data-testid="pagination">Page {current}</div>
  ),
  Table: ({ dataSource, columns, ...props }: any) => (
    <table data-testid="invite-table">
      <tbody>
        {dataSource?.map((row: any, i: number) => (
          <tr key={i}><td>{row.first_name}</td></tr>
        ))}
      </tbody>
    </table>
  ),
  Modal: { confirm: vi.fn() },
  Select: ({ value, onChange, options, ...props }: any) => (
    <select value={value} onChange={(e: any) => onChange?.(e.target.value)} {...props}>
      {options?.map((o: any) => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  ),
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
  SafetyOutlined: () => <span>safety-icon</span>,
  SendOutlined: () => <span>send-icon</span>,
  DeleteOutlined: () => <span>delete-icon</span>,
  ExclamationCircleOutlined: () => <span>exclamation-icon</span>,
}));

// Mock illustrations
vi.mock('@/components/illustrations', () => ({
  EmptyStateCharacter: () => <div data-testid="empty-state" />,
}));

// Mock next/link
vi.mock('next/link', () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

// Mock next/image
vi.mock('next/image', () => ({
  default: ({ alt, ...props }: any) => <img alt={alt} {...props} />,
}));

// Mock utils
vi.mock('@/lib/utils', () => ({
  formatDateTime: (d: string) => d,
}));

import { useAuthStore } from '@/store/auth';
import { UserRole } from '@/types/api';
import UsersPage from '@/app/(company)/users/page';

const setAdminState = () => {
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
};

const setOperatorState = () => {
  useAuthStore.setState({
    user: {
      id: '2',
      email: 'op@test.com',
      first_name: 'Op',
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
};

beforeEach(() => {
  vi.clearAllMocks();
  setAdminState();
  mockGetInviteTokens.mockResolvedValue({ items: [], total: 0, page: 1, page_size: 10, total_pages: 0 });
});

describe('Users Page', () => {
  it('renders user list after data loads', async () => {
    mockGetUsers.mockResolvedValue({
      users: [
        {
          id: 'u1',
          first_name: 'Alice',
          last_name: 'Smith',
          phone: '+1234567890',
          role: UserRole.COMPANY_ADMIN,
          is_active: true,
          created_at: '2025-01-01T00:00:00Z',
          avatar_url: null,
        },
        {
          id: 'u2',
          first_name: 'Bob',
          last_name: 'Jones',
          phone: '+0987654321',
          role: UserRole.COMPANY_OPERATOR,
          is_active: true,
          created_at: '2025-02-01T00:00:00Z',
          avatar_url: null,
        },
      ],
      total: 2,
      page: 1,
      page_size: 20,
    });

    render(<UsersPage />);

    await vi.waitFor(() => {
      expect(screen.getByText('Alice Smith')).toBeInTheDocument();
    });

    expect(screen.getByText('Bob Jones')).toBeInTheDocument();
  });

  it('shows invite button for admins', async () => {
    mockGetUsers.mockResolvedValue({
      users: [],
      total: 0,
      page: 1,
      page_size: 20,
    });

    render(<UsersPage />);

    await vi.waitFor(() => {
      expect(screen.getByText('telegramInviteUser')).toBeInTheDocument();
    });
  });

  it('hides invite button for operators', async () => {
    setOperatorState();
    mockGetUsers.mockResolvedValue({
      users: [],
      total: 0,
      page: 1,
      page_size: 20,
    });

    render(<UsersPage />);

    await vi.waitFor(() => {
      expect(screen.getByTestId('empty-state')).toBeInTheDocument();
    });

    expect(screen.queryByText('telegramInviteUser')).not.toBeInTheDocument();
  });

  it('shows empty state when no users', async () => {
    mockGetUsers.mockResolvedValue({
      users: [],
      total: 0,
      page: 1,
      page_size: 20,
    });

    render(<UsersPage />);

    await vi.waitFor(() => {
      expect(screen.getByText('noUsersFound')).toBeInTheDocument();
    });

    expect(screen.getByTestId('empty-state')).toBeInTheDocument();
  });

  it('user card shows role tag', async () => {
    mockGetUsers.mockResolvedValue({
      users: [
        {
          id: 'u1',
          first_name: 'Alice',
          last_name: 'Smith',
          phone: '+1234567890',
          role: UserRole.COMPANY_ADMIN,
          is_active: true,
          created_at: '2025-01-01T00:00:00Z',
          avatar_url: null,
        },
      ],
      total: 1,
      page: 1,
      page_size: 20,
    });

    render(<UsersPage />);

    await vi.waitFor(() => {
      expect(screen.getByText('Alice Smith')).toBeInTheDocument();
    });

    // Role tag is rendered with formatted role text
    expect(screen.getByText('ADMIN')).toBeInTheDocument();
  });
});
