'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button, Input, Alert } from 'antd';
import { KeyOutlined } from '@ant-design/icons';
import { AuthLayout } from '@/components/auth/AuthLayout';
import { apiClient } from '@/lib/api';
import { useTranslations } from 'next-intl';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const t = useTranslations('auth');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await apiClient.forgotPassword({ email });
    } catch {
      // Always show success to prevent email enumeration
    } finally {
      setLoading(false);
      setSubmitted(true);
    }
  };

  return (
    <AuthLayout
      title={t('forgotPasswordTitle')}
      subtitle={submitted ? t('checkEmailForInstructions') : t('enterEmailForReset')}
      icon={<KeyOutlined style={{ fontSize: 28 }} />}
    >
      {submitted ? (
        <div className="space-y-4">
          <Alert
            type="success"
            message={t('resetEmailSent')}
            showIcon
            className="!rounded-xl"
          />
          <div className="text-center">
            <Link href="/login" className="text-sm text-crm-indigo-500 hover:underline font-medium">
              {t('backToLogin')}
            </Link>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-1.5">
            <label htmlFor="email" className="text-sm font-medium text-gray-700">{t('email')}</label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              size="large"
              className="glass-input"
            />
          </div>
          <div className="pt-1">
            <Button type="primary" htmlType="submit" className="w-full" size="large" disabled={loading}>
              {loading ? t('sending') : t('sendResetInstructions')}
            </Button>
          </div>
          <div className="text-center">
            <Link href="/login" className="text-sm text-crm-indigo-500 hover:underline font-medium">
              {t('backToLogin')}
            </Link>
          </div>
        </form>
      )}
    </AuthLayout>
  );
}
