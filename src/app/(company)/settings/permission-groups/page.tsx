'use client';

import { useEffect, useState } from 'react';
import { PlusOutlined, EditOutlined, DeleteOutlined, TeamOutlined, SafetyOutlined, CloseOutlined, SaveOutlined } from '@ant-design/icons';
import { Button, Input, Tag, message } from 'antd';
import { apiClient } from '@/lib/api';
import { EmptyStateCharacter } from '@/components/illustrations';
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
      message.error('Failed to load permission groups');
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
      message.error('Failed to save permission group');
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
      message.error('Failed to delete permission group');
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

  if (loading) return (
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
              <div className="h-5 w-36 bg-gray-100 rounded animate-pulse" />
              <div className="flex gap-2">
                <div className="h-7 w-7 bg-gray-50 rounded animate-pulse" />
                <div className="h-7 w-7 bg-gray-50 rounded animate-pulse" />
              </div>
            </div>
            <div className="h-4 w-64 bg-gray-50 rounded animate-pulse" />
            <div className="flex gap-2">
              {[1, 2, 3].map((j) => (
                <div key={j} className="h-5 w-20 bg-gray-50 rounded animate-pulse" />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div>
          <p className="page-subtitle">Manage user permission templates</p>
        </div>
        <Button onClick={handleCreate}>
          <PlusOutlined style={{ marginRight: 8 }} />
          New Group
        </Button>
      </div>

      {showForm && (
        <div className="glass-card p-0">
          <div className="flex flex-col space-y-1.5 p-6">
            <h3 className="text-base font-semibold leading-none tracking-tight">{editingId ? 'Edit Group' : 'Create Group'}</h3>
          </div>
          <div className="p-6 pt-0 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Name</label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Sales Team"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Description</label>
                <Input
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Optional description"
                />
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-sm font-medium">Permissions</label>
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
              <Button type="default"  onClick={() => setShowForm(false)}>
                <CloseOutlined style={{ marginRight: 8 }} />
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {groups.map((group) => (
          <div key={group.id} className="glass-card p-0">
            <div className="flex flex-col space-y-1.5 p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <SafetyOutlined style={{ fontSize: 20, color: '#2563eb' }} />
                  <div>
                    <h3 className="text-base font-semibold leading-none tracking-tight text-lg">{group.name}</h3>
                    {group.description && (
                      <p className="text-sm text-gray-400">{group.description}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
            <div className="p-6 pt-0 space-y-3">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <SafetyOutlined />
                <span>{group.permissions.length} permissions</span>
              </div>
              <div className="flex flex-wrap gap-1">
                {group.permissions.slice(0, 5).map((p) => (
                  <Tag key={p}  className="text-xs">{p}</Tag>
                ))}
                {group.permissions.length > 5 && (
                  <Tag bordered className="text-xs">
                    +{group.permissions.length - 5} more
                  </Tag>
                )}
              </div>
              <div className="flex gap-2 pt-2">
                <Button size="small" type="default"   onClick={() => handleEdit(group)}>
                  <EditOutlined style={{ marginRight: 4 }} />
                  Edit
                </Button>
                <Button size="small" type="primary" danger   onClick={() => handleDelete(group.id)}>
                  <DeleteOutlined style={{ marginRight: 4 }} />
                  Delete
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {groups.length === 0 && !showForm && (
        <div className="glass-card py-12 flex flex-col items-center justify-center">
          <EmptyStateCharacter width={160} height={160} variant="setup" />
          <p className="mt-4 text-lg font-medium text-gray-700">No permission groups</p>
          <p className="text-sm text-gray-500">Create groups to manage user permissions</p>
        </div>
      )}
    </div>
  );
}
