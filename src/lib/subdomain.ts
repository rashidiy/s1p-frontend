/**
 * Subdomain utilities for multi-tenant application
 */

import { cookies } from 'next/headers';

/**
 * Get current subdomain (server-side)
 * Use in Server Components and Server Actions
 */
export function getSubdomain(): string | null {
  const cookieStore = cookies();
  const subdomain = cookieStore.get('company_subdomain')?.value;
  return subdomain || null;
}

/**
 * Get subdomain from browser (client-side)
 * Use in Client Components
 */
export function getSubdomainClient(): string | null {
  if (typeof window === 'undefined') return null;

  // Try cookie first
  const cookies = document.cookie.split(';');
  const subdomainCookie = cookies.find(c => c.trim().startsWith('company_subdomain='));
  if (subdomainCookie) {
    return subdomainCookie.split('=')[1];
  }

  // Fallback: extract from hostname
  const host = window.location.hostname;
  const parts = host.split('.');

  if (parts.length >= 3) {
    return parts[0];
  }

  // Check query param for testing
  const params = new URLSearchParams(window.location.search);
  return params.get('subdomain');
}

/**
 * Check if current subdomain is owner portal
 */
export function isOwnerSubdomain(): boolean {
  const ownerSubdomain = process.env.NEXT_PUBLIC_OWNER_SUBDOMAIN || 'owner';
  const current = getSubdomainClient();
  return current === ownerSubdomain;
}

/**
 * Get the full URL for a given subdomain
 */
export function getSubdomainUrl(subdomain: string, path: string = '/'): string {
  const baseDomain = process.env.NEXT_PUBLIC_BASE_DOMAIN || 'localhost';
  const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http';
  const port = process.env.NODE_ENV === 'production' ? '' : ':3000';

  if (baseDomain === 'localhost') {
    return `${protocol}://${subdomain}.${baseDomain}${port}${path}`;
  }

  return `${protocol}://${subdomain}.${baseDomain}${path}`;
}

/**
 * Redirect to a different subdomain
 */
export function redirectToSubdomain(subdomain: string, path: string = '/') {
  if (typeof window !== 'undefined') {
    window.location.href = getSubdomainUrl(subdomain, path);
  }
}
