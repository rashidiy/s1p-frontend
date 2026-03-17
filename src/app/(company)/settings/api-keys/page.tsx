'use client';

import { useEffect, useState } from 'react';
import { PlusOutlined, DeleteOutlined, KeyOutlined, CopyOutlined, WarningOutlined, ExclamationCircleOutlined, QuestionCircleOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { Button, Input, Modal, Tag, Tooltip, Typography, message } from 'antd';
import { apiClient } from '@/lib/api';
import { useTranslations } from 'next-intl';
import { EmptyStateCharacter, ErrorCharacter } from '@/components/illustrations';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import Link from 'next/link';
import type { ApiKeyResponse, ApiKeyCreateResponse } from '@/types/api';
import { UserRole } from '@/types/api';

export default function ApiKeysPage() {
  const [keys, setKeys] = useState<ApiKeyResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');
  const [createdKey, setCreatedKey] = useState<ApiKeyCreateResponse | null>(null);
  const t = useTranslations('settings');
  const tActions = useTranslations('actions');
  const tErrors = useTranslations('errors');
  const tCommon = useTranslations('common');
  const tFields = useTranslations('fields');
  const tStatuses = useTranslations('statuses');

  useEffect(() => {
    loadKeys();
  // eslint-disable-next-line react-hooks/exhaustive-deps -- load on mount only
  }, []);

  const loadKeys = async () => {
    setError(false);
    try {
      const data = await apiClient.getApiKeys();
      setKeys(data.items);
    } catch (error) {
      console.error('Failed to load API keys:', error);
      setError(true);
      message.error(tErrors('failedToLoadApiKeys'));
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    setCreating(true);
    try {
      const result = await apiClient.createApiKey({ name: newKeyName });
      setCreatedKey(result);
      setShowCreateModal(false);
      setNewKeyName('');
      message.success(t('apiKeyCreated'));
      loadKeys();
    } catch (error) {
      console.error('Failed to create API key:', error);
      message.error(tErrors('failedToCreateApiKey'));
    } finally {
      setCreating(false);
    }
  };

  const handleRevoke = (keyId: string) => {
    Modal.confirm({
      title: tCommon('areYouSure'),
      icon: <ExclamationCircleOutlined />,
      content: t('confirmRevokeKey'),
      okText: t('revokeKey'),
      cancelText: tActions('cancel'),
      okButtonProps: { danger: true },
      onOk: async () => {
        try {
          await apiClient.revokeApiKey(keyId);
          message.success(t('apiKeyRevoked'));
          loadKeys();
        } catch (error) {
          console.error('Failed to revoke API key:', error);
          message.error(tErrors('failedToRevokeApiKey'));
        }
      },
    });
  };

  if (error) {
    return (
      <ProtectedRoute requireRole={UserRole.COMPANY_ADMIN}>
        <div className="glass-card py-16 flex flex-col items-center justify-center">
          <ErrorCharacter height={115} />
          <h3 className="mt-5 text-lg font-semibold text-gray-800">{tErrors('somethingWentWrong')}</h3>
          <p className="text-sm text-gray-400 mt-1">{tErrors('tryAgainLater')}</p>
          <Button type="primary" className="mt-4" onClick={() => { setError(false); setLoading(true); loadKeys(); }}>
            {tActions('tryAgain')}
          </Button>
        </div>
      </ProtectedRoute>
    );
  }

  if (loading) return (
    <ProtectedRoute requireRole={UserRole.COMPANY_ADMIN}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="h-8 w-48 bg-gray-100 rounded-lg animate-pulse" />
            <div className="h-4 w-56 bg-gray-50 rounded animate-pulse mt-2" />
          </div>
          <div className="h-9 w-36 bg-gray-100 rounded-lg animate-pulse" />
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="glass-card p-5 space-y-3">
              <div className="flex items-center justify-between">
                <div className="h-5 w-36 bg-gray-100 rounded animate-pulse" />
                <div className="flex gap-2">
                  <div className="h-7 w-7 bg-gray-50 rounded animate-pulse" />
                  <div className="h-7 w-7 bg-gray-50 rounded animate-pulse" />
                </div>
              </div>
              <div className="h-4 w-64 bg-gray-50 rounded animate-pulse" />
              <div className="flex gap-2">
                {[1, 2, 3].map((j) => (
                  <div key={j} className="h-5 w-20 bg-gray-50 rounded animate-pulse" />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </ProtectedRoute>
  );

  return (
    <ProtectedRoute requireRole={UserRole.COMPANY_ADMIN}>
    <div className="space-y-6">
      <Link href="/settings">
        <Button type="text" icon={<ArrowLeftOutlined />} className="mb-2">
          {tCommon('backToSettings')}
        </Button>
      </Link>
      {/* Warning banner */}
      <div className="glass-card p-4 border-amber-200 bg-amber-50/50">
        <div className="flex items-start gap-3">
          <WarningOutlined style={{ fontSize: 20, color: '#d97706' }} />
          <p className="text-sm text-amber-800">{t('apiKeyWarning')}</p>
        </div>
      </div>

      {/* Header */}
      <div className="page-header">
        <div>
          <p className="page-subtitle">
            {t('apiKeysSubtitle')}
            <Tooltip title={t('apiKeysHelp')}>
              <QuestionCircleOutlined className="text-gray-400 cursor-help ml-2" />
            </Tooltip>
          </p>
        </div>
        <Button onClick={() => setShowCreateModal(true)}>
          <PlusOutlined style={{ marginRight: 8 }} />
          {t('createApiKey')}
        </Button>
      </div>

      {/* Key cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {keys.map((apiKey) => (
          <div key={apiKey.id} className="glass-card p-0">
            <div className="flex flex-col space-y-1.5 p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <KeyOutlined style={{ fontSize: 20, color: '#2563eb' }} />
                  <div>
                    <h3 className="text-base font-semibold leading-none tracking-tight text-lg">{apiKey.name}</h3>
                    <p className="text-sm text-gray-400 mt-1">{apiKey.key_prefix}...</p>
                  </div>
                </div>
                <Tag color={apiKey.is_active ? 'green' : 'default'}>
                  {apiKey.is_active ? tStatuses('active') : tStatuses('inactive')}
                </Tag>
              </div>
            </div>
            <div className="p-6 pt-0 space-y-3">
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <span>{tFields('created')}: {new Date(apiKey.created_at).toLocaleDateString()}</span>
              </div>
              <div className="text-sm text-gray-600">
                <span>{t('lastUsed')}: {apiKey.last_used_at ? new Date(apiKey.last_used_at).toLocaleDateString() : t('neverUsed')}</span>
              </div>
              {apiKey.is_active && (
                <div className="flex gap-2 pt-2">
                  <Button size="small" type="primary" danger onClick={() => handleRevoke(apiKey.id)}>
                    <DeleteOutlined style={{ marginRight: 4 }} />
                    {t('revokeKey')}
                  </Button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Empty state */}
      {keys.length === 0 && (
        <div className="glass-card py-12 flex flex-col items-center justify-center">
          <EmptyStateCharacter height={115} variant="setup" />
          <p className="mt-4 text-lg font-medium text-gray-700">{t('noApiKeysYet')}</p>
          <p className="text-sm text-gray-500">{t('noApiKeysDescription')}</p>
          <Button onClick={() => setShowCreateModal(true)} className="mt-4">
            <PlusOutlined style={{ marginRight: 8 }} />
            {t('createApiKey')}
          </Button>
        </div>
      )}

      {/* Create key modal */}
      <Modal
        title={t('createApiKey')}
        open={showCreateModal}
        onOk={handleCreate}
        onCancel={() => { setShowCreateModal(false); setNewKeyName(''); }}
        okText={tActions('create')}
        cancelText={tActions('cancel')}
        okButtonProps={{ disabled: !newKeyName.trim() || creating }}
        confirmLoading={creating}
      >
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">{t('apiKeyName')}</label>
            <Input
              value={newKeyName}
              onChange={(e) => setNewKeyName(e.target.value)}
              placeholder={t('apiKeyNameHint')}
              onPressEnter={() => { if (newKeyName.trim()) handleCreate(); }}
            />
          </div>
        </div>
      </Modal>

      {/* Created key display modal */}
      <Modal
        title={t('apiKeyCreated')}
        open={!!createdKey}
        footer={[
          <Button key="done" type="primary" onClick={() => setCreatedKey(null)}>
            {tActions('done')}
          </Button>,
        ]}
        onCancel={() => setCreatedKey(null)}
        closable={false}
      >
        <div className="space-y-4 py-4">
          <div className="flex items-start gap-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
            <WarningOutlined style={{ fontSize: 16, color: '#d97706', marginTop: 2 }} />
            <p className="text-sm text-amber-800">{t('showKeyOnce')}</p>
          </div>
          {createdKey && (
            <Typography.Paragraph
              copyable={{
                icon: [<CopyOutlined key="copy" />, <CopyOutlined key="copied" />],
                tooltips: [t('copyKey'), t('keyCopied')],
              }}
              className="bg-gray-100 p-3 rounded-lg font-mono text-sm break-all"
            >
              {createdKey.key}
            </Typography.Paragraph>
          )}
        </div>
      </Modal>
    </div>
    </ProtectedRoute>
  );
}
