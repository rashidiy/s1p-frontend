'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { Alert, Button, DatePicker, Input, Select, message } from 'antd';
import { useTranslations } from 'next-intl';
import dayjs from 'dayjs';
import { apiClient } from '@/lib/api';
import { getErrorMessage } from '@/lib/utils';
import { BILLING_PERIOD_OPTIONS } from '@/lib/constants';
import type { CompanyResponse } from '@/types/api';

export default function NewContractPage() {
  const router = useRouter();
  const [companies, setCompanies] = useState<CompanyResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const t = useTranslations('ownerContracts');
  const tErrors = useTranslations('errors');
  const tActions = useTranslations('actions');
  const tFields = useTranslations('fields');

  const [form, setForm] = useState({
    company_id: '',
    name: '',
    billing_period: 'monthly' as 'monthly' | 'yearly',
    price: '',
    currency: 'USD',
    max_admins: '1',
    max_managers: '5',
    max_operators: '10',
    max_storage_gb: '10',
    start_date: '',
    end_date: '',
  });

  useEffect(() => {
    loadCompanies();
  // eslint-disable-next-line react-hooks/exhaustive-deps -- load on mount only
  }, []);

  const loadCompanies = async () => {
    try {
      const data = await apiClient.getOwnerCompanies();
      setCompanies(data);
    } catch (err) {
      console.error('Failed to load companies:', err);
      message.error(tErrors('failedToLoadCompanies'));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const contract = await apiClient.createContract({
        company_id: form.company_id,
        name: form.name,
        billing_period: form.billing_period,
        price: parseFloat(form.price),
        currency: form.currency,
        max_admins: parseInt(form.max_admins),
        max_managers: parseInt(form.max_managers),
        max_operators: parseInt(form.max_operators),
        max_storage_gb: parseInt(form.max_storage_gb),
        start_date: form.start_date,
        end_date: form.end_date,
        grace_period_days: 30,
        auto_renew: false,
      });
      router.push(`/owner/contracts/${contract.id}`);
    } catch (err: unknown) {
      setError(getErrorMessage(err, tErrors('failedToCreateContract')));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl sm:mx-auto">
      <div className="page-header">
        <div className="flex items-center gap-3">
          <Button size="small" type="text" onClick={() => router.push('/owner/contracts')}>
            <ArrowLeftOutlined style={{ marginRight: 4 }} />
            {tActions('back')}
          </Button>
          <p className="page-subtitle">{t('configureContract')}</p>
        </div>
      </div>

      <div className="glass-card overflow-hidden">
        <div className="px-5 sm:px-8 pt-6 sm:pt-7 pb-2">
          <h3 className="text-lg font-semibold text-gray-900">{t('contractDetails')}</h3>
          <p className="text-sm text-gray-400 mt-0.5">{t('contractInfo')}</p>
        </div>
        <div className="px-5 sm:px-8 pb-6 sm:pb-8 pt-4">
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <Alert type="error" title={error} showIcon className="!rounded-xl" closable onClose={() => setError('')} />
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700">{tFields('company')} <span className="text-red-400">*</span></label>
                <Select
                  value={form.company_id || undefined}
                  onChange={(v) => setForm({ ...form, company_id: v })}
                  placeholder={t('selectCompany')}
                  size="large"
                  style={{ width: "100%" }}
                  options={companies.map((c) => ({ value: c.id, label: c.name }))}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700">{t('contractName')} <span className="text-red-400">*</span></label>
                <Input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. Pro Plan"
                  required
                  size="large"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700">{tFields('billingPeriod')} <span className="text-red-400">*</span></label>
                <Select
                  value={form.billing_period}
                  onChange={(v) => setForm({ ...form, billing_period: v as 'monthly' | 'yearly' })}
                  size="large"
                  style={{ width: "100%" }}
                  options={BILLING_PERIOD_OPTIONS.map((o) => ({ value: o.value, label: o.label }))}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700">{t('price')} <span className="text-red-400">*</span></label>
                <Input
                  type="number"
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                  placeholder="99.99"
                  required
                  size="large"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700">{tFields('currency')}</label>
                <Input
                  value={form.currency}
                  onChange={(e) => setForm({ ...form, currency: e.target.value })}
                  size="large"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700">{t('maxAdmins')}</label>
                <Input type="number" value={form.max_admins} onChange={(e) => setForm({ ...form, max_admins: e.target.value })} size="large" />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700">{t('maxManagers')}</label>
                <Input type="number" value={form.max_managers} onChange={(e) => setForm({ ...form, max_managers: e.target.value })} size="large" />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700">{t('maxOperators')}</label>
                <Input type="number" value={form.max_operators} onChange={(e) => setForm({ ...form, max_operators: e.target.value })} size="large" />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700">{t('storageGb')}</label>
                <Input type="number" value={form.max_storage_gb} onChange={(e) => setForm({ ...form, max_storage_gb: e.target.value })} size="large" />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700">{tFields('startDate')} <span className="text-red-400">*</span></label>
                <DatePicker
                  className="w-full"
                  size="large"
                  format="YYYY-MM-DD"
                  value={form.start_date ? dayjs(form.start_date) : null}
                  onChange={(date) => setForm({ ...form, start_date: date ? date.format('YYYY-MM-DD') : '' })}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700">{tFields('endDate')} <span className="text-red-400">*</span></label>
                <DatePicker
                  className="w-full"
                  size="large"
                  format="YYYY-MM-DD"
                  value={form.end_date ? dayjs(form.end_date) : null}
                  onChange={(date) => setForm({ ...form, end_date: date ? date.format('YYYY-MM-DD') : '' })}
                />
              </div>
            </div>

            <div className="flex gap-3 pt-3 border-t border-gray-100">
              <Button type="primary" htmlType="submit" size="large" loading={loading}>
                {loading ? tActions('creating') : t('createContract')}
              </Button>
              <Button size="large" htmlType="button" onClick={() => router.push('/owner/contracts')}>
                {tActions('cancel')}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
