'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { apiClient } from '@/lib/api';
import type { ContactResponse, LeadResponse, UserResponse } from '@/types/api';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { Alert, Select as AntSelect } from 'antd';
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

  const searchLeads = async (query: string) => {
    if (!query) return;
    try {
      const result = await apiClient.getLeads({ search: query, page: 1, page_size: 10 });
      setLeads(result.items || []);
    } catch {}
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    const formData = new FormData(e.currentTarget);
    const title = formData.get('title') as string;
    const amount = formData.get('amount') as string;
    const probability = formData.get('probability') as string;
    const expected_close_date = formData.get('expected_close_date') as string;
    const description = formData.get('description') as string;

    try {
      const result = await apiClient.createDeal({
        title,
        contact_id: contactId || null,
        lead_id: leadId || null,
        amount: parseFloat(amount),
        currency,
        probability: probability ? parseInt(probability) : 0,
        expected_close_date: expected_close_date || null,
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
      <div className="flex items-center space-x-4">
        <Link href="/deals">
          <Button variant="ghost" size="icon">
            <ArrowLeftOutlined />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold gradient-text">New Deal</h1>
          <p className="text-gray-500">Create a new deal</p>
        </div>
      </div>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Deal Information</CardTitle>
          <CardDescription>Enter the details for the new deal</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <Alert type="error" message={error} showIcon className="!rounded-xl" />
            )}

            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                name="title"
                type="text"
                placeholder="Enterprise Contract"
                required
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label>Contact</Label>
              <AntSelect
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
              <Label>Lead</Label>
              <AntSelect
                showSearch
                allowClear
                style={{ width: '100%' }}
                placeholder="Search leads..."
                filterOption={false}
                onSearch={searchLeads}
                value={leadId || undefined}
                onChange={(val) => setLeadId(val || null)}
                options={leads.map(l => ({
                  value: l.id,
                  label: l.title,
                }))}
                disabled={isLoading}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="amount">Amount *</Label>
                <Input
                  id="amount"
                  name="amount"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="100000"
                  required
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-2">
                <Label>Currency</Label>
                <Select value={currency} onValueChange={setCurrency}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USD">USD</SelectItem>
                    <SelectItem value="EUR">EUR</SelectItem>
                    <SelectItem value="UZS">UZS</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="probability">Probability</Label>
              <Input
                id="probability"
                name="probability"
                type="number"
                min="0"
                max="100"
                placeholder="75"
                disabled={isLoading}
              />
              <p className="text-xs text-gray-500">Win probability (0-100%)</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="expected_close_date">Expected Close Date</Label>
              <Input
                id="expected_close_date"
                name="expected_close_date"
                type="date"
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                placeholder="Deal details..."
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label>Assigned To</Label>
              <AntSelect
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
                {isLoading ? 'Creating...' : 'Create Deal'}
              </Button>
              <Link href="/deals">
                <Button htmlType="button" variant="outline" disabled={isLoading}>
                  Cancel
                </Button>
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
