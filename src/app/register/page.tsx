'use client';

import { AuthLayout } from '@/components/auth/AuthLayout';
import { Button, Alert } from 'antd';
import { SendOutlined } from '@ant-design/icons';
import { useTranslations } from 'next-intl';
import Link from 'next/link';

export default function RegisterPage() {
  const t = useTranslations('auth');

  return (
    <AuthLayout
      title={t('accountRegistration')}
      subtitle={t('howToGetAccess')}
      icon={<SendOutlined style={{ fontSize: 28 }} />}
    >
      <div className="space-y-5">
        <Alert
          type="info"
          showIcon
          className="!rounded-xl"
          message={t('telegramRegistrationRequired') || 'Registration via Telegram'}
          description={t('telegramRegistrationDescription') || 'To register, ask your company admin for a Telegram invite link. Open the link in Telegram to start registration.'}
        />

        <Link href="/login">
          <Button type="primary" className="w-full" size="large">{t('goToLogin')}</Button>
        </Link>
      </div>
    </AuthLayout>
  );
}
