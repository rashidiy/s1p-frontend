import axios, { AxiosInstance } from 'axios';
import type * as API from '@/types/api';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      withCredentials: true,
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
        const requestUrl = originalRequest?.url || '';

        // Never attempt token refresh on auth endpoints — login/register 401s are
        // expected "wrong credentials" responses, not expired sessions.
        // Also skip for /me profile endpoints (used by initAuth — if that fails,
        // the session is truly gone and we should just redirect to login).
        const isAuthEndpoint = /\/(auth|owner\/auth)\/(login|register|set-password|forgot-password|reset-password|refresh|me)/.test(requestUrl);

        if (error.response?.status === 401 && !originalRequest._retry && !isAuthEndpoint) {
          originalRequest._retry = true;

          try {
            // Determine which refresh endpoint to use based on user type
            const userType = typeof window !== 'undefined' ? localStorage.getItem('user_type') : null;
            const refreshUrl = userType === 'owner'
              ? `${API_BASE_URL}/api/v1/owner/auth/refresh`
              : `${API_BASE_URL}/api/v1/auth/refresh`;

            // Try refresh — cookies carry the refresh token
            const refreshToken = this.getRefreshToken();
            const response = await axios.post(refreshUrl,
              refreshToken ? { refresh_token: refreshToken } : {},
              { withCredentials: true }
            );
            if (response.data.access) {
              this.saveTokens(response.data);
              originalRequest.headers.Authorization = `Bearer ${response.data.access}`;
            }
            return this.client(originalRequest);
          } catch (refreshError) {
            // Clear tokens but preserve user_type — initAuth needs it to know
            // which profile endpoint to try on next page load
            this.clearSession();
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

  private clearTokens() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user');
      localStorage.removeItem('user_type');
    }
  }

  /** Clear session tokens but preserve user_type hint for initAuth */
  private clearSession() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user');
    }
  }

  private saveUserType(userType: 'owner' | 'company_user') {
    if (typeof window !== 'undefined') {
      localStorage.setItem('user_type', userType);
    }
  }

  private saveTokens(credentials: { access?: string; refresh?: string }) {
    if (typeof window !== 'undefined') {
      if (credentials.access) {
        localStorage.setItem('access_token', credentials.access);
      }
      if (credentials.refresh) {
        localStorage.setItem('refresh_token', credentials.refresh);
      }
    }
  }

  // ============================================================================
  // COMPANY USER AUTH
  // ============================================================================

  async getMyProfile() {
    const response = await this.client.get<API.UserResponse>('/api/v1/company/users/me');
    return response.data;
  }

  async updateMyProfile(data: API.ProfileUpdateRequest) {
    const response = await this.client.put<API.UserResponse>('/api/v1/company/users/me', data);
    return response.data;
  }

  async changePassword(data: API.ResetPasswordRequest) {
    return this.client.post('/api/v1/auth/reset-password', data);
  }

  async logout() {
    try {
      const userType = typeof window !== 'undefined' ? localStorage.getItem('user_type') : null;
      const logoutUrl = userType === 'owner'
        ? '/api/v1/owner/auth/logout'
        : '/api/v1/auth/logout';
      await this.client.post(logoutUrl);
    } catch {
      // Ignore errors — we're logging out regardless
    }
    this.clearTokens();
  }

  // ============================================================================
  // OWNER AUTH
  // ============================================================================

  async ownerLogin(data: API.OwnerLoginRequest) {
    const response = await this.client.post<API.OwnerWithCredentials>('/api/v1/owner/auth/login', data);
    if (response.data.must_change_password && response.data.temporary_token) {
      return response.data;
    }
    if (response.data.credentials) {
      this.saveTokens(response.data.credentials);
    }
    this.saveUserType('owner');
    return response.data;
  }

  async getOwnerProfile() {
    const response = await this.client.get<API.OwnerResponse>('/api/v1/owner/auth/me');
    return response.data;
  }

  async updateOwnerProfile(data: API.ProfileUpdateRequest) {
    const response = await this.client.put<API.OwnerResponse>('/api/v1/owner/auth/me', data);
    return response.data;
  }

  async ownerSetPassword(data: API.SetPasswordRequest) {
    const response = await this.client.post<API.OwnerWithCredentials>('/api/v1/owner/auth/set-password', data);
    if (response.data.credentials) {
      this.saveTokens(response.data.credentials);
    }
    this.saveUserType('owner');
    return response.data;
  }

  async ownerForgotPassword(data: API.ForgotPasswordRequest) {
    return this.client.post('/api/v1/owner/auth/forgot-password', data);
  }

  async ownerResetPassword(data: API.ResetPasswordRequest) {
    return this.client.post('/api/v1/owner/auth/reset-password', data);
  }

  // ============================================================================
  // OWNER - COMPANY MANAGEMENT
  // ============================================================================

  async createCompany(data: API.CompanyCreateRequest) {
    const response = await this.client.post<API.CompanyDetailResponse>('/api/v1/owner/companies/', data);
    return response.data;
  }

  async getOwnerCompanies(params?: { search?: string; page?: number; page_size?: number }) {
    const response = await this.client.get<API.CompanyResponse[]>('/api/v1/owner/companies/', { params });
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

  async activateCompany(companyId: string) {
    const response = await this.client.post<API.CompanyResponse>(`/api/v1/owner/companies/${companyId}/activate`);
    return response.data;
  }

  async deactivateCompany(companyId: string) {
    const response = await this.client.post<API.CompanyResponse>(`/api/v1/owner/companies/${companyId}/deactivate`);
    return response.data;
  }

  // ============================================================================
  // OWNER - IMPERSONATION
  // ============================================================================

  async impersonateCompany(companyId: string): Promise<{ token: string; url: string }> {
    const response = await this.client.post<{ token: string; url: string }>(`/api/v1/owner/companies/${companyId}/impersonate`);
    return response.data;
  }

  /**
   * Consume an impersonation token — store it as access token for company session.
   * Called on the company-side login page when ?impersonate=<token> is present.
   */
  consumeImpersonationToken(token: string) {
    if (typeof window !== 'undefined') {
      localStorage.setItem('access_token', token);
      localStorage.setItem('user_type', 'company_user');
      // No refresh token — session expires in 15 min
    }
  }

  // ============================================================================
  // OWNER - INVITE ADMIN
  // ============================================================================

  async inviteAdmin(companyId: string, data: API.InviteAdminRequest) {
    const response = await this.client.post<API.InviteAdminResponse>(`/api/v1/owner/companies/${companyId}/invite-admin`, data);
    return response.data;
  }

  // ============================================================================
  // OWNER - CONTRACTS
  // ============================================================================

  async createContract(data: API.ContractCreateRequest) {
    const response = await this.client.post<API.ContractResponse>('/api/v1/owner/contracts/', data);
    return response.data;
  }

  async getContracts(params?: API.ContractFilters) {
    const response = await this.client.get<API.PaginatedResponse<API.ContractResponse>>('/api/v1/owner/contracts/', { params });
    return response.data;
  }

  async getContract(contractId: string) {
    const response = await this.client.get<API.ContractDetailResponse>(`/api/v1/owner/contracts/${contractId}`);
    return response.data;
  }

  async renewContract(contractId: string, data: API.ContractRenewRequest) {
    const response = await this.client.post<API.ContractResponse>(`/api/v1/owner/contracts/${contractId}/renew`, data);
    return response.data;
  }

  async cancelContract(contractId: string) {
    const response = await this.client.post<API.ContractResponse>(`/api/v1/owner/contracts/${contractId}/cancel`);
    return response.data;
  }

  // ============================================================================
  // OWNER - ANALYTICS
  // ============================================================================

  async getOwnerDashboard() {
    const response = await this.client.get<API.OwnerDashboard>('/api/v1/owner/analytics/dashboard');
    return response.data;
  }

  // ============================================================================
  // TELEGRAM AUTH
  // ============================================================================

  async createLoginChallenge() {
    const response = await this.client.post<API.LoginChallengeResponse>('/api/v1/auth/telegram/login-challenge');
    return response.data;
  }

  async pollChallengeStatus(challengeId: string) {
    const response = await this.client.get<API.ChallengeStatusResponse>(`/api/v1/auth/telegram/login-challenge/${challengeId}/status`);
    return response.data;
  }

  async verifyOtp(data: API.VerifyOtpRequest) {
    const response = await this.client.post<API.AuthorizedResponse>('/api/v1/auth/telegram/verify-otp', data);
    if (response.data.credentials) {
      this.saveTokens(response.data.credentials);
    }
    this.saveUserType('company_user');
    return response.data;
  }

  async createRegisterChallenge(data: API.RegisterChallengeRequest) {
    const response = await this.client.post<API.RegisterChallengeResponse>('/api/v1/auth/telegram/register-challenge', data);
    return response.data;
  }

  async pollRegisterChallengeStatus(challengeId: string) {
    const response = await this.client.get<API.RegisterChallengeStatusResponse>(`/api/v1/auth/telegram/register-challenge/${challengeId}/status`);
    return response.data;
  }

  async telegramRegister(data: API.TelegramRegisterRequest) {
    const response = await this.client.post<API.AuthorizedResponse>('/api/v1/auth/telegram/register', data);
    if (response.data.credentials) {
      this.saveTokens(response.data.credentials);
    }
    this.saveUserType('company_user');
    return response.data;
  }

  // ============================================================================
  // TELEGRAM INVITE TOKENS (ADMIN)
  // ============================================================================

  async createInviteToken(data: API.InviteTokenCreateRequest) {
    const response = await this.client.post<API.InviteTokenResponse>('/api/v1/company/users/invite-telegram', data);
    return response.data;
  }

  async getInviteTokens(params?: { page?: number; page_size?: number; status?: string }) {
    const response = await this.client.get<API.PaginatedResponse<API.InviteTokenListItem>>('/api/v1/company/users/invite-tokens', { params });
    return response.data;
  }

  async revokeInviteToken(tokenId: string) {
    await this.client.delete(`/api/v1/company/users/invite-tokens/${tokenId}`);
  }

  // ============================================================================
  // COMPANY - AVATAR
  // ============================================================================

  async uploadAvatar(file: File): Promise<API.UserResponse> {
    const formData = new FormData();
    formData.append('file', file);
    const response = await this.client.post<API.UserResponse>(
      '/api/v1/company/users/me/avatar',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  }

  async deleteAvatar(): Promise<API.UserResponse> {
    const response = await this.client.delete<API.UserResponse>('/api/v1/company/users/me/avatar');
    return response.data;
  }

  // ============================================================================
  // COMPANY - USER MANAGEMENT
  // ============================================================================

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

  async activateUser(userId: string) {
    const response = await this.client.post<API.UserResponse>(`/api/v1/company/users/${userId}/activate`);
    return response.data;
  }

  async deactivateUser(userId: string) {
    const response = await this.client.post<API.UserResponse>(`/api/v1/company/users/${userId}/deactivate`);
    return response.data;
  }

  // ============================================================================
  // COMPANY - CONTRACT STATUS
  // ============================================================================

  async getContractStatus() {
    const response = await this.client.get<API.ContractStatusResponse>('/api/v1/company/contract/status');
    return response.data;
  }

  // ============================================================================
  // COMPANY - PERMISSION GROUPS
  // ============================================================================

  async getPermissionGroups() {
    const response = await this.client.get<API.PermissionGroupListResponse>('/api/v1/company/permission-groups/');
    return response.data;
  }

  async createPermissionGroup(data: API.PermissionGroupCreateRequest) {
    const response = await this.client.post<API.PermissionGroupResponse>('/api/v1/company/permission-groups/', data);
    return response.data;
  }

  async getPermissionGroup(groupId: string) {
    const response = await this.client.get<API.PermissionGroupResponse>(`/api/v1/company/permission-groups/${groupId}`);
    return response.data;
  }

  async updatePermissionGroup(groupId: string, data: API.PermissionGroupUpdateRequest) {
    const response = await this.client.put<API.PermissionGroupResponse>(`/api/v1/company/permission-groups/${groupId}`, data);
    return response.data;
  }

  async deletePermissionGroup(groupId: string) {
    return this.client.delete(`/api/v1/company/permission-groups/${groupId}`);
  }

  async getAvailablePermissions() {
    const response = await this.client.get<API.AvailablePermission[]>('/api/v1/company/permission-groups/permissions');
    return response.data;
  }

  // ============================================================================
  // COMPANY - CALLS
  // ============================================================================

  async callExternal(data: API.CallRequest) {
    const response = await this.client.post<API.CallResponse>('/api/v1/company/calls/sipuni/external', data);
    return response.data;
  }

  async callNumber(data: API.CallNumberRequest) {
    const response = await this.client.post<API.CallResponse>('/api/v1/company/calls/sipuni/number', data);
    return response.data;
  }

  async callTree(data: API.CallTreeRequest) {
    const response = await this.client.post<API.CallResponse>('/api/v1/company/calls/sipuni/tree', data);
    return response.data;
  }

  async getCall(callId: string) {
    const response = await this.client.get<API.CallEventResponse>(`/api/v1/company/calls/${callId}`);
    return response.data;
  }

  async getCallRecording(callId: string): Promise<string> {
    // Backend proxies audio from provider — fetch as blob and return an object URL
    const response = await this.client.get(`/api/v1/company/recordings/${callId}`, {
      responseType: 'blob',
    });
    // Ensure blob has correct MIME type for mobile Safari/Chrome audio playback
    const blob = response.data instanceof Blob
      ? new Blob([response.data], { type: response.data.type || 'audio/mpeg' })
      : new Blob([response.data], { type: 'audio/mpeg' });
    return URL.createObjectURL(blob);
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

  async getEntityNotes(entityType: string, entityId: string) {
    const response = await this.client.get(`/api/v1/company/notes/timeline/${entityType}/${entityId}`);
    // Backend returns {entity_type, entity_id, notes: [...], total} — extract the notes array
    return response.data?.notes ?? response.data ?? [];
  }

  // ============================================================================
  // COMPANY - ANALYTICS
  // ============================================================================

  async getMyDashboard() {
    const response = await this.client.get<API.OperatorDashboard>('/api/v1/company/analytics/me/dashboard');
    return response.data;
  }

  async getAdminDashboard() {
    const response = await this.client.get<API.AdminDashboard>('/api/v1/company/analytics/team/dashboard');
    return response.data;
  }

  // ============================================================================
  // COMPANY - CUSTOM FIELDS
  // ============================================================================

  async getCustomFields(entityType?: string) {
    const response = await this.client.get<API.CustomFieldDefinitionResponse[]>(
      '/api/v1/company/custom-fields',
      { params: entityType ? { entity_type: entityType } : undefined }
    );
    return response.data;
  }

  async createCustomField(data: API.CustomFieldDefinitionCreate) {
    const response = await this.client.post<API.CustomFieldDefinitionResponse>('/api/v1/company/custom-fields', data);
    return response.data;
  }

  async updateCustomField(fieldId: string, data: API.CustomFieldDefinitionUpdate) {
    const response = await this.client.put<API.CustomFieldDefinitionResponse>(`/api/v1/company/custom-fields/${fieldId}`, data);
    return response.data;
  }

  async deleteCustomField(fieldId: string) {
    await this.client.delete(`/api/v1/company/custom-fields/${fieldId}`);
  }

  async reorderCustomFields(data: API.CustomFieldReorderRequest) {
    const response = await this.client.put<API.CustomFieldDefinitionResponse[]>('/api/v1/company/custom-fields/reorder', data);
    return response.data;
  }

  // ============================================================================
  // COMPANY - API KEYS
  // ============================================================================

  async getApiKeys() {
    const response = await this.client.get<API.ApiKeyListResponse>('/api/v1/company/api-keys');
    return response.data;
  }

  async createApiKey(data: API.ApiKeyCreateRequest) {
    const response = await this.client.post<API.ApiKeyCreateResponse>('/api/v1/company/api-keys', data);
    return response.data;
  }

  async revokeApiKey(keyId: string) {
    await this.client.delete(`/api/v1/company/api-keys/${keyId}`);
  }

  // ============================================================================
  // COMPANY - OUTBOUND WEBHOOKS
  // ============================================================================

  async getWebhookEndpoints(params?: { page?: number; page_size?: number; is_active?: boolean }) {
    const response = await this.client.get<API.PaginatedResponse<API.WebhookEndpointResponse>>('/api/v1/company/outbound-webhooks', { params });
    return response.data;
  }

  async createWebhookEndpoint(data: API.WebhookEndpointCreate) {
    const response = await this.client.post<API.WebhookEndpointResponse>('/api/v1/company/outbound-webhooks', data);
    return response.data;
  }

  async updateWebhookEndpoint(endpointId: string, data: API.WebhookEndpointUpdate) {
    const response = await this.client.put<API.WebhookEndpointResponse>(`/api/v1/company/outbound-webhooks/${endpointId}`, data);
    return response.data;
  }

  async deleteWebhookEndpoint(endpointId: string) {
    await this.client.delete(`/api/v1/company/outbound-webhooks/${endpointId}`);
  }

  async getWebhookDeliveries(endpointId: string, params?: { page?: number; page_size?: number; status?: string }) {
    const response = await this.client.get<API.PaginatedResponse<API.WebhookDeliveryResponse>>(`/api/v1/company/outbound-webhooks/${endpointId}/deliveries`, { params });
    return response.data;
  }

  // ============================================================================
  // COMPANY - TELEGRAM CONFIGURATION
  // ============================================================================

  async getTelegramConfig(): Promise<API.TelegramConfig> {
    const response = await this.client.get<API.TelegramConfig>('/api/v1/company/telegram/config');
    return response.data;
  }

  async updateTelegramConfig(data: API.UpdateTelegramConfig): Promise<API.TelegramConfig> {
    const response = await this.client.put<API.TelegramConfig>('/api/v1/company/telegram/config', data);
    return response.data;
  }

  async connectTelegram(chatId: string): Promise<API.TelegramConfig> {
    const response = await this.client.post<API.TelegramConfig>('/api/v1/company/telegram/config', { chat_id: chatId });
    return response.data;
  }

  async disconnectTelegram(): Promise<void> {
    await this.client.delete('/api/v1/company/telegram/config');
  }

  async setupTelegram(data: API.TelegramSetupRequest): Promise<API.TelegramSetupStatus> {
    const response = await this.client.post<API.TelegramSetupStatus>('/api/v1/company/telegram/setup', data);
    return response.data;
  }

  async getTelegramSetupStatus(): Promise<API.TelegramSetupStatus> {
    const response = await this.client.get<API.TelegramSetupStatus>('/api/v1/company/telegram/setup/status');
    return response.data;
  }

  async manualSetupTelegram(chatId: string): Promise<API.TelegramSetupStatus> {
    const response = await this.client.post<API.TelegramSetupStatus>('/api/v1/company/telegram/setup/manual', { chat_id: chatId });
    return response.data;
  }

  // ============================================================================
  // TELEGRAM MINI APP AUTH
  // ============================================================================

  async miniAppAuth(initData: string, companyId: string) {
    const response = await this.client.post<{
      access_token: string;
      refresh_token: string;
      user_id: string;
      first_name: string;
      last_name?: string;
    }>('/api/v1/auth/telegram/miniapp', {
      init_data: initData,
      company_id: companyId,
    });
    if (response.data.access_token) {
      this.saveTokens({
        access: response.data.access_token,
        refresh: response.data.refresh_token,
      });
    }
    this.saveUserType('company_user');
    return response.data;
  }

  // ============================================================================
  // COMPANY - SIPUNI SETUP
  // ============================================================================

  async setupSipuni(data: API.SipuniSetupRequest): Promise<API.SipuniSetupStatus> {
    const response = await this.client.post<API.SipuniSetupStatus>('/api/v1/company/sipuni/setup', data);
    return response.data;
  }

  async getSipuniSetupStatus(): Promise<API.SipuniSetupStatus> {
    const response = await this.client.get<API.SipuniSetupStatus>('/api/v1/company/sipuni/setup/status');
    return response.data;
  }

  async manualSetupSipuni(data: API.SipuniManualSetupRequest): Promise<API.SipuniSetupStatus> {
    const response = await this.client.post<API.SipuniSetupStatus>('/api/v1/company/sipuni/setup/manual', data);
    return response.data;
  }

  async getSipuniConfig(): Promise<API.SipuniConfig> {
    const response = await this.client.get<API.SipuniConfig>('/api/v1/company/sipuni/config');
    return response.data;
  }

  async disconnectSipuni(): Promise<API.SipuniSetupStatus> {
    const response = await this.client.post<API.SipuniSetupStatus>('/api/v1/company/sipuni/disconnect');
    return response.data;
  }

  async getSipuniOperators(): Promise<API.SipuniOperator[]> {
    const response = await this.client.get<API.SipuniOperator[]>('/api/v1/company/calls/sipuni/operators');
    return response.data;
  }

}

export const apiClient = new ApiClient();
