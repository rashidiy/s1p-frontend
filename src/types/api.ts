// ============================================================================
// COMPREHENSIVE API TYPES - Multi-Tenant CRM Platform
// Generated from OpenAPI 3.1.0 specification
// ============================================================================

// ============================================================================
// ENUMS
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

export type RepresentEnum = 'day' | 'week' | 'month' | 'year';

// ============================================================================
// AUTH & TOKENS
// ============================================================================

export interface BearerToken {
  type: string;
  access: string;
  refresh: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
}

export interface AuthorizedResponse {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  is_active: boolean;
  credentials: BearerToken;
}

export interface RefreshTokenRequest {
  refresh_token: string;
}

// ============================================================================
// OWNER
// ============================================================================

export interface OwnerRegisterRequest {
  email: string;
  first_name: string;
  last_name?: string | null;
  phone?: string | null;
  password: string;
}

export interface OwnerLoginRequest {
  email: string;
  password: string;
}

export interface OwnerResponse {
  id: string;
  email: string;
  first_name: string;
  last_name?: string | null;
  phone?: string | null;
  is_active: boolean;
  email_verified: boolean;
  created_at: string;
}

export interface OwnerWithCredentials extends OwnerResponse {
  credentials: Record<string, any>;
}

// ============================================================================
// COMPANY
// ============================================================================

export interface CompanyCreateRequest {
  name: string;
  subdomain?: string | null;
  provider_type: string;
  provider_config: Record<string, any>;
  settings?: Record<string, any> | null;
}

export interface CompanyResponse {
  id: string;
  name: string;
  provider_type: string;
  is_active: boolean;
  webhook_url?: string | null;
  created_at: string;
  updated_at: string;
}

export interface CompanyDetailResponse extends CompanyResponse {
  provider_config: Record<string, any>;
  settings?: Record<string, any> | null;
  webhook_token: string;
}

export interface CompanyUpdateRequest {
  name?: string | null;
  settings?: Record<string, any> | null;
  is_active?: boolean | null;
}

// ============================================================================
// USERS
// ============================================================================

export interface UserInviteRequest {
  email: string;
  first_name: string;
  last_name?: string | null;
  phone?: string | null;
  role?: string;
  permissions?: string[] | null;
}

export interface UserResponse {
  id: string;
  email: string;
  first_name: string;
  last_name?: string | null;
  phone?: string | null;
  company_id?: string | null;
  role: string;
  permissions: string[];
  is_active: boolean;
  is_suspended: boolean;
  email_verified: boolean;
  language: string;
  created_at: string;
}

export interface UserDetailResponse extends UserResponse {
  total_calls?: number | null;
  total_leads?: number | null;
  total_deals?: number | null;
  total_tasks?: number | null;
}

export interface UserUpdateRequest {
  first_name?: string | null;
  last_name?: string | null;
  phone?: string | null;
  is_active?: boolean | null;
  is_suspended?: boolean | null;
  role?: string | null;
  permissions?: string[] | null;
}

export interface UserListResponse {
  users: UserResponse[];
  total: number;
  page: number;
  page_size: number;
}

export interface PasswordChangeRequest {
  old_password: string;
  new_password: string;
}

export interface PasswordResetRequest {
  email: string;
  temporary_password: string;
  new_password: string;
}

// ============================================================================
// CALLS
// ============================================================================

export interface CallRequest {
  phone_1: string;
  phone_2: string;
  operator_id?: string | null;
  order_id?: string | null;
  utm_source?: string | null;
  utm_medium?: string | null;
  utm_campaign?: string | null;
}

export interface CallResponse {
  success: boolean;
  call_id: string;
  message?: string | null;
  error?: string | null;
}

export interface CallEventResponse {
  id: string;
  company_id: string;
  provider_type: ProviderEnum;
  provider_call_id: string;
  phone_1?: string | null;
  phone_2?: string | null;
  operator_id?: string | null;
  direction?: CallDirectionEnum | null;
  state?: CallStatusEnum | null;
  attempts: number;
  waiting_sec?: number | null;
  billing_sec?: number | null;
  record_url?: string | null;
  call_start_timestamp?: number | null;
  call_end_timestamp?: number | null;
  contact_id?: string | null;
  lead_id?: string | null;
  deal_id?: string | null;
  outcome?: string | null;
  disposition_notes?: string | null;
  created_at: string;
  updated_at: string;
}

export interface CallRecordingURL {
  url: string;
  expires_in: number;
}

export interface CallOutcomeUpdate {
  outcome: string;
  disposition_notes?: string | null;
}

export interface CallLinkRequest {
  contact_id?: string | null;
  lead_id?: string | null;
  deal_id?: string | null;
}

// ============================================================================
// CONTACTS
// ============================================================================

export interface ContactCreateRequest {
  first_name: string;
  last_name?: string | null;
  email?: string | null;
  phone?: string | null;
  company_name?: string | null;
  position?: string | null;
  source?: string | null;
  custom_fields?: Record<string, any> | null;
  tags?: string[] | null;
}

export interface ContactResponse {
  id: string;
  company_id: string;
  first_name: string;
  last_name?: string | null;
  email?: string | null;
  phone?: string | null;
  company_name?: string | null;
  position?: string | null;
  source?: string | null;
  custom_fields?: Record<string, any> | null;
  created_by: string;
  assigned_to?: string | null;
  tags?: string[] | null;
  created_at: string;
  updated_at: string;
  total_leads?: number;
  total_deals?: number;
  total_calls?: number;
}

export interface ContactUpdateRequest {
  first_name?: string | null;
  last_name?: string | null;
  email?: string | null;
  phone?: string | null;
  company_name?: string | null;
  position?: string | null;
  source?: string | null;
  custom_fields?: Record<string, any> | null;
  tags?: string[] | null;
}

// ============================================================================
// LEADS
// ============================================================================

export interface LeadCreateRequest {
  title: string;
  contact_id?: string | null;
  source?: string | null;
  description?: string | null;
  estimated_value?: number | null;
  currency?: string | null;
  custom_fields?: Record<string, any> | null;
  assigned_to?: string | null;
  tags?: string[] | null;
}

export interface LeadResponse {
  id: string;
  company_id: string;
  title: string;
  contact_id?: string | null;
  source?: string | null;
  description?: string | null;
  estimated_value?: number | null;
  currency?: string | null;
  custom_fields?: Record<string, any> | null;
  status?: string | null;
  pipeline_stage?: string | null;
  assigned_to?: string | null;
  tags?: string[] | null;
  created_at: string;
  updated_at: string;
  contact_name?: string | null;
  assigned_to_name?: string | null;
}

export interface LeadUpdateRequest {
  title?: string | null;
  contact_id?: string | null;
  assigned_to?: string | null;
  source?: string | null;
  description?: string | null;
  estimated_value?: number | null;
  currency?: string | null;
  custom_fields?: Record<string, any> | null;
  tags?: string[] | null;
}

// ============================================================================
// DEALS
// ============================================================================

export interface DealCreateRequest {
  title: string;
  contact_id?: string | null;
  lead_id?: string | null;
  amount: number;
  currency?: string | null;
  probability?: number | null;
  expected_close_date?: string | null;
  description?: string | null;
  custom_fields?: Record<string, any> | null;
  assigned_to?: string | null;
  tags?: string[] | null;
}

export interface DealResponse {
  id: string;
  company_id: string;
  title: string;
  contact_id?: string | null;
  lead_id?: string | null;
  amount: number;
  currency?: string | null;
  probability?: number | null;
  expected_close_date?: string | null;
  description?: string | null;
  custom_fields?: Record<string, any> | null;
  stage?: string | null;
  assigned_to?: string | null;
  tags?: string[] | null;
  closed_date?: string | null;
  created_at: string;
  updated_at: string;
  contact_name?: string | null;
  assigned_to_name?: string | null;
  weighted_value?: number;
}

export interface DealUpdateRequest {
  title?: string | null;
  contact_id?: string | null;
  lead_id?: string | null;
  assigned_to?: string | null;
  amount?: number | null;
  currency?: string | null;
  probability?: number | null;
  expected_close_date?: string | null;
  description?: string | null;
  custom_fields?: Record<string, any> | null;
  tags?: string[] | null;
}

// ============================================================================
// TASKS
// ============================================================================

export interface TaskCreateRequest {
  title: string;
  description?: string | null;
  due_date?: string | null;
  entity_type?: string | null;
  entity_id?: string | null;
  assigned_to?: string | null;
}

export interface TaskResponse {
  id: string;
  company_id: string;
  title: string;
  description?: string | null;
  due_date?: string | null;
  entity_type?: string | null;
  entity_id?: string | null;
  status?: string | null;
  priority?: string | null;
  assigned_to?: string | null;
  created_by?: string | null;
  completed_at?: string | null;
  created_at: string;
  updated_at: string;
  assigned_to_name?: string | null;
}

export interface TaskUpdateRequest {
  title?: string | null;
  description?: string | null;
  due_date?: string | null;
  assigned_to?: string | null;
  entity_type?: string | null;
  entity_id?: string | null;
}

// ============================================================================
// NOTES
// ============================================================================

export interface NoteCreateRequest {
  content: string;
  entity_type: string;
  entity_id: string;
}

export interface NoteResponse {
  id: string;
  company_id: string;
  content: string;
  entity_type: string;
  entity_id: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  created_by_name?: string | null;
}

export interface NoteUpdateRequest {
  content?: string | null;
}

// ============================================================================
// ANALYTICS
// ============================================================================

export interface CallStats {
  total_calls: number;
  answered_calls: number;
  missed_calls: number;
  outbound_calls: number;
  inbound_calls: number;
  total_duration: number;
  average_duration: number;
  success_rate: number;
}

export interface LeadStats {
  total_leads: number;
  new_leads: number;
  contacted_leads: number;
  qualified_leads: number;
  converted_leads: number;
  lost_leads: number;
  conversion_rate: number;
}

export interface DealStats {
  total_deals: number;
  prospecting: number;
  negotiation: number;
  won: number;
  lost: number;
  total_value: number;
  won_value: number;
  average_deal_size: number;
  win_rate: number;
}

export interface TaskStats {
  total_tasks: number;
  pending_tasks: number;
  completed_tasks: number;
  overdue_tasks: number;
  completion_rate: number;
}

export interface OperatorAnalytics {
  period: string;
  date_from: string;
  date_to: string;
  calls: CallStats;
  leads: LeadStats;
  deals: DealStats;
  tasks: TaskStats;
  total_activities: number;
  productivity_score: number;
}

export interface OperatorPerformance {
  user_id: string;
  name: string;
  email: string;
  calls: CallStats;
  leads: LeadStats;
  deals: DealStats;
  tasks: TaskStats;
  productivity_score: number;
}

export interface TeamAnalytics {
  period: string;
  date_from: string;
  date_to: string;
  total_operators: number;
  active_operators: number;
  calls: CallStats;
  leads: LeadStats;
  deals: DealStats;
  tasks: TaskStats;
  total_revenue: number;
  revenue_growth: number;
  top_operators_by_calls: OperatorPerformance[];
  top_operators_by_deals: OperatorPerformance[];
  top_operators_by_revenue: OperatorPerformance[];
}

export interface ConversionFunnel {
  total_leads: number;
  contacted: number;
  qualified: number;
  deals_created: number;
  deals_won: number;
  contact_rate: number;
  qualification_rate: number;
  deal_rate: number;
  win_rate: number;
  overall_conversion: number;
}

export interface PipelineHealth {
  total_value: number;
  weighted_value: number;
  by_stage: Record<string, any>;
  stuck_deals: number;
  forecast: number;
}

export interface OperatorDashboard {
  today: OperatorAnalytics;
  this_week: OperatorAnalytics;
  this_month: OperatorAnalytics;
  upcoming_tasks: number;
  pending_leads: number;
  active_deals: number;
  recent_calls: any[];
  recent_tasks: any[];
}

export interface AdminDashboard {
  today: TeamAnalytics;
  this_week: TeamAnalytics;
  this_month: TeamAnalytics;
  this_year: TeamAnalytics;
  conversion_funnel: ConversionFunnel;
  pipeline_health: PipelineHealth;
  peak_call_hours: any[];
  calls_trend: any[];
  revenue_trend: any[];
}

export interface CompanyPerformance {
  company_id: string;
  company_name: string;
  total_users: number;
  active_users: number;
  total_calls: number;
  total_leads: number;
  total_deals: number;
  total_revenue: number;
  growth_rate: number;
}

export interface PlatformAnalytics {
  period: string;
  date_from: string;
  date_to: string;
  total_companies: number;
  active_companies: number;
  total_users: number;
  active_users: number;
  total_calls: number;
  total_leads: number;
  total_deals: number;
  total_revenue: number;
  new_companies: number;
  new_users: number;
  revenue_growth: number;
  top_companies: CompanyPerformance[];
}

export interface OwnerDashboard {
  today: PlatformAnalytics;
  this_week: PlatformAnalytics;
  this_month: PlatformAnalytics;
  this_year: PlatformAnalytics;
  system_health: Record<string, any>;
  growth_trend: any[];
  churn_analysis: Record<string, any>;
}

// ============================================================================
// PAGINATION & FILTERING
// ============================================================================

export interface PaginatedResponse<T = any> {
  items: T[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

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

// ============================================================================
// VALIDATION
// ============================================================================

export interface ValidationError {
  loc: (string | number)[];
  msg: string;
  type: string;
}

export interface HTTPValidationError {
  detail?: ValidationError[];
}

// ============================================================================
// LEGACY/DEPRECATED (for backwards compatibility)
// ============================================================================

export interface User {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  is_active: boolean;
}

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

export interface CallNumberRequest {
  token: string;
  phone: string;
  sip_number: string;
  reverse?: boolean;
  antiaon?: boolean;
}

export interface ExternalCallRequest {
  token: string;
  phone1: string;
  phone2: string;
  bridge_start?: string;
  bridge_end?: string;
}

export interface CallTreeRequest {
  token: string;
  phone: string;
  sip_number: string;
  tree: string;
  reverse?: boolean;
  attempt_duration?: number;
}

export interface SipuniCreateRequest {
  company_name: string;
  cabinet_id: string;
  security_key: string;
  partner_name?: string;
  partner_contact?: string;
  comment?: string;
}

export interface SipuniUpdateRequest {
  id: string;
  company_name?: string | null;
  cabinet_id?: string | null;
  security_key?: string | null;
  partner_name?: string | null;
  partner_contact?: string | null;
  comment?: string | null;
}
