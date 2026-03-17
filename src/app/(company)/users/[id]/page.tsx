'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeftOutlined,
  EditOutlined,
  SaveOutlined,
  CloseOutlined,
  PhoneOutlined,
  TeamOutlined,
  SafetyOutlined,
  CalendarOutlined,
} from '@ant-design/icons';
import { Alert, Button, Input, Modal, Select, Spin, Tag } from 'antd';
import { apiClient } from '@/lib/api';
import { getErrorMessage } from '@/lib/utils';
import { useAuthStore } from '@/store/auth';
import { useTranslations } from 'next-intl';
import { UserRole } from '@/types/api';
import type { UserDetailResponse } from '@/types/api';

const roleColors: Record<string, string> = {
  [UserRole.COMPANY_ADMIN]: 'purple',
  [UserRole.COMPANY_MANAGER]: 'blue',
  [UserRole.COMPANY_OPERATOR]: 'green',
};

const statCards = [
  { key: 'total_calls', label: 'Total Calls', color: 'text-blue-600', bg: 'bg-blue-50' },
  { key: 'total_leads', label: 'Leads', color: 'text-indigo-600', bg: 'bg-indigo-50' },
  { key: 'total_deals', label: 'Deals', color: 'text-green-600', bg: 'bg-green-50' },
  { key: 'total_tasks', label: 'Tasks', color: 'text-amber-600', bg: 'bg-amber-50' },
] as const;

export default function UserDetailPage() {
  const params = useParams()!;
  const router = useRouter();
  const { hasPermission } = useAuthStore();
  const userId = params.id as string;
  const canManageUsers = hasPermission(UserRole.COMPANY_ADMIN);
  const t = useTranslations('users');
  const tFields = useTranslations('fields');
  const tActions = useTranslations('actions');
  const tErrors = useTranslations('errors');
  const tCommon = useTranslations('common');
  const tRoles = useTranslations('roles');
  const tSettings = useTranslations('settings');
  const tContractStatuses = useTranslations('contractStatuses');

  const [user, setUser] = useState<UserDetailResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const [editForm, setEditForm] = useState({
    first_name: '',
    last_name: '',
    phone: '',
    role: '',
  });

  useEffect(() => {
    loadUser();
  // eslint-disable-next-line react-hooks/exhaustive-deps -- reload when ID changes
  }, [userId]);

  const loadUser = async () => {
    setLoading(true);
    try {
      const data = await apiClient.getUser(userId);
      setUser(data);
      setEditForm({
        first_name: data.first_name || '',
        last_name: data.last_name || '',
        phone: data.phone || '',
        role: data.role || '',
      });
    } catch (err) {
      console.error('Failed to load user:', err);
      setError(tErrors('failedToLoadUser'));
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setError('');
    setSuccessMsg('');
    try {
      await apiClient.updateUser(userId, {
        first_name: editForm.first_name || null,
        last_name: editForm.last_name || null,
        phone: editForm.phone || null,
        role: editForm.role || null,
      });
      setSuccessMsg(t('userUpdated'));
      setEditing(false);
      loadUser();
    } catch (err: unknown) {
      setError(getErrorMessage(err, tErrors('failedToUpdateUser')));
    } finally {
      setSaving(false);
    }
  };

  const handleToggleStatus = () => {
    if (!user) return;
    Modal.confirm({
      title: tCommon('areYouSure'),
      content: user.is_active ? t('confirmDeactivate') : t('confirmActivate'),
      okText: user.is_active ? tActions('deactivate') : tActions('activate'),
      cancelText: tActions('cancel'),
      okButtonProps: user.is_active ? { danger: true } : {},
      onOk: async () => {
        try {
          if (user.is_active) {
            await apiClient.deactivateUser(userId);
          } else {
            await apiClient.activateUser(userId);
          }
          setSuccessMsg(t('userStatusUpdated'));
          loadUser();
        } catch (err: unknown) {
          setError(getErrorMessage(err, tErrors('failedToUpdateUserStatus')));
        }
      },
    });
  };

  const formatRole = (role: string) => tRoles(role as any) || role.replace('company_', '').replace('_', ' ').replace(/\b\w/g, (c) => c.toUpperCase());

  if (loading) {
    return (
      <div className="space-y-6">
        {/* Header skeleton */}
        <div className="page-header">
          <div className="flex items-center gap-4">
            <div className="h-7 w-16 bg-gray-50 rounded animate-pulse" />
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-gray-100 animate-pulse" />
              <div className="flex items-center gap-2">
                <div className="h-5 w-20 bg-gray-100 rounded animate-pulse" />
                <div className="h-5 w-16 bg-gray-100 rounded animate-pulse" />
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <div className="h-8 w-20 bg-gray-100 rounded-lg animate-pulse" />
            <div className="h-8 w-24 bg-gray-100 rounded-lg animate-pulse" />
          </div>
        </div>
        {/* Stats skeleton */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="glass-card p-4 text-center rounded-xl">
              <div className="h-7 w-10 mx-auto bg-gray-100 rounded-lg animate-pulse" />
              <div className="h-3 w-16 mx-auto bg-gray-50 rounded mt-2 animate-pulse" />
            </div>
          ))}
        </div>
        {/* Content skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="glass-card p-6 space-y-4">
              <div className="h-5 w-36 bg-gray-100 rounded animate-pulse" />
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="h-4 w-4 bg-gray-50 rounded animate-pulse" />
                  <div className="space-y-1.5">
                    <div className="h-3 w-16 bg-gray-50 rounded animate-pulse" />
                    <div className="h-4 w-28 bg-gray-100 rounded animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="space-y-4">
            {[1, 2].map((i) => (
              <div key={i} className="glass-card p-6 space-y-3">
                <div className="h-5 w-28 bg-gray-100 rounded animate-pulse" />
                {[1, 2].map((j) => (
                  <div key={j} className="flex justify-between items-center">
                    <div className="h-3 w-16 bg-gray-50 rounded animate-pulse" />
                    <div className="h-5 w-14 bg-gray-100 rounded animate-pulse" />
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return <div className="p-6 text-gray-500">{tCommon('noDataFound')}</div>;
  }

  const initials = `${user.first_name?.[0] || ''}${user.last_name?.[0] || ''}`.toUpperCase() || '?';

  return (
    <div className="space-y-6">
      {error && (
        <Alert type="error" title={error} showIcon closable onClose={() => setError('')} className="!rounded-xl" />
      )}
      {successMsg && (
        <Alert type="success" title={successMsg} showIcon closable onClose={() => setSuccessMsg('')} className="!rounded-xl" />
      )}

      {/* Header */}
      <div className="page-header">
        <div className="flex items-center gap-4 flex-wrap">
          <Button size="small" type="text"   onClick={() => router.push('/users')}>
            <ArrowLeftOutlined style={{ marginRight: 4 }} />
            {tActions('back')}
          </Button>
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg shrink-0">
              {initials}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <Tag color={roleColors[user.role] || 'default'}>
                  <SafetyOutlined style={{ marginRight: 4 }} />
                  {formatRole(user.role)}
                </Tag>
                <Tag color={user.is_active ? 'green' : 'default'}>
                  {user.is_active ? t('active') : t('inactive')}
                </Tag>
              </div>
            </div>
          </div>
        </div>

        {canManageUsers && (
          <div className="flex flex-wrap gap-2">
            {!editing && (
              <Button type="default"  onClick={() => setEditing(true)}>
                <EditOutlined style={{ marginRight: 8 }} />
                {tActions('edit')}
              </Button>
            )}
            <Button type="primary" danger={user.is_active}
              onClick={handleToggleStatus}>
              {user.is_active ? tActions('deactivate') : tActions('activate')}
            </Button>
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {statCards.map(({ key, label, color, bg }) => (
          <div key={key} className={`glass-card p-4 text-center rounded-xl ${bg}`}>
            <div className={`text-2xl font-bold ${color}`}>
              {user[key] ?? 0}
            </div>
            <div className="text-sm text-gray-600 mt-1">{label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Info */}
        <div className="lg:col-span-2">
          <div className="glass-card p-0">
            <div className="flex flex-col space-y-1.5 p-6">
              <h3 className="text-base font-semibold leading-none tracking-tight">{t('userInformation')}</h3>
            </div>
            <div className="p-6 pt-0">
              {editing ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">{tFields('firstName')}</label>
                      <Input
                        value={editForm.first_name}
                        onChange={(e) => setEditForm({ ...editForm, first_name: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">{tFields('lastName')}</label>
                      <Input
                        value={editForm.last_name}
                        onChange={(e) => setEditForm({ ...editForm, last_name: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">{tFields('phone')}</label>
                    <Input
                      value={editForm.phone}
                      onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                      placeholder="+998..."
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">{tFields('role')}</label>
                    <Select
                      style={{ width: '100%' }}
                      value={editForm.role || undefined}
                      onChange={(val) => setEditForm({ ...editForm, role: val })}
                      options={[
                        { value: UserRole.COMPANY_ADMIN, label: tRoles('company_admin') },
                        { value: UserRole.COMPANY_MANAGER, label: tRoles('company_manager') },
                        { value: UserRole.COMPANY_OPERATOR, label: tRoles('company_operator') },
                      ]}
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={handleSave} disabled={saving}>
                      <SaveOutlined style={{ marginRight: 8 }} />
                      {saving ? tActions('saving') : tActions('save')}
                    </Button>
                    <Button type="default"  onClick={() => { setEditing(false); loadUser(); }}>
                      <CloseOutlined style={{ marginRight: 8 }} />
                      {tActions('cancel')}
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {user.phone && (
                    <div className="flex items-center gap-3">
                      <PhoneOutlined className="text-gray-400" />
                      <div>
                        <div className="text-xs text-gray-500">{tFields('phone')}</div>
                        <div className="font-medium">{user.phone}</div>
                      </div>
                    </div>
                  )}
                  <div className="flex items-center gap-3">
                    <TeamOutlined className="text-gray-400" />
                    <div>
                      <div className="text-xs text-gray-500">{tFields('role')}</div>
                      <div className="font-medium">{formatRole(user.role)}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <CalendarOutlined className="text-gray-400" />
                    <div>
                      <div className="text-xs text-gray-500">{tFields('joined')}</div>
                      <div className="font-medium">
                        {new Date(user.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <div className="glass-card p-0">
            <div className="flex flex-col space-y-1.5 p-6">
              <h3 className="text-base font-semibold leading-none tracking-tight">{tSettings('permissions')}</h3>
            </div>
            <div className="p-6 pt-0">
              {user.permissions && user.permissions.length > 0 ? (
                <div className="flex flex-wrap gap-1">
                  {user.permissions.map((perm) => (
                    <Tag key={perm}  className="text-xs">
                      {perm}
                    </Tag>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500">{tCommon('noDataFound')}</p>
              )}
            </div>
          </div>

          <div className="glass-card p-0">
            <div className="flex flex-col space-y-1.5 p-6">
              <h3 className="text-base font-semibold leading-none tracking-tight">{tFields('status')}</h3>
            </div>
            <div className="p-6 pt-0 space-y-3">
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-500">{tFields('status')}</span>
                <Tag color={user.is_active ? 'green' : 'default'}>
                  {user.is_active ? t('active') : t('inactive')}
                </Tag>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-500">{tContractStatuses('suspended')}</span>
                <Tag color={user.is_suspended ? 'red' : 'green'}>
                  {user.is_suspended ? tActions('yes') : tActions('no')}
                </Tag>
              </div>
              {user.language && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">{tSettings('language')}</span>
                  <span className="font-medium uppercase">{user.language}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
