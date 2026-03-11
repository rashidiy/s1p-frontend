'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { Alert, Button, Input, Select } from 'antd';
import Link from 'next/link';

export default function NewContactPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [tags, setTags] = useState<string[]>([]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    const formData = new FormData(e.currentTarget);
    const first_name = formData.get('first_name') as string;
    const last_name = formData.get('last_name') as string;
    const email = formData.get('email') as string;
    const phone = formData.get('phone') as string;
    const company_name = formData.get('company_name') as string;
    const position = formData.get('position') as string;
    const source = formData.get('source') as string;

    try {
      const result = await apiClient.createContact({
        first_name,
        last_name: last_name || null,
        email: email || null,
        phone: phone || null,
        company_name: company_name || null,
        position: position || null,
        source: source || null,
        tags,
      });
      router.push(`/contacts/${result.id}`);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to create contact');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div className="flex items-center gap-4">
          <Link href="/contacts">
            <Button size="small" type="text">
              <ArrowLeftOutlined style={{ marginRight: 4 }} />
              Back
            </Button>
          </Link>
          <p className="page-subtitle">Add a new contact to your CRM</p>
        </div>
      </div>

      <div className="glass-card p-0 max-w-3xl mx-auto">
        <div className="flex flex-col space-y-1.5 p-6">
          <h3 className="text-lg font-semibold leading-none tracking-tight">Contact Information</h3>
          <p className="text-sm text-gray-400">Enter the details for the new contact</p>
        </div>
        <div className="p-6 pt-0">
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <Alert type="error" message={error} showIcon className="!rounded-xl" closable onClose={() => setError('')} />
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label htmlFor="first_name" className="text-sm font-medium text-gray-700">First Name *</label>
                <Input id="first_name" name="first_name" type="text" placeholder="John" required disabled={isLoading} size="large" />
              </div>
              <div className="space-y-1.5">
                <label htmlFor="last_name" className="text-sm font-medium text-gray-700">Last Name</label>
                <Input id="last_name" name="last_name" type="text" placeholder="Doe" disabled={isLoading} size="large" />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label htmlFor="email" className="text-sm font-medium text-gray-700">Email</label>
                <Input id="email" name="email" type="email" placeholder="john@example.com" disabled={isLoading} size="large" />
              </div>
              <div className="space-y-1.5">
                <label htmlFor="phone" className="text-sm font-medium text-gray-700">Phone</label>
                <Input id="phone" name="phone" type="tel" placeholder="+1234567890" disabled={isLoading} size="large" />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label htmlFor="company_name" className="text-sm font-medium text-gray-700">Company</label>
                <Input id="company_name" name="company_name" type="text" placeholder="Acme Corp" disabled={isLoading} size="large" />
              </div>
              <div className="space-y-1.5">
                <label htmlFor="position" className="text-sm font-medium text-gray-700">Position</label>
                <Input id="position" name="position" type="text" placeholder="Sales Manager" disabled={isLoading} size="large" />
              </div>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="source" className="text-sm font-medium text-gray-700">Source</label>
              <Input id="source" name="source" type="text" placeholder="Website" disabled={isLoading} size="large" />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700">Tags</label>
              <Select mode="tags" style={{ width: '100%' }} placeholder="Add tags..." value={tags} onChange={setTags} disabled={isLoading} size="large" />
            </div>

            <div className="flex space-x-3 pt-4 border-t border-gray-100">
              <Button type="primary" htmlType="submit" loading={isLoading} size="large">
                Create Contact
              </Button>
              <Link href="/contacts">
                <Button type="default" htmlType="button" disabled={isLoading} size="large">Cancel</Button>
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
