'use client';

import { useEffect, useState } from 'react';
import { Button, Tag, Select, Pagination, Alert, message } from 'antd';
import { FileTextOutlined, PlusOutlined, DollarOutlined, CalendarOutlined } from '@ant-design/icons';
import { useTranslations } from 'next-intl';
import { apiClient } from '@/lib/api';
import { getErrorMessage } from '@/lib/utils';
import { CONTRACT_STATUS_KEYS, BILLING_PERIOD_KEYS, PAYMENT_STATUS_KEYS } from '@/lib/constants';
import type { ContractResponse } from '@/types/api';
import { EmptyStateCharacter, ErrorCharacter } from '@/components/illustrations';
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
  const t = useTranslations('ownerContracts');
  const tErrors = useTranslations('errors');
  const tActions = useTranslations('actions');
  const tStatuses = useTranslations('statuses');
  const tContractStatuses = useTranslations('contractStatuses');
  const tPaymentStatuses = useTranslations('paymentStatuses');
  const tBilling = useTranslations('billing');
  const tCommon = useTranslations('common');

  // eslint-disable-next-line react-hooks/exhaustive-deps -- reload when filters change
  useEffect(() => { loadContracts(); }, [page, statusFilter, paymentFilter]);

  const loadContracts = async () => {
    setLoading(true); setError('');
    try {
      const result = await apiClient.getContracts({ page, page_size: 20, status: statusFilter || undefined, payment_status: paymentFilter || undefined });
      if (Array.isArray(result)) { setContracts(result); setTotalPages(1); }
      else { setContracts(result.items || []); setTotalPages(result.total_pages || 1); }
    } catch (err: unknown) { setError(getErrorMessage(err, tErrors('failedToLoadContracts'))); message.error(tErrors('failedToLoadContracts')); }
    finally { setLoading(false); }
  };

  if (loading) return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="h-8 w-48 bg-gray-100 rounded-lg animate-pulse" />
          <div className="h-4 w-64 bg-gray-50 rounded mt-2 animate-pulse" />
        </div>
        <div className="h-9 w-32 bg-gray-100 rounded-lg animate-pulse" />
      </div>
      <div className="flex gap-3">
        <div className="h-8 w-40 bg-gray-50 rounded-lg animate-pulse" />
        <div className="h-8 w-44 bg-gray-50 rounded-lg animate-pulse" />
      </div>
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="glass-card p-5 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-gray-100 animate-pulse" />
              <div>
                <div className="h-4 w-36 bg-gray-100 rounded animate-pulse" />
                <div className="h-3 w-24 bg-gray-50 rounded mt-2 animate-pulse" />
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="h-5 w-20 bg-gray-50 rounded animate-pulse" />
              <div className="h-8 w-16 bg-gray-100 rounded-lg animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="page-header">
        <p className="page-subtitle">{t('manageContracts')}</p>
        <Link href="/owner/contracts/new"><Button type="primary" icon={<PlusOutlined />}>{t('newContract')}</Button></Link>
      </div>

      <div className="flex flex-wrap gap-3 items-center">
        <Select value={statusFilter || undefined} onChange={(v) => { setStatusFilter(v || ''); setPage(1); }} placeholder={tCommon('allStatuses')} allowClear size="middle" className="w-full sm:w-40"
          options={[{ label: tContractStatuses('active'), value: 'active' }, { label: tContractStatuses('expired'), value: 'expired' }, { label: tContractStatuses('cancelled'), value: 'cancelled' }, { label: tStatuses('pending'), value: 'pending' }]} />
        <Select value={paymentFilter || undefined} onChange={(v) => { setPaymentFilter(v || ''); setPage(1); }} placeholder={t('paymentStatus')} allowClear size="middle" className="w-full sm:w-44"
          options={[{ label: tPaymentStatuses('paid'), value: 'paid' }, { label: tPaymentStatuses('pending'), value: 'pending' }, { label: tPaymentStatuses('overdue'), value: 'overdue' }, { label: tPaymentStatuses('failed'), value: 'failed' }]} />
      </div>

      {error && !loading && (
        <div className="glass-card py-16 flex flex-col items-center justify-center">
          <ErrorCharacter height={115} />
          <h3 className="mt-5 text-lg font-semibold text-gray-800">{tErrors('somethingWentWrong')}</h3>
          <p className="text-sm text-gray-400 mt-1">{tErrors('tryAgainLater')}</p>
          <Button type="primary" className="mt-4" onClick={() => { setError(''); setLoading(true); loadContracts(); }}>
            {tActions('tryAgain')}
          </Button>
        </div>
      )}

      {!error && contracts.length > 0 ? (
        <>
          <div className="space-y-3">
            {contracts.map((contract) => (
              <div key={contract.id} className="glass-card p-4 sm:p-5 hover:shadow-md transition-all duration-200">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center flex-shrink-0">
                      <FileTextOutlined className="text-lg text-indigo-500" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-semibold text-gray-900 truncate">{contract.name}</h3>
                      <p className="text-sm text-gray-400 truncate">{contract.company_name || contract.company_id}</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-3 sm:gap-6 pl-14 sm:pl-0">
                    <div className="sm:text-right">
                      <div className="flex items-center gap-1"><DollarOutlined className="text-green-600" /><span className="font-bold text-lg">{contract.price}</span><span className="text-gray-400 text-sm">/{BILLING_PERIOD_KEYS[contract.billing_period] ? tBilling(BILLING_PERIOD_KEYS[contract.billing_period]).toLowerCase() : contract.billing_period}</span></div>
                      <div className="flex items-center gap-1 text-xs text-gray-400 mt-1"><CalendarOutlined /> {new Date(contract.start_date).toLocaleDateString()} - {new Date(contract.end_date).toLocaleDateString()}</div>
                    </div>
                    <div className="flex sm:flex-col gap-1">
                      <Tag color={statusTagColors[contract.status] || 'default'}>{CONTRACT_STATUS_KEYS[contract.status] ? tContractStatuses(CONTRACT_STATUS_KEYS[contract.status]) : contract.status}</Tag>
                      <Tag color={paymentTagColors[contract.payment_status] || 'default'}>{PAYMENT_STATUS_KEYS[contract.payment_status] ? tPaymentStatuses(PAYMENT_STATUS_KEYS[contract.payment_status]) : contract.payment_status}</Tag>
                    </div>
                    <Link href={`/owner/contracts/${contract.id}`}><Button>{tActions('view')}</Button></Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
          {totalPages > 1 && <div className="flex justify-center"><Pagination current={page} total={totalPages * 20} pageSize={20} onChange={(p) => setPage(p)} showSizeChanger={false} /></div>}
        </>
      ) : !loading && !error && (
        <div className="glass-card py-16 flex flex-col items-center justify-center">
          <EmptyStateCharacter height={115} variant="thinking" />
          <h3 className="mt-5 text-lg font-semibold text-gray-800">{t('noContractsYet')}</h3>
          <p className="text-sm text-gray-400 mt-1 max-w-xs text-center">
            {t('noContractsDescription')}
          </p>
        </div>
      )}
    </div>
  );
}
