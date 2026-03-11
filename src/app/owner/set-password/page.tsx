'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Alert, Button, Input } from 'antd';
import { LockOutlined } from '@ant-design/icons';
import { AuthLayout } from '@/components/auth/AuthLayout';
import { apiClient } from '@/lib/api';
import { getErrorMessage } from '@/lib/utils';
import { useAuthStore } from '@/store/auth';
import { useTranslations } from 'next-intl';

const PASSWORD_REGEX = /^(?=.*[A-Z])(?=.*\d).{8,}$/;

export default function OwnerSetPasswordPage() {
  const router = useRouter();
  const setUser = useAuthStore((state) => state.setUser);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const t = useTranslations('auth');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError(t('passwordsDoNotMatch'));
      return;
    }

    if (!PASSWORD_REGEX.test(password)) {
      setError(t('passwordRequirementsError'));
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem('temporary_token');
      if (!token) {
        setError(t('noTemporaryToken'));
        router.push('/owner/login');
        return;
      }

      const response = await apiClient.ownerSetPassword({ token, new_password: password });
      localStorage.removeItem('temporary_token');
      setUser(response, 'owner');
      router.push('/owner/dashboard');
    } catch (err: any) {
      setError(getErrorMessage(err, t('failedToSetPassword')));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title={t('setNewPassword')} subtitle={t('setNewPasswordSubtitle')} icon={<LockOutlined style={{ fontSize: 28 }} />}>
      <form onSubmit={handleSubmit} className="space-y-5">
        {error && <Alert type="error" message={error} showIcon className="!rounded-xl" />}
        <div className="space-y-1.5">
          <label htmlFor="password" className="text-sm font-medium text-gray-700">{t('newPassword')}</label>
          <Input.Password
            id="password"
            placeholder={t('createStrongPassword')}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            size="large"
            className="glass-input"
          />
          <p className="text-xs text-gray-400">
            {t('passwordRequirements')}
          </p>
        </div>
        <div className="space-y-1.5">
          <label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700">{t('confirmPassword')}</label>
          <Input.Password
            id="confirmPassword"
            placeholder={t('confirmYourPassword')}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            size="large"
            className="glass-input"
          />
        </div>
        <div className="pt-1">
          <Button type="primary" htmlType="submit" className="w-full" size="large" disabled={loading}>
            {loading ? t('settingPassword') : t('setPassword')}
          </Button>
        </div>
      </form>
    </AuthLayout>
  );
}
