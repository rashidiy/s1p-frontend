'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api';
import { getErrorMessage } from '@/lib/utils';
import type { ContactResponse, UserResponse } from '@/types/api';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { Alert, Button, Input, Select, message } from 'antd';
import Link from 'next/link';
import { useTranslations } from 'next-intl';

export default function NewLeadPage() {
  const t = useTranslations('leads');
  const tContacts = useTranslations('contacts');
  const tFields = useTranslations('fields');
  const tActions = useTranslations('actions');
  const tErrors = useTranslations('errors');

  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [contacts, setContacts] = useState<ContactResponse[]>([]);
  const [users, setUsers] = useState<UserResponse[]>([]);
  const [contactId, setContactId] = useState<string | null>(null);
  const [assignedTo, setAssignedTo] = useState<string | null>(null);
  const [currency, setCurrency] = useState('USD');

  useEffect(() => {
    loadUsers();
  // eslint-disable-next-line react-hooks/exhaustive-deps -- load on mount only
  }, []);

  const loadUsers = async () => {
    try {
      const result = await apiClient.getUsers({});
      setUsers(result.users || []);
    } catch {
      message.error(tErrors('failedToLoadUsers'));
    }
  };

  const searchContacts = async (query: string) => {
    if (!query) return;
    try {
      const result = await apiClient.getContacts({ search: query, page: 1, page_size: 10 });
      setContacts(result.items || []);
    } catch {
      message.error(tErrors('failedToSearchContacts'));
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    const formData = new FormData(e.currentTarget);
    const title = formData.get('title') as string;
    const source = formData.get('source') as string;
    const description = formData.get('description') as string;
    const estimated_value = formData.get('estimated_value') as string;

    try {
      const result = await apiClient.createLead({
        title,
        contact_id: contactId || null,
        source: source || null,
        description: description || null,
        estimated_value: estimated_value ? parseFloat(estimated_value) : null,
        currency,
        assigned_to: assignedTo || null,
      });
      router.push(`/leads/${result.id}`);
    } catch (err: unknown) {
      setError(getErrorMessage(err, tErrors('failedToCreateLead')));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div className="flex items-center gap-4">
          <Link href="/leads">
            <Button size="small" type="text">
              <ArrowLeftOutlined style={{ marginRight: 4 }} />
              {tActions('back')}
            </Button>
          </Link>
          <p className="page-subtitle">{t('newLeadSubtitle')}</p>
        </div>
      </div>

      <div className="glass-card p-0 max-w-3xl mx-auto">
        <div className="flex flex-col space-y-1.5 p-6">
          <h3 className="text-lg font-semibold leading-none tracking-tight">{t('leadInformation')}</h3>
          <p className="text-sm text-gray-400">{t('enterLeadDetails')}</p>
        </div>
        <div className="p-6 pt-0">
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <Alert type="error" message={error} showIcon className="!rounded-xl" closable onClose={() => setError('')} />
            )}

            <div className="space-y-1.5">
              <label htmlFor="title" className="text-sm font-medium text-gray-700">{tFields('title')} *</label>
              <Input id="title" name="title" type="text" placeholder="Software Implementation" required disabled={isLoading} size="large" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700">{tFields('contact')}</label>
                <Select showSearch allowClear style={{ width: '100%' }} placeholder={tContacts('searchContacts')} filterOption={false} onSearch={searchContacts} value={contactId || undefined} onChange={(val) => setContactId(val || null)} options={contacts.map(c => ({ value: c.id, label: `${c.first_name}${c.last_name ? ' ' + c.last_name : ''}` }))} disabled={isLoading} size="large" />
              </div>
              <div className="space-y-1.5">
                <label htmlFor="source" className="text-sm font-medium text-gray-700">{tFields('source')}</label>
                <Input id="source" name="source" type="text" placeholder="Referral" disabled={isLoading} size="large" />
              </div>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="description" className="text-sm font-medium text-gray-700">{tFields('description')}</label>
              <Input.TextArea id="description" name="description" placeholder="Customer needs..." disabled={isLoading} rows={3} />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label htmlFor="estimated_value" className="text-sm font-medium text-gray-700">{tFields('estimatedValue')}</label>
                <Input id="estimated_value" name="estimated_value" type="number" min="0" step="0.01" placeholder="50000" disabled={isLoading} size="large" />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700">{tFields('currency')}</label>
                <Select value={currency} onChange={setCurrency} style={{ width: "100%" }} options={[{ value: "USD", label: "USD" }, { value: "EUR", label: "EUR" }, { value: "UZS", label: "UZS" }]} size="large" />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700">{tFields('assignedTo')}</label>
                <Select allowClear style={{ width: '100%' }} placeholder={tFields('assignedTo')} value={assignedTo || undefined} onChange={(val) => setAssignedTo(val || null)} options={users.map(u => ({ value: u.id, label: `${u.first_name}${u.last_name ? ' ' + u.last_name : ''}` }))} disabled={isLoading} size="large" />
              </div>
            </div>

            <div className="flex space-x-3 pt-4 border-t border-gray-100">
              <Button type="primary" htmlType="submit" loading={isLoading} size="large">
                {t('createLead')}
              </Button>
              <Link href="/leads">
                <Button type="default" htmlType="button" disabled={isLoading} size="large">{tActions('cancel')}</Button>
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
