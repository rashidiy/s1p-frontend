// API Types based on OpenAPI Schema

export type RepresentEnum = 'day' | 'week' | 'month' | 'year';

export interface BearerToken {
  type: string;
  access: string;
  refresh: string;
}

export interface AuthorizedResponse {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  is_active: boolean;
  credentials: BearerToken;
}

export interface RegisterRequest {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface SipuniCreateRequest {
  company_name: string;
  cabinet_id: string;
  security_key: string;
  partner_name?: string | null;
  partner_contact?: string | null;
  comment?: string | null;
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
  reverse: boolean;
  antiaon: boolean;
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
  reverse: boolean;
  attempt_duration?: number;
}

export interface CallStatisticsParams {
  sipuni_id: string;
  represent?: RepresentEnum;
  start?: string;
  end?: string;
}

export interface ValidationError {
  loc: (string | number)[];
  msg: string;
  type: string;
}

export interface HTTPValidationError {
  detail?: ValidationError[];
}

// Extended types for frontend use
export interface User {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  is_active: boolean;
}

export interface CallStatistic {
  date: string;
  total_calls: number;
  incoming_calls: number;
  outgoing_calls: number;
  missed_calls: number;
  average_duration: number;
}
