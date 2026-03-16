import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';

// Mock apiClient
const mockGetLead = vi.fn();
const mockGetEntityNotes = vi.fn();
const mockConvertLead = vi.fn();
vi.mock('@/lib/api', () => ({
  apiClient: {
    getLead: (...args: unknown[]) => mockGetLead(...args),
    getEntityNotes: (...args: unknown[]) => mockGetEntityNotes(...args),
    convertLead: (...args: unknown[]) => mockConvertLead(...args),
    updateLead: vi.fn(),
    deleteLead: vi.fn(),
    createNote: vi.fn(),
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
  useParams: () => ({ id: 'lead-789' }),
  usePathname: () => '/leads/lead-789',
  useSearchParams: () => new URLSearchParams(),
}));

// Mock antd
vi.mock('antd', () => ({
  Button: ({ children, onClick, disabled, ...props }: any) => (
    <button onClick={onClick} disabled={disabled} {...props}>{children}</button>
  ),
  Input: Object.assign(
    ({ value, onChange, ...props }: any) => (
      <input value={value} onChange={onChange} {...props} />
    ),
    {
      TextArea: ({ value, onChange, placeholder, ...props }: any) => (
        <textarea value={value} onChange={onChange} placeholder={placeholder} {...props} />
      ),
    }
  ),
  Modal: {
    confirm: vi.fn(),
  },
  Tag: ({ children, className, ...props }: any) => <span className={className} {...props}>{children}</span>,
  message: {
    error: vi.fn(),
    success: vi.fn(),
    warning: vi.fn(),
  },
}));

// Mock @ant-design/icons
vi.mock('@ant-design/icons', () => ({
  ArrowLeftOutlined: () => <span>back-icon</span>,
  DollarOutlined: () => <span>dollar-icon</span>,
  UserOutlined: () => <span>user-icon</span>,
  EditOutlined: () => <span>edit-icon</span>,
  SaveOutlined: () => <span>save-icon</span>,
  CloseOutlined: () => <span>close-icon</span>,
  PlusOutlined: () => <span>plus-icon</span>,
  RightCircleOutlined: () => <span>convert-icon</span>,
}));

// Mock next/link
vi.mock('next/link', () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

import { useAuthStore } from '@/store/auth';
import { UserRole } from '@/types/api';
import LeadDetailPage from '@/app/(company)/leads/[id]/page';

const mockLead = {
  id: 'lead-789',
  company_id: 'comp-1',
  title: 'New Enterprise Lead',
  description: 'Interested in our enterprise plan',
  status: 'qualified',
  pipeline_stage: 'proposal',
  estimated_value: 75000,
  currency: 'USD',
  source: 'referral',
  contact_id: 'contact-1',
  contact_name: 'Jane Smith',
  assigned_to: 'user-1',
  assigned_to_name: 'Sales Rep',
  tags: ['hot', 'enterprise'],
  created_at: '2025-02-01T08:00:00Z',
  updated_at: '2025-03-10T16:00:00Z',
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

describe('Lead Detail Page', () => {
  it('renders loading skeleton initially', () => {
    mockGetLead.mockReturnValue(new Promise(() => {}));
    mockGetEntityNotes.mockReturnValue(new Promise(() => {}));

    render(<LeadDetailPage />);

    const pulseElements = document.querySelectorAll('.animate-pulse');
    expect(pulseElements.length).toBeGreaterThan(0);
  });

  it('renders lead details after API load', async () => {
    mockGetLead.mockResolvedValue(mockLead);
    mockGetEntityNotes.mockResolvedValue([]);

    render(<LeadDetailPage />);

    await vi.waitFor(() => {
      expect(screen.getByText('leadInformation')).toBeInTheDocument();
    });

    // Description
    expect(screen.getByText('Interested in our enterprise plan')).toBeInTheDocument();
    // Estimated value
    expect(screen.getByText('$75,000')).toBeInTheDocument();
    // Contact name
    expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    // Status shown in sidebar
    expect(screen.getAllByText('qualified').length).toBeGreaterThanOrEqual(1);
  });

  it('shows convert button for non-converted leads', async () => {
    mockGetLead.mockResolvedValue(mockLead);
    mockGetEntityNotes.mockResolvedValue([]);

    render(<LeadDetailPage />);

    await vi.waitFor(() => {
      expect(screen.getByText('leadInformation')).toBeInTheDocument();
    });

    expect(screen.getByText('convertLead')).toBeInTheDocument();
  });

  it('hides convert button for converted leads', async () => {
    const convertedLead = { ...mockLead, status: 'converted' };
    mockGetLead.mockResolvedValue(convertedLead);
    mockGetEntityNotes.mockResolvedValue([]);

    render(<LeadDetailPage />);

    await vi.waitFor(() => {
      expect(screen.getByText('leadInformation')).toBeInTheDocument();
    });

    // Convert button should not be present for already converted leads
    const buttons = screen.getAllByRole('button');
    const convertButtons = buttons.filter(b => b.textContent?.includes('convertLead'));
    expect(convertButtons).toHaveLength(0);
  });

  it('shows error state on API failure', async () => {
    const { message } = await import('antd');

    mockGetLead.mockRejectedValue(new Error('Network error'));
    mockGetEntityNotes.mockResolvedValue([]);

    render(<LeadDetailPage />);

    await vi.waitFor(() => {
      expect(message.error).toHaveBeenCalledWith('failedToLoadLead');
    });

    // Lead is null => shows notFound
    await vi.waitFor(() => {
      expect(screen.getByText('notFoundTitle')).toBeInTheDocument();
    });
  });

  it('shows source and tags', async () => {
    mockGetLead.mockResolvedValue(mockLead);
    mockGetEntityNotes.mockResolvedValue([]);

    render(<LeadDetailPage />);

    await vi.waitFor(() => {
      expect(screen.getByText('leadInformation')).toBeInTheDocument();
    });

    expect(screen.getByText('referral')).toBeInTheDocument();
    expect(screen.getByText('hot')).toBeInTheDocument();
    expect(screen.getByText('enterprise')).toBeInTheDocument();
  });
});
