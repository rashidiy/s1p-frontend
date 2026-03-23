'use client';

import { useEffect, useState, useCallback } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Spin } from 'antd';
import {
  HomeOutlined,
  ContactsOutlined,
  FunnelPlotOutlined,
  PhoneOutlined,
  RightOutlined,
} from '@ant-design/icons';
import { useTelegramWebApp } from '@/hooks/useTelegramWebApp';
import { apiClient } from '@/lib/api';
import { useAuthStore } from '@/store/auth';
import { UserRole } from '@/types/api';
import type { UserResponse } from '@/types/api';
import { useTranslations } from 'next-intl';
import './miniapp.css';

const TABS = [
  { key: 'home', path: '/miniapp', icon: <HomeOutlined /> },
  { key: 'contacts', path: '/miniapp/contacts', icon: <ContactsOutlined /> },
  { key: 'pipeline', path: '/miniapp/pipeline', icon: <FunnelPlotOutlined /> },
  { key: 'calls', path: '/miniapp/calls', icon: <PhoneOutlined /> },
];

interface CompanyOption {
  id: string;
  name: string;
  role?: string;
}

function profileToUser(profile: UserResponse) {
  return {
    id: profile.id,
    first_name: profile.first_name,
    last_name: profile.last_name,
    phone: profile.phone,
    role: profile.role as UserRole,
    company_id: profile.company_id ?? undefined,
    avatar_url: profile.avatar_url ?? null,
    is_active: profile.is_active,
    permissions: profile.permissions,
  };
}

/** Map deep link params to a miniapp route */
function resolveDeepLink(searchParams: URLSearchParams): string | null {
  const view = searchParams.get('view');
  const id = searchParams.get('id');
  if (!view) return null;

  switch (view) {
    case 'contact':
      return id ? `/miniapp/contacts/${id}` : '/miniapp/contacts';
    case 'lead':
      return id ? `/miniapp/leads/${id}` : '/miniapp/pipeline';
    case 'deal':
      return id ? `/miniapp/deals/${id}` : '/miniapp/pipeline';
    case 'calls':
      return '/miniapp/calls';
    case 'pipeline':
      return '/miniapp/pipeline';
    default:
      return null;
  }
}

export default function MiniAppLayout({ children }: { children: React.ReactNode }) {
  const { webApp, isReady: sdkReady, isTelegram } = useTelegramWebApp();
  const [authState, setAuthState] = useState<'loading' | 'pick_company' | 'authenticated' | 'error'>('loading');
  const [errorMsg, setErrorMsg] = useState('');
  const [companies, setCompanies] = useState<CompanyOption[]>([]);
  const pathname = usePathname() ?? '/miniapp';
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setUser } = useAuthStore();
  const t = useTranslations('miniapp');

  const companyIdParam = searchParams.get('company_id')
    || webApp?.initDataUnsafe?.start_param
    || '';

  // Session-based company persistence
  const getSessionCompany = () => {
    try {
      const stored = sessionStorage.getItem('miniapp_company');
      return stored ? JSON.parse(stored) as { id: string; name: string } : null;
    } catch { return null; }
  };

  const setSessionCompany = (id: string, name: string) => {
    try { sessionStorage.setItem('miniapp_company', JSON.stringify({ id, name })); } catch {}
  };

  // Enable closing confirmation to prevent accidental close
  useEffect(() => {
    if (webApp) {
      try {
        webApp.enableClosingConfirmation();
      } catch {
        // older SDK versions may not support this
      }
    }
  }, [webApp]);

  const authenticateWithCompany = useCallback(async (companyId: string, companyName?: string) => {
    if (!isTelegram || !webApp?.initData) return;
    try {
      await apiClient.miniAppAuth(webApp.initData, companyId);
      const profile = await apiClient.getMyProfile();
      setUser(profileToUser(profile), 'company_user');
      setAuthState('authenticated');

      // Save company to session so we don't ask again on navigation
      if (companyName) {
        setSessionCompany(companyId, companyName);
      }

      // Handle deep link redirect after successful auth
      const deepLink = resolveDeepLink(searchParams);
      if (deepLink && deepLink !== pathname) {
        router.replace(deepLink);
      }
    } catch (err: unknown) {
      const detail = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail;
      setErrorMsg(detail || t('error.authFailed'));
      setAuthState('error');
    }
  }, [isTelegram, webApp, setUser, t, searchParams, pathname, router]);

  const authenticate = useCallback(async () => {
    if (!sdkReady) return;

    // Check if we already have a session (avoid re-asking company on every navigation)
    const sessionCompany = getSessionCompany();

    if (isTelegram && webApp?.initData && companyIdParam) {
      await authenticateWithCompany(companyIdParam);
      return;
    }

    // Use session company if available
    if (isTelegram && webApp?.initData && sessionCompany) {
      await authenticateWithCompany(sessionCompany.id, sessionCompany.name);
      return;
    }

    if (isTelegram && webApp?.initData && !companyIdParam) {
      try {
        const companiesList = await apiClient.miniAppCompanies(webApp.initData);
        if (companiesList.length === 0) {
          setErrorMsg(t('error.noCompanies'));
          setAuthState('error');
        } else if (companiesList.length === 1) {
          await authenticateWithCompany(companiesList[0].id, companiesList[0].name);
        } else {
          setCompanies(companiesList);
          setAuthState('pick_company');
        }
      } catch {
        setErrorMsg(t('error.loadFailed'));
        setAuthState('error');
      }
      return;
    }

    // Outside Telegram (dev mode): try existing session
    try {
      const profile = await apiClient.getMyProfile();
      setUser(profileToUser(profile), 'company_user');
      setAuthState('authenticated');

      // Handle deep link redirect
      const deepLink = resolveDeepLink(searchParams);
      if (deepLink && deepLink !== pathname) {
        router.replace(deepLink);
      }
    } catch {
      const hasTg = typeof window !== 'undefined' && !!window.Telegram;
      const hasWebApp = hasTg && !!window.Telegram?.WebApp;
      const hasInitData = hasWebApp && !!window.Telegram?.WebApp?.initData;
      setErrorMsg(
        `sdk: ${sdkReady}, tg: ${hasTg}, wa: ${hasWebApp}, init: ${hasInitData}, ` +
        `hook: ${isTelegram}, param: ${companyIdParam || 'none'}`
      );
      setAuthState('error');
    }
  }, [sdkReady, isTelegram, webApp, companyIdParam, setUser, authenticateWithCompany, t, searchParams, pathname, router]);

  useEffect(() => {
    authenticate();
  }, [authenticate]);

  // Sync Telegram theme — set CSS variables and header/bg colors
  useEffect(() => {
    if (webApp) {
      const isDark = webApp.colorScheme === 'dark';
      document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
      // Match Telegram's header to our bg
      try {
        webApp.setHeaderColor('secondary_bg_color');
        webApp.setBackgroundColor(webApp.themeParams.secondary_bg_color || (isDark ? '#121214' : '#F8F9FA'));
      } catch {
        // older SDK versions may not support this
      }
    }
  }, [webApp]);

  // Determine if we're on a detail page (hide tab bar)
  const isDetailPage = /\/miniapp\/(contacts|leads|deals)\/[^/]+/.test(pathname);
  const isProfilePage = pathname === '/miniapp/profile';

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
        <div style={{ fontSize: 48, opacity: 0.3 }}>!</div>
        <p style={{ fontWeight: 500, fontSize: 16 }}>{errorMsg}</p>
      </div>
    );
  }

  // Company picker
  if (authState === 'pick_company') {
    return (
      <div className="miniapp-shell">
        <main className="miniapp-content">
          <div className="miniapp-page-title">{t('selectCompany')}</div>
          <div className="miniapp-section">
            <div className="miniapp-list">
              {companies.map((c) => (
                <div
                  key={c.id}
                  className="miniapp-list-item"
                  onClick={() => {
                    webApp?.HapticFeedback.impactOccurred('medium');
                    authenticateWithCompany(c.id, c.name);
                    setAuthState('loading');
                  }}
                >
                  <div className="miniapp-list-item-icon" style={{ background: '#4338CA' }}>
                    {c.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="miniapp-list-item-content">
                    <div className="miniapp-list-item-title">{c.name}</div>
                    {c.role && (
                      <div className="miniapp-list-item-sub">
                        {c.role.replace('company_', '')}
                      </div>
                    )}
                  </div>
                  <div className="miniapp-list-item-chevron">
                    <RightOutlined />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="miniapp-shell">
      <main className="miniapp-content">
        {children}
      </main>

      {/* Bottom tab bar — hidden on detail pages and profile */}
      {!isDetailPage && !isProfilePage && (
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
                  webApp?.HapticFeedback.selectionChanged();
                  router.push(tab.path);
                }}
              >
                {tab.icon}
                <span className="miniapp-tab-label">
                  {t(`tabs.${tab.key}`)}
                </span>
              </button>
            );
          })}
        </nav>
      )}
    </div>
  );
}
