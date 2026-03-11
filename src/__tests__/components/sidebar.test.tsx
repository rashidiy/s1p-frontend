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

// Mock antd components
vi.mock('antd', () => {
  const Layout = { Sider: ({ children, ...props }: any) => <div data-testid="sider" {...props}>{children}</div> };
  return {
    Layout,
    Menu: ({ items, ...props }: any) => (
      <ul data-testid="nav-menu">
        {items?.map((item: any) => (
          <li key={item.key} data-testid={`nav-item-${item.key}`}>
            {item.icon}
            <span>{item.label}</span>
          </li>
        ))}
      </ul>
    ),
    Avatar: ({ children, ...props }: any) => <div data-testid="avatar" {...props}>{children}</div>,
    Popover: ({ children }: any) => <div>{children}</div>,
    Drawer: ({ children }: any) => <div>{children}</div>,
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

    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Companies')).toBeInTheDocument();
    expect(screen.getByText('Contracts')).toBeInTheDocument();
    expect(screen.getByText('Settings')).toBeInTheDocument();

    // Should not have company-specific items
    expect(screen.queryByText('Contacts')).not.toBeInTheDocument();
    expect(screen.queryByText('Leads')).not.toBeInTheDocument();
    expect(screen.queryByText('Team')).not.toBeInTheDocument();
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

    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Contacts')).toBeInTheDocument();
    expect(screen.getByText('Leads')).toBeInTheDocument();
    expect(screen.getByText('Deals')).toBeInTheDocument();
    expect(screen.getByText('Tasks')).toBeInTheDocument();
    expect(screen.getByText('Calls')).toBeInTheDocument();

    // Should not have admin/manager items
    expect(screen.queryByText('Team')).not.toBeInTheDocument();
    expect(screen.queryByText('Analytics')).not.toBeInTheDocument();
    expect(screen.queryByText('Permission Groups')).not.toBeInTheDocument();
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

    // Admin nav items (admin also gets hasPermissionString returning true for all)
    expect(screen.getByText('Team')).toBeInTheDocument();
    expect(screen.getByText('Permission Groups')).toBeInTheDocument();
    expect(screen.getByText('Telegram')).toBeInTheDocument();
    // Note: "Settings" appears in adminNavigation
    expect(screen.getByText('Analytics')).toBeInTheDocument();
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

    expect(screen.getByText('Analytics')).toBeInTheDocument();
    // Manager does NOT get admin items
    expect(screen.queryByText('Team')).not.toBeInTheDocument();
    expect(screen.queryByText('Permission Groups')).not.toBeInTheDocument();
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
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Contacts')).toBeInTheDocument();
    expect(screen.getByText('Leads')).toBeInTheDocument();

    // These should be filtered out
    expect(screen.queryByText('Deals')).not.toBeInTheDocument();
    expect(screen.queryByText('Tasks')).not.toBeInTheDocument();
    expect(screen.queryByText('Calls')).not.toBeInTheDocument();
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
