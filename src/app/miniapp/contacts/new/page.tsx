'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { apiClient } from '@/lib/api';
import { useTelegramWebApp } from '@/hooks/useTelegramWebApp';
import { useTranslations } from 'next-intl';
import { formatPhone } from '../../_utils';

const labelStyle: React.CSSProperties = {
  fontSize: 13,
  color: 'var(--ma-hint)',
  marginBottom: 4,
  display: 'block',
};

const labelTopStyle: React.CSSProperties = {
  ...labelStyle,
  marginTop: 12,
};

const sectionTitleStyle: React.CSSProperties = {
  fontSize: 14,
  fontWeight: 600,
  color: 'var(--ma-text)',
  marginTop: 20,
  marginBottom: 8,
  paddingBottom: 6,
  borderBottom: '0.5px solid var(--ma-separator)',
};

export default function NewContactPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const phoneParam = searchParams.get('phone') || '';
  const { webApp } = useTelegramWebApp();
  const t = useTranslations('miniapp');

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState(phoneParam);
  const [email, setEmail] = useState('');
  const [position, setPosition] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [saving, setSaving] = useState(false);

  const canSave = firstName.trim() && phone.trim() && !saving;

  const goBack = useCallback(() => {
    router.push('/miniapp/contacts');
  }, [router]);

  // Telegram BackButton
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

  // Save handler ref for stable MainButton callback
  const handleSaveRef = useRef<() => void>();
  handleSaveRef.current = async () => {
    if (!firstName.trim() || !phone.trim() || saving) return;

    setSaving(true);
    try {
      const created = await apiClient.createContact({
        first_name: firstName.trim(),
        last_name: lastName.trim() || undefined,
        phone: phone.trim(),
        email: email.trim() || undefined,
        position: position.trim() || undefined,
        company_name: companyName.trim() || undefined,
      });
      webApp?.HapticFeedback.notificationOccurred('success');
      try {
        webApp?.showPopup({ message: 'Contact created' /* TODO: i18n */ });
      } catch { /* showPopup may not be available */ }
      router.replace(`/miniapp/contacts/${created.id}`);
    } catch {
      webApp?.HapticFeedback.notificationOccurred('error');
      try {
        webApp?.showPopup({ message: t('error.loadFailed') });
      } catch { /* showPopup may not be available */ }
    } finally {
      setSaving(false);
    }
  };

  // Telegram MainButton for Save
  useEffect(() => {
    if (!webApp) return;

    const onSave = () => handleSaveRef.current?.();

    webApp.MainButton.setText(t('contacts.saveContact'));
    webApp.MainButton.show();
    webApp.MainButton.onClick(onSave);

    return () => {
      webApp.MainButton.offClick(onSave);
      webApp.MainButton.hide();
    };
  }, [webApp, t]);

  // Update MainButton enabled/disabled state and loading
  useEffect(() => {
    if (!webApp) return;
    if (saving) {
      webApp.MainButton.showProgress(false);
    } else {
      webApp.MainButton.hideProgress();
    }
    // Visually indicate if form is valid
    if (canSave) {
      webApp.MainButton.enable();
    } else {
      webApp.MainButton.disable();
    }
  }, [webApp, canSave, saving]);

  return (
    <div className="miniapp-detail-enter">
      <div className="miniapp-page-title">{t('contacts.newContact')}</div>

      <div className="miniapp-section" style={{ padding: '16px' }}>
        {/* Personal Info */}
        <div style={sectionTitleStyle}>
          {'Personal Info' /* TODO: i18n */}
        </div>

        <label style={labelStyle}>
          {t('contacts.firstName')} *
        </label>
        <input
          className="miniapp-create-contact-input"
          placeholder={t('contacts.firstName')}
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          autoFocus
        />

        <label style={labelTopStyle}>
          {t('contacts.lastName')}
        </label>
        <input
          className="miniapp-create-contact-input"
          placeholder={t('contacts.lastName')}
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
        />

        {/* Contact Info */}
        <div style={sectionTitleStyle}>
          {'Contact Info' /* TODO: i18n */}
        </div>

        <label style={labelStyle}>
          {t('contacts.phone')} *
        </label>
        {phoneParam ? (
          <div style={{ fontSize: 16, padding: '10px 12px', background: 'var(--ma-bg2)', borderRadius: 'var(--ma-radius-sm)' }}>
            {formatPhone(phoneParam)}
          </div>
        ) : (
          <input
            className="miniapp-create-contact-input"
            placeholder={t('contacts.phone')}
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            type="tel"
          />
        )}

        <label style={labelTopStyle}>
          {t('contacts.email')}
        </label>
        <input
          className="miniapp-create-contact-input"
          placeholder={t('contacts.email')}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          type="email"
        />

        {/* Work Info */}
        <div style={sectionTitleStyle}>
          {'Work Info' /* TODO: i18n */}
        </div>

        <label style={labelStyle}>
          {'Position' /* TODO: i18n */}
        </label>
        <input
          className="miniapp-create-contact-input"
          placeholder={'Position' /* TODO: i18n */}
          value={position}
          onChange={(e) => setPosition(e.target.value)}
        />

        <label style={labelTopStyle}>
          {'Company' /* TODO: i18n */}
        </label>
        <input
          className="miniapp-create-contact-input"
          placeholder={'Company' /* TODO: i18n */}
          value={companyName}
          onChange={(e) => setCompanyName(e.target.value)}
        />
      </div>
    </div>
  );
}
