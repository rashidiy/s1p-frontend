import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';

// Mock apiClient
const mockGetWebhookEndpoints = vi.fn();
const mockGetWebhookDeliveries = vi.fn();
vi.mock('@/lib/api', () => ({
  apiClient: {
    getWebhookEndpoints: (...args: unknown[]) => mockGetWebhookEndpoints(...args),
    getWebhookDeliveries: (...args: unknown[]) => mockGetWebhookDeliveries(...args),
    createWebhookEndpoint: vi.fn(),
    updateWebhookEndpoint: vi.fn(),
    deleteWebhookEndpoint: vi.fn(),
    getMyProfile: vi.fn(),
    getOwnerProfile: vi.fn(),
    logout: vi.fn(),
  },
}));

// Mock antd
vi.mock('antd', () => {
  const ModalComponent = ({ children, open, title }: any) => (
    open ? <div data-testid="modal" role="dialog">{title && <div>{title}</div>}{children}</div> : null
  );
  ModalComponent.confirm = vi.fn();
  return {
    Button: ({ children, onClick, disabled, ...props }: any) => (
      <button onClick={onClick} disabled={disabled} {...props}>{children}</button>
    ),
    Input: Object.assign(
      ({ value, onChange, placeholder, ...props }: any) => (
        <input value={value} onChange={onChange} placeholder={placeholder} {...props} />
      ),
      {
        Password: ({ value, onChange, placeholder, ...props }: any) => (
          <input type="password" value={value} onChange={onChange} placeholder={placeholder} {...props} />
        ),
      }
    ),
    Switch: ({ checked, onChange, ...props }: any) => (
      <input type="checkbox" checked={checked} onChange={(e: any) => onChange?.(e.target.checked)} {...props} />
    ),
    Modal: ModalComponent,
    Tag: ({ children, ...props }: any) => <span {...props}>{children}</span>,
    Table: ({ dataSource, columns, locale, loading }: any) => (
      <table data-testid="deliveries-table">
        <thead>
          <tr>{columns?.map((c: any) => <th key={c.key}>{c.title}</th>)}</tr>
        </thead>
        <tbody>
          {loading ? (
            <tr><td>Loading...</td></tr>
          ) : dataSource && dataSource.length > 0 ? (
            dataSource.map((row: any) => (
              <tr key={row.id}>
                {columns?.map((c: any) => (
                  <td key={c.key}>{c.render ? c.render(row[c.dataIndex], row) : row[c.dataIndex]}</td>
                ))}
              </tr>
            ))
          ) : (
            <tr><td>{locale?.emptyText}</td></tr>
          )}
        </tbody>
      </table>
    ),
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
  EditOutlined: () => <span>edit-icon</span>,
  DeleteOutlined: () => <span>delete-icon</span>,
  SaveOutlined: () => <span>save-icon</span>,
  CloseOutlined: () => <span>close-icon</span>,
  ApiOutlined: () => <span>api-icon</span>,
  DownOutlined: () => <span>down-icon</span>,
  UpOutlined: () => <span>up-icon</span>,
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
import WebhooksPage from '@/app/(company)/settings/webhooks/page';

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

describe('Settings Webhooks Page', () => {
  it('renders loading state initially', () => {
    mockGetWebhookEndpoints.mockReturnValue(new Promise(() => {}));

    render(<WebhooksPage />);

    const pulseElements = document.querySelectorAll('.animate-pulse');
    expect(pulseElements.length).toBeGreaterThan(0);
  });

  it('renders webhook endpoint list after data loads', async () => {
    mockGetWebhookEndpoints.mockResolvedValue({
      items: [
        {
          id: 'wh-1',
          company_id: 'comp-1',
          url: 'https://example.com/webhook',
          events: ['call.completed', 'lead.created'],
          is_active: true,
          created_at: '2025-01-01T10:00:00Z',
          updated_at: '2025-01-15T10:00:00Z',
        },
      ],
    });

    render(<WebhooksPage />);

    await vi.waitFor(() => {
      expect(screen.getByText('https://example.com/webhook')).toBeInTheDocument();
    });
  });

  it('shows create form when add button is clicked', async () => {
    mockGetWebhookEndpoints.mockResolvedValue({ items: [] });

    render(<WebhooksPage />);

    await vi.waitFor(() => {
      expect(screen.getByText('addEndpoint')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('addEndpoint'));

    await vi.waitFor(() => {
      expect(screen.getByText('endpointUrl')).toBeInTheDocument();
      expect(screen.getByText('endpointEvents')).toBeInTheDocument();
      expect(screen.getByText('endpointSecret')).toBeInTheDocument();
    });
  });

  it('shows error state on failure', async () => {
    const { message } = await import('antd');

    mockGetWebhookEndpoints.mockRejectedValue(new Error('Network error'));

    render(<WebhooksPage />);

    await vi.waitFor(() => {
      expect(message.error).toHaveBeenCalledWith('failedToLoadWebhooks');
    });

    await vi.waitFor(() => {
      expect(screen.getByText('somethingWentWrong')).toBeInTheDocument();
      expect(screen.getByText('tryAgain')).toBeInTheDocument();
    });
  });

  it('shows empty state when no endpoints', async () => {
    mockGetWebhookEndpoints.mockResolvedValue({ items: [] });

    render(<WebhooksPage />);

    await vi.waitFor(() => {
      expect(screen.getByText('noEndpointsYet')).toBeInTheDocument();
    });

    expect(screen.getByText('noEndpointsDescription')).toBeInTheDocument();
    expect(screen.getByTestId('empty-state')).toBeInTheDocument();
  });

  it('shows delivery history when expand button is clicked', async () => {
    mockGetWebhookEndpoints.mockResolvedValue({
      items: [
        {
          id: 'wh-1',
          company_id: 'comp-1',
          url: 'https://example.com/webhook',
          events: ['call.completed'],
          is_active: true,
          created_at: '2025-01-01T10:00:00Z',
          updated_at: '2025-01-15T10:00:00Z',
        },
      ],
    });

    mockGetWebhookDeliveries.mockResolvedValue({
      items: [
        {
          id: 'del-1',
          endpoint_id: 'wh-1',
          event_type: 'call.completed',
          payload: {},
          status: 'success',
          attempts: 1,
          response_code: 200,
          created_at: '2025-01-15T10:00:00Z',
        },
      ],
    });

    render(<WebhooksPage />);

    await vi.waitFor(() => {
      expect(screen.getByText('https://example.com/webhook')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('deliveryLog'));

    await vi.waitFor(() => {
      expect(mockGetWebhookDeliveries).toHaveBeenCalledWith('wh-1');
    });

    await vi.waitFor(() => {
      expect(screen.getByTestId('deliveries-table')).toBeInTheDocument();
    });
  });
});
