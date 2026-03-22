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
  RightOutlined,
} from '@ant-design/icons';
import { useTelegramWebApp } from '@/hooks/useTelegramWebApp';
import { apiClient } from '@/lib/api';
import { useAuthStore } from '@/store/auth';
import { UserRole } from '@/types/api';
import type { UserResponse } from '@/types/api';
import './miniapp.css';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';

const TABS = [
  { key: 'dashboard', path: '/miniapp', icon: <HomeOutlined /> },
  { key: 'contacts', path: '/miniapp/contacts', icon: <ContactsOutlined /> },
  { key: 'leads', path: '/miniapp/leads', icon: <RiseOutlined /> },
  { key: 'deals', path: '/miniapp/deals', icon: <FundProjectionScreenOutlined /> },
  { key: 'calls', path: '/miniapp/calls', icon: <PhoneOutlined /> },
];

interface CompanyOption {
  id: string;
  name: string;
  role?: string;
}

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
  const [authState, setAuthState] = useState<'loading' | 'pick_company' | 'authenticated' | 'error'>('loading');
  const [errorMsg, setErrorMsg] = useState('');
  const [companies, setCompanies] = useState<CompanyOption[]>([]);
  const pathname = usePathname() ?? '/miniapp';
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, setUser } = useAuthStore();

  // company_id comes from URL params or Telegram start_param.
  // Security note: this is client-provided but the backend validates that the
  // authenticated telegram_user_id actually belongs to this company before
  // issuing a JWT. Spoofing company_id results in a 401, not cross-tenant access.
  const companyIdParam = searchParams.get('company_id')
    || webApp?.initDataUnsafe?.start_param
    || '';

  const authenticateWithCompany = useCallback(async (companyId: string) => {
    if (!isTelegram || !webApp?.initData) return;
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
  }, [isTelegram, webApp, setUser]);

  const authenticate = useCallback(async () => {
    if (!sdkReady) return;

    // In Telegram with company_id — direct auth
    if (isTelegram && webApp?.initData && companyIdParam) {
      await authenticateWithCompany(companyIdParam);
      return;
    }

    // In Telegram without company_id — fetch companies list
    if (isTelegram && webApp?.initData && !companyIdParam) {
      try {
        const companiesList = await apiClient.miniAppCompanies(webApp.initData);
        if (companiesList.length === 0) {
          setErrorMsg('No companies found for this account');
          setAuthState('error');
        } else if (companiesList.length === 1) {
          // Auto-select single company
          await authenticateWithCompany(companiesList[0].id);
        } else {
          // Show company picker
          setCompanies(companiesList);
          setAuthState('pick_company');
        }
      } catch {
        setErrorMsg('Failed to load companies');
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
      setErrorMsg('Not authenticated. Open via Telegram.');
      setAuthState('error');
    }
  }, [sdkReady, isTelegram, webApp, companyIdParam, setUser, authenticateWithCompany]);

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

  // Company picker
  if (authState === 'pick_company') {
    return (
      <div className="miniapp-shell">
          <header className="miniapp-header">
            <div className="miniapp-header-title">S1P</div>
          </header>
          <main className="miniapp-content">
            <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 16 }}>
              Select company
            </div>
            <div className="miniapp-list">
              {companies.map((c) => (
                <div
                  key={c.id}
                  className="miniapp-list-item"
                  onClick={() => {
                    webApp?.HapticFeedback.impactOccurred('medium');
                    authenticateWithCompany(c.id);
                    setAuthState('loading');
                  }}
                >
                  <div className="miniapp-list-item-content">
                    <div className="miniapp-list-item-title">{c.name}</div>
                    {c.role && (
                      <div className="miniapp-list-item-sub">
                        {c.role.replace('company_', '')}
                      </div>
                    )}
                  </div>
                  <div className="miniapp-list-item-right">
                    <RightOutlined />
                  </div>
                </div>
              ))}
            </div>
          </main>
        </div>
    );
  }

  return (
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
  );
}
