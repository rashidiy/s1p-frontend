'use client';

import { useEffect, useState } from 'react';
import { Spin, Button, Tag, Select, Pagination, Alert } from 'antd';
import { FileTextOutlined, PlusOutlined, DollarOutlined, CalendarOutlined } from '@ant-design/icons';
import { apiClient } from '@/lib/api';
import { getErrorMessage } from '@/lib/utils';
import { CONTRACT_STATUS_LABELS, BILLING_PERIOD_LABELS, PAYMENT_STATUS_LABELS } from '@/lib/constants';
import type { ContractResponse } from '@/types/api';
import { EmptyStateCharacter } from '@/components/illustrations';
import Link from 'next/link';

const statusTagColors: Record<string, string> = { active: 'green', expired: 'default', cancelled: 'red', pending: 'orange' };
const paymentTagColors: Record<string, string> = { paid: 'green', pending: 'orange', overdue: 'red', failed: 'red' };

export default function OwnerContractsPage() {
  const [contracts, setContracts] = useState<ContractResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [paymentFilter, setPaymentFilter] = useState('');

  useEffect(() => { loadContracts(); }, [page, statusFilter, paymentFilter]);

  const loadContracts = async () => {
    setLoading(true); setError('');
    try {
      const result = await apiClient.getContracts({ page, page_size: 20, status: statusFilter || undefined, payment_status: paymentFilter || undefined });
      if (Array.isArray(result)) { setContracts(result); setTotalPages(1); }
      else { setContracts(result.items || []); setTotalPages(result.total_pages || 1); }
    } catch (err: any) { setError(getErrorMessage(err, 'Failed to load contracts')); }
    finally { setLoading(false); }
  };

  if (loading) return <div className="flex items-center justify-center h-64"><Spin size="large" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold gradient-text">Contracts</h1>
          <p className="text-gray-500">Manage company contracts and billing</p>
        </div>
        <Link href="/owner/contracts/new"><Button type="primary" icon={<PlusOutlined />}>New Contract</Button></Link>
      </div>

      <div className="flex gap-3">
        <Select value={statusFilter || undefined} onChange={(v) => { setStatusFilter(v || ''); setPage(1); }} placeholder="All Statuses" allowClear style={{ width: 180 }}
          options={[{ label: 'Active', value: 'active' }, { label: 'Expired', value: 'expired' }, { label: 'Cancelled', value: 'cancelled' }, { label: 'Pending', value: 'pending' }]} />
        <Select value={paymentFilter || undefined} onChange={(v) => { setPaymentFilter(v || ''); setPage(1); }} placeholder="Payment Status" allowClear style={{ width: 180 }}
          options={[{ label: 'Paid', value: 'paid' }, { label: 'Pending', value: 'pending' }, { label: 'Overdue', value: 'overdue' }, { label: 'Failed', value: 'failed' }]} />
      </div>

      {error && <Alert type="error" message={error} showIcon className="!rounded-xl" />}

      <div className="space-y-3">
        {contracts.map((contract) => (
          <div key={contract.id} className="glass-card p-5 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <FileTextOutlined className="text-2xl text-crm-indigo-500" />
              <div>
                <h3 className="font-semibold text-lg">{contract.name}</h3>
                <p className="text-sm text-gray-500">{contract.company_name || contract.company_id}</p>
              </div>
            </div>
            <div className="flex items-center gap-6">
              <div className="text-right">
                <div className="flex items-center gap-1"><DollarOutlined className="text-green-600" /><span className="font-bold text-lg">{contract.price}</span><span className="text-gray-500 text-sm">/{BILLING_PERIOD_LABELS[contract.billing_period]?.toLowerCase() || contract.billing_period}</span></div>
                <div className="flex items-center gap-1 text-xs text-gray-500 mt-1"><CalendarOutlined /> {new Date(contract.start_date).toLocaleDateString()} - {new Date(contract.end_date).toLocaleDateString()}</div>
              </div>
              <div className="flex flex-col gap-1">
                <Tag color={statusTagColors[contract.status] || 'default'}>{CONTRACT_STATUS_LABELS[contract.status] || contract.status}</Tag>
                <Tag color={paymentTagColors[contract.payment_status] || 'default'}>{PAYMENT_STATUS_LABELS[contract.payment_status] || contract.payment_status}</Tag>
              </div>
              <Link href={`/owner/contracts/${contract.id}`}><Button>View</Button></Link>
            </div>
          </div>
        ))}
      </div>

      {totalPages > 1 && <div className="flex justify-center"><Pagination current={page} total={totalPages * 20} pageSize={20} onChange={(p) => setPage(p)} showSizeChanger={false} /></div>}

      {!error && contracts.length === 0 && (
        <div className="glass-card py-12 flex flex-col items-center justify-center">
          <EmptyStateCharacter width={150} height={150} />
          <p className="mt-4 text-lg font-medium text-gray-700">No contracts found</p>
        </div>
      )}
    </div>
  );
}
