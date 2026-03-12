'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button, Input, Alert, Spin, Avatar } from 'antd';
import { UserAddOutlined, UserOutlined } from '@ant-design/icons';
import { AuthLayout } from '@/components/auth/AuthLayout';
import { apiClient } from '@/lib/api';
import { getErrorMessage } from '@/lib/utils';
import { useAuthStore } from '@/store/auth';
import { useTranslations } from 'next-intl';
import type { RegisterPrefillResponse } from '@/types/api';

const TOKEN_PATTERN = /^[A-Z2-9]{4}-[A-Z2-9]{4}$/;

export default function TelegramRegisterPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const setUser = useAuthStore((state) => state.setUser);
  const t = useTranslations('auth');

  const sessionId = searchParams?.get('s') || '';

  const [prefill, setPrefill] = useState<RegisterPrefillResponse | null>(null);
  const [prefillLoading, setPrefillLoading] = useState(true);
  const [prefillError, setPrefillError] = useState('');

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [inviteToken, setInviteToken] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Load prefill data
  useEffect(() => {
    if (!sessionId) {
      setPrefillLoading(false);
      return;
    }

    apiClient.getRegisterPrefill(sessionId)
      .then((data) => {
        setPrefill(data);
        // Pre-fill form fields
        if (data.telegram_first_name) setFirstName(data.telegram_first_name);
        if (data.telegram_last_name) setLastName(data.telegram_last_name);
        if (data.invite_phone) setPhone(data.invite_phone);
      })
      .catch((err) => {
        setPrefillError(getErrorMessage(err, t('telegramRegisterNoSession')));
      })
      .finally(() => setPrefillLoading(false));
  }, [sessionId]);

  const formatTokenInput = (value: string): string => {
    const clean = value.replace(/[^A-Za-z2-9]/g, '').toUpperCase().slice(0, 8);
    if (clean.length > 4) {
      return clean.slice(0, 4) + '-' + clean.slice(4);
    }
    return clean;
  };

  const handleTokenChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInviteToken(formatTokenInput(e.target.value));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!sessionId) {
      setError(t('telegramRegisterNoSession'));
      return;
    }

    if (!TOKEN_PATTERN.test(inviteToken)) {
      setError(t('telegramRegisterInvalidToken'));
      return;
    }

    setLoading(true);

    try {
      const response = await apiClient.telegramRegister({
        session_id: sessionId,
        invite_token: inviteToken,
        first_name: firstName || undefined,
        last_name: lastName || undefined,
        phone: phone || undefined,
      });
      setUser(response, 'company_user');
      router.push('/dashboard');
    } catch (err: any) {
      setError(getErrorMessage(err, t('telegramRegisterFailed')));
    } finally {
      setLoading(false);
    }
  };

  // Build avatar URL
  const avatarUrl = sessionId && prefill?.telegram_avatar_file_id
    ? `${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000'}/api/v1/auth/telegram/avatar/${sessionId}`
    : null;

  return (
    <AuthLayout
      title={t('telegramRegisterTitle')}
      subtitle={t('telegramRegisterSubtitle')}
      icon={<UserAddOutlined style={{ fontSize: 28 }} />}
    >
      <div className="space-y-5">
        {error && <Alert type="error" message={error} showIcon className="!rounded-xl" closable onClose={() => setError('')} />}

        {!sessionId && (
          <Alert
            type="warning"
            message={t('telegramRegisterNoSession')}
            description={t('telegramRegisterNoSessionHint')}
            showIcon
            className="!rounded-xl"
          />
        )}

        {prefillLoading && sessionId && (
          <div className="text-center py-8">
            <Spin size="large" />
            <p className="text-sm text-gray-500 mt-3">{t('loading') || 'Loading...'}</p>
          </div>
        )}

        {prefillError && (
          <Alert type="error" message={prefillError} showIcon className="!rounded-xl" />
        )}

        {!prefillLoading && sessionId && !prefillError && (
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Avatar */}
            {avatarUrl && (
              <div className="text-center">
                <Avatar
                  size={80}
                  src={avatarUrl}
                  icon={<UserOutlined />}
                  className="border-2 border-gray-100"
                />
                {prefill?.telegram_username && (
                  <p className="text-sm text-gray-500 mt-2">@{prefill.telegram_username}</p>
                )}
              </div>
            )}

            {/* Name fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label htmlFor="first_name" className="text-sm font-medium text-gray-700">
                  {t('firstName') || 'First Name'}
                </label>
                <Input
                  id="first_name"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  size="large"
                  className="glass-input"
                />
              </div>
              <div className="space-y-1.5">
                <label htmlFor="last_name" className="text-sm font-medium text-gray-700">
                  {t('lastName') || 'Last Name'}
                </label>
                <Input
                  id="last_name"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  size="large"
                  className="glass-input"
                />
              </div>
            </div>

            {/* Phone */}
            <div className="space-y-1.5">
              <label htmlFor="phone" className="text-sm font-medium text-gray-700">
                {t('phone') || 'Phone'}
              </label>
              <Input
                id="phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+998901234567"
                size="large"
                className="glass-input"
              />
            </div>

            {/* Invite Token */}
            <div className="space-y-1.5">
              <label htmlFor="invite-token" className="text-sm font-medium text-gray-700">
                {t('telegramInviteTokenLabel')}
              </label>
              <Input
                id="invite-token"
                value={inviteToken}
                onChange={handleTokenChange}
                placeholder="XXXX-XXXX"
                size="large"
                className="glass-input text-center text-xl tracking-[0.3em] font-mono uppercase"
                maxLength={9}
                disabled={loading}
                autoFocus
              />
              <p className="text-xs text-gray-400 text-center">{t('telegramInviteTokenHint')}</p>
            </div>

            <div className="pt-1">
              <Button
                type="primary"
                htmlType="submit"
                className="w-full"
                size="large"
                disabled={!TOKEN_PATTERN.test(inviteToken) || loading}
                loading={loading}
              >
                {loading ? t('telegramRegistering') : t('telegramRegisterSubmit')}
              </Button>
            </div>
          </form>
        )}
      </div>
    </AuthLayout>
  );
}
