'use client';

import { useEffect, useState, useCallback } from 'react';
import { Input, Pagination, Button, Tag, message, Table, Modal, Select, Tabs } from 'antd';
import { SafetyOutlined, SendOutlined, DeleteOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import { apiClient } from '@/lib/api';
import { useAuthStore } from '@/store/auth';
import { useTranslations } from 'next-intl';
import { UserRole } from '@/types/api';
import type { UserListResponse, InviteTokenListItem, PaginatedResponse } from '@/types/api';
import { EmptyStateCharacter } from '@/components/illustrations';
import { formatDateTime } from '@/lib/utils';
import Link from 'next/link';
import Image from 'next/image';

const roleColors: Record<string, string> = {
  [UserRole.COMPANY_ADMIN]: 'purple',
  [UserRole.COMPANY_MANAGER]: 'blue',
  [UserRole.COMPANY_OPERATOR]: 'green',
};

const inviteStatusColors: Record<string, string> = {
  pending: 'processing',
  used: 'success',
  expired: 'default',
};

export default function UsersPage() {
  const [data, setData] = useState<UserListResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const { hasPermission } = useAuthStore();
  const canManageUsers = hasPermission(UserRole.COMPANY_ADMIN);
  const t = useTranslations('users');
  const tFields = useTranslations('fields');
  const tActions = useTranslations('actions');
  const tErrors = useTranslations('errors');
  const tCommon = useTranslations('common');
  const tRoles = useTranslations('roles');

  // Invite tokens state
  const [inviteTokens, setInviteTokens] = useState<PaginatedResponse<InviteTokenListItem> | null>(null);
  const [inviteLoading, setInviteLoading] = useState(false);
  const [invitePage, setInvitePage] = useState(1);
  const [inviteStatusFilter, setInviteStatusFilter] = useState<string | undefined>(undefined);

  const loadUsers = useCallback(async () => {
    try {
      const result = await apiClient.getUsers({ page, page_size: 20, search: search || undefined });
      setData(result);
    } catch (error) { console.error('Failed to load users:', error); message.error(tErrors('failedToLoadUsers')); }
    finally { setLoading(false); }
  // eslint-disable-next-line react-hooks/exhaustive-deps -- tErrors is a stable reference from next-intl
  }, [page, search]);

  const loadInviteTokens = useCallback(async () => {
    if (!canManageUsers) return;
    setInviteLoading(true);
    try {
      const result = await apiClient.getInviteTokens({
        page: invitePage,
        page_size: 10,
        status: inviteStatusFilter,
      });
      setInviteTokens(result);
    } catch (error) {
      console.error('Failed to load invite tokens:', error);
    } finally {
      setInviteLoading(false);
    }
  }, [invitePage, inviteStatusFilter, canManageUsers]);

  useEffect(() => { loadUsers(); }, [loadUsers]);
  useEffect(() => { loadInviteTokens(); }, [loadInviteTokens]);

  const toggleUserStatus = async (userId: string, isActive: boolean) => {
    try { if (isActive) await apiClient.deactivateUser(userId); else await apiClient.activateUser(userId); loadUsers(); } catch { message.error(tErrors('failedToUpdateUserStatus')); }
  };

  const handleRevokeToken = (tokenId: string) => {
    Modal.confirm({
      title: t('telegramRevokeConfirm'),
      icon: <ExclamationCircleOutlined />,
      okText: tActions('confirm'),
      okButtonProps: { danger: true },
      cancelText: tActions('cancel'),
      onOk: async () => {
        try {
          await apiClient.revokeInviteToken(tokenId);
          message.success(t('telegramTokenRevoked'));
          loadInviteTokens();
        } catch (err: unknown) {
          message.error(t('telegramRevokeFailed'));
        }
      },
    });
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

  const inviteColumns = [
    {
      title: tFields('firstName'),
      dataIndex: 'first_name',
      key: 'first_name',
      render: (_: string, record: InviteTokenListItem) => (
        <span>{record.first_name} {record.last_name || ''}</span>
      ),
    },
    {
      title: tFields('phone'),
      dataIndex: 'phone',
      key: 'phone',
    },
    {
      title: tFields('role'),
      dataIndex: 'role',
      key: 'role',
      render: (role: string) => (
        <Tag color={roleColors[role] || 'default'}>{formatRole(role)}</Tag>
      ),
    },
    {
      title: tFields('status'),
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={inviteStatusColors[status] || 'default'}>
          {t(`telegramInviteStatus_${status}`)}
        </Tag>
      ),
    },
    {
      title: tFields('created'),
      dataIndex: 'created_at',
      key: 'created_at',
      render: (date: string) => formatDateTime(date),
    },
    {
      title: '',
      key: 'actions',
      render: (_: unknown, record: InviteTokenListItem) => (
        record.status === 'pending' && (
          <Button
            danger
            size="small"
            icon={<DeleteOutlined />}
            onClick={() => handleRevokeToken(record.id)}
          >
            {t('telegramRevoke')}
          </Button>
        )
      ),
    },
  ];

  const usersContent = (
    <>
      <Input.Search placeholder={t('searchUsers')} value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} allowClear size="large" className="w-full md:max-w-lg" />

      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {data?.items.map((user) => (
          <div key={user.id} className="glass-card p-5 border-l-4 border-l-crm-indigo-400 hover:shadow-lg transition-shadow">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center space-x-3">
                {user.avatar_url ? (
                  <Image src={user.avatar_url} alt={`${user.first_name} ${user.last_name || ''}`.trim()} width={40} height={40} className="h-10 w-10 rounded-full object-cover" />
                ) : (
                  <div className="h-10 w-10 rounded-full bg-crm-indigo-100 flex items-center justify-center text-crm-indigo-600 font-semibold text-sm">
                    {user.first_name?.[0]?.toUpperCase()}{user.last_name?.[0]?.toUpperCase() || ''}
                  </div>
                )}
                <div>
                  <h3 className="font-semibold text-gray-900">{user.first_name} {user.last_name}</h3>
                  {user.phone && (
                    <p className="text-sm text-gray-500">{user.phone}</p>
                  )}
                </div>
              </div>
              <Tag color={user.is_active ? 'green' : 'default'}>{user.is_active ? t('active') : t('inactive')}</Tag>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">{tFields('role')}</span>
                <Tag color={roleColors[user.role] || 'default'} className="flex items-center gap-1"><SafetyOutlined /> {formatRole(user.role)}</Tag>
              </div>
              {user.phone && <div className="flex items-center justify-between text-sm"><span className="text-gray-600">{tFields('phone')}</span><span className="font-medium">{user.phone}</span></div>}
              <div className="flex items-center justify-between text-sm"><span className="text-gray-600">{tFields('joined')}</span><span className="font-medium">{new Date(user.created_at).toLocaleDateString()}</span></div>
              {canManageUsers && (
                <div className="flex gap-2 pt-2">
                  <Link href={`/users/${user.id}`} className="flex-1"><Button block>{tActions('view')}</Button></Link>
                  <Button danger={user.is_active} onClick={() => toggleUserStatus(user.id, user.is_active)}>
                    {user.is_active ? tActions('deactivate') : tActions('activate')}
                  </Button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {data && totalPages > 1 && <div className="flex justify-center"><Pagination current={page} total={data.total} pageSize={20} onChange={(p) => setPage(p)} showSizeChanger={false} /></div>}

      {data?.items.length === 0 && (
        <div className="glass-card py-12 flex flex-col items-center justify-center">
          <EmptyStateCharacter height={115} variant="default" />
          <p className="mt-4 text-lg font-medium text-gray-700">{t('noUsersFound')}</p>
          <p className="text-sm text-gray-500">{search ? tCommon('tryAdjustingSearch') : t('getStarted')}</p>
        </div>
      )}
    </>
  );

  const invitesContent = (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Select
          value={inviteStatusFilter || 'all'}
          onChange={(v) => { setInviteStatusFilter(v === 'all' ? undefined : v); setInvitePage(1); }}
          style={{ width: 160 }}
          options={[
            { value: 'all', label: tCommon('all') },
            { value: 'pending', label: t('telegramInviteStatus_pending') },
            { value: 'used', label: t('telegramInviteStatus_used') },
            { value: 'expired', label: t('telegramInviteStatus_expired') },
          ]}
        />
      </div>

      <Table
        columns={inviteColumns}
        dataSource={inviteTokens?.items || []}
        rowKey="id"
        loading={inviteLoading}
        pagination={
          inviteTokens && inviteTokens.total > 10
            ? {
                current: invitePage,
                total: inviteTokens.total,
                pageSize: 10,
                onChange: (p) => setInvitePage(p),
                showSizeChanger: false,
              }
            : false
        }
        locale={{ emptyText: t('telegramNoInvites') }}
        scroll={{ x: 'max-content' }}
      />
    </div>
  );

  const tabItems = [
    {
      key: 'users',
      label: t('title'),
      children: <div className="space-y-6">{usersContent}</div>,
    },
  ];

  if (canManageUsers) {
    tabItems.push({
      key: 'invites',
      label: t('telegramInvitesTab'),
      children: invitesContent,
    });
  }

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div className="flex gap-2">
          {canManageUsers && (
            <Link href="/users/invite-telegram"><Button type="primary" icon={<SendOutlined />}>{t('telegramInviteUser')}</Button></Link>
          )}
        </div>
      </div>
      <p className="page-subtitle">{t('subtitle')}</p>

      {canManageUsers ? (
        <Tabs items={tabItems} defaultActiveKey="users" />
      ) : (
        <div className="space-y-6">{usersContent}</div>
      )}
    </div>
  );
}
