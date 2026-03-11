'use client';

import Link from 'next/link';
import { AuthLayout } from '@/components/auth/AuthLayout';
import { Button, Alert } from 'antd';
import { MailOutlined } from '@ant-design/icons';
import { useTranslations } from 'next-intl';

export default function RegisterPage() {
  const t = useTranslations('auth');

  return (
    <AuthLayout
      title={t('accountRegistration')}
      subtitle={t('howToGetAccess')}
      icon={<MailOutlined style={{ fontSize: 28 }} />}
    >
      <div className="space-y-5">
        <Alert
          type="info"
          showIcon
          icon={<MailOutlined />}
          className="!rounded-xl"
          title={t('invitationRequired')}
          description={t('invitationDescription')}
        />

        <div className="text-sm text-gray-500 space-y-3">
          <p className="font-medium text-gray-700">{t('whatToDoNext')}</p>
          <div className="space-y-2">
            {[
              t('step1'),
              t('step2'),
              t('step3'),
              t('step4'),
            ].map((step, i) => (
              <div key={i} className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-crm-indigo-50 text-crm-indigo-600 text-xs font-semibold flex items-center justify-center mt-0.5">
                  {i + 1}
                </span>
                <span className="text-gray-600 leading-relaxed">{step}</span>
              </div>
            ))}
          </div>
        </div>

        <Link href="/login">
          <Button type="primary" className="w-full" size="large">{t('goToLogin')}</Button>
        </Link>
      </div>
    </AuthLayout>
  );
}
