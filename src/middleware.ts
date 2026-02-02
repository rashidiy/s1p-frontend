import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Owner subdomain (configurable via env)
const OWNER_SUBDOMAIN = process.env.NEXT_PUBLIC_OWNER_SUBDOMAIN || 'owner';

export function middleware(request: NextRequest) {
  // Get subdomain from nginx header or extract from host
  let subdomain = request.headers.get('x-subdomain');

  // Fallback: extract subdomain from host if header not present (for development)
  if (!subdomain) {
    const host = request.headers.get('host') || '';
    const parts = host.split('.');

    // Check if we have a subdomain (e.g., owner.domain.com or company1.domain.com)
    if (parts.length >= 3) {
      subdomain = parts[0];
    } else if (host.includes('localhost') || host.includes('127.0.0.1')) {
      // For local development, check query param or default
      subdomain = request.nextUrl.searchParams.get('subdomain') || OWNER_SUBDOMAIN;
    }
  }

  const { pathname } = request.nextUrl;

  // Allow public routes without subdomain check
  const publicRoutes = ['/login', '/register', '/_next', '/static', '/favicon.ico', '/health'];
  if (publicRoutes.some(route => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  // OWNER SUBDOMAIN ROUTING
  if (subdomain === OWNER_SUBDOMAIN) {
    // Owner trying to access company routes - redirect to owner dashboard
    if (!pathname.startsWith('/owner')) {
      return NextResponse.redirect(new URL('/owner/dashboard', request.url));
    }
    // Owner accessing owner routes - allow
    return NextResponse.next();
  }

  // COMPANY SUBDOMAIN ROUTING
  if (subdomain && subdomain !== OWNER_SUBDOMAIN) {
    // Company user trying to access owner routes - redirect to company dashboard
    if (pathname.startsWith('/owner')) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    // Store subdomain in cookie for client-side access
    const response = NextResponse.next();
    response.cookies.set('company_subdomain', subdomain, {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return response;
  }

  // NO SUBDOMAIN - Redirect to owner login
  if (!subdomain || subdomain === '') {
    return NextResponse.redirect(new URL('/owner/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - api routes
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public folder)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\..*|public).*)',
  ],
};
