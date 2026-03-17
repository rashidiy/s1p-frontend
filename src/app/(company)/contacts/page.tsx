'use client';

import { useEffect, useState } from 'react';
import { Input, Pagination, Button, Tag, Table, Segmented, message } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {
  UserOutlined,
  PlusOutlined,
  MailOutlined,
  PhoneOutlined,
  BankOutlined,
  AppstoreOutlined,
  UnorderedListOutlined,
} from '@ant-design/icons';
import { apiClient } from '@/lib/api';
import { useAuthStore } from '@/store/auth';
import type { ContactResponse, PaginatedResponse } from '@/types/api';
import { EmptyStateCharacter } from '@/components/illustrations';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';

type ViewMode = 'cards' | 'table';

const VIEW_MODE_KEY = 'contacts_view_mode';

function getInitialViewMode(): ViewMode {
  if (typeof window === 'undefined') return 'table';
  return (localStorage.getItem(VIEW_MODE_KEY) as ViewMode) || 'table';
}

export default function ContactsPage() {
  const t = useTranslations('contacts');
  const tActions = useTranslations('actions');
  const tErrors = useTranslations('errors');
  const tCommon = useTranslations('common');
  const tFields = useTranslations('fields');
  const router = useRouter();
  const { hasPermissionString } = useAuthStore();

  const [data, setData] = useState<PaginatedResponse<ContactResponse> | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [viewMode, setViewMode] = useState<ViewMode>('table');

  useEffect(() => {
    setViewMode(getInitialViewMode());
  }, []);

  const handleViewChange = (value: ViewMode) => {
    setViewMode(value);
    localStorage.setItem(VIEW_MODE_KEY, value);
  };

  useEffect(() => {
    if (!searchInput) return;
    const timer = setTimeout(() => {
      setSearch(searchInput);
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => {
    loadContacts();
  // eslint-disable-next-line react-hooks/exhaustive-deps -- reload when filters change
  }, [page, search]);

  const loadContacts = async () => {
    try {
      const result = await apiClient.getContacts({
        page,
        page_size: 20,
        search: search || undefined,
      });
      setData(result);
    } catch (error) {
      message.error(tErrors('failedToLoadContacts'));
    } finally {
      setLoading(false);
    }
  };

  const columns: ColumnsType<ContactResponse> = [
    {
      title: tFields('name'),
      key: 'name',
      sorter: (a, b) => `${a.first_name || ''} ${a.last_name || ''}`.localeCompare(`${b.first_name || ''} ${b.last_name || ''}`),
      render: (_, record) => (
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-crm-indigo-100 shrink-0">
            <UserOutlined className="text-crm-indigo-600 text-xs" />
          </div>
          <span className="font-medium">{record.first_name || ''} {record.last_name || ''}</span>
        </div>
      ),
    },
    {
      title: tFields('company'),
      dataIndex: 'company_name',
      key: 'company_name',
      responsive: ['md'],
      render: (value: string | null) => value || <span className="text-gray-300">-</span>,
    },
    {
      title: tFields('email'),
      dataIndex: 'email',
      key: 'email',
      responsive: ['lg'],
      render: (value: string | null) =>
        value ? <a href={`mailto:${value}`} className="text-blue-600 hover:underline">{value}</a> : <span className="text-gray-300">-</span>,
    },
    {
      title: tFields('phone'),
      dataIndex: 'phone',
      key: 'phone',
      responsive: ['lg'],
      render: (value: string | null) =>
        value ? <a href={`tel:${value}`} className="text-blue-600 hover:underline">{value}</a> : <span className="text-gray-300">-</span>,
    },
    {
      title: t('leadsCount', { count: '' }).trim(),
      key: 'leads',
      responsive: ['xl'],
      width: 90,
      align: 'center',
      render: (_, record) =>
        (record.total_leads ?? 0) > 0 ? <Tag color="blue">{record.total_leads}</Tag> : <span className="text-gray-300">0</span>,
    },
    {
      title: t('dealsCount', { count: '' }).trim(),
      key: 'deals',
      responsive: ['xl'],
      width: 90,
      align: 'center',
      render: (_, record) =>
        (record.total_deals ?? 0) > 0 ? <Tag color="green">{record.total_deals}</Tag> : <span className="text-gray-300">0</span>,
    },
    {
      title: '',
      key: 'actions',
      width: 120,
      render: (_, record) => (
        <Link href={`/contacts/${record.id}`}>
          <Button size="small">{tActions('viewDetails')}</Button>
        </Link>
      ),
    },
  ];

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="page-header">
          <div className="h-9 w-32 bg-gray-100 rounded-lg animate-pulse" />
        </div>
        <div className="h-10 w-full md:max-w-lg bg-gray-50 rounded-lg animate-pulse" />
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="glass-card p-5 border-l-4 border-l-gray-100">
              <div className="flex items-center gap-3 mb-3">
                <div className="h-10 w-10 rounded-full bg-gray-100 animate-pulse" />
                <div>
                  <div className="h-4 w-28 bg-gray-100 rounded animate-pulse" />
                  <div className="h-3 w-20 bg-gray-50 rounded mt-1.5 animate-pulse" />
                </div>
              </div>
              <div className="space-y-2">
                <div className="h-3 w-40 bg-gray-50 rounded animate-pulse" />
                <div className="h-3 w-32 bg-gray-50 rounded animate-pulse" />
                <div className="h-8 w-full bg-gray-100 rounded-lg mt-3 animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="page-header">
        {hasPermissionString('contacts.write') && (
          <Link href="/contacts/new">
            <Button type="primary" icon={<PlusOutlined />}>{t('addContact')}</Button>
          </Link>
        )}
      </div>
      <p className="page-subtitle">{t('subtitle')}</p>

      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <Input.Search
          placeholder={t('searchContacts')}
          value={searchInput}
          onChange={(e) => {
            const v = e.target.value;
            setSearchInput(v);
            if (!v) { setSearch(''); setPage(1); }
          }}
          allowClear
          size="large"
          className="w-full md:max-w-lg"
        />
        <Segmented
          value={viewMode}
          onChange={(value) => handleViewChange(value as ViewMode)}
          options={[
            { label: tCommon('cardView'), value: 'cards', icon: <AppstoreOutlined /> },
            { label: tCommon('tableView'), value: 'table', icon: <UnorderedListOutlined /> },
          ]}
        />
      </div>

      {viewMode === 'table' ? (
        <>
          <Table<ContactResponse>
            columns={columns}
            dataSource={data?.items ?? []}
            rowKey="id"
            pagination={false}
            onRow={(record) => ({
              onClick: () => router.push(`/contacts/${record.id}`),
              style: { cursor: 'pointer' },
            })}
            size="middle"
            scroll={{ x: 600 }}
          />
          {data && data.total_pages > 1 && (
            <div className="flex justify-center">
              <Pagination current={page} total={data.total} pageSize={20} onChange={(p) => setPage(p)} showSizeChanger={false} />
            </div>
          )}
        </>
      ) : (
        <>
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {data?.items.map((contact) => (
              <div key={contact.id} className="glass-card p-5 border-l-4 border-l-crm-indigo-500 hover:shadow-lg transition-shadow">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-crm-indigo-100">
                    <UserOutlined className="text-crm-indigo-600" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold text-gray-900 truncate">
                      {contact.first_name || ''} {contact.last_name || ''}
                    </h3>
                    {contact.company_name && (
                      <p className="text-sm text-gray-500 flex items-center gap-1 truncate">
                        <BankOutlined className="text-xs" /> {contact.company_name}
                      </p>
                    )}
                  </div>
                </div>
                <div className="space-y-2">
                  {contact.email && (
                    <div className="flex items-center text-sm text-gray-600 gap-2">
                      <MailOutlined /> <span className="truncate">{contact.email}</span>
                    </div>
                  )}
                  {contact.phone && (
                    <div className="flex items-center text-sm text-gray-600 gap-2">
                      <PhoneOutlined /> <span>{contact.phone}</span>
                    </div>
                  )}
                  <div className="flex flex-wrap gap-1 pt-1">
                    {(contact.total_leads ?? 0) > 0 && <Tag color="blue">{t('leadsCount', { count: contact.total_leads })}</Tag>}
                    {(contact.total_deals ?? 0) > 0 && <Tag color="green">{t('dealsCount', { count: contact.total_deals })}</Tag>}
                    {(contact.total_calls ?? 0) > 0 && <Tag>{t('callsCount', { count: contact.total_calls })}</Tag>}
                  </div>
                  <Link href={`/contacts/${contact.id}`}>
                    <Button block className="!mt-3">{tActions('viewDetails')}</Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>

          {data && data.total_pages > 1 && (
            <div className="flex justify-center">
              <Pagination current={page} total={data.total} pageSize={20} onChange={(p) => setPage(p)} showSizeChanger={false} />
            </div>
          )}
        </>
      )}

      {data?.items.length === 0 && (
        <div className="glass-card py-16 flex flex-col items-center justify-center">
          <EmptyStateCharacter height={115} variant="no-contacts" />
          <h3 className="mt-5 text-lg font-semibold text-gray-800">{t('noContactsFound')}</h3>
          <p className="text-sm text-gray-400 mt-1 max-w-xs text-center">
            {search ? tCommon('tryAdjustingSearch') : t('getStarted')}
          </p>
          {!search && hasPermissionString('contacts.write') && (
            <Link href="/contacts/new">
              <Button type="primary" icon={<PlusOutlined />} className="mt-4">{t('addContact')}</Button>
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
