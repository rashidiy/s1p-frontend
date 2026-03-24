import { parsePhoneNumberFromString } from 'libphonenumber-js';

/** Format phone number internationally: +998 xx xxx xx xx, +1 xxx xxx xxxx, etc. */
export function formatPhone(raw: string | null | undefined): string {
  if (!raw) return '';
  const input = raw.startsWith('+') ? raw : `+${raw}`;
  const phone = parsePhoneNumberFromString(input);
  if (phone) return phone.formatInternational();
  return raw;
}

/** Avatar gradient palette — richer than flat colors, works on both light/dark backgrounds */
const AVATAR_COLORS = [
  'linear-gradient(135deg, #667eea, #764ba2)', // indigo→purple
  'linear-gradient(135deg, #0891B2, #06b6d4)',  // cyan
  'linear-gradient(135deg, #059669, #34d399)',  // emerald
  'linear-gradient(135deg, #D97706, #fbbf24)',  // amber
  'linear-gradient(135deg, #DC2626, #f87171)',  // red
  'linear-gradient(135deg, #7C3AED, #a78bfa)',  // violet
  'linear-gradient(135deg, #2563EB, #60a5fa)',  // blue
  'linear-gradient(135deg, #C026D3, #e879f9)',  // fuchsia
  'linear-gradient(135deg, #0D9488, #2dd4bf)',  // teal
  'linear-gradient(135deg, #EA580C, #fb923c)',  // orange
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

/** Group consecutive items by a key function (like Python's itertools.groupby) */
export function groupConsecutive<T>(items: T[], keyFn: (item: T) => string): Array<{ key: string; items: T[]; count: number }> {
  const groups: Array<{ key: string; items: T[]; count: number }> = [];
  for (const item of items) {
    const k = keyFn(item);
    const last = groups[groups.length - 1];
    if (last && last.key === k) {
      last.items.push(item);
      last.count++;
    } else {
      groups.push({ key: k, items: [item], count: 1 });
    }
  }
  return groups;
}
