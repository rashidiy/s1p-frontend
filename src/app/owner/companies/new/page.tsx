'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api';
import { getErrorMessage } from '@/lib/utils';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { Alert, Button, Input, Select } from 'antd';
import Link from 'next/link';

export default function NewCompanyPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [providerType, setProviderType] = useState<string>('sipuni');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    const formData = new FormData(e.currentTarget);
    const name = formData.get('name') as string;
    const subdomain = formData.get('subdomain') as string;
    const providerConfig = formData.get('provider_config') as string;

    try {
      const config = providerConfig ? JSON.parse(providerConfig) : {};
      await apiClient.createCompany({
        name,
        subdomain: subdomain || null,
        provider_type: providerType,
        provider_config: config,
      });
      router.push('/owner/companies');
    } catch (err: any) {
      setError(getErrorMessage(err, 'Failed to create company'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Link href="/owner/companies">
          <Button size="middle" style={{ width: 40, height: 40, padding: 0 }} type="text">
            <ArrowLeftOutlined />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold gradient-text">Add New Company</h1>
          <p className="text-gray-500">Register a new company on the platform</p>
        </div>
      </div>

      <div className="glass-card p-0 max-w-2xl">
        <div className="flex flex-col space-y-1.5 p-6">
          <h3 className="text-2xl font-semibold leading-none tracking-tight">Company Information</h3>
          <p className="text-sm text-muted-foreground">Enter the details for the new company</p>
        </div>
        <div className="p-6 pt-0">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <Alert type="error" message={error} showIcon className="!rounded-xl" />
            )}

            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium">Company Name *</label>
              <Input
                id="name"
                name="name"
                type="text"
                placeholder="Acme Corp"
                required
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="subdomain" className="text-sm font-medium">Subdomain</label>
              <Input
                id="subdomain"
                name="subdomain"
                type="text"
                placeholder="acme"
                disabled={isLoading}
              />
              <p className="text-xs text-gray-500">
                Optional: Custom subdomain for the company
              </p>
            </div>

            <div className="space-y-2">
              <label htmlFor="provider_type" className="text-sm font-medium">Provider Type *</label>
              <Select
                  value={providerType}
                  onChange={setProviderType}
                  style={{ width: "100%" }}
                  options={[{ value: "sipuni", label: "SIPUNI" }, { value: "binotel", label: "Binotel" }]}
                />
            </div>

            <div className="space-y-2">
              <label htmlFor="provider_config" className="text-sm font-medium">Provider Configuration</label>
              <Input.TextArea
                id="provider_config"
                name="provider_config"
                placeholder='{"api_key": "your-key", "account_id": "123"}'
                rows={6}
                disabled={isLoading}
              />
              <p className="text-xs text-gray-500">
                Enter provider-specific configuration as JSON
              </p>
            </div>

            <div className="flex space-x-3">
              <Button htmlType="submit" disabled={isLoading}>
                {isLoading ? 'Creating...' : 'Create Company'}
              </Button>
              <Link href="/owner/companies">
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
