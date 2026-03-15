import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Owner subdomain (configurable via env)
const OWNER_SUBDOMAIN = process.env.NEXT_PUBLIC_OWNER_SUBDOMAIN || 'owner';

export function middleware(request: NextRequest) {
  // Get host (may include port, e.g. owner.localhost:3000)
  const host = request.headers.get('host') || '';

  // Normalize host for parsing (strip port)
  const [hostname] = host.split(':');

  // Bare localhost/127.0.0.1 — allow landing page at root, block app routes
  if (
    hostname === 'localhost' ||
    hostname === '127.0.0.1'
  ) {
    const { pathname } = request.nextUrl;
    // Allow landing page and public assets
    if (pathname === '/' || pathname.startsWith('/_next') || pathname.startsWith('/static') || pathname === '/favicon.ico') {
      return NextResponse.next();
    }
    // Allow public auth routes on bare localhost too
    const publicOnBare = ['/login', '/register', '/set-password', '/forgot-password'];
    if (publicOnBare.some(route => pathname.startsWith(route))) {
      return NextResponse.next();
    }
    // App routes require a subdomain
    return NextResponse.redirect(new URL('/', request.url));
  }

  // Get subdomain from nginx header or extract from hostname
  let subdomain = request.headers.get('x-subdomain');

  // Fallback: extract subdomain from hostname if header not present
  if (!subdomain) {
    const parts = hostname.split('.');

    // Dev: company.localhost (2 parts) — valid
    // Prod: company.domain.com (3 parts) — valid
    // Invalid: company.owner.localhost or a.b.c.domain.com — reject
    const baseDomain = process.env.NEXT_PUBLIC_BASE_DOMAIN || 'localhost';

    if (baseDomain === 'localhost') {
      // Only allow X.localhost, reject X.Y.localhost
      if (parts.length === 2 && parts[1] === 'localhost') {
        subdomain = parts[0];
      } else if (parts.length > 2 && parts[parts.length - 1] === 'localhost') {
        // Multi-level subdomain like buka.owner.localhost — invalid
        const correctSubdomain = parts[0];
        const redirectUrl = new URL(request.url);
        redirectUrl.host = `${correctSubdomain}.localhost:${host.split(':')[1] || '3000'}`;
        return NextResponse.redirect(redirectUrl);
      }
    } else {
      // Prod: X.domain.com (3 parts)
      if (parts.length === 3) {
        subdomain = parts[0];
      }
    }
  }

  const { pathname } = request.nextUrl;

  // Allow static assets and health checks without subdomain validation
  const staticRoutes = ['/_next', '/static', '/favicon.ico', '/health'];
  if (staticRoutes.some(route => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  // Public auth routes — allow but still set subdomain cookie if available
  const publicRoutes = ['/login', '/register', '/set-password', '/forgot-password'];
  if (publicRoutes.some(route => pathname.startsWith(route))) {
    if (subdomain) {
      const response = NextResponse.next();
      response.cookies.set('company_subdomain', subdomain, {
        httpOnly: false,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7,
      });
      return response;
    }
    return NextResponse.next();
  }

  // OWNER SUBDOMAIN ROUTING
  if (subdomain === OWNER_SUBDOMAIN) {
    // Owner hitting root "/" or non-owner routes — redirect to owner dashboard
    if (pathname === '/' || !pathname.startsWith('/owner')) {
      return NextResponse.redirect(new URL('/owner/dashboard', request.url));
    }
    // Owner accessing owner routes - allow
    return NextResponse.next();
  }

  // COMPANY SUBDOMAIN ROUTING
  if (subdomain && subdomain !== OWNER_SUBDOMAIN) {
    // Company subdomain hitting root "/" — redirect to dashboard (not landing page)
    if (pathname === '/') {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }

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
