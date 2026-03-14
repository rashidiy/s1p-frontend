'use client';

import { useEffect, useState } from 'react';
import { Input, Pagination, Button, Tag, Select, message } from 'antd';
import { PlusOutlined, UserOutlined, DollarOutlined } from '@ant-design/icons';
import { apiClient } from '@/lib/api';
import type { LeadResponse, PaginatedResponse } from '@/types/api';
import { EmptyStateCharacter } from '@/components/illustrations';
import Link from 'next/link';
import { useTranslations } from 'next-intl';

const statusColors: Record<string, string> = {
  new: 'blue', contacted: 'gold', qualified: 'green', converted: 'purple', lost: 'red',
};

export default function LeadsPage() {
  const t = useTranslations('leads');
  const tActions = useTranslations('actions');
  const tErrors = useTranslations('errors');
  const tCommon = useTranslations('common');
  const tStatuses = useTranslations('statuses');
  const tFields = useTranslations('fields');

  const [data, setData] = useState<PaginatedResponse<LeadResponse> | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<string>('');
  const [page, setPage] = useState(1);

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput);
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => { loadLeads(); }, [page, search, status]);

  const loadLeads = async () => {
    try {
      const result = await apiClient.getLeads({ page, page_size: 20, search: search || undefined, status_filter: status || undefined });
      setData(result);
    } catch (error) { console.error('Failed to load leads:', error); message.error(tErrors('failedToLoadLeads')); }
    finally { setLoading(false); }
  };

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
        <Link href="/leads/new"><Button type="primary" icon={<PlusOutlined />}>{t('addLead')}</Button></Link>
      </div>
      <p className="page-subtitle">{t('subtitle')}</p>

      <div className="flex flex-col sm:flex-row gap-3">
        <Input.Search placeholder={t('searchLeads')} value={searchInput} onChange={(e) => setSearchInput(e.target.value)} allowClear size="large" className="w-full md:max-w-lg" />
        <Select value={status || undefined} onChange={(v) => { setStatus(v || ''); setPage(1); }} placeholder={tCommon('allStatuses')} allowClear className="w-full sm:w-[180px]" size="large"
          options={[{ label: tStatuses('new'), value: 'new' }, { label: tStatuses('contacted'), value: 'contacted' }, { label: tStatuses('qualified'), value: 'qualified' }, { label: tStatuses('converted'), value: 'converted' }, { label: tStatuses('lost'), value: 'lost' }]}
        />
      </div>

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
                {lead.status !== 'converted' && <Button type="primary" onClick={async () => { try { await apiClient.convertLead(lead.id, true); loadLeads(); } catch (err) { message.error(tErrors('failedToConvertLead')); } }}>{tActions('convert')}</Button>}
              </div>
            </div>
          </div>
        ))}
      </div>

      {data && data.total_pages > 1 && <div className="flex justify-center"><Pagination current={page} total={data.total} pageSize={20} onChange={(p) => setPage(p)} showSizeChanger={false} /></div>}

      {data?.items.length === 0 && (
        <div className="glass-card py-16 flex flex-col items-center justify-center">
          <EmptyStateCharacter height={115} variant="no-results" />
          <h3 className="mt-5 text-lg font-semibold text-gray-800">{t('noLeadsFound')}</h3>
          <p className="text-sm text-gray-400 mt-1 max-w-xs text-center">
            {search || status ? tCommon('tryAdjustingFilters') : t('getStarted')}
          </p>
        </div>
      )}
    </div>
  );
}
