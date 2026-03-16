'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api';
import { getErrorMessage } from '@/lib/utils';
import { getSubdomainClient, getSubdomainUrl } from '@/lib/subdomain';
import { UserRole } from '@/types/api';
import type { InviteTokenResponse } from '@/types/api';
import { ArrowLeftOutlined, CopyOutlined, CheckOutlined, WarningOutlined } from '@ant-design/icons';
import { Alert, Button, Input, Select, Typography } from 'antd';
import { useTranslations } from 'next-intl';
import Link from 'next/link';

const { Text } = Typography;

export default function InviteTelegramPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [role, setRole] = useState<string>(UserRole.COMPANY_OPERATOR);
  const [tokenResult, setTokenResult] = useState<InviteTokenResponse | null>(null);
  const [copied, setCopied] = useState(false);
  const t = useTranslations('users');
  const tFields = useTranslations('fields');
  const tActions = useTranslations('actions');
  const tErrors = useTranslations('errors');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    const formData = new FormData(e.currentTarget);
    const first_name = formData.get('first_name') as string;
    const last_name = formData.get('last_name') as string;
    const phone = formData.get('phone') as string;

    try {
      const result = await apiClient.createInviteToken({
        first_name,
        last_name: last_name || null,
        phone,
        role,
      });
      setTokenResult(result);
    } catch (err: unknown) {
      setError(getErrorMessage(err, tErrors('failedToInviteUser')));
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyToken = async () => {
    if (!tokenResult) return;
    try {
      await navigator.clipboard.writeText(tokenResult.invite_token);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const el = document.createElement('textarea');
      el.value = tokenResult.invite_token;
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Build invite message for copying
  const buildInviteMessage = () => {
    if (!tokenResult) return '';
    const roleName = tokenResult.role.replace('company_', '').charAt(0).toUpperCase() + tokenResult.role.replace('company_', '').slice(1);
    const expiresFormatted = new Date(tokenResult.expires_at).toLocaleString();
    const subdomain = getSubdomainClient();
    const regUrl = subdomain ? getSubdomainUrl(subdomain, '/register') : `${window.location.origin}/register`;

    return [
      `Вас пригласили в S1P CRM!`,
      '',
      `Роль: ${roleName}`,
      `Код приглашения: ${tokenResult.invite_token}`,
      '',
      `Для регистрации перейдите по ссылке:`,
      regUrl,
      '',
      `Действует до: ${expiresFormatted}`,
    ].join('\n');
  };

  const handleCopyMessage = async () => {
    const msg = buildInviteMessage();
    try {
      await navigator.clipboard.writeText(msg);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const el = document.createElement('textarea');
      el.value = msg;
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDone = () => {
    router.push('/users');
  };

  // Token result view
  if (tokenResult) {
    return (
      <div className="space-y-6">
        <div className="page-header">
          <div className="flex items-center gap-4">
            <p className="page-subtitle">{t('telegramInviteSubtitle')}</p>
          </div>
        </div>

        <div className="glass-card p-0 max-w-3xl mx-auto">
          <div className="flex flex-col space-y-1.5 p-6">
            <h3 className="text-base font-semibold leading-none tracking-tight">{t('telegramInviteCreated')}</h3>
          </div>
          <div className="p-6 pt-0 space-y-6">
            <Alert
              type="warning"
              icon={<WarningOutlined />}
              showIcon
              className="!rounded-xl"
              message={t('telegramTokenOnceWarning')}
            />

            {/* Formatted invite message preview */}
            <div className="bg-gray-50 rounded-xl p-5 space-y-1 font-mono text-sm text-gray-800 whitespace-pre-wrap">
              {buildInviteMessage()}
            </div>

            <div className="flex flex-wrap gap-3">
              <Button
                type="primary"
                icon={copied ? <CheckOutlined /> : <CopyOutlined />}
                onClick={handleCopyMessage}
                size="large"
              >
                {copied ? t('telegramTokenCopied') : (t('copyMessage') || 'Copy Message')}
              </Button>
              <Button
                icon={<CopyOutlined />}
                onClick={handleCopyToken}
                size="large"
              >
                {t('copyTokenOnly') || 'Copy Token Only'}
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <Text type="secondary">{tFields('firstName')}</Text>
                <p className="font-medium">{tokenResult.first_name}</p>
              </div>
              <div>
                <Text type="secondary">{tFields('phone')}</Text>
                <p className="font-medium">{tokenResult.phone}</p>
              </div>
              <div>
                <Text type="secondary">{tFields('role')}</Text>
                <p className="font-medium">{tokenResult.role.replace('company_', '').toUpperCase()}</p>
              </div>
              <div>
                <Text type="secondary">{t('telegramTokenExpires')}</Text>
                <p className="font-medium">{new Date(tokenResult.expires_at).toLocaleString()}</p>
              </div>
            </div>

            <div className="flex space-x-3">
              <Button type="primary" onClick={handleDone}>
                {tActions('back')}
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

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
          <p className="page-subtitle">{t('telegramInviteSubtitle')}</p>
        </div>
      </div>

      <div className="glass-card p-0 max-w-3xl mx-auto">
        <div className="flex flex-col space-y-1.5 p-6">
          <h3 className="text-base font-semibold leading-none tracking-tight">{t('userInformation')}</h3>
          <p className="text-sm text-gray-400">{t('telegramInviteDescription')}</p>
        </div>
        <div className="p-6 pt-0">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <Alert type="error" title={error} showIcon className="!rounded-xl" />
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
              <label htmlFor="phone" className="text-sm font-medium">{tFields('phone')} *</label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                placeholder="+998901234567"
                required
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="role" className="text-sm font-medium">{tFields('role')} *</label>
              <Select
                value={role}
                onChange={setRole}
                style={{ width: "100%" }}
                options={[
                  { value: UserRole.COMPANY_OPERATOR, label: t('roleOperator') },
                  { value: UserRole.COMPANY_MANAGER, label: t('roleManager') },
                  { value: UserRole.COMPANY_ADMIN, label: t('roleAdmin') },
                ]}
              />
              <p className="text-xs text-gray-500">
                {t('operatorDescription')}
              </p>
            </div>

            <div className="flex space-x-3">
              <Button type="primary" htmlType="submit" disabled={isLoading}>
                {isLoading ? tActions('saving') : t('telegramCreateInvite')}
              </Button>
              <Link href="/users">
                <Button type="default" htmlType="button" disabled={isLoading}>
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
