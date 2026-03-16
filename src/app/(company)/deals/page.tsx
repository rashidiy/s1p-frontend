'use client';

import { useEffect, useState } from 'react';
import { Input, Pagination, Button, Tag, Select, message } from 'antd';
import { PlusOutlined, DollarOutlined, RiseOutlined, UserOutlined } from '@ant-design/icons';
import { apiClient } from '@/lib/api';
import type { DealResponse, PaginatedResponse } from '@/types/api';
import { EmptyStateCharacter } from '@/components/illustrations';
import Link from 'next/link';
import { useTranslations } from 'next-intl';

const stageColors: Record<string, string> = {
  prospecting: 'blue', qualification: 'gold', proposal: 'orange', negotiation: 'purple', won: 'green', lost: 'red',
};

export default function DealsPage() {
  const t = useTranslations('deals');
  const tActions = useTranslations('actions');
  const tErrors = useTranslations('errors');
  const tStatuses = useTranslations('statuses');
  const tCommon = useTranslations('common');

  const [data, setData] = useState<PaginatedResponse<DealResponse> | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [stage, setStage] = useState<string>('');
  const [page, setPage] = useState(1);

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput);
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

  // eslint-disable-next-line react-hooks/exhaustive-deps -- reload when filters change
  useEffect(() => { loadDeals(); }, [page, search, stage]);

  const loadDeals = async () => {
    try {
      const result = await apiClient.getDeals({ page, page_size: 20, search: search || undefined, stage: stage || undefined });
      setData(result);
    } catch (error) { console.error('Failed to load deals:', error); message.error(tErrors('failedToLoadDeals')); }
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
              <div className="h-5 w-20 bg-gray-100 rounded animate-pulse" />
            </div>
            <div className="space-y-2">
              <div className="h-5 w-24 bg-gray-50 rounded animate-pulse" />
              <div className="h-3 w-36 bg-gray-50 rounded animate-pulse" />
              <div className="flex gap-2 pt-2">
                <div className="h-8 flex-1 bg-gray-100 rounded-lg animate-pulse" />
                <div className="h-8 w-16 bg-gray-100 rounded-lg animate-pulse" />
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
        <Link href="/deals/new"><Button type="primary" icon={<PlusOutlined />}>{t('addDeal')}</Button></Link>
      </div>
      <p className="page-subtitle">{t('subtitle')}</p>

      <div className="flex flex-col sm:flex-row gap-3">
        <Input.Search placeholder={t('searchDeals')} value={searchInput} onChange={(e) => setSearchInput(e.target.value)} allowClear size="large" className="w-full md:max-w-lg" />
        <Select value={stage || undefined} onChange={(v) => { setStage(v || ''); setPage(1); }} placeholder={t('allStages')} allowClear className="w-full sm:w-[180px]" size="large"
          options={[{ label: tStatuses('prospecting'), value: 'prospecting' }, { label: tStatuses('qualification'), value: 'qualification' }, { label: tStatuses('proposal'), value: 'proposal' }, { label: tStatuses('negotiation'), value: 'negotiation' }, { label: tStatuses('won'), value: 'won' }, { label: tStatuses('lost'), value: 'lost' }]}
        />
      </div>

      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {data?.items.map((deal) => (
          <div key={deal.id} className="glass-card p-5 border-l-4 border-l-teal-500 hover:shadow-lg transition-shadow">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="font-semibold text-gray-900">{deal.title}</h3>
                {deal.contact_name && <p className="text-sm text-gray-500 flex items-center gap-1 mt-1"><UserOutlined className="text-xs" /> {deal.contact_name}</p>}
              </div>
              {deal.stage && <Tag color={stageColors[deal.stage.toLowerCase()] || 'default'}>{deal.stage}</Tag>}
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1 text-lg font-bold text-green-600"><DollarOutlined /> ${deal.amount.toLocaleString()}</span>
                {deal.probability && <span className="text-sm text-gray-600 flex items-center gap-1"><RiseOutlined /> {deal.probability}%</span>}
              </div>
              {deal.expected_close_date && <p className="text-sm text-gray-600">{new Date(deal.expected_close_date).toLocaleDateString()}</p>}
              {deal.assigned_to_name && <p className="text-sm text-gray-600">{t('owner')}: <span className="font-medium">{deal.assigned_to_name}</span></p>}
              <div className="flex gap-2 pt-2">
                <Link href={`/deals/${deal.id}`} className="flex-1"><Button block>{tActions('view')}</Button></Link>
                {deal.stage !== 'won' && deal.stage !== 'lost' && <Button type="primary" onClick={async () => { try { await apiClient.markDealWon(deal.id); loadDeals(); } catch (err) { message.error(tErrors('failedToMarkDealAsWon')); } }}>{tActions('win')}</Button>}
              </div>
            </div>
          </div>
        ))}
      </div>

      {data && data.total_pages > 1 && <div className="flex justify-center"><Pagination current={page} total={data.total} pageSize={20} onChange={(p) => setPage(p)} showSizeChanger={false} /></div>}

      {data?.items.length === 0 && (
        <div className="glass-card py-16 flex flex-col items-center justify-center">
          <EmptyStateCharacter height={115} variant="no-deals" />
          <h3 className="mt-5 text-lg font-semibold text-gray-800">{t('noDealsFound')}</h3>
          <p className="text-sm text-gray-400 mt-1 max-w-xs text-center">
            {search || stage ? tCommon('tryAdjustingFilters') : t('getStarted')}
          </p>
        </div>
      )}
    </div>
  );
}
