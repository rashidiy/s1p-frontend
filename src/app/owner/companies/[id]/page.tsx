'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeftOutlined, BankOutlined, TeamOutlined, SettingOutlined, UserAddOutlined, SaveOutlined, CloseOutlined, EditOutlined } from '@ant-design/icons';
import { Alert, Button, Input, Spin, Tag } from 'antd';
import { apiClient } from '@/lib/api';
import type { CompanyDetailResponse, UserResponse } from '@/types/api';

export default function CompanyDetailPage() {
  const params = useParams();
  const router = useRouter();
  const companyId = params.id as string;

  const [company, setCompany] = useState<CompanyDetailResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({ name: '' });

  // Invite admin form
  const [showInvite, setShowInvite] = useState(false);
  const [inviteForm, setInviteForm] = useState({
    email: '',
    first_name: '',
    last_name: '',
    phone: '',
  });
  const [inviting, setInviting] = useState(false);
  const [inviteMessage, setInviteMessage] = useState('');

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
    }
  };

  const handleInviteAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setInviting(true);
    setInviteMessage('');
    try {
      await apiClient.inviteAdmin(companyId, {
        email: inviteForm.email,
        first_name: inviteForm.first_name,
        last_name: inviteForm.last_name || null,
        phone: inviteForm.phone || null,
      });
      setInviteMessage('Admin invited successfully');
      setInviteForm({ email: '', first_name: '', last_name: '', phone: '' });
      setShowInvite(false);
    } catch (error: any) {
      setInviteMessage(error.response?.data?.detail || 'Failed to invite admin');
    } finally {
      setInviting(false);
    }
  };

  if (loading) return <div className="flex items-center justify-center h-64"><Spin size="large" /></div>;
  if (!company) return <div className="p-6">Company not found</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button size="small" type="text"   onClick={() => router.back()}>
            <ArrowLeftOutlined style={{ marginRight: 4 }} />
            Back
          </Button>
          <div className="flex items-center gap-3">
            <BankOutlined style={{ fontSize: 24, color: '#2563eb' }} />
            <h1 className="text-3xl font-bold gradient-text">{company.name}</h1>
          </div>
          <Tag color={company.is_active ? 'blue' : undefined}>
            {company.is_active ? 'Active' : 'Inactive'}
          </Tag>
        </div>
        <div className="flex gap-2">
          <Button type="default"  onClick={() => setShowInvite(true)}>
            <UserAddOutlined style={{ marginRight: 8 }} />
            Invite Admin
          </Button>
          <Button type="primary" danger={company.is_active}
            onClick={handleToggleActive}>
            {company.is_active ? 'Deactivate' : 'Activate'}
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

      {showInvite && (
        <div className="glass-card p-0">
          <div className="flex flex-col space-y-1.5 p-6">
            <h3 className="text-2xl font-semibold leading-none tracking-tight">Invite Company Admin</h3>
            <p className="text-sm text-muted-foreground">Send an invitation to a new admin for this company</p>
          </div>
          <div className="p-6 pt-0">
            <form onSubmit={handleInviteAdmin} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Email *</label>
                  <Input
                    type="email"
                    value={inviteForm.email}
                    onChange={(e) => setInviteForm({ ...inviteForm, email: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">First Name *</label>
                  <Input
                    value={inviteForm.first_name}
                    onChange={(e) => setInviteForm({ ...inviteForm, first_name: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Last Name</label>
                  <Input
                    value={inviteForm.last_name}
                    onChange={(e) => setInviteForm({ ...inviteForm, last_name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Phone</label>
                  <Input
                    value={inviteForm.phone}
                    onChange={(e) => setInviteForm({ ...inviteForm, phone: e.target.value })}
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button htmlType="submit" disabled={inviting}>
                  {inviting ? 'Inviting...' : 'Send Invite'}
                </Button>
                <Button type="default"  htmlType="button" onClick={() => setShowInvite(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-card p-0">
          <div className="flex flex-col space-y-1.5 p-6">
            <div className="flex items-center justify-between">
              <h3 className="text-2xl font-semibold leading-none tracking-tight">Company Details</h3>
              {!editing && (
                <Button size="small" type="text"   onClick={() => setEditing(true)}>
                  <EditOutlined />
                </Button>
              )}
            </div>
          </div>
          <div className="p-6 pt-0">
            {editing ? (
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Company Name</label>
                  <Input
                    value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  />
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleSave}>
                    <SaveOutlined style={{ marginRight: 8 }} />
                    Save
                  </Button>
                  <Button type="default"  onClick={() => setEditing(false)}>
                    <CloseOutlined style={{ marginRight: 8 }} />
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Name</span>
                  <span className="font-medium">{company.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Subdomain</span>
                  <span className="font-medium">{company.subdomain || '-'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Provider</span>
                  <span className="font-medium uppercase">{company.provider_type}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Status</span>
                  <Tag color={company.is_active ? 'blue' : undefined}>
                    {company.is_active ? 'Active' : 'Inactive'}
                  </Tag>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Created</span>
                  <span>{new Date(company.created_at).toLocaleDateString()}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="glass-card p-0">
          <div className="flex flex-col space-y-1.5 p-6">
            <h3 className="text-2xl font-semibold leading-none tracking-tight">Provider Configuration</h3>
          </div>
          <div className="p-6 pt-0">
            <div className="space-y-3 text-sm">
              {Object.entries(company.provider_config || {}).map(([key, value]) => (
                <div key={key} className="flex justify-between">
                  <span className="text-gray-500">{key}</span>
                  <span className="font-medium font-mono text-xs">
                    {typeof value === 'string' ? value : JSON.stringify(value)}
                  </span>
                </div>
              ))}
              {Object.keys(company.provider_config || {}).length === 0 && (
                <p className="text-gray-500">No provider configuration</p>
              )}
            </div>
          </div>
        </div>

        {company.webhook_url && (
          <div className="glass-card p-0 lg:col-span-2">
            <div className="flex flex-col space-y-1.5 p-6">
              <h3 className="text-2xl font-semibold leading-none tracking-tight">Webhook</h3>
            </div>
            <div className="p-6 pt-0 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">URL</span>
                <span className="font-mono text-xs">{company.webhook_url}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Token</span>
                <span className="font-mono text-xs">{company.webhook_token}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
