'use client';

import { useLocale } from 'next-intl';
import { locales, type Locale } from '@/i18n/config';
import { GlobalOutlined } from '@ant-design/icons';
import { Dropdown } from 'antd';
import type { MenuProps } from 'antd';
import { useRouter } from 'next/navigation';

const LOCALE_LABELS: Record<Locale, string> = {
  ru: 'RU',
  en: 'EN',
  uz: 'UZ',
};

export function LanguageSwitcher() {
  const locale = useLocale() as Locale;
  const router = useRouter();

  const handleLocaleChange = (newLocale: string) => {
    document.cookie = `locale=${newLocale};path=/;max-age=31536000;samesite=lax`;
    router.refresh();
  };

  const items: MenuProps['items'] = locales.map((loc) => ({
    key: loc,
    label: LOCALE_LABELS[loc],
    style: loc === locale ? { fontWeight: 700, color: '#4338CA' } : undefined,
    onClick: () => handleLocaleChange(loc),
  }));

  return (
    <Dropdown menu={{ items }} trigger={['click']} placement="topRight">
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: 36,
          height: 36,
          borderRadius: 8,
          cursor: 'pointer',
          color: '#64748B',
          fontSize: 11,
          fontWeight: 600,
          gap: 2,
          transition: 'all 0.15s',
          flexShrink: 0,
        }}
        title="Language"
      >
        <GlobalOutlined style={{ fontSize: 14 }} />
        <span style={{ fontSize: 10 }}>{LOCALE_LABELS[locale]}</span>
      </div>
    </Dropdown>
  );
}
