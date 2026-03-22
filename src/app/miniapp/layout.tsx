'use client';

import { useEffect, useState, useCallback } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Spin, Avatar } from 'antd';
import {
  HomeOutlined,
  ContactsOutlined,
  RiseOutlined,
  FundProjectionScreenOutlined,
  PhoneOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { useTelegramWebApp } from '@/hooks/useTelegramWebApp';
import { apiClient } from '@/lib/api';
import { useAuthStore } from '@/store/auth';
import { UserRole } from '@/types/api';
import type { UserResponse } from '@/types/api';
import Script from 'next/script';
import './miniapp.css';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';

const TABS = [
  { key: 'dashboard', path: '/miniapp', icon: <HomeOutlined /> },
  { key: 'contacts', path: '/miniapp/contacts', icon: <ContactsOutlined /> },
  { key: 'leads', path: '/miniapp/leads', icon: <RiseOutlined /> },
  { key: 'deals', path: '/miniapp/deals', icon: <FundProjectionScreenOutlined /> },
  { key: 'calls', path: '/miniapp/calls', icon: <PhoneOutlined /> },
];

/** Map API profile response to auth store user shape */
function profileToUser(profile: UserResponse) {
  return {
    id: profile.id,
    first_name: profile.first_name,
    last_name: profile.last_name,
    phone: profile.phone,
    role: profile.role as UserRole,
    company_id: profile.company_id ?? undefined,
    avatar_url: (profile as Record<string, unknown>).avatar_url as string | null ?? null,
    is_active: profile.is_active,
    permissions: profile.permissions,
  };
}

export default function MiniAppLayout({ children }: { children: React.ReactNode }) {
  const { webApp, isReady: sdkReady, isTelegram } = useTelegramWebApp();
  const [authState, setAuthState] = useState<'loading' | 'authenticated' | 'error'>('loading');
  const [errorMsg, setErrorMsg] = useState('');
  const pathname = usePathname() ?? '/miniapp';
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, setUser } = useAuthStore();

  // company_id comes from URL params or Telegram start_param.
  // Security note: this is client-provided but the backend validates that the
  // authenticated telegram_user_id actually belongs to this company before
  // issuing a JWT. Spoofing company_id results in a 401, not cross-tenant access.
  const companyId = searchParams.get('company_id')
    || webApp?.initDataUnsafe?.start_param
    || '';

  const authenticate = useCallback(async () => {
    if (!sdkReady) return;

    // In Telegram: use initData HMAC auth
    if (isTelegram && webApp?.initData && companyId) {
      try {
        await apiClient.miniAppAuth(webApp.initData, companyId);
        const profile = await apiClient.getMyProfile();
        setUser(profileToUser(profile), 'company_user');
        setAuthState('authenticated');
      } catch (err: unknown) {
        const detail = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail;
        setErrorMsg(detail || 'Authentication failed');
        setAuthState('error');
      }
      return;
    }

    // Outside Telegram (dev mode): try existing session
    try {
      const profile = await apiClient.getMyProfile();
      setUser(profileToUser(profile), 'company_user');
      setAuthState('authenticated');
    } catch {
      setErrorMsg(isTelegram ? 'No company_id provided' : 'Not authenticated. Open via Telegram.');
      setAuthState('error');
    }
  }, [sdkReady, isTelegram, webApp, companyId, setUser]);

  useEffect(() => {
    authenticate();
  }, [authenticate]);

  // Sync theme with Telegram
  useEffect(() => {
    if (webApp) {
      const isDark = webApp.colorScheme === 'dark';
      document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
    }
  }, [webApp]);

  const avatarUrl = user?.avatar_url
    ? `${API_BASE_URL}${user.avatar_url}`
    : undefined;

  if (authState === 'loading') {
    return (
      <div className="miniapp-loading">
        <Spin size="large" />
      </div>
    );
  }

  if (authState === 'error') {
    return (
      <div className="miniapp-error">
        <p>{errorMsg}</p>
      </div>
    );
  }

  return (
    <>
      <Script src="https://telegram.org/js/telegram-web-app.js" strategy="beforeInteractive" />
      <div className="miniapp-shell">
        {/* Top bar */}
        <header className="miniapp-header">
          <div className="miniapp-header-title">S1P</div>
          <div
            className="miniapp-header-avatar"
            onClick={() => router.push('/miniapp/profile')}
          >
            <Avatar
              size={32}
              src={avatarUrl}
              icon={!avatarUrl ? <UserOutlined /> : undefined}
            />
          </div>
        </header>

        {/* Content */}
        <main className="miniapp-content">
          {children}
        </main>

        {/* Bottom tab bar */}
        <nav className="miniapp-tabs">
          {TABS.map((tab) => {
            const isActive = tab.path === '/miniapp'
              ? pathname === '/miniapp'
              : pathname.startsWith(tab.path);
            return (
              <button
                key={tab.key}
                className={`miniapp-tab ${isActive ? 'active' : ''}`}
                onClick={() => {
                  if (webApp) {
                    webApp.HapticFeedback.selectionChanged();
                  }
                  router.push(tab.path);
                }}
              >
                {tab.icon}
              </button>
            );
          })}
        </nav>
      </div>
    </>
  );
}
