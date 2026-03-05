'use client';

import { useEffect, useState } from 'react';
import { Input, Pagination, Spin, Button, Tag, Select } from 'antd';
import { PlusOutlined, UserOutlined, DollarOutlined } from '@ant-design/icons';
import { apiClient } from '@/lib/api';
import type { LeadResponse, PaginatedResponse } from '@/types/api';
import { EmptyStateCharacter } from '@/components/illustrations';
import Link from 'next/link';

const statusColors: Record<string, string> = {
  new: 'blue', contacted: 'gold', qualified: 'green', converted: 'purple', lost: 'red',
};

export default function LeadsPage() {
  const [data, setData] = useState<PaginatedResponse<LeadResponse> | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<string>('');
  const [page, setPage] = useState(1);

  useEffect(() => { loadLeads(); }, [page, search, status]);

  const loadLeads = async () => {
    try {
      const result = await apiClient.getLeads({ page, page_size: 20, search: search || undefined, status_filter: status || undefined });
      setData(result);
    } catch (error) { console.error('Failed to load leads:', error); }
    finally { setLoading(false); }
  };

  if (loading) return <div className="flex items-center justify-center h-64"><Spin size="large" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold gradient-text">Leads</h1>
          <p className="text-gray-500">Manage your sales pipeline</p>
        </div>
        <Link href="/leads/new"><Button type="primary" icon={<PlusOutlined />}>Add Lead</Button></Link>
      </div>

      <div className="flex items-center gap-3">
        <Input.Search placeholder="Search leads..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} allowClear size="large" className="max-w-lg" />
        <Select value={status || undefined} onChange={(v) => { setStatus(v || ''); setPage(1); }} placeholder="All Statuses" allowClear style={{ width: 180 }} size="large"
          options={[{ label: 'New', value: 'new' }, { label: 'Contacted', value: 'contacted' }, { label: 'Qualified', value: 'qualified' }, { label: 'Converted', value: 'converted' }, { label: 'Lost', value: 'lost' }]}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
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
              {lead.pipeline_stage && <p className="text-sm text-gray-600">Stage: <span className="font-medium">{lead.pipeline_stage}</span></p>}
              {lead.assigned_to_name && <p className="text-sm text-gray-600">Assigned: <span className="font-medium">{lead.assigned_to_name}</span></p>}
              {lead.source && <Tag className="!mt-1">{lead.source}</Tag>}
              <div className="flex gap-2 pt-2">
                <Link href={`/leads/${lead.id}`} className="flex-1"><Button block>View</Button></Link>
                {lead.status !== 'converted' && <Button type="primary" onClick={async () => { try { await apiClient.convertLead(lead.id, true); loadLeads(); } catch {} }}>Convert</Button>}
              </div>
            </div>
          </div>
        ))}
      </div>

      {data && data.total_pages > 1 && <div className="flex justify-center"><Pagination current={page} total={data.total} pageSize={20} onChange={(p) => setPage(p)} showSizeChanger={false} /></div>}

      {data?.items.length === 0 && (
        <div className="glass-card py-12 flex flex-col items-center justify-center">
          <EmptyStateCharacter width={150} height={150} />
          <p className="mt-4 text-lg font-medium text-gray-700">No leads found</p>
          <p className="text-sm text-gray-500">{search ? 'Try adjusting your search' : 'Get started by adding a lead'}</p>
        </div>
      )}
    </div>
  );
}
