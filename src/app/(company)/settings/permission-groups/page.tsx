'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { PlusOutlined, EditOutlined, DeleteOutlined, TeamOutlined, SafetyOutlined, CloseOutlined, SaveOutlined } from '@ant-design/icons';
import { Spin } from 'antd';
import { apiClient } from '@/lib/api';
import type { PermissionGroupResponse, AvailablePermission } from '@/types/api';

export default function PermissionGroupsPage() {
  const [groups, setGroups] = useState<PermissionGroupResponse[]>([]);
  const [availablePerms, setAvailablePerms] = useState<AvailablePermission[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    permissions: [] as string[],
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [groupsData, permsData] = await Promise.all([
        apiClient.getPermissionGroups(),
        apiClient.getAvailablePermissions(),
      ]);
      setGroups(groupsData.groups);
      setAvailablePerms(permsData);
    } catch (error) {
      console.error('Failed to load permission groups:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingId(null);
    setFormData({ name: '', description: '', permissions: [] });
    setShowForm(true);
  };

  const handleEdit = (group: PermissionGroupResponse) => {
    setEditingId(group.id);
    setFormData({
      name: group.name,
      description: group.description || '',
      permissions: group.permissions,
    });
    setShowForm(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (editingId) {
        await apiClient.updatePermissionGroup(editingId, formData);
      } else {
        await apiClient.createPermissionGroup(formData);
      }
      setShowForm(false);
      loadData();
    } catch (error) {
      console.error('Failed to save permission group:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (groupId: string) => {
    if (!confirm('Are you sure you want to delete this permission group?')) return;
    try {
      await apiClient.deletePermissionGroup(groupId);
      loadData();
    } catch (error) {
      console.error('Failed to delete permission group:', error);
    }
  };

  const togglePermission = (perm: string) => {
    setFormData((prev) => ({
      ...prev,
      permissions: prev.permissions.includes(perm)
        ? prev.permissions.filter((p) => p !== perm)
        : [...prev.permissions, perm],
    }));
  };

  // Group available permissions by category
  const permsByCategory = availablePerms.reduce<Record<string, AvailablePermission[]>>((acc, p) => {
    (acc[p.category] ||= []).push(p);
    return acc;
  }, {});

  if (loading) return <div className="flex items-center justify-center h-64"><Spin size="large" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold gradient-text">Permission Groups</h1>
          <p className="text-gray-500">Manage user permission templates</p>
        </div>
        <Button onClick={handleCreate}>
          <PlusOutlined style={{ marginRight: 8 }} />
          New Group
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>{editingId ? 'Edit Group' : 'Create Group'}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Name</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Sales Team"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Input
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Optional description"
                />
              </div>
            </div>

            <div className="space-y-3">
              <Label>Permissions</Label>
              {Object.entries(permsByCategory).map(([category, perms]) => (
                <div key={category} className="border rounded-lg p-3">
                  <h4 className="font-medium text-sm mb-2 capitalize">{category}</h4>
                  <div className="flex flex-wrap gap-2">
                    {perms.map((perm) => (
                      <label
                        key={perm.key}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md border cursor-pointer text-sm transition-colors ${
                          formData.permissions.includes(perm.key)
                            ? 'bg-primary text-primary-foreground border-primary'
                            : 'hover:bg-gray-50'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={formData.permissions.includes(perm.key)}
                          onChange={() => togglePermission(perm.key)}
                          className="sr-only"
                        />
                        {perm.label}
                      </label>
                    ))}
                  </div>
                </div>
              ))}
              {availablePerms.length === 0 && (
                <p className="text-sm text-gray-500">No permissions available</p>
              )}
            </div>

            <div className="flex gap-2">
              <Button onClick={handleSave} disabled={saving || !formData.name}>
                <SaveOutlined style={{ marginRight: 8 }} />
                {saving ? 'Saving...' : 'Save'}
              </Button>
              <Button variant="outline" onClick={() => setShowForm(false)}>
                <CloseOutlined style={{ marginRight: 8 }} />
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {groups.map((group) => (
          <Card key={group.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <SafetyOutlined style={{ fontSize: 20, color: '#2563eb' }} />
                  <div>
                    <CardTitle className="text-lg">{group.name}</CardTitle>
                    {group.description && (
                      <CardDescription>{group.description}</CardDescription>
                    )}
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <SafetyOutlined />
                <span>{group.permissions.length} permissions</span>
              </div>
              <div className="flex flex-wrap gap-1">
                {group.permissions.slice(0, 5).map((p) => (
                  <Badge key={p} variant="secondary" className="text-xs">{p}</Badge>
                ))}
                {group.permissions.length > 5 && (
                  <Badge variant="outline" className="text-xs">
                    +{group.permissions.length - 5} more
                  </Badge>
                )}
              </div>
              <div className="flex gap-2 pt-2">
                <Button variant="outline" size="sm" onClick={() => handleEdit(group)}>
                  <EditOutlined style={{ marginRight: 4 }} />
                  Edit
                </Button>
                <Button variant="destructive" size="sm" onClick={() => handleDelete(group.id)}>
                  <DeleteOutlined style={{ marginRight: 4 }} />
                  Delete
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {groups.length === 0 && !showForm && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <SafetyOutlined style={{ fontSize: 48, color: '#9ca3af' }} />
            <p className="mt-4 text-lg font-medium">No permission groups</p>
            <p className="text-sm text-gray-500">Create groups to manage user permissions</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
