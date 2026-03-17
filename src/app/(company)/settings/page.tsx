'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  SafetyOutlined,
  FileTextOutlined,
  RightOutlined,
  UserOutlined,
  LockOutlined,
  SendOutlined,
  FormOutlined,
  KeyOutlined,
  ApiOutlined,
  SunOutlined,
  MoonOutlined,
  LaptopOutlined,
  GlobalOutlined,
} from '@ant-design/icons';
import { Segmented } from 'antd';
import { useTranslations } from 'next-intl';
import { useLocale } from 'next-intl';
import { useAuthStore } from '@/store/auth';
import { UserRole } from '@/types/api';
import { useThemeStore } from '@/store/theme';
import { locales, type Locale } from '@/i18n/config';

const LOCALE_LABELS: Record<Locale, string> = {
  ru: 'Русский',
  en: 'English',
  uz: 'O\'zbekcha',
};

export default function SettingsPage() {
  const { hasPermission } = useAuthStore();
  const isAdmin = hasPermission(UserRole.COMPANY_ADMIN);
  const t = useTranslations('settings');
  const tNav = useTranslations('nav');
  const { mode, setMode } = useThemeStore();
  const locale = useLocale() as Locale;
  const router = useRouter();

  const handleLocaleChange = (newLocale: string) => {
    document.cookie = `locale=${newLocale};path=/;max-age=31536000;samesite=lax`;
    router.refresh();
  };

  const adminLinks = [
    {
      href: '/settings/permission-groups',
      icon: <SafetyOutlined />,
      color: '#7c3aed',
      bg: 'bg-purple-50',
      title: t('permissionGroups'),
      description: t('permissionGroupsDescription'),
    },
    {
      href: '/settings/custom-fields',
      icon: <FormOutlined />,
      color: '#f59e0b',
      bg: 'bg-amber-50',
      title: t('customFields'),
      description: t('customFieldsDescription'),
    },
    {
      href: '/settings/telegram',
      icon: <SendOutlined />,
      color: '#0ea5e9',
      bg: 'bg-sky-50',
      title: t('telegramBot'),
      description: t('telegramBotDescription'),
    },
    {
      href: '/settings/api-keys',
      icon: <KeyOutlined />,
      color: '#10b981',
      bg: 'bg-emerald-50',
      title: t('apiKeys'),
      description: t('apiKeysDescription'),
    },
    {
      href: '/settings/webhooks',
      icon: <ApiOutlined />,
      color: '#8b5cf6',
      bg: 'bg-violet-50',
      title: t('webhooks'),
      description: t('webhooksDescription'),
    },
    {
      href: '/settings/contract',
      icon: <FileTextOutlined />,
      color: '#0891b2',
      bg: 'bg-cyan-50',
      title: t('contractBilling'),
      description: t('contractBillingDescription'),
    },
  ];

  return (
    <div className="space-y-8 max-w-3xl">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
          {tNav('settings')}
        </h1>
        <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
          {t('subtitle')}
        </p>
      </div>

      {/* General Section */}
      <div className="space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
          {t('general') || 'General'}
        </h2>

        {/* Profile Link */}
        <Link href="/profile">
          <div className="glass-card p-4 hover:shadow-md transition-all cursor-pointer group">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-indigo-50 flex items-center justify-center">
                  <UserOutlined style={{ fontSize: 18, color: '#6366f1' }} />
                </div>
                <div>
                  <h3 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{t('myProfile')}</h3>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{t('myProfileDescription')}</p>
                </div>
              </div>
              <RightOutlined className="text-xs text-gray-300 group-hover:text-gray-500 transition-colors" />
            </div>
          </div>
        </Link>

        {/* Appearance + Language in one card */}
        <div className="glass-card p-5 space-y-5">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-gray-100 flex items-center justify-center">
                <SunOutlined style={{ fontSize: 18, color: '#6b7280' }} />
              </div>
              <div>
                <h3 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{t('appearance')}</h3>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{t('appearanceDescription')}</p>
              </div>
            </div>
            <Segmented
              value={mode}
              onChange={(v) => setMode(v as 'light' | 'dark' | 'system')}
              options={[
                { value: 'light', icon: <SunOutlined /> },
                { value: 'dark', icon: <MoonOutlined /> },
                { value: 'system', icon: <LaptopOutlined /> },
              ]}
              size="small"
            />
          </div>

          <div style={{ borderTop: '1px solid var(--border-light)' }} />

          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-blue-50 flex items-center justify-center">
                <GlobalOutlined style={{ fontSize: 18, color: '#3b82f6' }} />
              </div>
              <div>
                <h3 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{t('language')}</h3>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{t('languageDescription')}</p>
              </div>
            </div>
            <Segmented
              value={locale}
              onChange={(v) => handleLocaleChange(v as string)}
              options={locales.map((loc) => ({ value: loc, label: LOCALE_LABELS[loc] }))}
              size="small"
            />
          </div>
        </div>
      </div>

      {/* Administration Section */}
      {isAdmin && (
        <div className="space-y-4">
          <h2 className="text-sm font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
            {t('administration') || 'Administration'}
          </h2>

          <div className="glass-card overflow-hidden divide-y" style={{ borderColor: 'var(--border-light)' }}>
            {adminLinks.map((link) => (
              <Link key={link.href} href={link.href}>
                <div className="p-4 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors cursor-pointer group">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`h-9 w-9 rounded-lg flex items-center justify-center flex-shrink-0 ${link.bg}`}>
                        <span style={{ fontSize: 16, color: link.color }}>{link.icon}</span>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{link.title}</h3>
                        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{link.description}</p>
                      </div>
                    </div>
                    <RightOutlined className="text-xs text-gray-300 group-hover:text-gray-500 transition-colors flex-shrink-0" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {!isAdmin && (
        <div className="glass-card p-4 border border-amber-200 bg-amber-50/50">
          <h3 className="text-sm font-semibold text-amber-700 flex items-center gap-2">
            <LockOutlined />
            {t('adminOnlySettings')}
          </h3>
          <p className="text-xs text-amber-600 mt-1">
            {t('adminOnlyDescription')}
          </p>
        </div>
      )}
    </div>
  );
}
