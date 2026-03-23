'use client';

import { useState } from 'react';
import {
  LogoutOutlined,
  GlobalOutlined,
  CheckOutlined,
} from '@ant-design/icons';
import { useAuthStore } from '@/store/auth';
import { useTelegramWebApp } from '@/hooks/useTelegramWebApp';
import { useTranslations, useLocale } from 'next-intl';
import { getInitials, getAvatarColor } from '../_utils';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';

const LANGUAGES = [
  { code: 'ru', label: 'Русский', flag: '🇷🇺' },
  { code: 'en', label: 'English', flag: '🇬🇧' },
  { code: 'uz', label: 'O\'zbekcha', flag: '🇺🇿' },
];

export default function MiniAppProfile() {
  const { user } = useAuthStore();
  const { webApp } = useTelegramWebApp();
  const t = useTranslations('miniapp');
  const tRoles = useTranslations('roles');
  const currentLocale = useLocale();
  const [showLangs, setShowLangs] = useState(false);

  const fullName = [user?.first_name, user?.last_name].filter(Boolean).join(' ') || 'User';
  const avatarUrl = user?.avatar_url
    ? `${API_BASE_URL}${user.avatar_url}`
    : undefined;
  const initials = getInitials(user?.first_name, user?.last_name);

  function changeLanguage(locale: string) {
    webApp?.HapticFeedback.impactOccurred('light');
    document.cookie = `locale=${locale};path=/;max-age=31536000`;
    window.location.reload();
  }

  function formatRole(role?: string): string {
    if (!role) return '';
    try {
      return tRoles(role);
    } catch {
      return role.replace('company_', '').replace('_', ' ');
    }
  }

  return (
    <div className="miniapp-page-enter miniapp-detail-enter">
      {/* Profile header */}
      <div className="miniapp-profile-card">
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt={fullName}
            className="miniapp-profile-avatar"
            style={{ objectFit: 'cover' }}
          />
        ) : (
          <div
            className="miniapp-profile-avatar"
            style={{ background: getAvatarColor(fullName) }}
          >
            {initials}
          </div>
        )}
        <div className="miniapp-profile-name">{fullName}</div>
        {user?.role && (
          <div className="miniapp-profile-role">{formatRole(user.role)}</div>
        )}
      </div>

      {/* Info section */}
      <div className="miniapp-section" style={{ marginTop: 8 }}>
        {user?.phone && (
          <div className="miniapp-info-row">
            <span className="miniapp-info-label">{t('detail.phone')}</span>
            <span className="miniapp-info-value">
              <a href={`tel:${user.phone}`}>{user.phone}</a>
            </span>
          </div>
        )}
      </div>

      {/* Language section */}
      <div className="miniapp-section-header">
        {t('profile.language')}
      </div>
      <div className="miniapp-section">
        {!showLangs ? (
          <div
            className="miniapp-list-item"
            onClick={() => {
              webApp?.HapticFeedback.selectionChanged();
              setShowLangs(true);
            }}
          >
            <GlobalOutlined style={{ fontSize: 18, color: 'var(--ma-accent)' }} />
            <div className="miniapp-list-item-content">
              <div className="miniapp-list-item-title">
                {LANGUAGES.find(l => l.code === currentLocale)?.label || currentLocale}
              </div>
            </div>
            <div className="miniapp-list-item-right">
              {LANGUAGES.find(l => l.code === currentLocale)?.flag}
            </div>
          </div>
        ) : (
          LANGUAGES.map((lang) => (
            <div
              key={lang.code}
              className="miniapp-lang-option"
              onClick={() => {
                if (lang.code !== currentLocale) {
                  changeLanguage(lang.code);
                } else {
                  setShowLangs(false);
                }
              }}
            >
              <span style={{ fontSize: 20 }}>{lang.flag}</span>
              <span className="miniapp-lang-label">{lang.label}</span>
              {lang.code === currentLocale && (
                <CheckOutlined className="miniapp-lang-check" />
              )}
            </div>
          ))
        )}
      </div>

      {/* Close App */}
      {webApp && (
        <div className="miniapp-section" style={{ marginTop: 16 }}>
          <div
            className="miniapp-list-item"
            onClick={() => {
              webApp.HapticFeedback.impactOccurred('medium');
              webApp.close();
            }}
          >
            <LogoutOutlined style={{ fontSize: 18, color: 'var(--ma-destructive)' }} />
            <div className="miniapp-list-item-content">
              <div className="miniapp-list-item-title" style={{ color: 'var(--ma-destructive)' }}>
                {t('profile.closeApp')}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
