import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';

// Mock apiClient
const mockGetApiKeys = vi.fn();
vi.mock('@/lib/api', () => ({
  apiClient: {
    getApiKeys: (...args: unknown[]) => mockGetApiKeys(...args),
    createApiKey: vi.fn(),
    revokeApiKey: vi.fn(),
    getMyProfile: vi.fn(),
    getOwnerProfile: vi.fn(),
    logout: vi.fn(),
  },
}));

// Mock antd
vi.mock('antd', () => {
  const ModalComponent = ({ children, open, title, footer }: any) => (
    open ? <div data-testid="modal" role="dialog">{title && <div>{title}</div>}{children}{footer}</div> : null
  );
  ModalComponent.confirm = vi.fn();
  return {
    Button: ({ children, onClick, disabled, ...props }: any) => (
      <button onClick={onClick} disabled={disabled} {...props}>{children}</button>
    ),
    Input: ({ value, onChange, placeholder, ...props }: any) => (
      <input value={value} onChange={onChange} placeholder={placeholder} {...props} />
    ),
    Modal: ModalComponent,
    Tag: ({ children, ...props }: any) => <span {...props}>{children}</span>,
    Typography: {
      Paragraph: ({ children, ...props }: any) => <p {...props}>{children}</p>,
    },
    message: {
      error: vi.fn(),
      success: vi.fn(),
      warning: vi.fn(),
    },
  };
});

// Mock @ant-design/icons
vi.mock('@ant-design/icons', () => ({
  PlusOutlined: () => <span>plus-icon</span>,
  DeleteOutlined: () => <span>delete-icon</span>,
  KeyOutlined: () => <span>key-icon</span>,
  CopyOutlined: () => <span>copy-icon</span>,
  WarningOutlined: () => <span>warning-icon</span>,
  ExclamationCircleOutlined: () => <span>excl-icon</span>,
}));

// Mock illustrations
vi.mock('@/components/illustrations', () => ({
  EmptyStateCharacter: () => <div data-testid="empty-state" />,
  ErrorCharacter: () => <div data-testid="error-character" />,
}));

// Mock next/link
vi.mock('next/link', () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

import { useAuthStore } from '@/store/auth';
import { UserRole } from '@/types/api';
import ApiKeysPage from '@/app/(company)/settings/api-keys/page';

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

describe('Settings API Keys Page', () => {
  it('renders loading state initially', () => {
    mockGetApiKeys.mockReturnValue(new Promise(() => {}));

    render(<ApiKeysPage />);

    const pulseElements = document.querySelectorAll('.animate-pulse');
    expect(pulseElements.length).toBeGreaterThan(0);
  });

  it('renders API key list after data loads', async () => {
    mockGetApiKeys.mockResolvedValue({
      items: [
        {
          id: 'key-1',
          name: 'Production Key',
          key_prefix: 'sk_prod_abc',
          is_active: true,
          last_used_at: '2025-01-15T10:00:00Z',
          created_at: '2025-01-01T10:00:00Z',
        },
        {
          id: 'key-2',
          name: 'Staging Key',
          key_prefix: 'sk_stg_xyz',
          is_active: false,
          last_used_at: null,
          created_at: '2025-01-05T10:00:00Z',
        },
      ],
      total: 2,
    });

    render(<ApiKeysPage />);

    await vi.waitFor(() => {
      expect(screen.getByText('Production Key')).toBeInTheDocument();
    });

    expect(screen.getByText('Staging Key')).toBeInTheDocument();
  });

  it('shows create button', async () => {
    mockGetApiKeys.mockResolvedValue({ items: [], total: 0 });

    render(<ApiKeysPage />);

    await vi.waitFor(() => {
      expect(screen.getByText('createApiKey')).toBeInTheDocument();
    });
  });

  it('shows error state on failure', async () => {
    const { message } = await import('antd');

    mockGetApiKeys.mockRejectedValue(new Error('Network error'));

    render(<ApiKeysPage />);

    await vi.waitFor(() => {
      expect(message.error).toHaveBeenCalledWith('failedToLoadApiKeys');
    });

    await vi.waitFor(() => {
      expect(screen.getByText('somethingWentWrong')).toBeInTheDocument();
      expect(screen.getByText('tryAgain')).toBeInTheDocument();
    });
  });

  it('shows empty state when no keys', async () => {
    mockGetApiKeys.mockResolvedValue({ items: [], total: 0 });

    render(<ApiKeysPage />);

    await vi.waitFor(() => {
      expect(screen.getByText('noApiKeysYet')).toBeInTheDocument();
    });

    expect(screen.getByText('noApiKeysDescription')).toBeInTheDocument();
    expect(screen.getByTestId('empty-state')).toBeInTheDocument();
  });

  it('shows key prefix for created keys', async () => {
    mockGetApiKeys.mockResolvedValue({
      items: [
        {
          id: 'key-1',
          name: 'My API Key',
          key_prefix: 'sk_live_abc123',
          is_active: true,
          last_used_at: null,
          created_at: '2025-01-01T10:00:00Z',
        },
      ],
      total: 1,
    });

    render(<ApiKeysPage />);

    await vi.waitFor(() => {
      expect(screen.getByText('sk_live_abc123...')).toBeInTheDocument();
    });
  });
});
