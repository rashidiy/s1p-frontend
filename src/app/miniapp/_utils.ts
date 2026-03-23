/** Avatar color palette — visually distinct, works on both light/dark backgrounds */
const AVATAR_COLORS = [
  '#4338CA', // indigo
  '#0891B2', // cyan
  '#059669', // emerald
  '#D97706', // amber
  '#DC2626', // red
  '#7C3AED', // violet
  '#2563EB', // blue
  '#C026D3', // fuchsia
  '#0D9488', // teal
  '#EA580C', // orange
];

/** Generate initials from name parts or phone */
export function getInitials(
  firstName?: string | null,
  lastName?: string | null,
  phone?: string | null,
): string {
  if (firstName && lastName) {
    return `${firstName[0]}${lastName[0]}`.toUpperCase();
  }
  if (firstName) return firstName[0].toUpperCase();
  if (lastName) return lastName[0].toUpperCase();
  if (phone) return '#';
  return '?';
}

/** Deterministic color from a string — same name always gets same color */
export function getAvatarColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

/** Format duration in seconds to M:SS */
export function formatDuration(sec: number | null | undefined): string {
  if (!sec) return '0:00';
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

/** Format date to time string (HH:MM) */
export function formatTime(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } catch {
    return '';
  }
}

/** Format date to readable format */
export function formatDate(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString([], { day: 'numeric', month: 'short', year: 'numeric' });
  } catch {
    return '';
  }
}

/** Categorize a date string into today/yesterday/this_week/earlier */
export function getDateGroup(dateStr: string): 'today' | 'yesterday' | 'thisWeek' | 'earlier' {
  const d = new Date(dateStr);
  const now = new Date();

  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const weekAgo = new Date(today);
  weekAgo.setDate(weekAgo.getDate() - 7);

  if (d >= today) return 'today';
  if (d >= yesterday) return 'yesterday';
  if (d >= weekAgo) return 'thisWeek';
  return 'earlier';
}

/** Format amount with thousands separator */
export function formatAmount(amount: number | string | null | undefined, currency?: string | null): string {
  if (!amount) return '';
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (isNaN(num)) return '';
  const formatted = num.toLocaleString(undefined, { maximumFractionDigits: 0 });
  return currency ? `${formatted} ${currency}` : formatted;
}

/** Lead status → badge CSS class */
export const STATUS_BADGE: Record<string, string> = {
  new: 'miniapp-badge-blue',
  contacted: 'miniapp-badge-cyan',
  qualified: 'miniapp-badge-green',
  unqualified: 'miniapp-badge-orange',
  converted: 'miniapp-badge-purple',
  lost: 'miniapp-badge-red',
};

export const ALL_STATUSES = ['new', 'contacted', 'qualified', 'unqualified', 'converted', 'lost'];

/** Deal stage → badge CSS class */
export const STAGE_BADGE: Record<string, string> = {
  prospecting: 'miniapp-badge-default',
  qualification: 'miniapp-badge-blue',
  proposal: 'miniapp-badge-cyan',
  negotiation: 'miniapp-badge-orange',
  closed_won: 'miniapp-badge-green',
  closed_lost: 'miniapp-badge-red',
};

export const ALL_STAGES = ['prospecting', 'qualification', 'proposal', 'negotiation', 'closed_won', 'closed_lost'];
