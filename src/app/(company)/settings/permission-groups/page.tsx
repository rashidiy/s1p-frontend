'use client';

import { useEffect, useState } from 'react';
import { PlusOutlined, EditOutlined, DeleteOutlined, TeamOutlined, SafetyOutlined, CloseOutlined, SaveOutlined, QuestionCircleOutlined } from '@ant-design/icons';
import { Button, Input, Modal, Tag, Tooltip, message } from 'antd';
import { apiClient } from '@/lib/api';
import { useTranslations } from 'next-intl';
import { EmptyStateCharacter, ErrorCharacter } from '@/components/illustrations';
import type { PermissionGroupResponse, AvailablePermission } from '@/types/api';

export default function PermissionGroupsPage() {
  const [groups, setGroups] = useState<PermissionGroupResponse[]>([]);
  const [availablePerms, setAvailablePerms] = useState<AvailablePermission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    permissions: [] as string[],
  });
  const [saving, setSaving] = useState(false);
  const t = useTranslations('settings');
  const tActions = useTranslations('actions');
  const tErrors = useTranslations('errors');
  const tCommon = useTranslations('common');
  const tFields = useTranslations('fields');

  useEffect(() => {
    loadData();
  // eslint-disable-next-line react-hooks/exhaustive-deps -- load on mount only
  }, []);

  const loadData = async () => {
    setError(false);
    try {
      const [groupsData, permsData] = await Promise.all([
        apiClient.getPermissionGroups(),
        apiClient.getAvailablePermissions(),
      ]);
      setGroups(groupsData.groups);
      const perms = Array.isArray(permsData) ? permsData : (permsData as { permissions?: string[] }).permissions?.map((p: string) => ({ key: p, category: p.split('.')[0], label: p })) ?? [];
      setAvailablePerms(perms);
    } catch (error) {
      console.error('Failed to load permission groups:', error);
      setError(true);
      message.error(tErrors('failedToLoadPermissionGroups'));
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
      message.success(t('groupSaved'));
      loadData();
    } catch (error) {
      console.error('Failed to save permission group:', error);
      message.error(tErrors('failedToSavePermissionGroup'));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (groupId: string) => {
    Modal.confirm({
      title: tCommon('areYouSure'),
      content: t('confirmDeleteGroup'),
      okText: tActions('delete'),
      cancelText: tActions('cancel'),
      okButtonProps: { danger: true },
      onOk: async () => {
        try {
          await apiClient.deletePermissionGroup(groupId);
          message.success(t('groupDeleted'));
          loadData();
        } catch (error) {
          console.error('Failed to delete permission group:', error);
          message.error(tErrors('failedToDeletePermissionGroup'));
        }
      },
    });
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

  if (error) {
    return (
      <div className="glass-card py-16 flex flex-col items-center justify-center">
        <ErrorCharacter height={115} />
        <h3 className="mt-5 text-lg font-semibold text-gray-800">{tErrors('somethingWentWrong')}</h3>
        <p className="text-sm text-gray-400 mt-1">{tErrors('tryAgainLater')}</p>
        <Button type="primary" className="mt-4" onClick={() => { setError(false); setLoading(true); loadData(); }}>
          {tActions('tryAgain')}
        </Button>
      </div>
    );
  }

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
          <p className="page-subtitle">
            {t('permissionGroupsDescription')}
            <Tooltip title={t('permissionGroupsHelp')}>
              <QuestionCircleOutlined className="text-gray-400 cursor-help ml-2" />
            </Tooltip>
          </p>
        </div>
        <Button onClick={handleCreate}>
          <PlusOutlined style={{ marginRight: 8 }} />
          {t('newGroup')}
        </Button>
      </div>

      {showForm && (
        <div className="glass-card p-0">
          <div className="flex flex-col space-y-1.5 p-6">
            <h3 className="text-base font-semibold leading-none tracking-tight">{editingId ? tActions('edit') : tActions('create')}</h3>
          </div>
          <div className="p-6 pt-0 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">{tFields('name')}</label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Sales Team"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">{tFields('description')}</label>
                <Input
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder={tFields('description')}
                />
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-sm font-medium">{t('permissions')}</label>
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
                <p className="text-sm text-gray-500">{tCommon('noDataFound')}</p>
              )}
            </div>

            <div className="flex gap-2">
              <Button onClick={handleSave} disabled={saving || !formData.name}>
                <SaveOutlined style={{ marginRight: 8 }} />
                {saving ? tActions('saving') : tActions('save')}
              </Button>
              <Button type="default"  onClick={() => setShowForm(false)}>
                <CloseOutlined style={{ marginRight: 8 }} />
                {tActions('cancel')}
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
                <span>{group.permissions.length} {t('permissions').toLowerCase()}</span>
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
                  {tActions('edit')}
                </Button>
                <Button size="small" type="primary" danger   onClick={() => handleDelete(group.id)}>
                  <DeleteOutlined style={{ marginRight: 4 }} />
                  {tActions('delete')}
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {groups.length === 0 && !showForm && (
        <div className="glass-card py-12 flex flex-col items-center justify-center">
          <EmptyStateCharacter height={115} variant="setup" />
          <p className="mt-4 text-lg font-medium text-gray-700">{tCommon('noDataFound')}</p>
          <p className="text-sm text-gray-500">{t('permissionGroupsDescription')}</p>
        </div>
      )}
    </div>
  );
}
