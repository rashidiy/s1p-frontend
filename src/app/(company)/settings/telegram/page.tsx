'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { Card, Switch, Button, Tag, Modal, Space, Typography, Divider, Input, Spin, Alert, Select } from 'antd';
import {
  LinkOutlined,
  DisconnectOutlined,
  CheckCircleOutlined,
  SaveOutlined,
  InfoCircleOutlined,
  LoadingOutlined,
  CopyOutlined,
  ExclamationCircleOutlined,
  RocketOutlined,
  ToolOutlined,
} from '@ant-design/icons';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { apiClient } from '@/lib/api';
import { useTranslations } from 'next-intl';
import { UserRole } from '@/types/api';
import type { TelegramConfig, UpdateTelegramConfig, TelegramSetupStatus } from '@/types/api';
import { toast } from 'sonner';
import { getErrorMessage } from '@/lib/utils';

const { Title, Text, Paragraph } = Typography;

const NOTIFICATION_TOGGLES: { key: keyof UpdateTelegramConfig; labelKey: string; descKey: string }[] = [
  { key: 'notify_completed_calls', labelKey: 'completedCalls', descKey: 'completedCallsDesc' },
  { key: 'notify_missed_calls', labelKey: 'missedCalls', descKey: 'missedCallsDesc' },
  { key: 'notify_new_leads', labelKey: 'newLeads', descKey: 'newLeadsDesc' },
  { key: 'notify_deal_stage_change', labelKey: 'dealStageChanges', descKey: 'dealStageChangesDesc' },
];

const V2_TOGGLES: { key: keyof UpdateTelegramConfig; labelKey: string; descKey: string }[] = [
  { key: 'send_recordings', labelKey: 'sendRecordings', descKey: 'sendRecordingsDesc' },
  { key: 'daily_digest', labelKey: 'dailyDigest', descKey: 'dailyDigestDesc' },
  { key: 'dm_notifications', labelKey: 'dmNotifications', descKey: 'dmNotificationsDesc' },
];

const LANGUAGE_OPTIONS = [
  { value: 'ru', label: 'Русский' },
  { value: 'en', label: 'English' },
  { value: 'uz', label: "O'zbek" },
];

export default function TelegramSettingsPage() {
  const [config, setConfig] = useState<TelegramConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [pendingChanges, setPendingChanges] = useState<UpdateTelegramConfig>({});
  const [hasChanges, setHasChanges] = useState(false);

  // Setup state
  const [setupMode, setSetupMode] = useState<'choose' | 'automatic' | 'manual'>('choose');
  const [companyNameInput, setCompanyNameInput] = useState('');
  const [chatIdInput, setChatIdInput] = useState('');
  const [setupLanguage, setSetupLanguage] = useState('ru');
  const [settingUp, setSettingUp] = useState(false);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pollCountRef = useRef(0);

  const t = useTranslations('settings');
  const tActions = useTranslations('actions');
  const tErrors = useTranslations('errors');
  const tCommon = useTranslations('common');
  const tFields = useTranslations('fields');

  useEffect(() => {
    fetchConfig();
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps -- load on mount only
  }, []);

  const fetchConfig = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await apiClient.getTelegramConfig();
      setConfig(data);
      setPendingChanges({});
      setHasChanges(false);

      // If setup is in progress, start polling
      if (data.setup_status === 'creating') {
        startPolling();
      }
    } catch (err: unknown) {
      // 404 = not configured yet — not an error
      if ((err as { response?: { status?: number } })?.response?.status === 404) {
        setConfig(null);
      } else {
        setError(getErrorMessage(err, tErrors('failedToLoadTelegramConfig')));
      }
    } finally {
      setLoading(false);
    }
  };

  const startPolling = useCallback(() => {
    if (pollRef.current) clearInterval(pollRef.current);
    pollCountRef.current = 0;

    pollRef.current = setInterval(async () => {
      pollCountRef.current++;
      // Timeout after 40 polls (2 minutes at 3s interval)
      if (pollCountRef.current > 40) {
        if (pollRef.current) clearInterval(pollRef.current);
        pollRef.current = null;
        toast.error(t('setupTimeout'));
        return;
      }

      try {
        const status = await apiClient.getTelegramSetupStatus();
        if (status.setup_status !== 'creating') {
          if (pollRef.current) clearInterval(pollRef.current);
          pollRef.current = null;
          setSettingUp(false);
          await fetchConfig();
        }
      } catch {
        // Ignore poll errors
      }
    }, 3000);
  // eslint-disable-next-line react-hooks/exhaustive-deps -- fetchConfig is intentionally excluded to avoid circular dependency
  }, [t]);

  const handleToggleChange = (key: keyof UpdateTelegramConfig, value: boolean) => {
    setPendingChanges(prev => ({ ...prev, [key]: value }));
    setHasChanges(true);
  };

  const handleLanguageChange = (value: string) => {
    setPendingChanges(prev => ({ ...prev, language: value }));
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

  const handleAutomaticSetup = async () => {
    if (!companyNameInput.trim()) {
      toast.error(t('companyNameRequired'));
      return;
    }
    try {
      setSettingUp(true);
      await apiClient.setupTelegram({
        company_name: companyNameInput.trim(),
        language: setupLanguage,
      });
      startPolling();
    } catch (err: unknown) {
      setSettingUp(false);
      if ((err as { response?: { status?: number } })?.response?.status === 503) {
        // Pyrogram not available — fall back to manual
        setSetupMode('manual');
        toast.error(t('setupManualDesc'));
      } else {
        toast.error(getErrorMessage(err, tErrors('failedToConnectTelegram')));
      }
    }
  };

  const handleManualSetup = async () => {
    const trimmed = chatIdInput.trim();
    if (!trimmed) {
      toast.error(t('enterChatId'));
      return;
    }
    try {
      setSettingUp(true);
      await apiClient.manualSetupTelegram(trimmed);
      await fetchConfig();
      toast.success(t('telegramConnected'));
    } catch (err) {
      toast.error(getErrorMessage(err, tErrors('failedToConnectTelegram')));
    } finally {
      setSettingUp(false);
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
          setConfig(null);
          setSetupMode('choose');
          toast.success(t('telegramDisconnected'));
        } catch (err) {
          toast.error(getErrorMessage(err, tErrors('failedToDisconnectTelegram')));
        }
      },
    });
  };

  const handleCopyInviteLink = () => {
    if (config?.invite_link) {
      navigator.clipboard.writeText(config.invite_link);
      toast.success(t('inviteLinkCopied'));
    }
  };

  const getToggleValue = (key: keyof UpdateTelegramConfig): boolean => {
    if (key in pendingChanges) {
      return pendingChanges[key] as boolean;
    }
    if (config) {
      return config[key as keyof TelegramConfig] as boolean;
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

  const setupStatus = config?.setup_status || 'not_started';
  const isReady = setupStatus === 'ready' || setupStatus === 'manual';
  const isCreating = setupStatus === 'creating' || settingUp;
  const isFailed = setupStatus === 'failed';
  const isConnected = isReady || (config?.chat_id != null);

  return (
    <ProtectedRoute requireRole={UserRole.COMPANY_ADMIN}>
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="page-header">
          <div>
            <p className="page-subtitle">{t('telegramSubtitle')}</p>
          </div>
        </div>

        {/* ===== CREATING STATE ===== */}
        {isCreating && (
          <Card>
            <div style={{ textAlign: 'center', padding: '40px 20px' }}>
              <Spin indicator={<LoadingOutlined style={{ fontSize: 48 }} spin />} />
              <Title level={4} style={{ marginTop: 24 }}>{t('setupCreating')}</Title>
              <Paragraph type="secondary">{t('setupCreatingDesc')}</Paragraph>
            </div>
          </Card>
        )}

        {/* ===== FAILED STATE ===== */}
        {isFailed && !isCreating && (
          <Card>
            <Alert
              type="error"
              showIcon
              icon={<ExclamationCircleOutlined />}
              message={t('setupFailed')}
              description={config?.setup_error || ''}
              action={
                <Space direction="vertical">
                  <Button type="primary" onClick={() => { setSetupMode('choose'); setConfig(prev => prev ? { ...prev, setup_status: 'not_started' } : null); }}>
                    {t('setupRetry')}
                  </Button>
                  <Button onClick={() => setSetupMode('manual')}>
                    {t('setupManual')}
                  </Button>
                </Space>
              }
            />
          </Card>
        )}

        {/* ===== NOT CONNECTED — SETUP WIZARD ===== */}
        {!isConnected && !isCreating && !isFailed && (
          <>
            {setupMode === 'choose' && (
              <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                <Card>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                    <Tag color="default">{t('notConnected')}</Tag>
                  </div>
                  <Title level={5} style={{ marginTop: 0 }}>
                    <InfoCircleOutlined /> {t('connectTelegram')}
                  </Title>
                  <Paragraph type="secondary">{t('setupInstructions')}</Paragraph>
                </Card>

                <Card
                  hoverable
                  onClick={() => setSetupMode('automatic')}
                  style={{ cursor: 'pointer' }}
                >
                  <Space>
                    <RocketOutlined style={{ fontSize: 24, color: 'var(--ant-color-primary)' }} />
                    <div>
                      <Text strong>{t('setupAutomatic')}</Text>
                      <br />
                      <Text type="secondary" style={{ fontSize: 13 }}>{t('setupAutomaticDesc')}</Text>
                    </div>
                  </Space>
                </Card>

                <Card
                  hoverable
                  onClick={() => setSetupMode('manual')}
                  style={{ cursor: 'pointer' }}
                >
                  <Space>
                    <ToolOutlined style={{ fontSize: 24, color: 'var(--ant-color-primary)' }} />
                    <div>
                      <Text strong>{t('setupManual')}</Text>
                      <br />
                      <Text type="secondary" style={{ fontSize: 13 }}>{t('setupManualDesc')}</Text>
                    </div>
                  </Space>
                </Card>
              </Space>
            )}

            {setupMode === 'automatic' && (
              <Card>
                <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                  <Title level={5} style={{ marginTop: 0 }}>
                    <RocketOutlined /> {t('setupAutomatic')}
                  </Title>

                  <div>
                    <Text strong style={{ display: 'block', marginBottom: 8 }}>{t('companyName')}</Text>
                    <Input
                      placeholder={t('companyName')}
                      value={companyNameInput}
                      onChange={e => setCompanyNameInput(e.target.value)}
                    />
                  </div>

                  <div>
                    <Text strong style={{ display: 'block', marginBottom: 8 }}>{t('notificationLanguage')}</Text>
                    <Select
                      value={setupLanguage}
                      onChange={setSetupLanguage}
                      options={LANGUAGE_OPTIONS}
                      style={{ width: 200 }}
                    />
                  </div>

                  <Space>
                    <Button type="primary" icon={<RocketOutlined />} onClick={handleAutomaticSetup} loading={settingUp}>
                      {t('setupAutomatic')}
                    </Button>
                    <Button onClick={() => setSetupMode('choose')}>{tActions('cancel')}</Button>
                  </Space>
                </Space>
              </Card>
            )}

            {setupMode === 'manual' && (
              <Card>
                <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                  <Title level={5} style={{ marginTop: 0 }}>
                    <ToolOutlined /> {t('setupManual')}
                  </Title>

                  <Paragraph type="secondary">{t('setupInstructions')}</Paragraph>
                  <ol style={{ paddingLeft: 20, color: 'var(--text-secondary)', lineHeight: '2' }}>
                    <li>{t('setupStep1')}</li>
                    <li>{t('setupStep2')}</li>
                    <li>{t('setupStep3')}</li>
                    <li>{t('setupStep4')}</li>
                  </ol>

                  <div>
                    <Text strong style={{ display: 'block', marginBottom: 8 }}>{tFields('chatId')}</Text>
                    <Space.Compact style={{ width: '100%' }}>
                      <Input
                        placeholder={t('enterChatId')}
                        value={chatIdInput}
                        onChange={e => setChatIdInput(e.target.value)}
                        onPressEnter={handleManualSetup}
                        disabled={settingUp}
                      />
                      <Button type="primary" icon={<LinkOutlined />} loading={settingUp} onClick={handleManualSetup}>
                        {tActions('connect')}
                      </Button>
                    </Space.Compact>
                  </div>

                  <Button onClick={() => setSetupMode('choose')}>{tActions('cancel')}</Button>
                </Space>
              </Card>
            )}
          </>
        )}

        {/* ===== CONNECTED STATE ===== */}
        {isConnected && !isCreating && (
          <Space direction="vertical" size="middle" style={{ width: '100%' }}>
            {/* Connection Status */}
            <Card>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Space>
                  <Tag icon={<CheckCircleOutlined />} color="success">
                    {t('setupReady')}
                  </Tag>
                  {config?.group_name && (
                    <Text type="secondary">{config.group_name}</Text>
                  )}
                  {!config?.group_name && config?.chat_id && (
                    <Text type="secondary">
                      {tFields('chatId')}: <Text code>{config.chat_id}</Text>
                    </Text>
                  )}
                </Space>
                <Button danger icon={<DisconnectOutlined />} onClick={handleDisconnect}>
                  {tActions('disconnect')}
                </Button>
              </div>
            </Card>

            {/* Invite Link */}
            {config?.invite_link && (
              <Card>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <Text strong>{t('inviteLink')}</Text>
                    <br />
                    <Text type="secondary" style={{ fontSize: 13 }}>{t('inviteLinkDesc')}</Text>
                  </div>
                  <Button icon={<CopyOutlined />} onClick={handleCopyInviteLink}>
                    {t('copyInviteLink')}
                  </Button>
                </div>
              </Card>
            )}

            {/* Bot Toggle */}
            <Card>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <Text strong>{t('botEnabled')}</Text>
                  <br />
                  <Text type="secondary" style={{ fontSize: 13 }}>{t('botEnabledDescription')}</Text>
                </div>
                <Switch
                  checked={getToggleValue('bot_enabled')}
                  onChange={checked => handleToggleChange('bot_enabled', checked)}
                />
              </div>
            </Card>

            {/* Language */}
            <Card>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <Text strong>{t('notificationLanguage')}</Text>
                  <br />
                  <Text type="secondary" style={{ fontSize: 13 }}>{t('notificationLanguageDesc')}</Text>
                </div>
                <Select
                  value={pendingChanges.language || config?.language || 'ru'}
                  onChange={handleLanguageChange}
                  options={LANGUAGE_OPTIONS}
                  style={{ width: 160 }}
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
                        <Text type="secondary" style={{ fontSize: 13 }}>{t(toggle.descKey)}</Text>
                      </div>
                      <Switch
                        checked={getToggleValue(toggle.key)}
                        onChange={checked => handleToggleChange(toggle.key, checked)}
                        disabled={!getToggleValue('bot_enabled')}
                      />
                    </div>
                  </div>
                ))}
              </Space>
            </Card>

            {/* V2 Feature Toggles */}
            <Card title={t('advancedFeatures')}>
              <Space direction="vertical" size={0} style={{ width: '100%' }}>
                {V2_TOGGLES.map((toggle, index) => (
                  <div key={toggle.key}>
                    {index > 0 && <Divider style={{ margin: '12px 0' }} />}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <Text strong>{t(toggle.labelKey)}</Text>
                        <br />
                        <Text type="secondary" style={{ fontSize: 13 }}>{t(toggle.descKey)}</Text>
                      </div>
                      <Switch
                        checked={getToggleValue(toggle.key)}
                        onChange={checked => handleToggleChange(toggle.key, checked)}
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
                <Button type="primary" icon={<SaveOutlined />} loading={saving} onClick={handleSave} size="large">
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
