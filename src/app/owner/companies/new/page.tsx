'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { apiClient } from '@/lib/api';
import { getErrorMessage } from '@/lib/utils';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { Alert, Button, Input, Select, Switch, message } from 'antd';
import Link from 'next/link';

export default function NewCompanyPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [providerType, setProviderType] = useState<string>('sipuni');
  const [connectNow, setConnectNow] = useState(false);
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

    try {
      const payload: Record<string, unknown> = {
        name,
        subdomain: subdomain || null,
        provider_type: providerType,
        provider_config: {},
      };

      if (connectNow && providerType === 'sipuni') {
        const sipuniLogin = formData.get('sipuni_login') as string;
        const sipuniPassword = formData.get('sipuni_password') as string;
        if (!sipuniLogin || !sipuniPassword) {
          setError(t('enterSipuniCredentials'));
          setIsLoading(false);
          return;
        }
        payload.sipuni_login = sipuniLogin;
        payload.sipuni_password = sipuniPassword;
      }

      await apiClient.createCompany(payload as Parameters<typeof apiClient.createCompany>[0]);
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

            {providerType === 'sipuni' && (
              <div className="flex items-center gap-3 py-2">
                <Switch checked={connectNow} onChange={setConnectNow} />
                <span className="text-sm text-gray-600">{t('connectSipuniNow')}</span>
              </div>
            )}

            {connectNow && providerType === 'sipuni' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 p-4 rounded-xl bg-gray-50 border border-gray-100">
                <div className="space-y-1.5">
                  <label htmlFor="sipuni_login" className="text-sm font-medium text-gray-700">{t('sipuniLogin')}</label>
                  <Input
                    id="sipuni_login"
                    name="sipuni_login"
                    placeholder="email@example.com"
                    size="large"
                    disabled={isLoading}
                  />
                </div>
                <div className="space-y-1.5">
                  <label htmlFor="sipuni_password" className="text-sm font-medium text-gray-700">{t('sipuniPassword')}</label>
                  <Input.Password
                    id="sipuni_password"
                    name="sipuni_password"
                    placeholder="********"
                    size="large"
                    disabled={isLoading}
                  />
                </div>
              </div>
            )}

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
