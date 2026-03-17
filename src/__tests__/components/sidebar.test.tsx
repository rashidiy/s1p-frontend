import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Sidebar } from '@/components/layout/sidebar';
import { useAuthStore } from '@/store/auth';
import { UserRole } from '@/types/api';

// Mock the apiClient import used by auth store
vi.mock('@/lib/api', () => ({
  apiClient: {
    getMyProfile: vi.fn(),
    getOwnerProfile: vi.fn(),
    logout: vi.fn(),
  },
}));

// Mock next/link
vi.mock('next/link', () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

// Mock useIsMobile hook
vi.mock('@/hooks/useIsMobile', () => ({
  useIsMobile: () => false,
}));

// Mock theme store
vi.mock('@/store/theme', () => ({
  useThemeStore: () => ({ mode: 'system', resolved: 'light', setMode: vi.fn() }),
}));

// Mock antd components
vi.mock('antd', () => {
  const Layout = { Sider: ({ children, ...props }: { children?: React.ReactNode; [key: string]: unknown }) => <div data-testid="sider" {...props}>{children}</div> };
  return {
    Layout,
    Menu: ({ items, ...props }: { items?: Array<{ key: string; label: string; icon?: React.ReactNode }>; [key: string]: unknown }) => (
      <ul data-testid="nav-menu">
        {items?.map((item: { key: string; label: string; icon?: React.ReactNode }) => (
          <li key={item.key} data-testid={`nav-item-${item.key}`}>
            {item.icon}
            <span>{item.label}</span>
          </li>
        ))}
      </ul>
    ),
    Avatar: ({ children, ...props }: { children?: React.ReactNode; [key: string]: unknown }) => <div data-testid="avatar" {...props}>{children}</div>,
    Popover: ({ children }: { children?: React.ReactNode }) => <div>{children}</div>,
    Drawer: ({ children }: { children?: React.ReactNode }) => <div>{children}</div>,
    Segmented: ({ options, value, onChange, ...props }: { options?: Array<{ value: string; label: string; icon?: React.ReactNode }>; value?: string; onChange?: (val: string) => void; [key: string]: unknown }) => (
      <div data-testid="segmented" {...props}>
        {options?.map((opt: { value: string; label: string; icon?: React.ReactNode }) => (
          <button key={typeof opt === 'string' ? opt : opt.value} data-value={typeof opt === 'string' ? opt : opt.value}>
            {typeof opt === 'string' ? opt : opt.label || opt.icon}
          </button>
        ))}
      </div>
    ),
  };
});

beforeEach(() => {
  useAuthStore.setState({
    user: null,
    userType: null,
    isAuthenticated: false,
    isInitializing: false,
    isOwner: false,
    isCompanyUser: false,
    permissions: [],
    mustChangePassword: false,
  });
});

describe('Sidebar', () => {
  it('renders owner navigation when isOwner is true', () => {
    useAuthStore.setState({
      isOwner: true,
      isCompanyUser: false,
      isAuthenticated: true,
      userType: 'owner',
      user: { id: '1', email: 'owner@example.com', first_name: 'Owner', last_name: 'User', is_active: true },
    });

    render(<Sidebar />);

    expect(screen.getByText('dashboard')).toBeInTheDocument();
    expect(screen.getByText('companies')).toBeInTheDocument();
    expect(screen.getByText('contracts')).toBeInTheDocument();

    // Should not have company-specific items
    expect(screen.queryByText('contacts')).not.toBeInTheDocument();
    expect(screen.queryByText('leads')).not.toBeInTheDocument();
    expect(screen.queryByText('team')).not.toBeInTheDocument();
  });

  it('renders base company nav for operators', () => {
    useAuthStore.setState({
      isOwner: false,
      isCompanyUser: true,
      isAuthenticated: true,
      userType: 'company_user',
      user: {
        id: '1',
        email: 'op@example.com',
        first_name: 'Operator',
        last_name: 'User',
        is_active: true,
        role: UserRole.COMPANY_OPERATOR,
      },
      permissions: ['contacts.read', 'leads.read', 'deals.read', 'tasks.read', 'calls.read'],
    });

    render(<Sidebar />);

    expect(screen.getByText('dashboard')).toBeInTheDocument();
    expect(screen.getByText('contacts')).toBeInTheDocument();
    expect(screen.getByText('leads')).toBeInTheDocument();
    expect(screen.getByText('deals')).toBeInTheDocument();
    expect(screen.getByText('tasks')).toBeInTheDocument();
    expect(screen.getByText('calls')).toBeInTheDocument();

    // Should not have admin/manager items
    expect(screen.queryByText('team')).not.toBeInTheDocument();
    expect(screen.queryByText('analytics')).not.toBeInTheDocument();
    expect(screen.queryByText('permissionGroups')).not.toBeInTheDocument();
  });

  it('shows admin nav items for admins', () => {
    useAuthStore.setState({
      isOwner: false,
      isCompanyUser: true,
      isAuthenticated: true,
      userType: 'company_user',
      user: {
        id: '1',
        email: 'admin@example.com',
        first_name: 'Admin',
        last_name: 'User',
        is_active: true,
        role: UserRole.COMPANY_ADMIN,
      },
      permissions: [],
    });

    render(<Sidebar />);

    // Admin nav items
    expect(screen.getByText('team')).toBeInTheDocument();
    expect(screen.getByText('analytics')).toBeInTheDocument();
  });

  it('shows analytics for managers', () => {
    useAuthStore.setState({
      isOwner: false,
      isCompanyUser: true,
      isAuthenticated: true,
      userType: 'company_user',
      user: {
        id: '1',
        email: 'mgr@example.com',
        first_name: 'Manager',
        last_name: 'User',
        is_active: true,
        role: UserRole.COMPANY_MANAGER,
      },
      permissions: ['contacts.read', 'leads.read', 'deals.read', 'tasks.read', 'calls.read'],
    });

    render(<Sidebar />);

    expect(screen.getByText('analytics')).toBeInTheDocument();
    // Manager does NOT get admin items
    expect(screen.queryByText('team')).not.toBeInTheDocument();
    expect(screen.queryByText('permissionGroups')).not.toBeInTheDocument();
  });

  it('filters items based on permission strings', () => {
    useAuthStore.setState({
      isOwner: false,
      isCompanyUser: true,
      isAuthenticated: true,
      userType: 'company_user',
      user: {
        id: '1',
        email: 'op@example.com',
        first_name: 'Op',
        last_name: 'User',
        is_active: true,
        role: UserRole.COMPANY_OPERATOR,
      },
      // Only contacts.read and leads.read — no deals, tasks, or calls
      permissions: ['contacts.read', 'leads.read'],
    });

    render(<Sidebar />);

    // Dashboard has no permission requirement
    expect(screen.getByText('dashboard')).toBeInTheDocument();
    expect(screen.getByText('contacts')).toBeInTheDocument();
    expect(screen.getByText('leads')).toBeInTheDocument();

    // These should be filtered out
    expect(screen.queryByText('deals')).not.toBeInTheDocument();
    expect(screen.queryByText('tasks')).not.toBeInTheDocument();
    expect(screen.queryByText('calls')).not.toBeInTheDocument();
  });

  it('shows user initials in avatar', () => {
    useAuthStore.setState({
      isOwner: false,
      isCompanyUser: true,
      isAuthenticated: true,
      userType: 'company_user',
      user: {
        id: '1',
        email: 'john@example.com',
        first_name: 'John',
        last_name: 'Doe',
        is_active: true,
        role: UserRole.COMPANY_OPERATOR,
      },
      permissions: [],
    });

    render(<Sidebar />);

    const avatar = screen.getByTestId('avatar');
    expect(avatar).toHaveTextContent('JD');
  });

  it('shows user name and email in profile section', () => {
    useAuthStore.setState({
      isOwner: false,
      isCompanyUser: true,
      isAuthenticated: true,
      userType: 'company_user',
      user: {
        id: '1',
        email: 'jane@example.com',
        first_name: 'Jane',
        last_name: 'Smith',
        is_active: true,
        role: UserRole.COMPANY_OPERATOR,
      },
      permissions: [],
    });

    render(<Sidebar />);

    expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    expect(screen.getByText('jane@example.com')).toBeInTheDocument();
  });
});
