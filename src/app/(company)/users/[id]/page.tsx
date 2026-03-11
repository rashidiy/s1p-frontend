'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeftOutlined,
  EditOutlined,
  SaveOutlined,
  CloseOutlined,
  PhoneOutlined,
  MailOutlined,
  TeamOutlined,
  SafetyOutlined,
  CalendarOutlined,
} from '@ant-design/icons';
import { Alert, Button, Input, Select, Spin, Tag } from 'antd';
import { apiClient } from '@/lib/api';
import { useAuthStore } from '@/store/auth';
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
      setError('Failed to load user details');
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
      setSuccessMsg('User updated successfully');
      setEditing(false);
      loadUser();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to update user');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleStatus = async () => {
    if (!user) return;
    if (!confirm(`${user.is_active ? 'Deactivate' : 'Activate'} this user?`)) return;
    try {
      if (user.is_active) {
        await apiClient.deactivateUser(userId);
      } else {
        await apiClient.activateUser(userId);
      }
      setSuccessMsg(`User ${user.is_active ? 'deactivated' : 'activated'} successfully`);
      loadUser();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to update user status');
    }
  };

  const formatRole = (role: string) =>
    role.replace('company_', '').replace('_', ' ').replace(/\b\w/g, (c) => c.toUpperCase());

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spin size="large" />
      </div>
    );
  }

  if (!user) {
    return <div className="p-6 text-gray-500">User not found</div>;
  }

  const initials = `${user.first_name?.[0] || ''}${user.last_name?.[0] || ''}`.toUpperCase() || '?';

  return (
    <div className="space-y-6">
      {error && (
        <Alert type="error" message={error} showIcon closable onClose={() => setError('')} className="!rounded-xl" />
      )}
      {successMsg && (
        <Alert type="success" message={successMsg} showIcon closable onClose={() => setSuccessMsg('')} className="!rounded-xl" />
      )}

      {/* Header */}
      <div className="page-header">
        <div className="flex items-center gap-4 flex-wrap">
          <Button size="small" type="text"   onClick={() => router.push('/users')}>
            <ArrowLeftOutlined style={{ marginRight: 4 }} />
            Back
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
                  {user.is_active ? 'Active' : 'Inactive'}
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
                Edit
              </Button>
            )}
            <Button type="primary" danger={user.is_active}
              onClick={handleToggleStatus}>
              {user.is_active ? 'Deactivate' : 'Activate'}
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
              <h3 className="text-base font-semibold leading-none tracking-tight">User Information</h3>
            </div>
            <div className="p-6 pt-0">
              {editing ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">First Name</label>
                      <Input
                        value={editForm.first_name}
                        onChange={(e) => setEditForm({ ...editForm, first_name: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Last Name</label>
                      <Input
                        value={editForm.last_name}
                        onChange={(e) => setEditForm({ ...editForm, last_name: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Phone</label>
                    <Input
                      value={editForm.phone}
                      onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                      placeholder="+998..."
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Role</label>
                    <Select
                      style={{ width: '100%' }}
                      value={editForm.role || undefined}
                      onChange={(val) => setEditForm({ ...editForm, role: val })}
                      options={[
                        { value: UserRole.COMPANY_ADMIN, label: 'Admin' },
                        { value: UserRole.COMPANY_MANAGER, label: 'Manager' },
                        { value: UserRole.COMPANY_OPERATOR, label: 'Operator' },
                      ]}
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={handleSave} disabled={saving}>
                      <SaveOutlined style={{ marginRight: 8 }} />
                      {saving ? 'Saving...' : 'Save'}
                    </Button>
                    <Button type="default"  onClick={() => { setEditing(false); loadUser(); }}>
                      <CloseOutlined style={{ marginRight: 8 }} />
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <MailOutlined className="text-gray-400" />
                    <div>
                      <div className="text-xs text-gray-500">Email</div>
                      <div className="font-medium">{user.email}</div>
                    </div>
                  </div>
                  {user.phone && (
                    <div className="flex items-center gap-3">
                      <PhoneOutlined className="text-gray-400" />
                      <div>
                        <div className="text-xs text-gray-500">Phone</div>
                        <div className="font-medium">{user.phone}</div>
                      </div>
                    </div>
                  )}
                  <div className="flex items-center gap-3">
                    <TeamOutlined className="text-gray-400" />
                    <div>
                      <div className="text-xs text-gray-500">Role</div>
                      <div className="font-medium">{formatRole(user.role)}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <CalendarOutlined className="text-gray-400" />
                    <div>
                      <div className="text-xs text-gray-500">Joined</div>
                      <div className="font-medium">
                        {new Date(user.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  {user.email_verified !== undefined && (
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-gray-500">Email verified:</span>
                      <Tag color={user.email_verified ? 'blue' : undefined}>
                        {user.email_verified ? 'Yes' : 'No'}
                      </Tag>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <div className="glass-card p-0">
            <div className="flex flex-col space-y-1.5 p-6">
              <h3 className="text-base font-semibold leading-none tracking-tight">Permissions</h3>
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
                <p className="text-sm text-gray-500">Using role defaults</p>
              )}
            </div>
          </div>

          <div className="glass-card p-0">
            <div className="flex flex-col space-y-1.5 p-6">
              <h3 className="text-base font-semibold leading-none tracking-tight">Account Status</h3>
            </div>
            <div className="p-6 pt-0 space-y-3">
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-500">Status</span>
                <Tag color={user.is_active ? 'green' : 'default'}>
                  {user.is_active ? 'Active' : 'Inactive'}
                </Tag>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-500">Suspended</span>
                <Tag color={user.is_suspended ? 'red' : 'green'}>
                  {user.is_suspended ? 'Yes' : 'No'}
                </Tag>
              </div>
              {user.language && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Language</span>
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
