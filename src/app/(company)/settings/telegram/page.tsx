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
import { UserRole } from '@/types/api';
import type { TelegramConfig, UpdateTelegramConfig } from '@/types/api';
import { toast } from 'sonner';
import { getErrorMessage } from '@/lib/utils';

const { Title, Text, Paragraph } = Typography;

interface NotificationToggle {
  key: keyof UpdateTelegramConfig;
  label: string;
  description: string;
}

const NOTIFICATION_TOGGLES: NotificationToggle[] = [
  {
    key: 'notify_completed_calls',
    label: 'Completed Calls',
    description: 'Receive notifications when calls are completed',
  },
  {
    key: 'notify_missed_calls',
    label: 'Missed Calls',
    description: 'Receive notifications for missed or unanswered calls',
  },
  {
    key: 'notify_new_leads',
    label: 'New Leads',
    description: 'Receive notifications when new leads are created',
  },
  {
    key: 'notify_deal_stage_change',
    label: 'Deal Stage Changes',
    description: 'Receive notifications when a deal moves to a new stage',
  },
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
      setError(getErrorMessage(err, 'Failed to load Telegram configuration'));
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
      toast.success('Telegram settings saved');
    } catch (err) {
      toast.error(getErrorMessage(err, 'Failed to save settings'));
    } finally {
      setSaving(false);
    }
  };

  const handleConnect = async () => {
    const trimmed = chatIdInput.trim();
    if (!trimmed) {
      toast.error('Please enter a Chat ID');
      return;
    }
    try {
      setConnecting(true);
      const data = await apiClient.connectTelegram(trimmed);
      setConfig(data);
      setChatIdInput('');
      toast.success('Telegram connected successfully');
    } catch (err) {
      toast.error(getErrorMessage(err, 'Failed to connect Telegram'));
    } finally {
      setConnecting(false);
    }
  };

  const handleDisconnect = () => {
    Modal.confirm({
      title: 'Disconnect Telegram',
      content: 'Are you sure you want to disconnect the Telegram bot? You will stop receiving all notifications.',
      okText: 'Disconnect',
      okButtonProps: { danger: true },
      cancelText: 'Cancel',
      onOk: async () => {
        try {
          await apiClient.disconnectTelegram();
          await fetchConfig();
          toast.success('Telegram disconnected');
        } catch (err) {
          toast.error(getErrorMessage(err, 'Failed to disconnect Telegram'));
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
        <div style={{ padding: '24px', maxWidth: 700 }}>
          <Title level={3} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <SendOutlined /> Telegram Bot
          </Title>
          <Alert
            type="error"
            message="Error"
            description={error}
            showIcon
            action={
              <Button size="small" onClick={fetchConfig}>
                Retry
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
      <div style={{ padding: '24px', maxWidth: 700 }}>
        <div style={{ marginBottom: 24 }}>
          <Title level={3} style={{ margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
            <SendOutlined /> Telegram Bot
          </Title>
          <Text type="secondary">Configure Telegram bot notifications for your team.</Text>
        </div>

        {!isConnected ? (
          /* ===== NOT CONNECTED STATE ===== */
          <Card>
            <Space direction="vertical" size="middle" style={{ width: '100%' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Tag color="default">Not Connected</Tag>
              </div>

              <Divider style={{ margin: '4px 0' }} />

              <div>
                <Title level={5} style={{ marginTop: 0 }}>
                  <InfoCircleOutlined /> How to connect
                </Title>
                <Paragraph type="secondary" style={{ marginBottom: 4 }}>
                  Follow these steps to connect the S1P bot to your Telegram group:
                </Paragraph>
                <ol style={{ paddingLeft: 20, color: '#555', lineHeight: '2' }}>
                  <li>
                    Open Telegram and search for <Text strong>@s1p_crm_bot</Text> (or your company bot).
                  </li>
                  <li>Add the bot to your Telegram group or start a direct chat.</li>
                  <li>
                    Send <Text code>/start</Text> in the chat to activate the bot.
                  </li>
                  <li>
                    Send <Text code>/chatid</Text> to get the chat ID, then paste it below.
                  </li>
                </ol>
              </div>

              <Divider style={{ margin: '4px 0' }} />

              <div>
                <Text strong style={{ display: 'block', marginBottom: 8 }}>
                  Chat ID
                </Text>
                <Space.Compact style={{ width: '100%' }}>
                  <Input
                    placeholder="Enter Telegram Chat ID (e.g. -1001234567890)"
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
                    Connect
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
                    Connected
                  </Tag>
                  <Text type="secondary">
                    Chat ID: <Text code>{config.chat_id}</Text>
                  </Text>
                </Space>
                <Button
                  danger
                  icon={<DisconnectOutlined />}
                  onClick={handleDisconnect}
                >
                  Disconnect
                </Button>
              </div>
            </Card>

            {/* Bot Toggle */}
            <Card>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <Text strong>Bot Enabled</Text>
                  <br />
                  <Text type="secondary" style={{ fontSize: 13 }}>
                    Master switch — when disabled, no notifications are sent
                  </Text>
                </div>
                <Switch
                  checked={getToggleValue('bot_enabled')}
                  onChange={(checked) => handleToggleChange('bot_enabled', checked)}
                />
              </div>
            </Card>

            {/* Notification Preferences */}
            <Card title="Notification Preferences">
              <Space direction="vertical" size={0} style={{ width: '100%' }}>
                {NOTIFICATION_TOGGLES.map((toggle, index) => (
                  <div key={toggle.key}>
                    {index > 0 && <Divider style={{ margin: '12px 0' }} />}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <Text strong>{toggle.label}</Text>
                        <br />
                        <Text type="secondary" style={{ fontSize: 13 }}>
                          {toggle.description}
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
                  Save Changes
                </Button>
              </div>
            )}
          </Space>
        )}
      </div>
    </ProtectedRoute>
  );
}
