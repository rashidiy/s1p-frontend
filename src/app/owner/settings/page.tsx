'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  UserOutlined,
  BankOutlined,
  FileTextOutlined,
  KeyOutlined,
  RightOutlined,
  GlobalOutlined,
} from '@ant-design/icons';
import { useTranslations, useLocale } from 'next-intl';
import { Radio } from 'antd';
import { useThemeStore } from '@/store/theme';
import { locales, type Locale } from '@/i18n/config';

const LOCALE_NAMES: Record<Locale, string> = {
  ru: 'Русский',
  en: 'English',
  uz: "O'zbekcha",
};

const ENV_SETTINGS = [
  { key: 'WEBHOOK_IP_WHITELIST_ENABLED', description: 'Enable IP allowlist for incoming webhooks' },
  { key: 'SIPUNI_ALLOWED_IPS', description: 'Comma-separated Sipuni webhook IP allowlist' },
  { key: 'BINOTEL_ALLOWED_IPS', description: 'Comma-separated Binotel webhook IP allowlist' },
  { key: 'JWT_SIGNING_KEY', description: 'Secret key used for JWT token signing' },
  { key: 'BASE_URL', description: 'Public base URL of the API server' },
];

export default function OwnerSettingsPage() {
  const t = useTranslations();
  const locale = useLocale() as Locale;
  const router = useRouter();
  const { mode, setMode } = useThemeStore();

  const handleLocaleChange = (newLocale: string) => {
    document.cookie = `locale=${newLocale};path=/;max-age=31536000;samesite=lax`;
    router.refresh();
  };

  const SETTINGS_SECTIONS = [
    {
      title: t('settings.profileSecurity'),
      description: t('settings.profileSecurityDescription'),
      href: '/owner/profile',
      icon: <UserOutlined className="text-lg" />,
      color: '#6366f1',
      bg: '#eef2ff',
    },
    {
      title: t('nav.companies'),
      description: t('settings.companiesDescription'),
      href: '/owner/companies',
      icon: <BankOutlined className="text-lg" />,
      color: '#3b82f6',
      bg: '#eff6ff',
    },
    {
      title: t('nav.contracts'),
      description: t('settings.contractsDescription'),
      href: '/owner/contracts',
      icon: <FileTextOutlined className="text-lg" />,
      color: '#10b981',
      bg: '#ecfdf5',
    },
  ];

  return (
    <div className="space-y-8">
      <div className="page-header">
        <p className="page-subtitle">{t('settings.platformSettingsSubtitle')}</p>
      </div>

      {/* Navigation cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {SETTINGS_SECTIONS.map((section) => (
          <Link key={section.href + section.title} href={section.href}>
            <div className="glass-card p-5 cursor-pointer hover:shadow-md transition-all duration-200 group hover:-translate-y-0.5">
              <div className="flex items-start gap-4">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform duration-200 group-hover:scale-110"
                  style={{ background: section.bg, color: section.color }}
                >
                  {section.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-800 group-hover:text-gray-900 transition-colors">
                    {section.title}
                  </p>
                  <p className="text-sm text-gray-400 mt-0.5 leading-relaxed">{section.description}</p>
                </div>
                <RightOutlined className="text-xs text-gray-300 group-hover:text-gray-500 transition-all duration-200 group-hover:translate-x-0.5 mt-1 flex-shrink-0" />
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Appearance */}
      <div className="glass-card p-4 sm:p-6 space-y-4">
        <div>
          <h2 className="text-base font-semibold text-gray-800">{t('settings.appearance')}</h2>
          <p className="text-xs text-gray-400">{t('settings.appearanceDescription')}</p>
        </div>
        <Radio.Group value={mode} onChange={(e) => setMode(e.target.value)} optionType="button" buttonStyle="solid">
          <Radio.Button value="light">{t('settings.light')}</Radio.Button>
          <Radio.Button value="dark">{t('settings.dark')}</Radio.Button>
          <Radio.Button value="system">{t('settings.systemTheme')}</Radio.Button>
        </Radio.Group>
      </div>

      {/* Language */}
      <div className="glass-card p-4 sm:p-6 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
            <GlobalOutlined className="text-blue-500" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-gray-800">{t('settings.language')}</h2>
            <p className="text-xs text-gray-400">{t('settings.languageDescription')}</p>
          </div>
        </div>
        <Radio.Group value={locale} onChange={(e) => handleLocaleChange(e.target.value)} optionType="button" buttonStyle="solid">
          {locales.map((loc) => (
            <Radio.Button key={loc} value={loc}>{LOCALE_NAMES[loc]}</Radio.Button>
          ))}
        </Radio.Group>
      </div>

      {/* Server environment settings — read-only info */}
      <div className="glass-card p-4 sm:p-6 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center">
            <KeyOutlined className="text-amber-500" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-gray-800">{t('settings.serverEnvVars')}</h2>
            <p className="text-xs text-gray-400">
              {t('settings.serverEnvVarsDescription')}
            </p>
          </div>
        </div>
        <div className="divide-y divide-gray-50">
          {ENV_SETTINGS.map((item) => (
            <div key={item.key} className="py-3 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
              <code className="text-xs font-mono bg-slate-50 text-slate-600 px-2.5 py-1.5 rounded-lg shrink-0 border border-slate-100 w-fit">
                {item.key}
              </code>
              <span className="text-sm text-gray-400">{item.description}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
