import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { useAuthStore } from '@/store/auth';

// Mock apiClient
const mockGetTasks = vi.fn();
vi.mock('@/lib/api', () => ({
  apiClient: {
    getTasks: (...args: unknown[]) => mockGetTasks(...args),
    completeTask: vi.fn(),
    getMyProfile: vi.fn(),
    getOwnerProfile: vi.fn(),
    logout: vi.fn(),
  },
}));

// Mock antd
vi.mock('antd', () => ({
  Button: ({ children, onClick, ...props }: any) => (
    <button onClick={onClick} {...props}>{children}</button>
  ),
  Input: Object.assign(
    ({ value, onChange, placeholder, ...props }: any) => (
      <input value={value} onChange={onChange} placeholder={placeholder} {...props} />
    ),
    {
      Search: ({ value, onChange, placeholder, ...props }: any) => (
        <input value={value} onChange={onChange} placeholder={placeholder} {...props} />
      ),
    }
  ),
  Select: ({ value, onChange, options, placeholder, ...props }: any) => (
    <select
      value={value}
      onChange={(e: any) => onChange?.(e.target.value)}
      data-testid={placeholder || 'select'}
      {...props}
    >
      {placeholder && <option value="">{placeholder}</option>}
      {options?.map((o: any) => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  ),
  Tag: ({ children, ...props }: any) => <span {...props}>{children}</span>,
  Pagination: ({ current, total, onChange }: any) => (
    <div data-testid="pagination">Page {current}</div>
  ),
  Checkbox: ({ children, checked, onChange, ...props }: any) => (
    <label><input type="checkbox" checked={checked} onChange={onChange} {...props} />{children}</label>
  ),
  message: {
    error: vi.fn(),
    success: vi.fn(),
  },
}));

// Mock @ant-design/icons
vi.mock('@ant-design/icons', () => ({
  PlusOutlined: () => <span>plus-icon</span>,
  CalendarOutlined: () => <span>calendar-icon</span>,
  UserOutlined: () => <span>user-icon</span>,
  ExclamationCircleOutlined: () => <span>exclamation-icon</span>,
  CheckSquareOutlined: () => <span>check-icon</span>,
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

import TasksPage from '@/app/(company)/tasks/page';

beforeEach(() => {
  vi.clearAllMocks();
  useAuthStore.setState({
    permissions: ['tasks.read', 'tasks.write', 'tasks.delete'],
    isAuthenticated: true,
  });
});

describe('Tasks Page', () => {
  it('renders task list after data loads', async () => {
    mockGetTasks.mockResolvedValue({
      items: [
        {
          id: 'task-1',
          title: 'Follow up with client',
          description: 'Call them back',
          status: 'pending',
          priority: 'high',
          due_date: '2026-06-01T00:00:00Z',
          assigned_to_name: 'Alice',
          entity_type: null,
          entity_id: null,
        },
        {
          id: 'task-2',
          title: 'Prepare report',
          description: null,
          status: 'in_progress',
          priority: 'medium',
          due_date: null,
          assigned_to_name: null,
          entity_type: null,
          entity_id: null,
        },
      ],
      total: 2,
      page: 1,
      page_size: 20,
      total_pages: 1,
    });

    render(<TasksPage />);

    await vi.waitFor(() => {
      expect(screen.getByText('Follow up with client')).toBeInTheDocument();
    });

    expect(screen.getByText('Prepare report')).toBeInTheDocument();
  });

  it('shows status filter', async () => {
    mockGetTasks.mockResolvedValue({
      items: [],
      total: 0,
      page: 1,
      page_size: 20,
      total_pages: 0,
    });

    render(<TasksPage />);

    await vi.waitFor(() => {
      expect(screen.getByTestId('allStatuses')).toBeInTheDocument();
    });

    // Status options are rendered
    expect(screen.getByText('pending')).toBeInTheDocument();
    expect(screen.getByText('inProgress')).toBeInTheDocument();
    expect(screen.getByText('completed')).toBeInTheDocument();
  });

  it('shows error state on failure', async () => {
    mockGetTasks.mockRejectedValue(new Error('Network error'));

    render(<TasksPage />);

    await vi.waitFor(() => {
      expect(screen.getByText('somethingWentWrong')).toBeInTheDocument();
    });

    expect(screen.getByTestId('error-character')).toBeInTheDocument();
    expect(screen.getByText('tryAgain')).toBeInTheDocument();
  });

  it('shows empty state when no tasks', async () => {
    mockGetTasks.mockResolvedValue({
      items: [],
      total: 0,
      page: 1,
      page_size: 20,
      total_pages: 0,
    });

    render(<TasksPage />);

    await vi.waitFor(() => {
      expect(screen.getByText('noTasksFound')).toBeInTheDocument();
    });

    expect(screen.getByTestId('empty-state')).toBeInTheDocument();
  });

  it('shows create button', async () => {
    mockGetTasks.mockResolvedValue({
      items: [],
      total: 0,
      page: 1,
      page_size: 20,
      total_pages: 0,
    });

    render(<TasksPage />);

    await vi.waitFor(() => {
      expect(screen.getAllByText('addTask').length).toBeGreaterThan(0);
    });

    // Verify at least one link points to /tasks/new
    const links = screen.getAllByText('addTask');
    const link = links[0].closest('a');
    expect(link).toHaveAttribute('href', '/tasks/new');
  });
});
