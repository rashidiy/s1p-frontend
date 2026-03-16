'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { apiClient } from '@/lib/api';
import { getErrorMessage } from '@/lib/utils';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { Alert, Button, Input, Select, message } from 'antd';
import Link from 'next/link';

export default function NewCompanyPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [providerType, setProviderType] = useState<string>('sipuni');
  const t = useTranslations('companies');
  const tErrors = useTranslations('errors');
  const tActions = useTranslations('actions');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    const formData = new FormData(e.currentTarget);
    const name = formData.get('name') as string;
    const subdomain = formData.get('subdomain') as string;
    const cabinetId = formData.get('cabinet_id') as string;
    const securityKey = formData.get('security_key') as string;

    try {
      const config: Record<string, string> = {};
      if (cabinetId) config.cabinet_id = cabinetId;
      if (securityKey) config.security_key = securityKey;
      await apiClient.createCompany({
        name,
        subdomain: subdomain || null,
        provider_type: providerType,
        provider_config: config,
      });
      message.success(t('companyCreated'));
      router.push('/owner/companies');
    } catch (err: unknown) {
      setError(getErrorMessage(err, tErrors('failedToCreateCompany')));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div className="flex items-center gap-3">
          <Link href="/owner/companies">
            <Button size="middle" style={{ width: 40, height: 40, padding: 0 }} type="text">
              <ArrowLeftOutlined />
            </Button>
          </Link>
          <p className="page-subtitle">{t('registerNewCompany')}</p>
        </div>
      </div>

      <div className="glass-card max-w-2xl sm:mx-auto overflow-hidden">
        <div className="px-5 sm:px-8 pt-6 sm:pt-8 pb-2">
          <h3 className="text-lg font-semibold text-gray-900">{t('companyInformation')}</h3>
          <p className="text-sm text-gray-400 mt-0.5">{t('enterCompanyDetails')}</p>
        </div>
        <div className="px-5 sm:px-8 pb-6 sm:pb-8 pt-4">
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <Alert type="error" title={error} showIcon className="!rounded-xl" closable onClose={() => setError('')} />
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <label htmlFor="name" className="text-sm font-medium text-gray-700">{t('companyName')} <span className="text-red-400">*</span></label>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  placeholder="Acme Corp"
                  required
                  size="large"
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="subdomain" className="text-sm font-medium text-gray-700">{t('subdomain')}</label>
                <Input
                  id="subdomain"
                  name="subdomain"
                  type="text"
                  placeholder="acme"
                  size="large"
                  disabled={isLoading}
                  addonBefore={<span className="text-gray-400 text-xs">https://</span>}
                  addonAfter={<span className="text-gray-400 text-xs">.s1p.uz</span>}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="provider_type" className="text-sm font-medium text-gray-700">{t('providerType')} <span className="text-red-400">*</span></label>
              <Select
                value={providerType}
                onChange={setProviderType}
                size="large"
                style={{ width: "100%" }}
                options={[{ value: "sipuni", label: "SIPUNI" }, { value: "binotel", label: "Binotel" }]}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <label htmlFor="cabinet_id" className="text-sm font-medium text-gray-700">{t('cabinetId')}</label>
                <Input
                  id="cabinet_id"
                  name="cabinet_id"
                  placeholder="12345"
                  size="large"
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-1.5">
                <label htmlFor="security_key" className="text-sm font-medium text-gray-700">{t('securityKey')}</label>
                <Input.Password
                  id="security_key"
                  name="security_key"
                  placeholder="your-secret-key"
                  size="large"
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2 border-t border-gray-100">
              <Button type="primary" htmlType="submit" size="large" loading={isLoading}>
                {isLoading ? tActions('creating') : t('createCompany')}
              </Button>
              <Link href="/owner/companies">
                <Button size="large" disabled={isLoading}>
                  {tActions('cancel')}
                </Button>
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
