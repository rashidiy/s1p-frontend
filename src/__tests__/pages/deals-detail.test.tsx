import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';

// Mock apiClient
const mockGetDeal = vi.fn();
const mockGetEntityNotes = vi.fn();
vi.mock('@/lib/api', () => ({
  apiClient: {
    getDeal: (...args: unknown[]) => mockGetDeal(...args),
    getEntityNotes: (...args: unknown[]) => mockGetEntityNotes(...args),
    updateDeal: vi.fn(),
    deleteDeal: vi.fn(),
    markDealWon: vi.fn(),
    markDealLost: vi.fn(),
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
  useParams: () => ({ id: 'deal-456' }),
  usePathname: () => '/deals/deal-456',
  useSearchParams: () => new URLSearchParams(),
}));

// Mock antd
vi.mock('antd', () => ({
  Button: ({ children, onClick, disabled, className, ...props }: any) => (
    <button onClick={onClick} disabled={disabled} className={className} {...props}>{children}</button>
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
  TrophyOutlined: () => <span>trophy-icon</span>,
  CloseCircleOutlined: () => <span>close-circle-icon</span>,
  RiseOutlined: () => <span>rise-icon</span>,
}));

// Mock next/link
vi.mock('next/link', () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

import { useAuthStore } from '@/store/auth';
import { UserRole } from '@/types/api';
import DealDetailPage from '@/app/(company)/deals/[id]/page';

const mockDeal = {
  id: 'deal-456',
  company_id: 'comp-1',
  title: 'Enterprise License',
  description: 'Annual enterprise license deal',
  amount: 50000,
  currency: 'USD',
  probability: 75,
  weighted_value: 37500,
  stage: 'negotiation',
  contact_id: 'contact-1',
  contact_name: 'John Doe',
  lead_id: null,
  assigned_to: 'user-1',
  assigned_to_name: 'Sales Rep',
  expected_close_date: '2025-06-30',
  closed_date: null,
  tags: ['enterprise'],
  created_at: '2025-01-10T09:00:00Z',
  updated_at: '2025-03-01T14:00:00Z',
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

describe('Deal Detail Page', () => {
  it('renders loading skeleton initially', () => {
    mockGetDeal.mockReturnValue(new Promise(() => {}));
    mockGetEntityNotes.mockReturnValue(new Promise(() => {}));

    render(<DealDetailPage />);

    const pulseElements = document.querySelectorAll('.animate-pulse');
    expect(pulseElements.length).toBeGreaterThan(0);
  });

  it('renders deal details after API load', async () => {
    mockGetDeal.mockResolvedValue(mockDeal);
    mockGetEntityNotes.mockResolvedValue([]);

    render(<DealDetailPage />);

    await vi.waitFor(() => {
      expect(screen.getByText('dealInformation')).toBeInTheDocument();
    });

    // Amount appears in both main content and sidebar
    expect(screen.getAllByText('$50,000').length).toBeGreaterThanOrEqual(1);
    // Stage shown
    expect(screen.getAllByText('negotiation').length).toBeGreaterThanOrEqual(1);
    // Contact name
    expect(screen.getByText('John Doe')).toBeInTheDocument();
  });

  it('shows probability and weighted value', async () => {
    mockGetDeal.mockResolvedValue(mockDeal);
    mockGetEntityNotes.mockResolvedValue([]);

    render(<DealDetailPage />);

    await vi.waitFor(() => {
      expect(screen.getByText('75%')).toBeInTheDocument();
    });

    expect(screen.getByText('($37,500)')).toBeInTheDocument();
  });

  it('shows win/lose buttons for active deals', async () => {
    mockGetDeal.mockResolvedValue(mockDeal);
    mockGetEntityNotes.mockResolvedValue([]);

    render(<DealDetailPage />);

    await vi.waitFor(() => {
      expect(screen.getByText('dealInformation')).toBeInTheDocument();
    });

    // Active deal (not won/lost) shows win/lose buttons
    expect(screen.getByText('won')).toBeInTheDocument();
    expect(screen.getByText('lost')).toBeInTheDocument();
  });

  it('hides win/lose buttons for closed deals', async () => {
    const wonDeal = { ...mockDeal, stage: 'closed_won' };
    mockGetDeal.mockResolvedValue(wonDeal);
    mockGetEntityNotes.mockResolvedValue([]);

    render(<DealDetailPage />);

    await vi.waitFor(() => {
      expect(screen.getByText('dealInformation')).toBeInTheDocument();
    });

    // Won deal should not show win/lose action buttons
    // The "won" text from the stage tag will appear, but not as an action button
    const buttons = screen.getAllByRole('button');
    const wonButtons = buttons.filter(b => b.textContent?.includes('trophy-icon'));
    expect(wonButtons).toHaveLength(0);
  });

  it('shows error state on API failure', async () => {
    const { message } = await import('antd');

    mockGetDeal.mockRejectedValue(new Error('Network error'));
    mockGetEntityNotes.mockResolvedValue([]);

    render(<DealDetailPage />);

    await vi.waitFor(() => {
      expect(message.error).toHaveBeenCalledWith('failedToLoadDeal');
    });

    // Deal is null => shows notFoundDetail
    await vi.waitFor(() => {
      expect(screen.getByText('notFoundTitle')).toBeInTheDocument();
    });
  });

  it('displays deal amount in details sidebar', async () => {
    mockGetDeal.mockResolvedValue(mockDeal);
    mockGetEntityNotes.mockResolvedValue([]);

    render(<DealDetailPage />);

    await vi.waitFor(() => {
      expect(screen.getByText('details')).toBeInTheDocument();
    });

    // Amount appears in both main content and sidebar
    const amountElements = screen.getAllByText('$50,000');
    expect(amountElements.length).toBeGreaterThanOrEqual(2);
  });
});
