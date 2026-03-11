'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api';
import type { ContactResponse, LeadResponse, UserResponse } from '@/types/api';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { Alert, Button, DatePicker, Input, Select, message } from 'antd';
import dayjs from 'dayjs';
import Link from 'next/link';

export default function NewDealPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [contacts, setContacts] = useState<ContactResponse[]>([]);
  const [leads, setLeads] = useState<LeadResponse[]>([]);
  const [users, setUsers] = useState<UserResponse[]>([]);
  const [contactId, setContactId] = useState<string | null>(null);
  const [leadId, setLeadId] = useState<string | null>(null);
  const [assignedTo, setAssignedTo] = useState<string | null>(null);
  const [currency, setCurrency] = useState('USD');
  const [expectedCloseDate, setExpectedCloseDate] = useState('');

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const result = await apiClient.getUsers({});
      setUsers(result.users || []);
    } catch {
      message.error('Failed to load users');
    }
  };

  const searchContacts = async (query: string) => {
    if (!query) return;
    try {
      const result = await apiClient.getContacts({ search: query, page: 1, page_size: 10 });
      setContacts(result.items || []);
    } catch {
      message.error('Failed to search contacts');
    }
  };

  const searchLeads = async (query: string) => {
    if (!query) return;
    try {
      const result = await apiClient.getLeads({ search: query, page: 1, page_size: 10 });
      setLeads(result.items || []);
    } catch {
      message.error('Failed to search leads');
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    const formData = new FormData(e.currentTarget);
    const title = formData.get('title') as string;
    const amount = formData.get('amount') as string;
    const probability = formData.get('probability') as string;
    const description = formData.get('description') as string;

    try {
      const result = await apiClient.createDeal({
        title,
        contact_id: contactId || null,
        lead_id: leadId || null,
        amount: parseFloat(amount),
        currency,
        probability: probability ? parseInt(probability) : 0,
        expected_close_date: expectedCloseDate || null,
        description: description || null,
        assigned_to: assignedTo || null,
      });
      router.push(`/deals/${result.id}`);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to create deal');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div className="flex items-center gap-4">
          <Link href="/deals">
            <Button size="small" type="text">
              <ArrowLeftOutlined style={{ marginRight: 4 }} />
              Back
            </Button>
          </Link>
          <p className="page-subtitle">Create a new deal</p>
        </div>
      </div>

      <div className="glass-card p-0 max-w-3xl mx-auto">
        <div className="flex flex-col space-y-1.5 p-6">
          <h3 className="text-lg font-semibold leading-none tracking-tight">Deal Information</h3>
          <p className="text-sm text-gray-400">Enter the details for the new deal</p>
        </div>
        <div className="p-6 pt-0">
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <Alert type="error" message={error} showIcon className="!rounded-xl" closable onClose={() => setError('')} />
            )}

            <div className="space-y-1.5">
              <label htmlFor="title" className="text-sm font-medium text-gray-700">Title *</label>
              <Input id="title" name="title" type="text" placeholder="Enterprise Contract" required disabled={isLoading} size="large" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700">Contact</label>
                <Select showSearch allowClear style={{ width: '100%' }} placeholder="Search contacts..." filterOption={false} onSearch={searchContacts} value={contactId || undefined} onChange={(val) => setContactId(val || null)} options={contacts.map(c => ({ value: c.id, label: `${c.first_name}${c.last_name ? ' ' + c.last_name : ''}` }))} disabled={isLoading} size="large" />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700">Lead</label>
                <Select showSearch allowClear style={{ width: '100%' }} placeholder="Search leads..." filterOption={false} onSearch={searchLeads} value={leadId || undefined} onChange={(val) => setLeadId(val || null)} options={leads.map(l => ({ value: l.id, label: l.title }))} disabled={isLoading} size="large" />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label htmlFor="amount" className="text-sm font-medium text-gray-700">Amount *</label>
                <Input id="amount" name="amount" type="number" min="0" step="0.01" placeholder="100000" required disabled={isLoading} size="large" />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700">Currency</label>
                <Select value={currency} onChange={setCurrency} style={{ width: "100%" }} options={[{ value: "USD", label: "USD" }, { value: "EUR", label: "EUR" }, { value: "UZS", label: "UZS" }]} size="large" />
              </div>
              <div className="space-y-1.5">
                <label htmlFor="probability" className="text-sm font-medium text-gray-700">Probability (%)</label>
                <Input id="probability" name="probability" type="number" min="0" max="100" placeholder="75" disabled={isLoading} size="large" />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label htmlFor="expected_close_date" className="text-sm font-medium text-gray-700">Expected Close Date</label>
                <DatePicker id="expected_close_date" className="w-full" format="YYYY-MM-DD" value={expectedCloseDate ? dayjs(expectedCloseDate) : null} onChange={(date) => setExpectedCloseDate(date ? date.format('YYYY-MM-DD') : '')} disabled={isLoading} size="large" />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700">Assigned To</label>
                <Select allowClear style={{ width: '100%' }} placeholder="Select user..." value={assignedTo || undefined} onChange={(val) => setAssignedTo(val || null)} options={users.map(u => ({ value: u.id, label: `${u.first_name}${u.last_name ? ' ' + u.last_name : ''}` }))} disabled={isLoading} size="large" />
              </div>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="description" className="text-sm font-medium text-gray-700">Description</label>
              <Input.TextArea id="description" name="description" placeholder="Deal details..." disabled={isLoading} rows={3} />
            </div>

            <div className="flex space-x-3 pt-4 border-t border-gray-100">
              <Button type="primary" htmlType="submit" loading={isLoading} size="large">
                Create Deal
              </Button>
              <Link href="/deals">
                <Button type="default" htmlType="button" disabled={isLoading} size="large">Cancel</Button>
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
