// ============================================================================
// I18N KEY MAPS & COLORS
// ============================================================================
// *_KEYS maps store i18n translation keys (not display strings).
// Consumers resolve at render time: tStatuses(LEAD_STATUS_KEYS[status])

export const LEAD_STATUS_KEYS: Record<string, string> = {
  new: 'new',
  contacted: 'contacted',
  qualified: 'qualified',
  converted: 'converted',
  lost: 'lost',
};

export const LEAD_STATUS_COLORS: Record<string, string> = {
  new: 'bg-blue-100 text-blue-800',
  contacted: 'bg-yellow-100 text-yellow-800',
  qualified: 'bg-green-100 text-green-800',
  converted: 'bg-purple-100 text-purple-800',
  lost: 'bg-red-100 text-red-800',
};

export const DEAL_STAGE_KEYS: Record<string, string> = {
  prospecting: 'prospecting',
  qualification: 'qualification',
  proposal: 'proposal',
  negotiation: 'negotiation',
  closed_won: 'won',
  closed_lost: 'lost',
};

export const DEAL_STAGE_COLORS: Record<string, string> = {
  prospecting: 'bg-blue-100 text-blue-800',
  qualification: 'bg-yellow-100 text-yellow-800',
  proposal: 'bg-orange-100 text-orange-800',
  negotiation: 'bg-purple-100 text-purple-800',
  closed_won: 'bg-green-100 text-green-800',
  closed_lost: 'bg-red-100 text-red-800',
};

export const TASK_STATUS_KEYS: Record<string, string> = {
  pending: 'pending',
  in_progress: 'inProgress',
  completed: 'completed',
  cancelled: 'cancelled',
};

export const TASK_PRIORITY_KEYS: Record<string, string> = {
  low: 'low',
  medium: 'medium',
  high: 'high',
  urgent: 'urgent',
};

export const CALL_DIRECTION_KEYS: Record<string, string> = {
  inbound: 'inbound',
  outbound: 'outbound',
  internal: 'internal',
};

export const CALL_DIRECTION_COLORS: Record<string, string> = {
  inbound: 'bg-green-100 text-green-800',
  outbound: 'bg-blue-100 text-blue-800',
  internal: 'bg-gray-100 text-gray-800',
};

export const CALL_STATUS_KEYS: Record<string, string> = {
  ANSWER: 'answered',
  BUSY: 'busy',
  NOANSWER: 'noAnswer',
  CANCEL: 'cancelled',
  CONGESTION: 'congestion',
  CHANUNAVAIL: 'unavailable',
};

export const CALL_STATUS_COLORS: Record<string, string> = {
  ANSWER: 'bg-green-100 text-green-800',
  BUSY: 'bg-yellow-100 text-yellow-800',
  NOANSWER: 'bg-red-100 text-red-800',
  CANCEL: 'bg-gray-100 text-gray-800',
  CONGESTION: 'bg-orange-100 text-orange-800',
  CHANUNAVAIL: 'bg-red-100 text-red-800',
};

export const CONTRACT_STATUS_KEYS: Record<string, string> = {
  active: 'active',
  warning: 'warning',
  grace_period: 'grace_period',
  expired: 'expired',
  suspended: 'suspended',
  cancelled: 'cancelled',
};

export const CONTRACT_STATUS_COLORS: Record<string, string> = {
  active: 'bg-green-100 text-green-800',
  warning: 'bg-yellow-100 text-yellow-800',
  grace_period: 'bg-orange-100 text-orange-800',
  expired: 'bg-red-100 text-red-800',
  suspended: 'bg-red-100 text-red-800',
  cancelled: 'bg-gray-100 text-gray-800',
};

export const BILLING_PERIOD_KEYS: Record<string, string> = {
  monthly: 'monthly',
  yearly: 'yearly',
};

export const PAYMENT_STATUS_KEYS: Record<string, string> = {
  paid: 'paid',
  pending: 'pending',
  overdue: 'overdue',
  failed: 'failed',
};

export const PAYMENT_STATUS_COLORS: Record<string, string> = {
  paid: 'bg-green-100 text-green-800',
  pending: 'bg-yellow-100 text-yellow-800',
  overdue: 'bg-red-100 text-red-800',
  failed: 'bg-red-100 text-red-800',
};

export const CALL_DIRECTION_OPTIONS = [
  { value: 'inbound', key: 'inbound' },
  { value: 'outbound', key: 'outbound' },
  { value: 'internal', key: 'internal' },
];

export const BILLING_PERIOD_OPTIONS = [
  { value: 'monthly', key: 'monthly' },
  { value: 'yearly', key: 'yearly' },
];

export const LANGUAGE_OPTIONS = [
  { value: 'ru', label: 'Русский' },
  { value: 'en', label: 'English' },
  { value: 'uz', label: "O'zbek" },
];
