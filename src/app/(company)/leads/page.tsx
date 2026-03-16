'use client';

import { useEffect, useState } from 'react';
import { Input, Pagination, Button, Tag, Select, Table, Segmented, message } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {
  PlusOutlined,
  UserOutlined,
  DollarOutlined,
  AppstoreOutlined,
  UnorderedListOutlined,
} from '@ant-design/icons';
import { apiClient } from '@/lib/api';
import { useAuthStore } from '@/store/auth';
import type { LeadResponse, PaginatedResponse } from '@/types/api';
import { EmptyStateCharacter } from '@/components/illustrations';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';

type ViewMode = 'cards' | 'table';

const VIEW_MODE_KEY = 'leads_view_mode';

const statusColors: Record<string, string> = {
  new: 'blue', contacted: 'gold', qualified: 'green', converted: 'purple', lost: 'red',
};

function getInitialViewMode(): ViewMode {
  if (typeof window === 'undefined') return 'table';
  return (localStorage.getItem(VIEW_MODE_KEY) as ViewMode) || 'table';
}

export default function LeadsPage() {
  const t = useTranslations('leads');
  const tActions = useTranslations('actions');
  const tErrors = useTranslations('errors');
  const tCommon = useTranslations('common');
  const tStatuses = useTranslations('statuses');
  const tFields = useTranslations('fields');
  const router = useRouter();
  const { hasPermissionString } = useAuthStore();

  const [data, setData] = useState<PaginatedResponse<LeadResponse> | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<string>('');
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

  // eslint-disable-next-line react-hooks/exhaustive-deps -- reload when filters change
  useEffect(() => { loadLeads(); }, [page, search, status]);

  const loadLeads = async () => {
    try {
      const result = await apiClient.getLeads({ page, page_size: 20, search: search || undefined, status_filter: status || undefined });
      setData(result);
    } catch (error) { console.error('Failed to load leads:', error); message.error(tErrors('failedToLoadLeads')); }
    finally { setLoading(false); }
  };

  const handleConvert = async (e: React.MouseEvent, leadId: string) => {
    e.stopPropagation();
    try {
      await apiClient.convertLead(leadId, true);
      loadLeads();
    } catch {
      message.error(tErrors('failedToConvertLead'));
    }
  };

  const columns: ColumnsType<LeadResponse> = [
    {
      title: tFields('title'),
      dataIndex: 'title',
      key: 'title',
      sorter: (a, b) => a.title.localeCompare(b.title),
      render: (value: string) => <span className="font-medium">{value}</span>,
    },
    {
      title: tFields('contact'),
      dataIndex: 'contact_name',
      key: 'contact_name',
      responsive: ['md'],
      render: (value: string | null) =>
        value ? (
          <span className="flex items-center gap-1"><UserOutlined className="text-xs text-gray-400" /> {value}</span>
        ) : <span className="text-gray-300">-</span>,
    },
    {
      title: tFields('status'),
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (value: string | null) =>
        value ? <Tag color={statusColors[value.toLowerCase()] || 'default'}>{value}</Tag> : <span className="text-gray-300">-</span>,
    },
    {
      title: tFields('estimatedValue'),
      dataIndex: 'estimated_value',
      key: 'estimated_value',
      responsive: ['lg'],
      width: 130,
      align: 'right',
      render: (value: number | null) =>
        value ? <span className="font-semibold text-green-600">${value.toLocaleString()}</span> : <span className="text-gray-300">-</span>,
    },
    {
      title: tFields('assignedTo'),
      dataIndex: 'assigned_to_name',
      key: 'assigned_to_name',
      responsive: ['xl'],
      render: (value: string | null) => value || <span className="text-gray-300">-</span>,
    },
    {
      title: tFields('created'),
      dataIndex: 'created_at',
      key: 'created_at',
      responsive: ['xl'],
      width: 110,
      render: (value: string) => new Date(value).toLocaleDateString(),
    },
    {
      title: '',
      key: 'actions',
      width: 160,
      render: (_, record) => (
        <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
          <Link href={`/leads/${record.id}`}>
            <Button size="small">{tActions('view')}</Button>
          </Link>
          {record.status !== 'converted' && hasPermissionString('leads.write') && hasPermissionString('deals.write') && (
            <Button size="small" type="primary" onClick={(e) => handleConvert(e, record.id)}>{tActions('convert')}</Button>
          )}
        </div>
      ),
    },
  ];

  if (loading) return (
    <div className="space-y-6">
      <div className="page-header">
        <div className="h-9 w-28 bg-gray-100 rounded-lg animate-pulse" />
      </div>
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="h-10 w-full md:max-w-lg bg-gray-50 rounded-lg animate-pulse" />
        <div className="h-10 w-full sm:w-44 bg-gray-50 rounded-lg animate-pulse" />
      </div>
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="glass-card p-5 border-l-4 border-l-gray-100">
            <div className="flex items-start justify-between mb-3">
              <div>
                <div className="h-4 w-32 bg-gray-100 rounded animate-pulse" />
                <div className="h-3 w-24 bg-gray-50 rounded mt-2 animate-pulse" />
              </div>
              <div className="h-5 w-16 bg-gray-100 rounded animate-pulse" />
            </div>
            <div className="space-y-2">
              <div className="h-4 w-20 bg-gray-50 rounded animate-pulse" />
              <div className="h-3 w-28 bg-gray-50 rounded animate-pulse" />
              <div className="flex gap-2 pt-2">
                <div className="h-8 flex-1 bg-gray-100 rounded-lg animate-pulse" />
                <div className="h-8 w-20 bg-gray-100 rounded-lg animate-pulse" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="page-header">
        {hasPermissionString('leads.write') && (
          <Link href="/leads/new"><Button type="primary" icon={<PlusOutlined />}>{t('addLead')}</Button></Link>
        )}
      </div>
      <p className="page-subtitle">{t('subtitle')}</p>

      <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
        <Input.Search placeholder={t('searchLeads')} value={searchInput} onChange={(e) => { const v = e.target.value; setSearchInput(v); if (!v) { setSearch(''); setPage(1); } }} allowClear size="large" className="w-full md:max-w-lg" />
        <Select value={status || undefined} onChange={(v) => { setStatus(v || ''); setPage(1); }} placeholder={tCommon('allStatuses')} allowClear className="w-full sm:w-[180px]" size="large"
          options={[{ label: tStatuses('new'), value: 'new' }, { label: tStatuses('contacted'), value: 'contacted' }, { label: tStatuses('qualified'), value: 'qualified' }, { label: tStatuses('converted'), value: 'converted' }, { label: tStatuses('lost'), value: 'lost' }]}
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
          <Table<LeadResponse>
            columns={columns}
            dataSource={data?.items ?? []}
            rowKey="id"
            pagination={false}
            onRow={(record) => ({
              onClick: () => router.push(`/leads/${record.id}`),
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
            {data?.items.map((lead) => (
              <div key={lead.id} className="glass-card p-5 border-l-4 border-l-blue-500 hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-gray-900">{lead.title}</h3>
                    {lead.contact_name && <p className="text-sm text-gray-500 flex items-center gap-1 mt-1"><UserOutlined className="text-xs" /> {lead.contact_name}</p>}
                  </div>
                  {lead.status && <Tag color={statusColors[lead.status.toLowerCase()] || 'default'}>{lead.status}</Tag>}
                </div>
                <div className="space-y-2">
                  {lead.estimated_value && <div className="flex items-center text-sm gap-1"><DollarOutlined className="text-green-600" /><span className="font-semibold text-green-600">${lead.estimated_value.toLocaleString()}</span></div>}
                  {lead.pipeline_stage && <p className="text-sm text-gray-600">{tFields('stage')}: <span className="font-medium">{lead.pipeline_stage}</span></p>}
                  {lead.assigned_to_name && <p className="text-sm text-gray-600">{tFields('assigned')}: <span className="font-medium">{lead.assigned_to_name}</span></p>}
                  {lead.source && <Tag className="!mt-1">{lead.source}</Tag>}
                  <div className="flex gap-2 pt-2">
                    <Link href={`/leads/${lead.id}`} className="flex-1"><Button block>{tActions('view')}</Button></Link>
                    {lead.status !== 'converted' && hasPermissionString('leads.write') && hasPermissionString('deals.write') && <Button type="primary" onClick={(e) => handleConvert(e, lead.id)}>{tActions('convert')}</Button>}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {data && data.total_pages > 1 && <div className="flex justify-center"><Pagination current={page} total={data.total} pageSize={20} onChange={(p) => setPage(p)} showSizeChanger={false} /></div>}
        </>
      )}

      {data?.items.length === 0 && (
        <div className="glass-card py-16 flex flex-col items-center justify-center">
          <EmptyStateCharacter height={115} variant="no-results" />
          <h3 className="mt-5 text-lg font-semibold text-gray-800">{t('noLeadsFound')}</h3>
          <p className="text-sm text-gray-400 mt-1 max-w-xs text-center">
            {search || status ? tCommon('tryAdjustingFilters') : t('getStarted')}
          </p>
          {!search && !status && hasPermissionString('leads.write') && (
            <Link href="/leads/new">
              <Button type="primary" icon={<PlusOutlined />} className="mt-4">{t('addLead')}</Button>
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
