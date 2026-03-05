'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeftOutlined, BankOutlined, TeamOutlined, SettingOutlined, UserAddOutlined, SaveOutlined, CloseOutlined, EditOutlined } from '@ant-design/icons';
import { Spin, Alert } from 'antd';
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
          <Button variant="ghost" size="sm" onClick={() => router.back()}>
            <ArrowLeftOutlined style={{ marginRight: 4 }} />
            Back
          </Button>
          <div className="flex items-center gap-3">
            <BankOutlined style={{ fontSize: 24, color: '#2563eb' }} />
            <h1 className="text-3xl font-bold gradient-text">{company.name}</h1>
          </div>
          <Badge variant={company.is_active ? 'default' : 'secondary'}>
            {company.is_active ? 'Active' : 'Inactive'}
          </Badge>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowInvite(true)}>
            <UserAddOutlined style={{ marginRight: 8 }} />
            Invite Admin
          </Button>
          <Button
            variant={company.is_active ? 'destructive' : 'default'}
            onClick={handleToggleActive}
          >
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
        <Card>
          <CardHeader>
            <CardTitle>Invite Company Admin</CardTitle>
            <CardDescription>Send an invitation to a new admin for this company</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleInviteAdmin} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Email *</Label>
                  <Input
                    type="email"
                    value={inviteForm.email}
                    onChange={(e) => setInviteForm({ ...inviteForm, email: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>First Name *</Label>
                  <Input
                    value={inviteForm.first_name}
                    onChange={(e) => setInviteForm({ ...inviteForm, first_name: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Last Name</Label>
                  <Input
                    value={inviteForm.last_name}
                    onChange={(e) => setInviteForm({ ...inviteForm, last_name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Phone</Label>
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
                <Button variant="outline" htmlType="button" onClick={() => setShowInvite(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Company Details</CardTitle>
              {!editing && (
                <Button variant="ghost" size="sm" onClick={() => setEditing(true)}>
                  <EditOutlined />
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {editing ? (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Company Name</Label>
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
                  <Button variant="outline" onClick={() => setEditing(false)}>
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
                  <Badge variant={company.is_active ? 'default' : 'secondary'}>
                    {company.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Created</span>
                  <span>{new Date(company.created_at).toLocaleDateString()}</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Provider Configuration</CardTitle>
          </CardHeader>
          <CardContent>
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
          </CardContent>
        </Card>

        {company.webhook_url && (
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Webhook</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">URL</span>
                <span className="font-mono text-xs">{company.webhook_url}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Token</span>
                <span className="font-mono text-xs">{company.webhook_token}</span>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
