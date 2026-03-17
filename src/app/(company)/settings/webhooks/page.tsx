'use client';

import { useEffect, useState } from 'react';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SaveOutlined,
  CloseOutlined,
  ArrowLeftOutlined,
  ApiOutlined,
  DownOutlined,
  UpOutlined,
  QuestionCircleOutlined,
} from '@ant-design/icons';
import { Button, Input, Switch, Tag, Modal, Table, Tooltip, message } from 'antd';
import { apiClient } from '@/lib/api';
import { useTranslations } from 'next-intl';
import { EmptyStateCharacter, ErrorCharacter } from '@/components/illustrations';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import Link from 'next/link';
import type {
  WebhookEndpointResponse,
  WebhookDeliveryResponse,
} from '@/types/api';
import { UserRole } from '@/types/api';

const EVENT_LABELS: Record<string, string> = {
  'call.completed': 'eventCallCompleted',
  'call.missed': 'eventCallMissed',
  'lead.created': 'eventLeadCreated',
  'deal.stage_changed': 'eventDealStageChanged',
  'contact.created': 'eventContactCreated',
};

const EVENT_COLORS: Record<string, string> = {
  'call.completed': 'green',
  'call.missed': 'red',
  'lead.created': 'blue',
  'deal.stage_changed': 'orange',
  'contact.created': 'purple',
};

export default function WebhooksPage() {
  const [endpoints, setEndpoints] = useState<WebhookEndpointResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    url: '',
    events: [] as string[],
    secret: '',
    is_active: true,
  });
  const [saving, setSaving] = useState(false);
  const [expandedEndpoint, setExpandedEndpoint] = useState<string | null>(null);
  const [deliveries, setDeliveries] = useState<WebhookDeliveryResponse[]>([]);
  const [deliveriesLoading, setDeliveriesLoading] = useState(false);

  const t = useTranslations('settings');
  const tActions = useTranslations('actions');
  const tErrors = useTranslations('errors');
  const tCommon = useTranslations('common');
  const tFields = useTranslations('fields');

  useEffect(() => {
    loadData();
  // eslint-disable-next-line react-hooks/exhaustive-deps -- load on mount only
  }, []);

  const loadData = async () => {
    setError(false);
    try {
      const data = await apiClient.getWebhookEndpoints();
      setEndpoints(data.items);
    } catch (error) {
      console.error('Failed to load webhook endpoints:', error);
      setError(true);
      message.error(tErrors('failedToLoadWebhooks'));
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingId(null);
    setFormData({ url: '', events: [], secret: '', is_active: true });
    setShowForm(true);
  };

  const handleEdit = (endpoint: WebhookEndpointResponse) => {
    setEditingId(endpoint.id);
    setFormData({
      url: endpoint.url,
      events: endpoint.events,
      secret: '',
      is_active: endpoint.is_active,
    });
    setShowForm(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (editingId) {
        await apiClient.updateWebhookEndpoint(editingId, {
          url: formData.url,
          events: formData.events,
          secret: formData.secret || undefined,
          is_active: formData.is_active,
        });
        message.success(t('endpointUpdated'));
      } else {
        await apiClient.createWebhookEndpoint({
          url: formData.url,
          events: formData.events,
          secret: formData.secret,
        });
        message.success(t('endpointCreated'));
      }
      setShowForm(false);
      loadData();
    } catch (error) {
      console.error('Failed to save webhook endpoint:', error);
      message.error(tErrors('failedToSaveWebhook'));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (endpointId: string) => {
    Modal.confirm({
      title: tCommon('areYouSure'),
      content: t('confirmDeleteEndpoint'),
      okText: tActions('delete'),
      cancelText: tActions('cancel'),
      okButtonProps: { danger: true },
      onOk: async () => {
        try {
          await apiClient.deleteWebhookEndpoint(endpointId);
          message.success(t('endpointDeleted'));
          loadData();
        } catch (error) {
          console.error('Failed to delete webhook endpoint:', error);
          message.error(tErrors('failedToDeleteWebhook'));
        }
      },
    });
  };

  const handleToggleActive = async (endpoint: WebhookEndpointResponse) => {
    try {
      await apiClient.updateWebhookEndpoint(endpoint.id, {
        is_active: !endpoint.is_active,
      });
      loadData();
    } catch (error) {
      console.error('Failed to toggle webhook endpoint:', error);
      message.error(tErrors('failedToSaveWebhook'));
    }
  };

  const toggleEvent = (event: string) => {
    setFormData((prev) => ({
      ...prev,
      events: prev.events.includes(event)
        ? prev.events.filter((e) => e !== event)
        : [...prev.events, event],
    }));
  };

  const handleExpandDeliveries = async (endpointId: string) => {
    if (expandedEndpoint === endpointId) {
      setExpandedEndpoint(null);
      setDeliveries([]);
      return;
    }
    setExpandedEndpoint(endpointId);
    setDeliveriesLoading(true);
    try {
      const data = await apiClient.getWebhookDeliveries(endpointId);
      setDeliveries(data.items);
    } catch (error) {
      console.error('Failed to load deliveries:', error);
      message.error(tErrors('failedToLoadDeliveries'));
    } finally {
      setDeliveriesLoading(false);
    }
  };

  const deliveryColumns = [
    {
      title: tFields('event_type') || 'Event',
      dataIndex: 'event_type',
      key: 'event_type',
      render: (event: string) => (
        <Tag color={EVENT_COLORS[event] || 'default'}>
          {EVENT_LABELS[event] ? t(EVENT_LABELS[event]) : event}
        </Tag>
      ),
    },
    {
      title: t('deliveryStatus'),
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const color = status === 'success' ? 'green' : status === 'failed' ? 'red' : 'yellow';
        return <Tag color={color}>{status}</Tag>;
      },
    },
    {
      title: t('deliveryAttempts'),
      dataIndex: 'attempts',
      key: 'attempts',
    },
    {
      title: t('deliveryResponseCode'),
      dataIndex: 'response_code',
      key: 'response_code',
    },
    {
      title: tFields('created_at') || 'Created',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (date: string) => new Date(date).toLocaleString(),
    },
  ];

  if (error) {
    return (
      <ProtectedRoute requireRole={UserRole.COMPANY_ADMIN}>
        <div className="glass-card py-16 flex flex-col items-center justify-center">
          <ErrorCharacter height={115} />
          <h3 className="mt-5 text-lg font-semibold text-gray-800">{tErrors('somethingWentWrong')}</h3>
          <p className="text-sm text-gray-400 mt-1">{tErrors('tryAgainLater')}</p>
          <Button type="primary" className="mt-4" onClick={() => { setError(false); setLoading(true); loadData(); }}>
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
                <div className="h-5 w-64 bg-gray-100 rounded animate-pulse" />
                <div className="flex gap-2">
                  <div className="h-7 w-7 bg-gray-50 rounded animate-pulse" />
                  <div className="h-7 w-7 bg-gray-50 rounded animate-pulse" />
                </div>
              </div>
              <div className="flex gap-2">
                {[1, 2, 3].map((j) => (
                  <div key={j} className="h-5 w-24 bg-gray-50 rounded animate-pulse" />
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
      <div className="page-header">
        <div>
          <p className="page-subtitle">
            {t('webhooksSubtitle')}
            <Tooltip title={t('webhooksHelp')}>
              <QuestionCircleOutlined className="text-gray-400 cursor-help ml-2" />
            </Tooltip>
          </p>
        </div>
        <Button onClick={handleCreate}>
          <PlusOutlined style={{ marginRight: 8 }} />
          {t('addEndpoint')}
        </Button>
      </div>

      {showForm && (
        <div className="glass-card p-0">
          <div className="flex flex-col space-y-1.5 p-6">
            <h3 className="text-base font-semibold leading-none tracking-tight">
              {editingId ? t('editEndpoint') : t('addEndpoint')}
            </h3>
          </div>
          <div className="p-6 pt-0 space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">{t('endpointUrl')}</label>
              <Input
                value={formData.url}
                onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                placeholder={t('endpointUrlHint')}
                required
              />
            </div>

            <div className="space-y-3">
              <label className="text-sm font-medium">{t('endpointEvents')}</label>
              <div className="flex flex-wrap gap-2">
                {Object.entries(EVENT_LABELS).map(([event, labelKey]) => (
                  <label
                    key={event}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md border cursor-pointer text-sm transition-colors ${
                      formData.events.includes(event)
                        ? 'bg-primary text-primary-foreground border-primary'
                        : 'hover:bg-gray-50'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={formData.events.includes(event)}
                      onChange={() => toggleEvent(event)}
                      className="sr-only"
                    />
                    {t(labelKey)}
                  </label>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">{t('endpointSecret')}</label>
              <Input.Password
                value={formData.secret}
                onChange={(e) => setFormData({ ...formData, secret: e.target.value })}
                placeholder={t('endpointSecretHint')}
              />
            </div>

            {editingId && (
              <div className="flex items-center gap-3">
                <label className="text-sm font-medium">{t('endpointActive')}</label>
                <Switch
                  checked={formData.is_active}
                  onChange={(checked) => setFormData({ ...formData, is_active: checked })}
                />
              </div>
            )}

            <div className="flex gap-2">
              <Button onClick={handleSave} disabled={saving || !formData.url || formData.events.length === 0}>
                <SaveOutlined style={{ marginRight: 8 }} />
                {saving ? tActions('saving') : tActions('save')}
              </Button>
              <Button type="default" onClick={() => setShowForm(false)}>
                <CloseOutlined style={{ marginRight: 8 }} />
                {tActions('cancel')}
              </Button>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {endpoints.map((endpoint) => (
          <div key={endpoint.id} className="glass-card p-0">
            <div className="flex flex-col space-y-1.5 p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <ApiOutlined style={{ fontSize: 20, color: '#2563eb' }} />
                  <div>
                    <h3 className="text-base font-semibold leading-none tracking-tight">{endpoint.url}</h3>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Tag color={endpoint.is_active ? 'green' : 'default'}>
                    {endpoint.is_active ? tCommon('active') || 'Active' : tCommon('inactive') || 'Inactive'}
                  </Tag>
                  <Switch
                    size="small"
                    checked={endpoint.is_active}
                    onChange={() => handleToggleActive(endpoint)}
                  />
                </div>
              </div>
            </div>
            <div className="p-6 pt-0 space-y-3">
              <div className="flex flex-wrap gap-1">
                {endpoint.events.map((event) => (
                  <Tag key={event} color={EVENT_COLORS[event] || 'default'}>
                    {EVENT_LABELS[event] ? t(EVENT_LABELS[event]) : event}
                  </Tag>
                ))}
              </div>
              <div className="flex gap-2 pt-2">
                <Button size="small" type="default" onClick={() => handleEdit(endpoint)}>
                  <EditOutlined style={{ marginRight: 4 }} />
                  {tActions('edit')}
                </Button>
                <Button size="small" type="primary" danger onClick={() => handleDelete(endpoint.id)}>
                  <DeleteOutlined style={{ marginRight: 4 }} />
                  {tActions('delete')}
                </Button>
                <Button
                  size="small"
                  type="default"
                  onClick={() => handleExpandDeliveries(endpoint.id)}
                >
                  {expandedEndpoint === endpoint.id ? (
                    <UpOutlined style={{ marginRight: 4 }} />
                  ) : (
                    <DownOutlined style={{ marginRight: 4 }} />
                  )}
                  {t('deliveryLog')}
                </Button>
              </div>
              {expandedEndpoint === endpoint.id && (
                <div className="pt-3 border-t mt-3">
                  <Table
                    dataSource={deliveries}
                    columns={deliveryColumns}
                    rowKey="id"
                    loading={deliveriesLoading}
                    size="small"
                    pagination={{ pageSize: 10 }}
                    locale={{
                      emptyText: t('noDeliveries'),
                    }}
                  />
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {endpoints.length === 0 && !showForm && (
        <div className="glass-card py-12 flex flex-col items-center justify-center">
          <EmptyStateCharacter height={115} variant="setup" />
          <p className="mt-4 text-lg font-medium text-gray-700">{t('noEndpointsYet')}</p>
          <p className="text-sm text-gray-500">{t('noEndpointsDescription')}</p>
          <Button onClick={handleCreate} className="mt-4">
            <PlusOutlined style={{ marginRight: 8 }} />
            {t('addEndpoint')}
          </Button>
        </div>
      )}
    </div>
    </ProtectedRoute>
  );
}
