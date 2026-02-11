import axios, { AxiosInstance } from 'axios';
import type * as API from '@/types/api';

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

    // Request interceptor - attach token
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

    // Response interceptor - handle token refresh
    this.client.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            const refreshToken = this.getRefreshToken();
            if (refreshToken) {
              const response = await this.refreshToken({ refresh_token: refreshToken });
              this.setToken(response.data.access);
              originalRequest.headers.Authorization = `Bearer ${response.data.access}`;
              return this.client(originalRequest);
            }
          } catch (refreshError) {
            this.clearTokens();
            if (typeof window !== 'undefined') {
              window.location.href = '/login';
            }
            return Promise.reject(refreshError);
          }
        }

        return Promise.reject(error);
      }
    );
  }

  // ============================================================================
  // TOKEN MANAGEMENT
  // ============================================================================

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
      localStorage.removeItem('user_type'); // owner or company_user
    }
  }

  private saveUserData(data: any, userType: 'owner' | 'company_user') {
    if (typeof window !== 'undefined') {
      localStorage.setItem('user', JSON.stringify(data));
      localStorage.setItem('user_type', userType);
    }
  }

  // ============================================================================
  // COMPANY USER AUTH
  // ============================================================================

  async register(data: API.RegisterRequest) {
    const response = await this.client.post<API.AuthorizedResponse>('/api/v1/auth/register', data);
    this.setToken(response.data.credentials.access);
    if (typeof window !== 'undefined') {
      localStorage.setItem('refresh_token', response.data.credentials.refresh);
      this.saveUserData(response.data, 'company_user');
    }
    return response.data;
  }

  async login(data: API.LoginRequest) {
    const response = await this.client.post<API.AuthorizedResponse>('/api/v1/auth/login', data);
    this.setToken(response.data.credentials.access);
    if (typeof window !== 'undefined') {
      localStorage.setItem('refresh_token', response.data.credentials.refresh);
      this.saveUserData(response.data, 'company_user');
    }
    return response.data;
  }

  async refreshToken(data: API.RefreshTokenRequest) {
    return this.client.post('/api/v1/auth/refresh', data);
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

  // ============================================================================
  // OWNER AUTH
  // ============================================================================

  async ownerRegister(data: API.OwnerRegisterRequest) {
    const response = await this.client.post<API.OwnerWithCredentials>('/api/v1/owner/auth/register', data);
    this.setToken(response.data.credentials.access);
    if (typeof window !== 'undefined') {
      localStorage.setItem('refresh_token', response.data.credentials.refresh);
      this.saveUserData(response.data, 'owner');
    }
    return response.data;
  }

  async ownerLogin(data: API.OwnerLoginRequest) {
    const response = await this.client.post<API.OwnerWithCredentials>('/api/v1/owner/auth/login', data);
    this.setToken(response.data.credentials.access);
    if (typeof window !== 'undefined') {
      localStorage.setItem('refresh_token', response.data.credentials.refresh);
      this.saveUserData(response.data, 'owner');
    }
    return response.data;
  }

  async getOwnerProfile() {
    const response = await this.client.get<API.OwnerResponse>('/api/v1/owner/auth/me');
    return response.data;
  }

  // ============================================================================
  // OWNER - COMPANY MANAGEMENT
  // ============================================================================

  async createCompany(data: API.CompanyCreateRequest) {
    const response = await this.client.post<API.CompanyDetailResponse>('/api/v1/owner/companies/', data);
    return response.data;
  }

  async getOwnerCompanies() {
    const response = await this.client.get<API.CompanyResponse[]>('/api/v1/owner/companies/');
    return response.data;
  }

  async getCompanyDetail(companyId: string) {
    const response = await this.client.get<API.CompanyDetailResponse>(`/api/v1/owner/companies/${companyId}`);
    return response.data;
  }

  async updateCompany(companyId: string, data: API.CompanyUpdateRequest) {
    const response = await this.client.put<API.CompanyResponse>(`/api/v1/owner/companies/${companyId}`, data);
    return response.data;
  }

  async deleteCompany(companyId: string, hard: boolean = false) {
    return this.client.delete(`/api/v1/owner/companies/${companyId}`, {
      params: { hard },
    });
  }

  async activateCompany(companyId: string) {
    const response = await this.client.post<API.CompanyResponse>(`/api/v1/owner/companies/${companyId}/activate`);
    return response.data;
  }

  async deactivateCompany(companyId: string) {
    const response = await this.client.post<API.CompanyResponse>(`/api/v1/owner/companies/${companyId}/deactivate`);
    return response.data;
  }

  // ============================================================================
  // OWNER - ANALYTICS
  // ============================================================================

  async getOwnerPlatformAnalytics(params: API.DateRangeParams & { period?: string }) {
    const response = await this.client.get<API.PlatformAnalytics>('/api/v1/owner/analytics/platform', { params });
    return response.data;
  }

  async getOwnerDashboard() {
    const response = await this.client.get<API.OwnerDashboard>('/api/v1/owner/analytics/dashboard');
    return response.data;
  }

  async clearOwnerCache() {
    return this.client.delete('/api/v1/owner/analytics/cache');
  }

  // ============================================================================
  // COMPANY - USER MANAGEMENT
  // ============================================================================

  async inviteUser(data: API.UserInviteRequest) {
    const response = await this.client.post<API.UserResponse>('/api/v1/company/users/invite', data);
    return response.data;
  }

  async getUsers(params: API.UserFilters) {
    const response = await this.client.get<API.UserListResponse>('/api/v1/company/users/', { params });
    return response.data;
  }

  async getUser(userId: string) {
    const response = await this.client.get<API.UserDetailResponse>(`/api/v1/company/users/${userId}`);
    return response.data;
  }

  async updateUser(userId: string, data: API.UserUpdateRequest) {
    const response = await this.client.put<API.UserResponse>(`/api/v1/company/users/${userId}`, data);
    return response.data;
  }

  async deleteUser(userId: string, hard: boolean = false) {
    return this.client.delete(`/api/v1/company/users/${userId}`, {
      params: { hard },
    });
  }

  async activateUser(userId: string) {
    const response = await this.client.post<API.UserResponse>(`/api/v1/company/users/${userId}/activate`);
    return response.data;
  }

  async deactivateUser(userId: string) {
    const response = await this.client.post<API.UserResponse>(`/api/v1/company/users/${userId}/deactivate`);
    return response.data;
  }

  async changePassword(data: API.PasswordChangeRequest) {
    return this.client.post('/api/v1/company/users/me/change-password', data);
  }

  async resetPassword(data: API.PasswordResetRequest) {
    return this.client.post('/api/v1/company/users/reset-password', data);
  }

  // ============================================================================
  // COMPANY - CALLS
  // ============================================================================

  async makeCall(data: API.CallRequest) {
    const response = await this.client.post<API.CallResponse>('/api/v1/company/calls/', data);
    return response.data;
  }

  async getCalls(params: { skip?: number; limit?: number }) {
    const response = await this.client.get<API.CallEventResponse[]>('/api/v1/company/calls/', { params });
    return response.data;
  }

  async getCall(callId: string) {
    const response = await this.client.get<API.CallEventResponse>(`/api/v1/company/calls/${callId}`);
    return response.data;
  }

  async getCallRecording(callId: string) {
    const response = await this.client.get<API.CallRecordingURL>(`/api/v1/company/calls/${callId}/recording`);
    return response.data;
  }

  async setCallOutcome(callId: string, data: API.CallOutcomeUpdate) {
    return this.client.put(`/api/v1/company/calls/${callId}/outcome`, data);
  }

  async linkCall(callId: string, data: API.CallLinkRequest) {
    return this.client.post(`/api/v1/company/calls/${callId}/link`, data);
  }

  async getCallHistory(params: API.CallHistoryFilters) {
    const response = await this.client.get<API.PaginatedResponse<API.CallEventResponse>>('/api/v1/company/calls/history', { params });
    return response.data;
  }

  async getCallOutcomesSummary(params: API.DateRangeParams & { operator_id?: string }) {
    const response = await this.client.get('/api/v1/company/calls/outcomes/summary', { params });
    return response.data;
  }

  async getAutoLinkSuggestions(phoneNumber: string) {
    const response = await this.client.get(`/api/v1/company/calls/auto-link-suggestions/${phoneNumber}`);
    return response.data;
  }

  // ============================================================================
  // COMPANY - CONTACTS
  // ============================================================================

  async createContact(data: API.ContactCreateRequest) {
    const response = await this.client.post<API.ContactResponse>('/api/v1/company/contacts/', data);
    return response.data;
  }

  async getContacts(params: API.ContactFilters) {
    const response = await this.client.get<API.PaginatedResponse<API.ContactResponse>>('/api/v1/company/contacts/', { params });
    return response.data;
  }

  async getContact(contactId: string) {
    const response = await this.client.get<API.ContactResponse>(`/api/v1/company/contacts/${contactId}`);
    return response.data;
  }

  async updateContact(contactId: string, data: API.ContactUpdateRequest) {
    const response = await this.client.put<API.ContactResponse>(`/api/v1/company/contacts/${contactId}`, data);
    return response.data;
  }

  async deleteContact(contactId: string, hard: boolean = false) {
    return this.client.delete(`/api/v1/company/contacts/${contactId}`, {
      params: { hard },
    });
  }

  async getContactActivity(contactId: string, limit: number = 20) {
    const response = await this.client.get(`/api/v1/company/contacts/${contactId}/activity`, {
      params: { limit },
    });
    return response.data;
  }

  async bulkCreateContacts(data: API.ContactCreateRequest[]) {
    const response = await this.client.post<API.ContactResponse[]>('/api/v1/company/contacts/bulk', data);
    return response.data;
  }

  // ============================================================================
  // COMPANY - LEADS
  // ============================================================================

  async createLead(data: API.LeadCreateRequest) {
    const response = await this.client.post<API.LeadResponse>('/api/v1/company/leads/', data);
    return response.data;
  }

  async getLeads(params: API.LeadFilters) {
    const response = await this.client.get<API.PaginatedResponse<API.LeadResponse>>('/api/v1/company/leads/', { params });
    return response.data;
  }

  async getLead(leadId: string) {
    const response = await this.client.get<API.LeadResponse>(`/api/v1/company/leads/${leadId}`);
    return response.data;
  }

  async updateLead(leadId: string, data: API.LeadUpdateRequest) {
    const response = await this.client.put<API.LeadResponse>(`/api/v1/company/leads/${leadId}`, data);
    return response.data;
  }

  async deleteLead(leadId: string, hard: boolean = false) {
    return this.client.delete(`/api/v1/company/leads/${leadId}`, {
      params: { hard },
    });
  }

  async convertLead(leadId: string, createDeal: boolean = true) {
    const response = await this.client.post(`/api/v1/company/leads/${leadId}/convert`, null, {
      params: { create_deal: createDeal },
    });
    return response.data;
  }

  async assignLead(leadId: string, assignedTo: string) {
    const response = await this.client.post<API.LeadResponse>(`/api/v1/company/leads/${leadId}/assign`, null, {
      params: { assigned_to: assignedTo },
    });
    return response.data;
  }

  // ============================================================================
  // COMPANY - DEALS
  // ============================================================================

  async createDeal(data: API.DealCreateRequest) {
    const response = await this.client.post<API.DealResponse>('/api/v1/company/deals/', data);
    return response.data;
  }

  async getDeals(params: API.DealFilters) {
    const response = await this.client.get<API.PaginatedResponse<API.DealResponse>>('/api/v1/company/deals/', { params });
    return response.data;
  }

  async getDeal(dealId: string) {
    const response = await this.client.get<API.DealResponse>(`/api/v1/company/deals/${dealId}`);
    return response.data;
  }

  async updateDeal(dealId: string, data: API.DealUpdateRequest) {
    const response = await this.client.put<API.DealResponse>(`/api/v1/company/deals/${dealId}`, data);
    return response.data;
  }

  async deleteDeal(dealId: string, hard: boolean = false) {
    return this.client.delete(`/api/v1/company/deals/${dealId}`, {
      params: { hard },
    });
  }

  async markDealWon(dealId: string, winReason?: string) {
    const response = await this.client.post<API.DealResponse>(`/api/v1/company/deals/${dealId}/win`, null, {
      params: { win_reason: winReason },
    });
    return response.data;
  }

  async markDealLost(dealId: string, lossReason?: string) {
    const response = await this.client.post<API.DealResponse>(`/api/v1/company/deals/${dealId}/lose`, null, {
      params: { loss_reason: lossReason },
    });
    return response.data;
  }

  async getPipelineSummary() {
    const response = await this.client.get('/api/v1/company/deals/pipeline/summary');
    return response.data;
  }

  // ============================================================================
  // COMPANY - TASKS
  // ============================================================================

  async createTask(data: API.TaskCreateRequest) {
    const response = await this.client.post<API.TaskResponse>('/api/v1/company/tasks/', data);
    return response.data;
  }

  async getTasks(params: API.TaskFilters) {
    const response = await this.client.get<API.PaginatedResponse<API.TaskResponse>>('/api/v1/company/tasks/', { params });
    return response.data;
  }

  async getMyTasksToday() {
    const response = await this.client.get<API.TaskResponse[]>('/api/v1/company/tasks/my-today');
    return response.data;
  }

  async getTask(taskId: string) {
    const response = await this.client.get<API.TaskResponse>(`/api/v1/company/tasks/${taskId}`);
    return response.data;
  }

  async updateTask(taskId: string, data: API.TaskUpdateRequest) {
    const response = await this.client.put<API.TaskResponse>(`/api/v1/company/tasks/${taskId}`, data);
    return response.data;
  }

  async deleteTask(taskId: string, hard: boolean = false) {
    return this.client.delete(`/api/v1/company/tasks/${taskId}`, {
      params: { hard },
    });
  }

  async completeTask(taskId: string) {
    const response = await this.client.post<API.TaskResponse>(`/api/v1/company/tasks/${taskId}/complete`);
    return response.data;
  }

  // ============================================================================
  // COMPANY - NOTES
  // ============================================================================

  async createNote(data: API.NoteCreateRequest) {
    const response = await this.client.post<API.NoteResponse>('/api/v1/company/notes/', data);
    return response.data;
  }

  async getNotes(params: API.NoteFilters) {
    const response = await this.client.get<API.PaginatedResponse<API.NoteResponse>>('/api/v1/company/notes/', { params });
    return response.data;
  }

  async getNote(noteId: string) {
    const response = await this.client.get<API.NoteResponse>(`/api/v1/company/notes/${noteId}`);
    return response.data;
  }

  async updateNote(noteId: string, data: API.NoteUpdateRequest) {
    const response = await this.client.put<API.NoteResponse>(`/api/v1/company/notes/${noteId}`, data);
    return response.data;
  }

  async deleteNote(noteId: string, hard: boolean = false) {
    return this.client.delete(`/api/v1/company/notes/${noteId}`, {
      params: { hard },
    });
  }

  async getEntityNotes(entityType: string, entityId: string) {
    const response = await this.client.get(`/api/v1/company/notes/timeline/${entityType}/${entityId}`);
    return response.data;
  }

  // ============================================================================
  // COMPANY - ANALYTICS
  // ============================================================================

  async getMyAnalytics(params: API.DateRangeParams & { period?: string }) {
    const response = await this.client.get<API.OperatorAnalytics>('/api/v1/company/analytics/me', { params });
    return response.data;
  }

  async getMyDashboard() {
    const response = await this.client.get<API.OperatorDashboard>('/api/v1/company/analytics/me/dashboard');
    return response.data;
  }

  async getTeamAnalytics(params: API.DateRangeParams & { period?: string }) {
    const response = await this.client.get<API.TeamAnalytics>('/api/v1/company/analytics/team', { params });
    return response.data;
  }

  async getAdminDashboard() {
    const response = await this.client.get<API.AdminDashboard>('/api/v1/company/analytics/team/dashboard');
    return response.data;
  }

  async getOperatorAnalytics(userId: string, params: API.DateRangeParams & { period?: string }) {
    const response = await this.client.get<API.OperatorAnalytics>(`/api/v1/company/analytics/operator/${userId}`, { params });
    return response.data;
  }

  async clearAnalyticsCache() {
    return this.client.delete('/api/v1/company/analytics/cache');
  }

  // ============================================================================
  // SIPUNI INTEGRATION
  // ============================================================================

  async getSipuniList() {
    const response = await this.client.get<API.SipuniResponse[]>('/api/v1/sipuni/');
    return response.data;
  }

  async makeInternalCall(data: API.CallNumberRequest) {
    const response = await this.client.post('/api/v1/sipuni/call/number', data);
    return response.data;
  }

  async makeExternalCall(data: API.ExternalCallRequest) {
    const response = await this.client.post('/api/v1/sipuni/call/external', data);
    return response.data;
  }

  async makeCallTree(data: API.CallTreeRequest) {
    const response = await this.client.post('/api/v1/sipuni/call/tree', data);
    return response.data;
  }

  async createSipuni(data: API.SipuniCreateRequest) {
    const response = await this.client.post<API.SipuniResponse>('/api/v1/sipuni/', data);
    return response.data;
  }

  async updateSipuni(data: API.SipuniUpdateRequest) {
    const { id, ...updateData } = data;
    const response = await this.client.put<API.SipuniResponse>(`/api/v1/sipuni/${id}`, updateData);
    return response.data;
  }

  async deleteSipuni(id: number) {
    return this.client.delete(`/api/v1/sipuni/${id}`);
  }

  async regenerateSipuniToken(id: string) {
    const response = await this.client.post<API.SipuniResponse>(`/api/v1/sipuni/${id}/regenerate-token`);
    return response.data;
  }
}

export const apiClient = new ApiClient();
