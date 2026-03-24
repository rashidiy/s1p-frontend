'use client';

import { useEffect, useState, useCallback } from 'react';
import { LogOut, Globe, Check } from 'lucide-react';
import { Switch } from 'antd';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth';
import { useTelegramWebApp } from '@/hooks/useTelegramWebApp';
import { apiClient } from '@/lib/api';
import { useTranslations, useLocale } from 'next-intl';
import { getInitials, getAvatarColor } from '../_utils';
import type { TelegramDmPrefs } from '@/types/api';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';

const LANGUAGES = [
  { code: 'ru', label: 'Русский', flag: '🇷🇺' },
  { code: 'en', label: 'English', flag: '🇬🇧' },
  { code: 'uz', label: 'O\'zbekcha', flag: '🇺🇿' },
];

export default function MiniAppProfile() {
  const { user } = useAuthStore();
  const { webApp } = useTelegramWebApp();
  const router = useRouter();
  const t = useTranslations('miniapp');
  const tRoles = useTranslations('roles');
  const currentLocale = useLocale();
  const [showLangs, setShowLangs] = useState(false);
  const [dmPrefs, setDmPrefs] = useState<TelegramDmPrefs>({
    my_calls: true,
    my_leads: true,
    assigned_to_me: true,
    quiet_hours_enabled: false,
    quiet_hours_start: 22,
    quiet_hours_end: 8,
  });
  const [prefsLoading, setPrefsLoading] = useState(false);

  const fullName = [user?.first_name, user?.last_name].filter(Boolean).join(' ') || 'User';
  const avatarUrl = user?.avatar_url
    ? (user.avatar_url.startsWith('http') ? user.avatar_url : `${API_BASE_URL}${user.avatar_url}`)
    : undefined;
  const initials = getInitials(user?.first_name, user?.last_name);

  // BackButton to go back to home
  const goBack = useCallback(() => {
    router.push('/miniapp');
  }, [router]);

  useEffect(() => {
    if (webApp) {
      webApp.BackButton.show();
      webApp.BackButton.onClick(goBack);
      return () => {
        webApp.BackButton.offClick(goBack);
        webApp.BackButton.hide();
      };
    }
  }, [webApp, goBack]);

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

  async function updatePref(key: keyof TelegramDmPrefs, value: boolean | number) {
    const updated = { ...dmPrefs, [key]: value };
    setDmPrefs(updated);
    setPrefsLoading(true);
    webApp?.HapticFeedback.selectionChanged();
    try {
      await apiClient.updateMyProfile({ telegram_dm_prefs: updated });
    } catch {
      // Revert on error
      setDmPrefs(dmPrefs);
      webApp?.HapticFeedback.notificationOccurred('error');
    } finally {
      setPrefsLoading(false);
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

      {/* Notifications section */}
      <div className="miniapp-section-header">
        {t('notifications.title')}
      </div>
      <div className="miniapp-section">
        <div className="miniapp-toggle-row">
          <span className="miniapp-toggle-label">{t('notifications.myCalls')}</span>
          <Switch
            size="small"
            checked={dmPrefs.my_calls}
            onChange={(checked) => updatePref('my_calls', checked)}
            loading={prefsLoading}
          />
        </div>
        <div className="miniapp-toggle-row">
          <span className="miniapp-toggle-label">{t('notifications.myLeads')}</span>
          <Switch
            size="small"
            checked={dmPrefs.my_leads}
            onChange={(checked) => updatePref('my_leads', checked)}
            loading={prefsLoading}
          />
        </div>
        <div className="miniapp-toggle-row">
          <span className="miniapp-toggle-label">{t('notifications.dealChanges')}</span>
          <Switch
            size="small"
            checked={dmPrefs.assigned_to_me}
            onChange={(checked) => updatePref('assigned_to_me', checked)}
            loading={prefsLoading}
          />
        </div>
        <div className="miniapp-toggle-row">
          <span className="miniapp-toggle-label">{t('notifications.quietHours')}</span>
          <Switch
            size="small"
            checked={dmPrefs.quiet_hours_enabled}
            onChange={(checked) => updatePref('quiet_hours_enabled', checked)}
            loading={prefsLoading}
          />
        </div>
        {dmPrefs.quiet_hours_enabled && (
          <div className="miniapp-toggle-row" style={{ paddingLeft: 32, gap: 8 }}>
            <span className="miniapp-toggle-label" style={{ fontSize: 13, color: 'var(--ma-hint)', flex: 'none' }}>
              {t('profile.quietHoursStart')}
            </span>
            <select
              value={dmPrefs.quiet_hours_start}
              onChange={(e) => updatePref('quiet_hours_start', Number(e.target.value))}
              disabled={prefsLoading}
              style={{
                background: 'var(--ma-bg)',
                color: 'var(--ma-text)',
                border: '1px solid var(--ma-separator)',
                borderRadius: 8,
                padding: '4px 8px',
                fontSize: 13,
                outline: 'none',
              }}
            >
              {Array.from({ length: 24 }, (_, i) => (
                <option key={i} value={i}>{String(i).padStart(2, '0')}:00</option>
              ))}
            </select>
            <span style={{ fontSize: 13, color: 'var(--ma-hint)' }}>—</span>
            <span className="miniapp-toggle-label" style={{ fontSize: 13, color: 'var(--ma-hint)', flex: 'none' }}>
              {t('profile.quietHoursEnd')}
            </span>
            <select
              value={dmPrefs.quiet_hours_end}
              onChange={(e) => updatePref('quiet_hours_end', Number(e.target.value))}
              disabled={prefsLoading}
              style={{
                background: 'var(--ma-bg)',
                color: 'var(--ma-text)',
                border: '1px solid var(--ma-separator)',
                borderRadius: 8,
                padding: '4px 8px',
                fontSize: 13,
                outline: 'none',
              }}
            >
              {Array.from({ length: 24 }, (_, i) => (
                <option key={i} value={i}>{String(i).padStart(2, '0')}:00</option>
              ))}
            </select>
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
            <Globe size={18} style={{ color: 'var(--ma-accent)' }} />
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
                <Check size={16} className="miniapp-lang-check" />
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
            <LogOut size={18} style={{ color: 'var(--ma-destructive)' }} />
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
