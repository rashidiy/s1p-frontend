'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeftOutlined, FileTextOutlined, DollarOutlined, CalendarOutlined, TeamOutlined, PhoneOutlined, ReloadOutlined, CloseCircleOutlined } from '@ant-design/icons';
import { Button, Input, Tag, message, Modal } from 'antd';
import { useTranslations } from 'next-intl';
import { apiClient } from '@/lib/api';
import { CONTRACT_STATUS_COLORS, CONTRACT_STATUS_LABELS, BILLING_PERIOD_LABELS, PAYMENT_STATUS_COLORS, PAYMENT_STATUS_LABELS } from '@/lib/constants';
import { ErrorCharacter } from '@/components/illustrations';
import type { ContractDetailResponse } from '@/types/api';

export default function ContractDetailPage() {
  const params = useParams()!;
  const router = useRouter();
  const contractId = params.id as string;
  const t = useTranslations('ownerContracts');
  const tErrors = useTranslations('errors');
  const tActions = useTranslations('actions');
  const tFields = useTranslations('fields');
  const tEntities = useTranslations('entities');

  const [contract, setContract] = useState<ContractDetailResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [showRenew, setShowRenew] = useState(false);
  const [renewDate, setRenewDate] = useState('');
  const [renewAmount, setRenewAmount] = useState('');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    loadContract();
  // eslint-disable-next-line react-hooks/exhaustive-deps -- reload when ID changes
  }, [contractId]);

  const loadContract = async () => {
    setError(false);
    try {
      const data = await apiClient.getContract(contractId);
      setContract(data);
    } catch (err) {
      console.error('Failed to load contract:', err);
      setError(true);
      message.error(tErrors('failedToLoadContract'));
    } finally {
      setLoading(false);
    }
  };

  const handleRenew = async () => {
    if (!renewDate) return;
    setProcessing(true);
    try {
      await apiClient.renewContract(contractId, {
        new_end_date: renewDate,
        price: renewAmount ? parseFloat(renewAmount) : undefined,
      });
      message.success(t('contractRenewed'));
      setShowRenew(false);
      loadContract();
    } catch (err) {
      console.error('Failed to renew contract:', err);
      message.error(tErrors('failedToRenewContract'));
    } finally {
      setProcessing(false);
    }
  };

  const handleCancel = () => {
    Modal.confirm({
      title: t('confirmCancelContract'),
      okText: t('yesCancel'),
      cancelText: tActions('no'),
      okButtonProps: { danger: true },
      onOk: async () => {
        setProcessing(true);
        try {
          await apiClient.cancelContract(contractId);
          message.success(t('contractCancelled'));
          loadContract();
        } catch (err) {
          console.error('Failed to cancel contract:', err);
          message.error(tErrors('failedToCancelContract'));
        } finally {
          setProcessing(false);
        }
      },
    });
  };

  if (loading) return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <div className="h-6 w-14 bg-gray-100 rounded animate-pulse" />
        <div className="h-8 w-56 bg-gray-100 rounded-lg animate-pulse" />
        <div className="h-5 w-16 bg-gray-100 rounded animate-pulse" />
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="glass-card p-5">
            <div className="h-3 w-16 bg-gray-50 rounded animate-pulse mb-3" />
            <div className="h-7 w-20 bg-gray-100 rounded-lg animate-pulse" />
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[1, 2].map((i) => (
          <div key={i} className="glass-card p-6 space-y-3">
            <div className="h-5 w-32 bg-gray-100 rounded animate-pulse" />
            {[1, 2, 3, 4].map((j) => (
              <div key={j} className="flex justify-between">
                <div className="h-4 w-24 bg-gray-50 rounded animate-pulse" />
                <div className="h-4 w-20 bg-gray-50 rounded animate-pulse" />
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
  if (error || !contract) return (
    <div className="glass-card py-16 flex flex-col items-center justify-center">
      <ErrorCharacter height={115} />
      <h3 className="mt-5 text-lg font-semibold text-gray-800">{t('contractNotFound')}</h3>
      <p className="text-sm text-gray-400 mt-1">{tErrors('tryAgainLater')}</p>
      <div className="flex gap-2 mt-4">
        <Button type="primary" onClick={() => { setError(false); setLoading(true); loadContract(); }}>
          {tActions('tryAgain')}
        </Button>
        <Button onClick={() => router.push('/owner/contracts')}>
          {tActions('back')}
        </Button>
      </div>
    </div>
  );

  const statusColor = CONTRACT_STATUS_COLORS[contract.status] || 'bg-gray-100 text-gray-800';
  const paymentColor = PAYMENT_STATUS_COLORS[contract.payment_status] || 'bg-gray-100 text-gray-800';

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div className="flex items-center gap-3 flex-wrap">
          <Button size="small" type="text" onClick={() => router.push('/owner/contracts')}>
            <ArrowLeftOutlined style={{ marginRight: 4 }} />
            {tActions('back')}
          </Button>
          <Tag className={statusColor}>{CONTRACT_STATUS_LABELS[contract.status]}</Tag>
        </div>
        <div className="flex gap-2">
          {contract.status === 'active' && (
            <>
              <Button type="default" onClick={() => setShowRenew(true)}>
                <ReloadOutlined style={{ marginRight: 8 }} />
                <span className="hidden sm:inline">{t('renew')}</span>
              </Button>
              <Button type="primary" danger onClick={handleCancel} disabled={processing}>
                <CloseCircleOutlined style={{ marginRight: 8 }} />
                <span className="hidden sm:inline">{tActions('cancel')}</span>
              </Button>
            </>
          )}
        </div>
      </div>

      {showRenew && (
        <div className="glass-card p-0">
          <div className="flex flex-col space-y-1.5 p-6">
            <h3 className="text-base font-semibold leading-none tracking-tight">{t('renewContract')}</h3>
          </div>
          <div className="p-6 pt-0 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700">{t('newEndDate')} *</label>
                <Input type="date" value={renewDate} onChange={(e) => setRenewDate(e.target.value)} required size="large" />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700">{t('newAmount')}</label>
                <Input type="number" value={renewAmount} onChange={(e) => setRenewAmount(e.target.value)} placeholder={t('keepCurrent')} size="large" />
              </div>
            </div>
            <div className="flex gap-2 pt-3 border-t border-gray-100">
              <Button type="primary" onClick={handleRenew} loading={processing} disabled={!renewDate}>{t('confirmRenewal')}</Button>
              <Button type="default" onClick={() => setShowRenew(false)}>{tActions('cancel')}</Button>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="glass-card p-0">
          <div className="flex flex-col space-y-1.5 p-4 sm:p-6 pb-2">
            <p className="text-sm text-gray-400">{tFields('amount')}</p>
          </div>
          <div className="p-4 sm:p-6 pt-0">
            <div className="flex items-center gap-1">
              <DollarOutlined style={{ fontSize: 20, color: '#16a34a' }} />
              <span className="text-xl sm:text-2xl font-bold">{contract.price}</span>
            </div>
            <p className="text-xs text-gray-500">
              {contract.currency} / {BILLING_PERIOD_LABELS[contract.billing_period]?.toLowerCase()}
            </p>
          </div>
        </div>

        <div className="glass-card p-0">
          <div className="flex flex-col space-y-1.5 p-4 sm:p-6 pb-2">
            <p className="text-sm text-gray-400">{t('daysRemaining')}</p>
          </div>
          <div className="p-4 sm:p-6 pt-0">
            <div className="flex items-center gap-1">
              <CalendarOutlined style={{ fontSize: 20 }} />
              <span className="text-xl sm:text-2xl font-bold">{contract.days_until_expiry ?? '\u2014'}</span>
            </div>
          </div>
        </div>

        <div className="glass-card p-0">
          <div className="flex flex-col space-y-1.5 p-4 sm:p-6 pb-2">
            <p className="text-sm text-gray-400">{tEntities('users')}</p>
          </div>
          <div className="p-4 sm:p-6 pt-0">
            <div className="flex items-center gap-1">
              <TeamOutlined style={{ fontSize: 20 }} />
              <span className="text-xl sm:text-2xl font-bold">{contract.current_admins + contract.current_managers + contract.current_operators} / {contract.max_admins + contract.max_managers + contract.max_operators}</span>
            </div>
          </div>
        </div>

        <div className="glass-card p-0">
          <div className="flex flex-col space-y-1.5 p-4 sm:p-6 pb-2">
            <p className="text-sm text-gray-400">{t('storage')}</p>
          </div>
          <div className="p-4 sm:p-6 pt-0">
            <div className="flex items-center gap-1">
              <PhoneOutlined style={{ fontSize: 20 }} />
              <span className="text-xl sm:text-2xl font-bold">{contract.max_storage_gb} GB</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-card p-0">
          <div className="flex flex-col space-y-1.5 p-4 sm:p-6">
            <h3 className="text-base font-semibold leading-none tracking-tight">{t('contractDetails')}</h3>
          </div>
          <div className="p-4 sm:p-6 pt-0">
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">{tFields('company')}</span>
                <span className="font-medium">{contract.company_name || contract.company_id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">{tFields('status')}</span>
                <Tag className={statusColor}>{CONTRACT_STATUS_LABELS[contract.status]}</Tag>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">{t('payment')}</span>
                <Tag className={paymentColor}>{PAYMENT_STATUS_LABELS[contract.payment_status]}</Tag>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">{tFields('billingPeriod')}</span>
                <span>{BILLING_PERIOD_LABELS[contract.billing_period]}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">{t('autoRenew')}</span>
                <span>{contract.auto_renew ? tActions('yes') : tActions('no')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">{tFields('startDate')}</span>
                <span>{new Date(contract.start_date).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">{tFields('endDate')}</span>
                <span>{new Date(contract.end_date).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="glass-card p-0">
          <div className="flex flex-col space-y-1.5 p-4 sm:p-6">
            <h3 className="text-base font-semibold leading-none tracking-tight">{t('paymentInfo')}</h3>
          </div>
          <div className="p-4 sm:p-6 pt-0">
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">{t('nextPayment')}</span>
                <span>{contract.next_payment_date ? new Date(contract.next_payment_date).toLocaleDateString() : '\u2014'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">{t('gracePeriod')}</span>
                <span>{t('gracePeriodDays', { days: contract.grace_period_days })}</span>
              </div>
              {contract.notes && (
                <div className="flex justify-between">
                  <span className="text-gray-500">{tFields('notes')}</span>
                  <span>{contract.notes}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
