'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api';
import type { ContactResponse, UserResponse } from '@/types/api';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { Alert, Button, Input, Select, Select } from 'antd';
import Link from 'next/link';

export default function NewLeadPage() {
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
  }, []);

  const loadUsers = async () => {
    try {
      const result = await apiClient.getUsers({});
      setUsers(result.users || []);
    } catch {}
  };

  const searchContacts = async (query: string) => {
    if (!query) return;
    try {
      const result = await apiClient.getContacts({ search: query, page: 1, page_size: 10 });
      setContacts(result.items || []);
    } catch {}
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
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to create lead');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Link href="/leads">
          <Button size="middle" style={{ width: 40, height: 40, padding: 0 }} type="text">
            <ArrowLeftOutlined />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold gradient-text">New Lead</h1>
          <p className="text-gray-500">Create a new sales lead</p>
        </div>
      </div>

      <div className="glass-card p-0 max-w-2xl">
        <div className="flex flex-col space-y-1.5 p-6">
          <h3 className="text-2xl font-semibold leading-none tracking-tight">Lead Information</h3>
          <p className="text-sm text-muted-foreground">Enter the details for the new lead</p>
        </div>
        <div className="p-6 pt-0">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <Alert type="error" message={error} showIcon className="!rounded-xl" />
            )}

            <div className="space-y-2">
              <label htmlFor="title" className="text-sm font-medium">Title *</label>
              <Input
                id="title"
                name="title"
                type="text"
                placeholder="Software Implementation"
                required
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Contact</label>
              <Select
                showSearch
                allowClear
                style={{ width: '100%' }}
                placeholder="Search contacts..."
                filterOption={false}
                onSearch={searchContacts}
                value={contactId || undefined}
                onChange={(val) => setContactId(val || null)}
                options={contacts.map(c => ({
                  value: c.id,
                  label: `${c.first_name}${c.last_name ? ' ' + c.last_name : ''}`,
                }))}
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="source" className="text-sm font-medium">Source</label>
              <Input
                id="source"
                name="source"
                type="text"
                placeholder="Referral"
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="description" className="text-sm font-medium">Description</label>
              <Input.TextArea
                id="description"
                name="description"
                placeholder="Customer needs..."
                disabled={isLoading}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="estimated_value" className="text-sm font-medium">Estimated Value</label>
                <Input
                  id="estimated_value"
                  name="estimated_value"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="50000"
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Currency</label>
                <Select
                  value={currency}
                  onChange={setCurrency}
                  style={{ width: "100%" }}
                  options={[{ value: "USD", label: "USD" }, { value: "EUR", label: "EUR" }, { value: "UZS", label: "UZS" }]}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Assigned To</label>
              <Select
                allowClear
                style={{ width: '100%' }}
                placeholder="Select user..."
                value={assignedTo || undefined}
                onChange={(val) => setAssignedTo(val || null)}
                options={users.map(u => ({
                  value: u.id,
                  label: `${u.first_name}${u.last_name ? ' ' + u.last_name : ''}`,
                }))}
                disabled={isLoading}
              />
            </div>

            <div className="flex space-x-3">
              <Button htmlType="submit" disabled={isLoading}>
                {isLoading ? 'Creating...' : 'Create Lead'}
              </Button>
              <Link href="/leads">
                <Button type="default" htmlType="button"  disabled={isLoading}>
                  Cancel
                </Button>
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
