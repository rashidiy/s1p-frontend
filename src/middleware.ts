import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Owner subdomain (configurable via env)
const OWNER_SUBDOMAIN = process.env.NEXT_PUBLIC_OWNER_SUBDOMAIN || 'owner';

export function middleware(request: NextRequest) {
  // Get host (may include port, e.g. owner.localhost:3000)
  const host = request.headers.get('host') || '';

  // Normalize host for parsing (strip port)
  const [hostname] = host.split(':');

  // Disallow bare localhost/127.0.0.1 usage without a subdomain
  // This forces using e.g. owner.localhost:3000 or company1.localhost:3000
  if (
    hostname === 'localhost' ||
    hostname === '127.0.0.1'
  ) {
    return new NextResponse(
      `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>S1P — Subdomain Required</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #312e81 0%, #4338ca 30%, #6366f1 60%, #818cf8 100%);
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      color: #1f2937;
      overflow: hidden;
      position: relative;
    }
    /* Floating decorative shapes */
    .bg-shape {
      position: absolute;
      border-radius: 50%;
      background: rgba(255,255,255,0.06);
      pointer-events: none;
    }
    .bg-shape-1 { width: 400px; height: 400px; top: -120px; right: -100px; animation: float 8s ease-in-out infinite; }
    .bg-shape-2 { width: 300px; height: 300px; bottom: -80px; left: -60px; animation: float 10s ease-in-out infinite reverse; }
    .bg-shape-3 { width: 180px; height: 180px; top: 40%; left: 10%; animation: float 12s ease-in-out infinite 2s; }
    @keyframes float {
      0%, 100% { transform: translateY(0) rotate(0deg); }
      50% { transform: translateY(-20px) rotate(3deg); }
    }
    .card {
      background: rgba(255,255,255,0.95);
      backdrop-filter: blur(20px);
      border: 1px solid rgba(255,255,255,0.3);
      border-radius: 24px;
      box-shadow: 0 8px 40px rgba(0,0,0,0.12), 0 2px 12px rgba(99,102,241,0.1), inset 0 1px 0 rgba(255,255,255,0.5);
      padding: 52px 44px;
      max-width: 460px;
      width: 90%;
      text-align: center;
      animation: appear 0.5s cubic-bezier(0.16, 1, 0.3, 1);
      position: relative;
      z-index: 1;
    }
    @keyframes appear { from { opacity: 0; transform: translateY(16px) scale(0.98); } to { opacity: 1; transform: translateY(0) scale(1); } }
    .brand-icon {
      width: 56px; height: 56px;
      background: linear-gradient(135deg, #4338ca, #6366f1);
      border-radius: 16px;
      display: flex; align-items: center; justify-content: center;
      margin: 0 auto 16px;
      box-shadow: 0 4px 16px rgba(67,56,202,0.3);
    }
    .brand-icon svg { width: 28px; height: 28px; }
    .brand { font-size: 28px; font-weight: 800; color: #312e81; margin-bottom: 4px; letter-spacing: -0.5px; }
    .brand-sub { font-size: 13px; color: #818cf8; font-weight: 500; letter-spacing: 2px; text-transform: uppercase; margin-bottom: 28px; }
    h1 { font-size: 22px; font-weight: 700; margin-bottom: 10px; color: #1e1b4b; }
    p { font-size: 14px; color: #6b7280; line-height: 1.7; margin-bottom: 28px; }
    .links { display: flex; flex-direction: column; gap: 12px; }
    a {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 10px;
      padding: 14px 24px;
      border-radius: 14px;
      text-decoration: none;
      font-weight: 600;
      font-size: 15px;
      transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
    }
    a svg { width: 18px; height: 18px; flex-shrink: 0; }
    a.primary {
      background: linear-gradient(135deg, #4338ca, #5b4ee0);
      color: #fff;
      box-shadow: 0 4px 16px rgba(67,56,202,0.35);
    }
    a.primary:hover { transform: translateY(-2px); box-shadow: 0 6px 24px rgba(67,56,202,0.45); }
    a.secondary {
      background: #eef2ff;
      color: #4338ca;
      border: 1px solid #e0e7ff;
    }
    a.secondary:hover { background: #e0e7ff; transform: translateY(-2px); box-shadow: 0 4px 12px rgba(99,102,241,0.15); }
    code { background: #eef2ff; padding: 2px 8px; border-radius: 6px; font-size: 13px; color: #4338ca; font-weight: 500; }
  </style>
</head>
<body>
  <div class="bg-shape bg-shape-1"></div>
  <div class="bg-shape bg-shape-2"></div>
  <div class="bg-shape bg-shape-3"></div>
  <div class="card">
    <div class="brand-icon">
      <svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/>
      </svg>
    </div>
    <div class="brand">S1P</div>
    <div class="brand-sub">Platform</div>
    <h1>Subdomain Required</h1>
    <p>Direct access via <code>localhost</code> is not supported. Please use a subdomain to access the platform:</p>
    <div class="links">
      <a href="http://owner.localhost:3000" class="primary">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
        Owner Portal
      </a>
      <a href="http://company1.localhost:3000" class="secondary">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a4 4 0 00-8 0v2"/></svg>
        Company Login
      </a>
    </div>
  </div>
</body>
</html>`,
      { status: 400, headers: { 'content-type': 'text/html; charset=utf-8' } }
    );
  }

  // Get subdomain from nginx header or extract from hostname
  let subdomain = request.headers.get('x-subdomain');

  // Fallback: extract subdomain from hostname if header not present
  if (!subdomain) {
    const parts = hostname.split('.');

    // Check if we have a subdomain (e.g., owner.domain.com or company1.domain.com)
    if (parts.length >= 3) {
      subdomain = parts[0];
    }

    // For hosts like owner.localhost or company1.localhost (dev with /etc/hosts),
    // treat the first label as subdomain and the rest as base "localhost"
    if (!subdomain && parts.length === 2 && parts[1] === 'localhost') {
      subdomain = parts[0];
    }
  }

  const { pathname } = request.nextUrl;

  // Allow public routes without subdomain check
  const publicRoutes = ['/login', '/register', '/set-password', '/forgot-password', '/_next', '/static', '/favicon.ico', '/health'];
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
