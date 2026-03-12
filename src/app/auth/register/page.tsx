'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button, Input, Alert } from 'antd';
import { UserAddOutlined } from '@ant-design/icons';
import { AuthLayout } from '@/components/auth/AuthLayout';
import { apiClient } from '@/lib/api';
import { getErrorMessage } from '@/lib/utils';
import { useAuthStore } from '@/store/auth';
import { useTranslations } from 'next-intl';

const TOKEN_PATTERN = /^[A-Z2-9]{4}-[A-Z2-9]{4}$/;

export default function TelegramRegisterPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const setUser = useAuthStore((state) => state.setUser);
  const t = useTranslations('auth');

  const sessionId = searchParams?.get('s') || '';

  const [inviteToken, setInviteToken] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const formatTokenInput = (value: string): string => {
    // Strip non-alphanumeric, uppercase, limit to 8 chars
    const clean = value.replace(/[^A-Za-z2-9]/g, '').toUpperCase().slice(0, 8);
    // Insert dash after 4th char
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
      });
      setUser(response, 'company_user');
      // Redirect to dashboard — the backend response includes company info
      // and tokens are saved by apiClient.telegramRegister
      router.push('/dashboard');
    } catch (err: any) {
      setError(getErrorMessage(err, t('telegramRegisterFailed')));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title={t('telegramRegisterTitle')}
      subtitle={t('telegramRegisterSubtitle')}
      icon={<UserAddOutlined style={{ fontSize: 28 }} />}
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {error && <Alert type="error" message={error} showIcon className="!rounded-xl" />}

        {!sessionId && (
          <Alert
            type="warning"
            message={t('telegramRegisterNoSession')}
            description={t('telegramRegisterNoSessionHint')}
            showIcon
            className="!rounded-xl"
          />
        )}

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
            disabled={!sessionId || loading}
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
            disabled={!sessionId || !TOKEN_PATTERN.test(inviteToken) || loading}
            loading={loading}
          >
            {loading ? t('telegramRegistering') : t('telegramRegisterSubmit')}
          </Button>
        </div>
      </form>
    </AuthLayout>
  );
}
