'use client';

import { useEffect, useState } from 'react';
import { Card, Switch, Button, Tag, Modal, Space, Typography, Divider, Input, Spin, Alert } from 'antd';
import {
  SendOutlined,
  LinkOutlined,
  DisconnectOutlined,
  CheckCircleOutlined,
  SaveOutlined,
  InfoCircleOutlined,
} from '@ant-design/icons';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { apiClient } from '@/lib/api';
import { useTranslations } from 'next-intl';
import { UserRole } from '@/types/api';
import type { TelegramConfig, UpdateTelegramConfig } from '@/types/api';
import { toast } from 'sonner';
import { getErrorMessage } from '@/lib/utils';

const { Title, Text, Paragraph } = Typography;

const NOTIFICATION_TOGGLES: { key: keyof UpdateTelegramConfig; labelKey: string; descKey: string }[] = [
  { key: 'notify_completed_calls', labelKey: 'completedCalls', descKey: 'completedCallsDesc' },
  { key: 'notify_missed_calls', labelKey: 'missedCalls', descKey: 'missedCallsDesc' },
  { key: 'notify_new_leads', labelKey: 'newLeads', descKey: 'newLeadsDesc' },
  { key: 'notify_deal_stage_change', labelKey: 'dealStageChanges', descKey: 'dealStageChangesDesc' },
];

export default function TelegramSettingsPage() {
  const [config, setConfig] = useState<TelegramConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [chatIdInput, setChatIdInput] = useState('');
  const [pendingChanges, setPendingChanges] = useState<UpdateTelegramConfig>({});
  const [hasChanges, setHasChanges] = useState(false);
  const t = useTranslations('settings');
  const tActions = useTranslations('actions');
  const tErrors = useTranslations('errors');
  const tCommon = useTranslations('common');
  const tFields = useTranslations('fields');

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await apiClient.getTelegramConfig();
      setConfig(data);
      setPendingChanges({});
      setHasChanges(false);
    } catch (err) {
      setError(getErrorMessage(err, tErrors('failedToLoadTelegramConfig')));
    } finally {
      setLoading(false);
    }
  };

  const handleToggleChange = (key: keyof UpdateTelegramConfig, value: boolean) => {
    const updated = { ...pendingChanges, [key]: value };
    setPendingChanges(updated);
    setHasChanges(true);
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const data = await apiClient.updateTelegramConfig(pendingChanges);
      setConfig(data);
      setPendingChanges({});
      setHasChanges(false);
      toast.success(t('settingsSaved'));
    } catch (err) {
      toast.error(getErrorMessage(err, tErrors('failedToSaveSettings')));
    } finally {
      setSaving(false);
    }
  };

  const handleConnect = async () => {
    const trimmed = chatIdInput.trim();
    if (!trimmed) {
      toast.error(t('enterChatId'));
      return;
    }
    try {
      setConnecting(true);
      const data = await apiClient.connectTelegram(trimmed);
      setConfig(data);
      setChatIdInput('');
      toast.success(t('telegramConnected'));
    } catch (err) {
      toast.error(getErrorMessage(err, tErrors('failedToConnectTelegram')));
    } finally {
      setConnecting(false);
    }
  };

  const handleDisconnect = () => {
    Modal.confirm({
      title: t('disconnectTelegram'),
      content: t('confirmDisconnect'),
      okText: tActions('disconnect'),
      okButtonProps: { danger: true },
      cancelText: tActions('cancel'),
      onOk: async () => {
        try {
          await apiClient.disconnectTelegram();
          await fetchConfig();
          toast.success(t('telegramDisconnected'));
        } catch (err) {
          toast.error(getErrorMessage(err, tErrors('failedToDisconnectTelegram')));
        }
      },
    });
  };

  const getToggleValue = (key: keyof UpdateTelegramConfig): boolean => {
    if (key in pendingChanges) {
      return pendingChanges[key] as boolean;
    }
    if (config) {
      return config[key] as boolean;
    }
    return false;
  };

  if (loading) {
    return (
      <ProtectedRoute requireRole={UserRole.COMPANY_ADMIN}>
        <div style={{ textAlign: 'center', padding: '60px' }}>
          <Spin size="large" />
        </div>
      </ProtectedRoute>
    );
  }

  if (error) {
    return (
      <ProtectedRoute requireRole={UserRole.COMPANY_ADMIN}>
        <div className="max-w-3xl mx-auto space-y-6">
          <div className="page-header">
            <div>
              <p className="page-subtitle">{t('telegramSubtitle')}</p>
            </div>
          </div>
          <Alert
            type="error"
            message={tCommon('somethingWentWrong')}
            description={error}
            showIcon
            action={
              <Button size="small" onClick={fetchConfig}>
                {tCommon('tryAgain')}
              </Button>
            }
          />
        </div>
      </ProtectedRoute>
    );
  }

  const isConnected = config?.chat_id != null;

  return (
    <ProtectedRoute requireRole={UserRole.COMPANY_ADMIN}>
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="page-header">
          <div>
            <p className="page-subtitle">{t('telegramSubtitle')}</p>
          </div>
        </div>

        {!isConnected ? (
          /* ===== NOT CONNECTED STATE ===== */
          <Card>
            <Space direction="vertical" size="middle" style={{ width: '100%' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Tag color="default">{t('notConnected')}</Tag>
              </div>

              <Divider style={{ margin: '4px 0' }} />

              <div>
                <Title level={5} style={{ marginTop: 0 }}>
                  <InfoCircleOutlined /> {t('connectTelegram')}
                </Title>
                <Paragraph type="secondary" style={{ marginBottom: 4 }}>
                  {t('setupInstructions')}
                </Paragraph>
                <ol style={{ paddingLeft: 20, color: 'var(--text-secondary)', lineHeight: '2' }}>
                  <li>{t('setupStep1')}</li>
                  <li>{t('setupStep2')}</li>
                  <li>{t('setupStep3')}</li>
                  <li>{t('setupStep4')}</li>
                </ol>
              </div>

              <Divider style={{ margin: '4px 0' }} />

              <div>
                <Text strong style={{ display: 'block', marginBottom: 8 }}>
                  {tFields('chatId')}
                </Text>
                <Space.Compact style={{ width: '100%' }}>
                  <Input
                    placeholder={t('enterChatId')}
                    value={chatIdInput}
                    onChange={(e) => setChatIdInput(e.target.value)}
                    onPressEnter={handleConnect}
                    disabled={connecting}
                  />
                  <Button
                    type="primary"
                    icon={<LinkOutlined />}
                    loading={connecting}
                    onClick={handleConnect}
                  >
                    {tActions('connect')}
                  </Button>
                </Space.Compact>
              </div>
            </Space>
          </Card>
        ) : (
          /* ===== CONNECTED STATE ===== */
          <Space direction="vertical" size="middle" style={{ width: '100%' }}>
            {/* Connection Status */}
            <Card>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Space>
                  <Tag icon={<CheckCircleOutlined />} color="success">
                    {t('connected')}
                  </Tag>
                  <Text type="secondary">
                    {tFields('chatId')}: <Text code>{config.chat_id}</Text>
                  </Text>
                </Space>
                <Button
                  danger
                  icon={<DisconnectOutlined />}
                  onClick={handleDisconnect}
                >
                  {tActions('disconnect')}
                </Button>
              </div>
            </Card>

            {/* Bot Toggle */}
            <Card>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <Text strong>{t('botEnabled')}</Text>
                  <br />
                  <Text type="secondary" style={{ fontSize: 13 }}>
                    {t('botEnabledDescription')}
                  </Text>
                </div>
                <Switch
                  checked={getToggleValue('bot_enabled')}
                  onChange={(checked) => handleToggleChange('bot_enabled', checked)}
                />
              </div>
            </Card>

            {/* Notification Preferences */}
            <Card title={t('notifications')}>
              <Space direction="vertical" size={0} style={{ width: '100%' }}>
                {NOTIFICATION_TOGGLES.map((toggle, index) => (
                  <div key={toggle.key}>
                    {index > 0 && <Divider style={{ margin: '12px 0' }} />}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <Text strong>{t(toggle.labelKey)}</Text>
                        <br />
                        <Text type="secondary" style={{ fontSize: 13 }}>
                          {t(toggle.descKey)}
                        </Text>
                      </div>
                      <Switch
                        checked={getToggleValue(toggle.key)}
                        onChange={(checked) => handleToggleChange(toggle.key, checked)}
                        disabled={!getToggleValue('bot_enabled')}
                      />
                    </div>
                  </div>
                ))}
              </Space>
            </Card>

            {/* Save Button */}
            {hasChanges && (
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <Button
                  type="primary"
                  icon={<SaveOutlined />}
                  loading={saving}
                  onClick={handleSave}
                  size="large"
                >
                  {tActions('saveChanges')}
                </Button>
              </div>
            )}
          </Space>
        )}
      </div>
    </ProtectedRoute>
  );
}
