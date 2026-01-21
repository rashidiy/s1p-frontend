'use client';

import { useEffect, useState } from 'react';
import { AppLayout } from '@/components/layout/app-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Plus, Building2, Edit, Trash2, RefreshCw, Copy } from 'lucide-react';
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
        company_name: formData.company_name || null,
        cabinet_id: formData.cabinet_id || null,
        security_key: formData.security_key || null,
        partner_name: formData.partner_name || null,
        partner_contact: formData.partner_contact || null,
        comment: formData.comment || null,
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
    <AppLayout>
      <div className="p-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Integrations</h1>
            <p className="text-muted-foreground mt-2">
              Manage your SIPUNI integrations
            </p>
          </div>
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Integration
          </Button>
        </div>

        {loading ? (
          <p>Loading...</p>
        ) : integrations.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16">
              <Building2 className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No integrations yet</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Get started by adding your first SIPUNI integration
              </p>
              <Button onClick={() => setIsCreateDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Integration
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {integrations.map((integration) => (
              <Card key={integration.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="bg-primary/10 text-primary p-2 rounded-lg">
                        <Building2 className="h-5 w-5" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">
                          {integration.company_name}
                        </CardTitle>
                        <CardDescription className="mt-1">
                          Cabinet: {integration.cabinet_id}
                        </CardDescription>
                      </div>
                    </div>
                    <Badge variant="success">Active</Badge>
                  </div>
                </CardHeader>
                <CardContent>
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
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleCopyToken(integration.token)}
                        >
                          <Copy className="h-3 w-3" />
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
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => openEditDialog(integration)}
                      >
                        <Edit className="h-3 w-3 mr-1" />
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => handleDelete(integration.id)}
                      >
                        <Trash2 className="h-3 w-3 mr-1" />
                        Delete
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Create Dialog */}
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogContent className="max-w-md">
            <form onSubmit={handleCreate}>
              <DialogHeader>
                <DialogTitle>Add Integration</DialogTitle>
                <DialogDescription>
                  Connect a new SIPUNI account to your CRM
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="company_name">Company Name *</Label>
                  <Input
                    id="company_name"
                    name="company_name"
                    value={formData.company_name}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cabinet_id">Cabinet ID *</Label>
                  <Input
                    id="cabinet_id"
                    name="cabinet_id"
                    value={formData.cabinet_id}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="security_key">Security Key *</Label>
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
                  <Label htmlFor="partner_name">Partner Name</Label>
                  <Input
                    id="partner_name"
                    name="partner_name"
                    value={formData.partner_name}
                    onChange={handleChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="partner_contact">Partner Contact</Label>
                  <Input
                    id="partner_contact"
                    name="partner_contact"
                    value={formData.partner_contact}
                    onChange={handleChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="comment">Comment</Label>
                  <Input
                    id="comment"
                    name="comment"
                    value={formData.comment}
                    onChange={handleChange}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsCreateDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit">Create</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Edit Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-md">
            <form onSubmit={handleEdit}>
              <DialogHeader>
                <DialogTitle>Edit Integration</DialogTitle>
                <DialogDescription>
                  Update integration details
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="edit_company_name">Company Name</Label>
                  <Input
                    id="edit_company_name"
                    name="company_name"
                    value={formData.company_name}
                    onChange={handleChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit_cabinet_id">Cabinet ID</Label>
                  <Input
                    id="edit_cabinet_id"
                    name="cabinet_id"
                    value={formData.cabinet_id}
                    onChange={handleChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit_security_key">Security Key</Label>
                  <Input
                    id="edit_security_key"
                    name="security_key"
                    type="password"
                    value={formData.security_key}
                    onChange={handleChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit_partner_name">Partner Name</Label>
                  <Input
                    id="edit_partner_name"
                    name="partner_name"
                    value={formData.partner_name}
                    onChange={handleChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit_partner_contact">Partner Contact</Label>
                  <Input
                    id="edit_partner_contact"
                    name="partner_contact"
                    value={formData.partner_contact}
                    onChange={handleChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit_comment">Comment</Label>
                  <Input
                    id="edit_comment"
                    name="comment"
                    value={formData.comment}
                    onChange={handleChange}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsEditDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit">Update</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
}
