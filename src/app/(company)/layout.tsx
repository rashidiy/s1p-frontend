'use client';

import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Sidebar } from '@/components/layout/sidebar';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { Button } from 'antd';
import { BellOutlined } from '@ant-design/icons';

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
  const pathname = usePathname();
  const pageTitle = usePageTitle(pathname);
  const tActions = useTranslations('actions');

  return (
    <ProtectedRoute requireAuth>
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
                {tActions('customizeWidget')}
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
