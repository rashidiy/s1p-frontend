'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { Alert, Button, Input, Select } from 'antd';
import { apiClient } from '@/lib/api';
import { getErrorMessage } from '@/lib/utils';
import { BILLING_PERIOD_OPTIONS } from '@/lib/constants';
import type { CompanyResponse, BillingPeriodEnum } from '@/types/api';

export default function NewContractPage() {
  const router = useRouter();
  const [companies, setCompanies] = useState<CompanyResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    company_id: '',
    name: '',
    billing_period: 'monthly' as BillingPeriodEnum,
    price: '',
    currency: 'USD',
    max_users: '10',
    max_calls_per_month: '1000',
    start_date: '',
    end_date: '',
  });

  useEffect(() => {
    loadCompanies();
  }, []);

  const loadCompanies = async () => {
    try {
      const data = await apiClient.getOwnerCompanies();
      setCompanies(data);
    } catch (err) {
      console.error('Failed to load companies:', err);
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
        max_users: parseInt(form.max_users),
        max_calls_per_month: parseInt(form.max_calls_per_month),
        start_date: form.start_date,
        end_date: form.end_date,
      });
      router.push(`/owner/contracts/${contract.id}`);
    } catch (err: any) {
      setError(getErrorMessage(err, 'Failed to create contract'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center gap-4">
        <Button size="small" type="text"   onClick={() => router.back()}>
          <ArrowLeftOutlined style={{ marginRight: 4 }} />
          Back
        </Button>
        <h1 className="text-3xl font-bold gradient-text">New Contract</h1>
      </div>

      <div className="glass-card p-0">
        <div className="flex flex-col space-y-1.5 p-6">
          <h3 className="text-2xl font-semibold leading-none tracking-tight">Contract Details</h3>
        </div>
        <div className="p-6 pt-0">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <Alert type="error" message={error} showIcon className="!rounded-xl" />
            )}

            <div className="space-y-2">
              <label className="text-sm font-medium">Company *</label>
              <Select
                value={form.company_id}
                onChange={(v) => setForm({ ...form, company_id: v })}
                placeholder="Select company"
                style={{ width: "100%" }}
                options={companies.map((c) => ({
                  value: c.id,
                  label: c.name,
                }))}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Name *</label>
              <Input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="e.g. Pro Plan"
                required
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Billing Period *</label>
                <Select
                  value={form.billing_period}
                  onChange={(v) => setForm({ ...form, billing_period: v as BillingPeriodEnum })}
                  style={{ width: "100%" }}
                  options={BILLING_PERIOD_OPTIONS.map((o) => ({
                    value: o.value,
                    label: o.label,
                  }))}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Price *</label>
                <Input
                  type="number"
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                  placeholder="99.99"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Currency</label>
                <Input
                  value={form.currency}
                  onChange={(e) => setForm({ ...form, currency: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Max Users</label>
                <Input
                  type="number"
                  value={form.max_users}
                  onChange={(e) => setForm({ ...form, max_users: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Max Calls/Month</label>
                <Input
                  type="number"
                  value={form.max_calls_per_month}
                  onChange={(e) => setForm({ ...form, max_calls_per_month: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Start Date *</label>
                <Input
                  type="date"
                  value={form.start_date}
                  onChange={(e) => setForm({ ...form, start_date: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">End Date *</label>
                <Input
                  type="date"
                  value={form.end_date}
                  onChange={(e) => setForm({ ...form, end_date: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="flex gap-2 pt-4">
              <Button htmlType="submit" disabled={loading}>
                {loading ? 'Creating...' : 'Create Contract'}
              </Button>
              <Button type="default"  htmlType="button" onClick={() => router.back()}>
                Cancel
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
