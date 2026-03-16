import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';

// Mock apiClient
const mockGetCustomFields = vi.fn();
vi.mock('@/lib/api', () => ({
  apiClient: {
    getCustomFields: (...args: unknown[]) => mockGetCustomFields(...args),
    createCustomField: vi.fn(),
    updateCustomField: vi.fn(),
    deleteCustomField: vi.fn(),
    reorderCustomFields: vi.fn(),
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
    Input: ({ value, onChange, placeholder, ...props }: any) => (
      <input value={value} onChange={onChange} placeholder={placeholder} {...props} />
    ),
    Select: ({ value, onChange, options, ...props }: any) => (
      <select value={value} onChange={(e: any) => onChange?.(e.target.value)} {...props}>
        {options?.map((o: any) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    ),
    Switch: ({ checked, onChange, ...props }: any) => (
      <input type="checkbox" checked={checked} onChange={(e: any) => onChange?.(e.target.checked)} {...props} />
    ),
    Modal: ModalComponent,
    Tag: ({ children, closable, onClose, ...props }: any) => (
      <span {...props}>{children}{closable && <button onClick={onClose}>x</button>}</span>
    ),
    Segmented: ({ value, onChange, options }: any) => (
      <div data-testid="segmented">
        {options?.map((o: any) => (
          <button key={o.value} onClick={() => onChange?.(o.value)} data-active={value === o.value ? 'true' : undefined}>
            {o.label}
          </button>
        ))}
      </div>
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
  ArrowUpOutlined: () => <span>up-icon</span>,
  ArrowDownOutlined: () => <span>down-icon</span>,
  SaveOutlined: () => <span>save-icon</span>,
  CloseOutlined: () => <span>close-icon</span>,
  FormOutlined: () => <span>form-icon</span>,
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
import CustomFieldsPage from '@/app/(company)/settings/custom-fields/page';

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

describe('Settings Custom Fields Page', () => {
  it('renders loading state initially', () => {
    mockGetCustomFields.mockReturnValue(new Promise(() => {}));

    render(<CustomFieldsPage />);

    const pulseElements = document.querySelectorAll('.animate-pulse');
    expect(pulseElements.length).toBeGreaterThan(0);
  });

  it('renders field definitions list after data loads', async () => {
    mockGetCustomFields.mockResolvedValue([
      {
        id: 'field-1',
        company_id: 'comp-1',
        entity_type: 'contact',
        field_name: 'LinkedIn URL',
        field_type: 'text',
        is_required: false,
        options: null,
        display_order: 0,
        created_at: '2025-01-01T10:00:00Z',
      },
      {
        id: 'field-2',
        company_id: 'comp-1',
        entity_type: 'contact',
        field_name: 'Company Size',
        field_type: 'number',
        is_required: true,
        options: null,
        display_order: 1,
        created_at: '2025-01-02T10:00:00Z',
      },
    ]);

    render(<CustomFieldsPage />);

    await vi.waitFor(() => {
      expect(screen.getByText('LinkedIn URL')).toBeInTheDocument();
    });

    expect(screen.getByText('Company Size')).toBeInTheDocument();
  });

  it('shows add field button', async () => {
    mockGetCustomFields.mockResolvedValue([]);

    render(<CustomFieldsPage />);

    await vi.waitFor(() => {
      expect(screen.getByText('addField')).toBeInTheDocument();
    });
  });

  it('shows error state on failure', async () => {
    const { message } = await import('antd');

    mockGetCustomFields.mockRejectedValue(new Error('Network error'));

    render(<CustomFieldsPage />);

    await vi.waitFor(() => {
      expect(message.error).toHaveBeenCalledWith('failedToLoadCustomFields');
    });

    await vi.waitFor(() => {
      expect(screen.getByText('somethingWentWrong')).toBeInTheDocument();
      expect(screen.getByText('tryAgain')).toBeInTheDocument();
    });
  });

  it('shows empty state when no fields', async () => {
    mockGetCustomFields.mockResolvedValue([]);

    render(<CustomFieldsPage />);

    await vi.waitFor(() => {
      expect(screen.getByText('noFieldsYet')).toBeInTheDocument();
    });

    expect(screen.getByText('noFieldsDescription')).toBeInTheDocument();
    expect(screen.getByTestId('empty-state')).toBeInTheDocument();
  });

  it('shows dropdown options for dropdown-type field', async () => {
    mockGetCustomFields.mockResolvedValue([
      {
        id: 'field-3',
        company_id: 'comp-1',
        entity_type: 'contact',
        field_name: 'Priority',
        field_type: 'dropdown',
        is_required: false,
        options: ['High', 'Medium', 'Low'],
        display_order: 0,
        created_at: '2025-01-01T10:00:00Z',
      },
    ]);

    render(<CustomFieldsPage />);

    await vi.waitFor(() => {
      expect(screen.getByText('Priority')).toBeInTheDocument();
    });

    expect(screen.getByText('High')).toBeInTheDocument();
    expect(screen.getByText('Medium')).toBeInTheDocument();
    expect(screen.getByText('Low')).toBeInTheDocument();
  });
});
