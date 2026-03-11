import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { useAuthStore } from '@/store/auth';

// Mock the apiClient import used by auth store
vi.mock('@/lib/api', () => ({
  apiClient: {
    getMyProfile: vi.fn(),
    getOwnerProfile: vi.fn(),
    logout: vi.fn(),
  },
}));

const mockPush = vi.fn();

// Override the global next/navigation mock for this file
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush, replace: vi.fn(), refresh: vi.fn(), back: vi.fn(), prefetch: vi.fn() }),
  usePathname: () => '/dashboard',
}));

// Mock antd Spin
vi.mock('antd', () => ({
  Spin: ({ size }: { size?: string }) => <div data-testid="spinner">{size}</div>,
}));

beforeEach(() => {
  mockPush.mockClear();
  useAuthStore.setState({
    user: null,
    userType: null,
    isAuthenticated: false,
    isInitializing: true,
    isOwner: false,
    isCompanyUser: false,
    permissions: [],
    mustChangePassword: false,
  });
});

describe('ProtectedRoute', () => {
  it('shows loading spinner while isInitializing is true', () => {
    useAuthStore.setState({ isInitializing: true, isAuthenticated: false });

    render(
      <ProtectedRoute>
        <div>Protected Content</div>
      </ProtectedRoute>
    );

    expect(screen.getByTestId('spinner')).toBeInTheDocument();
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
  });

  it('renders children when authenticated', () => {
    useAuthStore.setState({
      isInitializing: false,
      isAuthenticated: true,
      user: { id: '1', email: 'test@example.com', first_name: 'Test', is_active: true },
      userType: 'company_user',
      isCompanyUser: true,
    });

    render(
      <ProtectedRoute>
        <div>Protected Content</div>
      </ProtectedRoute>
    );

    expect(screen.getByText('Protected Content')).toBeInTheDocument();
  });

  it('redirects to /login when not authenticated (company user)', async () => {
    useAuthStore.setState({
      isInitializing: false,
      isAuthenticated: false,
    });

    render(
      <ProtectedRoute>
        <div>Protected Content</div>
      </ProtectedRoute>
    );

    // The useEffect should call router.push('/login')
    // We need to wait for effects to fire
    await vi.waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/login');
    });
  });

  it('redirects to /owner/login when not authenticated and requireOwner', async () => {
    useAuthStore.setState({
      isInitializing: false,
      isAuthenticated: false,
    });

    render(
      <ProtectedRoute requireOwner>
        <div>Owner Content</div>
      </ProtectedRoute>
    );

    await vi.waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/owner/login');
    });
  });

  it('redirects to /dashboard when not owner but requireOwner', async () => {
    useAuthStore.setState({
      isInitializing: false,
      isAuthenticated: true,
      isOwner: false,
      isCompanyUser: true,
      userType: 'company_user',
      user: { id: '1', email: 'test@example.com', first_name: 'Test', is_active: true },
    });

    render(
      <ProtectedRoute requireOwner>
        <div>Owner Content</div>
      </ProtectedRoute>
    );

    await vi.waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/dashboard');
    });
  });

  it('redirects owner users to /owner/dashboard when accessing company routes', async () => {
    useAuthStore.setState({
      isInitializing: false,
      isAuthenticated: true,
      isOwner: true,
      isCompanyUser: false,
      userType: 'owner',
      user: { id: '1', email: 'owner@example.com', first_name: 'Owner', is_active: true },
    });

    // pathname is mocked to '/dashboard' which is a company route (not /owner/*)
    render(
      <ProtectedRoute>
        <div>Company Content</div>
      </ProtectedRoute>
    );

    await vi.waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/owner/dashboard');
    });
  });
});
