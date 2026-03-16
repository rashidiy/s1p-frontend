import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';

// Mock apiClient
const mockGetOwnerCompanies = vi.fn();
const mockActivateCompany = vi.fn();
const mockDeactivateCompany = vi.fn();
const mockImpersonateCompany = vi.fn();
vi.mock('@/lib/api', () => ({
  apiClient: {
    getOwnerCompanies: (...args: unknown[]) => mockGetOwnerCompanies(...args),
    activateCompany: (...args: unknown[]) => mockActivateCompany(...args),
    deactivateCompany: (...args: unknown[]) => mockDeactivateCompany(...args),
    impersonateCompany: (...args: unknown[]) => mockImpersonateCompany(...args),
    getMyProfile: vi.fn(),
    getOwnerProfile: vi.fn(),
    logout: vi.fn(),
  },
}));

vi.mock('@/lib/utils', () => ({
  getErrorMessage: (err: unknown, fallback: string) => fallback,
}));

// Mock antd
vi.mock('antd', () => ({
  Input: Object.assign(
    ({ value, onChange, ...props }: any) => (
      <input value={value} onChange={onChange} {...props} />
    ),
    {
      Search: ({ value, onChange, placeholder, ...props }: any) => (
        <input
          data-testid="search-input"
          value={value}
          onChange={onChange}
          placeholder={placeholder}
        />
      ),
    }
  ),
  Button: ({ children, onClick, icon, danger, size, ...props }: any) => (
    <button onClick={onClick} data-danger={danger ? 'true' : undefined} data-size={size} {...props}>
      {icon}{children}
    </button>
  ),
  Tag: ({ children, color, ...props }: any) => (
    <span data-color={color} {...props}>{children}</span>
  ),
  Table: ({ dataSource, columns, loading, ...props }: any) => {
    if (loading) return <div data-testid="table-loading">Loading...</div>;
    if (!dataSource || dataSource.length === 0) return <div data-testid="table-empty" />;
    return (
      <table data-testid="company-table">
        <thead>
          <tr>
            {columns.map((col: any) => (
              <th key={col.key}>{col.title}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {dataSource.map((record: any) => (
            <tr key={record.id} data-testid={`row-${record.id}`}>
              {columns.map((col: any) => (
                <td key={col.key}>
                  {col.render
                    ? col.render(record[col.dataIndex], record)
                    : record[col.dataIndex]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    );
  },
  message: {
    error: vi.fn(),
    success: vi.fn(),
    warning: vi.fn(),
  },
}));

// Mock @ant-design/icons
vi.mock('@ant-design/icons', () => ({
  BankOutlined: () => <span>bank</span>,
  PlusOutlined: () => <span>plus</span>,
  CheckCircleOutlined: () => <span>check</span>,
  CloseCircleOutlined: () => <span>close</span>,
  ExportOutlined: () => <span>export</span>,
  EyeOutlined: () => <span>eye</span>,
}));

// Mock next/link
vi.mock('next/link', () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

// Mock illustrations
vi.mock('@/components/illustrations', () => ({
  EmptyStateCharacter: (props: any) => <div data-testid="empty-character" />,
}));

import CompaniesPage from '@/app/owner/companies/page';

const mockCompanies = [
  {
    id: 'comp-1',
    name: 'Acme Corp',
    subdomain: 'acme',
    is_active: true,
    provider_type: 'sipuni',
    users_count: 5,
    created_at: '2025-01-10T10:00:00Z',
  },
  {
    id: 'comp-2',
    name: 'Beta Inc',
    subdomain: 'beta',
    is_active: false,
    provider_type: 'asterisk',
    users_count: 3,
    created_at: '2025-02-15T10:00:00Z',
  },
];

beforeEach(() => {
  vi.clearAllMocks();
});

describe('Owner Companies Page', () => {
  it('renders loading skeleton when data is loading', () => {
    mockGetOwnerCompanies.mockReturnValue(new Promise(() => {}));

    render(<CompaniesPage />);

    const pulseElements = document.querySelectorAll('.animate-pulse');
    expect(pulseElements.length).toBeGreaterThan(0);
  });

  it('renders company table with data', async () => {
    mockGetOwnerCompanies.mockResolvedValue(mockCompanies);

    render(<CompaniesPage />);

    await vi.waitFor(() => {
      expect(screen.getByText('Acme Corp')).toBeInTheDocument();
    });

    expect(screen.getByText('Beta Inc')).toBeInTheDocument();
    expect(screen.getByTestId('company-table')).toBeInTheDocument();
  });

  it('shows empty state when no companies', async () => {
    mockGetOwnerCompanies.mockResolvedValue([]);

    render(<CompaniesPage />);

    await vi.waitFor(() => {
      expect(screen.getByText('noCompaniesFound')).toBeInTheDocument();
    });

    expect(screen.getByTestId('empty-character')).toBeInTheDocument();
  });

  it('shows error state on API failure', async () => {
    const { message } = await import('antd');

    mockGetOwnerCompanies.mockRejectedValue(new Error('Network error'));

    render(<CompaniesPage />);

    await vi.waitFor(() => {
      expect(message.error).toHaveBeenCalledWith('failedToLoadCompanies');
    });
  });

  it('search filter calls API with search param', async () => {
    mockGetOwnerCompanies.mockResolvedValue(mockCompanies);

    render(<CompaniesPage />);

    await vi.waitFor(() => {
      expect(screen.getByText('Acme Corp')).toBeInTheDocument();
    });

    const searchInput = screen.getByTestId('search-input');
    fireEvent.change(searchInput, { target: { value: 'acme' } });

    // Debounce of 400ms
    await vi.waitFor(() => {
      expect(mockGetOwnerCompanies).toHaveBeenCalledWith(
        expect.objectContaining({ search: 'acme', page: 1 })
      );
    }, { timeout: 1000 });
  });

  it('deactivate button calls deactivateCompany for active company', async () => {
    mockGetOwnerCompanies.mockResolvedValue(mockCompanies);
    mockDeactivateCompany.mockResolvedValue({});

    render(<CompaniesPage />);

    await vi.waitFor(() => {
      expect(screen.getByText('Acme Corp')).toBeInTheDocument();
    });

    // Find the deactivate button (danger button for active company comp-1)
    const row = screen.getByTestId('row-comp-1');
    const dangerButton = row.querySelector('[data-danger="true"]');
    expect(dangerButton).toBeTruthy();

    fireEvent.click(dangerButton!);

    await vi.waitFor(() => {
      expect(mockDeactivateCompany).toHaveBeenCalledWith('comp-1');
    });
  });
});
