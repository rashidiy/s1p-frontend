'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { Sidebar } from '@/components/layout/sidebar';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { Button } from 'antd';
import { BellOutlined, MenuOutlined } from '@ant-design/icons';

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
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname() ?? '/owner/dashboard';

  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  if (PUBLIC_OWNER_PATHS.some((path) => pathname.startsWith(path))) {
    return <>{children}</>;
  }

  const pageTitle = getPageTitle(pathname);

  return (
    <ProtectedRoute requireAuth requireOwner>
      <div className="flex h-screen bg-[#F8F9FA]">
        <Sidebar
          mobileOpen={sidebarOpen}
          onMobileClose={() => setSidebarOpen(false)}
        />
        <div className="flex flex-col flex-1 min-w-0">
          <header className="app-header">
            <div className="flex items-center gap-3">
              <Button
                icon={<MenuOutlined />}
                type="text"
                onClick={() => setSidebarOpen(true)}
                className="hamburger-btn"
              />
              <h1 className="app-header-title">{pageTitle}</h1>
            </div>
            <div className="flex items-center gap-2">
              <Button
                icon={<BellOutlined />}
                type="text"
                className="header-icon-btn"
              />
            </div>
          </header>
          <main className="flex-1 overflow-y-auto p-4 md:p-6 page-fade-in">
            {children}
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}
