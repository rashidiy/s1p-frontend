'use client';

import { useEffect, useState } from 'react';
import { Input, Pagination, Spin, Button, Tag, Select } from 'antd';
import { PlusOutlined, DollarOutlined, RiseOutlined, UserOutlined } from '@ant-design/icons';
import { apiClient } from '@/lib/api';
import type { DealResponse, PaginatedResponse } from '@/types/api';
import { EmptyStateCharacter } from '@/components/illustrations';
import Link from 'next/link';

const stageColors: Record<string, string> = {
  prospecting: 'blue', qualification: 'gold', proposal: 'orange', negotiation: 'purple', won: 'green', lost: 'red',
};

export default function DealsPage() {
  const [data, setData] = useState<PaginatedResponse<DealResponse> | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [stage, setStage] = useState<string>('');
  const [page, setPage] = useState(1);

  useEffect(() => { loadDeals(); }, [page, search, stage]);

  const loadDeals = async () => {
    try {
      const result = await apiClient.getDeals({ page, page_size: 20, search: search || undefined, stage: stage || undefined });
      setData(result);
    } catch (error) { console.error('Failed to load deals:', error); }
    finally { setLoading(false); }
  };

  if (loading) return <div className="flex items-center justify-center h-64"><Spin size="large" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold gradient-text">Deals</h1>
          <p className="text-gray-500">Track your active opportunities</p>
        </div>
        <Link href="/deals/new"><Button type="primary" icon={<PlusOutlined />}>Add Deal</Button></Link>
      </div>

      <div className="flex items-center gap-3">
        <Input.Search placeholder="Search deals..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} allowClear size="large" className="max-w-lg" />
        <Select value={stage || undefined} onChange={(v) => { setStage(v || ''); setPage(1); }} placeholder="All Stages" allowClear style={{ width: 180 }} size="large"
          options={[{ label: 'Prospecting', value: 'prospecting' }, { label: 'Qualification', value: 'qualification' }, { label: 'Proposal', value: 'proposal' }, { label: 'Negotiation', value: 'negotiation' }, { label: 'Won', value: 'won' }, { label: 'Lost', value: 'lost' }]}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
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
              {deal.expected_close_date && <p className="text-sm text-gray-600">Close: {new Date(deal.expected_close_date).toLocaleDateString()}</p>}
              {deal.assigned_to_name && <p className="text-sm text-gray-600">Owner: <span className="font-medium">{deal.assigned_to_name}</span></p>}
              <div className="flex gap-2 pt-2">
                <Link href={`/deals/${deal.id}`} className="flex-1"><Button block>View</Button></Link>
                {deal.stage !== 'won' && deal.stage !== 'lost' && <Button type="primary" onClick={async () => { try { await apiClient.markDealWon(deal.id); loadDeals(); } catch {} }}>Win</Button>}
              </div>
            </div>
          </div>
        ))}
      </div>

      {data && data.total_pages > 1 && <div className="flex justify-center"><Pagination current={page} total={data.total} pageSize={20} onChange={(p) => setPage(p)} showSizeChanger={false} /></div>}

      {data?.items.length === 0 && (
        <div className="glass-card py-12 flex flex-col items-center justify-center">
          <EmptyStateCharacter width={150} height={150} />
          <p className="mt-4 text-lg font-medium text-gray-700">No deals found</p>
          <p className="text-sm text-gray-500">{search ? 'Try adjusting your search' : 'Get started by adding a deal'}</p>
        </div>
      )}
    </div>
  );
}
