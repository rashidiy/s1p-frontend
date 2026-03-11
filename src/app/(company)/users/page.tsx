'use client';

import { useEffect, useState, useCallback } from 'react';
import { Input, Pagination, Button, Tag, message } from 'antd';
import { TeamOutlined, PlusOutlined, MailOutlined, SafetyOutlined } from '@ant-design/icons';
import { apiClient } from '@/lib/api';
import { useAuthStore } from '@/store/auth';
import { UserRole } from '@/types/api';
import type { UserListResponse } from '@/types/api';
import { EmptyStateCharacter } from '@/components/illustrations';
import Link from 'next/link';

const roleColors: Record<string, string> = {
  [UserRole.COMPANY_ADMIN]: 'purple',
  [UserRole.COMPANY_MANAGER]: 'blue',
  [UserRole.COMPANY_OPERATOR]: 'green',
};

export default function UsersPage() {
  const [data, setData] = useState<UserListResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const { hasPermission } = useAuthStore();
  const canManageUsers = hasPermission(UserRole.COMPANY_ADMIN);

  const loadUsers = useCallback(async () => {
    try {
      const result = await apiClient.getUsers({ page, page_size: 20, search: search || undefined });
      setData(result);
    } catch (error) { console.error('Failed to load users:', error); message.error('Failed to load users'); }
    finally { setLoading(false); }
  }, [page, search]);

  useEffect(() => { loadUsers(); }, [loadUsers]);

  const toggleUserStatus = async (userId: string, isActive: boolean) => {
    try { if (isActive) await apiClient.deactivateUser(userId); else await apiClient.activateUser(userId); loadUsers(); } catch { message.error('Failed to update user status'); }
  };

  const formatRole = (role: string) => role.replace('company_', '').replace('_', ' ').toUpperCase();

  if (loading) return (
    <div className="space-y-6">
      <div className="page-header">
        <div className="h-9 w-28 bg-gray-100 rounded-lg animate-pulse" />
      </div>
      <div className="h-10 w-full md:max-w-lg bg-gray-50 rounded-lg animate-pulse" />
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="glass-card p-5 space-y-3">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-gray-100 rounded-full animate-pulse" />
              <div className="space-y-1.5">
                <div className="h-4 w-28 bg-gray-100 rounded animate-pulse" />
                <div className="h-3 w-36 bg-gray-50 rounded animate-pulse" />
              </div>
            </div>
            <div className="h-5 w-16 bg-gray-50 rounded animate-pulse" />
          </div>
        ))}
      </div>
    </div>
  );

  const totalPages = data ? Math.ceil(data.total / data.page_size) : 1;

  return (
    <div className="space-y-6">
      <div className="page-header">
        {canManageUsers && <Link href="/users/invite"><Button type="primary" icon={<PlusOutlined />}>Invite User</Button></Link>}
      </div>
      <p className="page-subtitle">Manage user accounts and permissions</p>

      <Input.Search placeholder="Search users..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} allowClear size="large" className="w-full md:max-w-lg" />

      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {data?.users.map((user) => (
          <div key={user.id} className="glass-card p-5 border-l-4 border-l-crm-indigo-400 hover:shadow-lg transition-shadow">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center space-x-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-crm-indigo-100">
                  <TeamOutlined className="text-crm-indigo-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{user.first_name} {user.last_name}</h3>
                  <p className="text-sm text-gray-500 flex items-center gap-1"><MailOutlined className="text-xs" /> {user.email}</p>
                </div>
              </div>
              <Tag color={user.is_active ? 'green' : 'default'}>{user.is_active ? 'Active' : 'Inactive'}</Tag>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Role</span>
                <Tag color={roleColors[user.role] || 'default'} className="flex items-center gap-1"><SafetyOutlined /> {formatRole(user.role)}</Tag>
              </div>
              {user.phone && <div className="flex items-center justify-between text-sm"><span className="text-gray-600">Phone</span><span className="font-medium">{user.phone}</span></div>}
              <div className="flex items-center justify-between text-sm"><span className="text-gray-600">Joined</span><span className="font-medium">{new Date(user.created_at).toLocaleDateString()}</span></div>
              {canManageUsers && (
                <div className="flex gap-2 pt-2">
                  <Link href={`/users/${user.id}`} className="flex-1"><Button block>View</Button></Link>
                  <Button danger={user.is_active} onClick={() => toggleUserStatus(user.id, user.is_active)}>
                    {user.is_active ? 'Deactivate' : 'Activate'}
                  </Button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {data && totalPages > 1 && <div className="flex justify-center"><Pagination current={page} total={data.total} pageSize={20} onChange={(p) => setPage(p)} showSizeChanger={false} /></div>}

      {data?.users.length === 0 && (
        <div className="glass-card py-12 flex flex-col items-center justify-center">
          <EmptyStateCharacter width={160} height={160} variant="default" />
          <p className="mt-4 text-lg font-medium text-gray-700">No users found</p>
          <p className="text-sm text-gray-500">{search ? 'Try adjusting your search' : 'Get started by inviting team members'}</p>
        </div>
      )}
    </div>
  );
}
