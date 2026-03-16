import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';

// Mock apiClient
const mockCreateLoginChallenge = vi.fn();
const mockPollChallengeStatus = vi.fn();
const mockVerifyOtp = vi.fn();
const mockGetMyProfile = vi.fn();
const mockConsumeImpersonationToken = vi.fn();
vi.mock('@/lib/api', () => ({
  apiClient: {
    createLoginChallenge: (...args: unknown[]) => mockCreateLoginChallenge(...args),
    pollChallengeStatus: (...args: unknown[]) => mockPollChallengeStatus(...args),
    verifyOtp: (...args: unknown[]) => mockVerifyOtp(...args),
    getMyProfile: (...args: unknown[]) => mockGetMyProfile(...args),
    consumeImpersonationToken: (...args: unknown[]) => mockConsumeImpersonationToken(...args),
    getOwnerProfile: vi.fn(),
    logout: vi.fn(),
  },
}));

vi.mock('@/lib/utils', () => ({
  getErrorMessage: (err: unknown, fallback: string) => fallback,
}));

// Mock next/navigation
const mockPush = vi.fn();
const mockReplace = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    replace: mockReplace,
    refresh: vi.fn(),
    back: vi.fn(),
    prefetch: vi.fn(),
  }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => '/login',
}));

// Mock antd
vi.mock('antd', () => ({
  Button: ({ children, onClick, disabled, loading: isLoading, icon, href, ...props }: any) => (
    <button onClick={onClick} disabled={disabled || isLoading} {...props}>
      {icon}{children}
    </button>
  ),
  Input: Object.assign(
    ({ value, onChange, placeholder, ...props }: any) => (
      <input
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        data-testid="otp-input"
        {...props}
      />
    ),
    {
      TextArea: ({ value, onChange, placeholder, ...props }: any) => (
        <textarea value={value} onChange={onChange} placeholder={placeholder} {...props} />
      ),
    }
  ),
  Alert: ({ title: msg, message: msg2, type, ...props }: any) => (
    <div data-testid="alert" role="alert" data-type={type}>{msg}</div>
  ),
  ConfigProvider: ({ children }: any) => <div>{children}</div>,
  theme: { defaultAlgorithm: {} },
  message: {
    error: vi.fn(),
    success: vi.fn(),
    warning: vi.fn(),
  },
}));

// Mock @ant-design/icons
vi.mock('@ant-design/icons', () => ({
  LoginOutlined: () => <span>login-icon</span>,
  SendOutlined: () => <span>send-icon</span>,
}));

// Mock AuthLayout
vi.mock('@/components/auth/AuthLayout', () => ({
  AuthLayout: ({ children, title, subtitle }: any) => (
    <div data-testid="auth-layout">
      <h2>{title}</h2>
      <p>{subtitle}</p>
      {children}
    </div>
  ),
}));

import { useAuthStore } from '@/store/auth';
import LoginPage from '@/app/login/page';

beforeEach(() => {
  vi.clearAllMocks();
  useAuthStore.setState({
    user: null,
    userType: null,
    isAuthenticated: false,
    isInitializing: false,
    isOwner: false,
    isCompanyUser: false,
    permissions: [],
    mustChangePassword: false,
  });
  // Mock window.open
  vi.spyOn(window, 'open').mockImplementation(() => null);
});

describe('Login Page', () => {
  it('renders login form with Telegram login button', () => {
    render(<LoginPage />);

    expect(screen.getByText('welcomeBack')).toBeInTheDocument();
    expect(screen.getByText('enterCredentials')).toBeInTheDocument();
    expect(screen.getByText('telegramLogin')).toBeInTheDocument();
  });

  it('starts Telegram login flow on button click', async () => {
    mockCreateLoginChallenge.mockResolvedValue({
      challenge_id: 'ch-123',
      deep_link: 'https://t.me/test_bot?start=ch-123',
    });

    render(<LoginPage />);

    fireEvent.click(screen.getByText('telegramLogin'));

    await vi.waitFor(() => {
      expect(mockCreateLoginChallenge).toHaveBeenCalled();
    });

    await vi.waitFor(() => {
      expect(window.open).toHaveBeenCalledWith('https://t.me/test_bot?start=ch-123', '_blank');
    });

    // Should show waiting state
    await vi.waitFor(() => {
      expect(screen.getByText('telegramWaitingBot')).toBeInTheDocument();
    });
  });

  it('shows error when Telegram login challenge fails', async () => {
    mockCreateLoginChallenge.mockRejectedValue(new Error('Server error'));

    render(<LoginPage />);

    fireEvent.click(screen.getByText('telegramLogin'));

    await vi.waitFor(() => {
      expect(screen.getByTestId('alert')).toBeInTheDocument();
      expect(screen.getByText('telegramLoginFailed')).toBeInTheDocument();
    });
  });

  it('shows cancel button in waiting state', async () => {
    mockCreateLoginChallenge.mockResolvedValue({
      challenge_id: 'ch-123',
      deep_link: 'https://t.me/test_bot?start=ch-123',
    });

    render(<LoginPage />);

    fireEvent.click(screen.getByText('telegramLogin'));

    await vi.waitFor(() => {
      expect(screen.getByText('telegramCancel')).toBeInTheDocument();
    });

    // Click cancel returns to idle state
    fireEvent.click(screen.getByText('telegramCancel'));

    await vi.waitFor(() => {
      expect(screen.getByText('telegramLogin')).toBeInTheDocument();
    });
  });

  it('shows expired state and retry button', async () => {
    vi.useFakeTimers();

    mockCreateLoginChallenge.mockResolvedValue({
      challenge_id: 'ch-123',
      deep_link: 'https://t.me/test_bot?start=ch-123',
    });
    // Poll returns expired
    mockPollChallengeStatus.mockResolvedValue({ status: 'expired' });

    render(<LoginPage />);

    // Click and flush the challenge promise
    await vi.runAllTimersAsync();
    fireEvent.click(screen.getByText('telegramLogin'));
    // Flush the createLoginChallenge promise
    await vi.runAllTimersAsync();

    // Advance past POLL_INTERVAL (2000ms) to trigger the first poll
    await vi.advanceTimersByTimeAsync(2500);

    expect(screen.getByText('telegramLinkExpired')).toBeInTheDocument();
    expect(screen.getByText('telegramTryAgain')).toBeInTheDocument();

    vi.useRealTimers();
  });
});
