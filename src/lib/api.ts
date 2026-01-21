import axios, { AxiosInstance } from 'axios';
import type {
  LoginRequest,
  RegisterRequest,
  AuthorizedResponse,
  SipuniCreateRequest,
  SipuniUpdateRequest,
  SipuniResponse,
  CallNumberRequest,
  ExternalCallRequest,
  CallTreeRequest,
  CallStatisticsParams,
} from '@/types/api';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add request interceptor to attach token
    this.client.interceptors.request.use(
      (config) => {
        const token = this.getToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Add response interceptor to handle token refresh
    this.client.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            const refreshToken = this.getRefreshToken();
            if (refreshToken) {
              const response = await this.refreshToken(refreshToken);
              this.setToken(response.data.access);
              originalRequest.headers.Authorization = `Bearer ${response.data.access}`;
              return this.client(originalRequest);
            }
          } catch (refreshError) {
            this.clearTokens();
            window.location.href = '/login';
            return Promise.reject(refreshError);
          }
        }

        return Promise.reject(error);
      }
    );
  }

  private getToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('access_token');
    }
    return null;
  }

  private getRefreshToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('refresh_token');
    }
    return null;
  }

  private setToken(token: string) {
    if (typeof window !== 'undefined') {
      localStorage.setItem('access_token', token);
    }
  }

  private clearTokens() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user');
    }
  }

  // Auth endpoints
  async register(data: RegisterRequest) {
    const response = await this.client.post<AuthorizedResponse>('/api/v1/auth/register', data);
    this.setToken(response.data.credentials.access);
    if (typeof window !== 'undefined') {
      localStorage.setItem('refresh_token', response.data.credentials.refresh);
      localStorage.setItem('user', JSON.stringify(response.data));
    }
    return response.data;
  }

  async login(data: LoginRequest) {
    const response = await this.client.post<AuthorizedResponse>('/api/v1/auth/login', data);
    this.setToken(response.data.credentials.access);
    if (typeof window !== 'undefined') {
      localStorage.setItem('refresh_token', response.data.credentials.refresh);
      localStorage.setItem('user', JSON.stringify(response.data));
    }
    return response.data;
  }

  async refreshToken(token: string) {
    return this.client.get('/api/v1/auth/refresh', {
      params: { token },
    });
  }

  async sendVerificationCode() {
    return this.client.get('/api/v1/auth/send_verification');
  }

  async confirmVerification() {
    return this.client.get('/api/v1/auth/confirm_verification');
  }

  logout() {
    this.clearTokens();
  }

  // Sipuni endpoints
  async createSipuni(data: SipuniCreateRequest) {
    const response = await this.client.post<SipuniResponse>('/api/v1/sipuni/create', data);
    return response.data;
  }

  async getSipuniList() {
    const response = await this.client.get<SipuniResponse[]>('/api/v1/sipuni/list');
    return response.data;
  }

  async getSipuniDetail(id: string) {
    const response = await this.client.get<SipuniResponse>('/api/v1/sipuni/detail', {
      params: { id },
    });
    return response.data;
  }

  async updateSipuni(data: SipuniUpdateRequest) {
    const response = await this.client.patch<SipuniResponse>('/api/v1/sipuni/update', data);
    return response.data;
  }

  async deleteSipuni(id: number) {
    return this.client.delete('/api/v1/sipuni/delete', {
      params: { id },
    });
  }

  async regenerateSipuniToken(id: number) {
    return this.client.post('/api/v1/sipuni/regenerate_token', null, {
      params: { id },
    });
  }

  // Call endpoints
  async makeInternalCall(data: CallNumberRequest) {
    return this.client.post('/api/v1/sipuni/internal_call', data);
  }

  async makeExternalCall(data: ExternalCallRequest) {
    return this.client.post('/api/v1/sipuni/external_call', data);
  }

  async makeCallTree(data: CallTreeRequest) {
    return this.client.post('/api/v1/sipuni/call_tree', data);
  }

  // Statistics endpoints
  async getCallStatistics(params: CallStatisticsParams) {
    const response = await this.client.get('/api/v1/statistics/calls', { params });
    return response.data;
  }

  // Stream endpoint
  async getStream(id: string) {
    return this.client.get(`/api/v1/sipuni/stream/${id}/`);
  }
}

export const apiClient = new ApiClient();
