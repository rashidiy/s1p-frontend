import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';

// Mock apiClient
const mockCreateTask = vi.fn();
const mockGetUsers = vi.fn();
vi.mock('@/lib/api', () => ({
  apiClient: {
    createTask: (...args: unknown[]) => mockCreateTask(...args),
    getUsers: (...args: unknown[]) => mockGetUsers(...args),
    getMyProfile: vi.fn(),
    getOwnerProfile: vi.fn(),
    logout: vi.fn(),
  },
}));

// Mock next/navigation
const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    replace: vi.fn(),
    refresh: vi.fn(),
    back: vi.fn(),
    prefetch: vi.fn(),
  }),
  usePathname: () => '/tasks/new',
  useSearchParams: () => new URLSearchParams(),
}));

// Mock antd
vi.mock('antd', () => ({
  Button: ({ children, onClick, loading, htmlType, disabled, ...props }: any) => (
    <button onClick={onClick} disabled={disabled || loading} type={htmlType} {...props}>
      {loading ? 'loading...' : children}
    </button>
  ),
  Input: Object.assign(
    ({ id, name, value, onChange, placeholder, required, disabled, ...props }: any) => (
      <input id={id} name={name} value={value} onChange={onChange} placeholder={placeholder} required={required} disabled={disabled} {...props} />
    ),
    {
      TextArea: ({ id, name, value, onChange, placeholder, disabled, ...props }: any) => (
        <textarea id={id} name={name} value={value} onChange={onChange} placeholder={placeholder} disabled={disabled} {...props} />
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
      {options?.map((opt: any) => (
        <option key={opt.value} value={opt.value}>{opt.label}</option>
      ))}
    </select>
  ),
  DatePicker: ({ id, value, onChange, ...props }: any) => (
    <input id={id} type="date" data-testid="date-picker" {...props} />
  ),
  Alert: ({ message: msg, type, ...props }: any) => (
    <div role="alert" data-type={type} {...props}>{msg}</div>
  ),
  message: {
    error: vi.fn(),
    success: vi.fn(),
    warning: vi.fn(),
  },
}));

// Mock @ant-design/icons
vi.mock('@ant-design/icons', () => ({
  ArrowLeftOutlined: () => <span>back-icon</span>,
}));

// Mock next/link
vi.mock('next/link', () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

// Mock dayjs
vi.mock('dayjs', () => {
  const dayjs = (val?: any) => ({
    toISOString: () => val || '2025-06-01T00:00:00.000Z',
    format: () => '2025-06-01',
  });
  dayjs.isDayjs = () => false;
  return { default: dayjs };
});

import NewTaskPage from '@/app/(company)/tasks/new/page';

beforeEach(() => {
  vi.clearAllMocks();
  mockGetUsers.mockResolvedValue({ users: [
    { id: 'user-1', first_name: 'Alice', last_name: 'Smith', email: 'alice@test.com', is_active: true },
    { id: 'user-2', first_name: 'Bob', last_name: null, email: 'bob@test.com', is_active: true },
  ]});
});

describe('New Task Page', () => {
  it('renders create task form', async () => {
    render(<NewTaskPage />);

    await vi.waitFor(() => {
      expect(screen.getByText('taskInformation')).toBeInTheDocument();
    });

    expect(screen.getByText('enterTaskDetails')).toBeInTheDocument();
    expect(screen.getByLabelText(/title/i)).toBeInTheDocument();
    expect(screen.getByText('createTask')).toBeInTheDocument();
  });

  it('has title field marked as required', async () => {
    render(<NewTaskPage />);

    await vi.waitFor(() => {
      expect(screen.getByText('taskInformation')).toBeInTheDocument();
    });

    const titleInput = screen.getByLabelText(/title/i);
    expect(titleInput).toHaveAttribute('required');
  });

  it('submits form and redirects on success', async () => {
    mockCreateTask.mockResolvedValue({ id: 'new-task-1' });

    render(<NewTaskPage />);

    await vi.waitFor(() => {
      expect(screen.getByText('taskInformation')).toBeInTheDocument();
    });

    // Fill in title
    const titleInput = screen.getByLabelText(/title/i);
    fireEvent.change(titleInput, { target: { value: 'Follow up with client' } });

    // Submit form
    const form = document.querySelector('form')!;
    fireEvent.submit(form);

    await vi.waitFor(() => {
      expect(mockCreateTask).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Follow up with client',
        })
      );
    });

    await vi.waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/tasks/new-task-1');
    });
  });

  it('shows error on API failure', async () => {
    mockCreateTask.mockRejectedValue({
      response: { data: { detail: 'Task creation failed' } },
    });

    render(<NewTaskPage />);

    await vi.waitFor(() => {
      expect(screen.getByText('taskInformation')).toBeInTheDocument();
    });

    const titleInput = screen.getByLabelText(/title/i);
    fireEvent.change(titleInput, { target: { value: 'Test task' } });

    const form = document.querySelector('form')!;
    fireEvent.submit(form);

    await vi.waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('Task creation failed');
    });
  });

  it('shows error message from translations when no detail in response', async () => {
    mockCreateTask.mockRejectedValue(new Error('Network error'));

    render(<NewTaskPage />);

    await vi.waitFor(() => {
      expect(screen.getByText('taskInformation')).toBeInTheDocument();
    });

    const titleInput = screen.getByLabelText(/title/i);
    fireEvent.change(titleInput, { target: { value: 'Test task' } });

    const form = document.querySelector('form')!;
    fireEvent.submit(form);

    await vi.waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('failedToCreateTask');
    });
  });

  it('renders priority selector with options', async () => {
    render(<NewTaskPage />);

    await vi.waitFor(() => {
      expect(screen.getByText('taskInformation')).toBeInTheDocument();
    });

    // Priority selector shows options
    expect(screen.getByText('low')).toBeInTheDocument();
    expect(screen.getByText('medium')).toBeInTheDocument();
    expect(screen.getByText('high')).toBeInTheDocument();
    expect(screen.getByText('urgent')).toBeInTheDocument();
  });
});
