'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeftOutlined, BankOutlined, TeamOutlined, SettingOutlined, UserAddOutlined, SaveOutlined, CloseOutlined, EditOutlined } from '@ant-design/icons';
import { Alert, Button, Input, Tag, message } from 'antd';
import { useTranslations } from 'next-intl';
import { apiClient } from '@/lib/api';
import { getSubdomainUrl } from '@/lib/subdomain';
import type { CompanyDetailResponse, InviteAdminResponse } from '@/types/api';

export default function CompanyDetailPage() {
  const params = useParams()!;
  const router = useRouter();
  const companyId = params.id as string;
  const t = useTranslations('companies');
  const tErrors = useTranslations('errors');
  const tActions = useTranslations('actions');
  const tFields = useTranslations('fields');
  const tStatuses = useTranslations('statuses');
  const tUsers = useTranslations('users');

  const [company, setCompany] = useState<CompanyDetailResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({ name: '' });

  // Invite admin form
  const [showInvite, setShowInvite] = useState(false);
  const [inviteForm, setInviteForm] = useState({
    first_name: '',
    last_name: '',
    phone: '',
  });
  const [inviting, setInviting] = useState(false);
  const [inviteMessage, setInviteMessage] = useState('');
  const [inviteResult, setInviteResult] = useState<InviteAdminResponse | null>(null);
  const [messageCopied, setMessageCopied] = useState(false);

  useEffect(() => {
    loadCompany();
  }, [companyId]);

  const loadCompany = async () => {
    try {
      const data = await apiClient.getCompanyDetail(companyId);
      setCompany(data);
      setEditForm({ name: data.name });
    } catch (error) {
      console.error('Failed to load company:', error);
      message.error(tErrors('failedToLoadCompanies'));
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      await apiClient.updateCompany(companyId, { name: editForm.name });
      setEditing(false);
      loadCompany();
    } catch (error) {
      console.error('Failed to update company:', error);
      message.error(tErrors('failedToUpdateCompany'));
    }
  };

  const handleToggleActive = async () => {
    if (!company) return;
    try {
      if (company.is_active) {
        await apiClient.deactivateCompany(companyId);
      } else {
        await apiClient.activateCompany(companyId);
      }
      loadCompany();
    } catch (error) {
      console.error('Failed to toggle company status:', error);
      message.error(tErrors('failedToToggleCompanyStatus'));
    }
  };

  const handleInviteAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setInviting(true);
    setInviteMessage('');
    try {
      const result = await apiClient.inviteAdmin(companyId, {
        first_name: inviteForm.first_name,
        last_name: inviteForm.last_name || null,
        phone: inviteForm.phone || null,
      });
      setInviteResult(result);
      setInviteForm({ first_name: '', last_name: '', phone: '' });
    } catch (error: any) {
      setInviteMessage(error.response?.data?.detail || tErrors('failedToInviteAdmin'));
    } finally {
      setInviting(false);
    }
  };

  const buildRegistrationUrl = () => {
    if (!company?.subdomain) return '';
    return getSubdomainUrl(company.subdomain, '/register');
  };

  const buildAdminInviteMessage = () => {
    if (!inviteResult) return '';
    const expiresFormatted = new Date(inviteResult.expires_at).toLocaleString();
    const regUrl = buildRegistrationUrl();
    return [
      `Вас пригласили в ${inviteResult.company_name} (S1P CRM)!`,
      '',
      `Роль: Admin`,
      `Код приглашения: ${inviteResult.invite_token}`,
      '',
      ...(regUrl ? [`Для регистрации перейдите по ссылке:`, regUrl, ''] : []),
      `Действует до: ${expiresFormatted}`,
    ].join('\n');
  };

  const handleCopyAdminMessage = async () => {
    const msg = buildAdminInviteMessage();
    try {
      await navigator.clipboard.writeText(msg);
      setMessageCopied(true);
      setTimeout(() => setMessageCopied(false), 2000);
    } catch {
      const el = document.createElement('textarea');
      el.value = msg;
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
      setMessageCopied(true);
      setTimeout(() => setMessageCopied(false), 2000);
    }
  };

  if (loading) return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <div className="h-6 w-14 bg-gray-100 rounded animate-pulse" />
        <div className="h-6 w-6 bg-gray-100 rounded animate-pulse" />
        <div className="h-8 w-48 bg-gray-100 rounded-lg animate-pulse" />
        <div className="h-5 w-16 bg-gray-100 rounded animate-pulse" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {[1, 2].map((i) => (
          <div key={i} className="glass-card p-6 space-y-4">
            <div className="h-5 w-36 bg-gray-100 rounded animate-pulse" />
            {[1, 2, 3, 4].map((j) => (
              <div key={j} className="flex justify-between py-1.5">
                <div className="h-4 w-20 bg-gray-50 rounded animate-pulse" />
                <div className="h-4 w-28 bg-gray-50 rounded animate-pulse" />
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
  if (!company) return <div className="p-6">{t('companyNotFound')}</div>;

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div className="flex items-center gap-3 flex-wrap">
          <Button size="small" type="text" onClick={() => router.push('/owner/companies')}>
            <ArrowLeftOutlined style={{ marginRight: 4 }} />
            {tActions('back')}
          </Button>
          <Tag color={company.is_active ? 'blue' : undefined}>
            {company.is_active ? tStatuses('active') : tStatuses('inactive')}
          </Tag>
        </div>
        <div className="flex gap-2">
          <Button type="default" onClick={() => setShowInvite(true)}>
            <UserAddOutlined style={{ marginRight: 8 }} />
            <span className="hidden sm:inline">{t('inviteAdmin')}</span>
          </Button>
          <Button type="primary" danger={company.is_active}
            onClick={handleToggleActive}>
            {company.is_active ? tActions('deactivate') : tActions('activate')}
          </Button>
        </div>
      </div>

      {inviteMessage && (
        <Alert
          type={inviteMessage.includes('success') ? 'success' : 'error'}
          message={inviteMessage}
          showIcon
          className="!rounded-xl"
          closable
          onClose={() => setInviteMessage('')}
        />
      )}

      {showInvite && !inviteResult && (
        <div className="glass-card overflow-hidden">
          <div className="px-4 sm:px-6 pt-5 sm:pt-6 pb-2">
            <h3 className="text-base font-semibold text-gray-900">{t('inviteCompanyAdmin')}</h3>
            <p className="text-sm text-gray-400 mt-0.5">{t('inviteCompanyAdminSubtitle')}</p>
          </div>
          <div className="px-4 sm:px-6 pb-5 sm:pb-6 pt-3">
            <form onSubmit={handleInviteAdmin} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-gray-700">{tFields('firstName')} <span className="text-red-400">*</span></label>
                  <Input
                    value={inviteForm.first_name}
                    onChange={(e) => setInviteForm({ ...inviteForm, first_name: e.target.value })}
                    required
                    size="large"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-gray-700">{tFields('lastName')}</label>
                  <Input
                    value={inviteForm.last_name}
                    onChange={(e) => setInviteForm({ ...inviteForm, last_name: e.target.value })}
                    size="large"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700">{tFields('phone')}</label>
                <Input
                  value={inviteForm.phone}
                  onChange={(e) => setInviteForm({ ...inviteForm, phone: e.target.value })}
                  placeholder="+998901234567"
                  size="large"
                />
              </div>
              <div className="flex gap-2 pt-2 border-t border-gray-100">
                <Button type="primary" htmlType="submit" loading={inviting}>
                  {inviting ? tActions('creating') : tActions('create')}
                </Button>
                <Button htmlType="button" onClick={() => setShowInvite(false)}>
                  {tActions('cancel')}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {inviteResult && (
        <div className="glass-card overflow-hidden">
          <div className="px-4 sm:px-6 pt-5 sm:pt-6 pb-2">
            <h3 className="text-base font-semibold text-gray-900">{t('adminInviteCreated')}</h3>
          </div>
          <div className="px-4 sm:px-6 pb-5 sm:pb-6 pt-3 space-y-4">
            <Alert
              type="warning"
              showIcon
              className="!rounded-xl"
              message={t('inviteTokenOnceWarning')}
            />
            <div className="bg-gray-50 rounded-xl p-5 font-mono text-sm text-gray-800 whitespace-pre-wrap">
              {buildAdminInviteMessage()}
            </div>
            <div className="flex flex-wrap gap-3">
              <Button
                type="primary"
                onClick={handleCopyAdminMessage}
              >
                {messageCopied ? tUsers('telegramTokenCopied') : tUsers('copyMessage')}
              </Button>
              <Button onClick={() => {
                setInviteResult(null);
                setShowInvite(false);
              }}>
                {tActions('done')}
              </Button>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="glass-card overflow-hidden">
          <div className="px-4 sm:px-6 pt-5 sm:pt-6 pb-2 flex items-center justify-between">
            <h3 className="text-base font-semibold text-gray-900">{t('companyDetails')}</h3>
            {!editing && (
              <Button size="small" type="text" icon={<EditOutlined />} onClick={() => setEditing(true)} />
            )}
          </div>
          <div className="px-4 sm:px-6 pb-5 sm:pb-6 pt-3">
            {editing ? (
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-gray-700">{t('companyName')}</label>
                  <Input
                    value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    size="large"
                  />
                </div>
                <div className="flex gap-2">
                  <Button type="primary" icon={<SaveOutlined />} onClick={handleSave}>{tActions('save')}</Button>
                  <Button icon={<CloseOutlined />} onClick={() => setEditing(false)}>{tActions('cancel')}</Button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {[
                  { label: tFields('name'), value: company.name },
                  { label: t('subdomain'), value: company.subdomain || '-' },
                  { label: tFields('provider'), value: company.provider_type?.toUpperCase() },
                  { label: tFields('created'), value: new Date(company.created_at).toLocaleDateString() },
                ].map((row) => (
                  <div key={row.label} className="flex justify-between items-center py-1.5 border-b border-gray-50 last:border-0">
                    <span className="text-sm text-gray-400">{row.label}</span>
                    <span className="text-sm font-medium text-gray-900">{row.value}</span>
                  </div>
                ))}
                <div className="flex justify-between items-center py-1.5">
                  <span className="text-sm text-gray-400">{tFields('status')}</span>
                  <Tag color={company.is_active ? 'green' : 'default'}>
                    {company.is_active ? tStatuses('active') : tStatuses('inactive')}
                  </Tag>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="glass-card overflow-hidden">
          <div className="px-4 sm:px-6 pt-5 sm:pt-6 pb-2">
            <h3 className="text-base font-semibold text-gray-900">{t('providerConfiguration')}</h3>
          </div>
          <div className="px-4 sm:px-6 pb-5 sm:pb-6 pt-3">
            {Object.keys(company.provider_config || {}).length > 0 ? (
              <div className="space-y-3">
                {Object.entries(company.provider_config || {}).map(([key, value]) => (
                  <div key={key} className="flex justify-between items-center py-1.5 border-b border-gray-50 last:border-0">
                    <span className="text-sm text-gray-400">{key}</span>
                    <code className="text-xs font-mono bg-gray-50 text-gray-600 px-2 py-1 rounded-lg">
                      {typeof value === 'string' ? value : JSON.stringify(value)}
                    </code>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-400">{t('noProviderConfiguration')}</p>
            )}
          </div>
        </div>

        {company.webhook_url && (
          <div className="glass-card overflow-hidden lg:col-span-2">
            <div className="px-4 sm:px-6 pt-5 sm:pt-6 pb-2">
              <h3 className="text-base font-semibold text-gray-900">{t('webhook')}</h3>
            </div>
            <div className="px-4 sm:px-6 pb-5 sm:pb-6 pt-3 space-y-3">
              {[
                { label: t('url'), value: company.webhook_url },
                { label: t('token'), value: company.webhook_token },
              ].map((row) => (
                <div key={row.label} className="flex justify-between items-center py-1.5 border-b border-gray-50 last:border-0">
                  <span className="text-sm text-gray-400">{row.label}</span>
                  <code className="text-xs font-mono bg-gray-50 text-gray-600 px-2 py-1 rounded-lg max-w-md truncate">
                    {row.value}
                  </code>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
