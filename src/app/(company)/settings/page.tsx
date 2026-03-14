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
} from '@ant-design/icons';
import { Button } from 'antd';
import { useTranslations } from 'next-intl';
import { useLocale } from 'next-intl';
import { useAuthStore } from '@/store/auth';
import { UserRole } from '@/types/api';
import { useThemeStore } from '@/store/theme';
import { locales, type Locale } from '@/i18n/config';

const LOCALE_LABELS: Record<Locale, string> = {
  ru: 'RU',
  en: 'EN',
  uz: 'UZ',
};

export default function SettingsPage() {
  const { hasPermission } = useAuthStore();
  const isAdmin = hasPermission(UserRole.COMPANY_ADMIN);
  const t = useTranslations('settings');
  const { mode, setMode } = useThemeStore();
  const locale = useLocale() as Locale;
  const router = useRouter();

  const handleLocaleChange = (newLocale: string) => {
    document.cookie = `locale=${newLocale};path=/;max-age=31536000;samesite=lax`;
    router.refresh();
  };

  const settingsLinks = [
    {
      href: '/profile',
      icon: <UserOutlined style={{ fontSize: 22, color: '#6366f1' }} />,
      title: t('myProfile'),
      description: t('myProfileDescription'),
      bg: 'bg-indigo-50',
      adminOnly: false,
    },
    {
      href: '/settings/permission-groups',
      icon: <SafetyOutlined style={{ fontSize: 22, color: '#7c3aed' }} />,
      title: t('permissionGroups'),
      description: t('permissionGroupsDescription'),
      bg: 'bg-purple-50',
      adminOnly: true,
    },
    {
      href: '/settings/contract',
      icon: <FileTextOutlined style={{ fontSize: 22, color: '#0891b2' }} />,
      title: t('contractBilling'),
      description: t('contractBillingDescription'),
      bg: 'bg-cyan-50',
      adminOnly: true,
    },
    {
      href: '/settings/custom-fields',
      icon: <FormOutlined style={{ fontSize: 22, color: '#f59e0b' }} />,
      title: t('customFields'),
      description: t('customFieldsDescription'),
      bg: 'bg-amber-50',
      adminOnly: true,
    },
    {
      href: '/settings/api-keys',
      icon: <KeyOutlined style={{ fontSize: 22, color: '#10b981' }} />,
      title: t('apiKeys'),
      description: t('apiKeysDescription'),
      bg: 'bg-emerald-50',
      adminOnly: true,
    },
    {
      href: '/settings/webhooks',
      icon: <ApiOutlined style={{ fontSize: 22, color: '#8b5cf6' }} />,
      title: t('webhooks'),
      description: t('webhooksDescription'),
      bg: 'bg-violet-50',
      adminOnly: true,
    },
    {
      href: '/settings/telegram',
      icon: <SendOutlined style={{ fontSize: 22, color: '#0ea5e9' }} />,
      title: t('telegramBot'),
      description: t('telegramBotDescription'),
      bg: 'bg-sky-50',
      adminOnly: true,
    },
  ];

  const visibleLinks = settingsLinks.filter((l) => !l.adminOnly || isAdmin);

  const themeModes = [
    { key: 'light' as const, label: t('light') },
    { key: 'dark' as const, label: t('dark') },
    { key: 'system' as const, label: t('systemTheme') },
  ];

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="page-header">
        <div>
          <p className="page-subtitle">{t('subtitle')}</p>
        </div>
      </div>

      {/* Appearance */}
      <div className="glass-card p-5">
        <h3 className="text-base font-semibold" style={{ color: 'var(--text-primary)' }}>{t('appearance')}</h3>
        <p className="text-sm mt-0.5" style={{ color: 'var(--text-secondary)' }}>{t('appearanceDescription')}</p>
        <div className="flex gap-2 mt-3">
          {themeModes.map((tm) => (
            <Button
              key={tm.key}
              type={mode === tm.key ? 'primary' : 'default'}
              onClick={() => setMode(tm.key)}
            >
              {tm.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Language */}
      <div className="glass-card p-5">
        <h3 className="text-base font-semibold" style={{ color: 'var(--text-primary)' }}>{t('language')}</h3>
        <p className="text-sm mt-0.5" style={{ color: 'var(--text-secondary)' }}>{t('languageDescription')}</p>
        <div className="flex gap-2 mt-3">
          {locales.map((loc) => (
            <Button
              key={loc}
              type={locale === loc ? 'primary' : 'default'}
              onClick={() => handleLocaleChange(loc)}
            >
              {LOCALE_LABELS[loc]}
            </Button>
          ))}
        </div>
      </div>

      <div className="grid gap-4">
        {visibleLinks.map((link) => (
          <Link key={link.href} href={link.href}>
            <div className="glass-card p-5 hover:shadow-md transition-all cursor-pointer group hover:-translate-y-0.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`h-11 w-11 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform duration-200 group-hover:scale-110 ${link.bg}`}>
                    {link.icon}
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-gray-800 group-hover:text-gray-900 transition-colors">{link.title}</h3>
                    <p className="text-sm text-gray-400 mt-0.5">{link.description}</p>
                  </div>
                </div>
                <RightOutlined className="text-xs text-gray-300 group-hover:text-gray-500 transition-all duration-200 group-hover:translate-x-0.5 flex-shrink-0" />
              </div>
            </div>
          </Link>
        ))}
      </div>

      {!isAdmin && (
        <div className="glass-card p-5 border border-amber-200 bg-amber-50/50">
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
