'use client';

import Link from 'next/link';
import { AuthLayout } from '@/components/auth/AuthLayout';
import { Alert, Button } from 'antd';
import { ToolOutlined } from '@ant-design/icons';
import { useTranslations } from 'next-intl';

export default function OwnerRegisterPage() {
  const t = useTranslations('auth');

  return (
    <AuthLayout
      title={t('ownerRegistration')}
      subtitle={t('ownerRegistrationSubtitle')}
      icon={<ToolOutlined style={{ fontSize: 28 }} />}
    >
      <div className="space-y-5">
        <Alert
          type="warning"
          showIcon
          icon={<ToolOutlined />}
          className="!rounded-xl"
          message={t('cliOnlyRegistration')}
          description={t('cliOnlyRegistrationDescription')}
        />

        <div className="text-sm text-gray-500 space-y-3">
          <p className="font-medium text-gray-700">{t('toCreateOwnerAccount')}</p>
          <pre className="bg-gray-900 rounded-xl p-4 text-xs font-mono text-green-400 overflow-x-auto border border-gray-800">
            <span className="text-gray-500 select-none">$ </span>make createsuperuser
          </pre>
          <p>{t('orInsideDocker')}</p>
          <pre className="bg-gray-900 rounded-xl p-4 text-xs font-mono text-green-400 overflow-x-auto border border-gray-800">
            <span className="text-gray-500 select-none">$ </span>python manage.py createsuperuser
          </pre>
        </div>

        <Link href="/owner/login">
          <Button type="primary" className="w-full" size="large">{t('goToOwnerLogin')}</Button>
        </Link>
      </div>
    </AuthLayout>
  );
}
