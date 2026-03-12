// ============================================================================
// API TYPES - Re-exported from auto-generated OpenAPI types + frontend-only types
//
// Generated types come from: src/types/generated.ts (via openapi-typescript)
// To regenerate: npm run sync:api (requires backend running on localhost:8000)
// ============================================================================

import type { components } from './generated';

// ============================================================================
// HELPER: Extract schema type from generated components
// ============================================================================
type Schema<T extends keyof components['schemas']> = components['schemas'][T];

// ============================================================================
// ENUMS (generated as union types — keep TS enums for backward compatibility)
// ============================================================================

export enum ProviderEnum {
  SIPUNI = 'sipuni',
  BINOTEL = 'binotel',
}

export enum CallDirectionEnum {
  INBOUND = 'inbound',
  OUTBOUND = 'outbound',
  INTERNAL = 'internal',
}

export enum CallStatusEnum {
  ANSWER = 'ANSWER',
  BUSY = 'BUSY',
  NOANSWER = 'NOANSWER',
  CANCEL = 'CANCEL',
  CONGESTION = 'CONGESTION',
  CHANUNAVAIL = 'CHANUNAVAIL',
}

export enum UserRole {
  OWNER = 'owner',
  COMPANY_ADMIN = 'company_admin',
  COMPANY_MANAGER = 'company_manager',
  COMPANY_OPERATOR = 'company_operator',
}

export enum ContractStatusEnum {
  ACTIVE = 'active',
  EXPIRED = 'expired',
  CANCELLED = 'cancelled',
  PENDING = 'pending',
}

export enum BillingPeriodEnum {
  MONTHLY = 'monthly',
  QUARTERLY = 'quarterly',
  YEARLY = 'yearly',
}

export enum PaymentStatusEnum {
  PAID = 'paid',
  PENDING = 'pending',
  OVERDUE = 'overdue',
  FAILED = 'failed',
}

// ============================================================================
// RE-EXPORTED GENERATED TYPES (from OpenAPI spec)
// ============================================================================

// Auth & Tokens
export type BearerToken = Schema<'BearerToken'>;
export type LoginRequest = Schema<'LoginRequest'>;
// Extended: backend returns temporary_token for must_change_password flow but it's not in the OpenAPI spec
export type AuthorizedResponse = Schema<'AuthorizedResponse'> & {
  temporary_token?: string;
};
export type SetPasswordRequest = Schema<'SetPasswordRequest'>;
export type ForgotPasswordRequest = Schema<'ForgotPasswordRequest'>;
export type ResetPasswordRequest = Schema<'ResetPasswordRequest'>;
export type ProfileUpdateRequest = Schema<'ProfileUpdateRequest'>;
export type InviteAdminRequest = Schema<'InviteAdminRequest'>;
export type RefreshTokenRequest = Schema<'RefreshTokenRequest'>;

// Owner
export type OwnerLoginRequest = Schema<'OwnerLoginRequest'>;
export type OwnerResponse = Schema<'OwnerResponse'>;
// Extended: backend returns credentials as BearerToken + temporary_token, but OpenAPI spec types credentials as generic dict
export type OwnerWithCredentials = Omit<Schema<'OwnerWithCredentials'>, 'credentials'> & {
  credentials: BearerToken;
  temporary_token?: string;
};

// Company
export type CompanyCreateRequest = Schema<'CompanyCreateRequest'>;
export type CompanyResponse = Schema<'CompanyResponse'>;
export type CompanyDetailResponse = Schema<'CompanyDetailResponse'>;
export type CompanyUpdateRequest = Schema<'CompanyUpdateRequest'>;

// Users
export type UserInviteRequest = Schema<'UserInviteRequest'>;
export type UserResponse = Schema<'UserResponse'>;
export type UserDetailResponse = Schema<'UserDetailResponse'>;
export type UserUpdateRequest = Schema<'UserUpdateRequest'>;
export type UserListResponse = Schema<'UserListResponse'>;

// Calls
export type CallRequest = Schema<'CallRequest'>;
export type CallResponse = Schema<'CallResponse'>;
export type CallEventResponse = Schema<'CallEventResponse'> & {
  // Fields present in DB model but missing from backend response schema — remove when backend adds them
  outcome?: string | null;
  disposition_notes?: string | null;
  deal_id?: string | null;
  utm_source?: string | null;
  utm_medium?: string | null;
  utm_campaign?: string | null;
};
export type CallOutcomeUpdate = Schema<'CallOutcomeUpdate'>;
export type CallLinkRequest = Schema<'CallLinkRequest'>;
export type CallNumberRequest = Schema<'CallNumberRequest'>;
export type CallTreeRequest = Schema<'CallTreeRequest'>;

// Contacts
export type ContactCreateRequest = Schema<'ContactCreateRequest'>;
export type ContactResponse = Schema<'ContactResponse'>;
export type ContactUpdateRequest = Schema<'ContactUpdateRequest'>;

// Leads
export type LeadCreateRequest = Schema<'LeadCreateRequest'>;
export type LeadResponse = Schema<'LeadResponse'>;
export type LeadUpdateRequest = Schema<'LeadUpdateRequest'>;

// Deals
export type DealCreateRequest = Schema<'DealCreateRequest'>;
export type DealResponse = Schema<'DealResponse'>;
export type DealUpdateRequest = Schema<'DealUpdateRequest'>;

// Tasks
export type TaskCreateRequest = Schema<'TaskCreateRequest'>;
export type TaskResponse = Schema<'TaskResponse'>;
export type TaskUpdateRequest = Schema<'TaskUpdateRequest'>;

// Notes
export type NoteCreateRequest = Schema<'NoteCreateRequest'>;
export type NoteResponse = Schema<'NoteResponse'>;
export type NoteUpdateRequest = Schema<'NoteUpdateRequest'>;

// Analytics
export type CallStats = Schema<'CallStats'>;
export type LeadStats = Schema<'LeadStats'>;
export type DealStats = Schema<'DealStats'>;
export type TaskStats = Schema<'TaskStats'>;
export type OperatorAnalytics = Schema<'OperatorAnalytics'>;
export type OperatorPerformance = Schema<'OperatorPerformance'>;
export type TeamAnalytics = Schema<'TeamAnalytics'>;
export type ConversionFunnel = Schema<'ConversionFunnel'>;
export type PipelineHealth = Schema<'PipelineHealth'>;
export type OperatorDashboard = Schema<'OperatorDashboard'>;
export type AdminDashboard = Schema<'AdminDashboard'>;
export type CompanyPerformance = Schema<'CompanyPerformance'>;
export type PlatformAnalytics = Schema<'PlatformAnalytics'>;
export type OwnerDashboard = Schema<'OwnerDashboard'>;

// Contracts
export type ContractCreateRequest = Schema<'ContractCreateRequest'>;
export type ContractResponse = Schema<'ContractResponse'>;
export type ContractDetailResponse = Schema<'ContractDetailResponse'>;
export type ContractUpdateRequest = Schema<'ContractUpdateRequest'>;
export type ContractRenewRequest = Schema<'ContractRenewRequest'>;
export type ContractStatusResponse = Schema<'ContractStatusResponse'>;

// Permission Groups
export type PermissionGroupCreateRequest = Schema<'PermissionGroupCreateRequest'>;
export type PermissionGroupResponse = Schema<'PermissionGroupResponse'>;
export type PermissionGroupUpdateRequest = Schema<'PermissionGroupUpdateRequest'>;
export type PermissionGroupListResponse = Schema<'PermissionGroupListResponse'>;

// Validation
export type ValidationError = Schema<'ValidationError'>;
export type HTTPValidationError = Schema<'HTTPValidationError'>;

// Pagination (generated)
export type PaginatedResponse<T = unknown> = Omit<Schema<'PaginatedResponse'>, 'items'> & { items: T[] };

// ============================================================================
// FRONTEND-ONLY TYPES (not in OpenAPI spec)
// ============================================================================

export interface RegisterRequest {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
}

export interface OwnerRegisterRequest {
  email: string;
  first_name: string;
  last_name?: string | null;
  phone?: string | null;
  password: string;
}

export type RepresentEnum = 'day' | 'week' | 'month' | 'year';

export interface CallRecordingURL {
  url: string;
  expires_in: number;
}

export interface AvailablePermission {
  key: string;
  label: string;
  category: string;
}

// Pagination & Filtering helpers (query params, not response schemas)
export interface PaginationParams {
  page?: number;
  page_size?: number;
}

export interface SearchParams {
  search?: string;
}

export interface DateRangeParams {
  date_from?: string;
  date_to?: string;
}

export interface CallHistoryFilters extends PaginationParams, SearchParams, DateRangeParams {
  direction?: string;
  outcome?: string;
  operator_id?: string;
  contact_id?: string;
  lead_id?: string;
  deal_id?: string;
  my_calls?: boolean;
}

export interface ContactFilters extends PaginationParams, SearchParams {
  assigned_to?: string;
  has_email?: boolean;
  has_phone?: boolean;
  created_by?: string;
}

export interface LeadFilters extends PaginationParams, SearchParams {
  status_filter?: string;
  assigned_to?: string;
  source?: string;
  min_value?: number;
  max_value?: number;
  my_leads?: boolean;
}

export interface DealFilters extends PaginationParams, SearchParams {
  stage?: string;
  assigned_to?: string;
  min_value?: number;
  max_value?: number;
  my_deals?: boolean;
}

export interface TaskFilters extends PaginationParams, SearchParams {
  status_filter?: string;
  priority?: string;
  assigned_to?: string;
  overdue?: boolean;
  my_tasks?: boolean;
}

export interface NoteFilters extends PaginationParams, SearchParams {
  contact_id?: string;
  lead_id?: string;
  deal_id?: string;
  task_id?: string;
  call_id?: string;
  created_by?: string;
}

export interface UserFilters extends PaginationParams, SearchParams {
  role?: string;
  is_active?: boolean;
}

export interface ContractFilters extends PaginationParams {
  company_id?: string;
  status?: string;
  payment_status?: string;
}

// ============================================================================
// TELEGRAM AUTH
// ============================================================================

export interface InviteTokenCreateRequest {
  first_name: string;
  last_name?: string | null;
  phone: string;
  role?: string;
  permissions?: string[];
  permission_group_id?: string | null;
}

export interface InviteTokenResponse {
  invite_token: string;
  expires_at: string;
  role: string;
  first_name: string;
  phone: string;
}

export interface InviteTokenListItem {
  id: string;
  role: string;
  first_name: string;
  last_name: string | null;
  phone: string;
  created_by_name: string;
  expires_at: string;
  used_at: string | null;
  created_at: string;
  status: 'pending' | 'used' | 'expired';
}

export interface LoginChallengeResponse {
  challenge_id: string;
  deep_link: string;
  expires_at: string;
}

export interface ChallengeStatusResponse {
  status: 'pending' | 'otp_sent' | 'expired' | 'used';
  expires_at: string;
}

export interface VerifyOtpRequest {
  challenge_id: string;
  otp: string;
}

export interface TelegramRegisterRequest {
  session_id: string;
  invite_token: string;
}

// ============================================================================
// TELEGRAM CONFIGURATION
// ============================================================================

export interface TelegramConfig {
  id: string;
  company_id: string;
  chat_id: string | null;
  bot_enabled: boolean;
  notify_completed_calls: boolean;
  notify_missed_calls: boolean;
  notify_new_leads: boolean;
  notify_deal_stage_change: boolean;
}

export interface UpdateTelegramConfig {
  bot_enabled?: boolean;
  notify_completed_calls?: boolean;
  notify_missed_calls?: boolean;
  notify_new_leads?: boolean;
  notify_deal_stage_change?: boolean;
}

// ============================================================================
// LEGACY TYPES (still used by integrations/statistics pages)
// ============================================================================

/** @deprecated Use the new provider-agnostic call API instead */
export interface SipuniResponse {
  id: string;
  company_name: string;
  cabinet_id: string;
  security_key: string;
  user_id: string;
  token: string;
  partner_name?: string | null;
  partner_contact?: string | null;
  comment?: string | null;
}

/** @deprecated Use the new provider-agnostic call API instead */
export interface SipuniCreateRequest {
  company_name: string;
  cabinet_id: string;
  security_key: string;
  partner_name?: string;
  partner_contact?: string;
  comment?: string;
}
