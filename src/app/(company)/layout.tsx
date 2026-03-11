'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Sidebar } from '@/components/layout/sidebar';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { Button } from 'antd';
import { MenuOutlined } from '@ant-design/icons';

const PAGE_TITLE_KEYS: Record<string, { ns: string; key: string }> = {
  '/dashboard': { ns: 'nav', key: 'dashboard' },
  '/contacts': { ns: 'nav', key: 'contacts' },
  '/leads': { ns: 'nav', key: 'leads' },
  '/deals': { ns: 'nav', key: 'deals' },
  '/tasks': { ns: 'nav', key: 'tasks' },
  '/calls': { ns: 'nav', key: 'calls' },
  '/analytics': { ns: 'nav', key: 'analytics' },
  '/users': { ns: 'nav', key: 'team' },
  '/settings/permission-groups': { ns: 'nav', key: 'permissionGroups' },
  '/settings/contract': { ns: 'nav', key: 'contract' },
  '/settings/telegram': { ns: 'nav', key: 'telegram' },
  '/settings': { ns: 'nav', key: 'settings' },
  '/profile': { ns: 'nav', key: 'profile' },
};

function usePageTitle(pathname: string): string {
  const tNav = useTranslations('nav');
  let bestMatch = '';
  let titleKey = PAGE_TITLE_KEYS['/dashboard'];
  for (const [route, key] of Object.entries(PAGE_TITLE_KEYS)) {
    if (
      (pathname === route || pathname.startsWith(route + '/')) &&
      route.length > bestMatch.length
    ) {
      bestMatch = route;
      titleKey = key;
    }
  }
  return tNav(titleKey.key);
}

export default function CompanyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname() ?? '/dashboard';
  const pageTitle = usePageTitle(pathname);

  // Close mobile sidebar on route change
  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  return (
    <ProtectedRoute requireAuth>
      <div className="flex h-screen bg-[#F8F9FA]">
        <Sidebar
          mobileOpen={sidebarOpen}
          onMobileClose={() => setSidebarOpen(false)}
        />
        <div className="flex flex-col flex-1 min-w-0">
          {/* Responsive header */}
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

          {/* Main content */}
          <main className="flex-1 overflow-y-auto p-4 md:p-6 page-fade-in">
            {children}
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}
