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

/** All deal stages in pipeline order -- single source of truth matching backend DealStageEnum */
export const DEAL_STAGES = [
  'prospecting', 'qualification', 'proposal', 'negotiation', 'closed_won', 'closed_lost',
] as const;

/** Active (draggable) pipeline stages -- excludes terminal stages */
export const DEAL_PIPELINE_STAGES = [
  'prospecting', 'qualification', 'proposal', 'negotiation',
] as const;

export const DEAL_STAGE_KEYS: Record<string, string> = {
  prospecting: 'prospecting',
  qualification: 'qualification',
  proposal: 'proposal',
  negotiation: 'negotiation',
  closed_won: 'closed_won',
  closed_lost: 'closed_lost',
};

export const DEAL_STAGE_COLORS: Record<string, string> = {
  prospecting: 'bg-blue-100 text-blue-800',
  qualification: 'bg-yellow-100 text-yellow-800',
  proposal: 'bg-orange-100 text-orange-800',
  negotiation: 'bg-purple-100 text-purple-800',
  closed_won: 'bg-green-100 text-green-800',
  closed_lost: 'bg-red-100 text-red-800',
};

/** Ant Design Tag colors for deal stages (used in table and card views) */
export const DEAL_STAGE_TAG_COLORS: Record<string, string> = {
  prospecting: 'blue',
  qualification: 'gold',
  proposal: 'orange',
  negotiation: 'purple',
  closed_won: 'green',
  closed_lost: 'red',
};

/** Pipeline board hex colors (used in kanban column headers) */
export const DEAL_STAGE_BOARD_COLORS: Record<string, string> = {
  prospecting: '#3B82F6',
  qualification: '#F59E0B',
  proposal: '#F97316',
  negotiation: '#8B5CF6',
  closed_won: '#16A34A',
  closed_lost: '#EF4444',
};

/** Deal stage filter options (value = backend enum, key = i18n key under statuses.*) */
export const DEAL_STAGE_OPTIONS = DEAL_STAGES.map((s) => ({
  value: s,
  key: DEAL_STAGE_KEYS[s],
}));

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
  FAILED: 'failed',
};

export const CALL_STATUS_COLORS: Record<string, string> = {
  ANSWER: 'bg-green-100 text-green-800',
  BUSY: 'bg-yellow-100 text-yellow-800',
  NOANSWER: 'bg-red-100 text-red-800',
  CANCEL: 'bg-gray-100 text-gray-800',
  CONGESTION: 'bg-orange-100 text-orange-800',
  CHANUNAVAIL: 'bg-red-100 text-red-800',
  FAILED: 'bg-gray-100 text-gray-500',
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
