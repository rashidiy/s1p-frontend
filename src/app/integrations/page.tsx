'use client';

import { useEffect, useState } from 'react';
import { PlusOutlined, BankOutlined, EditOutlined, DeleteOutlined, ReloadOutlined, CopyOutlined } from '@ant-design/icons';
import { Button, Input, Modal, Spin, Tag } from 'antd';
import { apiClient } from '@/lib/api';
import type { SipuniResponse, SipuniCreateRequest } from '@/types/api';

export default function IntegrationsPage() {
  const [integrations, setIntegrations] = useState<SipuniResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedIntegration, setSelectedIntegration] = useState<SipuniResponse | null>(null);
  const [formData, setFormData] = useState<SipuniCreateRequest>({
    company_name: '',
    cabinet_id: '',
    security_key: '',
    partner_name: '',
    partner_contact: '',
    comment: '',
  });

  useEffect(() => {
    loadIntegrations();
  }, []);

  const loadIntegrations = async () => {
    try {
      const data = await apiClient.getSipuniList();
      setIntegrations(data);
    } catch (error) {
      console.error('Failed to load integrations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiClient.createSipuni(formData);
      setIsCreateDialogOpen(false);
      resetForm();
      loadIntegrations();
    } catch (error) {
      console.error('Failed to create integration:', error);
    }
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedIntegration) return;

    try {
      await apiClient.updateSipuni({
        id: selectedIntegration.id,
        company_name: formData.company_name || undefined,
        cabinet_id: formData.cabinet_id || undefined,
        security_key: formData.security_key || undefined,
        partner_name: formData.partner_name || undefined,
        partner_contact: formData.partner_contact || undefined,
        comment: formData.comment || undefined,
      });
      setIsEditDialogOpen(false);
      setSelectedIntegration(null);
      resetForm();
      loadIntegrations();
    } catch (error) {
      console.error('Failed to update integration:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this integration?')) return;

    try {
      await apiClient.deleteSipuni(parseInt(id));
      loadIntegrations();
    } catch (error) {
      console.error('Failed to delete integration:', error);
    }
  };

  const handleCopyToken = (token: string) => {
    navigator.clipboard.writeText(token);
  };

  const openEditDialog = (integration: SipuniResponse) => {
    setSelectedIntegration(integration);
    setFormData({
      company_name: integration.company_name,
      cabinet_id: integration.cabinet_id,
      security_key: integration.security_key,
      partner_name: integration.partner_name || '',
      partner_contact: integration.partner_contact || '',
      comment: integration.comment || '',
    });
    setIsEditDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({
      company_name: '',
      cabinet_id: '',
      security_key: '',
      partner_name: '',
      partner_contact: '',
      comment: '',
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (

      <div className="p-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold gradient-text">Integrations</h1>
            <p className="text-muted-foreground mt-2">
              Manage your SIPUNI integrations
            </p>
          </div>
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <PlusOutlined style={{ marginRight: 8 }} />
            Add Integration
          </Button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64"><Spin size="large" /></div>
        ) : integrations.length === 0 ? (
          <div className="glass-card p-0">
            <div className="p-6 pt-0 flex flex-col items-center justify-center py-16">
              <BankOutlined style={{ fontSize: 48, color: 'var(--muted-foreground)' }} />
              <h3 className="text-lg font-medium mb-2 mt-4">No integrations yet</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Get started by adding your first SIPUNI integration
              </p>
              <Button onClick={() => setIsCreateDialogOpen(true)}>
                <PlusOutlined style={{ marginRight: 8 }} />
                Add Integration
              </Button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {integrations.map((integration) => (
              <div key={integration.id} className="glass-card p-0">
                <div className="flex flex-col space-y-1.5 p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="bg-primary/10 text-primary p-2 rounded-lg">
                        <BankOutlined style={{ fontSize: 20 }} />
                      </div>
                      <div>
                        <h3 className="text-2xl font-semibold leading-none tracking-tight text-lg">
                          {integration.company_name}
                        </h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          Cabinet: {integration.cabinet_id}
                        </p>
                      </div>
                    </div>
                    <Tag color="green">Active</Tag>
                  </div>
                </div>
                <div className="p-6 pt-0">
                  <div className="space-y-3">
                    {integration.partner_name && (
                      <div>
                        <p className="text-xs text-muted-foreground">Partner</p>
                        <p className="text-sm font-medium">{integration.partner_name}</p>
                      </div>
                    )}
                    {integration.partner_contact && (
                      <div>
                        <p className="text-xs text-muted-foreground">Contact</p>
                        <p className="text-sm font-medium">{integration.partner_contact}</p>
                      </div>
                    )}
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Token</p>
                      <div className="flex items-center gap-2">
                        <code className="flex-1 text-xs bg-muted px-2 py-1 rounded truncate">
                          {integration.token.substring(0, 20)}...
                        </code>
                        <Button size="small" type="text"
                          onClick={() => handleCopyToken(integration.token)}
                        >
                          <CopyOutlined />
                        </Button>
                      </div>
                    </div>
                    {integration.comment && (
                      <div>
                        <p className="text-xs text-muted-foreground">Comment</p>
                        <p className="text-sm">{integration.comment}</p>
                      </div>
                    )}
                    <div className="flex gap-2 pt-2">
                      <Button size="small" type="default"
                        className="flex-1"
                        onClick={() => openEditDialog(integration)}
                      >
                        <EditOutlined style={{ marginRight: 4 }} />
                        Edit
                      </Button>
                      <Button size="small" type="default"
                        className="flex-1"
                        onClick={() => handleDelete(integration.id)}
                      >
                        <DeleteOutlined style={{ marginRight: 4 }} />
                        Delete
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Create Dialog */}
        <Modal open={isCreateDialogOpen} onCancel={() => setIsCreateDialogOpen(false)} footer={null} destroyOnClose>
          <form onSubmit={handleCreate}>
              <div className="mb-4">
                <h3 className="text-lg font-semibold">Add Integration</h3>
                <p className="text-sm text-muted-foreground">
                  Connect a new SIPUNI account to your CRM
                </p>
              </div>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <label htmlFor="company_name" className="text-sm font-medium">Company Name *</label>
                  <Input
                    id="company_name"
                    name="company_name"
                    value={formData.company_name}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="cabinet_id" className="text-sm font-medium">Cabinet ID *</label>
                  <Input
                    id="cabinet_id"
                    name="cabinet_id"
                    value={formData.cabinet_id}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="security_key" className="text-sm font-medium">Security Key *</label>
                  <Input
                    id="security_key"
                    name="security_key"
                    type="password"
                    value={formData.security_key}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="partner_name" className="text-sm font-medium">Partner Name</label>
                  <Input
                    id="partner_name"
                    name="partner_name"
                    value={formData.partner_name}
                    onChange={handleChange}
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="partner_contact" className="text-sm font-medium">Partner Contact</label>
                  <Input
                    id="partner_contact"
                    name="partner_contact"
                    value={formData.partner_contact}
                    onChange={handleChange}
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="comment" className="text-sm font-medium">Comment</label>
                  <Input
                    id="comment"
                    name="comment"
                    value={formData.comment}
                    onChange={handleChange}
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-4">
                <Button type="default"
                  onClick={() => setIsCreateDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button htmlType="submit">Create</Button>
              </div>
            </form>
        </Modal>

        {/* Edit Dialog */}
        <Modal open={isEditDialogOpen} onCancel={() => setIsEditDialogOpen(false)} footer={null} destroyOnClose>
          <form onSubmit={handleEdit}>
              <div className="mb-4">
                <h3 className="text-lg font-semibold">Edit Integration</h3>
                <p className="text-sm text-muted-foreground">
                  Update integration details
                </p>
              </div>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <label htmlFor="edit_company_name" className="text-sm font-medium">Company Name</label>
                  <Input
                    id="edit_company_name"
                    name="company_name"
                    value={formData.company_name}
                    onChange={handleChange}
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="edit_cabinet_id" className="text-sm font-medium">Cabinet ID</label>
                  <Input
                    id="edit_cabinet_id"
                    name="cabinet_id"
                    value={formData.cabinet_id}
                    onChange={handleChange}
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="edit_security_key" className="text-sm font-medium">Security Key</label>
                  <Input
                    id="edit_security_key"
                    name="security_key"
                    type="password"
                    value={formData.security_key}
                    onChange={handleChange}
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="edit_partner_name" className="text-sm font-medium">Partner Name</label>
                  <Input
                    id="edit_partner_name"
                    name="partner_name"
                    value={formData.partner_name}
                    onChange={handleChange}
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="edit_partner_contact" className="text-sm font-medium">Partner Contact</label>
                  <Input
                    id="edit_partner_contact"
                    name="partner_contact"
                    value={formData.partner_contact}
                    onChange={handleChange}
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="edit_comment" className="text-sm font-medium">Comment</label>
                  <Input
                    id="edit_comment"
                    name="comment"
                    value={formData.comment}
                    onChange={handleChange}
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-4">
                <Button type="default"
                  onClick={() => setIsEditDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button htmlType="submit">Update</Button>
              </div>
            </form>
        </Modal>
      </div>

  );
}
