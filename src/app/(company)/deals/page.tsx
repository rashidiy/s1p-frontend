'use client';

import { useEffect, useState } from 'react';
import { Input, Pagination, Button, Tag, Select, Segmented, Table, message } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { PlusOutlined, AppstoreOutlined, BarsOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api';
import { useAuthStore } from '@/store/auth';
import type { DealResponse, PaginatedResponse } from '@/types/api';
import { EmptyStateCharacter } from '@/components/illustrations';
import DealsPipelineView from '@/components/deals/DealsPipelineView';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { formatCurrency, formatDate } from '@/lib/utils';
import { DEAL_STAGE_OPTIONS, DEAL_STAGE_TAG_COLORS, DEAL_STAGE_KEYS } from '@/lib/constants';

type ViewMode = 'pipeline' | 'list';

const getInitialView = (): ViewMode => {
  if (typeof window === 'undefined') return 'pipeline';
  return (localStorage.getItem('deals_view_preference') as ViewMode) || 'pipeline';
};

export default function DealsPage() {
  const t = useTranslations('deals');
  const tActions = useTranslations('actions');
  const tErrors = useTranslations('errors');
  const tStatuses = useTranslations('statuses');
  const tCommon = useTranslations('common');

  const { hasPermissionString } = useAuthStore();
  const router = useRouter();
  const [viewMode, setViewMode] = useState<ViewMode>(getInitialView);
  const [data, setData] = useState<PaginatedResponse<DealResponse> | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [stage, setStage] = useState<string>('');
  const [page, setPage] = useState(1);

  const handleViewChange = (value: string | number) => {
    const v = value as ViewMode;
    setViewMode(v);
    localStorage.setItem('deals_view_preference', v);
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
  useEffect(() => { if (viewMode === 'list') loadDeals(); else setLoading(false); }, [page, search, stage, viewMode]);

  const loadDeals = async () => {
    setLoading(true);
    try {
      const result = await apiClient.getDeals({ page, page_size: 20, search: search || undefined, stage: stage || undefined });
      setData(result);
    } catch { message.error(tErrors('failedToLoadDeals')); }
    finally { setLoading(false); }
  };

  if (loading && viewMode === 'list') return (
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
        <div className="flex items-center gap-3">
          {hasPermissionString('deals.write') && (
            <Link href="/deals/new"><Button type="primary" icon={<PlusOutlined />}>{t('addDeal')}</Button></Link>
          )}
          <Segmented
            value={viewMode}
            onChange={handleViewChange}
            options={[
              { value: 'pipeline', icon: <AppstoreOutlined />, label: t('pipelineView') },
              { value: 'list', icon: <BarsOutlined />, label: t('listView') },
            ]}
          />
        </div>
      </div>
      <p className="page-subtitle">{t('subtitle')}</p>

      {viewMode === 'pipeline' ? (
        <DealsPipelineView />
      ) : (
        <>
          <div className="flex flex-col sm:flex-row gap-3">
            <Input.Search placeholder={t('searchDeals')} value={searchInput} onChange={(e) => { const v = e.target.value; setSearchInput(v); if (!v) { setSearch(''); setPage(1); } }} allowClear size="large" className="w-full md:max-w-lg" />
            <Select value={stage || undefined} onChange={(v) => { setStage(v || ''); setPage(1); }} placeholder={t('allStages')} allowClear className="w-full sm:w-[180px]" size="large"
              options={DEAL_STAGE_OPTIONS.map((opt) => ({ label: tStatuses(opt.key), value: opt.value }))}
            />
          </div>

          {data?.items.length === 0 ? (
            <div className="glass-card py-16 flex flex-col items-center justify-center">
              <EmptyStateCharacter height={115} variant="no-deals" />
              <h3 className="mt-5 text-lg font-semibold text-gray-800">{t('noDealsFound')}</h3>
              <p className="text-sm text-gray-400 mt-1 max-w-xs text-center">
                {search || stage ? tCommon('tryAdjustingFilters') : t('getStarted')}
              </p>
              {!search && !stage && hasPermissionString('deals.write') && (
                <Link href="/deals/new">
                  <Button type="primary" icon={<PlusOutlined />} className="mt-4">{t('addDeal')}</Button>
                </Link>
              )}
            </div>
          ) : (
            <>
              <Table<DealResponse>
                columns={[
                  {
                    title: t('title'), key: 'title', render: (_, deal) => (
                      <Link href={`/deals/${deal.id}`} className="font-medium text-gray-900 hover:text-crm-indigo-600">{deal.title}</Link>
                    ),
                  },
                  {
                    title: t('contact'), dataIndex: 'contact_name', key: 'contact', responsive: ['md'],
                    render: (v: string | null) => v || <span className="text-gray-300">{'\u2014'}</span>,
                  },
                  {
                    title: t('stage'), dataIndex: 'stage', key: 'stage', width: 130,
                    render: (v: string) => {
                      if (!v) return '\u2014';
                      const key = v.toLowerCase();
                      return <Tag color={DEAL_STAGE_TAG_COLORS[key] || 'default'}>{DEAL_STAGE_KEYS[key] ? tStatuses(DEAL_STAGE_KEYS[key]) : v}</Tag>;
                    },
                  },
                  {
                    title: t('amount'), dataIndex: 'amount', key: 'amount', width: 130,
                    render: (v: number) => <span className="font-bold text-green-600">{formatCurrency(v ?? 0)}</span>,
                  },
                  {
                    title: t('probability'), dataIndex: 'probability', key: 'probability', width: 80, responsive: ['lg'],
                    render: (v: number | null) => v != null ? `${v}%` : '\u2014',
                  },
                  {
                    title: t('closeDate'), dataIndex: 'expected_close_date', key: 'close', width: 120, responsive: ['lg'],
                    render: (v: string | null) => v ? formatDate(v) : '\u2014',
                  },
                  {
                    title: t('assignedTo'), dataIndex: 'assigned_to_name', key: 'assigned', responsive: ['xl'],
                    render: (v: string | null) => v || <span className="text-gray-300">{'\u2014'}</span>,
                  },
                  {
                    title: '', key: 'actions', width: 140,
                    render: (_, deal) => (
                      <div className="flex gap-2">
                        <Link href={`/deals/${deal.id}`}><Button size="small">{tActions('view')}</Button></Link>
                        {deal.stage !== 'closed_won' && deal.stage !== 'closed_lost' && hasPermissionString('deals.write') && (
                          <Button size="small" type="primary" onClick={async (e) => { e.stopPropagation(); try { await apiClient.markDealWon(deal.id); loadDeals(); } catch { message.error(tErrors('failedToMarkDealAsWon')); } }}>{tActions('win')}</Button>
                        )}
                      </div>
                    ),
                  },
                ] as ColumnsType<DealResponse>}
                dataSource={data?.items ?? []}
                rowKey="id"
                pagination={false}
                onRow={(record) => ({ onClick: () => router.push(`/deals/${record.id}`), style: { cursor: 'pointer' } })}
                size="middle"
                scroll={{ x: 600 }}
              />

              {data && data.total_pages > 1 && <div className="flex justify-center"><Pagination current={page} total={data.total} pageSize={20} onChange={(p) => setPage(p)} showSizeChanger={false} /></div>}
            </>
          )}
        </>
      )}
    </div>
  );
}
