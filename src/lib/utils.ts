import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

function getLocale(): string {
  if (typeof document !== 'undefined') {
    const cookie = document.cookie.split(';').find(c => c.trim().startsWith('locale='));
    if (cookie) return cookie.split('=')[1].trim();
  }
  return 'ru';
}

export function formatDate(date: string | Date, locale?: string): string {
  return new Intl.DateTimeFormat(locale || getLocale(), {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(date))
}

export function formatDateTime(date: string | Date, locale?: string): string {
  return new Intl.DateTimeFormat(locale || getLocale(), {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
  }).format(new Date(date))
}

export function getErrorMessage(err: unknown, fallback: string = 'Something went wrong'): string {
  const detail = (err as { response?: { data?: { detail?: unknown } } })?.response?.data?.detail;
  if (Array.isArray(detail)) {
    return detail.map((e: { msg?: string }) => e.msg || JSON.stringify(e)).join(', ');
  }
  if (typeof detail === 'string') {
    return detail;
  }
  return fallback;
}

export function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = seconds % 60

  if (hours > 0) {
    return `${hours}h ${minutes}m ${secs}s`
  } else if (minutes > 0) {
    return `${minutes}m ${secs}s`
  }
  return `${secs}s`
}
