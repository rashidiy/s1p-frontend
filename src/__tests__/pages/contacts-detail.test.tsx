import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';

// Mock apiClient
const mockGetContact = vi.fn();
const mockGetEntityNotes = vi.fn();
const mockGetContactActivity = vi.fn();
const mockUpdateContact = vi.fn();
const mockDeleteContact = vi.fn();
vi.mock('@/lib/api', () => ({
  apiClient: {
    getContact: (...args: unknown[]) => mockGetContact(...args),
    getEntityNotes: (...args: unknown[]) => mockGetEntityNotes(...args),
    getContactActivity: (...args: unknown[]) => mockGetContactActivity(...args),
    updateContact: (...args: unknown[]) => mockUpdateContact(...args),
    deleteContact: (...args: unknown[]) => mockDeleteContact(...args),
    createNote: vi.fn(),
    makeCall: vi.fn(),
    getMyProfile: vi.fn(),
    getOwnerProfile: vi.fn(),
    logout: vi.fn(),
  },
}));

// Mock next/navigation with useParams
const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    replace: vi.fn(),
    refresh: vi.fn(),
    back: vi.fn(),
    prefetch: vi.fn(),
  }),
  useParams: () => ({ id: 'contact-123' }),
  usePathname: () => '/contacts/contact-123',
  useSearchParams: () => new URLSearchParams(),
}));

// Mock antd — Modal is used both as <Modal> component and Modal.confirm()
vi.mock('antd', () => {
  const ModalComponent = ({ children, open, title, ...props }: any) => (
    open ? <div data-testid="modal" role="dialog">{title && <div>{title}</div>}{children}</div> : null
  );
  ModalComponent.confirm = vi.fn();
  return {
    Button: ({ children, onClick, disabled, danger, ...props }: any) => (
      <button onClick={onClick} disabled={disabled} data-danger={danger ? 'true' : undefined} {...props}>{children}</button>
    ),
    Input: Object.assign(
      ({ value, onChange, size, ...props }: any) => (
        <input value={value} onChange={onChange} {...props} />
      ),
      {
        TextArea: ({ value, onChange, placeholder, ...props }: any) => (
          <textarea value={value} onChange={onChange} placeholder={placeholder} {...props} />
        ),
      }
    ),
    Modal: ModalComponent,
    Tag: ({ children, bordered, ...props }: any) => <span {...props}>{children}</span>,
    App: ({ children }: any) => <div>{children}</div>,
    message: {
      error: vi.fn(),
      success: vi.fn(),
      warning: vi.fn(),
    },
  };
});

// Mock @ant-design/icons
vi.mock('@ant-design/icons', () => ({
  ArrowLeftOutlined: () => <span>back-icon</span>,
  MailOutlined: () => <span>mail-icon</span>,
  PhoneOutlined: () => <span>phone-icon</span>,
  FundProjectionScreenOutlined: () => <span>company-icon</span>,
  UserOutlined: () => <span>user-icon</span>,
  EditOutlined: () => <span>edit-icon</span>,
  SaveOutlined: () => <span>save-icon</span>,
  CloseOutlined: () => <span>close-icon</span>,
  PlusOutlined: () => <span>plus-icon</span>,
}));

// Mock next/link
vi.mock('next/link', () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

import { useAuthStore } from '@/store/auth';
import { UserRole } from '@/types/api';
import ContactDetailPage from '@/app/(company)/contacts/[id]/page';

const mockContact = {
  id: 'contact-123',
  company_id: 'comp-1',
  first_name: 'John',
  last_name: 'Doe',
  email: 'john@example.com',
  phone: '+1234567890',
  company_name: 'Acme Corp',
  position: 'CTO',
  source: 'website',
  tags: ['vip', 'enterprise'],
  created_by: 'user-1',
  assigned_to: null,
  total_leads: 3,
  total_deals: 2,
  total_calls: 5,
  created_at: '2025-01-15T10:00:00Z',
  updated_at: '2025-02-20T15:30:00Z',
  custom_fields: null,
};

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

describe('Contact Detail Page', () => {
  it('renders loading skeleton initially', () => {
    mockGetContact.mockReturnValue(new Promise(() => {}));
    mockGetEntityNotes.mockReturnValue(new Promise(() => {}));
    mockGetContactActivity.mockReturnValue(new Promise(() => {}));

    render(<ContactDetailPage />);

    const pulseElements = document.querySelectorAll('.animate-pulse');
    expect(pulseElements.length).toBeGreaterThan(0);
  });

  it('renders contact details after API load', async () => {
    mockGetContact.mockResolvedValue(mockContact);
    mockGetEntityNotes.mockResolvedValue([]);
    mockGetContactActivity.mockResolvedValue({ leads: [], deals: [], calls: [] });

    render(<ContactDetailPage />);

    await vi.waitFor(() => {
      expect(screen.getByText('john@example.com')).toBeInTheDocument();
    });

    expect(screen.getByText('+1234567890')).toBeInTheDocument();
    expect(screen.getByText('Acme Corp')).toBeInTheDocument();
    expect(screen.getByText('contactInformation')).toBeInTheDocument();
    expect(screen.getByText('vip')).toBeInTheDocument();
    expect(screen.getByText('enterprise')).toBeInTheDocument();
  });

  it('shows summary counts for leads, deals, and calls', async () => {
    mockGetContact.mockResolvedValue(mockContact);
    mockGetEntityNotes.mockResolvedValue([]);
    mockGetContactActivity.mockResolvedValue({ leads: [], deals: [], calls: [] });

    render(<ContactDetailPage />);

    await vi.waitFor(() => {
      expect(screen.getByText('john@example.com')).toBeInTheDocument();
    });

    expect(screen.getByText('3')).toBeInTheDocument(); // total_leads
    expect(screen.getByText('2')).toBeInTheDocument(); // total_deals
    expect(screen.getByText('5')).toBeInTheDocument(); // total_calls
  });

  it('shows edit button for users with contacts.write permission', async () => {
    mockGetContact.mockResolvedValue(mockContact);
    mockGetEntityNotes.mockResolvedValue([]);
    mockGetContactActivity.mockResolvedValue({ leads: [], deals: [], calls: [] });

    render(<ContactDetailPage />);

    await vi.waitFor(() => {
      expect(screen.getByText('john@example.com')).toBeInTheDocument();
    });

    // Admin user has all permissions, so edit button should be visible
    expect(screen.getByText('edit')).toBeInTheDocument();
  });

  it('shows edit form when clicking edit button', async () => {
    mockGetContact.mockResolvedValue(mockContact);
    mockGetEntityNotes.mockResolvedValue([]);
    mockGetContactActivity.mockResolvedValue({ leads: [], deals: [], calls: [] });

    render(<ContactDetailPage />);

    await vi.waitFor(() => {
      expect(screen.getByText('john@example.com')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('edit'));

    await vi.waitFor(() => {
      expect(screen.getByText('save')).toBeInTheDocument();
      expect(screen.getByText('cancel')).toBeInTheDocument();
    });

    // Edit form should have labels
    expect(screen.getByText('firstName')).toBeInTheDocument();
    expect(screen.getByText('lastName')).toBeInTheDocument();
  });

  it('shows error state on API failure', async () => {
    const { message } = await import('antd');

    mockGetContact.mockRejectedValue(new Error('Network error'));
    mockGetEntityNotes.mockResolvedValue([]);
    mockGetContactActivity.mockResolvedValue({ leads: [], deals: [], calls: [] });

    render(<ContactDetailPage />);

    await vi.waitFor(() => {
      expect(message.error).toHaveBeenCalledWith('failedToLoadContact');
    });

    // When contact fails to load, contact is null => shows notFound
    await vi.waitFor(() => {
      expect(screen.getByText('notFound')).toBeInTheDocument();
    });
  });

  it('shows delete button for users with contacts.delete permission', async () => {
    mockGetContact.mockResolvedValue(mockContact);
    mockGetEntityNotes.mockResolvedValue([]);
    mockGetContactActivity.mockResolvedValue({ leads: [], deals: [], calls: [] });

    render(<ContactDetailPage />);

    await vi.waitFor(() => {
      expect(screen.getByText('john@example.com')).toBeInTheDocument();
    });

    // Admin has delete permission
    expect(screen.getByText('delete')).toBeInTheDocument();
  });

  it('calls Modal.confirm when delete button is clicked', async () => {
    const { Modal } = await import('antd');

    mockGetContact.mockResolvedValue(mockContact);
    mockGetEntityNotes.mockResolvedValue([]);
    mockGetContactActivity.mockResolvedValue({ leads: [], deals: [], calls: [] });

    render(<ContactDetailPage />);

    await vi.waitFor(() => {
      expect(screen.getByText('john@example.com')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('delete'));

    expect(Modal.confirm).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'areYouSure',
        content: 'confirmDeleteContact',
      })
    );
  });

  it('shows contact source tag', async () => {
    mockGetContact.mockResolvedValue(mockContact);
    mockGetEntityNotes.mockResolvedValue([]);
    mockGetContactActivity.mockResolvedValue({ leads: [], deals: [], calls: [] });

    render(<ContactDetailPage />);

    await vi.waitFor(() => {
      expect(screen.getByText('website')).toBeInTheDocument();
    });
  });
});
