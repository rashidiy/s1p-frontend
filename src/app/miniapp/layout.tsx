'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Spin } from 'antd';
import { Phone, Users, Home, Filter, Clock, ChevronRight } from 'lucide-react';
import { useTelegramWebApp } from '@/hooks/useTelegramWebApp';
import { apiClient } from '@/lib/api';
import { useAuthStore } from '@/store/auth';
import { UserRole } from '@/types/api';
import type { UserResponse } from '@/types/api';
import { useTranslations } from 'next-intl';
import './miniapp.css';

class MiniAppErrorBoundary extends React.Component<
  { children: React.ReactNode; errorTitle: string; reloadLabel: string },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode; errorTitle: string; reloadLabel: string }) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('MiniApp error:', error, info);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="miniapp-error">
          <div style={{ fontSize: 48, opacity: 0.3 }}>!</div>
          <p style={{ fontWeight: 500, fontSize: 16 }}>{this.props.errorTitle}</p>
          <button
            onClick={() => window.location.reload()}
            style={{
              marginTop: 12,
              padding: '8px 24px',
              background: 'var(--ma-accent)',
              color: '#fff',
              border: 'none',
              borderRadius: 8,
              fontSize: 14,
              cursor: 'pointer',
            }}
          >
            {this.props.reloadLabel}
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

const TABS: Array<{ key: string; path: string; icon: React.ReactNode; center?: boolean }> = [
  { key: 'calls', path: '/miniapp/calls', icon: <Phone size={24} /> },
  { key: 'contacts', path: '/miniapp/contacts', icon: <Users size={24} /> },
  { key: 'home', path: '/miniapp', icon: <Home size={24} />, center: true },
  { key: 'pipeline', path: '/miniapp/pipeline', icon: <Filter size={24} /> },
  { key: 'history', path: '/miniapp/history', icon: <Clock size={24} /> },
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
    sip_extension: profile.sip_extension ?? undefined,
  };
}

/** Map deep link params to a miniapp route */
function decodeStartapp(param: string): { action: string; data: string; company_id: string } | null {
  try {
    const padded = param + '='.repeat((4 - (param.length % 4)) % 4);
    const raw = atob(padded.replace(/-/g, '+').replace(/_/g, '/'));
    const parts = raw.split(':');
    if (parts.length !== 4) return null;
    return { action: parts[0], data: parts[1], company_id: parts[2] };
  } catch {
    return null;
  }
}

function startappToDeepLink(action: string, data: string): string | null {
  switch (action) {
    case 'call':
      return `/miniapp/calls?dial=${encodeURIComponent(data)}`;
    case 'call_detail':
      return `/miniapp/calls/${data}`;
    case 'new_contact':
      return `/miniapp/contacts/new?phone=${encodeURIComponent(data)}`;
    case 'new_lead':
      return `/miniapp/pipeline?new_lead=1&phone=${encodeURIComponent(data)}`;
    case 'lead_detail':
      return `/miniapp/leads/${data}`;
    case 'deal_detail':
      return `/miniapp/deals/${data}`;
    case 'recording':
      return `/miniapp/calls/${data}`;
    default:
      return null;
  }
}

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
      return '/miniapp/history';
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
  const tRoles = useTranslations('roles');

  // Check if deep link was already handled — persists across Mini App restarts
  // because startapp param is baked into the Telegram SDK session
  const isDeepLinkHandled = () => {
    try { return sessionStorage.getItem('miniapp_deeplink_handled') === '1'; } catch { return false; }
  };
  const markDeepLinkHandled = () => {
    try { sessionStorage.setItem('miniapp_deeplink_handled', '1'); } catch {}
  };

  // Parse startapp param — could be raw company_id or base64-encoded signed payload
  const rawStartParam = searchParams.get('company_id')
    || webApp?.initDataUnsafe?.start_param
    || '';
  const startappData = rawStartParam ? decodeStartapp(rawStartParam) : null;
  const companyIdParam = startappData?.company_id || rawStartParam;

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

  // Expand to full height + enable closing confirmation
  useEffect(() => {
    if (webApp) {
      try { webApp.expand(); } catch {}
      try { webApp.enableClosingConfirmation(); } catch {}
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

      // Handle deep link redirect after successful auth (once only)
      if (!isDeepLinkHandled()) {
        const deepLink = resolveDeepLink(searchParams)
          || (startappData ? startappToDeepLink(startappData.action, startappData.data) : null);
        if (deepLink && deepLink !== pathname) {
          markDeepLinkHandled();
          router.replace(deepLink);
        }
      }
    } catch (err: unknown) {
      const detail = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail;
      setErrorMsg(detail || t('error.authFailed'));
      setAuthState('error');
    }
  }, [isTelegram, webApp, setUser, t, searchParams, pathname, router, startappData]);

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

      // Handle deep link redirect (once only)
      if (!isDeepLinkHandled()) {
        const deepLink = resolveDeepLink(searchParams)
          || (startappData ? startappToDeepLink(startappData.action, startappData.data) : null);
        if (deepLink && deepLink !== pathname) {
          markDeepLinkHandled();
          router.replace(deepLink);
        }
      }
    } catch {
      const hasTg = typeof window !== 'undefined' && !!window.Telegram;
      const hasWebApp = hasTg && !!window.Telegram?.WebApp;
      const hasInitData = hasWebApp && !!window.Telegram?.WebApp?.initData;
      console.error(
        `Auth failed — sdk: ${sdkReady}, tg: ${hasTg}, wa: ${hasWebApp}, init: ${hasInitData}, ` +
        `hook: ${isTelegram}, param: ${companyIdParam || 'none'}`
      );
      setErrorMsg(t('error.authFailed'));
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
      // Match Telegram's header, background, and bottom bar to our bg
      try {
        const bgColor = webApp.themeParams.secondary_bg_color || (isDark ? '#121214' : '#F8F9FA');
        webApp.setHeaderColor('secondary_bg_color');
        webApp.setBackgroundColor(bgColor);
        // Bottom bar color controls the area behind the home indicator on iPhone
        webApp.setBottomBarColor(bgColor);
      } catch {
        // older SDK versions may not support all methods
      }
    }
  }, [webApp]);

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
                        {(() => { try { return tRoles(c.role); } catch { return c.role.replace('company_', ''); } })()}
                      </div>
                    )}
                  </div>
                  <div className="miniapp-list-item-chevron">
                    <ChevronRight size={16} />
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
        <MiniAppErrorBoundary errorTitle={t('error.somethingWentWrong')} reloadLabel={t('error.reload')}>
          {children}
        </MiniAppErrorBoundary>
      </main>

      {/* Bottom tab bar — always visible for navigation safety */}
      <nav className="miniapp-tabs">
        {TABS.map((tab) => {
          const isActive = tab.path === '/miniapp'
            ? pathname === '/miniapp'
            : pathname.startsWith(tab.path);
          return (
            <button
              key={tab.key}
              className={`miniapp-tab ${isActive ? 'active' : ''} ${tab.center ? 'miniapp-tab-center' : ''}`}
              onClick={() => {
                webApp?.HapticFeedback.selectionChanged();
                router.push(tab.path);
              }}
            >
              {tab.center ? (
                <div className="miniapp-tab-center-circle">
                  {tab.icon}
                </div>
              ) : (
                tab.icon
              )}
            </button>
          );
        })}
      </nav>
    </div>
  );
}
