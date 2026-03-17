'use client';

import { useEffect, useState } from 'react';
import { FileTextOutlined, TeamOutlined, CalendarOutlined, SafetyOutlined, ExclamationCircleOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { Alert, Button, Progress, Spin, Tag } from 'antd';
import { apiClient } from '@/lib/api';
import { useTranslations } from 'next-intl';
import { EmptyStateCharacter, ErrorCharacter } from '@/components/illustrations';
import Link from 'next/link';
import { CONTRACT_STATUS_COLORS, CONTRACT_STATUS_KEYS, BILLING_PERIOD_KEYS, PAYMENT_STATUS_COLORS, PAYMENT_STATUS_KEYS } from '@/lib/constants';
import type { ContractStatusResponse } from '@/types/api';

export default function ContractStatusPage() {
  const [contract, setContract] = useState<ContractStatusResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const t = useTranslations('settings');
  const tFields = useTranslations('fields');
  const tErrors = useTranslations('errors');
  const tActions = useTranslations('actions');
  const tCommon = useTranslations('common');
  const tRoles = useTranslations('roles');
  const tBilling = useTranslations('billing');
  const tPaymentStatuses = useTranslations('paymentStatuses');
  const tContractStatuses = useTranslations('contractStatuses');

  useEffect(() => {
    loadContractStatus();
  // eslint-disable-next-line react-hooks/exhaustive-deps -- load on mount only
  }, []);

  const loadContractStatus = async () => {
    try {
      const data = await apiClient.getContractStatus();
      setContract(data);
    } catch (err) {
      setError(t('noActiveContract'));
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <div className="space-y-6">
      <div className="h-8 w-32 bg-gray-100 rounded-lg animate-pulse" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="glass-card p-5">
            <div className="h-3 w-20 bg-gray-50 rounded animate-pulse mb-3" />
            <div className="h-7 w-24 bg-gray-100 rounded-lg animate-pulse" />
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[1, 2].map((i) => (
          <div key={i} className="glass-card p-6 space-y-3">
            <div className="h-5 w-32 bg-gray-100 rounded animate-pulse" />
            {[1, 2, 3].map((j) => (
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

  if (error) {
    return (
      <div className="glass-card py-16 flex flex-col items-center justify-center">
        <ErrorCharacter height={115} />
        <h3 className="mt-5 text-lg font-semibold text-gray-800">{tErrors('somethingWentWrong')}</h3>
        <p className="text-sm text-gray-400 mt-1">{tErrors('tryAgainLater')}</p>
        <Button type="primary" className="mt-4" onClick={() => { setError(''); setLoading(true); loadContractStatus(); }}>
          {tActions('tryAgain')}
        </Button>
      </div>
    );
  }

  if (!contract) {
    return (
      <div className="space-y-6">
        <div className="page-header">
          <div>
            <p className="page-subtitle">{t('contractSubtitle')}</p>
          </div>
        </div>
        <div className="glass-card py-12 flex flex-col items-center justify-center">
          <EmptyStateCharacter height={115} variant="thinking" />
          <p className="mt-4 text-lg font-medium text-gray-700">{t('noActiveContract')}</p>
          <p className="text-sm text-gray-500">{t('viewContractStatus')}</p>
        </div>
      </div>
    );
  }

  const totalUsers = contract.current_admins + contract.current_managers + contract.current_operators;
  const maxUsers = contract.max_admins + contract.max_managers + contract.max_operators;
  const userUsage = maxUsers > 0 ? (totalUsers / maxUsers) * 100 : 0;
  const statusColor = CONTRACT_STATUS_COLORS[contract.status] || 'bg-gray-100 text-gray-800';
  const paymentColor = PAYMENT_STATUS_COLORS[contract.payment_status] || 'bg-gray-100 text-gray-800';

  return (
    <div className="space-y-6">
      <Link href="/settings">
        <Button type="text" icon={<ArrowLeftOutlined />} className="mb-2">
          {tCommon('backToSettings')}
        </Button>
      </Link>
      <div className="page-header">
        <div>
          <p className="page-subtitle">{t('viewContractStatus')}</p>
        </div>
      </div>

      {contract.warnings && contract.warnings.length > 0 && (
        <div className="space-y-2">
          {contract.warnings.map((warning, i) => (
            <Alert key={i} type="warning" title={warning} showIcon icon={<ExclamationCircleOutlined />} className="!rounded-xl" />
          ))}
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-card p-0">
          <div className="flex flex-col space-y-1.5 p-6 pb-2">
            <p className="text-sm text-gray-400">{tFields('plan')}</p>
            <h3 className="text-base font-semibold leading-none tracking-tight text-2xl">{contract.name}</h3>
          </div>
          <div className="p-6 pt-0">
            <Tag className={statusColor}>{CONTRACT_STATUS_KEYS[contract.status] ? tContractStatuses(CONTRACT_STATUS_KEYS[contract.status]) : contract.status}</Tag>
          </div>
        </div>

        <div className="glass-card p-0">
          <div className="flex flex-col space-y-1.5 p-6 pb-2">
            <p className="text-sm text-gray-400">{tFields('billingPeriod')}</p>
            <h3 className="text-base font-semibold leading-none tracking-tight text-xl capitalize">
              {BILLING_PERIOD_KEYS[contract.billing_period] ? tBilling(BILLING_PERIOD_KEYS[contract.billing_period]) : contract.billing_period}
            </h3>
          </div>
          <div className="p-6 pt-0">
            <Tag className={paymentColor}>
              {PAYMENT_STATUS_KEYS[contract.payment_status] ? tPaymentStatuses(PAYMENT_STATUS_KEYS[contract.payment_status]) : contract.payment_status}
            </Tag>
          </div>
        </div>

        <div className="glass-card p-0">
          <div className="flex flex-col space-y-1.5 p-6 pb-2">
            <p className="text-sm text-gray-400">{tFields('daysUntilExpiry')}</p>
            <h3 className="text-base font-semibold leading-none tracking-tight text-2xl flex items-center gap-2">
              <CalendarOutlined />
              {contract.days_until_expiry ?? '—'}
            </h3>
          </div>
          <div className="p-6 pt-0">
            <p className="text-xs text-gray-500">
              {new Date(contract.start_date).toLocaleDateString()} — {new Date(contract.end_date).toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>

      {/* User Limits */}
      <div className="glass-card p-0">
        <div className="flex flex-col space-y-1.5 p-6">
          <h3 className="text-base font-semibold leading-none tracking-tight flex items-center gap-2">
            <TeamOutlined />
            {tFields('userLimits')}
          </h3>
        </div>
        <div className="p-6 pt-0 space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>{tFields('currentUsers')}</span>
              <span className="font-medium">{totalUsers} / {maxUsers}</span>
            </div>
            <Progress percent={userUsage} showInfo={false} size="small" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
            <div className="text-center p-3 bg-purple-50 rounded-lg">
              <p className="font-bold text-purple-700">{contract.current_admins}/{contract.max_admins}</p>
              <p className="text-xs text-gray-500 mt-1">{tRoles('company_admin')}s</p>
            </div>
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <p className="font-bold text-blue-700">{contract.current_managers}/{contract.max_managers}</p>
              <p className="text-xs text-gray-500 mt-1">{tRoles('company_manager')}s</p>
            </div>
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <p className="font-bold text-green-700">{contract.current_operators}/{contract.max_operators}</p>
              <p className="text-xs text-gray-500 mt-1">{tRoles('company_operator')}s</p>
            </div>
          </div>
        </div>
      </div>

      {/* Contract Details */}
      <div className="glass-card p-0">
        <div className="flex flex-col space-y-1.5 p-6">
          <h3 className="text-base font-semibold leading-none tracking-tight flex items-center gap-2">
            <SafetyOutlined />
            {tFields('plan')}
          </h3>
        </div>
        <div className="p-6 pt-0">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-500">{tFields('status')}</span>
              <p className="font-medium">{contract.auto_renew ? 'Yes' : 'No'}</p>
            </div>
            <div>
              <span className="text-gray-500">{tFields('plan')}</span>
              <p className="font-medium">{contract.max_storage_gb} GB</p>
            </div>
            <div>
              <span className="text-gray-500">{tFields('startDate')}</span>
              <p className="font-medium">{new Date(contract.start_date).toLocaleDateString()}</p>
            </div>
            <div>
              <span className="text-gray-500">{tFields('endDate')}</span>
              <p className="font-medium">{new Date(contract.end_date).toLocaleDateString()}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
