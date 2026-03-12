'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { Sidebar } from '@/components/layout/sidebar';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { Button } from 'antd';
import { MenuOutlined } from '@ant-design/icons';
import { useTranslations } from 'next-intl';

const PUBLIC_OWNER_PATHS = [
  '/owner/login',
  '/owner/register',
  '/owner/set-password',
  '/owner/forgot-password',
];

const PAGE_TITLE_KEYS: Record<string, string> = {
  '/owner/dashboard': 'dashboard',
  '/owner/companies': 'companies',
  '/owner/contracts': 'contracts',
  '/owner/profile': 'profile',
};

function getPageTitleKey(pathname: string): string {
  let bestMatch = '';
  let titleKey = 'dashboard';
  for (const [route, key] of Object.entries(PAGE_TITLE_KEYS)) {
    if (
      (pathname === route || pathname.startsWith(route + '/')) &&
      route.length > bestMatch.length
    ) {
      bestMatch = route;
      titleKey = key;
    }
  }
  return titleKey;
}

export default function OwnerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname() ?? '/owner/dashboard';
  const tNav = useTranslations('nav');

  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  if (PUBLIC_OWNER_PATHS.some((path) => pathname.startsWith(path))) {
    return <>{children}</>;
  }

  const pageTitle = tNav(getPageTitleKey(pathname));

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
          </header>
          <main className="flex-1 overflow-y-auto p-4 md:p-6 page-fade-in">
            {children}
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}
