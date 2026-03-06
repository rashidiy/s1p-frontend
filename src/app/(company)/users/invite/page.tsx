'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api';
import { getErrorMessage } from '@/lib/utils';
import { UserRole } from '@/types/api';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { Alert, Button, Input, Select } from 'antd';
import Link from 'next/link';

export default function InviteUserPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [role, setRole] = useState<string>(UserRole.COMPANY_OPERATOR);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const first_name = formData.get('first_name') as string;
    const last_name = formData.get('last_name') as string;
    const phone = formData.get('phone') as string;

    try {
      await apiClient.inviteUser({
        email,
        first_name,
        last_name: last_name || null,
        phone: phone || null,
        role: role as UserRole,
      });
      router.push('/users');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to invite user');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Link href="/users">
          <Button size="middle" style={{ width: 40, height: 40, padding: 0 }} type="text">
            <ArrowLeftOutlined />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold gradient-text">Invite User</h1>
          <p className="text-gray-500">Send an invitation to join your team</p>
        </div>
      </div>

      <div className="glass-card p-0 max-w-2xl">
        <div className="flex flex-col space-y-1.5 p-6">
          <h3 className="text-2xl font-semibold leading-none tracking-tight">User Information</h3>
          <p className="text-sm text-muted-foreground">Enter the details for the new team member</p>
        </div>
        <div className="p-6 pt-0">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <Alert type="error" message={error} showIcon className="!rounded-xl" />
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="first_name" className="text-sm font-medium">First Name *</label>
                <Input
                  id="first_name"
                  name="first_name"
                  type="text"
                  required
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="last_name" className="text-sm font-medium">Last Name</label>
                <Input
                  id="last_name"
                  name="last_name"
                  type="text"
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">Email *</label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="user@example.com"
                required
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="phone" className="text-sm font-medium">Phone</label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                placeholder="+1234567890"
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="role" className="text-sm font-medium">Role *</label>
              <Select
                  value={role}
                  onChange={setRole}
                  style={{ width: "100%" }}
                  options={[{ value: UserRole.COMPANY_OPERATOR, label: "Operator" }, { value: UserRole.COMPANY_MANAGER, label: "Manager" }, { value: UserRole.COMPANY_ADMIN, label: "Admin" }]}
                />
              <p className="text-xs text-gray-500">
                Operators can handle calls and basic tasks. Managers can view team analytics. Admins have full access.
              </p>
            </div>

            <div className="flex space-x-3">
              <Button htmlType="submit" disabled={isLoading}>
                {isLoading ? 'Sending...' : 'Send Invitation'}
              </Button>
              <Link href="/users">
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
