'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { Card, Button, Tag, Modal, Space, Typography, Input, Spin, Alert, message } from 'antd';
import {
  ArrowLeftOutlined,
  DisconnectOutlined,
  CheckCircleOutlined,
  InfoCircleOutlined,
  LoadingOutlined,
  CopyOutlined,
  ExclamationCircleOutlined,
  RocketOutlined,
  ToolOutlined,
  LockOutlined,
} from '@ant-design/icons';
import Link from 'next/link';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { apiClient } from '@/lib/api';
import { useTranslations } from 'next-intl';
import { UserRole } from '@/types/api';
import type { SipuniSetupStatus, SipuniConfig } from '@/types/api';
import { getErrorMessage } from '@/lib/utils';

const { Title, Text, Paragraph } = Typography;

export default function SipuniSettingsPage() {
  const [config, setConfig] = useState<SipuniConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [setupError, setSetupError] = useState<string | null>(null);

  // Setup state
  const [setupMode, setSetupMode] = useState<'choose' | 'automatic' | 'manual'>('choose');
  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [cabinetIdInput, setCabinetIdInput] = useState('');
  const [securityKeyInput, setSecurityKeyInput] = useState('');
  const [settingUp, setSettingUp] = useState(false);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pollCountRef = useRef(0);

  const t = useTranslations('settings');
  const tActions = useTranslations('actions');
  const tErrors = useTranslations('errors');
  const tCommon = useTranslations('common');

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
      const data = await apiClient.getSipuniConfig();
      setConfig(data);

      // If setup is in progress, start polling
      if (data.setup_status === 'setting_up') {
        startPolling();
      }

      // If setup failed, fetch the error details
      if (data.setup_status === 'failed') {
        try {
          const status = await apiClient.getSipuniSetupStatus();
          setSetupError(status.setup_error);
        } catch {
          // Ignore — config already shows the status
        }
      } else {
        setSetupError(null);
      }
    } catch (err: unknown) {
      // 400 = not a Sipuni company — show clean message instead of error
      const status = (err as { response?: { status?: number } })?.response?.status;
      if (status === 400) {
        setError(tErrors('accessDeniedDetail'));
      } else {
        setError(getErrorMessage(err, tErrors('failedToLoadSipuniConfig')));
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
        setSettingUp(false);
        message.error(t('sipuniSetupTimeout'));
        return;
      }

      try {
        const status = await apiClient.getSipuniSetupStatus();
        if (status.setup_status !== 'setting_up') {
          if (pollRef.current) clearInterval(pollRef.current);
          pollRef.current = null;
          setSettingUp(false);
          await fetchConfig();
        }
      } catch {
        // Ignore poll errors
      }
    }, 3000);
  // eslint-disable-next-line react-hooks/exhaustive-deps -- fetchConfig is intentionally excluded
  }, [t]);

  const handleAutomaticSetup = async () => {
    if (!emailInput.trim() || !passwordInput.trim()) {
      message.error(tErrors('fillAllFields'));
      return;
    }
    try {
      setSettingUp(true);
      await apiClient.setupSipuni({
        email: emailInput.trim(),
        password: passwordInput,
      });
      setPasswordInput('');
      setEmailInput('');
      startPolling();
    } catch (err: unknown) {
      setSettingUp(false);
      message.error(getErrorMessage(err, tErrors('failedToSaveSettings')));
    }
  };

  const handleManualSetup = async () => {
    if (!cabinetIdInput.trim() || !securityKeyInput.trim()) {
      message.error(tErrors('fillAllFields'));
      return;
    }
    try {
      setSettingUp(true);
      await apiClient.manualSetupSipuni({
        cabinet_id: cabinetIdInput.trim(),
        security_key: securityKeyInput.trim(),
      });
      await fetchConfig();
      message.success(t('sipuniConnectedStatus'));
    } catch (err) {
      message.error(getErrorMessage(err, tErrors('failedToSaveSettings')));
    } finally {
      setSettingUp(false);
    }
  };

  const handleDisconnect = () => {
    Modal.confirm({
      title: t('sipuniDisconnect'),
      content: t('sipuniConfirmDisconnect'),
      okText: tActions('disconnect'),
      okButtonProps: { danger: true },
      cancelText: tActions('cancel'),
      onOk: async () => {
        try {
          await apiClient.disconnectSipuni();
          setConfig(null);
          setSetupMode('choose');
          await fetchConfig();
          message.success(t('sipuniDisconnected'));
        } catch (err) {
          message.error(getErrorMessage(err, tErrors('failedToSaveSettings')));
        }
      },
    });
  };

  const handleCopyWebhookUrl = async () => {
    if (config?.webhook_url) {
      try {
        await navigator.clipboard.writeText(config.webhook_url);
        message.success(t('sipuniWebhookUrlCopied'));
      } catch {
        message.error(tErrors('somethingWentWrong'));
      }
    }
  };

  if (loading) {
    return (
      <ProtectedRoute requireRole={UserRole.COMPANY_ADMIN}>
        <div className="max-w-3xl mx-auto space-y-6">
          <div className="page-header">
            <div>
              <div className="h-4 w-64 bg-gray-100 rounded animate-pulse" />
            </div>
          </div>
          <div className="glass-card p-5">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="h-6 w-24 bg-gray-100 rounded animate-pulse" />
                <div className="h-4 w-32 bg-gray-50 rounded animate-pulse" />
              </div>
              <div className="h-8 w-28 bg-gray-100 rounded-lg animate-pulse" />
            </div>
          </div>
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
              <p className="page-subtitle">{t('sipuniSubtitle')}</p>
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
  const isReady = setupStatus === 'ready';
  const isSettingUp = setupStatus === 'setting_up' || settingUp;
  const isFailed = setupStatus === 'failed';
  const isConnected = config?.is_connected === true;

  return (
    <ProtectedRoute requireRole={UserRole.COMPANY_ADMIN}>
      <div className="max-w-3xl mx-auto space-y-6">
        <Link href="/settings">
          <Button type="text" icon={<ArrowLeftOutlined />} className="mb-2">
            {tCommon('backToSettings')}
          </Button>
        </Link>
        <div className="page-header">
          <div>
            <p className="page-subtitle">{t('sipuniSubtitle')}</p>
          </div>
        </div>

        {/* ===== SETTING UP STATE ===== */}
        {isSettingUp && (
          <Card>
            <div style={{ textAlign: 'center', padding: '40px 20px' }}>
              <Spin indicator={<LoadingOutlined style={{ fontSize: 48 }} spin />} />
              <Title level={4} style={{ marginTop: 24 }}>{t('sipuniSettingUp')}</Title>
              <Paragraph type="secondary">{t('sipuniSettingUpDesc')}</Paragraph>
            </div>
          </Card>
        )}

        {/* ===== FAILED STATE ===== */}
        {isFailed && !isSettingUp && setupMode === 'choose' && (
          <Card>
            <Alert
              type="error"
              showIcon
              icon={<ExclamationCircleOutlined />}
              message={t('sipuniSetupFailed')}
              description={setupError || ''}
              action={
                <Space direction="vertical">
                  <Button type="primary" onClick={() => setSetupMode('automatic')}>
                    {t('sipuniSetupRetry')}
                  </Button>
                  <Button onClick={() => setSetupMode('manual')}>
                    {t('sipuniManual')}
                  </Button>
                </Space>
              }
            />
          </Card>
        )}

        {/* ===== NOT CONNECTED — SETUP WIZARD ===== */}
        {!isConnected && !isSettingUp && (setupMode !== 'choose' || !isFailed) && (
          <>
            {setupMode === 'choose' && (
              <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                <Card>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                    <Tag color="default">{t('sipuniNotConnected')}</Tag>
                  </div>
                  <Title level={5} style={{ marginTop: 0 }}>
                    <InfoCircleOutlined /> {t('connectSipuni')}
                  </Title>
                  <Paragraph type="secondary">{t('sipuniSetupInstructions')}</Paragraph>
                </Card>

                <Card
                  hoverable
                  onClick={() => setSetupMode('automatic')}
                  style={{ cursor: 'pointer' }}
                >
                  <Space>
                    <RocketOutlined style={{ fontSize: 24, color: 'var(--ant-color-primary)' }} />
                    <div>
                      <Text strong>{t('sipuniAutomatic')}</Text>
                      <br />
                      <Text type="secondary" style={{ fontSize: 13 }}>{t('sipuniAutomaticDesc')}</Text>
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
                      <Text strong>{t('sipuniManual')}</Text>
                      <br />
                      <Text type="secondary" style={{ fontSize: 13 }}>{t('sipuniManualDesc')}</Text>
                    </div>
                  </Space>
                </Card>
              </Space>
            )}

            {setupMode === 'automatic' && (
              <Card>
                <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                  <Title level={5} style={{ marginTop: 0 }}>
                    <RocketOutlined /> {t('sipuniAutomatic')}
                  </Title>

                  <div>
                    <Text strong style={{ display: 'block', marginBottom: 8 }}>{t('sipuniEmail')}</Text>
                    <Input
                      placeholder={t('sipuniEmail')}
                      value={emailInput}
                      onChange={e => setEmailInput(e.target.value)}
                      type="email"
                    />
                  </div>

                  <div>
                    <Text strong style={{ display: 'block', marginBottom: 8 }}>{t('sipuniPassword')}</Text>
                    <Input.Password
                      placeholder={t('sipuniPassword')}
                      value={passwordInput}
                      onChange={e => setPasswordInput(e.target.value)}
                      onPressEnter={handleAutomaticSetup}
                    />
                    <Text type="secondary" style={{ fontSize: 12, marginTop: 4, display: 'block' }}>
                      <LockOutlined /> {t('sipuniPasswordHint')}
                    </Text>
                  </div>

                  <Space>
                    <Button type="primary" icon={<RocketOutlined />} onClick={handleAutomaticSetup} loading={settingUp}>
                      {t('sipuniAutomatic')}
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
                    <ToolOutlined /> {t('sipuniManual')}
                  </Title>

                  <Paragraph type="secondary">{t('sipuniManualDesc')}</Paragraph>

                  <div>
                    <Text strong style={{ display: 'block', marginBottom: 8 }}>{t('sipuniCabinetId')}</Text>
                    <Input
                      placeholder={t('sipuniCabinetId')}
                      value={cabinetIdInput}
                      onChange={e => setCabinetIdInput(e.target.value)}
                    />
                  </div>

                  <div>
                    <Text strong style={{ display: 'block', marginBottom: 8 }}>{t('sipuniSecurityKey')}</Text>
                    <Input.Password
                      placeholder={t('sipuniSecurityKey')}
                      value={securityKeyInput}
                      onChange={e => setSecurityKeyInput(e.target.value)}
                      onPressEnter={handleManualSetup}
                    />
                  </div>

                  <Space>
                    <Button type="primary" icon={<ToolOutlined />} onClick={handleManualSetup} loading={settingUp}>
                      {tActions('connect')}
                    </Button>
                    <Button onClick={() => setSetupMode('choose')}>{tActions('cancel')}</Button>
                  </Space>
                </Space>
              </Card>
            )}
          </>
        )}

        {/* ===== CONNECTED STATE ===== */}
        {isConnected && !isSettingUp && (
          <Space direction="vertical" size="middle" style={{ width: '100%' }}>
            {/* Connection Status */}
            <Card>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Space>
                  <Tag icon={<CheckCircleOutlined />} color="success">
                    {t('sipuniConnectedStatus')}
                  </Tag>
                  {config?.setup_method && (
                    <Text type="secondary">
                      {t('sipuniSetupMethod')}: {config.setup_method === 'auto' ? t('sipuniSetupMethodAuto') : t('sipuniSetupMethodManual')}
                    </Text>
                  )}
                </Space>
                <Button danger icon={<DisconnectOutlined />} onClick={handleDisconnect}>
                  {tActions('disconnect')}
                </Button>
              </div>
            </Card>

            {/* Cabinet ID */}
            {config?.cabinet_id && (
              <Card>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <Text strong>{t('sipuniCabinetIdLabel')}</Text>
                    <br />
                    <Text code>{config.cabinet_id}</Text>
                  </div>
                </div>
              </Card>
            )}

            {/* Security Key (masked) */}
            {config?.security_key_masked && (
              <Card>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <Text strong>{t('sipuniSecurityKeyLabel')}</Text>
                    <br />
                    <Text code>{config.security_key_masked}</Text>
                  </div>
                </div>
              </Card>
            )}

            {/* Webhook URL */}
            {config?.webhook_url && (
              <Card>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <Text strong>{t('sipuniWebhookUrl')}</Text>
                    <br />
                    <Text code style={{ wordBreak: 'break-all' }}>{config.webhook_url}</Text>
                  </div>
                  <Button icon={<CopyOutlined />} onClick={handleCopyWebhookUrl} style={{ marginLeft: 12 }}>
                    {tActions('copy')}
                  </Button>
                </div>
              </Card>
            )}
          </Space>
        )}
      </div>
    </ProtectedRoute>
  );
}
