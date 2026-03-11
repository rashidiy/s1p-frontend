'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api';
import { getErrorMessage } from '@/lib/utils';
import { UserRole } from '@/types/api';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { Alert, Button, Input, Select } from 'antd';
import { useTranslations } from 'next-intl';
import Link from 'next/link';

export default function InviteUserPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [role, setRole] = useState<string>(UserRole.COMPANY_OPERATOR);
  const t = useTranslations('users');
  const tFields = useTranslations('fields');
  const tActions = useTranslations('actions');
  const tErrors = useTranslations('errors');
  const tRoles = useTranslations('roles');

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
      setError(getErrorMessage(err, tErrors('failedToInviteUser')));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div className="flex items-center gap-4">
          <Link href="/users">
            <Button size="small" type="text">
              <ArrowLeftOutlined style={{ marginRight: 4 }} />
              {tActions('back')}
            </Button>
          </Link>
          <p className="page-subtitle">{t('inviteUserSubtitle')}</p>
        </div>
      </div>

      <div className="glass-card p-0 max-w-3xl mx-auto">
        <div className="flex flex-col space-y-1.5 p-6">
          <h3 className="text-base font-semibold leading-none tracking-tight">{t('userInformation')}</h3>
          <p className="text-sm text-gray-400">{t('enterUserDetails')}</p>
        </div>
        <div className="p-6 pt-0">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <Alert type="error" message={error} showIcon className="!rounded-xl" />
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="first_name" className="text-sm font-medium">{tFields('firstName')} *</label>
                <Input
                  id="first_name"
                  name="first_name"
                  type="text"
                  required
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="last_name" className="text-sm font-medium">{tFields('lastName')}</label>
                <Input
                  id="last_name"
                  name="last_name"
                  type="text"
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">{tFields('email')} *</label>
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
              <label htmlFor="phone" className="text-sm font-medium">{tFields('phone')}</label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                placeholder="+1234567890"
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="role" className="text-sm font-medium">{tFields('role')} *</label>
              <Select
                  value={role}
                  onChange={setRole}
                  style={{ width: "100%" }}
                  options={[{ value: UserRole.COMPANY_OPERATOR, label: tRoles('company_operator') }, { value: UserRole.COMPANY_MANAGER, label: tRoles('company_manager') }, { value: UserRole.COMPANY_ADMIN, label: tRoles('company_admin') }]}
                />
              <p className="text-xs text-gray-500">
                {t('operatorDescription')}
              </p>
            </div>

            <div className="flex space-x-3">
              <Button type="primary" htmlType="submit" disabled={isLoading}>
                {isLoading ? tActions('saving') : tActions('sendInvitation')}
              </Button>
              <Link href="/users">
                <Button type="default" htmlType="button"  disabled={isLoading}>
                  {tActions('cancel')}
                </Button>
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
