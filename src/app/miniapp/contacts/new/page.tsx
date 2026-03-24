'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { apiClient } from '@/lib/api';
import { useTelegramWebApp } from '@/hooks/useTelegramWebApp';
import { useTranslations } from 'next-intl';
import { formatPhone } from '../../_utils';

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
  const [saving, setSaving] = useState(false);

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

  const handleSave = useCallback(async () => {
    if (!firstName.trim() || !phone.trim() || saving) return;

    setSaving(true);
    try {
      const created = await apiClient.createContact({
        first_name: firstName.trim(),
        last_name: lastName.trim() || undefined,
        phone: phone.trim(),
        email: email.trim() || undefined,
      });
      webApp?.HapticFeedback.notificationOccurred('success');
      try {
        webApp?.showPopup({
          title: '\u2713',
          message: t('contacts.contactCreated'),
          buttons: [{ type: 'ok' }],
        });
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
  }, [firstName, lastName, phone, email, saving, webApp, t, router]);

  // Telegram MainButton
  useEffect(() => {
    if (!webApp) return;
    webApp.MainButton.setText(t('contacts.saveContact'));
    webApp.MainButton.show();
    webApp.MainButton.onClick(handleSave);
    if (saving) {
      webApp.MainButton.showProgress(true);
    } else {
      webApp.MainButton.hideProgress();
    }
    return () => {
      webApp.MainButton.offClick(handleSave);
      webApp.MainButton.hide();
    };
  }, [webApp, handleSave, saving, t]);

  return (
    <div className="miniapp-detail-enter">
      {/* Header */}
      <div className="miniapp-page-title">{t('contacts.newContact')}</div>

      {/* Form */}
      <div className="miniapp-section" style={{ padding: '16px' }}>
        <label style={{ fontSize: 13, color: 'var(--ma-hint)', marginBottom: 4, display: 'block' }}>
          {t('contacts.firstName')} *
        </label>
        <input
          className="miniapp-create-contact-input"
          placeholder={t('contacts.firstName')}
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          autoFocus
        />

        <label style={{ fontSize: 13, color: 'var(--ma-hint)', marginBottom: 4, marginTop: 12, display: 'block' }}>
          {t('contacts.lastName')}
        </label>
        <input
          className="miniapp-create-contact-input"
          placeholder={t('contacts.lastName')}
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
        />

        <label style={{ fontSize: 13, color: 'var(--ma-hint)', marginBottom: 4, marginTop: 12, display: 'block' }}>
          {t('contacts.phone')} *
        </label>
        {phoneParam ? (
          <div className="miniapp-create-contact-phone" style={{ fontSize: 16, marginBottom: 0, padding: '10px 12px', background: 'var(--ma-bg2)', borderRadius: 'var(--ma-radius-sm)' }}>
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

        <label style={{ fontSize: 13, color: 'var(--ma-hint)', marginBottom: 4, marginTop: 12, display: 'block' }}>
          {t('contacts.email')}
        </label>
        <input
          className="miniapp-create-contact-input"
          placeholder={t('contacts.email')}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          type="email"
        />
      </div>
    </div>
  );
}
