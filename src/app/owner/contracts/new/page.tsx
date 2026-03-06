'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { Alert } from 'antd';
import { apiClient } from '@/lib/api';
import { getErrorMessage } from '@/lib/utils';
import { BILLING_PERIOD_OPTIONS } from '@/lib/constants';
import type { CompanyResponse } from '@/types/api';

export default function NewContractPage() {
  const router = useRouter();
  const [companies, setCompanies] = useState<CompanyResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

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
    } catch (err: any) {
      setError(getErrorMessage(err, 'Failed to create contract'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => router.back()}>
          <ArrowLeftOutlined style={{ marginRight: 4 }} />
          Back
        </Button>
        <h1 className="text-3xl font-bold gradient-text">New Contract</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Contract Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <Alert type="error" message={error} showIcon className="!rounded-xl" />
            )}

            <div className="space-y-2">
              <Label>Company *</Label>
              <Select value={form.company_id} onValueChange={(v) => setForm({ ...form, company_id: v })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select company" />
                </SelectTrigger>
                <SelectContent>
                  {companies.map((c) => (
                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Name *</Label>
              <Input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="e.g. Pro Plan"
                required
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Billing Period *</Label>
                <Select value={form.billing_period} onValueChange={(v) => setForm({ ...form, billing_period: v as 'monthly' | 'yearly' })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {BILLING_PERIOD_OPTIONS.map((o) => (
                      <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Price *</Label>
                <Input
                  type="number"
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                  placeholder="99.99"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Currency</Label>
                <Input
                  value={form.currency}
                  onChange={(e) => setForm({ ...form, currency: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Max Admins</Label>
                <Input
                  type="number"
                  value={form.max_admins}
                  onChange={(e) => setForm({ ...form, max_admins: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Max Managers</Label>
                <Input
                  type="number"
                  value={form.max_managers}
                  onChange={(e) => setForm({ ...form, max_managers: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Max Operators</Label>
                <Input
                  type="number"
                  value={form.max_operators}
                  onChange={(e) => setForm({ ...form, max_operators: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Max Storage (GB)</Label>
                <Input
                  type="number"
                  value={form.max_storage_gb}
                  onChange={(e) => setForm({ ...form, max_storage_gb: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Start Date *</Label>
                <Input
                  type="date"
                  value={form.start_date}
                  onChange={(e) => setForm({ ...form, start_date: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>End Date *</Label>
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
              <Button variant="outline" htmlType="button" onClick={() => router.back()}>
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
