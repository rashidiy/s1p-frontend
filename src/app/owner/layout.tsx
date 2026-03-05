'use client';

import { usePathname } from 'next/navigation';
import { Sidebar } from '@/components/layout/sidebar';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { Button } from 'antd';
import { BellOutlined } from '@ant-design/icons';

const PUBLIC_OWNER_PATHS = [
  '/owner/login',
  '/owner/register',
  '/owner/set-password',
  '/owner/forgot-password',
];

const PAGE_TITLES: Record<string, string> = {
  '/owner/dashboard': 'Dashboard',
  '/owner/companies': 'Companies',
  '/owner/contracts': 'Contracts',
  '/owner/settings': 'Settings',
  '/owner/profile': 'Profile',
};

function getPageTitle(pathname: string): string {
  let bestMatch = '';
  let title = 'Dashboard';
  for (const [route, name] of Object.entries(PAGE_TITLES)) {
    if (
      (pathname === route || pathname.startsWith(route + '/')) &&
      route.length > bestMatch.length
    ) {
      bestMatch = route;
      title = name;
    }
  }
  return title;
}

export default function OwnerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  if (PUBLIC_OWNER_PATHS.some((path) => pathname.startsWith(path))) {
    return <>{children}</>;
  }

  const pageTitle = getPageTitle(pathname);

  return (
    <ProtectedRoute requireAuth requireOwner>
      <div className="flex h-screen bg-[#F8F9FA]">
        <Sidebar />
        <div className="flex flex-col flex-1 min-w-0">
          {/* Top header */}
          <header
            style={{
              height: 64,
              background: '#FFFFFF',
              borderBottom: '1px solid #E5E7EB',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingLeft: 24,
              paddingRight: 24,
              flexShrink: 0,
            }}
          >
            <h1
              style={{
                fontSize: 20,
                fontWeight: 700,
                color: '#0F172A',
                margin: 0,
              }}
            >
              {pageTitle}
            </h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <Button
                icon={<BellOutlined />}
                type="text"
                style={{ color: '#64748B' }}
              />
              <Button
                style={{
                  borderColor: '#E5E7EB',
                  color: '#374151',
                  fontSize: 13,
                  borderRadius: 8,
                }}
              >
                Customize Widget
              </Button>
            </div>
          </header>

          {/* Main content */}
          <main className="flex-1 overflow-y-auto p-6">{children}</main>
        </div>
      </div>
    </ProtectedRoute>
  );
}
