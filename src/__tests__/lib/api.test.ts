import { describe, it, expect, beforeEach, vi } from 'vitest';
import axios from 'axios';

// vi.mock is hoisted — factory must not reference outer variables
vi.mock('axios', () => {
  const mockGet = vi.fn();
  const mockPost = vi.fn();
  const mockPut = vi.fn();
  const mockDelete = vi.fn();

  const mockAxiosInstance = {
    get: mockGet,
    post: mockPost,
    put: mockPut,
    delete: mockDelete,
    interceptors: {
      request: {
        use: vi.fn(),
      },
      response: {
        use: vi.fn(),
      },
    },
  };

  return {
    default: {
      create: vi.fn(() => mockAxiosInstance),
      post: vi.fn(),
    },
  };
});

// Import after mocking
import { apiClient } from '@/lib/api';

// Helper to get the mock axios instance methods
function getMockAxios() {
  const instance = (axios.create as ReturnType<typeof vi.fn>).mock.results[0]?.value;
  return {
    get: instance.get as ReturnType<typeof vi.fn>,
    post: instance.post as ReturnType<typeof vi.fn>,
    put: instance.put as ReturnType<typeof vi.fn>,
    delete: instance.delete as ReturnType<typeof vi.fn>,
    requestInterceptor: instance.interceptors.request.use as ReturnType<typeof vi.fn>,
    responseInterceptor: instance.interceptors.response.use as ReturnType<typeof vi.fn>,
  };
}

beforeEach(() => {
  const mock = getMockAxios();
  mock.get.mockReset();
  mock.post.mockReset();
  mock.put.mockReset();
  mock.delete.mockReset();
  localStorage.clear();
});

describe('API Client', () => {
  describe('singleton', () => {
    it('apiClient is a singleton instance', async () => {
      const { apiClient: apiClient2 } = await import('@/lib/api');
      expect(apiClient).toBe(apiClient2);
    });
  });

  describe('ownerLogin', () => {
    it('calls POST /api/v1/owner/auth/login and saves tokens', async () => {
      const mock = getMockAxios();
      const loginData = { email: 'owner@example.com', password: 'ownerpass' };
      const responseData = {
        id: '1',
        email: 'owner@example.com',
        credentials: { access: 'owner-access', refresh: 'owner-refresh' },
      };

      mock.post.mockResolvedValueOnce({ data: responseData });

      const result = await apiClient.ownerLogin(loginData);

      expect(mock.post).toHaveBeenCalledWith('/api/v1/owner/auth/login', loginData);
      expect(result).toEqual(responseData);
      expect(localStorage.getItem('access_token')).toBe('owner-access');
      expect(localStorage.getItem('refresh_token')).toBe('owner-refresh');
      expect(localStorage.getItem('user_type')).toBe('owner');
    });
  });

  describe('logout', () => {
    it('removes tokens from localStorage', () => {
      localStorage.setItem('access_token', 'token');
      localStorage.setItem('refresh_token', 'refresh');
      localStorage.setItem('user', 'data');
      localStorage.setItem('user_type', 'company_user');

      apiClient.logout();

      expect(localStorage.getItem('access_token')).toBeNull();
      expect(localStorage.getItem('refresh_token')).toBeNull();
      expect(localStorage.getItem('user')).toBeNull();
      expect(localStorage.getItem('user_type')).toBeNull();
    });
  });

  describe('getContacts', () => {
    it('calls GET /api/v1/company/contacts/', async () => {
      const mock = getMockAxios();
      const params = { page: 1, page_size: 20 };
      const responseData = { items: [], total: 0 };

      mock.get.mockResolvedValueOnce({ data: responseData });

      const result = await apiClient.getContacts(params);

      expect(mock.get).toHaveBeenCalledWith('/api/v1/company/contacts/', { params });
      expect(result).toEqual(responseData);
    });
  });

  describe('getMyProfile', () => {
    it('calls GET /api/v1/company/users/me', async () => {
      const mock = getMockAxios();
      const profileData = {
        id: '1',
        email: 'test@example.com',
        first_name: 'Test',
        is_active: true,
      };

      mock.get.mockResolvedValueOnce({ data: profileData });

      const result = await apiClient.getMyProfile();

      expect(mock.get).toHaveBeenCalledWith('/api/v1/company/users/me');
      expect(result).toEqual(profileData);
    });
  });

  describe('getOwnerProfile', () => {
    it('calls GET /api/v1/owner/auth/me', async () => {
      const mock = getMockAxios();
      const profileData = {
        id: '1',
        email: 'owner@example.com',
        first_name: 'Owner',
        is_active: true,
      };

      mock.get.mockResolvedValueOnce({ data: profileData });

      const result = await apiClient.getOwnerProfile();

      expect(mock.get).toHaveBeenCalledWith('/api/v1/owner/auth/me');
      expect(result).toEqual(profileData);
    });
  });

  describe('request interceptor', () => {
    it('attaches token to requests via interceptor', () => {
      const mock = getMockAxios();
      // The request interceptor should have been registered
      expect(mock.requestInterceptor).toHaveBeenCalled();

      // Get the interceptor function
      const interceptorFn = mock.requestInterceptor.mock.calls[0][0];

      localStorage.setItem('access_token', 'my-token');

      const config = { headers: {} as Record<string, string> };
      const result = interceptorFn(config);

      expect(result.headers.Authorization).toBe('Bearer my-token');
    });

    it('does not attach Authorization header when no token exists', () => {
      const mock = getMockAxios();
      const interceptorFn = mock.requestInterceptor.mock.calls[0][0];

      localStorage.removeItem('access_token');

      const config = { headers: {} as Record<string, string> };
      const result = interceptorFn(config);

      expect(result.headers.Authorization).toBeUndefined();
    });
  });

  describe('response interceptor', () => {
    it('401 response triggers refresh flow', async () => {
      const mock = getMockAxios();
      expect(mock.responseInterceptor).toHaveBeenCalled();

      const errorHandler = mock.responseInterceptor.mock.calls[0][1];

      localStorage.setItem('user_type', 'company_user');
      localStorage.setItem('refresh_token', 'old-refresh');

      const originalRequest = {
        url: '/api/v1/company/contacts/',
        headers: {} as Record<string, string>,
        _retry: false,
      };

      const error = {
        response: { status: 401 },
        config: originalRequest,
      };

      // Mock the refresh call on the raw axios.post
      vi.mocked(axios.post).mockResolvedValueOnce({
        data: { access: 'new-access-token' },
      });

      // The instance method will be called for retry — mock it
      mock.get.mockResolvedValueOnce({ data: { items: [] } });

      try {
        await errorHandler(error);
      } catch {
        // May throw if the retry mock doesn't perfectly match
      }

      // Verify refresh was attempted
      expect(axios.post).toHaveBeenCalledWith(
        expect.stringContaining('/api/v1/auth/refresh'),
        { refresh_token: 'old-refresh' },
        { withCredentials: true }
      );
    });
  });
});
